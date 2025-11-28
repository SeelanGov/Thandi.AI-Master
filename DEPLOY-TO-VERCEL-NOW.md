# Deploy to Vercel - Quick Guide

## Current Status

✅ **Local**: Working perfectly (7/7 tests passing)  
❓ **Vercel**: Not deployed yet - still has old code

## Quick Deploy Steps

### Option 1: Automatic Deploy (Recommended)

If you have GitHub connected to Vercel:

```bash
# 1. Stage all changes
git add .

# 2. Commit with message
git commit -m "Fix: Enable RAG endpoint with mock implementation"

# 3. Push to GitHub
git push origin main
```

Vercel will automatically deploy in ~2-3 minutes.

### Option 2: Manual Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Deploy
vercel --prod
```

## What Will Be Deployed

**New Files**:
- `app/api/rag/query/route.js` - Working mock endpoint
- `public/test-endpoint.html` - Browser test page
- `next.config.js` - Updated configuration

**Changed Files**:
- `lib/rag/*.mjs` - Renamed from .js to .mjs

## After Deployment

### Test the Live Site

1. **Wait for deployment** (~2-3 minutes)

2. **Test the endpoint**:
   ```
   https://thandiai.vercel.app/test-endpoint.html
   ```

3. **Test the assessment**:
   ```
   https://thandiai.vercel.app/assessment
   ```

### Expected Results

✅ Test page shows "Health Check PASSED"  
✅ Assessment form works without network error  
✅ Results page displays career recommendations  
✅ Verification warnings present  

## Deployment Commands

### Check Current Deployment

```bash
# See what's currently deployed
vercel ls
```

### View Deployment Logs

```bash
# Check for errors
vercel logs
```

### Rollback if Needed

```bash
# Go back to previous version
vercel rollback
```

## Environment Variables

Make sure these are set in Vercel dashboard:

```
GROQ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

Go to: https://vercel.com/your-project/settings/environment-variables

## Troubleshooting

### If Deployment Fails

1. **Check build logs** in Vercel dashboard
2. **Look for errors** in the build output
3. **Verify environment variables** are set

### If Endpoint Still Doesn't Work

1. **Check Vercel Functions logs**:
   ```bash
   vercel logs --follow
   ```

2. **Test the endpoint directly**:
   ```bash
   curl https://thandiai.vercel.app/api/rag/query
   ```

3. **Should return**:
   ```json
   {
     "status": "ok",
     "endpoint": "/api/rag/query",
     "version": "1.0.0-mock"
   }
   ```

## Quick Deploy Script

Want me to create a script to automate this? Just say "yes" and I'll create a one-command deploy script.

---

**Ready to deploy?** Run:
```bash
git add . && git commit -m "Fix: Enable RAG endpoint" && git push
```

Then test at: https://thandiai.vercel.app/test-endpoint.html
