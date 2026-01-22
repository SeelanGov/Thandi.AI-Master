/**
 * Admin Errors Export API
 * Exports errors to CSV format
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Validate API key
function validateAPIKey(request) {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === process.env.ADMIN_API_KEY;
}

export async function GET(request) {
  try {
    // Validate API key
    if (!validateAPIKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const school_id = searchParams.get('school_id');
    const feature_area = searchParams.get('feature_area');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('system_errors')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) query = query.eq('error_type', type);
    if (school_id) query = query.eq('school_id', school_id);
    if (feature_area) query = query.eq('feature_area', feature_area);
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (search) query = query.ilike('message', `%${search}%`);

    // Execute query
    const { data: errors, error } = await query;

    if (error) {
      console.error('Error fetching errors for export:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch errors' },
        { status: 500 }
      );
    }

    // Convert to CSV
    const csvHeaders = [
      'ID',
      'Error Type',
      'Message',
      'Severity',
      'Feature Area',
      'School ID',
      'Student Grade',
      'URL',
      'Resolved',
      'Created At'
    ];

    const csvRows = errors.map(error => [
      error.id,
      error.error_type,
      `"${(error.message || '').replace(/"/g, '""')}"`, // Escape quotes
      error.severity || 'error',
      error.feature_area || '',
      error.school_id || '',
      error.student_grade || '',
      error.url || '',
      error.resolved ? 'Yes' : 'No',
      error.created_at
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="errors-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting errors:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
