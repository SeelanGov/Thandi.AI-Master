-- PRODUCTION HOTFIX: SQL Ambiguity Diagnostic Script
-- Date: January 13, 2026
-- Purpose: Identify and fix "column reference 'consent_date' is ambiguous" error

-- =====================================================
-- 1. DIAGNOSTIC QUERIES
-- =====================================================

-- Test the function in isolation to confirm the issue
SELECT create_student_school_association(
  'Test',
  'Student', 
  'EC101001',  -- Use a known school ID
  11,
  true,
  'diagnostic_test'
);

-- Check current RLS policies that might cause ambiguity
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('student_profiles', 'school_students')
ORDER BY tablename, policyname;

-- Check for triggers that might cause ambiguity
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname IN ('student_profiles', 'school_students')
ORDER BY c.relname, t.tgname;

-- =====================================================
-- 2. POTENTIAL FIX: Update RLS Policies with Explicit Aliases
-- =====================================================

-- The issue is likely in RLS policy evaluation during function execution
-- We need to ensure all policies use explicit table references

-- Drop existing policies that might cause ambiguity
DROP POLICY IF EXISTS school_student_profiles_policy ON student_profiles;
DROP POLICY IF EXISTS school_relationships_policy ON school_students;

-- Recreate policies with explicit table aliases and better structure
CREATE POLICY school_student_profiles_policy ON student_profiles
  FOR SELECT
  USING (
    student_profiles.school_id IN (
      SELECT sm.school_id FROM school_master sm
      WHERE sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

CREATE POLICY school_relationships_policy ON school_students
  FOR SELECT
  USING (
    school_students.school_id IN (
      SELECT sm.school_id FROM school_master sm
      WHERE sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

-- =====================================================
-- 3. ALTERNATIVE FIX: Update Function to Use SECURITY DEFINER Context
-- =====================================================

-- Ensure the function bypasses RLS completely by using proper security context
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form',
  p_consent_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $
DECLARE
  v_student_id UUID;
  v_school_student_id UUID;
  v_result JSONB;
BEGIN
  -- Validate school exists and is secondary
  IF NOT EXISTS (
    SELECT 1 FROM school_master sm
    WHERE sm.school_id = p_school_id 
    AND (sm.type ILIKE '%SECONDARY%' OR sm.type ILIKE '%HIGH%' OR sm.type ILIKE '%COMBINED%')
    AND sm.type NOT ILIKE '%PRIMARY%'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid school or primary school not supported'
    );
  END IF;

  -- Create student profile with explicit column references
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

  -- Create school-student relationship with explicit column references
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_student_school_association TO service_role;

-- =====================================================
-- 4. TEST THE FIX
-- =====================================================

-- Test the updated function
SELECT create_student_school_association(
  'Fixed',
  'Test', 
  'EC101001',
  11,
  true,
  'production_hotfix_test'
);