# Step 3: Clean Up and Re-Run Schema Migration

**Date**: January 19, 2026  
**Issue**: Index `idx_audit_log_created_at` already exists  
**Root Cause**: Previous transaction created index before rolling back

---

## 🔍 What's Happening

The error shows that an **index** already exists, even though the verification query showed NO tables exist. This happens when:
1. A previous SQL execution created some indexes
2. The transaction rolled back (so tables weren't created)
3. But the index creation wasn't fully rolled back

---

## ✅ SOLUTION: Drop All Indexes First

Run this SQL in Supabase SQL Editor:

```sql
-- Drop all admin dashboard indexes (if they exist)
DROP INDEX IF EXISTS idx_system_errors_created_at;
DROP INDEX IF EXISTS idx_system_errors_error_type;
DROP INDEX IF EXISTS idx_system_errors_school_id;
DROP INDEX IF EXISTS idx_system_errors_user_id;
DROP INDEX IF EXISTS idx_system_errors_feature_area;
DROP INDEX IF EXISTS idx_system_errors_resolved;
DROP INDEX IF EXISTS idx_api_metrics_created_at;
DROP INDEX IF EXISTS idx_api_metrics_endpoint;
DROP INDEX IF EXISTS idx_api_metrics_response_time;
DROP INDEX IF EXISTS idx_api_metrics_status_code;
DROP INDEX IF EXISTS idx_user_activity_created_at;
DROP INDEX IF EXISTS idx_user_activity_event_type;
DROP INDEX IF EXISTS idx_user_activity_user_id;
DROP INDEX IF EXISTS idx_user_activity_school_id;
DROP INDEX IF EXISTS idx_health_checks_created_at;
DROP INDEX IF EXISTS idx_health_checks_component;
DROP INDEX IF EXISTS idx_health_checks_status;
DROP INDEX IF EXISTS idx_alert_history_triggered_at;
DROP INDEX IF EXISTS idx_alert_history_status;
DROP INDEX IF EXISTS idx_alert_history_severity;
DROP INDEX IF EXISTS idx_audit_log_created_at;
DROP INDEX IF EXISTS idx_audit_log_admin_user;

-- Drop all admin dashboard tables (if they exist)
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS alert_configurations CASCADE;
DROP TABLE IF EXISTS system_health_checks CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS api_metrics CASCADE;
DROP TABLE IF EXISTS system_errors CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop the cleanup function (if it exists)
DROP FUNCTION IF EXISTS cleanup_old_monitoring_data();
```

**Expected Result**: `Success. No rows returned`

---

## 📋 After Running Cleanup

Now run the schema migration again:

1. **Copy ALL contents** of `supabase/migrations/20260119_admin_dashboard_schema.sql`
2. **Paste into Supabase SQL Editor**
3. **Click "Run"**

**Expected Result**: `Success. No rows returned` (this is GOOD - CREATE statements don't return rows)

---

## ✅ Verify Success

Run this verification query:

```sql
-- Check all tables were created
SELECT table_name 
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
```

**Expected Result**: 8 rows showing all table names

---

## 🎯 Next Steps After Success

1. Run cleanup migration: `supabase/migrations/20260119_admin_dashboard_cleanup.sql`
2. Run `npm run admin:verify` locally
3. Run `npm run admin:seed` with ADMIN_PASSWORD env var

---

**This will completely clean the database and allow a fresh schema creation.**
