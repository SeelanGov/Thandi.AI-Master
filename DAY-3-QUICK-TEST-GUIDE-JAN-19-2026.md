# DAY 3: QUICK TEST GUIDE
**Performance Monitoring System Testing**

## 🚀 QUICK START

### Step 1: Start Dev Server
```bash
npm run dev
```
Wait for: `✓ Ready in X.Xs`

### Step 2: Run Tests (in new terminal)
```bash
npm run admin:test:performance
```

### Step 3: Verify Results
Expected output:
```
🧪 TESTING PERFORMANCE TRACKING SYSTEM
======================================

Test 1: Log performance metric
✅ PASSED - Performance metric logged successfully

Test 2: Log slow endpoint (>500ms)
✅ PASSED - Slow endpoint logged successfully

Test 3: Query performance metrics
✅ PASSED - Performance metrics queried successfully
   Found X metrics

Test 4: Query with statistics
✅ PASSED - Statistics retrieved
   Average Response Time: Xms
   Median Response Time: Xms
   P95: Xms
   P99: Xms
   Error Rate: X%

Test 5: Query slow endpoints (>500ms)
✅ PASSED - Slow endpoints queried successfully
   Found X slow endpoints

Test 6: Query trends
✅ PASSED - Trends retrieved
   Trend data points: X
   ✓ No degradation detected

Test 7: Invalid API key (should fail)
✅ PASSED - Invalid API key rejected correctly

Test 8: Missing required fields (should fail)
✅ PASSED - Validation working correctly

======================================
📊 TEST SUMMARY
======================================
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100%

🎉 ALL TESTS PASSED! Performance tracking system is working correctly.
```

## 🧪 WHAT'S BEING TESTED

1. **Performance Logging** - Can log metrics to database
2. **Slow Endpoint Detection** - Identifies endpoints >500ms
3. **Metrics Querying** - Can retrieve performance data
4. **Statistics** - Calculates avg, median, p95, p99, error rate
5. **Filtering** - Can filter slow endpoints
6. **Trend Analysis** - Detects performance trends and degradation
7. **Authentication** - Rejects invalid API keys
8. **Validation** - Rejects invalid input

## 🔍 MANUAL TESTING (Optional)

### Test Performance Logging
```bash
curl -X POST http://localhost:3000/api/admin/performance \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175" \
  -d '{
    "endpoint": "/api/test",
    "method": "GET",
    "response_time": 150,
    "status_code": 200
  }'
```

### Test Metrics Query
```bash
curl http://localhost:3000/api/admin/performance?include_stats=true \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

### Test Trends
```bash
curl http://localhost:3000/api/admin/performance/trends?period=hourly \
  -H "X-API-Key: kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175"
```

## ✅ SUCCESS CRITERIA

Day 3 is complete when:
- [x] All code implemented
- [ ] Dev server running
- [ ] All 8 tests passing (100%)
- [ ] No errors in console

## 🐛 TROUBLESHOOTING

### Tests fail with "fetch failed"
**Solution**: Start dev server first (`npm run dev`)

### "Invalid API key" errors
**Solution**: Check `.env.local` has `ADMIN_API_KEY` set

### Database connection errors
**Solution**: Verify Supabase credentials in `.env.local`

### No metrics returned
**Solution**: Run tests to generate sample data first

## 📊 EXPECTED METRICS

After running tests, you should see:
- 2+ performance metrics logged
- Statistics calculated correctly
- Slow endpoints identified (if any >500ms)
- Trends data available
- No degradation detected (fresh data)

## 🎯 NEXT STEPS

After all tests pass:
1. Review `DAY-3-PERFORMANCE-MONITORING-COMPLETE-JAN-19-2026.md`
2. Update `.kiro/specs/admin-dashboard/tasks.md`
3. Create context transfer document
4. Proceed to Day 4 (User Activity Tracking)
