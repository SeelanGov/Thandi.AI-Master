# Week 1, Day 1 Implementation Guide

## Overview
Today you'll set up the foundation: project structure, Supabase database, and basic API endpoints. By end of day, you'll have a working database with the schema deployed and a simple test endpoint.

**Time Allocation**: 8 hours
**Goal**: Working project that can connect to Supabase and execute basic queries

---

## Task 1: Project Setup (2 hours)

### Step 1.1: Initialize Next.js Project
```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest thandi-rag-system --typescript --tailwind --app --no-src-dir

cd thandi-rag-system
```

**Configuration choices**:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src/ directory (keep it simple)
- ✅ Import alias (@/*)

### Step 1.2: Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install openai
npm install zod  # For validation

# Development dependencies
npm install -D @types/node
```

### Step 1.3: Create Environment Variables
Create `.env.local` file in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Application Configuration
NODE_ENV=development
```

Create `.env.example` (for version control):
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
NODE_ENV=development
```

### Step 1.4: Create Project Structure
```bash
# Create directory structure
mkdir -p lib/supabase
mkdir -p lib/openai
mkdir -p lib/types
mkdir -p lib/utils
mkdir -p app/api/rag
mkdir -p app/api/test
mkdir -p scripts
```

**Acceptance Criteria**:
- [ ] Next.js project created and runs (`npm run dev`)
- [ ] All dependencies installed without errors
- [ ] Environment variables file created
- [ ] Directory structure matches plan

---

## Task 2: Supabase Setup (3 hours)

### Step 2.1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project: "thandi-rag-system"
3. Choose region: closest to South Africa (EU West recommended)
4. Set strong database password (save it!)
5. Wait for project to provision (~2 minutes)

### Step 2.2: Get Supabase Credentials
1. Go to Project Settings → API
2. Copy these values to `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2.3: Enable pgvector Extension
1. In Supabase Dashboard, go to SQL Editor
2. Create new query
3. Run this SQL:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

4. You should see output confirming vector extension is installed

### Step 2.4: Deploy Database Schema
1. In Supabase SQL Editor, create new query
2. Copy entire contents of `database-schema.sql`
3. Run the query (this will take ~30 seconds)
4. Verify tables created:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- bursaries
- careers
- emerging_careers
- knowledge_chunks
- knowledge_modules
- recommendations
- student_assessments
- subject_career_mappings
- subject_combinations
- test_questions
- test_results
- universities
- university_programs

### Step 2.5: Create Supabase Client
Create `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Client for browser/client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

**Acceptance Criteria**:
- [ ] Supabase project created and accessible
- [ ] pgvector extension enabled
- [ ] All database tables created successfully
- [ ] Supabase client code created
- [ ] Can connect to database from Next.js

---

## Task 3: Basic API Endpoints & Testing (3 hours)

### Step 3.1: Create TypeScript Types
Create `lib/types/database.ts`:

```typescript
export interface KnowledgeModule {
  id: string;
  module_name: string;
  description: string | null;
  priority: number;
  last_updated: string;
  version: number;
}

export interface University {
  id: string;
  university_code: string;
  university_name: string;
  province: string;
  university_type: string;
  website_url: string | null;
  contact_info: Record<string, any> | null;
  ranking_info: Record<string, any> | null;
  created_at: string;
}

export interface Bursary {
  id: string;
  bursary_code: string;
  bursary_name: string;
  provider_name: string;
  provider_type: string | null;
  bursary_type: string;
  amount_description: string;
  fields_of_study: string[];
  eligibility_criteria: Record<string, any>;
  application_deadline: string | null;
  application_url: string | null;
  created_at: string;
}

export interface Career {
  id: string;
  career_code: string;
  career_title: string;
  career_category: string;
  short_description: string;
  required_education: string;
  required_qualifications: string[];
  salary_entry_min: number;
  salary_entry_max: number;
  job_outlook: string;
  demand_level: string;
  skills_required: string[];
  created_at: string;
}

export interface KnowledgeChunk {
  id: string;
  module_id: string;
  source_entity_id: string | null;
  source_entity_type: string | null;
  chunk_text: string;
  chunk_metadata: Record<string, any> | null;
  embedding: number[] | null;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  question_id: string;
  category: string;
  question_text: string;
  ideal_answer: string;
  key_points: string[];
  required_modules: string[];
  created_at: string;
}
```

### Step 3.2: Create Health Check Endpoint
Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Test database connection
    const { data: modules, error } = await supabaseAdmin
      .from('knowledge_modules')
      .select('module_name, priority')
      .order('priority');

    if (error) {
      throw error;
    }

    // Test pgvector extension
    const { data: vectorTest, error: vectorError } = await supabaseAdmin
      .rpc('pg_extension_exists', { extension_name: 'vector' });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        modules_count: modules?.length || 0,
        modules: modules,
      },
      pgvector: {
        enabled: !vectorError,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, { status: 500 });
  }
}
```

### Step 3.3: Create Database Test Endpoint
Create `app/api/test/database/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  const results: Record<string, any> = {};

  try {
    // Test 1: Check all tables exist
    const tables = [
      'knowledge_modules',
      'universities',
      'bursaries',
      'careers',
      'subject_career_mappings',
      'emerging_careers',
      'knowledge_chunks',
      'student_assessments',
      'recommendations',
      'test_questions',
      'test_results'
    ];

    for (const table of tables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });

      results[table] = {
        exists: !error,
        count: count || 0,
        error: error?.message || null
      };
    }

    // Test 2: Check knowledge modules are populated
    const { data: modules } = await supabaseAdmin
      .from('knowledge_modules')
      .select('*')
      .order('priority');

    results.modules_detail = modules;

    // Test 3: Check indexes exist
    const { data: indexes } = await supabaseAdmin
      .rpc('get_table_indexes', { table_name: 'knowledge_chunks' });

    results.indexes = indexes;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      results
    }, { status: 500 });
  }
}
```

### Step 3.4: Create Module Info Endpoint
Create `app/api/modules/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data: modules, error } = await supabaseAdmin
      .from('knowledge_modules')
      .select('*')
      .order('priority', { ascending: true });

    if (error) throw error;

    // Get counts for each module
    const modulesWithCounts = await Promise.all(
      modules.map(async (module) => {
        const { count: chunkCount } = await supabaseAdmin
          .from('knowledge_chunks')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);

        return {
          ...module,
          chunk_count: chunkCount || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      modules: modulesWithCounts,
      priority_modules: modulesWithCounts.filter(m => m.priority === 1),
      total_modules: modulesWithCounts.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Step 3.5: Test All Endpoints
Create a test script `scripts/test-endpoints.sh`:

```bash
#!/bin/bash

echo "Testing Thandi RAG System Endpoints..."
echo "======================================="
echo ""

BASE_URL="http://localhost:3000"

echo "1. Health Check:"
curl -s "$BASE_URL/api/health" | jq '.'
echo ""

echo "2. Database Test:"
curl -s "$BASE_URL/api/test/database" | jq '.'
echo ""

echo "3. Modules Info:"
curl -s "$BASE_URL/api/modules" | jq '.'
echo ""

echo "======================================="
echo "Tests complete!"
```

Make it executable:
```bash
chmod +x scripts/test-endpoints.sh
```

**Acceptance Criteria**:
- [ ] TypeScript types created for all main entities
- [ ] Health check endpoint returns 200 and shows database connection
- [ ] Database test endpoint shows all tables exist
- [ ] Modules endpoint returns 10 knowledge modules
- [ ] All endpoints tested and working

---

## End of Day 1 Checklist

### Must Have (Critical)
- [ ] Next.js project running on localhost:3000
- [ ] Supabase project created with all tables
- [ ] pgvector extension enabled
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] Can query knowledge_modules table

### Should Have (Important)
- [ ] All API endpoints created and tested
- [ ] TypeScript types defined
- [ ] Test script runs successfully
- [ ] Git repository initialized with .gitignore

### Nice to Have (Optional)
- [ ] README.md with setup instructions
- [ ] Vercel project created (don't deploy yet)
- [ ] Basic error logging setup

---

## Troubleshooting

### Issue: pgvector extension not found
**Solution**: 
```sql
-- Check if extension is available
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- If not available, contact Supabase support or use Pinecone fallback
```

### Issue: Environment variables not loading
**Solution**:
- Restart Next.js dev server after changing `.env.local`
- Verify no typos in variable names
- Check that `.env.local` is in project root

### Issue: Supabase connection timeout
**Solution**:
- Check internet connection
- Verify Supabase project is not paused (free tier pauses after inactivity)
- Check firewall/VPN settings

### Issue: TypeScript errors
**Solution**:
```bash
# Regenerate types from Supabase
npx supabase gen types typescript --project-id your-project-id > lib/types/supabase.ts
```

---

## Next Steps (Day 2)

Tomorrow you'll:
1. Create data ingestion scripts for the 5 priority modules
2. Parse existing knowledge base files
3. Generate embeddings for text chunks
4. Load test data into database

**Preparation for Day 2**:
- Review the knowledge base files in `thandi_knowledge_base/` directory
- Ensure OpenAI API key has sufficient credits
- Read about text chunking strategies for RAG
