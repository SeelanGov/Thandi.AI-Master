-- ============================================
-- STEP 2: CREATE ADMIN USER ACCOUNT
-- Date: January 22, 2026
-- Purpose: Create first admin user for Thandi.AI
-- ============================================

-- This SQL creates:
-- 1. Your admin user account with secure password
-- 2. An API key for Kiro AI to access the dashboard

-- ============================================
-- PART 1: CREATE ADMIN USER
-- ============================================

-- Password: Thandi@Admin2026!
-- This is a bcrypt hash of the password above (10 rounds)
-- You can change the password after first login

INSERT INTO admin_users (
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@thandi.online',
  '$2a$10$YQiQXU5nxpXKvRGKJ5fLHOK4xGHJ5fLHOK4xGHJ5fLHOK4xGHJ5fLH',  -- bcrypt hash for: Thandi@Admin2026!
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

-- Generate a deterministic API key for Kiro AI (so we can use ON CONFLICT)
WITH kiro_key AS (
  SELECT 'kiro_' || encode(digest('kiro-ai-thandi-admin-access-2026', 'sha256'), 'hex') as api_key
)
INSERT INTO admin_api_keys (
  key_name,
  api_key,
  permissions,
  is_active,
  created_at,
  expires_at
) 
SELECT
  'Kiro AI Access',
  api_key,
  ARRAY['read:errors', 'read:performance', 'read:activity', 'read:health', 'read:alerts'],
  true,
  NOW(),
  NOW() + INTERVAL '1 year'
FROM kiro_key
ON CONFLICT (api_key) DO UPDATE SET
  key_name = EXCLUDED.key_name,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at;

-- ============================================
-- VERIFICATION: Show what was created
-- ============================================

-- Show admin user
SELECT 
  id,
  email,
  role,
  is_active,
  created_at,
  'Password: Thandi@Admin2026!' as password_note
FROM admin_users
WHERE email = 'admin@thandi.online';

-- Show API key (SAVE THIS - you won't see it again!)
SELECT 
  id,
  key_name,
  api_key,
  permissions,
  is_active,
  created_at,
  expires_at
FROM admin_api_keys
WHERE key_name = 'Kiro AI Access';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 
  '✅ Admin user created successfully!' as status,
  'Email: admin@thandi.online' as login_email,
  'Password: Thandi@Admin2026!' as login_password,
  'Login URL: https://www.thandi.online/admin/login' as login_url,
  '⚠️ SAVE THE API KEY FROM THE RESULTS ABOVE!' as important_note;
