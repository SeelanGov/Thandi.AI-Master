/**
 * Practical Monitoring Tests
 * Tests the ACTUAL functionality needed for school dashboard monitoring
 */

const {
  calculateStatistics,
  identifySlowEndpoints,
  calculateTrends,
  detectPerformanceDegradation
} = require('../../lib/admin/performance-analyzer');

const {
  calculateActivitySummary,
  calculateFunnelMetrics,
  identifyDropOffPoints,
  calculateActivityTrends,
  groupByEventType
} = require('../../lib/admin/activity-analyzer');

const {
  checkDatabase,
  checkAPIEndpoint,
  checkRAGSystem,
  runAllHealthChecks,
  calculateHealthStatistics
} = require('../../lib/admin/health-checker');

const {
  evaluateErrorRate,
  evaluatePerformanceThreshold,
  evaluateHealthCheckFailures,
  evaluateAllAlerts
} = require('../../lib/admin/alert-engine');

const {
  logError,
  deduplicateError,
  queryErrors,
  resolveError
} = require('../../lib/admin/error-logger');

const {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateAdmin,
  createAdminUser,
  validateAPIKey
} = require('../../lib/admin/auth');

describe('Practical Admin Dashboard Monitoring', () => {
  describe('Performance Monitoring - Real School Dashboard Scenarios', () => {
    test('should calculate statistics for school API performance', () => {
      const schoolAPIMetrics = [
        { response_time: 150 },
        { response_time: 200 },
        { response_time: 180 }
      ];

      const stats = calculateStatistics(schoolAPIMetrics);

      expect(stats.average).toBeGreaterThan(0);
      expect(stats.median).toBeGreaterThan(0);
      expect(stats.count).toBe(3);
    });

    test('should identify slow school dashboard endpoints', () => {
      const metrics = [
        { endpoint: '/api/school/students', method: 'GET', response_time: 200 },
        { endpoint: '/api/school/dashboard', method: 'GET', response_time: 800 },
        { endpoint: '/api/school/reports', method: 'GET', response_time: 1200 }
      ];

      const slowEndpoints = identifySlowEndpoints(metrics, 500);

      expect(slowEndpoints.length).toBeGreaterThan(0);
      expect(slowEndpoints[0].average).toBeGreaterThan(500);
    });

    test('should detect performance degradation in school system', () => {
      const trends = [
        { timestamp: '2026-01-01', average: 200 },
        { timestamp: '2026-01-02', average: 220 },
        { timestamp: '2026-01-03', average: 400 },
        { timestamp: '2026-01-04', average: 450 },
        { timestamp: '2026-01-05', average: 500 }
      ];

      const degradation = detectPerformanceDegradation(trends, 50);

      expect(degradation).toHaveProperty('isDegraded');
      expect(degradation).toHaveProperty('degradationPercentage');
    });
  });

  describe('Activity Tracking - School Dashboard Usage', () => {
    test('should calculate activity summary for school users', () => {
      const activities = [
        { event_type: 'school_login', user_id: 'user1', session_id: 'session1' },
        { event_type: 'registration', user_id: 'user2', session_id: 'session2' },
        { event_type: 'assessment_completed', user_id: 'user1', session_id: 'session1' }
      ];

      const summary = calculateActivitySummary(activities);

      expect(summary.totalEvents).toBe(3);
      expect(summary.uniqueUsers).toBe(2);
      expect(summary.uniqueSessions).toBe(2);
    });

    test('should calculate funnel metrics for student journey', () => {
      const activities = [
        { event_type: 'registration' },
        { event_type: 'registration' },
        { event_type: 'assessment_started' },
        { event_type: 'assessment_completed' }
      ];

      const funnel = calculateFunnelMetrics(activities);

      expect(funnel.registrations).toBe(2);
      expect(funnel.assessmentsStarted).toBe(1);
      expect(funnel.assessmentsCompleted).toBe(1);
      expect(funnel.conversionRate).toBeGreaterThanOrEqual(0);
    });

    test('should identify drop-off points in school onboarding', () => {
      const funnelMetrics = {
        registrations: 100,
        assessmentsStarted: 30,
        assessmentsCompleted: 20,
        conversionRate: 30,
        completionRate: 67
      };

      const dropOffs = identifyDropOffPoints(funnelMetrics);

      expect(Array.isArray(dropOffs)).toBe(true);
    });
  });

  describe('Health Monitoring - School System Components', () => {
    test('should check database health', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      };

      const result = await checkDatabase(mockSupabase);

      expect(result).toHaveProperty('component');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
    });

    test('should calculate health statistics', () => {
      const healthChecks = [
        { status: 'healthy', response_time: 100 },
        { status: 'healthy', response_time: 150 },
        { status: 'unhealthy', response_time: 5000 },
        { status: 'healthy', response_time: 120 }
      ];

      const stats = calculateHealthStatistics(healthChecks);

      expect(stats.totalChecks).toBe(4);
      expect(stats.healthyChecks).toBe(3);
      expect(stats.unhealthyChecks).toBe(1);
      expect(stats.uptimePercentage).toBe(75);
    });
  });

  describe('Alert System - Proactive Issue Detection', () => {
    test('should evaluate error rate threshold', () => {
      const errors = [
        { created_at: new Date().toISOString(), type: 'api_error' },
        { created_at: new Date().toISOString(), type: 'api_error' },
        { created_at: new Date().toISOString(), type: 'database_error' }
      ];

      const config = {
        enabled: true,
        threshold: 2,
        time_window_minutes: 60,
        severity: 'high'
      };

      const result = evaluateErrorRate(errors, config);

      expect(result).toHaveProperty('shouldAlert');
      expect(result).toHaveProperty('metric');
      expect(result.metric).toBe('error_rate');
    });

    test('should evaluate performance threshold', () => {
      const metrics = [
        { created_at: new Date().toISOString(), response_time: 1200 },
        { created_at: new Date().toISOString(), response_time: 1500 },
        { created_at: new Date().toISOString(), response_time: 1300 }
      ];

      const config = {
        enabled: true,
        threshold: 1000,
        time_window_minutes: 60,
        severity: 'medium'
      };

      const result = evaluatePerformanceThreshold(metrics, config);

      expect(result).toHaveProperty('shouldAlert');
      expect(result.shouldAlert).toBe(true);
    });
  });

  describe('Error Logging - School Dashboard Error Tracking', () => {
    test('should deduplicate similar errors', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ 
          data: [{ id: 'error-1', count: 1 }], 
          error: null 
        })
      };

      const errorData = {
        type: 'api_error',
        message: 'School dashboard API failed'
      };

      const result = await deduplicateError(mockSupabase, errorData);

      expect(result).toHaveProperty('isDuplicate');
    });

    test('should log new error', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'error-1', type: 'api_error' }, 
          error: null 
        })
      };

      const errorData = {
        type: 'api_error',
        message: 'School dashboard API failed',
        severity: 'high'
      };

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
    });
  });

  describe('Authentication - Admin Access Control', () => {
    test('should hash password securely', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('should verify password correctly', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      const isInvalid = await verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test('should generate and verify JWT token', () => {
      const payload = { userId: 'admin-1', role: 'admin' };
      const secret = 'test-secret-key-for-jwt';

      const token = generateToken(payload, secret, '1h');
      const decoded = verifyToken(token, secret);

      expect(token).toBeDefined();
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe('admin-1');
    });
  });
});

describe('Integration - Real Monitoring Workflow', () => {
  test('should handle complete error tracking workflow', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: 'error-1', type: 'api_error', message: 'Test error' }, 
        error: null 
      })
    };

    // 1. Log error
    const errorData = {
      type: 'api_error',
      message: 'School dashboard API failed',
      severity: 'high',
      feature_area: 'school_portal'
    };

    const logResult = await logError(mockSupabase, errorData);
    expect(logResult.success).toBe(true);

    // 2. Evaluate if alert should be triggered
    const errors = [errorData, errorData, errorData];
    const alertConfig = {
      enabled: true,
      threshold: 2,
      time_window_minutes: 60,
      severity: 'high'
    };

    const alertResult = evaluateErrorRate(errors, alertConfig);
    expect(alertResult.shouldAlert).toBe(true);
  });

  test('should handle complete performance monitoring workflow', () => {
    // 1. Collect metrics
    const metrics = [
      { response_time: 200, endpoint: '/api/school/dashboard', method: 'GET' },
      { response_time: 250, endpoint: '/api/school/dashboard', method: 'GET' },
      { response_time: 300, endpoint: '/api/school/dashboard', method: 'GET' }
    ];

    // 2. Calculate statistics
    const stats = calculateStatistics(metrics);
    expect(stats.average).toBeGreaterThan(0);

    // 3. Identify slow endpoints
    const slowEndpoints = identifySlowEndpoints(metrics, 200);
    expect(Array.isArray(slowEndpoints)).toBe(true);

    // 4. Check if alert needed
    const alertConfig = {
      enabled: true,
      threshold: 200,
      time_window_minutes: 60,
      severity: 'medium'
    };

    const metricsWithTimestamp = metrics.map(m => ({
      ...m,
      created_at: new Date().toISOString()
    }));

    const alertResult = evaluatePerformanceThreshold(metricsWithTimestamp, alertConfig);
    expect(alertResult).toHaveProperty('shouldAlert');
  });
});
