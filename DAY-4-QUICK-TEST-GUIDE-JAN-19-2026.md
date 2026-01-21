# Day 4: User Activity Tracking - Quick Test Guide

**Status**: ✅ COMPLETE | **Tests**: 8/8 (100%) | **Date**: January 19, 2026

---

## 🚀 QUICK TEST (30 seconds)

```bash
npm run admin:test:activity
```

**Expected Output**:
```
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100%
🎉 ALL TESTS PASSED!
```

---

## 🧪 WHAT'S BEING TESTED

### Test 1: Log Registration Activity
**Tests**: Activity logging with full context  
**Expected**: Activity logged successfully with ID

### Test 2: Log Assessment Completion
**Tests**: Different event type logging  
**Expected**: Activity logged successfully with ID

### Test 3: Deduplication
**Tests**: Duplicate prevention (1-minute window)  
**Expected**: Returns existing activity ID

### Test 4: Query Activities
**Tests**: Basic activity querying with pagination  
**Expected**: Returns activity list with pagination

### Test 5: Query with Statistics
**Tests**: Summary metrics calculation  
**Expected**: Returns activities + summary metrics

### Test 6: Funnel Metrics
**Tests**: Conversion rate calculation  
**Expected**: Returns funnel data with conversion rates

### Test 7: Invalid API Key
**Tests**: Authentication rejection  
**Expected**: 401 Unauthorized error

### Test 8: Missing Fields
**Tests**: Input validation  
**Expected**: 400 Bad Request with error message

---

## 📊 MANUAL TESTING

### 1. Log an Activity
```bash
curl -X POST http://localhost:3000/api/admin/activity \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "registration",
    "school_id": "SCHOOL123",
    "student_grade": 10,
    "event_data": {"test": true}
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "activity_id": "uuid-here",
  "deduplicated": false
}
```

### 2. Query Activities
```bash
curl http://localhost:3000/api/admin/activity?include_stats=true \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

**Expected Response**:
```json
{
  "success": true,
  "data": [...activities],
  "pagination": {...},
  "summary": {
    "total_events": 10,
    "unique_users": 5,
    "registrations": 3,
    ...
  }
}
```

### 3. Get Funnel Metrics
```bash
curl http://localhost:3000/api/admin/activity/funnel \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "funnel": {
      "registrations": 10,
      "assessments_started": 8,
      "assessments_completed": 7,
      ...
    },
    "conversion_rates": {
      "registration_to_assessment": 80,
      ...
    },
    "dropoffs": [...]
  }
}
```

---

## 🔍 TROUBLESHOOTING

### Issue: Tests Failing
**Check**:
1. Dev server running? (`npm run dev`)
2. Database accessible?
3. API key correct?

### Issue: UUID Errors
**Solution**: Use `null` for optional UUID fields, not strings

### Issue: Deduplication Not Working
**Solution**: Ensure `session_id` is consistent across requests

### Issue: Funnel Showing 0%
**Solution**: Log activities with correct event types first

---

## ✅ SUCCESS CRITERIA

All tests should pass with:
- ✅ 8/8 tests passing
- ✅ 100% success rate
- ✅ No errors in console
- ✅ Fast execution (<10 seconds)

---

## 📚 FULL DOCUMENTATION

- **Complete Guide**: `DAY-4-USER-ACTIVITY-TRACKING-COMPLETE-JAN-19-2026.md`
- **Session Summary**: `SESSION-SUMMARY-DAY-4-USER-ACTIVITY-JAN-19-2026.md`
- **Quick Reference**: `DAY-4-QUICK-REFERENCE-CARD-JAN-19-2026.md`
- **Context Transfer**: `CONTEXT-TRANSFER-DAY-4-COMPLETE-JAN-19-2026.md`

---

**Quick Test**: `npm run admin:test:activity`  
**Expected**: 8/8 tests passing (100%)  
**Status**: ✅ READY TO TEST
