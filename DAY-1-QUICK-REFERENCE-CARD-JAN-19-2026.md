# Day 1 Quick Reference Card

**Admin Dashboard Database Setup**  
**Estimated Time**: 2 hours  
**Status**: Ready to Execute

---

## ⚡ Quick Execute (Copy-Paste)

```bash
# 1. Install dependency
npm install bcryptjs

# 2. Run migrations in Supabase SQL Editor
# - Copy supabase/migrations/20260119_admin_dashboard_schema.sql
# - Run in Supabase
# - Copy supabase/migrations/20260119_admin_dashboard_cleanup.sql
# - Run in Supabase

# 3. Verify
npm run admin:verify

# 4. Seed admin user
export ADMIN_PASSWORD="YourSecurePassword123!"
npm run admin:seed

# 5. SAVE THE API KEY OUTPUT!
```

---

## 📊 What Gets Created

- **8 Tables**: admin_users, system_errors, api_metrics, user_activity, system_health_checks, alert_configurations, alert_history, admin_audit_log
- **22 Indexes**: Optimized for time-based queries and filtering
- **1 Function**: cleanup_old_monitoring_data()
- **1 Admin User**: admin@thandi.co.za
- **1 API Key**: kiro_[64_chars] for Kiro AI

---

## ✅ Success Checklist

- [ ] bcryptjs installed
- [ ] Migrations ran successfully
- [ ] Verification script passed
- [ ] Admin user created
- [ ] API key saved in 3+ places
- [ ] Can query all tables

---

## 🔑 Save API Key In

1. `.env.local`: `KIRO_API_KEY="kiro_..."`
2. Vercel: Environment Variables
3. Password Manager
4. Kiro AI: `export THANDI_ADMIN_API_KEY="kiro_..."`

---

## 🐛 Quick Troubleshooting

**Migration fails**: Check Supabase connection, verify SQL syntax  
**Verification fails**: Confirm migrations ran, check environment variables  
**Seed fails**: Check if user exists, verify password length (12+ chars)  
**API key lost**: Re-run seed after deleting existing user

---

## 📚 Full Documentation

- **Execution Guide**: `EXECUTE-DAY-1-ADMIN-DASHBOARD-JAN-19-2026.md`
- **Completion Doc**: `DAY-1-ADMIN-DASHBOARD-COMPLETE-JAN-19-2026.md`
- **Session Summary**: `SESSION-SUMMARY-DAY-1-IMPLEMENTATION-JAN-19-2026.md`

---

## 🚀 Next Steps

**After Day 1**: Proceed to Day 2 - Error Tracking System  
**Timeline**: 2 weeks total (10 working days)  
**Goal**: Full admin monitoring dashboard with Kiro AI integration

---

**Ready? Let's execute! 🎯**
