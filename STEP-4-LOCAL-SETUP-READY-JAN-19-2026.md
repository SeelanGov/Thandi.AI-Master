# STEP 4: LOCAL SETUP - READY TO EXECUTE
**Date**: January 19, 2026  
**Status**: ✅ Database Migration Complete - Ready for Local Setup

---

## ✅ COMPLETED STEPS

### Step 1: Cleanup ✅
- Dropped all existing admin dashboard tables
- Dropped existing cleanup function
- Database is clean and ready

### Step 2: Schema Migration ✅
- Created 8 admin dashboard tables
- Created 22 indexes for performance
- All tables verified in Supabase

### Step 3: Cleanup Function ✅
- Created `cleanup_old_monitoring_data()` function
- Automated data retention (90 days)
- Function executes successfully

---

## 📋 NEXT STEPS - LOCAL SETUP

### Step 4.1: Install Dependencies

```bash
npm install
```

This will install:
- `bcryptjs` (already in package.json) - for password hashing
- All other project dependencies

**Expected Output**: 
```
added X packages in Ys
```

---

### Step 4.2: Verify Schema (Optional but Recommended)

```bash
npm run admin:verify
```

**Expected Output**:
```
🔍 Verifying Admin Dashboard Schema...

═══════════════════════════════════════════════════════════
TABLES:
═══════════════════════════════════════════════════════════
✅ admin_users
✅ system_errors
✅ api_metrics
✅ user_activity
✅ system_health_checks
✅ alert_configurations
✅ alert_history
✅ admin_audit_log

═══════════════════════════════════════════════════════════
FUNCTIONS:
═══════════════════════════════════════════════════════════
✅ cleanup_old_monitoring_data

═══════════════════════════════════════════════════════════
SUMMARY:
═══════════════════════════════════════════════════════════
Tables:    8/8
Functions: 1/1
Errors:    0
═══════════════════════════════════════════════════════════

✅ Schema verification PASSED - All components created successfully!
```

---

### Step 4.3: Create Admin User with API Key

**IMPORTANT**: Choose a secure password (minimum 12 characters)

#### Option A: Set Password via Environment Variable (Recommended)

```bash
# Windows PowerShell
$env:ADMIN_PASSWORD="YourSecurePassword123!"
npm run admin:seed

# Windows CMD
set ADMIN_PASSWORD=YourSecurePassword123!
npm run admin:seed
```

#### Option B: The script will prompt you if ADMIN_PASSWORD is not set

```bash
npm run admin:seed
# Script will show error and instructions if password not set
```

---

### Step 4.4: SAVE THE API KEY (CRITICAL!)

When you run the seed script, you'll see output like this:

```
✅ Admin user created successfully!

═══════════════════════════════════════════════════════════
📧 Email:    admin@thandi.co.za
🔒 Password: [Your password]
👤 Role:     admin
🆔 User ID:  [uuid]
═══════════════════════════════════════════════════════════

🤖 KIRO AI API KEY (SAVE THIS - IT WON'T BE SHOWN AGAIN):
═══════════════════════════════════════════════════════════
kiro_[64_character_hex_string]
═══════════════════════════════════════════════════════════
```

**IMMEDIATELY save this API key in:**

1. **`.env.local` file** (add this line):
   ```
   ADMIN_API_KEY=kiro_[paste_your_key_here]
   ```

2. **Vercel Environment Variables**:
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add: `ADMIN_API_KEY` = `kiro_[your_key]`
   - Apply to: Production, Preview, Development

3. **Password Manager**:
   - Service: Thandi Admin Dashboard
   - Username: admin@thandi.co.za
   - Password: [Your ADMIN_PASSWORD]
   - API Key: kiro_[your_key]
   - Notes: Generated on Jan 19, 2026

---

## 🎯 QUICK COMMAND SEQUENCE

Copy and paste these commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Verify schema (optional)
npm run admin:verify

# 3. Set password and create admin user (PowerShell)
$env:ADMIN_PASSWORD="YourSecurePassword123!"
npm run admin:seed

# 4. Save the API key that appears in the output!
```

---

## ⚠️ TROUBLESHOOTING

### Error: "bcryptjs not found"
```bash
npm install bcryptjs
```

### Error: "Missing Supabase environment variables"
Check your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Error: "Admin user already exists"
The user is already created. To regenerate API key:
1. Delete user in Supabase SQL Editor:
   ```sql
   DELETE FROM admin_users WHERE email = 'admin@thandi.co.za';
   ```
2. Re-run seed script

---

## ✅ SUCCESS CRITERIA

Day 1 is complete when:
- ✅ All 8 tables exist in Supabase
- ✅ Cleanup function works
- ✅ Admin user created locally
- ✅ API key generated
- ✅ API key saved in 3+ locations
- ✅ Verification script passes

---

## 📝 WHAT'S NEXT

After completing local setup:
- **Day 2**: Error tracking system
- **Day 3**: Performance monitoring
- **Day 4**: User activity tracking
- **Day 5**: System health monitoring

---

**Ready to proceed? Run `npm install` first!** 🚀
