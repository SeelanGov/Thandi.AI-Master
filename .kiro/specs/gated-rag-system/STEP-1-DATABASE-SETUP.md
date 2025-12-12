# Step 1: Database Setup for Gate System

## Status: READY TO EXECUTE

You need to add gate-specific fields to your `careers` table before the gate system can work.

## What to Do (5 minutes)

### Option A: Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project → SQL Editor
3. Copy and paste the SQL below
4. Click "Run"

### Option B: Command Line

```bash
# If you have psql installed
psql $DATABASE_URL < scripts/add-gate-fields-to-careers.sql
```

## SQL to Run

```sql
-- Add gate-specific fields to careers table
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

-- Update Healthcare careers requiring sciences
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  requires_life_science = true,
  min_math_mark = 60
WHERE career_code IN ('medical_doctor', 'pharmacist', 'physiotherapist', 'occupational_therapist');

-- Nursing (accepts Math Lit)
UPDATE careers 
SET 
  requires_life_science = true,
  min_math_mark = 50
WHERE career_code = 'registered_nurse';

-- Data Science / Tech (requires Math, not necessarily Physical Science)
UPDATE careers 
SET 
  requires_core_math = true,
  min_math_mark = 60,
  tvet_alternative = 'IT Support Technician (TVET)'
WHERE career_code IN ('data_scientist', 'software_developer', 'ai_ml_engineer', 'cybersecurity_specialist');

-- Business/Finance (requires Math)
UPDATE careers 
SET 
  requires_core_math = true,
  min_math_mark = 60
WHERE career_code IN ('chartered_accountant', 'financial_analyst', 'actuary');

-- Careers that accept Math Literacy
UPDATE careers 
SET 
  requires_core_math = false,
  min_math_mark = 40
WHERE career_code IN ('marketing_manager', 'hr_manager', 'graphic_designer', 'content_creator', 'chef');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_careers_requires_core_math ON careers(requires_core_math);
CREATE INDEX IF NOT EXISTS idx_careers_requires_physical_science ON careers(requires_physical_science);

-- Verify the changes
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

## Expected Result

You should see output like:

| career_code | career_title | requires_core_math | requires_physical_science | min_math_mark | tvet_alternative |
|-------------|--------------|-------------------|---------------------------|---------------|------------------|
| mechanical_engineer | Mechanical Engineer | true | true | 60 | Engineering Technician (TVET) |
| data_scientist | Data Scientist | true | false | 60 | IT Support Technician (TVET) |
| medical_doctor | Medical Doctor | true | true | 60 | null |

## Verification

After running the SQL, verify it worked:

```bash
node scripts/add-gate-fields-simple.js
```

You should see:
```
✓ Gate fields already exist!

Sample careers:
┌─────────┬──────────────────┬────────────────────┬──────────────────────────────┐
│ (index) │ career_code      │ requires_core_math │ requires_physical_science    │
├─────────┼──────────────────┼────────────────────┼──────────────────────────────┤
│    0    │ 'data_scientist' │       true         │           false              │
└─────────┴──────────────────┴────────────────────┴──────────────────────────────┘
```

## What These Fields Do

### `requires_core_math`
- **true**: Career needs Pure Mathematics (not Math Literacy)
- **false**: Career accepts Math Literacy
- **Example**: Engineering = true, Marketing = false

### `requires_physical_science`
- **true**: Career needs Physical Sciences subject
- **false**: Career doesn't require it
- **Example**: Chemical Engineering = true, Software Dev = false

### `min_math_mark`
- Minimum Math percentage needed
- **Example**: Medicine = 70%, Nursing = 50%

### `tvet_alternative`
- TVET pathway if student doesn't qualify for university
- **Example**: "Engineering Technician (TVET)"

## Next Steps

Once you've run the SQL and verified it worked:

1. ✅ Database fields added
2. ⏭️ **Next**: Run gate tests
   ```bash
   node scripts/test-gates-scenarios.js
   ```

3. ⏭️ **Then**: Integrate with RAG system

## Troubleshooting

### Error: "column already exists"
- **Solution**: Fields already added, you're good to go!
- Run verification: `node scripts/add-gate-fields-simple.js`

### Error: "permission denied"
- **Solution**: Make sure you're using SUPABASE_SERVICE_ROLE_KEY (not anon key)
- Check `.env.local` has the correct key

### Error: "relation careers does not exist"
- **Solution**: Wrong database or schema
- Verify you're connected to the right Supabase project

## Time Estimate

- **SQL execution**: 30 seconds
- **Verification**: 1 minute
- **Total**: 2 minutes

---

**Ready?** Copy the SQL above, paste into Supabase SQL Editor, and click Run.

Then come back and run: `node scripts/add-gate-fields-simple.js` to verify.
