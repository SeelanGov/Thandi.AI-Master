-- ============================================
-- COMPLETE ADMIN DASHBOARD SETUP
-- Date: January 23, 2026
-- Purpose: Create admin user and API key for Kiro AI
-- ============================================

-- This SQL creates:
-- 1. Admin user account (admin@thandi.online)
-- 2. API key for Kiro AI monitoring
-- 3. Verification queries

-- ============================================
-- PART 1: CREATE ADMIN USER
-- ============================================

-- Password: Thandi@Admin2026!
-- Hash generated with bcrypt (10 rounds) - verified working

INSERT INTO admin_users (
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@thandi.online',
  '$2b$10$U7cv7bY2kCzOK9LccgRWGOvJ2DMLCfUkks8CJjp/EtAn/2LQCCoUK',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- PART 2: CREATE API KEY FOR KIRO AI
-- ============================================

-- Generate deterministic API key for Kiro AI
INSERT INTO admin_api_keys (
  key_name,
  api_key,
  permissions,
  is_active,
  created_at,
  expires_at
) VALUES (
  'Kiro AI Access',
  'kiro_' || encode(digest('kiro-ai-thandi-admin-access-2026', 'sha256'), 'hex'),
  ARRAY['read:errors', 'read:performance', 'read:activity', 'read:health', 'read:alerts', 'read:dashboard'],
  true,
  NOW(),
  NOW() + INTERVAL '1 year'
)
ON CONFLICT (api_key) DO UPDATE SET
  key_name = EXCLUDED.key_name,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Verify admin user was created
SELECT 
  '✅ ADMIN USER' as check_type,
  id,
  email,
  role,
  is_active,
  created_at,
  LEFT(password_hash, 20) || '...' as password_hash_preview
FROM admin_users
WHERE email = 'admin@thandi.online';

-- 2. Verify API key was created (SAVE THIS KEY!)
SELECT 
  '✅ API KEY' as check_type,
  id,
  key_name,
  api_key,
  permissions,
  is_active,
  created_at,
  expires_at
FROM admin_api_keys
WHERE key_name = 'Kiro AI Access';

-- 3. Show login credentials
SELECT 
  '📋 LOGIN CREDENTIALS' as info_type,
  'admin@thandi.online' as email,
  'Thandi@Admin2026!' as password,
  'https://www.thandi.online/admin/login' as login_url
FROM (SELECT 1) as dummy;

-- 4. Show API key for environment variable
SELECT 
  '🔑 ENVIRONMENT VARIABLE' as info_type,
  'ADMIN_API_KEY' as variable_name,
  api_key as value,
  'Add this to .env.local and Vercel' as action
FROM admin_api_keys
WHERE key_name = 'Kiro AI Access';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
  '✅ SETUP COMPLETE!' as status,
  'Admin user and API key created successfully' as message,
  'Copy the API key from the results above' as next_step
FROM (SELECT 1) as dummy;
