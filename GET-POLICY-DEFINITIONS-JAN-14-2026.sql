-- =====================================================
-- GET ALL POLICY DEFINITIONS
-- Date: January 14, 2026
-- Run this FIRST to see all policies that reference school_id
-- =====================================================

-- Query 1: Find all policies on student_assessments that reference school_id
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  pg_get_policydef(pol.oid) AS full_policy_definition
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'student_assessments'
  AND pg_get_policydef(pol.oid) ILIKE '%school_id%'
ORDER BY polname;

-- Query 2: Get ALL policies on student_assessments (even if they don't reference school_id)
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  pg_get_policydef(pol.oid) AS full_policy_definition
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'student_assessments'
ORDER BY polname;
