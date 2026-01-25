/**
 * Admin Performance API
 * Query and log performance metrics
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateStatistics, identifySlowEndpoints } from '@/lib/admin/performance-analyzer';

// Simple API key authentication
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!apiKey || !validKey) {
    return false;
  }
  
  return apiKey === validKey;
}

/**
 * GET /api/admin/performance
 * Query performance metrics with filters and statistics
 */
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

    // Parse query parameters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const endpoint = searchParams.get('endpoint');
    const method = searchParams.get('method');
    const minResponseTime = searchParams.get('min_response_time');
    const maxResponseTime = searchParams.get('max_response_time');
    const statusCode = searchParams.get('status_code');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('api_metrics')
      .select('*', { count: 'exact' });

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }
    if (method) {
      query = query.eq('method', method);
    }
    if (minResponseTime) {
      query = query.gte('response_time', parseInt(minResponseTime));
    }
    if (maxResponseTime) {
      query = query.lte('response_time', parseInt(maxResponseTime));
    }
    if (statusCode) {
      query = query.eq('status_code', parseInt(statusCode));
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data: metrics, error, count } = await query;

    if (error) {
      console.error('Error querying performance metrics:', error);
      return NextResponse.json(
        { error: 'Failed to query performance metrics', details: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const statistics = calculateStatistics(metrics || []);

    // Identify slow endpoints (>500ms)
    const slowEndpoints = identifySlowEndpoints(metrics || [], 500);

    // Group by endpoint
    const endpointGroups = {};
    (metrics || []).forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointGroups[key]) {
        endpointGroups[key] = [];
      }
      endpointGroups[key].push(metric);
    });

    // Calculate stats for each endpoint
    const byEndpoint = Object.entries(endpointGroups).map(([endpoint, endpointMetrics]) => {
      const [method, path] = endpoint.split(' ');
      const stats = calculateStatistics(endpointMetrics);
      return {
        endpoint: path,
        method,
        requests: stats.count,
        avg_response_time: stats.average,
        median_response_time: stats.median,
        p95_response_time: stats.p95,
        p99_response_time: stats.p99,
        min_response_time: stats.min,
        max_response_time: stats.max
      };
    });

    // Sort by request count (most popular first)
    byEndpoint.sort((a, b) => b.requests - a.requests);

    // Return response
    return NextResponse.json({
      success: true,
      summary: {
        total_requests: count || 0,
        average_response_time: statistics.average,
        median_response_time: statistics.median,
        p95_response_time: statistics.p95,
        p99_response_time: statistics.p99,
        min_response_time: statistics.min,
        max_response_time: statistics.max
      },
      by_endpoint: byEndpoint,
      slow_endpoints: slowEndpoints,
      metrics: metrics || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error in performance API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/performance
 * Manually log a performance metric
 */
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
    if (!body.endpoint || !body.method || body.response_time === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, method, response_time' },
        { status: 400 }
      );
    }

    // Validate response_time is a number
    if (typeof body.response_time !== 'number' || body.response_time < 0) {
      return NextResponse.json(
        { error: 'response_time must be a positive number' },
        { status: 400 }
      );
    }

    // Insert metric
    const { data: metric, error } = await supabase
      .from('api_metrics')
      .insert({
        endpoint: body.endpoint,
        method: body.method,
        response_time: body.response_time,
        status_code: body.status_code || 200,
        user_id: body.user_id || null,
        school_id: body.school_id || null,
        error_message: body.error_message || null,
        metadata: body.metadata || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging performance metric:', error);
      return NextResponse.json(
        { error: 'Failed to log performance metric', details: error.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      metric
    }, {
      status: 201,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error logging performance metric:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
