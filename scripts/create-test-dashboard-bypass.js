#!/usr/bin/env node

/**
 * Create temporary bypass for testing school dashboard
 * This creates a test token and provides direct access URLs
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

console.log('🔧 Creating Test Dashboard Bypass...\n');

async function createTestBypass() {
  // Generate test token
  const testToken = crypto.randomBytes(32).toString('hex');
  
  // Test school data
  const testSchoolData = {
    userId: 'test-user-001',
    schoolId: 'ZAF-P-500215340',
    schoolName: 'MT CURRIE SENIOR SECONDARY SCHOOL',
    counselorName: 'Test Principal',
    email: 'test@mtcurrie.kzn.gov.za',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  try {
    // Store test token in Redis
    await redis.set(`magic:${testToken}`, JSON.stringify(testSchoolData), {
      ex: 24 * 60 * 60 // 24 hours expiry
    });
    
    console.log('✅ Test bypass token created successfully!');
    console.log('\n📋 Test School Details:');
    console.log(`   School: ${testSchoolData.schoolName}`);
    console.log(`   ID: ${testSchoolData.schoolId}`);
    console.log(`   Principal: ${testSchoolData.counselorName}`);
    console.log(`   Email: ${testSchoolData.email}`);
    
    console.log('\n🔗 Direct Dashboard Access URLs:');
    console.log(`   Dashboard: http://localhost:3000/school/dashboard?token=${testToken}`);
    console.log(`   Verify Page: http://localhost:3000/school/verify?token=${testToken}`);
    
    console.log('\n⏰ Token expires in 24 hours');
    console.log('\n🚨 DEVELOPMENT ONLY - Remove before production!');
    
    return testToken;
    
  } catch (error) {
    console.error('❌ Error creating test bypass:', error);
    return null;
  }
}

createTestBypass().catch(console.error);