# STEP-BY-STEP DIAGNOSTIC RESULTS
**Date**: January 14, 2026  
**Status**: ✅ Complete - All 7 Steps Executed  
**Purpose**: Systematic discovery of ALL blockers preventing school_id column type changes

---

## 🎯 EXECUTIVE SUMMARY

**Problem**: Cannot change `school_id` columns from UUID to VARCHAR due to hidden dependencies

**Root Cause Discovered**: 
1. ❌ **Policies on OTHER tables** reference the columns we're trying to change
2. ❌ **Foreign key constraints** prevent type changes due to type mismatches
3. ✅ Only 2 policies on `students` table (as originally discovered)

**Key Learning**: Original discovery queries only checked policies ON the tables being modified, but missed policies on OTHER tables that REFERENCE these columns.

---

## 📋 STEP-BY-STEP EXECUTION RESULTS

### Step 1: Drop RLS Policies on `students` ✅
**SQL**:
```sql
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;
```
**Result**: ✅ Success - "Success. No rows returned"  
**Analysis**: Policies dropped successfully

---

### Step 2: ALTER `school_users.school_id` ❌
**SQL**:
```sql
ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```
**Result**: ❌ **ERROR**  
**Error Message**: "cannot alter type of a column used in a policy definition"  
**Blocker Found**: Policy "School users see own school" on `schools` table depends on `school_users.school_id`

**Analysis**: 
- We tried to change `school_users.school_id`
- But there's a policy on the `schools` table that references this column
- Original discovery missed this because it only checked policies ON `school_users`, not policies that REFERENCE `school_users`

---

### Step 3: ALTER `student_assessments.school_id` ❌
**SQL**:
```sql
ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```
**Result**: ❌ **ERROR**  
**Error Message**: "cannot alter type of a column used in a policy definition"  
**Blocker Found**: Policy "School_isolation_assessments" on `student_assessments` table blocks the change

**Analysis**:
- There IS a policy on `student_assessments` table
- Original discovery (Query 6) returned "No results" - this was INCORRECT
- The policy exists but wasn't found by our discovery query

---

### Step 4: ALTER `students.school_id` ❌
**SQL**:
```sql
ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```
**Result**: ❌ **ERROR**  
**Error Message**: "foreign key constraint 'students_school_id_fkey' cannot be implemented"  
**Blocker Found**: Foreign key constraint between `students.school_id` and `schools.id` prevents type change

**Analysis**:
- `students.school_id` has a foreign key to `schools.id`
- `schools.id` is still UUID
- Cannot change `students.school_id` to VARCHAR while `schools.id` remains UUID
- This is a **type mismatch** issue

---

### Step 5: Recreate Policy 1 on `students` ✅
**SQL**:
```sql
CREATE POLICY "Students can view own data" 
  ON students 
  FOR SELECT 
  USING (auth.uid() = id);
```
**Result**: ✅ Success - "Success. No rows returned"  
**Analysis**: Policy recreated successfully

---

### Step 6: Recreate Policy 2 on `students` ✅
**SQL**:
```sql
CREATE POLICY "Students can update own data" 
  ON students 
  FOR UPDATE 
  USING (auth.uid() = id);
```
**Result**: ✅ Success - "Success. No rows returned"  
**Analysis**: Policy recreated successfully

---

### Step 7: Verification Queries ✅

#### Query 1: Check Column Types
**Result**: Shows current state of all `school_id` columns (still UUID for the 3 we tried to change)

#### Query 2: Check Policies on `students`
**Result**: 
| tablename | policyname | cmd |
|-----------|------------|-----|
| students | Students can update own data | UPDATE |
| students | Students can view own data | SELECT |

**Analysis**: Both policies successfully recreated on `students` table

---

## 🔍 COMPLETE BLOCKER INVENTORY

### Blockers Discovered Through Step-by-Step Execution:

1. **Policy on `schools` table**
   - Policy Name: "School users see own school"
   - References: `school_users.school_id`
   - Action Required: Drop this policy before changing `school_users.school_id`

2. **Policy on `student_assessments` table**
   - Policy Name: "School_isolation_assessments"
   - References: `student_assessments.school_id`
   - Action Required: Drop this policy before changing `student_assessments.school_id`

3. **Foreign Key Constraint**
   - Constraint Name: `students_school_id_fkey`
   - From: `students.school_id`
   - To: `schools.id`
   - Issue: Type mismatch (trying to change `students.school_id` to VARCHAR while `schools.id` is UUID)
   - Action Required: Drop foreign key, change types, recreate foreign key

4. **Policies on `students` table** (Already Known)
   - "Students can update own data"
   - "Students can view own data"
   - Action Required: Drop before changing `students.school_id`, recreate after

---

## 🚨 WHY ORIGINAL DISCOVERY FAILED

### Original Discovery Approach:
```sql
-- Query 6: Check policies ON student_assessments
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'student_assessments';
```
**Result**: No rows returned ❌

### Why It Failed:
- The query checked for policies ON the table
- But the policy exists and DOES block the column change
- Possible reasons:
  1. Policy might be defined differently (e.g., using schema-qualified names)
  2. Policy might be inherited or applied through a different mechanism
  3. Query syntax might not capture all policy types

### What We Learned:
- **Step-by-step execution is the ONLY reliable way to discover ALL blockers**
- Discovery queries can miss dependencies
- Real-world execution reveals hidden constraints

---

## 📝 COMPREHENSIVE FIX PLAN

Based on step-by-step diagnostic, here's what we need to do:

### Phase 1: Drop ALL Blocking Policies
```sql
-- Drop policies on students table
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can view own data" ON students;

-- Drop policy on schools table that references school_users
DROP POLICY IF EXISTS "School users see own school" ON schools;

-- Drop policy on student_assessments table
DROP POLICY IF EXISTS "School_isolation_assessments" ON student_assessments;
```

### Phase 2: Drop Foreign Key Constraints
```sql
-- Drop foreign key from students to schools
ALTER TABLE students 
  DROP CONSTRAINT IF EXISTS students_school_id_fkey;
```

### Phase 3: Change Column Types
```sql
-- Change school_users.school_id
ALTER TABLE school_users 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change student_assessments.school_id
ALTER TABLE student_assessments 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;

-- Change students.school_id
ALTER TABLE students 
  ALTER COLUMN school_id TYPE VARCHAR(255) USING school_id::TEXT;
```

### Phase 4: Recreate Foreign Key Constraints
```sql
-- Recreate foreign key (if schools.id is VARCHAR)
ALTER TABLE students 
  ADD CONSTRAINT students_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id);
```

### Phase 5: Recreate ALL Policies
```sql
-- Recreate policies on students
CREATE POLICY "Students can view own data" 
  ON students FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Students can update own data" 
  ON students FOR UPDATE 
  USING (auth.uid() = id);

-- Recreate policy on schools (need to get definition)
-- CREATE POLICY "School users see own school" ON schools ...

-- Recreate policy on student_assessments (need to get definition)
-- CREATE POLICY "School_isolation_assessments" ON student_assessments ...
```

---

## ⚠️ CRITICAL NEXT STEPS

### 1. Get Policy Definitions
We need the FULL definitions of:
- "School users see own school" on `schools` table
- "School_isolation_assessments" on `student_assessments` table

**Query to get definitions**:
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

### 2. Check `schools.id` Column Type
We need to know if `schools.id` is UUID or VARCHAR:
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

### 3. Create Comprehensive Fix Script
Once we have:
- Policy definitions
- `schools.id` column type
- Foreign key constraint details

We can create the FINAL, BULLETPROOF fix script.

---

## 🎓 LESSONS LEARNED

1. **Discovery queries are insufficient** - They miss cross-table dependencies
2. **Step-by-step execution is essential** - Only way to find ALL blockers
3. **Foreign keys create type dependencies** - Must consider referenced tables
4. **Policies can exist on OTHER tables** - Must check all tables that reference the columns
5. **Systematic approach wins** - Patience and methodical testing reveals truth

---

## ✅ SUCCESS CRITERIA FOR FINAL FIX

The final fix must:
1. ✅ Drop ALL policies that block the changes (4 policies total)
2. ✅ Drop ALL foreign key constraints that block the changes
3. ✅ Change all 3 column types from UUID to VARCHAR
4. ✅ Recreate ALL foreign key constraints with correct types
5. ✅ Recreate ALL policies with correct column types
6. ✅ Execute without errors
7. ✅ Preserve all data
8. ✅ Maintain all security policies

---

**Next Action**: Run the 2 additional queries above to get policy definitions and `schools.id` type, then create the final fix script.
