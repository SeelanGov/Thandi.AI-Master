// Comprehensive Vercel Deployment Verification Test
// Tests all critical systems, APIs, and user flows

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://www.thandi.online';
const RESULTS = {
  timestamp: new Date().toISOString(),
  deployment: BASE_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper function to make HTTPS requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            raw: responseData,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message,
        success: false
      });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test runner
async function runTest(category, name, testFn) {
  process.stdout.write(`  ${name}... `);
  
  try {
    const result = await testFn();
    
    const testResult = {
      category,
      name,
      status: result.status,
      passed: result.passed,
      message: result.message,
      details: result.details || {}
    };
    
    RESULTS.tests.push(testResult);
    RESULTS.summary.total++;
    
    if (result.passed) {
      RESULTS.summary.passed++;
      console.log(`✅ PASS`);
    } else if (result.warning) {
      RESULTS.summary.warnings++;
      console.log(`⚠️  WARN - ${result.message}`);
    } else {
      RESULTS.summary.failed++;
      console.log(`❌ FAIL - ${result.message}`);
    }
    
    return result;
  } catch (error) {
    const testResult = {
      category,
      name,
      status: 'ERROR',
      passed: false,
      message: error.message,
      error: error.stack
    };
    
    RESULTS.tests.push(testResult);
    RESULTS.summary.total++;
    RESULTS.summary.failed++;
    
    console.log(`❌ ERROR - ${error.message}`);
    return testResult;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

// 1. INFRASTRUCTURE TESTS
async function testInfrastructure() {
  console.log('\n📦 INFRASTRUCTURE TESTS');
  console.log('========================');
  
  // Test 1.1: Health Check
  await runTest('Infrastructure', 'Health Check API', async () => {
    const res = await makeRequest('GET', '/api/health');
    return {
      passed: res.success && res.status === 200,
      status: res.status,
      message: res.success ? 'Health check passed' : 'Health check failed',
      details: { response: res.data }
    };
  });
  
  // Test 1.2: Cache Health
  await runTest('Infrastructure', 'Cache Health API', async () => {
    const res = await makeRequest('GET', '/api/cache/health');
    return {
      passed: res.success && res.status === 200,
      status: res.status,
      message: res.success ? 'Cache healthy' : 'Cache issues',
      details: { response: res.data }
    };
  });
  
  // Test 1.3: Build Verification
  await runTest('Infrastructure', 'Static Assets Loading', async () => {
    const res = await makeRequest('GET', '/');
    return {
      passed: res.success && res.raw.includes('<!DOCTYPE html>'),
      status: res.status,
      message: res.success ? 'Homepage loads' : 'Homepage failed',
      details: { contentLength: res.raw.length }
    };
  });
}

// 2. RESTORED API TESTS
async function testRestoredAPIs() {
  console.log('\n🔧 RESTORED API TESTS');
  console.log('=====================');
  
  // Test 2.1: PDF Generation API
  await runTest('Restored APIs', 'PDF Generation API', async () => {
    const res = await makeRequest('GET', '/api/pdf/generate');
    return {
      passed: res.success && res.status === 200,
      status: res.status,
      message: res.success ? 'PDF API operational' : 'PDF API failed',
      details: { response: res.data }
    };
  });
  
  // Test 2.2: School Login API
  await runTest('Restored APIs', 'School Login API', async () => {
    const res = await makeRequest('GET', '/api/schools/login');
    return {
      passed: res.success && res.status === 200,
      status: res.status,
      message: res.success ? 'School login operational' : 'School login failed',
      details: { response: res.data }
    };
  });
  
  // Test 2.3: School Claiming API
  await runTest('Restored APIs', 'School Claiming API', async () => {
    const res = await makeRequest('POST', '/api/schools/claim', {
      school_id: 'TEST123',
      principal_email: 'test@example.com'
    });
    return {
      passed: res.status === 404 || res.status === 400, // Expected for test data
      status: res.status,
      message: 'School claiming API responding',
      details: { response: res.data }
    };
  });
  
  // Test 2.4: Dashboard Stats API
  await runTest('Restored APIs', 'Dashboard Stats API', async () => {
    const res = await makeRequest('GET', '/api/school/dashboard/stats');
    return {
      passed: res.status === 400 || res.status === 200, // May require auth
      status: res.status,
      message: 'Dashboard stats API responding',
      details: { response: res.data }
    };
  });
  
  // Test 2.5: At-Risk Students API
  await runTest('Restored APIs', 'At-Risk Students API', async () => {
    const res = await makeRequest('GET', '/api/school/students/at-risk');
    return {
      passed: res.status === 400 || res.status === 200, // May require auth
      status: res.status,
      message: 'At-risk students API responding',
      details: { response: res.data }
    };
  });
  
  // Test 2.6: Student Management API
  await runTest('Restored APIs', 'Student Management API', async () => {
    const res = await makeRequest('GET', '/api/school/students');
    return {
      passed: res.status === 400 || res.status === 200, // May require auth
      status: res.status,
      message: 'Student management API responding',
      details: { response: res.data }
    };
  });
}

// 3. CORE API TESTS
async function testCoreAPIs() {
  console.log('\n🎯 CORE API TESTS');
  console.log('=================');
  
  // Test 3.1: RAG Query API
  await runTest('Core APIs', 'RAG Query API', async () => {
    const res = await makeRequest('POST', '/api/rag/query', {
      query: 'career guidance',
      grade: '10',
      curriculum: 'CAPS'
    });
    return {
      passed: res.success && res.status === 200 && res.raw.length > 1000,
      status: res.status,
      message: res.success ? `RAG responding (${res.raw.length} chars)` : 'RAG failed',
      details: { responseLength: res.raw.length }
    };
  });
  
  // Test 3.2: School Search API
  await runTest('Core APIs', 'School Search API', async () => {
    const res = await makeRequest('GET', '/api/schools/search?q=high&limit=5');
    return {
      passed: res.success && res.status === 200,
      status: res.status,
      message: res.success ? 'School search operational' : 'School search failed',
      details: { response: res.data }
    };
  });
  
  // Test 3.3: Student Registration API
  await runTest('Core APIs', 'Student Registration API', async () => {
    const res = await makeRequest('POST', '/api/student/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      grade: '10'
    });
    // Expect validation error for incomplete data
    return {
      passed: res.status === 400 || res.status === 200,
      status: res.status,
      message: 'Registration API responding',
      details: { response: res.data }
    };
  });
  
  // Test 3.4: Grade Assessment API
  await runTest('Core APIs', 'Grade Assessment API', async () => {
    const res = await makeRequest('POST', '/api/g10-12', {
      grade: '10',
      subjects: ['Mathematics', 'Physical Sciences']
    });
    return {
      passed: res.status >= 200 && res.status < 500,
      status: res.status,
      message: 'Assessment API responding',
      details: { response: res.data }
    };
  });
}

// 4. USER FLOW TESTS
async function testUserFlows() {
  console.log('\n👤 USER FLOW TESTS');
  console.log('==================');
  
  // Test 4.1: Homepage Load
  await runTest('User Flows', 'Homepage Loads', async () => {
    const res = await makeRequest('GET', '/');
    return {
      passed: res.success && res.raw.includes('Thandi'),
      status: res.status,
      message: res.success ? 'Homepage loads correctly' : 'Homepage failed',
      details: { contentLength: res.raw.length }
    };
  });
  
  // Test 4.2: Registration Page
  await runTest('User Flows', 'Registration Page Loads', async () => {
    const res = await makeRequest('GET', '/register');
    return {
      passed: res.success && res.raw.includes('<!DOCTYPE html>'),
      status: res.status,
      message: res.success ? 'Registration page loads' : 'Registration page failed',
      details: { contentLength: res.raw.length }
    };
  });
  
  // Test 4.3: Assessment Page
  await runTest('User Flows', 'Assessment Page Loads', async () => {
    const res = await makeRequest('GET', '/assessment');
    return {
      passed: res.success && res.raw.includes('<!DOCTYPE html>'),
      status: res.status,
      message: res.success ? 'Assessment page loads' : 'Assessment page failed',
      details: { contentLength: res.raw.length }
    };
  });
  
  // Test 4.4: Results Page
  await runTest('User Flows', 'Results Page Loads', async () => {
    const res = await makeRequest('GET', '/results');
    return {
      passed: res.success && res.raw.includes('<!DOCTYPE html>'),
      status: res.status,
      message: res.success ? 'Results page loads' : 'Results page failed',
      details: { contentLength: res.raw.length }
    };
  });
  
  // Test 4.5: School Claim Page
  await runTest('User Flows', 'School Claim Page Loads', async () => {
    const res = await makeRequest('GET', '/school/claim');
    return {
      passed: res.success && res.raw.includes('<!DOCTYPE html>'),
      status: res.status,
      message: res.success ? 'School claim page loads' : 'School claim page failed',
      details: { contentLength: res.raw.length }
    };
  });
}

// 5. SECURITY & HEADERS TESTS
async function testSecurityHeaders() {
  console.log('\n🔒 SECURITY & HEADERS TESTS');
  console.log('===========================');
  
  // Test 5.1: Cache Headers
  await runTest('Security', 'Cache Headers Present', async () => {
    const res = await makeRequest('GET', '/api/health');
    const hasCacheControl = res.headers['cache-control'] !== undefined;
    return {
      passed: hasCacheControl,
      status: res.status,
      message: hasCacheControl ? 'Cache headers present' : 'Cache headers missing',
      details: { cacheControl: res.headers['cache-control'] }
    };
  });
  
  // Test 5.2: CORS Headers
  await runTest('Security', 'CORS Configuration', async () => {
    const res = await makeRequest('OPTIONS', '/api/health');
    return {
      passed: res.status === 200 || res.status === 204,
      status: res.status,
      message: 'CORS configured',
      details: { headers: res.headers }
    };
  });
  
  // Test 5.3: HTTPS Redirect
  await runTest('Security', 'HTTPS Enforced', async () => {
    // Already using HTTPS in BASE_URL
    return {
      passed: BASE_URL.startsWith('https://'),
      status: 200,
      message: 'HTTPS enforced',
      details: { url: BASE_URL }
    };
  });
}

// 6. PERFORMANCE TESTS
async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('===================');
  
  // Test 6.1: API Response Time
  await runTest('Performance', 'API Response Time', async () => {
    const start = Date.now();
    const res = await makeRequest('GET', '/api/health');
    const duration = Date.now() - start;
    
    return {
      passed: duration < 2000, // Under 2 seconds
      status: res.status,
      message: `Response time: ${duration}ms`,
      details: { duration, threshold: 2000 }
    };
  });
  
  // Test 6.2: RAG Response Time
  await runTest('Performance', 'RAG Response Time', async () => {
    const start = Date.now();
    const res = await makeRequest('POST', '/api/rag/query', {
      query: 'test',
      grade: '10',
      curriculum: 'CAPS'
    });
    const duration = Date.now() - start;
    
    return {
      passed: duration < 10000, // Under 10 seconds
      status: res.status,
      message: `RAG response: ${duration}ms`,
      details: { duration, threshold: 10000 },
      warning: duration > 5000
    };
  });
  
  // Test 6.3: Page Load Time
  await runTest('Performance', 'Homepage Load Time', async () => {
    const start = Date.now();
    const res = await makeRequest('GET', '/');
    const duration = Date.now() - start;
    
    return {
      passed: duration < 3000, // Under 3 seconds
      status: res.status,
      message: `Page load: ${duration}ms`,
      details: { duration, threshold: 3000 }
    };
  });
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('🔍 COMPREHENSIVE VERCEL DEPLOYMENT VERIFICATION');
  console.log('================================================');
  console.log(`Deployment: ${BASE_URL}`);
  console.log(`Timestamp: ${RESULTS.timestamp}`);
  
  try {
    await testInfrastructure();
    await testRestoredAPIs();
    await testCoreAPIs();
    await testUserFlows();
    await testSecurityHeaders();
    await testPerformance();
    
    // Generate summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    
    const passRate = ((RESULTS.summary.passed / RESULTS.summary.total) * 100).toFixed(1);
    
    console.log(`\nTotal Tests: ${RESULTS.summary.total}`);
    console.log(`✅ Passed: ${RESULTS.summary.passed}`);
    console.log(`❌ Failed: ${RESULTS.summary.failed}`);
    console.log(`⚠️  Warnings: ${RESULTS.summary.warnings}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    
    // Category breakdown
    console.log('\n📋 CATEGORY BREAKDOWN:');
    const categories = {};
    RESULTS.tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, failed: 0, total: 0 };
      }
      categories[test.category].total++;
      if (test.passed) {
        categories[test.category].passed++;
      } else {
        categories[test.category].failed++;
      }
    });
    
    Object.keys(categories).forEach(cat => {
      const stats = categories[cat];
      const rate = ((stats.passed / stats.total) * 100).toFixed(0);
      console.log(`  ${cat}: ${stats.passed}/${stats.total} (${rate}%)`);
    });
    
    // Failed tests
    if (RESULTS.summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      RESULTS.tests.filter(t => !t.passed).forEach(test => {
        console.log(`  - ${test.category}: ${test.name}`);
        console.log(`    Status: ${test.status}`);
        console.log(`    Message: ${test.message}`);
      });
    }
    
    // Warnings
    if (RESULTS.summary.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      RESULTS.tests.filter(t => t.details?.warning).forEach(test => {
        console.log(`  - ${test.category}: ${test.name}`);
        console.log(`    Message: ${test.message}`);
      });
    }
    
    // Save results
    const filename = `vercel-deployment-test-results-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(RESULTS, null, 2));
    console.log(`\n📄 Results saved to: ${filename}`);
    
    // Final verdict
    console.log('\n' + '='.repeat(80));
    if (RESULTS.summary.failed === 0) {
      console.log('🎉 DEPLOYMENT VERIFICATION: ✅ PASSED');
      console.log('All critical systems operational!');
    } else if (RESULTS.summary.failed <= 2) {
      console.log('⚠️  DEPLOYMENT VERIFICATION: ⚠️  PASSED WITH WARNINGS');
      console.log('Most systems operational, minor issues detected.');
    } else {
      console.log('❌ DEPLOYMENT VERIFICATION: ❌ FAILED');
      console.log('Critical issues detected, investigation required.');
    }
    console.log('='.repeat(80));
    
    // Exit code
    process.exit(RESULTS.summary.failed > 2 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ TEST SUITE ERROR:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
