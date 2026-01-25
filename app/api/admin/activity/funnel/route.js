import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activityAnalyzer } from '@/lib/admin/activity-analyzer';

/**
 * GET /api/admin/activity/funnel
 * Get funnel analysis metrics
 * 
 * Query Parameters:
 * - startDate: ISO date string (default: 7 days ago)
 * - endDate: ISO date string (default: now)
 * 
 * Authentication: Requires ADMIN_API_KEY header
 * 
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     funnel: {
 *       started: number,
 *       registered: number,
 *       assessed: number,
 *       completed: number
 *     },
 *     conversionRates: {
 *       startToRegister: number,
 *       registerToAssess: number,
 *       assessToComplete: number,
 *       overall: number
 *     },
 *     dropOffPoints: [
 *       { stage: string, dropOff: number, percentage: number }
 *     ]
 *   }
 * }
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

    const supabase = await createClient();

    // Calculate funnel metrics
    const funnelData = await activityAnalyzer.calculateFunnelMetrics(
      supabase,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: funnelData
    });

  } catch (error) {
    console.error('Funnel analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
