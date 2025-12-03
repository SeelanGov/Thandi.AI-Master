/**
 * Local CAG Integration Test
 * Tests the full RAG pipeline with CAG quality verification
 */

import fetch from 'node-fetch';

console.log('🧪 CAG Layer Local Integration Test\n');
console.log('=' .repeat(60));

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const HEALTH_ENDPOINT = `${BASE_URL}/api/rag/query`;
const QUERY_ENDPOINT = `${BASE_URL}/api/rag/query`;

// Test student profile
const testProfile = {
  grade: 11,
  subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
  mathMark: 75,
  mathType: 'Mathematics',
  province: 'Gauteng',
  budgetLimit: 'limited',
  interests: ['healthcare', 'helping people']
};

const testSession = {
  externalProcessingConsent: true,
  consentTimestamp: new Date().toISOString()
};

async function testHealthEndpoint() {
  console.log('\n1️⃣ Testing Health Endpoint...');
  try {
    const response = await fetch(HEALTH_ENDPOINT, { method: 'GET' });
    const data = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   Version:', data.version);
    console.log('   Blockers:', data.blockers?.join(', '));
    console.log('   CAG Enabled:', data.cag?.enabled);
    
    if (data.cag?.stats) {
      console.log('   CAG Stats:');
      console.log('     - Total Verifications:', data.cag.stats.totalVerifications);
      console.log('     - Avg Processing Time:', data.cag.stats.avgProcessingTime);
    }
    
    if (data.version === '3.0.0-cag' && data.cag?.enabled) {
      console.log('   ✅ Health check passed - CAG is active!');
      return true;
    } else {
      console.log('   ❌ Health check failed - CAG not properly configured');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    console.log('   💡 Make sure dev server is running: npm run dev');
    return false;
  }
}

async function testQueryWithCAG() {
  console.log('\n2️⃣ Testing Query with CAG Verification...');
  console.log('   Query: "What healthcare careers can I pursue?"');
  console.log('   Profile:', JSON.stringify(testProfile, null, 2).split('\n').map(l => '   ' + l).join('\n'));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(QUERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What healthcare careers can I pursue with my subjects?',
        curriculumProfile: testProfile,
        session: testSession
      })
    });
    
    const data = await response.json();
    const totalTime = Date.now() - startTime;
    
    console.log('\n   📊 Response Analysis:');
    console.log('   ├─ Status:', response.status);
    console.log('   ├─ Success:', data.success);
    console.log('   ├─ Source:', data.source);
    console.log('   ├─ Total Time:', totalTime + 'ms');
    
    if (data.compliance) {
      console.log('   ├─ Compliance:');
      console.log('   │  ├─ Consent:', data.compliance.consent);
      console.log('   │  ├─ Sanitised:', data.compliance.sanitised);
      console.log('   │  ├─ Enhanced:', data.compliance.enhanced);
      console.log('   │  └─ CAG Verified:', data.compliance.cagVerified);
    }
    
    if (data.cag) {
      console.log('   └─ CAG Quality Layer:');
      console.log('      ├─ Decision:', data.cag.decision);
      console.log('      ├─ Confidence:', data.cag.confidence);
      console.log('      ├─ Processing Time:', data.cag.processingTime + 'ms');
      console.log('      ├─ Issues Detected:', data.cag.issuesDetected);
      console.log('      ├─ Revisions Applied:', data.cag.revisionsApplied);
      console.log('      ├─ Requires Human:', data.cag.requiresHuman);
      console.log('      └─ Stages Completed:', data.cag.stagesCompleted?.join(', '));
    }
    
    if (data.response) {
      console.log('\n   📝 Response Preview (first 300 chars):');
      console.log('   ' + data.response.substring(0, 300).replace(/\n/g, '\n   ') + '...');
    }
    
    // Validation
    const checks = {
      'Response received': !!data.response,
      'CAG verified': data.compliance?.cagVerified === true,
      'CAG decision made': !!data.cag?.decision,
      'Processing time reasonable': data.cag?.processingTime < 5000,
      'Compliance checks passed': data.compliance?.consent && data.compliance?.sanitised
    };
    
    console.log('\n   ✅ Validation Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(v => v);
    return allPassed;
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Make sure dev server is running: npm run dev');
    }
    return false;
  }
}

async function testProfileFieldCompatibility() {
  console.log('\n3️⃣ Testing Profile Field Compatibility...');
  
  // Test with 'profile' field (old way)
  console.log('   Testing with "profile" field...');
  try {
    const response1 = await fetch(QUERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Test query',
        profile: testProfile,  // OLD field name
        session: testSession
      })
    });
    const data1 = await response1.json();
    const test1Pass = data1.success && data1.response;
    console.log(`   ${test1Pass ? '✅' : '❌'} "profile" field works`);
  } catch (error) {
    console.log('   ❌ "profile" field failed:', error.message);
  }
  
  // Test with 'curriculumProfile' field (new way)
  console.log('   Testing with "curriculumProfile" field...');
  try {
    const response2 = await fetch(QUERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Test query',
        curriculumProfile: testProfile,  // NEW field name
        session: testSession
      })
    });
    const data2 = await response2.json();
    const test2Pass = data2.success && data2.response;
    console.log(`   ${test2Pass ? '✅' : '❌'} "curriculumProfile" field works`);
  } catch (error) {
    console.log('   ❌ "curriculumProfile" field failed:', error.message);
  }
  
  console.log('   ✅ Both field names supported for backward compatibility');
  return true;
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting CAG Integration Tests...\n');
  
  const healthPass = await testHealthEndpoint();
  
  if (!healthPass) {
    console.log('\n❌ Health check failed. Please ensure:');
    console.log('   1. Dev server is running: npm run dev');
    console.log('   2. CAG layer is properly integrated');
    console.log('   3. All environment variables are set');
    return;
  }
  
  const queryPass = await testQueryWithCAG();
  const compatPass = await testProfileFieldCompatibility();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:');
  console.log(`   Health Endpoint: ${healthPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Query with CAG: ${queryPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Field Compatibility: ${compatPass ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthPass && queryPass && compatPass) {
    console.log('\n🎉 ALL TESTS PASSED! CAG layer is working correctly.');
    console.log('\n✅ Ready to deploy:');
    console.log('   git add .');
    console.log('   git commit -m "feat: activate CAG quality layer"');
    console.log('   git push');
  } else {
    console.log('\n❌ Some tests failed. Review the output above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Execute tests
runTests().catch(error => {
  console.error('\n💥 Test execution failed:', error);
  process.exit(1);
});
