/**
 * Health Check API - Run Health Checks
 * POST /api/admin/health/check
 * Runs health checks on demand and stores results
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { checkSystemHealth } from '@/lib/admin/health-checker';

/**
 * Validate API key
 */
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
  
  return apiKey === validKey;
}

/**
 * POST /api/admin/health/check
 * Run health checks on demand
 */
export async function POST(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Run health checks
    const result = await checkSystemHealth();

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          details: result.details
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Health checks completed successfully'
    });

  } catch (error) {
    console.error('Error in health check API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run health checks',
        details: error.message
      },
      { status: 500 }
    );
  }
}
