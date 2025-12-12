# Phase 3 Integration - Automated Deployment

## Task 1: Deploy Edge Function (Automated - 5 min)

### One-Command Deployment

```bash
# Set access token (one time)
$env:SUPABASE_ACCESS_TOKEN="your-token-here"

# Deploy (automated)
node scripts/deploy-edge-function.js
```

This script:
- Creates function directory
- Copies function file
- Deploys using npx (no installation)
- Tests deployment automatically
- Reports success/failure

### Get Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Create new token
3. Copy token value
4. Set in environment:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN="your-token-here"
   ```

### Alternative: GitHub Actions (Zero-Touch)

Push to main branch - deployment happens automatically:

```bash
git add .
git commit -m "Deploy edge function"
git push origin main
```

See: `.github/workflows/deploy-edge-functions.yml`

---

## Task 2: Vercel Integration ✅

- ✅ Updated `app/api/rag/query/route.js`
- ✅ Added Supabase client import
- ✅ Integrated requirements engine call
- ✅ Added graceful degradation
- ✅ Merged requirements data into response

---

## Task 3: Test Full Pipeline ✅

```bash
node scripts/test-integrated-guidance.js
```

Expected: 3/3 tests pass with specific guidance

---

## Task 4: Thandi Prompt Update ✅

- ✅ Updated `lib/rag/generation.js`
- ✅ Modified `buildPrompt` to inject requirements
- ✅ Thandi uses specific facts instead of generic advice

---

## Deployment Checklist

- [ ] Set SUPABASE_ACCESS_TOKEN environment variable
- [ ] Run: `node scripts/deploy-edge-function.js`
- [ ] Verify: `node scripts/test-requirements-engine.js`
- [ ] Test integration: `node scripts/test-integrated-guidance.js`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Add SUPABASE_ACCESS_TOKEN to GitHub secrets (for CI/CD)

---

## Full Documentation

See: `.kiro/docs/automated-deployment.md`

**No manual CLI steps. Full automation.**
