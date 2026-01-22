/**
 * Diagnose Admin Login Issue
 * Tests password hash and database connection
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function diagnoseAdminLogin() {
  console.log('🔍 DIAGNOSING ADMIN LOGIN ISSUE\n');
  console.log('='.repeat(50));

  // Test 1: Check if bcrypt is working
  console.log('\n📋 TEST 1: Bcrypt Functionality');
  console.log('-'.repeat(50));
  
  const testPassword = 'Thandi@Admin2026!';
  const testHash = await bcrypt.hash(testPassword, 10);
  console.log('✅ Bcrypt is working');
  console.log(`   Test hash: ${testHash.substring(0, 20)}...`);
  
  const testMatch = await bcrypt.compare(testPassword, testHash);
  console.log(`✅ Password comparison works: ${testMatch}`);

  // Test 2: Check database connection
  console.log('\n📋 TEST 2: Database Connection');
  console.log('-'.repeat(50));
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    console.log(`   URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
    console.log(`   Key: ${supabaseKey ? 'Set' : 'Missing'}`);
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created');

  // Test 3: Check admin user exists
  console.log('\n📋 TEST 3: Admin User in Database');
  console.log('-'.repeat(50));
  
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', 'admin@thandi.online')
    .single();

  if (error) {
    console.log('❌ Error fetching admin user:', error.message);
    return;
  }

  if (!adminUser) {
    console.log('❌ Admin user not found in database');
    return;
  }

  console.log('✅ Admin user found');
  console.log(`   ID: ${adminUser.id}`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   Active: ${adminUser.is_active}`);
  console.log(`   Password hash: ${adminUser.password_hash.substring(0, 20)}...`);

  // Test 4: Check password hash format
  console.log('\n📋 TEST 4: Password Hash Analysis');
  console.log('-'.repeat(50));
  
  const hashFromDB = adminUser.password_hash;
  
  // Check if it's a valid bcrypt hash
  const bcryptPattern = /^\$2[aby]\$\d{2}\$/;
  const isValidBcryptFormat = bcryptPattern.test(hashFromDB);
  
  console.log(`   Hash format valid: ${isValidBcryptFormat ? '✅' : '❌'}`);
  console.log(`   Hash starts with: ${hashFromDB.substring(0, 7)}`);
  console.log(`   Hash length: ${hashFromDB.length} (should be 60)`);

  // Test 5: Try password comparison
  console.log('\n📋 TEST 5: Password Verification');
  console.log('-'.repeat(50));
  
  try {
    const passwordMatch = await bcrypt.compare(testPassword, hashFromDB);
    console.log(`   Password matches: ${passwordMatch ? '✅' : '❌'}`);
    
    if (!passwordMatch) {
      console.log('\n⚠️  PASSWORD DOES NOT MATCH!');
      console.log('   This means the password hash in the database is incorrect.');
      console.log('   The hash in the SQL was a placeholder.');
    }
  } catch (err) {
    console.log(`❌ Error comparing password: ${err.message}`);
    console.log('   The hash in the database is invalid/corrupted');
  }

  // Test 6: Generate correct hash
  console.log('\n📋 TEST 6: Generate Correct Hash');
  console.log('-'.repeat(50));
  
  const correctHash = await bcrypt.hash(testPassword, 10);
  console.log('✅ Generated correct hash for password: Thandi@Admin2026!');
  console.log(`   Hash: ${correctHash}`);
  console.log('\n💡 Use this hash in the SQL UPDATE statement below');

  // Provide fix SQL
  console.log('\n' + '='.repeat(50));
  console.log('🔧 FIX SQL (Run in Supabase SQL Editor)');
  console.log('='.repeat(50));
  console.log(`
UPDATE admin_users 
SET password_hash = '${correctHash}'
WHERE email = 'admin@thandi.online';

-- Verify the update
SELECT id, email, role, is_active, 
       LEFT(password_hash, 20) || '...' as password_hash_preview
FROM admin_users 
WHERE email = 'admin@thandi.online';
`);

  console.log('\n✅ DIAGNOSIS COMPLETE');
  console.log('='.repeat(50));
}

// Run diagnosis
diagnoseAdminLogin().catch(console.error);
