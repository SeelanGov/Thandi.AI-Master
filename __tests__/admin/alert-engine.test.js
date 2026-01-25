/**
 * Unit Tests for Alert Engine
 * Tests the alert detection and notification functionality
 */

const {
  detectErrorRateThreshold,
  detectPerformanceDegradation,
  detectHealthCheckFailures,
  createAlert,
  sendEmailNotification,
  resolveAlert
} = require('../../lib/admin/alert-engine');

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  gte: jest.fn(() => mockSupabase),
  data: null,
  error: null
};

// Mock email service
jest.mock('../../lib/admin/email-service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

describe('Alert Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.data = null;
    mockSupabase.error = null;
  });

  describe('detectErrorRateThreshold', () => {
    test('should detect error rate threshold', async () => {
      const errors = Array.from({ length: 15 }, (_, i) => ({
        id: `error-${i}`,
        created_at: new Date().toISOString()
      }));

      mockSupabase.data = errors;
      mockSupabase.error = null;

      const result = await detectErrorRateThreshold(mockSupabase, {
        threshold: 10,
        timeWindow: 60 // 1 hour
      });

      expect(result.thresholdExceeded).toBe(true);
      expect(result.errorCount).toBe(15);
      expect(result.threshold).toBe(10);
    });

    test('should detect performance degradation', async () => {
      const metrics = Array.from({ length: 10 }, () => ({
        response_time: 800,
        created_at: new Date().toISOString()
      }));

      mockSupabase.data = metrics;
      mockSupabase.error = null;

      const result = await detectPerformanceDegradation(mockSupabase, {
        threshold: 500,
        timeWindow: 60
      });

      expect(result.degraded).toBe(true);
      expect(result.averageResponseTime).toBeGreaterThan(500);
    });

    test('should detect health check failures', async () => {
      const healthChecks = [
        { component: 'api', healthy: false },
        { component: 'database', healthy: false },
        { component: 'rag', healthy: true }
      ];

      mockSupabase.data = healthChecks;
      mockSupabase.error = null;

      const result = await detectHealthCheckFailures(mockSupabase);

      expect(result.hasFailures).toBe(true);
      expect(result.failedComponents).toHaveLength(2);
      expect(result.failedComponents).toContain('api');
      expect(result.failedComponents).toContain('database');
    });

    test('should create alert correctly', async () => {
      const alertData = {
        type: 'error_rate',
        severity: 'high',
        message: 'Error rate exceeded threshold',
        metadata: { errorCount: 15, threshold: 10 }
      };

      mockSupabase.data = { id: 'alert-1', ...alertData };
      mockSupabase.error = null;

      const result = await createAlert(mockSupabase, alertData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('alert-1');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    test('should send email notification', async () => {
      const emailService = require('../../lib/admin/email-service');
      
      const alertData = {
        type: 'performance',
        severity: 'critical',
        message: 'System performance degraded'
      };

      const result = await sendEmailNotification(alertData, {
        to: 'admin@thandi.ai',
        subject: 'Critical Alert'
      });

      expect(result.success).toBe(true);
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    test('should store alert history', async () => {
      const alertData = {
        type: 'health_check',
        severity: 'medium',
        message: 'Database health check failed',
        resolved: false
      };

      mockSupabase.data = { id: 'alert-2', ...alertData };
      mockSupabase.error = null;

      const result = await createAlert(mockSupabase, alertData);

      expect(result.success).toBe(true);
      expect(result.data.resolved).toBe(false);
    });

    test('should handle alert resolution', async () => {
      const alertId = 'alert-1';

      mockSupabase.data = { 
        id: alertId, 
        resolved: true,
        resolved_at: new Date().toISOString()
      };
      mockSupabase.error = null;

      const result = await resolveAlert(mockSupabase, alertId);

      expect(result.success).toBe(true);
      expect(result.data.resolved).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    test('should validate threshold values', async () => {
      const invalidThresholds = [-1, 0, null, undefined];

      for (const threshold of invalidThresholds) {
        const result = await detectErrorRateThreshold(mockSupabase, {
          threshold,
          timeWindow: 60
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid threshold');
      }
    });

    test('should validate time windows', async () => {
      const invalidWindows = [-1, 0, null, undefined];

      for (const timeWindow of invalidWindows) {
        const result = await detectErrorRateThreshold(mockSupabase, {
          threshold: 10,
          timeWindow
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid time window');
      }
    });

    test('should handle missing configuration', async () => {
      const result = await detectErrorRateThreshold(mockSupabase, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing configuration');
    });

    test('should handle email failures', async () => {
      const emailService = require('../../lib/admin/email-service');
      emailService.sendEmail.mockRejectedValueOnce(new Error('Email service unavailable'));

      const alertData = {
        type: 'error_rate',
        severity: 'high',
        message: 'Test alert'
      };

      const result = await sendEmailNotification(alertData, {
        to: 'admin@thandi.ai'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email');
    });

    test('should deduplicate alerts', async () => {
      const alertData = {
        type: 'error_rate',
        severity: 'high',
        message: 'Error rate exceeded'
      };

      // Mock existing unresolved alert
      mockSupabase.data = { 
        id: 'existing-alert',
        type: 'error_rate',
        resolved: false
      };
      mockSupabase.error = null;

      const result = await createAlert(mockSupabase, alertData, { deduplicate: true });

      expect(result.success).toBe(true);
      expect(result.deduplicated).toBe(true);
      expect(result.existingAlertId).toBe('existing-alert');
    });

    test('should calculate alert severity', async () => {
      const scenarios = [
        { errorCount: 50, threshold: 10, expectedSeverity: 'critical' },
        { errorCount: 20, threshold: 10, expectedSeverity: 'high' },
        { errorCount: 12, threshold: 10, expectedSeverity: 'medium' }
      ];

      for (const scenario of scenarios) {
        const severity = calculateAlertSeverity(
          scenario.errorCount,
          scenario.threshold
        );

        expect(severity).toBe(scenario.expectedSeverity);
      }
    });

    test('should return correct alert format', async () => {
      const alertData = {
        type: 'performance',
        severity: 'high',
        message: 'Performance degraded'
      };

      mockSupabase.data = { 
        id: 'alert-3',
        ...alertData,
        created_at: new Date().toISOString()
      };
      mockSupabase.error = null;

      const result = await createAlert(mockSupabase, alertData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('type');
      expect(result.data).toHaveProperty('severity');
      expect(result.data).toHaveProperty('message');
      expect(result.data).toHaveProperty('created_at');
    });
  });

  describe('Alert Severity Calculation', () => {
    test('should calculate critical severity', () => {
      const severity = calculateAlertSeverity(100, 10);
      expect(severity).toBe('critical');
    });

    test('should calculate high severity', () => {
      const severity = calculateAlertSeverity(25, 10);
      expect(severity).toBe('high');
    });

    test('should calculate medium severity', () => {
      const severity = calculateAlertSeverity(15, 10);
      expect(severity).toBe('medium');
    });

    test('should calculate low severity', () => {
      const severity = calculateAlertSeverity(11, 10);
      expect(severity).toBe('low');
    });
  });
});

// Helper function for severity calculation
function calculateAlertSeverity(value, threshold) {
  const ratio = value / threshold;
  
  if (ratio >= 5) return 'critical';
  if (ratio >= 2) return 'high';
  if (ratio >= 1.5) return 'medium';
  return 'low';
}
