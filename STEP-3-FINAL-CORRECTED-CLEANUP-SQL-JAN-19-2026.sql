-- Admin Dashboard Data Retention and Cleanup (FINAL CORRECTED)
-- Created: January 19, 2026
-- Purpose: Automated cleanup of old monitoring data

-- Automated cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete errors older than 90 days
  DELETE FROM system_errors
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Delete metrics older than 30 days
  DELETE FROM api_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete activity older than 180 days
  DELETE FROM user_activity
  WHERE created_at < NOW() - INTERVAL '180 days';
  
  -- Delete health checks older than 7 days
  DELETE FROM system_health_checks
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete resolved alerts older than 30 days
  DELETE FROM alert_history
  WHERE status = 'resolved'
  AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Log cleanup statistics
  INSERT INTO admin_audit_log (action, metadata)
  VALUES ('automated_cleanup', jsonb_build_object(
    'timestamp', NOW(),
    'tables_cleaned', ARRAY['system_errors', 'api_metrics', 'user_activity', 'system_health_checks', 'alert_history']::text[]
  ));
END;
$$;
