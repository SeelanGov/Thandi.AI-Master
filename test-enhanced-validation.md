# Enhanced Validation Testing Plan

## Test Scenarios

### Test 1: No Subjects Selected
1. Go to http://localhost:3000/assessment
2. Select Grade 11
3. In Step 1, select CAPS but DON'T select any subjects
4. Click "Next"
5. **Expected**: Alert: "Please select your subjects from your curriculum before continuing."
6. **Expected**: Red warning box visible: "Please select all your subjects - this is essential for accurate career guidance"

### Test 2: Too Few Subjects (1-5 subjects)
1. In Step 1, select only 3 subjects: Mathematics, English Home Language, Physical Sciences
2. Click "Next"
3. **Expected**: Alert: "Please select all your subjects (you've selected 3). Thandi needs your complete subject list to give accurate career recommendations."
4. **Expected**: Yellow warning box: "You've selected 3 subjects. Most students take 6-7 subjects. Please add any missing subjects."
5. **Expected**: Progress indicator: "3 of 6-7 subjects selected (3 more needed)"

### Test 3: Missing Language Requirement
1. Select 6 subjects but NO language: Mathematics, Physical Sciences, Life Sciences, Accounting, Geography, Life Orientation
2. Click "Next"
3. **Expected**: Alert: "Please select at least one language subject (English, Afrikaans, etc.) - this is required for all South African students."

### Test 4: Missing Math Requirement
1. Select 6 subjects but NO math: English Home Language, Physical Sciences, Life Sciences, Accounting, Geography, Life Orientation
2. Click "Next"
3. **Expected**: Alert: "Please select either Mathematics or Mathematical Literacy - this is required for all South African students."

### Test 5: Complete Valid Selection (Success Case)
1. Select 7 subjects including required ones:
   - English Home Language ✓ (language requirement)
   - Mathematics ✓ (math requirement)
   - Physical Sciences
   - Life Sciences
   - Geography
   - Accounting
   - Life Orientation
2. **Expected**: Green success box: "Great! You've selected 7 subjects. This gives Thandi enough information for accurate recommendations."
3. **Expected**: Progress indicator: "7 of 6-7 subjects selected ✅"
4. Click "Next"
5. **Expected**: Successfully proceeds to Step 2 (MarksCollection)

### Test 6: Step 3 Filtering Works
1. After completing Test 5, proceed through Step 2 (skip marks)
2. In Step 3, check the subject grid
3. **Expected**: Only shows the 7 subjects selected in Step 1 (or their variations)
4. **Expected**: Blue info box shows: "📚 Showing subjects from your curriculum: English Home Language, Mathematics, Physical Sciences, Life Sciences, Geography, Accounting, Life Orientation"
5. **Expected**: Filter status shows: "🔍 Filtered to X of 25 subjects"

## Visual Elements to Verify

### Step 1 Visual Feedback:
- [ ] Subject guide showing typical combinations (Science, Commerce, Humanities)
- [ ] Dynamic warning boxes (red → yellow → green)
- [ ] Progress indicator showing "X of 6-7 subjects selected"
- [ ] Subject cards with checkmarks when selected

### Step 3 Filtering:
- [ ] Blue info box with correct subjects from Step 1
- [ ] Filter status indicator
- [ ] Only filtered subjects in grid (not all 25+ subjects)
- [ ] Console logs showing filtering is active

## Success Criteria
✅ Cannot proceed without 6+ subjects
✅ Language requirement enforced
✅ Math requirement enforced  
✅ Visual feedback guides users properly
✅ Step 3 filtering works correctly
✅ Complete subject list ensures accurate LLM analysis