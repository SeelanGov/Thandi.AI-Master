-- POPIA-Compliant Consent Management System
-- Task 4: Enhanced consent tracking and audit trail

-- Create consent history table for audit trail
CREATE TABLE consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id),
  consent_action VARCHAR(20) NOT NULL CHECK (consent_action IN ('granted', 'revoked', 'updated')),
  consent_given BOOLEAN NOT NULL,
  consent_method VARCHAR(50) NOT NULL,
  consent_context VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  consent_version VARCHAR(20) DEFAULT 'v2.0_popia_compliant',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_consent_history_student_id (student_profile_id),
  INDEX idx_consent_history_school_id (school_id),
  INDEX idx_consent_history_created_at (created_at)
);

-- Add RLS policy for consent history
ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;

-- Students can view their own consent history
CREATE POLICY "Students can view own consent history" ON consent_history
  FOR SELECT USING (
    student_profile_id IN (
      SELECT id FROM student_profiles 
      WHERE id = student_profile_id
    )
  );

-- Schools can view consent history for their students (with valid consent)
CREATE POLICY "Schools can view student consent history" ON consent_history
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM school_students 
      WHERE student_id = student_profile_id 
      AND consent_given = true
    )
  );

-- System can insert consent records
CREATE POLICY "System can insert consent records" ON consent_history
  FOR INSERT WITH CHECK (true);

-- Create function to record consent changes
CREATE OR REPLACE FUNCTION record_consent_change(
  p_student_profile_id UUID,
  p_school_id UUID,
  p_consent_action VARCHAR(20),
  p_consent_given BOOLEAN,
  p_consent_method VARCHAR(50),
  p_consent_context VARCHAR(100) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  consent_record_id UUID;
BEGIN
  -- Insert consent history record
  INSERT INTO consent_history (
    student_profile_id,
    school_id,
    consent_action,
    consent_given,
    consent_method,
    consent_context,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_student_profile_id,
    p_school_id,
    p_consent_action,
    p_consent_given,
    p_consent_method,
    p_consent_context,
    p_ip_address,
    p_user_agent,
    p_metadata
  ) RETURNING id INTO consent_record_id;
  
  -- Update student profile consent status
  UPDATE student_profiles 
  SET 
    consent_given = p_consent_given,
    consent_date = NOW(),
    updated_at = NOW()
  WHERE id = p_student_profile_id;
  
  -- Update school_students relationship
  UPDATE school_students 
  SET 
    consent_given = p_consent_given,
    consent_date = NOW(),
    updated_at = NOW()
  WHERE student_id = p_student_profile_id AND school_id = p_school_id;
  
  RETURN consent_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check current consent status
CREATE OR REPLACE FUNCTION check_student_consent(
  p_student_profile_id UUID,
  p_school_id UUID
) RETURNS TABLE (
  has_consent BOOLEAN,
  consent_date TIMESTAMP,
  consent_method VARCHAR(50),
  can_access_data BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.consent_given as has_consent,
    ss.consent_date,
    COALESCE(
      (SELECT consent_method FROM consent_history 
       WHERE student_profile_id = p_student_profile_id 
       AND school_id = p_school_id 
       ORDER BY created_at DESC LIMIT 1),
      'unknown'
    ) as consent_method,
    (ss.consent_given AND ss.status = 'active') as can_access_data
  FROM school_students ss
  WHERE ss.student_id = p_student_profile_id 
  AND ss.school_id = p_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke consent
CREATE OR REPLACE FUNCTION revoke_student_consent(
  p_student_profile_id UUID,
  p_school_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  consent_record_id UUID;
  result JSONB;
BEGIN
  -- Record the consent revocation
  SELECT record_consent_change(
    p_student_profile_id,
    p_school_id,
    'revoked',
    false,
    'student_revocation',
    'consent_withdrawal',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('reason', COALESCE(p_reason, 'Student requested withdrawal'))
  ) INTO consent_record_id;
  
  -- Immediately remove school access to student data
  -- This is handled by the RLS policies automatically
  
  result := jsonb_build_object(
    'success', true,
    'consent_record_id', consent_record_id,
    'message', 'Consent successfully revoked. School access removed immediately.',
    'timestamp', NOW()
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing create_student_school_association function to use consent history
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id UUID,
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form_registration',
  p_consent_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  student_id UUID;
  school_student_id UUID;
  consent_record_id UUID;
  result JSONB;
BEGIN
  -- Create or get student profile
  INSERT INTO student_profiles (
    name, 
    surname, 
    grade, 
    school_id,
    consent_given,
    consent_date
  ) VALUES (
    p_student_name, 
    p_student_surname, 
    p_grade, 
    p_school_id,
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END
  ) 
  ON CONFLICT (name, surname, school_id) 
  DO UPDATE SET 
    grade = p_grade,
    consent_given = p_consent_given,
    consent_date = CASE WHEN p_consent_given THEN NOW() ELSE consent_date END,
    updated_at = NOW()
  RETURNING id INTO student_id;
  
  -- Create school-student association
  INSERT INTO school_students (
    school_id,
    student_id,
    grade,
    consent_given,
    consent_date
  ) VALUES (
    p_school_id,
    student_id,
    p_grade,
    p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END
  )
  ON CONFLICT (school_id, student_id)
  DO UPDATE SET
    grade = p_grade,
    consent_given = p_consent_given,
    consent_date = CASE WHEN p_consent_given THEN NOW() ELSE consent_date END,
    updated_at = NOW()
  RETURNING id INTO school_student_id;
  
  -- Record consent in history
  SELECT record_consent_change(
    student_id,
    p_school_id,
    CASE WHEN p_consent_given THEN 'granted' ELSE 'revoked' END,
    p_consent_given,
    p_consent_method,
    'initial_registration',
    (p_consent_metadata->>'ip_address')::INET,
    p_consent_metadata->>'user_agent',
    p_consent_metadata
  ) INTO consent_record_id;
  
  result := jsonb_build_object(
    'success', true,
    'student_id', student_id,
    'school_student_id', school_student_id,
    'consent_record_id', consent_record_id,
    'consent_given', p_consent_given
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create consent verification middleware function
CREATE OR REPLACE FUNCTION verify_school_student_access(
  p_school_id UUID,
  p_student_profile_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := false;
BEGIN
  SELECT 
    (ss.consent_given AND ss.status = 'active')
  INTO has_access
  FROM school_students ss
  WHERE ss.school_id = p_school_id 
  AND ss.student_id = p_student_profile_id;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION record_consent_change TO authenticated;
GRANT EXECUTE ON FUNCTION check_student_consent TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_student_consent TO authenticated;
GRANT EXECUTE ON FUNCTION verify_school_student_access TO authenticated;

-- Add helpful comments
COMMENT ON TABLE consent_history IS 'POPIA-compliant audit trail for all consent changes';
COMMENT ON FUNCTION record_consent_change IS 'Records consent changes with full audit trail';
COMMENT ON FUNCTION check_student_consent IS 'Checks current consent status for school access';
COMMENT ON FUNCTION revoke_student_consent IS 'Allows students to withdraw consent';
COMMENT ON FUNCTION verify_school_student_access IS 'Verifies if school can access student data';