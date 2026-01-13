# Task 1.2: Manual SQL Execution Guide

## 🚨 CRITICAL PRODUCTION HOTFIX DEPLOYMENT

**Issue**: SQL ambiguity error "column reference 'consent_date' is ambiguous" blocking all user registrations

**Solution**: Execute SQL fix in Supabase production database

---

## 📋 STEP-BY-STEP EXECUTION INSTRUCTIONS

### Step 1: Access Supabase Dashboard
1. Open your browser
2. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
3. Log in to your account
4. Select the **Thandi.AI production project**

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** to create a new SQL script
3. You should see an empty SQL editor window

### Step 3: Execute the Hotfix Script
1. **Copy the ENTIRE contents** of `MANUAL-SUPABASE-SQL-HOTFIX-EXECUTION.sql`
2. **Paste** the script into the SQL Editor
3. **Click "Run"** button (or press Ctrl+Enter)
4. **Wait** for execution to complete

### Step 4: Verify Success
You should see one of these messages:
- ✅ **"Success. No rows returned"** - PERFECT! The fix is deployed
- ✅ **"Success. Completed successfully"** - PERFECT! The fix is deployed
- ❌ **Any error message** - Contact development team immediately

### Step 5: Test the Fix
1. Open a new browser tab
2. Navigate to: **https://thandi.online/assessment**
3. Try to register a new student:
   - Select a school (e.g., "EFFINGHAM SECONDARY SCHOOL")
   - Select grade (e.g., "Grade 11")
   - Fill in student details
   - Complete POPIA consent
   - Submit registration

### Step 6: Confirm Resolution
**SUCCESS INDICATORS:**
- ✅ Registration completes without errors
- ✅ No "ambiguous" error messages appear
- ✅ User receives success confirmation
- ✅ User can proceed to assessment

**FAILURE INDICATORS:**
- ❌ Still seeing "column reference 'consent_date' is ambiguous"
- ❌ Registration fails with database errors
- ❌ Any SQL-related error messages

---

## 🔄 ROLLBACK PLAN (If Issues Occur)

If the fix causes any problems, execute this rollback:

```sql
-- EMERGENCY ROLLBACK
CREATE OR REPLACE FUNCTION create_student_school_association(
  p_student_name VARCHAR(100),
  p_student_surname VARCHAR(100),
  p_school_id VARCHAR(50),
  p_grade INTEGER,
  p_consent_given BOOLEAN DEFAULT true,
  p_consent_method VARCHAR(50) DEFAULT 'web_form'
)
RETURNS JSONB AS $$
SELECT create_student_school_association_backup(
  p_student_name, p_student_surname, p_school_id, p_grade, p_consent_given, p_consent_method
);
$$ LANGUAGE sql;
```

---

## 📞 SUPPORT CONTACTS

**If you encounter any issues:**
1. **STOP** - Do not continue
2. **Document** the exact error message
3. **Contact** the development team immediately
4. **Provide** screenshot of the error

---

## ✅ COMPLETION CHECKLIST

After successful execution:
- [ ] SQL script executed without errors
- [ ] "Success" message received in Supabase
- [ ] Registration tested at https://thandi.online/assessment
- [ ] No "ambiguous" errors appear
- [ ] Users can complete full registration flow
- [ ] Task 1.2 marked as complete

---

## 🎯 EXPECTED OUTCOME

**Before Fix:**
- Users see: "Registration failed: column reference 'consent_date' is ambiguous"
- Registration completely blocked
- Revenue generation stopped

**After Fix:**
- Users complete registration successfully
- No SQL ambiguity errors
- Full registration flow functional
- Revenue generation restored

---

**Time Estimate**: 5-10 minutes
**Risk Level**: LOW (backup function created automatically)
**Business Impact**: HIGH (unblocks all user registrations)

**Ready to execute? Copy the SQL script and follow the steps above!**