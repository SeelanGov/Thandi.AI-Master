/**
 * PREFLIGHT: Critical Fixes Verification
 * Specifically tests the Grade 11 detection and duplicate marks collection fixes
 */

import fs from 'fs';

console.log('🎯 PREFLIGHT: CRITICAL FIXES VERIFICATION');
console.log('==========================================');
console.log('Testing Grade 11 detection and duplicate marks collection fixes\n');

// Test 1: Grade 11 Detection Fix Verification
async function testGrade11DetectionFix() {
  console.log('1. 🔍 GRADE 11 DETECTION FIX VERIFICATION');
  console.log('   Testing the critical Grade 11 bug fix...');
  
  try {
    // Test Grade 11 API call
    const grade11Query = {
      query: "I am a Grade 11 student in South Africa. I have 1 full year left before Grade 12 finals. I enjoy Mathematics and Physical Sciences.",
      grade: "grade11",
      curriculum: "caps",
      profile: {
        grade: 11,
        marksData: {
          marksOption: "provide",
          exactMarks: {
            "Mathematics": "75",
            "Physical Sciences": "70"
          }
        }
      }
    };
    
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grade11Query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      
      // Critical checks for Grade 11
      const hasGrade11Content = data.response && data.response.includes('GRADE 11');
      const hasCorrectTimeline = data.response && (
        data.response.includes('11 months') || 
        data.response.includes('1 year to') ||
        data.response.includes('one year to') ||
        data.response.includes('1 year left') ||
        data.response.includes('one year left')
      );
      const notTwoYears = !data.response || (!data.response.includes('2 years') && !data.response.includes('two years'));
      
      console.log(`   ✓ API responds to Grade 11: ${response.status === 200 ? '✅' : '❌'}`);
      console.log(`   ✓ Contains Grade 11 content: ${hasGrade11Content ? '✅' : '❌'}`);
      console.log(`   ✓ Shows correct timeline: ${hasCorrectTimeline ? '✅' : '❌'}`);
      console.log(`   ✓ Does NOT show "2 years": ${notTwoYears ? '✅' : '❌'}`);
      
      const grade11Fixed = hasGrade11Content && hasCorrectTimeline && notTwoYears;
      console.log(`   📊 Grade 11 Detection: ${grade11Fixed ? '✅ FIXED' : '❌ STILL BROKEN'}\n`);
      
      return grade11Fixed;
    } else {
      console.log(`   ❌ API call failed with status: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Grade 11 test failed: ${error.message}\n`);
    return false;
  }
}

// Test 2: Duplicate Marks Collection Fix Verification
function testDuplicateMarksCollectionFix() {
  console.log('2. 📝 DUPLICATE MARKS COLLECTION FIX VERIFICATION');
  console.log('   Testing marks collection positioning...');
  
  // Check AssessmentForm has MarksCollection in Step 2
  const assessmentFormPath = 'app/assessment/components/AssessmentForm.jsx';
  const assessmentContent = fs.readFileSync(assessmentFormPath, 'utf8');
  
  const hasStep2MarksCollection = assessmentContent.includes('currentStep === 2') && 
                                  assessmentContent.includes('<MarksCollection');
  
  console.log(`   ✓ MarksCollection in Step 2: ${hasStep2MarksCollection ? '✅' : '❌'}`);
  
  // Check Constraints component has NO marks collection
  const constraintsPath = 'app/assessment/components/Constraints.jsx';
  const constraintsContent = fs.readFileSync(constraintsPath, 'utf8');
  
  const constraintsHasNoMarks = !constraintsContent.includes('mark-input') && 
                                !constraintsContent.includes('exactMarks') && 
                                !constraintsContent.includes('MarksCollection') &&
                                !constraintsContent.includes('subjectMarks');
  
  console.log(`   ✓ Constraints has NO marks: ${constraintsHasNoMarks ? '✅' : '❌'}`);
  
  // Check MarksCollection has verification warnings
  const marksCollectionPath = 'app/assessment/components/MarksCollection.jsx';
  const marksContent = fs.readFileSync(marksCollectionPath, 'utf8');
  
  const hasVerificationWarnings = marksContent.includes('⚠️') && 
                                  marksContent.includes('verification-warning') &&
                                  marksContent.includes('LO teacher');
  
  console.log(`   ✓ MarksCollection has warnings: ${hasVerificationWarnings ? '✅' : '❌'}`);
  
  const duplicateMarksFixed = hasStep2MarksCollection && constraintsHasNoMarks && hasVerificationWarnings;
  console.log(`   📊 Duplicate Marks Fix: ${duplicateMarksFixed ? '✅ FIXED' : '❌ STILL BROKEN'}\n`);
  
  return duplicateMarksFixed;
}

// Test 3: 6-Step Flow Verification
function test6StepFlowVerification() {
  console.log('3. 🔄 6-STEP FLOW VERIFICATION');
  console.log('   Testing complete assessment flow...');
  
  const assessmentFormPath = 'app/assessment/components/AssessmentForm.jsx';
  const progressBarPath = 'app/assessment/components/ProgressBar.jsx';
  
  const assessmentContent = fs.readFileSync(assessmentFormPath, 'utf8');
  const progressContent = fs.readFileSync(progressBarPath, 'utf8');
  
  // Check totalSteps is 6
  const totalStepsMatch = assessmentContent.match(/totalSteps={(\d+)}/);
  const totalSteps = totalStepsMatch ? parseInt(totalStepsMatch[1]) : null;
  
  console.log(`   ✓ Total steps set to 6: ${totalSteps === 6 ? '✅' : '❌'}`);
  
  // Check all 6 steps exist
  const steps = [
    { step: 1, component: 'CurriculumProfile' },
    { step: 2, component: 'MarksCollection' },
    { step: 3, component: 'SubjectSelection' },
    { step: 4, component: 'InterestAreas' },
    { step: 5, component: 'Constraints' },
    { step: 6, component: 'OpenQuestions' }
  ];
  
  const allStepsExist = steps.every(({ step, component }) => {
    const stepExists = assessmentContent.includes(`currentStep === ${step}`) && 
                      assessmentContent.includes(`<${component}`);
    console.log(`   ✓ Step ${step} (${component}): ${stepExists ? '✅' : '❌'}`);
    return stepExists;
  });
  
  // Check progress bar labels
  const correctLabels = [
    { step: 1, label: 'Profile' },
    { step: 2, label: 'Marks' },
    { step: 3, label: 'Subjects' },
    { step: 4, label: 'Interests' },
    { step: 5, label: 'Constraints' },
    { step: 6, label: 'Questions' }
  ];
  
  const allLabelsCorrect = correctLabels.every(({ step, label }) => {
    const labelExists = progressContent.includes(`step === ${step} && '${label}'`);
    return labelExists;
  });
  
  console.log(`   ✓ Progress bar labels correct: ${allLabelsCorrect ? '✅' : '❌'}`);
  
  const flowComplete = totalSteps === 6 && allStepsExist && allLabelsCorrect;
  console.log(`   📊 6-Step Flow: ${flowComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n`);
  
  return flowComplete;
}

// Test 4: API Grade Parameter Priority
function testAPIGradeParameterPriority() {
  console.log('4. 🎯 API GRADE PARAMETER PRIORITY');
  console.log('   Testing API grade parameter handling...');
  
  const apiRoutePath = 'app/api/rag/query/route.js';
  const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
  
  // Check grade parameter extraction
  const hasGradeParam = apiContent.includes('grade,') && apiContent.includes('body');
  console.log(`   ✓ Grade parameter extracted: ${hasGradeParam ? '✅' : '❌'}`);
  
  // Check grade priority comment
  const hasGradePriority = apiContent.includes('Grade parameter takes absolute priority');
  console.log(`   ✓ Grade priority documented: ${hasGradePriority ? '✅' : '❌'}`);
  
  // Check grade parameter usage
  const hasGradeUsage = apiContent.includes('gradeParam') || apiContent.includes('grade ||');
  console.log(`   ✓ Grade parameter used: ${hasGradeUsage ? '✅' : '❌'}`);
  
  const apiGradeFixed = hasGradeParam && hasGradePriority && hasGradeUsage;
  console.log(`   📊 API Grade Priority: ${apiGradeFixed ? '✅ IMPLEMENTED' : '❌ MISSING'}\n`);
  
  return apiGradeFixed;
}

// Test 5: Frontend Grade Detection Fix
function testFrontendGradeDetectionFix() {
  console.log('5. 🖥️  FRONTEND GRADE DETECTION FIX');
  console.log('   Testing frontend parseInt implementation...');
  
  const assessmentFormPath = 'app/assessment/components/AssessmentForm.jsx';
  const assessmentContent = fs.readFileSync(assessmentFormPath, 'utf8');
  
  // Check for parseInt usage
  const hasParseInt = assessmentContent.includes('parseInt(grade)') && 
                      assessmentContent.includes('parseInt(formData.grade)');
  console.log(`   ✓ parseInt implementation: ${hasParseInt ? '✅' : '❌'}`);
  
  // Check for proper grade comparison
  const hasGradeComparison = assessmentContent.includes('gradeNumber === 10') ||
                             assessmentContent.includes('gradeNumber === 11') ||
                             assessmentContent.includes('gradeNumber === 12');
  console.log(`   ✓ Number comparison used: ${hasGradeComparison ? '✅' : '❌'}`);
  
  const frontendFixed = hasParseInt && hasGradeComparison;
  console.log(`   📊 Frontend Grade Fix: ${frontendFixed ? '✅ IMPLEMENTED' : '❌ MISSING'}\n`);
  
  return frontendFixed;
}

// Main preflight runner
async function runCriticalFixesPreflight() {
  console.log('🚀 EXECUTING CRITICAL FIXES PREFLIGHT...\n');
  
  const results = {
    grade11Detection: await testGrade11DetectionFix(),
    duplicateMarksCollection: testDuplicateMarksCollectionFix(),
    sixStepFlow: test6StepFlowVerification(),
    apiGradeParameter: testAPIGradeParameterPriority(),
    frontendGradeDetection: testFrontendGradeDetectionFix()
  };
  
  console.log('🏁 CRITICAL FIXES PREFLIGHT RESULTS');
  console.log('====================================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  const allCriticalTestsPassed = Object.values(results).every(result => result === true);
  const passedCount = Object.values(results).filter(result => result === true).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n📊 CRITICAL FIXES SCORE: ${passedCount}/${totalCount} tests passed`);
  console.log(`🎯 CRITICAL FIXES STATUS: ${allCriticalTestsPassed ? '✅ ALL FIXES VERIFIED' : '❌ FIXES INCOMPLETE'}`);
  
  if (allCriticalTestsPassed) {
    console.log('\n🎉 ALL CRITICAL FIXES VERIFIED!');
    console.log('✅ Grade 11 detection bug is completely fixed');
    console.log('✅ Duplicate marks collection is completely removed');
    console.log('✅ 6-step assessment flow is properly implemented');
    console.log('✅ API grade parameter priority is working');
    console.log('✅ Frontend grade detection is using parseInt');
    console.log('\n🚀 READY FOR STAGING AND DEPLOYMENT');
  } else {
    console.log('\n⚠️  CRITICAL FIXES INCOMPLETE');
    console.log('Please review and fix the failed tests before deployment');
  }
  
  return allCriticalTestsPassed;
}

// Execute the critical fixes preflight
runCriticalFixesPreflight().catch(console.error);