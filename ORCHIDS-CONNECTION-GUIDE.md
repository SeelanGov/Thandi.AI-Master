# 🎨 Orchids Frontend Connection Guide

## Current Status
✅ Real API is working locally
✅ Mock API tested and verified
✅ Footer verification complete
✅ Ready for Orchids integration

---

## 🚀 Quick Start: Connect Orchids NOW

### Option 1: Deploy to Vercel (Recommended - 5 minutes)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Deploy**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? **thandi-career** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **N**

**Step 3: Get Your URL**
You'll get a URL like: `https://thandi-career.vercel.app`

**Step 4: Set Environment Variables on Vercel**
```bash
vercel env add OPENAI_API_KEY
vercel env add GROQ_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

Paste each value when prompted.

**Step 5: Redeploy with Environment Variables**
```bash
vercel --prod
```

**✅ Done! Your backend is live at:** `https://thandi-career.vercel.app`

---

### Option 2: Use ngrok (Quick Testing - 2 minutes)

**Step 1: Install ngrok**
```bash
npm install -g ngrok
```

**Step 2: Start your dev server** (if not already running)
```bash
npm run dev
```

**Step 3: Expose it publicly** (in a new terminal)
```bash
ngrok http 3000
```

**Step 4: Copy the URL**
You'll see: `Forwarding https://abc123xyz.ngrok.io -> http://localhost:3000`

**✅ Your backend URL:** `https://abc123xyz.ngrok.io`

**⚠️ Note:** ngrok URL changes every time you restart it. For permanent URL, use Vercel.

---

## 📡 API Endpoints for Orchids

Once you have your backend URL (Vercel or ngrok), Orchids can use:

### Endpoint 1: POST /api/assess
Submit assessment answers and get career recommendations

**URL:** `https://YOUR-BACKEND-URL/api/assess`

**Request:**
```json
{
  "answers": [
    "I'm good at Math and Science",
    "I enjoy problem-solving and technology",
    "I have limited budget but willing to study part-time",
    "I want to work in a growing field"
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
      "description": "Software engineering combines problem-solving..."
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

### Endpoint 2: GET /api/pdf/:sessionId
Download PDF of results

**URL:** `https://YOUR-BACKEND-URL/api/pdf/1234567890`

---

## 💻 Code for Orchids Developer

Share this with your Orchids developer:

```javascript
// Replace with your actual backend URL
const BACKEND_URL = 'https://thandi-career.vercel.app'; // or your ngrok URL

// Function to submit assessment
async function submitAssessment(answers) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // { careers: [...], sessionId: "..." }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
}

// Function to download PDF
function downloadPDF(sessionId) {
  window.open(`${BACKEND_URL}/api/pdf/${sessionId}`, '_blank');
}

// Example usage in Orchids
async function handleAssessmentSubmit() {
  const answers = [
    document.getElementById('answer1').value,
    document.getElementById('answer2').value,
    document.getElementById('answer3').value,
    document.getElementById('answer4').value
  ];

  try {
    const result = await submitAssessment(answers);
    
    // Display careers
    result.careers.forEach(career => {
      console.log(`${career.name} - ${career.match}% match`);
      console.log(career.description);
    });

    // Save sessionId for PDF download
    window.sessionId = result.sessionId;
  } catch (error) {
    alert('Error getting career recommendations. Please try again.');
  }
}

// Download PDF button handler
function handleDownloadPDF() {
  if (window.sessionId) {
    downloadPDF(window.sessionId);
  }
}
```

---

## 🧪 Test the Connection

### Test 1: Health Check
```bash
curl https://YOUR-BACKEND-URL/api/assess
```

Should return:
```json
{
  "status": "ok",
  "endpoint": "/api/assess",
  "description": "Assessment endpoint for Orchids frontend"
}
```

### Test 2: Submit Assessment
```bash
curl -X POST https://YOUR-BACKEND-URL/api/assess \
  -H "Content-Type: application/json" \
  -d '{"answers":["Math and Science","Technology","Limited budget","Growing field"]}'
```

Should return career recommendations.

### Test 3: Automated Test
```bash
# Set your backend URL
export TEST_URL=https://YOUR-BACKEND-URL

# Run test
node scripts/test-orchids-connection.js
```

---

## 📋 What to Send to Orchids Developer

Copy and send this message:

```
✅ Thandi Career Backend is Live!

Backend URL: https://YOUR-BACKEND-URL
(Replace with your actual Vercel or ngrok URL)

API Endpoints:
1. POST /api/assess
   - Submit 4 assessment answers
   - Get career recommendations back

2. GET /api/pdf/:sessionId
   - Download PDF of results

Technical Details:
- Authentication: None required
- CORS: Enabled (cross-origin requests allowed)
- Content-Type: application/json
- Response Format: JSON

Test the connection:
curl https://YOUR-BACKEND-URL/api/assess

Full documentation: [Share ORCHIDS-QUICK-START.md]

Let me know when you're ready to test!
```

---

## 🔧 Troubleshooting

### Orchids gets CORS errors
- Verify CORS is enabled in `next.config.js`
- Check browser console for specific error
- Try redeploying to Vercel

### Orchids gets 500 errors
- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Test locally first with ngrok

### Orchids gets 404 errors
- Verify endpoint path: `/api/assess` (not `/assess`)
- Check request method is POST
- Verify backend URL is correct

### ngrok URL stops working
- ngrok URLs expire when you close the terminal
- Restart ngrok to get a new URL
- For permanent URL, deploy to Vercel

---

## ✅ Success Checklist

- [ ] Backend deployed (Vercel or ngrok running)
- [ ] Health check works (`curl YOUR-URL/api/assess`)
- [ ] Test assessment works
- [ ] Sent backend URL to Orchids developer
- [ ] Orchids developer confirmed they can connect
- [ ] Test submission from Orchids frontend works
- [ ] Career recommendations display correctly

---

## 🎯 Next Steps After Connection

1. **Orchids tests the connection** - They'll verify they can call your API
2. **Orchids integrates into their UI** - They'll add the API calls to their frontend
3. **End-to-end test** - Submit a real assessment through Orchids UI
4. **Verify footer appears** - Check that safety warnings are visible
5. **Production deployment** - Move from ngrok to Vercel for permanent URL

---

## 📞 Support

If Orchids has issues connecting:
1. Check your backend is running (Vercel or ngrok)
2. Test the endpoint yourself with curl
3. Check Vercel logs for errors
4. Verify environment variables are set
5. Share error messages for debugging

