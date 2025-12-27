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
      .select('school_id, name, type')
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

    // Create student assessment record with minimal required fields
    const { data: studentRecord, error: insertError } = await supabase
      .from('student_assessments')
      .insert({
        student_id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        assessment_data: {
          student_name: student_name.trim(),
          student_surname: student_surname.trim(),
          school_id,
          grade: parseInt(grade),
          consent_given: true,
          consent_timestamp: consent_timestamp || new Date().toISOString(),
          consent_version: consent_version || 'v1.0'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Student registration error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Registration failed' },
        { status: 500 }
      );
    }

    // Create JWT token for assessment flow
    const token = jwt.sign(
      {
        student_id: studentRecord.id,
        school_id: school_id,
        grade: parseInt(grade),
        name: student_name,
        type: 'registered'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Log successful registration (for audit)
    console.log(`Student registered: ${student_name} ${student_surname} from ${school.name} (Grade ${grade})`);

    return NextResponse.json({
      success: true,
      student_id: studentRecord.id,
      token,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Student registration error:', error);
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