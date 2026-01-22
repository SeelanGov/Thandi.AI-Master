# Admin Dashboard Testing Guide
**Date**: January 22, 2026  
**Purpose**: Manual browser testing checklist

---

## Prerequisites

1. **Development Server Running**:
   ```bash
   npm run dev
   ```

2. **Admin Credentials**:
   - Email: `admin@thandi.co.za`
   - Password: (from previous setup)

3. **API Key Set**:
   - Check `.env.local` has `NEXT_PUBLIC_ADMIN_API_KEY`

---

## Testing Checklist

### 1. Dashboard Overview (`/admin`)

**Access**:
- [ ] Navigate to `http://localhost:3000/admin`
- [ ] Login page appears if not authenticated
- [ ] Dashboard loads after login

**Navigation Cards**:
- [ ] "System Errors" card visible
- [ ] "Performance" card visible
- [ ] "User Activity" card visible
- [ ] "System Health" card visible
- [ ] All cards clickable
- [ ] Hover effects work

**Header**:
- [ ] Thandi logo displays
- [ ] "Thandi Admin Dashboard" title shows
- [ ] Logout button visible
- [ ] Logout button works

---

### 2. Errors Page (`/admin/errors`)

**Page Load**:
- [ ] Click "System Errors" card from dashboard
- [ ] Page loads successfully
- [ ] Header shows "System Errors"
- [ ] Back to Dashboard button works

**Filters**:
- [ ] Error Type dropdown works
- [ ] Feature Area dropdown works
- [ ] School ID input works
- [ ] Start Date picker works
- [ ] End Date picker works
- [ ] Search input works
- [ ] "Apply Filters" button works
- [ ] "Reset" button clears filters

**Errors List**:
- [ ] Errors display in list format
- [ ] Severity badges show (critical/error/warning)
- [ ] Error type tags display
- [ ] Feature area tags display
- [ ] Resolution status shows
- [ ] Timestamps formatted correctly
- [ ] School ID and grade show (if available)
- [ ] Hover effect on error rows

**Pagination**:
- [ ] Page numbers display
- [ ] "Previous" button works
- [ ] "Next" button works
- [ ] Page count shows correctly
- [ ] Total errors count displays

**Export**:
- [ ] "Export CSV" button visible
- [ ] Click exports CSV file
- [ ] CSV contains correct data
- [ ] Filename includes date

**Empty State**:
- [ ] If no errors, shows friendly message
- [ ] Icon displays
- [ ] Suggests adjusting filters

---

### 3. Error Details (`/admin/errors/[id]`)

**Access**:
- [ ] Click any error from errors list
- [ ] Details page loads
- [ ] Header shows "Error Details"
- [ ] Back to Errors button works

**Error Summary**:
- [ ] Severity badge displays
- [ ] Error type badge displays
- [ ] Feature area badge displays
- [ ] Resolution status shows (if resolved)
- [ ] Full error message displays
- [ ] Timestamp formatted correctly

**Basic Information Card**:
- [ ] Error ID shows
- [ ] Error type displays
- [ ] Severity displays
- [ ] Feature area displays
- [ ] URL displays (if available)

**User Context Card**:
- [ ] User ID shows (if available)
- [ ] School ID shows (if available)
- [ ] Student grade shows (if available)
- [ ] User agent shows (if available)

**Stack Trace**:
- [ ] Stack trace section displays (if available)
- [ ] Code is syntax highlighted
- [ ] Scrollable if long
- [ ] Readable formatting

**Metadata**:
- [ ] Metadata section displays (if available)
- [ ] JSON formatted correctly
- [ ] Scrollable if long

**Actions**:
- [ ] "Mark Resolved" button visible (if not resolved)
- [ ] Button works and updates status
- [ ] Resolution info shows after marking resolved
- [ ] Button hidden if already resolved

---

### 4. Performance Page (`/admin/performance`)

**Page Load**:
- [ ] Click "Performance" card from dashboard
- [ ] Page loads successfully
- [ ] Header shows "Performance Monitoring"
- [ ] Back to Dashboard button works

**Time Range Selector**:
- [ ] "Last 24 Hours" button works
- [ ] "Last 7 Days" button works
- [ ] "Last 30 Days" button works
- [ ] Active button highlighted
- [ ] Data updates when changed

**Summary Statistics**:
- [ ] Total Requests card displays
- [ ] Avg Response Time card displays
- [ ] P95 Response Time card displays
- [ ] Error Rate card displays
- [ ] Icons show correctly
- [ ] Numbers formatted with commas

**Slow Endpoints Alert**:
- [ ] Alert shows if slow endpoints exist
- [ ] Warning icon displays
- [ ] Endpoint list shows
- [ ] Response times display
- [ ] Threshold comparison shows

**Endpoint Breakdown Table**:
- [ ] Table displays all endpoints
- [ ] Endpoint names show
- [ ] Request counts display
- [ ] Avg response times show
- [ ] Error rates display
- [ ] Status badges show (Good/Slow)
- [ ] Hover effect on rows

**Response Time Trends**:
- [ ] Chart displays (if data available)
- [ ] Bars show correctly
- [ ] Hover shows exact values
- [ ] Dates formatted correctly
- [ ] Visual proportions correct

**Empty State**:
- [ ] If no data, shows friendly message

---

### 5. Activity Page (`/admin/activity`)

**Page Load**:
- [ ] Click "User Activity" card from dashboard
- [ ] Page loads successfully
- [ ] Header shows "User Activity"
- [ ] Back to Dashboard button works

**Time Range Selector**:
- [ ] "Last 24 Hours" button works
- [ ] "Last 7 Days" button works
- [ ] "Last 30 Days" button works
- [ ] Active button highlighted
- [ ] Data updates when changed

**Summary Statistics**:
- [ ] Active Users card displays
- [ ] Registrations card displays
- [ ] Assessments card displays
- [ ] RAG Queries card displays
- [ ] Icons show correctly
- [ ] Numbers formatted correctly

**Funnel Analysis**:
- [ ] Funnel section displays
- [ ] All steps show
- [ ] Step numbers display
- [ ] User counts show
- [ ] Conversion rates display
- [ ] Progress bars show correctly
- [ ] High drop-off highlighted (if >20%)
- [ ] Overall conversion rate shows

**Event Breakdown**:
- [ ] Event cards display
- [ ] Event types show
- [ ] Counts display
- [ ] Progress bars show
- [ ] Visual proportions correct

**Recent Events**:
- [ ] Recent events list displays
- [ ] Event type badges show
- [ ] School ID shows (if available)
- [ ] Grade shows (if available)
- [ ] Timestamps formatted correctly
- [ ] Shows last 10 events

**Empty State**:
- [ ] If no data, shows friendly message

---

### 6. Navigation & General

**Cross-Page Navigation**:
- [ ] Can navigate between all pages
- [ ] Back buttons work consistently
- [ ] Logout works from all pages
- [ ] Browser back button works

**Responsive Design**:
- [ ] Resize browser window
- [ ] Layout adapts to smaller screens
- [ ] Cards stack on mobile
- [ ] Tables scroll horizontally if needed
- [ ] Navigation remains accessible

**Loading States**:
- [ ] Spinner shows while loading
- [ ] Centered correctly
- [ ] Smooth transitions
- [ ] No flash of content

**Error Handling**:
- [ ] Invalid URLs show 404 or redirect
- [ ] API errors handled gracefully
- [ ] Network errors show message
- [ ] Unauthorized redirects to login

**Performance**:
- [ ] Pages load quickly (<2 seconds)
- [ ] No console errors
- [ ] No console warnings
- [ ] Smooth animations
- [ ] No layout shifts

---

## Common Issues & Solutions

### Issue: "Unauthorized" Error
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_ADMIN_API_KEY`

### Issue: No Data Displays
**Solution**: 
1. Check backend APIs are running
2. Verify database has data
3. Check network tab for failed requests

### Issue: Filters Don't Work
**Solution**:
1. Check console for errors
2. Verify API endpoints accept filter parameters
3. Test with simple filters first

### Issue: Export Doesn't Work
**Solution**:
1. Check browser allows downloads
2. Verify export endpoint exists
3. Check network tab for errors

### Issue: Charts Don't Display
**Solution**:
1. Verify data exists for time range
2. Check console for errors
3. Try different time range

---

## Testing Notes

**Record Issues**:
- Note any bugs or unexpected behavior
- Take screenshots if helpful
- Check browser console for errors
- Note which browser/device used

**Performance Notes**:
- Note any slow pages
- Record load times
- Identify any lag or delays

**UX Notes**:
- Note any confusing elements
- Suggest improvements
- Identify missing features

---

## Success Criteria

✅ **All Pages Load**: No errors, all content displays  
✅ **All Features Work**: Filters, pagination, export, etc.  
✅ **Navigation Works**: Can move between pages easily  
✅ **Design Looks Good**: Professional, branded, responsive  
✅ **Performance Good**: Fast load times, smooth interactions  

---

## After Testing

1. **Document Results**:
   - List any issues found
   - Note what works well
   - Suggest improvements

2. **Fix Critical Issues**:
   - Address any blocking bugs
   - Fix broken functionality
   - Resolve errors

3. **Deploy**:
   - If all tests pass, ready for deployment
   - If issues found, fix then retest

---

**Estimated Testing Time**: 15-20 minutes  
**Next Step**: Deploy to production if tests pass

