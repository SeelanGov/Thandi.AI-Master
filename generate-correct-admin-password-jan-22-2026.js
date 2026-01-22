/**
 * Generate Correct Admin Password Hash
 * Creates a valid bcrypt hash for the admin password
 */

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  console.log('🔐 GENERATING CORRECT ADMIN PASSWORD HASH\n');
  console.log('='.repeat(60));
  
  const password = 'Thandi@Admin2026!';
  
  console.log('\n📝 Password Details:');
  console.log(`   Password: ${password}`);
  console.log(`   Hashing with bcrypt (10 rounds)...`);
  
  // Generate hash
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n✅ Hash Generated Successfully!');
  console.log(`   Hash: ${hash}`);
  console.log(`   Length: ${hash.length} characters`);
  
  // Verify the hash works
  const testMatch = await bcrypt.compare(password, hash);
  console.log(`\n✅ Verification Test: ${testMatch ? 'PASSED' : 'FAILED'}`);
  
  // Provide SQL to fix the database
  console.log('\n' + '='.repeat(60));
  console.log('🔧 SQL TO FIX ADMIN PASSWORD');
  console.log('='.repeat(60));
  console.log('\nCopy and run this SQL in Supabase SQL Editor:\n');
  console.log('-- Update admin user password hash');
  console.log(`UPDATE admin_users`);
  console.log(`SET password_hash = '${hash}',`);
  console.log(`    updated_at = NOW()`);
  console.log(`WHERE email = 'admin@thandi.online';`);
  console.log('');
  console.log('-- Verify the update');
  console.log('SELECT');
  console.log('  id,');
  console.log('  email,');
  console.log('  role,');
  console.log('  is_active,');
  console.log("  LEFT(password_hash, 20) || '...' as password_hash_preview,");
  console.log('  updated_at');
  console.log('FROM admin_users');
  console.log("WHERE email = 'admin@thandi.online';");
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 AFTER RUNNING THE SQL:');
  console.log('='.repeat(60));
  console.log('\n1. Go to: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql');
  console.log('2. Paste the SQL above');
  console.log('3. Click RUN');
  console.log('4. Verify you see the updated password_hash_preview');
  console.log('5. Try logging in again at: https://www.thandi.online/admin/login');
  console.log('\n   Email: admin@thandi.online');
  console.log('   Password: Thandi@Admin2026!');
  
  console.log('\n✅ DONE!\n');
}

// Run the generator
generatePasswordHash().catch(console.error);
