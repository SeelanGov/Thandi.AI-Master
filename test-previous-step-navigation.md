# 🔄 PREVIOUS STEP NAVIGATION - COMPREHENSIVE TEST

## 🎯 **TESTING OBJECTIVE**
Verify that students can navigate backwards through the assessment to change their information, and that all data is preserved correctly.

---

## 🧪 **DETAILED TESTING SCENARIOS**

### Test 1: Basic Previous Button Functionality

**Setup:**
1. Navigate to http://localhost:3000/assessment
2. Select Grade 10
3. Complete Step 1 (select 7 subjects)
4. Complete Step 2 (enter marks or select option)
5. Complete Step 3 (select enjoyed subjects)
6. Now you're on Step 4

**Test Previous Navigation:**
1. **From Step 4 → Step 3:**
   - ✅ Click "Previous" button
   - ✅ Should scroll to top smoothly
   - ✅ Should show Step 3 (Subject Selection)
   - ✅ Previously selected enjoyed subjects should still be selected
   - ✅ Progress bar should show Step 3 as active

2. **From Step 3 → Step 2:**
   - ✅ Click "Previous" button
   - ✅ Should show Step 2 (Marks Collection)
   - ✅ Previously selected marks option should be preserved
   - ✅ If exact marks were entered, they should still be there

3. **From Step 2 → Step 1:**
   - ✅ Click "Previous" button
   - ✅ Should show Step 1 (Curriculum Profile)
   - ✅ Previously selected subjects should still be selected
   - ✅ Framework selection (CAPS/IEB) should be preserved

4. **From Step 1:**
   - ✅ "Previous" button should NOT be visible (can't go back to grade selection)

---

### Test 2: Data Modification and Forward Navigation

**Scenario: Change Subject Selection**
1. **Get to Step 3** (enjoyed subjects)
2. **Go back to Step 1** using Previous button
3. **Modify subject selection:**
   - Deselect 2 subjects
   - Add 2 different subjects
   - Keep total at 7 subjects
4. **Navigate forward:** Step 1 → 2 → 3
5. **✅ Expected Results:**
   - Step 2 should show updated subject list from Step 1
   - Step 3 should show updated subject options
   - Previously selected enjoyed subjects that are no longer in curriculum should be cleared
   - New subjects should be available for selection

**Scenario: Change Framework (CAPS ↔ IEB)**
1. **Complete Steps 1-3** with CAPS framework
2. **Go back to Step 1**
3. **Switch to IEB framework**
4. **Select 7 IEB subjects** (including French or Sports Science)
5. **Navigate forward** through Steps 2-3
6. **✅ Expected Results:**
   - Step 2 shows IEB subjects only
   - Step 3 shows IEB subjects only
   - All previous CAPS-specific selections are cleared
   - Backend should receive "ieb" curriculum

---

### Test 3: Marks Data Persistence

**Scenario: Modify Marks Information**
1. **Complete Step 1** (select subjects)
2. **Complete Step 2:** Select "I know my marks" and enter specific marks
3. **Navigate to Step 4**
4. **Go back to Step 2**
5. **✅ Verify:** All entered marks should still be there
6. **Change marks option** to "Approximate performance"
7. **Select performance levels** for subjects
8. **Navigate forward to Step 4**
9. **Go back to Step 2 again**
10. **✅ Verify:** Performance levels should be preserved

---

### Test 4: Multi-Step Backward Navigation

**Scenario: Jump Multiple Steps Back**
1. **Complete all 6 steps** (reach final step)
2. **Navigate backwards:** Step 6 → 5 → 4 → 3 → 2 → 1
3. **✅ At each step verify:**
   - Data is preserved exactly as entered
   - UI shows correct selections/inputs
   - Progress bar updates correctly
   - Scroll position is at top

**Scenario: Modify Early Step, Navigate Forward**
1. **From Step 1** (after going back from Step 6)
2. **Change framework** from CAPS to IEB
3. **Select completely different subjects**
4. **Navigate forward:** Step 1 → 2 → 3 → 4 → 5 → 6
5. **✅ Verify at each step:**
   - Data reflects the new framework choice
   - Subject lists are updated throughout
   - No old CAPS data persists
   - All validations work with new data

---

### Test 5: Local Storage Persistence

**Scenario: Browser Refresh During Navigation**
1. **Complete Steps 1-4**
2. **Go back to Step 2**
3. **Modify some marks data**
4. **Refresh the browser** (F5 or Ctrl+R)
5. **✅ Expected Results:**
   - Should return to Step 2 (where you were)
   - Modified marks data should be preserved
   - Can continue navigating forward/backward
   - All data integrity maintained

**Scenario: Close and Reopen Browser**
1. **Complete Steps 1-3**
2. **Go back to Step 1**
3. **Close browser tab/window**
4. **Reopen:** http://localhost:3000/assessment
5. **✅ Expected Results:**
   - Should resume at Step 1
   - All data should be preserved
   - Can navigate forward to see previously entered data

---

### Test 6: Validation During Backward Navigation

**Scenario: Invalid Data After Going Back**
1. **Complete Steps 1-3** with valid data
2. **Go back to Step 1**
3. **Remove subjects** until only 4 are selected (below minimum)
4. **Try to click "Next"**
5. **✅ Expected:** Should show validation error, prevent advancement
6. **Add subjects** back to 7
7. **✅ Expected:** Should allow advancement to Step 2

**Scenario: Required Subject Validation**
1. **Complete Steps 1-2** with Mathematics selected
2. **Go back to Step 1**
3. **Remove Mathematics** and Mathematical Literacy
4. **Try to click "Next"**
5. **✅ Expected:** Should show error about missing math requirement
6. **Add Mathematics back**
7. **✅ Expected:** Should allow advancement

---

### Test 7: Progress Bar Consistency

**Visual Progress Tracking:**
1. **Complete all 6 steps** (progress bar should show all completed)
2. **Navigate backwards:** 6 → 5 → 4 → 3 → 2 → 1
3. **✅ At each step verify:**
   - Current step is highlighted (active)
   - Previous steps show as completed
   - Future steps show as inactive
   - Visual consistency maintained

**Progress Bar Interaction:**
1. **Complete Steps 1-4**
2. **Go back to Step 2**
3. **✅ Progress bar should show:**
   - Steps 1-2: Completed/Active
   - Steps 3-4: Should they show as completed or reset?
   - Steps 5-6: Inactive

---

### Test 8: Edge Cases and Error Handling

**Scenario: Rapid Navigation**
1. **Complete Steps 1-3**
2. **Rapidly click:** Previous → Previous → Next → Previous → Next
3. **✅ Expected:** Should handle rapid clicks gracefully, no errors

**Scenario: Navigation During Loading**
1. **Complete all steps** and submit (trigger loading)
2. **Try to click Previous** during loading overlay
3. **✅ Expected:** Previous button should be disabled/hidden during submission

**Scenario: Invalid State Recovery**
1. **Manually corrupt localStorage** data (developer tools)
2. **Try to navigate backwards**
3. **✅ Expected:** Should handle gracefully, possibly reset to safe state

---

## 🎯 **CRITICAL SUCCESS CRITERIA**

### Data Integrity:
- [ ] All form data preserved when going back
- [ ] Modified data properly saved when changed
- [ ] No data loss during navigation
- [ ] Framework changes properly cascade through all steps

### User Experience:
- [ ] Previous button visible on Steps 2-6 only
- [ ] Smooth scroll to top on every navigation
- [ ] Progress bar accurately reflects current position
- [ ] No broken states or UI glitches

### Validation Consistency:
- [ ] All validation rules apply after going back
- [ ] Can't advance with invalid data
- [ ] Error messages clear and helpful
- [ ] Validation state resets appropriately

### Performance:
- [ ] Navigation is fast and responsive
- [ ] No memory leaks from repeated navigation
- [ ] Local storage updates efficiently
- [ ] No console errors during navigation

---

## 🔍 **DEBUGGING CHECKLIST**

### If Previous Button Doesn't Work:
1. **Check console** for JavaScript errors
2. **Verify** `prevStep()` function is called
3. **Check** `currentStep > 1` condition
4. **Verify** scroll-to-top is working

### If Data Isn't Preserved:
1. **Check localStorage** in browser DevTools
2. **Verify** `useEffect` for data saving is working
3. **Check** component state updates
4. **Verify** form data structure integrity

### If Validation Fails:
1. **Check** validation logic in `nextStep()`
2. **Verify** data format matches expected structure
3. **Check** subject name matching between steps
4. **Verify** framework-specific validation

---

## 📊 **EXPECTED BEHAVIOR SUMMARY**

| Navigation | From Step | To Step | Previous Button | Data Preservation | Validation |
|------------|-----------|---------|----------------|-------------------|------------|
| **Backward** | 2-6 | 1-5 | ✅ Visible | ✅ Preserved | ✅ Applied |
| **Forward** | 1-5 | 2-6 | ✅ Visible | ✅ Updated | ✅ Applied |
| **Step 1** | 1 | - | ❌ Hidden | ✅ Preserved | ✅ Applied |
| **Modification** | Any | Any | ✅ Available | ✅ Updated | ✅ Re-validated |

---

## ✅ **FINAL VERIFICATION CHECKLIST**

### Complete User Journey:
- [ ] Can navigate backward from any step 2-6
- [ ] Can modify data at any previous step
- [ ] Can navigate forward after modifications
- [ ] All data changes are preserved
- [ ] Validation works consistently
- [ ] Progress bar updates correctly
- [ ] Scroll-to-top works on all navigation
- [ ] No console errors throughout journey
- [ ] Local storage maintains data integrity
- [ ] Browser refresh preserves state

**🎉 If all tests pass:** The Previous step navigation is working perfectly and students can freely modify their information!