-- Fix consent_records table schema to match API expectations
-- This adds the missing columns that the API expects

-- Add missing columns to consent_records table
ALTER TABLE consent_records 
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS consent_method VARCHAR(50) DEFAULT 'web_form',
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS school_id VARCHAR(50) REFERENCES school_master(school_id),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT 'unknown';

-- Update existing records to use consent_given instead of granted
UPDATE consent_records 
SET consent_given = granted 
WHERE consent_given IS NULL;

-- Make consent_given NOT NULL after copying data
ALTER TABLE consent_records 
ALTER COLUMN consent_given SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_student_id ON consent_records(student_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_school_id ON consent_records(school_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON consent_records(consent_type);

-- Add comment for documentation
COMMENT ON TABLE consent_records IS 'POPIA-compliant consent records with Phase 0 enhancements';
COMMENT ON COLUMN consent_records.consent_given IS 'Boolean flag indicating if consent was given (replaces granted column)';
COMMENT ON COLUMN consent_records.consent_method IS 'Method used to collect consent (web_form, api, etc.)';
COMMENT ON COLUMN consent_records.school_id IS 'School associated with the consent (optional)';

-- Insert completion marker
INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'CONSENT_RECORDS_SCHEMA_FIX', 
  'consent_records', 
  jsonb_build_object(
    'columns_added', ARRAY['consent_given', 'consent_method', 'consent_timestamp', 'school_id', 'ip_address', 'user_agent'],
    'migration_date', NOW(),
    'purpose', 'Phase 0 API compatibility'
  ),
  NOW()
);