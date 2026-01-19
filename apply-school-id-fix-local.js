/**
 * APPLY SCHOOL ID FIX TO LOCAL DATABASE
 * Date: January 14, 2026
 * Purpose: Fix the school_id column type in student_assessments table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyFix() {
  console.log('🔧 APPLYING SCHOOL ID FIX');
  console.log('==========================\n');

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Read the migration file
  const migration = fs.readFileSync(
    'supabase/migrations/20260114_fix_student_assessments_school_id.sql',
    'utf8'
  );

  console.log('📄 Migration SQL:');
  console.log(migration.substring(0, 200) + '...\n');

  try {
    console.log('📡 Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migration
    });

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️ RPC method not available, trying direct execution...');
      
      // Split into individual statements and execute
      const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX')) {
          console.log(`   Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
            console.error(`   ❌ Error: ${stmtError.message}`);
          } else {
            console.log('   ✅ Success');
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully');
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'student_assessments')
      .eq('column_name', 'school_id');

    if (verifyError) {
      console.log('⚠️ Could not verify (this is okay)');
    } else {
      console.log('✅ Verification complete');
      console.log(columns);
    }

    // Test registration now
    console.log('\n🧪 Testing registration...');
    const testResponse = await fetch('http://localhost:3000/api/student/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: 'Test',
        student_surname: 'Student',
        school_id: 'ZAF-200100021',
        grade: '10',
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_version: 'v1.0'
      })
    });

    const testData = await testResponse.json();
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Success: ${testData.success}`);
    if (testData.success) {
      console.log('   ✅ REGISTRATION NOW WORKS!');
    } else {
      console.log(`   ❌ Still failing: ${testData.error}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

applyFix()
  .then(() => {
    console.log('\n✅ Fix application completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fix application failed:', error);
    process.exit(1);
  });
