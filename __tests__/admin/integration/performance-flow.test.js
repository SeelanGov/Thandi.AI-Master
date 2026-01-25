/**
 * Integration Tests: Performance Monitoring Flow
 * Tests the complete performance monitoring workflow from logging to analysis
 */

const {
  calculateStatistics,
  identifySlowEndpoints,
  calculateTrends,
  detectPerformanceDegradation
} = require('../../../lib/admin/performance-analyzer');

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  gte: jest.fn(() => mockSupabase),
  lte: jest.fn(() => mockSupabase),
  order: jest.fn(() => mockSupabase),
  limit: jest.fn(() => mockSupabase),
  single: jest.fn()
};

describe('Performance Monitoring Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Performance Monitoring Workflow', () => {
    test('should log metrics, analyze performance, and detect slow endpoints', async () => {
      // Step 1: Log performance metrics
      const metrics = [
        {
          endpoint: '/api/school/dashboard',
          method: 'GET',
          response_time: 150,
          status_code: 200,
          timestamp: new Date().toISOString()
        },
        {
          endpoint: '/api/school/dashboard',
          method: 'GET',
          response_time: 200,
          status_code: 200,
          timestamp: new Date().toISOString()
        },
        {
          endpoint: '/api/school/students',
          method: 'GET',
          response_time: 800,
          status_code: 200,
          timestamp: new Date().toISOString()
        },
        {
          endpoint: '/api/school/reports',
          method: 'GET',
          response_time: 1200,
          status_code: 200,
          timestamp: new Date().toISOString()
        }
      ];

      // Mock successful metric logging
      mockSupabase.single.mockResolvedValue({
        data: metrics[0],
        error: null
      });

      // Step 2: Calculate statistics
      const stats = calculateStatistics(metrics);
      expect(stats.average).toBeGreaterThan(0);
      expect(stats.median).toBeGreaterThan(0);
      expect(stats.p95).toBeGreaterThan(0);
      expect(stats.count).toBe(4);

      // Step 3: Identify slow endpoints (>500ms)
      const slowEndpoints = identifySlowEndpoints(metrics, 500);
      expect(slowEndpoints.length).toBeGreaterThan(0);
      expect(slowEndpoints[0].average).toBeGreaterThan(500);
      expect(slowEndpoints[0].endpoint).toBeDefined();
      expect(slowEndpoints[0].method).toBeDefined();

      // Step 4: Verify slow endpoints are sorted by average response time
      for (let i = 0; i < slowEndpoints.length - 1; i++) {
        expect(slowEndpoints[i].average).toBeGreaterThanOrEqual(slowEndpoints[i + 1].average);
      }
    });

    test('should calculate trends and detect performance degradation', () => {
      // Create metrics over time showing degradation
      const metricsOverTime = [
        // Day 1 - Good performance
        { response_time: 150, timestamp: '2026-01-20T10:00:00Z' },
        { response_time: 160, timestamp: '2026-01-20T11:00:00Z' },
        { response_time: 155, timestamp: '2026-01-20T12:00:00Z' },
        // Day 2 - Slight degradation
        { response_time: 200, timestamp: '2026-01-21T10:00:00Z' },
        { response_time: 210, timestamp: '2026-01-21T11:00:00Z' },
        { response_time: 205, timestamp: '2026-01-21T12:00:00Z' },
        // Day 3 - Significant degradation
        { response_time: 350, timestamp: '2026-01-22T10:00:00Z' },
        { response_time: 380, timestamp: '2026-01-22T11:00:00Z' },
        { response_time: 370, timestamp: '2026-01-22T12:00:00Z' }
      ];

      // Calculate hourly trends
      const trends = calculateTrends(metricsOverTime, 'hourly');
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('timestamp');
      expect(trends[0]).toHaveProperty('average');
      expect(trends[0]).toHaveProperty('median');

      // Detect performance degradation
      const degradation = detectPerformanceDegradation(trends, 50);
      expect(degradation).toHaveProperty('isDegraded');
      expect(degradation).toHaveProperty('degradationPercentage');
      expect(degradation).toHaveProperty('message');

      // Should detect degradation
      expect(degradation.isDegraded).toBe(true);
      expect(degradation.degradationPercentage).toBeGreaterThan(50);
    });
  });

  describe('Performance Trend Analysis', () => {
    test('should calculate daily trends correctly', () => {
      const metrics = [
        { response_time: 100, timestamp: '2026-01-20T10:00:00Z' },
        { response_time: 150, timestamp: '2026-01-20T14:00:00Z' },
        { response_time: 200, timestamp: '2026-01-21T10:00:00Z' },
        { response_time: 250, timestamp: '2026-01-21T14:00:00Z' }
      ];

      const trends = calculateTrends(metrics, 'daily');
      expect(trends.length).toBe(2); // 2 days
      expect(trends[0].timestamp).toBe('2026-01-20');
      expect(trends[1].timestamp).toBe('2026-01-21');
    });

    test('should calculate weekly trends correctly', () => {
      const metrics = [
        { response_time: 100, timestamp: '2026-01-20T10:00:00Z' }, // Monday
        { response_time: 150, timestamp: '2026-01-21T10:00:00Z' }, // Tuesday
        { response_time: 200, timestamp: '2026-01-27T10:00:00Z' }, // Next Monday
        { response_time: 250, timestamp: '2026-01-28T10:00:00Z' }  // Next Tuesday
      ];

      const trends = calculateTrends(metrics, 'weekly');
      expect(trends.length).toBe(2); // 2 weeks
    });
  });

  describe('Slow Endpoint Detection', () => {
    test('should group metrics by endpoint and method', () => {
      const metrics = [
        { endpoint: '/api/test', method: 'GET', response_time: 600 },
        { endpoint: '/api/test', method: 'GET', response_time: 700 },
        { endpoint: '/api/test', method: 'POST', response_time: 800 },
        { endpoint: '/api/other', method: 'GET', response_time: 200 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);
      
      // Should identify 2 slow endpoint/method combinations
      expect(slowEndpoints.length).toBe(2);
      
      // Should have separate entries for GET and POST
      const getEndpoint = slowEndpoints.find(e => e.method === 'GET');
      const postEndpoint = slowEndpoints.find(e => e.method === 'POST');
      
      expect(getEndpoint).toBeDefined();
      expect(postEndpoint).toBeDefined();
    });

    test('should calculate correct statistics for each endpoint', () => {
      const metrics = [
        { endpoint: '/api/slow', method: 'GET', response_time: 600 },
        { endpoint: '/api/slow', method: 'GET', response_time: 800 },
        { endpoint: '/api/slow', method: 'GET', response_time: 1000 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);
      expect(slowEndpoints.length).toBe(1);
      
      const endpoint = slowEndpoints[0];
      expect(endpoint.count).toBe(3);
      expect(endpoint.average).toBe(800);
      expect(endpoint.min).toBe(600);
      expect(endpoint.max).toBe(1000);
    });
  });

  describe('Performance Degradation Detection', () => {
    test('should not detect degradation with stable performance', () => {
      const trends = [
        { timestamp: '2026-01-20', average: 200 },
        { timestamp: '2026-01-21', average: 210 },
        { timestamp: '2026-01-22', average: 205 },
        { timestamp: '2026-01-23', average: 215 },
        { timestamp: '2026-01-24', average: 200 }
      ];

      const degradation = detectPerformanceDegradation(trends, 50);
      expect(degradation.isDegraded).toBe(false);
    });

    test('should detect degradation with significant slowdown', () => {
      const trends = [
        { timestamp: '2026-01-20', average: 200 },
        { timestamp: '2026-01-21', average: 210 },
        { timestamp: '2026-01-22', average: 400 },
        { timestamp: '2026-01-23', average: 450 },
        { timestamp: '2026-01-24', average: 500 }
      ];

      const degradation = detectPerformanceDegradation(trends, 50);
      expect(degradation.isDegraded).toBe(true);
      expect(degradation.degradationPercentage).toBeGreaterThan(50);
    });

    test('should handle insufficient data gracefully', () => {
      const trends = [
        { timestamp: '2026-01-20', average: 200 }
      ];

      const degradation = detectPerformanceDegradation(trends, 50);
      expect(degradation.isDegraded).toBe(false);
      expect(degradation.message).toContain('Insufficient data');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty metrics array', () => {
      const stats = calculateStatistics([]);
      expect(stats.average).toBe(0);
      expect(stats.count).toBe(0);

      const slowEndpoints = identifySlowEndpoints([], 500);
      expect(slowEndpoints).toEqual([]);

      const trends = calculateTrends([], 'daily');
      expect(trends).toEqual([]);
    });

    test('should handle null or undefined metrics', () => {
      const stats = calculateStatistics(null);
      expect(stats.average).toBe(0);

      const slowEndpoints = identifySlowEndpoints(undefined, 500);
      expect(slowEndpoints).toEqual([]);

      const trends = calculateTrends(null, 'daily');
      expect(trends).toEqual([]);
    });

    test('should handle metrics with missing fields', () => {
      const metrics = [
        { response_time: 100 }, // Missing endpoint and method
        { endpoint: '/api/test', response_time: 200 }, // Missing method
        { method: 'GET', response_time: 300 } // Missing endpoint
      ];

      const stats = calculateStatistics(metrics);
      expect(stats.count).toBe(3);
      expect(stats.average).toBeGreaterThan(0);
    });
  });
});
