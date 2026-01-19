# RLS POLICIES DISCOVERED
**Date**: January 14, 2026  
**Status**: ⚠️ INCOMPLETE - Need comprehensive discovery  
**Result**: Found MORE policies than expected!

---

## 🎯 DISCOVERY HISTORY

### Attempt 1: Phase 3 Failed
**Error**: `school_isolation_assessments` policy on student_assessments table

**Discovered**: 4 policies on student_assessments table
1. **school_isolation_assessments** ← Caused Phase 3 failure
2. **schools_insert_student_assessments**
3. **schools_view_own_student_assessments**
4. **service_role_assessments_all**

**Action**: Added these 4 policies to Phase 1

### Attempt 2: Phase 1 Failed ← **CURRENT SITUATION**
**Error**: `school_isolation_recommendations` policy on recommendations table

**Discovered**: At least 1 policy on recommendations table
1. **school_isolation_recommendations** ← Caused Phase 1 failure

**Problem**: We didn't know this policy existed!

---

## 📊 KNOWN POLICIES (Incomplete List)

### students Table (2-3 policies)
1. ✅ **"Students can view own record"**
2. ✅ **"Students can update own record"**
3. ❓ (May be more)

### schools Table (1 policy)
1. ✅ **"Schools are viewable by everyone"**

### student_assessments Table (4 policies)
1. ✅ **school_isolation_assessments**
2. ✅ **schools_insert_student_assessments**
3. ✅ **schools_view_own_student_assessments**
4. ✅ **service_role_assessments_all**

### recommendations Table (1+ policies) ← **NEW DISCOVERY**
1. ✅ **school_isolation_recommendations**
2. ❓ (May be more)

### Unknown Tables
❓ **There may be MORE tables with policies we haven't discovered yet!**

---

## 🚨 CRITICAL ISSUE

**We don't have a complete list of ALL RLS policies!**

Each time we execute, we discover a NEW policy that we missed. This means:
- ❌ We can't execute the fix until we know ALL policies
- ❌ Manual discovery is incomplete
- ✅ Need to run comprehensive SQL query to find ALL policies

---

## 📊 MINIMUM COUNT (Incomplete)

**Known so far**: 8+ RLS policies
- 2-3 on students
- 1 on schools
- 4 on student_assessments
- 1+ on recommendations
- ❓ Unknown number on other tables

**Action Required**: Run comprehensive discovery query to find ALL policies!

---

## 🔍 NEXT STEPS

### STEP 1: Run Comprehensive Discovery
**File**: `DISCOVER-ALL-SCHOOL-ID-POLICIES-JAN-14-2026.sql`

This query will find ALL RLS policies across ALL tables that reference school_id.

### STEP 2: Update Fix Script
Once we have the complete list, update:
- Phase 1: Drop ALL discovered policies
- Phase 6: Recreate ALL discovered policies

### STEP 3: Execute Corrected Fix
With complete discovery, the fix will succeed on first try.

---

## 💡 LESSON LEARNED

**Manual discovery is incomplete and error-prone.**

We need to use SQL queries to systematically discover ALL policies, not rely on manual inspection or incremental discovery through failures.

**This is why we're running the comprehensive discovery query now!**

---

**Status**: Awaiting comprehensive discovery results  
**Next Action**: User runs `DISCOVER-ALL-SCHOOL-ID-POLICIES-JAN-14-2026.sql`

---

## 🔍 WHY PHASE 3 FAILED

The error message was:
```
ERROR: cannot alter type of a column used in a policy definition
DETAIL: policy school_isolation_assessments on table student_assessments 
        depends on column "school_id"
```

**Root cause**: We only dropped 3 policies in Phase 1, but `school_isolation_assessments` was still active and depends on the `school_id` column we're trying to change!

---

## ✅ SOLUTION

Update Phase 1 to drop ALL policies:

```sql
-- Phase 1: Drop ALL RLS policies (7 policies minimum)

-- Drop policies on students table
DROP POLICY IF EXISTS "Students can view own record" ON students;
DROP POLICY IF EXISTS "Students can update own record" ON students;

-- Drop policies on schools table
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON schools;

-- Drop policies on student_assessments table (THE MISSING ONES!)
DROP POLICY IF EXISTS "school_isolation_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_insert_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "schools_view_own_student_assessments" ON student_assessments;
DROP POLICY IF EXISTS "service_role_assessments_all" ON student_assessments;
```

Then Phase 3 will succeed because no policies depend on school_id!

---

**Next Step**: Update the SQL fix file and execute!

