-- Step 2 Verification Query
-- Run this in Supabase SQL Editor to check what was created

-- Check which tables exist
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'admin_users',
  'system_errors',
  'api_metrics',
  'user_activity',
  'system_health_checks',
  'alert_configurations',
  'alert_history',
  'admin_audit_log'
)
ORDER BY table_name;

-- Expected: 8 rows (all tables)
-- If you see all 8 tables, proceed to Step 3
-- If you see fewer than 8 tables, we need to create the missing ones
