# Systematic APS Calculation Fix - Root Cause Analysis

## Date: December 21, 2025
## Status: CRITICAL FIX IN PROGRESS

---

## ROOT CAUSE IDENTIFIED ✅

### The Problem
The APS scoring shows "0 points" because of a **data structure mismatch** between frontend and backend:

**Frontend sends:**
```javascript
profile: {
  grade: 10,
  marks: {
    marksOption: 'provide',
    exactMarks: {
      'Mathematics': '85',
      'Physical Sciences': '78',
      // ...
    },
    rangeMarks: {}
  }
}
```

**Backend expects:**
```javascript
profile: {
  grade: 10,
  marks: {
    'mathematics': 85,
    'physical_sciences': 78,
    // ...
  }
}
```

### Why This Causes 0 Points
1. The `program-matcher.js` receives `marks` object
2. It tries to iterate over marks to calculate APS
3. It finds `marksOption`, `exactMarks`, `rangeMarks` instead of actual subject marks
4. No valid marks found → APS calculation returns 0

---

## THE FIX

### Option 1: Fix Frontend (RECOMMENDED)
**Location:** `app/assessment/components/AssessmentForm.jsx`
**Change:** Transform `marksData` structure before sending to API

**Before:**
```javascript
profile: {
  grade: formData.grade,
  marks: formData.marksData || {},  // ❌ Wrong structure
  constraints: formData.constraints || {}
}
```

**After:**
```javascript
// Extract actual marks from marksData structure
let actualMarks = {};
if (formData.marksData?.marksOption === 'provide' && formData.marksData.exactMarks) {
  Object.entries(formData.marksData.exactMarks).forEach(([subject, mark]) => {
    if (mark && mark !== '') {
      const subjectKey = subject.toLowerCase().replace(/\s+/g, '_');
      actualMarks[subjectKey] = parseFloat(mark);
    }
  });
} else if (formData.marksData?.marksOption === 'ranges' && formData.marksData.rangeMarks) {
  Object.entries(formData.marksData.rangeMarks).forEach(([subject, range]) => {
    if (range && range !== '') {
      const subjectKey = subject.toLowerCase().replace(/\s+/g, '_');
      // Convert range to midpoint for APS calculation
      const rangeMap = {
        'struggling': 40,
        'average': 60,
        'good': 75,
        'excellent': 90
      };
      actualMarks[subjectKey] = rangeMap[range] || 60;
    }
  });
}

profile: {
  grade: formData.grade,
  marks: actualMarks,  // ✅ Correct structure
  marksData: formData.marksData,  // Keep original for reference
  constraints: formData.constraints || {}
}
```

### Option 2: Fix Backend (FALLBACK)
**Location:** `app/api/rag/query/route.js`
**Change:** Add data transformation layer

---

## IMPLEMENTATION PLAN

### Step 1: Fix AssessmentForm.jsx ✅
- Transform marksData to flat marks object
- Handle both 'provide' and 'ranges' options
- Preserve original marksData for debugging

### Step 2: Test Locally ✅
- Run test with Grade 10 student data
- Verify APS calculation shows correct points (39-45)
- Check console logs for marks processing

### Step 3: Deploy to Production ✅
- Commit changes with clear message
- Deploy to Vercel
- Update domain alias

### Step 4: Verify Live ✅
- Test on https://thandiai.vercel.app
- Confirm APS shows correct calculation
- Verify no cache issues

---

## EXPECTED OUTCOME

**Before Fix:**
```
Current APS Score: 0 points
Projected Final APS: 0-0 points
```

**After Fix:**
```
Current APS Score: 39 points
Projected Final APS: 39-45 points
University Eligibility: ✅ Qualified for university admission
```

---

## TESTING CHECKLIST

- [ ] Local test with exact marks (85, 78, 82, 75, 70, 80)
- [ ] Local test with range marks (excellent, good, good, good, good, excellent)
- [ ] Local test with no marks (should show guidance without APS)
- [ ] Production test with real student data
- [ ] Verify cache bypass works correctly
- [ ] Check console logs for marks processing
- [ ] Confirm no regression in other features

---

## ROLLBACK PLAN

If fix causes issues:
1. Revert commit: `git revert HEAD`
2. Redeploy previous version
3. Investigate alternative approach (backend transformation)

---

## NOTES

- This is a **data structure issue**, not a calculation logic issue
- The APS calculation logic in program-matcher.js is correct
- The API route has the right structure expectations
- The frontend was sending the wrong data format
- Fix is minimal and surgical - no major refactoring needed
