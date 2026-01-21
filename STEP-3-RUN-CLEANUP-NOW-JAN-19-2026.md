# Step 3: Run Cleanup Migration

**Status**: ✅ Step 2 Complete - All 8 tables verified  
**Next**: Run cleanup migration to create data retention function

---

## 🎯 What You're Doing

Creating the `cleanup_old_monitoring_data()` function that will automatically delete old monitoring data to keep the database clean.

---

## 📋 Instructions

### 1. Open Supabase SQL Editor

Go to: **Supabase Dashboard → SQL Editor**

### 2. Copy This SQL

Open the file: `supabase/migrations/20260119_admin_dashboard_cleanup.sql`

Or copy this SQL directly:

```sql
-- Admin Dashboard Data Retention and Cleanup
-- Created: January 19, 2026
-- Purpose: Automated cleanup of old monitoring data

-- Automated cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void AS $
BEGIN
  -- Delete errors older than 90 days
  DELETE FROM system_errors
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Delete metrics older than 30 days
  DELETE FROM api_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete activity older than 180 days
  DELETE FROM user_activity
  WHERE created_at < NOW() - INTERVAL '180 days';
  
  -- Delete health checks older than 7 days
  DELETE FROM system_health_checks
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete resolved alerts older than 30 days
  DELETE FROM alert_history
  WHERE status = 'resolved'
  AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Log cleanup statistics
  INSERT INTO admin_audit_log (action, metadata)
  VALUES ('automated_cleanup', jsonb_build_object(
    'timestamp', NOW(),
    'tables_cleaned', ARRAY['system_errors', 'api_metrics', 'user_activity', 'system_health_checks', 'alert_history']
  ));
END;
$ LANGUAGE plpgsql;
```

### 3. Run the SQL

1. Paste the SQL into Supabase SQL Editor
2. Click **"Run"**
3. Wait for success message

### 4. Expected Result

You should see:
```
Success. No rows returned
```

This is correct! The function was created successfully.

---

## ✅ Verification

After running, test the function works:

```sql
-- Test the cleanup function
SELECT cleanup_old_monitoring_data();
```

Expected: Function executes without errors (returns nothing, which is correct)

---

## 📝 What This Does

The function will:
- Delete system errors older than 90 days
- Delete API metrics older than 30 days  
- Delete user activity older than 180 days
- Delete health checks older than 7 days
- Delete resolved alerts older than 30 days
- Log the cleanup action to admin_audit_log

**Note**: You can schedule this to run automatically using Supabase cron jobs later.

---

## 🎯 Next Steps

After this completes successfully:

1. ✅ Install dependencies locally: `npm install`
2. ✅ Run verification script: `npm run admin:verify`
3. ✅ Seed admin user: `npm run admin:seed`
4. ✅ Save the generated API key

---

**Ready?** Copy the SQL above and run it in Supabase SQL Editor!
