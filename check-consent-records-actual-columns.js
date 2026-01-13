#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConsentRecordsColumns() {
  console.log('🔍 Checking consent_records table actual columns...');
  
  try {
    // Try to insert with minimal data to see what columns are required/available
    console.log('\n🧪 Testing with minimal data...');
    const { data: minimalTest, error: minimalError } = await supabase
      .from('consent_records')
      .insert({
        student_id: 'test-student-id'
      })
      .select()
      .single();

    if (minimalError) {
      console.log('❌ Minimal insert failed:', minimalError.message);
      console.log('❌ Error code:', minimalError.code);
      console.log('❌ Error details:', minimalError.details);
    } else {
      console.log('✅ Minimal insert successful');
      console.log('✅ Available columns:', Object.keys(minimalTest));
      
      // Clean up
      await supabase
        .from('consent_records')
        .delete()
        .eq('id', minimalTest.id);
    }

    // Try to select from the table to see what columns exist
    console.log('\n🔍 Trying to select all columns...');
    const { data: selectTest, error: selectError } = await supabase
      .from('consent_records')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log('❌ Select failed:', selectError.message);
    } else {
      console.log('✅ Select successful');
      if (selectTest && selectTest.length > 0) {
        console.log('✅ Existing record columns:', Object.keys(selectTest[0]));
      } else {
        console.log('📋 Table is empty, trying to get schema another way...');
        
        // Try inserting with different column combinations
        const testColumns = [
          'student_id',
          'consent_type', 
          'consent_timestamp',
          'consent_method',
          'school_id',
          'ip_address',
          'user_agent'
        ];

        for (const column of testColumns) {
          try {
            const testData = { [column]: 'test-value' };
            const { error } = await supabase
              .from('consent_records')
              .insert(testData)
              .select()
              .single();
            
            if (error) {
              console.log(`❌ Column '${column}' test failed:`, error.message);
            } else {
              console.log(`✅ Column '${column}' exists`);
            }
          } catch (e) {
            console.log(`❌ Column '${column}' test error:`, e.message);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkConsentRecordsColumns();