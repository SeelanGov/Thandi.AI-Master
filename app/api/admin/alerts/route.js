/**
 * Alert History API
 * GET /api/admin/alerts - List alert history with filtering
 * Created: January 24, 2026
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('alert_history')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    // Apply time filter
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    query = query.gte('timestamp', cutoffTime);

    // Apply severity filter
    if (severity) {
      query = query.eq('severity', severity);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: alerts, error, count } = await query;

    if (error) {
      console.error('Alert history query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch alert history' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const statistics = {
      total: count || 0,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      by_severity: {
        info: alerts.filter(a => a.severity === 'info').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        critical: alerts.filter(a => a.severity === 'critical').length
      }
    };

    return NextResponse.json({
      success: true,
      data: alerts,
      count: count || 0,
      statistics,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    console.error('Alert history API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
