/**
 * Admin Dashboard Overview API
 * Aggregates all key metrics for the dashboard
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple API key authentication
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || !validKey) {
    return false;
  }
  
  return apiKey === validKey;
}

export async function GET(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    
    // Get time ranges
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch error metrics
    const { data: recentErrors, error: errorsError } = await supabase
      .from('system_errors')
      .select('*')
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: false });

    // Fetch performance metrics
    const { data: performanceMetrics, error: perfError } = await supabase
      .from('api_metrics')
      .select('*')
      .gte('created_at', last24Hours.toISOString());

    // Fetch activity metrics
    const { data: activityMetrics, error: activityError } = await supabase
      .from('user_activity')
      .select('*')
      .gte('created_at', last24Hours.toISOString());

    // Fetch health checks
    const { data: healthChecks, error: healthError } = await supabase
      .from('system_health_checks')
      .select('*')
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch active alerts
    const { data: activeAlerts, error: alertsError } = await supabase
      .from('alert_history')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Calculate error metrics
    const errorCount = recentErrors?.length || 0;
    const criticalErrors = recentErrors?.filter(e => e.severity === 'critical').length || 0;
    const errorRate = errorCount; // errors per 24 hours

    // Calculate performance metrics
    const avgResponseTime = performanceMetrics?.length > 0
      ? Math.round(performanceMetrics.reduce((sum, m) => sum + m.response_time, 0) / performanceMetrics.length)
      : 0;
    
    const slowRequests = performanceMetrics?.filter(m => m.response_time > 1000).length || 0;

    // Calculate activity metrics
    const uniqueUsers = new Set(activityMetrics?.map(a => a.user_id || a.session_id)).size;
    const totalEvents = activityMetrics?.length || 0;

    // Calculate health status
    const latestHealthCheck = healthChecks?.[0];
    const systemStatus = latestHealthCheck?.status || 'unknown';
    const unhealthyComponents = healthChecks?.filter(h => h.status === 'unhealthy').length || 0;

    // Calculate alert metrics
    const activeAlertCount = activeAlerts?.length || 0;
    const criticalAlertCount = activeAlerts?.filter(a => a.severity === 'critical').length || 0;

    // Build response
    const overview = {
      timestamp: now.toISOString(),
      timeRange: '24 hours',
      
      errors: {
        total: errorCount,
        critical: criticalErrors,
        rate: errorRate,
        trend: 'stable', // TODO: Calculate trend
        recentErrors: recentErrors?.slice(0, 5) || []
      },
      
      performance: {
        avgResponseTime,
        slowRequests,
        totalRequests: performanceMetrics?.length || 0,
        trend: 'stable' // TODO: Calculate trend
      },
      
      activity: {
        activeUsers: uniqueUsers,
        totalEvents,
        trend: 'stable' // TODO: Calculate trend
      },
      
      health: {
        status: systemStatus,
        unhealthyComponents,
        lastCheck: latestHealthCheck?.created_at || null,
        checks: healthChecks || []
      },
      
      alerts: {
        active: activeAlertCount,
        critical: criticalAlertCount,
        recent: activeAlerts?.slice(0, 5) || []
      }
    };

    return NextResponse.json(overview, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
