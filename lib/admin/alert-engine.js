/**
 * Alert Engine Utility
 * Evaluates system metrics against alert thresholds
 */

/**
 * Evaluate error rate threshold
 * @param {Array} errors - Array of recent errors
 * @param {Object} config - Alert configuration
 * @returns {Object} Alert evaluation result
 */
function evaluateErrorRate(errors, config) {
  if (!config || !config.enabled) {
    return { shouldAlert: false, message: 'Alert disabled' };
  }

  const threshold = config.threshold || 10;
  const timeWindow = config.time_window_minutes || 60;
  
  // Filter errors within time window
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
  const recentErrors = errors.filter(error => {
    const errorTime = new Date(error.created_at || error.timestamp);
    return errorTime >= cutoffTime;
  });

  const errorCount = recentErrors.length;
  const shouldAlert = errorCount >= threshold;

  return {
    shouldAlert,
    metric: 'error_rate',
    value: errorCount,
    threshold,
    timeWindow,
    message: shouldAlert
      ? `Error rate exceeded: ${errorCount} errors in ${timeWindow} minutes (threshold: ${threshold})`
      : `Error rate normal: ${errorCount} errors in ${timeWindow} minutes`,
    severity: config.severity || 'medium',
    errors: recentErrors
  };
}

/**
 * Evaluate performance threshold
 * @param {Array} metrics - Array of performance metrics
 * @param {Object} config - Alert configuration
 * @returns {Object} Alert evaluation result
 */
function evaluatePerformanceThreshold(metrics, config) {
  if (!config || !config.enabled) {
    return { shouldAlert: false, message: 'Alert disabled' };
  }

  const threshold = config.threshold || 1000; // Default 1000ms
  const timeWindow = config.time_window_minutes || 60;
  
  // Filter metrics within time window
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
  const recentMetrics = metrics.filter(metric => {
    const metricTime = new Date(metric.created_at || metric.timestamp);
    return metricTime >= cutoffTime;
  });

  if (recentMetrics.length === 0) {
    return { shouldAlert: false, message: 'No recent metrics' };
  }

  // Calculate average response time
  const totalResponseTime = recentMetrics.reduce((sum, m) => sum + m.response_time, 0);
  const averageResponseTime = Math.round(totalResponseTime / recentMetrics.length);

  const shouldAlert = averageResponseTime >= threshold;

  return {
    shouldAlert,
    metric: 'performance',
    value: averageResponseTime,
    threshold,
    timeWindow,
    message: shouldAlert
      ? `Performance degraded: ${averageResponseTime}ms average response time (threshold: ${threshold}ms)`
      : `Performance normal: ${averageResponseTime}ms average response time`,
    severity: config.severity || 'medium',
    metrics: recentMetrics
  };
}

/**
 * Evaluate health check failures
 * @param {Array} healthChecks - Array of health check results
 * @param {Object} config - Alert configuration
 * @returns {Object} Alert evaluation result
 */
function evaluateHealthCheckFailures(healthChecks, config) {
  if (!config || !config.enabled) {
    return { shouldAlert: false, message: 'Alert disabled' };
  }

  const threshold = config.threshold || 3; // Default 3 consecutive failures
  const timeWindow = config.time_window_minutes || 30;
  
  // Filter health checks within time window
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
  const recentChecks = healthChecks.filter(check => {
    const checkTime = new Date(check.created_at || check.timestamp);
    return checkTime >= cutoffTime;
  });

  if (recentChecks.length === 0) {
    return { shouldAlert: false, message: 'No recent health checks' };
  }

  // Count consecutive failures
  let consecutiveFailures = 0;
  let maxConsecutiveFailures = 0;
  
  // Sort by timestamp (most recent first)
  const sortedChecks = recentChecks.sort((a, b) => {
    const timeA = new Date(a.created_at || a.timestamp);
    const timeB = new Date(b.created_at || b.timestamp);
    return timeB - timeA;
  });

  for (const check of sortedChecks) {
    if (check.status === 'unhealthy') {
      consecutiveFailures++;
      maxConsecutiveFailures = Math.max(maxConsecutiveFailures, consecutiveFailures);
    } else {
      consecutiveFailures = 0;
    }
  }

  const shouldAlert = maxConsecutiveFailures >= threshold;

  return {
    shouldAlert,
    metric: 'health_check_failures',
    value: maxConsecutiveFailures,
    threshold,
    timeWindow,
    message: shouldAlert
      ? `Health check failures: ${maxConsecutiveFailures} consecutive failures (threshold: ${threshold})`
      : `Health checks normal: ${maxConsecutiveFailures} consecutive failures`,
    severity: config.severity || 'high',
    healthChecks: recentChecks
  };
}

/**
 * Evaluate all alert conditions
 * @param {Object} data - System data (errors, metrics, healthChecks)
 * @param {Array} alertConfigs - Array of alert configurations
 * @returns {Promise<Array>} Array of alert evaluation results
 */
async function evaluateAllAlerts(data, alertConfigs) {
  const results = [];

  for (const config of alertConfigs) {
    if (!config.enabled) {
      continue;
    }

    let evaluation;
    switch (config.metric_type) {
      case 'error_rate':
        evaluation = evaluateErrorRate(data.errors || [], config);
        break;
      case 'performance':
        evaluation = evaluatePerformanceThreshold(data.metrics || [], config);
        break;
      case 'health_check_failures':
        evaluation = evaluateHealthCheckFailures(data.healthChecks || [], config);
        break;
      default:
        evaluation = { shouldAlert: false, message: 'Unknown metric type' };
    }

    if (evaluation.shouldAlert) {
      results.push({
        configId: config.id,
        configName: config.name,
        ...evaluation,
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

/**
 * Create alert record
 * @param {Object} supabase - Supabase client
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} Created alert record
 */
async function createAlert(supabase, alertData) {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .insert({
        config_id: alertData.configId,
        metric_type: alertData.metric,
        metric_value: alertData.value,
        threshold_value: alertData.threshold,
        severity: alertData.severity,
        message: alertData.message,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, alert: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Resolve alert
 * @param {Object} supabase - Supabase client
 * @param {string} alertId - Alert ID
 * @returns {Promise<Object>} Result
 */
async function resolveAlert(supabase, alertId) {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, alert: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  evaluateErrorRate,
  evaluatePerformanceThreshold,
  evaluateHealthCheckFailures,
  evaluateAllAlerts,
  createAlert,
  resolveAlert
};
