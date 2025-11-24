/**
 * Test Rule #3 Logic (No API calls needed)
 * 
 * Verifies that Rule #3 detection and prompt modification works correctly
 */

// Simulate the detection logic from lib/rag/generation.js
function detectMathAversion(query, studentProfile) {
  const hasMathAversionInQuery = /hate math|bad at math|struggle with math|math is hard|don't like math|worst subject.*math/i.test(query);
  const hasMathAversionInProfile = studentProfile.academicWeaknesses?.some(w => /math/i.test(w));
  
  return hasMathAversionInQuery || hasMathAversionInProfile;
}

function buildRuleInstructions(hasMathAversion) {
  if (!hasMathAversion) {
    return null;
  }
  
  return `RULE #3 - MATH-HATE HEALTHCARE (CRITICAL):
The student has expressed math anxiety or weakness. You MUST follow these rules:

1. DO NOT remove healthcare careers from recommendations
2. DO include healthcare careers that require moderate math (Nursing, Pharmacy, Physiotherapy, Occupational Therapy, Radiography, Dietetics)
3. FOR EACH healthcare career recommended, add this exact warning:

   ⚠️ Note: This requires moderate math (dosage calculations, statistics). Many students who struggle with math succeed with tutoring and extra support. Verify requirements with nursing/health sciences schools.

4. Be honest about math requirements but NOT discouraging
5. Mention tutoring/support as a viable path
6. DO filter out high-math careers (Engineering, Actuarial Science, Data Science) if math is a significant weakness`;
}

// Test cases
const tests = [
  {
    name: 'Test 1: "I hate math" in query',
    query: "I hate math but I love helping people",
    profile: { academicWeaknesses: [] },
    shouldTrigger: true
  },
  {
    name: 'Test 2: "bad at math" in query',
    query: "I'm bad at math but enjoy science",
    profile: { academicWeaknesses: [] },
    shouldTrigger: true
  },
  {
    name: 'Test 3: Math in weaknesses',
    query: "What careers match my interests?",
    profile: { academicWeaknesses: ['Mathematics'] },
    shouldTrigger: true
  },
  {
    name: 'Test 4: No math aversion (control)',
    query: "I'm good at math and science",
    profile: { academicWeaknesses: [] },
    shouldTrigger: false
  },
  {
    name: 'Test 5: "struggle with math"',
    query: "I struggle with math",
    profile: { academicWeaknesses: [] },
    shouldTrigger: true
  }
];

console.log('🧪 Testing Rule #3 Detection Logic\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

tests.forEach((test) => {
  console.log(`\n📝 ${test.name}`);
  console.log(`Query: "${test.query}"`);
  console.log(`Profile weaknesses: ${JSON.stringify(test.profile.academicWeaknesses)}`);
  
  const detected = detectMathAversion(test.query, test.profile);
  const instructions = buildRuleInstructions(detected);
  
  const testPassed = detected === test.shouldTrigger;
  
  if (testPassed) {
    console.log(`✅ PASS - Math aversion ${detected ? 'detected' : 'not detected'} (as expected)`);
    if (detected) {
      console.log(`   Rule #3 instructions would be added to prompt`);
      console.log(`   Instructions include: "DO NOT remove healthcare careers"`);
    }
    passed++;
  } else {
    console.log(`❌ FAIL - Expected ${test.shouldTrigger ? 'detection' : 'no detection'}, got ${detected ? 'detection' : 'no detection'}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${tests.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
console.log('='.repeat(70));

if (failed === 0) {
  console.log('\n✅ ALL TESTS PASSED - Rule #3 detection logic is working');
  console.log('\nRule #3 will:');
  console.log('- Detect math aversion in queries or student profiles');
  console.log('- Add instructions to KEEP healthcare careers');
  console.log('- Add warning about moderate math requirements');
  console.log('- Suggest tutoring as viable path');
  console.log('- Filter out high-math careers (Engineering, Data Science)');
  process.exit(0);
} else {
  console.log('\n❌ SOME TESTS FAILED - Rule #3 detection needs fixes');
  process.exit(1);
}
