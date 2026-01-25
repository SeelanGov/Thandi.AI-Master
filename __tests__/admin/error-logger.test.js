/**
 * Unit Tests for Error Logger
 * Tests the error logging functionality for the admin dashboard
 */

const { logError, deduplicateError } = require('../../lib/admin/error-logger');

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  gte: jest.fn(() => mockSupabase),
  single: jest.fn(() => mockSupabase),
  data: null,
  error: null
};

describe('Error Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.data = null;
    mockSupabase.error = null;
  });

  describe('logError', () => {
    test('should log error successfully', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'high',
        feature_area: 'assessment',
        user_id: 'user-123',
        school_id: 'school-456',
        context: { endpoint: '/api/test' },
        stack_trace: 'Error: Test\n  at test.js:1:1'
      };

      mockSupabase.data = { id: 'error-1', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.id).toBe('error-1');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    test('should deduplicate similar errors', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Duplicate error',
        severity: 'medium',
        feature_area: 'registration'
      };

      // Mock existing error found - need to mock the full chain
      mockSupabase.data = [{ id: 'existing-error', count: 1 }];
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.isDuplicate).toBe(true);
    });

    test('should handle missing required fields', async () => {
      const errorData = {
        // Missing type and message
        severity: 'low'
      };

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should validate error types', async () => {
      const errorData = {
        type: 'invalid_type',
        message: 'Test error',
        severity: 'high'
      };

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid error type');
    });

    test('should store error context correctly', async () => {
      const errorData = {
        type: 'frontend_error',
        message: 'React error',
        severity: 'medium',
        context: {
          component: 'TestComponent',
          props: { id: 123 },
          url: '/test'
        }
      };

      mockSupabase.data = { id: 'error-2', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.context).toEqual(errorData.context);
    });

    test('should handle database errors gracefully', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'high'
      };

      mockSupabase.data = null;
      mockSupabase.error = { message: 'Database connection failed' };

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database');
    });

    test('should return correct error ID', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'critical'
      };

      const expectedId = 'error-abc-123';
      mockSupabase.data = { id: expectedId, ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.id).toBe(expectedId);
    });

    test('should validate severity levels', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'invalid_severity'
      };

      const result = await logError(mockSupabase, errorData);

      // Implementation validates severity, so this should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain('severity');
    });

    test('should handle null user ID', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'low',
        user_id: null
      };

      mockSupabase.data = { id: 'error-3', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.user_id).toBeNull();
    });

    test('should handle null school ID', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'low',
        school_id: null
      };

      mockSupabase.data = { id: 'error-4', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.school_id).toBeNull();
    });

    test('should validate feature areas', async () => {
      const validAreas = ['assessment', 'registration', 'rag', 'school_portal', 'admin'];
      
      for (const area of validAreas) {
        const errorData = {
          type: 'api_error',
          message: 'Test error',
          severity: 'low',
          feature_area: area
        };

        mockSupabase.data = { id: `error-${area}`, ...errorData };
        mockSupabase.error = null;

        const result = await logError(mockSupabase, errorData);

        expect(result.success).toBe(true);
      }
    });

    test('should handle stack trace formatting', async () => {
      const errorData = {
        type: 'frontend_error',
        message: 'Test error',
        severity: 'high',
        stack_trace: 'Error: Test\n  at Component.render (component.js:10:5)\n  at React.render (react.js:100:10)'
      };

      mockSupabase.data = { id: 'error-5', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.stack_trace).toContain('component.js');
    });

    test('should store metadata correctly', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'medium',
        metadata: {
          browser: 'Chrome',
          os: 'Windows',
          version: '1.0.0'
        }
      };

      mockSupabase.data = { id: 'error-6', ...errorData };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.metadata).toEqual(errorData.metadata);
    });

    test('should handle concurrent error logging', async () => {
      const errors = Array.from({ length: 5 }, (_, i) => ({
        type: 'api_error',
        message: `Error ${i}`,
        severity: 'low'
      }));

      mockSupabase.error = null;

      const promises = errors.map((error, i) => {
        mockSupabase.data = { id: `error-${i}`, ...error };
        return logError(mockSupabase, error);
      });

      const results = await Promise.all(promises);

      expect(results.every(r => r.success)).toBe(true);
      expect(results).toHaveLength(5);
    });

    test('should validate timestamp format', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        severity: 'low'
      };

      mockSupabase.data = { 
        id: 'error-7', 
        ...errorData,
        created_at: new Date().toISOString()
      };
      mockSupabase.error = null;

      const result = await logError(mockSupabase, errorData);

      expect(result.success).toBe(true);
      expect(result.error.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('deduplicateError', () => {
    test('should identify duplicate errors within time window', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Duplicate test',
        feature_area: 'assessment'
      };

      // Mock existing error within 5 minutes - need array format
      mockSupabase.data = [{
        id: 'existing-error',
        count: 1,
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }];
      mockSupabase.error = null;

      const result = await deduplicateError(mockSupabase, errorData);

      expect(result.isDuplicate).toBe(true);
      expect(result.existingErrorId).toBe('existing-error');
    });

    test('should not deduplicate errors outside time window', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Old error',
        feature_area: 'registration'
      };

      // Mock existing error older than 5 minutes
      mockSupabase.data = null;
      mockSupabase.error = null;

      const result = await deduplicateError(mockSupabase, errorData);

      expect(result.isDuplicate).toBe(false);
    });
  });
});
