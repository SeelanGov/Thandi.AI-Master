# DAY 8: QUICK TEST GUIDE
**Date**: January 20, 2026  
**Purpose**: Quick reference for testing Day 8 dashboard pages

---

## 🚀 QUICK START

### 1. Start Development Server
```bash
npm run dev
```

### 2. Run Automated Tests
```bash
npm run admin:test:day8
```

### 3. Manual Browser Testing
Open browser and test these URLs:
- http://localhost:3000/admin/performance
- http://localhost:3000/admin/activity

---

## 📋 MANUAL TEST CHECKLIST

### Performance Page (`/admin/performance`)
- [ ] Page loads without errors
- [ ] Date range filters display correctly
- [ ] Start date and end date inputs work
- [ ] Refresh button works
- [ ] Summary statistics display (avg, median, p95, p99)
- [ ] Endpoint breakdown table displays
- [ ] Slow endpoints section displays
- [ ] Loading state shows while fetching
- [ ] Error state shows if API fails
- [ ] Real-time updates work (wait 30s)

### Activity Page (`/admin/activity`)
- [ ] Page loads without errors
- [ ] Date range filters display correctly
- [ ] Event type filter displays with options
- [ ] Refresh button works
- [ ] Active users card displays
- [ ] Conversion funnel displays with progress bars
- [ ] Event breakdown table displays
- [ ] Activity timeline displays
- [ ] Loading state shows while fetching
- [ ] Error state shows if API fails
- [ ] Real-time updates work (wait 30s)

### Navigation
- [ ] Can navigate from Overview to Performance
- [ ] Can navigate from Overview to Activity
- [ ] Can navigate from Performance to Activity
- [ ] Can navigate back to Overview
- [ ] Active page is highlighted in navigation

---

## 🧪 AUTOMATED TEST SUITE

### Run All Tests
```bash
npm run admin:test:day8
```

### Expected Results
```
✅ Test 1: Errors API endpoint responds
✅ Test 2: Error details API works
✅ Test 3: Performance API responds
✅ Test 4: Performance trends API works
✅ Test 5: Activity API responds
✅ Test 6: Activity funnel API works
✅ Test 7: Date range filtering works
✅ Test 8: Error filtering works
✅ Test 9: Pagination works
✅ Test 10: Invalid API key is rejected

Success Rate: 100% (10/10 tests passing)
```

---

## 🔍 WHAT TO LOOK FOR

### Performance Page
**Summary Statistics**:
- Average response time (ms)
- Median response time (ms)
- P95 response time (ms)
- P99 response time (ms)

**Endpoint Breakdown**:
- Table with endpoint, method, count, avg response time
- Sorted by count or response time

**Slow Endpoints**:
- List of endpoints with >500ms response time
- Highlighted in warning color

### Activity Page
**Active Users Card**:
- Total active users count
- Registrations count
- Assessments count
- RAG queries count

**Conversion Funnel**:
- Multiple stages with progress bars
- Conversion rate percentage for each stage
- Drop-off rate for each stage
- Overall conversion rate at bottom

**Event Breakdown**:
- Table with event type, count, percentage
- All event types listed

**Activity Timeline**:
- Recent activity points
- Timestamp and event count
- Visual bar chart

---

## 🐛 COMMON ISSUES

### Issue: Page shows "Failed to Load"
**Solution**: 
1. Check if development server is running
2. Verify API key in `.env.local`: `NEXT_PUBLIC_ADMIN_API_KEY=dev-admin-key-12345`
3. Check browser console for errors

### Issue: No data displays
**Solution**:
1. This is expected if no data exists yet
2. Generate test data by using the application
3. Or wait for real usage data to accumulate

### Issue: Real-time updates not working
**Solution**:
1. Check browser console for errors
2. Verify polling interval (30 seconds)
3. Check network tab for API calls

### Issue: Filters not working
**Solution**:
1. Check date format (YYYY-MM-DD)
2. Verify end date is after start date
3. Check browser console for errors

---

## 📊 TEST DATA GENERATION

### Generate Performance Data
```bash
# Make some API calls to generate metrics
curl http://localhost:3000/api/admin/performance \
  -H "X-API-Key: dev-admin-key-12345"
```

### Generate Activity Data
```bash
# Log some activity events
curl -X POST http://localhost:3000/api/admin/activity \
  -H "X-API-Key: dev-admin-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "registration",
    "user_id": "test-user-1",
    "metadata": {}
  }'
```

---

## ✅ SUCCESS CRITERIA

### All Tests Pass
- Automated test suite: 10/10 passing
- Manual tests: All checkboxes checked
- No console errors
- No visual glitches

### Performance
- Page load time: <1 second
- API response time: <500ms
- Real-time updates: Every 30 seconds

### UX
- Clear data visualization
- Intuitive filters
- Responsive design
- Consistent styling

---

## 🚀 NEXT STEPS

After testing is complete:
1. ✅ Mark Day 8 as complete
2. ✅ Update tasks.md
3. ✅ Create completion report
4. ⏭️ Move to Day 9: Authentication and Testing

---

**Quick Test Guide Version**: 1.0  
**Last Updated**: January 20, 2026  
**Status**: Ready for Testing
