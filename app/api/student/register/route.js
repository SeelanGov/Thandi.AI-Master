import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      student_name, 
      student_surname, 
      school_id, 
      grade,
      consent_given,
      consent_timestamp,
      consent_version 
    } = body;

    // Validate required fields
    if (!student_name || !student_surname || !school_id || !grade) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate consent (POPIA requirement)
    if (!consent_given) {
      return NextResponse.json(
        { success: false, error: 'Consent is required for registration' },
        { status: 400 }
      );
    }

    // Validate grade
    if (![10, 11, 12].includes(parseInt(grade))) {
      return NextResponse.json(
        { success: false, error: 'Invalid grade. Must be 10, 11, or 12' },
        { status: 400 }
      );
    }

    // Verify school exists and is secondary
    const { data: school, error: schoolError } = await supabase
      .from('school_master')
      .select('school_id, name, type, province')
      .eq('school_id', school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: 'Invalid school selection' },
        { status: 400 }
      );
    }

    // Ensure it's not a primary school
    if (school.type.toLowerCase().includes('primary')) {
      return NextResponse.json(
        { success: false, error: 'Primary schools are not supported' },
        { status: 400 }
      );
    }

    // PHASE 0: Use new student-school association function
    const { data: associationResult, error: associationError } = await supabase
      .rpc('create_student_school_association', {
        p_student_name: student_name.trim(),
        p_student_surname: student_surname.trim(),
        p_school_id: school_id,
        p_grade: parseInt(grade),
        p_consent_given: true,
        p_consent_method: 'web_form_registration'
      });

    if (associationError || !associationResult.success) {
      console.error('Student-school association error:', associationError || associationResult.error);
      return NextResponse.json(
        { success: false, error: associationResult?.error || 'Registration failed' },
        { status: 500 }
      );
    }

    const studentId = associationResult.student_id;

    // Create initial assessment record linked to student profile
    const { data: assessmentRecord, error: assessmentError } = await supabase
      .from('student_assessments')
      .insert({
        student_id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        student_name: student_name.trim(),
        student_surname: student_surname.trim(),
        school_id: school_id, // Now properly linked
        grade: parseInt(grade),
        student_profile_id: studentId, // Link to student profile
        consent_given: true,
        consent_timestamp: consent_timestamp || new Date().toISOString(),
        consent_version: consent_version || 'v1.0',
        assessment_data: {
          // Phase 0: Enhanced school integration metadata
          school_master_id: school.school_id,
          school_name: school.name,
          school_type: school.type,
          school_province: school.province || 'Unknown',
          
          // Phase 0: Student-school association tracking
          student_profile_id: studentId,
          school_student_id: associationResult.school_student_id,
          
          // Registration metadata
          registration_timestamp: new Date().toISOString(),
          registration_method: 'phase0_enhanced_registration',
          phase: 'Phase 0 - Student-School Integration',
          
          // Dashboard integration flags
          dashboard_visible: true,
          school_integration_complete: true,
          
          // POPIA compliance tracking
          data_source: 'student_self_registration',
          consent_method: 'web_form_checkbox',
          consent_recorded_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Assessment record creation error:', assessmentError);
      return NextResponse.json(
        { success: false, error: 'Registration failed' },
        { status: 500 }
      );
    }

    // Create JWT token for assessment flow
    const token = jwt.sign(
      {
        student_id: assessmentRecord.id,
        student_profile_id: studentId,
        school_id: school_id,
        grade: parseInt(grade),
        name: student_name,
        type: 'registered',
        phase: 'phase0_enhanced'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Log successful Phase 0 registration
    console.log(`✅ Phase 0 Registration: ${student_name} ${student_surname} from ${school.name} (Grade ${grade})`);
    console.log(`📊 Student Profile ID: ${studentId}, Assessment ID: ${assessmentRecord.id}`);

    return NextResponse.json({
      success: true,
      student_id: assessmentRecord.id,
      student_profile_id: studentId,
      token,
      message: 'Phase 0 registration successful - student-school integration complete',
      school_info: {
        id: school.school_id,
        name: school.name,
        type: school.type,
        province: school.province
      },
      phase0_features: {
        school_association: true,
        consent_recorded: true,
        dashboard_ready: true
      }
    });

  } catch (error) {
    console.error('Phase 0 registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify registration status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    if (decoded.type !== 'registered') {
      return NextResponse.json(
        { success: false, error: 'Invalid token type' },
        { status: 400 }
      );
    }

    // Get student record
    const { data: student, error } = await supabase
      .from('student_assessments')
      .select('id, student_name, student_surname, school_id, grade, created_at')
      .eq('id', decoded.student_id)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.student_name,
        surname: student.student_surname,
        school_id: student.school_id,
        grade: student.grade,
        registered_at: student.created_at
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}