# MANUAL REGISTRATION FLOW TEST GUIDE
**Date**: January 14, 2026  
**Purpose**: Test registration flow changes locally before deployment  
**Dev Server**: http://localhost:3000 (RUNNING)

## 🎯 OBJECTIVE
Verify that the enhanced school selection validation and visual feedback work correctly.

## 📋 TEST SCENARIOS

### SCENARIO 1: User Types School But Doesn't Click (SHOULD FAIL)
**This is the suspected root cause of the issue**

1. **Navigate**: Go to http://localhost:3000/assessment
2. **Accept Consent**: 
   - Check the consent checkbox
   - Click "Continue with Registration"
3. **Fill Name Fields**:
   - First Name: "Test"
   - Last Name: "Student"
4. **Type School Name** (but DON'T click):
   - Type "High School" in the school search box
   - Wait for dropdown to appear
   - **DO NOT CLICK** on any school in the dropdown
5. **Select Grade**: Choose "Grade 10"
6. **Try to Submit**:
   - Look at the submit button - what does it say?
   - Is it disabled?
   - Are there any error messages visible?
   - Try clicking the submit button
   - What happens?

**EXPECTED BEHAVIOR**:
- ❌ Submit button should show "⚠️ Select School First"
- ❌ Submit button should be disabled OR show alert when clicked
- ⚠️ Red border should appear on school input
- ⚠️ Error message should be visible explaining user must CLICK on school
- ⚠️ Yellow warning box should appear at bottom

**ACTUAL BEHAVIOR** (fill in after testing):
- Submit button text: _______________
- Submit button disabled: _______________
- Red border visible: _______________
- Error message visible: _______________
- Warning box visible: _______________
- What happened when you clicked submit: _______________

---

### SCENARIO 2: User Clicks on School (SHOULD WORK)
**This is the correct flow**

1. **Navigate**: Go to http://localhost:3000/assessment
2. **Accept Consent**: 
   - Check the consent checkbox
   - Click "Continue with Registration"
3. **Fill Name Fields**:
   - First Name: "Test"
   - Last Name: "Student"
4. **Search and SELECT School**:
   - Type "High School" in the school search box
   - Wait for dropdown to appear
   - **CLICK** on a school from the dropdown
5. **Verify School Selected**:
   - Green success box should appear
   - School name should be displayed
   - "✓ School selected" message should show
6. **Select Grade**: Choose "Grade 10"
7. **Submit**:
   - Look at the submit button - what does it say?
   - Is it enabled?
   - Click the submit button
   - What happens?

**EXPECTED BEHAVIOR**:
- ✅ Green success box appears after clicking school
- ✅ Submit button shows "Start Assessment"
- ✅ Submit button is enabled
- ✅ Clicking submit triggers registration
- ✅ Console logs show registration process
- ✅ Page redirects to assessment questions

**ACTUAL BEHAVIOR** (fill in after testing):
- Green success box appeared: _______________
- Submit button text: _______________
- Submit button enabled: _______________
- Console logs visible: _______________
- Registration succeeded: _______________
- Redirected to: _______________

---

### SCENARIO 3: Mobile View Test
**Test on mobile viewport**

1. **Open DevTools**: Press F12
2. **Toggle Device Toolbar**: Click the phone icon or press Ctrl+Shift+M
3. **Select Device**: Choose "iPhone 12 Pro" or similar
4. **Repeat Scenario 1 and 2**

**ADDITIONAL CHECKS**:
- Is the dropdown visible on mobile?
- Are the touch targets large enough?
- Is the error message readable?
- Does the keyboard cover important UI elements?

---

## 🔍 WHAT TO LOOK FOR

### Visual Feedback Checklist
When school is NOT selected:
- [ ] Red border on school input field
- [ ] Red error message box with "⚠️ School Not Selected"
- [ ] Yellow warning box at bottom of form
- [ ] Submit button shows "⚠️ Select School First"
- [ ] Submit button is disabled or shows alert

When school IS selected:
- [ ] Green success box appears
- [ ] School name is displayed
- [ ] "✓ School selected" message shows
- [ ] Submit button shows "Start Assessment"
- [ ] Submit button is enabled

### Console Logging Checklist
Open browser console (F12) and look for:
- [ ] "🚀 Registration attempt started" when clicking submit
- [ ] "❌ School validation failed" if no school selected
- [ ] "✅ School validation passed" if school selected
- [ ] "🎯 School selected: [school name]" when clicking school
- [ ] "📡 Sending registration request to API..." when submitting
- [ ] "✅ Registration successful" on success

---

## 📊 DECISION MATRIX

### IF SCENARIO 1 WORKS (Shows Errors):
✅ **GOOD**: Visual feedback is working  
✅ **GOOD**: Validation is working  
➡️ **NEXT**: Test Scenario 2 to confirm full flow works

### IF SCENARIO 1 DOESN'T WORK (No Errors):
❌ **PROBLEM**: Visual feedback not working  
❌ **PROBLEM**: Users won't know why they can't submit  
➡️ **ACTION**: Fix visual feedback before deploying

### IF SCENARIO 2 WORKS (Registration Succeeds):
✅ **GOOD**: Full flow works when school is selected  
✅ **GOOD**: API integration works  
➡️ **NEXT**: Ready to deploy if Scenario 1 also works

### IF SCENARIO 2 DOESN'T WORK (Registration Fails):
❌ **PROBLEM**: API or navigation issue  
❌ **PROBLEM**: Even correct flow doesn't work  
➡️ **ACTION**: Debug API or navigation before deploying

---

## 🚀 DEPLOYMENT DECISION

### DEPLOY IF:
- ✅ Scenario 1 shows clear error messages
- ✅ Scenario 2 completes registration successfully
- ✅ Console logging works correctly
- ✅ Mobile view works properly

### DO NOT DEPLOY IF:
- ❌ Scenario 1 doesn't show errors (users won't know what's wrong)
- ❌ Scenario 2 fails (even correct flow doesn't work)
- ❌ Console logging doesn't work (can't debug production issues)
- ❌ Mobile view is broken (most users are on mobile)

---

## 📝 TESTING NOTES

**Tester**: _______________  
**Date**: _______________  
**Time**: _______________  

**Scenario 1 Result**: _______________  
**Scenario 2 Result**: _______________  
**Mobile Test Result**: _______________  

**Issues Found**:
1. _______________
2. _______________
3. _______________

**Ready to Deploy?**: YES / NO  

**Reason**:
_______________
_______________
_______________

---

## 🎯 NEXT STEPS AFTER TESTING

### IF TESTS PASS:
1. Create backup branch
2. Commit changes with clear message
3. Deploy to Vercel with `vercel --prod --force`
4. Monitor Vercel logs for actual user behavior
5. Check production site immediately after deployment

### IF TESTS FAIL:
1. Document what didn't work
2. Fix the issues
3. Test again locally
4. Only deploy when all tests pass

---

**REMEMBER**: No false positives! Only report success if you actually see it working with your own eyes.
