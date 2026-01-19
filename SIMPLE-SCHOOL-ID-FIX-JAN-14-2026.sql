-- =====================================================
-- SIMPLE SCHOOL_ID FIX - No complex queries
-- Date: January 14, 2026
-- Strategy: Drop policies, disable RLS, change type, recreate
-- =====================================================

-- Step 1: Drop all policies on student_assessments
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments CASCADE;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments CASCADE;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments CASCADE;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_assessments CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON student_assessments CASCADE;

-- Step 2: Disable RLS
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop foreign key constraint
ALTER TABLE student_assessments DROP CONSTRAINT IF EXISTS student_assessments_school_id_fkey CASCADE;

-- Step 4: Drop index
DROP INDEX IF EXISTS idx_student_assessments_school_id CASCADE;

-- Step 5: Change column type
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Step 6: Recreate foreign key
ALTER TABLE student_assessments
ADD CONSTRAINT student_assessments_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

-- Step 7: Recreate index
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Step 8: Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Step 9: Recreate essential policies
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

-- Success!
SELECT 'Fix complete! student_assessments.school_id is now VARCHAR(50)' AS status;
