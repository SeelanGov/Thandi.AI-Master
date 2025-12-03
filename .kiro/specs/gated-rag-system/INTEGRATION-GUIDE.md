# Integration Guide: Gates → Existing RAG System

## Current System (What You Have)

```javascript
// app/api/rag/query/route.js (current)
export async function POST(request) {
  const { studentProfile } = await request.json();
  
  // Direct RAG search on all 24 careers
  const recommendations = await ragSearch(studentProfile);
  
  // Generate report
  const report = await generateReport(recommendations);
  
  return Response.json({ report });
}
```

## New System (What to Build)

```javascript
// app/api/rag/query/route.js (with gates)
import { getRecommendationsWithGates } from '@/lib/gates/integration';

export async function POST(request) {
  const { studentProfile } = await request.json();
  
  // Load all careers from database
  const allCareers = await loadAllCareers();
  
  // Run gates + RAG + post-correction
  const result = await getRecommendationsWithGates(
    studentProfile,
    allCareers,
    ragSearch,      // Your existing RAG function
    generateReport  // Your existing report generator
  );
  
  // Track performance
  await trackGatePerformance({
    id: generateSessionId(),
    student: studentProfile,
    gateResults: result.blockedCareers,
    finalReport: result.draftReport
  });
  
  return Response.json({
    report: result.draftReport,
    stats: result.gateStats,
    warnings: result.warnings
  });
}
```

## Step-by-Step Integration

### Step 1: Add Career Metadata to Database

Your careers need these fields for gates to work:

```sql
-- Add to existing careers table
ALTER TABLE careers ADD COLUMN IF NOT EXISTS requires_core_math BOOLEAN DEFAULT false;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS requires_physical_science BOOLEAN DEFAULT false;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS min_math_mark INTEGER;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS min_english_mark INTEGER;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS requires_nbt BOOLEAN DEFAULT false;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS nsfas_eligible BOOLEAN DEFAULT true;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS tvet_alternative TEXT;
ALTER TABLE careers ADD COLUMN IF NOT EXISTS required_subjects TEXT[]; -- Array of subject names

-- Example: Update Engineering careers
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  min_math_mark = 60,
  min_english_mark = 50,
  requires_nbt = true,
  tvet_alternative = 'Engineering Technician (TVET)'
WHERE category = 'Engineering';

-- Example: Update Medicine
UPDATE careers 
SET 
  requires_core_math = true,
  requires_physical_science = true,
  min_math_mark = 70,
  min_english_mark = 60,
  requires_nbt = true,
  required_subjects = ARRAY['Mathematics', 'Physical Sciences', 'Life Sciences']
WHERE name = 'Medicine';
```

### Step 2: Add University Data (for APS Gate)

```sql
-- Create universities table if not exists
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province TEXT,
  annual_cost INTEGER, -- in Rands
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career-university junction table
CREATE TABLE IF NOT EXISTS career_universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID REFERENCES careers(id),
  university_id UUID REFERENCES universities(id),
  min_aps INTEGER NOT NULL, -- Minimum APS score
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example data
INSERT INTO universities (name, province, annual_cost) VALUES
  ('University of Cape Town', 'Western Cape', 60000),
  ('University of Witwatersrand', 'Gauteng', 55000),
  ('University of Pretoria', 'Gauteng', 50000),
  ('Stellenbosch University', 'Western Cape', 58000);

-- Link Medicine to universities
INSERT INTO career_universities (career_id, university_id, min_aps)
SELECT 
  (SELECT id FROM careers WHERE name = 'Medicine'),
  id,
  CASE 
    WHEN name = 'University of Cape Town' THEN 42
    WHEN name = 'University of Witwatersrand' THEN 40
    ELSE 38
  END
FROM universities;
```

### Step 3: Update RAG Query Function

```javascript
// lib/rag/search.js (modify existing)

// OLD: Search all careers
export async function ragSearch(studentProfile) {
  const embedding = await generateEmbedding(studentProfile.interests);
  
  const { data } = await supabase.rpc('match_careers', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5
  });
  
  return data;
}

// NEW: Search only eligible careers
export async function ragSearch(studentProfile, eligibleCareers = null) {
  const embedding = await generateEmbedding(studentProfile.interests);
  
  // If gates provided eligible careers, filter to those IDs
  const careerIds = eligibleCareers?.map(c => c.id);
  
  const { data } = await supabase.rpc('match_careers', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
    career_ids: careerIds // Add this parameter
  });
  
  return data;
}
```

Update the database function:

```sql
-- Update match_careers function to accept career_ids filter
CREATE OR REPLACE FUNCTION match_careers(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  career_ids uuid[] DEFAULT NULL -- New parameter
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.category,
    1 - (c.embedding <=> query_embedding) as similarity
  FROM careers c
  WHERE 
    (career_ids IS NULL OR c.id = ANY(career_ids)) -- Filter by IDs if provided
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Step 4: Load Career Data with Metadata

```javascript
// lib/careers/load-with-metadata.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function loadAllCareers() {
  const { data: careers, error } = await supabase
    .from('careers')
    .select(`
      *,
      universities:career_universities(
        min_aps,
        university:universities(
          name,
          province,
          annual_cost
        )
      )
    `);

  if (error) throw error;

  // Transform to gate-friendly format
  return careers.map(career => ({
    id: career.id,
    name: career.name,
    category: career.category,
    requiresCoreMath: career.requires_core_math,
    requiresPhysicalScience: career.requires_physical_science,
    minMathMark: career.min_math_mark,
    minEnglishMark: career.min_english_mark,
    requiresNBT: career.requires_nbt,
    nsfasEligible: career.nsfas_eligible,
    tvetAlternative: career.tvet_alternative,
    requiredSubjects: career.required_subjects,
    universities: career.universities?.map(cu => ({
      name: cu.university.name,
      province: cu.university.province,
      annualCost: cu.university.annual_cost,
      minAPS: cu.min_aps
    })) || []
  }));
}
```

### Step 5: Update API Route

```javascript
// app/api/rag/query/route.js (final version)

import { getRecommendationsWithGates } from '@/lib/gates/integration';
import { loadAllCareers } from '@/lib/careers/load-with-metadata';
import { trackGatePerformance } from '@/lib/monitoring/track-gates';
import { ragSearch } from '@/lib/rag/search';
import { generateReport } from '@/lib/rag/generation'; // Your existing function

export async function POST(request) {
  try {
    const { studentProfile } = await request.json();
    
    console.log('[API] Loading careers...');
    const allCareers = await loadAllCareers();
    
    console.log('[API] Running gates + RAG...');
    const result = await getRecommendationsWithGates(
      studentProfile,
      allCareers,
      ragSearch,
      generateReport
    );
    
    console.log('[API] Tracking performance...');
    await trackGatePerformance({
      id: crypto.randomUUID(),
      student: studentProfile,
      gateResults: result.blockedCareers,
      finalReport: result.draftReport
    });
    
    return Response.json({
      success: true,
      report: result.draftReport,
      stats: {
        totalCareers: allCareers.length,
        eligibleCareers: result.gateStats.eligible,
        blockedCareers: result.gateStats.blocked,
        finalRecommendations: result.recommendations.length
      },
      warnings: result.warnings,
      blockedCareers: result.blockedCareers.map(b => ({
        name: b.career.name,
        reasons: b.gateResult.criticalBlocks.map(cb => cb.reason)
      }))
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## Testing the Integration

### Test 1: Math Lit Student

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "studentProfile": {
      "grade": 11,
      "mathType": "Math Literacy",
      "subjects": ["Math Literacy", "Life Sciences", "English"],
      "interests": "I want to build things and solve problems"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalCareers": 24,
    "eligibleCareers": 16,
    "blockedCareers": 8,
    "finalRecommendations": 5
  },
  "blockedCareers": [
    {
      "name": "Mechanical Engineering",
      "reasons": ["This career requires Pure Mathematics (you have Math Literacy)"]
    }
  ]
}
```

### Test 2: Low APS Student

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "studentProfile": {
      "grade": 12,
      "mathType": "Pure Mathematics",
      "marks": {
        "Mathematics": 55,
        "Physical Sciences": 60,
        "English": 65,
        "Life Sciences": 58,
        "Life Orientation": 70,
        "Afrikaans": 52
      },
      "interests": "I want to be a doctor"
    }
  }'
```

**Expected:** Medicine blocked (APS 30, needs 40+), Nursing suggested

## Rollout Strategy

### Phase 1: Staging (Week 1)
- Deploy gates to staging environment
- Test with synthetic data
- Validate all 20 scenarios

### Phase 2: Canary (Week 2)
- Enable gates for 10% of users
- Monitor accuracy and performance
- Collect feedback

### Phase 3: Full Rollout (Week 3)
- Enable for 100% of users
- Monitor gate metrics daily
- Adjust thresholds based on data

## Monitoring Dashboard

Query to check gate performance:

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_assessments,
  AVG(careers_blocked) as avg_blocked,
  SUM(math_gate_blocked) as math_blocks,
  SUM(science_gate_blocked) as science_blocks,
  SUM(aps_gate_blocked) as aps_blocks
FROM gate_metrics
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Next Steps

1. Run database migrations (add career metadata)
2. Update RAG search function to accept career IDs
3. Deploy to staging
4. Run test suite: `node scripts/test-gates-scenarios.js`
5. Monitor for 24 hours
6. Deploy to production

---

**Ready to integrate?** Start with Step 1 (database migrations) and work through sequentially.
