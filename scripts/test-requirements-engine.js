// Test Requirements Engine Edge Function
// Run after deploying to Supabase

const EDGE_FUNCTION_URL = 'https://pvvnxupuukuefajypovz.supabase.co/functions/v1/requirements-engine';

const tests = [
  {
    name: 'Q1: G10 Maths Literacy → Engineering',
    payload: {
      learner_grade: '10',
      subjects: ['Maths Literacy'],
      career_interests: ['Engineering']
    },
    expectedFields: ['reversible_until', 'alternative_pathway', 'warning_message']
  },
  {
    name: 'Q2: G11 Wits CS Requirements',
    payload: {
      learner_grade: '11',
      institution: 'Witwatersrand'
    },
    expectedFields: ['aps_min', 'subject_rules', 'qualification_name']
  },
  {
    name: 'Q3: G12 UP Architecture Logistics',
    payload: {
      learner_grade: '12'
    },
    expectedFields: ['portfolio_deadline', 'additional_requirements']
  }
];

async function runTests() {
  console.log('=== Testing Requirements Engine ===\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    console.log('Payload:', JSON.stringify(test.payload, null, 2));
    
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('\nResponse:', JSON.stringify(data, null, 2));
      
      // Check if expected fields are present
      const dataStr = JSON.stringify(data);
      const missingFields = test.expectedFields.filter(field => !dataStr.includes(field));
      
      if (missingFields.length === 0) {
        console.log('\n✅ PASS - All expected fields present');
        passed++;
      } else {
        console.log(`\n❌ FAIL - Missing fields: ${missingFields.join(', ')}`);
        failed++;
      }
      
    } catch (error) {
      console.error('\n❌ ERROR:', error.message);
      failed++;
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  console.log(`\n\n=== Test Summary ===`);
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  
  if (passed === tests.length) {
    console.log('\n🎉 All tests passed! Edge function is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check deployment and data.');
  }
}

runTests();
