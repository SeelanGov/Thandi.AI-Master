# 🔧 Fix Missing Vercel Environment Variables

## ❌ Problem Found

Your Vercel deployment is missing these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ✅ Current Status
- ✅ GROQ_API_KEY - Present
- ✅ OPENAI_API_KEY - Present  
- ❌ NEXT_PUBLIC_SUPABASE_URL - **MISSING**
- ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY - **MISSING**
- ✅ SUPABASE_SERVICE_ROLE_KEY - Present

---

## 🚀 Quick Fix (2 minutes)

### Option 1: Via Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Select project: **thandiai**
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New** and add:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://pvvnxupuukuefajypovz.supabase.co`
   - Environment: ✅ Production

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dm54dXB1dWt1ZWZhanlwb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODIxNTYsImV4cCI6MjA3ODA1ODE1Nn0.i5mnj2CWeIk9pvwuQA1GK9Y0Klfdyhep2-98A-UUo10`
   - Environment: ✅ Production

5. Go to **Deployments** tab
6. Click **Redeploy** on the latest deployment

---

### Option 2: Via Vercel CLI

```bash
# Add the missing variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://pvvnxupuukuefajypovz.supabase.co
# Select: Production

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dm54dXB1dWt1ZWZhanlwb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODIxNTYsImV4cCI6MjA3ODA1ODE1Nn0.i5mnj2CWeIk9pvwuQA1GK9Y0Klfdyhep2-98A-UUo10
# Select: Production

# Redeploy
vercel --prod
```

---

## 🧪 Test After Fix

Once you've added the variables and redeployed:

```bash
# Test environment check
curl https://thandiai.vercel.app/api/health
```

Should show:
```json
{
  "allKeysPresent": true
}
```

Then test the actual API:
```bash
curl https://thandiai.vercel.app/api/assess
```

Should return:
```json
{
  "status": "ok"
}
```

---

## ⏱️ Time Needed

- Add variables: 1 minute
- Redeploy: 30 seconds
- Test: 30 seconds
- **Total: 2 minutes**

---

## 📝 Why This Happened

Variables starting with `NEXT_PUBLIC_` need to be explicitly set in Vercel because they're embedded into the client-side JavaScript bundle at build time. The other variables (without `NEXT_PUBLIC_`) are server-side only and were added correctly.

