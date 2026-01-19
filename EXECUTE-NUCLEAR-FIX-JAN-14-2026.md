# NUCLEAR SCHOOL_ID FIX - EXECUTION GUIDE
**Date**: January 14, 2026  
**Critical**: This will drop ALL dependencies before altering the column

## 🚨 WHAT THIS DOES

This script takes the "nuclear option" - it finds and drops:
1. **ALL views** that reference `student_assessments`
2. **ALL functions** that reference `student_assessments.school_id`
3. **ALL triggers** on `student_assessments`
4. **ALL policies** on `student_assessments` (with CASCADE)
5. **ALL constraints** on the `school_id` column
6. **ALL indexes** on the `school_id` column

Then it:
- Alters the column type from UUID to VARCHAR(50)
- Recreates the foreign key
- Recreates the index
- Re-enables RLS
- Recreates the 3 essential policies

## ⚠️ WARNINGS

- This will DROP functions that may be used elsewhere
- You'll need to recreate any custom views/functions after
- **BACKUP YOUR DATABASE FIRST**

## 📋 EXECUTION STEPS

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/pvmuupukueafypovz/sql
2. Click "New query"

### Step 2: Copy the SQL
1. Open `NUCLEAR-SCHOOL-ID-FIX-JAN-14-2026.sql`
2. Copy the ENTIRE contents

### Step 3: Paste and Run
1. Paste into the SQL Editor
2. Click "Run" (or CTRL+Enter)
3. Watch the output for "Dropped..." messages

### Step 4: Verify Success
Look for this message at the end:
```
Fix complete! student_assessments.school_id is now VARCHAR(50)
```

### Step 5: Test Registration
1. Go to https://thandi.ai/register
2. Fill in the form with a real school
3. Submit
4. **IT SHOULD WORK NOW**

## 🔍 WHAT TO WATCH FOR

The output should show:
```
NOTICE: Dropped view: [any views]
NOTICE: Dropped function: [any functions]
NOTICE: Dropped trigger: [any triggers]
NOTICE: Dropped policy: schools_view_own_student_assessments
NOTICE: Dropped policy: schools_insert_student_assessments
NOTICE: Dropped policy: service_role_assessments_all
NOTICE: Dropped constraint: [any constraints]
NOTICE: Column type changed successfully!
NOTICE: Fix complete! student_assessments.school_id is now VARCHAR(50)
```

## ❌ IF IT STILL FAILS

If you STILL get "cannot alter type of a column used in a policy definition":

1. **Take a screenshot** of the error
2. Run this diagnostic query to see what's blocking:
```sql
SELECT 
  'Policy' as type,
  policyname as name,
  tablename
FROM pg_policies 
WHERE tablename = 'student_assessments'

UNION ALL

SELECT 
  'Function' as type,
  p.proname as name,
  'references student_assessments' as tablename
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) LIKE '%student_assessments%'

UNION ALL

SELECT 
  'View' as type,
  viewname as name,
  'references student_assessments' as tablename
FROM pg_views
WHERE definition LIKE '%student_assessments%';
```

3. Share the results - we'll identify what's still blocking

## 🎯 WHY THIS SHOULD WORK

The previous attempts failed because:
- We dropped policies but PostgreSQL still saw them in the transaction
- We didn't drop functions that reference the column
- We didn't drop views that might depend on it
- We didn't use CASCADE on the drops

This "nuclear" approach:
- Drops EVERYTHING that could possibly reference the column
- Uses CASCADE to force-drop dependencies
- Drops constraints and indexes explicitly
- Only THEN attempts the ALTER TABLE

## 📞 NEXT STEPS AFTER SUCCESS

Once this works:
1. Test registration flow completely
2. Verify school dashboard still works
3. Check that RLS policies are enforcing correctly
4. Recreate any custom functions/views you need

---

**Ready to execute?** Copy `NUCLEAR-SCHOOL-ID-FIX-JAN-14-2026.sql` into Supabase SQL Editor and run it.
