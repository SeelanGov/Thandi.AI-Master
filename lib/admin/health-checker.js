/**
 * Health Checker - Admin Dashboard
 * Performs health checks on system components
 * Created: January 20, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check health of all system components
 * @returns {Promise<Object>} Health check results
 */
export async function checkSystemHealth() {
  const results = {
    overall_status: 'healthy',
    checks: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Run all health checks in parallel
    const [
      databaseCheck,
      apiEndpointsCheck,
      ragSystemCheck
    ] = await Promise.all([
      checkDatabase(),
      checkAPIEndpoints(),
      checkRAGSystem()
    ]);

    results.checks.push(databaseCheck, ...apiEndpointsCheck, ragSystemCheck);

    // Determine overall status
    const hasUnhealthy = results.checks.some(check => check.status === 'unhealthy');
    const hasDegraded = results.checks.some(check => check.status === 'degraded');

    if (hasUnhealthy) {
      results.overall_status = 'unhealthy';
    } else if (hasDegraded) {
      results.overall_status = 'degraded';
    }

    // Store results in database
    await storeHealthCheckResults(results.checks);

    return {
      success: true,
      data: results
    };

  } catch (error) {
    console.error('Error in checkSystemHealth:', error);
    return {
      success: false,
      error: 'Failed to perform health checks',
      details: error.message
    };
  }
}

/**
 * Check database connectivity and performance
 * @returns {Promise<Object>} Database health check result
 */
async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        check_type: 'database',
        component_name: 'Supabase Database',
        status: 'unhealthy',
        response_time: responseTime,
        error_message: error.message,
        details: {
          error_code: error.code,
          error_hint: error.hint
        }
      };
    }

    // Determine status based on response time
    let status = 'healthy';
    if (responseTime > 1000) {
      status = 'unhealthy';
    } else if (responseTime > 500) {
      status = 'degraded';
    }

    return {
      check_type: 'database',
      component_name: 'Supabase Database',
      status,
      response_time: responseTime,
      error_message: null,
      details: {
        connection: 'successful',
        query_time: `${responseTime}ms`
      }
    };

  } catch (error) {
    return {
      check_type: 'database',
      component_name: 'Supabase Database',
      status: 'unhealthy',
      response_time: Date.now() - startTime,
      error_message: error.message,
      details: {
        error: error.toString()
      }
    };
  }
}

/**
 * Check critical API endpoints
 * @returns {Promise<Array>} API endpoint health check results
 */
async function checkAPIEndpoints() {
  const endpoints = [
    { path: '/api/student/register', method: 'POST', name: 'Student Registration' },
    { path: '/api/rag/query', method: 'POST', name: 'RAG Query' },
    { path: '/api/schools/login', method: 'POST', name: 'School Login' }
  ];

  const results = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  for (const endpoint of endpoints) {
    const startTime = Date.now();
    
    try {
      // For POST endpoints, send minimal valid payload
      const testPayload = getTestPayload(endpoint.path);
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify(testPayload) : undefined,
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      // Determine status based on response
      let status = 'healthy';
      let errorMessage = null;

      if (!response.ok && response.status >= 500) {
        status = 'unhealthy';
        errorMessage = `HTTP ${response.status}`;
      } else if (responseTime > 2000) {
        status = 'degraded';
        errorMessage = 'Slow response time';
      }

      results.push({
        check_type: 'api_endpoint',
        component_name: endpoint.name,
        status,
        response_time: responseTime,
        error_message: errorMessage,
        details: {
          endpoint: endpoint.path,
          method: endpoint.method,
          status_code: response.status,
          response_time: `${responseTime}ms`
        }
      });

    } catch (error) {
      results.push({
        check_type: 'api_endpoint',
        component_name: endpoint.name,
        status: 'unhealthy',
        response_time: Date.now() - startTime,
        error_message: error.message,
        details: {
          endpoint: endpoint.path,
          method: endpoint.method,
          error: error.toString()
        }
      });
    }
  }

  return results;
}

/**
 * Check RAG system health
 * @returns {Promise<Object>} RAG system health check result
 */
async function checkRAGSystem() {
  const startTime = Date.now();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Test RAG query endpoint with simple query
    const response = await fetch(`${baseUrl}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'health check test',
        grade: 10,
        subjects: ['Mathematics']
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout for RAG
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        check_type: 'rag_system',
        component_name: 'RAG System',
        status: 'unhealthy',
        response_time: responseTime,
        error_message: `HTTP ${response.status}`,
        details: {
          status_code: response.status,
          response_time: `${responseTime}ms`
        }
      };
    }

    const data = await response.json();

    // Determine status based on response time and data quality
    let status = 'healthy';
    let errorMessage = null;

    if (responseTime > 5000) {
      status = 'degraded';
      errorMessage = 'Slow response time';
    }

    if (!data || !data.response) {
      status = 'degraded';
      errorMessage = 'Invalid response format';
    }

    return {
      check_type: 'rag_system',
      component_name: 'RAG System',
      status,
      response_time: responseTime,
      error_message: errorMessage,
      details: {
        response_time: `${responseTime}ms`,
        response_valid: !!data?.response
      }
    };

  } catch (error) {
    return {
      check_type: 'rag_system',
      component_name: 'RAG System',
      status: 'unhealthy',
      response_time: Date.now() - startTime,
      error_message: error.message,
      details: {
        error: error.toString()
      }
    };
  }
}

/**
 * Get test payload for endpoint
 * @param {string} path - Endpoint path
 * @returns {Object} Test payload
 */
function getTestPayload(path) {
  const payloads = {
    '/api/student/register': {
      // Minimal payload that will fail validation but test endpoint availability
      test: true
    },
    '/api/rag/query': {
      query: 'health check',
      grade: 10,
      subjects: ['Mathematics']
    },
    '/api/schools/login': {
      // Minimal payload for testing
      test: true
    }
  };

  return payloads[path] || {};
}

/**
 * Store health check results in database
 * @param {Array} checks - Health check results
 * @returns {Promise<void>}
 */
async function storeHealthCheckResults(checks) {
  try {
    const records = checks.map(check => ({
      check_type: check.check_type,
      component_name: check.component_name,
      status: check.status,
      response_time: check.response_time,
      error_message: check.error_message,
      details: check.details
    }));

    const { error } = await supabase
      .from('system_health_checks')
      .insert(records);

    if (error) {
      console.error('Failed to store health check results:', error);
    }

  } catch (error) {
    console.error('Error storing health check results:', error);
  }
}

/**
 * Get recent health check results
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Health check results
 */
export async function getHealthCheckHistory(options = {}) {
  try {
    const {
      component_name,
      check_type,
      status,
      limit = 100,
      hours = 24
    } = options;

    let query = supabase
      .from('system_health_checks')
      .select('*')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (component_name) {
      query = query.eq('component_name', component_name);
    }

    if (check_type) {
      query = query.eq('check_type', check_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch health check history'
      };
    }

    // Calculate statistics
    const statistics = calculateHealthStatistics(data);

    return {
      success: true,
      data,
      statistics
    };

  } catch (error) {
    console.error('Error in getHealthCheckHistory:', error);
    return {
      success: false,
      error: 'Failed to fetch health check history'
    };
  }
}

/**
 * Calculate health statistics
 * @param {Array} checks - Health check results
 * @returns {Object} Statistics
 */
function calculateHealthStatistics(checks) {
  if (!checks || checks.length === 0) {
    return {
      total_checks: 0,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      avg_response_time: 0
    };
  }

  const stats = {
    total_checks: checks.length,
    healthy: checks.filter(c => c.status === 'healthy').length,
    degraded: checks.filter(c => c.status === 'degraded').length,
    unhealthy: checks.filter(c => c.status === 'unhealthy').length,
    avg_response_time: Math.round(
      checks.reduce((sum, c) => sum + (c.response_time || 0), 0) / checks.length
    ),
    by_component: {}
  };

  // Group by component
  checks.forEach(check => {
    if (!stats.by_component[check.component_name]) {
      stats.by_component[check.component_name] = {
        total: 0,
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
        avg_response_time: 0
      };
    }

    const component = stats.by_component[check.component_name];
    component.total++;
    component[check.status]++;
    component.avg_response_time = Math.round(
      (component.avg_response_time * (component.total - 1) + (check.response_time || 0)) / component.total
    );
  });

  return stats;
}
