#!/usr/bin/env node

/**
 * Enable test mode for dashboard access
 * Creates a temporary bypass in middleware for testing
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('🔧 Enabling Dashboard Test Mode...\n');

// Generate a test token
const testToken = 'test-dashboard-' + crypto.randomBytes(16).toString('hex');

// Read current middleware
const middlewarePath = path.join(process.cwd(), 'middleware.js');
const currentMiddleware = fs.readFileSync(middlewarePath, 'utf8');

// Create backup
const backupPath = path.join(process.cwd(), 'middleware.js.backup');
fs.writeFileSync(backupPath, currentMiddleware);

// Create test mode middleware
const testModeMiddleware = `import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// TEST MODE - Remove before production!
const TEST_TOKEN = '${testToken}';
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
      const redisData = await redis.get(\`magic:\${token}\`);
      if (!redisData) {
        console.log(\`Invalid token attempted: \${token}\`);
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
    
    console.log(\`School access: \${schoolName} (\${counselorName}) - \${pathname}\`);
    
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
};`;

// Write test mode middleware
fs.writeFileSync(middlewarePath, testModeMiddleware);

console.log('✅ Test mode enabled successfully!');
console.log('\n📋 Test School Details:');
console.log('   School: MT CURRIE SENIOR SECONDARY SCHOOL');
console.log('   ID: ZAF-P-500215340');
console.log('   Principal: Test Principal');

console.log('\n🔗 Direct Dashboard Access URL:');
console.log(`   http://localhost:3000/school/dashboard?token=${testToken}`);

console.log('\n📝 Test Token:');
console.log(`   ${testToken}`);

console.log('\n⚠️  IMPORTANT:');
console.log('   - Middleware backup saved as middleware.js.backup');
console.log('   - This is for TESTING ONLY');
console.log('   - Run disable-dashboard-test-mode.js when done');

// Create disable script
const disableScript = `#!/usr/bin/env node

/**
 * Disable test mode and restore original middleware
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 Disabling Dashboard Test Mode...');

const middlewarePath = path.join(process.cwd(), 'middleware.js');
const backupPath = path.join(process.cwd(), 'middleware.js.backup');

if (fs.existsSync(backupPath)) {
  const originalMiddleware = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(middlewarePath, originalMiddleware);
  fs.unlinkSync(backupPath);
  
  console.log('✅ Original middleware restored');
  console.log('✅ Test mode disabled');
  console.log('✅ Backup file removed');
} else {
  console.log('❌ Backup file not found');
}
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'disable-dashboard-test-mode.js'), disableScript);

console.log('\n🎯 Ready for dashboard testing!');