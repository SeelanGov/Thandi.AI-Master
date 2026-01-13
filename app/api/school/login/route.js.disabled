// MATCHES your existing pattern in /api/rag/query/route.js
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase.js';
import { NextResponse } from 'next/server';

// Add cache busting headers to response
function addCacheHeaders(response) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Cache-Bust', '2026-01-13T16:30:00.000Z');
  return response;
}


export async function POST(request) {
  const supabase = getSupabaseAdmin();
  const { email, password } = await request.json();
  
  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    return addCacheHeaders(NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }));
  }
  
  // Verify school user
  const { data: schoolUser, error: schoolError } = await supabase
    .from('school_users')
    .select('*, schools(*)')
    .eq('user_id', authData.user.id)
    .single();
  
  if (schoolError || !schoolUser) {
    return addCacheHeaders(NextResponse.json({ error: 'Not authorized' }, { status: 403 }));
  }
  
  // Update last login
  await supabase
    .from('school_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', schoolUser.id);
  
  return addCacheHeaders(NextResponse.json({
    user: authData.user,
    school: schoolUser.schools,
    role: schoolUser.role
  }));
}

export async function GET() {
  return addCacheHeaders(NextResponse.json({ 
    message: 'School login endpoint is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
}