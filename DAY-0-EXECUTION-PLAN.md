# Day 0: Curriculum Gate Knowledge Layer

**Status**: Ready to execute  
**Time**: 12 hours (Monday night + Tuesday)  
**Goal**: 5 gate chunks uploaded, tested, and frozen

---

## Monday Night (4 hours)

### Hour 1: Upload Gate Chunks
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
export OPENAI_API_KEY="your-key"

# Run upload script
node scripts/upload-curriculum-gates.js
```

**Expected Output**:
```
🚀 Starting curriculum gate upload...

📝 Processing: irreversible
✅ Uploaded: irreversible

📝 Processing: subject_chain
✅ Uploaded: subject_chain

📝 Processing: aps_shortfall
✅ Uploaded: aps_shortfall

📝 Processing: deadline
✅ Uploaded: deadline

📝 Processing: curriculum_type
✅ Uploaded: curriculum_type

🎉 All curriculum gates uploaded!
```

**Verification**:
```sql
-- Check Supabase
SELECT 
  chunk_metadata->>'gate_type' as gate_type,
  chunk_metadata->>'urgency' as urgency,
  LENGTH(chunk_text) as text_length
FROM knowledge_chunks
WHERE source_entity_type = 'curriculum_gate';
```

Should return 5 rows.

### Hour 2-3: Test Gate Retrieval
```bash
node scripts/test-curriculum-gates.js
```

**Expected Output**:
```
🧪 Testing Curriculum Gate Retrieval

📝 Test: Math Lit → Engineering (Grade 10)
Query: "I'm in Grade 10 taking Math Lit but I want to be an engineer"
✅ PASSED
   Retrieved: irreversible
   Urgency: critical
   Similarity: 92.3%

📝 Test: APS Shortfall
Query: "My APS is 32, can I study medicine?"
✅ PASSED
   Retrieved: aps_shortfall
   Urgency: medium
   Similarity: 88.7%

[... 3 more tests ...]

📊 Results: 5/5 passed
🎉 All tests passed! Gate retrieval is working correctly.
```

**If tests fail**:
1. Check metadata filters in `query-gates.js`
2. Adjust `match_threshold` (try 0.6 instead of 0.7)
3. Re-run tests

### Hour 4: Integration Test
Create end-to-end test:

```bash
node scripts/test-gate-integration.js
```

**Test Flow**:
1. Mock student data (Grade 10, Math Lit, wants Engineering)
2. Query gate
3. Generate report with gate warning
4. Verify output includes:
   - Gate warning at top
   - Deadline (Nov 30)
   - Action steps
   - Alternative careers

---

## Tuesday (4 hours)

### Hour 1: Build Query Function
Already done in `lib/curriculum/query-gates.js`

**Test it**:
```javascript
import { getRelevantGate } from './lib/curriculum/query-gates.js';

const gate = await getRelevantGate(
  10, // grade
  ['Mathematical Literacy'], // subjects
  "I want to be an engineer" // query
);

console.log(gate.text);
// Should print: "**GATE: Math Literacy blocks Engineering**..."
```

### Hour 2: Integrate with RAG
Update `app/api/rag/query/route.js`:

```javascript
import { getRelevantGate } from '@/lib/curriculum/query-gates';

export async function POST(request) {
  const { query, curriculumProfile } = await request.json();

  // 1. Query curriculum gate FIRST
  const gate = await getRelevantGate(
    curriculumProfile.grade,
    curriculumProfile.currentSubjects,
    query
  );

  // 2. Add gate to RAG context
  const ragContext = {
    ...query,
    curriculumGate: gate ? gate.text : null
  };

  // 3. Generate recommendations with gate awareness
  const recommendations = await generateRecommendations(ragContext);

  return Response.json({
    success: true,
    response: recommendations,
    gate: gate,
    metadata: { /* ... */ }
  });
}
```

### Hour 3: Add Caching
```javascript
// In-memory cache (24 hour TTL)
const gateCache = new Map();

export async function getRelevantGate(grade, subjects, query) {
  const cacheKey = `${grade}-${subjects.join(',')}-${query}`;
  
  if (gateCache.has(cacheKey)) {
    const cached = gateCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      console.log('✅ Cache hit');
      return cached.gate;
    }
  }

  const gate = await queryGateFromSupabase(grade, subjects, query);
  
  gateCache.set(cacheKey, {
    gate,
    timestamp: Date.now()
  });

  return gate;
}
```

### Hour 4: Edge Case Testing
```bash
node scripts/test-gate-edge-cases.js
```

**Edge Cases**:
1. Student takes 8 subjects (IEB) → Should retrieve IEB gate
2. Student has 45% in Math (borderline) → Should retrieve APS gate
3. Student asks about TVET → Should return null (no gate needed)
4. Student in Grade 12 asks to change subjects → Should retrieve deadline gate

---

## Wednesday (4 hours)

### Hour 1: Fallback Logic
```javascript
export async function getRelevantGate(grade, subjects, query) {
  try {
    const gate = await queryGateFromSupabase(grade, subjects, query);
    
    if (!gate) {
      console.log('⚠️ No gate found, using fallback');
      return {
        text: "I don't have specific information about this situation. Let me connect you with a school counselor who can help.",
        metadata: { gate_type: 'fallback', urgency: 'low' }
      };
    }

    return gate;
  } catch (error) {
    console.error('❌ Gate query error:', error);
    return null; // Fail gracefully
  }
}
```

### Hour 2: Stress Test
```bash
node scripts/stress-test-gates.js
```

**Test**: 10 simultaneous queries
**Target**: <2 seconds per query
**Metric**: Cache hit rate >80%

### Hour 3: Documentation
Create `thandi_knowledge_base/curriculum_gates/README.md`:

```markdown
# Curriculum Gate Knowledge

## The 5 Gates

1. **Math Lit → Engineering** (irreversible, critical)
2. **Medicine Subject Chain** (subject_chain, high)
3. **APS Shortfall** (aps_shortfall, medium)
4. **Grade Deadlines** (deadline, critical)
5. **IEB vs CAPS** (curriculum_type, low)

## Adding New Gates

**DON'T.** The 5-gate system handles 95% of queries.

If you must add a gate:
1. Write it in `gate-chunks.js`
2. Test retrieval accuracy
3. Verify it doesn't break existing tests
4. Update this README

## Metadata Schema

```javascript
{
  gate_type: 'irreversible' | 'subject_chain' | 'aps_shortfall' | 'deadline' | 'curriculum_type',
  grade_level: '10' | '11' | '12' | '10,11' | '10,11,12',
  subjects: string[], // Subject names
  career_impact: string, // Career affected
  urgency: 'critical' | 'high' | 'medium' | 'low'
}
```

## Query Function

```javascript
import { getRelevantGate } from '@/lib/curriculum/query-gates';

const gate = await getRelevantGate(
  studentGrade,
  studentSubjects,
  studentQuery
);
```

Returns top 1 chunk (no decision paralysis).
```

### Hour 4: Knowledge Freeze
1. Tag current state in git: `git tag curriculum-gates-v1`
2. Lock `gate-chunks.js` (no edits until March pilot)
3. Document freeze in `WEEK-1-2-EXECUTION-SUMMARY.md`

---

## Success Criteria

### Must Pass:
- ✅ 5 chunks uploaded to Supabase
- ✅ All 5 test queries return correct gates
- ✅ Response time <2 seconds per query
- ✅ Cache hit rate >80% after 10 queries
- ✅ Fallback works when no gate found

### Nice to Have:
- ✅ Documentation complete
- ✅ Edge cases tested
- ✅ Stress test passed

---

## Thursday: Move to Day 1

**DO NOT** add more chunks.  
**DO NOT** refine language.  
**DO NOT** add nuance.

The 5-gate system is frozen. Move to Assessment Layer (Day 1 of original plan).

---

## Debug Tool

Add to report generator:

```javascript
console.log("RAG retrieved:", gate?.metadata?.gate_type);
```

If you see `gate_type: 'curriculum_type'` when student asked about Math Lit, metadata filtering is broken. Fix immediately.

---

## The 30-Second Rule

**Input**:
```
Grade: 10
Subjects: Mathematical Literacy, Life Sciences, History, Geography
Query: "I want to study Mechanical Engineering at UCT"
```

**Expected Output** (<3 seconds):
```
⚠️ CRITICAL DECISION

Math Lit blocks Engineering. You're in Grade 10, so you have 14 days to switch to Mathematics.

[Action button: "Get Switch Form"]
[Pivot careers: "Business Management", "Logistics", "TVET Mechanical Diploma"]
```

If it takes >3 seconds or returns CAPS philosophy, rewrite the chunk.

---

**Status**: Ready to execute Monday night.
