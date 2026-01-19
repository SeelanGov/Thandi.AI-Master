-- =====================================================
-- ULTIMATE SCHOOL ID FIX - Complete Discovery & Fix
-- Date: January 14, 2026
-- Approach: Discover ALL policies, drop them, fix type, recreate
-- =====================================================

-- ============================================
-- STEP 1: DISCOVER ALL TABLES WITH school_id
-- ============================================
-- Run this first to see what we're dealing with
-- Expected: student_assessments, recommendations, possibly others

SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- STEP 2: DISCOVER ALL POLICIES ON student_assessments
-- ============================================
-- This will show us EVERY policy that exists

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
WHERE tablename = 'student_assessments'
ORDER BY policyname;

-- ============================================
-- STEP 3: DISCOVER ALL POLICIES ON recommendations
-- ============================================

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
WHERE tablename = 'recommendations'
ORDER BY policyname;

-- ============================================
-- STEP 4: FIX student_assessments
-- ============================================

-- Drop EVERY policy (add more if Step 2 shows additional ones)
DROP POLICY IF EXISTS "school_isolation_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_assessments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON student_assessments;

-- Disable RLS
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Drop constraints and indexes
ALTER TABLE student_assessments DROP CONSTRAINT IF EXISTS student_assessments_school_id_fkey;
DROP INDEX IF EXISTS idx_student_assessments_school_id;

-- Change column type from UUID to VARCHAR(50)
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Recreate foreign key and index
ALTER TABLE student_assessments 
ADD CONSTRAINT student_assessments_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

CREATE INDEX idx_student_assessments_school_id 
ON student_assessments(school_id);

-- Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Recreate essential policies (from original RLS migration)
CREATE POLICY "schools_view_own_student_assessments" ON student_assessments
  FOR SELECT USING (
    student_profile_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM school_students ss 
      JOIN school_master sm ON sm.school_id = ss.school_id
      WHERE ss.student_id = student_assessments.student_profile_id
      AND ss.consent_given = true 
      AND ss.status = 'active'
      AND sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

CREATE POLICY "schools_insert_student_assessments" ON student_assessments
  FOR INSERT WITH CHECK (
    student_profile_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM school_students ss 
      JOIN school_master sm ON sm.school_id = ss.school_id
      WHERE ss.student_id = student_assessments.student_profile_id
      AND ss.consent_given = true 
      AND ss.status = 'active'
      AND sm.status = 'claimed' 
      AND sm.claimed_by_school_uuid = auth.uid()
    )
  );

CREATE POLICY "service_role_assessments_all" ON student_assessments
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: FIX recommendations (if it exists)
-- ============================================

-- Drop EVERY policy (add more if Step 3 shows additional ones)
DROP POLICY IF EXISTS "school_isolation_recommendations" ON recommendations;
DROP POLICY IF EXISTS "schools_view_own_recommendations" ON recommendations;
DROP POLICY IF EXISTS "schools_insert_recommendations" ON recommendations;
DROP POLICY IF EXISTS "service_role_recommendations_all" ON recommendations;

-- Disable RLS
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;

-- Drop constraints and indexes
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_school_id_fkey;
DROP INDEX IF EXISTS idx_recommendations_school_id;

-- Change column type from UUID to VARCHAR(50)
ALTER TABLE recommendations 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Recreate foreign key and index
ALTER TABLE recommendations 
ADD CONSTRAINT recommendations_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

CREATE INDEX idx_recommendations_school_id 
ON recommendations(school_id);

-- Re-enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Recreate basic policy
CREATE POLICY "service_role_recommendations_all" ON recommendations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

-- Verify the fix worked
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
  AND table_name IN ('student_assessments', 'recommendations')
ORDER BY table_name;

-- Verify policies are recreated
SELECT 
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('student_assessments', 'recommendations')
ORDER BY tablename, policyname;

-- Done!
