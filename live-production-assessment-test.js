#!/usr/bin/env node

/**
 * LIVE PRODUCTION ASSESSMENT TEST
 * Comprehensive test of thandi.online assessment form
 */

import fetch from 'node-fetch';

console.log('🌐 LIVE PRODUCTION ASSESSMENT TEST');
console.log('============================================================');
console.log(`📅 Test Time: ${new Date().toISOString()}`);
console.log(`🎯 Target: https://thandi.online`);
console.log('');

// Test configuration
const BASE_URL = 'https://thandi.online';
const TEST_SCENARIOS = [
  {
    name: 'Grade 12 Engineering Student',
    profile: {
      name: 'Alex Mthembu',
      grade: '12',
      school: 'Johannesburg High School',
      marks: {
        mathematics: 85,
        physical_sciences: 82,
        english: 78,
        life_orientation: 80,
        egd: 88,
        geography: 75
      },
      interests: ['engineering', 'technology'],
      constraints: {
        financial: 'medium',
        location: 'gauteng'
      }
    }
  },
  {
    name: 'Grade 11 Medicine Student',
    profile: {
      name: 'Nomsa Dlamini',
      grade: '11',
      school: 'Cape Town Secondary',
      marks: {
        mathematics: 78,
        physical_sciences: 85,
        life_sciences: 90,
        english: 82,
        life_orientation: 85,
        afrikaans: 70
      },
      interests: ['medicine', 'healthcare'],
      constraints: {
        financial: 'high',
        location: 'western_cape'
      }
    }
  },
  {
    name: 'Grade 10 Business Student',
    profile: {
      name: 'Thabo Molefe',
      grade: '10',
      school: 'Durban Academy',
      marks: {
        mathematics: 72,
        english: 80,
        life_orientation: 78,
        accounting: 85,
        business_studies: 88,
        economics: 75
      },
      interests: ['business', 'finance'],
      constraints: {
        financial: 'low',
        location: 'kwazulu_natal'
      }
    }
  }
];

// Helper function to simulate form submission
async function submitAssessment(scenario) {
  console.log(`🧪 Testing: ${scenario.name}`);
  console.log(`   Grade: ${scenario.profile.grade}`);
  console.log(`   School: ${scenario.profile.school}`);
  console.log(`   Interests: ${scenario.profile.interests.join(', ')}`);
  
  try {
    // Test 1: Check if assessment page loads
    console.log('   📄 Step 1: Loading assessment page...');
    const assessmentPageResponse = await fetch(`${BASE_URL}/assessment`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Thandi-Live-Test/1.0'
      }
    });
    
    if (!assessmentPageResponse.ok) {
      throw new Error(`Assessment page failed: ${assessmentPageResponse.status}`);
    }
    
    console.log('   ✅ Assessment page loaded successfully');
    
    // Test 2: Submit assessment data
    console.log('   📤 Step 2: Submitting assessment...');
    const assessmentData = {
      query: `I am a Grade ${scenario.profile.grade} student interested in ${scenario.profile.interests.join(' and ')}. My marks are: ${Object.entries(scenario.profile.marks).map(([subject, mark]) => `${subject}: ${mark}%`).join(', ')}. I need career guidance.`,
      grade: scenario.profile.grade,
      curriculum: 'caps',
      profile: {
        ...scenario.profile,
        sessionId: `live-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };
    
    const ragResponse = await fetch(`${BASE_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Thandi-Live-Test/1.0'
      },
      body: JSON.stringify(assessmentData)
    });
    
    if (!ragResponse.ok) {
      throw new Error(`RAG API failed: ${ragResponse.status} - ${ragResponse.statusText}`);
    }
    
    const ragResult = await ragResponse.json();
    console.log('   ✅ Assessment submitted successfully');
    
    // Test 3: Verify response structure
    console.log('   🔍 Step 3: Verifying response structure...');
    
    const requiredFields = ['success', 'response', 'fullResponse', 'metadata'];
    const missingFields = requiredFields.filter(field => !(field in ragResult));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('   ✅ Response structure valid');
    
    // Test 4: Check CAG validation
    console.log('   🛡️ Step 4: Checking CAG validation...');
    
    if (ragResult.validation) {
      console.log(`   📊 Validation Status: ${ragResult.validation.status}`);
      console.log(`   📈 Validation Score: ${ragResult.validation.overallScore || 'N/A'}%`);
      console.log(`   ⏱️ Validation Time: ${ragResult.validation.processingTime || 'N/A'}ms`);
      
      if (ragResult.validation.status === 'approved' || ragResult.validation.status === 'needs_enhancement') {
        console.log('   ✅ CAG validation passed');
      } else {
        console.log('   ⚠️ CAG validation needs attention');
      }
    } else {
      console.log('   ⚠️ No CAG validation data found');
    }
    
    // Test 5: Check response quality
    console.log('   📝 Step 5: Checking response quality...');
    
    const response = ragResult.response || ragResult.fullResponse || '';
    const qualityChecks = {
      hasVerificationWarning: response.includes('⚠️') && response.includes('verify'),
      hasGradeSpecificContent: response.includes(`Grade ${scenario.profile.grade}`),
      hasCareerRecommendations: response.includes('Career') || response.includes('Program'),
      hasBursaryInformation: response.includes('Bursary') || response.includes('Financial Aid'),
      hasActionPlan: response.includes('Action') || response.includes('Next Steps'),
      hasAPSInformation: response.includes('APS') || response.includes('Admission'),
      responseLength: response.length
    };
    
    console.log(`   📏 Response Length: ${qualityChecks.responseLength} characters`);
    console.log(`   ⚠️ Verification Warning: ${qualityChecks.hasVerificationWarning ? '✅' : '❌'}`);
    console.log(`   🎓 Grade-Specific Content: ${qualityChecks.hasGradeSpecificContent ? '✅' : '❌'}`);
    console.log(`   💼 Career Recommendations: ${qualityChecks.hasCareerRecommendations ? '✅' : '❌'}`);
    console.log(`   💰 Bursary Information: ${qualityChecks.hasBursaryInformation ? '✅' : '❌'}`);
    console.log(`   📋 Action Plan: ${qualityChecks.hasActionPlan ? '✅' : '❌'}`);
    console.log(`   📊 APS Information: ${qualityChecks.hasAPSInformation ? '✅' : '❌'}`);
    
    // Test 6: Performance metrics
    console.log('   ⚡ Step 6: Performance metrics...');
    
    if (ragResult.performance) {
      console.log(`   ⏱️ Total Response Time: ${ragResult.performance.totalTime || 'N/A'}ms`);
      console.log(`   🔄 Processing Time: ${ragResult.performance.processingTime || 'N/A'}ms`);
      console.log(`   🛡️ Validation Time: ${ragResult.performance.validationTime || 'N/A'}ms`);
    }
    
    // Calculate overall test score
    const qualityScore = Object.values(qualityChecks).filter(check => 
      typeof check === 'boolean' ? check : check > 0
    ).length;
    const maxQualityScore = Object.keys(qualityChecks).length - 1; // Exclude responseLength
    const testScore = Math.round((qualityScore / maxQualityScore) * 100);
    
    console.log(`   🎯 Test Score: ${testScore}% (${qualityScore}/${maxQualityScore} checks passed)`);
    
    return {
      success: true,
      scenario: scenario.name,
      testScore,
      qualityChecks,
      validation: ragResult.validation,
      performance: ragResult.performance,
      responseLength: response.length
    };
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return {
      success: false,
      scenario: scenario.name,
      error: error.message
    };
  }
}

// Main test execution
async function runLiveProductionTest() {
  console.log('🚀 Starting live production assessment tests...');
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`📋 Test ${i + 1}/${TEST_SCENARIOS.length}: ${scenario.name}`);
    console.log('─'.repeat(60));
    
    const result = await submitAssessment(scenario);
    results.push(result);
    
    console.log('');
    
    // Wait between tests to avoid rate limiting
    if (i < TEST_SCENARIOS.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('');
    }
  }
  
  // Generate summary report
  console.log('📊 LIVE PRODUCTION TEST SUMMARY');
  console.log('============================================================');
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed Tests: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const avgTestScore = Math.round(
      successfulTests.reduce((sum, r) => sum + r.testScore, 0) / successfulTests.length
    );
    console.log(`📈 Average Test Score: ${avgTestScore}%`);
    
    const avgResponseLength = Math.round(
      successfulTests.reduce((sum, r) => sum + r.responseLength, 0) / successfulTests.length
    );
    console.log(`📏 Average Response Length: ${avgResponseLength} characters`);
    
    // Check CAG validation performance
    const validatedResponses = successfulTests.filter(r => r.validation);
    if (validatedResponses.length > 0) {
      console.log(`🛡️ CAG Validation Rate: ${validatedResponses.length}/${successfulTests.length} (${Math.round(validatedResponses.length / successfulTests.length * 100)}%)`);
      
      const approvedValidations = validatedResponses.filter(r => 
        r.validation.status === 'approved' || r.validation.status === 'needs_enhancement'
      );
      console.log(`✅ CAG Approval Rate: ${approvedValidations.length}/${validatedResponses.length} (${Math.round(approvedValidations.length / validatedResponses.length * 100)}%)`);
    }
  }
  
  if (failedTests.length > 0) {
    console.log('');
    console.log('❌ Failed Test Details:');
    failedTests.forEach(test => {
      console.log(`   - ${test.scenario}: ${test.error}`);
    });
  }
  
  console.log('');
  console.log('🎯 OVERALL ASSESSMENT');
  console.log('============================================================');
  
  const overallSuccess = (successfulTests.length / results.length) * 100;
  
  if (overallSuccess >= 90) {
    console.log('🟢 EXCELLENT: Production system performing excellently');
  } else if (overallSuccess >= 75) {
    console.log('🟡 GOOD: Production system performing well with minor issues');
  } else if (overallSuccess >= 50) {
    console.log('🟠 FAIR: Production system has some issues that need attention');
  } else {
    console.log('🔴 POOR: Production system has significant issues requiring immediate attention');
  }
  
  console.log(`📊 Success Rate: ${overallSuccess.toFixed(1)}%`);
  console.log('');
  
  // Feature verification summary
  console.log('🔍 FEATURE VERIFICATION SUMMARY');
  console.log('============================================================');
  
  if (successfulTests.length > 0) {
    const featureChecks = {
      'Assessment Form': successfulTests.length > 0,
      'RAG API': successfulTests.length > 0,
      'CAG Validation': successfulTests.some(r => r.validation),
      'Grade-Specific Content': successfulTests.some(r => r.qualityChecks?.hasGradeSpecificContent),
      'Verification Warnings': successfulTests.some(r => r.qualityChecks?.hasVerificationWarning),
      'Career Recommendations': successfulTests.some(r => r.qualityChecks?.hasCareerRecommendations),
      'Bursary Information': successfulTests.some(r => r.qualityChecks?.hasBursaryInformation),
      'Action Plans': successfulTests.some(r => r.qualityChecks?.hasActionPlan)
    };
    
    Object.entries(featureChecks).forEach(([feature, working]) => {
      console.log(`${working ? '✅' : '❌'} ${feature}: ${working ? 'WORKING' : 'NOT DETECTED'}`);
    });
  }
  
  console.log('');
  console.log('============================================================');
  console.log('🎉 LIVE PRODUCTION TEST COMPLETE');
  console.log('============================================================');
  
  return {
    totalTests: results.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    successRate: overallSuccess,
    results
  };
}

// Execute the test
runLiveProductionTest().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});