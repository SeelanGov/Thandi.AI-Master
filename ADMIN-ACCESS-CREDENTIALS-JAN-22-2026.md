# THANDI ADMIN ACCESS CREDENTIALS
**Date**: January 22, 2026  
**Status**: PRODUCTION READY  
**System**: Thandi Admin Dashboard

---

## 🔐 ADMIN LOGIN CREDENTIALS

### Current Status
⚠️ **ADMIN USER NOT YET CREATED**

The admin authentication system is deployed and ready, but you need to create the first admin user account.

---

## 📋 SETUP REQUIRED

### Step 1: Run Database Migrations

The admin dashboard requires 8 database tables. Run these migrations in Supabase:

1. Go to: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql
2. Run migration file: `supabase/migrations/20260119_admin_dashboard_schema.sql`
3. Run cleanup file: `supabase/migrations/20260119_admin_dashboard_cleanup.sql`

**Tables Created**:
- `admin_users` - Admin user accounts
- `admin_errors` - Error tracking
- `admin_performance_logs` - Performance monitoring
- `admin_activity_logs` - User activity tracking
- `admin_health_checks` - System health monitoring
- `admin_alerts` - Alert configurations
- `admin_alert_configs` - Alert settings
- `admin_api_keys` - API key management
- `admin_audit_log` - Audit trail

---

### Step 2: Create Admin User Manually

Since the seed script doesn't exist yet, create your admin user directly in Supabase:

#### Option A: Using Supabase SQL Editor

```sql
-- 1. Generate password hash (use bcrypt with 10 rounds)
-- You'll need to hash your password first using bcrypt
-- Example: bcrypt.hash('YourSecurePassword123!', 10)

-- 2. Insert admin user
INSERT INTO admin_users (
  email,
  password_hash,
  name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin@thandi.online',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',  -- Replace with actual bcrypt hash
  'System Administrator',
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- 3. Generate API key for Kiro AI
INSERT INTO admin_api_keys (
  key_name,
  api_key,
  permissions,
  is_active,
  created_at
) VALUES (
  'Kiro AI Access',
  'kiro_' || encode(gen_random_bytes(32), 'hex'),  -- Generates random API key
  ARRAY['read:errors', 'read:performance', 'read:activity', 'read:health'],
  true,
  NOW()
);

-- 4. Retrieve the generated API key
SELECT api_key FROM admin_api_keys WHERE key_name = 'Kiro AI Access';
```

#### Option B: Create Password Hash Using Node.js

Create a temporary script to generate the password hash:

```javascript
// generate-admin-password.js
const bcrypt = require('bcryptjs');

const password = 'YourSecurePassword123!'; // Change this
const hash = bcrypt.hashSync(password, 10);

console.log('Password Hash:', hash);
console.log('\nUse this hash in the SQL INSERT statement above');
```

Run it:
```bash
node generate-admin-password.js
```

---

## 🎯 RECOMMENDED CREDENTIALS

### Admin User
- **Email**: `admin@thandi.online`
- **Password**: Choose a secure password (min 12 characters)
- **Name**: System Administrator
- **Role**: super_admin

### Password Requirements
- Minimum 12 characters
- Include uppercase and lowercase letters
- Include numbers
- Include special characters
- Example: `Thandi@Admin2026!Secure`

---

## 🔑 API KEY FOR KIRO AI

After creating the admin user, you'll have an API key for Kiro AI to access the dashboard programmatically.

**API Key Format**: `kiro_[64-character-hex-string]`

**Usage**:
```bash
# Test API access
curl -H "X-API-Key: YOUR_API_KEY" https://www.thandi.online/api/admin/health

# Get errors
curl -H "X-API-Key: YOUR_API_KEY" https://www.thandi.online/api/admin/errors

# Get performance metrics
curl -H "X-API-Key: YOUR_API_KEY" https://www.thandi.online/api/admin/performance
```

---

## 🌐 ACCESS URLS

### Production URLs
- **Admin Login**: https://www.thandi.online/admin/login
- **Admin Dashboard**: https://www.thandi.online/admin
- **API Health Check**: https://www.thandi.online/api/admin/health

### Dashboard Pages
- **Overview**: https://www.thandi.online/admin
- **Errors**: https://www.thandi.online/admin/errors
- **Performance**: https://www.thandi.online/admin/performance
- **Activity**: https://www.thandi.online/admin/activity

---

## 🔒 SECURITY FEATURES

### Authentication
✅ JWT-based authentication
✅ HttpOnly cookies (XSS protection)
✅ Bcrypt password hashing (10 rounds)
✅ 24-hour session expiration
✅ Secure cookie in production

### Authorization
✅ Role-based access control (RBAC)
✅ API key authentication for Kiro AI
✅ Audit logging for all admin actions
✅ IP address tracking
✅ User agent logging

### Session Management
✅ Automatic session expiration
✅ Logout functionality
✅ Session verification on protected routes
✅ Last login tracking

---

## 📊 ADMIN ROLES

### super_admin (Recommended)
- Full access to all features
- Can manage other admin users
- Can configure alerts
- Can view all logs and metrics

### admin
- Read access to all metrics
- Cannot manage other users
- Cannot configure alerts
- Can view logs and metrics

### viewer
- Read-only access
- Cannot modify anything
- Can view dashboards only

---

## 🚨 IMPORTANT SECURITY NOTES

### DO NOT:
❌ Share admin credentials
❌ Use weak passwords
❌ Store passwords in plain text
❌ Commit credentials to git
❌ Use the same password across systems

### DO:
✅ Use a password manager
✅ Enable 2FA (when available)
✅ Rotate passwords regularly
✅ Monitor audit logs
✅ Use API keys for programmatic access

---

## 🔧 ENVIRONMENT VARIABLES

These are already set in production:

```bash
# JWT Secret (for token signing)
JWT_SECRET=thandi-jwt-secret-key-2025-production-ready

# Database Connection
DATABASE_URL=postgresql://postgres:***@db.pvvnxupuukuefajypovz.supabase.co:5432/postgres

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL=https://pvvnxupuukuefajypovz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 NEXT STEPS

### Immediate (Today)
1. [ ] Run database migrations in Supabase
2. [ ] Generate password hash using bcrypt
3. [ ] Create admin user in `admin_users` table
4. [ ] Generate API key in `admin_api_keys` table
5. [ ] Test login at https://www.thandi.online/admin/login
6. [ ] Save credentials securely (password manager)

### Week 1
1. [ ] Configure alert thresholds
2. [ ] Set up cron jobs in Vercel
3. [ ] Test Kiro AI API access
4. [ ] Monitor dashboard performance
5. [ ] Review audit logs

---

## 🆘 TROUBLESHOOTING

### Cannot Login
**Check**:
1. Admin user exists in `admin_users` table
2. `is_active` is set to `true`
3. Password hash is correct (bcrypt format)
4. JWT_SECRET is set in Vercel environment variables
5. Browser cookies are enabled

### API Key Not Working
**Check**:
1. API key exists in `admin_api_keys` table
2. `is_active` is set to `true`
3. Permissions array includes required scopes
4. X-API-Key header is being sent correctly
5. API key format is correct (starts with `kiro_`)

### Dashboard Not Loading
**Check**:
1. Database migrations ran successfully
2. All 8 admin tables exist
3. Vercel deployment is successful
4. No errors in Vercel logs
5. Environment variables are set

---

## 📞 SUPPORT

### Documentation
- **API Reference**: Check `/api/admin/*` endpoints
- **User Guide**: See admin dashboard UI
- **Database Schema**: Check migration files

### Quick Commands
```bash
# Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%';

# Check admin user
SELECT id, email, name, role, is_active, created_at 
FROM admin_users;

# Check API keys
SELECT id, key_name, permissions, is_active, created_at 
FROM admin_api_keys;

# View recent audit logs
SELECT * FROM admin_audit_log 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ VERIFICATION CHECKLIST

### Database Setup
- [ ] Migrations run successfully
- [ ] 8 admin tables created
- [ ] Admin user created
- [ ] API key generated

### Authentication
- [ ] Can access login page
- [ ] Can login with credentials
- [ ] Redirects to dashboard after login
- [ ] Protected routes require authentication

### Dashboard Access
- [ ] Overview page loads
- [ ] Errors page loads
- [ ] Performance page loads
- [ ] Activity page loads
- [ ] Navigation works

### API Access
- [ ] Health endpoint responds
- [ ] API key authentication works
- [ ] Kiro AI can access metrics
- [ ] Audit logs are created

---

**Status**: ⚠️ SETUP REQUIRED  
**Priority**: HIGH  
**Estimated Time**: 15 minutes  
**Next Action**: Run database migrations and create admin user

---

**Document Created**: January 22, 2026  
**Last Updated**: January 22, 2026  
**Version**: 1.0
