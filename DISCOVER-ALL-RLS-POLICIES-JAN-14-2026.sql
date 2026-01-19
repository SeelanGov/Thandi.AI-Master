-- ============================================================================
-- DISCOVER ALL RLS POLICIES ON AFFECTED TABLES
-- Date: January 14, 2026
-- Purpose: Find ALL RLS policies that depend on school_id columns
-- 
-- CRITICAL: Phase 3 failed because of a 4th policy we didn't know about!
-- Error: "policy school_isolation_assessments on table student_assessments 
--         depends on column school_id"
-- ============================================================================

-- Query: Find ALL RLS policies on ALL affected tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('students', 'schools', 'student_assessments', 'school_users')
ORDER BY tablename, policyname;

-- ============================================================================
-- WHAT TO EXPECT:
-- ============================================================================
-- We already know about 3 policies:
-- 1. "Students can view own record" on students
-- 2. "Students can update own record" on students  
-- 3. "Schools are viewable by everyone" on schools
--
-- But Phase 3 error revealed a 4th policy:
-- 4. "school_isolation_assessments" on student_assessments
--
-- This query will show us ALL policies so we can drop them ALL in Phase 1!
-- ============================================================================
