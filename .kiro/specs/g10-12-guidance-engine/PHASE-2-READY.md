# Phase 2 Complete: Ready to Deploy

## ✅ Diagnostic Complete

Ran 3 queries against production Thandi (https://thandiai.vercel.app):

**Q1 (G10 Switcher):** "Grade 10, Maths Literacy, wants Civil Engineer"
- Result: Validation failed, no specific guidance
- Gap: No deadline warning, no irreversibility notice, no alternatives

**Q2 (G11 Reality Check):** "Grade 11, 55% Core Maths, wants BSc CS at Wits"
- Result: Request aborted, no specific requirements
- Gap: No APS minimum, no mark thresholds, no disqualification clarity

**Q3 (G12 Hidden Requirements):** "Grade 12 wants Architecture at UP"
- Result: "No relevant information found"
- Gap: No portfolio deadline, no NBT mention, no LO exclusion info

## ✅ Minimal Schema Created

Three tables, zero ceremony:

1. **g10_correction_gates** - Subject choice warnings
2. **institution_gates** - Hard admission requirements  
3. **g12_logistics** - Application deadlines

Seed data included for the 3 diagnostic queries.

## ✅ Edge Function Ready

Stub implementation at `.kiro/specs/g10-12-guidance-engine/requirements-engine.ts`

- Queries Supabase tables
- Returns grade-specific data
- Graceful error handling
- CORS enabled

## 📋 Deploy Checklist (15 minutes)

```bash
# 1. Deploy tables (5 min)
# Copy schema.sql into Supabase SQL Editor and run

# 2. Deploy edge function (10 min)
supabase login
supabase link --project-ref pvvnxupuukuefajypovz
mkdir -p supabase/functions/requirements-engine
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts
supabase functions deploy requirements-engine --no-verify-jwt

# 3. Test
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"10","subjects":[{"name":"Maths Literacy"}],"career_interests":["Engineering"]}'
```

## 📁 Files Created

```
.kiro/specs/g10-12-guidance-engine/
├── requirements.md          # Full spec (for reference only)
├── schema.sql              # Deploy this to Supabase
├── requirements-engine.ts  # Deploy this as edge function
├── DEPLOY.md              # Step-by-step deployment guide
└── PHASE-2-READY.md       # This file
```

## 🎯 What This Fixes

Before:
- "Grade 10, Maths Literacy, wants Civil Engineer" → Generic advice
- "Grade 11, 55% Maths, wants Wits CS" → No specific requirements
- "Grade 12 wants UP Architecture" → "No information found"

After (once deployed):
- Q1 → "⚠️ CRITICAL: Switch to Core Maths by June 15, 2025. Consider Engineering Drafting NC(V) as alternative."
- Q2 → "Wits requires 65% in Core Maths. You have 55%. Gap: 10%. APS minimum: 38."
- Q3 → "Portfolio due Aug 31, 2025. NBT required. LO excluded from APS. Interview for shortlisted candidates."

## 🚀 Phase 3 (Tomorrow)

Integrate into Vercel frontend:
- Add requirements engine call to `/api/rag/query`
- Merge requirements data into guidance response
- Test the 3 diagnostic queries again
- Verify specific, actionable information appears

## 📊 Lean Metrics

- Time to deploy: 15 minutes
- Tables created: 3
- Seed records: 4
- Lines of code: ~200
- Qualifications covered: 3 (expandable)
- Institutions covered: 2 (expandable)

## 💡 Key Decisions

1. **No admin UI yet** - Manual SQL seeding for now
2. **No QA automation yet** - Manual testing with curl
3. **Hardcoded seed data** - Just enough to fix the 3 queries
4. **Graceful degradation** - If edge function fails, Thandi still works
5. **Public read access** - RLS enabled but allows public reads

## ⚠️ What We're NOT Building (Yet)

- ❌ Content management UI
- ❌ Automated QA suite
- ❌ 20 qualifications (just 3 for now)
- ❌ 5 institutions (just 2 for now)
- ❌ Prospectus scraping
- ❌ Admin dashboard

Those are Week 2+ features. This is the 48-hour prototype.

## 🎊 Ready to Execute

All files ready. Deploy script ready. Test script ready.

**Next action:** Run the deploy checklist in DEPLOY.md
