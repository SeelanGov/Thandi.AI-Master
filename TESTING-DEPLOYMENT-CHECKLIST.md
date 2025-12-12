# Testing Deployment Checklist

**Goal**: Get Thandi live on Vercel so you can test the gate system

---

## What's Already Done ✅

1. ✅ 5 curriculum gates uploaded to Supabase
2. ✅ Gate retrieval working (100% test accuracy)
3. ✅ Assessment form exists (`app/assessment/page.jsx`)
4. ✅ Results page exists (`app/results/page.jsx`)
5. ✅ Environment variables in `.env.local`

---

## What We Need to Do

### 1. Add Curriculum Profile Question (15 min)

**File**: `app/assessment/components/CurriculumProfile.jsx` (NEW)

This captures:
- Framework (CAPS vs IEB)
- Current subjects (what they're TAKING)
- Current marks (optional for Grade 10, required for Grade 11-12)

### 2. Integrate Gates into Results (15 min)

**File**: `app/results/page.jsx` (UPDATE)

Add gate warning section at top of report:
- ⛔ Blocked gates (Math Lit → Engineering)
- ⚠️ At-risk gates (need mark improvement)
- ✅ Available pathways

### 3. Deploy to Vercel (10 min)

**Commands**:
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add GROQ_API_KEY
```

---

## Quick Test Flow

Once deployed:

1. Go to `https://your-app.vercel.app/assessment`
2. Select Grade 10
3. Select "Mathematical Literacy" as current subject
4. Complete assessment
5. In interests, mention "Engineering"
6. Submit
7. **Expected**: Results page shows ⛔ CRITICAL gate warning about Math Lit blocking Engineering

---

## Minimal Changes Needed

I'll create:
1. `CurriculumProfile.jsx` component
2. Update `AssessmentForm.jsx` to include it
3. Update `app/api/rag/query/route.js` to call gate detection
4. Update `app/results/page.jsx` to show gates

Then you can deploy and test.

Ready to execute?
