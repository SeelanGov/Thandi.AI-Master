# Browser Testing Instructions

## Test the Subject Filtering Issue

1. **Open browser and go to**: http://localhost:3000/assessment

2. **Clear any saved data** (run in browser console):
   ```javascript
   localStorage.removeItem('thandi_assessment_data');
   localStorage.removeItem('thandi_results');
   location.reload();
   ```

3. **Go through the assessment flow**:
   - **Step 0**: Select Grade 11
   - **Step 1**: 
     - Select "CAPS (Government schools)"
     - Select these subjects: Mathematics, Physical Sciences, English Home Language, Life Sciences, Computer Applications Technology (CAT)
     - Click "Next"
   - **Step 2**: Skip marks (click "Next")
   - **Step 3**: Check if only the 5 subjects from Step 1 are shown

4. **Check browser console** for debug output:
   - Look for "🔍 SubjectSelection Props Debug:"
   - Look for "🔍 SubjectSelection Debug:"
   - Look for "Debug - Step 3 Data:"

5. **Expected behavior**:
   - Blue info box should say: "📚 Showing subjects from your curriculum: Mathematics, Physical Sciences, English Home Language, Life Sciences, Computer Applications Technology (CAT)"
   - Filter status should say: "🔍 Filtered to 5 of 25 subjects" (or similar)
   - Subject grid should only show 5 subjects, not all 25

6. **If it's still showing all subjects**:
   - Check console for any errors
   - Check if curriculumProfile is null/undefined
   - Check if availableSubjects array is empty

## What to look for:

✅ **Working correctly**: Only 5 subjects show in grid
❌ **Still broken**: All 25+ subjects show in grid despite blue info box being correct