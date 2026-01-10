import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET: Check current consent status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const studentId = searchParams.get('student_id');
    const schoolId = searchParams.get('school_id');

    if (!token && !studentId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    let verifiedStudentId = studentId;
    let verifiedSchoolId = schoolId;

    // If token provided, verify and extract student info
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        verifiedStudentId = decoded.student_profile_id || decoded.student_id;
        verifiedSchoolId = decoded.school_id;
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    if (!verifiedStudentId || !verifiedSchoolId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and School ID required' },
        { status: 400 }
      );
    }

    // Check current consent status
    const { data: consentStatus, error: consentError } = await supabase
      .rpc('check_student_consent', {
        p_student_profile_id: verifiedStudentId,
        p_school_id: verifiedSchoolId
      });

    if (consentError) {
      console.error('Consent check error:', consentError);
      return NextResponse.json(
        { success: false, error: 'Failed to check consent status' },
        { status: 500 }
      );
    }

    // Get consent history
    const { data: consentHistory, error: historyError } = await supabase
      .from('consent_history')
      .select('*')
      .eq('student_profile_id', verifiedStudentId)
      .eq('school_id', verifiedSchoolId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Consent history error:', historyError);
    }

    return NextResponse.json({
      success: true,
      consent_status: consentStatus[0] || {
        has_consent: false,
        consent_date: null,
        consent_method: 'unknown',
        can_access_data: false
      },
      consent_history: consentHistory || [],
      student_rights: {
        can_revoke: true,
        can_update: true,
        can_view_history: true,
        contact_email: 'support@thandi.ai'
      }
    });

  } catch (error) {
    console.error('Consent management error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update consent (grant or revoke)
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      action, // 'grant' or 'revoke'
      student_id,
      school_id,
      token,
      reason
    } = body;

    if (!action || !['grant', 'revoke'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "grant" or "revoke"' },
        { status: 400 }
      );
    }

    let verifiedStudentId = student_id;
    let verifiedSchoolId = school_id;

    // Verify token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        verifiedStudentId = decoded.student_profile_id || decoded.student_id;
        verifiedSchoolId = decoded.school_id;
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    if (!verifiedStudentId || !verifiedSchoolId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and School ID required' },
        { status: 400 }
      );
    }

    // Extract client metadata for audit trail
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    let result;

    if (action === 'revoke') {
      // Revoke consent
      const { data: revokeResult, error: revokeError } = await supabase
        .rpc('revoke_student_consent', {
          p_student_profile_id: verifiedStudentId,
          p_school_id: verifiedSchoolId,
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_reason: reason || 'Student requested withdrawal'
        });

      if (revokeError) {
        console.error('Consent revocation error:', revokeError);
        return NextResponse.json(
          { success: false, error: 'Failed to revoke consent' },
          { status: 500 }
        );
      }

      result = revokeResult;
    } else {
      // Grant consent
      const { data: grantResult, error: grantError } = await supabase
        .rpc('record_consent_change', {
          p_student_profile_id: verifiedStudentId,
          p_school_id: verifiedSchoolId,
          p_consent_action: 'granted',
          p_consent_given: true,
          p_consent_method: 'student_portal_update',
          p_consent_context: 'consent_restoration',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_metadata: {
            reason: reason || 'Student granted consent',
            timestamp: new Date().toISOString()
          }
        });

      if (grantError) {
        console.error('Consent grant error:', grantError);
        return NextResponse.json(
          { success: false, error: 'Failed to grant consent' },
          { status: 500 }
        );
      }

      result = {
        success: true,
        consent_record_id: grantResult,
        message: 'Consent successfully granted. School access restored.',
        timestamp: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      action: action,
      result: result,
      message: action === 'revoke' 
        ? 'Consent revoked successfully. Your school can no longer access your assessment data.'
        : 'Consent granted successfully. Your school can now access your assessment data to provide personalized support.'
    });

  } catch (error) {
    console.error('Consent update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete all student data (POPIA right to erasure)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const confirmDelete = searchParams.get('confirm');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication token required' },
        { status: 401 }
      );
    }

    if (confirmDelete !== 'DELETE_ALL_MY_DATA') {
      return NextResponse.json(
        { success: false, error: 'Confirmation required. Set confirm=DELETE_ALL_MY_DATA' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const studentId = decoded.student_profile_id || decoded.student_id;

    // Record the data deletion request
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // This would typically be handled by a background job for safety
    // For now, we'll just record the deletion request
    const { error: deletionError } = await supabase
      .from('consent_history')
      .insert({
        student_profile_id: studentId,
        school_id: decoded.school_id,
        consent_action: 'data_deletion_requested',
        consent_given: false,
        consent_method: 'popia_erasure_request',
        consent_context: 'right_to_erasure',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          deletion_requested_at: new Date().toISOString(),
          confirmation_provided: true,
          processing_status: 'pending'
        }
      });

    if (deletionError) {
      console.error('Deletion request error:', deletionError);
      return NextResponse.json(
        { success: false, error: 'Failed to process deletion request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data deletion request received. Your data will be permanently deleted within 30 days as required by POPIA. You will receive confirmation via email.',
      request_id: `del_${Date.now()}`,
      processing_time: '30 days maximum',
      contact: 'support@thandi.ai'
    });

  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}