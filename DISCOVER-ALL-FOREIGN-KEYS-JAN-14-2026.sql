-- =====================================================
-- DISCOVER ALL FOREIGN KEY CONSTRAINTS
-- Date: January 14, 2026
-- Purpose: Find ALL foreign keys that reference schools.id
-- =====================================================

-- Query 1: Find ALL foreign key constraints that reference schools.id
SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'schools'
  AND ccu.column_name = 'id'
ORDER BY tc.table_name;

-- Query 2: Find ALL columns that have school_id
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'school_id'
ORDER BY table_name;

-- Query 3: Check if schools.id has any special constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'schools'
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
ORDER BY tc.constraint_type;
