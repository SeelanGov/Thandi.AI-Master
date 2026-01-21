/**
 * Unit Tests: Alert Engine
 * Tests alert evaluation and triggering functionality
 * Created: January 20, 2026
 */

import {
  evaluateErrorRateAlert,
  evaluatePerformanceAlert,
  evaluateHealthAlert,
  shouldTriggerAlert
} from '@/lib/admin/alert-engine';

describe('Alert Engine', () => {
  describe('evaluateErrorRateAlert', () => {
    it('should trigger alert when error rate exceeds threshold', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        timeWindow: 60
      };

      const errors = Array.from({ length: 15 }, () => ({
        createdAt: new Date().toISOString()
      }));

      const result = evaluateErrorRateAlert(config, errors);

      expect(result.shouldTrigger).toBe(true);
      expect(result.currentValue).toBe(15);
      expect(result.threshold).toBe(10);
    });

    it('should not trigger alert when error rate is below threshold', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        timeWindow: 60
      };

      const errors = Array.from({ length: 5 }, () => ({
        createdAt: new Date().toISOString()
      }));

      const result = evaluateErrorRateAlert(config, errors);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should filter errors by time window', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        timeWindow: 60 // 60 minutes
      };

      const now = new Date();
      const errors = [
        ...Array.from({ length: 5 }, () => ({
          createdAt: now.toISOString()
        })),
        ...Array.from({ length: 10 }, () => ({
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        }))
      ];

      const result = evaluateErrorRateAlert(config, errors);

      expect(result.currentValue).toBe(5);
      expect(result.shouldTrigger).toBe(false);
    });
  });

  describe('evaluatePerformanceAlert', () => {
    it('should trigger alert when response time exceeds threshold', () => {
      const config = {
        type: 'performance',
        threshold: 500,
        metric: 'p95'
      };

      const metrics = Array.from({ length: 100 }, (_, i) => ({
        responseTime: i < 95 ? 400 : 600
      }));

      const result = evaluatePerformanceAlert(config, metrics);

      expect(result.shouldTrigger).toBe(true);
    });

    it('should not trigger alert when performance is good', () => {
      const config = {
        type: 'performance',
        threshold: 500,
        metric: 'average'
      };

      const metrics = Array.from({ length: 10 }, () => ({
        responseTime: 300
      }));

      const result = evaluatePerformanceAlert(config, metrics);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should support different metrics (average, median, p95, p99)', () => {
      const metrics = Array.from({ length: 100 }, (_, i) => ({
        responseTime: i + 1
      }));

      const avgConfig = { type: 'performance', threshold: 60, metric: 'average' };
      const medianConfig = { type: 'performance', threshold: 60, metric: 'median' };
      const p95Config = { type: 'performance', threshold: 90, metric: 'p95' };
      const p99Config = { type: 'performance', threshold: 95, metric: 'p99' };

      expect(evaluatePerformanceAlert(avgConfig, metrics).shouldTrigger).toBe(false);
      expect(evaluatePerformanceAlert(medianConfig, metrics).shouldTrigger).toBe(false);
      expect(evaluatePerformanceAlert(p95Config, metrics).shouldTrigger).toBe(true);
      expect(evaluatePerformanceAlert(p99Config, metrics).shouldTrigger).toBe(true);
    });
  });

  describe('evaluateHealthAlert', () => {
    it('should trigger alert when health check fails', () => {
      const config = {
        type: 'health',
        component: 'database'
      };

      const healthChecks = [
        { component: 'database', status: 'unhealthy' }
      ];

      const result = evaluateHealthAlert(config, healthChecks);

      expect(result.shouldTrigger).toBe(true);
    });

    it('should not trigger alert when health check passes', () => {
      const config = {
        type: 'health',
        component: 'database'
      };

      const healthChecks = [
        { component: 'database', status: 'healthy' }
      ];

      const result = evaluateHealthAlert(config, healthChecks);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should check specific component', () => {
      const config = {
        type: 'health',
        component: 'api'
      };

      const healthChecks = [
        { component: 'database', status: 'unhealthy' },
        { component: 'api', status: 'healthy' }
      ];

      const result = evaluateHealthAlert(config, healthChecks);

      expect(result.shouldTrigger).toBe(false);
    });

    it('should trigger on any component failure if not specified', () => {
      const config = {
        type: 'health'
      };

      const healthChecks = [
        { component: 'database', status: 'healthy' },
        { component: 'api', status: 'unhealthy' }
      ];

      const result = evaluateHealthAlert(config, healthChecks);

      expect(result.shouldTrigger).toBe(true);
    });
  });

  describe('shouldTriggerAlert', () => {
    it('should respect cooldown period', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        cooldownMinutes: 60
      };

      const lastTriggered = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      const result = shouldTriggerAlert(config, lastTriggered);

      expect(result).toBe(false);
    });

    it('should allow trigger after cooldown period', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        cooldownMinutes: 60
      };

      const lastTriggered = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago

      const result = shouldTriggerAlert(config, lastTriggered);

      expect(result).toBe(true);
    });

    it('should allow trigger if never triggered before', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        cooldownMinutes: 60
      };

      const result = shouldTriggerAlert(config, null);

      expect(result).toBe(true);
    });
  });

  describe('Alert Severity', () => {
    it('should assign correct severity based on threshold breach', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        criticalThreshold: 50
      };

      const warningErrors = Array.from({ length: 15 }, () => ({
        createdAt: new Date().toISOString()
      }));

      const criticalErrors = Array.from({ length: 60 }, () => ({
        createdAt: new Date().toISOString()
      }));

      const warningResult = evaluateErrorRateAlert(config, warningErrors);
      const criticalResult = evaluateErrorRateAlert(config, criticalErrors);

      expect(warningResult.severity).toBe('warning');
      expect(criticalResult.severity).toBe('critical');
    });
  });

  describe('Alert Message Generation', () => {
    it('should generate descriptive alert message', () => {
      const config = {
        type: 'error_rate',
        threshold: 10,
        name: 'High Error Rate'
      };

      const errors = Array.from({ length: 15 }, () => ({
        createdAt: new Date().toISOString()
      }));

      const result = evaluateErrorRateAlert(config, errors);

      expect(result.message).toContain('15');
      expect(result.message).toContain('10');
    });
  });
});
