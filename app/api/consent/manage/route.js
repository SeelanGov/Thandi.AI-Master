import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Student ID and consent status are required' },
        { status: 400 }
      );
    }

    // Validate consent type
    const validConsentTypes = ['data_processing', 'school_sharing', 'marketing', 'research'];
    if (!validConsentTypes.includes(consent_type)) {
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Invalid consent type' },
        { status: 400 }
      );
    }

    // Check if consent record already exists
    const { data: existingConsent } = await supabase
      .from('consent_records')
      .select('id')
      .eq('student_id', student_id)
      .eq('consent_type', consent_type)
      .eq('school_id', school_id || null)
      .single();

    let result;
    if (existingConsent) {
      // Update existing consent
      const { data, error } = await supabase
        .from('consent_records')
        .update({
          consent_given,
          consent_method,
          consent_timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
        .eq('id', existingConsent.id)
        .select()
        .single();

      if (error) {
        console.error('Consent update error:', error);
        
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
          { success: false, error: 'Failed to update consent' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new consent record
      const { data, error } = await supabase
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

      if (error) {
        console.error('Consent recording error:', error);
        
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
          { success: false, error: 'Failed to record consent' },
          { status: 500 }
        );
      }
      result = data;
    }

    // Log consent action for audit trail
    console.log(`✅ Consent ${existingConsent ? 'updated' : 'recorded'}: ${student_id} - ${consent_type}: ${consent_given}`);

    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json({
      success: true,
      consent_id: result.id,
      action: existingConsent ? 'updated' : 'created',
      message: `Consent ${existingConsent ? 'updated' : 'recorded'} successfully`
    });

  } catch (error) {
    console.error('Consent management error:', error);
    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');
    const school_id = searchParams.get('school_id');
    const consent_type = searchParams.get('consent_type');

    if (!student_id) {
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('consent_records')
      .select('*')
      .eq('student_id', student_id)
      .order('consent_timestamp', { ascending: false });

    if (school_id) {
      query = query.eq('school_id', school_id);
    }

    if (consent_type) {
      query = query.eq('consent_type', consent_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Consent retrieval error:', error);
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Failed to retrieve consent records' },
        { status: 500 }
      );
    }

    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json({
      success: true,
      consents: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Consent retrieval error:', error);
    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');
    const consent_type = searchParams.get('consent_type');
    const school_id = searchParams.get('school_id');

    if (!student_id) {
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    // Revoke consent by setting consent_given to false
    let query = supabase
      .from('consent_records')
      .update({
        consent_given: false,
        consent_method: 'api_revocation',
        consent_timestamp: new Date().toISOString()
      })
      .eq('student_id', student_id);

    if (consent_type) {
      query = query.eq('consent_type', consent_type);
    }

    if (school_id) {
      query = query.eq('school_id', school_id);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Consent revocation error:', error);
      
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
        { success: false, error: 'Failed to revoke consent' },
        { status: 500 }
      );
    }

    console.log(`🔒 Consent revoked for student: ${student_id}, type: ${consent_type || 'all'}`);

    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json({
      success: true,
      revoked_count: data?.length || 0,
      message: 'Consent revoked successfully'
    });

  } catch (error) {
    console.error('Consent revocation error:', error);
    
    // Cache busting headers - 2026-01-13T16:14:20.771Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:14:20.771Z');
    
    
    // Cache busting headers - 2026-01-13T16:15:25.297Z
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Cache-Bust', '2026-01-13T16:15:25.297Z');
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}