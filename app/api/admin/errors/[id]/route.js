/**
 * Admin Error Details API
 * Get error details and mark errors as resolved
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveError } from '@/lib/admin/error-logger';

// Simple API key authentication
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || !validKey) {
    return false;
  }
  
  return apiKey === validKey;
}

export async function GET(request, { params }) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { id } = params;

    // Validate error ID
    if (!id) {
      return NextResponse.json(
        { error: 'Error ID is required' },
        { status: 400 }
      );
    }

    // Fetch error details
    const { data: error, error: fetchError } = await supabase
      .from('system_errors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Error not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Return error details
    return NextResponse.json({
      success: true,
      error
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error fetching error details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { id } = params;
    const body = await request.json();

    // Validate error ID
    if (!id) {
      return NextResponse.json(
        { error: 'Error ID is required' },
        { status: 400 }
      );
    }

    // Check if marking as resolved
    if (body.action === 'resolve' || body.resolved === true) {
      const result = await resolveError(supabase, id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        error: result.error
      }, {
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '99'
        }
      });
    }

    // Generic update (for future extensibility)
    const updateData = {};
    if (body.resolved !== undefined) updateData.resolved = body.resolved;
    if (body.severity) updateData.severity = body.severity;
    if (body.notes) updateData.notes = body.notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedError, error: updateError } = await supabase
      .from('system_errors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      error: updatedError
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error updating error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
