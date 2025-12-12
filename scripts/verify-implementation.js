/**
 * Quick Verification Script
 * Checks that all files are in place and working
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying 3 Questions Enhancement Implementation\n');
console.log('='.repeat(60));

const checks = [];

// Check 1: Modified files exist
console.log('\n📁 Checking Modified Files...');
const modifiedFiles = [
  'app/assessment/components/OpenQuestions.jsx',
  'app/assessment/components/Constraints.jsx',
  'app/assessment/components/DeepDiveQuestions.jsx',
  'app/assessment/components/AssessmentForm.jsx'
];

modifiedFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: file, passed: exists });
});

// Check 2: New files exist
console.log('\n📄 Checking New Files...');
const newFiles = [
  'lib/rag/misconception-detection.js',
  'scripts/test-3-questions-enhancement.js',
  '3-QUESTIONS-ENHANCEMENT-COMPLETE.md',
  'FOUNDER-TEST-GUIDE.md',
  'IMPLEMENTATION-SUMMARY.md'
];

newFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: file, passed: exists });
});

// Check 3: Key code patterns exist
console.log('\n🔎 Checking Code Patterns...');

const patterns = [
  {
    file: 'app/assessment/components/OpenQuestions.jsx',
    pattern: 'careerInterests',
    description: 'Career interests field'
  },
  {
    file: 'app/assessment/components/Constraints.jsx',
    pattern: 'familyBackground',
    description: 'Family background field'
  },
  {
    file: 'app/assessment/components/DeepDiveQuestions.jsx',
    pattern: 'strugglingSubjects',
    description: 'Struggling subjects field'
  },
  {
    file: 'app/assessment/components/AssessmentForm.jsx',
    pattern: 'careerInterests',
    description: 'Career interests in form data'
  },
  {
    file: 'lib/rag/misconception-detection.js',
    pattern: 'detectMisconceptions',
    description: 'Detection function'
  }
];

patterns.forEach(({ file, pattern, description }) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const found = content.includes(pattern);
    console.log(`   ${found ? '✅' : '❌'} ${description} in ${file}`);
    checks.push({ name: description, passed: found });
  } catch (error) {
    console.log(`   ❌ ${description} - File not found`);
    checks.push({ name: description, passed: false });
  }
});

// Check 4: Test file can be imported
console.log('\n🧪 Checking Test Suite...');
try {
  const { detectMisconceptions } = await import('../lib/rag/misconception-detection.js');
  const testQuery = "I want to be a doctor";
  const testProfile = { enjoyedSubjects: ['Mathematical Literacy'] };
  const flags = detectMisconceptions(testQuery, testProfile);
  const hasCritical = flags.some(f => f.severity === 'critical');
  console.log(`   ${hasCritical ? '✅' : '❌'} Detection logic works (found ${flags.length} flags)`);
  checks.push({ name: 'Detection logic', passed: hasCritical });
} catch (error) {
  console.log(`   ❌ Detection logic failed: ${error.message}`);
  checks.push({ name: 'Detection logic', passed: false });
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\nTotal Checks: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${total - passed}`);
console.log(`Success Rate: ${percentage}%`);

if (percentage === 100) {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('\n🚀 Ready for founder testing');
  console.log('📖 See FOUNDER-TEST-GUIDE.md for testing instructions');
} else {
  console.log('\n⚠️ SOME CHECKS FAILED');
  console.log('\nFailed checks:');
  checks.filter(c => !c.passed).forEach(c => {
    console.log(`   ❌ ${c.name}`);
  });
}

console.log('\n' + '='.repeat(60) + '\n');
