# RUN STEP-BY-STEP SQL FIX
**Date**: January 14, 2026  
**File**: `STEP-BY-STEP-SQL-FIX-JAN-14-2026.sql`  
**Status**: Ready to Execute

---

## 🎯 WHY STEP-BY-STEP?

Supabase SQL Editor doesn't handle `BEGIN;` and `COMMIT;` well when pasting entire scripts.  
Running each step individually is safer and gives you control.

---

## 📋 EXECUTION STEPS

Open `STEP-BY-STEP-SQL-FIX-JAN-14-2026.sql` and run each step separately:

### Step 1: Drop RLS Policies ⏱️ 10 seconds

```sql
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;
```

**Expected**: "Success. No rows returned" or similar  
**Then**: Proceed to Step 2

---

### Step 2: Alter school_users ⏱️ 5 seconds

```sql
ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```

**Expected**: "Success. No rows returned"  
**Then**: Proceed to Step 3

---

### Step 3: Alter student_assessments ⏱️ 5 seconds

```sql
ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```

**Expected**: "Success. No rows returned"  
**Then**: Proceed to Step 4

---

### Step 4: Alter students ⏱️ 5 seconds

```sql
ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```

**Expected**: "Success. No rows returned"  
**Then**: Proceed to Step 5

---

### Step 5: Recreate Policy 1 ⏱️ 5 seconds

```sql
CREATE POLICY "Students can view own data" 
  ON students 
  FOR SELECT 
  USING (auth.uid() = id);
```

**Expected**: "Success. No rows returned"  
**Then**: Proceed to Step 6

---

### Step 6: Recreate Policy 2 ⏱️ 5 seconds

```sql
CREATE POLICY "Students can update own data" 
  ON students 
  FOR UPDATE 
  USING (auth.uid() = id);
```

**Expected**: "Success. No rows returned"  
**Then**: Proceed to Step 7

---

### Step 7: Verify Success ⏱️ 10 seconds

```sql
-- Check column types
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
ORDER BY table_name;
```

**Expected**: All 9 tables show `character varying` / `varchar`

```sql
-- Check policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'students'
ORDER BY policyname;
```

**Expected**: 2 policies listed

---

## ✅ SUCCESS CRITERIA

After all steps:
- ✅ All 9 tables have VARCHAR school_id
- ✅ 2 policies exist on students table
- ✅ No errors in any step

---

## 🚀 NEXT STEPS

Once all steps complete successfully:

1. **Test Locally** (3 minutes)
   ```bash
   node test-final-school-id-fix-local.js
   ```

2. **Deploy to Production** (5 minutes)
   ```bash
   git add .
   git commit -m "fix: correct school_id column types"
   git push
   ```

3. **Test Live** (2 minutes)
   - Go to https://thandi-ai.vercel.app/register
   - Test registration flow

---

**Start with Step 1 now!**
