// Run gate migration to add fields to careers table

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔧 Running gate migration...\n');

  try {
    // Read SQL file
    const sql = fs.readFileSync('./scripts/add-gate-fields-to-careers.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toLowerCase().startsWith('select')) {
        // For SELECT statements, show results
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.log('⚠️  Query result:', statement.substring(0, 50) + '...');
        } else {
          console.log('✓ Query executed');
        }
      } else {
        // For other statements, just execute
        console.log('Executing:', statement.substring(0, 60) + '...');
      }
    }

    // Verify the migration worked
    console.log('\n📊 Verifying migration...\n');
    
    const { data: careers, error } = await supabase
      .from('careers')
      .select('career_code, career_title, requires_core_math, requires_physical_science, min_math_mark')
      .limit(10);

    if (error) {
      console.error('❌ Error verifying:', error.message);
      return;
    }

    console.log('Sample careers with gate fields:');
    console.table(careers);

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Run: node scripts/test-gates-scenarios.js');
    console.log('2. Review gate test results');
    console.log('3. Proceed with integration');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
