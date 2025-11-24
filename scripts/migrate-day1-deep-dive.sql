-- Migration: Add Deep Dive Assessment Fields
-- Date: November 25, 2025 (Day 1)
-- Purpose: Support adaptive assessment (Grade 10 opt-in, Grade 11-12 required)

-- Add deep dive fields to student_assessments table
ALTER TABLE student_assessments 
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS assessment_depth VARCHAR(20) DEFAULT 'quick',
ADD COLUMN IF NOT EXISTS support_system JSONB,
ADD COLUMN IF NOT EXISTS career_awareness_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS family_expectations VARCHAR(50),
ADD COLUMN IF NOT EXISTS location_flexibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS decision_style VARCHAR(50);

-- Create subject_performance table for tracking current marks
CREATE TABLE IF NOT EXISTS subject_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES student_assessments(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    mark_range VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_grade ON student_assessments(grade);
CREATE INDEX IF NOT EXISTS idx_subject_performance_assessment ON subject_performance(assessment_id);

-- Verify migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_assessments' 
AND column_name IN ('grade', 'assessment_depth', 'support_system', 'career_awareness_level', 'family_expectations', 'location_flexibility', 'decision_style')
ORDER BY column_name;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'subject_performance'
ORDER BY ordinal_position;
