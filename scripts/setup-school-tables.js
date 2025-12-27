// Setup school dashboard tables using Supabase JS client
import { config } from 'dotenv';
import { getSupabaseAdmin } from '../lib/supabase.js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = getSupabaseAdmin();

async function setupSchoolTables() {
  try {
    console.log('🚀 Setting up school dashboard tables...');
    
    // Check if tables already exist
    console.log('🔍 Checking existing tables...');
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['schools', 'school_users']);
    
    const tableNames = existingTables?.map(t => t.table_name) || [];
    console.log('📊 Existing tables:', tableNames);
    
    if (tableNames.includes('schools') && tableNames.includes('school_users')) {
      console.log('✅ School tables already exist!');
      
      // Check if we need to add columns to existing tables
      console.log('🔧 Checking for missing columns...');
      
      // Check students table for school_id column
      const { data: studentsColumns } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'students');
      
      const studentColumnNames = studentsColumns?.map(c => c.column_name) || [];
      
      if (!studentColumnNames.includes('school_id')) {
        console.log('➕ Adding school_id to students table...');
        // We'll need to do this manually in Supabase dashboard
        console.log('⚠️  Please add these columns manually in Supabase SQL editor:');
        console.log('   ALTER TABLE students ADD COLUMN school_id UUID REFERENCES schools(id);');
        console.log('   ALTER TABLE students ADD COLUMN class_name VARCHAR(50);');
        console.log('   ALTER TABLE students ADD COLUMN enrollment_status TEXT DEFAULT \'active\';');
      }
      
      return true;
    }
    
    console.log('📋 Tables need to be created. Please run this SQL in your Supabase dashboard:');
    console.log('\n--- COPY THIS SQL TO SUPABASE DASHBOARD ---');
    console.log(`
-- School Dashboard Tables
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  emis_number VARCHAR(20) UNIQUE,
  province VARCHAR(50),
  district VARCHAR(100),
  principal_email VARCHAR(255),
  lo_teacher_email VARCHAR(255),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0d9488',
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

-- Add columns to existing tables
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
ADD COLUMN IF NOT EXISTS class_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'active';

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS completion_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS at_risk_status TEXT CHECK (at_risk_status IN ('red', 'yellow', 'green')),
ADD COLUMN IF NOT EXISTS at_risk_reasons JSONB DEFAULT '[]'::jsonb;

-- Row Level Security
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
        WHERE s.school_id = $$1 
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
  WHERE s.school_id = $$1 AND s.enrollment_status = 'active';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`);
    console.log('--- END SQL ---\n');
    
    console.log('📝 Instructions:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Paste the SQL above');
    console.log('5. Click "Run"');
    console.log('6. Come back and run: node scripts/test-school-setup.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupSchoolTables();