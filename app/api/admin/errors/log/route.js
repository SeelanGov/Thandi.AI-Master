/**
 * Admin Errors Log API
 * Logs errors with deduplication
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logError } from '@/lib/admin/error-logger';

// Simple API key authentication
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || !validKey) {
    return false;
  }
  
  return apiKey === validKey;
}

export async function POST(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type and message' },
        { status: 400 }
      );
    }

    // Log the error using the error-logger utility
    const result = await logError(supabase, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      isDuplicate: result.isDuplicate,
      errorId: result.isDuplicate ? result.errorId : result.error.id
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
