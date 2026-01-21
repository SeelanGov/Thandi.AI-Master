/**
 * Alert Engine - Admin Dashboard
 * Evaluates alert thresholds and triggers notifications
 * Created: January 20, 2026
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Evaluate all active alert configurations
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateAlerts() {
  const results = {
    alerts_checked: 0,
    alerts_triggered: 0,
    triggered_alerts: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Get all enabled alert configurations
    const { data: configs, error } = await supabase
      .from('alert_configurations')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error('Failed to fetch alert configurations:', error);
      return {
        success: false,
        error: 'Failed to fetch alert configurations'
      };
    }

    if (!configs || configs.length === 0) {
      return {
        success: true,
        data: results,
        message: 'No active alert configurations'
      };
    }

    results.alerts_checked = configs.length;

    // Evaluate each alert configuration
    for (const config of configs) {
      const triggered = await evaluateAlertConfig(config);
      if (triggered) {
        results.alerts_triggered++;
        results.triggered_alerts.push(triggered);
      }
    }

    return {
      success: true,
      data: results
    };

  } catch (error) {
    console.error('Error in evaluateAlerts:', error);
    return {
      success: false,
      error: 'Failed to evaluate alerts',
      details: error.message
    };
  }
}

/**
 * Evaluate a single alert configuration
 * @param {Object} config - Alert configuration
 * @returns {Promise<Object|null>} Triggered alert or null
 */
async function evaluateAlertConfig(config) {
  try {
    const { alert_type, threshold_value, time_window } = config;

    let triggered = false;
    let currentValue = 0;
    let message = '';
    let severity = 'info';
    let metadata = {};

    switch (alert_type) {
      case 'error_rate':
        ({ triggered, currentValue, message, severity, metadata } = 
          await checkErrorRate(threshold_value, time_window));
        break;

      case 'performance_degradation':
        ({ triggered, currentValue, message, severity, metadata } = 
          await checkPerformanceDegradation(threshold_value, time_window));
        break;

      case 'health_check_failure':
        ({ triggered, currentValue, message, severity, metadata } = 
          await checkHealthCheckFailures(threshold_value, time_window));
        break;

      default:
        console.warn(`Unknown alert type: ${alert_type}`);
        return null;
    }

    if (triggered) {
      // Check if alert already exists and is active
      const existingAlert = await getActiveAlert(config.id, alert_type);
      
      if (existingAlert) {
        // Alert already active, don't create duplicate
        return null;
      }

      // Create alert history record
      const alert = await createAlert({
        alert_config_id: config.id,
        alert_type,
        message,
        severity,
        metadata: {
          ...metadata,
          threshold_value,
          current_value: currentValue,
          time_window,
          recipients: config.recipients
        }
      });

      return alert;
    }

    return null;

  } catch (error) {
    console.error('Error evaluating alert config:', error);
    return null;
  }
}

/**
 * Check error rate threshold
 * @param {number} threshold - Threshold percentage
 * @param {number} timeWindow - Time window in minutes
 * @returns {Promise<Object>} Check result
 */
async function checkErrorRate(threshold, timeWindow) {
  try {
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    // Get total API requests
    const { count: totalRequests } = await supabase
      .from('api_metrics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startTime.toISOString());

    // Get error count (status >= 500)
    const { count: errorCount } = await supabase
      .from('api_metrics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startTime.toISOString())
      .gte('status_code', 500);

    if (!totalRequests || totalRequests === 0) {
      return {
        triggered: false,
        currentValue: 0,
        message: '',
        severity: 'info',
        metadata: {}
      };
    }

    const errorRate = (errorCount / totalRequests) * 100;
    const triggered = errorRate >= threshold;

    return {
      triggered,
      currentValue: errorRate,
      message: triggered 
        ? `Error rate ${errorRate.toFixed(2)}% exceeds threshold ${threshold}% (${errorCount}/${totalRequests} requests failed)`
        : '',
      severity: errorRate >= threshold * 2 ? 'critical' : 'warning',
      metadata: {
        total_requests: totalRequests,
        error_count: errorCount,
        error_rate: errorRate,
        time_window_minutes: timeWindow
      }
    };

  } catch (error) {
    console.error('Error checking error rate:', error);
    return {
      triggered: false,
      currentValue: 0,
      message: '',
      severity: 'info',
      metadata: { error: error.message }
    };
  }
}

/**
 * Check performance degradation threshold
 * @param {number} threshold - Threshold in milliseconds
 * @param {number} timeWindow - Time window in minutes
 * @returns {Promise<Object>} Check result
 */
async function checkPerformanceDegradation(threshold, timeWindow) {
  try {
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    // Get average response time
    const { data: metrics, error } = await supabase
      .from('api_metrics')
      .select('response_time')
      .gte('created_at', startTime.toISOString());

    if (error || !metrics || metrics.length === 0) {
      return {
        triggered: false,
        currentValue: 0,
        message: '',
        severity: 'info',
        metadata: {}
      };
    }

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.response_time, 0) / metrics.length;
    const triggered = avgResponseTime >= threshold;

    // Find slowest endpoints
    const { data: slowEndpoints } = await supabase
      .from('api_metrics')
      .select('endpoint, response_time')
      .gte('created_at', startTime.toISOString())
      .gte('response_time', threshold)
      .order('response_time', { ascending: false })
      .limit(5);

    return {
      triggered,
      currentValue: avgResponseTime,
      message: triggered 
        ? `Average response time ${Math.round(avgResponseTime)}ms exceeds threshold ${threshold}ms`
        : '',
      severity: avgResponseTime >= threshold * 2 ? 'critical' : 'warning',
      metadata: {
        avg_response_time: Math.round(avgResponseTime),
        total_requests: metrics.length,
        slow_endpoints: slowEndpoints || [],
        time_window_minutes: timeWindow
      }
    };

  } catch (error) {
    console.error('Error checking performance degradation:', error);
    return {
      triggered: false,
      currentValue: 0,
      message: '',
      severity: 'info',
      metadata: { error: error.message }
    };
  }
}

/**
 * Check health check failures threshold
 * @param {number} threshold - Threshold count of failures
 * @param {number} timeWindow - Time window in minutes
 * @returns {Promise<Object>} Check result
 */
async function checkHealthCheckFailures(threshold, timeWindow) {
  try {
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);

    // Get unhealthy health checks
    const { data: failures, error } = await supabase
      .from('system_health_checks')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .eq('status', 'unhealthy');

    if (error) {
      return {
        triggered: false,
        currentValue: 0,
        message: '',
        severity: 'info',
        metadata: { error: error.message }
      };
    }

    const failureCount = failures?.length || 0;
    const triggered = failureCount >= threshold;

    // Group failures by component
    const failuresByComponent = {};
    if (failures) {
      failures.forEach(failure => {
        if (!failuresByComponent[failure.component_name]) {
          failuresByComponent[failure.component_name] = 0;
        }
        failuresByComponent[failure.component_name]++;
      });
    }

    return {
      triggered,
      currentValue: failureCount,
      message: triggered 
        ? `${failureCount} health check failures exceed threshold ${threshold}`
        : '',
      severity: failureCount >= threshold * 2 ? 'critical' : 'warning',
      metadata: {
        failure_count: failureCount,
        failures_by_component: failuresByComponent,
        time_window_minutes: timeWindow,
        recent_failures: failures?.slice(0, 5) || []
      }
    };

  } catch (error) {
    console.error('Error checking health check failures:', error);
    return {
      triggered: false,
      currentValue: 0,
      message: '',
      severity: 'info',
      metadata: { error: error.message }
    };
  }
}

/**
 * Check if alert is already active
 * @param {string} configId - Alert configuration ID
 * @param {string} alertType - Alert type
 * @returns {Promise<Object|null>} Active alert or null
 */
async function getActiveAlert(configId, alertType) {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
      .eq('alert_config_id', configId)
      .eq('alert_type', alertType)
      .eq('status', 'active')
      .order('triggered_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking active alert:', error);
      return null;
    }

    return data;

  } catch (error) {
    console.error('Error in getActiveAlert:', error);
    return null;
  }
}

/**
 * Create alert history record
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} Created alert
 */
async function createAlert(alertData) {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .insert([alertData])
      .select()
      .single();

    if (error) {
      console.error('Failed to create alert:', error);
      return null;
    }

    return data;

  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
}

/**
 * Resolve an alert
 * @param {string} alertId - Alert ID
 * @param {string} resolvedBy - Admin user ID
 * @returns {Promise<Object>} Result
 */
export async function resolveAlert(alertId, resolvedBy = null) {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: 'Failed to resolve alert'
      };
    }

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Error resolving alert:', error);
    return {
      success: false,
      error: 'Failed to resolve alert',
      details: error.message
    };
  }
}

/**
 * Get alert history
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Alert history
 */
export async function getAlertHistory(options = {}) {
  try {
    const {
      alert_type,
      severity,
      status,
      limit = 100,
      hours = 24
    } = options;

    let query = supabase
      .from('alert_history')
      .select('*')
      .gte('triggered_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (alert_type) {
      query = query.eq('alert_type', alert_type);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch alert history'
      };
    }

    // Calculate statistics
    const statistics = calculateAlertStatistics(data);

    return {
      success: true,
      data,
      statistics
    };

  } catch (error) {
    console.error('Error in getAlertHistory:', error);
    return {
      success: false,
      error: 'Failed to fetch alert history'
    };
  }
}

/**
 * Calculate alert statistics
 * @param {Array} alerts - Alert history
 * @returns {Object} Statistics
 */
function calculateAlertStatistics(alerts) {
  if (!alerts || alerts.length === 0) {
    return {
      total_alerts: 0,
      active: 0,
      resolved: 0,
      by_severity: { info: 0, warning: 0, critical: 0 },
      by_type: {}
    };
  }

  const stats = {
    total_alerts: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    by_severity: {
      info: alerts.filter(a => a.severity === 'info').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      critical: alerts.filter(a => a.severity === 'critical').length
    },
    by_type: {}
  };

  // Group by type
  alerts.forEach(alert => {
    if (!stats.by_type[alert.alert_type]) {
      stats.by_type[alert.alert_type] = 0;
    }
    stats.by_type[alert.alert_type]++;
  });

  return stats;
}
