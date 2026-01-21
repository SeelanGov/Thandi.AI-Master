# Thandi Admin Dashboard - Kiro AI Integration Guide

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**For**: Kiro AI Development

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Setup](#authentication-setup)
3. [Core Workflows](#core-workflows)
4. [Example Queries](#example-queries)
5. [Analysis Patterns](#analysis-patterns)
6. [Best Practices](#best-practices)
7. [Error Handling](#error-handling)

---

## Overview

The Thandi Admin Dashboard provides a comprehensive API for Kiro AI to monitor system health, analyze errors, and provide proactive recommendations to developers.

### Key Capabilities

**Monitoring**
- Real-time error tracking
- Performance metrics analysis
- User activity monitoring
- System health checks

**Analysis**
- Error pattern detection
- Performance degradation identification
- User behavior analysis
- Anomaly detection

**Automation**
- Automated health checks
- Proactive alerting
- Trend analysis
- Predictive insights

---

## Authentication Setup

### Getting Your API Key

Your API key is stored in the `admin_users` table:

```sql
SELECT api_key FROM admin_users WHERE email = 'kiro@thandi.co.za';
```

**API Key Format**: `kiro_[64_character_hex_string]`

### Environment Configuration

Add to your `.env` file:

```bash
THANDI_ADMIN_API_KEY=kiro_your_api_key_here
THANDI_API_BASE_URL=https://thandi.co.za/api/admin
```

### Making Authenticated Requests

```javascript
const headers = {
  'X-API-Key': process.env.THANDI_ADMIN_API_KEY,
  'Content-Type': 'application/json'
};

const response = await fetch(`${process.env.THANDI_API_BASE_URL}/errors`, {
  headers
});
```

---

## Core Workflows

### 1. Post-Deployment Health Check

**When**: After every deployment to production

**Workflow**:
```javascript
async function postDeploymentCheck() {
  // 1. Run health check
  const health = await fetch(`${API_BASE}/health/check`, {
    method: 'POST',
    headers
  });
  
  const healthData = await health.json();
  
  if (healthData.data.overall_status !== 'healthy') {
    console.error('⚠️ Health check failed:', healthData);
    // Create GitHub issue
    await createGitHubIssue({
      title: 'Post-deployment health check failed',
      body: JSON.stringify(healthData, null, 2)
    });
  }
  
  // 2. Check for new errors (last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const errors = await fetch(
    `${API_BASE}/errors?start_date=${fiveMinutesAgo}`,
    { headers }
  );
  
  const errorData = await errors.json();
  
  if (errorData.data.length > 0) {
    console.warn(`⚠️ ${errorData.data.length} new errors detected`);
    // Analyze errors
    const analysis = analyzeErrors(errorData.data);
    console.log('Error Analysis:', analysis);
  }
  
  // 3. Check performance
  const performance = await fetch(
    `${API_BASE}/performance?start_date=${fiveMinutesAgo}`,
    { headers }
  );
  
  const perfData = await performance.json();
  
  if (perfData.data.summary.average_response_time > 500) {
    console.warn('⚠️ Performance degradation detected');
    // Investigate slow endpoints
    console.log('Slow endpoints:', perfData.data.slow_endpoints);
  }
  
  console.log('✅ Post-deployment check complete');
}
```

### 2. Daily System Report

**When**: Every morning at 9 AM

**Workflow**:
```javascript
async function generateDailyReport() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString();
  
  // 1. Get dashboard overview
  const overview = await fetch(`${API_BASE}/dashboard/overview`, { headers });
  const overviewData = await overview.json();
  
  // 2. Get errors from last 24h
  const errors = await fetch(
    `${API_BASE}/errors?start_date=${yesterday}&end_date=${today}`,
    { headers }
  );
  const errorData = await errors.json();
  
  // 3. Get performance metrics
  const performance = await fetch(
    `${API_BASE}/performance?start_date=${yesterday}&end_date=${today}`,
    { headers }
  );
  const perfData = await performance.json();
  
  // 4. Get user activity
  const activity = await fetch(
    `${API_BASE}/activity?start_date=${yesterday}&end_date=${today}`,
    { headers }
  );
  const activityData = await activity.json();
  
  // 5. Generate report
  const report = {
    date: today,
    summary: {
      errors: errorData.pagination.total,
      avgResponseTime: perfData.data.summary.average_response_time,
      activeUsers: activityData.data.summary.active_users_24h,
      systemHealth: overviewData.data.metrics.system_health.value
    },
    topErrors: errorData.data.slice(0, 5),
    slowEndpoints: perfData.data.slow_endpoints,
    conversionRate: activityData.data.summary.conversion_rate
  };
  
  // 6. Send to Slack/Email
  await sendReport(report);
  
  return report;
}
```

### 3. Error Pattern Detection

**When**: Continuously (every 15 minutes)

**Workflow**:
```javascript
async function detectErrorPatterns() {
  const last15Min = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  
  // Get recent errors
  const response = await fetch(
    `${API_BASE}/errors?start_date=${last15Min}`,
    { headers }
  );
  const { data: errors } = await response.json();
  
  // Group by error type
  const errorsByType = errors.reduce((acc, error) => {
    acc[error.error_type] = (acc[error.error_type] || 0) + 1;
    return acc;
  }, {});
  
  // Detect spikes
  for (const [type, count] of Object.entries(errorsByType)) {
    if (count > 5) {
      console.warn(`🚨 Error spike detected: ${type} (${count} occurrences)`);
      
      // Get details
      const typeErrors = errors.filter(e => e.error_type === type);
      
      // Analyze common patterns
      const analysis = {
        type,
        count,
        affectedFeatures: [...new Set(typeErrors.map(e => e.feature_area))],
        affectedSchools: [...new Set(typeErrors.map(e => e.school_id))],
        commonMessage: findMostCommon(typeErrors.map(e => e.message))
      };
      
      // Create GitHub issue
      await createGitHubIssue({
        title: `Error spike: ${type} (${count} occurrences)`,
        body: `## Error Analysis\n\n${JSON.stringify(analysis, null, 2)}`,
        labels: ['bug', 'high-priority']
      });
    }
  }
}
```

### 4. Performance Monitoring

**When**: Continuously (every 5 minutes)

**Workflow**:
```javascript
async function monitorPerformance() {
  // Get performance trends
  const response = await fetch(
    `${API_BASE}/performance/trends?interval=hour`,
    { headers }
  );
  const { data } = await response.json();
  
  // Check for degradation
  if (data.degradation_detected) {
    console.error('🚨 Performance degradation detected!');
    
    // Get slow endpoints
    const perfResponse = await fetch(`${API_BASE}/performance`, { headers });
    const perfData = await perfResponse.json();
    
    const slowEndpoints = perfData.data.slow_endpoints;
    
    // Analyze each slow endpoint
    for (const endpoint of slowEndpoints) {
      console.log(`Investigating slow endpoint: ${endpoint.endpoint}`);
      
      // Check recent changes
      const recentDeployments = await getRecentDeployments();
      
      // Check database queries
      const dbMetrics = await getDatabaseMetrics(endpoint.endpoint);
      
      // Generate recommendations
      const recommendations = generateOptimizationRecommendations({
        endpoint,
        deployments: recentDeployments,
        dbMetrics
      });
      
      console.log('Recommendations:', recommendations);
    }
  }
}
```

### 5. User Behavior Analysis

**When**: Daily at 6 PM

**Workflow**:
```javascript
async function analyzeUserBehavior() {
  // Get funnel metrics
  const response = await fetch(`${API_BASE}/activity/funnel`, { headers });
  const { data } = await response.json();
  
  // Identify drop-off points
  const dropOffPoints = data.drop_off_points.filter(
    point => point.drop_off_rate > 20
  );
  
  if (dropOffPoints.length > 0) {
    console.warn('⚠️ High drop-off detected:', dropOffPoints);
    
    for (const point of dropOffPoints) {
      // Check for errors at this step
      const errors = await fetch(
        `${API_BASE}/errors?feature=${point.from}`,
        { headers }
      );
      const errorData = await errors.json();
      
      // Check performance at this step
      const performance = await fetch(
        `${API_BASE}/performance?endpoint=/api/${point.from}`,
        { headers }
      );
      const perfData = await performance.json();
      
      // Generate insights
      const insights = {
        step: point.from,
        dropOffRate: point.drop_off_rate,
        usersLost: point.users_lost,
        possibleCauses: {
          errors: errorData.pagination.total,
          slowPerformance: perfData.data.summary.average_response_time > 500,
          recommendations: []
        }
      };
      
      if (insights.possibleCauses.errors > 0) {
        insights.possibleCauses.recommendations.push(
          'Fix errors in this step'
        );
      }
      
      if (insights.possibleCauses.slowPerformance) {
        insights.possibleCauses.recommendations.push(
          'Optimize performance for this endpoint'
        );
      }
      
      console.log('User Behavior Insights:', insights);
    }
  }
}
```

---

## Example Queries

### Get All Errors from Last Hour

```javascript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

const response = await fetch(
  `${API_BASE}/errors?start_date=${oneHourAgo}`,
  { headers }
);

const { data: errors } = await response.json();
console.log(`Found ${errors.length} errors in last hour`);
```

### Get Errors for Specific School

```javascript
const response = await fetch(
  `${API_BASE}/errors?school_id=SCHOOL123`,
  { headers }
);

const { data: errors } = await response.json();
console.log(`School SCHOOL123 has ${errors.length} errors`);
```

### Get Performance Metrics for Specific Endpoint

```javascript
const response = await fetch(
  `${API_BASE}/performance?endpoint=/api/student/register`,
  { headers }
);

const { data } = await response.json();
console.log('Registration endpoint performance:', data.by_endpoint[0]);
```

### Get Active Users

```javascript
const response = await fetch(`${API_BASE}/activity`, { headers });
const { data } = await response.json();

console.log('Active users (24h):', data.summary.active_users_24h);
console.log('Active users (7d):', data.summary.active_users_7d);
```

### Check System Health

```javascript
const response = await fetch(`${API_BASE}/health`, { headers });
const { data } = await response.json();

console.log('System status:', data.current_status);
console.log('Uptime:', data.statistics.uptime_percentage + '%');
```

---

## Analysis Patterns

### Error Clustering

Group similar errors to identify patterns:

```javascript
function clusterErrors(errors) {
  const clusters = {};
  
  for (const error of errors) {
    // Create cluster key from error type + feature area
    const key = `${error.error_type}:${error.feature_area}`;
    
    if (!clusters[key]) {
      clusters[key] = {
        type: error.error_type,
        feature: error.feature_area,
        count: 0,
        errors: [],
        schools: new Set(),
        grades: new Set()
      };
    }
    
    clusters[key].count++;
    clusters[key].errors.push(error);
    if (error.school_id) clusters[key].schools.add(error.school_id);
    if (error.student_grade) clusters[key].grades.add(error.student_grade);
  }
  
  // Convert to array and sort by count
  return Object.values(clusters)
    .map(cluster => ({
      ...cluster,
      schools: Array.from(cluster.schools),
      grades: Array.from(cluster.grades)
    }))
    .sort((a, b) => b.count - a.count);
}
```

### Performance Trend Analysis

Detect performance trends over time:

```javascript
async function analyzePerformanceTrends(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const response = await fetch(
    `${API_BASE}/performance/trends?start_date=${startDate}&interval=day`,
    { headers }
  );
  
  const { data } = await response.json();
  
  // Calculate trend
  const trends = data.trends;
  const firstDay = trends[0].avg_response_time;
  const lastDay = trends[trends.length - 1].avg_response_time;
  const change = ((lastDay - firstDay) / firstDay) * 100;
  
  return {
    trend: change > 0 ? 'degrading' : 'improving',
    changePercent: Math.abs(change).toFixed(2),
    recommendation: change > 20 ? 'Investigate performance issues' : 'Performance is stable'
  };
}
```

### Conversion Funnel Optimization

Identify funnel optimization opportunities:

```javascript
async function optimizeFunnel() {
  const response = await fetch(`${API_BASE}/activity/funnel`, { headers });
  const { data } = await response.json();
  
  const opportunities = [];
  
  for (const point of data.drop_off_points) {
    if (point.drop_off_rate > 15) {
      opportunities.push({
        step: point.from,
        dropOffRate: point.drop_off_rate,
        usersLost: point.users_lost,
        potentialGain: Math.round(point.users_lost * 0.5), // 50% recovery
        priority: point.drop_off_rate > 30 ? 'high' : 'medium'
      });
    }
  }
  
  return opportunities.sort((a, b) => b.potentialGain - a.potentialGain);
}
```

---

## Best Practices

### 1. Rate Limiting

Respect the 100 requests/minute rate limit:

```javascript
class RateLimitedClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.requests = [];
  }
  
  async fetch(url, options = {}) {
    // Remove requests older than 1 minute
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < 60000);
    
    // Check rate limit
    if (this.requests.length >= 100) {
      const oldestRequest = this.requests[0];
      const waitTime = 60000 - (now - oldestRequest);
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Make request
    this.requests.push(now);
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-API-Key': this.apiKey
      }
    });
  }
}
```

### 2. Error Handling

Always handle API errors gracefully:

```javascript
async function safeApiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network Error:', error);
    return null;
  }
}
```

### 3. Caching

Cache frequently accessed data:

```javascript
class CachedClient {
  constructor(apiKey, cacheDuration = 30000) {
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheDuration = cacheDuration;
  }
  
  async fetch(url, options = {}) {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-API-Key': this.apiKey
      }
    });
    
    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }
}
```

### 4. Batch Operations

Batch multiple operations when possible:

```javascript
async function batchAnalysis() {
  // Make all requests in parallel
  const [errors, performance, activity, health] = await Promise.all([
    fetch(`${API_BASE}/errors`, { headers }),
    fetch(`${API_BASE}/performance`, { headers }),
    fetch(`${API_BASE}/activity`, { headers }),
    fetch(`${API_BASE}/health`, { headers })
  ]);
  
  // Parse all responses
  const [errorData, perfData, activityData, healthData] = await Promise.all([
    errors.json(),
    performance.json(),
    activity.json(),
    health.json()
  ]);
  
  return {
    errors: errorData,
    performance: perfData,
    activity: activityData,
    health: healthData
  };
}
```

### 5. Logging

Log all API interactions for debugging:

```javascript
async function loggedFetch(url, options) {
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`[API] ${response.status} ${url} (${duration}ms)`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] ERROR ${url} (${duration}ms):`, error);
    throw error;
  }
}
```

---

## Error Handling

### Handling Rate Limits

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.log(`Rate limited. Retrying after ${retryAfter}s...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return true; // Retry
  }
  return false; // Don't retry
}
```

### Handling Network Errors

```javascript
async function retryableRequest(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (await handleRateLimit(response)) {
        continue; // Retry
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Handling Invalid Responses

```javascript
async function validateResponse(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`API returned error: ${data.error}`);
  }
  
  return data;
}
```

---

## Advanced Use Cases

### Predictive Alerting

Predict issues before they become critical:

```javascript
async function predictiveMonitoring() {
  // Get performance trends
  const trends = await analyzePerformanceTrends(7);
  
  if (trends.trend === 'degrading' && parseFloat(trends.changePercent) > 30) {
    console.warn('🔮 Prediction: Performance will degrade significantly');
    console.warn('Recommendation: Schedule optimization sprint');
    
    // Create proactive GitHub issue
    await createGitHubIssue({
      title: 'Predictive Alert: Performance degradation trend detected',
      body: `Performance has degraded by ${trends.changePercent}% over the last 7 days. If this trend continues, we may experience critical performance issues.`,
      labels: ['performance', 'proactive']
    });
  }
}
```

### Automated Debugging

Automatically investigate and suggest fixes:

```javascript
async function autoDebug(errorId) {
  // Get error details
  const response = await fetch(`${API_BASE}/errors/${errorId}`, { headers });
  const { data: error } = await response.json();
  
  // Analyze error
  const analysis = {
    error_type: error.error_type,
    feature: error.feature_area,
    frequency: await getErrorFrequency(error.error_type, error.feature_area),
    relatedErrors: await getRelatedErrors(error),
    recentDeployments: await getRecentDeployments(),
    suggestedFixes: []
  };
  
  // Generate fix suggestions
  if (analysis.frequency > 10) {
    analysis.suggestedFixes.push('High frequency error - investigate root cause');
  }
  
  if (analysis.relatedErrors.length > 5) {
    analysis.suggestedFixes.push('Multiple related errors - may be systemic issue');
  }
  
  if (analysis.recentDeployments.length > 0) {
    analysis.suggestedFixes.push('Recent deployment detected - may be regression');
  }
  
  return analysis;
}
```

---

## Support

For Kiro AI integration support:
- **Email**: dev@thandi.co.za
- **Slack**: #kiro-integration (internal)
- **Documentation**: `/docs/admin-dashboard-api.md`

---

**Document Version**: 1.0  
**Last Updated**: January 20, 2026  
**Maintained by**: Thandi Development Team
