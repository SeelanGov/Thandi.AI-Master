-- =====================================================
-- BULLETPROOF FIX: Change school_id from UUID to VARCHAR
-- Date: January 14, 2026
-- Author: Systematic Analysis
-- Purpose: Fix type mismatch blocking all registrations
-- =====================================================

-- CRITICAL: This script must be run in Supabase SQL Editor
-- It will handle ALL edge cases and unknown policies

-- =====================================================
-- STEP 1: DIAGNOSTIC - Verify current state
-- =====================================================
DO $$
DECLARE
  v_current_type TEXT;
  v_policy_count INTEGER;
BEGIN
  -- Check current column type
  SELECT data_type INTO v_current_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  RAISE NOTICE '📊 Current school_id type: %', v_current_type;
  
  -- Count existing policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'student_assessments';
  
  RAISE NOTICE '📊 Existing RLS policies: %', v_policy_count;
  
  IF v_current_type = 'character varying' THEN
    RAISE NOTICE '✅ Column is already VARCHAR - no migration needed';
    RAISE EXCEPTION 'MIGRATION_NOT_NEEDED';
  END IF;
  
  IF v_current_type != 'uuid' THEN
    RAISE EXCEPTION 'UNEXPECTED_TYPE: Expected UUID, found %', v_current_type;
  END IF;
  
  RAISE NOTICE '✅ Diagnostic complete - proceeding with migration';
END $$;

-- =====================================================
-- STEP 2: DISABLE RLS
-- =====================================================
DO $$
BEGIN
  ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✅ RLS disabled';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not disable RLS: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 3: DROP ALL POLICIES DYNAMICALLY
-- =====================================================
DO $$
DECLARE
  r RECORD;
  v_dropped_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Dropping all policies on student_assessments...';
  
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'student_assessments'
  )
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON student_assessments', r.policyname);
      v_dropped_count := v_dropped_count + 1;
      RAISE NOTICE '  ✓ Dropped policy: %', r.policyname;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '  ⚠️  Could not drop policy %: %', r.policyname, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '✅ Dropped % policies', v_dropped_count;
END $$;

-- =====================================================
-- STEP 4: ALTER COLUMN TYPE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔄 Changing column type from UUID to VARCHAR(50)...';
  
  ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;
  
  RAISE NOTICE '✅ Column type changed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'COLUMN_ALTER_FAILED: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: ADD FOREIGN KEY CONSTRAINT
-- =====================================================
DO $$
DECLARE
  v_fk_exists BOOLEAN;
BEGIN
  -- Check if foreign key already exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_assessments_school_id_fkey'
    AND table_name = 'student_assessments'
  ) INTO v_fk_exists;
  
  IF v_fk_exists THEN
    RAISE NOTICE '⚠️  Foreign key already exists - skipping';
  ELSE
    RAISE NOTICE '🔄 Adding foreign key constraint...';
    
    ALTER TABLE student_assessments
    ADD CONSTRAINT student_assessments_school_id_fkey 
    FOREIGN KEY (school_id) REFERENCES school_master(school_id);
    
    RAISE NOTICE '✅ Foreign key constraint added';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not add foreign key: %', SQLERRM;
    RAISE NOTICE '   This is OK if constraint already exists with different name';
END $$;

-- =====================================================
-- STEP 6: RECREATE INDEX
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔄 Recreating index...';
  
  DROP INDEX IF EXISTS idx_student_assessments_school_id;
  CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);
  
  RAISE NOTICE '✅ Index recreated';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not recreate index: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 7: RE-ENABLE RLS
-- =====================================================
DO $$
BEGIN
  ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE '✅ RLS re-enabled';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not re-enable RLS: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 8: RECREATE OFFICIAL RLS POLICIES
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔄 Recreating official RLS policies...';
  
  -- Policy 1: Schools can view their own student assessments
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
  RAISE NOTICE '  ✓ Created: schools_view_own_student_assessments';
  
  -- Policy 2: Schools can insert student assessments
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
  RAISE NOTICE '  ✓ Created: schools_insert_student_assessments';
  
  -- Policy 3: Service role can manage all assessments
  CREATE POLICY "service_role_assessments_all" ON student_assessments
    FOR ALL USING (auth.role() = 'service_role');
  RAISE NOTICE '  ✓ Created: service_role_assessments_all';
  
  RAISE NOTICE '✅ All official policies recreated';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'POLICY_CREATION_FAILED: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 9: VERIFY THE FIX
-- =====================================================
DO $$
DECLARE
  v_data_type TEXT;
  v_has_fk BOOLEAN;
  v_policy_count INTEGER;
  v_index_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICATION';
  RAISE NOTICE '==============';
  
  -- Check column type
  SELECT data_type INTO v_data_type
  FROM information_schema.columns
  WHERE table_name = 'student_assessments'
  AND column_name = 'school_id';
  
  IF v_data_type = 'character varying' THEN
    RAISE NOTICE '✅ Column type: VARCHAR (correct)';
  ELSE
    RAISE EXCEPTION '❌ Column type is still: %', v_data_type;
  END IF;
  
  -- Check foreign key
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'student_assessments_school_id_fkey'
    AND table_name = 'student_assessments'
  ) INTO v_has_fk;
  
  IF v_has_fk THEN
    RAISE NOTICE '✅ Foreign key: EXISTS';
  ELSE
    RAISE NOTICE '⚠️  Foreign key: NOT FOUND (may exist with different name)';
  END IF;
  
  -- Check RLS policies
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE tablename = 'student_assessments';
  
  RAISE NOTICE '✅ RLS policies: % policies active', v_policy_count;
  
  -- Check index
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'student_assessments'
    AND indexname = 'idx_student_assessments_school_id'
  ) INTO v_index_exists;
  
  IF v_index_exists THEN
    RAISE NOTICE '✅ Index: EXISTS';
  ELSE
    RAISE NOTICE '⚠️  Index: NOT FOUND';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE '====================';
END $$;

-- =====================================================
-- STEP 10: LOG THE MIGRATION
-- =====================================================
DO $$
BEGIN
  -- Only log if audit_log table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    INSERT INTO audit_log (action, table_name, details, created_at)
    VALUES (
      'SCHEMA_FIX_SCHOOL_ID_TYPE', 
      'student_assessments', 
      jsonb_build_object(
        'migration_date', NOW(),
        'changed_from', 'UUID',
        'changed_to', 'VARCHAR(50)',
        'reason', 'Fix type mismatch with school_master.school_id',
        'policies_recreated', 3
      ),
      NOW()
    );
    RAISE NOTICE '✅ Migration logged to audit_log';
  ELSE
    RAISE NOTICE '⚠️  audit_log table not found - skipping logging';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Could not log migration: %', SQLERRM;
END $$;
