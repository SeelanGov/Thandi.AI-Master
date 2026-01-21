# DAY 2: QUICK REFERENCE CARD
**Error Tracking System** | January 19, 2026

---

## 🚀 QUICK START

```bash
# Test the system
npm run admin:test:errors

# Start dev server
npm run dev
```

---

## 📡 API ENDPOINTS

### 1. Log Error
```bash
POST /api/admin/errors/log
Header: X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
Body: { error_type, message, feature_area, severity }
```

### 2. Query Errors
```bash
GET /api/admin/errors?page=1&limit=50&feature_area=registration
Header: X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
```

### 3. Get Error Details
```bash
GET /api/admin/errors/{id}
Header: X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
```

### 4. Resolve Error
```bash
PUT /api/admin/errors/{id}
Header: X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
Body: { action: "resolve", admin_user_id: "uuid" }
```

---

## 🔍 QUERY FILTERS

- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `severity` - error | warning | critical
- `error_type` - TypeError, NetworkError, etc.
- `school_id` - Filter by school
- `feature_area` - registration | assessment | results | rag
- `start_date` - ISO date string
- `end_date` - ISO date string
- `resolved` - true | false
- `user_id` - Filter by user
- `include_stats` - true | false

---

## 📂 KEY FILES

### Libraries
- `lib/admin/error-logger.js` - Error logging
- `lib/admin/error-queries.js` - Error queries

### API Routes
- `app/api/admin/errors/log/route.js` - Log endpoint
- `app/api/admin/errors/route.js` - Query endpoint
- `app/api/admin/errors/[id]/route.js` - Details endpoint

### Testing
- `scripts/test-error-tracking-system.js` - Test suite

---

## 🧪 TESTING

```bash
# Run all tests
npm run admin:test:errors

# Expected: 8/8 tests passing
```

---

## 🔑 CREDENTIALS

```
API Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
Location: .env.local (ADMIN_API_KEY)
```

---

## ✅ STATUS

- ✅ Day 1: Database Schema
- ✅ Day 2: Error Tracking
- ⏳ Day 3: Performance Monitoring (NEXT)

**Progress**: 20% (2/10 days)

---

## 🚀 NEXT: DAY 3

**Task**: Performance Monitoring  
**Time**: 4-6 hours  
**Files**: 4 new files, 1 modified

---

## 📞 HELP

**Issue**: Unauthorized  
**Fix**: Check ADMIN_API_KEY in .env.local

**Issue**: Database error  
**Fix**: Verify Supabase credentials

**Issue**: Test failures  
**Fix**: Ensure dev server running

---

**Quick Test**: `npm run admin:test:errors` ✅

