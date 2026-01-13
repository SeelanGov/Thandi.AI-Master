import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      student_id, 
      school_id, 
      consent_type = 'data_processing', 
      consent_given, 
      consent_method = 'api' 
    } = body;

    // Validate required fields
    if (!student_id || consent_given === undefined) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Student ID and consent status are required' },
        { status: 400 }
      ));
    }

    // Validate consent type
    const validConsentTypes = ['data_processing', 'school_sharing', 'marketing', 'research'];
    if (!validConsentTypes.includes(consent_type)) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Invalid consent type' },
        { status: 400 }
      ));
    }

    // Record consent in database
    const { data: consentRecord, error: consentError } = await supabase
      .from('consent_records')
      .insert({
        student_id,
        school_id,
        consent_type,
        consent_given,
        consent_method,
        consent_timestamp: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (consentError) {
      console.error('Consent recording error:', consentError);
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Failed to record consent' },
        { status: 500 }
      ));
    }

    // Log consent action for audit trail
    console.log(`📋 Consent ${consent_given ? 'granted' : 'withdrawn'}: ${student_id} (${consent_type})`);

    return addCacheHeaders(NextResponse.json({
      success: true,
      consent_id: consentRecord.id,
      message: `Consent ${consent_given ? 'granted' : 'withdrawn'} successfully`,
      consent_details: {
        type: consent_type,
        given: consent_given,
        timestamp: consentRecord.consent_timestamp,
        method: consent_method
      }
    }));

  } catch (error) {
    console.error('Consent management error:', error);
    return addCacheHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');
    const consent_type = searchParams.get('consent_type');

    if (!student_id) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      ));
    }

    // Build query
    let query = supabase
      .from('consent_records')
      .select('*')
      .eq('student_id', student_id)
      .order('consent_timestamp', { ascending: false });

    if (consent_type) {
      query = query.eq('consent_type', consent_type);
    }

    const { data: consents, error } = await query;

    if (error) {
      console.error('Consent retrieval error:', error);
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Failed to retrieve consent records' },
        { status: 500 }
      ));
    }

    return addCacheHeaders(NextResponse.json({
      success: true,
      consents: consents || [],
      total: consents?.length || 0
    }));

  } catch (error) {
    console.error('Consent retrieval error:', error);
    return addCacheHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}