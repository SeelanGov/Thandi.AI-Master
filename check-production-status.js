#!/usr/bin/env node

/**
 * Check Production Status
 * Quick check of what's actually deployed
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://thandiai.vercel.app';

console.log('🔍 Checking Production Status');
console.log('='.repeat(40));

async function checkAPIStatus() {
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is responding');
      console.log(`   Status: ${data.status}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.log(`❌ API error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API unreachable: ${error.message}`);
    return false;
  }
}

async function testSimpleRequest() {
  console.log('\n🧪 Testing simple request...');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Hello test',
        grade: 'grade10'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Simple request successful');
      console.log(`   Response source: ${data.performance?.source || 'unknown'}`);
      console.log(`   Response length: ${(data.response || '').length} chars`);
      console.log(`   Has verification: ${(data.response || '').includes('⚠️') ? 'YES' : 'NO'}`);
      
      return {
        source: data.performance?.source,
        hasVerification: (data.response || '').includes('⚠️'),
        responseLength: (data.response || '').length
      };
    } else {
      console.log(`❌ Request failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Request error: ${error.message}`);
    return null;
  }
}

async function main() {
  const apiStatus = await checkAPIStatus();
  
  if (apiStatus) {
    const testResult = await testSimpleRequest();
    
    console.log('\n📊 Production Status Summary:');
    console.log(`   API Status: ${apiStatus ? 'UP' : 'DOWN'}`);
    
    if (testResult) {
      console.log(`   Cache Bypass: ${testResult.source === 'generated' ? 'WORKING' : 'NOT WORKING'}`);
      console.log(`   Verification Warning: ${testResult.hasVerification ? 'PRESENT' : 'MISSING'}`);
      console.log(`   Response Generation: ${testResult.responseLength > 0 ? 'WORKING' : 'BROKEN'}`);
      
      if (testResult.source === 'generated' && testResult.hasVerification) {
        console.log('\n✅ Production deployment appears to be working correctly!');
      } else {
        console.log('\n⚠️  Production deployment has issues - may need more time or manual intervention');
      }
    }
  }
}

main();