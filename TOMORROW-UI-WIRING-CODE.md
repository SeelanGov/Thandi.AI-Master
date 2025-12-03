# Tomorrow: UI/UX Wiring Code (Ready to Apply)

**Time Required:** 30 minutes  
**File to Modify:** `app/assessment/components/AssessmentForm.jsx`

---

## Step 1: Add Import (Line ~13)

**Add after other imports:**
```javascript
import ConsentCheckbox from './ConsentCheckbox';
```

---

## Step 2: Add Consent State (Line ~40, after formData state)

**Add this state:**
```javascript
const [consent, setConsent] = useState({
  given: false,
  timestamp: null
});
```

---

## Step 3: Add Consent Handler (Line ~100, after updateFormData)

**Add this function:**
```javascript
const handleConsentChange = (given) => {
  setConsent({
    given,
    timestamp: given ? new Date().toISOString() : null
  });
  console.log('[CONSENT] User consent:', given ? 'GIVEN' : 'NOT GIVEN');
};
```

---

## Step 4: Update API Call (Line ~150, in handleSubmit function)

**Find this code:**
```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    curriculumProfile: {
      ...formData.curriculumProfile,
      grade: formData.grade
    },
    options: {
      includeDebug: false
    }
  })
});
```

**Replace with:**
```javascript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    curriculumProfile: {
      ...formData.curriculumProfile,
      grade: formData.grade
    },
    session: {
      externalProcessingConsent: consent.given,
      consentTimestamp: consent.timestamp
    },
    options: {
      includeDebug: false
    }
  })
});
```

---

## Step 5: Add ConsentCheckbox to UI (Find submit button area)

**Find the submit/next button section (around line 300-400)**

**Add BEFORE the final submit button:**
```javascript
{/* Consent for external AI processing */}
{currentStep === 5 && (
  <div className="mb-6">
    <ConsentCheckbox 
      onConsentChange={handleConsentChange}
      required={false}
    />
    {!consent.given && (
      <p className="text-sm text-gray-600 mt-2">
        ℹ️ Without consent, you'll receive a standard report (no personalized AI guidance)
      </p>
    )}
  </div>
)}
```

---

## Step 6: Add Consent Status to Results (Optional)

**In the results localStorage save (around line 180):**
```javascript
const resultsWithMetadata = {
  ...data,
  metadata: {
    ...data.metadata,
    consentGiven: consent.given,
    enhanced: data.source === 'enhanced'
  }
};
```

---

## Complete Code Snippet (All Changes Together)

```javascript
// 1. ADD IMPORT (top of file)
import ConsentCheckbox from './ConsentCheckbox';

// 2. ADD STATE (after formData state)
const [consent, setConsent] = useState({
  given: false,
  timestamp: null
});

// 3. ADD HANDLER (after updateFormData)
const handleConsentChange = (given) => {
  setConsent({
    given,
    timestamp: given ? new Date().toISOString() : null
  });
  console.log('[CONSENT] User consent:', given ? 'GIVEN' : 'NOT GIVEN');
};

// 4. UPDATE API CALL (in handleSubmit)
body: JSON.stringify({
  query,
  curriculumProfile: {
    ...formData.curriculumProfile,
    grade: formData.grade
  },
  session: {
    externalProcessingConsent: consent.given,
    consentTimestamp: consent.timestamp
  },
  options: {
    includeDebug: false
  }
})

// 5. ADD UI COMPONENT (before submit button)
{currentStep === 5 && (
  <div className="mb-6">
    <ConsentCheckbox 
      onConsentChange={handleConsentChange}
      required={false}
    />
    {!consent.given && (
      <p className="text-sm text-gray-600 mt-2">
        ℹ️ Without consent, you'll receive a standard report (no personalized AI guidance)
      </p>
    )}
  </div>
)}
```

---

## Testing After Wiring

### Test 1: Consent Checkbox Appears
1. Navigate to assessment
2. Complete all steps
3. On final step (step 5), verify checkbox appears
4. **Expected:** Checkbox visible with consent text

### Test 2: Consent State Updates
1. Check the checkbox
2. Open browser console
3. **Expected:** See `[CONSENT] User consent: GIVEN`

### Test 3: API Receives Consent
1. Submit assessment with consent checked
2. Check Network tab → POST /api/rag/query
3. Check request payload
4. **Expected:** `session.externalProcessingConsent: true`

### Test 4: No Consent → Draft
1. Submit assessment WITHOUT checking consent
2. **Expected:** Response shows `source: 'draft'`
3. **Expected:** Response shows `compliance.consent: false`

### Test 5: With Consent → Enhanced
1. Submit assessment WITH consent checked
2. **Expected:** Response shows `source: 'enhanced'` (or 'draft' if mock)
3. **Expected:** Response shows `compliance.consent: true`
4. **Expected:** Response shows `compliance.sanitised: true`

---

## Database Migration

### Run Audit Tables Migration

**File:** `scripts/setup-popia-audit-tables.sql`

**Steps:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire SQL file
4. Execute
5. Verify tables created:
   - `popia_audit_log`
   - `consent_log`
   - `gate_metrics`

**Verification Query:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('popia_audit_log', 'consent_log', 'gate_metrics');
```

**Expected:** 3 rows returned

---

## Final Verification Suite

### Run All Tests
```bash
# 1. Unit tests
node scripts/test-blockers-unit.js
# Expected: All 4 blockers pass

# 2. Integration tests
node scripts/cofounder-verification-suite.js
# Expected: All 5 tests pass

# 3. Full assessment flow
# Navigate to http://localhost:3001/assessment
# Complete assessment with consent
# Verify report generated
```

---

## Go/No-Go Criteria (Final Check)

| Criteria           | Target                     | Status | Evidence |
| ------------------ | -------------------------- | ------ | -------- |
| Consent block rate | 100% when `consent: false` | ⏳ | Test after UI wiring |
| Sanitisation       | Zero PII in Claude logs    | ⏳ | Test with real API call |
| Timeout fallback   | < 5.5s when API slow       | ✅ | Unit test passed |
| Provider switch    | Works via env var          | ✅ | Code verified |
| Audit capture      | 100% of requests           | ⏳ | Test after DB migration |
| Cost per student   | < R3.00                    | ✅ | Estimated R0.65 |

**Target:** All 6 criteria = ✅ GO by 11am

---

## Deployment Checklist

### Staging Deployment (2pm)
- [ ] All tests passing
- [ ] UI/UX wiring complete
- [ ] Database migration complete
- [ ] Commit and push to staging
- [ ] Deploy to Vercel staging
- [ ] Smoke test on staging

### Production Deployment (5pm)
- [ ] Staging tests passed
- [ ] Cofounder approval received
- [ ] Deploy to production
- [ ] Monitor for 1 hour
- [ ] Check error rates
- [ ] Verify compliance metrics

---

## Rollback Plan

### If UI Wiring Fails
```bash
git checkout HEAD~1 app/assessment/components/AssessmentForm.jsx
```

### If API Integration Fails
```bash
git checkout HEAD~1 app/api/rag/query/route.js
```

### If Database Migration Fails
```sql
DROP TABLE IF EXISTS popia_audit_log CASCADE;
DROP TABLE IF EXISTS consent_log CASCADE;
DROP TABLE IF EXISTS gate_metrics CASCADE;
```

---

## Success Metrics

### By 11am
- ✅ Consent checkbox working in UI
- ✅ All 6 Go/No-Go criteria pass
- ✅ Database tables created
- ✅ All tests passing

### By 5pm
- ✅ Deployed to production
- ✅ Zero PII leaks detected
- ✅ Response times < 5s
- ✅ Error rate < 1%
- ✅ Compliance metrics tracking

---

## Contact Points

### If Blocked
1. Check `PROBLEM-IDENTIFIED-AND-FIXED.md` for common issues
2. Run `node scripts/test-blockers-unit.js` to isolate problem
3. Check browser console for errors
4. Check server logs for API errors

### If Tests Fail
1. Read error message carefully
2. Check which blocker failed
3. Review blocker implementation in `lib/`
4. Fix and re-run tests

---

**Prepared by:** Kiro AI  
**Date:** November 29, 2025, 11:00 PM  
**Status:** Ready for tomorrow's execution

**CRITICAL:** UI/UX wiring must be completed first thing tomorrow morning before any deployment.

