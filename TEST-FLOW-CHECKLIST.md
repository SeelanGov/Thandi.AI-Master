# 🧪 FLOW TEST CHECKLIST

## Before Deploy - Manual Testing Required

### ✅ Desktop Browser Test:
1. Go to `/assessment`
2. **Grade Selection Screen**
   - [ ] See 3 grade buttons (10, 11, 12)
   - [ ] Click Grade 10 → advances to Q1 (Subject Selection)
   - [ ] See "Grade 10" badge in header
3. **Core Questions (Q1-Q4)**
   - [ ] Q1: Select subjects → Next button works
   - [ ] Q2: Select interests → Next button works
   - [ ] Q3: Fill constraints → Next button works
   - [ ] Q4: Fill open questions → "Continue" button works
4. **Preliminary Report (Grade 10 only)**
   - [ ] See 3 career matches with bursaries
   - [ ] See "Build My Plan" CTA with R50k+ value
   - [ ] Click "Build My Plan" → goes to Deep Dive
   - [ ] OR click "Skip for Now" → goes to Results
5. **Deep Dive Questions**
   - [ ] See Q5 (marks & support)
   - [ ] Fill out form → "Get My 3-Year Plan" button works
6. **Results Page**
   - [ ] See career recommendations
   - [ ] See verification footer (⚠️)
   - [ ] "Start New Assessment" button works

### ✅ Mobile Browser Test (CRITICAL):
1. Open on phone: `https://thandiai-[...].vercel.app/assessment`
2. **Grade Selection**
   - [ ] Buttons are large enough to tap
   - [ ] Tap Grade 10 → advances (no double-tap needed)
   - [ ] No weird zoom behavior
3. **Core Questions**
   - [ ] All form inputs work on mobile
   - [ ] Keyboard doesn't break layout
   - [ ] Next/Previous buttons work
4. **Preliminary Report**
   - [ ] Scrolls smoothly
   - [ ] "Build My Plan" button taps correctly
   - [ ] "Skip" button taps correctly
5. **Deep Dive**
   - [ ] Dropdowns work on mobile
   - [ ] Checkboxes tap correctly
   - [ ] Submit button works

### 🐛 Known Issues to Watch For:
- **Mobile tap not working**: Added `onTouchEnd` handlers
- **Double-tap required**: Added `touch-action: manipulation`
- **Buttons not responding**: Check console for errors
- **Flow stuck**: Clear localStorage and retry

### 🔧 Quick Fixes if Broken:
```javascript
// If grade selector doesn't work:
localStorage.clear();
location.reload();

// If stuck on any screen:
localStorage.removeItem('thandi_assessment_data');
location.href = '/assessment';
```

### 📱 Test on These Devices:
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (if available)

### ⚠️ BLOCKER ISSUES (Don't deploy if these fail):
1. Grade selector buttons don't work on mobile
2. Assessment doesn't advance after grade selection
3. Results page shows error or blank screen
4. Any component crashes with console errors

### ✅ SHIP CRITERIA:
- All desktop tests pass
- Mobile grade selection works
- Complete flow works end-to-end
- No console errors
- Results page displays properly
