# REAL ROOT CAUSE FOUND
**Date**: January 14, 2026  
**Status**: CRITICAL DATABASE SCHEMA ISSUE

## 🎯 THE ACTUAL PROBLEM

**Database Schema Mismatch**: The `student_assessments` table has `school_id` defined as UUID type, but we're passing string school IDs like "ZAF-200100021".

### Error Message
```
Assessment record creation error: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "ZAF-200100021"'
}
```

### What's Happening
1. User selects school from dropdown ✅
2. School ID is set correctly (e.g., "ZAF-200100021") ✅
3. Form submits to API ✅
4. API validates school exists ✅
5. API calls Supabase RPC function ✅
6. **API tries to insert into `student_assessments` table** ❌
7. **PostgreSQL rejects the insert because school_id is UUID type** ❌
8. API returns generic "Registration failed" error ❌

## 🔍 WHY WE MISSED THIS

1. **We assumed frontend issue**: Focused on school selection UI
2. **We didn't check server logs**: The error was in the console output
3. **We didn't test API directly**: Would have found this immediately
4. **Generic error message**: API returned "Registration failed" instead of actual error

## 🔧 THE FIX

### Option 1: Change Database Schema (RECOMMENDED)
Change `school_id` column in `student_assessments` from UUID to TEXT/VARCHAR to match `school_master.school_id`.

```sql
ALTER TABLE student_assessments 
ALTER COLUMN school_id TYPE TEXT;
```

### Option 2: Use Different Field
Don't store `school_id` directly, only store it in `assessment_data` JSON field.

### Option 3: Create Mapping
Create a UUID for each school and use that instead.

## 📊 IMPACT

**This affects**:
- ALL registration attempts
- Both local and production
- Has been failing for DAYS

**This explains**:
- Why users can't complete registration
- Why the form looks correct but fails
- Why we couldn't reproduce the "school selection" issue

## 🚀 IMMEDIATE ACTION

1. **Fix database schema** - Change school_id to TEXT
2. **Update API** - Handle the field correctly
3. **Test locally** - Verify registration works
4. **Deploy fix** - Push to production
5. **Monitor** - Watch for successful registrations

## 💡 LESSONS LEARNED

1. **Check server logs FIRST** - Don't assume frontend issues
2. **Test API directly** - Isolate backend from frontend
3. **Read error messages** - PostgreSQL told us exactly what was wrong
4. **Don't assume** - Test the actual flow end-to-end
5. **Database schema matters** - Type mismatches cause silent failures

---

**BOTTOM LINE**: The school selection UI works perfectly. The database schema is wrong. We need to fix the `student_assessments` table schema.
