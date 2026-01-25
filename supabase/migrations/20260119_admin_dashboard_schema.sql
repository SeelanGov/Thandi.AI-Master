-- ============================================
-- STEP 1: CREATE ADMIN DASHBOARD TABLES
-- Run this in Supabase SQL Editor
-- ============================================
-- Date: January 22, 2026
-- Purpose: Create all required tables for Thandi Admin Dashboard
-- Tables: 9 tables total
-- ============================================

-- 1. ADMIN USERS TABLE
-- Stores admin user accounts with authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'super_admin', 'admin', 'viewer'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- 2. ADMIN AUDIT LOG TABLE
-- Tracks all admin actions for security
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'login', 'logout', 'view', 'update', 'delete'
  resource TEXT, -- What was accessed/modified
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- 3. ADMIN ERRORS TABLE
-- Tracks application errors for monitoring
CREATE TABLE IF NOT EXISTS admin_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL, -- 'api', 'client', 'database', 'external'
  error_message TEXT NOT NULL,
  error_stack TEXT,
  endpoint TEXT, -- API endpoint where error occurred
  method TEXT, -- HTTP method
  status_code INTEGER,
  user_id UUID, -- Student/user who triggered error (if applicable)
  session_id TEXT,
  metadata JSONB, -- Request body, headers, etc.
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for error queries
CREATE INDEX IF NOT EXISTS idx_admin_errors_type ON admin_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_admin_errors_resolved ON admin_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_errors_created ON admin_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_errors_endpoint ON admin_errors(endpoint);

-- 4. ADMIN PERFORMANCE LOGS TABLE
-- Tracks API performance metrics
CREATE TABLE IF NOT EXISTS admin_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL, -- GET, POST, PUT, DELETE
  response_time INTEGER NOT NULL, -- milliseconds
  status_code INTEGER NOT NULL,
  user_id UUID, -- Student/user making request
  session_id TEXT,
  metadata JSONB, -- Query params, body size, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_admin_performance_endpoint ON admin_performance_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_admin_performance_created ON admin_performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_performance_response_time ON admin_performance_logs(response_time);

-- 5. ADMIN ACTIVITY LOGS TABLE
-- Tracks user activity and events
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'assessment_start', 'assessment_complete', etc.
  user_id UUID, -- Student/user performing action
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  metadata JSONB, -- Event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_event_type ON admin_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_user ON admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at DESC);

-- 6. ADMIN HEALTH CHECKS TABLE
-- Stores system health check results
CREATE TABLE IF NOT EXISTS admin_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'database', 'api', 'external_service', 'cache'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  response_time INTEGER, -- milliseconds
  error_message TEXT,
  metadata JSONB, -- Additional health data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for health check queries
CREATE INDEX IF NOT EXISTS idx_admin_health_checks_type ON admin_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_admin_health_checks_status ON admin_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_admin_health_checks_created ON admin_health_checks(created_at DESC);

-- 7. ADMIN ALERTS TABLE
-- Stores triggered alerts
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'error_rate', 'slow_response', 'system_down', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB, -- Alert-specific data
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_acknowledged ON admin_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_resolved ON admin_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);

-- 8. ADMIN ALERT CONFIGS TABLE
-- Stores alert configuration and thresholds
CREATE TABLE IF NOT EXISTS admin_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  threshold_value NUMERIC, -- Threshold for triggering alert
  threshold_unit TEXT, -- 'count', 'percentage', 'milliseconds', etc.
  time_window INTEGER, -- Minutes to evaluate threshold over
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  notification_channels JSONB, -- ['email', 'slack', 'sms']
  metadata JSONB, -- Additional config
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for alert config queries
CREATE INDEX IF NOT EXISTS idx_admin_alert_configs_enabled ON admin_alert_configs(enabled);

-- 9. ADMIN API KEYS TABLE
-- Stores API keys for programmatic access (Kiro AI)
CREATE TABLE IF NOT EXISTS admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['read:errors', 'read:performance', etc.]
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for API key queries
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_key ON admin_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_active ON admin_api_keys(is_active);

-- ============================================
-- VERIFICATION QUERIES
-- Run these after creating tables to verify
-- ============================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%'
ORDER BY table_name;

-- Expected result: 9 tables
-- admin_activity_logs
-- admin_alert_configs
-- admin_alerts
-- admin_api_keys
-- admin_audit_log
-- admin_errors
-- admin_health_checks
-- admin_performance_logs
-- admin_users

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see 9 tables listed above, the migration was successful!
-- Next step: Create your admin user account
-- ============================================
