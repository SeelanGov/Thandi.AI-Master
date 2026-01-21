/**
 * Unit Tests: Error Logger
 * Tests error logging functionality
 * Created: January 20, 2026
 */

import { logError, deduplicateError } from '@/lib/admin/error-logger';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: null }))
          }))
        }))
      }))
    }))
  }))
}));

describe('Error Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('should log error with all required fields', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        stack: 'Error stack trace',
        endpoint: '/api/test',
        method: 'POST',
        statusCode: 500
      };

      const result = await logError(errorData);

      expect(result).toBeDefined();
      expect(result.type).toBe('api_error');
      expect(result.message).toBe('Test error');
    });

    it('should handle missing optional fields', async () => {
      const errorData = {
        type: 'frontend_error',
        message: 'Test error'
      };

      const result = await logError(errorData);

      expect(result).toBeDefined();
      expect(result.type).toBe('frontend_error');
    });

    it('should validate error type', async () => {
      const errorData = {
        type: 'invalid_type',
        message: 'Test error'
      };

      await expect(logError(errorData)).rejects.toThrow();
    });

    it('should require message field', async () => {
      const errorData = {
        type: 'api_error'
      };

      await expect(logError(errorData)).rejects.toThrow();
    });
  });

  describe('deduplicateError', () => {
    it('should detect duplicate errors', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Duplicate error',
        endpoint: '/api/test'
      };

      const isDuplicate = await deduplicateError(errorData);

      expect(typeof isDuplicate).toBe('boolean');
    });

    it('should handle errors without endpoint', async () => {
      const errorData = {
        type: 'frontend_error',
        message: 'Test error'
      };

      const isDuplicate = await deduplicateError(errorData);

      expect(typeof isDuplicate).toBe('boolean');
    });
  });

  describe('Error Types', () => {
    const validTypes = [
      'api_error',
      'database_error',
      'frontend_error',
      'rag_error',
      'auth_error'
    ];

    validTypes.forEach(type => {
      it(`should accept ${type} as valid error type`, async () => {
        const errorData = {
          type,
          message: 'Test error'
        };

        const result = await logError(errorData);
        expect(result.type).toBe(type);
      });
    });
  });

  describe('Error Context', () => {
    it('should store user context', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        userId: 'user-123',
        userEmail: 'test@example.com'
      };

      const result = await logError(errorData);

      expect(result.userId).toBe('user-123');
      expect(result.userEmail).toBe('test@example.com');
    });

    it('should store school context', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        schoolId: 'school-123',
        schoolName: 'Test School'
      };

      const result = await logError(errorData);

      expect(result.schoolId).toBe('school-123');
      expect(result.schoolName).toBe('Test School');
    });

    it('should store request context', async () => {
      const errorData = {
        type: 'api_error',
        message: 'Test error',
        endpoint: '/api/test',
        method: 'POST',
        statusCode: 500,
        userAgent: 'Mozilla/5.0'
      };

      const result = await logError(errorData);

      expect(result.endpoint).toBe('/api/test');
      expect(result.method).toBe('POST');
      expect(result.statusCode).toBe(500);
    });
  });
});
