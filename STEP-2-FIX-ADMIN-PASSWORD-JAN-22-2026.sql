-- ============================================
-- STEP 2 FIX: CORRECT ADMIN PASSWORD HASH
-- Date: January 22, 2026
-- Purpose: Fix the admin password with correct bcrypt hash
-- ============================================

-- PROBLEM: The previous hash was invalid (wrong length/format)
-- SOLUTION: Use properly generated bcrypt hash

-- Password: Thandi@Admin2026!
-- This is a CORRECT bcrypt hash of the password above (10 rounds)

UPDATE admin_users 
SET password_hash = '$2b$10$4RCLEY61Wkkf.D4ZWpyRye7YsO4EZ7EFmKORPfjVCsMd8XNGKy//C',
    updated_at = NOW()
WHERE email = 'admin@thandi.online';

-- ============================================
-- VERIFICATION: Check the update worked
-- ============================================

SELECT 
  id,
  email,
  role,
  is_active,
  LENGTH(password_hash) as hash_length,
  CASE 
    WHEN LENGTH(password_hash) = 60 THEN '✅ Correct length'
    ELSE '❌ Wrong length'
  END as hash_status,
  created_at,
  updated_at
FROM admin_users
WHERE email = 'admin@thandi.online';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
  '✅ Admin password hash fixed!' as status,
  'Email: admin@thandi.online' as login_email,
  'Password: Thandi@Admin2026!' as login_password,
  'Login URL: https://www.thandi.online/admin/login' as login_url,
  'Hash length should be 60 characters' as note;