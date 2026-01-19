# EXECUTE CORRECTED NUCLEAR FIX - QUICK GUIDE
**Date**: January 14, 2026  
**Issue**: Previous SQL had syntax error with `RAISE NOTICE` outside DO block

## 🔧 WHAT WAS WRONG

The previous SQL file had this error:
```
ERROR: 42601: syntax error at or near "RAISE" LINE 99
```

**Cause**: `RAISE NOTICE` statements must be inside `DO $$` blocks in PostgreSQL.

**Fix**: Wrapped all `RAISE NOTICE` statements in proper `DO $$` blocks.

## ✅ CORRECTED SQL FILE

Use this file: **`NUCLEAR-SCHOOL-ID-FIX-CORRECTED-JAN-14-2026.sql`**

## 📋 EXECUTION STEPS

### Step 1: Clear the SQL Editor
1. In Supabase SQL Editor, **clear all existing SQL**
2. Make sure the editor is completely empty

### Step 2: Copy the CORRECTED SQL
1. Open file: `NUCLEAR-SCHOOL-ID-FIX-CORRECTED-JAN-14-2026.sql`
2. Copy **ALL contents** (entire file)

### Step 3: Paste and Run
1. Paste into the SQL Editor
2. Click "Run" (or press CTRL+Enter)
3. **WAIT** for execution (may take 10-30 seconds)

### Step 4: Verify Success

Look for these messages in the output:

```
NOTICE: Dropped policy: schools_view_own_student_assessments
NOTICE: Dropped policy: schools_insert_student_assessments
NOTICE: Dropped policy: service_role_assessments_all
NOTICE: Dropped constraint: [constraint name]
NOTICE: Column type changed successfully!
NOTICE: Fix complete! student_assessments.school_id is now VARCHAR(50)
```

### Step 5: Test Registration

1. Go to: https://thandi.ai/register
2. Fill in the form with a real school
3. Click "Start Assessment"
4. **IT SHOULD WORK NOW!**

## 🚨 IF IT STILL FAILS

If you get a DIFFERENT error:

1. **Take a screenshot** of the EXACT error message
2. **Copy the error text** from the Results panel
3. Share both with me

## 🎯 KEY DIFFERENCES FROM PREVIOUS VERSION

**Old (broken):**
```sql
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;

RAISE NOTICE 'Column type changed successfully!';  -- ❌ ERROR: Not in DO block
```

**New (fixed):**
```sql
DO $$
BEGIN
  ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(50) USING school_id::TEXT;
  
  RAISE NOTICE 'Column type changed successfully!';  -- ✅ CORRECT: Inside DO block
END $$;
```

## 📞 WHAT TO EXPECT

**If successful:**
- You'll see multiple "NOTICE: Dropped..." messages
- You'll see "Column type changed successfully!"
- You'll see "Fix complete! student_assessments.school_id is now VARCHAR(50)"
- Registration will work immediately

**If it fails:**
- You'll see an ERROR message
- Share the EXACT error with me
- We'll identify what's still blocking

---

**Ready?** Copy `NUCLEAR-SCHOOL-ID-FIX-CORRECTED-JAN-14-2026.sql` and run it in Supabase SQL Editor.
