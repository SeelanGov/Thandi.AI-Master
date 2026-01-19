-- =====================================================
-- QUERY 4: student_assessments table structure (CORRECTED)
-- =====================================================
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'student_assessments'
AND table_schema = 'public'
ORDER BY ordinal_position;
