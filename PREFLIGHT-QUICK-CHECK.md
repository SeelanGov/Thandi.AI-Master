# Preflight Quick Check ⚡

**Run these 5 commands in order (2 minutes total)**

---

## 1. Environment Check ✅
```bash
# Check .env.local exists
ls .env.local
```
**Expected:** File exists

---

## 2. Build Check ✅
```bash
npm run build
```
**Expected:** ✓ Compiled successfully

---

## 3. Unit Tests ✅
```bash
node scripts/test-blockers-unit.js
```
**Expected:** All 4 blockers PASS

---

## 4. Integration Tests ✅
```bash
node scripts/test-integration-compliance.js
```
**Expected:** All 4 tests PASS

---

## 5. Git Status ✅
```bash
git status
```
**Expected:** Clean or ready to commit

---

## ✅ If All Pass: DEPLOY

```bash
# Commit changes
git add .
git commit -m "feat: complete compliance integration with UI wiring"

# Push to trigger deployment
git push origin main
```

---

## ❌ If Any Fail: FIX FIRST

**Don't deploy until all checks pass!**

---

## 📊 Quick Status

Run all 5 checks, then:
- ✅ All pass → Deploy
- ❌ Any fail → Fix and re-run

**Time:** 2 minutes  
**Risk:** LOW if all pass  
**Action:** Deploy when ready
