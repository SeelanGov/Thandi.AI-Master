# Manual localStorage Persistence Test

## Quick Test (2 minutes)

### Steps:

1. **Open Assessment Form**
   - Open Chrome
   - Go to `http://localhost:3000/assessment`
   - Make sure Next.js dev server is running: `npm run dev`

2. **Complete Screen 1**
   - Select at least 2 subjects (e.g., Mathematics, Life Sciences)
   - Click "Next →" button
   - You should see "Step 2 of 4" (Interests section)

3. **Check localStorage (Before Close)**
   - Right-click → **Inspect** (or press F12)
   - Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Expand **Local Storage** → `http://localhost:3000`
   - You should see:
     ```
     thandi_assessment_data: {"formData":{"subjects":["mathematics","life_sciences"],...},"currentStep":2,"savedAt":"2025-11-19T..."}
     ```
   - **Note:** Data is stored as JSON in a single key, not separate keys

4. **Close Browser Completely**
   - **Windows:** Alt+F4 (closes entire browser)
   - **Mac:** Cmd+Q (quits Chrome completely)
   - **Don't just close the tab** - close the entire browser window

5. **Reopen and Verify**
   - Open Chrome again
   - Go to `http://localhost:3000/assessment`
   - **Expected Result:** 
     - You should land on Step 2 (Interests) automatically
     - Your selected subjects should still be saved
     - Check Application → Local Storage again
     - `thandi_assessment_data` should still be there with the same values

### Pass Criteria:
- ✅ `thandi_assessment_data` key exists in localStorage
- ✅ `currentStep` is `2` (not reset to `1`)
- ✅ `formData.subjects` contains your selected subjects
- ✅ Assessment resumes at Step 2 after browser reopen

### If Test Fails:
- Check browser console for errors (F12 → Console tab)
- Verify Next.js server is still running
- Try clearing localStorage and starting fresh:
  ```javascript
  // Run in browser console:
  localStorage.clear();
  location.reload();
  ```

### Additional Test: Mobile Device
If testing on mobile phone:
1. Access `http://192.168.0.233:3000/assessment`
2. Complete step 1, select subjects, click Next
3. Force close the browser app (swipe away from recent apps)
4. Reopen browser, go to same URL
5. Should resume at step 2

---

**Status:** Manual test is sufficient. No automated test needed.







