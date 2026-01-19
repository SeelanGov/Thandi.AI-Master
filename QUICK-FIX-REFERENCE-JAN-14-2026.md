# QUICK FIX REFERENCE - Registration Database Fix
**Date**: January 14, 2026

## 🎯 THE FIX IN 3 STEPS

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → SQL Editor → New Query

### Step 2: Copy & Run This File
File: `ULTIMATE-SCHOOL-ID-FIX-JAN-14-2026.sql`

Copy the ENTIRE contents and paste into SQL Editor, then click "Run"

### Step 3: Test Registration
Go to: https://thandi.ai/register

Fill in form with school ID: `ZAF-200100021`

## ✅ SUCCESS LOOKS LIKE

- SQL runs without "cannot alter type" errors
- Registration form accepts school IDs
- No UUID errors in browser console
- Database inserts succeed

## 🚨 IF YOU SEE ERRORS

### Error: "policy [NAME] depends on column school_id"
**Fix**: Add this line before the ALTER TABLE:
```sql
DROP POLICY IF EXISTS "[NAME]" ON [TABLE];
```
Then run again.

### Error: "table recommendations does not exist"
**Fix**: Comment out the entire "STEP 5: FIX recommendations" section.

### Error: "foreign key constraint fails"
**Fix**: Check that `school_master.school_id` is VARCHAR(50).

## 📋 VERIFICATION QUERIES

After running the fix, verify success:

```sql
-- Should show VARCHAR for both tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
  AND table_name IN ('student_assessments', 'recommendations');
```

Expected: `character varying` for both

## 📚 DETAILED GUIDES

- **Complete context**: `REGISTRATION-DATABASE-FIX-FINAL-JAN-14-2026.md`
- **Step-by-step**: `EXECUTE-ULTIMATE-FIX-JAN-14-2026.md`
- **SQL fix**: `ULTIMATE-SCHOOL-ID-FIX-JAN-14-2026.sql`

---

**Ready to fix registration!** 🚀
