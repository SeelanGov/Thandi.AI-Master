/**
 * Performance Middleware - Admin Dashboard
 * Tracks API response times and logs metrics
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Track API request performance
 * @param {Object} metricData - Performance metric data
 * @returns {Promise<Object>} Result
 */
export async function trackPerformance(metricData) {
  try {
    // Validate required fields
    const validation = validateMetricData(metricData);
    if (!validation.valid) {
      console.error('Invalid metric data:', validation.error);
      return {
        success: false,
        error: validation.error
      };
    }

    // Insert metric into database
    const { data, error } = await supabase
      .from('api_metrics')
      .insert([{
        endpoint: metricData.endpoint,
        method: metricData.method,
        response_time: metricData.response_time,
        status_code: metricData.status_code,
        user_id: metricData.user_id || null,
        school_id: metricData.school_id || null,
        error_message: metricData.error_message || null,
        metadata: metricData.metadata || {}
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log performance metric:', error);
      return {
        success: false,
        error: 'Failed to log metric to database'
      };
    }

    return {
      success: true,
      metric_id: data.id
    };

  } catch (error) {
    console.error('Error in trackPerformance:', error);
    return {
      success: false,
      error: 'Internal performance tracking failure'
    };
  }
}

/**
 * Validate metric data
 * @param {Object} metricData - Metric data to validate
 * @returns {Object} Validation result
 */
function validateMetricData(metricData) {
  if (!metricData) {
    return { valid: false, error: 'Metric data is required' };
  }

  if (!metricData.endpoint || typeof metricData.endpoint !== 'string') {
    return { valid: false, error: 'endpoint is required and must be a string' };
  }

  if (!metricData.method || typeof metricData.method !== 'string') {
    return { valid: false, error: 'method is required and must be a string' };
  }

  if (typeof metricData.response_time !== 'number' || metricData.response_time < 0) {
    return { valid: false, error: 'response_time is required and must be a positive number' };
  }

  if (typeof metricData.status_code !== 'number') {
    return { valid: false, error: 'status_code is required and must be a number' };
  }

  return { valid: true };
}

/**
 * Create performance tracking wrapper for API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with performance tracking
 */
export function withPerformanceTracking(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    let response;
    let statusCode = 200;
    let errorMessage = null;

    try {
      // Execute the handler
      response = await handler(request, context);
      
      // Extract status code from response
      if (response && response.status) {
        statusCode = response.status;
      }

    } catch (error) {
      console.error('Handler error:', error);
      statusCode = 500;
      errorMessage = error.message;
      
      // Re-throw to maintain error handling
      throw error;
      
    } finally {
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Extract endpoint and method
      const url = new URL(request.url);
      const endpoint = url.pathname;
      const method = request.method;
      
      // Extract user/school context from headers
      const userId = request.headers.get('x-user-id') || null;
      const schoolId = request.headers.get('x-school-id') || null;
      
      // Track performance (async, don't block response)
      trackPerformance({
        endpoint,
        method,
        response_time: responseTime,
        status_code: statusCode,
        user_id: userId,
        school_id: schoolId,
        error_message: errorMessage,
        metadata: {
          query_params: Object.fromEntries(url.searchParams),
          timestamp: new Date().toISOString()
        }
      }).catch(err => {
        console.error('Failed to track performance:', err);
      });
    }

    return response;
  };
}

/**
 * Extract performance data from request/response
 * @param {Object} request - Request object
 * @param {Object} response - Response object
 * @param {number} startTime - Request start time
 * @returns {Object} Performance data
 */
export function extractPerformanceData(request, response, startTime) {
  const responseTime = Date.now() - startTime;
  const url = new URL(request.url);
  
  return {
    endpoint: url.pathname,
    method: request.method,
    response_time: responseTime,
    status_code: response?.status || 200,
    user_id: request.headers.get('x-user-id') || null,
    school_id: request.headers.get('x-school-id') || null,
    metadata: {
      query_params: Object.fromEntries(url.searchParams),
      timestamp: new Date().toISOString()
    }
  };
}
