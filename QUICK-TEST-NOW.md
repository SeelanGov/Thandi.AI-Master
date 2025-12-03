# Quick Test - 3 Questions Enhancement

**Server Status:** ✅ Running on http://localhost:3000  
**Time Required:** 5 minutes  
**Focus:** Grade 10 flow with new questions

---

## Test URL

Open in your browser:
```
http://localhost:3000/assessment
```

---

## Quick Test Scenario (5 minutes)

### Step-by-Step:

1. **Grade Selection**
   - Click **Grade 10**
   - ✅ Should proceed to Step 1

2. **Step 1: Curriculum Profile**
   - Select **CAPS**
   - Click "Next"

3. **Step 2: Subject Selection**
   - Choose subjects you ENJOY:
     - ✅ Mathematical Literacy
     - ✅ Life Sciences
     - ✅ English
   - Click "Next"

4. **Step 3: Interest Areas**
   - Select:
     - ✅ Helping people
     - ✅ Science
   - Click "Next"

5. **Step 4: Constraints** ⭐ NEW QUESTION HERE
   - Time: "Full-time (3-4 years)"
   - Money: "Need bursary/NSFAS"
   - Location: "Anywhere in South Africa"
   - **NEW:** Family background: **"No - I'd be the first"** ⭐
   - Click "Next"

6. **Step 5: Open Questions** ⭐ NEW QUESTION HERE
   - Motivation: "I love helping people"
   - Concerns: "Can I afford university?"
   - **NEW:** Career interests: **"I want to be a doctor"** ⭐
   - Click "Continue"

7. **Preliminary Report**
   - Should see 3 career matches
   - Click **"Build My 3-Year Plan"**

8. **Deep Dive Questions** ⭐ NEW QUESTION HERE
   - Enter marks (optional):
     - Mathematics: 55%
     - Physical Science: 60%
     - Life Sciences: 65%
   - **NEW:** Struggling subjects: (check any) ⭐
     - ✅ Mathematics (optional)
   - Support: Check any options
   - Click **"Get My 3-Year Plan"**

9. **Results**
   - Should see loading screen
   - Then results page
   - ✅ Assessment completes successfully

---

## What to Check

### ✅ New Questions Appear:
- [ ] Family background dropdown in Step 4
- [ ] Career interests textarea in Step 5
- [ ] Struggling subjects checkboxes in Deep Dive

### ✅ Questions Work:
- [ ] Can type in career interests field
- [ ] Can select family background option
- [ ] Can check struggling subjects
- [ ] All fields are optional (can skip)

### ✅ No Errors:
- [ ] No console errors (press F12 to check)
- [ ] Assessment completes without crashing
- [ ] Data flows through to results

### ✅ Mobile Check (Optional):
- [ ] Resize browser to mobile width
- [ ] New fields display correctly
- [ ] Touch interactions work

---

## Console Check

1. Open browser console (F12)
2. Look for this log when submitting:
   ```
   📤 Submitting assessment: {
     ...
     openQuestions: {
       careerInterests: "I want to be a doctor"
     },
     constraints: {
       familyBackground: "no"
     },
     strugglingSubjects: ["Mathematics"]
   }
   ```

3. Verify new fields appear in the logged data

---

## Expected Behavior

### Current (Data Collection):
- New questions appear ✓
- Data is collected ✓
- Assessment completes ✓
- Data logged to console ✓

### Future (After Integration):
When misconception detection is integrated, you'll see:
> "⚠️ Medical school requires Pure Mathematics, not Math Lit.  
> Consider: Nursing, Radiography, Emergency Medical Care"

---

## If You See Issues

### Console Errors:
1. Take screenshot
2. Copy error message
3. Report to Kiro

### Questions Don't Appear:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache
3. Try incognito window

### Assessment Won't Submit:
1. Check console for errors
2. Verify .env.local has API keys
3. Check network tab for failed requests

---

## Quick Verification Commands

### Check localStorage:
Open console (F12) and run:
```javascript
JSON.parse(localStorage.getItem('thandi_assessment_data'))
```

Should show new fields:
- `careerInterests`
- `familyBackground`
- `strugglingSubjects`

### Clear localStorage (start fresh):
```javascript
localStorage.clear()
location.reload()
```

---

## Pass Criteria

✅ **PASS if:**
- All 3 new questions visible
- Can complete assessment without errors
- Data appears in console log
- No breaking changes to existing flow

❌ **FAIL if:**
- Console shows errors
- Assessment crashes
- New questions don't appear
- Can't complete assessment

---

## Other Grades (Quick Check)

### Grade 11 Test (2 minutes):
1. Start new assessment
2. Select **Grade 11**
3. Complete steps 1-5 (same as above)
4. **No preliminary report** (goes straight to deep dive)
5. Complete deep dive with new questions
6. ✅ Should work same as Grade 10

### Grade 12 Test (2 minutes):
1. Start new assessment
2. Select **Grade 12**
3. Complete steps 1-5
4. **No preliminary report** (goes straight to deep dive)
5. Complete deep dive
6. ✅ Should work same as Grade 10

---

## After Testing

### If Everything Works:
1. ✅ Mark as approved
2. Stop server: Tell Kiro to stop the dev server
3. Ready for production deployment

### If Issues Found:
1. Document issues
2. Provide screenshots
3. Copy console errors
4. Report to Kiro

---

## Server Control

**Server is running in background**

To stop server:
```
Tell Kiro: "stop the dev server"
```

To check server status:
```
Tell Kiro: "check dev server status"
```

---

## Quick Reference

**Test URL:** http://localhost:3000/assessment  
**New Questions:** 3 (family background, career interests, struggling subjects)  
**Test Time:** 5 minutes  
**Expected Result:** All pass, no errors

---

**Ready to test! Open http://localhost:3000/assessment in your browser.**

**Questions?** Check console (F12) for any errors.
