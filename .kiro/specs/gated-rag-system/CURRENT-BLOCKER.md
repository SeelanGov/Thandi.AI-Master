# Current Blocker: Database Schema Update Required

## Status: WAITING FOR MANUAL SQL EXECUTION

All gate code is ready, but we need to add 8 new columns to the `careers` table in Supabase.

---

## What's Blocking Us

The `careers` table needs these new columns for gates to work:
- `requires_core_math` - Does career need Pure Math (not Math Lit)?
- `requires_physical_science` - Does career need Physical Sciences?
- `requires_life_science` - Does career need Life Sciences?
- `min_math_mark` - Minimum Math percentage required
- `min_english_mark` - Minimum English percentage required
- `requires_nbt` - Does career require NBT test?
- `nsfas_eligible` - Is career NSFAS-fundable?
- `tvet_alternative` - TVET pathway if student doesn't qualify

---

## How to Fix (2 minutes)

### Step 1: Open Supabase Dashboard

Go to: https://supabase.com/dashboard

Select your Thandi.ai project

### Step 2: Open SQL Editor

Click: **SQL Editor** in the left sidebar

Click: **New Query**

### Step 3: Copy & Paste This SQL

```sql
-- Add gate fields to careers table
ALTER TABLE careers 
ADD COLUMN IF NOT EXISTS requires_core_math BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_physical_science BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_life_science BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_math_mark INTEGER,
ADD COLUMN IF NOT EXISTS min_english_mark INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS requires_nbt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS nsfas_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tvet_alternative TEXT;

-- Update Engineering careers
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  min_math_mark = 60,
  tvet_alternative = 'Engineering Technician (TVET)'
WHERE career_category = 'Engineering' 
   OR career_code IN ('mechanical_engineer', 'civil_engineer', 'electrical_engineer', 'chemical_engineer');

-- Update Healthcare careers
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  requires_life_science = true,
  min_math_mark = 60
WHERE career_code IN ('medical_doctor', 'pharmacist', 'physiotherapist', 'occupational_therapist');

-- Update Nursing (accepts Math Lit)
UPDATE careers 
SET 
  requires_life_science = true,
  min_math_mark = 50
WHERE career_code = 'registered_nurse';

-- Update Tech careers
UPDATE careers 
SET 
  requires_core_math = true,
  min_math_mark = 60,
  tvet_alternative = 'IT Support Technician (TVET)'
WHERE career_code IN ('data_scientist', 'software_developer', 'ai_ml_engineer', 'cybersecurity_specialist');

-- Update Business/Finance
UPDATE careers 
SET 
  requires_core_math = true,
  min_math_mark = 60
WHERE career_code IN ('chartered_accountant', 'financial_analyst', 'actuary');

-- Update Math Lit careers
UPDATE careers 
SET 
  requires_core_math = false,
  min_math_mark = 40
WHERE career_code IN ('marketing_manager', 'hr_manager', 'graphic_designer', 'content_creator', 'chef');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_careers_requires_core_math ON careers(requires_core_math);
CREATE INDEX IF NOT EXISTS idx_careers_requires_physical_science ON careers(requires_physical_science);

-- Verify
SELECT 
  career_code,
  career_title,
  requires_core_math,
  requires_physical_science,
  min_math_mark,
  tvet_alternative
FROM careers
WHERE requires_core_math = true OR requires_physical_science = true
ORDER BY career_category, career_title
LIMIT 10;
```

### Step 4: Click "Run"

You should see output showing 10 careers with their gate metadata.

### Step 5: Verify It Worked

Run this in your terminal:

```bash
node scripts/update-careers-via-api.js
```

You should see:
```
✅ Migration complete!

Sample careers with gate metadata:
┌─────────┬──────────────────┬────────────────────┬──────────────────────────────┐
│ (index) │ career_code      │ requires_core_math │ requires_physical_science    │
├─────────┼──────────────────┼────────────────────┼──────────────────────────────┤
│    0    │ 'data_scientist' │       true         │           true               │
└─────────┴──────────────────┴────────────────────┴──────────────────────────────┘
```

---

## After SQL is Run

Once the SQL executes successfully, we can immediately:

1. **Test gates** (10 min)
   ```bash
   node scripts/test-gates-scenarios.js
   ```

2. **Integrate with RAG** (4 hours)
   - Follow `.kiro/specs/gated-rag-system/INTEGRATION-GUIDE.md`

3. **Deploy to staging** (1 hour)
   - Test with real student profiles

---

## Why We Can't Do This Automatically

Supabase doesn't allow `ALTER TABLE` commands via the JavaScript client for security reasons. You need to:
- Use the Supabase Dashboard SQL Editor (recommended)
- Use `psql` command line tool (if installed)
- Use Supabase CLI (if installed)

The Dashboard is the easiest option - just copy/paste and click Run.

---

## Troubleshooting

### Error: "column already exists"
**Solution**: Columns already added! Skip to verification step.

### Error: "permission denied"
**Solution**: Make sure you're logged into the correct Supabase project.

### Error: "relation careers does not exist"
**Solution**: Wrong database. Check you're in the right project.

---

## Time Estimate

- Open Dashboard: 30 seconds
- Copy/paste SQL: 30 seconds
- Click Run: 5 seconds
- Verify: 30 seconds
- **Total: 2 minutes**

---

**Ready?** Open Supabase Dashboard and run the SQL above.

Then run: `node scripts/update-careers-via-api.js` to verify.
