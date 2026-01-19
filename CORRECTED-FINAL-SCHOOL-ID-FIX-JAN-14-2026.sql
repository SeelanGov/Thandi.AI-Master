-- =====================================================
-- CORRECTED FINAL BULLETPROOF SCHOOL_ID FIX
-- Date: January 14, 2026
-- Based on: Phase 3 failure analysis
-- =====================================================
-- 
-- PHASE 3 FAILURE ROOT CAUSE:
-- - school_users.school_id has a foreign key to schools.id
-- - This foreign key was NOT discovered in our diagnostic
-- - Must drop BOTH foreign keys before changing column types
--
-- This script will:
-- 1. Drop 3 blocking policies
-- 2. Drop 2 foreign key constraints (students + school_users)
-- 3. Change 4 columns from UUID to VARCHAR
-- 4. Recreate 2 foreign key constraints
-- 5. Recreate all 3 policies
-- =====================================================

BEGIN;


-- =====================================================
-- PHASE 1: DROP ALL BLOCKING POLICIES
-- =====================================================

-- Drop policies on students table (2 policies)
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;

-- Drop policy on schools table (1 policy)
DROP POLICY IF EXISTS "School users see own school" ON schools;


-- =====================================================
-- PHASE 2: DROP ALL FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop foreign key from students to schools
ALTER TABLE students 
  DROP CONSTRAINT IF EXISTS students_school_id_fkey;

-- Drop foreign key from school_users to schools (THIS WAS MISSING!)
ALTER TABLE school_users 
  DROP CONSTRAINT IF EXISTS school_users_school_id_fkey;


-- =====================================================
-- PHASE 3: CHANGE COLUMN TYPES (4 columns)
-- =====================================================

-- Change schools.id (PRIMARY KEY - must be changed first!)
ALTER TABLE schools 
  ALTER COLUMN id TYPE VARCHAR(255) USING id::TEXT;

-- Change school_users.school_id
ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change student_assessments.school_id
ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change students.school_id
ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;


-- =====================================================
-- PHASE 4: RECREATE ALL FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Recreate foreign key from students to schools
ALTER TABLE students 
  ADD CONSTRAINT students_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id);

-- Recreate foreign key from school_users to schools
ALTER TABLE school_users 
  ADD CONSTRAINT school_users_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id);


-- =====================================================
-- PHASE 5: RECREATE ALL POLICIES
-- =====================================================

-- Recreate policies on students table (2 policies)
CREATE POLICY "Students can view own data" 
  ON students 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data" 
  ON students 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Recreate policy on schools table (1 policy)
CREATE POLICY "School users see own school"
  ON schools
  FOR SELECT
  USING (
    id IN (
      SELECT school_users.school_id 
      FROM school_users 
      WHERE school_users.user_id = auth.uid()
    )
  );


COMMIT;


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all school_id columns are now VARCHAR
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'schools' AND column_name = 'id')
    OR column_name = 'school_id'
  )
ORDER BY table_name, column_name;

-- Verify all policies are recreated
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    tablename = 'students'
    OR tablename = 'schools'
  )
ORDER BY tablename, policyname;

-- Verify BOTH foreign key constraints are recreated
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (
    (tc.table_name = 'students' AND kcu.column_name = 'school_id')
    OR (tc.table_name = 'school_users' AND kcu.column_name = 'school_id')
  )
ORDER BY tc.table_name;


-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
--
-- Query 1 should show:
-- - schools.id: character varying
-- - school_users.school_id: character varying
-- - student_assessments.school_id: character varying
-- - students.school_id: character varying
--
-- Query 2 should show:
-- - students | Students can update own data | UPDATE
-- - students | Students can view own data | SELECT
-- - schools | School users see own school | SELECT
--
-- Query 3 should show (2 rows):
-- - students | students_school_id_fkey | FOREIGN KEY | school_id | schools | id
-- - school_users | school_users_school_id_fkey | FOREIGN KEY | school_id | schools | id
--
-- =====================================================
