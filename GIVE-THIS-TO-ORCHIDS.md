# 🎨 Backend Connection Details for Orchids

## ✅ Backend is Ready!

Your backend URL: **[WILL BE PROVIDED AFTER SETUP]**

---

## 📡 API Endpoints

### Endpoint 1: Submit Assessment
**URL:** `POST /api/assess`

**What to send:**
```json
{
  "answers": [
    "string - answer 1",
    "string - answer 2",
    "string - answer 3",
    "string - answer 4"
  ]
}
```

**What you get back:**
```json
{
  "careers": [
    {
      "name": "Career Name",
      "match": 90,
      "description": "Career description"
    }
  ],
  "sessionId": "1234567890"
}
```

---

### Endpoint 2: Download PDF
**URL:** `GET /api/pdf/:sessionId`

Replace `:sessionId` with the sessionId from the assess response.

---

## 💻 Code Example

```javascript
const BACKEND_URL = 'YOUR_BACKEND_URL_HERE';

// Submit assessment
const response = await fetch(`${BACKEND_URL}/api/assess`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [
      "I'm good at Math and Science",
      "I enjoy technology",
      "Limited budget",
      "Want good prospects"
    ]
  })
});

const data = await response.json();

// Display careers
data.careers.forEach(career => {
  console.log(`${career.name} - ${career.match}% match`);
  console.log(career.description);
});

// Download PDF
window.open(`${BACKEND_URL}/api/pdf/${data.sessionId}`);
```

---

## 🔧 Technical Info

- **Authentication:** None
- **CORS:** Enabled
- **Content-Type:** application/json
- **Methods:** POST for /api/assess, GET for /api/pdf

---

## ✅ That's It!

Once you have the backend URL, just replace `YOUR_BACKEND_URL_HERE` in your code and you're good to go!
