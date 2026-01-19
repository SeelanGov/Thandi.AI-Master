-- ============================================================================
-- ULTIMATE FINAL SCHOOL ID FIX
-- Date: January 14, 2026
-- Purpose: Fix school_id type mismatch (UUID → VARCHAR) with CORRECT ORDER
-- 
-- CRITICAL: This fix changes child columns BEFORE parent column!
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: DROP RLS POLICIES (3 policies)
-- ============================================================================
DO $$
BEGIN
    -- Drop students policies
    DROP POLICY IF EXISTS "Students can view own record" ON students;
    DROP POLICY IF EXISTS "Students can update own record" ON students;
    
    -- Drop schools policy
    DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;
    
    RAISE NOTICE 'Phase 1 Complete: Dropped 3 RLS policies';
END $$;

-- ============================================================================
-- PHASE 2: DROP FOREIGN KEY CONSTRAINTS (2 constraints)
-- ============================================================================
DO $$
BEGIN
    -- Drop foreign key from students table
    ALTER TABLE students 
    DROP CONSTRAINT IF EXISTS students_school_id_fkey;
    
    -- Drop foreign key from school_users table
    ALTER TABLE school_users 
    DROP CONSTRAINT IF EXISTS school_users_school_id_fkey;
    
    RAISE NOTICE 'Phase 2 Complete: Dropped 2 foreign key constraints';
END $$;

-- ============================================================================
-- PHASE 3: CHANGE CHILD COLUMNS FIRST (3 columns)
-- CRITICAL: Change these BEFORE changing schools.id!
-- ============================================================================
DO $$
BEGIN
    -- Change school_users.school_id from UUID to VARCHAR
    ALTER TABLE school_users 
    ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
    
    -- Change student_assessments.school_id from UUID to VARCHAR
    ALTER TABLE student_assessments 
    ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
    
    -- Change students.school_id from UUID to VARCHAR
    ALTER TABLE students 
    ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
    
    RAISE NOTICE 'Phase 3 Complete: Changed 3 child columns to VARCHAR';
END $$;

-- ============================================================================
-- PHASE 4: CHANGE PARENT COLUMN LAST (schools.id)
-- CRITICAL: This must happen AFTER child columns are changed!
-- ============================================================================
DO $$
BEGIN
    -- Change schools.id from UUID to VARCHAR
    ALTER TABLE schools 
    ALTER COLUMN id TYPE VARCHAR(255) USING id::TEXT;
    
    RAISE NOTICE 'Phase 4 Complete: Changed schools.id to VARCHAR';
END $$;

-- ============================================================================
-- PHASE 5: RECREATE FOREIGN KEY CONSTRAINTS (2 constraints)
-- Now both sides are VARCHAR, so this will work!
-- ============================================================================
DO $$
BEGIN
    -- Recreate foreign key for students table
    ALTER TABLE students 
    ADD CONSTRAINT students_school_id_fkey 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
    
    -- Recreate foreign key for school_users table
    ALTER TABLE school_users 
    ADD CONSTRAINT school_users_school_id_fkey 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Phase 5 Complete: Recreated 2 foreign key constraints';
END $$;

-- ============================================================================
-- PHASE 6: RECREATE RLS POLICIES (3 policies)
-- ============================================================================
DO $$
BEGIN
    -- Recreate students policies
    CREATE POLICY "Students can view own record" ON students
        FOR SELECT
        USING (auth.uid() = id);
    
    CREATE POLICY "Students can update own record" ON students
        FOR UPDATE
        USING (auth.uid() = id);
    
    -- Recreate schools policy
    CREATE POLICY "Schools are viewable by everyone" ON schools
        FOR SELECT
        USING (true);
    
    RAISE NOTICE 'Phase 6 Complete: Recreated 3 RLS policies';
END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================
DO $$
DECLARE
    schools_id_type TEXT;
    students_school_id_type TEXT;
    school_users_school_id_type TEXT;
    student_assessments_school_id_type TEXT;
BEGIN
    -- Check schools.id type
    SELECT data_type INTO schools_id_type
    FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'id';
    
    -- Check students.school_id type
    SELECT data_type INTO students_school_id_type
    FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'school_id';
    
    -- Check school_users.school_id type
    SELECT data_type INTO school_users_school_id_type
    FROM information_schema.columns
    WHERE table_name = 'school_users' AND column_name = 'school_id';
    
    -- Check student_assessments.school_id type
    SELECT data_type INTO student_assessments_school_id_type
    FROM information_schema.columns
    WHERE table_name = 'student_assessments' AND column_name = 'school_id';
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'VERIFICATION RESULTS:';
    RAISE NOTICE 'schools.id type: %', schools_id_type;
    RAISE NOTICE 'students.school_id type: %', students_school_id_type;
    RAISE NOTICE 'school_users.school_id type: %', school_users_school_id_type;
    RAISE NOTICE 'student_assessments.school_id type: %', student_assessments_school_id_type;
    RAISE NOTICE '=========================================';
    
    IF schools_id_type = 'character varying' AND 
       students_school_id_type = 'character varying' AND
       school_users_school_id_type = 'character varying' AND
       student_assessments_school_id_type = 'character varying' THEN
        RAISE NOTICE '✅ SUCCESS: All columns are now VARCHAR!';
    ELSE
        RAISE EXCEPTION '❌ FAILED: Some columns are still not VARCHAR';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ULTIMATE FIX COMPLETE! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE 'All school_id columns have been successfully changed to VARCHAR!';
    RAISE NOTICE 'Foreign keys have been recreated with matching types.';
    RAISE NOTICE 'RLS policies have been restored.';
    RAISE NOTICE '';
    RAISE NOTICE 'The registration system should now work correctly!';
END $$;
