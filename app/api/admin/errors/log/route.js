/**
 * Error Logging API Endpoint
 * POST /api/admin/errors/log
 * Logs errors to the admin dashboard
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { logError } from '@/lib/admin/error-logger';

export async function POST(request) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Log the error
    const result = await logError(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      error_id: result.error_id,
      deduplicated: result.deduplicated || false
    });

  } catch (error) {
    console.error('Error in /api/admin/errors/log:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
