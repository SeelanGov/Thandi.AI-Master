#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConsentTableSchema() {
  console.log('🔍 Checking consent_records table schema...');
  
  try {
    // Try to describe the table structure
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'consent_records' })
      .single();
    
    if (error) {
      console.log('RPC not available, trying direct query...');
      
      // Try a direct query to see what columns exist
      const { data: sampleData, error: queryError } = await supabase
        .from('consent_records')
        .select('*')
        .limit(1);
      
      if (queryError) {
        console.error('❌ Error querying consent_records:', queryError.message);
        
        // Try to get column info from information_schema
        const { data: columns, error: schemaError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'consent_records')
          .eq('table_schema', 'public');
        
        if (schemaError) {
          console.error('❌ Cannot access schema info:', schemaError.message);
        } else {
          console.log('✅ Found columns in consent_records:');
          columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
          });
        }
      } else {
        console.log('✅ consent_records table accessible');
        if (sampleData && sampleData.length > 0) {
          console.log('Sample record columns:', Object.keys(sampleData[0]));
        } else {
          console.log('Table is empty, cannot determine columns from data');
        }
      }
    } else {
      console.log('✅ Table schema:', data);
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkConsentTableSchema();