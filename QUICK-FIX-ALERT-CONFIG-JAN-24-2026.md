# 🚨 QUICK FIX: Alert Configuration SQL Error

**Issue**: The deployment guide had incorrect SQL - wrong table name and column names.

## ✅ CORRECTED SQL

The correct table is `admin_alert_configs` (not `alert_configurations`), and it doesn't have a `name` column.

**File to use**: `CORRECTED-ALERT-CONFIG-SQL-JAN-24-2026.sql`

## 📋 STEPS TO FIX

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Copy and Run the Corrected SQL
Open `CORRECTED-ALERT-CONFIG-SQL-JAN-24-2026.sql` and run it in Supabase.

### 3. Verify Success
You should see 4 alert configurations created:
- `database_connection_error` (critical)
- `high_error_rate` (high)
- `system_health_degraded` (high)
- `slow_api_response` (medium)

Each will have email notifications configured for:
- admin@thandi.online
- kiro@thandi.online

## 🎯 WHAT THIS DOES

The corrected SQL:
1. Creates 4 alert configurations with proper thresholds
2. Sets up email notifications in the `notification_channels` JSONB field
3. Uses `ON CONFLICT` to safely update if configs already exist
4. Includes verification query to confirm success

## ⏱️ TIME REMAINING: ~20 minutes

After running this SQL, proceed with deployment:
```bash
git add .
git commit -m "feat: complete admin dashboard deployment"
git push origin main
```

## 📊 SCHEMA REFERENCE

The `admin_alert_configs` table structure:
```sql
- id (UUID)
- alert_type (TEXT, UNIQUE) -- e.g., 'high_error_rate'
- enabled (BOOLEAN)
- threshold_value (NUMERIC) -- e.g., 10
- threshold_unit (TEXT) -- e.g., 'count', 'milliseconds'
- time_window (INTEGER) -- minutes
- severity (TEXT) -- 'low', 'medium', 'high', 'critical'
- notification_channels (JSONB) -- {"email": ["admin@thandi.online"]}
- metadata (JSONB) -- additional config
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔧 TO ADD MORE RECIPIENTS LATER

```sql
UPDATE admin_alert_configs
SET notification_channels = '{"email": ["admin@thandi.online", "kiro@thandi.online", "newperson@example.com"]}'::jsonb
WHERE alert_type = 'high_error_rate';
```

---

**Status**: Ready to run corrected SQL ✅
