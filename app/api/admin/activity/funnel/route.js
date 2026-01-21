/**
 * Admin Activity Funnel API
 * Provides funnel analysis and conversion metrics
 * Created: January 19, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateFunnelMetrics } from '@/lib/admin/activity-analyzer';

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
}

/**
 * GET /api/admin/activity/funnel
 * Get funnel analysis with conversion rates and drop-off points
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
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Calculate funnel metrics
    const filters = { start_date, end_date };
    const funnelData = await calculateFunnelMetrics(filters);

    if (!funnelData) {
      return NextResponse.json(
        { success: false, error: 'Failed to calculate funnel metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: funnelData
    });

  } catch (error) {
    console.error('Error in GET /api/admin/activity/funnel:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
