-- Admin Dashboard Schema Migration
-- Created: January 19, 2026
-- Purpose: Create all tables and indexes for admin monitoring dashboard

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System Errors Table
CREATE TABLE system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  user_id UUID,
  school_id VARCHAR(50),
  student_grade INTEGER,
  feature_area VARCHAR(50), -- 'registration', 'assessment', 'results', 'rag'
  severity VARCHAR(20) DEFAULT 'error', -- 'error', 'warning', 'critical'
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES admin_users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_system_errors_created_at ON system_errors(created_at DESC);
CREATE INDEX idx_system_errors_error_type ON system_errors(error_type);
CREATE INDEX idx_system_errors_school_id ON system_errors(school_id);
CREATE INDEX idx_system_errors_user_id ON system_errors(user_id);
CREATE INDEX idx_system_errors_feature_area ON system_errors(feature_area);
CREATE INDEX idx_system_errors_resolved ON system_errors(resolved);

-- API Metrics Table
CREATE TABLE api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  response_time INTEGER NOT NULL, -- milliseconds
  status_code INTEGER NOT NULL,
  user_id UUID,
  school_id VARCHAR(50),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance queries
CREATE INDEX idx_api_metrics_created_at ON api_metrics(created_at DESC);
CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX idx_api_metrics_response_time ON api_metrics(response_time);
CREATE INDEX idx_api_metrics_status_code ON api_metrics(status_code);

-- User Activity Table
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'registration', 'assessment_start', 'assessment_complete', 'school_login', 'rag_query'
  user_id UUID,
  school_id VARCHAR(50),
  student_grade INTEGER,
  event_data JSONB, -- flexible storage for event-specific data
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for activity queries
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX idx_user_activity_event_type ON user_activity(event_type);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_school_id ON user_activity(school_id);

-- System Health Checks Table
CREATE TABLE system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50) NOT NULL, -- 'api_endpoint', 'database', 'rag_system'
  component_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
  response_time INTEGER, -- milliseconds
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for health queries
CREATE INDEX idx_health_checks_created_at ON system_health_checks(created_at DESC);
CREATE INDEX idx_health_checks_component ON system_health_checks(component_name);
CREATE INDEX idx_health_checks_status ON system_health_checks(status);

-- Alert Configurations Table
CREATE TABLE alert_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL, -- 'error_rate', 'performance_degradation', 'health_check_failure'
  threshold_value NUMERIC NOT NULL,
  threshold_unit VARCHAR(20), -- 'percentage', 'count', 'milliseconds'
  time_window INTEGER, -- minutes
  recipients TEXT[], -- array of email addresses
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert History Table
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_config_id UUID REFERENCES alert_configurations(id),
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  triggered_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES admin_users(id),
  metadata JSONB
);

-- Create indexes for alert queries
CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at DESC);
CREATE INDEX idx_alert_history_status ON alert_history(status);
CREATE INDEX idx_alert_history_severity ON alert_history(severity);

-- Audit Log Table
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- 'login', 'view_errors', 'resolve_alert', 'export_data'
  resource_type VARCHAR(50), -- 'errors', 'metrics', 'activity', 'alerts'
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for audit queries
CREATE INDEX idx_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_admin_user ON admin_audit_log(admin_user_id);
