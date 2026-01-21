# DAY 9 - QUICK TEST GUIDE

**Date**: January 20, 2026  
**Task**: Admin Authentication Testing

---

## 🚀 QUICK START

### 1. Run Automated Tests
```bash
npm run admin:test:auth
```

**Expected**: 7/7 tests passing (100% success rate)

---

## 🌐 MANUAL BROWSER TESTING

### Test 1: Login Page
1. Open: http://localhost:3000/admin/login
2. Verify:
   - ✅ Professional UI with Thandi branding
   - ✅ Email and password fields
   - ✅ "Sign in" button

### Test 2: Valid Login
1. Enter credentials:
   - Email: `admin@thandi.co.za`
   - Password: `Admin@Thandi2026`
2. Click "Sign in"
3. Verify:
   - ✅ Redirects to /admin
   - ✅ Dashboard loads
   - ✅ Navigation shows "Logout" button

### Test 3: Invalid Login
1. Go to: http://localhost:3000/admin/login
2. Enter wrong password
3. Verify:
   - ✅ Error message displays
   - ✅ Stays on login page
   - ✅ No redirect

### Test 4: Protected Route
1. Open new incognito window
2. Go to: http://localhost:3000/admin
3. Verify:
   - ✅ Redirects to /admin/login
   - ✅ Cannot access dashboard without auth

### Test 5: Logout
1. While logged in, click "Logout"
2. Verify:
   - ✅ Redirects to /admin/login
   - ✅ Cannot access /admin anymore
   - ✅ Must login again

---

## ✅ SUCCESS CRITERIA

All tests should pass:
- ✅ Automated tests: 7/7 passing
- ✅ Login page loads correctly
- ✅ Valid credentials work
- ✅ Invalid credentials rejected
- ✅ Protected routes secured
- ✅ Logout works correctly

---

## 🐛 TROUBLESHOOTING

### Issue: "JWT_SECRET is required" error
**Solution**: Check `.env.local` has JWT_SECRET set

### Issue: "Invalid credentials" with correct password
**Solution**: Run `npm run admin:seed` to create admin user

### Issue: Redirect loop
**Solution**: Clear browser cookies and try again

### Issue: Tests fail with connection error
**Solution**: Make sure dev server is running (`npm run dev`)

---

## 📊 NEXT STEPS

After all tests pass:
1. ✅ Mark Task 9.1 complete
2. ➡️ Proceed to Task 9.2: API Key Security
3. ➡️ Then Task 9.3: Unit Tests
4. ➡️ Finally Task 9.4: Integration Tests

---

**Total Day 9 Progress**: 2/8 hours complete (25%)
