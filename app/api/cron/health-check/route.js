/**
 * Health Check Cron Job
 * GET /api/cron/health-check
 * Automated health checks (runs every 5 minutes)
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { checkSystemHealth } from '@/lib/admin/health-checker';

/**
 * Validate cron secret
 */
function validateCronSecret(request) {
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret_change_in_production';
  
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/health-check
 * Run automated health checks
 */
export async function GET(request) {
  try {
    // Validate cron secret
    if (!validateCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Running automated health checks...');

    // Run health checks
    const result = await checkSystemHealth();

    if (!result.success) {
      console.error('[CRON] Health checks failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          details: result.details
        },
        { status: 500 }
      );
    }

    console.log('[CRON] Health checks completed:', {
      overall_status: result.data.overall_status,
      checks_performed: result.data.checks.length,
      timestamp: result.data.timestamp
    });

    // Check if any components are unhealthy
    const unhealthyComponents = result.data.checks.filter(c => c.status === 'unhealthy');
    if (unhealthyComponents.length > 0) {
      console.warn('[CRON] Unhealthy components detected:', 
        unhealthyComponents.map(c => c.component_name)
      );
      
      // TODO: Trigger alerts (will be implemented in Day 6)
    }

    return NextResponse.json({
      success: true,
      data: {
        overall_status: result.data.overall_status,
        checks_performed: result.data.checks.length,
        unhealthy_count: unhealthyComponents.length,
        timestamp: result.data.timestamp
      },
      message: 'Automated health checks completed'
    });

  } catch (error) {
    console.error('[CRON] Error in health check cron:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run automated health checks',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Vercel Cron Configuration
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/health-check",
//     "schedule": "*/5 * * * *"
//   }]
// }
