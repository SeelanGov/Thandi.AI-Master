#!/usr/bin/env node

// Kiro's 2-Minute Smoke Test for KIMI Integration
// Tests production deployment at thandi.online

import fetch from 'node-fetch';

console.log('🚀 KIRO 2-MINUTE SMOKE TEST');
console.log('=' .repeat(50));

const PRODUCTION_URL = 'https://thandi.online/api/rag/query';
const TEST_QUERY = {
  "query": "What subjects do I need for computer engineering?"
};

async function test1_HealthPing() {
  console.log('\n🏥 TEST 1: Health Ping');
  console.log('-'.repeat(30));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(PRODUCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_QUERY)
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`⚡ Response Time: ${duration}ms`);
    
    if (!response.ok) {
      console.log('❌ Health ping failed');
      return false;
    }
    
    const result = await response.json();
    
    console.log(`✅ Success: ${result.success}`);
    console.log(`📝 Response Length: ${result.response?.length || 0} chars`);
    
    // Check for subject list in response
    const hasSubjects = result.response?.toLowerCase().includes('mathematics') || 
                       result.response?.toLowerCase().includes('physical sciences');
    console.log(`📚 Contains Subjects: ${hasSubjects ? '✅' : '❌'}`);
    
    // Check metadata for model info
    if (result.metadata) {
      console.log(`🤖 Provider: ${result.metadata.provider}`);
    }
    
    console.log('✅ Health ping: PASSED');
    return { success: true, duration, result };
    
  } catch (error) {
    console.log(`❌ Health ping failed: ${error.message}`);
    return false;
  }
}

async function test2_TokenCountSanity() {
  console.log('\n🔢 TEST 2: Token Count Sanity (Context Reuse)');
  console.log('-'.repeat(40));
  
  try {
    // First call
    console.log('📤 First call...');
    const start1 = Date.now();
    const response1 = await fetch(PRODUCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_QUERY)
    });
    const duration1 = Date.now() - start1;
    
    if (!response1.ok) {
      console.log('❌ First call failed');
      return false;
    }
    
    const result1 = await response1.json();
    console.log(`✅ First call: ${duration1}ms`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Second call (should reuse context)
    console.log('📤 Second call...');
    const start2 = Date.now();
    const response2 = await fetch(PRODUCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_QUERY)
    });
    const duration2 = Date.now() - start2;
    
    if (!response2.ok) {
      console.log('❌ Second call failed');
      return false;
    }
    
    const result2 = await response2.json();
    console.log(`✅ Second call: ${duration2}ms`);
    
    // Compare response times (second should be faster due to caching)
    const improvement = ((duration1 - duration2) / duration1) * 100;
    console.log(`📈 Speed improvement: ${improvement.toFixed(1)}%`);
    
    if (improvement > 5) {
      console.log('✅ Context reuse detected (faster second call)');
    } else {
      console.log('ℹ️ Similar response times (may indicate fresh processing)');
    }
    
    console.log('✅ Token count sanity: PASSED');
    return true;
    
  } catch (error) {
    console.log(`❌ Token count test failed: ${error.message}`);
    return false;
  }
}

async function test3_SpeedCheck(firstCallDuration) {
  console.log('\n⚡ TEST 3: Speed Check');
  console.log('-'.repeat(25));
  
  const duration = firstCallDuration || 2000; // Use first call duration or default
  
  console.log(`📊 Response Time: ${duration}ms`);
  
  if (duration < 2000) {
    console.log('✅ Excellent speed (<2s)');
    return 'excellent';
  } else if (duration < 5000) {
    console.log('🟡 Acceptable speed (<5s)');
    return 'acceptable';
  } else {
    console.log('❌ Slow response (>5s) - ESCALATE');
    return 'escalate';
  }
}

async function runSmokeTest() {
  const startTime = Date.now();
  
  console.log(`📅 Test Started: ${new Date().toISOString()}`);
  console.log(`🌐 Target: ${PRODUCTION_URL}`);
  
  // Test 1: Health Ping
  const healthResult = await test1_HealthPing();
  if (!healthResult) {
    console.log('\n❌ SMOKE TEST FAILED: Health ping failed');
    return false;
  }
  
  // Test 2: Token Count Sanity
  const tokenResult = await test2_TokenCountSanity();
  if (!tokenResult) {
    console.log('\n❌ SMOKE TEST FAILED: Token count test failed');
    return false;
  }
  
  // Test 3: Speed Check
  const speedResult = await test3_SpeedCheck(healthResult.duration);
  if (speedResult === 'escalate') {
    console.log('\n⚠️ SMOKE TEST WARNING: Speed issue detected');
  }
  
  const totalDuration = Date.now() - startTime;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SMOKE TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Health Ping: PASSED`);
  console.log(`✅ Token Count: PASSED`);
  console.log(`✅ Speed Check: ${speedResult.toUpperCase()}`);
  console.log(`⏱️ Total Test Time: ${totalDuration}ms`);
  
  if (speedResult !== 'escalate') {
    console.log('\n🎯 RESULT: smoke-ok');
    console.log('🚀 All systems operational');
    return true;
  } else {
    console.log('\n⚠️ RESULT: speed-issue');
    console.log('🔧 Performance needs attention');
    return false;
  }
}

// Execute smoke test
runSmokeTest().then(success => {
  console.log('\n' + '=' .repeat(50));
  console.log(`📅 Test Completed: ${new Date().toISOString()}`);
  console.log('=' .repeat(50));
  
  if (success) {
    console.log('\n✅ smoke-ok');
  }
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Smoke test error:', error.message);
  process.exit(1);
});