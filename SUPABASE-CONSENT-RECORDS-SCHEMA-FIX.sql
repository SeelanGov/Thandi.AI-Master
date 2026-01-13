-- PHASE 0: Fix consent_records table schema to match API expectations
-- Execute this in Supabase SQL Editor

-- Step 1: Add missing columns to consent_records table
ALTER TABLE consent_records 
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN,
ADD COLUMN IF NOT EXISTS consent_method VARCHAR(50) DEFAULT 'web_form',
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS school_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT 'unknown';

-- Step 2: Copy data from 'granted' column to 'consent_given' column
UPDATE consent_records 
SET consent_given = granted 
WHERE consent_given IS NULL;

-- Step 3: Make consent_given NOT NULL after copying data
ALTER TABLE consent_records 
ALTER COLUMN consent_given SET NOT NULL;

-- Step 4: Add foreign key constraint for school_id (optional, can be NULL)
ALTER TABLE consent_records 
ADD CONSTRAINT fk_consent_records_school_id 
FOREIGN KEY (school_id) REFERENCES school_master(school_id);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_student_id ON consent_records(student_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_school_id ON consent_records(school_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_given ON consent_records(consent_given);

-- Step 6: Add comments for documentation
COMMENT ON TABLE consent_records IS 'POPIA-compliant consent records with Phase 0 API compatibility';
COMMENT ON COLUMN consent_records.consent_given IS 'Boolean flag indicating if consent was given (replaces granted column)';
COMMENT ON COLUMN consent_records.consent_method IS 'Method used to collect consent (web_form, api, etc.)';
COMMENT ON COLUMN consent_records.school_id IS 'School associated with the consent (optional)';
COMMENT ON COLUMN consent_records.ip_address IS 'IP address when consent was recorded';
COMMENT ON COLUMN consent_records.user_agent IS 'User agent when consent was recorded';

-- Step 7: Test the schema fix with a sample insert
INSERT INTO consent_records (
    student_id,
    consent_type,
    consent_given,
    consent_method,
    consent_timestamp,
    school_id,
    ip_address,
    user_agent,
    granted
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'schema_test',
    true,
    'manual_sql_fix',
    NOW(),
    'ZAF-200100005',
    '127.0.0.1',
    'supabase-sql-editor',
    true
);

-- Step 8: Verify the insert worked and clean up test record
DELETE FROM consent_records 
WHERE consent_type = 'schema_test' 
AND consent_method = 'manual_sql_fix';

-- Step 9: Insert completion marker
INSERT INTO audit_log (action, table_name, details, created_at)
VALUES (
  'CONSENT_RECORDS_SCHEMA_FIX_COMPLETE', 
  'consent_records', 
  jsonb_build_object(
    'columns_added', ARRAY['consent_given', 'consent_method', 'consent_timestamp', 'school_id', 'ip_address', 'user_agent'],
    'migration_date', NOW(),
    'purpose', 'Phase 0 API compatibility - fix consent management API',
    'status', 'completed'
  ),
  NOW()
);

-- Verification query - run this to confirm the fix worked
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'consent_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;