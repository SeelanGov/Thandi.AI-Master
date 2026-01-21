# Thandi Admin Dashboard - User Guide

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**For**: System Administrators

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Error Tracking](#error-tracking)
4. [Performance Monitoring](#performance-monitoring)
5. [User Activity](#user-activity)
6. [System Health](#system-health)
7. [Alerts](#alerts)
8. [Common Workflows](#common-workflows)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Dashboard

1. Navigate to: **https://thandi.co.za/admin**
2. You'll be redirected to the login page
3. Enter your admin credentials:
   - **Email**: Your admin email address
   - **Password**: Your secure password
4. Click **"Sign In"**

### First Login

On your first login, you'll see the **Dashboard Overview** page with:
- 6 metric cards showing key system statistics
- Recent errors list
- System health status
- Active alerts count

### Navigation

The dashboard has 5 main sections accessible from the top navigation:

- **Overview** - High-level system metrics
- **Errors** - Detailed error tracking and management
- **Performance** - API performance metrics and trends
- **Activity** - User activity and conversion funnels
- **Health** - System health monitoring

---

## Dashboard Overview

The Overview page provides a quick snapshot of your system's health.

### Metric Cards

**1. Active Errors**
- Shows number of unresolved errors
- Trend indicator (↑ increase, ↓ decrease)
- Status color (green = good, yellow = warning, red = critical)

**2. Average Response Time**
- Shows average API response time in milliseconds
- Target: < 500ms
- Trend shows change from previous period

**3. Active Users (24h)**
- Shows unique users in last 24 hours
- Includes students, schools, and admin users
- Trend shows growth or decline

**4. Error Rate**
- Shows percentage of failed requests
- Target: < 5%
- Trend shows improvement or degradation

**5. Slow Endpoints**
- Shows number of endpoints exceeding 500ms
- Click to see details in Performance section
- Trend shows if performance is improving

**6. System Health**
- Shows overall system status
- Values: Healthy, Degraded, Unhealthy
- Based on recent health checks

### Recent Errors

Below the metrics, you'll see the 5 most recent errors:
- Error message
- Feature area (registration, assessment, etc.)
- Timestamp
- School ID (if applicable)

Click **"View All Errors"** to see the full error list.

### Auto-Refresh

The dashboard automatically refreshes every 30 seconds to show real-time data.

---

## Error Tracking

The Errors page helps you monitor and resolve system errors.

### Viewing Errors

**Error List**
- Shows all errors in reverse chronological order
- Each error displays:
  - Error type (TypeError, NetworkError, etc.)
  - Error message
  - Feature area
  - Timestamp
  - School ID and grade (if applicable)
  - Resolution status

**Pagination**
- 50 errors per page
- Use page numbers at bottom to navigate
- Total error count shown

### Filtering Errors

Use the filter bar to narrow down errors:

**Date Range**
- Click the date range dropdown
- Select predefined range (Today, Last 7 days, Last 30 days)
- Or choose custom dates

**Error Type**
- Filter by specific error types
- Common types: TypeError, NetworkError, ValidationError

**School**
- Filter errors by specific school
- Useful for school-specific issues

**Feature Area**
- Filter by system feature
- Options: registration, assessment, results, rag, school_login

**Severity**
- Filter by severity level
- Options: error, warning, critical

### Searching Errors

Use the search box to find specific errors:
- Search by error message
- Search by stack trace
- Search by URL

### Viewing Error Details

Click **"View Details"** on any error to see:
- Full error message
- Complete stack trace
- URL where error occurred
- User agent (browser info)
- User ID and school ID
- Student grade
- Timestamp
- Additional metadata

### Resolving Errors

To mark an error as resolved:
1. Click **"View Details"** on the error
2. Review the error information
3. Click **"Mark as Resolved"**
4. The error will be marked with your admin ID and timestamp

**Note**: Resolved errors are hidden by default. Use the "Show Resolved" filter to see them.

### Exporting Errors

To export errors for analysis:
1. Apply desired filters
2. Click **"Export CSV"** button
3. CSV file will download with all filtered errors
4. Open in Excel or Google Sheets for analysis

---

## Performance Monitoring

The Performance page shows API response times and identifies slow endpoints.

### Summary Statistics

At the top, you'll see:
- **Total Requests**: Number of API calls in selected period
- **Average Response Time**: Mean response time across all endpoints
- **Median Response Time**: Middle value (50th percentile)
- **P95 Response Time**: 95th percentile (95% of requests faster than this)
- **P99 Response Time**: 99th percentile (99% of requests faster than this)
- **Error Rate**: Percentage of failed requests
- **Success Rate**: Percentage of successful requests

### Endpoint Breakdown

Table showing performance by endpoint:
- **Endpoint**: API endpoint path
- **Method**: HTTP method (GET, POST, etc.)
- **Requests**: Number of requests
- **Avg Response Time**: Average response time
- **Median**: Median response time
- **P95**: 95th percentile
- **Error Rate**: Percentage of errors

**Sorting**
- Click column headers to sort
- Click again to reverse sort order

### Slow Endpoints

Highlighted section showing endpoints exceeding 500ms threshold:
- Endpoint path
- Average response time
- Threshold exceeded
- Number of requests

**Action**: Investigate these endpoints for optimization opportunities.

### Performance Trends

Chart showing response time trends over time:
- X-axis: Time (hourly, daily, or weekly)
- Y-axis: Average response time (ms)
- Line shows trend over selected period

**Degradation Detection**
- System automatically detects >50% performance degradation
- Alert shown if degradation detected
- Investigate recent deployments or infrastructure changes

### Date Range Selection

Use the date picker to analyze different time periods:
- Today
- Last 7 days
- Last 30 days
- Custom range

---

## User Activity

The Activity page tracks user behavior and conversion funnels.

### Summary Metrics

Top cards show:
- **Active Users (24h)**: Unique users in last 24 hours
- **Active Users (7d)**: Unique users in last 7 days
- **Total Registrations**: Student registrations
- **Total Assessments**: Completed assessments
- **Total RAG Queries**: Career guidance queries

### Event Breakdown

Table showing activity by event type:
- **Event Type**: Type of user action
- **Count**: Number of events
- **Unique Users**: Number of unique users

**Event Types**:
- `registration` - Student registration
- `assessment_start` - Assessment started
- `assessment_complete` - Assessment completed
- `school_login` - School admin login
- `rag_query` - Career guidance query

### Conversion Funnel

Visual funnel showing user journey:

```
Registration (100%)
    ↓ 79.2% conversion
Assessment Start (79.2%)
    ↓ 89.5% conversion
Assessment Complete (70.8%)
```

**Metrics**:
- **Count**: Number of users at each step
- **Conversion Rate**: Percentage from previous step
- **Drop-off Rate**: Percentage lost at this step

### Drop-off Analysis

Table showing where users are dropping off:
- **From Step**: Starting point
- **To Step**: Next step
- **Drop-off Rate**: Percentage lost
- **Users Lost**: Number of users

**Action**: Focus on steps with high drop-off rates for UX improvements.

### Activity Charts

Charts showing activity trends:
- **Activity Over Time**: Line chart of events per day
- **Event Distribution**: Pie chart of event types
- **User Growth**: Line chart of active users over time

---

## System Health

The Health page monitors system component status.

### Current Status

Large status indicator showing:
- **Healthy** (green) - All systems operational
- **Degraded** (yellow) - Some issues detected
- **Unhealthy** (red) - Critical issues

### Component Status

Table showing status of each component:
- **Component**: System component name
- **Status**: Current health status
- **Response Time**: Last check response time
- **Last Check**: Timestamp of last check
- **Error Message**: If unhealthy, shows error

**Components Monitored**:
- Database connection
- Registration API
- Assessment API
- RAG system
- School login API

### Health Check History

Chart showing health status over time:
- X-axis: Time
- Y-axis: Response time (ms)
- Color-coded by status (green/yellow/red)

### Statistics

Summary statistics:
- **Total Checks**: Number of health checks run
- **Healthy**: Number of successful checks
- **Degraded**: Number of degraded checks
- **Unhealthy**: Number of failed checks
- **Uptime Percentage**: Overall system uptime

### Manual Health Check

Click **"Run Health Check Now"** to:
1. Trigger immediate health check
2. Test all system components
3. Update status display
4. Log results to database

**Note**: Automated health checks run every 5 minutes.

---

## Alerts

The Alerts section manages system alerts and notifications.

### Alert Configurations

View and manage alert rules:

**Creating an Alert**
1. Click **"Create Alert"**
2. Select alert type:
   - Error Rate - Triggers when error rate exceeds threshold
   - Performance Degradation - Triggers when response time increases
   - Health Check Failure - Triggers when component fails
3. Set threshold value
4. Set time window (minutes)
5. Add recipient email addresses
6. Click **"Save"**

**Alert Types**:

**Error Rate Alert**
- Threshold: Percentage (e.g., 5%)
- Time Window: Minutes to evaluate (e.g., 60)
- Triggers: When error rate exceeds threshold in time window

**Performance Degradation Alert**
- Threshold: Percentage increase (e.g., 50%)
- Time Window: Minutes to compare (e.g., 60)
- Triggers: When response time increases by threshold

**Health Check Failure Alert**
- Threshold: Number of failures (e.g., 3)
- Time Window: Minutes to evaluate (e.g., 15)
- Triggers: When component fails threshold times

### Alert History

View triggered alerts:
- **Alert Type**: Type of alert
- **Message**: Alert description
- **Severity**: info, warning, critical
- **Status**: active, resolved, dismissed
- **Triggered At**: When alert was triggered
- **Resolved At**: When alert was resolved

**Filtering**
- Filter by severity
- Filter by status
- Filter by date range

### Resolving Alerts

To resolve an active alert:
1. Click on the alert
2. Review alert details
3. Investigate and fix the issue
4. Click **"Mark as Resolved"**
5. Alert status changes to "resolved"

### Email Notifications

When an alert triggers:
1. Email sent to all recipients
2. Email includes:
   - Alert type and severity
   - Threshold exceeded
   - Current value
   - Time triggered
   - Link to dashboard

**Email Settings**
- Configured in alert configuration
- Multiple recipients supported
- Emails sent via Resend service

---

## Common Workflows

### Daily Monitoring Routine

**Morning Check (5 minutes)**
1. Open Dashboard Overview
2. Check metric cards for anomalies
3. Review recent errors
4. Check system health status
5. Review any active alerts

**Weekly Review (30 minutes)**
1. Review error trends
2. Identify recurring errors
3. Check performance trends
4. Analyze user activity funnel
5. Review alert history
6. Export data for reporting

### Investigating an Error Spike

**When you notice increased errors:**

1. **Go to Errors page**
2. **Filter by date range** (when spike occurred)
3. **Group by error type** (identify most common)
4. **Filter by feature area** (identify affected feature)
5. **View error details** (understand root cause)
6. **Check recent deployments** (correlation?)
7. **Create GitHub issue** (if code fix needed)
8. **Mark errors as resolved** (after fix deployed)

### Investigating Performance Issues

**When response times increase:**

1. **Go to Performance page**
2. **Check summary statistics** (identify degradation)
3. **Review slow endpoints** (find bottlenecks)
4. **Check performance trends** (when did it start?)
5. **Correlate with deployments** (recent changes?)
6. **Review database queries** (optimization needed?)
7. **Check infrastructure** (server resources?)
8. **Create optimization plan**

### Analyzing User Drop-off

**When conversion rates decline:**

1. **Go to Activity page**
2. **Review conversion funnel**
3. **Identify drop-off points**
4. **Check error logs** (errors at that step?)
5. **Review performance** (slow at that step?)
6. **Analyze user feedback** (UX issues?)
7. **Create improvement plan**

### Responding to Alerts

**When you receive an alert email:**

1. **Open dashboard immediately**
2. **Go to relevant section** (Errors, Performance, Health)
3. **Assess severity** (critical = immediate action)
4. **Investigate root cause**
5. **Take corrective action**
6. **Monitor for resolution**
7. **Mark alert as resolved**
8. **Document incident** (for future reference)

---

## Troubleshooting

### Dashboard Not Loading

**Symptoms**: Dashboard page shows error or doesn't load

**Solutions**:
1. Check internet connection
2. Clear browser cache and cookies
3. Try different browser
4. Check if Vercel is down: https://status.vercel.com
5. Contact dev team if issue persists

### Login Issues

**Symptoms**: Cannot log in with correct credentials

**Solutions**:
1. Verify email and password are correct
2. Check for typos (email is case-sensitive)
3. Try password reset (if available)
4. Check if account is active
5. Contact dev team to verify account status

### Data Not Updating

**Symptoms**: Dashboard shows stale data

**Solutions**:
1. Wait 30 seconds (auto-refresh interval)
2. Manually refresh browser (F5 or Ctrl+R)
3. Check if data is being logged (view database)
4. Verify middleware is active
5. Check for errors in browser console

### Slow Dashboard Performance

**Symptoms**: Dashboard pages load slowly

**Solutions**:
1. Check internet connection speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Try different browser
5. Check if large date range selected (reduce range)
6. Contact dev team if issue persists

### Missing Errors

**Symptoms**: Errors not appearing in dashboard

**Solutions**:
1. Verify error logging is active
2. Check error filters (may be hiding errors)
3. Check date range (may be outside range)
4. Verify error was actually logged (check database)
5. Check browser console for logging errors

### Alert Not Triggering

**Symptoms**: Expected alert didn't trigger

**Solutions**:
1. Verify alert configuration is enabled
2. Check threshold values (may be too high)
3. Check time window (may be too short)
4. Verify cron job is running
5. Check alert history for similar alerts
6. Contact dev team to verify cron job status

### Export Not Working

**Symptoms**: CSV export fails or downloads empty file

**Solutions**:
1. Check if any data matches filters
2. Try reducing date range
3. Try different browser
4. Check browser download settings
5. Verify API endpoint is responding

---

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Quick search (coming soon)
- **Ctrl/Cmd + R**: Refresh current page
- **Esc**: Close modal/dialog
- **Tab**: Navigate between form fields
- **Enter**: Submit form

---

## Best Practices

### Security

1. **Never share your admin credentials**
2. **Log out when finished** (especially on shared computers)
3. **Use strong, unique password**
4. **Enable 2FA** (when available)
5. **Report suspicious activity** immediately

### Monitoring

1. **Check dashboard daily** (morning routine)
2. **Set up relevant alerts** (don't ignore them)
3. **Investigate anomalies** promptly
4. **Document incidents** for future reference
5. **Review trends weekly** (identify patterns)

### Performance

1. **Use filters** to reduce data load
2. **Export large datasets** instead of viewing in browser
3. **Close dashboard** when not in use (saves resources)
4. **Use appropriate date ranges** (don't query years of data)

### Collaboration

1. **Share insights** with team
2. **Document fixes** in GitHub issues
3. **Update alert configurations** as system evolves
4. **Provide feedback** on dashboard improvements
5. **Train new admins** on dashboard usage

---

## Getting Help

### Documentation

- **API Documentation**: `/docs/admin-dashboard-api.md`
- **Kiro AI Integration**: `/docs/admin-dashboard-kiro-integration.md`
- **System Architecture**: `.kiro/specs/admin-dashboard/design.md`

### Support Channels

- **Email**: dev@thandi.co.za
- **Slack**: #admin-dashboard (internal)
- **GitHub Issues**: For bug reports and feature requests

### Emergency Contacts

For critical system issues:
- **On-call Developer**: [Contact info]
- **System Administrator**: [Contact info]
- **CTO**: [Contact info]

---

## Appendix

### Glossary

- **API**: Application Programming Interface
- **Endpoint**: Specific API URL path
- **JWT**: JSON Web Token (authentication method)
- **P95/P99**: 95th/99th percentile (performance metrics)
- **RAG**: Retrieval-Augmented Generation (AI system)
- **RLS**: Row Level Security (database security)
- **Response Time**: Time for API to respond (milliseconds)
- **Uptime**: Percentage of time system is operational

### Metric Thresholds

**Good** (Green):
- Error Rate: < 3%
- Response Time: < 300ms
- Uptime: > 99%

**Warning** (Yellow):
- Error Rate: 3-5%
- Response Time: 300-500ms
- Uptime: 95-99%

**Critical** (Red):
- Error Rate: > 5%
- Response Time: > 500ms
- Uptime: < 95%

---

**Document Version**: 1.0  
**Last Updated**: January 20, 2026  
**Maintained by**: Thandi Development Team
