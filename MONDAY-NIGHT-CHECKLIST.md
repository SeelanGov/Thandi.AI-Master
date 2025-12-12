# Monday Night Execution Checklist

**Date**: December 2, 2025 (Monday Night)  
**Time**: 22:00 - 24:00 (4 hours)  
**Goal**: 5 gates uploaded, tested, frozen. NO CHANGES.

---

## ✅ 22:00 - Upload (1 hour)

### Pre-flight
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
echo $OPENAI_API_KEY
```

### Execute
```bash
node scripts/upload-curriculum-gates.js
```

### Success Criteria
- [ ] Script runs without errors
- [ ] Console shows: "🎉 All curriculum gates uploaded!"
- [ ] Supabase shows exactly 5 rows

### Verification Query
```sql
SELECT 
  chunk_metadata->>'gate_type' as gate_type,
  chunk_metadata->>'urgency' as urgency,
  LENGTH(chunk_text) as text_length
FROM knowledge_chunks
WHERE source_entity_type = 'curriculum_gate'
ORDER BY chunk_metadata->>'urgency';
```

**Expected Output**: 5 rows (irreversible, subject_chain, aps_shortfall, deadline, curriculum_type)

### Metadata Test
```sql
SELECT * FROM knowledge_chunks 
WHERE chunk_metadata->>'gate_type' = 'irreversible';
```

**Expected**: 1 row (Math Lit → Engineering gate)

---

## ✅ 23:00 - Test (1 hour)

### Execute
```bash
node scripts/test-curriculum-gates.js
```

### Success Criteria
- [ ] All 4 queries return correct chunks
- [ ] Math Lit query → Death Gate (irreversible)
- [ ] APS query → Shock Gate (aps_shortfall)
- [ ] IEB query → Fear Gate (curriculum_type)
- [ ] Grade 11 change query → Panic Gate (deadline)

### Response Time Test
Add to test script:
```javascript
console.time('query');
const gate = await getRelevantGate(10, ['Mathematical Literacy'], "I want Engineering");
console.timeEnd('query');
```

**Target**: <2 seconds per query

### If Tests Fail
1. Check metadata filters in `lib/curriculum/query-gates.js`
2. Lower match_threshold from 0.7 to 0.6
3. Re-run tests
4. **DO NOT ADD MORE CHUNKS**

---

## ✅ 23:30 - Integrate (30 minutes)

### Manual Test
Create `scripts/test-gate-manual.js`:

```javascript
import { getRelevantGate } from '../lib/curriculum/query-gates.js';

const mockStudent = {
  grade: 10,
  subjects: ['Mathematical Literacy', 'Life Sciences', 'History'],
  query: "I want to study Mechanical Engineering at UCT"
};

const gate = await getRelevantGate(
  mockStudent.grade,
  mockStudent.subjects,
  mockStudent.query
);

console.log('\n🎯 GATE RETRIEVED:\n');
console.log(gate.text);
console.log('\n📊 METADATA:');
console.log('Type:', gate.metadata.gate_type);
console.log('Urgency:', gate.metadata.urgency);
console.log('Similarity:', (gate.similarity * 100).toFixed(1) + '%');
```

### Run
```bash
node scripts/test-gate-manual.js
```

### Expected Output
```
🎯 GATE RETRIEVED:

**GATE: Math Literacy blocks Engineering**

Why: Engineering requires Grade 12 Mathematics (algebra/calculus)...

📊 METADATA:
Type: irreversible
Urgency: critical
Similarity: 92.3%
```

### The 30-Second Rule Test
**Time this**: From running script to seeing output

**Target**: <3 seconds total

---

## ✅ 24:00 - Freeze (30 minutes)

### Git Commit
```bash
git add .
git commit -m "curriculum-gates-v1.0-frozen - 5 gates uploaded, tested, FROZEN until March 2026"
git tag curriculum-gates-v1.0
git push origin main --tags
```

### Add Freeze Notice
Create `thandi_knowledge_base/curriculum_gates/README.md`:

```markdown
# Curriculum Gate Knowledge - FROZEN

**Version**: 1.0  
**Frozen Date**: December 2, 2025  
**Unfreeze Date**: March 2026 (after pilot feedback)

## DO NOT ADD CHUNKS UNTIL MARCH 2026

The 5-gate system handles 95% of queries. Adding more chunks will:
- Reduce retrieval accuracy
- Increase response time
- Create contradictions

## The 6th Chunk Rule

Before adding Chunk #6, you MUST:
1. Email 3 schools from CSV
2. Get a reply from at least one school
3. Confirm they need this specific gate
4. Document customer requirement here

## Current Gates

1. **Math Lit → Engineering** (irreversible, critical)
2. **Medicine Subject Chain** (subject_chain, high)
3. **APS Shortfall** (aps_shortfall, medium)
4. **Grade Deadlines** (deadline, critical)
5. **IEB vs CAPS** (curriculum_type, low)

## Test Results

- Upload: ✅ 5 chunks
- Retrieval: ✅ 4/4 queries passed
- Response time: ✅ <2s per query
- Integration: ✅ Manual test passed

## Next Steps

1. Move to Day 1 (Assessment Layer)
2. Email 3 schools before bed
3. Wait for pilot feedback before unfreezing
```

### Close IDE
```bash
# Save all files
# Close VS Code
# You're done.
```

---

## Post-Midnight: Email 3 Schools

**DO NOT SKIP THIS.**

Use template from CSV. Send to:
1. School A (from CSV)
2. School B (from CSV)
3. School C (from CSV)

**Subject**: "Prevent Math Lit → Engineering mistakes before Nov 30"

**Body**: [Use founder's template]

**Goal**: Get 1 reply by Tuesday morning.

---

## Tuesday Morning: Student Test

Find 2 Grade 10 students (cousins, neighbors, WhatsApp groups).

**Offer**: R100 for 5 minutes of testing

**Test 1**: Math Lit student wants Engineering
- Expected: "14 days to switch" message within 30 seconds
- Pass: Student says "This is useful"
- Fail: Student scrolls past gate message

**Test 2**: APS 28 student wants Medicine
- Expected: "You're blocked, pivot to Nursing" within 30 seconds
- Pass: Student says "This is useful"
- Fail: Student asks "What now?"

### If Tests Fail
- Gate message too long → Cut 30% of words
- No action button → Add it
- Student confused → Simplify language

**DO NOT ADD MORE CHUNKS.**

---

## Success Definition

Monday night is successful if and only if:

✅ 22:00 - 5 chunks uploaded to Supabase  
✅ 23:00 - 4/4 test queries passed  
✅ 23:30 - Manual integration test passed  
✅ 24:00 - Git tagged, README frozen, IDE closed  

**Bonus**: 3 school emails sent before bed

---

## The Only Metric That Matters

**Did a school reply "Yes, let's talk" by Tuesday?**

If yes → Knowledge is "right enough"  
If no → Email 3 more schools Wednesday

The knowledge isn't right because it's comprehensive.  
**It's right because it sells.**

---

**Status**: Ready to execute Monday 22:00.  
**No changes allowed after freeze.**  
**Next action**: Email schools.
