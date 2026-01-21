/**
 * Unit Tests: Performance Analyzer
 * Tests performance analysis functionality
 * Created: January 20, 2026
 */

import { 
  calculateStatistics, 
  identifySlowEndpoints, 
  calculateTrends,
  detectPerformanceDegradation 
} from '@/lib/admin/performance-analyzer';

describe('Performance Analyzer', () => {
  describe('calculateStatistics', () => {
    it('should calculate average response time', () => {
      const metrics = [
        { responseTime: 100 },
        { responseTime: 200 },
        { responseTime: 300 }
      ];

      const stats = calculateStatistics(metrics);

      expect(stats.average).toBe(200);
    });

    it('should calculate median response time', () => {
      const metrics = [
        { responseTime: 100 },
        { responseTime: 200 },
        { responseTime: 300 },
        { responseTime: 400 },
        { responseTime: 500 }
      ];

      const stats = calculateStatistics(metrics);

      expect(stats.median).toBe(300);
    });

    it('should calculate p95 percentile', () => {
      const metrics = Array.from({ length: 100 }, (_, i) => ({
        responseTime: i + 1
      }));

      const stats = calculateStatistics(metrics);

      expect(stats.p95).toBeGreaterThan(90);
      expect(stats.p95).toBeLessThanOrEqual(100);
    });

    it('should calculate p99 percentile', () => {
      const metrics = Array.from({ length: 100 }, (_, i) => ({
        responseTime: i + 1
      }));

      const stats = calculateStatistics(metrics);

      expect(stats.p99).toBeGreaterThan(95);
      expect(stats.p99).toBeLessThanOrEqual(100);
    });

    it('should handle empty metrics array', () => {
      const stats = calculateStatistics([]);

      expect(stats.average).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.p95).toBe(0);
      expect(stats.p99).toBe(0);
    });

    it('should handle single metric', () => {
      const metrics = [{ responseTime: 150 }];

      const stats = calculateStatistics(metrics);

      expect(stats.average).toBe(150);
      expect(stats.median).toBe(150);
      expect(stats.p95).toBe(150);
      expect(stats.p99).toBe(150);
    });
  });

  describe('identifySlowEndpoints', () => {
    it('should identify endpoints slower than threshold', () => {
      const metrics = [
        { endpoint: '/api/fast', responseTime: 100 },
        { endpoint: '/api/slow', responseTime: 600 },
        { endpoint: '/api/veryslow', responseTime: 1000 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);

      expect(slowEndpoints).toHaveLength(2);
      expect(slowEndpoints[0].endpoint).toBe('/api/slow');
      expect(slowEndpoints[1].endpoint).toBe('/api/veryslow');
    });

    it('should use default threshold of 500ms', () => {
      const metrics = [
        { endpoint: '/api/fast', responseTime: 400 },
        { endpoint: '/api/slow', responseTime: 600 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics);

      expect(slowEndpoints).toHaveLength(1);
      expect(slowEndpoints[0].endpoint).toBe('/api/slow');
    });

    it('should return empty array if no slow endpoints', () => {
      const metrics = [
        { endpoint: '/api/fast1', responseTime: 100 },
        { endpoint: '/api/fast2', responseTime: 200 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);

      expect(slowEndpoints).toHaveLength(0);
    });

    it('should group by endpoint and calculate average', () => {
      const metrics = [
        { endpoint: '/api/test', responseTime: 400 },
        { endpoint: '/api/test', responseTime: 600 },
        { endpoint: '/api/test', responseTime: 800 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);

      expect(slowEndpoints).toHaveLength(1);
      expect(slowEndpoints[0].averageResponseTime).toBe(600);
    });
  });

  describe('calculateTrends', () => {
    it('should calculate hourly trends', () => {
      const now = new Date();
      const metrics = Array.from({ length: 10 }, (_, i) => ({
        createdAt: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
        responseTime: 100 + i * 10
      }));

      const trends = calculateTrends(metrics, 'hourly');

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
    });

    it('should calculate daily trends', () => {
      const now = new Date();
      const metrics = Array.from({ length: 7 }, (_, i) => ({
        createdAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        responseTime: 100 + i * 10
      }));

      const trends = calculateTrends(metrics, 'daily');

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
    });

    it('should calculate weekly trends', () => {
      const now = new Date();
      const metrics = Array.from({ length: 4 }, (_, i) => ({
        createdAt: new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        responseTime: 100 + i * 10
      }));

      const trends = calculateTrends(metrics, 'weekly');

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
    });

    it('should handle empty metrics', () => {
      const trends = calculateTrends([], 'hourly');

      expect(trends).toHaveLength(0);
    });
  });

  describe('detectPerformanceDegradation', () => {
    it('should detect significant performance degradation', () => {
      const currentMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 500
      }));

      const previousMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 200
      }));

      const degradation = detectPerformanceDegradation(
        currentMetrics,
        previousMetrics
      );

      expect(degradation.isDegraded).toBe(true);
      expect(degradation.percentageIncrease).toBeGreaterThan(50);
    });

    it('should not detect degradation for minor changes', () => {
      const currentMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 220
      }));

      const previousMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 200
      }));

      const degradation = detectPerformanceDegradation(
        currentMetrics,
        previousMetrics
      );

      expect(degradation.isDegraded).toBe(false);
    });

    it('should handle empty metrics', () => {
      const degradation = detectPerformanceDegradation([], []);

      expect(degradation.isDegraded).toBe(false);
    });

    it('should use custom threshold', () => {
      const currentMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 300
      }));

      const previousMetrics = Array.from({ length: 10 }, () => ({
        responseTime: 200
      }));

      const degradation = detectPerformanceDegradation(
        currentMetrics,
        previousMetrics,
        0.25 // 25% threshold
      );

      expect(degradation.isDegraded).toBe(true);
    });
  });
});
