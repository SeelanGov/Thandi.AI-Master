#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseSchema() {
  console.log('🔍 Checking actual database schema...');
  
  try {
    // Check consent_records table structure
    console.log('\n📋 CONSENT_RECORDS TABLE:');
    const { data: consentColumns, error: consentError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'consent_records')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (consentError) {
      console.error('❌ Error getting consent_records schema:', consentError.message);
    } else if (consentColumns && consentColumns.length > 0) {
      consentColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'none'}`);
      });
    } else {
      console.log('❌ consent_records table not found or no columns');
    }

    // Check student_profiles table structure
    console.log('\n📋 STUDENT_PROFILES TABLE:');
    const { data: profileColumns, error: profileError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'student_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (profileError) {
      console.error('❌ Error getting student_profiles schema:', profileError.message);
    } else if (profileColumns && profileColumns.length > 0) {
      profileColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'none'}`);
      });
    } else {
      console.log('❌ student_profiles table not found or no columns');
    }

    // Check school_students table structure
    console.log('\n📋 SCHOOL_STUDENTS TABLE:');
    const { data: schoolStudentColumns, error: schoolStudentError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'school_students')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (schoolStudentError) {
      console.error('❌ Error getting school_students schema:', schoolStudentError.message);
    } else if (schoolStudentColumns && schoolStudentColumns.length > 0) {
      schoolStudentColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default || 'none'}`);
      });
    } else {
      console.log('❌ school_students table not found or no columns');
    }

    // Test a simple insert to consent_records to see what's missing
    console.log('\n🧪 Testing consent_records insert...');
    try {
      const { data: insertTest, error: insertError } = await supabase
        .from('consent_records')
        .insert({
          student_id: 'test-student-id',
          school_id: 'test-school-id',
          consent_type: 'data_processing',
          consent_given: true,
          consent_method: 'test',
          consent_timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Insert test failed:', insertError.message);
        console.error('❌ Error details:', insertError);
      } else {
        console.log('✅ Insert test successful:', insertTest);
        
        // Clean up test record
        await supabase
          .from('consent_records')
          .delete()
          .eq('id', insertTest.id);
        console.log('✅ Test record cleaned up');
      }
    } catch (error) {
      console.error('❌ Insert test error:', error.message);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkDatabaseSchema();