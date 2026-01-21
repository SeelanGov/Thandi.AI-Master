/**
 * Health Status API
 * GET /api/admin/health
 * Returns current system health status and recent check results
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { getHealthCheckHistory } from '@/lib/admin/health-checker';

/**
 * Validate API key
 */
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
  
  return apiKey === validKey;
}

/**
 * GET /api/admin/health
 * Get current system health status
 */
export async function GET(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const component_name = searchParams.get('component_name');
    const check_type = searchParams.get('check_type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const hours = parseInt(searchParams.get('hours') || '24');

    // Get health check history
    const result = await getHealthCheckHistory({
      component_name,
      check_type,
      status,
      limit,
      hours
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error
        },
        { status: 500 }
      );
    }

    // Get most recent check for each component to determine current status
    const currentStatus = getCurrentStatus(result.data);

    return NextResponse.json({
      success: true,
      data: {
        current_status: currentStatus,
        recent_checks: result.data,
        statistics: result.statistics
      }
    });

  } catch (error) {
    console.error('Error in health status API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch health status',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Get current status from recent checks
 * @param {Array} checks - Recent health checks
 * @returns {Object} Current status by component
 */
function getCurrentStatus(checks) {
  if (!checks || checks.length === 0) {
    return {
      overall_status: 'unknown',
      components: {}
    };
  }

  // Group by component and get most recent check
  const componentStatus = {};
  
  checks.forEach(check => {
    if (!componentStatus[check.component_name] || 
        new Date(check.created_at) > new Date(componentStatus[check.component_name].created_at)) {
      componentStatus[check.component_name] = check;
    }
  });

  // Determine overall status
  const statuses = Object.values(componentStatus).map(c => c.status);
  let overall_status = 'healthy';
  
  if (statuses.includes('unhealthy')) {
    overall_status = 'unhealthy';
  } else if (statuses.includes('degraded')) {
    overall_status = 'degraded';
  }

  return {
    overall_status,
    components: componentStatus,
    last_check: checks[0]?.created_at || null
  };
}
