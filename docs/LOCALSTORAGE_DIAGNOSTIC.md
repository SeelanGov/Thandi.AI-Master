# localStorage Persistence Diagnostic

## Issue: Data Not Persisting After Browser Close

### What You Should See

**Before Closing Browser:**
1. Complete Step 1 (select subjects)
2. Click Next → You're on Step 2
3. Open DevTools (F12) → Application → Local Storage
4. You should see:
   ```
   Key: thandi_assessment_data
   Value: {"formData":{"subjects":["mathematics","life_sciences"],...},"currentStep":2,"savedAt":"2025-11-20T..."}
   ```

**After Reopening Browser:**
1. Open Chrome again
2. Go to `http://localhost:3000/assessment`
3. Should automatically be on Step 2 (not Step 1)
4. Check localStorage again - same key/value should exist

### If It's NOT Working

#### Check 1: Is Data Being Saved?
**In Browser Console (F12 → Console):**
```javascript
// Check if data exists
localStorage.getItem('thandi_assessment_data')

// Should return JSON string, not null
```

**If null:** Data isn't being saved. Check:
- Browser console for errors
- Look for: "Failed to load saved assessment"

#### Check 2: Is Data Persisting Across Tabs?
1. Open `localhost:3000/assessment` in Tab 1
2. Complete Step 1, click Next (now on Step 2)
3. Open new tab (Tab 2), go to same URL
4. **Expected:** Should also be on Step 2
5. **If not:** localStorage isn't working at all (browser issue)

#### Check 3: Is Browser Closing Properly?
**Windows:**
- Press Alt+F4 while Chrome is active (not just closing tab)
- Or: Right-click Chrome in taskbar → Close window
- Or: Task Manager → End Task on Chrome

**Mac:**
- Press Cmd+Q (quits entire Chrome)
- Or: Chrome menu → Quit Chrome

**Don't use:**
- ❌ Just closing tabs (X button)
- ❌ Closing window but Chrome still running in background

#### Check 4: Browser Settings Blocking localStorage?
**Chrome:**
1. Settings → Privacy and security → Site settings
2. Cookies and site data
3. Make sure "Allow all cookies" or at least "Block third-party cookies only"

**If in Incognito:**
- Incognito mode **clears localStorage on close** by design
- Use regular Chrome window, not Incognito

### Diagnostic Commands (Run in Browser Console)

```javascript
// 1. Check if localStorage is available
console.log('localStorage available:', typeof Storage !== 'undefined');

// 2. Check current data
const saved = localStorage.getItem('thandi_assessment_data');
console.log('Current saved data:', saved);

// 3. Check step number in saved data
if (saved) {
  const parsed = JSON.parse(saved);
  console.log('Current step:', parsed.currentStep);
  console.log('Subjects:', parsed.formData?.subjects);
}

// 4. Manually set test data
localStorage.setItem('test_key', 'test_value');
console.log('Test value:', localStorage.getItem('test_key'));

// 5. Clear and reload (if testing)
// localStorage.clear();
// location.reload();
```

### Common Issues

#### Issue 1: localStorage Cleared by Browser
**Symptom:** Data exists before close, gone after reopen
**Cause:** Browser settings clearing localStorage on close
**Fix:** Check browser privacy settings (see Check 4 above)

#### Issue 2: Code Not Loading Data on Mount
**Symptom:** Data exists in localStorage but form resets to Step 1
**Cause:** useEffect loading logic not running or failing
**Fix:** Check browser console for errors, verify useEffect runs

#### Issue 3: Using Incognito Mode
**Symptom:** Data never persists
**Cause:** Incognito clears localStorage on close by design
**Fix:** Use regular Chrome window, not Incognito

### Testing Step-by-Step

1. **Open Chrome (regular, not Incognito)**
2. **Go to** `http://localhost:3000/assessment`
3. **Open DevTools** (F12) → Application tab → Local Storage
4. **Clear localStorage** (right-click → Clear, or run `localStorage.clear()` in console)
5. **Select 2 subjects** (e.g., Mathematics, Life Sciences)
6. **Check localStorage** - should see `thandi_assessment_data` appear
7. **Click Next** → You're on Step 2
8. **Check localStorage** - `currentStep` should be `2`
9. **Note the exact value** of `thandi_assessment_data` (copy it)
10. **Close Chrome completely** (Alt+F4 / Cmd+Q)
11. **Reopen Chrome**
12. **Go to** `http://localhost:3000/assessment`
13. **Check localStorage immediately** - is `thandi_assessment_data` still there?
14. **Check the page** - are you on Step 1 or Step 2?

### Expected Results

- ✅ localStorage key still exists after reopen
- ✅ `currentStep` is `2` (not `1`)
- ✅ Page automatically shows Step 2 (Interests)
- ✅ Selected subjects are still saved

### Report Back

Please share:
1. Does `thandi_assessment_data` exist in localStorage after reopening?
2. What is the value of `currentStep` in that data?
3. Does the page automatically show Step 2, or does it reset to Step 1?
4. Any console errors when the page loads?



