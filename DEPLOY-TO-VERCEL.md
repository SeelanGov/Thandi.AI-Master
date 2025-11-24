# 🚀 Deploy to Vercel - Step by Step

## Prerequisites
- [ ] Real API tested locally and working ✅
- [ ] Footer verification complete ✅
- [ ] Environment variables ready (.env.local file)

---

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

---

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

---

## Step 3: Deploy (First Time)

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → (Select your account)
- **Link to existing project?** → N
- **What's your project's name?** → thandi-career (or your choice)
- **In which directory is your code located?** → ./ (press Enter)
- **Want to override the settings?** → N

Vercel will deploy and give you a URL like:
```
https://thandi-career-abc123.vercel.app
```

---

## Step 4: Add Environment Variables

You need to add these environment variables to Vercel:

```bash
# Add OPENAI API Key
vercel env add OPENAI_API_KEY
# Paste your key when prompted, select Production

# Add GROQ API Key
vercel env add GROQ_API_KEY
# Paste your key when prompted, select Production

# Add Supabase URL
vercel env add SUPABASE_URL
# Paste your URL when prompted, select Production

# Add Supabase Anon Key
vercel env add SUPABASE_ANON_KEY
# Paste your key when prompted, select Production
```

For each variable:
1. Paste the value
2. Select: **Production** (press Space, then Enter)
3. Optionally also select Preview and Development

---

## Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

This deploys to production with your environment variables.

---

## Step 6: Get Your Production URL

After deployment completes, you'll see:
```
✅ Production: https://thandi-career.vercel.app
```

**This is your permanent backend URL!**

---

## Step 7: Test Your Deployment

### Test 1: Health Check
```bash
curl https://thandi-career.vercel.app/api/assess
```

Should return:
```json
{
  "status": "ok",
  "endpoint": "/api/assess"
}
```

### Test 2: Submit Assessment
```bash
curl -X POST https://thandi-career.vercel.app/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers":["Math and Science","Technology","Limited budget","Growing field"]}'
```

Should return career recommendations.

### Test 3: Check Footer
```bash
curl -X POST https://thandi-career.vercel.app/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query":"I want to be a doctor but hate math","studentProfile":{"subjects":["Life Sciences"],"interests":["Healthcare"],"financialConstraint":"low"}}' \
  | grep "Verify before you decide"
```

Should show the verification footer.

---

## Step 8: Share with Orchids

Send this message to your Orchids developer:

```
✅ Thandi Career Backend is LIVE on Vercel!

Production URL: https://thandi-career.vercel.app

API Endpoints:
1. POST /api/assess
   Submit assessment: {"answers": ["...", "...", "...", "..."]}
   
2. GET /api/pdf/:sessionId
   Download PDF results

Test it:
curl https://thandi-career.vercel.app/api/assess

Documentation: See ORCHIDS-CONNECTION-GUIDE.md

Ready for integration!
```

---

## 🔧 Troubleshooting

### Deployment fails
```bash
# Check for errors
vercel logs

# Try redeploying
vercel --prod
```

### Environment variables not working
```bash
# List current env vars
vercel env ls

# Remove and re-add if needed
vercel env rm OPENAI_API_KEY
vercel env add OPENAI_API_KEY
```

### API returns 500 errors
```bash
# Check logs
vercel logs --follow

# Verify env vars are set
vercel env ls
```

### Need to update code
```bash
# Just run deploy again
vercel --prod
```

---

## 📋 Post-Deployment Checklist

- [ ] Deployment successful
- [ ] Production URL received
- [ ] Health check works
- [ ] Assessment endpoint works
- [ ] Footer verification works
- [ ] Environment variables set
- [ ] URL shared with Orchids
- [ ] Orchids confirmed connection

---

## 🎯 Vercel Dashboard

View your deployment at: https://vercel.com/dashboard

You can:
- View logs
- Manage environment variables
- See deployment history
- Monitor performance
- Set up custom domains

---

## 💡 Tips

1. **Custom Domain**: Add your own domain in Vercel dashboard
2. **Automatic Deploys**: Connect to GitHub for auto-deploy on push
3. **Preview Deployments**: Every git branch gets a preview URL
4. **Logs**: Use `vercel logs` to debug issues
5. **Rollback**: Redeploy previous version from dashboard if needed

---

## ✅ Success!

Your backend is now live and accessible from anywhere!

Orchids can connect to: `https://thandi-career.vercel.app`

