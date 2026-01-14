import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

function generateMagicToken(schoolId, email) {
  // Simple token generation using crypto instead of JWT
  const payload = JSON.stringify({
    schoolId,
    email,
    type: 'school_login',
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  });
  
  const secret = process.env.MAGIC_LINK_SECRET || 'thandi_school_dashboard_2025_secure_key_change_in_prod';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

export async function POST(request) {
  try {
    const { email, school_id } = await request.json();

    // Validate required fields
    if (!email) {
      return addCacheHeaders(NextResponse.json({
        error: 'Email address is required'
      }, { status: 400 }));
    }

    // Find school by email and optionally school_id
    let query = supabase
      .from('school_master')
      .select('*')
      .eq('principal_email', email)
      .eq('status', 'claimed'); // Only allow login for claimed schools

    // If school_id provided, add it to the query for additional validation
    if (school_id) {
      query = query.eq('school_id', school_id);
    }

    const { data: schools, error: schoolError } = await query;

    if (schoolError) {
      console.error('Database error:', schoolError);
      return addCacheHeaders(NextResponse.json({
        error: 'Database error occurred'
      }, { status: 500 }));
    }

    if (!schools || schools.length === 0) {
      return addCacheHeaders(NextResponse.json({
        error: 'No claimed school found for this email address'
      }, { status: 404 }));
    }

    // If multiple schools found and no school_id specified, return error
    if (schools.length > 1 && !school_id) {
      return addCacheHeaders(NextResponse.json({
        error: 'Multiple schools found for this email. Please specify your school ID.',
        schools: schools.map(s => ({
          school_id: s.school_id,
          name: s.name,
          province: s.province
        }))
      }, { status: 400 }));
    }

    const school = schools[0];

    // Generate magic link token
    const token = generateMagicToken(school.school_id, email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const magicLink = `${baseUrl}/school/dashboard/simple-page?token=${token}`;

    // Store magic link token
    const { error: tokenError } = await supabase
      .from('school_magic_links')
      .insert({
        school_id: school.school_id,
        email: email,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        type: 'login' // Distinguish from claim tokens
      });

    if (tokenError) {
      console.error('Error storing magic link:', tokenError);
      return addCacheHeaders(NextResponse.json({
        error: 'Failed to generate login link'
      }, { status: 500 }));
    }

    // Update last login attempt
    await supabase
      .from('school_master')
      .update({
        last_login_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('school_id', school.school_id);

    // In production, send email here
    // await sendMagicLinkEmail(email, magicLink, school.name);

    return addCacheHeaders(NextResponse.json({
      success: true,
      message: `Login link sent to ${email}`,
      school: {
        school_id: school.school_id,
        name: school.name,
        province: school.province
      },
      // For development only - remove in production
      magic_link: magicLink,
      expires_in: '24 hours'
    }));

  } catch (error) {
    console.error('School login API error:', error);
    return addCacheHeaders(NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 }));
  }
}

export async function GET() {
  return addCacheHeaders(NextResponse.json({ 
    message: 'School login endpoint is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
    description: 'POST to this endpoint with email and optional school_id to receive a magic login link'
  }));
}