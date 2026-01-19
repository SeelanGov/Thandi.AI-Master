/**
 * COMPREHENSIVE SCHOOL_ID MIGRATION VERIFICATION
 * Tests database schema changes and registration flow
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

async function runComprehensiveTests() {
  console.log('🔍 COMPREHENSIVE SCHOOL_ID MIGRATION VERIFICATION');
  console.log('='.repeat(60));
  console.log('');

  const results = {
    schemaTests: [],
    rlsPolicyTests: [],
    dataIntegrityTests: [],
    registrationFlowTests: [],
    passed: 0,
    failed: 0,
    total: 0
  };

  try {
    // ========================================
    // PHASE 1: SCHEMA VERIFICATION
    // ========================================
    console.log('📋 PHASE 1: Schema Verification');
    console.log('-'.repeat(60));

    // Test 1.1: Verify schools.id is VARCHAR
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'schools' AND column_name = 'id'
        `
      });
      
      if (error) throw error;
      
      const isVarchar = data?.[0]?.data_type === 'character varying';
      const length = data?.[0]?.character_maximum_length;
      
      results.schemaTests.push({
        test: '1.1 schools.id is VARCHAR(255)',
        passed: isVarchar && length === 255,
        details: `Type: ${data?.[0]?.data_type}, Length: ${length}`
      });
      
      if (isVarchar && length === 255) {
        console.log('✅ schools.id is VARCHAR(255)');
        results.passed++;
      } else {
        console.log('❌ schools.id is NOT VARCHAR(255)');
        results.failed++;
      }
    } catch (err) {
      console.log('❌ Error checking schools.id:', err.message);
      results.schemaTests.push({
        test: '1.1 schools.id is VARCHAR(255)',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    // Test 1.2: Verify students.school_id is VARCHAR
    try {
      const { data, error } = await supabase
        .from('students')
        .select('school_id')
        .limit(1);
      
      if (error) throw error;
      
      // Check column type via information_schema
      const { data: typeData } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'students' AND column_name = 'school_id'
        `
      });
      
      const isVarchar = typeData?.[0]?.data_type === 'character varying';
      const length = typeData?.[0]?.character_maximum_length;
      
      results.schemaTests.push({
        test: '1.2 students.school_id is VARCHAR(255)',
        passed: isVarchar && length === 255,
        details: `Type: ${typeData?.[0]?.data_type}, Length: ${length}`
      });
      
      if (isVarchar && length === 255) {
        console.log('✅ students.school_id is VARCHAR(255)');
        results.passed++;
      } else {
        console.log('❌ students.school_id is NOT VARCHAR(255)');
        results.failed++;
      }
    } catch (err) {
      console.log('❌ Error checking students.school_id:', err.message);
      results.schemaTests.push({
        test: '1.2 students.school_id is VARCHAR(255)',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    // Test 1.3: Verify school_users.school_id is VARCHAR
    try {
      const { data: typeData } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'school_users' AND column_name = 'school_id'
        `
      });
      
      const isVarchar = typeData?.[0]?.data_type === 'character varying';
      const length = typeData?.[0]?.character_maximum_length;
      
      results.schemaTests.push({
        test: '1.3 school_users.school_id is VARCHAR(255)',
        passed: isVarchar && length === 255,
        details: `Type: ${typeData?.[0]?.data_type}, Length: ${length}`
      });
      
      if (isVarchar && length === 255) {
        console.log('✅ school_users.school_id is VARCHAR(255)');
        results.passed++;
      } else {
        console.log('❌ school_users.school_id is NOT VARCHAR(255)');
        results.failed++;
      }
    } catch (err) {
      console.log('❌ Error checking school_users.school_id:', err.message);
      results.schemaTests.push({
        test: '1.3 school_users.school_id is VARCHAR(255)',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    // Test 1.4: Verify student_assessments.school_id is VARCHAR
    try {
      const { data: typeData } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT data_type, character_maximum_length 
          FROM information_schema.columns 
          WHERE table_name = 'student_assessments' AND column_name = 'school_id'
        `
      });
      
      const isVarchar = typeData?.[0]?.data_type === 'character varying';
      const length = typeData?.[0]?.character_maximum_length;
      
      results.schemaTests.push({
        test: '1.4 student_assessments.school_id is VARCHAR(255)',
        passed: isVarchar && length === 255,
        details: `Type: ${typeData?.[0]?.data_type}, Length: ${length}`
      });
      
      if (isVarchar && length === 255) {
        console.log('✅ student_assessments.school_id is VARCHAR(255)');
        results.passed++;
      } else {
        console.log('❌ student_assessments.school_id is NOT VARCHAR(255)');
        results.failed++;
      }
    } catch (err) {
      console.log('❌ Error checking student_assessments.school_id:', err.message);
      results.schemaTests.push({
        test: '1.4 student_assessments.school_id is VARCHAR(255)',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    console.log('');

    // ========================================
    // PHASE 2: RLS POLICY VERIFICATION
    // ========================================
    console.log('🔒 PHASE 2: RLS Policy Verification');
    console.log('-'.repeat(60));

    // Test 2.1: Count RLS policies
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT COUNT(*) as policy_count
          FROM pg_policies
          WHERE tablename IN ('schools', 'students', 'school_users', 'student_assessments', 'consent_history', 'recommendations', 'school_students', 'student_profiles')
          AND (policyname LIKE '%school%' OR policyname LIKE '%isolation%')
        `
      });
      
      if (error) throw error;
      
      const policyCount = parseInt(data?.[0]?.policy_count || 0);
      const expectedCount = 14;
      
      results.rlsPolicyTests.push({
        test: '2.1 All 14 RLS policies exist',
        passed: policyCount >= expectedCount,
        details: `Found ${policyCount} policies (expected ${expectedCount})`
      });
      
      if (policyCount >= expectedCount) {
        console.log(`✅ Found ${policyCount} RLS policies (expected ${expectedCount})`);
        results.passed++;
      } else {
        console.log(`❌ Found only ${policyCount} RLS policies (expected ${expectedCount})`);
        results.failed++;
      }
    } catch (err) {
      console.log('❌ Error checking RLS policies:', err.message);
      results.rlsPolicyTests.push({
        test: '2.1 All 14 RLS policies exist',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    console.log('');

    // ========================================
    // PHASE 3: DATA INTEGRITY TESTS
    // ========================================
    console.log('💾 PHASE 3: Data Integrity Tests');
    console.log('-'.repeat(60));

    // Test 3.1: Create test school
    let testSchoolCreated = false;
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          id: TEST_SCHOOL_ID,
          name: 'Test School for Migration Verification',
          province: 'Gauteng',
          district: 'Test District',
          emis_number: 'TEST' + Date.now()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      testSchoolCreated = true;
      results.dataIntegrityTests.push({
        test: '3.1 Create test school with VARCHAR id',
        passed: true,
        details: `School created with id: ${TEST_SCHOOL_ID}`
      });
      
      console.log('✅ Test school created successfully');
      results.passed++;
    } catch (err) {
      console.log('❌ Error creating test school:', err.message);
      results.dataIntegrityTests.push({
        test: '3.1 Create test school with VARCHAR id',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    // Test 3.2: Create test student with school association
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
        
        testStudentCreated = true;
        results.dataIntegrityTests.push({
          test: '3.2 Create student with VARCHAR school_id',
          passed: true,
          details: `Student created with school_id: ${TEST_SCHOOL_ID}`
        });
        
        console.log('✅ Test student created with school association');
        results.passed++;
      } catch (err) {
        console.log('❌ Error creating test student:', err.message);
        results.dataIntegrityTests.push({
          test: '3.2 Create student with VARCHAR school_id',
          passed: false,
          error: err.message
        });
        results.failed++;
      }
    } else {
      console.log('⏭️  Skipping student creation (school creation failed)');
      results.dataIntegrityTests.push({
        test: '3.2 Create student with VARCHAR school_id',
        passed: false,
        skipped: true
      });
      results.failed++;
    }
    results.total++;

    // Test 3.3: Query student by school_id
    if (testStudentCreated) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*, schools(*)')
          .eq('school_id', TEST_SCHOOL_ID)
          .single();
        
        if (error) throw error;
        
        const hasSchoolData = data?.schools?.name === 'Test School for Migration Verification';
        
        results.dataIntegrityTests.push({
          test: '3.3 Query student by school_id with join',
          passed: hasSchoolData,
          details: `School name: ${data?.schools?.name}`
        });
        
        if (hasSchoolData) {
          console.log('✅ Student query with school join successful');
          results.passed++;
        } else {
          console.log('❌ Student query with school join failed');
          results.failed++;
        }
      } catch (err) {
        console.log('❌ Error querying student:', err.message);
        results.dataIntegrityTests.push({
          test: '3.3 Query student by school_id with join',
          passed: false,
          error: err.message
        });
        results.failed++;
      }
    } else {
      console.log('⏭️  Skipping student query (student creation failed)');
      results.dataIntegrityTests.push({
        test: '3.3 Query student by school_id with join',
        passed: false,
        skipped: true
      });
      results.failed++;
    }
    results.total++;

    console.log('');

    // ========================================
    // PHASE 4: REGISTRATION FLOW SIMULATION
    // ========================================
    console.log('🔄 PHASE 4: Registration Flow Simulation');
    console.log('-'.repeat(60));

    // Test 4.1: Simulate registration API call
    try {
      const registrationData = {
        email: `flow-test-${Date.now()}@example.com`,
        firstName: 'Flow',
        lastName: 'Test',
        grade: 11,
        schoolId: TEST_SCHOOL_ID
      };

      const { data, error } = await supabase
        .from('students')
        .insert({
          email: registrationData.email,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          grade: registrationData.grade,
          school_id: registrationData.schoolId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      results.registrationFlowTests.push({
        test: '4.1 Registration flow with VARCHAR school_id',
        passed: true,
        details: `Registration successful for ${registrationData.email}`
      });
      
      console.log('✅ Registration flow simulation successful');
      results.passed++;
    } catch (err) {
      console.log('❌ Registration flow simulation failed:', err.message);
      results.registrationFlowTests.push({
        test: '4.1 Registration flow with VARCHAR school_id',
        passed: false,
        error: err.message
      });
      results.failed++;
    }
    results.total++;

    console.log('');

    // ========================================
    // CLEANUP
    // ========================================
    console.log('🧹 Cleanup: Removing test data...');
    
    try {
      // Delete test students
      await supabase
        .from('students')
        .delete()
        .or(`email.eq.${TEST_STUDENT_EMAIL},email.like.flow-test-%`);
      
      // Delete test school
      await supabase
        .from('schools')
        .delete()
        .eq('id', TEST_SCHOOL_ID);
      
      console.log('✅ Test data cleaned up');
    } catch (err) {
      console.log('⚠️  Cleanup warning:', err.message);
    }

    console.log('');

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    results.failed++;
  }

  // ========================================
  // FINAL REPORT
  // ========================================
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 FINAL VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log('');
  
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('');

  // Detailed breakdown
  console.log('📋 Schema Tests:', results.schemaTests.filter(t => t.passed).length, '/', results.schemaTests.length);
  console.log('🔒 RLS Policy Tests:', results.rlsPolicyTests.filter(t => t.passed).length, '/', results.rlsPolicyTests.length);
  console.log('💾 Data Integrity Tests:', results.dataIntegrityTests.filter(t => t.passed).length, '/', results.dataIntegrityTests.length);
  console.log('🔄 Registration Flow Tests:', results.registrationFlowTests.filter(t => t.passed).length, '/', results.registrationFlowTests.length);
  console.log('');

  // Overall status
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Migration successful!');
    console.log('');
    console.log('✅ Database schema migrated correctly');
    console.log('✅ RLS policies restored');
    console.log('✅ Data integrity maintained');
    console.log('✅ Registration flow working');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION DEPLOYMENT');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review required');
    console.log('');
    console.log('Failed tests:');
    [...results.schemaTests, ...results.rlsPolicyTests, ...results.dataIntegrityTests, ...results.registrationFlowTests]
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.test}`);
        if (t.error) console.log(`     Error: ${t.error}`);
        if (t.details) console.log(`     Details: ${t.details}`);
      });
  }

  console.log('');
  console.log('='.repeat(60));

  return results;
}

// Run tests
runComprehensiveTests()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
