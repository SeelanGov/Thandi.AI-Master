# G10-12 Guidance Engine - Deployment Guide

## Phase 2: Deploy Tables + Edge Function (Today)

### Step 1: Deploy Supabase Tables (5 minutes)

1. Go to Supabase Dashboard: https://pvvnxupuukuefajypovz.supabase.co
2. Navigate to SQL Editor
3. Copy the entire contents of `schema.sql`
4. Paste and run
5. Verify tables created:
   - `g10_correction_gates` (1 row)
   - `institution_gates` (2 rows)
   - `g12_logistics` (1 row)

### Step 2: Deploy Edge Function (10 minutes)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref pvvnxupuukuefajypovz

# Create function directory
mkdir -p supabase/functions/requirements-engine

# Copy the edge function
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts

# Deploy
supabase functions deploy requirements-engine --no-verify-jwt
```

### Step 3: Test Edge Function (2 minutes)

```bash
# Test G10 query
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "10",
    "subjects": [{"name": "Maths Literacy"}],
    "career_interests": ["Engineering"]
  }'

# Expected: Warning about Maths Literacy blocking engineering

# Test G11 query
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "11",
    "subjects": [{"name": "Core Mathematics", "score": 55}],
    "career_interests": ["Computer Science"],
    "institution": "University of the Witwatersrand",
    "qualification_id": "SAQA_94721"
  }'

# Expected: Requirements + assessment showing 10% gap

# Test G12 query
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "12",
    "subjects": [],
    "career_interests": ["Architecture"],
    "institution": "University of Pretoria",
    "qualification_id": "SAQA_87315"
  }'

# Expected: Portfolio deadline, NBT requirement, interview info
```

## Phase 3: Integrate into Vercel (Tomorrow)

### Update RAG Query Route

File: `app/api/rag/query/route.js`

Add this after line 50 (after profile extraction):

```javascript
// Call requirements engine for grade-specific guidance
let requirementsData = null;
if (studentProfile.grade) {
  try {
    const reqResponse = await fetch(
      'https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_grade: studentProfile.grade,
          subjects: studentProfile.subjects || [],
          career_interests: studentProfile.interests || [],
          institution: studentProfile.institution,
          qualification_id: studentProfile.qualificationId
        })
      }
    );
    
    if (reqResponse.ok) {
      requirementsData = await reqResponse.json();
    }
  } catch (error) {
    console.error('Requirements engine error:', error);
    // Graceful degradation - continue without requirements
  }
}
```

Then modify the response (around line 150):

```javascript
return NextResponse.json({
  success: true,
  answer: finalAnswer,
  requirements: requirementsData, // Add this line
  sources: retrievedChunks.map(chunk => ({
    content: chunk.content.substring(0, 200),
    similarity: chunk.similarity
  })),
  // ... rest of response
});
```

### Test Integration

```bash
# Deploy to Vercel
vercel --prod

# Test the 3 diagnostic queries again
node scripts/test-g10-12-diagnostic.js
```

## Success Criteria

✅ All 3 diagnostic queries return specific, actionable information:
- Q1: Deadline warning + alternative pathway
- Q2: Specific APS/mark requirements + gap analysis
- Q3: Portfolio deadline + NBT + interview info

## Rollback Plan

If anything breaks:

```bash
# Drop tables
DROP TABLE IF EXISTS g10_correction_gates CASCADE;
DROP TABLE IF EXISTS institution_gates CASCADE;
DROP TABLE IF EXISTS g12_logistics CASCADE;

# Delete edge function
supabase functions delete requirements-engine
```

## Next Steps (Week 2+)

- [ ] Add more qualifications (expand from 3 to 20)
- [ ] Add more institutions (expand from 2 to 5)
- [ ] Build admin UI for content management
- [ ] Add automated QA suite
- [ ] Integrate into assessment flow
