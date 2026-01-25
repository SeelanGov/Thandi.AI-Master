/**
 * Alert Configuration Update API
 * PUT /api/admin/alerts/config/[id] - Update alert configuration
 * Created: January 24, 2026
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PUT(request, { params }) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;
    const configId = resolvedParams.id;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build update object (only include provided fields)
    const updates = {};
    if (body.alert_type !== undefined) updates.alert_type = body.alert_type;
    if (body.threshold_value !== undefined) updates.threshold_value = body.threshold_value;
    if (body.threshold_unit !== undefined) updates.threshold_unit = body.threshold_unit;
    if (body.time_window !== undefined) updates.time_window = body.time_window;
    if (body.recipients !== undefined) updates.recipients = body.recipients;
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    updates.updated_at = new Date().toISOString();

    // Update alert configuration
    const { data: config, error } = await supabase
      .from('alert_configurations')
      .update(updates)
      .eq('id', configId)
      .select()
      .single();

    if (error) {
      console.error('Alert config update error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update alert configuration' },
        { status: 500 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Alert configuration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Alert configuration updated successfully'
    });
  } catch (error) {
    console.error('Alert config update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
