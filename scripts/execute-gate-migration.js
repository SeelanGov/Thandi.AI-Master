// Execute gate migration directly via Supabase client

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeMigration() {
  console.log('🔧 Executing gate migration...\n');

  try {
    // Step 1: Check if columns exist by trying to select them
    console.log('Step 1: Checking current schema...');
    
    const { data: sample, error: schemaError } = await supabase
      .from('careers')
      .select('career_code, requires_core_math')
      .limit(1);

    if (schemaError && schemaError.message.includes('column')) {
      console.log('⚠️  Gate fields not found.');
      console.log('\n📋 Creating SQL file for manual execution...\n');
      
      const sqlContent = fs.readFileSync('./scripts/add-gate-fields-to-careers.sql', 'utf8');
      
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the SQL from: scripts/add-gate-fields-to-careers.sql');
      console.log('5. Click "Run"');
      console.log('6. Run this script again\n');
      
      console.log('Or copy this SQL:\n');
      console.log('='.repeat(60));
      console.log(sqlContent);
      console.log('='.repeat(60));
      
      process.exit(0);
    }

    console.log('✓ Gate fields exist\n');

    // Step 2: Update Engineering careers
    console.log('Step 2: Updating Engineering careers...');
    const { error: engError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: true,
        min_math_mark: 60,
        tvet_alternative: 'Engineering Technician (TVET)'
      })
      .or('career_category.eq.Engineering,career_code.in.(mechanical_engineer,civil_engineer,electrical_engineer,chemical_engineer)');

    if (engError) console.log('⚠️  Engineering update:', engError.message);
    else console.log('✓ Engineering careers updated\n');

    // Step 3: Update Healthcare careers
    console.log('Step 3: Updating Healthcare careers...');
    const { error: healthError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: true,
        requires_life_science: true,
        min_math_mark: 60
      })
      .in('career_code', ['medical_doctor', 'pharmacist', 'physiotherapist', 'occupational_therapist']);

    if (healthError) console.log('⚠️  Healthcare update:', healthError.message);
    else console.log('✓ Healthcare careers updated\n');

    // Step 4: Update Nursing
    console.log('Step 4: Updating Nursing...');
    const { error: nurseError } = await supabase
      .from('careers')
      .update({
        requires_life_science: true,
        min_math_mark: 50
      })
      .eq('career_code', 'registered_nurse');

    if (nurseError) console.log('⚠️  Nursing update:', nurseError.message);
    else console.log('✓ Nursing updated\n');

    // Step 5: Update Tech careers
    console.log('Step 5: Updating Tech careers...');
    const { error: techError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        min_math_mark: 60,
        tvet_alternative: 'IT Support Technician (TVET)'
      })
      .in('career_code', ['data_scientist', 'software_developer', 'ai_ml_engineer', 'cybersecurity_specialist']);

    if (techError) console.log('⚠️  Tech update:', techError.message);
    else console.log('✓ Tech careers updated\n');

    // Step 6: Update Business/Finance
    console.log('Step 6: Updating Business/Finance careers...');
    const { error: bizError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        min_math_mark: 60
      })
      .in('career_code', ['chartered_accountant', 'financial_analyst', 'actuary']);

    if (bizError) console.log('⚠️  Business update:', bizError.message);
    else console.log('✓ Business careers updated\n');

    // Step 7: Update Math Lit careers
    console.log('Step 7: Updating Math Literacy-friendly careers...');
    const { error: mathLitError } = await supabase
      .from('careers')
      .update({
        requires_core_math: false,
        min_math_mark: 40
      })
      .in('career_code', ['marketing_manager', 'hr_manager', 'graphic_designer', 'content_creator', 'chef']);

    if (mathLitError) console.log('⚠️  Math Lit update:', mathLitError.message);
    else console.log('✓ Math Lit careers updated\n');

    // Step 8: Verify
    console.log('Step 8: Verifying migration...\n');
    const { data: verification, error: verifyError } = await supabase
      .from('careers')
      .select('career_code, career_title, requires_core_math, requires_physical_science, min_math_mark, tvet_alternative')
      .or('requires_core_math.eq.true,requires_physical_science.eq.true')
      .limit(10);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log('✅ Migration complete! Sample careers:\n');
    console.table(verification);

    console.log('\n📊 Summary:');
    console.log('✓ Gate fields added to careers table');
    console.log('✓ Engineering careers configured');
    console.log('✓ Healthcare careers configured');
    console.log('✓ Tech careers configured');
    console.log('✓ Business careers configured');
    console.log('✓ Math Lit careers configured');

    console.log('\n🎯 Next steps:');
    console.log('1. Run: node scripts/test-gates-scenarios.js');
    console.log('2. Review test results');
    console.log('3. Proceed with integration');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

executeMigration();
