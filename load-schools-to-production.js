// Load Schools to Production Database
// Automated solution for school search issue

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function loadSchools() {
  console.log('🚀 LOADING SCHOOLS TO PRODUCTION');
  console.log('=================================\n');

  // Step 1: Check current state
  console.log('📊 Step 1: Checking current database state...');
  const { count: currentCount } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true });

  console.log(`   Current schools: ${currentCount}`);

  if (currentCount >= 3000) {
    console.log('✅ Schools already loaded! No action needed.');
    return;
  }

  // Step 2: Read SQL file
  console.log('\n📄 Step 2: Reading seed file...');
  let sqlContent;
  try {
    sqlContent = readFileSync('seed-school-auth.sql', 'utf8');
    console.log('✅ Seed file loaded successfully');
  } catch (error) {
    console.error('❌ Error reading seed file:', error.message);
    console.log('\n💡 MANUAL SOLUTION:');
    console.log('   1. Open Supabase Dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Paste contents of seed-school-auth.sql');
    console.log('   4. Execute the script');
    return;
  }

  // Step 3: Execute SQL
  console.log('\n⚙️  Step 3: Loading schools into database...');
  console.log('   This may take 30-60 seconds...');

  try {
    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      console.log('\n💡 FALLBACK SOLUTION:');
      console.log('   Use Supabase SQL Editor to run seed-school-auth.sql manually');
      return;
    }

    console.log('✅ SQL executed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 MANUAL SOLUTION REQUIRED:');
    console.log('   1. Open: https://supabase.com/dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy/paste seed-school-auth.sql');
    console.log('   4. Click "Run"');
    return;
  }

  // Step 4: Verify
  console.log('\n✅ Step 4: Verifying school count...');
  const { count: newCount } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true });

  console.log(`   Schools in database: ${newCount}`);

  if (newCount >= 3000) {
    console.log('\n🎉 SUCCESS! Schools loaded successfully!');
    
    // Test search for Effingham
    const { data: effingham } = await supabase
      .from('schools')
      .select('name, province')
      .ilike('name', '%effingham%');

    if (effingham && effingham.length > 0) {
      console.log('\n✅ Test Search: "Effingham"');
      effingham.forEach(school => {
        console.log(`   - ${school.name} (${school.province})`);
      });
    }
  } else {
    console.log('\n⚠️  School count is still low. Manual intervention needed.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Test school search on live site');
  console.log('2. Search for "effingham" or any school name');
  console.log('3. Verify students can now find their schools');
  console.log('4. Continue with user testing');
}

loadSchools().catch(console.error);
