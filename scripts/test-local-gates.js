// Pre-deploy gate testing - MUST PASS before vercel --prod
import { getRelevantGate } from '../lib/curriculum/query-gates-simple.js';

const TESTS = [
  {
    name: 'TEST 1: Death Gate (Math Lit → Engineering)',
    grade: 10,
    subjects: ['Mathematical Literacy', 'Life Sciences', 'History', 'Geography'],
    query: 'I want to study Mechanical Engineering',
    expectedGate: 'irreversible',
    expectedUrgency: 'critical',
    expectedText: 'Math Literacy blocks Engineering'
  },
  {
    name: 'TEST 2: Hope Gate (Medicine without Physical Sciences)',
    grade: 10,
    subjects: ['Life Sciences', 'History', 'Geography'],
    query: 'I want to study Medicine',
    expectedGate: 'subject_chain',
    expectedUrgency: 'high',
    expectedText: 'Medicine requires Physical Sciences'
  },
  {
    name: 'TEST 3: Panic Gate (Grade 11 wants to drop subject)',
    grade: 11,
    subjects: ['Mathematics', 'Physical Sciences', 'History'],
    query: 'Can I drop History?',
    expectedGate: 'deadline',
    expectedUrgency: 'critical',
    expectedText: 'Grade-specific irreversibility'
  }
];

async function runPreDeployTests() {
  console.log('🚨 PRE-DEPLOY GATE TESTING\n');
  console.log('=' .repeat(60));
  console.log('⚠️  DO NOT DEPLOY IF ANY TEST FAILS\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const test of TESTS) {
    console.log(`\n📝 ${test.name}`);
    console.log(`   Grade: ${test.grade}`);
    console.log(`   Subjects: ${test.subjects.join(', ')}`);
    console.log(`   Query: "${test.query}"`);

    try {
      const gate = await getRelevantGate(test.grade, test.subjects, test.query);

      if (!gate) {
        console.log('   ❌ FAILED: No gate returned');
        failed++;
        failures.push({
          test: test.name,
          reason: 'No gate returned',
          expected: test.expectedGate,
          got: null
        });
        continue;
      }

      const gateTypeMatch = gate.metadata.gate_type === test.expectedGate;
      const urgencyMatch = gate.metadata.urgency === test.expectedUrgency;
      const textMatch = gate.text.includes(test.expectedText);

      if (gateTypeMatch && urgencyMatch && textMatch) {
        console.log('   ✅ PASSED');
        console.log(`   Gate: ${gate.metadata.gate_type}`);
        console.log(`   Urgency: ${gate.metadata.urgency}`);
        passed++;
      } else {
        console.log('   ❌ FAILED');
        console.log(`   Expected gate: ${test.expectedGate}, got: ${gate.metadata.gate_type}`);
        console.log(`   Expected urgency: ${test.expectedUrgency}, got: ${gate.metadata.urgency}`);
        console.log(`   Text match: ${textMatch}`);
        failed++;
        failures.push({
          test: test.name,
          reason: 'Gate mismatch',
          expected: test.expectedGate,
          got: gate.metadata.gate_type
        });
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
      failures.push({
        test: test.name,
        reason: error.message,
        expected: test.expectedGate,
        got: 'ERROR'
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS: ${passed}/${TESTS.length} passed\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED');
    console.log('✅ SAFE TO DEPLOY\n');
    console.log('Next steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Test in browser: http://localhost:3000/assessment');
    console.log('3. Complete full flow with Math Lit + Engineering');
    console.log('4. Verify gate warning shows on results page');
    console.log('5. Only then: vercel --prod --no-clipboard\n');
    return true;
  } else {
    console.log('🚨 TESTS FAILED - DO NOT DEPLOY\n');
    console.log('Failures:');
    failures.forEach(f => {
      console.log(`  - ${f.test}`);
      console.log(`    Reason: ${f.reason}`);
      console.log(`    Expected: ${f.expected}, Got: ${f.got}\n`);
    });
    console.log('⛔ FIX THESE BEFORE DEPLOYING\n');
    return false;
  }
}

// Run tests
runPreDeployTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
