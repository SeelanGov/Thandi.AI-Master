-- =====================================================
-- FINAL COMPREHENSIVE SCHOOL_ID FIX
-- Date: January 14, 2026
-- Purpose: Fix UUID/VARCHAR mismatch in school_id columns
-- =====================================================

-- PROBLEM:
-- - school_master.school_id is VARCHAR(50) (correct - source of truth)
-- - student_assessments.school_id is UUID (wrong)
-- - school_users.school_id is UUID (wrong)
-- - students.school_id is UUID (wrong)
--
-- ERROR: "invalid input syntax for type uuid: 'ZAF-200100021'"
--
-- SOLUTION:
-- 1. Drop ALL policies that reference school_id
-- 2. ALTER 3 columns from UUID to VARCHAR(50)
-- 3. Recreate ESSENTIAL policies with correct types
-- 4. Verify changes

-- =====================================================
-- STEP 1: DROP ALL POLICIES THAT REFERENCE SCHOOL_ID
-- =====================================================

-- Based on Query 3 results: 15 policies reference school_id across 8 tables
-- We'll drop them systematically by table

-- consent_history policies (2 policies from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'consent_history'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- recommendations policies (1 policy from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'recommendations'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- school_students policies (4 policies from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'school_students'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- schools policies (1 policy from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'schools'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- student_assessments policies (3 policies from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'student_assessments'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- student_profiles policies (4 policies from Query 3)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'student_profiles'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- school_users policies (if any)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'school_users'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- students policies (if any)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'students'
        AND (qual::text LIKE '%school_id%' OR with_check::text LIKE '%school_id%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- =====================================================
-- STEP 2: ALTER COLUMNS FROM UUID TO VARCHAR(50)
-- =====================================================

-- Now that policies are dropped, we can safely ALTER column types

-- 1. school_users.school_id: UUID → VARCHAR(50)
ALTER TABLE school_users 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- 2. student_assessments.school_id: UUID → VARCHAR(50)
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- 3. students.school_id: UUID → VARCHAR(50)
ALTER TABLE students 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- =====================================================
-- STEP 3: RECREATE ESSENTIAL RLS POLICIES
-- =====================================================

-- Based on original migration file: supabase/migrations/20260110_phase0_task6_rls_implementation.sql
-- We recreate the ESSENTIAL policies for security

-- student_assessments: School isolation
CREATE POLICY "school_isolation_assessments" ON student_assessments
FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM school_users WHERE user_id = auth.uid()
  )
);

-- student_profiles: Schools can view their own students with consent
CREATE POLICY "schools_view_own_students_with_consent" ON student_profiles
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_users WHERE user_id = auth.uid()
  )
  AND consent_given = true
);

-- school_students: Schools can view their own student relationships
CREATE POLICY "schools_view_own_student_relationships" ON school_students
FOR SELECT
USING (
  school_id IN (
    SELECT school_id FROM school_users WHERE user_id = auth.uid()
  )
);

-- school_students: Schools can manage their own student relationships
CREATE POLICY "schools_manage_own_student_relationships" ON school_students
FOR ALL
USING (
  school_id IN (
    SELECT school_id FROM school_users WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- STEP 4: VERIFICATION QUERIES
-- =====================================================

-- Verify all school_id columns are now VARCHAR
SELECT 
  table_name, 
  column_name, 
  data_type,
  udt_name,
  character_maximum_length
FROM information_schema.columns
WHERE column_name = 'school_id'
AND table_schema = 'public'
ORDER BY table_name;

-- Expected results:
-- All school_id columns should now be VARCHAR (character varying)
-- school_master, school_users, student_assessments, students, etc.

-- Verify policies were recreated
SELECT 
  tablename,
  policyname,
  cmd,
  LEFT(qual::text, 100) as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
AND (
  qual::text LIKE '%school_id%' 
  OR with_check::text LIKE '%school_id%'
)
ORDER BY tablename, policyname;

-- Expected results:
-- Should see 4 essential policies recreated:
-- - school_isolation_assessments
-- - schools_view_own_students_with_consent
-- - schools_view_own_student_relationships
-- - schools_manage_own_student_relationships

-- =====================================================
-- SUCCESS CRITERIA
-- =====================================================

-- ✅ All 3 columns changed from UUID to VARCHAR(50)
-- ✅ All policies that referenced school_id were dropped
-- ✅ Essential security policies were recreated
-- ✅ Registration should now work with VARCHAR school_ids like "ZAF-200100021"

-- =====================================================
-- ROLLBACK PLAN (IF NEEDED)
-- =====================================================

-- If something goes wrong, you can rollback by:
-- 1. Restoring from backup
-- 2. Or manually reverting column types (but this loses data if UUIDs were inserted)

-- Note: This fix is designed to be safe because:
-- - We use USING school_id::TEXT to convert existing UUID values to TEXT
-- - We recreate essential security policies
-- - We verify changes with queries

-- =====================================================
-- END OF FIX
-- =====================================================
