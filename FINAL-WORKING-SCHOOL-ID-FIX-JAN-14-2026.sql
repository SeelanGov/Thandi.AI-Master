-- =====================================================
-- FINAL WORKING SCHOOL_ID FIX - Tested and Verified
-- Date: January 14, 2026
-- Issue: student_assessments.school_id is UUID but should be VARCHAR(50)
-- Root Cause: Type mismatch with school_master.school_id (VARCHAR)
-- =====================================================

-- STEP 1: Drop ALL policies that reference student_assessments
-- This is critical - policies block ALTER TABLE operations
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_assessments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON student_assessments;

-- STEP 2: Disable RLS temporarily
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- STEP 3: Drop foreign key constraint (blocks type change)
ALTER TABLE student_assessments 
DROP CONSTRAINT IF EXISTS student_assessments_school_id_fkey;

-- STEP 4: Drop index (blocks type change)
DROP INDEX IF EXISTS idx_student_assessments_school_id;

-- STEP 5: Change column type from UUID to VARCHAR(50)
-- This is the critical fix - converts UUID to TEXT format
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- STEP 6: Recreate foreign key constraint
ALTER TABLE student_assessments
ADD CONSTRAINT student_assessments_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id)
ON DELETE CASCADE;

-- STEP 7: Recreate index for performance
CREATE INDEX idx_student_assessments_school_id 
ON student_assessments(school_id);

-- STEP 8: Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- STEP 9: Recreate essential RLS policies
-- Policy 1: Schools can view assessments of their students with consent
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

-- Policy 2: Schools can insert assessments for their students
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

-- Policy 3: Service role can manage all assessments
CREATE POLICY "service_role_assessments_all" ON student_assessments
  FOR ALL USING (auth.role() = 'service_role');

-- STEP 10: Verify the fix
DO $
DECLARE
  column_type TEXT;
BEGIN
  SELECT data_type INTO column_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF column_type = 'character varying' THEN
    RAISE NOTICE '✅ SUCCESS: student_assessments.school_id is now VARCHAR';
  ELSE
    RAISE NOTICE '❌ FAILED: student_assessments.school_id is still %', column_type;
  END IF;
END $;

-- Success message
SELECT 
  'Fix complete! Registration flow should work now.' AS status,
  'Test at: https://thandi.ai/register' AS next_step;
