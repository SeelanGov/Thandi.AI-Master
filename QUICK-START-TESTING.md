# Quick Start: Test UI Integration Now

**Time Required:** 5 minutes  
**Status:** Ready to test

---

## Step 1: Start Dev Server (30 seconds)

```bash
npm run dev
```

Wait for: `Ready on http://localhost:3000`

---

## Step 2: Open Assessment (10 seconds)

Navigate to: **http://localhost:3000/assessment**

---

## Step 3: Complete Assessment (2 minutes)

1. **Select Grade:** Choose Grade 12
2. **Step 1:** Select curriculum (CAPS)
3. **Step 2:** Select subjects you enjoy
4. **Step 3:** Select interests
5. **Step 4:** Fill constraints
6. **Step 5:** Fill open questions

---

## Step 4: Test Consent Checkbox (1 minute)

### On Step 5, you should see:

```
┌─────────────────────────────────────────────────┐
│ ☐ I consent to external AI processing for      │
│   personalized career guidance                  │
│                                                 │
│ 🔒 POPIA Compliant • Your personal information │
│    is protected                                 │
└─────────────────────────────────────────────────┘

ℹ️ Without consent, you'll receive a standard 
   report (no personalized AI guidance)
```

### Test Actions:

**A. Check the box:**
- Open browser console (F12)
- Look for: `[CONSENT] User consent: GIVEN`

**B. Uncheck the box:**
- Look for: `[CONSENT] User consent: NOT GIVEN`

---

## Step 5: Submit & Verify (1 minute)

### Test A: With Consent ✅

1. **Check** the consent checkbox
2. Click "Continue →"
3. Open Network tab (F12)
4. Find POST to `/api/rag/query`
5. Check request payload:
   ```json
   {
     "session": {
       "externalProcessingConsent": true,
       "consentTimestamp": "2025-11-29T..."
     }
   }
   ```
6. Check response:
   ```json
   {
     "compliance": {
       "consent": true,
       "sanitised": true
     }
   }
   ```

### Test B: Without Consent ❌

1. **Uncheck** the consent checkbox
2. Click "Continue →"
3. Check request payload:
   ```json
   {
     "session": {
       "externalProcessingConsent": false,
       "consentTimestamp": null
     }
   }
   ```
4. Check response:
   ```json
   {
     "compliance": {
       "consent": false
     },
     "source": "draft"
   }
   ```

---

## Expected Results

### ✅ Success Indicators

**UI:**
- Consent checkbox visible on step 5
- Checkbox state updates when clicked
- Info message shows when unchecked

**Console:**
- `[CONSENT] User consent: GIVEN` when checked
- `[CONSENT] User consent: NOT GIVEN` when unchecked

**Network (With Consent):**
- Request has `session.externalProcessingConsent: true`
- Response has `compliance.consent: true`
- Response has `compliance.sanitised: true`

**Network (Without Consent):**
- Request has `session.externalProcessingConsent: false`
- Response has `compliance.consent: false`
- Response has `source: "draft"`

---

## Troubleshooting

### Checkbox Not Showing
- Verify you're on step 5
- Check browser console for errors
- Refresh page and try again

### Console Logs Not Showing
- Make sure console is open (F12)
- Check Console tab (not Network)
- Try checking/unchecking again

### API Error
- Check server terminal for errors
- Verify `.env.local` has ANTHROPIC_API_KEY
- Restart dev server

---

## Quick Automated Test

If you want to skip manual testing:

```bash
node scripts/test-integration-compliance.js
```

Expected output:
```
✅ Test 1: No consent → Draft response
✅ Test 2: With consent → Enhanced response
✅ Test 3: PII sanitisation working
✅ Test 4: Timeout fallback working
✅ Test 5: Audit logging working
```

---

## What's Next?

### If Tests Pass ✅
1. Commit changes
2. Push to GitHub
3. Deploy to Vercel
4. Test on production

### If Tests Fail ❌
1. Check error message
2. Review console logs
3. Check server logs
4. Run: `node scripts/test-blockers-unit.js`

---

## Summary

**Total Time:** 5 minutes  
**Steps:** 5 simple steps  
**Outcome:** Verified UI → API → Compliance integration

**Status:** 🟢 READY TO TEST

---

**Quick Commands:**

```bash
# Start server
npm run dev

# Run automated tests
node scripts/test-integration-compliance.js

# Run unit tests
node scripts/test-blockers-unit.js

# Check verification suite
node scripts/cofounder-verification-suite.js
```

---

**Need Help?**
- Check `UI-WIRING-COMPLETE.md` for detailed guide
- Check `PROBLEM-IDENTIFIED-AND-FIXED.md` for common issues
- Check browser console for errors
- Check server terminal for API errors
