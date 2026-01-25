/**
 * Health Checker Utility
 * Performs health checks on system components
 */

/**
 * Check database connectivity
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Health check result
 */
async function checkDatabase(supabase) {
  const startTime = Date.now();
  
  try {
    // Simple query to test database connectivity - use a table we know exists
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        component: 'database',
        status: 'unhealthy',
        responseTime,
        message: `Database error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      component: 'database',
      status: 'healthy',
      responseTime,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Database check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check API endpoint health
 * @param {string} endpoint - API endpoint to check
 * @param {string} method - HTTP method (default: 'GET')
 * @returns {Promise<Object>} Health check result
 */
async function checkAPIEndpoint(endpoint, method = 'GET') {
  const startTime = Date.now();
  
  try {
    // Use absolute URL for Node.js environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;
    const isHealthy = response.status >= 200 && response.status < 500;

    return {
      component: `api_${endpoint}`,
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode: response.status,
      message: isHealthy
        ? `API endpoint responding (${response.status})`
        : `API endpoint error (${response.status})`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: `api_${endpoint}`,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `API check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check RAG system health
 * @returns {Promise<Object>} Health check result
 */
async function checkRAGSystem() {
  const startTime = Date.now();
  
  try {
    // Use absolute URL for Node.js environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}/api/rag/query`;
    
    // Check if RAG endpoint is accessible
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'health check',
        context: {}
      })
    });

    const responseTime = Date.now() - startTime;
    const isHealthy = response.status >= 200 && response.status < 500;

    return {
      component: 'rag_system',
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode: response.status,
      message: isHealthy
        ? 'RAG system responding'
        : `RAG system error (${response.status})`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'rag_system',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `RAG system check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run all health checks
 * @param {Object} supabase - Supabase client
 * @returns {Promise<Object>} Combined health check results
 */
async function runAllHealthChecks(supabase) {
  const checks = await Promise.all([
    checkDatabase(supabase),
    checkAPIEndpoint('/api/health'),
    checkRAGSystem()
  ]);

  const allHealthy = checks.every(check => check.status === 'healthy');
  const overallStatus = allHealthy ? 'healthy' : 'degraded';

  return {
    overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    summary: {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    }
  };
}

/**
 * Run health checks for specific components
 * @param {Array<string>} components - Array of component names to check
 * @returns {Promise<Array>} Array of health check results
 */
async function runHealthChecks(components = ['database', 'api', 'rag']) {
  const { createClient } = require('@/lib/supabase/server');
  const supabase = createClient();
  
  const checks = [];
  
  for (const component of components) {
    switch (component) {
      case 'database':
        checks.push(checkDatabase(supabase));
        break;
      case 'api':
        checks.push(checkAPIEndpoint('/api/health'));
        break;
      case 'rag':
        checks.push(checkRAGSystem());
        break;
      default:
        console.warn(`Unknown component: ${component}`);
    }
  }
  
  const results = await Promise.all(checks);
  
  // Normalize component names
  return results.map(result => ({
    ...result,
    component: result.component.replace('api_/api/health', 'api').replace('rag_system', 'rag')
  }));
}

/**
 * Calculate health check statistics
 * @param {Array} healthChecks - Array of health check records
 * @returns {Object} Health statistics
 */
function calculateHealthStatistics(healthChecks) {
  if (!healthChecks || healthChecks.length === 0) {
    return {
      totalChecks: 0,
      healthyChecks: 0,
      unhealthyChecks: 0,
      uptimePercentage: 0,
      averageResponseTime: 0
    };
  }

  const healthyChecks = healthChecks.filter(c => c.status === 'healthy').length;
  const unhealthyChecks = healthChecks.filter(c => c.status === 'unhealthy').length;
  const uptimePercentage = Math.round((healthyChecks / healthChecks.length) * 100);

  const responseTimes = healthChecks
    .filter(c => c.response_time)
    .map(c => c.response_time);
  
  const averageResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    : 0;

  return {
    totalChecks: healthChecks.length,
    healthyChecks,
    unhealthyChecks,
    uptimePercentage,
    averageResponseTime
  };
}

/**
 * Calculate uptime percentage for a component
 * @param {Object} supabase - Supabase client
 * @param {string} component - Component name
 * @returns {Promise<Object>} Uptime statistics
 */
async function calculateUptime(supabase, component) {
  try {
    const { data: healthChecks, error } = await supabase
      .from('system_health_checks')
      .select('*')
      .eq('component', component)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !healthChecks) {
      return {
        percentage: 0,
        totalChecks: 0,
        healthyChecks: 0
      };
    }

    const totalChecks = healthChecks.length;
    const healthyChecks = healthChecks.filter(c => c.status === 'healthy').length;
    const percentage = totalChecks > 0 ? Math.round((healthyChecks / totalChecks) * 100) : 0;

    return {
      percentage,
      totalChecks,
      healthyChecks
    };
  } catch (error) {
    return {
      percentage: 0,
      totalChecks: 0,
      healthyChecks: 0
    };
  }
}

/**
 * Detect unhealthy components from health checks
 * @param {Array} healthChecks - Array of health check results
 * @returns {Array} Array of unhealthy components
 */
function detectUnhealthyComponents(healthChecks) {
  if (!healthChecks || healthChecks.length === 0) {
    return [];
  }

  return healthChecks.filter(check => check.status === 'unhealthy');
}

module.exports = {
  checkDatabase,
  checkAPIEndpoint,
  checkRAGSystem,
  runAllHealthChecks,
  runHealthChecks,
  calculateHealthStatistics,
  calculateUptime,
  detectUnhealthyComponents
};
