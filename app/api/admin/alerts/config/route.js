/**
 * Alert Configuration API - List and Create
 * GET /api/admin/alerts/config - List alert configurations
 * POST /api/admin/alerts/config - Create alert configuration
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
 * GET /api/admin/alerts/config
 * List all alert configurations
 */
export async function GET(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');
    const alert_type = searchParams.get('alert_type');

    // Build query
    let query = supabase
      .from('alert_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (enabled !== null) {
      query = query.eq('enabled', enabled === 'true');
    }

    if (alert_type) {
      query = query.eq('alert_type', alert_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch alert configurations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch alert configurations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    });

  } catch (error) {
    console.error('Error in GET /api/admin/alerts/config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/alerts/config
 * Create new alert configuration
 */
export async function POST(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { alert_type, threshold_value, threshold_unit, time_window, recipients } = body;

    if (!alert_type) {
      return NextResponse.json(
        { success: false, error: 'alert_type is required' },
        { status: 400 }
      );
    }

    if (threshold_value === undefined || threshold_value === null) {
      return NextResponse.json(
        { success: false, error: 'threshold_value is required' },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'recipients array is required' },
        { status: 400 }
      );
    }

    // Validate alert type
    const validAlertTypes = ['error_rate', 'performance_degradation', 'health_check_failure'];
    if (!validAlertTypes.includes(alert_type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid alert_type. Must be one of: ${validAlertTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate recipients
    const recipientsValidation = validateRecipients(recipients);
    if (!recipientsValidation.valid) {
      return NextResponse.json(
        { success: false, error: recipientsValidation.error },
        { status: 400 }
      );
    }

    // Validate threshold value
    if (typeof threshold_value !== 'number' || threshold_value <= 0) {
      return NextResponse.json(
        { success: false, error: 'threshold_value must be a positive number' },
        { status: 400 }
      );
    }

    // Validate time window
    if (time_window && (typeof time_window !== 'number' || time_window <= 0)) {
      return NextResponse.json(
        { success: false, error: 'time_window must be a positive number (minutes)' },
        { status: 400 }
      );
    }

    // Create alert configuration
    const { data, error } = await supabase
      .from('alert_configurations')
      .insert([{
        alert_type,
        threshold_value,
        threshold_unit: threshold_unit || 'count',
        time_window: time_window || 60,
        recipients,
        enabled: body.enabled !== false // Default to true
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create alert configuration:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create alert configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Alert configuration created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/admin/alerts/config:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
