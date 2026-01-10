require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCurrentSchema() {
  console.log('🔍 CHECKING CURRENT DATABASE SCHEMA');
  console.log('===================================');
  
  try {
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (!tablesError && tables) {
      console.log('Available tables:');
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Check functions
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION')
      .order('routine_name');
    
    if (!functionsError && functions) {
      console.log('\nAvailable functions:');
      functions.forEach(func => {
        console.log(`- ${func.routine_name}`);
      });
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

checkCurrentSchema();