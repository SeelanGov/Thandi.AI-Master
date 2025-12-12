# 🔐 Vercel Environment Variables Setup

Your deployment: **https://thandiai.vercel.app**

Currently getting 500 errors because environment variables are missing.

---

## ✅ Quick Fix (2 minutes)

### Option 1: Manual via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Select your project:** `thandiai`

3. **Go to:** Settings → Environment Variables

4. **Add these 5 variables:**

   | Variable Name | Value (from .env.local) |
   |---------------|-------------------------|
   | `GROQ_API_KEY` | `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` |
   | `OPENAI_API_KEY` | `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` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://pvvnxupuukuefajypovz.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dm54dXB1dWt1ZWZhanlwb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODIxNTYsImV4cCI6MjA3ODA1ODE1Nn0.i5mnj2CWeIk9pvwuQA1GK9Y0Klfdyhep2-98A-UUo10` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dm54dXB1dWt1ZWZhanlwb3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ4MjE1NiwiZXhwIjoyMDc4MDU4MTU2fQ.2XM3YzobuP_Fbkj_PqfjhUVOsq2t7HYcWRBLFW-b0rs` |

5. **For each variable:**
   - Click "Add New"
   - Enter the name
   - Paste the value
   - Select: **Production** (check the box)
   - Click "Save"

6. **Redeploy:**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - OR run: `vercel --prod` in terminal

---

### Option 2: Via Vercel CLI (Faster if you're comfortable with terminal)

```bash
# Add each variable (you'll be prompted to paste the value)
vercel env add GROQ_API_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Then redeploy
vercel --prod
```

For each command:
1. Paste the value from the table above
2. Press Enter
3. Select: **Production** (press Space, then Enter)

---

## 🧪 Test After Setup

Once you've added the variables and redeployed:

```bash
# Test health check
curl https://thandiai.vercel.app/api/assess
```

Should return:
```json
{
  "status": "ok",
  "endpoint": "/api/assess"
}
```

```bash
# Test full assessment
curl -X POST https://thandiai.vercel.app/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers":["Math and Science","Technology","Limited budget","Growing field"]}'
```

Should return career recommendations.

---

## ✅ Success Checklist

- [ ] All 5 environment variables added to Vercel
- [ ] Redeployed to production
- [ ] Health check returns 200 OK
- [ ] Test assessment returns careers
- [ ] Ready to share with Orchids

---

## 🎨 Share with Orchids

Once working, send this:

```
✅ Thandi Career Backend is LIVE!

Production URL: https://thandiai.vercel.app

API Endpoints:
1. POST /api/assess
   Submit: {"answers": ["...", "...", "...", "..."]}
   
2. GET /api/pdf/:sessionId
   Download PDF results

Test it:
curl https://thandiai.vercel.app/api/assess

Ready for integration!
```

---

## 🐛 Troubleshooting

**Still getting 500 errors after adding variables:**
- Wait 1-2 minutes for deployment to complete
- Check Vercel logs: `vercel logs`
- Verify all 5 variables are added
- Try redeploying again: `vercel --prod`

**Variables not showing up:**
- Make sure you selected "Production" when adding
- Check in Vercel Dashboard → Settings → Environment Variables
- They should show "Production" in the environment column

**Need to update a variable:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Click the three dots next to the variable
- Click "Edit" or "Delete" and re-add

