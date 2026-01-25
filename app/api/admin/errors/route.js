/**
 * Admin Errors Query API
 * Query errors with filters, pagination, and sorting
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queryErrors } from '@/lib/admin/error-logger';

// Simple API key authentication
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || !validKey) {
    return false;
  }
  
  return apiKey === validKey;
}

export async function GET(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Build filters from query parameters
    const filters = {
      type: searchParams.get('type'),
      severity: searchParams.get('severity'),
      feature_area: searchParams.get('feature_area'),
      school_id: searchParams.get('school_id'),
      status: searchParams.get('status'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10)
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    // Query errors using the error-logger utility
    const result = await queryErrors(supabase, filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      errors: result.errors,
      pagination: result.pagination
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error querying errors:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
