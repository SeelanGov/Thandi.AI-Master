#!/usr/bin/env node

/**
 * Debug Production Cache Issue
 * Check if the cache fix is properly deployed
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://thandiai.vercel.app';

console.log('🔍 Debugging Production Cache Issue');
console.log('='.repeat(50));

async function testCacheKeyGeneration() {
  console.log('\n🔑 Testing Cache Key Generation...');
  
  // Test with very different marks to see if cache keys are unique
  const student1 = {
    query: 'I am a Grade 10 student with high marks. What are my career options?',
    grade: 'grade10',
    profile: {
      grade: 'grade10',
      marksData: {
        exactMarks: {
          'Mathematics': '95',
          'Physical Sciences': '90',
          'English Home Language': '85'
        }
      },
      sessionId: 'debug-high-' + Date.now()
    }
  };
  
  const student2 = {
    query: 'I am a Grade 10 student with low marks. What are my career options?',
    grade: 'grade10',
    profile: {
      grade: 'grade10',
      marksData: {
        exactMarks: {
          'Mathematics': '40',
          'Physical Sciences': '35',
          'English Home Language': '45'
        }
      },
      sessionId: 'debug-low-' + Date.now()
    }
  };
  
  console.log('📤 Testing Student 1 (High marks)...');
  const response1 = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student1)
  });
  
  const data1 = await response1.json();
  console.log(`   Response: ${response1.status}`);
  console.log(`   Source: ${data1.performance?.source || 'unknown'}`);
  console.log(`   Has marks data: ${data1.response?.includes('APS') ? '✅' : '❌'}`);
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n📤 Testing Student 2 (Low marks)...');
  const response2 = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student2)
  });
  
  const data2 = await response2.json();
  console.log(`   Response: ${response2.status}`);
  console.log(`   Source: ${data2.performance?.source || 'unknown'}`);
  console.log(`   Has marks data: ${data2.response?.includes('APS') ? '✅' : '❌'}`);
  
  // Compare responses
  const response1Text = data1.response || '';
  const response2Text = data2.response || '';
  
  const aps1 = response1Text.match(/APS.*?(\d+)/i)?.[1] || 'Not found';
  const aps2 = response2Text.match(/APS.*?(\d+)/i)?.[1] || 'Not found';
  
  console.log('\n📊 Comparison:');
  console.log(`   Student 1 APS: ${aps1}`);
  console.log(`   Student 2 APS: ${aps2}`);
  console.log(`   Different responses: ${aps1 !== aps2 ? '✅' : '❌'}`);
  
  if (aps1 === aps2 && aps1 !== 'Not found') {
    console.log('\n⚠️  CACHE COLLISION DETECTED!');
    console.log('   Students with very different marks got identical APS scores');
    console.log('   This indicates the cache fix may not be deployed properly');
  } else {
    console.log('\n✅ Cache collision appears to be fixed');
  }
  
  return aps1 !== aps2;
}

async function checkDeploymentStatus() {
  console.log('\n🚀 Checking Deployment Status...');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log(`   API Status: ${data.status || 'unknown'}`);
    console.log(`   Timestamp: ${data.timestamp || 'unknown'}`);
    
    // Check if we can detect the cache version
    const testResponse = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Test deployment version',
        grade: 'grade10',
        profile: {
          grade: 'grade10',
          sessionId: 'version-check-' + Date.now()
        }
      })
    });
    
    const testData = await testResponse.json();
    console.log(`   Response received: ${testResponse.status === 200 ? '✅' : '❌'}`);
    console.log(`   Performance data: ${testData.performance ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log(`🌐 Testing: ${PRODUCTION_URL}`);
  
  await checkDeploymentStatus();
  const cacheFixed = await testCacheKeyGeneration();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DIAGNOSIS RESULTS');
  console.log('='.repeat(50));
  
  if (cacheFixed) {
    console.log('✅ Cache collision fix appears to be working');
    console.log('   Different students get different APS scores');
  } else {
    console.log('❌ Cache collision issue still exists');
    console.log('   Possible causes:');
    console.log('   1. Deployment hasn\'t updated yet (Vercel can take a few minutes)');
    console.log('   2. Cache fix code not properly deployed');
    console.log('   3. Environment variables not set correctly');
    console.log('\n🔧 Recommended actions:');
    console.log('   1. Wait 2-3 minutes for Vercel deployment to complete');
    console.log('   2. Check Vercel dashboard for deployment status');
    console.log('   3. Test again with this script');
  }
  
  return cacheFixed;
}

main().then(success => {
  process.exit(success ? 0 : 1);
});