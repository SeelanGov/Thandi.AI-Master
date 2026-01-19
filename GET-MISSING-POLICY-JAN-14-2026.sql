-- =====================================================
-- GET MISSING POLICY DEFINITION
-- Date: January 14, 2026
-- =====================================================

-- Query to get the student_assessments policy that's blocking Step 3
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'student_assessments'
  AND policyname = 'School_isolation_assessments';

-- Also get ALL policies on student_assessments to see what exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'student_assessments';
