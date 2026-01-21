# DAY 5: SYSTEM HEALTH MONITORING - QUICK REFERENCE

**Status**: ✅ COMPLETE | **Tests**: 8/8 PASSING | **Date**: January 20, 2026

---

## 🚀 QUICK START

### Run Health Checks
```bash
# Manual health check
curl -X POST http://localhost:3000/api/admin/health/check \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"

# Get health status
curl http://localhost:3000/api/admin/health \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"

# Run test suite
npm run admin:test:health
```

---

## 📋 API ENDPOINTS

### 1. Run Health Checks
```
POST /api/admin/health/check
Headers: X-API-Key: <api_key>

Response:
{
  "success": true,
  "data": {
    "overall_status": "healthy",
    "checks": [
      {
        "check_type": "database",
        "component_name": "Supabase Database",
        "status": "healthy",
        "response_time": 85,
        "error_message": null,
        "details": { ... }
      },
      ...
    ],
    "timestamp": "2026-01-20T10:30:00Z"
  }
}
```

### 2. Get Health Status
```
GET /api/admin/health
Headers: X-API-Key: <api_key>
Query Params:
  - component_name: Filter by component
  - check_type: Filter by check type
  - status: Filter by status
  - hours: Time range (default: 24)
  - limit: Max results (default: 100)

Response:
{
  "success": true,
  "data": {
    "current_status": {
      "overall_status": "healthy",
      "components": { ... },
      "last_check": "2026-01-20T10:30:00Z"
    },
    "recent_checks": [ ... ],
    "statistics": {
      "total_checks": 50,
      "healthy": 45,
      "degraded": 3,
      "unhealthy": 2,
      "avg_response_time": 250,
      "by_component": { ... }
    }
  }
}
```

### 3. Automated Health Checks (Cron)
```
GET /api/cron/health-check
Headers: Authorization: Bearer <cron_secret>

Runs every 5 minutes (configured in vercel.json)
```

---

## 🏗️ COMPONENTS CHECKED

### 1. Database (Supabase)
- **Check**: Simple query to admin_users table
- **Healthy**: <500ms
- **Degraded**: 500-1000ms
- **Unhealthy**: >1000ms or error

### 2. API Endpoints
- **Student Registration**: POST /api/student/register
- **RAG Query**: POST /api/rag/query
- **School Login**: POST /api/schools/login
- **Healthy**: <2000ms
- **Degraded**: >2000ms
- **Unhealthy**: 5xx errors

### 3. RAG System
- **Check**: Test query to RAG endpoint
- **Healthy**: <5000ms
- **Degraded**: >5000ms
- **Unhealthy**: Error or invalid response

---

## 📊 HEALTH STATUS LEVELS

| Status | Description | Action |
|--------|-------------|--------|
| **healthy** | All systems operating normally | None |
| **degraded** | Some systems slow but functional | Monitor |
| **unhealthy** | Systems failing or very slow | Alert |

---

## 🧪 TEST SUITE

```bash
npm run admin:test:health
```

**8 Tests:**
1. ✅ Run health checks
2. ✅ Get health status
3. ✅ Get health status with filters
4. ✅ Get health status with time range
5. ✅ Get health status by component
6. ✅ Verify health check storage
7. ✅ Invalid API key rejection
8. ✅ Health check response structure

**Success Rate**: 100% (8/8 passing)

---

## 📁 FILES CREATED

```
lib/admin/
  └── health-checker.js              (350 lines)

app/api/admin/health/
  ├── check/route.js                 (50 lines)
  └── route.js                       (120 lines)

app/api/cron/
  └── health-check/route.js          (80 lines)

scripts/
  └── test-health-monitoring-system.js (350 lines)
```

---

## 🔧 CONFIGURATION

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_API_KEY=kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175

# For cron job
CRON_SECRET=dev_cron_secret_change_in_production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Cron Configuration
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/health-check",
    "schedule": "*/5 * * * *"
  }]
}
```

---

## 💡 USAGE EXAMPLES

### Check Database Health
```javascript
const response = await fetch('/api/admin/health?check_type=database', {
  headers: { 'X-API-Key': apiKey }
});
const data = await response.json();
console.log(data.data.current_status.overall_status);
```

### Get Component Statistics
```javascript
const response = await fetch('/api/admin/health?component_name=Supabase Database', {
  headers: { 'X-API-Key': apiKey }
});
const data = await response.json();
const dbStats = data.data.statistics.by_component['Supabase Database'];
console.log(`Database: ${dbStats.healthy}/${dbStats.total} healthy checks`);
```

### Monitor Last Hour
```javascript
const response = await fetch('/api/admin/health?hours=1&limit=50', {
  headers: { 'X-API-Key': apiKey }
});
const data = await response.json();
console.log(`Checks in last hour: ${data.data.recent_checks.length}`);
```

---

## 🎯 KEY FEATURES

✅ **Comprehensive Monitoring**
- Database connectivity
- API endpoint availability
- RAG system health

✅ **Intelligent Status Detection**
- Response time based
- Error detection
- Degradation alerts

✅ **Historical Tracking**
- All checks stored
- Statistics calculated
- Trend analysis ready

✅ **Flexible Querying**
- Filter by component
- Filter by time range
- Filter by status

✅ **Automated Checks**
- Runs every 5 minutes
- Stores results automatically
- Ready for alerting (Day 6)

---

## 🔄 NEXT: DAY 6 - ALERT SYSTEM

**What's Coming:**
- Alert configuration API
- Alert evaluation engine
- Email notification service
- Alert history tracking
- Automated alert checks

**Integration with Day 5:**
- Detect unhealthy components
- Trigger alerts automatically
- Send email notifications
- Track alert history

---

**Quick Reference Created**: January 20, 2026  
**For**: Admin Dashboard Day 5 Implementation  
**Status**: ✅ COMPLETE - All systems operational
