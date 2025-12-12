/**
 * Test Script: 3 Questions Enhancement
 * 
 * Tests the new cross-reference questions and misconception detection
 */

import { detectMisconceptions, formatMisconceptionsForLLM, formatMisconceptionsForDisplay } from '../lib/rag/misconception-detection.js';

console.log('🧪 Testing 3 Questions Enhancement\n');
console.log('='.repeat(60));

// Test Case 1: Student wants to be doctor but has Math Lit
console.log('\n📋 TEST 1: Doctor with Math Lit (Critical Mismatch)');
console.log('-'.repeat(60));

const test1Query = "I want to be a doctor. Careers I'm considering: doctor, medical doctor";
const test1Profile = {
  enjoyedSubjects: ['Mathematical Literacy', 'Life Sciences', 'English'],
  strugglingSubjects: [],
  familyBackground: 'no'
};

const test1Flags = detectMisconceptions(test1Query, test1Profile);
console.log('Query:', test1Query);
console.log('Profile:', JSON.stringify(test1Profile, null, 2));
console.log('\n🚩 Flags Detected:', test1Flags.length);
test1Flags.forEach((flag, idx) => {
  console.log(`\n${idx + 1}. [${flag.severity.toUpperCase()}] ${flag.type}`);
  console.log(`   Message: ${flag.message}`);
  console.log(`   Suggestion: ${flag.suggestion}`);
  console.log(`   Verifiable: ${flag.verifiable}`);
});

console.log('\n📝 LLM Context:');
console.log(formatMisconceptionsForLLM(test1Flags));

console.log('\n📱 Display Format:');
console.log(JSON.stringify(formatMisconceptionsForDisplay(test1Flags), null, 2));

// Test Case 2: Student wants engineering but struggling with math
console.log('\n\n📋 TEST 2: Engineering but Struggling with Math');
console.log('-'.repeat(60));

const test2Query = "I'm interested in engineering careers";
const test2Profile = {
  enjoyedSubjects: ['Mathematics', 'Physical Sciences', 'English'],
  strugglingSubjects: ['Mathematics', 'Physical Sciences'],
  familyBackground: 'yes_parents'
};

const test2Flags = detectMisconceptions(test2Query, test2Profile);
console.log('Query:', test2Query);
console.log('Profile:', JSON.stringify(test2Profile, null, 2));
console.log('\n🚩 Flags Detected:', test2Flags.length);
test2Flags.forEach((flag, idx) => {
  console.log(`\n${idx + 1}. [${flag.severity.toUpperCase()}] ${flag.type}`);
  console.log(`   Message: ${flag.message}`);
  console.log(`   Suggestion: ${flag.suggestion}`);
});

// Test Case 3: First-gen student, no misconceptions
console.log('\n\n📋 TEST 3: First-Gen Student, Good Match');
console.log('-'.repeat(60));

const test3Query = "I enjoy technology and want to work with computers";
const test3Profile = {
  enjoyedSubjects: ['Mathematics', 'Computer Science', 'English'],
  strugglingSubjects: ['None - doing well in all'],
  familyBackground: 'no'
};

const test3Flags = detectMisconceptions(test3Query, test3Profile);
console.log('Query:', test3Query);
console.log('Profile:', JSON.stringify(test3Profile, null, 2));
console.log('\n🚩 Flags Detected:', test3Flags.length);
test3Flags.forEach((flag, idx) => {
  console.log(`\n${idx + 1}. [${flag.severity.toUpperCase()}] ${flag.type}`);
  console.log(`   Message: ${flag.message}`);
  console.log(`   Suggestion: ${flag.suggestion}`);
});

// Test Case 4: Engineering with Math Lit (Critical)
console.log('\n\n📋 TEST 4: Engineering with Math Lit (Critical)');
console.log('-'.repeat(60));

const test4Query = "I want to become an engineer. Careers I'm considering: mechanical engineer";
const test4Profile = {
  enjoyedSubjects: ['Mathematical Literacy', 'Physical Sciences', 'English'],
  strugglingSubjects: [],
  familyBackground: 'yes_siblings'
};

const test4Flags = detectMisconceptions(test4Query, test4Profile);
console.log('Query:', test4Query);
console.log('Profile:', JSON.stringify(test4Profile, null, 2));
console.log('\n🚩 Flags Detected:', test4Flags.length);
test4Flags.forEach((flag, idx) => {
  console.log(`\n${idx + 1}. [${flag.severity.toUpperCase()}] ${flag.type}`);
  console.log(`   Message: ${flag.message}`);
  console.log(`   Suggestion: ${flag.suggestion}`);
});

// Test Case 5: No career interests specified
console.log('\n\n📋 TEST 5: No Career Interests (Should Pass)');
console.log('-'.repeat(60));

const test5Query = "I enjoy math and science subjects";
const test5Profile = {
  enjoyedSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
  strugglingSubjects: [],
  familyBackground: 'unsure'
};

const test5Flags = detectMisconceptions(test5Query, test5Profile);
console.log('Query:', test5Query);
console.log('Profile:', JSON.stringify(test5Profile, null, 2));
console.log('\n🚩 Flags Detected:', test5Flags.length);
if (test5Flags.length === 0) {
  console.log('✅ No misconceptions detected (expected)');
}

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));

const allTests = [
  { name: 'Doctor with Math Lit', flags: test1Flags, expectedCritical: true },
  { name: 'Engineering struggling with Math', flags: test2Flags, expectedCritical: false },
  { name: 'First-gen good match', flags: test3Flags, expectedCritical: false },
  { name: 'Engineering with Math Lit', flags: test4Flags, expectedCritical: true },
  { name: 'No career interests', flags: test5Flags, expectedCritical: false }
];

allTests.forEach((test, idx) => {
  const hasCritical = test.flags.some(f => f.severity === 'critical');
  const passed = hasCritical === test.expectedCritical;
  console.log(`\n${idx + 1}. ${test.name}`);
  console.log(`   Flags: ${test.flags.length}`);
  console.log(`   Critical: ${hasCritical ? 'YES' : 'NO'}`);
  console.log(`   Expected Critical: ${test.expectedCritical ? 'YES' : 'NO'}`);
  console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!');
console.log('\n💡 Next Steps:');
console.log('1. Review the flags detected for each test case');
console.log('2. Verify messages are clear and actionable');
console.log('3. Confirm verifiability statements make sense');
console.log('4. Test in browser with real assessment flow');
console.log('='.repeat(60) + '\n');
