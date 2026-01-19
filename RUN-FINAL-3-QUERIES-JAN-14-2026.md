# RUN FINAL 3 QUERIES - Check RLS Policies
**Date**: January 14, 2026  
**Status**: Ready to Execute  
**Purpose**: Check which RLS policies exist on tables we need to modify

---

## 🎯 WHAT WE'RE CHECKING

We need to know which RLS policies exist on the 3 tables that have UUID school_id columns:
1. `school_users`
2. `student_assessments`
3. `students`

**Why?** Because we must:
- DROP policies before altering columns they reference
- RECREATE policies after altering columns

---

## 📋 INSTRUCTIONS

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run Query 5 (school_users policies)
```sql
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS operation
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'school_users'
ORDER BY polname;
```

**Copy the results and paste them in chat.**

### Step 3: Run Query 6 (student_assessments policies)
```sql
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS operation
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'student_assessments'
ORDER BY polname;
```

**Copy the results and paste them in chat.**

### Step 4: Run Query 7 (students policies)
```sql
SELECT 
  polname AS policy_name,
  polcmd AS command_type,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS operation
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'students'
ORDER BY polname;
```

**Copy the results and paste them in chat.**

---

## 📊 WHAT TO EXPECT

### Possible Results:

**Option A: No policies found**
- Queries return empty results
- This is GOOD - means we can alter columns directly
- No policies to drop/recreate

**Option B: Policies found**
- Queries return policy names and operations
- We'll need to drop these before altering columns
- We'll recreate them after altering columns

---

## ✅ NEXT STEPS

Once you provide the results:
1. I'll create the FINAL SQL fix that includes:
   - Dropping any existing policies
   - Altering the 3 columns from UUID to VARCHAR
   - Recreating any policies that were dropped
2. You'll run it in Supabase
3. We'll test locally
4. We'll deploy to production

---

## 🚀 READY TO PROCEED

**Run the 3 queries above and paste the results here.**

If any query returns empty, just say "Query X: No results" - that's perfectly fine!
