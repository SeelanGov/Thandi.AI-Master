/**
 * Performance Trends API - Admin Dashboard
 * GET /api/admin/performance/trends - Analyze performance trends
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { queryMetrics, calculateTrends, detectDegradation, calculateStatistics } from '@/lib/admin/performance-analyzer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/admin/performance/trends
 * Analyze performance trends over time
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
    const interval = searchParams.get('interval') || 'hourly'; // hourly, daily, weekly
    const endpoint = searchParams.get('endpoint') || null;
    const method = searchParams.get('method') || null;
    const degradationThreshold = searchParams.get('degradation_threshold') ? parseInt(searchParams.get('degradation_threshold')) : 50;

    // Calculate date ranges
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const baselinePeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 24-48 hours ago
    const baselinePeriodEnd = currentPeriodStart;

    // Query current period metrics
    const currentFilters = {
      start_date: currentPeriodStart.toISOString(),
      end_date: now.toISOString(),
      endpoint,
      method,
      limit: 10000
    };
    const currentMetrics = await queryMetrics(currentFilters);

    // Query baseline period metrics
    const baselineFilters = {
      start_date: baselinePeriodStart.toISOString(),
      end_date: baselinePeriodEnd.toISOString(),
      endpoint,
      method,
      limit: 10000
    };
    const baselineMetrics = await queryMetrics(baselineFilters);

    // Calculate trends
    const trends = calculateTrends(currentMetrics, interval);

    // Detect degradation
    const degradation = detectDegradation(currentMetrics, baselineMetrics, degradationThreshold);

    // Calculate current and baseline statistics
    const currentStats = calculateStatistics(currentMetrics);
    const baselineStats = calculateStatistics(baselineMetrics);

    return NextResponse.json({
      success: true,
      data: {
        trends,
        degradation,
        current_period: {
          start: currentPeriodStart.toISOString(),
          end: now.toISOString(),
          statistics: currentStats
        },
        baseline_period: {
          start: baselinePeriodStart.toISOString(),
          end: baselinePeriodEnd.toISOString(),
          statistics: baselineStats
        },
        interval,
        degradation_threshold: degradationThreshold
      }
    });

  } catch (error) {
    console.error('Performance trends error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze performance trends',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
