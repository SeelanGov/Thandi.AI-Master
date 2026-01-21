/**
 * Performance Query API - Admin Dashboard
 * GET /api/admin/performance - Query performance metrics
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPerformanceSummary, queryMetrics, calculateStatistics, groupByEndpoint, identifySlowEndpoints } from '@/lib/admin/performance-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/admin/performance
 * Query performance metrics with filters
 */
export async function GET(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      start_date: searchParams.get('start_date') || null,
      end_date: searchParams.get('end_date') || null,
      endpoint: searchParams.get('endpoint') || null,
      method: searchParams.get('method') || null,
      school_id: searchParams.get('school_id') || null,
      min_response_time: searchParams.get('min_response_time') ? parseInt(searchParams.get('min_response_time')) : null,
      status_code: searchParams.get('status_code') ? parseInt(searchParams.get('status_code')) : null,
      slow_threshold: searchParams.get('slow_threshold') ? parseInt(searchParams.get('slow_threshold')) : 500,
      trend_interval: searchParams.get('trend_interval') || 'hourly',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 1000,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0
    };

    // Get performance summary
    const summary = await getPerformanceSummary(filters);

    return NextResponse.json({
      success: true,
      data: summary,
      filters: {
        start_date: filters.start_date,
        end_date: filters.end_date,
        endpoint: filters.endpoint,
        method: filters.method,
        school_id: filters.school_id,
        slow_threshold: filters.slow_threshold
      }
    });

  } catch (error) {
    console.error('Performance query error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to query performance metrics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/performance/log
 * Log a performance metric (for manual logging)
 */
export async function POST(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.endpoint || !body.method || typeof body.response_time !== 'number' || typeof body.status_code !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: endpoint, method, response_time, status_code' 
        },
        { status: 400 }
      );
    }

    // Insert metric
    const { data, error } = await supabase
      .from('api_metrics')
      .insert([{
        endpoint: body.endpoint,
        method: body.method,
        response_time: body.response_time,
        status_code: body.status_code,
        user_id: body.user_id || null,
        school_id: body.school_id || null,
        error_message: body.error_message || null,
        metadata: body.metadata || {}
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log metric:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to log metric' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metric_id: data.id
    });

  } catch (error) {
    console.error('Performance logging error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log performance metric',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
