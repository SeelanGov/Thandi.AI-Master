# QUICK TEST CHECKLIST
**Dev Server**: http://localhost:3000 ✅ RUNNING

## 🎯 SCENARIO 1: Type Without Clicking (Should Fail)

### Steps
1. [ ] Go to http://localhost:3000/assessment
2. [ ] Check consent checkbox
3. [ ] Click "Continue with Registration"
4. [ ] Enter name: "Test" and "Student"
5. [ ] Type "High School" in school search
6. [ ] **DO NOT CLICK** on any school
7. [ ] Select "Grade 10"
8. [ ] Look at submit button

### What to Check
- [ ] Submit button says "⚠️ Select School First"
- [ ] Submit button is disabled OR shows alert
- [ ] Red border on school input
- [ ] Red error message visible
- [ ] Yellow warning box at bottom

### Result
**PASS** ✅ / **FAIL** ❌ : _______

**Notes**: _______________________________

---

## 🎯 SCENARIO 2: Click on School (Should Work)

### Steps
1. [ ] Refresh page
2. [ ] Check consent checkbox
3. [ ] Click "Continue with Registration"
4. [ ] Enter name: "Test" and "Student"
5. [ ] Type "High School" in school search
6. [ ] **CLICK** on a school from dropdown
7. [ ] Select "Grade 10"
8. [ ] Click submit button

### What to Check
- [ ] Green success box appears after clicking school
- [ ] Submit button says "Start Assessment"
- [ ] Submit button is enabled
- [ ] Console shows "✅ Registration successful"
- [ ] Page redirects to assessment

### Result
**PASS** ✅ / **FAIL** ❌ : _______

**Notes**: _______________________________

---

## 🎯 SCENARIO 3: Mobile View

### Steps
1. [ ] Press F12 to open DevTools
2. [ ] Click phone icon (Ctrl+Shift+M)
3. [ ] Select "iPhone 12 Pro"
4. [ ] Repeat Scenario 1 and 2

### What to Check
- [ ] Dropdown visible on mobile
- [ ] Touch targets large enough
- [ ] Error messages readable
- [ ] No keyboard covering UI

### Result
**PASS** ✅ / **FAIL** ❌ : _______

**Notes**: _______________________________

---

## 📊 FINAL DECISION

### All Scenarios Passed?
**YES** ✅ → Ready to deploy  
**NO** ❌ → Fix issues first

### Deploy?
**YES** / **NO** : _______

### Reason:
_______________________________
_______________________________

---

## 🚀 IF READY TO DEPLOY

```bash
# 1. Create backup
git checkout -b backup-2026-01-14-registration-flow-fix
git add .
git commit -m "Fix: Enhanced school selection validation and visual feedback"
git push origin backup-2026-01-14-registration-flow-fix

# 2. Deploy
vercel --prod --force

# 3. Test production immediately
# Go to https://thandi.vercel.app/assessment
```

---

**Tested By**: _______  
**Date**: _______  
**Time**: _______
