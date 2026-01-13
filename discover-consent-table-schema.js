#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function discoverConsentTableSchema() {
  console.log('🔍 Discovering consent_records table schema...');
  
  try {
    // Try to insert a valid UUID to see what other columns are required
    const testUuid = '550e8400-e29b-41d4-a716-446655440000';
    
    console.log('\n🧪 Testing with valid UUID...');
    const { data: uuidTest, error: uuidError } = await supabase
      .from('consent_records')
      .insert({
        student_id: testUuid,
        consent_type: 'test'
      })
      .select()
      .single();

    if (uuidError) {
      console.log('❌ UUID test failed:', uuidError.message);
      console.log('❌ Error details:', uuidError);
      
      // The error about 'granted' column tells us this column exists and is required
      console.log('\n🧪 Testing with granted column...');
      const { data: grantedTest, error: grantedError } = await supabase
        .from('consent_records')
        .insert({
          student_id: testUuid,
          consent_type: 'test',
          granted: true
        })
        .select()
        .single();

      if (grantedError) {
        console.log('❌ Granted test failed:', grantedError.message);
      } else {
        console.log('✅ Granted test successful!');
        console.log('✅ Actual table columns:', Object.keys(grantedTest));
        console.log('✅ Sample record:', grantedTest);
        
        // Clean up
        await supabase
          .from('consent_records')
          .delete()
          .eq('id', grantedTest.id);
        console.log('✅ Test record cleaned up');
      }
    } else {
      console.log('✅ UUID test successful');
      console.log('✅ Available columns:', Object.keys(uuidTest));
      
      // Clean up
      await supabase
        .from('consent_records')
        .delete()
        .eq('id', uuidTest.id);
    }

  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
  }
}

discoverConsentTableSchema();