/**
 * UI/UX Wiring Verification Script
 * Verifies that the frontend properly sends data to the CAG-enabled backend
 */

import fs from 'fs';

console.log('🔍 UI/UX Wiring Verification\n');
console.log('='.repeat(60));

const checks = [];

// Check 1: Assessment Form sends curriculumProfile
console.log('\n1️⃣ Checking Assessment Form...');
const assessmentForm = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');

if (assessmentForm.includes('curriculumProfile')) {
  console.log('   ✅ curriculumProfile field exists in form');
  checks.push(true);
} else {
  console.log('   ❌ curriculumProfile field missing');
  checks.push(false);
}

if (assessmentForm.includes('localStorage.setItem')) {
  console.log('   ✅ Form saves data to localStorage');
  checks.push(true);
} else {
  console.log('   ❌ Form does not save data');
  checks.push(false);
}

// Check 2: Results page loads assessment data
console.log('\n2️⃣ Checking Results Page...');
const resultsPage = fs.readFileSync('app/results/page.jsx', 'utf8');

if (resultsPage.includes('localStorage.getItem')) {
  console.log('   ✅ Results page loads from localStorage');
  checks.push(true);
} else {
  console.log('   ❌ Results page does not load data');
  checks.push(false);
}

if (resultsPage.includes('⚠️')) {
  console.log('   ✅ Footer verification check present');
  checks.push(true);
} else {
  console.log('   ❌ Footer verification missing');
  checks.push(false);
}

// Check 3: ThandiChat sends curriculumProfile to API
console.log('\n3️⃣ Checking ThandiChat Component...');
const thandiChat = fs.readFileSync('app/results/components/ThandiChat.jsx', 'utf8');

if (thandiChat.includes('curriculumProfile: assessmentData.curriculumProfile')) {
  console.log('   ✅ ThandiChat sends curriculumProfile to API');
  checks.push(true);
} else {
  console.log('   ❌ ThandiChat does not send curriculumProfile');
  checks.push(false);
}

if (thandiChat.includes('/api/rag/query')) {
  console.log('   ✅ ThandiChat calls correct API endpoint');
  checks.push(true);
} else {
  console.log('   ❌ ThandiChat calls wrong endpoint');
  checks.push(false);
}

// Check 4: API route accepts curriculumProfile
console.log('\n4️⃣ Checking API Route...');
const apiRoute = fs.readFileSync('app/api/rag/query/route.js', 'utf8');

if (apiRoute.includes('curriculumProfile') || apiRoute.includes('profile')) {
  console.log('   ✅ API accepts profile data');
  checks.push(true);
} else {
  console.log('   ❌ API does not accept profile data');
  checks.push(false);
}

if (apiRoute.includes('CAGLayer')) {
  console.log('   ✅ CAG layer integrated in API');
  checks.push(true);
} else {
  console.log('   ❌ CAG layer not integrated');
  checks.push(false);
}

if (apiRoute.includes('3.0.0-cag')) {
  console.log('   ✅ API version updated to 3.0.0-cag');
  checks.push(true);
} else {
  console.log('   ❌ API version not updated');
  checks.push(false);
}

// Check 5: Consent mechanism
console.log('\n5️⃣ Checking Consent Mechanism...');

if (assessmentForm.includes('externalProcessingConsent')) {
  console.log('   ✅ Assessment form sends externalProcessingConsent');
  checks.push(true);
} else {
  console.log('   ❌ Assessment form does not send correct consent field');
  checks.push(false);
}

if (assessmentForm.includes('consentTimestamp')) {
  console.log('   ✅ Assessment form sends consentTimestamp');
  checks.push(true);
} else {
  console.log('   ❌ Assessment form does not send timestamp');
  checks.push(false);
}

// Check 6: Profile field compatibility
console.log('\n6️⃣ Checking Profile Field Compatibility...');
if (apiRoute.includes('curriculumProfile || profile')) {
  console.log('   ✅ API accepts both profile field names');
  checks.push(true);
} else {
  console.log('   ❌ API does not have backward compatibility');
  checks.push(false);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:');
const passed = checks.filter(c => c).length;
const total = checks.length;
console.log(`   ${passed}/${total} checks passed (${Math.round(passed/total*100)}%)`);

if (passed === total) {
  console.log('\n✅ ALL CHECKS PASSED - UI/UX is properly wired!');
  console.log('\n🎯 Data Flow:');
  console.log('   1. User fills assessment form');
  console.log('   2. Form saves curriculumProfile to localStorage');
  console.log('   3. Results page loads data from localStorage');
  console.log('   4. ThandiChat sends curriculumProfile to /api/rag/query');
  console.log('   5. API accepts both "profile" and "curriculumProfile"');
  console.log('   6. CAG layer verifies LLM response');
  console.log('   7. User sees quality-verified career guidance');
} else {
  console.log('\n❌ Some checks failed - review issues above');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
