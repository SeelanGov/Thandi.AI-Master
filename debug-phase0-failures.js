#!/usr/bin/env node

/**
 * DEBUG PHASE 0 FAILURES - SYSTEMATIC TROUBLESHOOTING
 * 
 * Investigate the 3 failing tests to achieve 100% success:
 * 1. RLS policies active
 * 2. Complete registration flow  
 * 3. School-student connection
 */

const https = require('https');

const BASE_URL = 'https://thandi-ai-master-eiz3vruvc-thandiai-projects.vercel.app';

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function debugTest(name, testFunction) {
  console.log(`\n🔍 DEBUGGING: ${name}`);
  console.log('='.repeat(50));
  
  try {
    const result = await testFunction();
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Success: ${result.success}`);
    console.log(`Body Length: ${result.body?.length || 0}`);
    console.log(`Body Preview: ${result.body?.substring(0, 200)}...`);
    
    if (result.headers) {
      console.log(`Content-Type: ${result.headers['content-type']}`);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { error: error.message, statusCode: 0 };
  }
}

async function main() {
  console.log('🚀 DEBUGGING PHASE 0 FAILURES');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  
  // Test 1: RLS policies active - Check what the API actually returns
  await debugTest('RLS Policies Test (GET /api/student/register)', async () => {
    return await httpRequest(`${BASE_URL}/api/student/register`, {
      method: 'GET'
    });
  });
  
  // Test 2: Complete registration flow - Check registration page content
  await debugTest('Registration Flow Test (GET /register)', async () => {
    return await httpRequest(`${BASE_URL}/register`);
  });
  
  // Test 3: School-student connection - Check school request API
  await debugTest('School Connection Test (POST /api/schools/request-addition)', async () => {
    return await httpRequest(`${BASE_URL}/api/schools/request-addition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolName: 'Test School' })
    });
  });
  
  // Additional diagnostic tests
  console.log('\n🔬 ADDITIONAL DIAGNOSTICS');
  console.log('='.repeat(60));
  
  // Test what methods are allowed on student/register
  await debugTest('Student Register OPTIONS', async () => {
    return await httpRequest(`${BASE_URL}/api/student/register`, {
      method: 'OPTIONS'
    });
  });
  
  // Test registration page with different approach
  await debugTest('Registration Page HEAD request', async () => {
    return await httpRequest(`${BASE_URL}/register`, {
      method: 'HEAD'
    });
  });
  
  // Test if school request API exists
  await debugTest('School Request API HEAD', async () => {
    return await httpRequest(`${BASE_URL}/api/schools/request-addition`, {
      method: 'HEAD'
    });
  });
  
  console.log('\n📊 DIAGNOSIS COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);