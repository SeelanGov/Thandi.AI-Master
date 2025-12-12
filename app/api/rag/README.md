# Thandi RAG API Documentation

## Endpoint: `/api/rag/query`

### POST Request

Query the RAG system for career guidance.

**URL**: `POST /api/rag/query`

**Request Body**:
```json
{
  "query": "I'm good at math but hate physics. My family can't afford university.",
  "options": {
    "maxRetries": 2,
    "timeout": 10000,
    "includeDebug": false
  }
}
```

**Parameters**:
- `query` (string, required): Student's question (10-1000 characters)
- `options` (object, optional):
  - `maxRetries` (number): Maximum LLM generation retries (default: 2)
  - `timeout` (number): Timeout in milliseconds (default: 10000)
  - `includeDebug` (boolean): Include debug information (default: false)

**Success Response** (200):
```json
{
  "success": true,
  "query": "I'm good at math but hate physics. My family can't afford university.",
  "response": "Don't worry, there are still many great career options...",
  "studentProfile": {
    "academicStrengths": ["mathematics"],
    "academicWeaknesses": ["physics"],
    "interests": [],
    "financialConstraint": "low",
    "priorityModules": ["bursaries", "subject_career_mapping", "careers", "sa_universities"]
  },
  "metadata": {
    "processingTime": 6000,
    "breakdown": {
      "profileExtraction": 5,
      "embedding": 2000,
      "search": 1500,
      "contextAssembly": 50,
      "generation": 2000
    },
    "chunksRetrieved": 10,
    "chunksUsed": 10,
    "tokensUsed": 1479,
    "modelUsed": "groq-llama-3.3-70b",
    "retries": 0,
    "validationPassed": true
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "error": "Invalid request: query is required and must be a string"
}
```

404 Not Found:
```json
{
  "success": false,
  "error": "No relevant information found. Please try rephrasing your question.",
  "query": "...",
  "studentProfile": {...}
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Internal server error: ...",
  "metadata": {
    "processingTime": 1000
  }
}
```

### GET Request

Health check endpoint.

**URL**: `GET /api/rag/query`

**Response** (200):
```json
{
  "status": "ok",
  "endpoint": "/api/rag/query",
  "method": "POST",
  "description": "RAG-based career guidance query endpoint",
  "version": "1.0.0",
  "usage": {
    "method": "POST",
    "body": {
      "query": "string (required, 10-1000 chars)",
      "options": {
        "maxRetries": "number (optional, default: 2)",
        "timeout": "number (optional, default: 10000ms)",
        "includeDebug": "boolean (optional, default: false)"
      }
    }
  }
}
```

### OPTIONS Request

CORS preflight handler.

**URL**: `OPTIONS /api/rag/query`

**Response** (200):
- Headers:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I'\''m good at math but hate physics. My family can'\''t afford university."
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/rag/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: "I'm good at math but hate physics. My family can't afford university.",
    options: {
      includeDebug: false
    }
  })
});

const data = await response.json();
console.log(data.response);
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:3000/api/rag/query',
    json={
        'query': "I'm good at math but hate physics. My family can't afford university."
    }
)

data = response.json()
print(data['response'])
```

## Performance

- **Target**: < 10 seconds total processing time
- **Typical**: 5-7 seconds
- **Breakdown**:
  - Profile extraction: < 10ms
  - Embedding generation: 1-3s
  - Vector search: 1-2s
  - Context assembly: < 100ms
  - LLM generation: 2-4s

## Rate Limiting

Currently no rate limiting implemented (MVP). Consider adding in production:
- Per IP: 10 requests/minute
- Per user: 100 requests/day

## Security

- Input validation (length, type)
- Error message sanitization
- No sensitive data in responses
- CORS enabled for frontend access

## Testing

Run the test script:
```bash
# Start dev server
npm run dev

# In another terminal
node scripts/test-step5-api.js
```
