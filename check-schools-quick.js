import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchools() {
  console.log('🏫 Checking available schools...');
  
  const { data: schools, error } = await supabase
    .from('school_master')
    .select('school_id, name, type, province')
    .limit(10);
    
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('📊 Available schools:');
  schools.forEach(school => {
    console.log(`   ${school.school_id} - ${school.name} (${school.type})`);
  });
  
  // Test the specific school ID used in tests
  const { data: testSchool, error: testError } = await supabase
    .from('school_master')
    .select('school_id, name, type')
    .eq('school_id', 'ZAF-P-500215340')
    .single();
    
  console.log('\n🔍 Test school lookup:');
  if (testError) {
    console.log('❌ Test school not found:', testError.message);
  } else {
    console.log('✅ Test school found:', testSchool);
  }
}

checkSchools().catch(console.error);