// Diagnose School Search Issue - Live Testing
// Students cannot find their schools

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseSchoolSearch() {
  console.log('🔍 DIAGNOSING SCHOOL SEARCH ISSUE');
  console.log('=================================\n');

  // Test 1: Check if schools table exists and has data
  console.log('📊 Test 1: Checking schools table...');
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('*')
    .limit(10);

  if (schoolsError) {
    console.error('❌ Error querying schools:', schoolsError);
  } else {
    console.log(`✅ Found ${schools?.length || 0} schools in database`);
    if (schools && schools.length > 0) {
      console.log('\nSample schools:');
      schools.slice(0, 3).forEach(school => {
        console.log(`  - ${school.name} (${school.school_code || 'no code'})`);
      });
    }
  }

  // Test 2: Check total school count
  console.log('\n📊 Test 2: Checking total school count...');
  const { count, error: countError } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting schools:', countError);
  } else {
    console.log(`✅ Total schools in database: ${count}`);
  }

  // Test 3: Search for "effingham" (from screenshot)
  console.log('\n🔍 Test 3: Searching for "effingham"...');
  const { data: searchResults, error: searchError } = await supabase
    .from('schools')
    .select('*')
    .ilike('name', '%effingham%');

  if (searchError) {
    console.error('❌ Error searching for effingham:', searchError);
  } else {
    console.log(`✅ Found ${searchResults?.length || 0} schools matching "effingham"`);
    if (searchResults && searchResults.length > 0) {
      searchResults.forEach(school => {
        console.log(`  - ${school.name}`);
        console.log(`    Code: ${school.school_code || 'N/A'}`);
        console.log(`    Province: ${school.province || 'N/A'}`);
      });
    }
  }

  // Test 4: Check RLS policies on schools table
  console.log('\n🔒 Test 4: Checking RLS policies...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_table_policies', { table_name: 'schools' })
    .catch(() => null);

  // Alternative: Check if we can query as anonymous user
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: anonSchools, error: anonError } = await anonSupabase
    .from('schools')
    .select('name, school_code')
    .limit(5);

  if (anonError) {
    console.error('❌ Anonymous users CANNOT query schools:', anonError.message);
    console.log('   This is likely the issue - RLS is blocking school search!');
  } else {
    console.log(`✅ Anonymous users CAN query schools (${anonSchools?.length || 0} results)`);
  }

  // Test 5: Check the API endpoint directly
  console.log('\n🌐 Test 5: Testing school search API...');
  try {
    const response = await fetch('https://www.thandi.online/api/schools/search?q=effingham');
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Results:`, data);
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }

  // Test 6: Check if school search component is using correct endpoint
  console.log('\n📝 Test 6: Checking registration component...');
  console.log('   Component should be using: /api/schools/search or direct Supabase query');
  console.log('   Need to verify the actual implementation');

  console.log('\n' + '='.repeat(80));
  console.log('📋 DIAGNOSIS SUMMARY');
  console.log('='.repeat(80));
  console.log('\nPossible Issues:');
  console.log('1. RLS policies blocking anonymous school queries');
  console.log('2. School search API endpoint not working');
  console.log('3. Frontend component using wrong API endpoint');
  console.log('4. Schools table is empty or missing data');
  console.log('5. Search query not matching school names correctly');
}

diagnoseSchoolSearch().catch(console.error);
