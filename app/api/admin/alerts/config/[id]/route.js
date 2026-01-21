/**
 * Alert Configuration API - Update
 * PUT /api/admin/alerts/config/[id] - Update alert configuration
 * Created: January 20, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateRecipients } from '@/lib/admin/email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validate API key
 */
function validateAPIKey(request) {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY || 'kiro_04ef89db168ae57e106b01dfac602164500b5c771371ffb15a1b827563253175';
  
  return apiKey === validKey;
}

/**
 * PUT /api/admin/alerts/config/[id]
 * Update alert configuration
 */
export async function PUT(request, { params }) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Parse request body
    const body = await request.json();

    // Build update object
    const updates = {};

    if (body.threshold_value !== undefined) {
      if (typeof body.threshold_value !== 'number' || body.threshold_value <= 0) {
        return NextResponse.json(
          { success: false, error: 'threshold_value must be a positive number' },
          { status: 400 }
        );
      }
      updates.threshold_value = body.threshold_value;
    }

    if (body.threshold_unit !== undefined) {
      updates.threshold_unit = body.threshold_unit;
    }

    if (body.time_window !== undefined) {
      if (typeof body.time_window !== 'number' || body.time_window <= 0) {
        return NextResponse.json(
          { success: false, error: 'time_window must be a positive number (minutes)' },
          { status: 400 }
        );
      }
      updates.time_window = body.time_window;
    }

    if (body.recipients !== undefined) {
      if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
        return NextResponse.json(
          { success: false, error: 'recipients must be a non-empty array' },
          { status: 400 }
        );
      }

      const recipientsValidation = validateRecipients(body.recipients);
      if (!recipientsValidation.valid) {
        return NextResponse.json(
          { success: false, error: recipientsValidation.error },
          { status: 400 }
        );
      }

      updates.recipients = body.recipients;
    }

    if (body.enabled !== undefined) {
      updates.enabled = body.enabled;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Update alert configuration
    const { data, error } = await supabase
      .from('alert_configurations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Alert configuration not found' },
          { status: 404 }
        );
      }

      console.error('Failed to update alert configuration:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update alert configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Alert configuration updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/alerts/config/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
