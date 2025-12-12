# Local Testing Protocol - MANDATORY BEFORE DEPLOY

**Status**: ✅ Gate tests passed  
**Next**: Browser testing required

---

## Step 1: Start Dev Server ✅ READY

```bash
npm run dev
```

Open: `http://localhost:3000/assessment`

---

## Step 2: Test Death Gate (Math Lit → Engineering)

### Input:
1. Select **Grade 10**
2. **Step 1 - Curriculum Profile**:
   - Framework: CAPS
   - Current subjects: Select "Mathematical Literacy"
3. **Step 2 - Subject Enjoyment**: Select any subjects
4. **Step 3 - Interests**: Select "Technology" or "Problem Solving"
5. **Step 4 - Constraints**: Fill any values
6. **Step 5 - Open Questions**: Type "I want to be an engineer"
7. Click Submit

### Expected Result:
Results page shows:

```
⛔ CRITICAL DECISION

**GATE: Math Literacy blocks Engineering**

Why: Engineering requires Grade 12 Mathematics (algebra/calculus). 
Math Lit teaches budgeting/statistics—no university accepts it for BSc/BEng.

Irreversibility: Cannot switch Math Lit → Math after Grade 10...

Deadline: End of Grade 10 Term 4 (November 30). After this, you're locked.

Action if in Grade 10:
1. Request subject change form from HOD immediately
2. Attend catch-up sessions in December-January
3. Minimum mark to switch: 50% in Grade 9 Math
```

### Pass Criteria:
- [ ] Gate warning appears at top of results page
- [ ] Warning has RED border and background
- [ ] Shows ⛔ icon
- [ ] Says "CRITICAL DECISION"
- [ ] Includes deadline "November 30"
- [ ] Shows action steps
- [ ] Text is readable on mobile (test on phone)

---

## Step 3: Test Hope Gate (Medicine without Physical Sciences)

### Input:
1. Select **Grade 10**
2. **Step 1**: Select "Life Sciences" ONLY (NOT Physical Sciences)
3. Complete remaining steps
4. In open questions, type "I want to study Medicine"
5. Submit

### Expected Result:
```
⚠️ IMPORTANT NOTICE

**GATE: Medicine requires Physical Sciences**

Why: MBChB programs need Physics (mechanics) + Life Sciences (biology)...

Action if in Grade 10:
1. Add it now. Talk to Science HOD before Nov 30.
```

### Pass Criteria:
- [ ] Gate warning appears
- [ ] YELLOW/ORANGE border
- [ ] Shows ⚠️ icon
- [ ] Says "IMPORTANT NOTICE"
- [ ] Mentions Physical Sciences requirement

---

## Step 4: Test No Gate (Correct Subjects)

### Input:
1. Select **Grade 10**
2. **Step 1**: Select "Mathematics" AND "Physical Sciences"
3. Complete assessment
4. Mention "Engineering" in interests
5. Submit

### Expected Result:
- [ ] NO gate warning appears
- [ ] Only shows normal career recommendations
- [ ] Still shows top warning banner (AI-generated advice)
- [ ] Still shows bottom footer (verify before deciding)

---

## Step 5: Mobile Testing

Open on your actual phone (not dev tools):

```
http://YOUR-LOCAL-IP:3000/assessment
```

Find your local IP:
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

### Mobile Checklist:
- [ ] Assessment loads in <3 seconds
- [ ] All 5 steps visible without horizontal scroll
- [ ] Subject cards are tappable (not too small)
- [ ] Gate warning visible without scrolling
- [ ] Text is readable (not too small)
- [ ] Buttons are thumb-sized (44x44px minimum)

---

## Step 6: Error Handling Test

### Test API Failure:
1. Stop Supabase connection (disconnect internet briefly)
2. Try to submit assessment
3. Should show error message (not blank page)

### Test Empty Subjects:
1. Don't select any subjects in Step 1
2. Try to proceed
3. Should prevent or handle gracefully

---

## Step 7: Console Check

Open browser console (F12) and check for:

- [ ] No red errors
- [ ] Gate data logged: `🚪 Gate data: {metadata: {...}}`
- [ ] No 404s or failed requests
- [ ] No warnings about missing dependencies

---

## Step 8: Screenshot Evidence

Take screenshots of:
1. Death Gate warning (Math Lit → Engineering)
2. Hope Gate warning (Medicine without Physical Sciences)
3. Mobile view of gate warning
4. Console showing gate data

Save these for school demos.

---

## DEPLOY BLOCKER CHECKLIST

**DO NOT DEPLOY if any of these fail:**

- [ ] ❌ Gate warning doesn't appear
- [ ] ❌ Wrong gate appears (e.g., shows IEB gate for Math Lit query)
- [ ] ❌ Console shows errors
- [ ] ❌ Mobile view is broken
- [ ] ❌ Assessment doesn't submit
- [ ] ❌ Results page is blank
- [ ] ❌ Gate text is cut off or unreadable

**If ANY of these fail, FIX BEFORE DEPLOYING.**

---

## SAFE TO DEPLOY CHECKLIST

**Only deploy if ALL of these pass:**

- [x] ✅ Pre-deploy tests passed (3/3)
- [ ] ✅ Death Gate shows correctly in browser
- [ ] ✅ Hope Gate shows correctly in browser
- [ ] ✅ No gate shows when subjects are correct
- [ ] ✅ Mobile view works
- [ ] ✅ No console errors
- [ ] ✅ Screenshots taken
- [ ] ✅ Tested on actual phone

---

## After Local Testing Passes

```bash
# Deploy to Vercel
vercel --prod --no-clipboard

# Copy URL manually
# Test all 3 scenarios on live URL
# Only then share with anyone
```

---

**Current Status**: Pre-deploy tests passed. Browser testing required.

**Next Action**: Run `npm run dev` and test in browser.
