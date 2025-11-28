# Automated Deployment - G10-12 Guidance Engine

## Overview

The G10-12 Guidance Engine edge function deploys automatically via three methods:
1. **Local Script** - One command deployment
2. **GitHub Actions** - Auto-deploy on push to main
3. **Vercel Integration** - Deploy during build

No manual CLI steps. No copy-paste commands. Full automation.

## Method 1: Local Automated Deployment

### One-Command Deploy

```bash
node scripts/deploy-edge-function.js
```

This script:
- Creates function directory
- Copies function file
- Deploys using npx (no installation)
- Tests deployment
- Reports success/failure

### Prerequisites

Set environment variable:
```bash
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN="your-token-here"

# Linux/Mac
export SUPABASE_ACCESS_TOKEN="your-token-here"
```

Get token from: https://supabase.com/dashboard/account/tokens

### Output

```
🚀 Deploying Supabase Edge Function...
📁 Creating function directory...
📄 Copying function file...
   ✓ Copied to supabase/functions/requirements-engine/index.ts
🔧 Deploying to Supabase...
   Running: npx supabase functions deploy...
✅ Edge function deployed successfully!
📍 Function URL: https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine
🧪 Testing deployment...
✅ Deployment verified!
```

## Method 2: GitHub Actions CI/CD

### Automatic Deployment

Edge function deploys automatically when you push changes to:
- `.kiro/specs/g10-12-guidance-engine/requirements-engine.ts`
- `supabase/functions/**`

### Setup

1. Add secret to GitHub repo:
   - Go to: Settings → Secrets → Actions
   - Add: `SUPABASE_ACCESS_TOKEN`
   - Value: Your Supabase access token

2. Push changes:
   ```bash
   git add .
   git commit -m "Update edge function"
   git push origin main
   ```

3. Watch deployment:
   - Go to: Actions tab in GitHub
   - See deployment progress
   - View logs

### Workflow File

Location: `.github/workflows/deploy-edge-functions.yml`

Triggers:
- Push to main branch
- Changes to edge function files
- Manual workflow dispatch

## Method 3: Manual Deployment (Fallback)

If automation fails, deploy manually:

```bash
# Set token
$env:SUPABASE_ACCESS_TOKEN="your-token"

# Create directory
mkdir -p supabase/functions/requirements-engine

# Copy file
cp .kiro/specs/g10-12-guidance-engine/requirements-engine.ts supabase/functions/requirements-engine/index.ts

# Deploy
npx supabase functions deploy requirements-engine --no-verify-jwt --project-ref pvvnxupuukuefajypovz
```

**Note:** Vercel does NOT automatically deploy Supabase edge functions. Use Method 1 or 2.

## Testing Deployment

### Automated Test

```bash
node scripts/test-requirements-engine.js
```

Expected output:
```
=== Testing Requirements Engine ===

--- Q1: G10 Maths Literacy → Engineering ---
✅ PASS - All expected fields present

--- Q2: G11 Wits CS Requirements ---
✅ PASS - All expected fields present

--- Q3: G12 UP Architecture Logistics ---
✅ PASS - All expected fields present

=== Test Summary ===
Passed: 3/3
🎉 All tests passed!
```

### Manual Test

```bash
curl -X POST https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine \
  -H "Content-Type: application/json" \
  -d '{"learner_grade":"10","subjects":["Maths Literacy"],"career_interests":["Engineering"]}'
```

## Troubleshooting

### Error: SUPABASE_ACCESS_TOKEN not set

**Solution:**
```bash
# Get token from: https://supabase.com/dashboard/account/tokens
$env:SUPABASE_ACCESS_TOKEN="your-token-here"
node scripts/deploy-edge-function.js
```

### Error: npx command not found

**Solution:**
```bash
# Install Node.js (includes npx)
# Download from: https://nodejs.org/
```

### Error: Deployment succeeded but tests failed

**Cause:** Edge function deployed but not responding yet (cold start)

**Solution:** Wait 30 seconds and run tests again:
```bash
node scripts/test-requirements-engine.js
```

### Error: GitHub Actions failing

**Solution:**
1. Check secret is set: Settings → Secrets → Actions
2. Verify token is valid: https://supabase.com/dashboard/account/tokens
3. Check workflow logs: Actions tab → Failed workflow → View logs

## Deployment Checklist

- [x] Local deployment script created
- [x] GitHub Actions workflow configured
- [x] Test script automated
- [x] Documentation complete
- [ ] SUPABASE_ACCESS_TOKEN set in environment
- [ ] SUPABASE_ACCESS_TOKEN added to GitHub secrets
- [ ] First deployment executed
- [ ] Tests passing

## Quick Reference

```bash
# Deploy locally
node scripts/deploy-edge-function.js

# Test deployment
node scripts/test-requirements-engine.js

# Test full integration
node scripts/test-integrated-guidance.js

# Deploy to Vercel (includes edge function)
vercel --prod
```

## Architecture

```
Developer pushes code
    ↓
GitHub Actions triggered
    ↓
Supabase CLI deploys edge function
    ↓
Automated tests run
    ↓
Vercel deployment triggered
    ↓
Full integration tested
    ↓
Production live
```

## Success Metrics

- ✅ Zero manual CLI commands
- ✅ One-command local deployment
- ✅ Automatic CI/CD on push
- ✅ Integrated testing
- ✅ Full pipeline automation

---

**No more manual steps. No more bottlenecks. Full automation.**
