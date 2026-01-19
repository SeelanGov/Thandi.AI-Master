-- =====================================================
-- SIMPLE DISCOVERY SQL - RUN IN SUPABASE SQL EDITOR
-- =====================================================
-- Run each query separately and copy the results

-- =====================================================
-- QUERY 1: Tables with school_id column
-- =====================================================
SELECT 
  table_name, 
  column_name, 
  data_type,
  udt_name,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE column_name = 'school_id'
AND table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- QUERY 2: ALL RLS Policies
-- =====================================================
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  LEFT(qual::text, 200) as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- QUERY 3: Policies that reference school_id
-- =====================================================
SELECT 
  tablename,
  policyname,
  LEFT(qual::text, 200) as qual_preview,
  LEFT(with_check::text, 200) as with_check_preview
FROM pg_policies
WHERE schemaname = 'public'
AND (
  qual::text LIKE '%school_id%' 
  OR with_check::text LIKE '%school_id%'
)
ORDER BY tablename, policyname;

-- =====================================================
-- QUERY 4: student_assessments table structure
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

-- =====================================================
-- QUERY 5: school_master table structure
-- =====================================================
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'school_master'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 6: student_profiles table structure
-- =====================================================
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'student_profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- QUERY 7: school_students table structure
-- =====================================================
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'school_students'
AND table_schema = 'public'
ORDER BY ordinal_position;
