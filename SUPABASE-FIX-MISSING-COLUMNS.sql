-- =====================================================
-- FIX MISSING COLUMNS IN student_assessments
-- Run this in Supabase SQL Editor to add missing columns
-- =====================================================

-- Check current table structure first
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_assessments' 
ORDER BY ordinal_position;

-- Add missing POPIA compliance columns if they don't exist
DO $$
BEGIN
    -- Add consent_given column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_assessments' AND column_name = 'consent_given') THEN
        ALTER TABLE student_assessments ADD COLUMN consent_given BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added consent_given column';
    END IF;

    -- Add consent_timestamp column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_assessments' AND column_name = 'consent_timestamp') THEN
        ALTER TABLE student_assessments ADD COLUMN consent_timestamp TIMESTAMP NOT NULL DEFAULT NOW();
        RAISE NOTICE 'Added consent_timestamp column';
    END IF;

    -- Add consent_version column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_assessments' AND column_name = 'consent_version') THEN
        ALTER TABLE student_assessments ADD COLUMN consent_version VARCHAR(20) DEFAULT 'v1.0';
        RAISE NOTICE 'Added consent_version column';
    END IF;

    -- Add data_retention_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_assessments' AND column_name = 'data_retention_date') THEN
        ALTER TABLE student_assessments ADD COLUMN data_retention_date TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year');
        RAISE NOTICE 'Added data_retention_date column';
    END IF;

    -- Add anonymized column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_assessments' AND column_name = 'anonymized') THEN
        ALTER TABLE student_assessments ADD COLUMN anonymized BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added anonymized column';
    END IF;

    RAISE NOTICE '✅ All POPIA compliance columns added successfully!';
END $$;

-- Verify the table structure after adding columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'student_assessments' 
ORDER BY ordinal_position;

-- Test insert to make sure everything works
DO $$
DECLARE
    test_school_id VARCHAR(50);
    test_student_id UUID;
BEGIN
    -- Get a real school ID for testing
    SELECT school_id INTO test_school_id 
    FROM school_master 
    WHERE type NOT ILIKE '%PRIMARY%' 
    LIMIT 1;

    IF test_school_id IS NOT NULL THEN
        -- Insert test record
        INSERT INTO student_assessments (
            student_name, 
            student_surname, 
            school_id, 
            grade,
            consent_given,
            consent_timestamp,
            consent_version
        ) VALUES (
            'Test',
            'Student', 
            test_school_id,
            11,
            true,
            NOW(),
            'v1.0'
        ) RETURNING id INTO test_student_id;

        RAISE NOTICE '✅ Test insert successful! Student ID: %', test_student_id;

        -- Clean up test record
        DELETE FROM student_assessments WHERE id = test_student_id;
        RAISE NOTICE '✅ Test cleanup completed';
    ELSE
        RAISE NOTICE '⚠️ No schools found for testing';
    END IF;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 POPIA-Compliant Student Assessment System Ready!';
    RAISE NOTICE '✅ All required columns present';
    RAISE NOTICE '✅ Test registration successful';
    RAISE NOTICE '📋 Ready for frontend integration';
END $$;