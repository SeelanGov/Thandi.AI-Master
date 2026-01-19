-- =====================================================
-- FINAL FIX: Change school_id from UUID to VARCHAR
-- Date: January 14, 2026
-- Approach: Drop ALL dependencies, then alter column
-- =====================================================

-- Step 1: Drop ALL policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'student_assessments')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON student_assessments', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- Step 2: Disable RLS
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Step 3: Alter the column type
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Step 4: Add foreign key
ALTER TABLE student_assessments
ADD CONSTRAINT student_assessments_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

-- Step 5: Recreate index
DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Step 6: Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate policies
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
