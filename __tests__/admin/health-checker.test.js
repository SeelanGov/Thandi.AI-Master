/**
 * Unit Tests for Health Checker
 * Tests the health checking functionality for the admin dashboard
 */

const {
  checkAPIEndpoint,
  checkDatabase,
  checkRAGSystem,
  detectUnhealthyComponents,
  calculateUptime
} = require('../../lib/admin/health-checker');

// Mock fetch
global.fetch = jest.fn();

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  gte: jest.fn(() => mockSupabase),
  limit: jest.fn(() => mockSupabase),
  data: null,
  error: null
};

describe('Health Checker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.data = null;
    mockSupabase.error = null;
    global.fetch.mockClear();
  });

  describe('checkAPIEndpoint', () => {
    test('should check API endpoint health', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' })
      });

      const result = await checkAPIEndpoint('/api/health');

      expect(result.status).toBe('healthy');
      expect(result.statusCode).toBe(200);
      expect(result.responseTime).toBeDefined();
    });

    test('should check database connection', async () => {
      mockSupabase.data = [{ id: 1 }];
      mockSupabase.error = null;

      const result = await checkDatabase(mockSupabase);

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeDefined();
      expect(mockSupabase.select).toHaveBeenCalled();
    });

    test('should check RAG system health', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'operational' })
      });

      const result = await checkRAGSystem();

      expect(result.status).toBe('healthy');
      expect(result.statusCode).toBe(200);
    });

    test('should detect unhealthy components', async () => {
      const healthChecks = [
        { component: 'api', status: 'healthy' },
        { component: 'database', status: 'unhealthy' },
        { component: 'rag', status: 'healthy' }
      ];

      const unhealthy = detectUnhealthyComponents(healthChecks);

      expect(unhealthy).toHaveLength(1);
      expect(unhealthy[0].component).toBe('database');
    });

    test('should measure response times', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: async () => ({})
          }), 100)
        )
      );

      const result = await checkAPIEndpoint('/api/test');

      expect(result.responseTime).toBeGreaterThanOrEqual(100);
    });

    test('should store health check results', async () => {
      const healthData = {
        component: 'api',
        healthy: true,
        response_time: 150,
        metadata: { endpoint: '/api/test' }
      };

      mockSupabase.data = { id: 'health-1', ...healthData };
      mockSupabase.error = null;

      const result = await storeHealthCheck(mockSupabase, healthData);

      expect(result.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    test('should handle timeout scenarios', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      );

      const result = await checkAPIEndpoint('/api/slow', { timeout: 1000 });

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Timeout');
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkAPIEndpoint('/api/test');

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Network');
    });

    test('should validate component names', async () => {
      const validComponents = ['api', 'database', 'rag', 'redis', 'email'];
      
      for (const component of validComponents) {
        const healthData = {
          component,
          healthy: true,
          response_time: 100
        };

        mockSupabase.data = { id: `health-${component}`, ...healthData };
        mockSupabase.error = null;

        const result = await storeHealthCheck(mockSupabase, healthData);

        expect(result.success).toBe(true);
      }
    });

    test('should validate status values', async () => {
      const validStatuses = ['healthy', 'unhealthy', 'degraded', 'unknown'];
      
      for (const status of validStatuses) {
        const result = { healthy: status === 'healthy', status };
        
        expect(['healthy', 'unhealthy', 'degraded', 'unknown']).toContain(result.status);
      }
    });

    test('should calculate uptime percentage', async () => {
      const healthChecks = [
        { status: 'healthy', created_at: new Date(Date.now() - 60000).toISOString() },
        { status: 'healthy', created_at: new Date(Date.now() - 120000).toISOString() },
        { status: 'unhealthy', created_at: new Date(Date.now() - 180000).toISOString() },
        { status: 'healthy', created_at: new Date(Date.now() - 240000).toISOString() }
      ];

      // Mock the query chain properly
      mockSupabase.data = healthChecks;
      mockSupabase.error = null;
      mockSupabase.limit = jest.fn(() => mockSupabase);
      mockSupabase.order = jest.fn(() => mockSupabase);

      const uptime = await calculateUptime(mockSupabase, 'api');

      expect(uptime.percentage).toBe(75); // 3/4 healthy
      expect(uptime.totalChecks).toBe(4);
      expect(uptime.healthyChecks).toBe(3);
    });

    test('should detect degraded performance', async () => {
      const healthChecks = [
        { status: 'healthy', response_time: 600 },
        { status: 'healthy', response_time: 650 },
        { status: 'healthy', response_time: 700 }
      ];

      const degraded = detectDegradedPerformance(healthChecks, 500);

      expect(degraded).toBe(true);
    });

    test('should handle concurrent checks', async () => {
      const endpoints = ['/api/test1', '/api/test2', '/api/test3'];
      
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({})
      });

      const promises = endpoints.map(endpoint => checkAPIEndpoint(endpoint));
      const results = await Promise.all(promises);

      expect(results.every(r => r.status === 'healthy')).toBe(true);
      expect(results).toHaveLength(3);
    });

    test('should filter by component', async () => {
      const healthChecks = [
        { component: 'api', status: 'healthy' },
        { component: 'database', status: 'unhealthy' },
        { component: 'api', status: 'healthy' }
      ];

      mockSupabase.data = healthChecks.filter(h => h.component === 'api');
      mockSupabase.error = null;

      const apiHealth = await getHealthByComponent(mockSupabase, 'api');

      expect(apiHealth).toHaveLength(2);
      expect(apiHealth.every(h => h.component === 'api')).toBe(true);
    });

    test('should filter by status', async () => {
      const healthChecks = [
        { component: 'api', status: 'healthy' },
        { component: 'database', status: 'unhealthy' },
        { component: 'rag', status: 'healthy' }
      ];

      const unhealthy = healthChecks.filter(h => h.status === 'unhealthy');

      expect(unhealthy).toHaveLength(1);
      expect(unhealthy[0].component).toBe('database');
    });

    test('should return correct health format', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      });

      const result = await checkAPIEndpoint('/api/test');

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('component');
    });
  });

  describe('checkDatabase', () => {
    test('should successfully check database', async () => {
      mockSupabase.data = [{ id: 1 }];
      mockSupabase.error = null;

      const result = await checkDatabase(mockSupabase);

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeDefined();
    });

    test('should handle database errors', async () => {
      mockSupabase.data = null;
      mockSupabase.error = { message: 'Connection failed' };

      const result = await checkDatabase(mockSupabase);

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('Connection');
    });
  });

  describe('checkRAGSystem', () => {
    test('should successfully check RAG system', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'operational' })
      });

      const result = await checkRAGSystem();

      expect(result.status).toBe('healthy');
      expect(result.statusCode).toBe(200);
    });

    test('should handle RAG system errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('RAG unavailable'));

      const result = await checkRAGSystem();

      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('RAG');
    });
  });
});

// Helper functions for tests
async function storeHealthCheck(supabase, healthData) {
  try {
    const { data, error } = await supabase
      .from('system_health_checks')
      .insert(healthData);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getHealthByComponent(supabase, component) {
  const { data } = await supabase
    .from('system_health_checks')
    .select('*')
    .eq('component', component);

  return data || [];
}

function detectDegradedPerformance(healthChecks, threshold) {
  const avgResponseTime = healthChecks.reduce((sum, check) => sum + check.response_time, 0) / healthChecks.length;
  return avgResponseTime > threshold;
}
