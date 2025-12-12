# 🚀 G10-12 Guidance Engine - DEPLOYMENT READY

## ✅ Diagnostic Complete

Ran 3 queries against production Thandi. All confirmed knowledge gaps:

**Q1 (G10):** "Maths Literacy → Civil Engineer"
- Response: Validation failed
- Gap: No deadline warning, no alternatives

**Q2 (G11):** "55% Core Maths → Wits CS"
- Response: Request aborted
- Gap: No APS requirements, no thresholds

**Q3 (G12):** "Architecture at UP"
- Response: "No relevant information found"
- Gap: No portfolio deadline, no NBT info

## 🎯 Solution Ready

Created 3 Supabase tables + 1 edge function to fix all 3 queries.

## 📋 Deploy Now (1 Hour)

### 1. Deploy Tables (15 min)
```
1. Open: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz
2. Go to SQL Editor
3. Copy: .kiro/specs/g10-12-guidance-engine/schema.sql
4. Paste and Run
5. Verify 3 tables created with 4 rows total
```

### 2. Deploy Edge Function (30 min)
```bash
supabase login
supabase link --project-ref pvvnxupuukuefajypovz
mkdir -p supabase/functions/requirements-engine
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts
supabase functions deploy requirements-engine --no-verify-jwt
```

### 3. Test (15 min)
```bash
# Q1 Test
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"10","subjects":["Maths Literacy"],"career_interests":["Engineering"]}'

# Q2 Test
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"11","institution":"Witwatersrand"}'

# Q3 Test
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"12"}'
```

## ✅ Success Criteria

All 3 curl commands return specific data:
- Q1: June 15 deadline + alternative pathway
- Q2: APS 34 + Core Maths 65% requirement
- Q3: Portfolio Aug 31 + interview info

## 📁 Files

All deployment files in `.kiro/specs/g10-12-guidance-engine/`:
- `schema.sql` - Deploy to Supabase
- `requirements-engine.ts` - Deploy as edge function
- `EXECUTE-NOW.md` - Detailed steps
- `STATUS.md` - Full status report

## 🔄 Tomorrow: Vercel Integration

Add to `app/api/rag/query/route.js`:
```javascript
const { data: requirements } = await supabase.functions.invoke('requirements-engine', {
  body: learnerProfile
});
```

## 📊 Lean Approach

- 3 tables (not 10)
- 4 seed records (not 100)
- 1 edge function (not 5)
- 1 hour deploy (not 1 week)
- Manual testing (not automated)

## ⏱️ Timeline

- **Now:** Deploy tables + function (1 hour)
- **Tomorrow:** Integrate into Vercel
- **Week 2+:** Expand to 20 qualifications

---

**Ready to execute.** All files prepared. Awaiting deployment confirmation.
