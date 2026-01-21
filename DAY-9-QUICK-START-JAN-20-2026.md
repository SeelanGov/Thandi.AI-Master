# DAY 9: AUTHENTICATION & TESTING - QUICK START
**Date**: January 20, 2026  
**Status**: Ready to implement

---

## 🚀 GET STARTED IN 3 STEPS

### Step 1: Install Dependencies (2 minutes)
```bash
npm install bcryptjs jsonwebtoken cookie
```

### Step 2: Add Environment Variables (1 minute)
Add to `.env.local`:
```env
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

### Step 3: Start Development Server (1 minute)
```bash
npm run dev
```

---

## 📋 IMPLEMENTATION ORDER

### Task 9.1: Admin Authentication (2 hours)
**Files to create in order**:

1. **`lib/admin/auth.js`** (15 min)
   - JWT utilities
   - Password hashing
   - Cookie management

2. **`app/api/admin/auth/login/route.js`** (20 min)
   - Login endpoint
   - Password verification
   - Token generation

3. **`app/api/admin/auth/logout/route.js`** (10 min)
   - Logout endpoint
   - Cookie clearing

4. **`middleware/admin-auth.js`** (20 min)
   - Auth middleware
   - Token verification
   - User extraction

5. **`app/api/admin/auth/verify/route.js`** (10 min)
   - Auth verification endpoint
   - User info retrieval

6. **`app/admin/login/page.js`** (30 min)
   - Login page UI
   - Form handling
   - Error display

7. **Update `app/admin/page.js`** (15 min)
   - Add auth check
   - Redirect if not authenticated

8. **Update `components/admin/AdminNav.jsx`** (10 min)
   - Add logout button
   - Handle logout

9. **Test everything** (15 min)
   - Manual testing
   - Verify all flows

---

## 🧪 QUICK TEST COMMANDS

### Test Login
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thandi.co.za","password":"Admin123!@#"}'
```

### Test Verify (save cookie from login response)
```bash
curl http://localhost:3000/api/admin/auth/verify \
  -H "Cookie: admin_token=YOUR_TOKEN_HERE"
```

### Test Logout
```bash
curl -X POST http://localhost:3000/api/admin/auth/logout \
  -H "Cookie: admin_token=YOUR_TOKEN_HERE"
```

---

## 📊 PROGRESS TRACKING

### Task 9.1: Admin Authentication
- [ ] Dependencies installed
- [ ] Environment variables added
- [ ] `lib/admin/auth.js` created
- [ ] Login API created
- [ ] Logout API created
- [ ] Auth middleware created
- [ ] Verify API created
- [ ] Login page created
- [ ] Dashboard auth check added
- [ ] Logout button added
- [ ] All tests passing

### Task 9.2: API Key Security (Next)
- [ ] API key validation middleware
- [ ] Rate limiting (100 req/min)
- [ ] Tests passing

### Task 9.3: Unit Tests (Next)
- [ ] Error logger tests
- [ ] Performance analyzer tests
- [ ] Activity analyzer tests
- [ ] Health checker tests
- [ ] Alert engine tests

### Task 9.4: Integration Tests (Next)
- [ ] Error flow test
- [ ] Performance flow test
- [ ] Activity flow test
- [ ] Auth flow test

---

## ✅ SUCCESS CRITERIA

**Task 9.1 Complete When**:
- ✅ Login page loads at `/admin/login`
- ✅ Valid credentials grant access to `/admin`
- ✅ Invalid credentials show error message
- ✅ JWT token stored in httpOnly cookie
- ✅ Protected routes redirect to login
- ✅ Logout clears token and redirects

---

## 🎯 NEXT STEPS AFTER TASK 9.1

1. **Task 9.2**: API Key Security (1 hour)
2. **Task 9.3**: Unit Tests (3 hours)
3. **Task 9.4**: Integration Tests (2 hours)

---

## 📚 HELPFUL RESOURCES

- **Implementation Plan**: `DAY-9-TASK-9.1-IMPLEMENTATION-PLAN-JAN-20-2026.md`
- **Full Kickoff**: `DAY-9-AUTHENTICATION-TESTING-KICKOFF-JAN-20-2026.md`
- **Design Doc**: `.kiro/specs/admin-dashboard/design.md`
- **Tasks**: `.kiro/specs/admin-dashboard/tasks.md`

---

## ⚠️ IMPORTANT NOTES

1. **Security**: Never commit JWT_SECRET to git
2. **Testing**: Test with both valid and invalid credentials
3. **Cookies**: Use httpOnly cookies for security
4. **Expiry**: JWT tokens expire after 24 hours
5. **Redirect**: Always redirect after login/logout

---

**Ready to start?** Begin with Step 1: Install dependencies! 🚀

```bash
npm install bcryptjs jsonwebtoken cookie
```
