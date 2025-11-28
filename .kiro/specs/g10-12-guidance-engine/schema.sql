-- G10-12 Guidance Engine - Lean Schema
-- Deploy to Supabase SQL Editor

-- Table 1: g10_correction_gates
CREATE TABLE g10_correction_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_choice TEXT NOT NULL,
  career_category TEXT NOT NULL,
  reversible_until TEXT NOT NULL,
  reversible_date DATE,
  minimum_g11_threshold JSONB,
  alternative_pathway TEXT,
  warning_message JSONB,
  UNIQUE(subject_choice, career_category)
);

-- Table 2: institution_gates
CREATE TABLE institution_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  qualification_name TEXT,
  aps_min INTEGER,
  subject_rules JSONB,
  disqualifiers JSONB,
  UNIQUE(institution_name, qualification_id)
);

-- Table 3: g12_logistics
CREATE TABLE g12_logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id TEXT NOT NULL,
  lo_excluded BOOLEAN DEFAULT false,
  portfolio_deadline DATE,
  nbt_required BOOLEAN DEFAULT false,
  calculation_method TEXT,
  interview_required BOOLEAN DEFAULT false,
  additional_requirements JSONB,
  FOREIGN KEY (qualification_id) REFERENCES institution_gates(qualification_id) ON DELETE CASCADE
);

-- Enable RLS (but leave open for now)
ALTER TABLE g10_correction_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE g12_logistics ENABLE ROW LEVEL SECURITY;

-- Seed stub data (covers diagnostic cases)

-- G10: Maths Lit → Civil Engineer (critical warning)
INSERT INTO g10_correction_gates VALUES (
  gen_random_uuid(),
  'Maths Literacy',
  'Engineering',
  'Term 3, Week 5 (June 15)',
  '2025-06-15',
  '{"core_maths": 60, "physical_science": 55}',
  'Consider Engineering Drafting NC(V) at TVET',
  '{"en": "CRITICAL: Switch to Core Maths before June 15. STEM pathways closed thereafter.", "zu": "KUBALULEKILE: Shintsha ku-Maths Core ngo-June 15. Amaphrojekthi we-STEM avalekile emva kwalokho."}'
);

-- G11: BSc CS at Wits (gate)
INSERT INTO institution_gates VALUES (
  gen_random_uuid(),
  'SAQA_94721',
  'University of the Witwatersrand',
  'BSc Computer Science',
  34,
  '[{"subject": "Core Mathematics", "min_mark": 65, "required": true}, {"subject": "Physical Science", "min_mark": 60, "required": false}]',
  '["Maths Literacy", "APS < 34", "Core Maths < 65%"]'
);

-- G12: Architecture at UP (logistics)
INSERT INTO institution_gates VALUES (
  gen_random_uuid(),
  'SAQA_53477',
  'University of Pretoria',
  'Architecture',
  30,
  '[{"subject": "Mathematics", "min_mark": 50, "required": true}]',
  '["APS < 30"]'
);

INSERT INTO g12_logistics VALUES (
  gen_random_uuid(),
  'SAQA_53477',
  true,
  '2025-08-31',
  false,
  'G11 finals + G12 Sept results',
  true,
  '[{"item": "Portfolio", "deadline": "2025-08-31", "weight": "50%"}, {"item": "Interview", "scheduled": "October 2025"}]'
);
