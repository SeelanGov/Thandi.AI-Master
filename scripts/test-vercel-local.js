#!/usr/bin/env node

// Test Vercel API locally
// Run: npm run dev (in another terminal), then: node scripts/test-vercel-local.js

const API_URL = 'http://localhost:3000/api/rag/query';

const testCases = [
  {
    name: 'Q1: G10 Maths Literacy → Engineering',
    query: 'Grade 10 learner, currently taking Maths Literacy, wants to become a Civil Engineer. Provide guidance.'
  },
  {
    name: 'Q2: G11 55% Core Maths → Wits CS',
    query: 'Grade 11 learner has 55% in Core Maths, wants BSc Computer Science at Wits. What\'s their chance?'
  },
  {
    name: 'Q3: G12 Architecture at UP',
    query: 'Grade 12 learner wants to study Architecture at UP. What must they submit and by when?'
  }
];

async function testAPI() {
  console.log('=== Testing Vercel API (Local) ===\n');
  console.log(`API: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`--- ${test.name} ---`);
    console.log(`Query: ${test.query}`);

    try {
      const startTime = Date.now();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.query })
      });

      const elapsed = Date.now() - startTime;
      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ PASS (${elapsed}ms)`);
        console.log(`Response: ${data.response.substring(0, 100)}...`);
        if (data.requirements) {
          console.log(`Requirements: ${JSON.stringify(data.requirements).substring(0, 100)}...`);
        }
        passed++;
      } else {
        console.log(`❌ FAIL: ${data.error || 'Unknown error'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  console.log(`=== Test Summary ===`);
  console.log(`Passed: ${passed}/${testCases.length}`);
  console.log(`Failed: ${failed}/${testCases.length}\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Vercel integration working.\n');
  } else {
    console.log('❌ Some tests failed. Check logs above.\n');
  }
}

testAPI().catch(console.error);
