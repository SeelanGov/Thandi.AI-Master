# 🚀 Your Setup Steps - Connect Orchids to Backend

Follow these steps in order. Takes about 5 minutes.

---

## Step 1: Start Your Server

Open terminal and run:
```bash
npm run dev
```

✅ You should see: `✓ Ready on http://localhost:3000`

**Keep this terminal open!**

---

## Step 2: Test Locally (Optional but Recommended)

Open a NEW terminal and run:
```bash
node scripts/test-orchids-connection.js
```

✅ You should see:
```
✅ Health check passed
✅ Assessment passed!
✅ PDF endpoint passed!
✅ All tests passed!
```

If you see errors, check that:
- `npm run dev` is still running
- Your `.env` file has OPENAI_API_KEY and SUPABASE credentials

---

## Step 3: Expose Your Server Publicly

Since Orchids is web-based, it needs a public URL.

### Option A: ngrok (Quick & Easy)

1. Install ngrok:
```bash
npm install -g ngrok
```

2. In a NEW terminal (keep `npm run dev` running), run:
```bash
ngrok http 3000
```

3. You'll see something like:
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:3000
```

4. **Copy that URL!** (e.g., `https://abc123xyz.ngrok.io`)

✅ This is your backend URL!

### Option B: Vercel (Permanent URL)

If you want a permanent URL instead:

```bash
npm install -g vercel
vercel
```

Follow prompts, you'll get: `https://thandi-career.vercel.app`

---

## Step 4: Test Public URL

Test that your public URL works:

```bash
# Replace with your actual ngrok URL
curl https://abc123xyz.ngrok.io/api/assess
```

✅ Should return JSON with `"status": "ok"`

Or run:
```bash
TEST_URL=https://abc123xyz.ngrok.io node scripts/test-orchids-connection.js
```

---

## Step 5: Give Info to Orchids

Copy the file `GIVE-THIS-TO-ORCHIDS.md` and send it to your Orchids agent.

Then tell them:

```
✅ Backend is live!

Backend URL: https://abc123xyz.ngrok.io
(Replace with your actual URL)

Endpoints ready:
- POST /api/assess
- GET /api/pdf/:sessionId

You can start connecting now!
```

---

## Step 6: Keep Servers Running

While Orchids is testing:
- Keep `npm run dev` running
- Keep `ngrok http 3000` running (if using ngrok)

**Important:** If you restart ngrok, the URL changes! You'll need to give Orchids the new URL.

---

## 🎯 Quick Checklist

- [ ] `npm run dev` is running
- [ ] Local test passed (`node scripts/test-orchids-connection.js`)
- [ ] ngrok is running (or deployed to Vercel)
- [ ] Public URL test passed
- [ ] Sent backend URL to Orchids
- [ ] Both terminals still running

---

## 🐛 Troubleshooting

**"Module not found" errors:**
```bash
npm install
```

**"Environment variable not found":**
- Check `.env` file exists
- Verify OPENAI_API_KEY is set
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are set

**ngrok URL not working:**
- Check ngrok is still running
- Try restarting ngrok
- Verify you're using the HTTPS URL (not HTTP)

**Orchids getting CORS errors:**
- Restart your server (`npm run dev`)
- We added CORS headers in `next.config.js`

---

## 📝 What Happens Next

1. Orchids will test the connection
2. They'll integrate the endpoints into their frontend
3. Users will fill out assessment in Orchids UI
4. Orchids sends data to your `/api/assess` endpoint
5. Your RAG system processes it
6. Returns career recommendations
7. Orchids displays results beautifully!

---

## ✅ Success!

When Orchids confirms they can connect and get career recommendations back, you're done! 🎉

The two systems are now talking to each other.
