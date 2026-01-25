/**
 * Performance Analyzer Utility
 * Analyzes API performance metrics for the admin dashboard
 */

/**
 * Calculate statistics from performance metrics
 * @param {Array} metrics - Array of performance metrics
 * @returns {Object} Statistics including average, median, p95, p99
 */
function calculateStatistics(metrics) {
  if (!metrics || metrics.length === 0) {
    return {
      average: 0,
      median: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }

  const responseTimes = metrics.map(m => m.response_time).sort((a, b) => a - b);
  const count = responseTimes.length;

  // Calculate average
  const sum = responseTimes.reduce((acc, val) => acc + val, 0);
  const average = Math.round(sum / count);

  // Calculate median
  const median = count % 2 === 0
    ? Math.round((responseTimes[count / 2 - 1] + responseTimes[count / 2]) / 2)
    : responseTimes[Math.floor(count / 2)];

  // Calculate percentiles
  const p95Index = Math.ceil(count * 0.95) - 1;
  const p99Index = Math.ceil(count * 0.99) - 1;
  const p95 = responseTimes[p95Index] || responseTimes[count - 1];
  const p99 = responseTimes[p99Index] || responseTimes[count - 1];

  return {
    average,
    median,
    p95,
    p99,
    min: responseTimes[0],
    max: responseTimes[count - 1],
    count
  };
}

/**
 * Identify slow endpoints (>500ms)
 * @param {Array} metrics - Array of performance metrics
 * @param {number} threshold - Threshold in milliseconds (default: 500)
 * @returns {Array} Array of slow endpoints with statistics
 */
function identifySlowEndpoints(metrics, threshold = 500) {
  if (!metrics || metrics.length === 0) {
    return [];
  }

  // Group by endpoint
  const endpointGroups = {};
  metrics.forEach(metric => {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!endpointGroups[key]) {
      endpointGroups[key] = [];
    }
    endpointGroups[key].push(metric);
  });

  // Calculate stats for each endpoint and filter slow ones
  const slowEndpoints = [];
  Object.entries(endpointGroups).forEach(([endpoint, endpointMetrics]) => {
    const stats = calculateStatistics(endpointMetrics);
    if (stats.average > threshold) {
      const [method, path] = endpoint.split(' ');
      slowEndpoints.push({
        endpoint: path,
        method,
        ...stats
      });
    }
  });

  // Sort by average response time (slowest first)
  return slowEndpoints.sort((a, b) => b.average - a.average);
}

/**
 * Calculate performance trends over time
 * @param {Array} metrics - Array of performance metrics with timestamps
 * @param {string} interval - Time interval ('hourly', 'daily', 'weekly')
 * @returns {Array} Array of trend data points
 */
function calculateTrends(metrics, interval = 'hourly') {
  if (!metrics || metrics.length === 0) {
    return [];
  }

  // Group metrics by time interval
  const groups = {};
  metrics.forEach(metric => {
    const timestamp = new Date(metric.timestamp || metric.created_at);
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

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(metric);
  });

  // Calculate statistics for each time period
  const trends = Object.entries(groups).map(([timestamp, groupMetrics]) => ({
    timestamp,
    ...calculateStatistics(groupMetrics)
  }));

  // Sort by timestamp
  return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Detect performance degradation
 * @param {Array} trends - Array of trend data points
 * @param {number} threshold - Degradation threshold percentage (default: 50)
 * @returns {Object} Degradation analysis
 */
function detectPerformanceDegradation(trends, threshold = 50) {
  if (!trends || trends.length < 2) {
    return {
      isDegraded: false,
      degradationPercentage: 0,
      message: 'Insufficient data for degradation analysis'
    };
  }

  // Compare recent average to baseline
  const recentTrends = trends.slice(-5); // Last 5 data points
  const baselineTrends = trends.slice(0, Math.min(5, trends.length - 5)); // First 5 data points

  if (baselineTrends.length === 0) {
    return {
      isDegraded: false,
      degradationPercentage: 0,
      message: 'Insufficient baseline data'
    };
  }

  const recentAvg = recentTrends.reduce((sum, t) => sum + t.average, 0) / recentTrends.length;
  const baselineAvg = baselineTrends.reduce((sum, t) => sum + t.average, 0) / baselineTrends.length;

  const degradationPercentage = ((recentAvg - baselineAvg) / baselineAvg) * 100;
  const isDegraded = degradationPercentage > threshold;

  return {
    isDegraded,
    degradationPercentage: Math.round(degradationPercentage),
    recentAverage: Math.round(recentAvg),
    baselineAverage: Math.round(baselineAvg),
    message: isDegraded
      ? `Performance degraded by ${Math.round(degradationPercentage)}%`
      : 'Performance is stable'
  };
}

module.exports = {
  calculateStatistics,
  identifySlowEndpoints,
  calculateTrends,
  detectPerformanceDegradation
};
