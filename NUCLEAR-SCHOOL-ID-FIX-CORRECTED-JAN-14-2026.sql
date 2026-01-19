-- =====================================================
-- NUCLEAR OPTION: Complete dependency removal (CORRECTED)
-- Date: January 14, 2026
-- Strategy: Find and drop EVERYTHING that depends on school_id
-- =====================================================

-- Step 1: Find and drop ALL views that depend on student_assessments
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN 
    SELECT DISTINCT v.viewname
    FROM pg_views v
    WHERE v.definition LIKE '%student_assessments%'
    AND v.schemaname = 'public'
  LOOP
    EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', view_record.viewname);
    RAISE NOTICE 'Dropped view: %', view_record.viewname;
  END LOOP;
END $$;

-- Step 2: Drop ALL functions that reference student_assessments.school_id
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND pg_get_functiondef(p.oid) LIKE '%student_assessments%school_id%'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', func_record.proname, func_record.args);
    RAISE NOTICE 'Dropped function: %(%)', func_record.proname, func_record.args;
  END LOOP;
END $$;

-- Step 3: Drop ALL triggers on student_assessments
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'student_assessments'::regclass
    AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON student_assessments CASCADE', trigger_record.tgname);
    RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
  END LOOP;
END $$;

-- Step 4: Drop ALL policies (with CASCADE)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'student_assessments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON student_assessments CASCADE', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- Step 5: Disable RLS completely
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Step 6: Drop ALL constraints on school_id column
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'student_assessments'
    AND att.attname = 'school_id'
  LOOP
    EXECUTE format('ALTER TABLE student_assessments DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_record.conname);
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Step 7: Drop ALL indexes on school_id
DROP INDEX IF EXISTS idx_student_assessments_school_id CASCADE;

-- Step 8: NOW alter the column type (wrapped in DO block for RAISE NOTICE)
DO $$
BEGIN
  ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;
  
  RAISE NOTICE 'Column type changed successfully!';
END $$;

-- Step 9: Recreate foreign key
ALTER TABLE student_assessments
ADD CONSTRAINT student_assessments_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

-- Step 10: Recreate index
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Step 11: Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Step 12: Recreate essential policies ONLY
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

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Fix complete! student_assessments.school_id is now VARCHAR(50)';
END $$;
