/**
 * Admin User Seed Script
 * Created: January 19, 2026
 * Purpose: Create initial admin user and generate Kiro AI API key
 * 
 * Usage:
 *   export ADMIN_PASSWORD="your_secure_password"
 *   node scripts/seed-admin-user.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seedAdminUser() {
  console.log('🚀 Starting admin user seed process...\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('❌ Error: ADMIN_PASSWORD environment variable not set');
    console.error('   Usage: export ADMIN_PASSWORD="your_secure_password"');
    process.exit(1);
  }

  if (adminPassword.length < 12) {
    console.error('❌ Error: Password must be at least 12 characters long');
    process.exit(1);
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', 'admin@thandi.co.za')
      .single();

    if (existingUser) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email:', existingUser.email);
      console.log('\n💡 To reset password or regenerate API key, delete the existing user first');
      process.exit(0);
    }

    // Generate secure password hash
    console.log('🔐 Generating secure password hash...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Generate API key for Kiro AI
    console.log('🔑 Generating Kiro AI API key...');
    const kiroApiKey = `kiro_${crypto.randomBytes(32).toString('hex')}`;

    // Insert admin user
    console.log('💾 Creating admin user in database...');
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@thandi.co.za',
        password_hash: passwordHash,
        api_key: kiroApiKey,
        role: 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error.message);
      console.error('   Details:', error);
      process.exit(1);
    }

    // Success output
    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 Email:    admin@thandi.co.za');
    console.log('🔒 Password: [Set via ADMIN_PASSWORD environment variable]');
    console.log('👤 Role:     admin');
    console.log('🆔 User ID:  ' + data.id);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('🤖 KIRO AI API KEY (SAVE THIS - IT WON\'T BE SHOWN AGAIN):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(kiroApiKey);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📝 Next Steps:');
    console.log('   1. Save the API key above in a secure location');
    console.log('   2. Add to Kiro AI environment: export THANDI_ADMIN_API_KEY="' + kiroApiKey + '"');
    console.log('   3. Add to .env.local: KIRO_API_KEY="' + kiroApiKey + '"');
    console.log('   4. Test login at: http://localhost:3000/admin/login');
    console.log('   5. Change password after first login\n');
    
    console.log('⚠️  SECURITY REMINDERS:');
    console.log('   - Change the admin password immediately after first login');
    console.log('   - Store the API key securely (password manager recommended)');
    console.log('   - Never commit the API key to version control');
    console.log('   - Rotate the API key periodically for security\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUser();
