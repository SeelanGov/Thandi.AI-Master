# Step 2 Fix: Complete Cleanup Required

**Issue**: Schema migration failed because `admin_users` table already exists
**Root Cause**: Previous partial execution left some tables in database
**Solution**: Run complete cleanup, then retry schema migration

---

## 🔧 Fix: Run Complete Cleanup SQL

Copy and paste this SQL into Supabase SQL Editor and click "Run":

```sql
-- Complete cleanup of all admin dashboard tables
-- Run this FIRST before the schema migration

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS alert_configurations CASCADE;
DROP TABLE IF EXISTS system_health_checks CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS api_metrics CASCADE;
DROP TABLE IF EXISTS system_errors CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop the cleanup function if it exists
DROP FUNCTION IF EXISTS cleanup_old_monitoring_data() CASCADE;

-- Verify cleanup
SELECT 'Cleanup complete - ready for schema migration' as status;
```

**Expected Result**: `Cleanup complete - ready for schema migration`

---

## ✅ After Cleanup Succeeds

Now run the schema migration again:

1. Open `supabase/migrations/20260119_admin_dashboard_schema.sql`
2. Copy ALL the SQL (Ctrl+A, Ctrl+C)
3. Paste into SQL Editor (Ctrl+V)
4. Click "Run"
5. Should see: `Success. No rows returned`

---

## 📋 Then Verify Tables Were Created

Run this verification query:

```sql
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

**Expected**: 8 rows showing all table names

---

**Let's get this cleaned up and try again! 🚀**
