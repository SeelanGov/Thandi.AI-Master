# Admin Dashboard API Documentation

**Version**: 1.0  
**Last Updated**: January 24, 2026  
**Base URL**: https://thandi.online/api/admin

---

## Authentication

The Admin Dashboard API supports two authentication methods:

### 1. JWT Token Authentication (Admin Users)
- Used for web dashboard access
- Token stored in httpOnly cookie
- 24-hour expiration
- Automatic refresh on activity

### 2. API Key Authentication (Programmatic Access)
- Used for Kiro AI and automated systems
- Header: `X-API-Key: kiro_[your-key]` or `x-api-key: kiro_[your-key]`
- Rate limit: 100 requests per minute
- Case-insensitive header support

---

## Rate Limiting

All API endpoints are rate-limited to **100 requests per minute** per API key.

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706140800
```

---

## Error Tracking Endpoints

### POST /api/admin/errors/log
Log a new error to the system.

**Authentication**: API Key required

**Request Body**:
```json
{
  "type": "api_error",
  "message": "Database connection failed",
  "stack": "Error: Connection timeout\n  at Database.connect...",
  "context": {
    "endpoint": "/api/student/register",
    "method": "POST",
    "userId": "user_123",
    "schoolId": "school_456"
  },
  "severity": "high"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "errorId": "err_abc123",
  "deduplicated": false
}
```

---

### GET /api/admin/errors
Query errors with filtering and pagination.

**Authentication**: API Key required

**Query Parameters**:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50) - Items per page
- `type` (string) - Filter by error type
- `severity` (string) - Filter by severity (low, medium, high, critical)
- `schoolId` (string) - Filter by school
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range
- `resolved` (boolean) - Filter by resolution status

**Example Request**:
```
GET /api/admin/errors?type=api_error&severity=high&page=1&limit=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "errors": [
    {
      "id": "err_abc123",
      "type": "api_error",
      "message": "Database connection failed",
      "severity": "high",
      "count": 5,
      "firstOccurrence": "2026-01-24T10:00:00Z",
      "lastOccurrence": "2026-01-24T10:30:00Z",
      "resolved": false,
      "schoolId": "school_456"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### GET /api/admin/errors/[id]
Get detailed information about a specific error.

**Authentication**: API Key required

**Response** (200 OK):
```json
{
  "success": true,
  "error": {
    "id": "err_abc123",
    "type": "api_error",
    "message": "Database connection failed",
    "stack": "Error: Connection timeout...",
    "severity": "high",
    "count": 5,
    "firstOccurrence": "2026-01-24T10:00:00Z",
    "lastOccurrence": "2026-01-24T10:30:00Z",
    "resolved": false,
    "context": {
      "endpoint": "/api/student/register",
      "method": "POST"
    },
    "occurrences": [
      {
        "timestamp": "2026-01-24T10:00:00Z",
        "userId": "user_123"
      }
    ]
  }
}
```

---

### PUT /api/admin/errors/[id]
Mark an error as resolved.

**Authentication**: API Key required

**Request Body**:
```json
{
  "resolved": true,
  "resolution": "Fixed database connection pool settings"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Error marked as resolved"
}
```

---

## Performance Monitoring Endpoints

### GET /api/admin/performance
Get performance metrics with statistics.

**Authentication**: API Key required

**Query Parameters**:
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range
- `endpoint` (string) - Filter by specific endpoint
- `method` (string) - Filter by HTTP method

**Example Request**:
```
GET /api/admin/performance?startDate=2026-01-24T00:00:00Z&endDate=2026-01-24T23:59:59Z
```

**Response** (200 OK):
```json
{
  "success": true,
  "summary": {
    "totalRequests": 1250,
    "avgResponseTime": 245,
    "medianResponseTime": 180,
    "p95ResponseTime": 450,
    "p99ResponseTime": 850
  },
  "byEndpoint": [
    {
      "endpoint": "/api/student/register",
      "count": 150,
      "avgResponseTime": 320,
      "slowest": 1200
    }
  ],
  "slowEndpoints": [
    {
      "endpoint": "/api/rag/query",
      "avgResponseTime": 850,
      "count": 45
    }
  ]
}
```

---

### POST /api/admin/performance
Manually log a performance metric.

**Authentication**: API Key required

**Request Body**:
```json
{
  "endpoint": "/api/student/register",
  "method": "POST",
  "responseTime": 320,
  "statusCode": 200,
  "userId": "user_123",
  "schoolId": "school_456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Performance metric logged"
}
```

---

### GET /api/admin/performance/trends
Get performance trends over time.

**Authentication**: API Key required

**Query Parameters**:
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range
- `interval` (string) - Grouping interval (hourly, daily, weekly)

**Response** (200 OK):
```json
{
  "success": true,
  "trends": [
    {
      "timestamp": "2026-01-24T10:00:00Z",
      "avgResponseTime": 245,
      "requestCount": 125,
      "errorRate": 0.02
    }
  ],
  "degradation": [
    {
      "endpoint": "/api/rag/query",
      "previousAvg": 450,
      "currentAvg": 850,
      "percentageIncrease": 88.9
    }
  ]
}
```

---

## Activity Tracking Endpoints

### GET /api/admin/activity
Get user activity metrics.

**Authentication**: API Key required

**Query Parameters**:
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range
- `eventType` (string) - Filter by event type
- `schoolId` (string) - Filter by school

**Response** (200 OK):
```json
{
  "success": true,
  "summary": {
    "totalEvents": 1500,
    "uniqueUsers": 450,
    "registrations": 120,
    "assessments": 95,
    "schoolLogins": 25
  },
  "byEventType": [
    {
      "eventType": "student_registration",
      "count": 120,
      "uniqueUsers": 120
    }
  ]
}
```

---

### POST /api/admin/activity
Manually log an activity event.

**Authentication**: API Key required

**Request Body**:
```json
{
  "eventType": "student_registration",
  "userId": "user_123",
  "schoolId": "school_456",
  "metadata": {
    "grade": "10",
    "subjects": ["Mathematics", "Physics"]
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Activity logged"
}
```

---

### GET /api/admin/activity/funnel
Get funnel analysis metrics.

**Authentication**: API Key required

**Query Parameters**:
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range

**Response** (200 OK):
```json
{
  "success": true,
  "funnel": {
    "landingPage": 1000,
    "registration": 450,
    "assessment": 380,
    "results": 360
  },
  "conversionRates": {
    "landingToRegistration": 45.0,
    "registrationToAssessment": 84.4,
    "assessmentToResults": 94.7
  },
  "dropOffPoints": [
    {
      "stage": "landing_to_registration",
      "dropOff": 550,
      "percentage": 55.0
    }
  ]
}
```

---

## Health Monitoring Endpoints

### GET /api/admin/health
Get current system health status.

**Authentication**: API Key required

**Response** (200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2026-01-24T10:00:00Z"
    },
    "api": {
      "status": "healthy",
      "responseTime": 120,
      "lastCheck": "2026-01-24T10:00:00Z"
    },
    "rag": {
      "status": "healthy",
      "responseTime": 350,
      "lastCheck": "2026-01-24T10:00:00Z"
    }
  },
  "recentChecks": [
    {
      "timestamp": "2026-01-24T09:55:00Z",
      "status": "healthy",
      "duration": 515
    }
  ]
}
```

---

### POST /api/admin/health/check
Trigger an on-demand health check.

**Authentication**: API Key required

**Response** (200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    },
    "api": {
      "status": "healthy",
      "responseTime": 120
    },
    "rag": {
      "status": "healthy",
      "responseTime": 350
    }
  },
  "totalDuration": 515
}
```

---

## Alert System Endpoints

### GET /api/admin/alerts
Get alert history.

**Authentication**: API Key required

**Query Parameters**:
- `severity` (string) - Filter by severity (low, medium, high, critical)
- `resolved` (boolean) - Filter by resolution status
- `startDate` (ISO string) - Start date for range
- `endDate` (ISO string) - End date for range

**Response** (200 OK):
```json
{
  "success": true,
  "alerts": [
    {
      "id": "alert_123",
      "type": "error_rate_threshold",
      "severity": "high",
      "message": "Error rate exceeded 5% threshold",
      "triggered": "2026-01-24T10:00:00Z",
      "resolved": false,
      "metadata": {
        "errorRate": 7.5,
        "threshold": 5.0
      }
    }
  ]
}
```

---

### GET /api/admin/alerts/config
Get alert configurations.

**Authentication**: API Key required

**Response** (200 OK):
```json
{
  "success": true,
  "configs": [
    {
      "id": "config_123",
      "name": "High Error Rate Alert",
      "type": "error_rate",
      "threshold": 5.0,
      "severity": "high",
      "enabled": true,
      "recipients": ["admin@thandi.online"]
    }
  ]
}
```

---

### POST /api/admin/alerts/config
Create a new alert configuration.

**Authentication**: API Key required

**Request Body**:
```json
{
  "name": "High Error Rate Alert",
  "type": "error_rate",
  "threshold": 5.0,
  "severity": "high",
  "enabled": true,
  "recipients": ["admin@thandi.online"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "configId": "config_123",
  "message": "Alert configuration created"
}
```

---

### PUT /api/admin/alerts/config/[id]
Update an alert configuration.

**Authentication**: API Key required

**Request Body**:
```json
{
  "threshold": 7.5,
  "enabled": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Alert configuration updated"
}
```

---

### PUT /api/admin/alerts/[id]/resolve
Mark an alert as resolved.

**Authentication**: API Key required

**Request Body**:
```json
{
  "resolution": "Fixed database connection pool settings"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Alert marked as resolved"
}
```

---

## Dashboard Endpoints

### GET /api/admin/dashboard/overview
Get comprehensive dashboard overview with all key metrics.

**Authentication**: API Key required

**Query Parameters**:
- `timeRange` (string, default: "24h") - Time range (1h, 24h, 7d, 30d)

**Response** (200 OK):
```json
{
  "success": true,
  "timestamp": "2026-01-24T10:00:00Z",
  "timeRange": "24h",
  "metrics": {
    "errors": {
      "total": 45,
      "critical": 2,
      "high": 8,
      "trend": -15.5
    },
    "performance": {
      "avgResponseTime": 245,
      "slowEndpoints": 3,
      "trend": 8.2
    },
    "activity": {
      "activeUsers": 450,
      "registrations": 120,
      "assessments": 95,
      "trend": 12.3
    },
    "health": {
      "status": "healthy",
      "components": {
        "database": "healthy",
        "api": "healthy",
        "rag": "healthy"
      }
    },
    "alerts": {
      "active": 2,
      "resolved": 15,
      "critical": 0
    }
  },
  "recentErrors": [
    {
      "id": "err_abc123",
      "type": "api_error",
      "message": "Database connection failed",
      "severity": "high",
      "timestamp": "2026-01-24T09:45:00Z"
    }
  ]
}
```

---

## Authentication Endpoints

### POST /api/admin/auth/login
Authenticate an admin user.

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "admin@thandi.online",
  "password": "Thandi@Admin2026!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "admin_123",
    "email": "admin@thandi.online",
    "name": "Admin User"
  }
}
```

**Note**: JWT token is set in httpOnly cookie

---

### POST /api/admin/auth/logout
Log out the current admin user.

**Authentication**: JWT Token required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/admin/auth/verify
Verify the current JWT token.

**Authentication**: JWT Token required

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "admin_123",
    "email": "admin@thandi.online",
    "name": "Admin User"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Common Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-24T10:00:00Z"
}
```

---

## Best Practices

1. **Rate Limiting**: Implement exponential backoff when rate limit is reached
2. **Caching**: Cache dashboard overview for 5 minutes to reduce API calls
3. **Date Ranges**: Use specific date ranges to limit data returned
4. **Pagination**: Always use pagination for large datasets
5. **Error Handling**: Implement retry logic with exponential backoff
6. **Monitoring**: Log all API interactions for debugging

---

## Support

For API support or questions:
- Email: admin@thandi.online
- Documentation: https://thandi.online/docs

---

**Last Updated**: January 24, 2026  
**Version**: 1.0
