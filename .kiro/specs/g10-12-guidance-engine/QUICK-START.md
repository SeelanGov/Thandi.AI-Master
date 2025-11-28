# G10-12 Guidance Engine - Quick Start

## 🎯 Goal
Fix 3 diagnostic queries in 48 hours using Supabase + Vercel.

## 📊 Diagnostic Results
✅ Ran against https://thandiai.vercel.app
- Q1 (G10): No deadline warnings → Need g10_correction_gates
- Q2 (G11): No APS requirements → Need institution_gates  
- Q3 (G12): No logistics → Need g12_logistics

## 🚀 Deploy Now (15 min)

### 1. Supabase Tables (5 min)
```bash
# Go to: https://pvvnxupuukuefajypovz.supabase.co
# SQL Editor → Paste schema.sql → Run
```

### 2. Edge Function (10 min)
```bash
supabase login
supabase link --project-ref pvvnxupuukuefajypovz
mkdir -p supabase/functions/requirements-engine
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts
supabase functions deploy requirements-engine --no-verify-jwt
```

### 3. Test
```bash
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"10","subjects":[{"name":"Maths Literacy"}],"career_interests":["Engineering"]}'
```

## 📁 Files
- `schema.sql` - Deploy to Supabase
- `requirements-engine.ts` - Deploy as edge function
- `DEPLOY.md` - Full deployment guide
- `PHASE-2-READY.md` - Status report

## ✅ Success Criteria
All 3 queries return specific info:
- Q1: "Switch by June 15, 2025"
- Q2: "Wits requires 65%, you have 55%"
- Q3: "Portfolio due Aug 31, NBT required"

## 🔗 Integration (Tomorrow)
Add to `app/api/rag/query/route.js`:
```javascript
const reqResponse = await fetch(
  'https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine',
  { method: 'POST', body: JSON.stringify(learnerProfile) }
);
```

## 📞 Questions?
Check DEPLOY.md for detailed steps.
