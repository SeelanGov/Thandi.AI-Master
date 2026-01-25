# Day 5 Health Routes - Quick Test Guide

**Date**: January 23, 2026  
**Status**: Ready for Testing

---

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```

Wait for: `✓ Ready in X.XXs`

### 2. Run Health Monitoring Tests
```bash
# In a new terminal
npm run admin:test:health
```

**Expected Result**: 8/8 tests passing (100% success rate)

---

## Manual Testing

### Test 1: Run Health Check (POST)
```bash
curl -X POST http://localhost:3000/api/admin/health/check \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "overallStatus": "healthy",
  "summary": {
    "total": 3,
    "healthy": 3,
    "degraded": 0,
    "unhealthy": 0,
    "averageResponseTime": 205
  },
  "results": [...],
  "timestamp": "2026-01-23T...",
  "stored": true
}
```

### Test 2: Get Health Status (GET)
```bash
curl http://localhost:3000/api/admin/health \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

**Expected Response**:
```json
{
  "success": true,
  "overallStatus": "healthy",
  "summary": {
    "total": 10,
    "healthy": 8,
    "degraded": 1,
    "unhealthy": 1
  },
  "latestByComponent": {...},
  "recentChecks": [...],
  "timestamp": "2026-01-23T..."
}
```

### Test 3: Filter by Component
```bash
curl "http://localhost:3000/api/admin/health?component=database" \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

### Test 4: Invalid API Key (Should Fail)
```bash
curl http://localhost:3000/api/admin/health \
  -H "X-API-Key: invalid_key"
```

**Expected Response**: 401 Unauthorized

---

## Test Checklist

- [ ] Development server running
- [ ] Automated tests passing (8/8)
- [ ] POST /api/admin/health/check works
- [ ] GET /api/admin/health works
- [ ] Filtering works
- [ ] Authentication works
- [ ] Invalid API key rejected

---

## Troubleshooting

### Issue: Tests Fail with "Connection Refused"
**Solution**: Make sure development server is running (`npm run dev`)

### Issue: 401 Unauthorized
**Solution**: Check that ADMIN_API_KEY is set in `.env.local`:
```
ADMIN_API_KEY=kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175
```

### Issue: Database Errors
**Solution**: Verify Supabase connection in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## Success Criteria

✅ All 8 automated tests passing  
✅ Both endpoints responding correctly  
✅ Authentication working  
✅ Data being stored in database  
✅ Filtering working correctly

---

## Next Steps After Testing

1. ✅ Tests pass locally
2. ⏳ Commit changes to git
3. ⏳ Deploy to Vercel
4. ⏳ Test in production
5. ⏳ Update Day 5 status to "VERIFIED"

---

**Ready to test!** Run `npm run admin:test:health` to verify the implementation.
