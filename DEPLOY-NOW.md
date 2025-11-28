# Deploy to Vercel NOW

**Status**: Ready to deploy  
**Time**: 10 minutes

---

## What's Ready

✅ Curriculum gates uploaded to Supabase  
✅ Assessment form updated (5 steps now)  
✅ Results page shows gate warnings  
✅ API integrated with gate detection  

---

## Deploy Commands

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod

# 4. Set environment variables (if not already set)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add GROQ_API_KEY production

# 5. Redeploy to pick up env vars
vercel --prod
```

---

## Test Flow

Once deployed, go to: `https://your-app.vercel.app/assessment`

### Test 1: Math Lit → Engineering (Critical Gate)
1. Select Grade 10
2. Step 1: Select "Mathematical Literacy" as current subject
3. Step 2: Select any subjects you enjoy
4. Step 3: Select interests (mention "Engineering" or "Technology")
5. Step 4: Fill constraints
6. Step 5: Fill open questions
7. Submit

**Expected Result**: Results page shows ⛔ CRITICAL DECISION warning about Math Lit blocking Engineering

### Test 2: Medicine without Physical Sciences (High Gate)
1. Select Grade 10
2. Step 1: Select "Life Sciences" only (NOT Physical Sciences)
3. Complete assessment
4. Mention "Medicine" in interests

**Expected Result**: Results page shows ⚠️ IMPORTANT NOTICE about needing Physical Sciences

### Test 3: No Gate Triggered
1. Select Grade 10
2. Step 1: Select "Mathematics" and "Physical Sciences"
3. Complete assessment
4. Mention "Engineering"

**Expected Result**: No gate warning (student has correct subjects)

---

## Quick Local Test

Before deploying, test locally:

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/assessment

# Test the flow above
```

---

## Troubleshooting

### Gate not showing?
- Check browser console for gate data: `console.log('🚪 Gate data:', parsed.gate)`
- Verify curriculum profile is being sent to API
- Check Supabase has 5 curriculum gates

### API error?
- Verify environment variables are set
- Check `.env.local` has all keys
- Test gate query: `node scripts/test-curriculum-gates.js`

### Deployment fails?
- Run `vercel --debug` for detailed logs
- Check `package.json` has all dependencies
- Verify Next.js version compatibility

---

## After Deployment

1. Test all 3 scenarios above
2. Screenshot the gate warnings
3. Share URL with 2 Grade 10 students for testing
4. Collect feedback

---

**Ready to deploy? Run `vercel --prod` now.**
