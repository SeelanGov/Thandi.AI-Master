-- ============================================
-- STEP 1: CREATE ADMIN DASHBOARD TABLES (FIXED)
-- Run this in Supabase SQL Editor
-- ============================================
-- Date: January 22, 2026
-- Purpose: Create all required tables for Thandi Admin Dashboard
-- Tables: 9 tables total
-- This version handles existing tables gracefully
-- ============================================

-- Drop existing tables if they have issues (optional - only if needed)
-- Uncomment these lines if you want to start fresh:
-- DROP TABLE IF EXISTS admin_api_keys CASCADE;
-- DROP TABLE IF EXISTS admin_alerts CASCADE;
-- DROP TABLE IF EXISTS admin_alert_configs CASCADE;
-- DROP TABLE IF EXISTS admin_health_checks CASCADE;
-- DROP TABLE IF EXISTS admin_activity_logs CASCADE;
-- DROP TABLE IF EXISTS admin_performance_logs CASCADE;
-- DROP TABLE IF EXISTS admin_errors CASCADE;
-- DROP TABLE IF EXISTS admin_audit_log CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE;

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- 2. ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- 3. ADMIN ERRORS TABLE
CREATE TABLE IF NOT EXISTS admin_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_errors_type ON admin_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_admin_errors_resolved ON admin_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_errors_created ON admin_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_errors_endpoint ON admin_errors(endpoint);

-- 4. ADMIN PERFORMANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_performance_endpoint ON admin_performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_admin_performance_created ON admin_performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_performance_response_time ON admin_performance_logs(response_time);

-- 5. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_event_type ON admin_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_user ON admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at DESC);

-- 6. ADMIN HEALTH CHECKS TABLE
CREATE TABLE IF NOT EXISTS admin_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_health_checks_type ON admin_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_admin_health_checks_status ON admin_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_admin_health_checks_created ON admin_health_checks(created_at DESC);

-- 7. ADMIN ALERTS TABLE
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_acknowledged ON admin_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON admin_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);

-- 8. ADMIN ALERT CONFIGS TABLE
CREATE TABLE IF NOT EXISTS admin_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  threshold_value NUMERIC,
  threshold_unit TEXT,
  time_window INTEGER,
  severity TEXT NOT NULL,
  notification_channels JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_alert_configs_enabled ON admin_alert_configs(enabled);

-- 9. ADMIN API KEYS TABLE
CREATE TABLE IF NOT EXISTS admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admin_api_keys_key ON admin_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_active ON admin_api_keys(is_active);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%'
ORDER BY table_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see 9 tables listed above, SUCCESS!
-- Next step: Create your admin user account
-- ============================================
