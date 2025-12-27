import { getSupabase } from '@/lib/supabase.js';
import { NextResponse } from 'next/server';

// Single auth context for both student and school users
export const getUserRole = async (userId) => {
  const supabase = getSupabase();
  
  // Check if school user
  const { data: schoolUser } = await supabase
    .from('school_users')
    .select('role, schools(*)')
    .eq('user_id', userId)
    .single();
  
  if (schoolUser) {
    return { role: schoolUser.role, school: schoolUser.schools };
  }
  
  // Default to student role
  return { role: 'student', school: null };
};

// Middleware for school routes
export const requireSchoolAuth = async (request) => {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const { role, school } = await getUserRole(user.id);
  
  if (!['counselor', 'principal'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Add school ID to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-school-id', school.id);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};