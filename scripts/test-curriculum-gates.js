// Test curriculum gate retrieval
import { getRelevantGate } from '../lib/curriculum/query-gates-simple.js';

const TEST_QUERIES = [
  {
    name: 'Math Lit → Engineering (Grade 10)',
    grade: 10,
    subjects: ['Mathematical Literacy', 'Life Sciences'],
    query: "I'm in Grade 10 taking Math Lit but I want to be an engineer",
    expectedGate: 'irreversible',
    expectedText: 'Math Literacy blocks Engineering'
  },
  {
    name: 'APS Shortfall',
    grade: 11,
    subjects: ['Mathematics', 'Physical Sciences'],
    query: "My APS is 32, can I study medicine?",
    expectedGate: 'aps_shortfall',
    expectedText: 'APS too low for target career'
  },
  {
    name: 'IEB Confusion',
    grade: 10,
    subjects: [],
    query: "I go to an IEB school, will universities accept me?",
    expectedGate: 'curriculum_type',
    expectedText: 'IEB vs CAPS confusion'
  },
  {
    name: 'Grade 11 Subject Change',
    grade: 11,
    subjects: ['History'],
    query: "I'm in Grade 11, can I drop History?",
    expectedGate: 'deadline',
    expectedText: 'Grade-specific irreversibility'
  },
  {
    name: 'Medicine without Physical Sciences',
    grade: 10,
    subjects: ['Life Sciences'],
    query: "I want to study Medicine but I don't take Physical Sciences",
    expectedGate: 'subject_chain',
    expectedText: 'Medicine requires Physical Sciences'
  }
];

async function runTests() {
  console.log('🧪 Testing Curriculum Gate Retrieval\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of TEST_QUERIES) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`Query: "${test.query}"`);
    console.log(`Grade: ${test.grade}, Subjects: ${test.subjects.join(', ')}`);

    try {
      const gate = await getRelevantGate(test.grade, test.subjects, test.query);

      if (!gate) {
        console.log('❌ FAILED: No gate retrieved');
        failed++;
        continue;
      }

      const gateTypeMatch = gate.metadata.gate_type === test.expectedGate;
      const textMatch = gate.text.includes(test.expectedText);

      if (gateTypeMatch && textMatch) {
        console.log(`✅ PASSED`);
        console.log(`   Retrieved: ${gate.metadata.gate_type}`);
        console.log(`   Urgency: ${gate.metadata.urgency}`);
        console.log(`   Similarity: ${(gate.similarity * 100).toFixed(1)}%`);
        passed++;
      } else {
        console.log(`❌ FAILED`);
        console.log(`   Expected gate: ${test.expectedGate}`);
        console.log(`   Got gate: ${gate.metadata.gate_type}`);
        console.log(`   Expected text: "${test.expectedText}"`);
        console.log(`   Text match: ${textMatch}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${passed}/${TEST_QUERIES.length} passed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Gate retrieval is working correctly.');
  } else {
    console.log(`⚠️ ${failed} tests failed. Review metadata filters.`);
  }
}

// Run tests
runTests().catch(console.error);
