# LOAD SCHOOLS - MANUAL GUIDE
**CRITICAL**: Students cannot find schools - database needs seeding

## 🚨 IMMEDIATE ACTION REQUIRED

### Problem
- Only 2 pilot schools in database
- Need 3,899 schools for students to search
- **Blocking all user testing**

### Solution (5 minutes)

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **Thandi - Fresh Project** (pvvnxupuukuefajypovz)
3. Click on **SQL Editor** in the left sidebar

### Step 2: Prepare the SQL File
1. Open the file: `seed-school-auth.sql` in your code editor
2. **Select All** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)

### Step 3: Execute in Supabase
1. In Supabase SQL Editor, click **"New Query"**
2. **Paste** the SQL content (Ctrl+V / Cmd+V)
3. Click **"Run"** button (or press Ctrl+Enter)
4. Wait 30-60 seconds for execution
5. You should see: **"Success. 3,899 rows affected"**

### Step 4: Verify
Run this in SQL Editor to verify:
```sql
SELECT COUNT(*) FROM schools;
```

Expected result: **3,899**

### Step 5: Test School Search
Run this to test Effingham search:
```sql
SELECT name, province, type 
FROM schools 
WHERE name ILIKE '%effingham%';
```

You should see Effingham schools in the results.

## ✅ VERIFICATION

After loading, test on live site:
1. Go to: https://www.thandi.online/register
2. Type "effingham" in school search
3. Should see Effingham schools appear
4. ✅ Students can now find their schools!

## 🔧 ALTERNATIVE: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref pvvnxupuukuefajypovz

# Run migration
supabase db push --file seed-school-auth.sql
```

## 📊 EXPECTED OUTCOME

**Before**:
- 2 schools (Durban High, Morningside High)
- Students cannot find their schools
- Registration blocked

**After**:
- 3,899 schools (all SA schools)
- Students can search and find any school
- Registration works smoothly

## ⏱️ TIME ESTIMATE

- **Manual method**: 5 minutes
- **CLI method**: 2 minutes (if CLI already set up)

## 🎯 PRIORITY

**CRITICAL** - This blocks all user testing. Complete this before any student testing begins.

---

**Status**: Waiting for manual execution
**Next**: Verify school count reaches 3,899
