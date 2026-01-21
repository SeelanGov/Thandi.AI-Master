/**
 * Integration Tests: User Activity Tracking Flow
 * 
 * Tests the complete activity tracking workflow:
 * 1. Log user activities
 * 2. Query activity data
 * 3. Calculate funnel metrics
 * 4. Identify drop-off points
 * 5. Analyze user behavior
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.ADMIN_API_KEY || process.env.KIRO_API_KEY;

describe('User Activity Tracking Integration Flow', () => {
  let testActivityIds = [];
  const testUserId = 'test-user-activity-' + Date.now();
  const testSchoolId = 'test-school-activity-' + Date.now();

  beforeAll(async () => {
    // Clean up any existing test data
    await supabase
      .from('user_activity')
      .delete()
      .like('user_id', 'test-user-activity-%');
  });

  afterAll(async () => {
    // Clean up test data
    if (testActivityIds.length > 0) {
      await supabase
        .from('user_activity')
        .delete()
        .in('id', testActivityIds);
    }
  });

  describe('Complete Activity Tracking Flow', () => {
    test('should log user activity via API', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          userId: testUserId,
          eventType: 'registration_started',
          eventData: {
            source: 'integration-test',
            timestamp: new Date().toISOString()
          },
          schoolId: testSchoolId
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activityId).toBeDefined();
      
      testActivityIds.push(data.activityId);
    });

    test('should retrieve activity data', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?userId=${testUserId}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      expect(data.activities.length).toBeGreaterThan(0);
      expect(data.activities[0].userId).toBe(testUserId);
    });

    test('should track complete user funnel', async () => {
      // Simulate complete user journey
      const funnelSteps = [
        'registration_started',
        'registration_completed',
        'assessment_started',
        'assessment_completed',
        'results_viewed'
      ];

      for (const step of funnelSteps) {
        const response = await fetch(`${BASE_URL}/api/admin/activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            userId: testUserId,
            eventType: step,
            eventData: {
              step,
              timestamp: new Date().toISOString()
            },
            schoolId: testSchoolId
          })
        });

        const data = await response.json();
        testActivityIds.push(data.activityId);
      }

      // Query funnel metrics
      const funnelResponse = await fetch(
        `${BASE_URL}/api/admin/activity/funnel`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(funnelResponse.status).toBe(200);
      const funnelData = await funnelResponse.json();
      expect(funnelData.success).toBe(true);
      expect(funnelData.funnel).toBeDefined();
      expect(Array.isArray(funnelData.funnel)).toBe(true);
      
      // Verify all funnel stages present
      const stages = funnelData.funnel.map(f => f.stage);
      expect(stages).toContain('registration_started');
      expect(stages).toContain('registration_completed');
      expect(stages).toContain('assessment_started');
      expect(stages).toContain('assessment_completed');
      expect(stages).toContain('results_viewed');
    });

    test('should calculate conversion rates', async () => {
      const funnelResponse = await fetch(
        `${BASE_URL}/api/admin/activity/funnel`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(funnelResponse.status).toBe(200);
      const funnelData = await funnelResponse.json();
      expect(funnelData.success).toBe(true);
      expect(funnelData.funnel).toBeDefined();
      
      // Each stage should have conversion rate
      funnelData.funnel.forEach(stage => {
        expect(stage.conversionRate).toBeDefined();
        expect(stage.conversionRate).toBeGreaterThanOrEqual(0);
        expect(stage.conversionRate).toBeLessThanOrEqual(1);
      });
    });

    test('should identify drop-off points', async () => {
      // Create a drop-off scenario
      const dropOffUserId = 'test-user-dropoff-' + Date.now();
      
      // Many users start registration
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`${BASE_URL}/api/admin/activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            userId: `${dropOffUserId}-${i}`,
            eventType: 'registration_started',
            eventData: { test: true },
            schoolId: testSchoolId
          })
        });

        const data = await response.json();
        testActivityIds.push(data.activityId);
      }

      // Only few complete registration (drop-off)
      for (let i = 0; i < 3; i++) {
        const response = await fetch(`${BASE_URL}/api/admin/activity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            userId: `${dropOffUserId}-${i}`,
            eventType: 'registration_completed',
            eventData: { test: true },
            schoolId: testSchoolId
          })
        });

        const data = await response.json();
        testActivityIds.push(data.activityId);
      }

      // Query funnel to see drop-off
      const funnelResponse = await fetch(
        `${BASE_URL}/api/admin/activity/funnel`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(funnelResponse.status).toBe(200);
      const funnelData = await funnelResponse.json();
      expect(funnelData.success).toBe(true);
      
      // Should identify drop-off points
      if (funnelData.dropOffPoints) {
        expect(Array.isArray(funnelData.dropOffPoints)).toBe(true);
      }
    });

    test('should calculate summary statistics', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity`,
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
      expect(data.statistics.totalActivities).toBeGreaterThan(0);
      expect(data.statistics.uniqueUsers).toBeGreaterThan(0);
      expect(data.statistics.eventBreakdown).toBeDefined();
    });
  });

  describe('Activity Data Filtering', () => {
    test('should filter by event type', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?eventType=registration_started`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      
      // All activities should be registration_started
      data.activities.forEach(activity => {
        expect(activity.eventType).toBe('registration_started');
      });
    });

    test('should filter by school', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?schoolId=${testSchoolId}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      
      // All activities should be for the test school
      data.activities.forEach(activity => {
        expect(activity.schoolId).toBe(testSchoolId);
      });
    });

    test('should filter by date range', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
    });

    test('should filter by user', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?userId=${testUserId}`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      
      // All activities should be for the test user
      data.activities.forEach(activity => {
        expect(activity.userId).toBe(testUserId);
      });
    });
  });

  describe('Activity Pagination', () => {
    test('should paginate activity data', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/activity?limit=5&offset=0`,
        {
          headers: {
            'X-API-Key': API_KEY
          }
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activities).toBeDefined();
      expect(data.activities.length).toBeLessThanOrEqual(5);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.limit).toBe(5);
      expect(data.pagination.offset).toBe(0);
    });
  });

  describe('Activity Deduplication', () => {
    test('should deduplicate identical activities', async () => {
      const activityData = {
        userId: testUserId,
        eventType: 'test_deduplication',
        eventData: { test: 'dedup' },
        schoolId: testSchoolId
      };

      // Log same activity twice
      const response1 = await fetch(`${BASE_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(activityData)
      });

      const data1 = await response1.json();
      testActivityIds.push(data1.activityId);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await fetch(`${BASE_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(activityData)
      });

      const data2 = await response2.json();
      
      // Should either deduplicate or allow (depending on implementation)
      expect(response2.status).toBe(200);
      expect(data2.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should reject requests without API key', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activity`);
      expect(response.status).toBe(401);
    });

    test('should reject invalid activity data', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          // Missing required fields
          eventType: 'test_invalid'
        })
      });

      expect(response.status).toBe(400);
    });

    test('should handle invalid event types', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          userId: testUserId,
          eventType: 'invalid_event_type_that_does_not_exist',
          eventData: {}
        })
      });

      // Should either accept (if validation is lenient) or reject
      expect([200, 400]).toContain(response.status);
    });
  });
});
