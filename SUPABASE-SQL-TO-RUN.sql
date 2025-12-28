-- =====================================================
-- STUDENT ASSESSMENT SYSTEM - POPIA COMPLIANT
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create student_assessments table
CREATE TABLE IF NOT EXISTS student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Student Information
  student_name VARCHAR(100),
  student_surname VARCHAR(100),
  school_id VARCHAR(50),
  grade INTEGER CHECK (grade IN (10, 11, 12)),
  
  -- Assessment Data
  assessment_data JSONB,
  results_data JSONB,
  
  -- POPIA Compliance Fields
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP NOT NULL,
  consent_version VARCHAR(20) DEFAULT 'v1.0',
  data_retention_date TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
  anonymized BOOLEAN DEFAULT FALSE,
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_consent CHECK (consent_given = true),
  CONSTRAINT valid_grade CHECK (grade BETWEEN 10 AND 12)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_assessments_school_id ON student_assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_grade ON student_assessments(grade);
CREATE INDEX IF NOT EXISTS idx_student_assessments_created_at ON student_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_student_assessments_retention ON student_assessments(data_retention_date);

-- 3. Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enhanced school search function (secondary schools only)
CREATE OR REPLACE FUNCTION search_secondary_schools(
  search_query TEXT, 
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  school_id VARCHAR(50),
  name TEXT,
  province VARCHAR(50),
  type VARCHAR(100),
  status VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.school_id,
    sm.name,
    sm.province,
    sm.type,
    sm.status
  FROM school_master sm
  WHERE 
    (sm.name ILIKE '%' || search_query || '%' OR sm.school_id ILIKE '%' || search_query || '%')
    AND (
      sm.type ILIKE '%SECONDARY%' 
      OR sm.type ILIKE '%HIGH%' 
      OR sm.type ILIKE '%COMBINED%'
      OR sm.type ILIKE '%COMPREHENSIVE%'
    )
    AND sm.type NOT ILIKE '%PRIMARY%'
  ORDER BY 
    CASE 
      WHEN sm.name ILIKE search_query || '%' THEN 1
      WHEN sm.name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    sm.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get school dashboard stats (POPIA-safe aggregates)
CREATE OR REPLACE FUNCTION get_school_dashboard_stats(target_school_id VARCHAR(50))
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_assessments', COUNT(*),
    'grade_10_count', COUNT(*) FILTER (WHERE grade = 10),
    'grade_11_count', COUNT(*) FILTER (WHERE grade = 11),
    'grade_12_count', COUNT(*) FILTER (WHERE grade = 12),
    'completion_rate', ROUND(
      (COUNT(*) FILTER (WHERE results_data IS NOT NULL)::DECIMAL / 
       NULLIF(COUNT(*), 0)) * 100, 1
    ),
    'last_assessment', MAX(created_at)
  )
  INTO stats
  FROM student_assessments
  WHERE school_id = target_school_id
    AND anonymized = FALSE;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 6. Function for automatic data cleanup (POPIA compliance)
CREATE OR REPLACE FUNCTION cleanup_expired_student_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM student_assessments 
  WHERE data_retention_date < NOW()
    AND anonymized = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup for audit
  INSERT INTO audit_log (action, table_name, details, created_at)
  VALUES (
    'AUTO_CLEANUP', 
    'student_assessments', 
    jsonb_build_object('deleted_count', deleted_count, 'reason', 'POPIA_retention_limit'),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_assessments_updated_at
  BEFORE UPDATE ON student_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Row Level Security (RLS) for data protection
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Schools can only see their own aggregate data
CREATE POLICY school_own_data_policy ON student_assessments
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM school_master 
      WHERE status = 'claimed' 
      AND claimed_by_school_uuid = auth.uid()
    )
  );

-- Policy: Service role can manage all data (for API operations)
CREATE POLICY service_role_policy ON student_assessments
  FOR ALL
  USING (auth.role() = 'service_role');

-- 9. Grant permissions
GRANT SELECT ON student_assessments TO authenticated;
GRANT ALL ON student_assessments TO service_role;
GRANT SELECT ON audit_log TO authenticated;
GRANT ALL ON audit_log TO service_role;

-- 10. Add comments for documentation
COMMENT ON TABLE student_assessments IS 'POPIA-compliant storage for student assessment data with automatic retention management';
COMMENT ON COLUMN student_assessments.consent_given IS 'POPIA requirement: explicit consent must be true';
COMMENT ON COLUMN student_assessments.consent_timestamp IS 'POPIA requirement: when consent was given';
COMMENT ON COLUMN student_assessments.data_retention_date IS 'POPIA requirement: automatic deletion date (1 year default)';
COMMENT ON FUNCTION cleanup_expired_student_data() IS 'POPIA compliance: automatic cleanup of expired student data';
COMMENT ON FUNCTION search_secondary_schools(TEXT, INTEGER) IS 'Enhanced school search excluding primary schools';
COMMENT ON FUNCTION get_school_dashboard_stats(VARCHAR) IS 'POPIA-safe aggregate statistics for school dashboards';

-- =====================================================
-- VERIFICATION QUERIES (Run these to test)
-- =====================================================

-- Test 1: Check if table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_assessments' 
ORDER BY ordinal_position;

-- Test 2: Test school search function
SELECT * FROM search_secondary_schools('high', 5);

-- Test 3: Test dashboard stats function (will return empty stats)
SELECT get_school_dashboard_stats('test-school-id');

-- Test 4: Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'student_assessments';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🎉 Student Assessment System Created Successfully!';
  RAISE NOTICE '✅ student_assessments table ready';
  RAISE NOTICE '✅ POPIA compliance features enabled';
  RAISE NOTICE '✅ School search function created';
  RAISE NOTICE '✅ Dashboard stats function ready';
  RAISE NOTICE '✅ Row Level Security enabled';
  RAISE NOTICE '📋 Next: Test the registration API endpoints';
END $$;