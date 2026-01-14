// Check School Database Status
// Verify if seed data has been loaded

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchoolDatabase() {
  console.log('🔍 CHECKING SCHOOL DATABASE STATUS');
  console.log('===================================\n');

  // Check total schools
  const { count, error } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Total schools in database: ${count}`);
  console.log(`📊 Expected schools from seed file: 3,899`);
  
  if (count < 100) {
    console.log('\n⚠️  CRITICAL ISSUE IDENTIFIED:');
    console.log('   The school seed data has NOT been loaded!');
    console.log('   Only pilot schools exist in the database.');
    console.log('\n📋 SOLUTION:');
    console.log('   1. Run the seed-school-auth.sql file in Supabase SQL Editor');
    console.log('   2. This will add all 3,899 South African schools');
    console.log('   3. Students will then be able to find their schools');
  } else {
    console.log('\n✅ School database is properly seeded');
  }

  // Show sample of what's in database
  const { data: samples } = await supabase
    .from('schools')
    .select('name, province, type')
    .limit(5);

  console.log('\n📋 Current schools in database:');
  samples?.forEach(school => {
    console.log(`   - ${school.name} (${school.province})`);
  });
}

checkSchoolDatabase().catch(console.error);
