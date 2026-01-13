import { getSupabase } from '@/lib/supabase.js';
import { NextResponse } from 'next/server';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


export async function GET(request) {
  try {
    const supabase = getSupabase();
    const schoolId = request.headers.get('x-school-id');
    
    if (!schoolId) {
      return addCacheHeaders(NextResponse.json({ error: 'School ID required' }, { status: 400 }));
    }

    // Get at-risk students for this school
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        id, 
        first_name, 
        last_name, 
        email,
        grade, 
        class_name,
        assessments!inner(at_risk_status, at_risk_reasons)
      `)
      .eq('school_id', schoolId)
      .in('assessments.at_risk_status', ['red', 'yellow'])
      .order('grade', { ascending: true })
      .limit(10);

    if (error) {
      console.error('At-risk students query error:', error);
      return addCacheHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
    }

    // Transform data to flatten assessment info
    const transformedStudents = students.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      grade: student.grade,
      class_name: student.class_name,
      at_risk_status: student.assessments[0]?.at_risk_status,
      at_risk_reasons: student.assessments[0]?.at_risk_reasons || []
    }));

    return addCacheHeaders(NextResponse.json(transformedStudents));

  } catch (error) {
    console.error('At-risk students API error:', error);
    return addCacheHeaders(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}