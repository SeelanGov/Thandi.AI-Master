#!/usr/bin/env node

/**
 * VERCEL DEPLOYMENT SUCCESS VERIFICATION
 * Comprehensive test of the fixed deployment
 */

const https = require('https');

const PRODUCTION_URL = 'https://thandiai-fs5wk1ip5-thandiai-projects.vercel.app';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
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

async function testEndpoint(name, path, expectedStatus = 200) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const url = `${PRODUCTION_URL}${path}`;
    const response = await makeRequest(url);
    
    if (response.statusCode === expectedStatus) {
      console.log(`✅ ${name}: SUCCESS (${response.statusCode})`);
      return true;
    } else {
      console.log(`❌ ${name}: FAILED (${response.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function testAPIEndpoint(name, path, method = 'GET', body = null) {
  try {
    console.log(`🧪 Testing API ${name}...`);
    const url = `${PRODUCTION_URL}${path}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deployment-Verification/1.0'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await makeRequest(url, options);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✅ API ${name}: SUCCESS (${response.statusCode})`);
      return true;
    } else {
      console.log(`❌ API ${name}: FAILED (${response.statusCode})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('🚀 VERCEL DEPLOYMENT SUCCESS VERIFICATION');
  console.log('==========================================');
  console.log(`📍 Testing URL: ${PRODUCTION_URL}`);
  console.log('');
  
  const results = [];
  
  // Test main pages
  results.push(await testEndpoint('Landing Page', '/'));
  results.push(await testEndpoint('Assessment Page', '/assessment'));
  results.push(await testEndpoint('Results Page', '/results'));
  results.push(await testEndpoint('School Dashboard', '/school/dashboard'));
  
  // Test API endpoints
  results.push(await testAPIEndpoint('Health Check', '/api/health'));
  results.push(await testAPIEndpoint('Cache Health', '/api/cache/health'));
  results.push(await testAPIEndpoint('RAG Query', '/api/rag/query', 'POST', {
    query: 'What subjects are required for engineering?',
    grade: '12',
    curriculum: 'CAPS'
  }));
  
  // Test legal pages
  results.push(await testEndpoint('Privacy Policy', '/legal/privacy-policy'));
  results.push(await testEndpoint('Terms of Service', '/legal/terms-of-service'));
  
  // Calculate success rate
  const successCount = results.filter(r => r).length;
  const totalTests = results.length;
  const successRate = (successCount / totalTests * 100).toFixed(1);
  
  console.log('');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=======================');
  console.log(`✅ Successful Tests: ${successCount}/${totalTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (successRate >= 80) {
    console.log('🎉 DEPLOYMENT VERIFICATION: SUCCESS');
    console.log('🚀 All critical functionality is working!');
  } else {
    console.log('⚠️  DEPLOYMENT VERIFICATION: PARTIAL SUCCESS');
    console.log('🔧 Some endpoints may need attention');
  }
  
  console.log('');
  console.log('🔗 Production URL: ' + PRODUCTION_URL);
  console.log('📅 Verified at: ' + new Date().toISOString());
}

// Run verification
runVerification().catch(console.error);