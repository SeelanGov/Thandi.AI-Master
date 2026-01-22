# ADMIN SETUP GUIDE - STEP BY STEP
**Date**: January 22, 2026  
**Estimated Time**: 10 minutes  
**Difficulty**: Easy

---

## 📋 STEP 1: CREATE DATABASE TABLES (5 minutes)

### What You'll Do:
Run SQL in Supabase to create 9 admin dashboard tables.

### Instructions:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql
   - Or: Supabase Dashboard → Your Project → SQL Editor

2. **Copy the SQL**
   - Open the file: `STEP-1-CREATE-ADMIN-TABLES-JAN-22-2026.sql`
   - Select ALL the SQL code (Ctrl+A or Cmd+A)
   - Copy it (Ctrl+C or Cmd+C)

3. **Paste and Run**
   - In Supabase SQL Editor, paste the SQL
   - Click the "RUN" button (or press Ctrl+Enter)
   - Wait for execution to complete (~5-10 seconds)

4. **Verify Success**
   - Scroll to the bottom of the results
   - You should see a list of 9 tables:
     ```
     admin_activity_logs
     admin_alert_configs
     admin_alerts
     admin_api_keys
     admin_audit_log
     admin_errors
     admin_health_checks
     admin_performance_logs
     admin_users
     ```

### ✅ Success Criteria:
- No error messages in Supabase
- 9 tables listed in the verification query results
- All tables start with `admin_`

### ⚠️ If You See Errors:
- **"relation already exists"**: Tables already created, you're good!
- **"permission denied"**: Make sure you're logged into the correct Supabase project
- **"syntax error"**: Make sure you copied the entire SQL file

---

## 🎉 WHAT YOU JUST CREATED

### Database Tables:
1. **admin_users** - Admin accounts with authentication
2. **admin_audit_log** - Security audit trail
3. **admin_errors** - Error tracking and monitoring
4. **admin_performance_logs** - API performance metrics
5. **admin_activity_logs** - User activity tracking
6. **admin_health_checks** - System health monitoring
7. **admin_alerts** - Alert notifications
8. **admin_alert_configs** - Alert configuration
9. **admin_api_keys** - API keys for Kiro AI

### What's Next:
After you confirm Step 1 is complete, I'll give you Step 2: Creating your admin user account.

---

## 📸 SCREENSHOT GUIDE

### Where to Find Supabase SQL Editor:
```
Supabase Dashboard
  └─ Your Project (pvvnxupuukuefajypovz)
      └─ SQL Editor (left sidebar)
          └─ New Query
              └─ Paste SQL here
              └─ Click "RUN"
```

### What Success Looks Like:
```
✅ Query executed successfully
✅ 9 rows returned
✅ Table names listed: admin_activity_logs, admin_alert_configs, ...
```

---

## 🆘 NEED HELP?

### Common Issues:

**Q: I don't see the SQL Editor**
A: Look in the left sidebar of Supabase Dashboard, it's usually near "Table Editor" and "Database"

**Q: The SQL is taking a long time**
A: It should complete in 5-10 seconds. If it's longer than 30 seconds, refresh and try again.

**Q: I see "relation already exists" errors**
A: That's okay! It means the tables were already created. You can proceed to Step 2.

**Q: I'm not sure if it worked**
A: Run this simple query in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM admin_users;
```
If it returns a number (even 0), the table exists and you're good!

---

## ✅ READY FOR STEP 2?

Once you've confirmed the tables are created, let me know and I'll give you:
- **Step 2**: Create your admin user account
- **Step 3**: Generate API key for Kiro AI
- **Step 4**: Test login

**Total remaining time**: ~5 minutes

---

**Current Status**: ⏳ WAITING FOR STEP 1 COMPLETION  
**Next Action**: Run SQL in Supabase, then confirm it worked  
**File to Use**: `STEP-1-CREATE-ADMIN-TABLES-JAN-22-2026.sql`
