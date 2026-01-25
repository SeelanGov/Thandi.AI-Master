-- ============================================
-- CORRECTED: Configure Alert Recipients
-- Run this in Supabase SQL Editor
-- ============================================
-- Date: January 24, 2026
-- Purpose: Add alert configurations with email recipients
-- ============================================

-- Insert alert configurations for critical system alerts
INSERT INTO admin_alert_configs (
  alert_type,
  enabled,
  threshold_value,
  threshold_unit,
  time_window,
  severity,
  notification_channels,
  metadata
) VALUES
  -- High error rate alert
  (
    'high_error_rate',
    true,
    10,
    'count',
    5,
    'high',
    '{"email": ["admin@thandi.online", "kiro@thandi.online"]}'::jsonb,
    '{"description": "Triggers when error count exceeds 10 in 5 minutes"}'::jsonb
  ),
  -- Slow API response alert
  (
    'slow_api_response',
    true,
    3000,
    'milliseconds',
    10,
    'medium',
    '{"email": ["admin@thandi.online", "kiro@thandi.online"]}'::jsonb,
    '{"description": "Triggers when API response time exceeds 3 seconds"}'::jsonb
  ),
  -- System health degraded alert
  (
    'system_health_degraded',
    true,
    3,
    'count',
    15,
    'high',
    '{"email": ["admin@thandi.online", "kiro@thandi.online"]}'::jsonb,
    '{"description": "Triggers when 3+ health checks fail in 15 minutes"}'::jsonb
  ),
  -- Database connection issues
  (
    'database_connection_error',
    true,
    1,
    'count',
    5,
    'critical',
    '{"email": ["admin@thandi.online", "kiro@thandi.online"]}'::jsonb,
    '{"description": "Triggers immediately on database connection failure"}'::jsonb
  )
ON CONFLICT (alert_type) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  threshold_value = EXCLUDED.threshold_value,
  threshold_unit = EXCLUDED.threshold_unit,
  time_window = EXCLUDED.time_window,
  severity = EXCLUDED.severity,
  notification_channels = EXCLUDED.notification_channels,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Check that alert configs were created
SELECT 
  alert_type,
  enabled,
  threshold_value,
  threshold_unit,
  time_window,
  severity,
  notification_channels,
  created_at
FROM admin_alert_configs
ORDER BY severity DESC, alert_type;

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- You should see 4 alert configurations:
-- 1. database_connection_error (critical)
-- 2. high_error_rate (high)
-- 3. system_health_degraded (high)
-- 4. slow_api_response (medium)
--
-- Each should have notification_channels with your email addresses
-- ============================================

-- ============================================
-- TO ADD MORE EMAIL RECIPIENTS LATER
-- ============================================
-- UPDATE admin_alert_configs
-- SET notification_channels = '{"email": ["admin@thandi.online", "kiro@thandi.online", "newperson@example.com"]}'::jsonb
-- WHERE alert_type = 'high_error_rate';
-- ============================================
