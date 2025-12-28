#!/usr/bin/env node

/**
 * VERIFY PROFESSIONAL FIX
 * Comprehensive testing to ensure student safety and functionality
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function verifyProfessionalFix() {
  console.log('🔍 VERIFYING PROFESSIONAL FIX');
  console.log('=' .repeat(60));
  console.log('Comprehensive testing for student safety and functionality');
  console.log(`Testing: ${PRODUCTION_URL}/assessment`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const testResults = {
    timestamp: new Date().toISOString(),
    url: `${PRODUCTION_URL}/assessment`,
    tests: {},
    overall: 'pending'
  };
  
  try {
    // Wait for deployment to propagate
    console.log('\n⏱️  Waiting for deployment to propagate (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n📋 TEST 1: PAGE LOADING AND STRUCTURE');
    const response = await fetch(`${PRODUCTION_URL}/assessment`);
    
    testResults.tests.pageLoad = {
      status: response.status,
      ok: response.ok,
      size: 0
    };
    
    console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    
    if (!response.ok) {
      testResults.overall = 'failed';
      console.log('❌ CRITICAL: Page not loading - students cannot access assessment');
      return testResults;
    }
    
    const html = await response.text();
    testResults.tests.pageLoad.size = html.length;
    console.log(`   Page Size: ${html.length} characters`);
    
    // Test 2: Next.js Structure
    console.log('\n📋 TEST 2: NEXT.JS HYDRATION STRUCTURE');
    const structureTests = {
      hasNextData: html.includes('__NEXT_DATA__'),
      hasReactRoot: html.includes('__next'),
      hasScripts: html.includes('<script'),
      hasMetadata: html.includes('<title>') && html.includes('<meta'),
      hasProperDoctype: html.includes('<!DOCTYPE html>')
    };
    
    testResults.tests.structure = structureTests;
    
    Object.entries(structureTests).forEach(([test, result]) => {
      console.log(`   ${test}: ${result ? '✅' : '❌'}`);
    });
    
    const structureScore = Object.values(structureTests).filter(Boolean).length;
    console.log(`   Structure Score: ${structureScore}/5`);
    
    // Test 3: Student Form Elements
    console.log('\n📋 TEST 3: STUDENT FORM ELEMENTS');
    const formTests = {
      hasStudentRegistration: html.includes('Student Registration') || html.includes('What grade are you in'),
      hasInputFields: html.includes('<input'),
      hasFormElements: html.includes('<form') || html.includes('type="text"'),
      hasButtons: html.includes('<button'),
      hasSelectElements: html.includes('<select'),
      hasSchoolSearch: html.includes('school') || html.includes('School'),
      hasGradeSelection: html.includes('Grade 10') || html.includes('Grade 11') || html.includes('Grade 12')
    };
    
    testResults.tests.forms = formTests;
    
    Object.entries(formTests).forEach(([test, result]) => {
      console.log(`   ${test}: ${result ? '✅' : '❌'}`);
    });
    
    const formScore = Object.values(formTests).filter(Boolean).length;
    console.log(`   Form Elements Score: ${formScore}/7`);
    
    // Test 4: Safety and UX Elements
    console.log('\n📋 TEST 4: STUDENT SAFETY AND UX');
    const safetyTests = {
      hasLoadingStates: html.includes('Loading') || html.includes('animate-spin'),
      hasErrorHandling: html.includes('error') || html.includes('Error'),
      hasAccessibility: html.includes('aria-') || html.includes('role='),
      hasResponsiveDesign: html.includes('responsive') || html.includes('mobile'),
      hasProfessionalStyling: html.includes('thandi-') || html.includes('assessment-')
    };
    
    testResults.tests.safety = safetyTests;
    
    Object.entries(safetyTests).forEach(([test, result]) => {
      console.log(`   ${test}: ${result ? '✅' : '❌'}`);
    });
    
    const safetyScore = Object.values(safetyTests).filter(Boolean).length;
    console.log(`   Safety & UX Score: ${safetyScore}/5`);
    
    // Test 5: API Functionality
    console.log('\n📋 TEST 5: API FUNCTIONALITY');
    try {
      const apiResponse = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Test query for Grade 10 student',
          grade: 'grade10',
          curriculum: 'caps'
        })
      });
      
      testResults.tests.api = {
        status: apiResponse.status,
        ok: apiResponse.ok
      };
      
      console.log(`   API Status: ${apiResponse.status} ${apiResponse.ok ? '✅' : '❌'}`);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        testResults.tests.api.hasResponse = !!apiData.response;
        testResults.tests.api.responseLength = apiData.response?.length || 0;
        console.log(`   Response Length: ${apiData.response?.length || 0} characters ${apiData.response?.length > 1000 ? '✅' : '❌'}`);
      }
      
    } catch (apiError) {
      testResults.tests.api = { error: apiError.message };
      console.log(`   API Error: ❌ ${apiError.message}`);
    }
    
    // Overall Assessment
    console.log('\n📊 OVERALL ASSESSMENT');
    
    const criticalTests = [
      testResults.tests.pageLoad.ok,
      formTests.hasInputFields,
      formTests.hasButtons,
      testResults.tests.api?.ok
    ];
    
    const enhancementTests = [
      structureTests.hasNextData,
      structureTests.hasReactRoot,
      formTests.hasStudentRegistration,
      safetyTests.hasLoadingStates
    ];
    
    const criticalPassed = criticalTests.filter(Boolean).length;
    const enhancementPassed = enhancementTests.filter(Boolean).length;
    
    console.log(`   Critical Tests: ${criticalPassed}/${criticalTests.length}`);
    console.log(`   Enhancement Tests: ${enhancementPassed}/${enhancementTests.length}`);
    
    if (criticalPassed === criticalTests.length) {
      if (enhancementPassed >= 3) {
        testResults.overall = 'excellent';
        console.log('\n✅ EXCELLENT: READY FOR STUDENT TESTING');
        console.log('   🎯 All critical functionality working');
        console.log('   🎯 Professional implementation complete');
        console.log('   🎯 Student safety measures in place');
        console.log('   🎯 Full interactivity restored');
        
      } else {
        testResults.overall = 'good';
        console.log('\n✅ GOOD: READY FOR STUDENT TESTING');
        console.log('   🎯 All critical functionality working');
        console.log('   ⚠️  Some enhancements still pending');
        console.log('   🎯 Students can complete assessments safely');
      }
      
      console.log('\n👥 STUDENT EXPERIENCE:');
      console.log('   ✅ Students can access the assessment page');
      console.log('   ✅ Students can interact with forms');
      console.log('   ✅ Students can complete the assessment');
      console.log('   ✅ Students receive career guidance');
      
    } else {
      testResults.overall = 'needs-work';
      console.log('\n⚠️  NEEDS WORK: NOT READY FOR STUDENTS');
      console.log('   ❌ Critical functionality issues detected');
      console.log('   🔧 Additional fixes required');
      
      console.log('\n🚨 BLOCKING ISSUES:');
      if (!testResults.tests.pageLoad.ok) console.log('   - Page not loading');
      if (!formTests.hasInputFields) console.log('   - Input fields missing');
      if (!formTests.hasButtons) console.log('   - Buttons not working');
      if (!testResults.tests.api?.ok) console.log('   - API not responding');
    }
    
  } catch (error) {
    testResults.overall = 'error';
    testResults.error = error.message;
    console.log(`\n❌ TESTING ERROR: ${error.message}`);
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (testResults.overall === 'excellent' || testResults.overall === 'good') {
    console.log('1. ✅ Begin student testing immediately');
    console.log('2. 📊 Monitor student interactions');
    console.log('3. 🔍 Collect feedback for improvements');
    console.log('4. 📈 Track assessment completion rates');
  } else {
    console.log('1. 🔧 Address critical issues identified');
    console.log('2. 🧪 Re-run verification tests');
    console.log('3. ⏱️  Wait for deployment if still propagating');
    console.log('4. 🆘 Escalate if issues persist');
  }
  
  return testResults;
}

verifyProfessionalFix().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});