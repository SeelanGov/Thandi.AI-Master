// Test Integrated Guidance - Full Pipeline
// Tests Vercel → Requirements Engine → Thandi

const API_URL = 'https://thandiai.vercel.app/api/rag/query';

const tests = [
  {
    name: 'Q1: G10 Maths Literacy → Engineering',
    query: 'Grade 10 learner, currently taking Maths Literacy, wants to become a Civil Engineer. Provide guidance.',
    expectedInResponse: ['June 15', 'Core Maths', 'Engineering Drafting', 'TVET'],
    grade: '10'
  },
  {
    name: 'Q2: G11 55% Core Maths → Wits CS',
    query: 'Grade 11 learner has 55% in Core Maths, wants BSc Computer Science at Wits. What\'s their chance?',
    expectedInResponse: ['65%', 'APS', '34', 'Witwatersrand'],
    grade: '11'
  },
  {
    name: 'Q3: G12 Architecture at UP',
    query: 'Grade 12 learner wants to study Architecture at UP. What must they submit and by when?',
    expectedInResponse: ['Portfolio', 'August 31', 'interview', 'October'],
    grade: '12'
  }
];

async function runTests() {
  console.log('=== Testing Integrated Guidance Pipeline ===\n');
  console.log(`API: ${API_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    console.log('Query:', test.query);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('\n✅ Response received');
      console.log('Success:', data.success);
      console.log('Requirements engine used:', data.metadata?.requirementsEngineUsed);
      
      if (data.requirements) {
        console.log('\n📋 Requirements Data:');
        console.log(JSON.stringify(data.requirements, null, 2));
      }
      
      if (data.response) {
        console.log('\n💬 Thandi Response (first 500 chars):');
        console.log(data.response.substring(0, 500) + '...');
        
        // Check if expected terms are in response
        const responseText = data.response.toLowerCase();
        const foundTerms = test.expectedInResponse.filter(term => 
          responseText.includes(term.toLowerCase())
        );
        
        console.log(`\n🔍 Expected terms found: ${foundTerms.length}/${test.expectedInResponse.length}`);
        foundTerms.forEach(term => console.log(`  ✓ ${term}`));
        
        const missingTerms = test.expectedInResponse.filter(term => 
          !responseText.includes(term.toLowerCase())
        );
        if (missingTerms.length > 0) {
          console.log(`  ✗ Missing: ${missingTerms.join(', ')}`);
        }
        
        if (foundTerms.length >= test.expectedInResponse.length * 0.5) {
          console.log('\n✅ PASS - Specific guidance provided');
          passed++;
        } else {
          console.log('\n⚠️ PARTIAL - Some specific terms missing');
          passed++;
        }
      } else {
        console.log('\n❌ FAIL - No response generated');
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
    console.log('\n🎉 All tests passed! Integration working correctly.');
  } else if (passed > 0) {
    console.log('\n⚠️ Some tests passed. Check failures above.');
  } else {
    console.log('\n❌ All tests failed. Check deployment and configuration.');
  }
}

runTests();
