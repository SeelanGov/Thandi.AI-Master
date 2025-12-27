import { getSupabase } from '@/lib/supabase.js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const schoolId = request.headers.get('x-school-id');
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    // Build query for students with their assessment data
    let query = supabase
      .from('students')
      .select(`
        id, 
        first_name, 
        last_name, 
        email,
        grade, 
        class_name, 
        enrollment_status,
        assessments(
          id,
          completed_at,
          at_risk_status,
          at_risk_reasons,
          career_matches
        )
      `)
      .eq('school_id', schoolId)
      .eq('enrollment_status', 'active');

    // Add search filter if provided
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,class_name.ilike.%${search}%`);
    }

    const { data: students, error } = await query
      .order('grade', { ascending: true })
      .order('first_name', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Students query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(students || []);

  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}