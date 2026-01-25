import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/health
 * 
 * Get system health status and recent health check results
 * 
 * Query Parameters:
 * - limit: Number of recent checks to return (default: 10)
 * - component: Filter by component (database, api, rag)
 * - status: Filter by status (healthy, degraded, unhealthy)
 * - startDate: Filter by start date (ISO 8601)
 * - endDate: Filter by end date (ISO 8601)
 * 
 * Authentication: Requires ADMIN_API_KEY header
 */
export async function GET(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const component = searchParams.get('component');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createClient();

    // Check if table exists by trying to query it
    let healthChecks = [];
    let tableExists = true;
    
    try {
      // Build query
      let query = supabase
        .from('system_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (component) {
        query = query.eq('component', component);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (startDate) {
        query = query.gte('checked_at', startDate);
      }
      if (endDate) {
        query = query.lte('checked_at', endDate);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        // Check if error is due to table not existing
        if (queryError.message.includes('does not exist') || queryError.code === '42P01') {
          tableExists = false;
          console.warn('system_health_checks table does not exist yet');
        } else {
          console.error('Error fetching health checks:', queryError);
          return NextResponse.json(
            { error: 'Failed to fetch health checks' },
            { status: 500 }
          );
        }
      } else {
        healthChecks = data || [];
      }
    } catch (error) {
      console.error('Error querying health checks:', error);
      tableExists = false;
    }

    // If table doesn't exist, return empty state
    if (!tableExists) {
      return NextResponse.json({
        success: true,
        overallStatus: 'unknown',
        summary: {
          total: 0,
          healthy: 0,
          degraded: 0,
          unhealthy: 0,
        },
        latestByComponent: {},
        recentChecks: [],
        timestamp: new Date().toISOString(),
        note: 'Health checks table not yet created. Run database migrations first.'
      });
    }

    // Calculate summary statistics
    const summary = {
      total: healthChecks.length,
      healthy: healthChecks.filter(c => c.status === 'healthy').length,
      degraded: healthChecks.filter(c => c.status === 'degraded').length,
      unhealthy: healthChecks.filter(c => c.status === 'unhealthy').length,
    };

    // Get latest status for each component
    const latestByComponent = {};
    const components = ['database', 'api', 'rag'];
    
    for (const comp of components) {
      const { data: latest } = await supabase
        .from('system_health_checks')
        .select('*')
        .eq('component', comp)
        .order('checked_at', { ascending: false })
        .limit(1)
        .single();
      
      if (latest) {
        latestByComponent[comp] = latest;
      }
    }

    // Calculate overall system health
    const latestStatuses = Object.values(latestByComponent).map(c => c.status);
    let overallStatus = 'healthy';
    if (latestStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (latestStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return NextResponse.json({
      success: true,
      overallStatus,
      summary,
      latestByComponent,
      recentChecks: healthChecks,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
