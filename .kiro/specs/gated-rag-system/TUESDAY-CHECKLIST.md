# Tuesday Checklist: Integration Day

**Goal:** Integrate all 4 blockers with existing RAG system  
**Time:** 6 hours estimated  
**Status:** Ready to execute

---

## Morning Session (2 hours)

### Task 1: Database Setup (30 min)
- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from `scripts/setup-popia-audit-tables.sql`
- [ ] Execute migration
- [ ] Verify tables created: `popia_audit_log`, `consent_log`
- [ ] Test: Insert sample audit record

**Verification:**
```sql
SELECT COUNT(*) FROM popia_audit_log;
SELECT COUNT(*) FROM consent_log;
```

### Task 2: Add Consent UI (1 hour)
- [ ] Open `app/assessment/page.jsx`
- [ ] Import ConsentCheckbox component
- [ ] Add to form (before submit button)
- [ ] Update form state to track consent
- [ ] Update submission to include consent timestamp

**Code to Add:**
```javascript
import ConsentCheckbox from './components/ConsentCheckbox';

// In form state
const [consent, setConsent] = useState({
  given: false,
  timestamp: null
});

// In JSX (before submit button)
<ConsentCheckbox 
  checked={consent.given}
  onChange={(given) => setConsent({
    given,
    timestamp: given ? new Date().toISOString() : null
  })}
/>

// In submission
const sessionData = {
  ...formData,
  externalProcessingConsent: consent.given,
  consentTimestamp: consent.timestamp
};
```

### Task 3: Test Consent Flow (30 min)
- [ ] Start dev server: `npm run dev`
- [ ] Open assessment form
- [ ] Verify checkbox appears
- [ ] Try submitting without consent (should work, but skip external processing)
- [ ] Try submitting with consent (should allow external processing)

**Test Script:**
```bash
node scripts/test-consent-flow.js
```

---

## Afternoon Session (3 hours)

### Task 4: Integrate with RAG System (2 hours)

#### Step 4.1: Update API Route (30 min)
- [ ] Open `app/api/rag/query/route.js`
- [ ] Import compliance modules
- [ ] Add consent check at start
- [ ] Add PII sanitisation before external calls
- [ ] Wrap LLM calls with guarded client

**Code Changes:**
```javascript
import { ConsentGate } from '@/lib/compliance/consent-gate';
import { POPIASanitiser } from '@/lib/compliance/popia-sanitiser';
import { guardedClient } from '@/lib/llm/guarded-client';
import { LLMAdapter } from '@/lib/llm/llm-adapter';

export async function POST(request) {
  const { studentProfile, session } = await request.json();
  
  // 1. Check consent
  const consent = ConsentGate.checkConsent(session);
  
  // 2. Generate draft report (always works)
  const draftReport = await generateDraftReport(studentProfile);
  
  // 3. If consent given, enhance with external AI
  if (consent.allowed) {
    const sanitiser = new POPIASanitiser();
    const cleanProfile = sanitiser.sanitiseProfile(studentProfile);
    
    const provider = LLMAdapter.getDefaultProvider();
    const enhanced = await guardedClient.execute(
      async () => provider.generateText(`Enhance: ${draftReport}`),
      { maxTokens: 3000 }
    );
    
    return Response.json({
      report: enhanced.success ? enhanced.data : draftReport,
      enhanced: enhanced.success,
      cost: enhanced.metadata?.cost || 0
    });
  }
  
  // 4. Return draft if no consent
  return Response.json({
    report: draftReport,
    enhanced: false,
    reason: consent.reason
  });
}
```

#### Step 4.2: Update Post-Correction (1 hour)
- [ ] Open `lib/correction/post-correct.js`
- [ ] Add all 4 blockers to correction flow
- [ ] Test with mock provider first
- [ ] Switch to Claude provider

**See:** `INTEGRATION-GUIDE.md` for detailed code

#### Step 4.3: Test Integration (30 min)
- [ ] Test with consent given
- [ ] Test without consent
- [ ] Test timeout scenario (slow API)
- [ ] Test PII sanitisation
- [ ] Verify audit trail

**Test Commands:**
```bash
# Test all blockers
node scripts/test-all-blockers.js

# Test integration
node scripts/test-integration-flow.js

# Test with real API
node scripts/test-real-api-flow.js
```

---

## Evening Session (1 hour)

### Task 5: End-to-End Testing (30 min)
- [ ] Complete assessment as Grade 11 student
- [ ] Verify consent checkbox works
- [ ] Check report generation
- [ ] Verify PII not in logs
- [ ] Check audit trail in database

**Test Scenarios:**
1. Math Lit student (no consent) → Draft report only
2. Pure Math student (with consent) → Enhanced report
3. Slow API response → Fallback to draft

### Task 6: Deploy to Staging (30 min)
- [ ] Commit all changes
- [ ] Push to staging branch
- [ ] Deploy to Vercel staging
- [ ] Run smoke tests on staging
- [ ] Check Supabase logs

**Deploy Commands:**
```bash
git add .
git commit -m "feat: Add 4 production blockers (POPIA, consent, timeout, adapter)"
git push origin staging
vercel --prod
```

---

## Verification Checklist

### Legal Compliance ✅
- [ ] PII sanitised before external calls
- [ ] Consent enforced for external processing
- [ ] Audit trail logging to database
- [ ] 5-year retention policy configured

### Demo Reliability ✅
- [ ] 5-second timeout protection
- [ ] Fallback responses working
- [ ] Token cap enforced (3000 max)
- [ ] Cost tracking enabled

### Vendor Independence ✅
- [ ] Can switch providers via env var
- [ ] Mock provider works for testing
- [ ] Claude provider works in production
- [ ] OpenAI provider available as backup

---

## Rollback Plan

If anything breaks:

1. **Revert API Route:**
```bash
git checkout HEAD~1 app/api/rag/query/route.js
```

2. **Disable Consent Gate:**
```javascript
// In route.js, comment out:
// const consent = ConsentGate.checkConsent(session);
// Always allow external processing temporarily
```

3. **Use Mock Provider:**
```bash
# In .env.local
LLM_PROVIDER=mock
```

---

## Success Criteria

- [ ] All tests passing
- [ ] Consent flow working in UI
- [ ] PII sanitisation verified
- [ ] Timeout protection working
- [ ] Audit trail logging to database
- [ ] Staging deployment successful
- [ ] No errors in Vercel logs
- [ ] Cost tracking accurate

---

## Time Estimates

| Task | Estimated | Actual |
|------|-----------|--------|
| Database setup | 30 min | ___ |
| Consent UI | 1 hour | ___ |
| Test consent | 30 min | ___ |
| RAG integration | 2 hours | ___ |
| E2E testing | 30 min | ___ |
| Deploy staging | 30 min | ___ |
| **TOTAL** | **5 hours** | ___ |

---

## Questions to Answer

- [ ] Where should audit logs be stored? (Supabase ✅)
- [ ] What's the consent expiry period? (90 days ✅)
- [ ] What's the timeout threshold? (5 seconds ✅)
- [ ] What's the token cap? (3000 ✅)
- [ ] Which LLM provider to use? (Claude ✅)

---

## Next Steps After Tuesday

**Wednesday:** Production deployment  
**Thursday:** Monitor metrics, adjust thresholds  
**Friday:** Week 1 review, plan Week 2

---

**Ready to start?** Begin with Task 1 (Database Setup)

