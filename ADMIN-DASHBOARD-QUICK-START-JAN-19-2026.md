# Admin Dashboard - Quick Start Guide

**Created**: January 19, 2026  
**Purpose**: Fast reference for starting implementation  
**Estimated Time**: 2 weeks (10 working days)

---

## 📋 Pre-Implementation Checklist

Before starting, ensure you have:

- [ ] Reviewed `.kiro/specs/admin-dashboard/requirements.md`
- [ ] Reviewed `.kiro/specs/admin-dashboard/design.md`
- [ ] Reviewed `.kiro/specs/admin-dashboard/tasks.md`
- [ ] Supabase project access
- [ ] Vercel project access
- [ ] Email service configured
- [ ] Development environment ready

---

## 🚀 Day 1: Database Schema (Start Here)

### Step 1: Create Migration File

```bash
# Create migration file
touch supabase/migrations/20260119_admin_dashboard_schema.sql
```

### Step 2: Copy Schema from Design Doc

Open `.kiro/specs/admin-dashboard/design.md` and copy the complete database schema to the migration file.

**Tables to create**:
1. `admin_users`
2. `system_errors` (with 6 indexes)
3. `api_metrics` (with 4 indexes)
4. `user_activity` (with 4 indexes)
5. `system_health_checks` (with 3 indexes)
6. `alert_configurations`
7. `alert_history` (with 3 indexes)
8. `admin_audit_log` (with 2 indexes)

### Step 3: Create Cleanup Function

```bash
# Create cleanup migration
touch supabase/migrations/20260119_admin_dashboard_cleanup.sql
```

Copy the `cleanup_old_monitoring_data()` function from design doc.

### Step 4: Run Migrations Locally

```bash
# Run migrations
npm run db:migrate

# Verify tables created
npm run db:verify
```

### Step 5: Create Admin Seed Script

```bash
# Create seed script
touch scripts/seed-admin-user.js
```

```javascript
// scripts/seed-admin-user.js
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seedAdminUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Generate secure password hash
  const password = process.env.ADMIN_PASSWORD || 'change_me_immediately';
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate API key for Kiro AI
  const kiroApiKey = `kiro_${crypto.randomBytes(32).toString('hex')}`;

  // Insert admin user
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email: 'admin@thandi.co.za',
      password_hash: passwordHash,
      api_key: kiroApiKey,
      role: 'admin'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully');
  console.log('📧 Email:', data.email);
  console.log('🔑 API Key (save this for Kiro AI):', kiroApiKey);
  console.log('⚠️  Change password immediately after first login');
}

seedAdminUser();
```

### Step 6: Run Seed Script

```bash
# Set admin password
export ADMIN_PASSWORD="your_secure_password_here"

# Run seed script
node scripts/seed-admin-user.js

# Save the API key output for Kiro AI
```

### Day 1 Completion Checklist

- [ ] All 8 tables created
- [ ] All indexes created
- [ ] Cleanup function created
- [ ] Admin user seeded
- [ ] API key saved for Kiro AI
- [ ] Migrations verified

---

## 📅 Week 1 Overview

### Day 2: Error Tracking System
**Files to create**:
- `app/api/admin/errors/log/route.js`
- `app/api/admin/errors/route.js`
- `app/api/admin/errors/[id]/route.js`
- `lib/admin/error-logger.js`
- `lib/admin/error-queries.js`

**Key tasks**:
- Create error logging API
- Implement deduplication
- Add error capture to frontend
- Test error flow

### Day 3: Performance Monitoring
**Files to create**:
- `lib/admin/performance-middleware.js`
- `app/api/admin/performance/route.js`
- `app/api/admin/performance/trends/route.js`
- `lib/admin/performance-analyzer.js`

**Key tasks**:
- Create performance middleware
- Track all API requests
- Calculate statistics
- Identify slow endpoints

### Day 4: User Activity Tracking
**Files to create**:
- `lib/admin/activity-logger.js`
- `app/api/admin/activity/route.js`
- `app/api/admin/activity/funnel/route.js`
- `lib/admin/activity-analyzer.js`

**Key tasks**:
- Create activity logger
- Integrate tracking points
- Calculate funnel metrics
- Test activity flow

### Day 5: System Health Monitoring
**Files to create**:
- `lib/admin/health-checker.js`
- `app/api/admin/health/check/route.js`
- `app/api/admin/health/route.js`
- `app/api/cron/health-check/route.js`

**Key tasks**:
- Create health checker
- Check all components
- Schedule automated checks
- Test health monitoring

---

## 📅 Week 2 Overview

### Day 6: Alert System
**Files to create**:
- `lib/admin/alert-engine.js`
- `lib/admin/email-service.js`
- `app/api/admin/alerts/config/route.js`
- `app/api/admin/alerts/route.js`
- `app/api/cron/check-alerts/route.js`

**Key tasks**:
- Create alert engine
- Set up email notifications
- Configure alert thresholds
- Schedule alert checks

### Day 7: Dashboard UI - Overview
**Files to create**:
- `app/admin/layout.js`
- `app/admin/page.js`
- `components/admin/AdminLayout.jsx`
- `components/admin/MetricCard.jsx`
- `components/admin/DashboardOverview.jsx`
- `app/api/admin/dashboard/overview/route.js`

**Key tasks**:
- Create admin layout
- Build overview page
- Display 6 metric cards
- Add real-time updates

### Day 8: Dashboard UI - Detail Pages
**Files to create**:
- `app/admin/errors/page.js`
- `app/admin/errors/[id]/page.js`
- `app/admin/performance/page.js`
- `app/admin/activity/page.js`
- `components/admin/ErrorsList.jsx`
- `components/admin/PerformanceCharts.jsx`
- `components/admin/ActivityCharts.jsx`

**Key tasks**:
- Build errors page
- Build performance page
- Build activity page
- Add charts and filtering

### Day 9: Authentication and Testing
**Files to create**:
- `app/admin/login/page.js`
- `app/api/admin/auth/login/route.js`
- `lib/admin/auth.js`
- `middleware/admin-auth.js`
- `middleware/api-key-auth.js`
- `__tests__/admin/*.test.js`

**Key tasks**:
- Implement authentication
- Add API key validation
- Write unit tests
- Write integration tests

### Day 10: Documentation and Deployment
**Files to create**:
- `docs/admin-dashboard-api.md`
- `docs/admin-dashboard-user-guide.md`
- `docs/admin-dashboard-kiro-integration.md`

**Key tasks**:
- Write documentation
- Deploy to production
- Configure alerts
- Test in production

---

## 🔑 Environment Variables

Add these to `.env.local` and Vercel:

```bash
# Admin Dashboard
ADMIN_PASSWORD=your_secure_password_here
KIRO_API_KEY=kiro_[generated_from_seed_script]

# Email Service (for alerts)
EMAIL_SERVICE_API_KEY=your_email_service_key
ALERT_EMAIL_FROM=alerts@thandi.co.za
ALERT_EMAIL_TO=admin@thandi.co.za
```

---

## 🧪 Testing Commands

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Test specific component
npm test -- error-logger

# Watch mode
npm test -- --watch
```

---

## 📊 Success Metrics

Track these throughout implementation:

### Performance
- [ ] Dashboard loads in <1 second
- [ ] API responses in <500ms
- [ ] Real-time updates within 30 seconds

### Functionality
- [ ] All errors captured
- [ ] All API requests tracked
- [ ] All user actions logged
- [ ] Health checks running every 5 minutes
- [ ] Alerts triggering correctly

### Quality
- [ ] >90% test coverage
- [ ] All tests passing
- [ ] No console errors
- [ ] No build warnings

---

## 🚨 Common Issues and Solutions

### Issue 1: Migration Fails
**Solution**: Check Supabase connection, verify SQL syntax, check for existing tables

### Issue 2: API Key Not Working
**Solution**: Verify API key in database, check middleware, verify headers

### Issue 3: Dashboard Not Loading
**Solution**: Check authentication, verify API endpoints, check browser console

### Issue 4: Alerts Not Sending
**Solution**: Verify email service config, check alert thresholds, verify cron job

---

## 📚 Key Documentation References

1. **Requirements**: `.kiro/specs/admin-dashboard/requirements.md`
2. **Design**: `.kiro/specs/admin-dashboard/design.md`
3. **Tasks**: `.kiro/specs/admin-dashboard/tasks.md`
4. **Session Summary**: `SESSION-SUMMARY-ADMIN-DASHBOARD-DECISION-JAN-19-2026.md`

---

## 🤖 Kiro AI Integration

### After Implementation

1. **Save API Key**:
   ```bash
   # Add to Kiro AI environment
   export THANDI_ADMIN_API_KEY="kiro_[your_key_here]"
   ```

2. **Test API Access**:
   ```bash
   # Test error query
   curl -H "X-API-Key: $THANDI_ADMIN_API_KEY" \
     https://thandi.co.za/api/admin/errors
   ```

3. **Set Up Monitoring**:
   - Kiro AI checks health every 5 minutes
   - Kiro AI queries errors on deployment
   - Kiro AI analyzes performance trends daily

---

## ✅ Final Deployment Checklist

Before marking complete:

- [ ] All 8 tables created in production
- [ ] Admin user created
- [ ] Kiro AI API key generated and saved
- [ ] All API endpoints responding
- [ ] Dashboard accessible at /admin
- [ ] Authentication working
- [ ] Alerts configured
- [ ] Cron jobs scheduled
- [ ] Documentation complete
- [ ] Kiro AI can access APIs
- [ ] All tests passing
- [ ] Performance targets met

---

## 🎯 Quick Commands

```bash
# Start Day 1
npm run admin:setup:day1

# Run migrations
npm run db:migrate

# Seed admin user
npm run db:seed:admin

# Start development
npm run dev

# Test admin dashboard
npm run test:admin

# Deploy to production
npm run deploy:admin
```

---

## 📞 Support

If you encounter issues:

1. Check the detailed task breakdown in `tasks.md`
2. Review the design document for technical details
3. Check the requirements for acceptance criteria
4. Test incrementally at each step

---

**Ready to Start?** → Begin with Day 1: Database Schema

**Questions?** → Review `.kiro/specs/admin-dashboard/` documentation

**Stuck?** → Check the design document for implementation details

---

**Good luck with implementation! 🚀**
