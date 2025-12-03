-- Add gate-specific fields to careers table
-- Run this migration to enable the gate system

-- Add gate fields
ALTER TABLE careers 
ADD COLUMN IF NOT EXISTS requires_core_math BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_physical_science BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_life_science BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_math_mark INTEGER,
ADD COLUMN IF NOT EXISTS min_english_mark INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS requires_nbt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS nsfas_eligible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tvet_alternative TEXT;

-- Update existing careers with gate logic based on required_subjects

-- 1. ENGINEERING: Mechanical Engineer
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  min_math_mark = 60,
  min_english_mark = 50,
  tvet_alternative = 'Engineering Technician (TVET)'
WHERE career_code = 'mechanical_engineer';

-- 2. HEALTHCARE: Medical Doctor
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  requires_life_science = true,
  min_math_mark = 70,
  min_english_mark = 60
WHERE career_code = 'medical_doctor';

-- 3. HEALTHCARE: Physiotherapist
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  requires_life_science = true,
  min_math_mark = 60,
  min_english_mark = 50
WHERE career_code = 'physiotherapist';

-- 4. HEALTHCARE: Registered Nurse (accepts Math Lit)
UPDATE careers 
SET 
  requires_core_math = false,
  requires_life_science = true,
  min_math_mark = 50,
  min_english_mark = 50
WHERE career_code = 'registered_nurse';

-- 5. TECHNOLOGY: Data Scientist
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = false,
  min_math_mark = 65,
  min_english_mark = 50,
  tvet_alternative = 'IT Support Technician (TVET)'
WHERE career_code = 'data_scientist';

-- 6. TECHNOLOGY: Software Developer
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = false,
  min_math_mark = 60,
  min_english_mark = 50,
  tvet_alternative = 'IT Support Technician (TVET)'
WHERE career_code = 'software_developer';

-- 7. BUSINESS: Chartered Accountant
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = false,
  min_math_mark = 65,
  min_english_mark = 50
WHERE career_code = 'chartered_accountant';

-- 8. LEGAL: Corporate Lawyer
UPDATE careers 
SET 
  requires_core_math = false,
  requires_physical_science = false,
  min_math_mark = 40,
  min_english_mark = 70
WHERE career_code = 'corporate_lawyer';

-- 9. EDUCATION: High School Teacher
UPDATE careers 
SET 
  requires_core_math = false,
  requires_physical_science = false,
  min_math_mark = 50,
  min_english_mark = 60
WHERE career_code = 'high_school_teacher';

-- 10. BUSINESS & SOCIAL IMPACT: Social Entrepreneur
UPDATE careers 
SET 
  requires_core_math = false,
  requires_physical_science = false,
  min_math_mark = 40,
  min_english_mark = 50
WHERE career_code = 'social_entrepreneur';

-- Create index for gate queries
CREATE INDEX IF NOT EXISTS idx_careers_requires_core_math ON careers(requires_core_math);
CREATE INDEX IF NOT EXISTS idx_careers_requires_physical_science ON careers(requires_physical_science);

-- Verify changes
SELECT 
  career_code,
  career_title,
  requires_core_math,
  requires_physical_science,
  min_math_mark,
  tvet_alternative
FROM careers
ORDER BY career_category, career_title
LIMIT 20;
