-- Fix student_assessments.school_id column type
-- Migration: 20260114_fix_student_assessments_school_id.sql
-- Purpose: Change school_id from UUID to VARCHAR to match school_master.school_id

-- =====================================================
-- 1. ALTER COLUMN TYPE
-- =====================================================

-- Change school_id from UUID to VARCHAR(50) to match school_master
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Add foreign key constraint if not exists
DO $
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
END $;

-- =====================================================
-- 2. UPDATE INDEX
-- =====================================================

-- Recreate index if needed
DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- =====================================================
-- 3. AUDIT LOG
-- =====================================================

INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'SCHEMA_FIX_SCHOOL_ID', 
  'student_assessments', 
  jsonb_build_object(
    'change', 'school_id column type changed from UUID to VARCHAR(50)',
    'reason', 'Match school_master.school_id type for proper foreign key relationship',
    'migration_date', NOW()
  ),
  NOW()
);

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

-- Verify the column type is correct
DO $
DECLARE
  v_data_type TEXT;
BEGIN
  SELECT data_type INTO v_data_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF v_data_type != 'character varying' THEN
    RAISE EXCEPTION 'school_id column type is still %, expected character varying', v_data_type;
  END IF;
  
  RAISE NOTICE 'school_id column type successfully changed to VARCHAR';
END $;
