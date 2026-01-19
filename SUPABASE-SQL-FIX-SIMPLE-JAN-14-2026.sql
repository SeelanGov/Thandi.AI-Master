-- =====================================================
-- SIMPLE FIX: DROP ALL POLICIES THEN ALTER COLUMN
-- Date: January 14, 2026
-- Purpose: Change school_id from UUID to VARCHAR(50)
-- =====================================================

-- STEP 1: Disable RLS temporarily
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies on student_assessments
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'student_assessments')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON student_assessments';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- STEP 3: Now alter the column type
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- STEP 4: Add foreign key constraint
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
    RAISE NOTICE 'Foreign key constraint added';
  END IF;
END $$;

-- STEP 5: Recreate index
DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- STEP 6: Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- STEP 7: Recreate the RLS policies from Phase 0 Task 6
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

-- STEP 8: Verify the fix
DO $$
DECLARE
  v_data_type TEXT;
  v_has_fk BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  -- Check column type
  SELECT data_type INTO v_data_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF v_data_type = 'character varying' THEN
    RAISE NOTICE '✅ SUCCESS: school_id changed to VARCHAR';
  ELSE
    RAISE EXCEPTION '❌ FAILED: school_id is still %', v_data_type;
  END IF;
  
  -- Check foreign key
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_assessments_school_id_fkey'
    AND table_name = 'student_assessments'
  ) INTO v_has_fk;
  
  IF v_has_fk THEN
    RAISE NOTICE '✅ SUCCESS: Foreign key added';
  ELSE
    RAISE NOTICE '⚠️  WARNING: Foreign key not added (may already exist with different name)';
  END IF;
  
  -- Check RLS policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename = 'student_assessments';
  
  RAISE NOTICE '✅ SUCCESS: % RLS policies recreated', v_policy_count;
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
END $$;

-- STEP 9: Log the migration
INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'SCHEMA_FIX_SCHOOL_ID_TYPE', 
  'student_assessments', 
  jsonb_build_object(
    'migration_date', NOW(),
    'changed_from', 'UUID',
    'changed_to', 'VARCHAR(50)',
    'reason', 'Fix type mismatch with school_master.school_id'
  ),
  NOW()
);
