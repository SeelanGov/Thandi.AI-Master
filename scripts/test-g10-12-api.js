#!/usr/bin/env node

// Test G10-12 API endpoint with timing

const API_URL = process.argv[2] || 'https://thandiai.vercel.app/api/g10-12';

const tests = [
  {
    name: 'Q1: G10 Maths Literacy → Engineering',
    query: 'Grade 10 learner, currently taking Maths Literacy, wants to become a Civil Engineer.',
    expectedTerms: ['June 15', 'Core Maths', 'CRITICAL']
  },
  {
    name: 'Q2: G11 Wits CS',
    query: 'Grade 11 learner has 55% in Core Maths, wants BSc Computer Science at Wits.',
    expectedTerms: ['APS', '34', '65']
  },
  {
    name: 'Q3: G12 Architecture UP',
    query: 'Grade 12 learner wants to study Architecture at UP.',
    expectedTerms: ['Portfolio', 'August', '2025']
  }
];

async function runTests() {
  console.log('=== Testing G10-12 API (Fast Endpoint) ===\n');
  console.log(`URL: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;
  const times = [];

  for (const test of tests) {
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
      times.push(elapsed);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
      }

      const data = await response.json();

      if (data.success && data.requirements) {
        const reqStr = JSON.stringify(data.requirements);
        const foundTerms = test.expectedTerms.filter(term => 
          reqStr.toLowerCase().includes(term.toLowerCase())
        );

        if (foundTerms.length >= test.expectedTerms.length * 0.5) {
          console.log(`✅ PASS (${elapsed}ms, server: ${data.processingTime}ms)`);
          console.log(`Found terms: ${foundTerms.join(', ')}`);
          console.log(`Requirements:`, reqStr.substring(0, 150) + '...');
          passed++;
        } else {
          console.log(`⚠️  PARTIAL (${elapsed}ms)`);
          console.log(`Found: ${foundTerms.join(', ')}`);
          console.log(`Missing: ${test.expectedTerms.filter(t => !foundTerms.includes(t)).join(', ')}`);
          passed++;
        }
      } else {
        console.log(`❌ FAIL (${elapsed}ms): No requirements returned`);
        console.log(`Response:`, JSON.stringify(data));
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }

    console.log('\n' + '='.repeat(70) + '\n');
  }

  console.log(`=== Test Summary ===`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    console.log(`\nTiming:`);
    console.log(`  Average: ${avgTime.toFixed(0)}ms`);
    console.log(`  Max: ${maxTime}ms`);
    console.log(`  All under 10s: ${maxTime < 10000 ? '✅ YES' : '❌ NO'}`);
  }

  console.log('');

  if (passed === tests.length && Math.max(...times) < 10000) {
    console.log('🎉 All tests passed with acceptable timing!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed or timing exceeded 10s.\n');
    process.exit(1);
  }
}

runTests().catch(console.error);
