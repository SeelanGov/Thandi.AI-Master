-- Admin Dashboard Data Retention and Cleanup
-- Created: January 19, 2026
-- Purpose: Automated cleanup of old monitoring data

-- Automated cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_monitoring_data()
RETURNS void AS $$
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
    'tables_cleaned', ARRAY['system_errors', 'api_metrics', 'user_activity', 'system_health_checks', 'alert_history']
  ));
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule this function to run daily at 2 AM using Supabase cron or external scheduler
-- Example cron configuration (to be set up in Supabase dashboard or via pg_cron):
-- SELECT cron.schedule('cleanup-monitoring-data', '0 2 * * *', 'SELECT cleanup_old_monitoring_data()');
