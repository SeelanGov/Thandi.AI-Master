-- =====================================================
-- STEP-BY-STEP SCHOOL_ID FIX
-- Date: January 14, 2026
-- Run each step separately in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: DROP RLS POLICIES (Run this first)
-- =====================================================

DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;

-- Wait for success message, then proceed to Step 2


-- =====================================================
-- STEP 2: ALTER school_users (Run this second)
-- =====================================================

ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Wait for success message, then proceed to Step 3


-- =====================================================
-- STEP 3: ALTER student_assessments (Run this third)
-- =====================================================

ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Wait for success message, then proceed to Step 4


-- =====================================================
-- STEP 4: ALTER students (Run this fourth)
-- =====================================================

ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Wait for success message, then proceed to Step 5


-- =====================================================
-- STEP 5: RECREATE POLICY 1 (Run this fifth)
-- =====================================================

CREATE POLICY "Students can view own data" 
  ON students 
  FOR SELECT 
  USING (auth.uid() = id);

-- Wait for success message, then proceed to Step 6


-- =====================================================
-- STEP 6: RECREATE POLICY 2 (Run this sixth)
-- =====================================================

CREATE POLICY "Students can update own data" 
  ON students 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Wait for success message, then proceed to verification


-- =====================================================
-- STEP 7: VERIFY SUCCESS (Run this last)
-- =====================================================

-- Check all school_id columns are now VARCHAR
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- Expected: All 9 tables should show 'character varying'


-- Check policies were recreated
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'students'
ORDER BY policyname;

-- Expected: 2 policies should be listed
