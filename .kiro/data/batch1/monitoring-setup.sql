-- ============================================
-- BATCH 1 MONITORING & ALERTING SETUP
-- ============================================
-- Created: 2025-11-25
-- Purpose: Performance monitoring and data quality checks

-- ============================================
-- 1. PERFORMANCE MONITORING VIEW
-- ============================================
-- Note: This view structure is conceptual
-- Actual implementation depends on Supabase Edge Function logging

CREATE OR REPLACE VIEW api_performance_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  qualification_id,
  COUNT(*) as query_count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as avg_response_ms,
  MAX(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as max_response_ms,
  MIN(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as min_response_ms
FROM institution_gates
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), qualification_id
ORDER BY hour DESC;

-- ============================================
-- 2. DATA QUALITY CHECKS
-- ============================================

-- Check for NULL values in critical fields
CREATE OR REPLACE VIEW data_quality_check AS
SELECT 
  'institution_gates' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE aps_min IS NULL) as null_aps,
  COUNT(*) FILTER (WHERE subject_rules IS NULL OR subject_rules = '[]'::jsonb) as null_subjects,
  COUNT(*) FILTER (WHERE provisional_offer_criteria IS NULL) as null_criteria,
  COUNT(*) FILTER (WHERE qualification_name IS NULL) as null_qual_name
FROM institution_gates
WHERE qualification_id LIKE 'SAQA_%';

-- Check for orphaned logistics records
CREATE OR REPLACE VIEW orphaned_logistics AS
SELECT l.*
FROM g12_logistics l
LEFT JOIN institution_gates ig ON l.qualification_id = ig.qualification_id
WHERE ig.qualification_id IS NULL;

-- ============================================
-- 3. BATCH 1 HEALTH CHECK
-- ============================================

CREATE OR REPLACE VIEW batch1_health_status AS
SELECT 
  q.qualification_id,
  q.name as qualification_name,
  COUNT(DISTINCT ig.institution_name) as institution_count,
  CASE 
    WHEN EXISTS (SELECT 1 FROM g12_logistics l WHERE l.qualification_id = q.qualification_id) 
    THEN 'Yes' 
    ELSE 'No' 
  END as has_logistics,
  MIN(ig.aps_min) as min_aps,
  MAX(ig.aps_min) as max_aps,
  CASE 
    WHEN COUNT(DISTINCT ig.institution_name) >= 5 THEN '✅ Healthy'
    WHEN COUNT(DISTINCT ig.institution_name) >= 3 THEN '⚠️ Warning'
    ELSE '❌ Critical'
  END as status
FROM (
  VALUES 
    ('SAQA_94721', 'BSc Computer Science'),
    ('SAQA_48101', 'BCom Accounting'),
    ('SAQA_101980', 'LLB Bachelor of Laws'),
    ('SAQA_101600', 'MBChB Medicine'),
    ('SAQA_101433', 'BSc Engineering Electrical')
) AS q(qualification_id, name)
LEFT JOIN institution_gates ig ON q.qualification_id = ig.qualification_id
GROUP BY q.qualification_id, q.name
ORDER BY institution_count DESC;

-- ============================================
-- 4. QUERY PATTERN ANALYSIS
-- ============================================

-- Most queried institutions
CREATE OR REPLACE VIEW popular_institutions AS
SELECT 
  institution_name,
  qualification_id,
  COUNT(*) as query_count,
  AVG(aps_min) as avg_aps_requirement
FROM institution_gates
WHERE qualification_id LIKE 'SAQA_%'
GROUP BY institution_name, qualification_id
ORDER BY query_count DESC
LIMIT 20;

-- APS distribution analysis
CREATE OR REPLACE VIEW aps_distribution AS
SELECT 
  CASE 
    WHEN aps_min < 25 THEN '< 25 (TVET/Distance)'
    WHEN aps_min BETWEEN 25 AND 32 THEN '25-32 (Mid-tier)'
    WHEN aps_min BETWEEN 33 AND 39 THEN '33-39 (Competitive)'
    WHEN aps_min >= 40 THEN '40+ (Elite)'
  END as aps_range,
  COUNT(*) as institution_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM institution_gates
WHERE qualification_id LIKE 'SAQA_%'
GROUP BY 
  CASE 
    WHEN aps_min < 25 THEN '< 25 (TVET/Distance)'
    WHEN aps_min BETWEEN 25 AND 32 THEN '25-32 (Mid-tier)'
    WHEN aps_min BETWEEN 33 AND 39 THEN '33-39 (Competitive)'
    WHEN aps_min >= 40 THEN '40+ (Elite)'
  END
ORDER BY MIN(aps_min);

-- ============================================
-- 5. ALERT THRESHOLDS (Documentation)
-- ============================================

-- These should be configured in Supabase Dashboard > Database > Webhooks
-- or via external monitoring tools like Datadog, New Relic, etc.

/*
RECOMMENDED ALERTS:

1. Performance Degradation
   - Trigger: avg_response_ms > 1000 for 5 consecutive minutes
   - Action: Investigate edge function cold starts, check database indexes

2. High Error Rate
   - Trigger: error_rate > 5% over 10 minutes
   - Action: Check edge function logs, verify database connectivity

3. Data Quality Issues
   - Trigger: null_aps > 0 OR null_subjects > 0
   - Action: Review recent data insertions, run data validation

4. Missing Logistics
   - Trigger: has_logistics = 'No' for any qualification
   - Action: Verify g12_logistics table, check foreign key constraints

5. Low Institution Count
   - Trigger: institution_count < 3 for any qualification
   - Action: Review data completeness, check for accidental deletions
*/

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

/*
To set up monitoring:

1. Execute this SQL file in Supabase SQL Editor
2. Verify views are created: 
   SELECT * FROM batch1_health_status;
   
3. Set up daily monitoring script:
   node scripts/daily-health-check.js
   
4. Configure Supabase webhooks for real-time alerts
5. Add to cron job for automated daily checks
*/
