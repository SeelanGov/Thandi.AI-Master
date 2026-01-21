# DAY 7 - LOCAL TEST GUIDE - JAN 20, 2026

## 🧪 Quick Local Testing Guide

All navigation fixes are complete. Follow these steps to verify everything works.

---

## 🚀 Step 1: Start Dev Server

```bash
npm run dev
```

Wait for:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

---

## ✅ Step 2: Test Header Navigation

### Test "School Login" Link

1. Open http://localhost:3000
2. Look at header navigation
3. Click **"School Login"**
4. **Expected**: Should navigate to `/school/claim`
5. **Verify**: School claim page loads (existing page with school search)

**✅ PASS**: School Login goes to `/school/claim`  
**❌ FAIL**: Goes to wrong page or 404

---

## ✅ Step 3: Test Footer Navigation

### Test Quick Links Section

1. Scroll to footer
2. Look at "Quick Links" section
3. **Expected**: Should see only:
   - Home
   - Assessment
4. **Verify**: "School Login" is NOT in Quick Links

**✅ PASS**: School Login removed from Quick Links  
**❌ FAIL**: School Login still appears

### Test "System Admin" Link

1. Still in footer, scroll to bottom
2. Look for small "System Admin" link
3. **Expected**: 
   - Very small text (smaller than before)
   - Low opacity (subtle)
   - At bottom of footer
4. Click **"System Admin"**
5. **Expected**: Should navigate to `/admin`
6. **Verify**: Admin dashboard loads (Days 1-7 dashboard)

**✅ PASS**: System Admin link is small, subtle, and goes to `/admin`  
**❌ FAIL**: Link is too large, broken, or goes to wrong page

---

## ✅ Step 4: Test Placeholder Page

### Test Direct Navigation to `/school/dashboard`

1. In browser address bar, type: `http://localhost:3000/school/dashboard`
2. Press Enter
3. **Expected**: 
   - Brief loading spinner
   - "Redirecting to School Portal..." message
   - Automatic redirect to `/school/claim`
4. **Verify**: No 404 error, smooth redirect

**✅ PASS**: Placeholder redirects to `/school/claim`  
**❌ FAIL**: 404 error or doesn't redirect

---

## 📊 Test Results Checklist

Mark each test:

- [ ] Header "School Login" → `/school/claim` ✅
- [ ] Footer Quick Links: No "School Login" ✅
- [ ] Footer "System Admin" → `/admin` (small, subtle) ✅
- [ ] `/school/dashboard` → redirects to `/school/claim` ✅

---

## 🎯 Expected Results Summary

### Header
```
[Logo] | Home | Assessment | School Login | [Start Assessment]
                                  ↓
                            /school/claim
```

### Footer Quick Links
```
Home | Assessment
(School Login removed)
```

### Footer Bottom
```
System Admin (tiny, subtle)
      ↓
    /admin
```

### Placeholder
```
/school/dashboard → /school/claim
```

---

## 🐛 If Something Doesn't Work

### Issue: "School Login" still goes to `/admin`
**Solution**: Clear browser cache and refresh

### Issue: Footer still shows large "Thandi Admin" button
**Solution**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: `/school/dashboard` shows 404
**Solution**: Restart dev server

### Issue: Changes not visible
**Solution**: 
```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

---

## ✅ All Tests Pass?

**If all tests pass**:
1. Navigation fixes are working correctly
2. Day 7 is complete
3. Ready to proceed to Days 8-10

**Report back**:
- "All tests pass" → Continue to Days 8-10
- "Test X failed" → Debug specific issue

---

## 📚 Reference Documents

- `DAY-7-FINAL-NAVIGATION-SOLUTION-JAN-20-2026.md` - Implementation details
- `DAY-7-NAVIGATION-FIX-AGREED-PLAN-JAN-20-2026.md` - Original plan
- `.kiro/specs/admin-dashboard/tasks.md` - Task tracking

---

**Ready to test! Start with `npm run dev` and follow the checklist above.**
