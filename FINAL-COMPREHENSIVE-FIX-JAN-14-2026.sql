-- =====================================================
-- FINAL COMPREHENSIVE FIX - All tables with school_id
-- Date: January 14, 2026
-- Fixes ALL tables that have school_id column type issues
-- =====================================================

-- ============================================
-- PART 1: FIX student_assessments table
-- ============================================

-- Drop ALL policies on student_assessments
DROP POLICY IF EXISTS "school_isolation_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments;
DROP POLICY IF EXISTS "Enable read access for all users" ON student_assessments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON student_assessments;

-- Disable RLS
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Drop constraints and indexes
ALTER TABLE student_assessments DROP CONSTRAINT IF EXISTS student_assessments_school_id_fkey;
DROP INDEX IF EXISTS idx_student_assessments_school_id;

-- Change column type
ALTER TABLE student_assessments ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Recreate foreign key and index
ALTER TABLE student_assessments ADD CONSTRAINT student_assessments_school_id_fkey FOREIGN KEY (school_id) REFERENCES school_master(school_id);
CREATE INDEX idx_student_assessments_school_id ON student_assessments(school_id);

-- Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;

-- Recreate essential policies
CREATE POLICY "schools_view_own_student_assessments" ON student_assessments FOR SELECT USING (student_profile_id IS NOT NULL AND EXISTS (SELECT 1 FROM school_students ss JOIN school_master sm ON sm.school_id = ss.school_id WHERE ss.student_id = student_assessments.student_profile_id AND ss.consent_given = true AND ss.status = 'active' AND sm.status = 'claimed' AND sm.claimed_by_school_uuid = auth.uid()));

CREATE POLICY "schools_insert_student_assessments" ON student_assessments FOR INSERT WITH CHECK (student_profile_id IS NOT NULL AND EXISTS (SELECT 1 FROM school_students ss JOIN school_master sm ON sm.school_id = ss.school_id WHERE ss.student_id = student_assessments.student_profile_id AND ss.consent_given = true AND ss.status = 'active' AND sm.status = 'claimed' AND sm.claimed_by_school_uuid = auth.uid()));

CREATE POLICY "service_role_assessments_all" ON student_assessments FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- PART 2: FIX recommendations table (if it exists)
-- ============================================

-- Drop ALL policies on recommendations
DROP POLICY IF EXISTS "school_isolation_recommendations" ON recommendations;
DROP POLICY IF EXISTS "schools_view_own_recommendations" ON recommendations;
DROP POLICY IF EXISTS "schools_insert_recommendations" ON recommendations;
DROP POLICY IF EXISTS "service_role_recommendations_all" ON recommendations;

-- Disable RLS
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;

-- Drop constraints and indexes
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_school_id_fkey;
DROP INDEX IF EXISTS idx_recommendations_school_id;

-- Change column type
ALTER TABLE recommendations ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

-- Recreate foreign key and index
ALTER TABLE recommendations ADD CONSTRAINT recommendations_school_id_fkey FOREIGN KEY (school_id) REFERENCES school_master(school_id);
CREATE INDEX idx_recommendations_school_id ON recommendations(school_id);

-- Re-enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Recreate basic policies (adjust as needed)
CREATE POLICY "service_role_recommendations_all" ON recommendations FOR ALL USING (auth.role() = 'service_role');

-- Done!
