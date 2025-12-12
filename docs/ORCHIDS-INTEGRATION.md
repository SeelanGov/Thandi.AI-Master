# Orchids Frontend Integration Guide

## 🔗 API Endpoints for Orchids

Your Orchids frontend can now connect to these endpoints:

### Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: Your deployed Vercel/Netlify URL

---

## 📡 Endpoints

### 1. POST /api/assess
Submit assessment and get career recommendations

**Request:**
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

**Response:**
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

### 2. GET /api/pdf/:sessionId
Download PDF of assessment results

**Request:**
```
GET /api/pdf/1234567890
```

**Response:**
- Content-Type: `application/pdf` (or `text/plain` for placeholder)
- Downloads file: `career-assessment-1234567890.pdf`

---

## 🧪 Testing the Connection

### Option 1: Automated Test Script (Recommended)
```bash
# Run automated test suite
npm run test:orchids
```

This tests:
- Health check endpoint
- Assessment submission
- PDF generation endpoint
- CORS configuration

### Option 2: Using curl
```bash
curl -X POST http://localhost:3000/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers": ["Math and Science", "Technology", "Limited budget", "Growing field"]}'
```

### Option 2: Using JavaScript (in Orchids)
```javascript
// Submit assessment
const response = await fetch('http://localhost:3000/api/assess', {
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

// Download PDF
window.open(`http://localhost:3000/api/pdf/${data.sessionId}`);
```

---

## 🌐 Making it Publicly Accessible

Since Orchids is web-based and you're running locally, you need to expose your local server:

### Option 1: ngrok (Recommended)
```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose it
ngrok http 3000
```

This gives you a public URL like: `https://abc123.ngrok.io`

Then Orchids can call:
- `https://abc123.ngrok.io/api/assess`
- `https://abc123.ngrok.io/api/pdf/:sessionId`

### Option 2: Deploy to Vercel (Production)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Get a permanent URL like: `https://thandi-career.vercel.app`

---

## 🔧 CORS Configuration

The endpoints already have CORS enabled for cross-origin requests from Orchids:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## 📝 What to Tell Your Orchids Agent

**For Local Testing (with ngrok):**
```
Backend URL: https://YOUR-NGROK-URL.ngrok.io
Endpoints:
  - POST /api/assess (submit assessment)
  - GET /api/pdf/:sessionId (download PDF)
Authentication: None required
CORS: Enabled
```

**For Production:**
```
Backend URL: https://thandi-career.vercel.app
Endpoints: Same as above
Authentication: None required
CORS: Enabled
```

---

## ✅ Next Steps

1. **Start your local server**: `npm run dev`
2. **Expose it with ngrok**: `ngrok http 3000`
3. **Give Orchids the ngrok URL**: `https://abc123.ngrok.io`
4. **Test the connection**: Orchids should now be able to call your API
5. **Deploy to production**: When ready, deploy to Vercel for permanent URL

---

## 🐛 Troubleshooting

**Orchids can't connect:**
- Check if `npm run dev` is running
- Check if ngrok is running
- Verify the ngrok URL is correct
- Check browser console for CORS errors

**Getting 404 errors:**
- Verify endpoint paths: `/api/assess` and `/api/pdf/:sessionId`
- Check request method (POST for assess, GET for pdf)

**Getting 500 errors:**
- Check your terminal for error logs
- Verify environment variables (OPENAI_API_KEY, SUPABASE_URL, etc.)
- Check if Supabase database is accessible
