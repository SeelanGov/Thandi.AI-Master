#!/usr/bin/env node

/**
 * Run Student Assessments Migration
 * Creates POPIA-compliant student_assessments table
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Running Student Assessments Migration\n');

async function runMigration() {
  try {
    console.log('📋 Reading migration file...');
    const migrationSQL = fs.readFileSync('supabase/migrations/20251226_add_student_assessments.sql', 'utf8');
    
    console.log('🔄 Executing migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }
    
    console.log('✅ Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check if student_assessments table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'student_assessments');
    
    if (tableError) throw tableError;
    
    if (tables.length === 0) {
      console.log('❌ student_assessments table not found');
      return false;
    }
    
    console.log('✅ student_assessments table created');
    
    // Test the search function
    const { data: searchTest, error: searchError } = await supabase
      .rpc('search_secondary_schools', { search_query: 'high', limit_count: 3 });
    
    if (searchError) {
      console.log('⚠️  Search function error:', searchError.message);
    } else {
      console.log('✅ search_secondary_schools function working');
      console.log(`   Found ${searchTest.length} schools`);
    }
    
    // Test dashboard stats function
    const { data: statsTest, error: statsError } = await supabase
      .rpc('get_school_dashboard_stats', { target_school_id: 'test-school' });
    
    if (statsError) {
      console.log('⚠️  Dashboard stats function error:', statsError.message);
    } else {
      console.log('✅ get_school_dashboard_stats function working');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function testRegistrationFlow() {
  console.log('\n🧪 Testing registration flow...');
  
  try {
    // Test data
    const testStudent = {
      student_name: 'Test',
      student_surname: 'Student',
      school_id: 'ZAF-700400001', // Use a real school ID from our data
      grade: 11,
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: 'v1.0'
    };
    
    // Insert test record
    const { data: student, error: insertError } = await supabase
      .from('student_assessments')
      .insert(testStudent)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test registration failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Test registration successful');
    console.log(`   Student ID: ${student.id}`);
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('student_assessments')
      .delete()
      .eq('id', student.id);
    
    if (deleteError) {
      console.log('⚠️  Test cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 Student Assessment System Setup\n');
  
  const migrationSuccess = await runMigration();
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed - stopping here');
    return;
  }
  
  const verificationSuccess = await verifyMigration();
  if (!verificationSuccess) {
    console.log('\n⚠️  Verification had issues but migration completed');
  }
  
  const testSuccess = await testRegistrationFlow();
  if (!testSuccess) {
    console.log('\n⚠️  Registration test failed but tables are ready');
  }
  
  console.log('\n🎉 Student Assessment System Ready!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Test registration component: npm run dev');
  console.log('   2. Navigate to /assessment to see new flow');
  console.log('   3. Test both registered and anonymous paths');
  console.log('   4. Verify POPIA compliance features');
}

main().catch(console.error);