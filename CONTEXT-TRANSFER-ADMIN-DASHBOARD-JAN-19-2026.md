# CONTEXT TRANSFER - ADMIN DASHBOARD - JAN 19, 2026

**Feature**: Thandi Admin Dashboard with Integrated Monitoring
**Status**: Spec Creation In Progress
**Created**: January 19, 2026

---

## 🎯 DECISION MADE

User has chosen **Option 3: Hybrid Approach** - Build integrated admin dashboard instead of using external monitoring tools (Sentry, LogRocket, etc.)

### Why This Decision?
1. **Cost Efficiency**: $0/month vs $26-46/month for external tools
2. **Data Ownership**: Keep all monitoring data in-house
3. **Custom Insights**: Tailored to Thandi's specific needs (student errors, school issues, RAG performance)
4. **POPIA Compliance**: Easier to maintain with no third-party data sharing
5. **Foundation for Future**: Admin dashboard becomes central ops center

---

## 🏗️ ARCHITECTURE OVERVIEW

### Admin Dashboard Structure
```
/admin (Thandi Internal Dashboard)
├── /overview - System health at a glance
├── /errors - Error tracking and logs
├── /performance - API response times, page loads
├── /users - Student/school activity
├── /schools - School dashboard metrics
└── /deployments - Deployment history and status
```

### Core Features (Week 1-2)

**1. Error Tracking**
- Store errors in Supabase database
- Real-time error dashboard
- Error frequency by type
- Affected users/schools tracking
- Quick filters and search

**2. Performance Monitoring**
- Track API response times
- Identify slow endpoints (>500ms)
- Monitor error rates by endpoint
- Trend analysis over time

**3. User Activity**
- Track key user actions
- Registration funnel metrics
- Assessment completion rates
- School dashboard usage

**4. System Health**
- Real-time API status
- Database connection monitoring
- RAG system performance
- Recent deployment tracking
- Active error alerts

---

## 📊 DATABASE SCHEMA

### New Tables Required

```sql
-- Error tracking
CREATE TABLE system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(50),
  message TEXT,
  stack_trace TEXT,
  user_id UUID,
  school_id VARCHAR(50),
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance metrics
CREATE TABLE api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  response_time INTEGER,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User activity
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50),
  user_id UUID,
  school_id VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System health checks
CREATE TABLE system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50),
  status VARCHAR(20),
  response_time INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 TECHNICAL DETAILS

### Key Components

**Authentication**:
- Admin-only access (separate from school dashboard)
- Magic link or password-based auth
- Role-based access (admin, developer, support)

**Real-Time Updates**:
- WebSocket or polling for live dashboard
- Auto-refresh every 30 seconds
- Manual refresh button

**Data Retention**:
- Errors: 90 days
- Performance metrics: 30 days
- User activity: 180 days
- System health: 7 days

**Alert System**:
- Email alerts for critical errors
- Threshold-based alerts (error rate > 5%)
- Daily summary emails

---

## 📝 IMPLEMENTATION PROGRESS

### Completed
- [x] Decision made: Build admin dashboard
- [x] Architecture designed
- [x] Database schema planned

### In Progress
- [ ] Creating requirements document
- [ ] Creating design document
- [ ] Creating tasks breakdown

### Planned
- [ ] Week 1-2: Implement admin dashboard
- [ ] Week 3-4: Add automated testing
- [ ] Week 5+: Begin school dashboard

---

## 🎯 SUCCESS CRITERIA

**Week 1-2 Goals**:
- [ ] Admin dashboard accessible at `/admin`
- [ ] Error logging functional
- [ ] Performance tracking active
- [ ] Real-time dashboard operational
- [ ] Email alerts configured

**Benefits Over External Tools**:
- ✅ Zero monthly costs
- ✅ Full data ownership
- ✅ Custom to Thandi's needs
- ✅ Better student/school insights
- ✅ POPIA compliant

---

## 🚨 KNOWN ISSUES

None - this is a new feature

---

## 📚 RESEARCH FINDINGS

**Monitoring Best Practices**:
- Store errors with full context (user, school, URL)
- Track performance at API endpoint level
- Monitor business metrics (registrations, assessments)
- Set up alerting thresholds
- Provide drill-down capabilities

**Technology Choices**:
- Database: Supabase (existing)
- Charts: Recharts or Chart.js
- Real-time: Polling (simpler than WebSockets)
- Alerts: Email via existing system

---

## 🎯 NEXT STEPS

1. **Create Admin Dashboard Spec** (Current)
   - Requirements document
   - Design document
   - Tasks breakdown

2. **Implement Admin Dashboard** (Week 1-2)
   - Database migrations
   - API endpoints
   - Dashboard UI
   - Alert system

3. **Add Automated Testing** (Week 3-4)
   - Playwright setup
   - E2E tests
   - CI/CD integration

4. **Begin School Dashboard** (Week 5+)
   - Phase 1: Foundation
   - Follow 32-task roadmap

---

**Document Version**: 1.0
**Last Updated**: January 19, 2026
**Status**: Spec Creation In Progress
