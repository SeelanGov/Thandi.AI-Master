/**
 * Test Rule #3: Math-Hate Healthcare Rule
 * 
 * Verifies that students who express math anxiety still see healthcare careers
 * with appropriate warnings, not filtered out entirely.
 */

import { generateResponse } from '../lib/rag/generation.js';

const tests = [
  {
    name: 'Test 1: "I hate math" + interest in helping people',
    query: "I hate math but I love helping people and I'm good at biology. What careers should I consider?",
    studentProfile: {
      academicStrengths: ['Life Sciences', 'English'],
      academicWeaknesses: ['Mathematics'],
      interests: ['helping people', 'healthcare'],
      financialConstraint: 'medium',
      priorityModules: []
    },
    expectedBehavior: 'Should include Nursing/Physiotherapy with math warning, exclude Engineering',
    mustInclude: ['Nursing', 'Physiotherapy', '⚠️ Note:', 'moderate math', 'tutoring'],
    mustExclude: ['Engineering', 'Actuarial', 'Data Scientist']
  },
  
  {
    name: 'Test 2: "Bad at math" + science interest',
    query: "I'm bad at math but I enjoy science. What can I study?",
    studentProfile: {
      academicStrengths: ['Physical Science', 'Life Sciences'],
      academicWeaknesses: ['Mathematics'],
      interests: ['science', 'research'],
      financialConstraint: 'low',
      priorityModules: []
    },
    expectedBehavior: 'Should include healthcare careers with warning, suggest science careers that do not require high math',
    mustInclude: ['⚠️ Note:', 'moderate math', 'succeed with tutoring'],
    mustExclude: []
  },
  
  {
    name: 'Test 3: Good at math (control - no warning needed)',
    query: "I'm good at math and science. What careers match?",
    studentProfile: {
      academicStrengths: ['Mathematics', 'Physical Science'],
      academicWeaknesses: [],
      interests: ['problem-solving', 'technology'],
      financialConstraint: 'medium',
      priorityModules: []
    },
    expectedBehavior: 'Should include all careers including Engineering, NO math warning needed',
    mustInclude: ['Engineer', 'Data', 'Actuary'],
    mustExclude: ['⚠️ Note: This requires moderate math'] // Should NOT have warning
  }
];

async function runTests() {
  console.log('🧪 Testing Rule #3: Math-Hate Healthcare Rule\n');
  console.log('='.repeat(70));
  
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of tests) {
    console.log(`\n📝 ${test.name}`);
    console.log(`Query: "${test.query}"`);
    console.log(`Expected: ${test.expectedBehavior}`);
    
    try {
      const startTime = Date.now();
      const result = await generateResponse(
        test.query,
        'Mock healthcare and engineering career context', // Simplified context
        test.studentProfile,
        { maxRetries: 1, timeout: 10000 }
      );
      const duration = Date.now() - startTime;

      console.log(`\nResult (${duration}ms):`);
      console.log(`Response preview:\n${result.response.substring(0, 500)}...\n`);

      // Validate expectations
      let testPassed = true;
      const errors = [];

      // Check mustInclude
      for (const term of test.mustInclude) {
        if (!result.response.includes(term)) {
          testPassed = false;
          errors.push(`❌ Missing required term: "${term}"`);
        }
      }

      // Check mustExclude
      for (const term of test.mustExclude) {
        if (result.response.includes(term)) {
          testPassed = false;
          errors.push(`❌ Should NOT include: "${term}"`);
        }
      }

      if (testPassed) {
        console.log('✅ TEST PASSED');
        passed++;
      } else {
        console.log('❌ TEST FAILED');
        errors.forEach(err => console.log(`   ${err}`));
        failed++;
        failures.push({ test: test.name, errors });
      }

    } catch (error) {
      console.log(`❌ TEST ERROR: ${error.message}`);
      failed++;
      failures.push({ test: test.name, errors: [error.message] });
    }

    console.log('-'.repeat(70));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  if (failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failures.forEach(f => {
      console.log(`\n${f.test}:`);
      f.errors.forEach(err => console.log(`  - ${err}`));
    });
  }

  console.log('\n' + '='.repeat(70));

  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED - Rule #3 is working correctly');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Rule #3 needs fixes');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
