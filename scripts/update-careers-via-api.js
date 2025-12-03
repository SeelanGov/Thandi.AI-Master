// Update careers via Supabase API (works without SQL access)
// This adds gate metadata to existing careers

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateCareersViaAPI() {
  console.log('🔧 Updating careers with gate metadata via API...\n');
  console.log('⚠️  Note: This assumes gate fields already exist in the database.');
  console.log('If you get errors, run the SQL in Supabase Dashboard first.\n');

  try {
    let updated = 0;
    let errors = 0;

    // 1. Mechanical Engineer
    console.log('1. Updating Mechanical Engineer...');
    const { data: engData, error: engError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: true,
        min_math_mark: 60,
        min_english_mark: 50,
        tvet_alternative: 'Engineering Technician (TVET)'
      })
      .eq('career_code', 'mechanical_engineer')
      .select('career_code');

    if (engError) {
      console.log('   ❌ Error:', engError.message);
      if (engError.message.includes('column')) {
        console.log('\n⚠️  Gate fields don\'t exist yet!');
        console.log('You need to add the columns first. Run this SQL in Supabase Dashboard:\n');
        console.log('ALTER TABLE careers');
        console.log('ADD COLUMN IF NOT EXISTS requires_core_math BOOLEAN DEFAULT false,');
        console.log('ADD COLUMN IF NOT EXISTS requires_physical_science BOOLEAN DEFAULT false,');
        console.log('ADD COLUMN IF NOT EXISTS requires_life_science BOOLEAN DEFAULT false,');
        console.log('ADD COLUMN IF NOT EXISTS min_math_mark INTEGER,');
        console.log('ADD COLUMN IF NOT EXISTS min_english_mark INTEGER DEFAULT 50,');
        console.log('ADD COLUMN IF NOT EXISTS requires_nbt BOOLEAN DEFAULT true,');
        console.log('ADD COLUMN IF NOT EXISTS nsfas_eligible BOOLEAN DEFAULT true,');
        console.log('ADD COLUMN IF NOT EXISTS tvet_alternative TEXT;\n');
        process.exit(1);
      }
      errors++;
    } else {
      console.log(`   ✓ Updated ${engData?.length || 0} careers`);
      updated += engData?.length || 0;
    }

    // 2. Medical Doctor
    console.log('2. Updating Medical Doctor...');
    const { data: medData, error: medError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: true,
        requires_life_science: true,
        min_math_mark: 70,
        min_english_mark: 60
      })
      .eq('career_code', 'medical_doctor')
      .select('career_code');

    if (medError) {
      console.log('   ❌ Error:', medError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${medData?.length || 0} careers`);
      updated += medData?.length || 0;
    }

    // 3. Physiotherapist
    console.log('3. Updating Physiotherapist...');
    const { data: physioData, error: physioError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: true,
        requires_life_science: true,
        min_math_mark: 60,
        min_english_mark: 50
      })
      .eq('career_code', 'physiotherapist')
      .select('career_code');

    if (physioError) {
      console.log('   ❌ Error:', physioError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${physioData?.length || 0} careers`);
      updated += physioData?.length || 0;
    }

    // 4. Registered Nurse
    console.log('4. Updating Registered Nurse...');
    const { data: nurseData, error: nurseError } = await supabase
      .from('careers')
      .update({
        requires_core_math: false,
        requires_life_science: true,
        min_math_mark: 50,
        min_english_mark: 50
      })
      .eq('career_code', 'registered_nurse')
      .select('career_code');

    if (nurseError) {
      console.log('   ❌ Error:', nurseError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${nurseData?.length || 0} careers`);
      updated += nurseData?.length || 0;
    }

    // 5. Data Scientist
    console.log('5. Updating Data Scientist...');
    const { data: dsData, error: dsError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: false,
        min_math_mark: 65,
        min_english_mark: 50,
        tvet_alternative: 'IT Support Technician (TVET)'
      })
      .eq('career_code', 'data_scientist')
      .select('career_code');

    if (dsError) {
      console.log('   ❌ Error:', dsError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${dsData?.length || 0} careers`);
      updated += dsData?.length || 0;
    }

    // 6. Software Developer
    console.log('6. Updating Software Developer...');
    const { data: swData, error: swError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: false,
        min_math_mark: 60,
        min_english_mark: 50,
        tvet_alternative: 'IT Support Technician (TVET)'
      })
      .eq('career_code', 'software_developer')
      .select('career_code');

    if (swError) {
      console.log('   ❌ Error:', swError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${swData?.length || 0} careers`);
      updated += swData?.length || 0;
    }

    // 7. Chartered Accountant
    console.log('7. Updating Chartered Accountant...');
    const { data: caData, error: caError } = await supabase
      .from('careers')
      .update({
        requires_core_math: true,
        requires_physical_science: false,
        min_math_mark: 65,
        min_english_mark: 50
      })
      .eq('career_code', 'chartered_accountant')
      .select('career_code');

    if (caError) {
      console.log('   ❌ Error:', caError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${caData?.length || 0} careers`);
      updated += caData?.length || 0;
    }

    // 8. Corporate Lawyer
    console.log('8. Updating Corporate Lawyer...');
    const { data: lawData, error: lawError } = await supabase
      .from('careers')
      .update({
        requires_core_math: false,
        requires_physical_science: false,
        min_math_mark: 40,
        min_english_mark: 70
      })
      .eq('career_code', 'corporate_lawyer')
      .select('career_code');

    if (lawError) {
      console.log('   ❌ Error:', lawError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${lawData?.length || 0} careers`);
      updated += lawData?.length || 0;
    }

    // 9. High School Teacher
    console.log('9. Updating High School Teacher...');
    const { data: teachData, error: teachError } = await supabase
      .from('careers')
      .update({
        requires_core_math: false,
        requires_physical_science: false,
        min_math_mark: 50,
        min_english_mark: 60
      })
      .eq('career_code', 'high_school_teacher')
      .select('career_code');

    if (teachError) {
      console.log('   ❌ Error:', teachError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${teachData?.length || 0} careers`);
      updated += teachData?.length || 0;
    }

    // 10. Social Entrepreneur
    console.log('10. Updating Social Entrepreneur...');
    const { data: socialData, error: socialError } = await supabase
      .from('careers')
      .update({
        requires_core_math: false,
        requires_physical_science: false,
        min_math_mark: 40,
        min_english_mark: 50
      })
      .eq('career_code', 'social_entrepreneur')
      .select('career_code');

    if (socialError) {
      console.log('   ❌ Error:', socialError.message);
      errors++;
    } else {
      console.log(`   ✓ Updated ${socialData?.length || 0} careers`);
      updated += socialData?.length || 0;
    }

    // Verify
    console.log('\n11. Verifying updates...');
    const { data: verification, error: verifyError } = await supabase
      .from('careers')
      .select('career_code, career_title, requires_core_math, requires_physical_science, min_math_mark, tvet_alternative')
      .or('requires_core_math.eq.true,requires_physical_science.eq.true')
      .limit(10);

    if (verifyError) {
      console.log('   ❌ Verification error:', verifyError.message);
    } else {
      console.log('\n✅ Migration complete!\n');
      console.log('Sample careers with gate metadata:');
      console.table(verification);
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total careers updated: ${updated}`);
      console.log(`   Errors: ${errors}`);
      
      console.log('\n🎯 Next steps:');
      console.log('1. Run: node scripts/test-gates-scenarios.js');
      console.log('2. Review test results');
      console.log('3. Proceed with integration');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateCareersViaAPI();
