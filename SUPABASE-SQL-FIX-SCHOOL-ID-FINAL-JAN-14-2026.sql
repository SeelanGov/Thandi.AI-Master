-- =====================================================
-- FINAL FIX: STUDENT_ASSESSMENTS SCHOOL_ID TYPE
-- Date: January 14, 2026
-- Purpose: Change school_id from UUID to VARCHAR(50)
-- CORRECTED: Fixed DO block syntax errors
-- =====================================================

-- =====================================================
-- STEP 1: DROP RLS POLICIES ON STUDENT_ASSESSMENTS
-- =====================================================

DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments;

-- =====================================================
-- STEP 2: ALTER COLUMN TYPE
-- =====================================================

ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- =====================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINT
-- =====================================================

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

-- =====================================================
-- STEP 4: RECREATE INDEX
-- =====================================================

DROP INDEX IF EXISTS idx_student_assessments_school_id;
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- =====================================================
-- STEP 5: RECREATE RLS POLICIES
-- =====================================================

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

-- =====================================================
-- STEP 6: VERIFY THE FIX
-- =====================================================

DO $$
DECLARE
  v_data_type TEXT;
  v_has_fk BOOLEAN;
BEGIN
  -- Check column type
  SELECT data_type INTO v_data_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF v_data_type = 'character varying' THEN
    RAISE NOTICE '✅ SUCCESS: student_assessments.school_id changed to VARCHAR';
  ELSE
    RAISE EXCEPTION '❌ FAILED: student_assessments.school_id is still %', v_data_type;
  END IF;
  
  -- Check foreign key
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_assessments_school_id_fkey'
    AND table_name = 'student_assessments'
  ) INTO v_has_fk;
  
  IF v_has_fk THEN
    RAISE NOTICE '✅ SUCCESS: Foreign key constraint added';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Foreign key constraint not created';
  END IF;
  
  -- Check RLS policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_assessments' 
    AND policyname = 'schools_view_own_student_assessments'
  ) THEN
    RAISE NOTICE '✅ SUCCESS: RLS policies recreated';
  ELSE
    RAISE EXCEPTION '❌ FAILED: RLS policies not recreated';
  END IF;
  
  RAISE NOTICE '🎉 MIGRATION COMPLETE: All checks passed!';
END $$;

-- =====================================================
-- STEP 7: AUDIT LOG ENTRY
-- =====================================================

INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'SCHEMA_FIX_SCHOOL_ID_TYPE', 
  'student_assessments', 
  jsonb_build_object(
    'migration_date', NOW(),
    'changed_from', 'UUID',
    'changed_to', 'VARCHAR(50)',
    'reason', 'Fix type mismatch with school_master.school_id',
    'rls_policies_recreated', 3,
    'foreign_keys_added', 1
  ),
  NOW()
);
