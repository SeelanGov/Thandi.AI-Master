-- G10-12 Guidance Engine - Schema Setup
-- This file creates tables if they don't exist

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS g12_logistics CASCADE;
DROP TABLE IF EXISTS institution_gates CASCADE;
DROP TABLE IF EXISTS g10_correction_gates CASCADE;

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
  additional_requirements JSONB
);
