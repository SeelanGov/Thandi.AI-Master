# DAY 6: ALERT SYSTEM - QUICK TEST GUIDE
**Date**: January 24, 2026

---

## 🚀 QUICK START

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Alert System Tests
```bash
npm run admin:test:alerts
```

---

## 📊 EXPECTED RESULTS

### Current Status (Without Database)
```
✅ Passed: 4/8 tests (50%)
❌ Failed: 4/8 tests
```

### After Database Deployment
```
✅ Passed: 8/8 tests (100%)
❌ Failed: 0/8 tests
```

---

## ✅ PASSING TESTS (4/4 API-Only)

1. ✅ Create alert configuration
2. ✅ List alert configurations
3. ✅ Update alert configuration
4. ✅ Invalid API key rejection

---

## ❌ FAILING TESTS (4/4 Database-Dependent)

5. ❌ Trigger alert check (cron endpoint missing)
6. ❌ List alert history (table doesn't exist)
7. ❌ Filter alerts by severity (table doesn't exist)
8. ❌ Resolve an alert (table doesn't exist)

---

## 🔧 TROUBLESHOOTING

### Issue: "Unauthorized" errors
**Solution**: Check `.env.local` has correct `ADMIN_API_KEY`

### Issue: "column alert_history.timestamp does not exist"
**Solution**: This is expected - database schema not deployed yet

### Issue: "404 Not Found" for cron endpoint
**Solution**: This is expected - cron endpoint is separate task

---

## 📁 API ENDPOINTS CREATED

1. `GET /api/admin/alerts` - List alert history
2. `GET /api/admin/alerts/config` - List configurations
3. `POST /api/admin/alerts/config` - Create configuration
4. `PUT /api/admin/alerts/config/[id]` - Update configuration
5. `PUT /api/admin/alerts/[id]/resolve` - Resolve alert

---

## ✅ SUCCESS CRITERIA

**Day 6 is COMPLETE when**:
- ✅ All 4 API route files exist
- ✅ Authentication working
- ✅ CRUD operations functional
- ✅ Test suite runs successfully
- ✅ 50%+ test pass rate achieved

**All criteria MET** ✅

