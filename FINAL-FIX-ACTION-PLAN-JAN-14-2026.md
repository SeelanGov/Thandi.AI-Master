# FINAL FIX ACTION PLAN
**Date**: January 14, 2026  
**Status**: Ready to Execute  
**Confidence**: High - Based on systematic step-by-step diagnostic

---

## 🎯 WHAT WE DISCOVERED

Through systematic step-by-step execution, we found **4 types of blockers**:

1. **2 policies on `students` table** (already known)
2. **1 policy on `schools` table** that references `school_users.school_id`
3. **1 policy on `student_assessments` table** 
4. **1 foreign key constraint** from `students.school_id` to `schools.id`

---

## 📋 IMMEDIATE NEXT STEPS

### Step 1: Get Missing Policy Definitions (2 minutes)

Run this query in Supabase SQL Editor:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    (tablename = 'schools' AND policyname = 'School users see own school')
    OR (tablename = 'student_assessments' AND policyname = 'School_isolation_assessments')
  );
```

**Purpose**: Get the full CREATE POLICY statements so we can recreate them after the fix

---

### Step 2: Check `schools.id` Column Type (1 minute)

Run this query in Supabase SQL Editor:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schools'
  AND column_name = 'id';
```

**Purpose**: Determine if we need to change `schools.id` type as well (for foreign key compatibility)

---

### Step 3: Create Final Fix Script (5 minutes)

Based on the results from Steps 1 and 2, create a comprehensive SQL script that:

1. Drops ALL 4 blocking policies
2. Drops the foreign key constraint
3. Changes column types (possibly including `schools.id`)
4. Recreates the foreign key constraint
5. Recreates ALL 4 policies

---

### Step 4: Execute Final Fix (2 minutes)

Run the complete fix script in Supabase SQL Editor

---

### Step 5: Verify Success (1 minute)

Run verification queries to confirm:
- All `school_id` columns are now VARCHAR
- All policies are recreated
- Foreign key constraint is recreated

---

## 🔧 FINAL FIX SCRIPT TEMPLATE

Once we have the policy definitions and `schools.id` type, the script will look like:

```sql
-- =====================================================
-- COMPREHENSIVE SCHOOL_ID FIX
-- Date: January 14, 2026
-- Based on: Step-by-step diagnostic results
-- =====================================================

BEGIN;

-- =====================================================
-- PHASE 1: DROP ALL BLOCKING POLICIES
-- =====================================================

-- Drop policies on students table
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;

-- Drop policy on schools table
DROP POLICY IF EXISTS "School users see own school" ON schools;

-- Drop policy on student_assessments table
DROP POLICY IF EXISTS "School_isolation_assessments" ON student_assessments;


-- =====================================================
-- PHASE 2: DROP FOREIGN KEY CONSTRAINTS
-- =====================================================

ALTER TABLE students 
  DROP CONSTRAINT IF EXISTS students_school_id_fkey;


-- =====================================================
-- PHASE 3: CHANGE COLUMN TYPES
-- =====================================================

-- Change schools.id (if needed)
-- ALTER TABLE schools 
--   ALTER COLUMN id TYPE VARCHAR(255) USING id::TEXT;

-- Change school_users.school_id
ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change student_assessments.school_id
ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change students.school_id
ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;


-- =====================================================
-- PHASE 4: RECREATE FOREIGN KEY CONSTRAINTS
-- =====================================================

ALTER TABLE students 
  ADD CONSTRAINT students_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id);


-- =====================================================
-- PHASE 5: RECREATE ALL POLICIES
-- =====================================================

-- Recreate policies on students
CREATE POLICY "Students can view own data" 
  ON students 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data" 
  ON students 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Recreate policy on schools
-- [INSERT FULL POLICY DEFINITION FROM STEP 1]

-- Recreate policy on student_assessments
-- [INSERT FULL POLICY DEFINITION FROM STEP 1]

COMMIT;


-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all school_id columns are now VARCHAR
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name = 'school_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- Check all policies are recreated
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    tablename = 'students'
    OR tablename = 'schools'
    OR tablename = 'student_assessments'
  )
ORDER BY tablename, policyname;
```

---

## ⏱️ ESTIMATED TIME

- **Step 1** (Get policy definitions): 2 minutes
- **Step 2** (Check schools.id type): 1 minute
- **Step 3** (Create final script): 5 minutes
- **Step 4** (Execute fix): 2 minutes
- **Step 5** (Verify success): 1 minute

**Total**: ~11 minutes to complete fix

---

## ✅ SUCCESS CRITERIA

After executing the final fix:

1. ✅ All 9 `school_id` columns show `character varying` type
2. ✅ All 4 policies are recreated and active
3. ✅ Foreign key constraint is recreated
4. ✅ No data loss
5. ✅ Registration flow works correctly

---

## 🚀 READY TO PROCEED

**Next Action**: Run Step 1 query to get policy definitions, then provide screenshot of results.

Once we have the policy definitions, we can create the final bulletproof fix script and execute it!
