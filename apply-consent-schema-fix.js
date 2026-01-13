#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyConsentSchemaFix() {
  console.log('🔧 Applying consent_records schema fix...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-consent-records-schema.sql', 'utf8');
    
    // Split into individual statements (basic splitting)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.error(`❌ Statement ${i + 1} execution error:`, execError.message);
        // Try alternative approach - direct query
        try {
          const { data, error } = await supabase
            .from('_sql_exec')
            .insert({ query: statement });
          
          if (error) {
            console.error(`❌ Alternative execution failed:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed via alternative method`);
          }
        } catch (altError) {
          console.error(`❌ All execution methods failed for statement ${i + 1}`);
        }
      }
    }

    // Test the fix by trying to insert a record with the new schema
    console.log('\n🧪 Testing the schema fix...');
    const testUuid = '550e8400-e29b-41d4-a716-446655440000';
    
    const { data: testInsert, error: testError } = await supabase
      .from('consent_records')
      .insert({
        student_id: testUuid,
        consent_type: 'test_fix',
        consent_given: true,
        consent_method: 'schema_test',
        consent_timestamp: new Date().toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'schema-fix-test'
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Schema fix test failed:', testError.message);
      console.log('🔧 Manual SQL execution required');
      console.log('\n📋 MANUAL STEPS:');
      console.log('1. Open Supabase SQL Editor');
      console.log('2. Copy and execute the SQL from fix-consent-records-schema.sql');
      console.log('3. Verify the schema changes');
    } else {
      console.log('✅ Schema fix test successful!');
      console.log('✅ New record created:', testInsert);
      
      // Clean up test record
      await supabase
        .from('consent_records')
        .delete()
        .eq('id', testInsert.id);
      console.log('✅ Test record cleaned up');
      
      console.log('\n🎉 CONSENT RECORDS SCHEMA FIX COMPLETE!');
      console.log('✅ API should now work correctly');
    }

  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    console.log('\n🔧 MANUAL INTERVENTION REQUIRED');
    console.log('Please execute the SQL in fix-consent-records-schema.sql manually');
  }
}

applyConsentSchemaFix();