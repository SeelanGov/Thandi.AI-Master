# Cofounder Verification Checklist

**Date:** November 29, 2025  
**Task:** Verify all 4 blockers are integrated  
**Time Required:** 5 minutes

---

## Quick Verification (30 seconds)

### 1. Check API Version
```bash
curl http://localhost:3000/api/rag/query
```

**Expected Output:**
```json
{
  "status": "ok",
  "endpoint": "/api/rag/query",
  "version": "2.0.0-compliance",
  "blockers": ["consent", "sanitiser", "guarded-client", "adapter"]
}
```

✅ If you see `version: "2.0.0-compliance"` and 4 blockers → **PASS**

---

### 2. Check Imports in Production Code
```bash
grep -n "import.*ConsentGate\|import.*POPIASanitiser\|import.*guardedClient\|import.*LLMAdapter" app/api/rag/query/route.js
```

**Expected Output:**
```
3:import { ConsentGate } from '@/lib/compliance/consent-gate';
4:import { POPIASanitiser } from '@/lib/compliance/popia-sanitiser';
5:import { LLMAdapter } from '@/lib/llm/llm-adapter';
6:import { guardedClient } from '@/lib/llm/guarded-client';
```

✅ If you see all 4 imports → **PASS**

---

### 3. Run Unit Tests
```bash
node scripts/test-blockers-unit.js
```

**Expected Output:**
```
✅ BLOCKER 1: Consent Gate - PASS
✅ BLOCKER 2: POPIA Sanitiser - PASS
✅ BLOCKER 3: Guarded Client - PASS
✅ BLOCKER 4: LLM Adapter - PASS

🎉 All 4 blockers working independently!
```

✅ If all 4 pass → **PASS**

---

## Detailed Verification (5 minutes)

### 4. Test No Consent Scenario
```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to be an engineer",
    "curriculumProfile": {"grade": 11},
    "session": {"externalProcessingConsent": false}
  }' | jq .
```

**Expected:**
```json
{
  "success": true,
  "source": "draft",
  "compliance": {
    "consent": false,
    "reason": "User has not consented to external data processing"
  }
}
```

✅ If `source: "draft"` and `consent: false` → **PASS**

---

### 5. Test PII Sanitisation
```bash
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Career advice",
    "curriculumProfile": {
      "name": "Thabo Mokoena",
      "grade": 12,
      "location": "Johannesburg",
      "mathMark": 67
    },
    "session": {
      "externalProcessingConsent": true,
      "consentTimestamp": "2025-11-29T20:00:00Z"
    }
  }' | jq .compliance
```

**Expected:**
```json
{
  "consent": true,
  "sanitised": true,
  "enhanced": true
}
```

✅ If `sanitised: true` → **PASS**

**Verify PII Stripped:**
- Check server logs: Should NOT see "Thabo Mokoena" or "Johannesburg"
- Should see "Gauteng" (generalised location)
- Should see marks rounded to 65% (not 67%)

---

### 6. Test Timeout Protection
```bash
# This test requires mock provider to simulate slow response
# For now, verify guarded client is being used:

grep -A 5 "guardedClient.execute" app/api/rag/query/route.js
```

**Expected:**
```javascript
const result = await guardedClient.execute(
  async () => provider.generateText(enhancementPrompt),
  { 
    maxTokens: 3000,
    fallback: draftReport
  }
);
```

✅ If guarded client wraps LLM call → **PASS**

---

### 7. Test Vendor Switching
```bash
# Check current provider
grep "LLM_PROVIDER" .env.local

# Verify adapter is used (not direct Claude API)
grep -n "anthropic.com\|openai.com" app/api/rag/query/route.js
```

**Expected:**
- `.env.local` shows `LLM_PROVIDER=claude` (or mock)
- No direct API URLs in route.js (should use adapter)

✅ If no direct API calls → **PASS**

---

## Final Checklist

- [ ] API version shows `2.0.0-compliance`
- [ ] All 4 imports present in route.js
- [ ] Unit tests pass (all 4 blockers)
- [ ] No consent → Returns draft
- [ ] With consent → Sanitises PII
- [ ] Guarded client wraps LLM calls
- [ ] No direct API URLs (uses adapter)

**If all 7 checks pass → INTEGRATION VERIFIED ✅**

---

## What to Look For (Red Flags)

### ❌ FAIL Indicators
- API version still shows `1.0.0-mock`
- Missing imports in route.js
- Unit tests fail
- PII (names, exact locations) in server logs
- Direct `fetch('https://api.anthropic.com')` calls
- No `compliance` object in API response

### ✅ PASS Indicators
- API version `2.0.0-compliance`
- All 4 imports present
- All unit tests pass
- Only generalised data in logs (provinces, rounded marks)
- All API calls go through adapter
- `compliance` object with all flags in response

---

## Quick Decision Matrix

| Check | Result | Action |
|-------|--------|--------|
| All 7 pass | ✅ | Approve for staging |
| 1-2 fail | ⚠️ | Review failures, fix tonight |
| 3+ fail | ❌ | Integration incomplete, do not deploy |

---

## Files to Review (Optional)

If you want to manually review the code:

1. **Production API:** `app/api/rag/query/route.js`
   - Lines 1-10: Check imports
   - Lines 15-30: Check consent gate
   - Lines 35-40: Check sanitiser
   - Lines 55-65: Check guarded client + adapter

2. **Unit Tests:** `scripts/test-blockers-unit.js`
   - Run and verify all pass

3. **Integration Summary:** `INTEGRATION-COMPLETE-TONIGHT.md`
   - Read executive summary

---

## Approval Statement

If all checks pass, reply with:

**"APPROVED FOR STAGING"**

Then we deploy tomorrow morning.

---

**Estimated Verification Time:** 5 minutes  
**Required:** npm run dev (server must be running)

