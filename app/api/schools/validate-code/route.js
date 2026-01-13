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
        { success: false, error: 'School code is required' },
        { status: 400 }
      );
    }

    return await validateSchoolCode(code);

  } catch (error) {
    console.error('School code validation error:', error);
    
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      
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
        { success: false, error: 'School code is required' },
        { status: 400 }
      );
    }

    return await validateSchoolCode(code);

  } catch (error) {
    console.error('School code validation error:', error);
    
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

// Shared validation logic
async function validateSchoolCode(code) {
  // Validate school code format (basic validation)
  if (code.length < 3) {
    
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
      success: false,
      error: 'School code not found'
    }, { status: 404 });
  }

  // Ensure it's not a primary school
  if (school.type && school.type.toLowerCase().includes('primary')) {
    
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
      success: false,
      error: 'Primary schools are not supported for career assessments'
    }, { status: 400 });
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
    school: {
      school_id: school.school_id,
      name: school.name,
      province: school.province,
      type: school.type,
      status: school.status
    }
  });
}