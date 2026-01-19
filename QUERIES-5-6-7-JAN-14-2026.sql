-- =====================================================
-- FINAL 2 DISCOVERY QUERIES
-- Date: January 14, 2026
-- Purpose: Complete the discovery phase
-- =====================================================

-- =====================================================
-- QUERY 2: GET STUDENT_ASSESSMENTS POLICY DEFINITION
-- =====================================================
-- This policy blocked Step 3 (changing student_assessments.school_id)
-- We need its definition to recreate it after the fix

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

-- Expected result: 1 row with policy definition
-- The 'qual' field contains the policy logic


-- =====================================================
-- QUERY 3: CHECK SCHOOLS.ID COLUMN TYPE
-- =====================================================
-- We need to know if schools.id is UUID or VARCHAR
-- This determines if we need to change it too (for foreign key compatibility)

SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schools'
  AND column_name = 'id';

-- Expected result: 1 row showing column type
-- If data_type = 'uuid', we need to change it to VARCHAR
-- If data_type = 'character varying', it's already VARCHAR


-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- 1. Run Query 2 first
-- 2. Take screenshot of results
-- 3. Run Query 3 second
-- 4. Take screenshot of results
-- 5. Provide both screenshots
-- 
-- After both queries, we'll have ALL information needed
-- to create the final bulletproof fix script!
