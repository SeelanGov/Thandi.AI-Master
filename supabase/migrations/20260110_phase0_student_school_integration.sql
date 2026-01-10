-- Phase 0: Student-School Integration Database Schema
-- Migration: 20260110_phase0_student_school_integration.sql
-- Purpose: Enable student-school data linkage with POPIA compliance

-- =====================================================
-- 1. SCHOOL ADDITION REQUESTS TABLE
-- =====================================================

-- Create school addition requests table
CREATE TABLE IF NOT EXISTS school_addition_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Details
  school_name VARCHAR(255) NOT NULL,
  school_code VARCHAR(50),
  contact_email VARCHAR(255),
  requested_by_name VARCHAR(200) NOT NULL,
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  admin_notes TEXT,
  processed_by VARCHAR(100),
  processed_at TIMESTAMP,
  
  -- Metadata
  request_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for school addition requests
CREATE INDEX idx_school_addition_requests_status ON school_addition_requests(status);
CREATE INDEX idx_school_addition_requests_created_at ON school_addition_requests(created_at);
CREATE INDEX idx_school_addition_requests_school_name ON school_addition_requests(school_name);

-- =====================================================
-- 2. ENHANCED STUDENT PROFILES TABLE
-- =====================================================

-- Create enhanced student profiles table (separate from assessments)
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Information
  student_name VARCHAR(100) NOT NULL,
  student_surname VARCHAR(100) NOT NULL,
  grade INTEGER CHECK (grade IN (10, 11, 12)),
  
  -- School Association (Phase 0 core requirement)
  school_id VARCHAR(50) REFERENCES school_master(school_id),
  
  -- POPIA Consent Management
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP,
  consent_method VARCHAR(50) DEFAULT 'web_form',
  consent_version VARCHAR(20) DEFAULT 'v1.0',
  
  -- Data Retention (POPIA Compliance)
  data_retention_date TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
  anonymized BOOLEAN DEFAULT FALSE,
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_consent CHECK (consent_given = true),
  CONSTRAINT valid_grade CHECK (grade BETWEEN 10 AND 12)
);

-- Create indexes for student profiles
CREATE INDEX idx_student_profiles_school_id ON student_profiles(school_id);
CREATE INDEX idx_student_profiles_grade ON student_profiles(grade);
CREATE INDEX idx_student_profiles_created_at ON student_profiles(created_at);
CREATE INDEX idx_student_profiles_retention ON student_profiles(data_retention_date);

-- =====================================================
-- 3. SCHOOL-STUDENT RELATIONSHIP TABLE
-- =====================================================

-- Create school-student relationship tracking table
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship
  school_id VARCHAR(50) REFERENCES school_master(school_id) NOT NULL,
  student_id UUID REFERENCES student_profiles(id) NOT NULL,
  
  -- Student Details
  grade INTEGER CHECK (grade IN (10, 11, 12)),
  class_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  
  -- Enrollment Tracking
  enrolled_date DATE DEFAULT CURRENT_DATE,
  
  -- Consent Tracking (POPIA)
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP,
  consent_method VARCHAR(50),
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(school_id, student_id)
);

-- Create indexes for school-student relationships
CREATE INDEX idx_school_students_school_id ON school_students(school_id);
CREATE INDEX idx_school_students_student_id ON school_students(student_id);
CREATE INDEX idx_school_students_status ON school_students(status);
CREATE INDEX idx_school_students_grade ON school_students(grade);

-- =====================================================
-- 4. ENHANCED STUDENT ASSESSMENTS TABLE
-- =====================================================

-- Add school_id column to existing student_assessments table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'student_assessments' 
    AND column_name = 'student_profile_id'
  ) THEN
    ALTER TABLE student_assessments 
    ADD COLUMN student_profile_id UUID REFERENCES student_profiles(id);
  END IF;
END $$;

-- Create index for student profile relationship
CREATE INDEX IF NOT EXISTS idx_student_assessments_student_profile_id 
ON student_assessments(student_profile_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_addition_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Schools can only see their own students' profiles
CREATE POLICY school_student_profiles_policy ON student_profiles
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_master 
      WHERE status = 'claimed' 
      AND claimed_by_school_uuid = auth.uid()
    )
  );

-- Policy: Schools can only see their own school-student relationships
CREATE POLICY school_relationships_policy ON school_students
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_master 
      WHERE status = 'claimed' 
      AND claimed_by_school_uuid = auth.uid()
    )
  );

-- Policy: Service role can manage all data (for API operations)
CREATE POLICY service_role_student_profiles_policy ON student_profiles
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY service_role_school_students_policy ON school_students
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY service_role_school_requests_policy ON school_addition_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 6. ENHANCED FUNCTIONS
-- =====================================================

-- Function to create student-school association with consent
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form'
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_school_student_id UUID;
  v_result JSONB;
BEGIN
  -- Validate school exists and is secondary
  IF NOT EXISTS (
    SELECT 1 FROM school_master 
    WHERE school_id = p_school_id 
    AND (type ILIKE '%SECONDARY%' OR type ILIKE '%HIGH%' OR type ILIKE '%COMBINED%')
    AND type NOT ILIKE '%PRIMARY%'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid school or primary school not supported'
    );
  END IF;

  -- Create student profile
  INSERT INTO student_profiles (
    student_name,
    student_surname,
    grade,
    school_id,
    consent_given,
    consent_date,
    consent_method
  ) VALUES (
    p_student_name,
    p_student_surname,
    p_grade,
    p_school_id,
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
  ) RETURNING id INTO v_student_id;

  -- Create school-student relationship
  INSERT INTO school_students (
    school_id,
    student_id,
    grade,
    status,
    consent_given,
    consent_date,
    consent_method
  ) VALUES (
    p_school_id,
    v_student_id,
    p_grade,
    'active',
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END
  ) RETURNING id INTO v_school_student_id;

  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'school_student_id', v_school_student_id,
    'consent_given', p_consent_given
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get school dashboard statistics (Phase 0 enhanced)
CREATE OR REPLACE FUNCTION get_school_dashboard_stats_v2(target_school_id VARCHAR(50))
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_students', COUNT(DISTINCT ss.student_id),
    'total_assessments', COUNT(sa.id),
    'grade_10_students', COUNT(DISTINCT ss.student_id) FILTER (WHERE ss.grade = 10),
    'grade_11_students', COUNT(DISTINCT ss.student_id) FILTER (WHERE ss.grade = 11),
    'grade_12_students', COUNT(DISTINCT ss.student_id) FILTER (WHERE ss.grade = 12),
    'students_with_consent', COUNT(DISTINCT ss.student_id) FILTER (WHERE ss.consent_given = true),
    'completion_rate', ROUND(
      (COUNT(sa.id) FILTER (WHERE sa.results_data IS NOT NULL)::DECIMAL / 
       NULLIF(COUNT(sa.id), 0)) * 100, 1
    ),
    'last_assessment', MAX(sa.created_at),
    'last_enrollment', MAX(ss.created_at)
  )
  INTO stats
  FROM school_students ss
  LEFT JOIN student_assessments sa ON sa.student_profile_id = ss.student_id
  WHERE ss.school_id = target_school_id
    AND ss.status = 'active';
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function for retroactive student-school association
CREATE OR REPLACE FUNCTION associate_existing_student_to_school(
  p_student_assessment_id UUID,
  p_school_id VARCHAR(50),
  p_consent_given BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  v_assessment RECORD;
  v_student_id UUID;
  v_result JSONB;
BEGIN
  -- Get existing assessment data
  SELECT * INTO v_assessment
  FROM student_assessments
  WHERE id = p_student_assessment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Assessment not found'
    );
  END IF;

  -- Create student profile from assessment data
  SELECT create_student_school_association(
    v_assessment.student_name,
    v_assessment.student_surname,
    p_school_id,
    v_assessment.grade,
    p_consent_given,
    'retroactive_association'
  ) INTO v_result;

  IF (v_result->>'success')::boolean THEN
    -- Update assessment to link to new student profile
    UPDATE student_assessments
    SET student_profile_id = (v_result->>'student_id')::UUID
    WHERE id = p_student_assessment_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. UPDATE TRIGGERS
-- =====================================================

-- Update trigger for student_profiles
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for school_students
CREATE TRIGGER update_school_students_updated_at
  BEFORE UPDATE ON school_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for school_addition_requests
CREATE TRIGGER update_school_addition_requests_updated_at
  BEFORE UPDATE ON school_addition_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for new tables
GRANT SELECT ON student_profiles TO authenticated;
GRANT SELECT ON school_students TO authenticated;
GRANT SELECT ON school_addition_requests TO authenticated;

GRANT ALL ON student_profiles TO service_role;
GRANT ALL ON school_students TO service_role;
GRANT ALL ON school_addition_requests TO service_role;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE student_profiles IS 'Phase 0: Enhanced student profiles with school association and POPIA consent management';
COMMENT ON TABLE school_students IS 'Phase 0: School-student relationship tracking with consent and enrollment status';
COMMENT ON TABLE school_addition_requests IS 'Phase 0: Student requests for adding missing schools to the database';

COMMENT ON FUNCTION create_student_school_association(VARCHAR, VARCHAR, VARCHAR, INTEGER, BOOLEAN, VARCHAR) IS 'Phase 0: Create student profile with school association and consent tracking';
COMMENT ON FUNCTION get_school_dashboard_stats_v2(VARCHAR) IS 'Phase 0: Enhanced school dashboard statistics with student-school relationships';
COMMENT ON FUNCTION associate_existing_student_to_school(UUID, VARCHAR, BOOLEAN) IS 'Phase 0: Retroactive association of existing assessments to schools';

-- =====================================================
-- 10. PHASE 0 COMPLETION MARKER
-- =====================================================

-- Insert completion marker for Phase 0 database schema
INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'PHASE_0_SCHEMA_COMPLETE', 
  'student_school_integration', 
  jsonb_build_object(
    'version', 'Phase 0 v1.0',
    'tables_created', ARRAY['student_profiles', 'school_students', 'school_addition_requests'],
    'functions_created', ARRAY['create_student_school_association', 'get_school_dashboard_stats_v2', 'associate_existing_student_to_school'],
    'rls_policies_created', 6,
    'migration_date', NOW()
  ),
  NOW()
);