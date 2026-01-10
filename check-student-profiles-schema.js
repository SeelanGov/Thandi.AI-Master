require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 CHECKING STUDENT_PROFILES SCHEMA');
  console.log('===================================');
  
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Sample record structure:');
      if (data && data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('No records found');
      }
    }
    
    // Also check the table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'student_profiles')
      .order('ordinal_position');
    
    if (!columnsError && columns) {
      console.log('\nTable columns:');
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

checkSchema();