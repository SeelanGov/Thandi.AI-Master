// Simple script to add gate fields to careers table

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addGateFields() {
  console.log('🔧 Adding gate fields to careers table...\n');

  try {
    // First, check current schema
    const { data: sample, error: sampleError } = await supabase
      .from('careers')
      .select('*')
      .limit(1);

    if (sampleError) throw sampleError;

    const existingFields = Object.keys(sample[0] || {});
    console.log('Current fields:', existingFields.join(', '));

    // Check if gate fields already exist
    const hasGateFields = existingFields.includes('requires_core_math');
    
    if (hasGateFields) {
      console.log('\n✓ Gate fields already exist!');
      
      // Show sample data
      const { data: careers } = await supabase
        .from('careers')
        .select('career_code, career_title, requires_core_math, requires_physical_science, min_math_mark')
        .limit(5);
      
      console.log('\nSample careers:');
      console.table(careers);
      
      return;
    }

    console.log('\n⚠️  Gate fields not found in schema.');
    console.log('\nYou need to run this SQL in Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(`
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
WHERE career_category = 'Engineering';

-- Update Healthcare careers
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  requires_life_science = true,
  min_math_mark = 60
WHERE career_code IN ('medical_doctor', 'pharmacist', 'physiotherapist');

-- Update Tech careers
UPDATE careers 
SET 
  requires_core_math = true,
  min_math_mark = 60
WHERE career_code IN ('data_scientist', 'software_developer', 'ai_ml_engineer');
    `);
    console.log('='.repeat(60));
    console.log('\nAfter running the SQL, run this script again to verify.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addGateFields();
