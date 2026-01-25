# Admin Dashboard User Guide

**Version**: 1.0  
**Last Updated**: January 24, 2026  
**For**: Thandi.AI Admin Dashboard

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Error Tracking](#error-tracking)
4. [Performance Monitoring](#performance-monitoring)
5. [Activity Tracking](#activity-tracking)
6. [Health Monitoring](#health-monitoring)
7. [Alert Configuration](#alert-configuration)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Dashboard

**Login URL**: https://thandi.online/admin/login

**Default Credentials**:
- Email: `admin@thandi.online`
- Password: `Thandi@Admin2026!`

**Important**: Change your password after first login for security.

### First-Time Setup

1. **Log in** using the credentials above
2. **Verify your email** (if prompted)
3. **Configure alert recipients** (see Alert Configuration section)
4. **Review dashboard metrics** to familiarize yourself with the interface
5. **Set up custom alert thresholds** based on your needs

### Navigation

The dashboard uses a sidebar navigation with the following sections:
- **Dashboard** - Overview of all metrics
- **Errors** - Error tracking and management
- **Performance** - API and system performance metrics
- **Activity** - User activity and funnel analysis
- **Health** - System health monitoring
- **Alerts** - Alert configuration and history

---

## Dashboard Overview

The dashboard overview provides a comprehensive view of your system's health and performance.

### Key Metrics Displayed

#### Error Summary
- **Total Errors**: Count of errors in the selected time range
- **Critical Errors**: High-priority errors requiring immediate attention
- **Error Trend**: Percentage change compared to previous period
- **Recent Errors**: List of most recent errors with severity indicators

#### Performance Summary
- **Average Response Time**: Mean API response time across all endpoints
- **Slow Endpoints**: Count of endpoints with response time >500ms
- **Performance Trend**: Percentage change in response times
- **P95/P99 Response Times**: 95th and 99th percentile response times

#### Activity Summary
- **Active Users**: Unique users in the selected time range
- **Registrations**: New student registrations
- **Assessments Completed**: Number of completed assessments
- **Activity Trend**: Percentage change in user activity

#### Health Status
- **Overall Status**: System health indicator (Healthy/Degraded/Down)
- **Component Status**: Individual component health (Database, API, RAG)
- **Last Health Check**: Timestamp of most recent health check

#### Active Alerts
- **Active Alerts**: Count of unresolved alerts
- **Critical Alerts**: Count of critical severity alerts
- **Recent Alerts**: List of most recent alerts

### Time Range Selection

Use the time range selector to view metrics for different periods:
- **1 Hour**: Real-time monitoring
- **24 Hours**: Daily overview (default)
- **7 Days**: Weekly trends
- **30 Days**: Monthly analysis

### Refreshing Data

- Dashboard auto-refreshes every 5 minutes
- Click the **Refresh** button for manual updates
- Last update timestamp shown in top-right corner

---

## Error Tracking

The error tracking page helps you monitor, analyze, and resolve system errors.

### Viewing Errors

**Navigation**: Dashboard → Errors

The errors page displays:
- **Error List**: All errors with key information
- **Filters**: Filter by type, severity, school, date range
- **Search**: Search errors by message or ID
- **Pagination**: Navigate through large error sets

### Error Information

Each error displays:
- **Error ID**: Unique identifier
- **Type**: Error category (api_error, database_error, etc.)
- **Message**: Error description
- **Severity**: Priority level (Low, Medium, High, Critical)
- **Count**: Number of occurrences
- **First/Last Occurrence**: Timestamps
- **Status**: Resolved or unresolved

### Filtering Errors

Use filters to narrow down errors:

1. **By Type**:
   - API Errors
   - Database Errors
   - Authentication Errors
   - RAG System Errors
   - Frontend Errors

2. **By Severity**:
   - Critical (requires immediate action)
   - High (address within 24 hours)
   - Medium (address within 1 week)
   - Low (address when convenient)

3. **By School**: Filter errors for specific schools

4. **By Date Range**: Select custom date range

5. **By Status**: Show resolved or unresolved errors

### Viewing Error Details

Click on any error to view detailed information:
- **Full Error Message**: Complete error description
- **Stack Trace**: Technical error details
- **Context**: Additional information (endpoint, user, school)
- **Occurrences**: Timeline of all occurrences
- **Resolution History**: Previous resolutions if error recurred

### Resolving Errors

To mark an error as resolved:

1. Click on the error to view details
2. Click **Mark as Resolved** button
3. Enter resolution notes (optional but recommended)
4. Click **Confirm**

**Best Practice**: Always add resolution notes to help with future debugging.

### Exporting Error Data

To export errors for analysis:

1. Apply desired filters
2. Click **Export** button
3. Choose format (CSV or JSON)
4. Download file

Use exports for:
- Detailed analysis in spreadsheet tools
- Sharing with development team
- Creating reports for stakeholders

---

## Performance Monitoring

The performance monitoring page helps you identify and optimize slow endpoints.

### Viewing Performance Metrics

**Navigation**: Dashboard → Performance

The performance page displays:
- **Summary Statistics**: Overall performance metrics
- **Endpoint Performance**: Performance by API endpoint
- **Trends**: Performance trends over time
- **Slow Endpoints**: Endpoints exceeding thresholds

### Key Performance Metrics

#### Response Time Statistics
- **Average Response Time**: Mean across all requests
- **Median Response Time**: 50th percentile
- **P95 Response Time**: 95th percentile (most requests faster than this)
- **P99 Response Time**: 99th percentile (slowest 1% of requests)

#### Request Statistics
- **Total Requests**: Count of API requests
- **Requests per Minute**: Request rate
- **Error Rate**: Percentage of failed requests

### Identifying Slow Endpoints

Endpoints are flagged as slow if:
- Average response time >500ms
- P95 response time >1000ms
- Showing degradation trend >20%

**Action Items for Slow Endpoints**:
1. Review endpoint implementation
2. Check database query performance
3. Analyze external API dependencies
4. Consider caching strategies
5. Optimize data processing

### Performance Trends

The trends chart shows:
- **Response Time Over Time**: Track performance changes
- **Request Volume**: Correlate performance with load
- **Error Rate**: Identify error spikes

**Interpreting Trends**:
- **Upward Trend**: Performance degrading (investigate)
- **Downward Trend**: Performance improving (good!)
- **Spikes**: Temporary issues or high load periods
- **Flat Line**: Stable performance

### Filtering Performance Data

Filter performance metrics by:
- **Date Range**: Select time period
- **Endpoint**: Focus on specific API endpoint
- **HTTP Method**: Filter by GET, POST, PUT, DELETE
- **Status Code**: Filter by success/error responses

### Performance Optimization Tips

1. **Database Queries**: Add indexes for frequently queried fields
2. **Caching**: Implement caching for expensive operations
3. **Pagination**: Limit data returned in single requests
4. **Async Processing**: Move heavy processing to background jobs
5. **CDN**: Use CDN for static assets

---

## Activity Tracking

The activity tracking page helps you understand user behavior and identify conversion issues.

### Viewing Activity Metrics

**Navigation**: Dashboard → Activity

The activity page displays:
- **Activity Summary**: Overall user activity metrics
- **Event Breakdown**: Activity by event type
- **Funnel Analysis**: Conversion funnel metrics
- **User Engagement**: User activity patterns

### Key Activity Metrics

#### User Metrics
- **Active Users**: Unique users in time range
- **New Users**: First-time users
- **Returning Users**: Users with previous activity
- **User Retention**: Percentage of returning users

#### Event Metrics
- **Total Events**: Count of all tracked events
- **Events by Type**: Breakdown by event category
- **Events per User**: Average events per user

### Event Types

The system tracks these event types:
- **student_registration**: New student sign-ups
- **assessment_started**: User begins assessment
- **assessment_completed**: User completes assessment
- **results_viewed**: User views results
- **school_login**: School admin login
- **school_claim**: School claims profile

### Funnel Analysis

The funnel shows user progression through key stages:

1. **Landing Page**: Users who visit the site
2. **Registration**: Users who create accounts
3. **Assessment**: Users who start assessments
4. **Results**: Users who complete and view results

**Conversion Rates**:
- **Landing → Registration**: Typical: 40-50%
- **Registration → Assessment**: Typical: 80-90%
- **Assessment → Results**: Typical: 90-95%

### Identifying Drop-Off Points

Drop-off points indicate where users leave the funnel:

**High Drop-Off at Registration**:
- Registration form too complex
- Technical issues during sign-up
- Unclear value proposition

**High Drop-Off at Assessment**:
- Assessment too long or difficult
- Technical issues during assessment
- User loses interest

**High Drop-Off at Results**:
- Results page not loading
- Results not meeting expectations
- Technical issues

### Filtering Activity Data

Filter activity by:
- **Date Range**: Select time period
- **Event Type**: Focus on specific events
- **School**: Filter by school (for school-related events)
- **User Segment**: Filter by user characteristics

### Activity Optimization Tips

1. **Improve Registration**: Simplify form, add social login
2. **Enhance Assessment**: Add progress indicators, save progress
3. **Optimize Results**: Improve loading speed, enhance presentation
4. **Reduce Friction**: Remove unnecessary steps, improve UX

---

## Health Monitoring

The health monitoring page provides real-time system health status.

### Viewing Health Status

**Navigation**: Dashboard → Health

The health page displays:
- **Overall Health Status**: System-wide health indicator
- **Component Status**: Individual component health
- **Health History**: Historical health data
- **Recent Checks**: Timeline of health checks

### Health Status Indicators

#### Overall Status
- **Healthy** (Green): All systems operational
- **Degraded** (Yellow): Some components experiencing issues
- **Down** (Red): Critical components unavailable

#### Component Status

**Database**:
- **Healthy**: Response time <100ms
- **Degraded**: Response time 100-500ms
- **Down**: No response or timeout

**API**:
- **Healthy**: Response time <200ms, error rate <1%
- **Degraded**: Response time 200-500ms, error rate 1-5%
- **Down**: Response time >500ms, error rate >5%

**RAG System**:
- **Healthy**: Response time <500ms
- **Degraded**: Response time 500-1000ms
- **Down**: No response or timeout

### Health Check Details

Click on any component to view:
- **Current Status**: Real-time health status
- **Response Time**: Latest response time
- **Last Check**: Timestamp of last health check
- **Check History**: Historical health data
- **Error Details**: Information about any issues

### Manual Health Checks

To trigger a manual health check:

1. Click **Run Health Check** button
2. Wait for check to complete (typically 5-10 seconds)
3. Review results

**When to Run Manual Checks**:
- After deploying changes
- When investigating issues
- To verify fixes
- Before scheduled maintenance

### Health Alerts

Configure alerts for health issues:

1. Go to Alerts → Configuration
2. Create new alert rule
3. Select "Health Check" type
4. Set threshold (e.g., component down for >5 minutes)
5. Add recipients
6. Save configuration

### Health Monitoring Best Practices

1. **Regular Monitoring**: Check health status daily
2. **Automated Checks**: Schedule health checks every 5 minutes
3. **Alert Configuration**: Set up alerts for critical issues
4. **Response Plan**: Have plan for each component failure
5. **Documentation**: Document health check procedures

---

## Alert Configuration

The alert system notifies you of critical issues requiring attention.

### Viewing Alerts

**Navigation**: Dashboard → Alerts

The alerts page displays:
- **Active Alerts**: Unresolved alerts
- **Alert History**: Past alerts
- **Alert Configuration**: Alert rules and settings

### Alert Types

#### Error Rate Alerts
Triggered when error rate exceeds threshold:
- **Threshold**: Percentage of requests resulting in errors
- **Example**: Alert when error rate >5%

#### Performance Alerts
Triggered when performance degrades:
- **Threshold**: Average response time
- **Example**: Alert when avg response time >500ms

#### Health Alerts
Triggered when components become unhealthy:
- **Threshold**: Component status
- **Example**: Alert when database is down

#### Activity Alerts
Triggered by unusual activity patterns:
- **Threshold**: Activity metrics
- **Example**: Alert when registrations drop >50%

### Creating Alert Rules

To create a new alert rule:

1. Go to Alerts → Configuration
2. Click **Create Alert Rule**
3. Fill in alert details:
   - **Name**: Descriptive alert name
   - **Type**: Select alert type
   - **Threshold**: Set trigger threshold
   - **Severity**: Choose severity level
   - **Recipients**: Add email addresses
4. Click **Save**

**Example Alert Configuration**:
```
Name: High Error Rate Alert
Type: Error Rate
Threshold: 5%
Severity: High
Recipients: admin@thandi.online, dev@thandi.online
```

### Alert Severity Levels

- **Critical**: Immediate action required (system down)
- **High**: Action required within 1 hour (major issues)
- **Medium**: Action required within 24 hours (minor issues)
- **Low**: Action required within 1 week (informational)

### Managing Alerts

#### Resolving Alerts

To resolve an alert:

1. Click on the alert
2. Review alert details
3. Take corrective action
4. Click **Mark as Resolved**
5. Add resolution notes
6. Click **Confirm**

#### Editing Alert Rules

To modify an alert rule:

1. Go to Alerts → Configuration
2. Find the alert rule
3. Click **Edit**
4. Update settings
5. Click **Save**

#### Disabling Alert Rules

To temporarily disable an alert:

1. Go to Alerts → Configuration
2. Find the alert rule
3. Toggle **Enabled** switch to off
4. Alert will not trigger until re-enabled

### Alert Notifications

Alerts are delivered via:
- **Email**: Sent to configured recipients
- **Dashboard**: Displayed in alerts section
- **API**: Available via API for integration

**Email Notification Contents**:
- Alert name and severity
- Trigger details (what caused the alert)
- Current metric values
- Link to dashboard for more details
- Recommended actions

### Alert Best Practices

1. **Set Appropriate Thresholds**: Avoid alert fatigue
2. **Configure Multiple Recipients**: Ensure alerts are seen
3. **Test Alert Delivery**: Verify emails are received
4. **Review Regularly**: Adjust thresholds based on experience
5. **Document Responses**: Create runbooks for common alerts

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Cannot Log In

**Symptoms**: Login fails with "Invalid credentials" error

**Solutions**:
1. Verify email and password are correct
2. Check for typos (password is case-sensitive)
3. Try password reset if available
4. Contact system administrator

#### Issue: Dashboard Not Loading

**Symptoms**: Dashboard shows loading spinner indefinitely

**Solutions**:
1. Check internet connection
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache and cookies
4. Try different browser
5. Check system status page

#### Issue: Metrics Not Updating

**Symptoms**: Dashboard shows stale data

**Solutions**:
1. Click **Refresh** button
2. Check last update timestamp
3. Verify data is being collected (check health status)
4. Wait for auto-refresh (every 5 minutes)
5. Contact support if issue persists

#### Issue: Alerts Not Being Received

**Symptoms**: No email notifications for alerts

**Solutions**:
1. Check spam/junk folder
2. Verify email address in alert configuration
3. Test email delivery with manual alert
4. Check alert rule is enabled
5. Verify threshold is being exceeded

#### Issue: Slow Dashboard Performance

**Symptoms**: Dashboard takes long time to load

**Solutions**:
1. Reduce date range (use 24h instead of 30d)
2. Clear browser cache
3. Close unnecessary browser tabs
4. Check internet connection speed
5. Try during off-peak hours

#### Issue: Export Not Working

**Symptoms**: Export button doesn't download file

**Solutions**:
1. Check browser pop-up blocker
2. Verify sufficient disk space
3. Try different export format
4. Reduce data size with filters
5. Try different browser

### Getting Help

#### Self-Service Resources
- **API Documentation**: `/docs/admin-dashboard-api.md`
- **Kiro AI Integration Guide**: `/docs/admin-dashboard-kiro-integration.md`
- **System Status**: Check health monitoring page

#### Contact Support

**Email**: admin@thandi.online

**Include in Support Request**:
- Description of issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and OS information
- Timestamp when issue occurred

**Response Times**:
- Critical issues: Within 1 hour
- High priority: Within 4 hours
- Medium priority: Within 24 hours
- Low priority: Within 1 week

### Reporting Bugs

To report a bug:

1. Check if issue is already known (review error tracking)
2. Gather information:
   - What you were trying to do
   - What happened instead
   - Error messages (if any)
   - Steps to reproduce
3. Email details to admin@thandi.online
4. Include screenshots or screen recordings if helpful

### Feature Requests

To request a new feature:

1. Email admin@thandi.online with:
   - Feature description
   - Use case (why you need it)
   - Priority (nice-to-have vs. critical)
2. Feature will be reviewed and prioritized
3. You'll be notified of decision and timeline

---

## Appendix

### Keyboard Shortcuts

- **Ctrl/Cmd + R**: Refresh dashboard
- **Ctrl/Cmd + F**: Search errors
- **Esc**: Close modal dialogs
- **Tab**: Navigate between fields

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported**:
- Internet Explorer (any version)
- Older browser versions

### Security Best Practices

1. **Change Default Password**: Immediately after first login
2. **Use Strong Passwords**: Minimum 12 characters, mixed case, numbers, symbols
3. **Don't Share Credentials**: Each admin should have own account
4. **Log Out When Done**: Especially on shared computers
5. **Monitor Access Logs**: Review who accessed dashboard

### Data Retention

- **Error Logs**: 90 days
- **Performance Metrics**: 90 days
- **Activity Logs**: 90 days
- **Health Checks**: 30 days
- **Alerts**: 90 days

### Privacy and Compliance

- All data is encrypted in transit and at rest
- Access logs maintained for audit purposes
- POPIA compliant data handling
- No personal data shared with third parties

---

## Glossary

**API**: Application Programming Interface - how systems communicate

**Dashboard**: Overview page showing key metrics

**Endpoint**: Specific API URL that performs a function

**Funnel**: Series of steps users take to complete a goal

**Health Check**: Automated test of system components

**Metric**: Measurable value indicating system performance

**P95/P99**: 95th/99th percentile - value below which 95%/99% of data falls

**RAG**: Retrieval-Augmented Generation - AI system for recommendations

**Response Time**: Time taken to process and return API request

**Severity**: Priority level of error or alert

**Threshold**: Value that triggers an alert when exceeded

---

**Last Updated**: January 24, 2026  
**Version**: 1.0  
**For Questions**: admin@thandi.online
