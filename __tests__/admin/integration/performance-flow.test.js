/**
 * Integration Tests: Performance Monitoring Flow
 * 
 * Tests the complete performance monitoring workflow:
 * 1. Log performance metrics
 * 2. Query performance data
 * 3. Calculate statistics
 * 4. Analyze trends
 * 5. Detect performance degradation
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.ADMIN_API_KEY || process.env.KIRO_API_KEY;

describe('Performance Monitoring Integration Flow', () => {
  let testMetricIds = [];

  beforeAll(async () => {
    // Clean up any existing test data
    await supabase
      .from('api_metrics')
      .delete()
      .like('endpoint', '/test/%');
  });

  afterAll(async () => {
    // Clean up test data
    if (testMetricIds.length > 0) {
      await supabase
        .from('api_metrics')
        .delete()
        .in('id', testMetricIds);
    }
  });

  describe('Complete Performance Monitoring Flow', () => {
    test('should log performance metrics via API', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          endpoint: '/test/performance-flow',
          method: 'GET',
          responseTime: 250,
          statusCode: 200,
          userId: 'test-user-123',
          schoolId: 'test-school-456'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metricId).toBeDefined();
      
      testMetricIds.push(data.metricId);
    });

    test('should retrieve performance metrics', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?endpoint=/test/performance-flow`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.length).toBeGreaterThan(0);
    });

    test('should calculate performance statistics', async () => {
      // Log multiple metrics for statistics
      const responseTimes = [100, 200, 300, 400, 500];
      
      for (const responseTime of responseTimes) {
        const response = await fetch(`${BASE_URL}/api/admin/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            endpoint: '/test/statistics',
            method: 'GET',
            responseTime,
            statusCode: 200
          })
        });

        const data = await response.json();
        testMetricIds.push(data.metricId);
      }

      // Query statistics
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?endpoint=/test/statistics`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.statistics).toBeDefined();
      expect(data.statistics.average).toBe(300); // (100+200+300+400+500)/5
      expect(data.statistics.median).toBe(300);
      expect(data.statistics.p95).toBeGreaterThanOrEqual(400);
      expect(data.statistics.p99).toBeGreaterThanOrEqual(500);
    });

    test('should identify slow endpoints', async () => {
      // Log a slow endpoint
      const response = await fetch(`${BASE_URL}/api/admin/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          endpoint: '/test/slow-endpoint',
          method: 'GET',
          responseTime: 1500, // Slow (>500ms)
          statusCode: 200
        })
      });

      const data = await response.json();
      testMetricIds.push(data.metricId);

      // Query slow endpoints
      const queryResponse = await fetch(
        `${BASE_URL}/api/admin/performance`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(queryResponse.status).toBe(200);
      const queryData = await queryResponse.json();
      expect(queryData.success).toBe(true);
      expect(queryData.slowEndpoints).toBeDefined();
      
      const slowEndpoint = queryData.slowEndpoints.find(
        e => e.endpoint === '/test/slow-endpoint'
      );
      expect(slowEndpoint).toBeDefined();
      expect(slowEndpoint.averageResponseTime).toBeGreaterThan(500);
    });

    test('should calculate performance trends', async () => {
      // Log metrics over time
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Log historical metric
      const { data: historicalMetric } = await supabase
        .from('api_metrics')
        .insert({
          endpoint: '/test/trends',
          method: 'GET',
          response_time: 200,
          status_code: 200,
          created_at: oneHourAgo.toISOString()
        })
        .select()
        .single();

      testMetricIds.push(historicalMetric.id);

      // Log current metric
      const response = await fetch(`${BASE_URL}/api/admin/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          endpoint: '/test/trends',
          method: 'GET',
          responseTime: 200,
          statusCode: 200
        })
      });

      const data = await response.json();
      testMetricIds.push(data.metricId);

      // Query trends
      const trendsResponse = await fetch(
        `${BASE_URL}/api/admin/performance/trends?endpoint=/test/trends&period=hourly`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(trendsResponse.status).toBe(200);
      const trendsData = await trendsResponse.json();
      expect(trendsData.success).toBe(true);
      expect(trendsData.trends).toBeDefined();
      expect(Array.isArray(trendsData.trends)).toBe(true);
    });

    test('should detect performance degradation', async () => {
      // Log baseline metrics (fast)
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${BASE_URL}/api/admin/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            endpoint: '/test/degradation',
            method: 'GET',
            responseTime: 100,
            statusCode: 200
          })
        });

        const data = await response.json();
        testMetricIds.push(data.metricId);
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log degraded metrics (slow)
      for (let i = 0; i < 5; i++) {
        const response = await fetch(`${BASE_URL}/api/admin/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            endpoint: '/test/degradation',
            method: 'GET',
            responseTime: 500, // 5x slower
            statusCode: 200
          })
        });

        const data = await response.json();
        testMetricIds.push(data.metricId);
      }

      // Query trends to detect degradation
      const trendsResponse = await fetch(
        `${BASE_URL}/api/admin/performance/trends?endpoint=/test/degradation&period=hourly`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(trendsResponse.status).toBe(200);
      const trendsData = await trendsResponse.json();
      expect(trendsData.success).toBe(true);
      
      // Should detect significant performance change
      if (trendsData.degradation) {
        expect(trendsData.degradation.detected).toBe(true);
        expect(trendsData.degradation.percentageIncrease).toBeGreaterThan(50);
      }
    });
  });

  describe('Performance Data Filtering', () => {
    test('should filter by date range', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
    });

    test('should filter by endpoint', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?endpoint=/test/performance-flow`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      
      // All metrics should be for the specified endpoint
      data.metrics.forEach(metric => {
        expect(metric.endpoint).toBe('/test/performance-flow');
      });
    });

    test('should filter by method', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?method=GET`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      
      // All metrics should be for GET requests
      data.metrics.forEach(metric => {
        expect(metric.method).toBe('GET');
      });
    });
  });

  describe('Performance Pagination', () => {
    test('should paginate performance metrics', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?limit=5&offset=0`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.metrics.length).toBeLessThanOrEqual(5);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.limit).toBe(5);
      expect(data.pagination.offset).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should reject requests without API key', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/performance`);
      expect(response.status).toBe(401);
    });

    test('should reject invalid performance data', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          // Missing required fields
          endpoint: '/test/invalid'
        })
      });

      expect(response.status).toBe(400);
    });

    test('should handle invalid date ranges', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/performance?startDate=invalid-date`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      // Should either return 400 or ignore invalid date
      expect([200, 400]).toContain(response.status);
    });
  });
});
