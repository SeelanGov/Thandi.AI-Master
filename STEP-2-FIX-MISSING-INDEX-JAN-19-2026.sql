-- Step 2 Fix: Create the missing index
-- Only run this if Step 2 verification shows all 8 tables exist
-- This creates the one index that failed

-- Create the missing index
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user ON admin_audit_log(admin_user_id);

-- Verify it was created
SELECT 
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'admin_audit_log'
ORDER BY indexname;

-- Expected: 2 indexes
-- - idx_audit_log_admin_user
-- - idx_audit_log_created_at
