# Gated RAG System: Visual Roadmap

## The Journey: Current → Target State

### Current System (87% Accuracy)
```
┌─────────────────┐
│ Student Profile │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RAG Search     │ ← Searches ALL 24 careers
│  (All Careers)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GPT-4 Report    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Student Gets    │
│ Recommendations │ ← 13% are unqualified
└─────────────────┘
```

**Problem**: Student with Math Literacy gets Engineering recommendation → Fails to qualify → Drops out

---

### Target System (95% Accuracy)
```
┌─────────────────┐
│ Student Profile │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         PRE-FILTER GATES                │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │Math Gate │  │Science   │  │APS Gate││
│  │          │  │Gate      │  │        ││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │             │             │     │
│       ▼             ▼             ▼     │
│  ✓ Eligible    ✓ Eligible    ✓ Eligible│
│  ✗ Blocked     ✗ Blocked     ✗ Blocked │
└────────┬────────────────────────────────┘
         │
         ▼ (16 of 24 careers eligible)
┌─────────────────┐
│  RAG Search     │ ← Searches ELIGIBLE careers only
│  (Filtered)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GPT-4 Draft     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      POST-CORRECTION (Week 2)           │
│  ┌──────────────────────────────────┐   │
│  │ Claude Reviews Draft:            │   │
│  │ • Missing NSFAS info? Add it     │   │
│  │ • Only 1 career? Add backups     │   │
│  │ • Blocked careers mentioned? Fix │   │
│  └──────────────────────────────────┘   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Final Report    │
│ (95% Accurate)  │ ← 5% failure rate (down from 13%)
└─────────────────┘
```

---

## Timeline: 14-Day Sprint

### Week 1: Pre-Filter Gates (Dec 2-6)

```
Day 1-2: Core Gates
├─ Math Literacy Gate      ✅ DONE
├─ Physical Science Gate   ✅ DONE
└─ APS Calculator Gate     ✅ DONE

Day 3-4: Additional Gates
├─ Budget Warning Gate     ✅ DONE
├─ Deadline Gate           ✅ DONE
└─ Gates 6-10              ✅ DONE

Day 5: Integration
├─ Database Setup          ⏸️ WAITING (you)
├─ RAG Integration         ⏳ READY
└─ Staging Deployment      ⏳ READY
```

### Week 2: Post-Correction (Dec 9-13)

```
Day 6-7: Claude Integration
├─ API Setup               ✅ SKELETON DONE
├─ Prompt Engineering      ⏳ PENDING
└─ Error Handling          ⏳ PENDING

Day 8-9: Testing
├─ End-to-End Tests        ⏳ PENDING
├─ Monitoring Dashboard    ⏳ PENDING
└─ Cost Analysis           ⏳ PENDING

Day 10: Production
├─ Deploy to Vercel        ⏳ PENDING
├─ Monitor 24 hours        ⏳ PENDING
└─ Collect Feedback        ⏳ PENDING
```

---

## The 10 Gates Explained

### Gate 1: Math Literacy Blocker
```
IF student.mathType === "Math Literacy"
   AND career.requiresCoreMath === true
THEN
   ✗ BLOCK career
   ✓ SUGGEST alternatives (IT, Marketing)
   ✓ IF Grade 10: "Switch to Pure Math by January"
```

**Example**: Math Lit student → Engineering BLOCKED → Software Engineering suggested

---

### Gate 2: Physical Science Requirement
```
IF career.requiresPhysicalScience === true
   AND "Physical Sciences" NOT IN student.subjects
THEN
   ✗ BLOCK career
   ✓ SUGGEST alternatives (Biotechnology if has Life Sciences)
   ✓ IF Grade 10: "Add Physical Sciences in 2026"
```

**Example**: No Physical Science → Chemical Engineering BLOCKED → Biotechnology suggested

---

### Gate 3: APS Reality Check
```
projectedAPS = calculateAPS(student.marks)
eligibleUnis = universities WHERE minAPS <= projectedAPS

IF eligibleUnis.length === 0
THEN
   ✗ BLOCK career
   ✓ SUGGEST TVET alternative
   ✓ SUGGEST "Gap year + improve marks"
```

**Example**: APS 31 → Medicine (needs 40) BLOCKED → Nursing (needs 28) suggested

---

### Gate 4: Budget Constraints
```
IF student.budgetLimit === "low"
   AND avgCost > R40,000
   AND bursaries.length === 0
THEN
   ⚠️ WARN (don't block)
   ✓ ADD NSFAS information
   ✓ ADD bursary options
   ✓ ADD TVET alternative
```

**Example**: Low budget → UCT (R60K) WARNED → NSFAS info added to report

---

### Gate 5: Subject Change Deadline
```
IF student.grade >= 11
   AND missingSubjects.length > 0
THEN
   ✗ BLOCK career
   ✓ SUGGEST careers with current subjects
```

**Example**: Grade 11, no Physical Science → Engineering BLOCKED → Software Engineering suggested

---

### Gates 6-10: Additional Safety Checks
- **Gate 6**: NBT requirement (Grade 12 deadline check)
- **Gate 7**: Language requirements (English proficiency)
- **Gate 8**: NSFAS eligibility (auto-add if qualifies)
- **Gate 9**: Category mismatch (e.g., "hates blood" → no healthcare)
- **Gate 10**: Geographic constraints (must stay in province)

---

## Data Flow

### Before Gates (Current)
```
24 careers → RAG → 5 recommendations → 13% unqualified
```

### After Gates (Target)
```
24 careers → Gates → 16 eligible → RAG → 5 recommendations → 5% unqualified
```

**Key Insight**: Gates reduce search space from 24 to ~16 careers, improving RAG precision

---

## Cost Breakdown

### Per Student
```
┌──────────────────────┬────────┬────────┬─────────┐
│ Component            │ Before │ After  │ Change  │
├──────────────────────┼────────┼────────┼─────────┤
│ Assessment Embedding │ R0.20  │ R0.20  │ -       │
│ RAG Retrieval        │ R0.50  │ R0.50  │ -       │
│ GPT-4 Report         │ R1.30  │ R1.30  │ -       │
│ Gates (logic only)   │ R0.00  │ R0.00  │ -       │
│ Claude Correction    │ R0.00  │ R0.50  │ +R0.50  │
├──────────────────────┼────────┼────────┼─────────┤
│ TOTAL                │ R2.00  │ R2.50  │ +R0.50  │
└──────────────────────┴────────┴────────┴─────────┘
```

### At Scale
```
1,000 students/year   = R2,500   (+R500)
10,000 students/year  = R25,000  (+R5,000)
```

**Compare to**: Hiring 1 career counselor = R150K/year (handles 500 students max)

**ROI**: 6:1 (R150K saved for R25K spent)

---

## Success Metrics Dashboard

### Week 1 Target
```
┌─────────────────────────────────────┐
│ GATE PERFORMANCE                    │
├─────────────────────────────────────┤
│ Total Assessments:        45        │
│ Avg Careers Blocked:      8.2 / 24  │
│ Block Rate:               34%       │
│ Most Common Block:        Math Lit  │
│                           → Eng (12)│
└─────────────────────────────────────┘
```

### Week 2 Target
```
┌─────────────────────────────────────┐
│ POST-CORRECTION STATS               │
├─────────────────────────────────────┤
│ Issues Found:             23 (51%)  │
│ Most Common:              Missing   │
│                           NSFAS (8) │
│ Corrections Applied:      23 (100%) │
└─────────────────────────────────────┘
```

### Final Target
```
┌─────────────────────────────────────┐
│ ACCURACY ESTIMATE                   │
├─────────────────────────────────────┤
│ Pre-gates:                87%       │
│ Post-gates:               92% (+5%) │
│ Post-correction:          95% (+8%) │
└─────────────────────────────────────┘
```

---

## Risk Mitigation

### Risk 1: Gates Too Strict
```
Symptom:  Block rate > 50%
Impact:   Too few recommendations
Fix:      Convert hard blocks → warnings
Monitor:  Track block rate daily
```

### Risk 2: Claude Costs Exceed Budget
```
Symptom:  Cost > R3/student
Impact:   Budget overrun
Fix:      Cache corrections for similar profiles
Fallback: Return draft without correction
```

### Risk 3: Integration Breaks RAG
```
Symptom:  Recommendations drop to 0
Impact:   System unusable
Fix:      Feature flag to disable gates
Rollback: Keep old endpoint as backup
```

---

## Your Current Position

```
YOU ARE HERE
     ↓
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ✅ Infrastructure Built (10 gates, monitoring, tests) │
│                                                         │
│  ⏸️  Database Setup (waiting for you - 5 min)         │
│                                                         │
│  ⏳ Integration Ready (follow guide - 4 hours)         │
│                                                         │
│  ⏳ Week 2 Skeleton (Claude API - 8 hours)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

### Step 1: Database (5 min)
```bash
# Open Supabase SQL Editor
# Run SQL from STEP-1-DATABASE-SETUP.md
# Verify: node scripts/add-gate-fields-simple.js
```

### Step 2: Test Gates (10 min)
```bash
node scripts/test-gates-scenarios.js
# Expected: 5/5 PASSED
```

### Step 3: Integration (4 hours)
```bash
# Follow INTEGRATION-GUIDE.md step-by-step
# Modify app/api/rag/query/route.js
# Deploy to staging
```

### Step 4: Week 2 (8 hours)
```bash
# Add Claude API key
# Test post-correction
# Deploy to production
```

---

**Ready?** Start with `.kiro/specs/gated-rag-system/START-HERE.md`
