import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runHealthChecks } from '@/lib/admin/health-checker';

/**
 * POST /api/admin/health/check
 * 
 * Run health checks on demand and store results
 * 
 * Request Body:
 * - components: Array of components to check (optional, defaults to all)
 *   Valid values: ['database', 'api', 'rag']
 * 
 * Authentication: Requires ADMIN_API_KEY header
 */
export async function POST(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    let components = ['database', 'api', 'rag']; // Default to all components
    try {
      const body = await request.json();
      if (body.components && Array.isArray(body.components)) {
        components = body.components;
      }
    } catch (e) {
      // If no body or invalid JSON, use defaults
    }

    // Validate components
    const validComponents = ['database', 'api', 'rag'];
    const invalidComponents = components.filter(c => !validComponents.includes(c));
    if (invalidComponents.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid components',
          message: `Invalid components: ${invalidComponents.join(', ')}`,
          validComponents 
        },
        { status: 400 }
      );
    }

    console.log(`Running health checks for components: ${components.join(', ')}`);

    // Run health checks
    const results = await runHealthChecks(components);

    // Store results in database
    const supabase = createClient();
    const timestamp = new Date().toISOString();

    const healthCheckRecords = results.map(result => ({
      component: result.component,
      status: result.status,
      response_time_ms: result.responseTime,
      details: result.details || {},
      checked_at: timestamp,
    }));

    let stored = false;
    try {
      const { error: insertError } = await supabase
        .from('system_health_checks')
        .insert(healthCheckRecords);

      if (insertError) {
        // Check if error is due to table not existing
        if (insertError.message.includes('does not exist') || insertError.code === '42P01') {
          console.warn('system_health_checks table does not exist yet - skipping storage');
        } else {
          console.error('Error storing health check results:', insertError);
        }
      } else {
        stored = true;
      }
    } catch (error) {
      console.error('Error storing health check results:', error);
      // Don't fail the request if storage fails, just log it
    }

    // Calculate overall status
    const statuses = results.map(r => r.status);
    let overallStatus = 'healthy';
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    // Calculate summary
    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      averageResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      ),
    };

    return NextResponse.json({
      success: true,
      overallStatus,
      summary,
      results,
      timestamp,
      stored,
      note: stored ? undefined : 'Health checks table not yet created. Results not stored.'
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
