# Thandi Admin Dashboard - API Documentation

**Version**: 1.0  
**Last Updated**: January 20, 2026  
**Base URL**: `https://thandi.co.za/api/admin`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Tracking](#error-tracking)
3. [Performance Monitoring](#performance-monitoring)
4. [User Activity](#user-activity)
5. [System Health](#system-health)
6. [Alerts](#alerts)
7. [Dashboard Overview](#dashboard-overview)
8. [Rate Limiting](#rate-limiting)
9. [Error Codes](#error-codes)

---

## Authentication

The Admin Dashboard API supports two authentication methods:

### 1. JWT Authentication (Web UI)

Used by the admin web interface. Tokens are stored in httpOnly cookies.

**Login**
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@thandi.co.za",
  "password": "your_secure_password"
}
```

**Response**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@thandi.co.za",
    "role": "admin"
  }
}
```

**Logout**
```http
POST /api/admin/auth/logout
Cookie: token=<jwt_token>
```

**Response**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Verify Token**
```http
GET /api/admin/auth/verify
Cookie: token=<jwt_token>
```

**Response**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@thandi.co.za",
    "role": "admin"
  }
}
```

### 2. API Key Authentication (Kiro AI)

Used for programmatic access (e.g., Kiro AI integration).

**Headers**
```http
X-API-Key: kiro_your_api_key_here
```

**Example Request**
```http
GET /api/admin/errors
X-API-Key: kiro_your_api_key_here
```

---

## Error Tracking

### Log Error

Record a new error in the system.

**Endpoint**: `POST /api/admin/errors/log`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "error_type": "TypeError",
  "message": "Cannot read property 'id' of undefined",
  "stack_trace": "TypeError: Cannot read property 'id' of undefined\n    at RegistrationForm.jsx:42:15",
  "url": "/register",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "school_id": "SCHOOL123",
  "student_grade": 10,
  "feature_area": "registration",
  "severity": "error",
  "metadata": {
    "component": "RegistrationForm",
    "line": 42,
    "browser": "Chrome 120"
  }
}
```

**Response**
```json
{
  "success": true,
  "error_id": "660e8400-e29b-41d4-a716-446655440000",
  "message": "Error logged successfully"
}
```

### Get Errors

Retrieve errors with filtering and pagination.

**Endpoint**: `GET /api/admin/errors`  
**Authentication**: API Key or JWT

**Query Parameters**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50, max: 100) - Items per page
- `type` (string, optional) - Filter by error type
- `school_id` (string, optional) - Filter by school
- `feature` (string, optional) - Filter by feature area
- `severity` (string, optional) - Filter by severity (error, warning, critical)
- `resolved` (boolean, optional) - Filter by resolution status
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range

**Example Request**
```http
GET /api/admin/errors?page=1&limit=50&type=TypeError&school_id=SCHOOL123&start_date=2026-01-01T00:00:00Z&end_date=2026-01-20T23:59:59Z
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "error_type": "TypeError",
      "message": "Cannot read property 'id' of undefined",
      "url": "/register",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "school_id": "SCHOOL123",
      "student_grade": 10,
      "feature_area": "registration",
      "severity": "error",
      "resolved": false,
      "created_at": "2026-01-19T10:30:00Z",
      "metadata": {
        "component": "RegistrationForm",
        "line": 42
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Get Error Details

Retrieve full details for a specific error.

**Endpoint**: `GET /api/admin/errors/[id]`  
**Authentication**: API Key or JWT

**Example Request**
```http
GET /api/admin/errors/660e8400-e29b-41d4-a716-446655440000
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "error_type": "TypeError",
    "message": "Cannot read property 'id' of undefined",
    "stack_trace": "TypeError: Cannot read property 'id' of undefined\n    at RegistrationForm.jsx:42:15",
    "url": "/register",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "school_id": "SCHOOL123",
    "student_grade": 10,
    "feature_area": "registration",
    "severity": "error",
    "resolved": false,
    "resolved_at": null,
    "resolved_by": null,
    "created_at": "2026-01-19T10:30:00Z",
    "metadata": {
      "component": "RegistrationForm",
      "line": 42,
      "browser": "Chrome 120"
    }
  }
}
```

### Mark Error as Resolved

Mark an error as resolved.

**Endpoint**: `PUT /api/admin/errors/[id]`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "resolved": true
}
```

**Response**
```json
{
  "success": true,
  "message": "Error marked as resolved"
}
```

---

## Performance Monitoring

### Log Performance Metric

Record an API performance metric (usually done automatically by middleware).

**Endpoint**: `POST /api/admin/performance`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "endpoint": "/api/student/register",
  "method": "POST",
  "response_time": 450,
  "status_code": 200,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "school_id": "SCHOOL123",
  "error_message": null,
  "metadata": {
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Response**
```json
{
  "success": true,
  "metric_id": "770e8400-e29b-41d4-a716-446655440000"
}
```

### Get Performance Metrics

Retrieve performance metrics with statistics.

**Endpoint**: `GET /api/admin/performance`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range
- `endpoint` (string, optional) - Filter by specific endpoint

**Example Request**
```http
GET /api/admin/performance?start_date=2026-01-12T00:00:00Z&end_date=2026-01-19T23:59:59Z
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_requests": 1500,
      "average_response_time": 320,
      "median_response_time": 280,
      "p95_response_time": 650,
      "p99_response_time": 1200,
      "error_rate": 2.5,
      "success_rate": 97.5
    },
    "by_endpoint": [
      {
        "endpoint": "/api/student/register",
        "method": "POST",
        "requests": 500,
        "avg_response_time": 450,
        "median_response_time": 400,
        "p95_response_time": 800,
        "error_rate": 3.2
      },
      {
        "endpoint": "/api/rag/query",
        "method": "POST",
        "requests": 300,
        "avg_response_time": 353,
        "median_response_time": 320,
        "p95_response_time": 600,
        "error_rate": 1.0
      }
    ],
    "slow_endpoints": [
      {
        "endpoint": "/api/student/register",
        "avg_response_time": 650,
        "threshold": 500,
        "requests": 50
      }
    ]
  }
}
```

### Get Performance Trends

Retrieve performance trends over time.

**Endpoint**: `GET /api/admin/performance/trends`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range
- `interval` (string, optional) - Grouping interval (hour, day, week)

**Example Request**
```http
GET /api/admin/performance/trends?start_date=2026-01-12T00:00:00Z&end_date=2026-01-19T23:59:59Z&interval=day
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2026-01-12",
        "avg_response_time": 310,
        "requests": 200,
        "error_rate": 2.0
      },
      {
        "date": "2026-01-13",
        "avg_response_time": 325,
        "requests": 220,
        "error_rate": 2.5
      }
    ],
    "degradation_detected": false,
    "degradation_threshold": 50
  }
}
```

---

## User Activity

### Log Activity Event

Record a user activity event.

**Endpoint**: `POST /api/admin/activity`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "event_type": "registration",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "school_id": "SCHOOL123",
  "student_grade": 10,
  "session_id": "sess_abc123",
  "event_data": {
    "step": "complete",
    "duration_seconds": 120
  }
}
```

**Response**
```json
{
  "success": true,
  "activity_id": "880e8400-e29b-41d4-a716-446655440000"
}
```

### Get Activity Metrics

Retrieve user activity metrics.

**Endpoint**: `GET /api/admin/activity`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range
- `event_type` (string, optional) - Filter by event type

**Example Request**
```http
GET /api/admin/activity?start_date=2026-01-12T00:00:00Z&end_date=2026-01-19T23:59:59Z
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "summary": {
      "active_users_24h": 45,
      "active_users_7d": 180,
      "total_registrations": 120,
      "total_assessments": 95,
      "total_rag_queries": 250
    },
    "by_event_type": [
      {
        "event_type": "registration",
        "count": 120,
        "unique_users": 120
      },
      {
        "event_type": "assessment_start",
        "count": 95,
        "unique_users": 95
      },
      {
        "event_type": "assessment_complete",
        "count": 85,
        "unique_users": 85
      }
    ]
  }
}
```

### Get Funnel Metrics

Retrieve conversion funnel metrics.

**Endpoint**: `GET /api/admin/activity/funnel`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range

**Example Request**
```http
GET /api/admin/activity/funnel?start_date=2026-01-12T00:00:00Z&end_date=2026-01-19T23:59:59Z
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "funnel": [
      {
        "step": "registration",
        "count": 120,
        "conversion_rate": 100,
        "drop_off_rate": 0
      },
      {
        "step": "assessment_start",
        "count": 95,
        "conversion_rate": 79.2,
        "drop_off_rate": 20.8
      },
      {
        "step": "assessment_complete",
        "count": 85,
        "conversion_rate": 70.8,
        "drop_off_rate": 10.5
      }
    ],
    "overall_conversion": 70.8,
    "drop_off_points": [
      {
        "from": "registration",
        "to": "assessment_start",
        "drop_off_rate": 20.8,
        "users_lost": 25
      }
    ]
  }
}
```

---

## System Health

### Run Health Check

Manually trigger a system health check.

**Endpoint**: `POST /api/admin/health/check`  
**Authentication**: API Key or JWT

**Response**
```json
{
  "success": true,
  "data": {
    "overall_status": "healthy",
    "checks": [
      {
        "component": "database",
        "status": "healthy",
        "response_time": 45,
        "message": "Database connection successful"
      },
      {
        "component": "api_registration",
        "status": "healthy",
        "response_time": 120,
        "message": "API endpoint responding"
      },
      {
        "component": "rag_system",
        "status": "healthy",
        "response_time": 350,
        "message": "RAG system operational"
      }
    ],
    "timestamp": "2026-01-19T10:30:00Z"
  }
}
```

### Get Health Status

Retrieve recent health check results.

**Endpoint**: `GET /api/admin/health`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range
- `component` (string, optional) - Filter by component name
- `status` (string, optional) - Filter by status (healthy, degraded, unhealthy)

**Example Request**
```http
GET /api/admin/health?start_date=2026-01-19T00:00:00Z&component=database
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": {
    "current_status": "healthy",
    "checks": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440000",
        "check_type": "database",
        "component_name": "database",
        "status": "healthy",
        "response_time": 45,
        "error_message": null,
        "created_at": "2026-01-19T10:30:00Z"
      }
    ],
    "statistics": {
      "total_checks": 288,
      "healthy": 285,
      "degraded": 2,
      "unhealthy": 1,
      "uptime_percentage": 99.3
    }
  }
}
```

---

## Alerts

### Create Alert Configuration

Create a new alert configuration.

**Endpoint**: `POST /api/admin/alerts/config`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "alert_type": "error_rate",
  "threshold_value": 5.0,
  "threshold_unit": "percentage",
  "time_window": 60,
  "recipients": ["admin@thandi.co.za", "dev@thandi.co.za"],
  "enabled": true
}
```

**Response**
```json
{
  "success": true,
  "config_id": "aa0e8400-e29b-41d4-a716-446655440000",
  "message": "Alert configuration created"
}
```

### Get Alert Configurations

Retrieve all alert configurations.

**Endpoint**: `GET /api/admin/alerts/config`  
**Authentication**: API Key or JWT

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "alert_type": "error_rate",
      "threshold_value": 5.0,
      "threshold_unit": "percentage",
      "time_window": 60,
      "recipients": ["admin@thandi.co.za"],
      "enabled": true,
      "created_at": "2026-01-19T10:00:00Z"
    }
  ]
}
```

### Update Alert Configuration

Update an existing alert configuration.

**Endpoint**: `PUT /api/admin/alerts/config/[id]`  
**Authentication**: API Key or JWT

**Request Body**
```json
{
  "threshold_value": 10.0,
  "enabled": false
}
```

**Response**
```json
{
  "success": true,
  "message": "Alert configuration updated"
}
```

### Get Alert History

Retrieve alert history.

**Endpoint**: `GET /api/admin/alerts`  
**Authentication**: API Key or JWT

**Query Parameters**
- `start_date` (ISO 8601, optional) - Start of date range
- `end_date` (ISO 8601, optional) - End of date range
- `severity` (string, optional) - Filter by severity (info, warning, critical)
- `status` (string, optional) - Filter by status (active, resolved, dismissed)

**Example Request**
```http
GET /api/admin/alerts?severity=critical&status=active
X-API-Key: kiro_your_api_key_here
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440000",
      "alert_type": "error_rate",
      "message": "Error rate exceeded threshold: 7.5% (threshold: 5.0%)",
      "severity": "critical",
      "status": "active",
      "triggered_at": "2026-01-19T10:30:00Z",
      "metadata": {
        "current_value": 7.5,
        "threshold": 5.0,
        "time_window": 60
      }
    }
  ]
}
```

### Resolve Alert

Mark an alert as resolved.

**Endpoint**: `PUT /api/admin/alerts/[id]/resolve`  
**Authentication**: API Key or JWT

**Response**
```json
{
  "success": true,
  "message": "Alert resolved"
}
```

---

## Dashboard Overview

### Get Dashboard Overview

Retrieve aggregated dashboard metrics.

**Endpoint**: `GET /api/admin/dashboard/overview`  
**Authentication**: API Key or JWT

**Response**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "active_errors": {
        "value": 3,
        "trend": "-25%",
        "status": "good"
      },
      "average_response_time": {
        "value": 320,
        "trend": "+5%",
        "status": "good"
      },
      "active_users_24h": {
        "value": 45,
        "trend": "+15%",
        "status": "good"
      },
      "error_rate": {
        "value": 2.5,
        "trend": "-10%",
        "status": "good"
      },
      "slow_endpoints": {
        "value": 2,
        "trend": "0%",
        "status": "warning"
      },
      "system_health": {
        "value": "healthy",
        "trend": "N/A",
        "status": "good"
      }
    },
    "recent_errors": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "message": "Cannot read property 'id' of undefined",
        "feature_area": "registration",
        "severity": "error",
        "created_at": "2026-01-19T10:30:00Z"
      }
    ],
    "active_alerts": 0,
    "last_updated": "2026-01-19T10:35:00Z"
  }
}
```

---

## Rate Limiting

All API endpoints are rate-limited to **100 requests per minute** per API key.

### Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705660800
```

- `X-RateLimit-Limit`: Maximum requests allowed per minute
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

### Rate Limit Exceeded

When rate limit is exceeded, the API returns:

**Status Code**: `429 Too Many Requests`

**Response**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 30 seconds.",
  "retry_after": 30
}
```

---

## Error Codes

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Messages

**Authentication Errors**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**Validation Errors**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request parameters",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

**Not Found Errors**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Error with ID 660e8400-e29b-41d4-a716-446655440000 not found"
}
```

---

## Best Practices

### 1. Use Appropriate Authentication

- Use **JWT authentication** for web UI interactions
- Use **API key authentication** for programmatic access (Kiro AI)

### 2. Handle Rate Limits

```javascript
async function makeRequest(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeRequest(url, options);
  }
  
  return response;
}
```

### 3. Use Pagination

Always use pagination for large result sets:

```javascript
async function getAllErrors() {
  let page = 1;
  let allErrors = [];
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`/api/admin/errors?page=${page}&limit=100`);
    const data = await response.json();
    
    allErrors = allErrors.concat(data.data);
    hasMore = page < data.pagination.pages;
    page++;
  }
  
  return allErrors;
}
```

### 4. Filter Data Efficiently

Use query parameters to filter data on the server:

```javascript
// Good: Filter on server
const errors = await fetch('/api/admin/errors?type=TypeError&school_id=SCHOOL123');

// Bad: Fetch all and filter on client
const allErrors = await fetch('/api/admin/errors');
const filtered = allErrors.filter(e => e.type === 'TypeError');
```

### 5. Handle Errors Gracefully

```javascript
async function logError(errorData) {
  try {
    const response = await fetch('/api/admin/errors/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ADMIN_API_KEY
      },
      body: JSON.stringify(errorData)
    });
    
    if (!response.ok) {
      console.error('Failed to log error:', await response.text());
    }
  } catch (error) {
    console.error('Error logging failed:', error);
    // Don't throw - error logging should never break the app
  }
}
```

---

## Support

For API support or questions:
- **Email**: dev@thandi.co.za
- **Documentation**: https://thandi.co.za/docs
- **Status Page**: https://status.thandi.co.za

---

**Document Version**: 1.0  
**Last Updated**: January 20, 2026  
**Maintained by**: Thandi Development Team
