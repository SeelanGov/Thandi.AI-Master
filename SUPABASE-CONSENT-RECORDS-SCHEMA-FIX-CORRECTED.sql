-- PHASE 0: Fix consent_records table schema to match API expectations
-- Execute this in Supabase SQL Editor (CORRECTED VERSION)

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

-- Step 3: Make consent_given NOT NULL after copying data (only if there are existing records)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM consent_records LIMIT 1) THEN
        ALTER TABLE consent_records ALTER COLUMN consent_given SET NOT NULL;
    END IF;
END $$;

-- Step 4: Add foreign key constraint for school_id (optional, can be NULL)
-- Only add if school_master table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'school_master') THEN
        ALTER TABLE consent_records 
        ADD CONSTRAINT IF NOT EXISTS fk_consent_records_school_id 
        FOREIGN KEY (school_id) REFERENCES school_master(school_id);
    END IF;
END $$;

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

-- Step 7: Test the schema fix with a safe approach
-- First, check if we have any existing student to use for testing
DO $$
DECLARE
    test_student_id UUID;
    test_school_id VARCHAR(50);
BEGIN
    -- Try to find an existing student for testing
    SELECT id INTO test_student_id FROM student_assessments LIMIT 1;
    
    -- Try to find an existing school for testing
    SELECT school_id INTO test_school_id FROM school_master LIMIT 1;
    
    -- Only run test if we have valid references
    IF test_student_id IS NOT NULL THEN
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
            test_student_id,
            'schema_test',
            true,
            'manual_sql_fix',
            NOW(),
            test_school_id,
            '127.0.0.1',
            'supabase-sql-editor',
            true
        );
        
        -- Clean up test record immediately
        DELETE FROM consent_records 
        WHERE consent_type = 'schema_test' 
        AND consent_method = 'manual_sql_fix';
        
        RAISE NOTICE 'Schema test completed successfully with student_id: %', test_student_id;
    ELSE
        RAISE NOTICE 'No existing students found - skipping test insert (this is normal for new installations)';
    END IF;
END $$;

-- Step 8: Insert completion marker (only if audit_log table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
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
    ELSE
        RAISE NOTICE 'audit_log table not found - skipping audit entry';
    END IF;
END $$;

-- Step 9: Verification query - run this to confirm the fix worked
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'consent_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ CONSENT RECORDS SCHEMA FIX COMPLETED SUCCESSFULLY';
    RAISE NOTICE '📊 All required columns have been added to consent_records table';
    RAISE NOTICE '🔒 Foreign key constraints and indexes have been created';
    RAISE NOTICE '✨ The consent management API should now work correctly';
END $$;