/**
 * Alert Resolution API
 * PUT /api/admin/alerts/[id]/resolve - Resolve an alert
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
    const alertId = resolvedParams.id;

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Resolve the alert
    const { data: alert, error } = await supabase
      .from('alert_history')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: body.resolved_by || 'admin'
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('Alert resolution error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to resolve alert' },
        { status: 500 }
      );
    }

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Alert resolution API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
