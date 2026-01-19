/**
 * SIMPLE SCHOOL_ID MIGRATION VERIFICATION
 * Tests database migration and registration flow
 * Date: January 14, 2026
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test data
const TEST_SCHOOL_ID = 'test-school-' + Date.now();
const TEST_STUDENT_EMAIL = `test-${Date.now()}@example.com`;

async function runTests() {
  console.log('🔍 SCHOOL_ID MIGRATION VERIFICATION');
  console.log('='.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;
  let total = 0;

  // ========================================
  // TEST 1: Create test school with VARCHAR id
  // ========================================
  console.log('TEST 1: Create test school with VARCHAR id');
  total++;
  let testSchoolCreated = false;
  
  try {
    const { data, error } = await supabase
      .from('schools')
      .insert({
        id: TEST_SCHOOL_ID,
        name: 'Test School for Migration',
        province: 'Gauteng',
        district: 'Test District',
        emis_number: 'TEST' + Date.now()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ PASSED: School created with VARCHAR id');
    console.log(`   School ID: ${TEST_SCHOOL_ID}`);
    testSchoolCreated = true;
    passed++;
  } catch (err) {
    console.log('❌ FAILED:', err.message);
    failed++;
  }
  console.log('');

  // ========================================
  // TEST 2: Create student with VARCHAR school_id
  // ========================================
  console.log('TEST 2: Create student with VARCHAR school_id');
  total++;
  let testStudentCreated = false;
  
  if (testSchoolCreated) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          email: TEST_STUDENT_EMAIL,
          first_name: 'Test',
          last_name: 'Student',
          grade: 10,
          school_id: TEST_SCHOOL_ID
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ PASSED: Student created with school association');
      console.log(`   Student email: ${TEST_STUDENT_EMAIL}`);
      console.log(`   School ID: ${data.school_id}`);
      testStudentCreated = true;
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      console.log('   This is the critical test - if this fails, the migration did not work');
      failed++;
    }
  } else {
    console.log('⏭️  SKIPPED: School creation failed');
    failed++;
  }
  console.log('');

  // ========================================
  // TEST 3: Query student with school join
  // ========================================
  console.log('TEST 3: Query student with school join');
  total++;
  
  if (testStudentCreated) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, schools(*)')
        .eq('school_id', TEST_SCHOOL_ID)
        .single();
      
      if (error) throw error;
      
      const hasSchoolData = data?.schools?.name === 'Test School for Migration';
      
      if (hasSchoolData) {
        console.log('✅ PASSED: Student-school relationship works');
        console.log(`   School name: ${data.schools.name}`);
        console.log(`   Student: ${data.first_name} ${data.last_name}`);
        passed++;
      } else {
        console.log('❌ FAILED: School data not joined correctly');
        failed++;
      }
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  } else {
    console.log('⏭️  SKIPPED: Student creation failed');
    failed++;
  }
  console.log('');

  // ========================================
  // TEST 4: Simulate registration flow
  // ========================================
  console.log('TEST 4: Simulate registration flow');
  total++;
  
  if (testSchoolCreated) {
    try {
      const flowEmail = `flow-test-${Date.now()}@example.com`;
      
      const { data, error } = await supabase
        .from('students')
        .insert({
          email: flowEmail,
          first_name: 'Flow',
          last_name: 'Test',
          grade: 11,
          school_id: TEST_SCHOOL_ID
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ PASSED: Registration flow works');
      console.log(`   New student: ${flowEmail}`);
      console.log(`   Associated with school: ${TEST_SCHOOL_ID}`);
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      console.log('   Registration flow broken - this is what users will experience');
      failed++;
    }
  } else {
    console.log('⏭️  SKIPPED: School creation failed');
    failed++;
  }
  console.log('');

  // ========================================
  // TEST 5: Verify no UUID errors
  // ========================================
  console.log('TEST 5: Verify no UUID type errors');
  total++;
  
  try {
    // Try to insert with a non-UUID string (this would fail if column was still UUID)
    const nonUuidId = 'definitely-not-a-uuid-' + Date.now();
    
    const { data, error } = await supabase
      .from('schools')
      .insert({
        id: nonUuidId,
        name: 'Non-UUID Test School',
        province: 'Western Cape',
        district: 'Test',
        emis_number: 'NOUUID' + Date.now()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ PASSED: VARCHAR accepts non-UUID strings');
    console.log(`   Created school with id: ${nonUuidId}`);
    
    // Clean up
    await supabase.from('schools').delete().eq('id', nonUuidId);
    
    passed++;
  } catch (err) {
    if (err.message.includes('uuid')) {
      console.log('❌ FAILED: Column still expects UUID format');
      console.log('   Error:', err.message);
    } else {
      console.log('❌ FAILED:', err.message);
    }
    failed++;
  }
  console.log('');

  // ========================================
  // CLEANUP
  // ========================================
  console.log('🧹 Cleaning up test data...');
  
  try {
    await supabase
      .from('students')
      .delete()
      .or(`email.eq.${TEST_STUDENT_EMAIL},email.like.flow-test-%`);
    
    await supabase
      .from('schools')
      .delete()
      .eq('id', TEST_SCHOOL_ID);
    
    console.log('✅ Test data cleaned up');
  } catch (err) {
    console.log('⚠️  Cleanup warning:', err.message);
  }
  console.log('');

  // ========================================
  // FINAL REPORT
  // ========================================
  console.log('='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ Database migration successful');
    console.log('✅ school_id columns are VARCHAR');
    console.log('✅ Foreign key relationships work');
    console.log('✅ Registration flow functional');
    console.log('✅ No UUID type errors');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION DEPLOYMENT');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test registration flow in browser');
    console.log('2. Verify existing data still accessible');
    console.log('3. Deploy to production when ready');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('');
    console.log('The migration may not have completed successfully.');
    console.log('Review the errors above and check:');
    console.log('1. Was the SQL script executed in Supabase?');
    console.log('2. Did all phases complete without errors?');
    console.log('3. Are RLS policies enabled?');
  }

  console.log('');
  console.log('='.repeat(60));

  return { passed, failed, total };
}

// Run tests
runTests()
  .then(({ passed, failed }) => {
    process.exit(failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
