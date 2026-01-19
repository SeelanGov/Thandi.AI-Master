-- ============================================================================
-- COMPREHENSIVE RLS POLICY DISCOVERY
-- Date: January 14, 2026
-- Purpose: Find ALL RLS policies across ALL tables that reference school_id
-- 
-- CRITICAL: We need to find EVERY policy before we can execute the fix!
-- Previous attempts failed because we missed policies on recommendations table
-- ============================================================================

-- Query to find ALL RLS policies that reference school_id column
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
WHERE 
    -- Find policies where the condition (qual) mentions school_id
    qual LIKE '%school_id%'
    OR with_check LIKE '%school_id%'
ORDER BY tablename, policyname;

-- ============================================================================
-- EXPECTED OUTPUT FORMAT:
-- ============================================================================
-- schemaname | tablename | policyname | permissive | roles | cmd | qual | with_check
-- -----------+-----------+------------+------------+-------+-----+------+------------
-- public     | students  | policy1    | PERMISSIVE | {...} | ALL | ...  | ...
-- public     | schools   | policy2    | PERMISSIVE | {...} | ALL | ...  | ...
-- etc.
--
-- WHAT TO LOOK FOR:
-- - Count how many policies are returned
-- - Note which tables have policies
-- - Copy the policyname for each policy
-- - These ALL need to be dropped in Phase 1 of the fix!
-- ============================================================================
