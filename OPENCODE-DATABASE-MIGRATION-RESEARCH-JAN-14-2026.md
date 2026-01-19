# OPENCODE & DATABASE MIGRATION TOOLS RESEARCH
**Comprehensive Analysis for PostgreSQL/Supabase Schema Migrations**
**Date**: January 14, 2026
**Focus**: UUID → VARCHAR migrations, Foreign Key handling, RLS policies

---

## EXECUTIVE SUMMARY

This research provides a comprehensive analysis of database migration tools and strategies, with specific focus on:
- **OpenCode**: Terminal-based AI coding agent (NOT a database migration tool)
- **Atlas**: Modern declarative schema migration tool with AI-assisted features
- **Prisma Migrate**: Schema-first ORM with expand-and-contract pattern support
- **Liquibase & Flyway**: Enterprise-grade versioned migration tools
- **dbmate**: Lightweight, framework-agnostic migration tool
- **Best Practices**: Zero-downtime PostgreSQL migrations for production

### Key Finding: OpenCode is NOT a Database Migration Tool
OpenCode is an AI coding assistant for terminal-based development, similar to GitHub Copilot but for the command line. It does NOT specialize in database migrations.

---

## 1. OPENCODE OVERVIEW

### What is OpenCode?
**OpenCode** is an open-source AI coding agent designed for terminal-based development workflows.

**Key Characteristics:**
- Terminal-native AI assistant
- Supports multiple AI models (OpenAI, Anthropic, etc.)
- Framework-agnostic code generation
- Custom tool integration via `.opencode/tool/` directory

**What OpenCode Does:**
- Generates code based on natural language prompts
- Assists with debugging and refactoring
- Integrates with existing development workflows
- Provides context-aware code suggestions

**What OpenCode Does NOT Do:**
- ❌ Database schema migration management
- ❌ Automated schema change detection
- ❌ Migration rollback strategies
- ❌ Foreign key dependency resolution
- ❌ RLS policy management

### Pricing & Licensing
- **Open Source**: MIT License (free)
- **Cost**: Pay for AI model API usage (OpenAI, Anthropic, etc.)
- **No subscription**: Unlike GitHub Copilot, no monthly fee
- **Self-hosted**: Run locally with your own API keys

### Verdict for Our Use Case
**NOT RECOMMENDED** for database migrations. OpenCode is a general-purpose coding assistant, not a specialized database migration tool.

---

## 2. ATLAS - Modern Schema Migration Tool

### Overview
Atlas is a modern, declarative database schema management tool that treats schema as code.

**Key Features:**
- **Declarative Migrations**: Define desired state, Atlas calculates the diff
- **Versioned Migrations**: Traditional change-based migrations with automatic generation
- **PostgreSQL Support**: Full support including RLS, constraints, indexes
- **Schema Inspection**: Reverse-engineer existing databases
- **Migration Directory**: Cloud-hosted migration registry (like Docker Hub for migrations)
- **CI/CD Integration**: Built-in support for automated deployments
- **ERD Generation**: Visual schema diagrams with `-w` flag

### Workflow Options

#### 1. Declarative Workflow
```bash
# Define desired schema in HCL or SQL
atlas schema apply \
  --url "postgres://localhost:5432/db" \
  --to "file://schema.sql" \
  --dev-url "postgres://localhost:5433/dev"
```

#### 2. Versioned Workflow
```bash
# Generate migration from schema diff
atlas migrate diff add_column \
  --dir "file://migrations" \
  --to "file://schema.sql" \
  --dev-url "postgres://localhost:5433/dev"

# Push to Atlas Cloud
atlas migrate push app

# Apply migrations
atlas migrate apply \
  --url "postgres://production:5432/db" \
  --dir "atlas://app"
```

### Pros & Cons

**Pros:**
- ✅ Modern, intuitive CLI
- ✅ Automatic migration generation
- ✅ Cloud-hosted migration registry
- ✅ Visual ERD generation
- ✅ Strong PostgreSQL support
- ✅ CI/CD friendly
- ✅ Free for open-source projects

**Cons:**
- ❌ Requires learning HCL (or can use SQL)
- ❌ Cloud dependency for migration registry (optional)
- ❌ Relatively new (less mature than Flyway/Liquibase)
- ❌ Limited community compared to established tools

### Pricing
- **Open Source**: Free for self-hosted
- **Atlas Cloud**: Free tier available, paid plans for teams
- **Enterprise**: Custom pricing for large organizations

### Recommendation for Our Use Case
**HIGHLY RECOMMENDED** for new projects or greenfield migrations. Modern approach with excellent PostgreSQL support.

---

## 3. PRISMA MIGRATE - Schema-First ORM

### Overview
Prisma is a modern ORM with built-in migration capabilities using a schema-first approach.

**Key Features:**
- **Schema-First**: Define schema in `schema.prisma`, migrations auto-generated
- **Expand-and-Contract Pattern**: Built-in support for zero-downtime migrations
- **Type Safety**: Generated TypeScript types from schema
- **Migration History**: Tracked in `_prisma_migrations` table
- **Rollback Support**: Can revert migrations with proper planning
- **PostgreSQL Support**: Full support including custom types, RLS

### Expand-and-Contract Pattern (Zero Downtime)

Prisma officially documents the expand-and-contract pattern for production migrations:

**Phase 1: EXPAND** - Add new structure alongside old
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  published Boolean? @default(false)  // Make nullable
  status    Status   @default(Unknown) // Add new column
}

enum Status {
  Unknown
  Draft
  Published
}
```

**Phase 2: MIGRATE** - Dual-write and backfill data
```typescript
// Data migration script
await prisma.$transaction(async (tx) => {
  const posts = await tx.post.findMany()
  for (const post of posts) {
    await tx.post.update({
      where: { id: post.id },
      data: { status: post.published ? 'Published' : 'Unknown' }
    })
  }
})
```

**Phase 3: CONTRACT** - Remove old structure
```prisma
model Post {
  id      Int    @id @default(autoincrement())
  status  Status @default(Unknown) // Only new column remains
}
```

### Workflow
```bash
# Development: Create and apply migration
npx prisma migrate dev --name add_status_column

# Production: Apply migrations only
npx prisma migrate deploy

# Generate TypeScript client
npx prisma generate
```

### Pros & Cons

**Pros:**
- ✅ Excellent TypeScript integration
- ✅ Type-safe database queries
- ✅ Official expand-and-contract documentation
- ✅ Automatic migration generation
- ✅ Strong community and documentation
- ✅ Free and open-source

**Cons:**
- ❌ Requires using Prisma ORM (can't use standalone)
- ❌ Schema must be in Prisma format (not raw SQL)
- ❌ Less flexible than raw SQL migrations
- ❌ Can be opinionated about database design

### Recommendation for Our Use Case
**RECOMMENDED** if already using Node.js/TypeScript and willing to adopt Prisma ORM. Excellent for new projects.

---

## 4. LIQUIBASE vs FLYWAY - Enterprise Migration Tools

### Comparison Matrix

| Feature | Liquibase | Flyway |
|---------|-----------|--------|
| **Format** | XML, YAML, JSON, SQL | SQL (primary) |
| **Approach** | Declarative changesets | Versioned SQL scripts |
| **Rollback** | Built-in rollback support | Manual rollback scripts |
| **Database Support** | 60+ databases | 20+ databases |
| **Learning Curve** | Steeper (XML/YAML) | Easier (SQL) |
| **Flexibility** | High (abstraction layer) | Medium (SQL-based) |
| **Community** | Large enterprise | Large enterprise |
| **License** | Open-source + Commercial | Open-source + Commercial |
| **Best For** | Complex multi-DB environments | PostgreSQL-focused projects |

### Liquibase

**Key Features:**
- Database-agnostic changesets (XML/YAML/JSON)
- Built-in rollback generation
- Preconditions and contexts
- Change tracking in `DATABASECHANGELOG` table

**Example Changeset:**
```xml
<changeSet id="1" author="dev">
  <addColumn tableName="users">
    <column name="email" type="varchar(255)"/>
  </addColumn>
  <rollback>
    <dropColumn tableName="users" columnName="email"/>
  </rollback>
</changeSet>
```

**Pros:**
- ✅ Database-agnostic (portable across DBs)
- ✅ Automatic rollback generation
- ✅ Enterprise-grade features
- ✅ Extensive documentation

**Cons:**
- ❌ XML/YAML complexity
- ❌ Less intuitive than SQL
- ❌ Steeper learning curve
- ❌ Commercial features behind paywall

### Flyway

**Key Features:**
- SQL-first approach (native PostgreSQL syntax)
- Simple versioning scheme (V1__description.sql)
- Change tracking in `flyway_schema_history` table
- Callbacks for custom logic

**Example Migration:**
```sql
-- V1__add_email_column.sql
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- V2__add_email_index.sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Pros:**
- ✅ Simple SQL-based approach
- ✅ Easy to learn and use
- ✅ PostgreSQL-native syntax
- ✅ Strong community support

**Cons:**
- ❌ No automatic rollback generation
- ❌ Less database abstraction
- ❌ Manual rollback scripts required
- ❌ Commercial features behind paywall

### Recommendation for Our Use Case
**FLYWAY RECOMMENDED** for PostgreSQL/Supabase. SQL-first approach is more intuitive and PostgreSQL-native.

---

## 5. DBMATE - Lightweight Migration Tool

### Overview
dbmate is a lightweight, framework-agnostic database migration tool written in Go.

**Key Features:**
- Simple CLI tool (single binary)
- SQL-based migrations
- Multiple database support (PostgreSQL, MySQL, SQLite)
- No dependencies or frameworks required
- Migration rollback support

### Workflow
```bash
# Create new migration
dbmate new add_email_column

# Apply migrations
dbmate up

# Rollback last migration
dbmate rollback

# Check migration status
dbmate status
```

### Migration Format
```sql
-- migrate:up
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- migrate:down
ALTER TABLE users DROP COLUMN email;
```

### Pros & Cons

**Pros:**
- ✅ Extremely lightweight (single binary)
- ✅ No dependencies
- ✅ Simple and intuitive
- ✅ Fast execution
- ✅ Free and open-source

**Cons:**
- ❌ Limited features compared to enterprise tools
- ❌ No advanced rollback strategies
- ❌ Smaller community
- ❌ No GUI or visualization

### Recommendation for Our Use Case
**GOOD FOR SIMPLE PROJECTS**. Excellent for straightforward migrations without complex requirements.

---

## 6. AI-POWERED DATABASE MIGRATION TOOLS (2025)

### Emerging AI Tools

#### 1. **Harness Database DevOps** (NEW - 2025)
- AI-powered migration authoring using natural language
- Describe schema changes in plain English
- Automatically generates compliant, production-ready migrations
- Built-in rollback and governance
- **Status**: Commercial product, recently announced

#### 2. **AWS DMS with Generative AI**
- AI-assisted schema conversion
- Automates time-intensive conversion tasks
- Reduces migration costs and accelerates timelines
- **Status**: Available in AWS DMS Schema Conversion

#### 3. **Caylent Accelerate™**
- AI-powered legacy database modernization
- 3x faster migrations using SQL Polyglot and AWS GenAI
- **Status**: Commercial AWS partner solution

### Reality Check: AI Migration Tools in 2026

**Current State:**
- Most AI tools focus on **code generation**, not migration management
- AI can help **write SQL**, but can't replace migration strategy
- No AI tool fully understands **business logic** and **data dependencies**
- Human oversight still critical for production migrations

**Best Use of AI for Migrations:**
- Generate boilerplate SQL from natural language
- Suggest migration strategies based on schema analysis
- Identify potential issues (foreign keys, indexes, constraints)
- Generate test cases for migration validation

**Recommendation:**
Use AI (like Kiro, OpenCode, or ChatGPT) as a **coding assistant** for writing migrations, but rely on proven tools (Atlas, Flyway, Prisma) for **execution and management**.

---

## 7. POSTGRESQL BEST PRACTICES FOR SCHEMA MIGRATIONS

### Zero-Downtime Migration Strategy: Expand-and-Contract Pattern

This pattern is the **industry standard** for production database migrations without downtime.

#### Phase 1: EXPAND (Add New Structure)
```sql
-- Add new column (nullable, no default to avoid table rewrite)
ALTER TABLE student_assessments 
ADD COLUMN school_id_new VARCHAR(255);

-- Create index concurrently (doesn't block reads/writes)
CREATE INDEX CONCURRENTLY idx_student_assessments_school_id_new 
ON student_assessments(school_id_new);
```

#### Phase 2: MIGRATE (Dual-Write and Backfill)
```sql
-- Backfill existing data in batches
DO $$
DECLARE
  batch_size INT := 1000;
  offset_val INT := 0;
BEGIN
  LOOP
    UPDATE student_assessments
    SET school_id_new = school_id::VARCHAR
    WHERE school_id_new IS NULL
    LIMIT batch_size;
    
    EXIT WHEN NOT FOUND;
    offset_val := offset_val + batch_size;
    
    -- Commit after each batch to avoid long transactions
    COMMIT;
  END LOOP;
END $$;

-- Application code: Dual-write to both columns
-- INSERT INTO student_assessments (school_id, school_id_new, ...)
-- VALUES (uuid_val, uuid_val::VARCHAR, ...)
```

#### Phase 3: CONTRACT (Remove Old Structure)

**Step 1: Drop Foreign Keys**
```sql
-- Find all foreign keys referencing school_id
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'school_id';

-- Drop each foreign key
ALTER TABLE student_assessments 
DROP CONSTRAINT IF EXISTS fk_student_assessments_school_id;
```

**Step 2: Rename New Column**
```sql
-- Rename new column to old name (fast, catalog-only operation)
ALTER TABLE student_assessments 
RENAME COLUMN school_id_new TO school_id;

-- Rename index
ALTER INDEX idx_student_assessments_school_id_new 
RENAME TO idx_student_assessments_school_id;
```

**Step 3: Recreate Foreign Keys**
```sql
-- Add foreign key constraint (use NOT VALID to avoid full table scan)
ALTER TABLE student_assessments 
ADD CONSTRAINT fk_student_assessments_school_id 
FOREIGN KEY (school_id) REFERENCES schools(id) 
NOT VALID;

-- Validate constraint in background (doesn't block writes)
ALTER TABLE student_assessments 
VALIDATE CONSTRAINT fk_student_assessments_school_id;
```

### Critical PostgreSQL Locking Considerations

**Lock Levels (from least to most restrictive):**
1. **ACCESS SHARE** - SELECT queries
2. **ROW SHARE** - SELECT FOR UPDATE
3. **ROW EXCLUSIVE** - INSERT, UPDATE, DELETE
4. **SHARE UPDATE EXCLUSIVE** - VACUUM, CREATE INDEX CONCURRENTLY
5. **SHARE** - CREATE INDEX
6. **SHARE ROW EXCLUSIVE** - CREATE TRIGGER
7. **EXCLUSIVE** - REFRESH MATERIALIZED VIEW CONCURRENTLY
8. **ACCESS EXCLUSIVE** - ALTER TABLE, DROP TABLE, TRUNCATE

**Safe Operations (Short Locks):**
- ✅ `ADD COLUMN` (without DEFAULT in PG <11)
- ✅ `CREATE INDEX CONCURRENTLY`
- ✅ `DROP INDEX CONCURRENTLY`
- ✅ `ADD CONSTRAINT ... NOT VALID`
- ✅ `VALIDATE CONSTRAINT`
- ✅ `RENAME COLUMN` (catalog-only)

**Dangerous Operations (Long Locks):**
- ❌ `ALTER COLUMN TYPE` (full table rewrite)
- ❌ `ADD COLUMN ... DEFAULT` (PG <11, full table rewrite)
- ❌ `ADD CONSTRAINT` (without NOT VALID, full table scan)
- ❌ `DROP COLUMN` (if indexes not dropped first)
- ❌ `CREATE INDEX` (without CONCURRENTLY)

### Lock Timeout Strategy

Always set lock timeout to prevent indefinite blocking:

```sql
-- Set lock timeout for session
SET lock_timeout = '5s';

-- Attempt migration
BEGIN;
  ALTER TABLE student_assessments ADD COLUMN school_id_new VARCHAR(255);
COMMIT;

-- If lock timeout occurs, retry with exponential backoff
```

### Transaction Management

**Rule 1: Keep Transactions Short**
```sql
-- BAD: Long transaction holding locks
BEGIN;
  ALTER TABLE users ADD COLUMN email VARCHAR(255);
  -- ... lots of data manipulation ...
  UPDATE users SET email = generate_email(id);
COMMIT;

-- GOOD: Separate DDL and data manipulation
BEGIN;
  ALTER TABLE users ADD COLUMN email VARCHAR(255);
COMMIT;

-- Backfill in batches (separate transactions)
DO $$ ... END $$;
```

**Rule 2: Use Savepoints for Partial Rollback**
```sql
BEGIN;
  SAVEPOINT before_alter;
  
  ALTER TABLE users ADD COLUMN email VARCHAR(255);
  
  -- If something goes wrong, rollback to savepoint
  ROLLBACK TO SAVEPOINT before_alter;
  
  -- Or release savepoint if successful
  RELEASE SAVEPOINT before_alter;
COMMIT;
```

**Rule 3: PostgreSQL DDL is Transactional**
Unlike MySQL, PostgreSQL allows DDL rollback:
```sql
BEGIN;
  CREATE TABLE test (id INT);
  ALTER TABLE test ADD COLUMN name VARCHAR(255);
  -- Oops, changed my mind
ROLLBACK; -- Everything is undone!
```

---

## 8. SPECIFIC SOLUTION: UUID → VARCHAR MIGRATION

### Our Current Problem
- **Table**: `student_assessments`
- **Column**: `school_id` (currently UUID)
- **Target**: VARCHAR(255)
- **Constraints**: Foreign keys, RLS policies, indexes

### Step-by-Step Migration Plan

#### Step 1: Discovery (COMPLETED)
```sql
-- Find all foreign keys
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name = 'student_assessments';

-- Find all RLS policies
SELECT policyname, tablename, cmd 
FROM pg_policies 
WHERE tablename = 'student_assessments';
```

#### Step 2: Expand Phase (Add New Column)
```sql
-- Transaction 1: Add new column
BEGIN;
  SET lock_timeout = '5s';
  
  ALTER TABLE student_assessments 
  ADD COLUMN school_id_varchar VARCHAR(255);
  
COMMIT;

-- Transaction 2: Create index concurrently (outside transaction)
CREATE INDEX CONCURRENTLY idx_student_assessments_school_id_varchar 
ON student_assessments(school_id_varchar);
```

#### Step 3: Migrate Phase (Backfill Data)
```sql
-- Backfill in batches to avoid long transactions
DO $$
DECLARE
  batch_size INT := 1000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE student_assessments
    SET school_id_varchar = school_id::VARCHAR
    WHERE school_id_varchar IS NULL
      AND school_id IS NOT NULL
    LIMIT batch_size;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    
    -- Small delay to avoid overwhelming database
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;

-- Verify backfill
SELECT 
  COUNT(*) as total,
  COUNT(school_id_varchar) as backfilled,
  COUNT(*) - COUNT(school_id_varchar) as remaining
FROM student_assessments;
```

#### Step 4: Contract Phase (Swap Columns)

**Option A: Rename Approach (Recommended)**
```sql
-- Transaction 1: Drop foreign keys
BEGIN;
  SET lock_timeout = '5s';
  
  ALTER TABLE student_assessments 
  DROP CONSTRAINT IF EXISTS fk_student_assessments_school_id;
  
COMMIT;

-- Transaction 2: Rename columns (fast, catalog-only)
BEGIN;
  SET lock_timeout = '5s';
  
  ALTER TABLE student_assessments 
  RENAME COLUMN school_id TO school_id_old;
  
  ALTER TABLE student_assessments 
  RENAME COLUMN school_id_varchar TO school_id;
  
COMMIT;

-- Transaction 3: Recreate foreign key with NOT VALID
BEGIN;
  SET lock_timeout = '5s';
  
  ALTER TABLE student_assessments 
  ADD CONSTRAINT fk_student_assessments_school_id 
  FOREIGN KEY (school_id) REFERENCES schools(id) 
  NOT VALID;
  
COMMIT;

-- Transaction 4: Validate constraint (doesn't block writes)
ALTER TABLE student_assessments 
VALIDATE CONSTRAINT fk_student_assessments_school_id;

-- Transaction 5: Drop old column
BEGIN;
  SET lock_timeout = '5s';
  
  ALTER TABLE student_assessments 
  DROP COLUMN school_id_old;
  
COMMIT;
```

**Option B: Drop and Recreate (If Rename Fails)**
```sql
-- Only if rename approach doesn't work
BEGIN;
  SET lock_timeout = '5s';
  
  -- Drop old column (after verifying new column has all data)
  ALTER TABLE student_assessments DROP COLUMN school_id;
  
  -- Rename new column
  ALTER TABLE student_assessments 
  RENAME COLUMN school_id_varchar TO school_id;
  
COMMIT;
```

#### Step 5: RLS Policy Management

**Approach 1: Disable RLS During Migration**
```sql
-- Disable RLS temporarily (requires superuser)
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;

-- Perform migration...

-- Re-enable RLS
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
```

**Approach 2: Update Policies to Handle Both Columns**
```sql
-- During migration, update policies to check both columns
CREATE POLICY "policy_name" ON student_assessments
FOR SELECT
USING (
  school_id = current_setting('app.current_school_id')::VARCHAR
  OR school_id_varchar = current_setting('app.current_school_id')::VARCHAR
);

-- After migration, simplify policy
DROP POLICY "policy_name" ON student_assessments;
CREATE POLICY "policy_name" ON student_assessments
FOR SELECT
USING (school_id = current_setting('app.current_school_id')::VARCHAR);
```

#### Step 6: Verification and Testing

**Pre-Migration Verification:**
```sql
-- Count records
SELECT COUNT(*) FROM student_assessments;

-- Check data types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_assessments' 
  AND column_name LIKE '%school_id%';

-- Verify foreign keys
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'student_assessments';
```

**Post-Migration Verification:**
```sql
-- Verify data integrity
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT school_id) as unique_schools,
  COUNT(*) FILTER (WHERE school_id IS NULL) as null_schools
FROM student_assessments;

-- Verify foreign key works
INSERT INTO student_assessments (school_id, ...) 
VALUES ('invalid-school-id', ...); -- Should fail

-- Test RLS policies
SET app.current_school_id = 'test-school-id';
SELECT COUNT(*) FROM student_assessments; -- Should only see authorized records
```

---

## 9. INTEGRATION WITH KIRO WORKFLOW

### Automated Migration Workflow

**Step 1: Create Migration Script Template**
```javascript
// scripts/create-migration.js
const fs = require('fs');
const path = require('path');

function createMigration(name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${name}.sql`;
  const filepath = path.join('supabase/migrations', filename);
  
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Author: Kiro AI Assistant

-- EXPAND PHASE
-- Add new structures alongside old

-- MIGRATE PHASE  
-- Backfill data and dual-write

-- CONTRACT PHASE
-- Remove old structures

-- VERIFICATION
-- Test data integrity
`;
  
  fs.writeFileSync(filepath, template);
  console.log(`✅ Created migration: ${filename}`);
  return filepath;
}

module.exports = { createMigration };
```

**Step 2: Pre-Migration Safety Checks**
```javascript
// scripts/pre-migration-check.js
const { createClient } = require('@supabase/supabase-js');

async function preMigrationCheck(tableName) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  console.log('🔍 Running pre-migration checks...');
  
  // Check 1: Verify table exists
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', tableName);
  
  if (!tables || tables.length === 0) {
    throw new Error(`Table ${tableName} not found`);
  }
  
  // Check 2: Count records
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  console.log(`✅ Table has ${count} records`);
  
  // Check 3: Verify no active long-running queries
  const { data: queries } = await supabase.rpc('pg_stat_activity', {
    query: `SELECT * FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query_start < NOW() - INTERVAL '5 minutes'`
  });
  
  if (queries && queries.length > 0) {
    console.warn('⚠️ Long-running queries detected:', queries);
  }
  
  console.log('✅ Pre-migration checks passed');
  return true;
}

module.exports = { preMigrationCheck };
```

**Step 3: Migration Execution with Rollback**
```javascript
// scripts/execute-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function executeMigration(migrationFile, options = {}) {
  const { dryRun = false, rollbackOnError = true } = options;
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  const sql = fs.readFileSync(migrationFile, 'utf8');
  
  console.log(`🚀 Executing migration: ${migrationFile}`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    console.log(sql);
    return;
  }
  
  try {
    // Execute migration in transaction
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        BEGIN;
        SET lock_timeout = '5s';
        ${sql}
        COMMIT;
      `
    });
    
    if (error) throw error;
    
    console.log('✅ Migration executed successfully');
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (rollbackOnError) {
      console.log('🔄 Rolling back changes...');
      await supabase.rpc('exec_sql', { sql: 'ROLLBACK;' });
      console.log('✅ Rollback complete');
    }
    
    throw error;
  }
}

module.exports = { executeMigration };
```

**Step 4: Post-Migration Verification**
```javascript
// scripts/post-migration-verify.js
async function postMigrationVerify(tableName, checks) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  
  console.log('🔍 Running post-migration verification...');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Check 1: Record count unchanged
  if (checks.recordCount) {
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (count === checks.recordCount) {
      results.passed.push(`Record count: ${count}`);
    } else {
      results.failed.push(
        `Record count mismatch: expected ${checks.recordCount}, got ${count}`
      );
    }
  }
  
  // Check 2: Column exists
  if (checks.columnName) {
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', tableName)
      .eq('column_name', checks.columnName);
    
    if (columns && columns.length > 0) {
      results.passed.push(`Column ${checks.columnName} exists`);
    } else {
      results.failed.push(`Column ${checks.columnName} not found`);
    }
  }
  
  // Check 3: Foreign keys intact
  if (checks.foreignKeys) {
    const { data: fks } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name')
      .eq('table_name', tableName)
      .eq('constraint_type', 'FOREIGN KEY');
    
    const fkCount = fks ? fks.length : 0;
    if (fkCount >= checks.foreignKeys) {
      results.passed.push(`Foreign keys: ${fkCount}`);
    } else {
      results.warnings.push(
        `Foreign key count: expected ${checks.foreignKeys}, got ${fkCount}`
      );
    }
  }
  
  // Print results
  console.log('\n✅ PASSED:', results.passed.length);
  results.passed.forEach(p => console.log(`  ✓ ${p}`));
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:', results.warnings.length);
    results.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED:', results.failed.length);
    results.failed.forEach(f => console.log(`  ✗ ${f}`));
    throw new Error('Post-migration verification failed');
  }
  
  console.log('\n✅ All verification checks passed');
  return results;
}

module.exports = { postMigrationVerify };
```

### Kiro Workflow Integration

**Add to package.json:**
```json
{
  "scripts": {
    "migration:create": "node scripts/create-migration.js",
    "migration:check": "node scripts/pre-migration-check.js",
    "migration:execute": "node scripts/execute-migration.js",
    "migration:verify": "node scripts/post-migration-verify.js",
    "migration:dry-run": "node scripts/execute-migration.js --dry-run"
  }
}
```

**Kiro Command Template:**
```bash
# Create new migration
npm run migration:create add_school_id_varchar

# Run pre-migration checks
npm run migration:check student_assessments

# Dry run (preview changes)
npm run migration:dry-run supabase/migrations/2026-01-14_add_school_id_varchar.sql

# Execute migration
npm run migration:execute supabase/migrations/2026-01-14_add_school_id_varchar.sql

# Verify migration
npm run migration:verify student_assessments
```

---

## 10. COST-BENEFIT ANALYSIS

### Tool Comparison: Total Cost of Ownership

| Tool | Setup Time | Learning Curve | Execution Time | Maintenance | Total Cost |
|------|-----------|----------------|----------------|-------------|------------|
| **Manual SQL** | 1 hour | Low | 2-4 hours | High | Medium |
| **Atlas** | 2 hours | Medium | 1-2 hours | Low | Low |
| **Prisma** | 4 hours | Medium | 1-2 hours | Low | Medium |
| **Flyway** | 2 hours | Low | 2-3 hours | Medium | Medium |
| **Liquibase** | 3 hours | High | 2-3 hours | Medium | High |
| **dbmate** | 30 min | Low | 2-3 hours | Medium | Low |

### Credit-Saving Strategies

**1. Use Kiro for SQL Generation, Not Execution**
- Let Kiro write the SQL migration scripts
- Review and test manually before execution
- Saves credits by avoiding trial-and-error in production

**2. Document Everything in Context Files**
- Create migration templates (one-time cost)
- Reuse patterns across migrations (zero additional cost)
- Build institutional knowledge base

**3. Automate Verification**
- Write verification scripts once
- Run automatically after each migration
- Catch errors early (saves debugging credits)

**4. Use Subagents for Research**
- Delegate research tasks to subagents
- Gather information once, use many times
- Build comprehensive documentation

**5. Leverage AI for Code Review**
- Have Kiro review migration SQL before execution
- Identify potential issues early
- Prevent costly production failures

### Estimated Credit Savings

**Without Automation:**
- Initial migration: 500-1000 credits (trial and error)
- Debugging: 300-500 credits per issue
- Context recovery: 200-300 credits per session
- **Total per migration: 1000-1800 credits**

**With Automation:**
- Initial setup: 800 credits (one-time)
- Per migration: 200-300 credits (template-based)
- Debugging: 50-100 credits (automated verification)
- Context recovery: 0 credits (documented)
- **Total per migration: 250-400 credits**

**Savings: 60-75% reduction in credits per migration**

---

## 11. FINAL RECOMMENDATIONS

### For Our Current Situation (UUID → VARCHAR Migration)

**Immediate Action Plan:**

1. **Use Manual SQL with Expand-and-Contract Pattern**
   - Most control and transparency
   - No new tool dependencies
   - Proven approach for production systems
   - Estimated time: 4-6 hours total

2. **Implement Automated Verification Scripts**
   - Pre-migration checks
   - Post-migration verification
   - Rollback automation
   - Estimated time: 2-3 hours (reusable)

3. **Document Everything in Context Files**
   - Migration strategy
   - Rollback procedures
   - Lessons learned
   - Estimated time: 1 hour

**Total Time Investment: 7-10 hours**
**Credit Investment: 300-500 credits**
**Risk Level: Low (with proper testing)**

### For Future Migrations

**Short-term (Next 3 months):**
- Continue with manual SQL + automation scripts
- Build migration template library
- Document common patterns

**Medium-term (3-6 months):**
- Evaluate **Flyway** for versioned migrations
- Integrate with CI/CD pipeline
- Automate deployment process

**Long-term (6-12 months):**
- Consider **Atlas** for declarative migrations
- Implement schema-as-code workflow
- Full automation with monitoring

### Tool Selection Matrix

**Choose Manual SQL if:**
- ✅ One-off migration
- ✅ Need maximum control
- ✅ Small team
- ✅ Simple schema changes

**Choose Flyway if:**
- ✅ Regular migrations
- ✅ Team collaboration
- ✅ SQL-first approach
- ✅ CI/CD integration needed

**Choose Atlas if:**
- ✅ Modern tech stack
- ✅ Declarative approach preferred
- ✅ Need schema visualization
- ✅ Cloud-native workflow

**Choose Prisma if:**
- ✅ TypeScript/Node.js project
- ✅ Want ORM + migrations
- ✅ Type safety important
- ✅ Greenfield project

**Choose Liquibase if:**
- ✅ Multi-database support needed
- ✅ Enterprise requirements
- ✅ Complex rollback scenarios
- ✅ Existing Liquibase experience

**Choose dbmate if:**
- ✅ Simple migrations
- ✅ Minimal dependencies
- ✅ Fast execution
- ✅ Small projects

---

## 12. KNOWLEDGE BASE BUILDING

### Migration Pattern Library

Create reusable migration patterns in `.kiro/patterns/`:

**Pattern 1: Add Column**
```sql
-- Pattern: add-column.sql
-- Usage: Replace {{TABLE}}, {{COLUMN}}, {{TYPE}}

BEGIN;
SET lock_timeout = '5s';

ALTER TABLE {{TABLE}} 
ADD COLUMN {{COLUMN}} {{TYPE}};

COMMIT;
```

**Pattern 2: Change Column Type (Expand-Contract)**
```sql
-- Pattern: change-column-type.sql
-- Phase 1: EXPAND
BEGIN;
SET lock_timeout = '5s';
ALTER TABLE {{TABLE}} ADD COLUMN {{COLUMN}}_new {{NEW_TYPE}};
COMMIT;

CREATE INDEX CONCURRENTLY idx_{{TABLE}}_{{COLUMN}}_new 
ON {{TABLE}}({{COLUMN}}_new);

-- Phase 2: MIGRATE (run separately)
DO $$
DECLARE
  batch_size INT := 1000;
BEGIN
  LOOP
    UPDATE {{TABLE}}
    SET {{COLUMN}}_new = {{COLUMN}}::{{NEW_TYPE}}
    WHERE {{COLUMN}}_new IS NULL
    LIMIT batch_size;
    
    EXIT WHEN NOT FOUND;
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;

-- Phase 3: CONTRACT (after verification)
BEGIN;
SET lock_timeout = '5s';
ALTER TABLE {{TABLE}} DROP COLUMN {{COLUMN}};
ALTER TABLE {{TABLE}} RENAME COLUMN {{COLUMN}}_new TO {{COLUMN}};
COMMIT;
```

**Pattern 3: Add Foreign Key (Safe)**
```sql
-- Pattern: add-foreign-key.sql
BEGIN;
SET lock_timeout = '5s';

ALTER TABLE {{TABLE}} 
ADD CONSTRAINT {{CONSTRAINT_NAME}} 
FOREIGN KEY ({{COLUMN}}) 
REFERENCES {{REF_TABLE}}({{REF_COLUMN}}) 
NOT VALID;

COMMIT;

-- Validate in background (doesn't block writes)
ALTER TABLE {{TABLE}} 
VALIDATE CONSTRAINT {{CONSTRAINT_NAME}};
```

### Context Transfer Template

Create `.kiro/context/migration-context-template.md`:

```markdown
# MIGRATION CONTEXT: [MIGRATION_NAME]
**Date**: [DATE]
**Status**: [Planning/In Progress/Complete]

## Objective
[What are we trying to achieve?]

## Current State
- Table: [TABLE_NAME]
- Column: [COLUMN_NAME]
- Type: [CURRENT_TYPE]
- Constraints: [LIST]
- RLS Policies: [LIST]

## Target State
- Column: [COLUMN_NAME]
- Type: [NEW_TYPE]
- Constraints: [LIST]
- RLS Policies: [LIST]

## Migration Strategy
- [ ] Phase 1: Expand
- [ ] Phase 2: Migrate
- [ ] Phase 3: Contract

## Rollback Plan
[How to undo if something goes wrong]

## Verification Checklist
- [ ] Record count unchanged
- [ ] Data integrity verified
- [ ] Foreign keys working
- [ ] RLS policies enforced
- [ ] Application tests passing

## Lessons Learned
[What worked, what didn't]
```

---

## 13. CONCLUSION

### Key Takeaways

1. **OpenCode is NOT a database migration tool** - it's a general-purpose AI coding assistant

2. **Expand-and-Contract is the gold standard** for zero-downtime migrations in production

3. **PostgreSQL DDL is transactional** - use this to your advantage with proper transaction management

4. **Lock management is critical** - always set `lock_timeout` and use `CONCURRENTLY` where possible

5. **Automation saves credits** - invest in reusable scripts and patterns

6. **Documentation prevents context loss** - maintain comprehensive migration records

### Recommended Approach for Our Project

**Immediate (This Week):**
1. Use manual SQL with expand-and-contract pattern
2. Implement automated verification scripts
3. Document migration in context file

**Short-term (This Month):**
1. Build migration pattern library
2. Create reusable automation scripts
3. Establish migration workflow

**Long-term (This Quarter):**
1. Evaluate Flyway for versioned migrations
2. Integrate with CI/CD pipeline
3. Consider Atlas for future projects

### Success Metrics

- ✅ Zero downtime during migrations
- ✅ 100% data integrity maintained
- ✅ 60-75% reduction in credits per migration
- ✅ <5 minute context recovery time
- ✅ Reusable patterns for future migrations

---

## REFERENCES

### Official Documentation
- [Atlas Documentation](https://atlasgo.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Flyway Documentation](https://flywaydb.org/documentation)
- [Liquibase Documentation](https://docs.liquibase.com)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

### Key Articles
- [PostgreSQL at Scale: Schema Changes Without Downtime (PayPal)](https://medium.com/paypal-tech/postgresql-at-scale-database-schema-changes-without-downtime-20d3749ed680)
- [Expand and Contract Pattern (Prisma)](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)
- [Zero-Downtime Migrations](https://www.caduh.com/blog/zero-downtime-migrations)

### Tools
- [OpenCode GitHub](https://github.com/opencode-ai/opencode)
- [Atlas GitHub](https://github.com/ariga/atlas)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [Flyway](https://flywaydb.org)
- [Liquibase](https://www.liquibase.org)
- [dbmate GitHub](https://github.com/amacneil/dbmate)

---

**Document Version**: 1.0
**Last Updated**: January 14, 2026
**Author**: Kiro AI Assistant
**Review Status**: Ready for Implementation

---

## NEXT STEPS

1. ✅ Review this research document
2. ⏭️ Decide on migration approach (recommend: Manual SQL + Automation)
3. ⏭️ Create migration scripts using patterns from Section 8
4. ⏭️ Test migration on local database
5. ⏭️ Execute migration on production with proper verification
6. ⏭️ Document lessons learned
7. ⏭️ Build reusable pattern library for future migrations

**Estimated Total Time**: 8-12 hours
**Estimated Credit Cost**: 300-500 credits
**Risk Level**: Low (with proper testing and verification)
**Expected Outcome**: Successful UUID → VARCHAR migration with zero downtime
