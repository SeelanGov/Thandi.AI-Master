#!/usr/bin/env node

/**
 * Database Schema Diagnostic
 * Verify the actual structure of student_assessments table in production
 */

const { config } = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 DIAGNOSING DATABASE SCHEMA');
console.log('=' .repeat(60));

async function checkTableStructure() {
  console.log('\n📋 Checking student_assessments table structure...');
  
  try {
    // Try to get table structure by querying information_schema
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'student_assessments' })
      .single();
    
    if (error) {
      console.log('   ⚠️  Could not get table structure via RPC, trying direct query...');
      
      // Fallback: Try to insert a test record to see what fails
      const testData = {
        student_name: 'TEST',
        student_surname: 'DIAGNOSTIC',
        school_id: 'ZAF-200100021', // VARCHAR format
        grade: 10,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_version: 'v1.0'
      };
      
      const { data, error: insertError } = await supabase
        .from('student_assessments')
        .insert(testData)
        .select()
        .single();
      
      if (insertError) {
        console.log('   📊 Insert test result:');
        console.log(`      Error Code: ${insertError.code}`);
        console.log(`      Error Message: ${insertError.message}`);
        console.log(`      Error Details: ${insertError.details || 'None'}`);
        
        // Analyze the error
        if (insertError.code === '22P02') {
          console.log('\n   🔍 DIAGNOSIS: UUID Type Mismatch');
          console.log('      - school_id column expects UUID format');
          console.log('      - We are providing VARCHAR format (ZAF-200100021)');
          console.log('      - Migration may not have run correctly');
        } else if (insertError.code === '23502') {
          console.log('\n   🔍 DIAGNOSIS: NOT NULL Constraint');
          console.log('      - school_id column has NOT NULL constraint');
          console.log('      - Cannot set to NULL as workaround');
        } else if (insertError.code === '23503') {
          console.log('\n   🔍 DIAGNOSIS: Foreign Key Constraint');
          console.log('      - school_id references another table');
          console.log('      - Referenced school may not exist');
        }
        
        return false;
      } else {
        console.log('   ✅ Test insert successful - schema is correct');
        
        // Clean up test record
        await supabase
          .from('student_assessments')
          .delete()
          .eq('id', data.id);
        
        return true;
      }
    }
    
  } catch (error) {
    console.log('   ❌ Schema check failed:', error.message);
    return false;
  }
}

async function checkSchoolMasterIntegration() {
  console.log('\n🏫 Checking school_master integration...');
  
  try {
    // Check if school_master table exists and has data
    const { count: schoolCount, error: countError } = await supabase
      .from('school_master')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('   ❌ school_master table not accessible:', countError.message);
      return false;
    }
    
    console.log(`   📊 school_master has ${schoolCount} records`);
    
    // Get a sample school
    const { data: sampleSchool, error: sampleError } = await supabase
      .from('school_master')
      .select('school_id, name, type')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.log('   ⚠️  Could not get sample school:', sampleError.message);
    } else {
      console.log(`   📋 Sample school: ${sampleSchool.name} (${sampleSchool.school_id})`);
      console.log(`   🔍 school_id format: ${typeof sampleSchool.school_id} - "${sampleSchool.school_id}"`);
    }
    
    return true;
    
  } catch (error) {
    console.log('   ❌ school_master check failed:', error.message);
    return false;
  }
}

async function checkSchoolsDashboardIntegration() {
  console.log('\n🏢 Checking schools dashboard integration...');
  
  try {
    // Check if schools table exists
    const { count: schoolsCount, error: countError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('   ❌ schools table not accessible:', countError.message);
      return false;
    }
    
    console.log(`   📊 schools table has ${schoolsCount} records`);
    
    // Get a sample school from dashboard
    const { data: sampleDashboardSchool, error: sampleError } = await supabase
      .from('schools')
      .select('id, name, emis_number')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.log('   ⚠️  Could not get sample dashboard school:', sampleError.message);
    } else {
      console.log(`   📋 Sample dashboard school: ${sampleDashboardSchool.name} (${sampleDashboardSchool.id})`);
      console.log(`   🔍 school id format: ${typeof sampleDashboardSchool.id} - "${sampleDashboardSchool.id}"`);
    }
    
    return true;
    
  } catch (error) {
    console.log('   ❌ schools dashboard check failed:', error.message);
    return false;
  }
}

async function generateRecommendations(schemaWorking, schoolMasterWorking, schoolsDashboardWorking) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSTIC RESULTS & RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  console.log(`\n🗄️  Database Components Status:`);
  console.log(`   student_assessments schema: ${schemaWorking ? '✅ Working' : '❌ Broken'}`);
  console.log(`   school_master integration: ${schoolMasterWorking ? '✅ Working' : '❌ Broken'}`);
  console.log(`   schools dashboard: ${schoolsDashboardWorking ? '✅ Working' : '❌ Broken'}`);
  
  if (!schemaWorking) {
    console.log('\n🔧 RECOMMENDED SOLUTION:');
    console.log('   1. IMMEDIATE FIX: Modify student registration API');
    console.log('      - Set school_id to NULL to bypass constraint');
    console.log('      - Store school info in assessment_data JSON');
    console.log('      - Maintain functionality while preserving data');
    
    console.log('\n   2. MEDIUM-TERM FIX: Database schema correction');
    console.log('      - Create migration to fix school_id column type');
    console.log('      - Add proper foreign key to school_master');
    console.log('      - Migrate existing data');
    
    console.log('\n   3. LONG-TERM SOLUTION: Unified school system');
    console.log('      - Create bridge between school_master and schools');
    console.log('      - Enable dashboard to show assessment students');
    console.log('      - Build complete student-school integration');
  } else {
    console.log('\n✅ SCHEMA IS WORKING - No immediate fixes needed');
  }
  
  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Run this diagnostic to confirm the issue');
  console.log('   2. Implement the recommended immediate fix');
  console.log('   3. Test the complete student registration flow');
  console.log('   4. Plan the medium-term schema correction');
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  try {
    const schemaWorking = await checkTableStructure();
    const schoolMasterWorking = await checkSchoolMasterIntegration();
    const schoolsDashboardWorking = await checkSchoolsDashboardIntegration();
    
    await generateRecommendations(schemaWorking, schoolMasterWorking, schoolsDashboardWorking);
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

main();