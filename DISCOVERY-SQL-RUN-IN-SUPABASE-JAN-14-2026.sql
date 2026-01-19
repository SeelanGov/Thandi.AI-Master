-- =====================================================
-- DISCOVERY SQL - RUN THIS IN SUPABASE SQL EDITOR
-- =====================================================
-- Purpose: Discover complete database state before fixing school_id issue
-- Date: January 14, 2026
-- Instructions: Copy and paste this entire file into Supabase SQL Editor and run

-- =====================================================
-- 1. DISCOVER ALL TABLES WITH school_id COLUMNS
-- =====================================================

SELECT 
  '=== TABLES WITH school_id COLUMN ===' as section,
  NULL::text as table_name,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name,
  NULL::integer as character_maximum_length
UNION ALL
SELECT 
  '' as section,
  table_name::text, 
  column_name::text, 
  data_type::text,
  udt_name::text,
  character_maximum_length
FROM information_schema.columns
WHERE column_name = 'school_id'
AND table_schema = 'public'
ORDER BY section DESC, table_name;

-- =====================================================
-- 2. DISCOVER ALL RLS POLICIES
-- =====================================================

SELECT 
  '=== ALL RLS POLICIES ===' as section,
  NULL::text as tablename,
  NULL::text as policyname,
  NULL::text as cmd,
  NULL::text as permissive
UNION ALL
SELECT 
  '' as section,
  tablename::text,
  policyname::text,
  cmd::text,
  permissive::text
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY section DESC, tablename, policyname;

-- =====================================================
-- 3. DISCOVER POLICIES THAT REFERENCE school_id
-- =====================================================

SELECT 
  '=== POLICIES REFERENCING school_id ===' as section,
  NULL::text as tablename,
  NULL::text as policyname,
  NULL::text as qual_preview
UNION ALL
SELECT 
  '' as section,
  tablename::text,
  policyname::text,
  LEFT(qual::text, 100) as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
AND (
  qual::text LIKE '%school_id%' 
  OR with_check::text LIKE '%school_id%'
)
ORDER BY section DESC, tablename, policyname;

-- =====================================================
-- 4. DISCOVER FOREIGN KEY CONSTRAINTS ON school_id
-- =====================================================

SELECT
  '=== FOREIGN KEY CONSTRAINTS ON school_id ===' as section,
  NULL::text as table_name,
  NULL::text as column_name,
  NULL::text as foreign_table_name,
  NULL::text as foreign_column_name,
  NULL::text as constraint_name
UNION ALL
SELECT
  '' as section,
  tc.table_name::text,
  kcu.column_name::text,
  ccu.table_name::text AS foreign_table_name,
  ccu.column_name::text AS foreign_column_name,
  tc.constraint_name::text
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'school_id'
  AND tc.table_schema = 'public'
ORDER BY section DESC, tc.table_name;

-- =====================================================
-- 5. DISCOVER INDEXES ON school_id COLUMNS
-- =====================================================

SELECT
  '=== INDEXES ON school_id ===' as section,
  NULL::text as table_name,
  NULL::text as index_name,
  NULL::text as column_name,
  NULL::boolean as is_unique
UNION ALL
SELECT
  '' as section,
  t.relname::text AS table_name,
  i.relname::text AS index_name,
  a.attname::text AS column_name,
  ix.indisunique AS is_unique
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
  AND a.attname = 'school_id'
  AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY section DESC, t.relname, i.relname;

-- =====================================================
-- 6. CHECK student_assessments TABLE STRUCTURE
-- =====================================================

SELECT 
  '=== student_assessments TABLE STRUCTURE ===' as section,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name,
  NULL::text as is_nullable
UNION ALL
SELECT 
  '' as section,
  column_name::text,
  data_type::text,
  udt_name::text,
  is_nullable::text
FROM information_schema.columns
WHERE table_name = 'student_assessments'
AND table_schema = 'public'
AND column_name IN ('id', 'school_id', 'student_profile_id', 'student_name', 'student_surname')
ORDER BY section DESC, ordinal_position;

-- =====================================================
-- 7. CHECK recommendations TABLE (if exists)
-- =====================================================

SELECT 
  '=== recommendations TABLE STRUCTURE ===' as section,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name
UNION ALL
SELECT 
  '' as section,
  column_name::text,
  data_type::text,
  udt_name::text
FROM information_schema.columns
WHERE table_name = 'recommendations'
AND table_schema = 'public'
ORDER BY section DESC, ordinal_position;

-- =====================================================
-- 8. CHECK school_master TABLE STRUCTURE
-- =====================================================

SELECT 
  '=== school_master TABLE STRUCTURE ===' as section,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name,
  NULL::text as is_nullable
UNION ALL
SELECT 
  '' as section,
  column_name::text,
  data_type::text,
  udt_name::text,
  is_nullable::text
FROM information_schema.columns
WHERE table_name = 'school_master'
AND table_schema = 'public'
AND column_name IN ('school_id', 'id', 'name', 'status', 'claimed_by_school_uuid')
ORDER BY section DESC, ordinal_position;

-- =====================================================
-- 9. CHECK student_profiles TABLE STRUCTURE
-- =====================================================

SELECT 
  '=== student_profiles TABLE STRUCTURE ===' as section,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name,
  NULL::text as is_nullable
UNION ALL
SELECT 
  '' as section,
  column_name::text,
  data_type::text,
  udt_name::text,
  is_nullable::text
FROM information_schema.columns
WHERE table_name = 'student_profiles'
AND table_schema = 'public'
AND column_name IN ('id', 'school_id', 'student_name', 'student_surname', 'grade')
ORDER BY section DESC, ordinal_position;

-- =====================================================
-- 10. CHECK school_students TABLE STRUCTURE
-- =====================================================

SELECT 
  '=== school_students TABLE STRUCTURE ===' as section,
  NULL::text as column_name,
  NULL::text as data_type,
  NULL::text as udt_name,
  NULL::text as is_nullable
UNION ALL
SELECT 
  '' as section,
  column_name::text,
  data_type::text,
  udt_name::text,
  is_nullable::text
FROM information_schema.columns
WHERE table_name = 'school_students'
AND table_schema = 'public'
AND column_name IN ('id', 'school_id', 'student_id', 'grade', 'status')
ORDER BY section DESC, ordinal_position;

-- =====================================================
-- INSTRUCTIONS FOR NEXT STEPS
-- =====================================================

SELECT 
  '=== NEXT STEPS ===' as section,
  'Copy all results from this query' as instruction,
  'Save to a text file' as step_1,
  'Share with Kiro for analysis' as step_2,
  'Kiro will create comprehensive fix based on discoveries' as step_3;
