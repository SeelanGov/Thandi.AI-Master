/**
 * Alert Resolution API
 * PUT /api/admin/alerts/[id]/resolve - Resolve an alert
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { resolveAlert } from '@/lib/admin/alert-engine';

/**
 * Validate API key
 */
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
  
  return apiKey === validKey;
}

/**
 * PUT /api/admin/alerts/[id]/resolve
 * Resolve an alert
 */
export async function PUT(request, { params }) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse request body (optional resolved_by field)
    let resolvedBy = null;
    try {
      const body = await request.json();
      resolvedBy = body.resolved_by || null;
    } catch {
      // Body is optional
    }

    // Resolve alert
    const result = await resolveAlert(id, resolvedBy);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Alert resolved successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/alerts/[id]/resolve:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
