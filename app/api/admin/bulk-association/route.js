import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/admin/bulk-association
 * Administrative endpoint for bulk student-school association
 * Used by the bulk association tool for administrative operations
 */
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      studentId, 
      schoolId, 
      consentGiven = true, 
      consentMethod = 'admin_bulk_association',
      consentContext = 'administrative_bulk_linking'
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
    const userAgent = request.headers.get('user-agent') || 'Admin Tool';

    console.log(`🔄 Processing bulk association: Student ${studentId} → School ${schoolId}`);

    // Step 1: Verify student exists and doesn't have school association
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('id, email, phone, grade, school_id')
      .eq('id', studentId)
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
        p_student_name: 'Bulk', // Placeholder for bulk operations
        p_student_surname: 'Import',
        p_school_id: schoolId,
        p_grade: student.grade || 12,
        p_consent_given: consentGiven,
        p_consent_method: consentMethod,
        p_consent_metadata: {
          ip_address: clientIP,
          user_agent: userAgent,
          context: consentContext,
          timestamp: new Date().toISOString(),
          admin_initiated: true,
          bulk_operation: true
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
    console.log(`✅ Bulk association complete: Student ${student.id} → School ${school.name} (${assessmentCount} assessments updated)`);

    // Step 7: Audit log
    const auditData = {
      action: 'bulk_association_created',
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

    console.log('📋 Bulk Association Audit:', JSON.stringify(auditData, null, 2));

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
    console.error('Bulk association error:', error);
    
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
 * GET /api/admin/bulk-association
 * Get statistics for bulk association operations
 */
export async function GET(request) {
  try {
    // Get unassociated students count
    const { count: unassociatedCount } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .is('school_id', null);

    // Get associated students count
    const { count: associatedCount } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .not('school_id', 'is', null);

    // Get total assessments without school association
    const { count: unassociatedAssessments } = await supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .is('school_id', null);

    // Get schools count
    const { count: schoolsCount } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });

    // Get recent associations (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count: recentAssociations } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        students: {
          unassociated: unassociatedCount || 0,
          associated: associatedCount || 0,
          total: (unassociatedCount || 0) + (associatedCount || 0)
        },
        assessments: {
          unassociated: unassociatedAssessments || 0
        },
        schools: {
          total: schoolsCount || 0
        },
        recent_associations: recentAssociations || 0,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk association stats error:', error);
    
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