-- POPIA Audit Tables
-- Required for POPIA compliance and Information Officer reporting

-- External API call audit log
CREATE TABLE IF NOT EXISTS popia_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  api_provider VARCHAR(50) NOT NULL,
  data_sanitised BOOLEAN NOT NULL,
  pii_detected TEXT[],
  pii_removed TEXT[],
  session_id TEXT,
  user_consent BOOLEAN,
  purpose TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_popia_audit_timestamp (timestamp),
  INDEX idx_popia_audit_provider (api_provider),
  INDEX idx_popia_audit_session (session_id)
);

-- Consent log
CREATE TABLE IF NOT EXISTS popia_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  consent_text TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_popia_consent_session (session_id),
  INDEX idx_popia_consent_timestamp (timestamp)
);

-- Data access log
CREATE TABLE IF NOT EXISTS popia_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  data_accessed VARCHAR(100) NOT NULL,
  accessed_by VARCHAR(50) NOT NULL,
  purpose TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_popia_access_timestamp (timestamp),
  INDEX idx_popia_access_session (session_id)
);

-- Retention policy: Keep audit logs for 5 years (POPIA requirement)
-- Run this as a scheduled job
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM popia_audit_log WHERE timestamp < NOW() - INTERVAL '5 years';
  DELETE FROM popia_consent_log WHERE timestamp < NOW() - INTERVAL '5 years';
  DELETE FROM popia_access_log WHERE timestamp < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;
