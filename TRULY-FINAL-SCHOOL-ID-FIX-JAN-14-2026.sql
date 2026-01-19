-- ============================================================================
-- TRULY FINAL SCHOOL ID FIX
-- Date: January 14, 2026
-- Purpose: Fix school_id type mismatch (UUID → VARCHAR) with DIRECT statements
-- 
-- CRITICAL CHANGE: Using direct ALTER TABLE statements (no DO blocks)
-- This ensures type changes are immediately visible within the transaction
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: DROP RLS POLICIES (14 policies)
-- CRITICAL: Must drop ALL policies that depend on school_id column!
-- ============================================================================

-- Drop policies on consent_history table (2 policies)
DROP POLICY IF EXISTS "Schools can view student consent history" ON consent_history;
DROP POLICY IF EXISTS "schools_view_student_consent_history" ON consent_history;

-- Drop policies on recommendations table (1 policy)
DROP POLICY IF EXISTS "school_isolation_recommendations" ON recommendations;

-- Drop policies on school_students table (4 policies)
DROP POLICY IF EXISTS "school_relationships_policy" ON school_students;
DROP POLICY IF EXISTS "schools_insert_own_relationships" ON school_students;
DROP POLICY IF EXISTS "schools_update_own_relationships" ON school_students;
DROP POLICY IF EXISTS "schools_view_own_student_relationships" ON school_students;

-- Drop policies on student_assessments table (3 policies)
DROP POLICY IF EXISTS "school_isolation_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;

-- Drop policies on student_profiles table (4 policies)
DROP POLICY IF EXISTS "school_student_profiles_policy" ON student_profiles;
DROP POLICY IF EXISTS "schools_insert_own_students" ON student_profiles;
DROP POLICY IF EXISTS "schools_update_own_students" ON student_profiles;
DROP POLICY IF EXISTS "schools_view_own_students_with_consent" ON student_profiles;

-- ============================================================================
-- PHASE 2: DROP FOREIGN KEY CONSTRAINTS (2 constraints)
-- ============================================================================
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_school_id_fkey;
ALTER TABLE school_users DROP CONSTRAINT IF EXISTS school_users_school_id_fkey;

-- ============================================================================
-- PHASE 3: CHANGE CHILD COLUMNS FIRST (3 columns)
-- CRITICAL: Direct ALTER TABLE statements, no DO blocks!
-- ============================================================================
ALTER TABLE school_users 
ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

ALTER TABLE students 
ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- ============================================================================
-- PHASE 4: CHANGE PARENT COLUMN LAST (schools.id)
-- CRITICAL: This must happen AFTER child columns are changed!
-- ============================================================================
ALTER TABLE schools 
ALTER COLUMN id TYPE VARCHAR(255) USING id::TEXT;

-- ============================================================================
-- PHASE 5: RECREATE FOREIGN KEY CONSTRAINTS (2 constraints)
-- Now both sides are VARCHAR, so this will work!
-- ============================================================================
ALTER TABLE students 
ADD CONSTRAINT students_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE school_users 
ADD CONSTRAINT school_users_school_id_fkey 
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

-- ============================================================================
-- PHASE 6: RECREATE RLS POLICIES (14 policies)
-- CRITICAL: Must recreate ALL policies that were dropped in Phase 1!
-- Note: Policy conditions now use VARCHAR instead of UUID where applicable
-- ============================================================================

-- Recreate policies on consent_history table (2 policies)
CREATE POLICY "Schools can view student consent history" ON consent_history
    FOR SELECT
    USING (
        (school_id)::text IN (
            SELECT school_students.school_id
            FROM school_students
            WHERE ((school_students.student_id = consent_history.student_profile_id) 
                AND (school_students.consent_given = true))
        )
    );

CREATE POLICY "schools_view_student_consent_history" ON consent_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (consent_history.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

-- Recreate policies on recommendations table (1 policy)
-- Note: Changed from ::uuid to ::VARCHAR to match new column type
CREATE POLICY "school_isolation_recommendations" ON recommendations
    FOR ALL
    USING (
        assessment_id IN (
            SELECT student_assessments.id
            FROM student_assessments
            WHERE (student_assessments.school_id = (current_setting('app.current_school_id'::text))::VARCHAR)
        )
    );

-- Recreate policies on school_students table (4 policies)
CREATE POLICY "school_relationships_policy" ON school_students
    FOR SELECT
    USING (
        (school_id)::text IN (
            SELECT sm.school_id
            FROM school_master sm
            WHERE (((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_insert_own_relationships" ON school_students
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (school_students.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_update_own_relationships" ON school_students
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (school_students.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_view_own_student_relationships" ON school_students
    FOR SELECT
    USING (
        (EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (school_students.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )) 
        AND (consent_given = true) 
        AND ((status)::text = 'active'::text)
    );

-- Recreate policies on student_assessments table (3 policies)
-- Note: Changed from ::uuid to ::VARCHAR to match new column type
CREATE POLICY "school_isolation_assessments" ON student_assessments
    FOR ALL
    USING (school_id = (current_setting('app.current_school_id'::text))::VARCHAR);

CREATE POLICY "schools_insert_student_assessments" ON student_assessments
    FOR INSERT
    WITH CHECK (
        (student_profile_id IS NOT NULL) 
        AND (EXISTS (
            SELECT 1
            FROM (school_students ss
                JOIN school_master sm ON (((sm.school_id)::text = (ss.school_id)::text)))
            WHERE ((ss.student_id = student_assessments.student_profile_id) 
                AND (ss.consent_given = true) 
                AND ((ss.status)::text = 'active'::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        ))
    );

CREATE POLICY "schools_view_own_student_assessments" ON student_assessments
    FOR SELECT
    USING (
        (student_profile_id IS NOT NULL) 
        AND (EXISTS (
            SELECT 1
            FROM (school_students ss
                JOIN school_master sm ON (((sm.school_id)::text = (ss.school_id)::text)))
            WHERE ((ss.student_id = student_assessments.student_profile_id) 
                AND (ss.consent_given = true) 
                AND ((ss.status)::text = 'active'::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        ))
    );

-- Recreate policies on student_profiles table (4 policies)
CREATE POLICY "school_student_profiles_policy" ON student_profiles
    FOR SELECT
    USING (
        (school_id)::text IN (
            SELECT sm.school_id
            FROM school_master sm
            WHERE (((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_insert_own_students" ON student_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (student_profiles.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_update_own_students" ON student_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (student_profiles.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )
    );

CREATE POLICY "schools_view_own_students_with_consent" ON student_profiles
    FOR SELECT
    USING (
        (EXISTS (
            SELECT 1
            FROM school_master sm
            WHERE (((sm.school_id)::text = (student_profiles.school_id)::text) 
                AND ((sm.status)::text = 'claimed'::text) 
                AND (sm.claimed_by_school_uuid = auth.uid()))
        )) 
        AND (consent_given = true) 
        AND ((data_retention_date IS NULL) OR (data_retention_date > now())) 
        AND (anonymized = false)
    );

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
    RAISE NOTICE '🎉 TRULY FINAL FIX COMPLETE! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE 'All school_id columns have been successfully changed to VARCHAR!';
    RAISE NOTICE 'Foreign keys have been recreated with matching types.';
    RAISE NOTICE 'RLS policies have been restored.';
    RAISE NOTICE '';
    RAISE NOTICE 'The registration system should now work correctly!';
END $$;
