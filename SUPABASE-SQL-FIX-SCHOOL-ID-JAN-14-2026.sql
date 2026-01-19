-- =====================================================
-- FIX STUDENT_ASSESSMENTS SCHOOL_ID COLUMN TYPE
-- Date: January 14, 2026
-- Purpose: Change school_id from UUID to VARCHAR(50)
-- =====================================================

-- Step 1: Change column type from UUID to VARCHAR(50)
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Step 2: Add foreign key constraint to school_master
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

-- Step 3: Recreate index
DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Step 4: Verify the fix
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
