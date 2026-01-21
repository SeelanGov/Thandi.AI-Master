# Execute Day 1: Admin Dashboard Database Setup

**Date**: January 19, 2026  
**Task**: Set up database schema for admin monitoring dashboard  
**Duration**: ~2 hours  
**Status**: Ready to Execute

---

## 🎯 Quick Start (Copy-Paste Commands)

```bash
# Step 1: Install bcryptjs dependency
npm install bcryptjs

# Step 2: Run migrations in Supabase
# Option A: Using Supabase CLI (if installed)
supabase db push

# Option B: Manual (copy SQL from migration files to Supabase SQL Editor)
# - Open Supabase Dashboard → SQL Editor
# - Copy content from supabase/migrations/20260119_admin_dashboard_schema.sql
# - Run the SQL
# - Copy content from supabase/migrations/20260119_admin_dashboard_cleanup.sql
# - Run the SQL

# Step 3: Verify schema
npm run admin:verify

# Step 4: Set admin password and seed user
export ADMIN_PASSWORD="YourSecurePassword123!"
npm run admin:seed

# Step 5: Save the API key output!
# Copy the kiro_... key and save it securely
```

---

## 📋 Detailed Step-by-Step Instructions

### Prerequisites

Ensure you have:
- [ ] Supabase project access
- [ ] Environment variables set (`.env.local`)
- [ ] Node.js 18+ installed
- [ ] Terminal access

### Step 1: Install Dependencies

```bash
# Install bcryptjs for password hashing
npm install bcryptjs

# Verify installation
npm list bcryptjs
```

**Expected Output**: `bcryptjs@2.4.3` or similar

---

### Step 2: Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

```bash
# If you have Supabase CLI installed
supabase db push
```

#### Option B: Manual SQL Execution (Alternative)

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your Thandi project
   - Navigate to SQL Editor

2. **Run Schema Migration**:
   - Open `supabase/migrations/20260119_admin_dashboard_schema.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success message

3. **Run Cleanup Migration**:
   - Open `supabase/migrations/20260119_admin_dashboard_cleanup.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Wait for success message

**Expected Result**: 
- 8 tables created
- 22 indexes created
- 1 function created
- No errors

---

### Step 3: Verify Schema

```bash
# Run verification script
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

**If Verification Fails**:
- Check Supabase connection
- Review migration SQL for errors
- Check Supabase logs
- Verify environment variables

---

### Step 4: Create Admin User

```bash
# Set a secure password (minimum 12 characters)
export ADMIN_PASSWORD="YourSecurePassword123!"

# Run seed script
npm run admin:seed
```

**Expected Output**:
```
🚀 Starting admin user seed process...

🔐 Generating secure password hash...
🔑 Generating Kiro AI API key...
💾 Creating admin user in database...

✅ Admin user created successfully!

═══════════════════════════════════════════════════════════
📧 Email:    admin@thandi.co.za
🔒 Password: [Set via ADMIN_PASSWORD environment variable]
👤 Role:     admin
🆔 User ID:  [uuid]
═══════════════════════════════════════════════════════════

🤖 KIRO AI API KEY (SAVE THIS - IT WON'T BE SHOWN AGAIN):
═══════════════════════════════════════════════════════════
kiro_[64_character_hex_string]
═══════════════════════════════════════════════════════════

📝 Next Steps:
   1. Save the API key above in a secure location
   2. Add to Kiro AI environment: export THANDI_ADMIN_API_KEY="kiro_..."
   3. Add to .env.local: KIRO_API_KEY="kiro_..."
   4. Test login at: http://localhost:3000/admin/login
   5. Change password after first login
```

---

### Step 5: Save API Key (CRITICAL!)

**IMMEDIATELY** save the generated API key in multiple secure locations:

#### 1. Add to `.env.local`

```bash
# Open .env.local and add:
KIRO_API_KEY="kiro_[paste_your_key_here]"
```

#### 2. Add to Vercel Environment Variables

```bash
# Go to Vercel Dashboard
# Project Settings → Environment Variables
# Add new variable:
# Name: KIRO_API_KEY
# Value: kiro_[paste_your_key_here]
# Environments: Production, Preview, Development
```

#### 3. Save for Kiro AI

```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export THANDI_ADMIN_API_KEY="kiro_[paste_your_key_here]"

# Or create a secure file
echo 'export THANDI_ADMIN_API_KEY="kiro_[paste_your_key_here]"' > ~/.thandi_admin_key
chmod 600 ~/.thandi_admin_key
source ~/.thandi_admin_key
```

#### 4. Store in Password Manager

- **Service**: Thandi Admin Dashboard
- **Username**: admin@thandi.co.za
- **Password**: [Your ADMIN_PASSWORD]
- **API Key**: kiro_[your_key]
- **Notes**: Generated on [date], rotate every 90 days

---

### Step 6: Test the Setup

#### Test 1: Query Admin User

```bash
# In Supabase SQL Editor, run:
SELECT id, email, role, api_key IS NOT NULL as has_api_key
FROM admin_users
WHERE email = 'admin@thandi.co.za';
```

**Expected**: One row with `has_api_key = true`

#### Test 2: Verify All Tables

```bash
# In Supabase SQL Editor, run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'admin_users',
  'system_errors',
  'api_metrics',
  'user_activity',
  'system_health_checks',
  'alert_configurations',
  'alert_history',
  'admin_audit_log'
)
ORDER BY table_name;
```

**Expected**: 8 rows (all table names)

#### Test 3: Test Cleanup Function

```bash
# In Supabase SQL Editor, run:
SELECT cleanup_old_monitoring_data();
```

**Expected**: Function executes without errors

---

## ✅ Day 1 Completion Checklist

Mark each item as complete:

### Database Setup
- [ ] bcryptjs installed
- [ ] Schema migration ran successfully
- [ ] Cleanup migration ran successfully
- [ ] Verification script passed
- [ ] All 8 tables exist
- [ ] All 22 indexes created
- [ ] Cleanup function works

### Admin User Setup
- [ ] Admin user created
- [ ] Password is secure (12+ characters)
- [ ] API key generated
- [ ] API key saved in `.env.local`
- [ ] API key saved in Vercel
- [ ] API key saved in password manager
- [ ] API key saved for Kiro AI

### Testing
- [ ] Can query admin_users table
- [ ] Can query all 8 tables
- [ ] Cleanup function executes
- [ ] No errors in Supabase logs

### Documentation
- [ ] Read `DAY-1-ADMIN-DASHBOARD-COMPLETE-JAN-19-2026.md`
- [ ] Understand database schema
- [ ] Know where API key is stored
- [ ] Ready for Day 2

---

## 🐛 Troubleshooting

### Error: "bcryptjs not found"

```bash
# Solution: Install the package
npm install bcryptjs
```

### Error: "Table already exists"

```bash
# Solution: Drop existing tables first
# In Supabase SQL Editor:
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS alert_configurations CASCADE;
DROP TABLE IF EXISTS system_health_checks CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS api_metrics CASCADE;
DROP TABLE IF EXISTS system_errors CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

# Then re-run migrations
```

### Error: "Admin user already exists"

```bash
# Solution: User already created, skip seed step
# To regenerate API key, delete user first:
# In Supabase SQL Editor:
DELETE FROM admin_users WHERE email = 'admin@thandi.co.za';

# Then re-run seed script
```

### Error: "Password too short"

```bash
# Solution: Use a longer password (12+ characters)
export ADMIN_PASSWORD="YourVerySecurePassword123!"
npm run admin:seed
```

### Error: "Cannot connect to Supabase"

```bash
# Solution: Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# If empty, add to .env.local:
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

---

## 📊 What You've Built

### Database Tables (8)

1. **admin_users** - Authentication and API keys
2. **system_errors** - Error tracking with context
3. **api_metrics** - Performance monitoring
4. **user_activity** - User action tracking
5. **system_health_checks** - Component health
6. **alert_configurations** - Alert rules
7. **alert_history** - Alert tracking
8. **admin_audit_log** - Admin actions

### Indexes (22)

Optimized for:
- Time-based queries
- Filtering by type/status
- User/school lookups
- Performance analysis

### Functions (1)

- **cleanup_old_monitoring_data** - Automated data retention

---

## 🎯 Success Criteria

Day 1 is complete when ALL of these are true:

✅ All 8 tables exist in Supabase  
✅ All 22 indexes created  
✅ Cleanup function works  
✅ Admin user created  
✅ API key generated  
✅ API key saved in 3+ locations  
✅ Verification script passes  
✅ Can query all tables  
✅ No errors in logs  
✅ Ready for Day 2

---

## 📝 Next Steps

### Immediate
1. ✅ Complete checklist above
2. ✅ Commit migration files to git
3. ✅ Update project documentation

### Tomorrow (Day 2)
1. Create error tracking system
2. Build error logging API
3. Add error capture to frontend
4. Test error flow

### This Week
- Day 3: Performance monitoring
- Day 4: User activity tracking
- Day 5: System health monitoring

---

## 📚 Reference Files

- **This Guide**: `EXECUTE-DAY-1-ADMIN-DASHBOARD-JAN-19-2026.md`
- **Completion Doc**: `DAY-1-ADMIN-DASHBOARD-COMPLETE-JAN-19-2026.md`
- **Quick Start**: `ADMIN-DASHBOARD-QUICK-START-JAN-19-2026.md`
- **Requirements**: `.kiro/specs/admin-dashboard/requirements.md`
- **Design**: `.kiro/specs/admin-dashboard/design.md`
- **Tasks**: `.kiro/specs/admin-dashboard/tasks.md`

---

## 🚀 Ready to Execute?

```bash
# Run all steps in sequence:
npm install bcryptjs
# [Run migrations in Supabase]
npm run admin:verify
export ADMIN_PASSWORD="YourSecurePassword123!"
npm run admin:seed
# [Save API key]
```

---

**Status**: ✅ Ready to Execute  
**Estimated Time**: 2 hours  
**Difficulty**: Easy  
**Next**: Day 2 - Error Tracking System

---

**Let's build this! 🚀**
