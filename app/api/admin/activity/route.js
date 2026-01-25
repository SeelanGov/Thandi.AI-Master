import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activityAnalyzer } from '@/lib/admin/activity-analyzer';

/**
 * GET /api/admin/activity
 * Query user activity metrics
 * 
 * Query Parameters:
 * - startDate: ISO date string (default: 7 days ago)
 * - endDate: ISO date string (default: now)
 * - eventType: Filter by event type
 * - schoolId: Filter by school
 * - limit: Number of records (default: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Authentication: Requires ADMIN_API_KEY header
 */
export async function GET(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const startDate = searchParams.get('startDate') || 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const eventType = searchParams.get('eventType');
    const schoolId = searchParams.get('schoolId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('user_activity')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    // Calculate summary metrics
    const metrics = await activityAnalyzer.calculateMetrics(
      supabase,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: {
        activities: activities || [],
        total: count || 0,
        limit,
        offset,
        metrics
      }
    });

  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/activity
 * Log a user activity event
 * 
 * Request Body:
 * {
 *   eventType: string (required) - Type of event
 *   userId: string (optional) - User ID
 *   schoolId: string (optional) - School ID
 *   sessionId: string (optional) - Session ID
 *   metadata: object (optional) - Additional data
 * }
 * 
 * Authentication: Requires ADMIN_API_KEY header
 */
export async function POST(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert activity record
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        event_type: body.eventType,
        user_id: body.userId || null,
        school_id: body.schoolId || null,
        session_id: body.sessionId || null,
        metadata: body.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json(
        { error: 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Activity logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
