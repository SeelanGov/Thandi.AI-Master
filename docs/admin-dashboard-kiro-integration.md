# Kiro AI Integration Guide

**Version**: 1.0  
**Last Updated**: January 24, 2026  
**For**: Kiro AI Admin Dashboard Integration

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Key Setup](#api-key-setup)
3. [Authentication](#authentication)
4. [Common Workflows](#common-workflows)
5. [Example Queries](#example-queries)
6. [Best Practices](#best-practices)
7. [Error Handling](#error-handling)
8. [Monitoring and Logging](#monitoring-and-logging)

---

## Overview

The Thandi.AI Admin Dashboard provides programmatic access for Kiro AI to monitor system health, analyze errors, track performance, and provide intelligent recommendations for system optimization.

### Capabilities

Kiro AI can:
- **Monitor System Health**: Check database, API, and RAG system status
- **Analyze Errors**: Detect patterns, identify root causes, suggest fixes
- **Track Performance**: Identify slow endpoints, analyze trends, recommend optimizations
- **Analyze User Activity**: Calculate conversion rates, identify drop-off points, suggest UX improvements
- **Manage Alerts**: Configure alert rules, monitor alert history, resolve alerts
- **Generate Reports**: Create comprehensive system health and performance reports

### Use Cases

1. **Automated Monitoring**: Continuous system health checks
2. **Proactive Debugging**: Detect and diagnose issues before they impact users
3. **Performance Optimization**: Identify and fix performance bottlenecks
4. **User Experience Analysis**: Improve conversion rates and user engagement
5. **Incident Response**: Rapid diagnosis and resolution of production issues

---

## API Key Setup

### Obtaining Your API Key

The API key is generated during admin user creation. If you need to retrieve or regenerate your API key:

1. Log in to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the following query:

```sql
SELECT api_key FROM admin_users WHERE email = 'admin@thandi.online';
```

### API Key Format

API keys follow this format:
```
kiro_[64-character-hash]
```

Example:
```
kiro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Environment Configuration

Add the API key to your Kiro AI environment:

**Local Development** (`.env.local`):
```bash
ADMIN_API_KEY=kiro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Production** (Vercel Environment Variables):
```bash
vercel env add ADMIN_API_KEY
# Enter the API key when prompted
```

### Security Considerations

- **Never commit API keys** to version control
- **Rotate keys regularly** (every 90 days recommended)
- **Use environment variables** for all deployments
- **Monitor API key usage** for suspicious activity
- **Revoke compromised keys** immediately

---

## Authentication

### Using API Key Authentication

Include the API key in the request header:

**Header Name**: `X-API-Key` or `x-api-key` (case-insensitive)

**Example Request** (cURL):
```bash
curl -H "X-API-Key: kiro_a1b2c3d4..." \
     https://thandi.online/api/admin/dashboard/overview
```

**Example Request** (JavaScript):
```javascript
const response = await fetch('https://thandi.online/api/admin/dashboard/overview', {
  headers: {
    'X-API-Key': process.env.ADMIN_API_KEY
  }
});

const data = await response.json();
```

**Example Request** (Python):
```python
import os
import requests

headers = {
    'X-API-Key': os.environ['ADMIN_API_KEY']
}

response = requests.get(
    'https://thandi.online/api/admin/dashboard/overview',
    headers=headers
)

data = response.json()
```

### Rate Limiting

**Limit**: 100 requests per minute per API key

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706140800
```

**Handling Rate Limits**:
```javascript
async function makeRequest(url) {
  const response = await fetch(url, {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  });
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitTime = (resetTime * 1000) - Date.now();
    
    console.log(`Rate limited. Waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return makeRequest(url); // Retry
  }
  
  return response.json();
}
```

---

## Common Workflows

### Workflow 1: Daily Health Check

**Purpose**: Monitor system health and alert on issues

**Frequency**: Every 5 minutes (via cron job)

**Steps**:
1. Query dashboard overview
2. Check overall health status
3. Identify critical errors
4. Verify component health
5. Alert if issues detected

**Implementation**:
```javascript
async function dailyHealthCheck() {
  const overview = await fetch('https://thandi.online/api/admin/dashboard/overview', {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  }).then(r => r.json());
  
  // Check for critical issues
  const criticalErrors = overview.metrics.errors.critical;
  const healthStatus = overview.metrics.health.status;
  
  if (criticalErrors > 0 || healthStatus !== 'healthy') {
    await alertTeam({
      severity: 'high',
      message: `System health check failed: ${criticalErrors} critical errors, status: ${healthStatus}`,
      details: overview
    });
  }
  
  // Log health check
  console.log(`Health check completed: ${healthStatus}, ${criticalErrors} critical errors`);
  
  return overview;
}
```

### Workflow 2: Error Analysis and Pattern Detection

**Purpose**: Identify error patterns and suggest fixes

**Frequency**: Hourly or when error rate increases

**Steps**:
1. Query recent errors
2. Group by type and message
3. Identify patterns
4. Analyze root causes
5. Suggest fixes

**Implementation**:
```javascript
async function analyzeErrors() {
  const errors = await fetch('https://thandi.online/api/admin/errors?limit=100', {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  }).then(r => r.json());
  
  // Group errors by type
  const errorsByType = errors.errors.reduce((acc, error) => {
    acc[error.type] = acc[error.type] || [];
    acc[error.type].push(error);
    return acc;
  }, {});
  
  // Identify patterns
  const patterns = Object.entries(errorsByType).map(([type, errors]) => ({
    type,
    count: errors.length,
    severity: errors[0].severity,
    commonMessage: findMostCommonMessage(errors),
    affectedSchools: [...new Set(errors.map(e => e.schoolId).filter(Boolean))]
  }));
  
  // Generate recommendations
  const recommendations = patterns.map(pattern => ({
    issue: pattern.commonMessage,
    severity: pattern.severity,
    affectedCount: pattern.count,
    suggestedFix: generateFix(pattern)
  }));
  
  return recommendations;
}

function findMostCommonMessage(errors) {
  const messageCounts = errors.reduce((acc, error) => {
    acc[error.message] = (acc[error.message] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(messageCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
}

function generateFix(pattern) {
  // AI-powered fix suggestion based on error pattern
  const fixes = {
    'database_error': 'Check database connection pool settings and query optimization',
    'api_error': 'Review API endpoint implementation and error handling',
    'authentication_error': 'Verify JWT token generation and validation logic',
    'rag_error': 'Check RAG system configuration and embedding generation'
  };
  
  return fixes[pattern.type] || 'Review error logs and stack traces for root cause';
}
```

### Workflow 3: Performance Monitoring and Optimization

**Purpose**: Identify slow endpoints and recommend optimizations

**Frequency**: Every 15 minutes

**Steps**:
1. Query performance metrics
2. Identify slow endpoints (>500ms)
3. Analyze performance trends
4. Detect degradation
5. Recommend optimizations

**Implementation**:
```javascript
async function monitorPerformance() {
  const performance = await fetch('https://thandi.online/api/admin/performance', {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  }).then(r => r.json());
  
  // Identify slow endpoints
  const slowEndpoints = performance.byEndpoint
    .filter(endpoint => endpoint.avgResponseTime > 500)
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime);
  
  if (slowEndpoints.length > 0) {
    const recommendations = slowEndpoints.map(endpoint => ({
      endpoint: endpoint.endpoint,
      currentAvg: endpoint.avgResponseTime,
      requestCount: endpoint.count,
      recommendations: generatePerformanceRecommendations(endpoint)
    }));
    
    await alertTeam({
      severity: 'medium',
      message: `${slowEndpoints.length} slow endpoints detected`,
      details: recommendations
    });
  }
  
  return slowEndpoints;
}

function generatePerformanceRecommendations(endpoint) {
  const recommendations = [];
  
  if (endpoint.avgResponseTime > 1000) {
    recommendations.push('Critical: Response time >1s. Immediate optimization required.');
  }
  
  if (endpoint.endpoint.includes('/rag/')) {
    recommendations.push('Consider caching RAG responses for common queries');
    recommendations.push('Optimize embedding generation and vector search');
  }
  
  if (endpoint.endpoint.includes('/api/')) {
    recommendations.push('Review database query performance');
    recommendations.push('Add database indexes for frequently queried fields');
    recommendations.push('Consider implementing pagination');
  }
  
  return recommendations;
}
```

### Workflow 4: Activity Analysis and UX Improvements

**Purpose**: Improve conversion rates and user engagement

**Frequency**: Daily

**Steps**:
1. Query activity metrics
2. Calculate conversion rates
3. Identify drop-off points
4. Analyze user behavior
5. Suggest UX improvements

**Implementation**:
```javascript
async function analyzeUserActivity() {
  const activity = await fetch('https://thandi.online/api/admin/activity', {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  }).then(r => r.json());
  
  const funnel = await fetch('https://thandi.online/api/admin/activity/funnel', {
    headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
  }).then(r => r.json());
  
  // Analyze conversion rates
  const conversionRates = funnel.conversionRates;
  const dropOffPoints = funnel.dropOffPoints;
  
  // Identify issues
  const issues = [];
  
  if (conversionRates.landingToRegistration < 40) {
    issues.push({
      stage: 'Landing to Registration',
      rate: conversionRates.landingToRegistration,
      severity: 'high',
      recommendations: [
        'Simplify registration form',
        'Add social login options',
        'Improve value proposition messaging',
        'Add trust indicators (testimonials, security badges)'
      ]
    });
  }
  
  if (conversionRates.registrationToAssessment < 80) {
    issues.push({
      stage: 'Registration to Assessment',
      rate: conversionRates.registrationToAssessment,
      severity: 'medium',
      recommendations: [
        'Add onboarding tutorial',
        'Improve assessment instructions',
        'Add progress indicators',
        'Enable save and resume functionality'
      ]
    });
  }
  
  if (conversionRates.assessmentToResults < 90) {
    issues.push({
      stage: 'Assessment to Results',
      rate: conversionRates.assessmentToResults,
      severity: 'high',
      recommendations: [
        'Optimize results page loading speed',
        'Improve results presentation',
        'Add loading indicators',
        'Fix any technical issues preventing results display'
      ]
    });
  }
  
  return issues;
}
```

---

## Example Queries

### Query 1: Get Dashboard Overview

**Purpose**: Get comprehensive system overview

```javascript
const overview = await fetch('https://thandi.online/api/admin/dashboard/overview?timeRange=24h', {
  headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
}).then(r => r.json());

console.log('System Status:', overview.metrics.health.status);
console.log('Total Errors:', overview.metrics.errors.total);
console.log('Avg Response Time:', overview.metrics.performance.avgResponseTime);
console.log('Active Users:', overview.metrics.activity.activeUsers);
```

### Query 2: Get Recent Errors

**Purpose**: Retrieve and analyze recent errors

```javascript
const errors = await fetch('https://thandi.online/api/admin/errors?severity=high&limit=20', {
  headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
}).then(r => r.json());

errors.errors.forEach(error => {
  console.log(`[${error.severity}] ${error.type}: ${error.message}`);
  console.log(`  Occurrences: ${error.count}`);
  console.log(`  Last seen: ${error.lastOccurrence}`);
});
```

### Query 3: Get Performance Metrics

**Purpose**: Monitor API performance

```javascript
const performance = await fetch('https://thandi.online/api/admin/performance', {
  headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
}).then(r => r.json());

console.log('Performance Summary:');
console.log('  Total Requests:', performance.summary.totalRequests);
console.log('  Avg Response Time:', performance.summary.avgResponseTime, 'ms');
console.log('  P95 Response Time:', performance.summary.p95ResponseTime, 'ms');

console.log('\nSlow Endpoints:');
performance.slowEndpoints.forEach(endpoint => {
  console.log(`  ${endpoint.endpoint}: ${endpoint.avgResponseTime}ms`);
});
```

### Query 4: Get Activity Funnel

**Purpose**: Analyze user conversion funnel

```javascript
const funnel = await fetch('https://thandi.online/api/admin/activity/funnel', {
  headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
}).then(r => r.json());

console.log('Conversion Funnel:');
console.log('  Landing Page:', funnel.funnel.landingPage);
console.log('  Registration:', funnel.funnel.registration, 
            `(${funnel.conversionRates.landingToRegistration}%)`);
console.log('  Assessment:', funnel.funnel.assessment,
            `(${funnel.conversionRates.registrationToAssessment}%)`);
console.log('  Results:', funnel.funnel.results,
            `(${funnel.conversionRates.assessmentToResults}%)`);
```

### Query 5: Check System Health

**Purpose**: Verify all components are healthy

```javascript
const health = await fetch('https://thandi.online/api/admin/health', {
  headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
}).then(r => r.json());

console.log('System Health:', health.status);
console.log('Components:');
Object.entries(health.components).forEach(([name, component]) => {
  console.log(`  ${name}: ${component.status} (${component.responseTime}ms)`);
});
```

### Query 6: Resolve an Error

**Purpose**: Mark an error as resolved after fixing

```javascript
const errorId = 'err_abc123';

const result = await fetch(`https://thandi.online/api/admin/errors/${errorId}`, {
  method: 'PUT',
  headers: {
    'X-API-Key': process.env.ADMIN_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resolved: true,
    resolution: 'Fixed database connection pool settings'
  })
}).then(r => r.json());

console.log('Error resolved:', result.success);
```

---

## Best Practices

### 1. Caching Strategy

**Cache dashboard overview** to reduce API calls:

```javascript
class AdminDashboardClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }
  
  async getDashboardOverview() {
    const cacheKey = 'dashboard_overview';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    const data = await fetch('https://thandi.online/api/admin/dashboard/overview', {
      headers: { 'X-API-Key': this.apiKey }
    }).then(r => r.json());
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
}
```

### 2. Use Date Range Filters

**Limit data returned** to improve performance:

```javascript
// Good: Specific date range
const errors = await fetch(
  'https://thandi.online/api/admin/errors?' +
  'startDate=2026-01-24T00:00:00Z&' +
  'endDate=2026-01-24T23:59:59Z',
  { headers: { 'X-API-Key': process.env.ADMIN_API_KEY } }
).then(r => r.json());

// Bad: No date range (returns all data)
const allErrors = await fetch(
  'https://thandi.online/api/admin/errors',
  { headers: { 'X-API-Key': process.env.ADMIN_API_KEY } }
).then(r => r.json());
```

### 3. Implement Exponential Backoff

**Handle rate limits gracefully**:

```javascript
async function fetchWithBackoff(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status !== 429) {
      return response.json();
    }
    
    const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
    console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  throw new Error('Max retries exceeded');
}
```

### 4. Log All API Interactions

**Maintain audit trail** for debugging:

```javascript
class AdminDashboardClient {
  async makeRequest(endpoint, options = {}) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://thandi.online${endpoint}`, {
        ...options,
        headers: {
          'X-API-Key': this.apiKey,
          ...options.headers
        }
      });
      
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      // Log successful request
      this.log({
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        duration,
        success: true
      });
      
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed request
      this.log({
        endpoint,
        method: options.method || 'GET',
        duration,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  log(entry) {
    console.log(`[Admin API] ${entry.method} ${entry.endpoint} - ${entry.status} (${entry.duration}ms)`);
    // Also send to logging service
  }
}
```

### 5. Batch Operations

**Combine multiple queries** when possible:

```javascript
// Good: Single dashboard overview call
const overview = await client.getDashboardOverview();
const errors = overview.recentErrors;
const health = overview.metrics.health;
const performance = overview.metrics.performance;

// Bad: Multiple separate calls
const errors = await client.getErrors();
const health = await client.getHealth();
const performance = await client.getPerformance();
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or missing API key",
  "code": "UNAUTHORIZED"
}
```

**Solution**: Verify API key is correct and included in request header

#### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Solution**: Implement exponential backoff and retry logic

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

**Solution**: Check system health, retry request, contact support if persists

### Error Handling Pattern

```javascript
async function safeApiCall(endpoint) {
  try {
    const response = await fetch(`https://thandi.online${endpoint}`, {
      headers: { 'X-API-Key': process.env.ADMIN_API_KEY }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error} (${error.code})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to call ${endpoint}:`, error.message);
    
    // Implement fallback or retry logic
    if (error.message.includes('RATE_LIMIT')) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 60000));
      return safeApiCall(endpoint);
    }
    
    throw error;
  }
}
```

---

## Monitoring and Logging

### Monitoring Kiro AI Integration

Track these metrics for Kiro AI integration:
- **API Call Volume**: Requests per minute
- **API Response Times**: Average and P95
- **Error Rate**: Percentage of failed requests
- **Cache Hit Rate**: Percentage of cached responses
- **Alert Response Time**: Time from alert to resolution

### Logging Best Practices

```javascript
class KiroLogger {
  log(level, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      source: 'kiro-ai-integration'
    };
    
    console.log(JSON.stringify(entry));
    
    // Also send to logging service (e.g., Datadog, Sentry)
    this.sendToLoggingService(entry);
  }
  
  info(message, metadata) {
    this.log('info', message, metadata);
  }
  
  error(message, metadata) {
    this.log('error', message, metadata);
  }
  
  warn(message, metadata) {
    this.log('warn', message, metadata);
  }
}

const logger = new KiroLogger();

// Usage
logger.info('Health check completed', {
  status: 'healthy',
  duration: 515,
  components: ['database', 'api', 'rag']
});
```

---

## Support and Resources

### Documentation
- **API Documentation**: `/docs/admin-dashboard-api.md`
- **User Guide**: `/docs/admin-dashboard-user-guide.md`

### Contact
- **Email**: admin@thandi.online
- **Response Time**: Within 4 hours for integration issues

### Useful Links
- **System Status**: https://thandi.online/admin/health
- **Dashboard**: https://thandi.online/admin
- **API Base URL**: https://thandi.online/api/admin

---

**Last Updated**: January 24, 2026  
**Version**: 1.0  
**For Questions**: admin@thandi.online
