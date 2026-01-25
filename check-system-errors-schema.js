/**
 * Check System Errors Table Schema
 * Verifies what columns actually exist in the system_errors table
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 CHECKING SYSTEM_ERRORS TABLE SCHEMA');
  console.log('======================================\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('system_errors')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying table:', error.message);
      console.log('\n💡 The system_errors table may not exist yet.');
      console.log('   You need to run the admin dashboard schema migration first.');
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Table exists with data');
      console.log('\n📋 Columns found in first row:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('✅ Table exists but is empty');
      console.log('\n💡 Cannot determine columns from empty table.');
      console.log('   Try inserting a test record first.');
    }

  } catch (error) {
    console.log('❌ Fatal error:', error.message);
  }
}

checkSchema();
