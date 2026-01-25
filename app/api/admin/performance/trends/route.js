/**
 * Admin Performance Trends API
 * Calculate performance trends over time
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTrends, detectPerformanceDegradation } from '@/lib/admin/performance-analyzer';

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
 * GET /api/admin/performance/trends
 * Calculate performance trends over time
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
    const interval = searchParams.get('interval') || 'hourly'; // hourly, daily, weekly
    const threshold = parseInt(searchParams.get('threshold') || '50'); // degradation threshold %

    // Validate interval
    if (!['hourly', 'daily', 'weekly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be: hourly, daily, or weekly' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('api_metrics')
      .select('endpoint, method, response_time, created_at');

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

    // Order by timestamp
    query = query.order('created_at', { ascending: true });

    // Execute query
    const { data: metrics, error } = await query;

    if (error) {
      console.error('Error querying performance metrics:', error);
      return NextResponse.json(
        { error: 'Failed to query performance metrics', details: error.message },
        { status: 500 }
      );
    }

    if (!metrics || metrics.length === 0) {
      return NextResponse.json({
        success: true,
        trends: [],
        degradation: {
          isDegraded: false,
          degradationPercentage: 0,
          message: 'No data available for trend analysis'
        }
      });
    }

    // Calculate trends
    const trends = calculateTrends(metrics, interval);

    // Detect performance degradation
    const degradation = detectPerformanceDegradation(trends, threshold);

    // Group trends by endpoint if not filtered
    let trendsByEndpoint = null;
    if (!endpoint) {
      const endpointGroups = {};
      metrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        if (!endpointGroups[key]) {
          endpointGroups[key] = [];
        }
        endpointGroups[key].push(metric);
      });

      trendsByEndpoint = Object.entries(endpointGroups).map(([endpointKey, endpointMetrics]) => {
        const [method, path] = endpointKey.split(' ');
        const endpointTrends = calculateTrends(endpointMetrics, interval);
        const endpointDegradation = detectPerformanceDegradation(endpointTrends, threshold);

        return {
          endpoint: path,
          method,
          trends: endpointTrends,
          degradation: endpointDegradation
        };
      });

      // Sort by degradation percentage (most degraded first)
      trendsByEndpoint.sort((a, b) => 
        b.degradation.degradationPercentage - a.degradation.degradationPercentage
      );
    }

    // Return response
    return NextResponse.json({
      success: true,
      interval,
      threshold,
      trends,
      degradation,
      by_endpoint: trendsByEndpoint,
      metadata: {
        start_date: startDate || metrics[0]?.created_at,
        end_date: endDate || metrics[metrics.length - 1]?.created_at,
        data_points: trends.length,
        total_requests: metrics.length
      }
    }, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99'
      }
    });

  } catch (error) {
    console.error('Error in performance trends API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
