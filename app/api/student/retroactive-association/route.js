import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


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
      consent_given = true,
      grade,
      class_name 
    } = body;

    // Validate required fields
    if (!student_id || !school_id) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Student ID and School ID are required' },
        { status: 400 }
      ));
    }

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('student_assessments')
      .select('id, student_name, student_surname, grade')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      ));
    }

    // Verify school exists
    const { data: school, error: schoolError } = await supabase
      .from('school_master')
      .select('school_id, name, type, province')
      .eq('school_id', school_id)
      .single();

    if (schoolError || !school) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      ));
    }

    // Check if association already exists
    const { data: existingAssociation } = await supabase
      .from('school_students')
      .select('id, status')
      .eq('student_id', student_id)
      .eq('school_id', school_id)
      .single();

    if (existingAssociation) {
      // Update existing association
      const { data: updatedAssociation, error: updateError } = await supabase
        .from('school_students')
        .update({
          status: 'active',
          consent_given,
          consent_date: consent_given ? new Date().toISOString() : null,
          grade: grade || student.grade,
          class_name: class_name || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssociation.id)
        .select()
        .single();

      if (updateError) {
        console.error('Association update error:', updateError);
        return addCacheHeaders(NextResponse.json(
          { success: false, error: 'Failed to update association' },
          { status: 500 }
        ));
      }

      // Update student assessment record with school association
      await supabase
        .from('student_assessments')
        .update({
          school_id: school_id,
          assessment_data: {
            ...student.assessment_data,
            retroactive_association: true,
            association_date: new Date().toISOString(),
            school_name: school.name,
            school_type: school.type,
            school_province: school.province
          }
        })
        .eq('id', student_id);

      console.log(`✅ Retroactive association updated: ${student.student_name} ${student.student_surname} → ${school.name}`);

      return addCacheHeaders(NextResponse.json({
        success: true,
        association_id: updatedAssociation.id,
        action: 'updated',
        message: 'Retroactive association updated successfully',
        student_info: {
          name: student.student_name,
          surname: student.student_surname,
          grade: updatedAssociation.grade
        },
        school_info: {
          id: school.school_id,
          name: school.name,
          type: school.type,
          province: school.province
        }
      }));
    }

    // Create new retroactive association
    const { data: newAssociation, error: createError } = await supabase
      .from('school_students')
      .insert({
        school_id: school_id,
        student_id: student_id,
        status: 'active',
        grade: grade || student.grade,
        class_name: class_name || null,
        enrolled_date: new Date().toISOString(),
        consent_given,
        consent_date: consent_given ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Retroactive association creation error:', createError);
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Failed to create retroactive association' },
        { status: 500 }
      ));
    }

    // Update student assessment record with school association
    const { error: assessmentUpdateError } = await supabase
      .from('student_assessments')
      .update({
        school_id: school_id,
        assessment_data: {
          ...student.assessment_data,
          retroactive_association: true,
          association_date: new Date().toISOString(),
          school_name: school.name,
          school_type: school.type,
          school_province: school.province,
          school_student_id: newAssociation.id
        }
      })
      .eq('id', student_id);

    if (assessmentUpdateError) {
      console.error('Assessment update error:', assessmentUpdateError);
      // Don't fail the request, just log the error
    }

    // Record consent if given
    if (consent_given) {
      await supabase
        .from('consent_records')
        .insert({
          student_id: student_id,
          school_id: school_id,
          consent_type: 'retroactive_school_sharing',
          consent_given: true,
          consent_method: 'retroactive_association_api',
          consent_timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        });
    }

    console.log(`✅ Retroactive association created: ${student.student_name} ${student.student_surname} → ${school.name}`);

    return addCacheHeaders(NextResponse.json({
      success: true,
      association_id: newAssociation.id,
      action: 'created',
      message: 'Retroactive association created successfully',
      student_info: {
        name: student.student_name,
        surname: student.student_surname,
        grade: newAssociation.grade
      },
      school_info: {
        id: school.school_id,
        name: school.name,
        type: school.type,
        province: school.province
      }
    }));

  } catch (error) {
    console.error('Retroactive association error:', error);
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
    const school_id = searchParams.get('school_id');

    if (!student_id && !school_id) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Either student_id or school_id is required' },
        { status: 400 }
      ));
    }

    let query = supabase
      .from('school_students')
      .select(`
        *,
        school_master:school_id (school_id, name, type, province),
        student_assessments:student_id (id, student_name, student_surname, grade)
      `);

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    if (school_id) {
      query = query.eq('school_id', school_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Retroactive association retrieval error:', error);
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Failed to retrieve associations' },
        { status: 500 }
      ));
    }

    return addCacheHeaders(NextResponse.json({
      success: true,
      associations: data || [],
      count: data?.length || 0
    }));

  } catch (error) {
    console.error('Retroactive association retrieval error:', error);
    return addCacheHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const association_id = searchParams.get('association_id');
    const student_id = searchParams.get('student_id');
    const school_id = searchParams.get('school_id');

    if (!association_id && (!student_id || !school_id)) {
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Association ID or (student_id + school_id) required' },
        { status: 400 }
      ));
    }

    let query = supabase.from('school_students');

    if (association_id) {
      query = query.delete().eq('id', association_id);
    } else {
      query = query.delete().eq('student_id', student_id).eq('school_id', school_id);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Association deletion error:', error);
      return addCacheHeaders(NextResponse.json(
        { success: false, error: 'Failed to delete association' },
        { status: 500 }
      ));
    }

    console.log(`🗑️ Retroactive association deleted: ${data?.length || 0} records`);

    return addCacheHeaders(NextResponse.json({
      success: true,
      deleted_count: data?.length || 0,
      message: 'Association deleted successfully'
    }));

  } catch (error) {
    console.error('Association deletion error:', error);
    return addCacheHeaders(NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    ));
  }
}