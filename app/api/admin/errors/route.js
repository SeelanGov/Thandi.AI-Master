/**
 * Error Query API Endpoint
 * GET /api/admin/errors
 * Retrieves errors with filtering and pagination
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { queryErrors, getErrorStatistics } from '@/lib/admin/error-queries';

export async function GET(request) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      severity: searchParams.get('severity') || undefined,
      error_type: searchParams.get('error_type') || undefined,
      school_id: searchParams.get('school_id') || undefined,
      feature_area: searchParams.get('feature_area') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      resolved: searchParams.get('resolved') === 'true' ? true : 
                searchParams.get('resolved') === 'false' ? false : undefined,
      user_id: searchParams.get('user_id') || undefined
    };

    // Check if statistics are requested
    const includeStats = searchParams.get('include_stats') === 'true';

    // Query errors
    const result = await queryErrors(filters);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Add statistics if requested
    let statistics = null;
    if (includeStats) {
      const statsResult = await getErrorStatistics({
        start_date: filters.start_date,
        end_date: filters.end_date
      });
      if (statsResult.success) {
        statistics = statsResult.data;
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      statistics: statistics
    });

  } catch (error) {
    console.error('Error in /api/admin/errors:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
