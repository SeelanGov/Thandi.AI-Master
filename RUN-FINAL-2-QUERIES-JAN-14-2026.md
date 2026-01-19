# RUN FINAL 2 QUERIES - COMPLETE DISCOVERY
**Date**: January 14, 2026  
**Status**: Ready to Execute  
**Purpose**: Get remaining policy definition and schools.id column type

---

## 🎯 CURRENT STATUS

✅ **Completed**: All 7 diagnostic steps executed  
✅ **Discovered**: 4 types of blockers  
✅ **Query 1 Complete**: Got "School users see own school" policy definition  

**Remaining**: 2 more queries to complete discovery

---

## 📋 QUERY 2: GET STUDENT_ASSESSMENTS POLICY

### SQL to Run:
```sql
-- Get the policy that's blocking student_assessments.school_id change
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
  AND tablename = 'student_assessments'
  AND policyname = 'School_isolation_assessments';
```

### What We're Looking For:
- Policy name: "School_isolation_assessments"
- The `qual` field contains the policy definition
- This is needed to recreate the policy after the fix

### Instructions:
1. Copy the SQL above
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Take screenshot of results
5. Provide screenshot

---

## 📋 QUERY 3: CHECK SCHOOLS.ID COLUMN TYPE

### SQL to Run:
```sql
-- Check if schools.id is UUID or VARCHAR
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

### What We're Looking For:
- If `data_type` = 'uuid', we need to change it to VARCHAR
- If `data_type` = 'character varying', it's already VARCHAR

### Why This Matters:
- `students.school_id` has a foreign key to `schools.id`
- Both columns must have the same type
- If `schools.id` is UUID, we need to change it too

### Instructions:
1. Copy the SQL above
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Take screenshot of results
5. Provide screenshot

---

## 🔄 AFTER BOTH QUERIES

Once you provide screenshots for both queries, I will:

1. ✅ Analyze the policy definition
2. ✅ Determine if we need to change `schools.id` type
3. ✅ Create the FINAL, BULLETPROOF fix script
4. ✅ Provide clear execution instructions

---

## 📊 WHAT WE ALREADY KNOW

### Query 1 Results (Already Provided):
**Policy**: "School users see own school" on `schools` table  
**Definition**: 
```sql
(id IN ( SELECT school_users.school_id 
         FROM school_users 
         WHERE (school_users.user_id = auth.uid())))
```

### Blockers Discovered:
1. ✅ Policy "Students can update own data" on `students`
2. ✅ Policy "Students can view own data" on `students`
3. ✅ Policy "School users see own school" on `schools`
4. ⏳ Policy "School_isolation_assessments" on `student_assessments` (Query 2)
5. ✅ Foreign key `students_school_id_fkey`

---

## ⏱️ TIME ESTIMATE

- Query 2: 1 minute
- Query 3: 1 minute
- Analysis: 2 minutes
- Create final script: 5 minutes

**Total**: ~9 minutes to final fix script

---

## 🚀 READY TO PROCEED

**Next Action**: Run Query 2 and provide screenshot of results.

