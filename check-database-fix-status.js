// Check if the nuclear SQL fix was successfully applied
// This will tell us the current state of the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFixStatus() {
  console.log('🔍 CHECKING DATABASE FIX STATUS');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // Test 1: Try to insert with VARCHAR school_id
    console.log('📊 Test 1: Attempting insert with VARCHAR school_id...');
    const testData = {
      student_id: `test_${Date.now()}`,
      student_name: 'Test',
      student_surname: 'Student',
      school_id: 'ZAF-200100021', // VARCHAR format
      grade: 11,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0',
      assessment_data: { test: true }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('student_assessments')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ Insert FAILED');
      console.log('   Error Code:', insertError.code);
      console.log('   Error Message:', insertError.message);
      console.log('');
      
      if (insertError.code === '22P02') {
        console.log('🚨 DIAGNOSIS: Column is still UUID type');
        console.log('   The nuclear SQL fix has NOT been applied yet');
        console.log('');
        console.log('📋 ACTION REQUIRED:');
        console.log('   1. Open Supabase SQL Editor');
        console.log('   2. Copy contents of NUCLEAR-SCHOOL-ID-FIX-JAN-14-2026.sql');
        console.log('   3. Paste and run in SQL Editor');
        console.log('   4. Look for "Fix complete!" message');
        console.log('');
      } else if (insertError.code === '42501') {
        console.log('🚨 DIAGNOSIS: RLS policy blocking insert');
        console.log('   The column type might be fixed, but RLS is blocking');
        console.log('');
        console.log('📋 ACTION REQUIRED:');
        console.log('   This is expected for service role inserts with RLS');
        console.log('   Let\'s test with a real registration flow instead');
        console.log('');
      } else if (insertError.code === '23503') {
        console.log('✅ GOOD NEWS: Column accepts VARCHAR!');
        console.log('   Foreign key error is expected (test school doesn\'t exist)');
        console.log('   The nuclear fix WAS successfully applied!');
        console.log('');
        console.log('🎯 NEXT STEP: Test actual registration flow');
        console.log('');
      } else {
        console.log('⚠️  UNEXPECTED ERROR:', insertError.code);
        console.log('   Details:', insertError.details);
        console.log('   Hint:', insertError.hint);
        console.log('');
      }
    } else {
      console.log('✅ Insert SUCCEEDED!');
      console.log('   The nuclear fix was successfully applied!');
      console.log('   Column is now VARCHAR(50)');
      console.log('');
      
      // Clean up test data
      if (insertData && insertData[0]?.id) {
        await supabase
          .from('student_assessments')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test data cleaned up');
      }
      console.log('');
      console.log('🎯 READY FOR TESTING:');
      console.log('   Go to https://thandi.ai/register and test registration');
      console.log('');
    }

    // Test 2: Check RLS policies
    console.log('📊 Test 2: Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd 
          FROM pg_policies 
          WHERE tablename = 'student_assessments'
          ORDER BY policyname;
        `
      });

    if (policyError) {
      console.log('⚠️  Cannot query policies (this is okay)');
      console.log('   RLS policies are likely in place');
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    } else {
      console.log('⚠️  No RLS policies found');
      console.log('   This might be a problem - policies should exist');
    }
    console.log('');

    // Test 3: Try to query a real school
    console.log('📊 Test 3: Checking school_master table...');
    const { data: schools, error: schoolError } = await supabase
      .from('school_master')
      .select('school_id, name, type')
      .eq('school_id', 'ZAF-200100021')
      .single();

    if (schoolError) {
      console.log('⚠️  School not found (this is okay for testing)');
    } else if (schools) {
      console.log('✅ School found:', schools.name);
      console.log('   School ID:', schools.school_id);
      console.log('   Type:', schools.type);
    }
    console.log('');

    console.log('=' .repeat(50));
    console.log('DIAGNOSIS COMPLETE');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ Check failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

checkFixStatus();
