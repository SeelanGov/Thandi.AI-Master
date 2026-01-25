/**
 * Integration Tests: Activity Tracking Flow
 * Tests the complete activity tracking workflow from logging to funnel analysis
 */

const {
  calculateActivitySummary,
  calculateFunnelMetrics,
  identifyDropOffPoints,
  calculateActivityTrends,
  groupByEventType
} = require('../../../lib/admin/activity-analyzer');

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

describe('Activity Tracking Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Activity Tracking Workflow', () => {
    test('should log events, calculate metrics, and analyze funnels', async () => {
      // Step 1: Log activity events
      const activities = [
        {
          event_type: 'registration',
          user_id: 'user-1',
          session_id: 'session-1',
          timestamp: new Date().toISOString()
        },
        {
          event_type: 'registration',
          user_id: 'user-2',
          session_id: 'session-2',
          timestamp: new Date().toISOString()
        },
        {
          event_type: 'assessment_started',
          user_id: 'user-1',
          session_id: 'session-1',
          timestamp: new Date().toISOString()
        },
        {
          event_type: 'assessment_completed',
          user_id: 'user-1',
          session_id: 'session-1',
          timestamp: new Date().toISOString()
        },
        {
          event_type: 'school_login',
          user_id: 'school-1',
          session_id: 'session-3',
          timestamp: new Date().toISOString()
        }
      ];

      // Step 2: Calculate activity summary
      const summary = calculateActivitySummary(activities);
      expect(summary.totalEvents).toBe(5);
      expect(summary.uniqueUsers).toBe(3);
      expect(summary.uniqueSessions).toBe(3);
      expect(summary.registrations).toBe(2);
      expect(summary.assessments).toBe(1);
      expect(summary.schoolLogins).toBe(1);

      // Step 3: Calculate funnel metrics
      const funnel = calculateFunnelMetrics(activities);
      expect(funnel.registrations).toBe(2);
      expect(funnel.assessmentsStarted).toBe(1);
      expect(funnel.assessmentsCompleted).toBe(1);
      expect(funnel.conversionRate).toBe(50); // 1/2 = 50%
      expect(funnel.completionRate).toBe(100); // 1/1 = 100%

      // Step 4: Identify drop-off points
      const dropOffs = identifyDropOffPoints(funnel);
      expect(Array.isArray(dropOffs)).toBe(true);
      // Should identify registration to assessment drop-off (50% conversion)
      expect(dropOffs.length).toBeGreaterThan(0);
    });

    test('should track user session journey', () => {
      const activities = [
        { event_type: 'registration', user_id: 'user-1', session_id: 'session-1' },
        { event_type: 'assessment_started', user_id: 'user-1', session_id: 'session-1' },
        { event_type: 'assessment_completed', user_id: 'user-1', session_id: 'session-1' },
        { event_type: 'rag_query', user_id: 'user-1', session_id: 'session-1' }
      ];

      const summary = calculateActivitySummary(activities);
      expect(summary.uniqueUsers).toBe(1);
      expect(summary.uniqueSessions).toBe(1);
      expect(summary.totalEvents).toBe(4);
    });
  });

  describe('Funnel Analysis', () => {
    test('should calculate conversion rates correctly', () => {
      const activities = [
        { event_type: 'registration' },
        { event_type: 'registration' },
        { event_type: 'registration' },
        { event_type: 'registration' },
        { event_type: 'assessment_started' },
        { event_type: 'assessment_started' },
        { event_type: 'assessment_completed' }
      ];

      const funnel = calculateFunnelMetrics(activities);
      expect(funnel.registrations).toBe(4);
      expect(funnel.assessmentsStarted).toBe(2);
      expect(funnel.assessmentsCompleted).toBe(1);
      expect(funnel.conversionRate).toBe(50); // 2/4 = 50%
      expect(funnel.completionRate).toBe(50); // 1/2 = 50%
    });

    test('should identify high drop-off at registration', () => {
      const funnelMetrics = {
        registrations: 100,
        assessmentsStarted: 20,
        assessmentsCompleted: 15,
        conversionRate: 20,
        completionRate: 75
      };

      const dropOffs = identifyDropOffPoints(funnelMetrics);
      expect(dropOffs.length).toBeGreaterThan(0);
      
      const registrationDropOff = dropOffs.find(d => d.stage === 'registration_to_assessment');
      expect(registrationDropOff).toBeDefined();
      expect(registrationDropOff.dropOffRate).toBe(80);
      expect(registrationDropOff.severity).toBe('high');
    });

    test('should identify high drop-off during assessment', () => {
      const funnelMetrics = {
        registrations: 100,
        assessmentsStarted: 80,
        assessmentsCompleted: 30,
        conversionRate: 80,
        completionRate: 38
      };

      const dropOffs = identifyDropOffPoints(funnelMetrics);
      
      const assessmentDropOff = dropOffs.find(d => d.stage === 'assessment_completion');
      expect(assessmentDropOff).toBeDefined();
      expect(assessmentDropOff.dropOffRate).toBe(62);
      expect(assessmentDropOff.severity).toBe('high');
    });

    test('should not identify drop-offs with good conversion rates', () => {
      const funnelMetrics = {
        registrations: 100,
        assessmentsStarted: 85,
        assessmentsCompleted: 75,
        conversionRate: 85,
        completionRate: 88
      };

      const dropOffs = identifyDropOffPoints(funnelMetrics);
      expect(dropOffs.length).toBe(0);
    });
  });

  describe('Activity Trends Over Time', () => {
    test('should calculate daily activity trends', () => {
      const activities = [
        { event_type: 'registration', user_id: 'user-1', session_id: 'session-1', timestamp: '2026-01-20T10:00:00Z' },
        { event_type: 'registration', user_id: 'user-2', session_id: 'session-2', timestamp: '2026-01-20T14:00:00Z' },
        { event_type: 'registration', user_id: 'user-3', session_id: 'session-3', timestamp: '2026-01-21T10:00:00Z' },
        { event_type: 'assessment_completed', user_id: 'user-1', session_id: 'session-1', timestamp: '2026-01-21T14:00:00Z' }
      ];

      const trends = calculateActivityTrends(activities, 'daily');
      expect(trends.length).toBe(2); // 2 days
      expect(trends[0].timestamp).toBe('2026-01-20');
      expect(trends[1].timestamp).toBe('2026-01-21');
      expect(trends[0].totalEvents).toBe(2);
      expect(trends[1].totalEvents).toBe(2);
    });

    test('should calculate hourly activity trends', () => {
      const activities = [
        { event_type: 'registration', timestamp: '2026-01-20T10:00:00Z' },
        { event_type: 'registration', timestamp: '2026-01-20T10:30:00Z' },
        { event_type: 'registration', timestamp: '2026-01-20T11:00:00Z' }
      ];

      const trends = calculateActivityTrends(activities, 'hourly');
      expect(trends.length).toBe(2); // 2 hours
      expect(trends[0].timestamp).toBe('2026-01-20 10:00');
      expect(trends[1].timestamp).toBe('2026-01-20 11:00');
    });

    test('should calculate weekly activity trends', () => {
      const activities = [
        { event_type: 'registration', timestamp: '2026-01-20T10:00:00Z' }, // Monday
        { event_type: 'registration', timestamp: '2026-01-21T10:00:00Z' }, // Tuesday
        { event_type: 'registration', timestamp: '2026-01-27T10:00:00Z' }, // Next Monday
        { event_type: 'registration', timestamp: '2026-01-28T10:00:00Z' }  // Next Tuesday
      ];

      const trends = calculateActivityTrends(activities, 'weekly');
      expect(trends.length).toBe(2); // 2 weeks
    });
  });

  describe('Event Type Grouping', () => {
    test('should group activities by event type', () => {
      const activities = [
        { event_type: 'registration', user_id: 'user-1' },
        { event_type: 'registration', user_id: 'user-2' },
        { event_type: 'assessment_completed', user_id: 'user-1' },
        { event_type: 'school_login', user_id: 'school-1' },
        { event_type: 'school_login', user_id: 'school-2' },
        { event_type: 'school_login', user_id: 'school-3' }
      ];

      const groups = groupByEventType(activities);
      expect(groups.registration.count).toBe(2);
      expect(groups.assessment_completed.count).toBe(1);
      expect(groups.school_login.count).toBe(3);
      expect(groups.registration.events.length).toBe(2);
    });

    test('should handle unknown event types', () => {
      const activities = [
        { event_type: 'registration' },
        { event_type: null },
        { event_type: undefined },
        {}
      ];

      const groups = groupByEventType(activities);
      expect(groups.registration.count).toBe(1);
      expect(groups.unknown.count).toBe(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty activities array', () => {
      const summary = calculateActivitySummary([]);
      expect(summary.totalEvents).toBe(0);
      expect(summary.uniqueUsers).toBe(0);

      const funnel = calculateFunnelMetrics([]);
      expect(funnel.registrations).toBe(0);
      expect(funnel.conversionRate).toBe(0);

      const trends = calculateActivityTrends([], 'daily');
      expect(trends).toEqual([]);

      const groups = groupByEventType([]);
      expect(groups).toEqual({});
    });

    test('should handle null or undefined activities', () => {
      const summary = calculateActivitySummary(null);
      expect(summary.totalEvents).toBe(0);

      const funnel = calculateFunnelMetrics(undefined);
      expect(funnel.registrations).toBe(0);

      const trends = calculateActivityTrends(null, 'daily');
      expect(trends).toEqual([]);

      const groups = groupByEventType(undefined);
      expect(groups).toEqual({});
    });

    test('should handle activities with missing user_id or session_id', () => {
      const activities = [
        { event_type: 'registration' }, // Missing user_id and session_id
        { event_type: 'registration', user_id: 'user-1' }, // Missing session_id
        { event_type: 'registration', session_id: 'session-1' } // Missing user_id
      ];

      const summary = calculateActivitySummary(activities);
      expect(summary.totalEvents).toBe(3);
      expect(summary.uniqueUsers).toBe(1);
      expect(summary.uniqueSessions).toBe(1);
    });

    test('should handle zero registrations in funnel', () => {
      const activities = [
        { event_type: 'assessment_started' },
        { event_type: 'assessment_completed' }
      ];

      const funnel = calculateFunnelMetrics(activities);
      expect(funnel.registrations).toBe(0);
      expect(funnel.conversionRate).toBe(0);
    });

    test('should handle zero assessments started in funnel', () => {
      const activities = [
        { event_type: 'registration' },
        { event_type: 'registration' }
      ];

      const funnel = calculateFunnelMetrics(activities);
      expect(funnel.assessmentsStarted).toBe(0);
      expect(funnel.completionRate).toBe(0);
    });
  });

  describe('Real-World Scenarios', () => {
    test('should track complete student journey', () => {
      const studentJourney = [
        { event_type: 'registration', user_id: 'student-1', session_id: 'session-1', timestamp: '2026-01-20T10:00:00Z' },
        { event_type: 'assessment_started', user_id: 'student-1', session_id: 'session-1', timestamp: '2026-01-20T10:05:00Z' },
        { event_type: 'assessment_completed', user_id: 'student-1', session_id: 'session-1', timestamp: '2026-01-20T10:30:00Z' },
        { event_type: 'rag_query', user_id: 'student-1', session_id: 'session-1', timestamp: '2026-01-20T10:35:00Z' },
        { event_type: 'rag_query', user_id: 'student-1', session_id: 'session-1', timestamp: '2026-01-20T10:40:00Z' }
      ];

      const summary = calculateActivitySummary(studentJourney);
      expect(summary.uniqueUsers).toBe(1);
      expect(summary.uniqueSessions).toBe(1);
      expect(summary.totalEvents).toBe(5);
      expect(summary.registrations).toBe(1);
      expect(summary.assessments).toBe(1);
      expect(summary.ragQueries).toBe(2);
    });

    test('should identify problematic funnel with high abandonment', () => {
      // Simulate 100 registrations, but only 10 complete assessment
      const activities = [];
      
      // 100 registrations
      for (let i = 0; i < 100; i++) {
        activities.push({ event_type: 'registration' });
      }
      
      // 30 start assessment
      for (let i = 0; i < 30; i++) {
        activities.push({ event_type: 'assessment_started' });
      }
      
      // Only 10 complete
      for (let i = 0; i < 10; i++) {
        activities.push({ event_type: 'assessment_completed' });
      }

      const funnel = calculateFunnelMetrics(activities);
      const dropOffs = identifyDropOffPoints(funnel);

      expect(funnel.conversionRate).toBe(30);
      expect(funnel.completionRate).toBe(33);
      expect(dropOffs.length).toBe(2); // Both stages have high drop-off
      expect(dropOffs.every(d => d.severity === 'high')).toBe(true);
    });
  });
});
