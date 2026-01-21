/**
 * Unit Tests: Activity Analyzer
 * Tests activity analysis functionality
 * Created: January 20, 2026
 */

import {
  calculateActiveUsers,
  calculateFunnelMetrics,
  identifyDropOffPoints,
  calculateConversionRate
} from '@/lib/admin/activity-analyzer';

describe('Activity Analyzer', () => {
  describe('calculateActiveUsers', () => {
    it('should count unique users', () => {
      const activities = [
        { userId: 'user1', eventType: 'registration' },
        { userId: 'user2', eventType: 'registration' },
        { userId: 'user1', eventType: 'assessment_start' }
      ];

      const activeUsers = calculateActiveUsers(activities);

      expect(activeUsers).toBe(2);
    });

    it('should handle empty activities', () => {
      const activeUsers = calculateActiveUsers([]);

      expect(activeUsers).toBe(0);
    });

    it('should handle activities without userId', () => {
      const activities = [
        { eventType: 'page_view' },
        { userId: 'user1', eventType: 'registration' }
      ];

      const activeUsers = calculateActiveUsers(activities);

      expect(activeUsers).toBe(1);
    });
  });

  describe('calculateFunnelMetrics', () => {
    it('should calculate funnel for all stages', () => {
      const activities = [
        { userId: 'user1', eventType: 'registration' },
        { userId: 'user1', eventType: 'assessment_start' },
        { userId: 'user1', eventType: 'assessment_complete' },
        { userId: 'user2', eventType: 'registration' },
        { userId: 'user2', eventType: 'assessment_start' }
      ];

      const funnel = calculateFunnelMetrics(activities);

      expect(funnel.registration).toBe(2);
      expect(funnel.assessmentStart).toBe(2);
      expect(funnel.assessmentComplete).toBe(1);
    });

    it('should calculate conversion rates', () => {
      const activities = [
        { userId: 'user1', eventType: 'registration' },
        { userId: 'user1', eventType: 'assessment_start' },
        { userId: 'user2', eventType: 'registration' }
      ];

      const funnel = calculateFunnelMetrics(activities);

      expect(funnel.registrationToAssessment).toBe(0.5); // 50%
    });

    it('should handle empty activities', () => {
      const funnel = calculateFunnelMetrics([]);

      expect(funnel.registration).toBe(0);
      expect(funnel.assessmentStart).toBe(0);
    });
  });

  describe('identifyDropOffPoints', () => {
    it('should identify significant drop-off points', () => {
      const funnel = {
        registration: 100,
        assessmentStart: 80,
        assessmentComplete: 30,
        resultsView: 25
      };

      const dropOffs = identifyDropOffPoints(funnel);

      expect(dropOffs).toContain('assessmentComplete');
    });

    it('should not identify minor drop-offs', () => {
      const funnel = {
        registration: 100,
        assessmentStart: 95,
        assessmentComplete: 90,
        resultsView: 85
      };

      const dropOffs = identifyDropOffPoints(funnel);

      expect(dropOffs).toHaveLength(0);
    });

    it('should use custom threshold', () => {
      const funnel = {
        registration: 100,
        assessmentStart: 85
      };

      const dropOffs = identifyDropOffPoints(funnel, 0.1); // 10% threshold

      expect(dropOffs).toContain('assessmentStart');
    });

    it('should handle empty funnel', () => {
      const dropOffs = identifyDropOffPoints({});

      expect(dropOffs).toHaveLength(0);
    });
  });

  describe('calculateConversionRate', () => {
    it('should calculate conversion rate correctly', () => {
      const rate = calculateConversionRate(50, 100);

      expect(rate).toBe(0.5); // 50%
    });

    it('should handle zero denominator', () => {
      const rate = calculateConversionRate(10, 0);

      expect(rate).toBe(0);
    });

    it('should handle zero numerator', () => {
      const rate = calculateConversionRate(0, 100);

      expect(rate).toBe(0);
    });

    it('should return value between 0 and 1', () => {
      const rate = calculateConversionRate(75, 100);

      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  });

  describe('Event Type Grouping', () => {
    it('should group events by type', () => {
      const activities = [
        { eventType: 'registration' },
        { eventType: 'registration' },
        { eventType: 'assessment_start' },
        { eventType: 'assessment_complete' }
      ];

      const grouped = activities.reduce((acc, activity) => {
        acc[activity.eventType] = (acc[activity.eventType] || 0) + 1;
        return acc;
      }, {});

      expect(grouped.registration).toBe(2);
      expect(grouped.assessment_start).toBe(1);
      expect(grouped.assessment_complete).toBe(1);
    });
  });

  describe('Time-based Analysis', () => {
    it('should filter activities by time range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activities = [
        { userId: 'user1', createdAt: now.toISOString() },
        { userId: 'user2', createdAt: yesterday.toISOString() },
        { userId: 'user3', createdAt: lastWeek.toISOString() }
      ];

      const recent = activities.filter(a => {
        const activityDate = new Date(a.createdAt);
        return activityDate > yesterday;
      });

      expect(recent).toHaveLength(2);
    });
  });
});
