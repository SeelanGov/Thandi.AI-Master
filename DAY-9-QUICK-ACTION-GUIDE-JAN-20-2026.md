# DAY 9: QUICK ACTION GUIDE

**Date**: January 20, 2026  
**Purpose**: Get all tests running in 15 minutes  
**Current Status**: Tests created but environment needs setup

---

## 🚀 QUICK START (15 MINUTES)

### Step 1: Install Jest (2 minutes)
```bash
npm install --save-dev jest @types/jest
```

**Why**: Unit tests require Jest to run (103 tests waiting)

---

### Step 2: Start Development Server (1 minute)
```bash
npm run dev
```

**Why**: Authentication tests need server running  
**Keep this terminal open** - server must stay running

---

### Step 3: Seed Admin User (2 minutes)
**Open a new terminal**, then run:
```bash
npm run admin:seed
```

**Expected Output**:
```
✅ Admin user created successfully
   Email: admin@thandi.co.za
   Password: Admin@Thandi2026
   API Key: kiro_[generated]
```

**Why**: Authentication tests need admin user in database

---

### Step 4: Fix API Key Test Script (1 minute)
**Option A** (Quick Fix):
```bash
node -r dotenv/config scripts/test-api-key-authentication.js
```

**Option B** (Permanent Fix):
Edit `scripts/test-api-key-authentication.js` and add at the top:
```javascript
require('dotenv').config({ path: '.env.local' });
```

**Why**: Test script needs to load environment variables

---

### Step 5: Run All Tests (5 minutes)
**In a new terminal** (keep dev server running):

```bash
# Test 1: Authentication (7 tests)
npm run admin:test:auth

# Test 2: API Key (7 tests)
npm run admin:test:apikey

# Test 3: Unit Tests (103 tests)
npm run admin:test:unit
```

**Expected Results**:
- ✅ Authentication: 7/7 passing (100%)
- ✅ API Key: 7/7 passing (100%)
- ✅ Unit Tests: 103/103 passing (100%)
- ✅ **Total: 117/117 tests passing**

---

## 📊 VERIFICATION CHECKLIST

After running all tests, verify:

- [ ] Dev server running on http://localhost:3000
- [ ] Admin user seeded in database
- [ ] Jest installed and working
- [ ] Authentication tests: 7/7 passing
- [ ] API key tests: 7/7 passing
- [ ] Unit tests: 103/103 passing
- [ ] Total: 117/117 tests passing (100%)

---

## 🎯 WHAT'S NEXT

### After All Tests Pass (2 hours)
**Task 9.4: Integration Tests**

Create 4 integration test files:
1. `__tests__/admin/integration/error-flow.test.js` (30 min)
2. `__tests__/admin/integration/performance-flow.test.js` (30 min)
3. `__tests__/admin/integration/activity-flow.test.js` (30 min)
4. `__tests__/admin/integration/auth-flow.test.js` (30 min)

**Command to create directory**:
```bash
mkdir -p __tests__/admin/integration
```

---

## 🚨 TROUBLESHOOTING

### If Authentication Tests Fail
**Problem**: Tests 1, 3, 5 failing  
**Solution**:
1. Check dev server is running: http://localhost:3000
2. Check admin user exists: `npm run admin:verify`
3. Check .env.local has JWT_SECRET

### If API Key Tests Fail
**Problem**: "API key not set in environment"  
**Solution**:
1. Check .env.local has ADMIN_API_KEY or KIRO_API_KEY
2. Use dotenv flag: `node -r dotenv/config scripts/test-api-key-authentication.js`
3. Or add dotenv to script (see Step 4 above)

### If Unit Tests Fail
**Problem**: "jest is not recognized"  
**Solution**:
1. Install Jest: `npm install --save-dev jest @types/jest`
2. Verify installation: `npx jest --version`
3. Re-run: `npm run admin:test:unit`

### If Admin Seed Fails
**Problem**: "Missing Supabase environment variables"  
**Solution**:
1. Check .env.local has:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
2. Verify values are correct (not placeholder text)
3. Re-run: `npm run admin:seed`

---

## 📈 PROGRESS TRACKING

### Before Quick Start
- ✅ Implementation: 100% (Tasks 9.1, 9.2, 9.3)
- ⏳ Test Execution: 3% (4/117 tests)
- ⏳ Environment: Not ready

### After Quick Start (15 minutes)
- ✅ Implementation: 100%
- ✅ Test Execution: 100% (117/117 tests)
- ✅ Environment: Ready
- ⏳ Integration Tests: 0% (Task 9.4)

### After Task 9.4 (2 hours)
- ✅ Implementation: 100%
- ✅ Test Execution: 100%
- ✅ Environment: Ready
- ✅ Integration Tests: 100%
- ✅ **Day 9: COMPLETE**

---

## 💡 PRO TIPS

1. **Keep dev server running** in one terminal
2. **Run tests in another terminal** - don't stop the server
3. **Check test output carefully** - look for specific error messages
4. **Run tests one at a time** first to isolate issues
5. **Use `--verbose` flag** for more detailed output if needed

---

## 🎉 SUCCESS INDICATORS

You'll know everything is working when:

1. ✅ Dev server shows "Ready on http://localhost:3000"
2. ✅ Admin seed shows "Admin user created successfully"
3. ✅ Authentication tests show "7/7 passing"
4. ✅ API key tests show "7/7 passing"
5. ✅ Unit tests show "103/103 passing"
6. ✅ Total: "117/117 tests passing (100%)"

---

**Time Required**: 15 minutes  
**Difficulty**: Easy (just follow steps)  
**Outcome**: All 117 tests passing, ready for Task 9.4

---

**Created**: January 20, 2026  
**Developer**: Kiro AI (Autonomous Dev Lead)  
**Project**: Thandi Admin Dashboard - Day 9  
**Purpose**: Quick reference for getting tests running
