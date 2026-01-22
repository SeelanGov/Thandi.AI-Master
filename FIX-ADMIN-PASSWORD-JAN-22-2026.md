# FIX ADMIN PASSWORD - INVALID CREDENTIALS
**Date**: January 22, 2026  
**Issue**: "Invalid credentials" when trying to login  
**Root Cause**: Password hash in database was a placeholder, not a real hash

---

## 🔍 PROBLEM IDENTIFIED

The SQL script `STEP-2-CREATE-ADMIN-USER-JAN-22-2026.sql` contained a **placeholder password hash** that doesn't actually match the password `Thandi@Admin2026!`.

This line was the problem:
```sql
'$2a$10$YQiQXU5nxpXKvRGKJ5fLHOK4xGHJ5fLHOK4xGHJ5fLHOK4xGHJ5fLH',  -- This is fake!
```

---

## ✅ SOLUTION

Run this SQL in Supabase to update the password hash with a **real, working hash**:

### Step 1: Copy This SQL

```sql
-- Update admin user password hash with CORRECT hash
UPDATE admin_users
SET password_hash = '$2b$10$EL2UDDF4DCOL42sh1Z/Ame3hR9BwWLSfh58VXqzkxcgMpu39L8GrO',
    updated_at = NOW()
WHERE email = 'admin@thandi.online';

-- Verify the update worked
SELECT
  id,
  email,
  role,
  is_active,
  LEFT(password_hash, 20) || '...' as password_hash_preview,
  updated_at
FROM admin_users
WHERE email = 'admin@thandi.online';
```

### Step 2: Run in Supabase

1. Go to: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql
2. Paste the SQL above
3. Click **RUN**
4. Check the results - you should see:
   - `password_hash_preview` starts with `$2b$10$EL2UDDF4DCOL4...`
   - `updated_at` shows current timestamp

### Step 3: Test Login

1. Go to: https://www.thandi.online/admin/login
2. Enter:
   - **Email**: `admin@thandi.online`
   - **Password**: `Thandi@Admin2026!`
3. Click **Sign In**
4. Should redirect to dashboard!

---

## 🔐 WHAT WE FIXED

### Before (Broken)
```
Password Hash: $2a$10$YQiQXU5nxpXKvRGKJ5fLHOK4xGHJ5fLHOK4xGHJ5fLHOK4xGHJ5fLH
Status: ❌ Placeholder/fake hash
Result: Invalid credentials error
```

### After (Working)
```
Password Hash: $2b$10$EL2UDDF4DCOL42sh1Z/Ame3hR9BwWLSfh58VXqzkxcgMpu39L8GrO
Status: ✅ Real bcrypt hash (10 rounds)
Result: Login works!
```

---

## 📊 VERIFICATION

After running the SQL, verify with this query:

```sql
-- Test that the hash is correct
SELECT 
  email,
  role,
  is_active,
  CASE 
    WHEN password_hash LIKE '$2b$10$EL2UDDF4DCOL42sh1Z/Ame%' THEN '✅ Correct hash'
    ELSE '❌ Wrong hash'
  END as hash_status,
  updated_at
FROM admin_users
WHERE email = 'admin@thandi.online';
```

**Expected Result**: `hash_status` should show `✅ Correct hash`

---

## 🛠️ ALTERNATIVE: Generate Your Own Hash

If you want to use a different password, run this locally:

```bash
node generate-correct-admin-password-jan-22-2026.js
```

This will:
1. Generate a new bcrypt hash
2. Provide SQL to update the database
3. Verify the hash works

---

## 🆘 TROUBLESHOOTING

### Still Getting "Invalid Credentials"?

**Check 1: Verify hash was updated**
```sql
SELECT password_hash FROM admin_users WHERE email = 'admin@thandi.online';
```
Should start with: `$2b$10$EL2UDDF4DCOL42sh1Z/Ame`

**Check 2: Verify user is active**
```sql
SELECT is_active FROM admin_users WHERE email = 'admin@thandi.online';
```
Should be: `true`

**Check 3: Check browser console**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for error messages

**Check 4: Verify JWT_SECRET**
The login API needs `JWT_SECRET` environment variable in Vercel.

---

## 📝 FILES CREATED

- `generate-correct-admin-password-jan-22-2026.js` - Password hash generator
- `diagnose-admin-login-jan-22-2026.js` - Full diagnostic script
- `FIX-ADMIN-PASSWORD-JAN-22-2026.md` - This file

---

## ✅ QUICK FIX SUMMARY

1. **Copy SQL** from "Step 1" above
2. **Run in Supabase** SQL Editor
3. **Test login** at https://www.thandi.online/admin/login
4. **Should work!** ✅

---

**Status**: Ready to fix  
**Time to fix**: 2 minutes  
**Difficulty**: Easy

