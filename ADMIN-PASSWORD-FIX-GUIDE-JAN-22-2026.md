# Admin Password Fix Guide
**Date**: January 22, 2026  
**Issue**: Invalid bcrypt hash causing login failures

## 🔍 Problem Identified

The password hash in the database was **invalid**:
- ❌ Wrong length: 61 characters (should be 60)
- ❌ Failed bcrypt verification
- ❌ Causing "Invalid credentials" errors

## ✅ Solution

Run the corrected SQL to fix the password hash.

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Click "New Query"

### Step 2: Run This SQL

```sql
-- Fix the admin password hash
UPDATE admin_users 
SET password_hash = '$2b$10$4RCLEY61Wkkf.D4ZWpyRye7YsO4EZ7EFmKORPfjVCsMd8XNGKy//C',
    updated_at = NOW()
WHERE email = 'admin@thandi.online';

-- Verify it worked
SELECT 
  email,
  LENGTH(password_hash) as hash_length,
  CASE 
    WHEN LENGTH(password_hash) = 60 THEN '✅ Correct'
    ELSE '❌ Wrong'
  END as status
FROM admin_users
WHERE email = 'admin@thandi.online';
```

### Step 3: Test Login

**Login Credentials:**
- URL: https://www.thandi.online/admin/login
- Email: `admin@thandi.online`
- Password: `Thandi@Admin2026!`

## 🧪 Local Testing

If you want to test locally first:

```bash
node test-admin-password-locally.js
```

This will:
1. Generate a fresh bcrypt hash
2. Verify it works
3. Show the SQL to run
4. Test against your database (if env vars are set)

## 📋 What Changed

**Before (Invalid):**
```
Hash: $2a$10$YQiQXU5nxpXKvRGKJ5fLHOK4xGHJ5fLHOK4xGHJ5fLHOK4xGHJ5fLH
Length: 61 characters ❌
Verification: FAILED ❌
```

**After (Valid):**
```
Hash: $2b$10$4RCLEY61Wkkf.D4ZWpyRye7YsO4EZ7EFmKORPfjVCsMd8XNGKy//C
Length: 60 characters ✅
Verification: SUCCESS ✅
```

## 🎯 Expected Result

After running the SQL:
- ✅ Hash length will be exactly 60 characters
- ✅ Password verification will work
- ✅ Login will succeed with `Thandi@Admin2026!`

## 🔐 Security Note

The password `Thandi@Admin2026!` is temporary. After your first successful login:
1. Go to admin settings
2. Change to a secure password
3. Enable 2FA if available
