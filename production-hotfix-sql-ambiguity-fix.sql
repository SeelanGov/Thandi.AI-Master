-- PRODUCTION HOTFIX: SQL Ambiguity Fix
-- Date: January 13, 2026
-- Issue: "column reference 'consent_date' is ambiguous"
-- Root Cause: RLS policies and triggers causing implicit ambiguous queries
-- Solution: Update function with enhanced SECURITY DEFINER and explicit aliases

-- =====================================================
-- BACKUP ORIGINAL FUNCTION (for rollback)
-- =====================================================

-- Create backup of original function
CREATE OR REPLACE FUNCTION create_student_school_association_backup(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form'
)
RETURNS JSONB AS $
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
$ LANGUAGE plpgsql;

-- =====================================================
-- PRODUCTION FIX: Enhanced Function with Ambiguity Resolution
-- =====================================================

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
  v_consent_timestamp TIMESTAMPTZ;
BEGIN
  -- Set consent timestamp once to avoid multiple NOW() calls
  v_consent_timestamp := CASE WHEN p_consent_given THEN NOW() ELSE NULL END;

  -- Validate school exists and is secondary (with explicit alias)
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

  -- Create student profile (explicit column specification to avoid ambiguity)
  INSERT INTO student_profiles (
    student_name,
    student_surname,
    grade,
    school_id,
    consent_given,
    consent_date,
    consent_method,
    consent_version,
    created_at,
    updated_at
  ) VALUES (
    p_student_name,
    p_student_surname,
    p_grade,
    p_school_id,
    p_consent_given,
    v_consent_timestamp,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END,
    CASE WHEN p_consent_given THEN 'v2.0_popia_compliant' ELSE NULL END,
    NOW(),
    NOW()
  ) RETURNING id INTO v_student_id;

  -- Create school-student relationship (explicit column specification)
  INSERT INTO school_students (
    school_id,
    student_id,
    grade,
    status,
    consent_given,
    consent_date,
    consent_method,
    enrolled_date,
    created_at,
    updated_at
  ) VALUES (
    p_school_id,
    v_student_id,
    p_grade,
    'active',
    p_consent_given,
    v_consent_timestamp,
    CASE WHEN p_consent_given THEN p_consent_method ELSE NULL END,
    CURRENT_DATE,
    NOW(),
    NOW()
  ) RETURNING id INTO v_school_student_id;

  -- Return success result with enhanced metadata
  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'school_student_id', v_school_student_id,
    'consent_given', p_consent_given,
    'consent_timestamp', v_consent_timestamp,
    'created_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  -- Enhanced error reporting for debugging
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', NOW()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENHANCED RLS POLICIES (Alternative Fix)
-- =====================================================

-- Drop and recreate RLS policies with explicit table aliases
DROP POLICY IF EXISTS school_student_profiles_policy ON student_profiles;
DROP POLICY IF EXISTS school_relationships_policy ON school_students;

-- Enhanced student profiles policy with explicit aliases
CREATE POLICY school_student_profiles_policy ON student_profiles
  FOR SELECT
  USING (
    student_profiles.school_id IN (
      SELECT sm.school_id 
      FROM school_master sm
      WHERE sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

-- Enhanced school relationships policy with explicit aliases  
CREATE POLICY school_relationships_policy ON school_students
  FOR SELECT
  USING (
    school_students.school_id IN (
      SELECT sm.school_id 
      FROM school_master sm
      WHERE sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Ensure service role has proper permissions
GRANT EXECUTE ON FUNCTION create_student_school_association TO service_role;
GRANT EXECUTE ON FUNCTION create_student_school_association TO authenticated;

-- =====================================================
-- VERIFICATION TEST
-- =====================================================

-- Test the fixed function (comment out for production deployment)
/*
SELECT create_student_school_association(
  'Production',
  'Hotfix', 
  'EC101001',  -- Replace with actual school ID
  11,
  true,
  'production_hotfix_verification',
  '{"hotfix_version": "v1.0", "timestamp": "2026-01-13"}'::jsonb
);
*/

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================

/*
-- If this fix causes issues, rollback with:
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form'
)
RETURNS JSONB AS $
SELECT create_student_school_association_backup(
  p_student_name, p_student_surname, p_school_id, p_grade, p_consent_given, p_consent_method
);
$ LANGUAGE sql;
*/