/**
 * Unit Tests: Health Checker
 * Tests system health checking functionality
 * Created: January 20, 2026
 */

import {
  checkDatabaseHealth,
  checkAPIHealth,
  checkRAGHealth,
  aggregateHealthStatus
} from '@/lib/admin/health-checker';

// Mock fetch
global.fetch = jest.fn();

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({ data: [], error: null }))
      }))
    }))
  }))
}));

describe('Health Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('checkDatabaseHealth', () => {
    it('should return healthy status when database is accessible', async () => {
      const health = await checkDatabaseHealth();

      expect(health.component).toBe('database');
      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeGreaterThan(0);
    });

    it('should return unhealthy status on database error', async () => {
      // Mock database error
      const { createClient } = require('@supabase/supabase-js');
      createClient.mockImplementationOnce(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => ({ data: null, error: new Error('Connection failed') }))
          }))
        }))
      }));

      const health = await checkDatabaseHealth();

      expect(health.status).toBe('unhealthy');
      expect(health.error).toBeDefined();
    });

    it('should measure response time', async () => {
      const health = await checkDatabaseHealth();

      expect(health.responseTime).toBeGreaterThan(0);
      expect(typeof health.responseTime).toBe('number');
    });
  });

  describe('checkAPIHealth', () => {
    it('should return healthy status when API responds', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const health = await checkAPIHealth('/api/test');

      expect(health.component).toBe('api');
      expect(health.status).toBe('healthy');
      expect(health.endpoint).toBe('/api/test');
    });

    it('should return unhealthy status on API error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const health = await checkAPIHealth('/api/test');

      expect(health.status).toBe('unhealthy');
      expect(health.statusCode).toBe(500);
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const health = await checkAPIHealth('/api/test');

      expect(health.status).toBe('unhealthy');
      expect(health.error).toContain('Network error');
    });

    it('should measure response time', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const health = await checkAPIHealth('/api/test');

      expect(health.responseTime).toBeGreaterThan(0);
    });
  });

  describe('checkRAGHealth', () => {
    it('should return healthy status when RAG responds', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, results: [] })
      });

      const health = await checkRAGHealth();

      expect(health.component).toBe('rag');
      expect(health.status).toBe('healthy');
    });

    it('should return unhealthy status on RAG error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const health = await checkRAGHealth();

      expect(health.status).toBe('unhealthy');
    });

    it('should use test query', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      await checkRAGHealth();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rag/query'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('health check')
        })
      );
    });
  });

  describe('aggregateHealthStatus', () => {
    it('should return healthy when all components healthy', () => {
      const checks = [
        { component: 'database', status: 'healthy' },
        { component: 'api', status: 'healthy' },
        { component: 'rag', status: 'healthy' }
      ];

      const aggregate = aggregateHealthStatus(checks);

      expect(aggregate.overallStatus).toBe('healthy');
      expect(aggregate.healthyCount).toBe(3);
      expect(aggregate.unhealthyCount).toBe(0);
    });

    it('should return degraded when some components unhealthy', () => {
      const checks = [
        { component: 'database', status: 'healthy' },
        { component: 'api', status: 'unhealthy' },
        { component: 'rag', status: 'healthy' }
      ];

      const aggregate = aggregateHealthStatus(checks);

      expect(aggregate.overallStatus).toBe('degraded');
      expect(aggregate.healthyCount).toBe(2);
      expect(aggregate.unhealthyCount).toBe(1);
    });

    it('should return unhealthy when all components unhealthy', () => {
      const checks = [
        { component: 'database', status: 'unhealthy' },
        { component: 'api', status: 'unhealthy' },
        { component: 'rag', status: 'unhealthy' }
      ];

      const aggregate = aggregateHealthStatus(checks);

      expect(aggregate.overallStatus).toBe('unhealthy');
      expect(aggregate.unhealthyCount).toBe(3);
    });

    it('should handle empty checks array', () => {
      const aggregate = aggregateHealthStatus([]);

      expect(aggregate.overallStatus).toBe('unknown');
      expect(aggregate.healthyCount).toBe(0);
    });

    it('should list unhealthy components', () => {
      const checks = [
        { component: 'database', status: 'healthy' },
        { component: 'api', status: 'unhealthy' },
        { component: 'rag', status: 'unhealthy' }
      ];

      const aggregate = aggregateHealthStatus(checks);

      expect(aggregate.unhealthyComponents).toContain('api');
      expect(aggregate.unhealthyComponents).toContain('rag');
      expect(aggregate.unhealthyComponents).not.toContain('database');
    });
  });

  describe('Health Check Timeout', () => {
    it('should timeout long-running checks', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const startTime = Date.now();
      const health = await checkAPIHealth('/api/slow', 1000); // 1 second timeout
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
      expect(health.status).toBe('unhealthy');
    });
  });
});
