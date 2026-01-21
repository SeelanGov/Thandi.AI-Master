import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Validate API key
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === process.env.ADMIN_API_KEY;
}

export async function GET(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // 1. Get error metrics
    const { data: errors24h, error: errorsError } = await supabase
      .from('system_errors')
      .select('id, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .eq('resolved', false);

    const { data: errors48h } = await supabase
      .from('system_errors')
      .select('id')
      .gte('created_at', fortyEightHoursAgo.toISOString())
      .lt('created_at', twentyFourHoursAgo.toISOString())
      .eq('resolved', false);

    const errorCount24h = errors24h?.length || 0;
    const errorCount48h = errors48h?.length || 0;
    const errorTrend = errorCount48h > 0 
      ? Math.round(((errorCount24h - errorCount48h) / errorCount48h) * 100)
      : 0;

    // 2. Get performance metrics
    const { data: metrics24h } = await supabase
      .from('api_metrics')
      .select('response_time, status_code')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    const { data: metrics48h } = await supabase
      .from('api_metrics')
      .select('response_time')
      .gte('created_at', fortyEightHoursAgo.toISOString())
      .lt('created_at', twentyFourHoursAgo.toISOString());

    const avgResponseTime24h = metrics24h?.length > 0
      ? Math.round(metrics24h.reduce((sum, m) => sum + m.response_time, 0) / metrics24h.length)
      : 0;

    const avgResponseTime48h = metrics48h?.length > 0
      ? Math.round(metrics48h.reduce((sum, m) => sum + m.response_time, 0) / metrics48h.length)
      : 0;

    const performanceTrend = avgResponseTime48h > 0
      ? Math.round(((avgResponseTime24h - avgResponseTime48h) / avgResponseTime48h) * 100)
      : 0;

    const successfulRequests = metrics24h?.filter(m => m.status_code >= 200 && m.status_code < 300).length || 0;
    const totalRequests = metrics24h?.length || 0;
    const apiSuccessRate = totalRequests > 0
      ? Math.round((successfulRequests / totalRequests) * 100 * 10) / 10
      : 100;

    // 3. Get activity metrics
    const { data: activity24h } = await supabase
      .from('user_activity')
      .select('user_id, event_type')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    const { data: activity48h } = await supabase
      .from('user_activity')
      .select('user_id')
      .gte('created_at', fortyEightHoursAgo.toISOString())
      .lt('created_at', twentyFourHoursAgo.toISOString());

    const uniqueUsers24h = new Set(activity24h?.map(a => a.user_id).filter(Boolean)).size;
    const uniqueUsers48h = new Set(activity48h?.map(a => a.user_id).filter(Boolean)).size;
    const activityTrend = uniqueUsers48h > 0
      ? Math.round(((uniqueUsers24h - uniqueUsers48h) / uniqueUsers48h) * 100)
      : 0;

    // 4. Get system health
    const { data: latestHealth } = await supabase
      .from('system_health_checks')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const { data: healthChecks24h } = await supabase
      .from('system_health_checks')
      .select('status')
      .gte('created_at', twentyFourHoursAgo.toISOString());

    const healthyChecks = healthChecks24h?.filter(h => h.status === 'healthy').length || 0;
    const totalChecks = healthChecks24h?.length || 0;
    const uptime = totalChecks > 0
      ? Math.round((healthyChecks / totalChecks) * 100 * 10) / 10
      : 100;

    // 5. Get active alerts
    const { data: activeAlerts } = await supabase
      .from('alert_history')
      .select('id, severity')
      .eq('status', 'active');

    const criticalAlerts = activeAlerts?.filter(a => a.severity === 'critical').length || 0;
    const warningAlerts = activeAlerts?.filter(a => a.severity === 'warning').length || 0;

    // Determine status for each metric
    const getErrorStatus = () => {
      if (errorCount24h === 0) return 'good';
      if (errorCount24h < 5) return 'good';
      if (errorCount24h < 20) return 'warning';
      return 'critical';
    };

    const getPerformanceStatus = () => {
      if (avgResponseTime24h < 300) return 'good';
      if (avgResponseTime24h < 500) return 'warning';
      return 'critical';
    };

    const getActivityStatus = () => {
      if (activityTrend > 0) return 'good';
      if (activityTrend === 0) return 'stable';
      return 'warning';
    };

    const getHealthStatus = () => {
      if (uptime >= 99) return 'good';
      if (uptime >= 95) return 'warning';
      return 'critical';
    };

    const getAlertStatus = () => {
      if (criticalAlerts > 0) return 'critical';
      if (warningAlerts > 0) return 'warning';
      return 'good';
    };

    const getSuccessRateStatus = () => {
      if (apiSuccessRate >= 99) return 'good';
      if (apiSuccessRate >= 95) return 'warning';
      return 'critical';
    };

    // Build response
    const response = {
      success: true,
      data: {
        errors: {
          count: errorCount24h,
          trend: errorTrend,
          status: getErrorStatus(),
        },
        performance: {
          avgResponseTime: avgResponseTime24h,
          trend: performanceTrend,
          status: getPerformanceStatus(),
        },
        activity: {
          activeUsers: uniqueUsers24h,
          trend: activityTrend,
          status: getActivityStatus(),
        },
        health: {
          status: latestHealth?.[0]?.status || 'unknown',
          uptime: uptime,
          lastCheck: latestHealth?.[0]?.created_at || null,
        },
        alerts: {
          active: activeAlerts?.length || 0,
          critical: criticalAlerts,
          warning: warningAlerts,
          status: getAlertStatus(),
        },
        apiSuccessRate: {
          rate: apiSuccessRate,
          status: getSuccessRateStatus(),
        },
      },
      timestamp: now.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard overview',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
