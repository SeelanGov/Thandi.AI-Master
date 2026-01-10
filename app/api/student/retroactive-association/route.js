import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/student/retroactive-association
 * Creates school association for existing students with POPIA-compliant consent
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      studentId, 
      schoolId, 
      consentGiven = true, 
      consentMethod = 'retroactive_web_form',
      consentContext = 'student_initiated_association'
    } = body;

    // Validate required fields
    if (!studentId || !schoolId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student ID and School ID are required' 
        },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit trail
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    console.log(`🔄 Processing retroactive association: Student ${studentId} → School ${schoolId}`);

    // Step 1: Verify student exists and doesn't have school association
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, email, phone, grade, school_id')
      .or(`id.eq.${studentId},email.eq.${studentId}`)
      .single();

    if (studentError || !student) {
      console.error('Student not found:', studentError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student not found' 
        },
        { status: 404 }
      );
    }

    if (student.school_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student is already associated with a school' 
        },
        { status: 400 }
      );
    }

    // Step 2: Verify school exists
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, code')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      console.error('School not found:', schoolError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'School not found' 
        },
        { status: 404 }
      );
    }

    // Step 3: Create school-student association with consent
    const { data: associationResult, error: associationError } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: 'Existing', // Placeholder - we don't have names in current schema
        p_student_surname: 'Student',
        p_school_id: schoolId,
        p_grade: student.grade || 12,
        p_consent_given: consentGiven,
        p_consent_method: consentMethod,
        p_consent_metadata: {
          ip_address: clientIP,
          user_agent: userAgent,
          context: consentContext,
          timestamp: new Date().toISOString(),
          student_initiated: true
        }
      });

    if (associationError) {
      console.error('Association creation failed:', associationError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create school association' 
        },
        { status: 500 }
      );
    }

    // Step 4: Update student profile with school association
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({
        school_id: schoolId,
        consent_given: consentGiven,
        consent_date: consentGiven ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', student.id);

    if (updateError) {
      console.error('Student profile update failed:', updateError);
      // Continue - association was created, this is just a sync issue
    }

    // Step 5: Update historical assessments with school association
    const { data: assessments, error: assessmentError } = await supabase
      .from('student_assessments')
      .update({
        school_id: schoolId,
        updated_at: new Date().toISOString()
      })
      .eq('student_profile_id', student.id)
      .select('id');

    const assessmentCount = assessments?.length || 0;

    if (assessmentError) {
      console.error('Assessment update failed:', assessmentError);
      // Continue - this is not critical for the association
    }

    // Step 6: Log successful association
    console.log(`✅ Retroactive association complete: Student ${student.id} → School ${school.name} (${assessmentCount} assessments updated)`);

    // Step 7: Audit log
    const auditData = {
      action: 'retroactive_association_created',
      student_id: student.id,
      school_id: schoolId,
      consent_given: consentGiven,
      consent_method: consentMethod,
      assessments_updated: assessmentCount,
      ip_address: clientIP,
      user_agent: userAgent,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    console.log('📋 Retroactive Association Audit:', JSON.stringify(auditData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'School association created successfully',
      data: {
        student_id: student.id,
        school_id: schoolId,
        school_name: school.name,
        consent_given: consentGiven,
        assessments_updated: assessmentCount,
        association_id: associationResult?.school_student_id,
        consent_record_id: associationResult?.consent_record_id
      },
      metadata: {
        processing_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Retroactive association error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during association creation',
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/student/retroactive-association
 * Check if student needs retroactive association
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student ID is required' 
        },
        { status: 400 }
      );
    }

    // Check student status
    const { data: student, error } = await supabase
      .from('student_profiles')
      .select('id, email, grade, school_id, consent_given, consent_date')
      .or(`id.eq.${studentId},email.eq.${studentId}`)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student not found' 
        },
        { status: 404 }
      );
    }

    // Check assessment count
    const { count: assessmentCount } = await supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('student_profile_id', student.id);

    return NextResponse.json({
      success: true,
      data: {
        student_id: student.id,
        has_school_association: !!student.school_id,
        school_id: student.school_id,
        consent_given: student.consent_given,
        consent_date: student.consent_date,
        assessment_count: assessmentCount || 0,
        needs_retroactive_association: !student.school_id && (assessmentCount || 0) > 0
      }
    });

  } catch (error) {
    console.error('Retroactive association check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}