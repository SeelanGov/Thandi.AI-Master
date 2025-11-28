# Execute Now - G10-12 Guidance Engine

## ✅ Phase 1: Diagnostic Complete
- Ran 3 queries against production
- All 3 confirmed knowledge gaps
- Ready to deploy fix

## 🚀 Phase 2: Deploy (Next 1 Hour)

### Step 1: Deploy Tables (15 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz
2. Go to SQL Editor
3. Copy entire contents of `schema.sql`
4. Paste and click "Run"
5. Verify in Table Editor:
   - `g10_correction_gates` (1 row)
   - `institution_gates` (2 rows)
   - `g12_logistics` (1 row)

### Step 2: Deploy Edge Function (30 minutes)

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref pvvnxupuukuefajypovz

# Create function directory
mkdir -p supabase/functions/requirements-engine

# Copy function
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts

# Deploy
supabase functions deploy requirements-engine --no-verify-jwt
```

### Step 3: Test Edge Function (15 minutes)

```bash
# Test Q1: G10 Maths Literacy → Engineering
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "10",
    "subjects": ["Maths Literacy"],
    "career_interests": ["Engineering"]
  }'

# Expected: Warning about June 15 deadline

# Test Q2: G11 Wits CS
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "11",
    "institution": "Witwatersrand"
  }'

# Expected: APS 34, Core Maths 65% requirement

# Test Q3: G12 UP Architecture
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": "12"
  }'

# Expected: Portfolio deadline Aug 31, interview info
```

## 📊 Success Criteria

All 3 curl commands return specific data:
- ✅ Q1: Deadline + alternative pathway
- ✅ Q2: APS minimum + subject requirements
- ✅ Q3: Portfolio + interview logistics

## 🔄 Phase 3: Vercel Integration (Tomorrow)

Will add to `app/api/rag/query/route.js`:

```javascript
const { data: requirements } = await supabase.functions.invoke('requirements-engine', {
  body: learnerProfile
});
return { ...baseGuidance, requirements };
```

## 📞 Confirmation

Once deployed, send:
- ✅ Tables created (screenshot from Supabase)
- ✅ Edge function deployed (deployment URL)
- ✅ All 3 test queries passing (curl outputs)

## ⏱️ Timeline

- Tables: 15 min
- Edge function: 30 min
- Testing: 15 min
- **Total: 1 hour**
