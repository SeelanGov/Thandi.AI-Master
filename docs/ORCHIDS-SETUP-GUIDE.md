# 🎨 Orchids Integration - Step-by-Step Setup Guide

## 📋 What You Need to Tell Orchids

Copy and paste this exact information to your Orchids design agent:

---

## Backend Connection Details

**Backend URL:** `[YOU WILL GET THIS FROM NGROK - SEE STEP 2 BELOW]`

**Authentication:** None required

**CORS:** Already enabled (cross-origin requests allowed)

---

## API Endpoints

### 1. Submit Assessment
**Endpoint:** `POST /api/assess`

**Request Format:**
```json
{
  "answers": [
    "string - answer to question 1",
    "string - answer to question 2", 
    "string - answer to question 3",
    "string - answer to question 4"
  ]
}
```

**Response Format:**
```json
{
  "careers": [
    {
      "name": "Career Name",
      "match": 90,
      "description": "Career description text"
    }
  ],
  "sessionId": "1234567890"
}
```

**Example Request:**
```javascript
const response = await fetch('YOUR_BACKEND_URL/api/assess', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    answers: [
      "I'm good at Math and Science",
      "I enjoy problem-solving and technology",
      "I have limited budget but willing to study part-time",
      "I want to work in a growing field"
    ]
  })
});

const data = await response.json();
console.log(data.careers); // Array of career recommendations
```

---

### 2. Download PDF Results
**Endpoint:** `GET /api/pdf/:sessionId`

**Usage:**
```javascript
// After getting sessionId from /api/assess response
window.open(`YOUR_BACKEND_URL/api/pdf/${sessionId}`);
```

**Response:** Downloads a file with assessment results

---

## 🚀 Setup Steps (For You to Execute)

### Step 1: Start Your Local Server
Open your terminal and run:
```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

Keep this terminal window open!

---

### Step 2: Expose Your Local Server Publicly

Since Orchids is web-based, it needs a public URL to reach your local server.

**Option A: Using ngrok (Recommended)**

1. Install ngrok:
```bash
npm install -g ngrok
```

2. In a NEW terminal window (keep the first one running), run:
```bash
ngrok http 3000
```

3. You'll see output like this:
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:3000
```

4. **Copy that URL** (e.g., `https://abc123xyz.ngrok.io`)

5. **This is your Backend URL** - give this to Orchids!

**Option B: Deploy to Vercel (For Production)**

If you want a permanent URL instead of ngrok:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts, you'll get a permanent URL like:
```
https://thandi-career.vercel.app
```

---

### Step 3: Test the Connection

Before giving the URL to Orchids, test it yourself:

**Test the assess endpoint:**
```bash
curl -X POST https://YOUR-NGROK-URL.ngrok.io/api/assess \
  -H "Content-Type: application/json" \
  -d "{\"answers\": [\"Math and Science\", \"Technology\", \"Limited budget\", \"Growing field\"]}"
```

You should get back JSON with career recommendations!

**Test the health check:**
```bash
curl https://YOUR-NGROK-URL.ngrok.io/api/assess
```

Should return:
```json
{
  "status": "ok",
  "endpoint": "/api/assess",
  ...
}
```

---

### Step 4: Give Orchids the Information

Send this to your Orchids agent:

```
✅ Backend is ready!

Backend URL: https://YOUR-NGROK-URL.ngrok.io
(Replace with your actual ngrok URL)

Endpoints:
1. POST /api/assess - Submit assessment, get career recommendations
2. GET /api/pdf/:sessionId - Download PDF results

Authentication: None
CORS: Enabled

Request format for /api/assess:
{
  "answers": ["string", "string", "string", "string"]
}

Response format:
{
  "careers": [
    {"name": "Career Name", "match": 90, "description": "..."}
  ],
  "sessionId": "123456"
}

The backend is live and ready to receive requests!
```

---

## 🧪 Testing from Orchids

Once Orchids has the URL, they can test with this JavaScript:

```javascript
// Test connection
fetch('https://YOUR-NGROK-URL.ngrok.io/api/assess')
  .then(r => r.json())
  .then(data => console.log('Backend is alive:', data));

// Submit test assessment
fetch('https://YOUR-NGROK-URL.ngrok.io/api/assess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [
      "I love Math and Science",
      "I enjoy technology and problem-solving",
      "I have limited budget",
      "I want good job prospects"
    ]
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('Careers:', data.careers);
    console.log('Session ID:', data.sessionId);
  });
```

---

## 🐛 Troubleshooting

**"Connection refused" or "Network error":**
- Check if `npm run dev` is still running
- Check if ngrok is still running
- Verify you're using the correct ngrok URL (it changes each time you restart ngrok)

**"CORS error":**
- This shouldn't happen (CORS is enabled)
- If it does, check browser console for exact error
- Make sure you're using the full URL including `https://`

**"404 Not Found":**
- Verify endpoint path: `/api/assess` (not `/assess`)
- Check request method: POST for assess, GET for pdf

**"500 Internal Server Error":**
- Check your terminal where `npm run dev` is running
- Look for error messages
- Verify environment variables are set (OPENAI_API_KEY, SUPABASE_URL, etc.)

---

## 📝 Quick Reference

**Your checklist:**
- [ ] Run `npm run dev`
- [ ] Run `ngrok http 3000` (in separate terminal)
- [ ] Copy ngrok URL
- [ ] Test with curl
- [ ] Give URL to Orchids
- [ ] Keep both terminals running while testing

**Orchids needs:**
- Backend URL (your ngrok URL)
- Endpoint paths (`/api/assess`, `/api/pdf/:sessionId`)
- Request/response formats (shown above)

---

## 🎯 Expected Flow

1. User fills out assessment in Orchids frontend
2. Orchids sends POST request to `YOUR_URL/api/assess`
3. Your backend processes with RAG system
4. Returns career recommendations
5. Orchids displays results
6. User can download PDF via `YOUR_URL/api/pdf/:sessionId`

---

## ✅ Success Criteria

You'll know it's working when:
- Orchids can call `/api/assess` without errors
- Response contains career recommendations
- PDF download link works
- No CORS errors in browser console

---

**Need help?** Check your terminal logs where `npm run dev` is running - all requests and errors are logged there!
