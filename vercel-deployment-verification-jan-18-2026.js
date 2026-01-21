#!/usr/bin/env node

/**
 * Comprehensive Vercel Deployment Verification
 * Date: January 18, 2026
 * Purpose: Verify current deployment status and test end-to-end functionality
 */

const { execSync } = require('child_process');
const https = require('https');

console.log('🔍 VERCEL DEPLOYMENT VERIFICATION - January 18, 2026');
console.log('=' .repeat(70));
console.log('');

const results = {
  timestamp: new Date().toISOString(),
  vercelCLI: {},
  deploymentStatus: {},
  endToEndTests: {},
  apiTests: {},
  buildVerification: {},
  summary: {}
};

// ============================================================================
// 1. VERCEL CLI STATUS CHECK
// ============================================================================
console.log('📋 STEP 1: Vercel CLI Status Check');
console.log('-'.repeat(70));

try {
  // Check if Vercel CLI is installed
  console.log('Checking Vercel CLI installation...');
  const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Vercel CLI installed: ${vercelVersion}`);
  results.vercelCLI.installed = true;
  results.vercelCLI.version = vercelVersion;
} catch (error) {
  console.log('❌ Vercel CLI not installed');
  console.log('Install with: npm i -g vercel');
  results.vercelCLI.installed = false;
  results.vercelCLI.error = error.message;
}

console.log('');

// ============================================================================
// 2. LIST DEPLOYMENTS
// ============================================================================
console.log('📋 STEP 2: List Recent Deployments');
console.log('-'.repeat(70));

try {
  console.log('Fetching recent deployments...');
  const deployments = execSync('vercel ls --json', { encoding: 'utf8' });
  const deploymentsData = JSON.parse(deployments);
  
  if (deploymentsData.deployments && deploymentsData.deployments.length > 0) {
    const latest = deploymentsData.deployments[0];
    console.log(`✅ Latest deployment found:`);
    console.log(`   URL: ${latest.url}`);
    console.log(`   State: ${latest.state}`);
    console.log(`   Created: ${new Date(latest.created).toLocaleString()}`);
    console.log(`   Ready: ${latest.ready ? 'Yes' : 'No'}`);
    
    results.deploymentStatus.latest = {
      url: latest.url,
      state: latest.state,
      created: latest.created,
      ready: latest.ready,
      name: latest.name
    };
    
    // Show last 5 deployments
    console.log('');
    console.log('Recent deployments:');
    deploymentsData.deployments.slice(0, 5).forEach((dep, idx) => {
      console.log(`   ${idx + 1}. ${dep.url} - ${dep.state} - ${new Date(dep.created).toLocaleString()}`);
    });
  } else {
    console.log('⚠️ No deployments found');
    results.deploymentStatus.latest = null;
  }
} catch (error) {
  console.log(`❌ Failed to list deployments: ${error.message}`);
  results.deploymentStatus.error = error.message;
}

console.log('');

// ============================================================================
// 3. CHECK PRODUCTION DEPLOYMENT
// ============================================================================
console.log('📋 STEP 3: Check Production Deployment');
console.log('-'.repeat(70));

try {
  console.log('Fetching production deployment info...');
  const prodInfo = execSync('vercel inspect --json', { encoding: 'utf8' });
  const prodData = JSON.parse(prodInfo);
  
  console.log(`✅ Production deployment:`);
  console.log(`   URL: ${prodData.url}`);
  console.log(`   Alias: ${prodData.alias ? prodData.alias.join(', ') : 'None'}`);
  console.log(`   State: ${prodData.state}`);
  console.log(`   Build: ${prodData.readyState}`);
  
  results.deploymentStatus.production = {
    url: prodData.url,
    alias: prodData.alias,
    state: prodData.state,
    readyState: prodData.readyState
  };
} catch (error) {
  console.log(`⚠️ Could not fetch production info: ${error.message}`);
  results.deploymentStatus.productionError = error.message;
}

console.log('');

// ============================================================================
// 4. LOCAL BUILD VERIFICATION
// ============================================================================
console.log('📋 STEP 4: Local Build Verification');
console.log('-'.repeat(70));

try {
  console.log('Running local build...');
  const buildStart = Date.now();
  execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
  const buildTime = ((Date.now() - buildStart) / 1000).toFixed(1);
  
  console.log(`✅ Build successful (${buildTime}s)`);
  results.buildVerification.success = true;
  results.buildVerification.time = buildTime;
} catch (error) {
  console.log(`❌ Build failed: ${error.message}`);
  results.buildVerification.success = false;
  results.buildVerification.error = error.message;
}

console.log('');

// ============================================================================
// 5. TEST SUITE VERIFICATION
// ============================================================================
console.log('📋 STEP 5: Test Suite Verification');
console.log('-'.repeat(70));

try {
  console.log('Running test suite...');
  const testOutput = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' });
  console.log(`✅ All tests passed`);
  results.buildVerification.tests = 'passed';
} catch (error) {
  console.log(`❌ Tests failed: ${error.message}`);
  results.buildVerification.tests = 'failed';
  results.buildVerification.testError = error.message;
}

console.log('');

// ============================================================================
// 6. API ENDPOINT TESTS
// ============================================================================
console.log('📋 STEP 6: API Endpoint Tests');
console.log('-'.repeat(70));

const productionURL = 'thandi-ai.vercel.app';
const apiEndpoints = [
  '/api/health',
  '/api/schools/search?query=test',
  '/api/rag/query'
];

results.apiTests.endpoints = [];

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: productionURL,
      path: path,
      method: 'GET',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          responseTime: Date.now()
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

async function testAllEndpoints() {
  console.log(`Testing endpoints on ${productionURL}...`);
  
  for (const endpoint of apiEndpoints) {
    const result = await testEndpoint(endpoint);
    results.apiTests.endpoints.push(result);
    
    if (result.success) {
      console.log(`✅ ${endpoint} - Status ${result.status}`);
    } else {
      console.log(`❌ ${endpoint} - ${result.error || 'Failed'}`);
    }
  }
}

// ============================================================================
// 7. END-TO-END TESTS
// ============================================================================
console.log('');
console.log('📋 STEP 7: End-to-End Tests');
console.log('-'.repeat(70));

async function testRegistrationFlow() {
  console.log('Testing registration flow...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: productionURL,
      path: '/register',
      method: 'GET',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200 && data.includes('register');
        console.log(success ? '✅ Registration page loads' : '❌ Registration page failed');
        resolve({ success, status: res.statusCode });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Registration page error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Registration page timeout');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

async function testResultsPage() {
  console.log('Testing results page...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: productionURL,
      path: '/results',
      method: 'GET',
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(success ? '✅ Results page loads' : '❌ Results page failed');
        resolve({ success, status: res.statusCode });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Results page error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Results page timeout');
      resolve({ success: false, error: 'Timeout' });
    });
    
    req.end();
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function runVerification() {
  // Test API endpoints
  await testAllEndpoints();
  
  console.log('');
  
  // Test end-to-end flows
  results.endToEndTests.registration = await testRegistrationFlow();
  results.endToEndTests.results = await testResultsPage();
  
  // ============================================================================
  // 8. SUMMARY
  // ============================================================================
  console.log('');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const buildPassed = results.buildVerification.success === true;
  const testsPassed = results.buildVerification.tests === 'passed';
  const apisPassed = results.apiTests.endpoints.every(e => e.success);
  const e2ePassed = results.endToEndTests.registration?.success && results.endToEndTests.results?.success;
  
  console.log('');
  console.log('Build Status:');
  console.log(`  ${buildPassed ? '✅' : '❌'} Local build: ${buildPassed ? 'PASS' : 'FAIL'}`);
  console.log(`  ${testsPassed ? '✅' : '❌'} Test suite: ${testsPassed ? 'PASS' : 'FAIL'}`);
  
  console.log('');
  console.log('Deployment Status:');
  if (results.deploymentStatus.latest) {
    console.log(`  ✅ Latest deployment: ${results.deploymentStatus.latest.state}`);
    console.log(`  ✅ URL: ${results.deploymentStatus.latest.url}`);
    console.log(`  ${results.deploymentStatus.latest.ready ? '✅' : '⚠️'} Ready: ${results.deploymentStatus.latest.ready ? 'Yes' : 'No'}`);
  } else {
    console.log('  ⚠️ No deployment information available');
  }
  
  console.log('');
  console.log('API Tests:');
  const passedAPIs = results.apiTests.endpoints.filter(e => e.success).length;
  const totalAPIs = results.apiTests.endpoints.length;
  console.log(`  ${apisPassed ? '✅' : '❌'} API endpoints: ${passedAPIs}/${totalAPIs} passed`);
  
  console.log('');
  console.log('End-to-End Tests:');
  console.log(`  ${results.endToEndTests.registration?.success ? '✅' : '❌'} Registration flow: ${results.endToEndTests.registration?.success ? 'PASS' : 'FAIL'}`);
  console.log(`  ${results.endToEndTests.results?.success ? '✅' : '❌'} Results page: ${results.endToEndTests.results?.success ? 'PASS' : 'FAIL'}`);
  
  console.log('');
  console.log('Overall Status:');
  const allPassed = buildPassed && testsPassed && apisPassed && e2ePassed;
  console.log(`  ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
  
  results.summary = {
    allPassed,
    buildPassed,
    testsPassed,
    apisPassed,
    e2ePassed,
    timestamp: new Date().toISOString()
  };
  
  console.log('');
  console.log('='.repeat(70));
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    'vercel-deployment-verification-results-jan-18-2026.json',
    JSON.stringify(results, null, 2)
  );
  console.log('');
  console.log('📄 Results saved to: vercel-deployment-verification-results-jan-18-2026.json');
  
  process.exit(allPassed ? 0 : 1);
}

runVerification().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
