-- =====================================================
-- INSPECT ALL POLICIES - Simple version
-- Date: January 14, 2026
-- Works with all Supabase versions
-- =====================================================

-- Query 1: List all policies on student_assessments
SELECT 
  polname AS policy_name,
  polcmd AS command_type
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'student_assessments'
ORDER BY polname;

-- Query 2: List all policies on recommendations
SELECT 
  polname AS policy_name,
  polcmd AS command_type
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'recommendations'
ORDER BY polname;

-- Query 3: Find ALL tables that have a school_id column
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
ORDER BY table_name;
