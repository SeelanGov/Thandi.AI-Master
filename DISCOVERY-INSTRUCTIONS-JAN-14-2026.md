# DISCOVERY PHASE INSTRUCTIONS
**Date**: January 14, 2026
**Purpose**: Get complete database state before creating fix

---

## 🎯 WHAT YOU NEED TO DO

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run Discovery SQL

1. Open the file: `DISCOVERY-SQL-RUN-IN-SUPABASE-JAN-14-2026.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click "Run" button

### Step 3: Copy Results

The query will return multiple result sets showing:
- All tables with `school_id` columns
- All RLS policies
- Policies that reference `school_id`
- Foreign key constraints
- Indexes
- Table structures for key tables

**Copy ALL the results** - you'll see multiple sections with headers like:
- `=== TABLES WITH school_id COLUMN ===`
- `=== ALL RLS POLICIES ===`
- `=== POLICIES REFERENCING school_id ===`
- etc.

### Step 4: Share Results

Paste the results back here in the chat. I'll analyze them and create the comprehensive fix.

---

## 📋 WHAT I'LL DO WITH THE RESULTS

Once you share the discovery results, I will:

1. **Analyze the complete database state**
   - Identify ALL tables with school_id
   - List ALL policies that need to be dropped
   - Understand ALL foreign key constraints
   - Map ALL indexes

2. **Create ONE comprehensive SQL fix** that:
   - Drops ALL discovered policies
   - Alters ALL school_id columns from UUID to VARCHAR(50)
   - Recreates ESSENTIAL policies
   - Includes verification queries

3. **Create a local test script** to verify the fix works

4. **Guide you through deployment** step by step

---

## ⚠️ WHY THIS APPROACH WILL WORK

**Previous attempts failed because**:
- We guessed at policy names
- We didn't know all affected tables
- We tried to fix without complete understanding

**This approach will succeed because**:
- We're querying the actual database
- We'll see EXACTLY what exists
- We'll create ONE fix based on FACTS
- We'll test locally FIRST

---

## 🚀 READY TO PROCEED

**Your action**: Run the discovery SQL in Supabase and share the results.

**My action**: Analyze results and create the comprehensive fix.

**Result**: ONE working fix that permanently solves the registration issue.

---

**No more guessing. No more failed attempts. One comprehensive, tested, working fix.**
