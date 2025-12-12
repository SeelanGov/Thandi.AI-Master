# 🎨 Orchids Integration - Quick Reference

## 🚀 Deploy Backend (Choose One)

### Option A: Vercel (Permanent URL)
```bash
npm install -g vercel
vercel --prod
# Add environment variables when prompted
```
**Result:** `https://thandi-career.vercel.app`

### Option B: ngrok (Quick Testing)
```bash
npm install -g ngrok
npm run dev          # Terminal 1
ngrok http 3000      # Terminal 2
```
**Result:** `https://abc123.ngrok.io` (changes on restart)

---

## 📡 API Endpoints

### POST /api/assess
**Purpose:** Submit assessment, get career recommendations

**Request:**
```json
{
  "answers": ["answer1", "answer2", "answer3", "answer4"]
}
```

**Response:**
```json
{
  "careers": [
    {"name": "Career Name", "match": 90, "description": "..."}
  ],
  "sessionId": "1234567890"
}
```

### GET /api/pdf/:sessionId
**Purpose:** Download PDF results

**Usage:** `window.open('https://YOUR-URL/api/pdf/1234567890')`

---

## 💻 Code for Orchids

```javascript
const BACKEND_URL = 'https://thandi-career.vercel.app';

async function submitAssessment(answers) {
  const response = await fetch(`${BACKEND_URL}/api/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  return await response.json();
}

function downloadPDF(sessionId) {
  window.open(`${BACKEND_URL}/api/pdf/${sessionId}`);
}
```

---

## 🧪 Test Connection

```bash
# Health check
curl https://YOUR-URL/api/assess

# Submit test
curl -X POST https://YOUR-URL/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers":["Math","Tech","Budget","Growth"]}'
```

---

## 📋 Share with Orchids

```
✅ Backend Live!

URL: https://YOUR-URL
Endpoints: POST /api/assess, GET /api/pdf/:sessionId
Auth: None
CORS: Enabled

Test: curl https://YOUR-URL/api/assess
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Restart server, check next.config.js |
| 500 error | Check logs: `vercel logs` |
| 404 error | Verify path: `/api/assess` not `/assess` |
| ngrok stops | Restart ngrok, get new URL |

---

## ✅ Success Checklist

- [ ] Backend deployed
- [ ] Health check works
- [ ] Test assessment works
- [ ] URL shared with Orchids
- [ ] Orchids confirmed connection
- [ ] End-to-end test passed

---

## 📚 Full Documentation

- **ORCHIDS-CONNECTION-GUIDE.md** - Complete guide
- **DEPLOY-TO-VERCEL.md** - Deployment steps
- **ORCHIDS-QUICK-START.md** - For Orchids developer
- **GIVE-THIS-TO-ORCHIDS.md** - Share this file

