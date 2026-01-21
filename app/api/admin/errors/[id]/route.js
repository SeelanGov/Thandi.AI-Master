/**
 * Error Details API Endpoint
 * GET /api/admin/errors/[id]
 * PUT /api/admin/errors/[id] (mark as resolved)
 * Retrieves or updates a specific error
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { getErrorById, resolveError } from '@/lib/admin/error-queries';

export async function GET(request, { params }) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Error ID is required' },
        { status: 400 }
      );
    }

    // Get error details
    const result = await getErrorById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in /api/admin/errors/[id] GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Error ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { admin_user_id, action } = body;

    // Only support resolve action for now
    if (action !== 'resolve') {
      return NextResponse.json(
        { success: false, error: 'Only "resolve" action is supported' },
        { status: 400 }
      );
    }

    if (!admin_user_id) {
      return NextResponse.json(
        { success: false, error: 'admin_user_id is required' },
        { status: 400 }
      );
    }

    // Resolve the error
    const result = await resolveError(id, admin_user_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in /api/admin/errors/[id] PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
