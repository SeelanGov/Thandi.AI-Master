# Orchids Integration - Quick Start Guide

**Status:** Ready for Testing  
**Date:** November 20, 2025

---

## ✅ What's Built

### API Endpoints Created:

1. **POST /api/assess**
   - Accepts assessment answers from Orchids
   - Returns career recommendations
   - **Location:** `app/api/assess/route.js`

2. **GET /api/pdf/:sessionId**
   - Generates PDF of assessment results
   - Placeholder implementation (returns text for now)
   - **Location:** `app/api/pdf/[sessionId]/route.js`

### Features:

- ✅ CORS enabled (works from Orchids web frontend)
- ✅ Error handling
- ✅ Health check endpoints
- ✅ Automated test script

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Test Locally (Optional)
```bash
npm run test:orchids
```

Should show:
- ✅ Health check successful
- ✅ Assessment submitted successfully
- ✅ PDF endpoint responds
- ✅ CORS configured correctly

### Step 3: Expose to Public (for Orchids)

**Option A: Using ngrok (Quick Testing)**
```bash
# Install ngrok if needed
npm install -g ngrok

# In a new terminal, run:
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

**Option B: Deploy to Vercel (Production)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Get permanent URL like: `https://thandi-career.vercel.app`

---

## 📡 Give Orchids This Info

### For Local Testing (ngrok):
```
Backend URL: https://YOUR-NGROK-URL.ngrok.io
Endpoints:
  - POST /api/assess
  - GET /api/pdf/:sessionId
Authentication: None required
CORS: Enabled
```

### For Production:
```
Backend URL: https://thandi-career.vercel.app
Endpoints: Same as above
```

---

## 🧪 Test Endpoints

### Test /api/assess (using curl):
```bash
curl -X POST http://localhost:3000/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers": ["Math and Science", "Technology", "Limited budget", "Growing field"]}'
```

### Test /api/pdf/:sessionId:
```bash
curl http://localhost:3000/api/pdf/1234567890
```

### Test from JavaScript (Orchids frontend):
```javascript
// Submit assessment
const response = await fetch('https://YOUR-URL.ngrok.io/api/assess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [
      "I'm good at Math and Science",
      "I enjoy problem-solving",
      "Limited budget",
      "Want good job prospects"
    ]
  })
});

const data = await response.json();
console.log('Careers:', data.careers);
console.log('Session ID:', data.sessionId);

// Download PDF
window.open(`https://YOUR-URL.ngrok.io/api/pdf/${data.sessionId}`);
```

---

## 📋 Expected Request/Response Format

### Request (POST /api/assess):
```json
{
  "answers": [
    "I'm good at Math and Science",
    "I enjoy problem-solving and technology",
    "I have limited budget but willing to study part-time",
    "I want to work in a growing field with good job prospects"
  ]
}
```

### Response:
```json
{
  "careers": [
    {
      "name": "Software Engineer",
      "match": 90,
      "description": "Software engineering combines problem-solving with technology..."
    },
    {
      "name": "Data Scientist",
      "match": 85,
      "description": "Data science uses math and analytical skills..."
    }
  ],
  "sessionId": "1234567890"
}
```

---

## 🐛 Troubleshooting

### Orchids Can't Connect:
- ✅ Check `npm run dev` is running
- ✅ Check ngrok is running (if using ngrok)
- ✅ Verify the ngrok URL is correct
- ✅ Check browser console for CORS errors

### Getting 404 Errors:
- ✅ Verify endpoint paths: `/api/assess` and `/api/pdf/:sessionId`
- ✅ Check request method (POST for assess, GET for pdf)

### Getting 500 Errors:
- ✅ Check terminal for error logs
- ✅ Verify environment variables (OPENAI_API_KEY, SUPABASE_URL, etc.)
- ✅ Check if Supabase database is accessible

### CORS Issues:
- ✅ Verify CORS headers are set (already configured)
- ✅ Check if preflight OPTIONS request is working
- ✅ Test with: `curl -X OPTIONS http://localhost:3000/api/assess -v`

---

## 📁 Files Created

1. **`app/api/assess/route.js`** - Assessment endpoint
2. **`app/api/pdf/[sessionId]/route.js`** - PDF generation endpoint
3. **`scripts/test-orchids-integration.js`** - Automated test script
4. **`docs/ORCHIDS-INTEGRATION.md`** - Full integration guide
5. **`docs/ORCHIDS_INTEGRATION_SUMMARY.md`** - This file

---

## 📝 Next Steps

1. **Test locally:** Run `npm run test:orchids`
2. **Expose with ngrok:** `ngrok http 3000`
3. **Give Orchids the ngrok URL**
4. **Orchids can now call your API!**

---

## 📞 Questions?

See full documentation: `docs/ORCHIDS-INTEGRATION.md`




