-- =====================================================
-- FIX STUDENT_ASSESSMENTS SCHOOL_ID COLUMN TYPE
-- WITH RLS POLICY HANDLING
-- Date: January 14, 2026
-- Purpose: Change school_id from UUID to VARCHAR(50)
-- =====================================================

-- Step 1: Drop the RLS policy that depends on school_id
DROP POLICY IF EXISTS school_isolation_assessments ON student_assessments;

-- Step 2: Change column type from UUID to VARCHAR(50)
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Step 3: Add foreign key constraint to school_master
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_assessments_school_id_fkey'
    AND table_name = 'student_assessments'
  ) THEN
    ALTER TABLE student_assessments
    ADD CONSTRAINT student_assessments_school_id_fkey 
    FOREIGN KEY (school_id) REFERENCES school_master(school_id);
  END IF;
END $$;

-- Step 4: Recreate index
DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Step 5: Recreate the RLS policy with the new column type
CREATE POLICY school_isolation_assessments ON student_assessments
  FOR ALL
  USING (
    school_id IN (
      SELECT school_id 
      FROM school_master 
      WHERE school_id = current_setting('app.current_school_id', true)
    )
  );

-- Step 6: Verify the fix
DO $$
DECLARE
  v_data_type TEXT;
BEGIN
  SELECT data_type INTO v_data_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF v_data_type = 'character varying' THEN
    RAISE NOTICE '✅ SUCCESS: school_id column type changed to VARCHAR';
  ELSE
    RAISE EXCEPTION '❌ FAILED: school_id column type is still %', v_data_type;
  END IF;
END $$;
