# 🎨 For Orchids: Backend Connection Info

## Backend URL
**You will receive this URL from us after we start the server**

Example: `https://abc123xyz.ngrok.io`

---

## API Endpoints

### 1️⃣ Submit Assessment
```
POST /api/assess
```

**Send this:**
```json
{
  "answers": [
    "answer to question 1",
    "answer to question 2",
    "answer to question 3",
    "answer to question 4"
  ]
}
```

**You'll get back:**
```json
{
  "careers": [
    {
      "name": "Software Engineer",
      "match": 90,
      "description": "Software engineering combines..."
    },
    {
      "name": "Data Scientist",
      "match": 85,
      "description": "Data science uses math..."
    }
  ],
  "sessionId": "1234567890"
}
```

---

### 2️⃣ Download PDF
```
GET /api/pdf/:sessionId
```

Use the `sessionId` from the assess response:
```javascript
window.open(`${BACKEND_URL}/api/pdf/${sessionId}`);
```

---

## JavaScript Example

```javascript
// Replace with actual backend URL we give you
const BACKEND_URL = 'https://abc123xyz.ngrok.io';

// Submit assessment
async function submitAssessment(answers) {
  const response = await fetch(`${BACKEND_URL}/api/assess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ answers })
  });
  
  const data = await response.json();
  return data; // { careers: [...], sessionId: "..." }
}

// Download PDF
function downloadPDF(sessionId) {
  window.open(`${BACKEND_URL}/api/pdf/${sessionId}`);
}

// Usage
const result = await submitAssessment([
  "I'm good at Math and Science",
  "I enjoy technology",
  "Limited budget",
  "Want good prospects"
]);

console.log(result.careers); // Array of career recommendations
downloadPDF(result.sessionId); // Download PDF
```

---

## Technical Details

- **Authentication:** None required
- **CORS:** Enabled (cross-origin requests allowed)
- **Content-Type:** `application/json`
- **Response Format:** JSON

---

## Test Connection

Once you have the backend URL, test it:

```javascript
// Health check
fetch('https://YOUR-URL.ngrok.io/api/assess')
  .then(r => r.json())
  .then(data => console.log('Backend status:', data));
```

Should return:
```json
{
  "status": "ok",
  "endpoint": "/api/assess",
  "description": "Assessment endpoint for Orchids frontend"
}
```

---

## What We Need From You

Nothing! Just wait for us to provide the backend URL, then use the endpoints above.

We'll send you a message like:
```
✅ Backend is live!
URL: https://abc123xyz.ngrok.io

You can now connect to:
- POST https://abc123xyz.ngrok.io/api/assess
- GET https://abc123xyz.ngrok.io/api/pdf/:sessionId
```

---

## Questions?

If something doesn't work:
1. Check browser console for errors
2. Verify you're using the correct URL
3. Make sure request format matches examples above
4. Let us know and we'll check our server logs
