# Founder Test Guide: 3 Questions Enhancement

**Time Required:** 10 minutes  
**What to Test:** New cross-reference questions in assessment flow

---

## What You're Testing

3 new questions that help Thandi detect dangerous career-subject mismatches:

1. **"What careers are you considering?"** (Step 5)
2. **"Which subjects are you struggling with?"** (Deep Dive)
3. **"Is anyone in your family a university graduate?"** (Step 4)

---

## Test Scenario 1: Critical Mismatch (Doctor + Math Lit)

**Goal:** Verify system can detect when student wants medical career but has Math Lit

### Steps:
1. Open browser: `http://localhost:3000/assessment`
2. Select **Grade 10**
3. **Step 1:** Select CAPS curriculum
4. **Step 2:** Choose subjects you enjoy:
   - ✅ Mathematical Literacy
   - ✅ Life Sciences
   - ✅ English
5. **Step 3:** Select interests:
   - ✅ Helping people
   - ✅ Science
6. **Step 4:** Constraints:
   - Time: "Full-time (3-4 years)"
   - Money: "Need bursary/NSFAS"
   - Location: "Anywhere in South Africa"
   - **NEW:** Family background: **"No - I'd be the first"**
7. **Step 5:** Open questions:
   - Motivation: "I love helping people"
   - Concerns: "Can I afford university?"
   - **NEW:** Career interests: **"I want to be a doctor"**
8. Click "Continue"
9. See preliminary report
10. Click "Build My 3-Year Plan"
11. **Deep Dive:** Enter marks (optional)
12. **NEW:** Struggling subjects: (leave unchecked)
13. Support: Check any options
14. Click "Get My 3-Year Plan"

### What to Check:
- [ ] New "Career interests" field appears in Step 5
- [ ] New "Family background" dropdown appears in Step 4
- [ ] New "Struggling subjects" checkboxes appear in Deep Dive
- [ ] All fields are optional (can skip)
- [ ] No console errors
- [ ] Assessment completes successfully

### Expected Behavior (Future):
When misconception detection is integrated, system should warn:
> "⚠️ Medical school requires Pure Mathematics, not Math Lit"

---

## Test Scenario 2: Academic Concern (Engineering + Struggling)

**Goal:** Verify system captures struggling subjects

### Steps:
1. Start new assessment
2. Select **Grade 11**
3. **Step 2:** Choose subjects:
   - ✅ Mathematics (Pure)
   - ✅ Physical Sciences
   - ✅ English
4. **Step 3:** Select interests:
   - ✅ Problem-solving
   - ✅ Technology
5. **Step 4:** Constraints:
   - Family background: **"Yes - my parents"**
6. **Step 5:** Open questions:
   - Career interests: **"engineer"**
7. Continue to Deep Dive
8. **NEW:** Struggling subjects:
   - ✅ **Mathematics**
   - ✅ **Physical Sciences**
9. Complete assessment

### What to Check:
- [ ] Can select multiple struggling subjects
- [ ] "None - doing well in all" option available
- [ ] Data flows through to results
- [ ] No errors

### Expected Behavior (Future):
System should suggest:
> "Focus on improving math marks first. Target 70%+ by Grade 12."

---

## Test Scenario 3: First-Gen Student (Good Match)

**Goal:** Verify first-gen detection works

### Steps:
1. Start new assessment
2. Select **Grade 12**
3. **Step 2:** Choose subjects:
   - ✅ Mathematics
   - ✅ Computer Science
   - ✅ English
4. **Step 4:** Constraints:
   - Family background: **"No - I'd be the first"**
5. **Step 5:** Open questions:
   - Career interests: "software developer"
6. Complete assessment

### What to Check:
- [ ] First-gen option selectable
- [ ] Assessment completes
- [ ] No errors

### Expected Behavior (Future):
System should provide extra support:
> "As a first-generation student, talk to your LO about NSFAS and mentorship programs."

---

## Quick Checks (2 minutes)

### Mobile Responsiveness:
1. Open on phone or resize browser to mobile width
2. Check all 3 new fields display correctly
3. Verify dropdowns and checkboxes work on touch

### Backward Compatibility:
1. Open browser console
2. Check localStorage: `localStorage.getItem('thandi_assessment_data')`
3. Verify old assessments still work
4. Start new assessment, should not crash

### Data Flow:
1. Complete any assessment
2. Open browser console
3. Look for: `📤 Submitting assessment:`
4. Verify new fields appear in logged data:
   - `careerInterests`
   - `familyBackground`
   - `strugglingSubjects`

---

## Console Commands for Testing

### Check localStorage:
```javascript
JSON.parse(localStorage.getItem('thandi_assessment_data'))
```

### Clear localStorage (start fresh):
```javascript
localStorage.clear()
```

### Check for errors:
```javascript
// Open Console (F12)
// Look for red errors
// Should see: 0 errors
```

---

## Pass/Fail Criteria

### ✅ PASS if:
- All 3 new questions appear in correct steps
- Questions are optional (can skip)
- Assessment completes without errors
- Data appears in console log
- Mobile responsive
- No breaking changes to existing flow

### ❌ FAIL if:
- Console shows JavaScript errors
- Assessment crashes or freezes
- New fields don't appear
- Can't complete assessment
- Mobile layout broken
- Existing functionality broken

---

## What to Look For

### Good Signs ✅:
- Smooth flow through assessment
- New questions feel natural
- Clear labels and placeholders
- No confusion about what to enter
- Fast loading (no delays)

### Red Flags ❌:
- Console errors (red text)
- Blank screens
- Buttons don't work
- Text overlapping
- Slow loading
- Assessment won't submit

---

## If You Find Issues

### Minor Issues (typos, styling):
- Note them down
- Continue testing
- Report after completing all tests

### Major Issues (crashes, errors):
- Stop testing
- Take screenshot
- Copy console error
- Report immediately

---

## After Testing

### If Everything Works:
1. ✅ Mark as approved
2. Ready for production deployment
3. Can integrate misconception detection next

### If Issues Found:
1. Document issues clearly
2. Provide screenshots
3. Describe steps to reproduce
4. Kiro will fix and retest

---

## Quick Reference

**New Fields:**
1. Career interests → Step 5 (Open Questions)
2. Family background → Step 4 (Constraints)
3. Struggling subjects → Deep Dive (Grade 10-12)

**Test Time:** 10 minutes  
**Test Scenarios:** 3  
**Expected Result:** All pass, no errors

---

## Questions to Ask Yourself

1. Would a Grade 10 student understand these questions?
2. Are the options clear and comprehensive?
3. Does it feel natural in the flow?
4. Would you trust the data collected?
5. Can parents/teachers verify the answers?

---

## Success Looks Like

- Student completes assessment smoothly
- New questions feel helpful, not intrusive
- Data collected is verifiable
- No technical issues
- Ready for real students

---

**Ready to test? Start with Scenario 1!**

**Questions?** Check `3-QUESTIONS-ENHANCEMENT-COMPLETE.md` for full details.
