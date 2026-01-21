/**
 * Admin Activity API
 * Handles user activity queries and logging
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logActivity } from '@/lib/admin/activity-logger';
import { 
  calculateSummaryMetrics, 
  getActivityBreakdown,
  getActivityTimeline,
  getTopSchools
} from '@/lib/admin/activity-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validate API key
 */
async function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };

  return { valid: true, user: data };
}

/**
 * GET /api/admin/activity
 * Query user activity with filters
 */
export async function GET(request) {
  try {
    // Validate API key
    const auth = await validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const event_type = searchParams.get('event_type');
    const user_id = searchParams.get('user_id');
    const school_id = searchParams.get('school_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const include_stats = searchParams.get('include_stats') === 'true';

    // Build query
    let query = supabase
      .from('user_activity')
      .select('*', { count: 'exact' });

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (school_id) {
      query = query.eq('school_id', school_id);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error querying activities:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to query activities' },
        { status: 500 }
      );
    }

    // Calculate statistics if requested
    let summary = null;
    let breakdown = null;
    let timeline = null;
    let top_schools = null;

    if (include_stats) {
      const filters = { start_date, end_date };
      summary = await calculateSummaryMetrics(filters);
      breakdown = await getActivityBreakdown(filters);
      timeline = await getActivityTimeline({ ...filters, interval: 'hourly' });
      top_schools = await getTopSchools({ ...filters, limit: 5 });
    }

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      ...(include_stats && {
        summary,
        breakdown,
        timeline,
        top_schools
      })
    });

  } catch (error) {
    console.error('Error in GET /api/admin/activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/activity
 * Log a user activity event
 */
export async function POST(request) {
  try {
    // Validate API key
    const auth = await validateAPIKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Log activity
    const result = await logActivity(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      activity_id: result.activity_id,
      deduplicated: result.deduplicated || false
    });

  } catch (error) {
    console.error('Error in POST /api/admin/activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
