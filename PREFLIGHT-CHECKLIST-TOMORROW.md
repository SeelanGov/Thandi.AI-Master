# Preflight Checklist - Tomorrow Morning

**Date:** November 30, 2025  
**Goal:** Complete UI/UX wiring + Final verification before staging deployment  
**Time Required:** 2-3 hours

---

## ⚠️ CRITICAL: UI/UX Wiring Incomplete

### Issue Identified
The **ConsentCheckbox component exists but is NOT wired into the assessment form**. This means:
- ❌ Users cannot give consent via UI
- ❌ API receives no consent data
- ❌ All requests will return draft reports (no external AI processing)

### What Needs to Be Done

#### Task 1: Wire ConsentCheckbox into AssessmentForm (30 min)

**File:** `app/assessment/components/AssessmentForm.jsx`

**Changes Required:**

1. **Import ConsentCheckbox:**
```javascript
import ConsentCheckbox from './ConsentCheckbox';
```

2. **Add consent state:**
```javascript
const [consent, setConsent] = useState({
  given: false,
  timestamp: null
});
```

3. **Add consent handler:**
```javascript
const handleConsentChange = (given) => {
  setConsent({
    given,
    timestamp: given ? new Date().toISOString() : null
  });
};
```

4. **Add ConsentCheckbox to form (before submit button):**
```javascript
{/* Add before final submit/next button */}
<ConsentCheckbox 
  onConsentChange={handleConsentChange}
  required={false}
/>
```

5. **Update API call to include session:**
```javascript
// In handleSubmit function, add:
body: JSON.stringify({
  query,
  curriculumProfile: {...},
  session: {
    externalProcessingConsent: consent.given,
    consentTimestamp: consent.timestamp
  }
})
```

**Location:** Around line 150-200 in AssessmentForm.jsx

---

#### Task 2: Test Consent Flow (15 min)

**Test Scenarios:**

1. **No Consent Given:**
```bash
# Expected: Draft report returned
# Check: response.source === 'draft'
# Check: response.compliance.consent === false
```

2. **Consent Given:**
```bash
# Expected: Enhanced report (if LLM available) or draft (if mock)
# Check: response.source === 'enhanced' or 'draft'
# Check: response.compliance.consent === true
# Check: response.compliance.sanitised === true
```

3. **Verification Warning Present:**
```bash
# Expected: All reports include ⚠️ symbol
# Check: response.report.includes('⚠️')
```

---

## ✅ Backend Integration Status

| Component | Status | Evidence |
|-----------|--------|----------|
| Consent Gate | ✅ Integrated | API route checks consent |
| POPIA Sanitiser | ✅ Integrated | API route sanitises data |
| Guarded Client | ✅ Integrated | API route uses timeout |
| LLM Adapter | ✅ Integrated | API route uses adapter |
| Verification Warning | ✅ Fixed | Reports include ⚠️ |

---

## 🔄 Complete Preflight Checklist

### Morning Session (9am - 11am)

#### Phase 1: UI/UX Wiring (30 min)
- [ ] Add ConsentCheckbox import to AssessmentForm
- [ ] Add consent state management
- [ ] Wire ConsentCheckbox into form UI
- [ ] Update API call to include session data
- [ ] Test locally: No consent → Draft
- [ ] Test locally: With consent → Enhanced/Draft

#### Phase 2: Database Setup (30 min)
- [ ] Run audit tables migration: `scripts/setup-popia-audit-tables.sql`
- [ ] Verify tables created: `popia_audit_log`, `consent_log`
- [ ] Test audit logging with sample request
- [ ] Verify data appears in tables

#### Phase 3: Integration Testing (45 min)
- [ ] Run unit tests: `node scripts/test-blockers-unit.js`
- [ ] Run integration tests: `node scripts/cofounder-verification-suite.js`
- [ ] Test full assessment flow end-to-end
- [ ] Verify no PII in console logs
- [ ] Verify verification warning in all reports

#### Phase 4: Go/No-Go Assessment (15 min)
- [ ] Consent block rate: 100% when consent: false
- [ ] Sanitisation: Zero PII in logs
- [ ] Timeout fallback: < 5.5s when API slow
- [ ] Provider switch: Works via env var
- [ ] Audit capture: 100% of requests
- [ ] Cost per student: < R3.00

---

### Afternoon Session (2pm - 5pm)

#### Phase 5: Staging Deployment (1 hour)
- [ ] Commit all changes
- [ ] Push to staging branch
- [ ] Deploy to Vercel staging
- [ ] Run smoke tests on staging
- [ ] Check Vercel logs for errors

#### Phase 6: E2E Testing (1 hour)
- [ ] Test with 10 real student profiles
- [ ] Verify consent flow works
- [ ] Verify PII sanitisation
- [ ] Check Claude Console for PII leaks
- [ ] Monitor response times

#### Phase 7: Production Deployment (1 hour)
- [ ] Get cofounder approval
- [ ] Deploy to production
- [ ] Monitor for 1 hour
- [ ] Check error rates
- [ ] Verify compliance metrics

---

## 📋 Quick Reference Commands

### Local Testing
```bash
# Start dev server
npm run dev

# Run unit tests
node scripts/test-blockers-unit.js

# Run integration tests
node scripts/cofounder-verification-suite.js

# Test assessment flow
# Navigate to http://localhost:3001/assessment
```

### Database Setup
```bash
# Run audit tables migration
# Copy SQL from scripts/setup-popia-audit-tables.sql
# Paste into Supabase SQL Editor
# Execute
```

### Deployment
```bash
# Commit changes
git add .
git commit -m "feat: Wire consent checkbox + complete compliance integration"

# Push to staging
git push origin staging

# Deploy to Vercel
vercel --prod
```

---

## 🚨 Blockers to Watch For

### Blocker 1: Consent UI Not Working
**Symptom:** Checkbox doesn't appear or doesn't update state  
**Fix:** Check ConsentCheckbox import and state management  
**Time:** 15 minutes

### Blocker 2: API Not Receiving Consent
**Symptom:** All responses show `consent: false`  
**Fix:** Verify session object in API call body  
**Time:** 10 minutes

### Blocker 3: Database Tables Not Created
**Symptom:** Audit logging fails  
**Fix:** Run SQL migration manually in Supabase  
**Time:** 5 minutes

### Blocker 4: PII Still in Logs
**Symptom:** Names/locations visible in console  
**Fix:** Check sanitiser is running before API call  
**Time:** 20 minutes

---

## ✅ Success Criteria

### Must Have (Go/No-Go)
- ✅ Consent checkbox visible in UI
- ✅ Consent data sent to API
- ✅ No consent → Draft report
- ✅ With consent → Enhanced report (or draft if mock)
- ✅ Zero PII in logs
- ✅ Verification warning in all reports

### Nice to Have
- ✅ Audit tables populated
- ✅ Cost tracking working
- ✅ Response times < 5s
- ✅ Error rate < 1%

---

## 📊 Expected Timeline

| Phase | Time | Status |
|-------|------|--------|
| UI/UX Wiring | 30 min | ⏳ TODO |
| Database Setup | 30 min | ⏳ TODO |
| Integration Testing | 45 min | ⏳ TODO |
| Go/No-Go Assessment | 15 min | ⏳ TODO |
| **Morning Total** | **2 hours** | |
| Staging Deployment | 1 hour | ⏳ TODO |
| E2E Testing | 1 hour | ⏳ TODO |
| Production Deployment | 1 hour | ⏳ TODO |
| **Afternoon Total** | **3 hours** | |
| **GRAND TOTAL** | **5 hours** | |

---

## 🎯 Tomorrow's Goal

**By 11am:** UI/UX wired, all tests passing, Go/No-Go complete  
**By 5pm:** Deployed to production, monitoring active

---

## 📝 Notes

### What's Already Done (Tonight)
- ✅ All 4 blockers integrated into API
- ✅ Verification warning fixed
- ✅ Unit tests passing
- ✅ Server compiling successfully
- ✅ ConsentCheckbox component created

### What's Missing (Tomorrow)
- ⏳ ConsentCheckbox wired into form
- ⏳ Consent data sent to API
- ⏳ Database audit tables created
- ⏳ Integration tests run
- ⏳ Staging deployment

---

**Prepared by:** Kiro AI  
**Date:** November 29, 2025, 11:00 PM  
**Status:** Ready for tomorrow's execution

