import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'School code is required' },
        { status: 400 }
      );
    }

    return await validateSchoolCode(code);

  } catch (error) {
    console.error('School code validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'School code is required' },
        { status: 400 }
      );
    }

    return await validateSchoolCode(code);

  } catch (error) {
    console.error('School code validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Shared validation logic
async function validateSchoolCode(code) {
  // Validate school code format (basic validation)
  if (code.length < 3) {
    return NextResponse.json(
      { success: false, error: 'School code must be at least 3 characters' },
      { status: 400 }
    );
  }

  // Search for school by code
  const { data: school, error } = await supabase
    .from('school_master')
    .select('school_id, name, province, type, status')
    .eq('school_id', code)
    .single();

  if (error || !school) {
    return NextResponse.json({
      success: false,
      error: 'School code not found'
    }, { status: 404 });
  }

  // Ensure it's not a primary school
  if (school.type && school.type.toLowerCase().includes('primary')) {
    return NextResponse.json({
      success: false,
      error: 'Primary schools are not supported for career assessments'
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    school: {
      school_id: school.school_id,
      name: school.name,
      province: school.province,
      type: school.type,
      status: school.status
    }
  });
}