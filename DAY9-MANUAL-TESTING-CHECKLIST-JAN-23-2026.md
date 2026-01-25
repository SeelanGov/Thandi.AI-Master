# Day 9 Manual Testing Checklist - January 23, 2026

## Purpose
This checklist ensures comprehensive manual testing of the Admin Dashboard before marking Day 9 as complete.

**Tester**: _________________  
**Date**: _________________  
**Environment**: Production (https://thandi.online/admin)

---

## Pre-Testing Setup

- [ ] **Browser**: Chrome/Firefox/Safari (latest version)
- [ ] **Network**: Stable internet connection
- [ ] **Credentials**: Admin login credentials available
- [ ] **API Key**: ADMIN_API_KEY environment variable set
- [ ] **Time**: Allow 1-2 hours for thorough testing

---

## Section 1: Authentication & Access Control

### 1.1 Login Page
- [ ] Navigate to https://thandi.online/admin
- [ ] Verify login page loads correctly
- [ ] Verify Thandi branding is present
- [ ] Verify form has email and password fields
- [ ] Verify "Login" button is visible

### 1.2 Authentication Flow
- [ ] **Test Invalid Credentials**:
  - [ ] Enter wrong email/password
  - [ ] Verify error message displays
  - [ ] Verify no access granted
  
- [ ] **Test Valid Credentials**:
  - [ ] Enter correct email/password
  - [ ] Verify successful login
  - [ ] Verify redirect to dashboard
  - [ ] Verify no console errors

### 1.3 Protected Routes
- [ ] Try accessing /admin without login (should redirect to login)
- [ ] Try accessing /admin/errors without login (should redirect)
- [ ] Try accessing /admin/performance without login (should redirect)
- [ ] After login, verify all routes are accessible

### 1.4 Session Management
- [ ] Verify session persists on page refresh
- [ ] Verify logout button works
- [ ] After logout, verify redirect to login page
- [ ] After logout, verify cannot access protected routes

**Section 1 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 2: Dashboard Overview Page

### 2.1 Page Load
- [ ] Navigate to /admin (dashboard overview)
- [ ] Verify page loads in <2 seconds
- [ ] Verify no console errors
- [ ] Verify no visual glitches

### 2.2 Metric Cards
- [ ] Verify 6 metric cards are displayed:
  - [ ] Active Errors
  - [ ] Average Response Time
  - [ ] Active Users
  - [ ] Error Rate
  - [ ] Slow Endpoints
  - [ ] Recent Deployments

### 2.3 Metric Card Content
For each card, verify:
- [ ] Metric value is displayed
- [ ] Trend indicator (up/down arrow) is shown
- [ ] Percentage change is shown
- [ ] Card is clickable (if applicable)
- [ ] Styling is consistent with Thandi brand

### 2.4 Real-Time Updates
- [ ] Wait 30 seconds
- [ ] Verify "Last updated" timestamp changes
- [ ] Verify metrics refresh automatically

### 2.5 Navigation
- [ ] Click on each metric card
- [ ] Verify navigation to detailed view works
- [ ] Verify back button returns to overview

**Section 2 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 3: Errors Page

### 3.1 Page Load
- [ ] Navigate to /admin/errors
- [ ] Verify page loads correctly
- [ ] Verify error list is displayed
- [ ] Verify no console errors

### 3.2 Error List
- [ ] Verify errors are displayed in a table/list
- [ ] Verify each error shows:
  - [ ] Error message
  - [ ] Timestamp
  - [ ] Type/severity
  - [ ] Affected user/school (if applicable)

### 3.3 Filtering
- [ ] Test date range filter
- [ ] Test error type filter
- [ ] Test school filter
- [ ] Test feature filter
- [ ] Verify filters update the list correctly

### 3.4 Pagination
- [ ] Verify pagination controls are present
- [ ] Test "Next" button
- [ ] Test "Previous" button
- [ ] Test page number selection
- [ ] Verify correct number of items per page

### 3.5 Error Details
- [ ] Click on an error
- [ ] Verify error details page loads
- [ ] Verify full error context is shown:
  - [ ] Stack trace
  - [ ] Request details
  - [ ] User context
  - [ ] Timestamp
- [ ] Test "Mark Resolved" button
- [ ] Verify error status updates

### 3.6 Export
- [ ] Click "Export to CSV" button
- [ ] Verify CSV file downloads
- [ ] Open CSV and verify data is correct

**Section 3 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 4: Performance Page

### 4.1 Page Load
- [ ] Navigate to /admin/performance
- [ ] Verify page loads correctly
- [ ] Verify performance metrics are displayed
- [ ] Verify no console errors

### 4.2 Summary Statistics
- [ ] Verify summary section shows:
  - [ ] Average response time
  - [ ] Median response time
  - [ ] P95 response time
  - [ ] P99 response time
  - [ ] Total requests

### 4.3 Endpoint Breakdown
- [ ] Verify endpoint list is displayed
- [ ] Verify each endpoint shows:
  - [ ] Endpoint path
  - [ ] Average response time
  - [ ] Request count
  - [ ] Status indicator

### 4.4 Slow Endpoints
- [ ] Verify slow endpoints (>500ms) are highlighted
- [ ] Verify slow endpoints are sorted by response time
- [ ] Verify count of slow endpoints is accurate

### 4.5 Charts
- [ ] Verify response time chart is displayed
- [ ] Verify chart shows data over time
- [ ] Verify chart is interactive (hover shows details)
- [ ] Verify chart updates when filters change

### 4.6 Filtering
- [ ] Test time range filter (24h, 7d, 30d)
- [ ] Test endpoint filter
- [ ] Verify filters update charts and tables

### 4.7 Export
- [ ] Click "Export to CSV" button
- [ ] Verify CSV file downloads
- [ ] Verify data is correct

**Section 4 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 5: Activity Page

### 5.1 Page Load
- [ ] Navigate to /admin/activity
- [ ] Verify page loads correctly
- [ ] Verify activity metrics are displayed
- [ ] Verify no console errors

### 5.2 Summary Metrics
- [ ] Verify summary section shows:
  - [ ] Active users (24h)
  - [ ] Total registrations
  - [ ] Assessment completions
  - [ ] School logins

### 5.3 Funnel Metrics
- [ ] Verify funnel visualization is displayed
- [ ] Verify funnel shows:
  - [ ] Landing → Registration
  - [ ] Registration → Assessment
  - [ ] Assessment → Results
- [ ] Verify conversion rates are shown
- [ ] Verify drop-off points are highlighted

### 5.4 Event Breakdown
- [ ] Verify event list is displayed
- [ ] Verify events are grouped by type
- [ ] Verify event counts are accurate

### 5.5 Charts
- [ ] Verify activity chart is displayed
- [ ] Verify chart shows activity over time
- [ ] Verify chart is interactive
- [ ] Verify chart updates when filters change

### 5.6 Filtering
- [ ] Test time range filter
- [ ] Test event type filter
- [ ] Test school filter
- [ ] Verify filters update charts and tables

### 5.7 Export
- [ ] Click "Export to CSV" button
- [ ] Verify CSV file downloads
- [ ] Verify data is correct

**Section 5 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 6: Health Monitoring

### 6.1 Page Load
- [ ] Navigate to /admin/health
- [ ] Verify page loads correctly
- [ ] Verify health status is displayed
- [ ] Verify no console errors

### 6.2 System Status
- [ ] Verify overall system status is shown (Healthy/Unhealthy)
- [ ] Verify component status is shown:
  - [ ] Database
  - [ ] API Endpoints
  - [ ] RAG System

### 6.3 Health Check History
- [ ] Verify recent health checks are listed
- [ ] Verify each check shows:
  - [ ] Timestamp
  - [ ] Status
  - [ ] Component
  - [ ] Response time

### 6.4 Manual Health Check
- [ ] Click "Run Health Check" button
- [ ] Verify health check executes
- [ ] Verify results are displayed
- [ ] Verify results are stored in history

**Section 6 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 7: Alert System

### 7.1 Alert Configuration
- [ ] Navigate to /admin/alerts/config
- [ ] Verify alert configurations are listed
- [ ] Verify each config shows:
  - [ ] Alert name
  - [ ] Threshold
  - [ ] Recipients
  - [ ] Status (enabled/disabled)

### 7.2 Create Alert
- [ ] Click "Create Alert" button
- [ ] Fill in alert details
- [ ] Save alert
- [ ] Verify alert appears in list

### 7.3 Edit Alert
- [ ] Click "Edit" on an alert
- [ ] Modify alert details
- [ ] Save changes
- [ ] Verify changes are reflected

### 7.4 Alert History
- [ ] Navigate to /admin/alerts
- [ ] Verify alert history is displayed
- [ ] Verify each alert shows:
  - [ ] Alert name
  - [ ] Timestamp
  - [ ] Severity
  - [ ] Status (active/resolved)

### 7.5 Resolve Alert
- [ ] Click "Resolve" on an active alert
- [ ] Verify alert status changes to resolved
- [ ] Verify alert is removed from active list

**Section 7 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 8: Navigation & UI/UX

### 8.1 Navigation Menu
- [ ] Verify navigation menu is always visible
- [ ] Verify all menu items are clickable
- [ ] Verify active page is highlighted
- [ ] Verify menu works on mobile (if applicable)

### 8.2 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify layout adapts correctly
- [ ] Verify no horizontal scrolling

### 8.3 Branding
- [ ] Verify Thandi logo is present
- [ ] Verify Thandi colors are used consistently
- [ ] Verify typography matches brand guidelines
- [ ] Verify overall design is professional

### 8.4 Performance
- [ ] Verify all pages load in <2 seconds
- [ ] Verify no lag when interacting with UI
- [ ] Verify charts render smoothly
- [ ] Verify no memory leaks (check browser dev tools)

**Section 8 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 9: API Key Authentication (Kiro AI)

### 9.1 Run Kiro AI Test
- [ ] Open terminal
- [ ] Set ADMIN_API_KEY environment variable
- [ ] Run: `node scripts/test-kiro-ai-admin-access.js`
- [ ] Verify all tests pass
- [ ] Verify success rate is 100%

### 9.2 Verify API Access
- [ ] Verify Kiro AI can authenticate
- [ ] Verify Kiro AI can query errors
- [ ] Verify Kiro AI can query performance
- [ ] Verify Kiro AI can query activity
- [ ] Verify Kiro AI can query health
- [ ] Verify Kiro AI can query alerts

### 9.3 Rate Limiting
- [ ] Verify rate limiting is enforced (100 req/min)
- [ ] Verify rate limit headers are present
- [ ] Verify invalid API key is rejected

**Section 9 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## Section 10: Error Scenarios

### 10.1 Network Errors
- [ ] Disconnect internet
- [ ] Verify offline indicator appears
- [ ] Reconnect internet
- [ ] Verify dashboard recovers gracefully

### 10.2 Invalid Data
- [ ] Try accessing non-existent error ID
- [ ] Verify 404 error is handled gracefully
- [ ] Try invalid date range
- [ ] Verify validation error is shown

### 10.3 Session Expiry
- [ ] Wait for session to expire (or manually expire)
- [ ] Try to access protected route
- [ ] Verify redirect to login page
- [ ] Verify error message is shown

**Section 10 Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________________________________________

---

## FINAL CHECKLIST

### All Sections Complete
- [ ] Section 1: Authentication & Access Control
- [ ] Section 2: Dashboard Overview Page
- [ ] Section 3: Errors Page
- [ ] Section 4: Performance Page
- [ ] Section 5: Activity Page
- [ ] Section 6: Health Monitoring
- [ ] Section 7: Alert System
- [ ] Section 8: Navigation & UI/UX
- [ ] Section 9: API Key Authentication (Kiro AI)
- [ ] Section 10: Error Scenarios

### Critical Issues Found
List any critical issues that must be fixed:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Non-Critical Issues Found
List any minor issues for future improvement:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## FINAL VERDICT

**Overall Status**: ⬜ PASS / ⬜ FAIL

**Tester Signature**: _________________  
**Date Completed**: _________________

**Recommendation**:
- [ ] ✅ Day 9 is COMPLETE - All tests passed
- [ ] ⚠️ Day 9 needs minor fixes - Non-critical issues found
- [ ] ❌ Day 9 is NOT complete - Critical issues found

---

## Next Steps

If PASS:
1. Mark Day 9 as complete in tasks.md
2. Create Day 9 completion summary document
3. Proceed to Day 10

If FAIL:
1. Document all issues in detail
2. Create bug fix plan
3. Fix critical issues
4. Re-run manual testing
5. Only then mark Day 9 as complete

---

**Document Version**: 1.0  
**Created**: January 23, 2026  
**Purpose**: Day 9 Manual Testing Verification
