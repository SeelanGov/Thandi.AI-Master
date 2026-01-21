# DAY 2: QUICK TEST GUIDE
**Date**: January 19, 2026  
**Task**: Test Error Tracking System

---

## 🚀 QUICK START

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Test Suite
```bash
# In a new terminal
node scripts/test-error-tracking-system.js
```

---

## 🧪 MANUAL TESTING

### Test 1: Log an Error
```bash
curl -X POST http://localhost:3000/api/admin/errors/log \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175" \
  -d '{
    "error_type": "TypeError",
    "message": "Test error from curl",
    "feature_area": "registration",
    "severity": "error"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "error_id": "uuid-here",
  "deduplicated": false
}
```

### Test 2: Query Errors
```bash
curl http://localhost:3000/api/admin/errors?page=1&limit=10 \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

**Expected Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### Test 3: Get Error Details
```bash
# Replace {error_id} with actual error ID from Test 1
curl http://localhost:3000/api/admin/errors/{error_id} \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

### Test 4: Query with Statistics
```bash
curl "http://localhost:3000/api/admin/errors?include_stats=true&limit=5" \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

---

## ✅ SUCCESS CRITERIA

All tests should:
- ✅ Return `"success": true`
- ✅ Return expected data structure
- ✅ Complete in <500ms
- ✅ Handle errors gracefully

---

## 🔍 TROUBLESHOOTING

### Issue: "Unauthorized - Invalid API key"
**Solution**: Check `.env.local` has `ADMIN_API_KEY` set correctly

### Issue: "Failed to log error to database"
**Solution**: 
1. Check Supabase connection in `.env.local`
2. Verify `system_errors` table exists in Supabase
3. Check Supabase dashboard for errors

### Issue: Test script fails to connect
**Solution**: 
1. Ensure dev server is running (`npm run dev`)
2. Check port 3000 is not in use
3. Verify no firewall blocking localhost

---

## 📊 EXPECTED TEST RESULTS

```
🧪 TESTING ERROR TRACKING SYSTEM
================================

Test 1: Log an error
✅ PASSED - Error logged successfully

Test 2: Log duplicate error (deduplication)
✅ PASSED - Error deduplicated correctly

Test 3: Query errors
✅ PASSED - Errors queried successfully

Test 4: Query errors with filters
✅ PASSED - Filtered query successful

Test 5: Get error by ID
✅ PASSED - Error details retrieved

Test 6: Query with statistics
✅ PASSED - Statistics retrieved

Test 7: Invalid API key (should fail)
✅ PASSED - Invalid API key rejected correctly

Test 8: Missing required fields (should fail)
✅ PASSED - Validation working correctly

================================
📊 TEST SUMMARY
================================
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100%

🎉 ALL TESTS PASSED! Error tracking system is working correctly.
```

---

## 🎯 NEXT STEPS

After successful testing:
1. ✅ Mark Day 2 as complete
2. ✅ Update tasks.md
3. ✅ Create context transfer document
4. ⏳ Begin Day 3: Performance Monitoring

---

**Ready to test? Run: `node scripts/test-error-tracking-system.js`** 🚀

