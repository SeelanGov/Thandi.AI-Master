# DAY 8: DASHBOARD UI - ERRORS, PERFORMANCE, ACTIVITY PAGES
**Date**: January 20, 2026  
**Status**: Ready to Execute  
**Duration**: 1 day

---

## 🎯 OBJECTIVE

Build the three main dashboard pages:
1. **Errors Page** - View, filter, and manage system errors
2. **Performance Page** - Monitor API performance and identify bottlenecks
3. **Activity Page** - Track user activity and conversion funnels

---

## 📋 TASKS BREAKDOWN

### Task 8.1: Create Errors Page ⏳ IN PROGRESS

**Components to Build**:
- `app/admin/errors/page.js` - Main errors page
- `components/admin/ErrorsList.jsx` - Errors list with pagination
- `components/admin/ErrorFilters.jsx` - Filter controls

**Features**:
- Display all errors with pagination
- Filter by date range, type, school, feature
- Search functionality
- Export to CSV
- Click to view error details
- Mark errors as resolved

**API Endpoints Used**:
- `GET /api/admin/errors` (already exists ✅)
- `PUT /api/admin/errors/[id]` (already exists ✅)

---

### Task 8.2: Create Error Details Page

**Components to Build**:
- `app/admin/errors/[id]/page.js` - Error details page
- `components/admin/ErrorDetails.jsx` - Full error context display

**Features**:
- Display full error stack trace
- Show error context (user, school, feature)
- Display occurrence count
- Show first/last occurrence timestamps
- "Mark Resolved" button
- Back to errors list

**API Endpoints Used**:
- `GET /api/admin/errors/[id]` (already exists ✅)
- `PUT /api/admin/errors/[id]` (already exists ✅)

---

### Task 8.3: Create Performance Page

**Components to Build**:
- `app/admin/performance/page.js` - Main performance page
- `components/admin/PerformanceCharts.jsx` - Performance visualizations

**Features**:
- Summary statistics (avg, median, p95, p99)
- Endpoint breakdown table
- Slow endpoints list (>500ms)
- Response time chart over time
- Filter by date range
- Filter by endpoint

**API Endpoints Used**:
- `GET /api/admin/performance` (already exists ✅)
- `GET /api/admin/performance/trends` (already exists ✅)

---

### Task 8.4: Create Activity Page

**Components to Build**:
- `app/admin/activity/page.js` - Main activity page
- `components/admin/ActivityCharts.jsx` - Activity visualizations

**Features**:
- Active users count
- Funnel metrics with conversion rates
- Event breakdown
- Activity chart over time
- Filter by date range
- Filter by event type

**API Endpoints Used**:
- `GET /api/admin/activity` (already exists ✅)
- `GET /api/admin/activity/funnel` (already exists ✅)

---

## 🎨 DESIGN SYSTEM

**Colors** (Thandi Brand):
- Primary: `#10b981` (emerald-500)
- Secondary: `#3b82f6` (blue-500)
- Success: `#22c55e` (green-500)
- Warning: `#f59e0b` (amber-500)
- Error: `#ef4444` (red-500)
- Background: `#f9fafb` (gray-50)
- Card: `#ffffff` (white)
- Border: `#e5e7eb` (gray-200)

**Typography**:
- Headings: `font-bold text-gray-900`
- Body: `text-gray-700`
- Labels: `text-sm text-gray-600`
- Values: `text-lg font-semibold text-gray-900`

**Components**:
- Cards: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Buttons: `px-4 py-2 rounded-md font-medium`
- Inputs: `border border-gray-300 rounded-md px-3 py-2`
- Tables: `border-collapse w-full`

---

## 🧪 TESTING STRATEGY

### Manual Testing
1. **Errors Page**:
   - Load page and verify errors display
   - Test all filters
   - Test search functionality
   - Test pagination
   - Test export to CSV
   - Click error to view details

2. **Error Details Page**:
   - View error details
   - Mark error as resolved
   - Navigate back to list

3. **Performance Page**:
   - View summary statistics
   - View endpoint breakdown
   - View slow endpoints
   - Test date range filter
   - Verify charts render correctly

4. **Activity Page**:
   - View active users
   - View funnel metrics
   - View event breakdown
   - Test date range filter
   - Verify charts render correctly

### Automated Testing
- Create test script: `scripts/test-day8-dashboard-pages.js`
- Test all page loads
- Test API integration
- Test filtering and pagination

---

## 📦 DELIVERABLES

### Files to Create
1. `app/admin/errors/page.js`
2. `app/admin/errors/[id]/page.js`
3. `app/admin/performance/page.js`
4. `app/admin/activity/page.js`
5. `components/admin/ErrorsList.jsx`
6. `components/admin/ErrorFilters.jsx`
7. `components/admin/ErrorDetails.jsx`
8. `components/admin/PerformanceCharts.jsx`
9. `components/admin/ActivityCharts.jsx`
10. `scripts/test-day8-dashboard-pages.js`

### Files to Update
- `components/admin/AdminNav.jsx` (add links to new pages)

---

## ✅ ACCEPTANCE CRITERIA

- [ ] All pages load in <1 second
- [ ] Filters work correctly on all pages
- [ ] Pagination works correctly
- [ ] Export to CSV works
- [ ] Charts display data accurately
- [ ] Error details page shows full context
- [ ] Mark resolved functionality works
- [ ] Navigation between pages works
- [ ] All pages styled consistently with Thandi brand
- [ ] Responsive design works on mobile

---

## 🚀 EXECUTION PLAN

1. **Start with Errors Page** (most critical)
2. **Build Error Details Page** (completes error management)
3. **Build Performance Page** (monitoring)
4. **Build Activity Page** (analytics)
5. **Update Navigation** (add links)
6. **Create Test Suite** (verify everything works)
7. **Manual Testing** (browser verification)

---

**Ready to Execute**: ✅  
**Estimated Time**: 4-6 hours  
**Dependencies**: All backend APIs complete ✅
