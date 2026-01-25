/**
 * Alert Configuration API
 * GET /api/admin/alerts/config - List alert configurations
 * POST /api/admin/alerts/config - Create alert configuration
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

    // Fetch all alert configurations
    const { data: configs, error, count } = await supabase
      .from('alert_configurations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Alert config query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch alert configurations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: configs || [],
      count: count || 0
    });
  } catch (error) {
    console.error('Alert config API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.alert_type) {
      return NextResponse.json(
        { success: false, error: 'alert_type is required' },
        { status: 400 }
      );
    }

    if (!body.threshold_value) {
      return NextResponse.json(
        { success: false, error: 'threshold_value is required' },
        { status: 400 }
      );
    }

    // Create alert configuration
    const { data: config, error } = await supabase
      .from('alert_configurations')
      .insert({
        alert_type: body.alert_type,
        threshold_value: body.threshold_value,
        threshold_unit: body.threshold_unit || 'count',
        time_window: body.time_window || 60,
        recipients: body.recipients || [],
        enabled: body.enabled !== undefined ? body.enabled : true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Alert config creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create alert configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Alert configuration created successfully'
    });
  } catch (error) {
    console.error('Alert config API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
