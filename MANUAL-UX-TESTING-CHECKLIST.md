# 🧪 MANUAL UX TESTING CHECKLIST
## Assessment Form Complete Journey Verification

**URL:** http://localhost:3000/assessment

---

## ✅ **STEP 0: GRADE SELECTION**

### Visual Design
- [ ] Professional teal gradient buttons (not blue)
- [ ] Clean white card with shadow
- [ ] "What grade are you in?" title with proper typography
- [ ] Smooth fade-in animation on page load
- [ ] Responsive design on mobile

### Functionality
- [ ] Click "Grade 10" → Should navigate to Step 1
- [ ] Click "Grade 11" → Should navigate to Step 1  
- [ ] Click "Grade 12" → Should navigate to Step 1
- [ ] Touch events work on mobile devices

---

## ✅ **STEP 1: CURRICULUM PROFILE**

### Visual Design
- [ ] Professional card layout with assessment styling
- [ ] Progress bar shows Step 1 active
- [ ] "Your Current Subjects" title
- [ ] CAPS/IEB framework selection buttons
- [ ] Subject grid with emojis and professional styling
- [ ] Status indicators (red warning → amber progress → green success)

### Functionality
- [ ] Framework selection (CAPS/IEB) works
- [ ] Subject selection toggles correctly
- [ ] Selected subjects show checkmark/highlight
- [ ] Validation: Shows warning if < 6 subjects selected
- [ ] Validation: Shows success if ≥ 6 subjects selected
- [ ] "Next" button disabled until validation passes
- [ ] Data saves to localStorage

### Required Test
1. Select 0 subjects → Should show red warning
2. Select 3 subjects → Should show amber warning  
3. Select 7 subjects → Should show green success
4. Click "Next" → Should advance to Step 2

---

## ✅ **STEP 2: MARKS COLLECTION**

### Visual Design
- [ ] Professional form styling
- [ ] Progress bar shows Step 2 active
- [ ] Amber verification warning box
- [ ] Radio button options with professional styling
- [ ] Form inputs appear based on selection

### Functionality
- [ ] Shows subjects from Step 1 in blue tags
- [ ] Radio options: "I know my marks", "Approximate", "Don't know"
- [ ] "I know my marks" → Shows number inputs with % signs
- [ ] "Approximate" → Shows dropdown selects
- [ ] "Don't know" → Shows info message
- [ ] Form validation works
- [ ] "Previous" button goes back to Step 1
- [ ] "Next" button advances to Step 3

### Required Test
1. Select "I know my marks"
2. Enter marks: Math=75, English=80, Science=70
3. Verify data saves and advances

---

## ✅ **STEP 3: SUBJECT SELECTION (ENJOYED)**

### Visual Design
- [ ] "Which subjects do you actually ENJOY? 💚" title
- [ ] Helpful tip box (amber background)
- [ ] Subject grid filtered from Step 1 subjects
- [ ] Professional selection styling with checkmarks
- [ ] Selection counter at bottom

### Functionality
- [ ] Only shows subjects selected in Step 1
- [ ] Subject selection toggles correctly
- [ ] Maximum 5 subjects enforced
- [ ] Minimum 2 subjects required
- [ ] Selection count updates dynamically
- [ ] Validation messages appear correctly

### Required Test
1. Select 0 subjects → Should show error
2. Select 2-3 subjects → Should show "Perfect!"
3. Try to select 6th subject → Should be prevented
4. Click "Next" → Should advance to Step 4

---

## ✅ **STEP 4: INTEREST AREAS**

### Visual Design
- [ ] "What interests you?" title
- [ ] Interest grid with icons and professional styling
- [ ] Selection highlighting works
- [ ] Selection counter at bottom

### Functionality
- [ ] Interest selection toggles correctly
- [ ] Multiple selections allowed
- [ ] Minimum 1 interest required
- [ ] Selection count updates
- [ ] Validation works

### Required Test
1. Select 3-4 interests
2. Verify selection count updates
3. Click "Next" → Should advance to Step 5

---

## ✅ **STEP 5: CONSTRAINTS**

### Visual Design
- [ ] "What are your constraints?" title
- [ ] Professional form inputs with labels
- [ ] Dropdown selects with proper styling
- [ ] Consistent spacing and typography

### Functionality
- [ ] All 4 dropdown selects work:
  - Time commitment
  - Financial situation  
  - Study location
  - Family background
- [ ] Selections save properly
- [ ] Form validation (optional fields)

### Required Test
1. Select options for all 4 dropdowns
2. Verify selections save
3. Click "Next" → Should advance to Step 6

---

## ✅ **STEP 6: OPEN QUESTIONS**

### Visual Design
- [ ] "Tell us more about you" title
- [ ] Professional textarea styling
- [ ] Character counters for each field
- [ ] Privacy notice box (blue background)
- [ ] Optional field indicators

### Functionality
- [ ] All 3 textareas work:
  - Motivation (500 chars)
  - Concerns (500 chars)  
  - Career interests (200 chars)
- [ ] Character counters update in real-time
- [ ] Character limits enforced
- [ ] Fields are optional (can be empty)

### Required Test
1. Fill in motivation: "I love solving problems and helping people"
2. Fill in career interests: "Software engineer, doctor"
3. Verify character counts update
4. Click "Continue" → Should trigger submission

---

## ✅ **BACKEND INTEGRATION & RESULTS**

### Loading State
- [ ] Loading overlay appears immediately
- [ ] "Thandi is thinking..." title with Thandi branding
- [ ] Professional loading spinner (teal colors)
- [ ] "Analyzing YOUR marks..." message
- [ ] "This takes 10-15 seconds" subtext

### Backend Processing
- [ ] Request sent to `/api/rag/query`
- [ ] Proper data structure sent:
  - Grade information
  - Curriculum profile
  - Marks data
  - Enjoyed subjects
  - Interests
  - Constraints
  - Open questions
- [ ] Loading state persists during processing
- [ ] No console errors during submission

### Results Navigation
- [ ] Successful response → Redirects to `/results`
- [ ] Results page loads with career recommendations
- [ ] Data saved to localStorage as 'thandi_results'
- [ ] Error handling for failed requests

---

## ✅ **PROGRESS BAR CONSISTENCY**

### Visual Design
- [ ] Progress bar visible on all steps
- [ ] 6 steps total: Profile, Marks, Subjects, Interests, Constraints, Questions
- [ ] Current step highlighted in teal
- [ ] Completed steps show in gold
- [ ] Step labels are clear and consistent

### Functionality
- [ ] Progress updates correctly on each step
- [ ] Step numbers (1-6) match actual steps
- [ ] Visual progress bar fills proportionally
- [ ] Consistent across all steps

---

## ✅ **DATA PERSISTENCE & NAVIGATION**

### Local Storage
- [ ] Data saves after each step completion
- [ ] Refresh page → Data restored correctly
- [ ] localStorage key: 'thandi_assessment_data'
- [ ] Data structure includes formData and currentStep

### Navigation
- [ ] "Previous" button works on Steps 2-6
- [ ] "Next" button advances correctly
- [ ] "Start Over" button clears data and restarts
- [ ] Browser back/forward buttons handled gracefully

### Mobile Responsiveness
- [ ] All steps work on mobile devices
- [ ] Touch events function properly
- [ ] Responsive design maintains usability
- [ ] No horizontal scrolling issues

---

## ✅ **GRADE-SPECIFIC LOGIC**

### Grade 10 Flow
- [ ] Complete 6 steps → Shows preliminary report
- [ ] Preliminary report offers DeepDive option
- [ ] "Skip DeepDive" → Goes to results
- [ ] "Take DeepDive" → Shows extended questions

### Grade 11-12 Flow  
- [ ] Complete 6 steps → Goes directly to results
- [ ] No preliminary report shown
- [ ] No DeepDive option offered

---

## 🎯 **CRITICAL SUCCESS CRITERIA**

### Must Pass All:
1. ✅ Complete journey from Grade Selection → Results
2. ✅ All form data captured and sent to backend
3. ✅ Professional visual design throughout
4. ✅ No console errors or broken functionality
5. ✅ Mobile responsive and touch-friendly
6. ✅ Data persistence works correctly
7. ✅ Backend integration successful
8. ✅ Results page loads with recommendations

---

## 📊 **TESTING RESULTS**

**Date:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**Device:** ___________  

**Overall Status:** 
- [ ] ✅ PASS - All functionality working correctly
- [ ] ⚠️ PARTIAL - Some issues found (list below)
- [ ] ❌ FAIL - Critical issues prevent completion

**Issues Found:**
1. ________________________________
2. ________________________________
3. ________________________________

**Notes:**
_________________________________
_________________________________
_________________________________

---

## 🚀 **NEXT STEPS**

If all tests pass:
- [ ] Assessment form is ready for production
- [ ] UX matches professional standards
- [ ] Backend integration confirmed working

If issues found:
- [ ] Document specific problems
- [ ] Prioritize critical vs. minor issues  
- [ ] Fix and retest failed components