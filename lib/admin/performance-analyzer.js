/**
 * Performance Analyzer - Admin Dashboard
 * Analyzes API performance metrics and calculates statistics
 * Created: January 19, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Calculate performance statistics
 * @param {Array} metrics - Array of metric objects
 * @returns {Object} Statistics
 */
export function calculateStatistics(metrics) {
  if (!metrics || metrics.length === 0) {
    return {
      total_requests: 0,
      average_response_time: 0,
      median_response_time: 0,
      p95_response_time: 0,
      p99_response_time: 0,
      min_response_time: 0,
      max_response_time: 0,
      error_rate: 0
    };
  }

  // Sort response times
  const responseTimes = metrics.map(m => m.response_time).sort((a, b) => a - b);
  const totalRequests = metrics.length;
  
  // Calculate average
  const sum = responseTimes.reduce((acc, val) => acc + val, 0);
  const average = Math.round(sum / totalRequests);
  
  // Calculate median
  const median = calculatePercentile(responseTimes, 50);
  
  // Calculate percentiles
  const p95 = calculatePercentile(responseTimes, 95);
  const p99 = calculatePercentile(responseTimes, 99);
  
  // Calculate min/max
  const min = responseTimes[0];
  const max = responseTimes[responseTimes.length - 1];
  
  // Calculate error rate
  const errorCount = metrics.filter(m => m.status_code >= 400).length;
  const errorRate = ((errorCount / totalRequests) * 100).toFixed(2);
  
  return {
    total_requests: totalRequests,
    average_response_time: average,
    median_response_time: median,
    p95_response_time: p95,
    p99_response_time: p99,
    min_response_time: min,
    max_response_time: max,
    error_rate: parseFloat(errorRate)
  };
}

/**
 * Calculate percentile from sorted array
 * @param {Array} sortedArray - Sorted array of numbers
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Group metrics by endpoint
 * @param {Array} metrics - Array of metric objects
 * @returns {Array} Grouped metrics with statistics
 */
export function groupByEndpoint(metrics) {
  if (!metrics || metrics.length === 0) {
    return [];
  }

  // Group by endpoint
  const grouped = metrics.reduce((acc, metric) => {
    if (!acc[metric.endpoint]) {
      acc[metric.endpoint] = [];
    }
    acc[metric.endpoint].push(metric);
    return acc;
  }, {});

  // Calculate statistics for each endpoint
  return Object.entries(grouped).map(([endpoint, endpointMetrics]) => {
    const stats = calculateStatistics(endpointMetrics);
    return {
      endpoint,
      method: endpointMetrics[0].method,
      ...stats
    };
  }).sort((a, b) => b.total_requests - a.total_requests);
}

/**
 * Identify slow endpoints (>500ms average)
 * @param {Array} metrics - Array of metric objects
 * @param {number} threshold - Response time threshold in ms (default: 500)
 * @returns {Array} Slow endpoints
 */
export function identifySlowEndpoints(metrics, threshold = 500) {
  const grouped = groupByEndpoint(metrics);
  
  return grouped
    .filter(endpoint => endpoint.average_response_time > threshold)
    .map(endpoint => ({
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      average_response_time: endpoint.average_response_time,
      threshold,
      slowness_factor: (endpoint.average_response_time / threshold).toFixed(2)
    }))
    .sort((a, b) => b.average_response_time - a.average_response_time);
}

/**
 * Query performance metrics from database
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Metrics
 */
export async function queryMetrics(filters = {}) {
  try {
    let query = supabase
      .from('api_metrics')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    if (filters.endpoint) {
      query = query.eq('endpoint', filters.endpoint);
    }

    if (filters.method) {
      query = query.eq('method', filters.method);
    }

    if (filters.school_id) {
      query = query.eq('school_id', filters.school_id);
    }

    if (filters.min_response_time) {
      query = query.gte('response_time', filters.min_response_time);
    }

    if (filters.status_code) {
      query = query.eq('status_code', filters.status_code);
    }

    // Apply pagination
    const limit = filters.limit || 1000;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query metrics:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Error in queryMetrics:', error);
    return [];
  }
}

/**
 * Calculate performance trends over time
 * @param {Array} metrics - Array of metric objects
 * @param {string} interval - Time interval ('hourly', 'daily', 'weekly')
 * @returns {Array} Trend data
 */
export function calculateTrends(metrics, interval = 'hourly') {
  if (!metrics || metrics.length === 0) {
    return [];
  }

  // Group by time interval
  const grouped = metrics.reduce((acc, metric) => {
    const timestamp = new Date(metric.created_at);
    let key;

    switch (interval) {
      case 'hourly':
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:00`;
        break;
      case 'daily':
        key = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}`;
        break;
      case 'weekly':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        break;
      default:
        key = timestamp.toISOString();
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(metric);
    return acc;
  }, {});

  // Calculate statistics for each time period
  return Object.entries(grouped)
    .map(([timestamp, periodMetrics]) => ({
      timestamp,
      ...calculateStatistics(periodMetrics)
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Detect performance degradation
 * @param {Array} currentMetrics - Current period metrics
 * @param {Array} baselineMetrics - Baseline period metrics
 * @param {number} threshold - Degradation threshold percentage (default: 50)
 * @returns {Object} Degradation analysis
 */
export function detectDegradation(currentMetrics, baselineMetrics, threshold = 50) {
  const currentStats = calculateStatistics(currentMetrics);
  const baselineStats = calculateStatistics(baselineMetrics);

  if (baselineStats.average_response_time === 0) {
    return {
      degraded: false,
      message: 'No baseline data available'
    };
  }

  const percentageChange = ((currentStats.average_response_time - baselineStats.average_response_time) / baselineStats.average_response_time) * 100;

  const degraded = percentageChange > threshold;

  return {
    degraded,
    current_avg: currentStats.average_response_time,
    baseline_avg: baselineStats.average_response_time,
    percentage_change: Math.round(percentageChange),
    threshold,
    message: degraded 
      ? `Performance degraded by ${Math.round(percentageChange)}% (threshold: ${threshold}%)`
      : `Performance within acceptable range (${Math.round(percentageChange)}% change)`
  };
}

/**
 * Get performance summary
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Performance summary
 */
export async function getPerformanceSummary(filters = {}) {
  try {
    const metrics = await queryMetrics(filters);

    if (metrics.length === 0) {
      return {
        summary: calculateStatistics([]),
        by_endpoint: [],
        slow_endpoints: [],
        trends: []
      };
    }

    const summary = calculateStatistics(metrics);
    const byEndpoint = groupByEndpoint(metrics);
    const slowEndpoints = identifySlowEndpoints(metrics, filters.slow_threshold || 500);
    const trends = calculateTrends(metrics, filters.trend_interval || 'hourly');

    return {
      summary,
      by_endpoint: byEndpoint,
      slow_endpoints: slowEndpoints,
      trends
    };

  } catch (error) {
    console.error('Error in getPerformanceSummary:', error);
    return {
      summary: calculateStatistics([]),
      by_endpoint: [],
      slow_endpoints: [],
      trends: []
    };
  }
}
