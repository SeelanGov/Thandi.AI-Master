# ✅ Phase 2 Ready for Deployment

## Diagnostic Results (Complete)

Tested production Thandi against 3 critical queries:

| Query | Grade | Current Response | Gap Identified |
|-------|-------|------------------|----------------|
| Maths Literacy → Civil Engineer | G10 | Validation failed | No deadline warning |
| 55% Maths → Wits CS | G11 | Request aborted | No APS requirements |
| Architecture at UP | G12 | "No information found" | No logistics |

## Solution Prepared

### Files Created
1. **schema.sql** - 3 tables, 4 seed records (lean approach)
2. **requirements-engine.ts** - Edge function (stubbed, returns seeded data)
3. **test-requirements-engine.js** - Automated test script
4. **EXECUTE-NOW.md** - Deployment checklist

### Architecture
```
Supabase Tables:
├── g10_correction_gates (1 row)
├── institution_gates (2 rows)
└── g12_logistics (1 row)

Edge Function:
└── requirements-engine (queries tables, returns JSON)

Vercel Integration (Tomorrow):
└── app/api/rag/query/route.js (calls edge function)
```

## Deployment Steps

### Step 1: Supabase Tables (15 min)
```
1. Open Supabase Dashboard
2. SQL Editor → Paste schema.sql → Run
3. Verify 3 tables with 4 total rows
```

### Step 2: Edge Function (30 min)
```bash
supabase login
supabase link --project-ref pvvnxupuukuefajypovz
mkdir -p supabase/functions/requirements-engine
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts
supabase functions deploy requirements-engine --no-verify-jwt
```

### Step 3: Test (15 min)
```bash
node scripts/test-requirements-engine.js
```

Expected output: 3/3 tests pass

## Success Criteria

After deployment, all 3 queries return specific data:

✅ **Q1 Response:**
```json
{
  "reversible_until": "Term 3, Week 5 (June 15)",
  "alternative_pathway": "Consider Engineering Drafting NC(V) at TVET",
  "warning_message": {
    "en": "CRITICAL: Switch to Core Maths before June 15..."
  }
}
```

✅ **Q2 Response:**
```json
{
  "qualification_name": "BSc Computer Science",
  "aps_min": 34,
  "subject_rules": [
    {"subject": "Core Mathematics", "min_mark": 65, "required": true}
  ]
}
```

✅ **Q3 Response:**
```json
{
  "portfolio_deadline": "2025-08-31",
  "additional_requirements": [
    {"item": "Portfolio", "deadline": "2025-08-31", "weight": "50%"},
    {"item": "Interview", "scheduled": "October 2025"}
  ]
}
```

## Timeline

- **Now:** Deploy (1 hour)
- **Tomorrow:** Integrate into Vercel
- **Week 2:** Expand to 20 qualifications

## What We're NOT Building (Yet)

- Admin UI
- QA automation
- 20 qualifications
- 5 institutions
- Prospectus scraping

## Confirmation Checklist

After deployment, send:
- [ ] Screenshot of Supabase tables
- [ ] Edge function deployment URL
- [ ] Test script output (3/3 passing)

---

**Status:** Ready to execute
**ETA:** 1 hour
**Next:** Deploy tables + function
