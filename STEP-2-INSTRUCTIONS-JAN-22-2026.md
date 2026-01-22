# STEP 2: CREATE ADMIN USER
**Date**: January 22, 2026  
**Time Needed**: 2 minutes  
**Status**: Ready to execute

---

## 🎯 WHAT YOU'LL DO

Create your admin user account so you can login to the dashboard.

---

## 📋 INSTRUCTIONS

### 1. Copy the SQL

- Open file: `STEP-2-CREATE-ADMIN-USER-JAN-22-2026.sql`
- Select ALL (Ctrl+A or Cmd+A)
- Copy (Ctrl+C or Cmd+C)

### 2. Run in Supabase

- Go to Supabase SQL Editor (same place as Step 1)
- Clear the editor (delete old SQL)
- Paste the new SQL
- Click **"RUN"**

### 3. Save Your Credentials

After running, you'll see 3 result tables:

**Table 1: Admin User**
```
email: admin@thandi.online
password: Thandi@Admin2026!
role: super_admin
```

**Table 2: API Key** ⚠️ **IMPORTANT - SAVE THIS!**
```
api_key: kiro_[long string of letters and numbers]
```

**Table 3: Success Message**
```
✅ Admin user created successfully!
Login URL: https://www.thandi.online/admin/login
```

---

## 🔐 YOUR LOGIN CREDENTIALS

### Email
```
admin@thandi.online
```

### Password
```
Thandi@Admin2026!
```

### Login URL
```
https://www.thandi.online/admin/login
```

---

## ⚠️ CRITICAL: SAVE THE API KEY

In the results, you'll see a long string that looks like:
```
kiro_a1b2c3d4e5f6...
```

**COPY THIS AND SAVE IT SOMEWHERE SAFE!**

This is the API key for Kiro AI to access your dashboard. You won't be able to see it again.

---

## ✅ SUCCESS LOOKS LIKE

You should see:
- ✅ No error messages
- ✅ Admin user details displayed
- ✅ API key displayed (starts with `kiro_`)
- ✅ Success message at the bottom

---

## 🎉 WHAT YOU JUST CREATED

1. **Admin User Account**
   - Email: admin@thandi.online
   - Password: Thandi@Admin2026!
   - Role: Super Admin (full access)

2. **API Key for Kiro AI**
   - Allows Kiro to access dashboard data
   - Valid for 1 year
   - Can read errors, performance, activity, health

---

## 📝 NEXT STEP

Once you've:
1. ✅ Run the SQL successfully
2. ✅ Saved the API key somewhere safe
3. ✅ Noted your login credentials

Reply with **"step 2 done"** and I'll give you Step 3: Testing your login!

---

## 🆘 TROUBLESHOOTING

**Q: I see "duplicate key value violates unique constraint"**  
A: That's okay! It means the admin user already exists. The SQL will update it instead.

**Q: I don't see an API key in the results**  
A: Scroll down in the results panel - there should be 3 separate result tables.

**Q: Can I change the password later?**  
A: Yes! After you login, you can change your password in the dashboard settings.

---

**File to use**: `STEP-2-CREATE-ADMIN-USER-JAN-22-2026.sql`  
**Current Status**: ⏳ WAITING FOR STEP 2 COMPLETION  
**Next**: Test login at https://www.thandi.online/admin/login
