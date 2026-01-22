# ADMIN LOGIN TEST GUIDE
**Date**: January 22, 2026  
**Estimated Time**: 5 minutes  
**Purpose**: Verify admin authentication works

---

## 🎯 WHAT WE'RE TESTING

Now that the database is set up and the admin user is created, we need to verify that you can actually log in to the admin dashboard.

---

## 📋 TEST CHECKLIST

### Test 1: Access Login Page
1. Open your browser
2. Go to: https://www.thandi.online/admin/login
3. **Expected**: Login page loads with Thandi branding
4. **Expected**: Email and password fields visible
5. **Expected**: "Sign In" button visible

### Test 2: Login with Credentials
1. Enter email: `admin@thandi.online`
2. Enter password: `Thandi@Admin2026!`
3. Click "Sign In"
4. **Expected**: Redirects to https://www.thandi.online/admin
5. **Expected**: Dashboard overview page loads
6. **Expected**: Navigation menu visible (Overview, Errors, Performance, Activity)

### Test 3: Verify Dashboard Access
1. Check that you see metric cards:
   - Total Errors
   - Average Response Time
   - Active Users
   - System Health
   - Active Alerts
   - API Requests
2. **Expected**: All cards display numbers (may be 0 if no data yet)
3. **Expected**: Recent errors list visible (may be empty)

### Test 4: Test Navigation
1. Click "Errors" in the navigation menu
2. **Expected**: Errors page loads
3. Click "Performance" in the navigation menu
4. **Expected**: Performance page loads
5. Click "Activity" in the navigation menu
6. **Expected**: Activity page loads
7. Click "Overview" to return to dashboard
8. **Expected**: Overview page loads

### Test 5: Test Logout
1. Click "Logout" button (if visible)
2. **Expected**: Redirects to login page
3. **Expected**: Cannot access /admin without logging in again

---

## ✅ SUCCESS CRITERIA

The admin authentication is working if:
- [x] Login page loads without errors
- [x] Can login with correct credentials
- [x] Dashboard loads after login
- [x] All navigation links work
- [x] Logout works correctly

---

## 🚨 COMMON ISSUES

### Issue 1: Login Page Shows 404
**Cause**: Admin login page not deployed  
**Solution**: The page should be deployed. Try clearing browser cache or hard refresh (Ctrl+Shift+R)

### Issue 2: "Invalid Credentials" Error
**Possible Causes**:
1. Password typed incorrectly (check caps lock)
2. Admin user not created in database
3. Password hash incorrect

**Verification**:
Run this in Supabase SQL Editor:
```sql
SELECT id, email, role, is_active, created_at 
FROM admin_users 
WHERE email = 'admin@thandi.online';
```

**Expected Result**: Should return 1 row with your admin user

### Issue 3: Login Succeeds but Dashboard Shows Error
**Possible Causes**:
1. JWT_SECRET not set in Vercel
2. Database connection issue
3. API endpoints not deployed

**Verification**:
Check Vercel environment variables:
- Go to: https://vercel.com/your-project/settings/environment-variables
- Verify `JWT_SECRET` is set
- Verify all `SUPABASE_*` variables are set

### Issue 4: Dashboard Loads but Shows No Data
**This is NORMAL!** 
- The dashboard will show 0s and empty lists until:
  - Errors are logged
  - API requests are made
  - Users perform actions
  - Health checks run

---

## 🔧 MANUAL VERIFICATION QUERIES

If you want to verify the database setup manually, run these in Supabase:

### Check Admin User
```sql
SELECT 
  id,
  email,
  role,
  is_active,
  created_at,
  updated_at
FROM admin_users
WHERE email = 'admin@thandi.online';
```

**Expected**: 1 row with `is_active = true` and `role = 'super_admin'`

### Check API Key
```sql
SELECT 
  id,
  key_name,
  LEFT(api_key, 20) || '...' as api_key_preview,
  permissions,
  is_active,
  created_at,
  expires_at
FROM admin_api_keys
WHERE key_name = 'Kiro AI Access';
```

**Expected**: 1 row with `is_active = true` and `expires_at` in 2027

### Check All Admin Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%'
ORDER BY table_name;
```

**Expected**: 9 tables listed

---

## 📸 WHAT SUCCESS LOOKS LIKE

### Login Page
```
┌─────────────────────────────────────┐
│         THANDI ADMIN LOGIN          │
│                                     │
│  Email: [admin@thandi.online    ]  │
│  Password: [••••••••••••••••••]    │
│                                     │
│         [Sign In Button]            │
└─────────────────────────────────────┘
```

### Dashboard Overview
```
┌─────────────────────────────────────┐
│  Overview | Errors | Performance    │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │  0  │ │ 0ms │ │  0  │ │ ✓   │  │
│  │Errors│ │Resp │ │Users│ │Health│ │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  Recent Errors:                     │
│  (No errors yet)                    │
└─────────────────────────────────────┘
```

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL LOGIN

### Immediate
1. ✅ Verify login works
2. ✅ Verify dashboard loads
3. ✅ Verify navigation works
4. [ ] Save API key from SQL results (for Kiro AI)
5. [ ] Test API key with curl command

### This Week
1. [ ] Configure alert thresholds
2. [ ] Set up cron jobs in Vercel
3. [ ] Monitor dashboard for real data
4. [ ] Test Kiro AI integration

---

## 🔑 API KEY TESTING (After Login Test)

Once login works, test the API key:

### Get Your API Key
Run in Supabase SQL Editor:
```sql
SELECT api_key FROM admin_api_keys WHERE key_name = 'Kiro AI Access';
```

Copy the full API key (starts with `kiro_`)

### Test API Access
```bash
# Test health endpoint
curl -H "X-API-Key: YOUR_API_KEY_HERE" \
  https://www.thandi.online/api/admin/health

# Expected: JSON response with system health status
```

### Test Errors Endpoint
```bash
# Test errors endpoint
curl -H "X-API-Key: YOUR_API_KEY_HERE" \
  https://www.thandi.online/api/admin/errors

# Expected: JSON response with errors array (may be empty)
```

---

## 📞 NEED HELP?

### If Login Doesn't Work
1. Take a screenshot of the error
2. Check browser console for errors (F12 → Console tab)
3. Verify admin user exists in database (SQL query above)
4. Check Vercel deployment logs

### If Dashboard Doesn't Load
1. Check browser console for errors
2. Verify all environment variables are set in Vercel
3. Check Vercel deployment logs
4. Try accessing /api/admin/health directly

### If API Key Doesn't Work
1. Verify API key is correct (copy from database)
2. Check header format: `X-API-Key: kiro_...`
3. Verify API key is active in database
4. Check Vercel API logs

---

## ✅ COMPLETION CHECKLIST

Mark these as you complete them:

- [ ] Login page loads successfully
- [ ] Can login with admin credentials
- [ ] Dashboard overview displays
- [ ] Navigation menu works
- [ ] All pages load (Errors, Performance, Activity)
- [ ] Logout works correctly
- [ ] API key retrieved from database
- [ ] API key tested with curl
- [ ] API endpoints respond correctly

---

## 🎉 READY TO TEST!

**Your credentials**:
- **URL**: https://www.thandi.online/admin/login
- **Email**: `admin@thandi.online`
- **Password**: `Thandi@Admin2026!`

**Time to test**: ~5 minutes

**What to do**: Follow the test checklist above and let me know the results!

---

**Document Created**: January 22, 2026  
**Status**: Ready for Testing  
**Priority**: HIGH  
**Next Action**: Test admin login

