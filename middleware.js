import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// TEST MODE - Remove before production!
const TEST_TOKEN = 'test-dashboard-781e55341b449e895517b983f56b8bd6';
const TEST_SCHOOL_DATA = {
  userId: 'test-user-001',
  schoolId: 'ZAF-P-500215340',
  schoolName: 'MT CURRIE SENIOR SECONDARY SCHOOL',
  counselorName: 'Test Principal'
};

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Only protect specific school routes, exclude claim page
  const protectedPaths = ['/school/dashboard', '/school/verify'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  try {
    let tokenData;
    
    // TEST MODE: Check for test token first
    if (token === TEST_TOKEN) {
      console.log('🧪 TEST MODE: Using test token for dashboard access');
      tokenData = TEST_SCHOOL_DATA;
    } else {
      // Regular token verification
      const redisData = await redis.get(`magic:${token}`);
      if (!redisData) {
        console.log(`Invalid token attempted: ${token}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      tokenData = JSON.parse(redisData);
    }
    
    const { userId, schoolId, schoolName, counselorName } = tokenData;
    
    // Add user and school info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-school-id', schoolId);
    requestHeaders.set('x-school-name', schoolName);
    requestHeaders.set('x-counselor-name', counselorName);
    
    console.log(`School access: ${schoolName} (${counselorName}) - ${pathname}`);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

export const config = {
  matcher: [
    '/school/dashboard/:path*',
    '/school/verify/:path*'
    // Explicitly exclude /school/claim from token requirement
  ],
};