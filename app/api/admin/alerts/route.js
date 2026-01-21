/**
 * Alert History API - List Alerts
 * GET /api/admin/alerts - List alert history
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { getAlertHistory } from '@/lib/admin/alert-engine';

/**
 * Validate API key
 */
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
  
  return apiKey === validKey;
}

/**
 * GET /api/admin/alerts
 * List alert history with filters
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const alert_type = searchParams.get('alert_type');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const hours = parseInt(searchParams.get('hours') || '24');

    // Validate parameters
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: 'limit must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (hours < 1 || hours > 720) { // Max 30 days
      return NextResponse.json(
        { success: false, error: 'hours must be between 1 and 720' },
        { status: 400 }
      );
    }

    // Get alert history
    const result = await getAlertHistory({
      alert_type,
      severity,
      status,
      limit,
      hours
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      statistics: result.statistics,
      count: result.data.length
    });

  } catch (error) {
    console.error('Error in GET /api/admin/alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
