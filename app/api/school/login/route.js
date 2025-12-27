// MATCHES your existing pattern in /api/rag/query/route.js
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = getSupabaseAdmin();
  const { email, password } = await request.json();
  
  // Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // Verify school user
  const { data: schoolUser, error: schoolError } = await supabase
    .from('school_users')
    .select('*, schools(*)')
    .eq('user_id', authData.user.id)
    .single();
  
  if (schoolError || !schoolUser) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  
  // Update last login
  await supabase
    .from('school_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', schoolUser.id);
  
  return NextResponse.json({
    user: authData.user,
    school: schoolUser.schools,
    role: schoolUser.role
  });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'School login endpoint is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}