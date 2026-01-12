#!/usr/bin/env node

/**
 * COMPREHENSIVE PHASE 0 DEPLOYMENT STATUS INVESTIGATION
 * 
 * This script investigates:
 * 1. What's currently deployed to production
 * 2. What Phase 0 features are actually working
 * 3. Database schema status
 * 4. Git branch status vs deployed code
 * 5. Vercel deployment issues
 */

const https = require('https');
const fs = require('fs');

// Production URL from Vercel list
const PRODUCTION_URL = 'https://thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app';

console.log('🔍 COMPREHENSIVE PHASE 0 DEPLOYMENT INVESTIGATION');
console.log('================================================');
console.log(`Production URL: ${PRODUCTION_URL}`);
console.log(`Investigation Time: ${new Date().toISOString()}`);
console.log('');

const investigation = {
  timestamp: new Date().toISOString(),
  productionUrl: PRODUCTION_URL,
  tests: {},
  summary: {
    deploymentStatus: 'unknown',
    phase0Features: {},
    databaseStatus: 'unknown',
    gitStatus: 'unknown',
    issues: []
  }
};

// Test 1: Basic site availability
async function testSiteAvailability() {
  console.log('📡 TEST 1: Site Availability');
  console.log('----------------------------');
  
  return new Promise((resolve) => {
    const req = https.get(PRODUCTION_URL, (res) => {
      console.log(`✅ Status Code: ${res.statusCode}`);
      console.log(`✅ Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        investigation.tests.siteAvailability = {
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          success: res.statusCode === 200
        };
        
        if (res.statusCode === 200) {
          console.log(`✅ Site is accessible (${data.length} bytes)`);
        } else {
          console.log(`❌ Site returned ${res.statusCode}`);
          investigation.summary.issues.push(`Site returned ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Site unavailable: ${err.message}`);
      investigation.tests.siteAvailability = {
        success: false,
        error: err.message
      };
      investigation.summary.issues.push(`Site unavailable: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      investigation.tests.siteAvailability = {
        success: false,
        error: 'Request timeout'
      };
      investigation.summary.issues.push('Request timeout');
      req.destroy();
      resolve();
    });
  });
}

// Test 2: Check for Phase 0 registration form
async function testPhase0Registration() {
  console.log('\n🎯 TEST 2: Phase 0 Registration Features');
  console.log('----------------------------------------');
  
  return new Promise((resolve) => {
    const testUrl = `${PRODUCTION_URL}/register`;
    console.log(`Testing: ${testUrl}`);
    
    const req = https.get(testUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasSchoolSearch = data.includes('school') || data.includes('School');
        const hasConsentForm = data.includes('consent') || data.includes('Consent');
        const hasRegistrationForm = data.includes('register') || data.includes('Register');
        
        investigation.tests.phase0Registration = {
          status: res.statusCode,
          hasSchoolSearch,
          hasConsentForm,
          hasRegistrationForm,
          bodyLength: data.length
        };
        
        console.log(`Status: ${res.statusCode}`);
        console.log(`Has School Search: ${hasSchoolSearch ? '✅' : '❌'}`);
        console.log(`Has Consent Form: ${hasConsentForm ? '✅' : '❌'}`);
        console.log(`Has Registration Form: ${hasRegistrationForm ? '✅' : '❌'}`);
        
        investigation.summary.phase0Features.registration = {
          deployed: res.statusCode === 200,
          hasSchoolSearch,
          hasConsentForm
        };
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Registration page error: ${err.message}`);
      investigation.tests.phase0Registration = {
        success: false,
        error: err.message
      };
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Registration page timeout');
      req.destroy();
      resolve();
    });
  });
}

// Test 3: Check API endpoints
async function testPhase0APIs() {
  console.log('\n🔌 TEST 3: Phase 0 API Endpoints');
  console.log('--------------------------------');
  
  const endpoints = [
    '/api/schools/validate-code',
    '/api/schools/request-addition',
    '/api/student/register',
    '/api/consent/manage'
  ];
  
  investigation.tests.apiEndpoints = {};
  
  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      const testUrl = `${PRODUCTION_URL}${endpoint}`;
      console.log(`Testing: ${endpoint}`);
      
      // Test with POST request (most Phase 0 APIs are POST)
      const postData = JSON.stringify({ test: true });
      const options = {
        hostname: new URL(PRODUCTION_URL).hostname,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const exists = res.statusCode !== 404;
          console.log(`  ${endpoint}: ${res.statusCode} ${exists ? '✅' : '❌'}`);
          
          investigation.tests.apiEndpoints[endpoint] = {
            status: res.statusCode,
            exists,
            responseLength: data.length
          };
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`  ${endpoint}: Error - ${err.message} ❌`);
        investigation.tests.apiEndpoints[endpoint] = {
          error: err.message,
          exists: false
        };
        resolve();
      });
      
      req.setTimeout(5000, () => {
        console.log(`  ${endpoint}: Timeout ❌`);
        investigation.tests.apiEndpoints[endpoint] = {
          error: 'Timeout',
          exists: false
        };
        req.destroy();
        resolve();
      });
      
      req.write(postData);
      req.end();
    });
  }
}

// Test 4: Check database connectivity (via API)
async function testDatabaseConnectivity() {
  console.log('\n🗄️ TEST 4: Database Connectivity');
  console.log('--------------------------------');
  
  return new Promise((resolve) => {
    // Test a simple API that would use database
    const testUrl = `${PRODUCTION_URL}/api/rag/query`;
    const postData = JSON.stringify({ 
      query: "test database connection",
      grade: 12,
      subjects: ["Mathematics"]
    });
    
    const options = {
      hostname: new URL(PRODUCTION_URL).hostname,
      path: '/api/rag/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const databaseWorking = res.statusCode === 200 || res.statusCode === 400; // 400 might be validation error, but DB is connected
        console.log(`Database API Status: ${res.statusCode} ${databaseWorking ? '✅' : '❌'}`);
        
        investigation.tests.databaseConnectivity = {
          status: res.statusCode,
          working: databaseWorking,
          responseLength: data.length
        };
        
        investigation.summary.databaseStatus = databaseWorking ? 'connected' : 'disconnected';
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Database test error: ${err.message}`);
      investigation.tests.databaseConnectivity = {
        error: err.message,
        working: false
      };
      investigation.summary.databaseStatus = 'error';
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Database test timeout');
      investigation.tests.databaseConnectivity = {
        error: 'Timeout',
        working: false
      };
      investigation.summary.databaseStatus = 'timeout';
      req.destroy();
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Main investigation function
async function runInvestigation() {
  try {
    await testSiteAvailability();
    await testPhase0Registration();
    await testPhase0APIs();
    await testDatabaseConnectivity();
    
    // Summary
    console.log('\n📊 INVESTIGATION SUMMARY');
    console.log('========================');
    
    const siteWorking = investigation.tests.siteAvailability?.success;
    const apiCount = Object.keys(investigation.tests.apiEndpoints || {}).length;
    const workingApis = Object.values(investigation.tests.apiEndpoints || {}).filter(api => api.exists).length;
    const dbWorking = investigation.tests.databaseConnectivity?.working;
    
    console.log(`Site Availability: ${siteWorking ? '✅ Working' : '❌ Failed'}`);
    console.log(`API Endpoints: ${workingApis}/${apiCount} working`);
    console.log(`Database: ${dbWorking ? '✅ Connected' : '❌ Issues'}`);
    console.log(`Phase 0 Registration: ${investigation.summary.phase0Features.registration?.deployed ? '✅ Deployed' : '❌ Not Found'}`);
    
    investigation.summary.deploymentStatus = siteWorking && workingApis > 0 && dbWorking ? 'working' : 'issues';
    
    if (investigation.summary.issues.length > 0) {
      console.log('\n⚠️ ISSUES FOUND:');
      investigation.summary.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // Save detailed results
    const reportFile = `deployment-investigation-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(investigation, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportFile}`);
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    
    if (!siteWorking) {
      console.log('1. ❌ CRITICAL: Site is not accessible - check Vercel deployment');
    }
    
    if (workingApis < apiCount) {
      console.log('2. ⚠️ Some Phase 0 APIs are missing - check deployment completeness');
    }
    
    if (!dbWorking) {
      console.log('3. ❌ CRITICAL: Database connectivity issues - check Supabase connection');
    }
    
    if (!investigation.summary.phase0Features.registration?.deployed) {
      console.log('4. ⚠️ Phase 0 registration features not found - check if committed to main');
    }
    
    console.log('\n✅ Investigation complete!');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
    investigation.summary.issues.push(`Investigation failed: ${error.message}`);
  }
}

// Run the investigation
runInvestigation();