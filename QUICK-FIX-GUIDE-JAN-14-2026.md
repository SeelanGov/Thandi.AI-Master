# QUICK FIX GUIDE - 3 STEPS
**Registration Flow Fix - January 14, 2026**

---

## 🚀 STEP 1: APPLY SQL (2 minutes)

### Local Database
1. Open: http://localhost:54323 → SQL Editor
2. Copy: `SUPABASE-SQL-FIX-SIMPLE-JAN-14-2026.sql` (entire file)
3. Paste and Run
4. Look for: `🎉 MIGRATION COMPLETE!`

### Production Database
1. Open: https://supabase.com/dashboard → Your Project → SQL Editor
2. Copy: `SUPABASE-SQL-FIX-SIMPLE-JAN-14-2026.sql` (entire file)
3. Paste and Run
4. Look for: `🎉 MIGRATION COMPLETE!`

---

## 🧪 STEP 2: TEST (1 minute)

### Local Test
```bash
node test-school-id-fix-local.js
```
Expected: `🎉 ALL TESTS PASSED!`

### Browser Test
1. Go to: http://localhost:3000/assessment
2. Fill form + select school + submit
3. Should redirect to questions (no errors)

---

## ✅ STEP 3: VERIFY PRODUCTION (1 minute)

### Live Site Test
1. Go to: https://thandi.vercel.app/assessment
2. Fill form + select school + submit
3. Should work without errors

### Check Logs
```bash
vercel logs --prod
```
Look for: Successful registrations, no UUID errors

---

## 🎯 WHAT THIS FIXES

**Problem**: `invalid input syntax for type uuid: "ZAF-200100021"`

**Solution**: Changes `student_assessments.school_id` from UUID to VARCHAR(50)

**Impact**: Fixes ALL registration failures

---

## ⚠️ IF IT FAILS

1. Check error message in SQL Editor
2. Run: `node test-school-id-fix-local.js`
3. Share the error output

---

## 📊 SUCCESS INDICATORS

✅ SQL shows: `🎉 MIGRATION COMPLETE!`  
✅ Test script shows: `🎉 ALL TESTS PASSED!`  
✅ Browser registration works  
✅ No UUID errors in logs  

---

**Total Time**: ~4 minutes  
**Risk Level**: Low (tested, has backups)  
**Impact**: Fixes critical blocker  

**Ready to apply? Follow Step 1 above.**
