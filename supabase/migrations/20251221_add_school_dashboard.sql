-- School Dashboard Migration
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  emis_number VARCHAR(20) UNIQUE,
  province VARCHAR(50),
  district VARCHAR(100),
  principal_email VARCHAR(255),
  lo_teacher_email VARCHAR(255),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0d9488', -- Your teal
  subscription_tier TEXT DEFAULT 'pilot',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('counselor', 'principal')) NOT NULL,
  last_login_at TIMESTAMPTZ,
  UNIQUE(school_id, user_id)
);

-- Add to existing tables
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
ADD COLUMN IF NOT EXISTS class_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'active';

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS completion_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS at_risk_status TEXT CHECK (at_risk_status IN ('red', 'yellow', 'green')),
ADD COLUMN IF NOT EXISTS at_risk_reasons JSONB DEFAULT '[]'::jsonb;

-- RLS (critical for POPIA)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users see own school" ON schools FOR SELECT USING (id IN (
  SELECT school_id FROM school_users WHERE user_id = auth.uid()
));

-- Dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(school_id UUID) 
RETURNS JSON AS $$ 
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_students', COUNT(DISTINCT s.id),
    'completed', COUNT(DISTINCT s.id) FILTER (WHERE a.completed_at IS NOT NULL),
    'completion_rate', ROUND(
      (COUNT(DISTINCT s.id) FILTER (WHERE a.completed_at IS NOT NULL) * 100.0) / 
      NULLIF(COUNT(DISTINCT s.id), 0), 1
    ),
    'at_risk_red', COUNT(DISTINCT s.id) FILTER (WHERE a.at_risk_status = 'red'),
    'at_risk_yellow', COUNT(DISTINCT s.id) FILTER (WHERE a.at_risk_status = 'yellow'),
    'top_careers', (
      SELECT json_agg(
        json_build_object(
          'career_title', career_title,
          'count', career_count
        )
      )
      FROM (
        SELECT 
          jsonb_array_elements(a.career_matches)->>'title' as career_title,
          COUNT(*) as career_count
        FROM assessments a
        JOIN students s ON s.id = a.student_id
        WHERE s.school_id = $1 
          AND a.career_matches IS NOT NULL 
          AND jsonb_array_length(a.career_matches) > 0
        GROUP BY career_title
        ORDER BY career_count DESC
        LIMIT 5
      ) career_stats
    )
  ) INTO result
  FROM students s
  LEFT JOIN assessments a ON s.id = a.student_id
  WHERE s.school_id = $1 AND s.enrollment_status = 'active';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;