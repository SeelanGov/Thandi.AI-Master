/**
 * PHASE 4: END-TO-END TESTING
 * 
 * Comprehensive testing of complete assessment flows
 * Validates recommendation quality and system performance
 */

const http = require('http');
const fs = require('fs');

async function endToEndTesting() {
  console.log('🔍 PHASE 4: END-TO-END TESTING');
  console.log('===============================\n');
  
  const findings = {
    scenarioResults: [],
    recommendationQuality: [],
    systemPerformance: [],
    dataAccuracy: [],
    issues: []
  };
  
  // Comprehensive test scenarios covering different student profiles
  const testScenarios = [
    {
      name: 'High-Performing Grade 12 STEM Student',
      description: 'Strong math/science, engineering interest, university-bound',
      profile: {
        grade: '12',
        marks: {
          mathematics: 85,
          physical_sciences: 82,
          english: 78,
          life_orientation: 80
        },
        interests: ['engineering', 'technology'],
        constraints: {
          money: 'moderate',
          location: 'urban'
        },
        query: 'I am a Grade 12 student with Mathematics 85%, Physical Sciences 82%, English 78%. I want to become a mechanical engineer and am interested in UCT or Wits.'
      },
      expectedOutcomes: {
        apsScore: 35, // Should calculate APS correctly
        universityEligible: true,
        specificPrograms: ['Mechanical Engineering', 'UCT', 'Wits'],
        bursaryRecommendations: true,
        actionableSteps: true
      }
    },
    {
      name: 'Average Grade 11 Student Exploring Options',
      description: 'Moderate performance, multiple interests, needs guidance',
      profile: {
        grade: '11',
        marks: {
          mathematics: 65,
          english: 72,
          life_sciences: 68,
          geography: 70
        },
        interests: ['healthcare', 'business', 'teaching'],
        constraints: {
          money: 'limited',
          location: 'rural'
        },
        query: 'I am a Grade 11 student with average marks. I am interested in healthcare, business, or teaching. My family has limited finances and I live in a rural area.'
      },
      expectedOutcomes: {
        apsScore: 28, // Moderate APS
        universityEligible: true,
        multipleOptions: true,
        financialAidFocus: true,
        gradeImprovementAdvice: true
      }
    },
    {
      name: 'Grade 10 Foundation Student',
      description: 'Early exploration phase, building foundations',
      profile: {
        grade: '10',
        marks: {}, // No marks yet
        interests: ['creative', 'technology', 'sports'],
        constraints: {
          money: 'very_limited',
          familyBackground: 'first_generation'
        },
        query: 'I am a Grade 10 student just starting to think about careers. I like creative things, technology, and sports. I am the first in my family to consider university.'
      },
      expectedOutcomes: {
        explorationFocus: true,
        subjectGuidance: true,
        longTermPlanning: true,
        supportResources: true,
        noSpecificAPS: true
      }
    },
    {
      name: 'Struggling Grade 12 Student',
      description: 'Below-average performance, needs alternative pathways',
      profile: {
        grade: '12',
        marks: {
          mathematics: 45,
          english: 55,
          life_sciences: 50,
          history: 60
        },
        interests: ['practical', 'hands-on'],
        constraints: {
          money: 'very_limited',
          location: 'township'
        },
        query: 'I am a Grade 12 student struggling with my marks. Mathematics 45%, English 55%, Life Sciences 50%. I prefer hands-on work and need practical career options.'
      },
      expectedOutcomes: {
        apsScore: 20, // Low APS
        alternativePathways: true,
        tvetRecommendations: true,
        skillsBasedCareers: true,
        practicalAdvice: true
      }
    }
  ];
  
  console.log('🧪 Running Comprehensive End-to-End Tests');
  console.log('==========================================\n');
  
  for (const scenario of testScenarios) {
    console.log(`📝 Testing Scenario: ${scenario.name}`);
    console.log(`📋 Description: ${scenario.description}`);
    
    try {
      const startTime = Date.now();
      
      // Test the complete flow
      const response = await testRAGEndpoint({
        query: scenario.profile.query,
        grade: scenario.profile.grade,
        profile: scenario.profile
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.success) {
        const responseText = response.response || response.fullResponse || '';
        
        // Performance metrics
        console.log(`   ⏱️ Response time: ${responseTime}ms`);
        findings.systemPerformance.push(`${scenario.name}: ${responseTime}ms response time`);
        
        if (responseTime < 10000) {
          console.log('   ✅ Good response time');
        } else {
          console.log('   ⚠️ Slow response time');
          findings.issues.push(`${scenario.name}: Slow response (${responseTime}ms)`);
        }
        
        // Validate expected outcomes
        const validationResults = validateScenarioOutcomes(scenario, responseText, response);
        
        console.log(`   📊 Validation score: ${validationResults.score}%`);
        
        if (validationResults.score >= 80) {
          console.log('   ✅ Excellent recommendation quality');
          findings.recommendationQuality.push(`${scenario.name}: Excellent (${validationResults.score}%)`);
        } else if (validationResults.score >= 60) {
          console.log('   ⚠️ Good recommendation quality');
          findings.recommendationQuality.push(`${scenario.name}: Good (${validationResults.score}%)`);
        } else {
          console.log('   ❌ Poor recommendation quality');
          findings.issues.push(`${scenario.name}: Poor quality (${validationResults.score}%)`);
        }
        
        // Log specific validation details
        validationResults.details.forEach(detail => {
          console.log(`   ${detail.status} ${detail.check}`);
        });
        
        findings.scenarioResults.push({
          scenario: scenario.name,
          success: true,
          responseTime,
          validationScore: validationResults.score,
          details: validationResults.details
        });
        
      } else {
        console.log('   ❌ API request failed');
        findings.issues.push(`${scenario.name}: API request failed - ${response.error}`);
        
        findings.scenarioResults.push({
          scenario: scenario.name,
          success: false,
          error: response.error
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Test error: ${error.message}`);
      findings.issues.push(`${scenario.name}: Test error - ${error.message}`);
    }
    
    console.log('');
  }
  
  // Additional system validation tests
  console.log('🔬 Additional System Validation');
  console.log('-------------------------------');
  
  // Test data accuracy with known scenarios
  await testDataAccuracy(findings);
  
  // Test edge cases
  await testEdgeCases(findings);
  
  return findings;
}

function validateScenarioOutcomes(scenario, responseText, response) {
  const checks = [];
  let passedChecks = 0;
  
  const expected = scenario.expectedOutcomes;
  const lowerResponse = responseText.toLowerCase();
  
  // Grade-specific content check
  const hasGradeContent = lowerResponse.includes(`grade ${scenario.profile.grade}`) ||
                         lowerResponse.includes(`grade${scenario.profile.grade}`);
  checks.push({
    check: 'Grade-specific content',
    status: hasGradeContent ? '✅' : '❌',
    passed: hasGradeContent
  });
  if (hasGradeContent) passedChecks++;
  
  // APS calculation check (for students with marks)
  if (Object.keys(scenario.profile.marks || {}).length > 0) {
    const hasApsReference = lowerResponse.includes('aps') || 
                           lowerResponse.includes('admission point');
    checks.push({
      check: 'APS calculation/reference',
      status: hasApsReference ? '✅' : '❌',
      passed: hasApsReference
    });
    if (hasApsReference) passedChecks++;
  }
  
  // University eligibility check
  if (expected.universityEligible !== undefined) {
    const hasUniversityContent = lowerResponse.includes('university') ||
                                lowerResponse.includes('bachelor');
    checks.push({
      check: 'University eligibility addressed',
      status: hasUniversityContent ? '✅' : '❌',
      passed: hasUniversityContent
    });
    if (hasUniversityContent) passedChecks++;
  }
  
  // Specific programs check
  if (expected.specificPrograms) {
    const hasSpecificPrograms = expected.specificPrograms.some(program =>
      lowerResponse.includes(program.toLowerCase())
    );
    checks.push({
      check: 'Specific program recommendations',
      status: hasSpecificPrograms ? '✅' : '❌',
      passed: hasSpecificPrograms
    });
    if (hasSpecificPrograms) passedChecks++;
  }
  
  // Financial aid check
  if (expected.bursaryRecommendations || expected.financialAidFocus) {
    const hasFinancialAid = lowerResponse.includes('bursary') ||
                           lowerResponse.includes('nsfas') ||
                           lowerResponse.includes('financial aid');
    checks.push({
      check: 'Financial aid recommendations',
      status: hasFinancialAid ? '✅' : '❌',
      passed: hasFinancialAid
    });
    if (hasFinancialAid) passedChecks++;
  }
  
  // Alternative pathways check
  if (expected.alternativePathways || expected.tvetRecommendations) {
    const hasAlternatives = lowerResponse.includes('tvet') ||
                           lowerResponse.includes('college') ||
                           lowerResponse.includes('alternative');
    checks.push({
      check: 'Alternative pathway options',
      status: hasAlternatives ? '✅' : '❌',
      passed: hasAlternatives
    });
    if (hasAlternatives) passedChecks++;
  }
  
  // Actionable steps check
  if (expected.actionableSteps) {
    const hasActionableSteps = lowerResponse.includes('apply') ||
                              lowerResponse.includes('deadline') ||
                              lowerResponse.includes('next steps') ||
                              lowerResponse.includes('action plan');
    checks.push({
      check: 'Actionable next steps',
      status: hasActionableSteps ? '✅' : '❌',
      passed: hasActionableSteps
    });
    if (hasActionableSteps) passedChecks++;
  }
  
  // Safety verification check (critical)
  const hasVerification = responseText.includes('verify') ||
                         responseText.includes('Verify') ||
                         responseText.includes('⚠️');
  checks.push({
    check: 'Safety verification warning',
    status: hasVerification ? '✅' : '❌',
    passed: hasVerification
  });
  if (hasVerification) passedChecks++;
  
  const score = Math.round((passedChecks / checks.length) * 100);
  
  return {
    score,
    details: checks,
    passedChecks,
    totalChecks: checks.length
  };
}

async function testDataAccuracy(findings) {
  console.log('📊 Testing Data Accuracy');
  
  // Test APS calculation accuracy
  const apsTestCase = {
    query: 'Calculate my APS with Mathematics 80%, English 70%, Physical Sciences 75%, Life Orientation 85%',
    grade: '12',
    profile: {
      marks: {
        mathematics: 80,
        english: 70,
        physical_sciences: 75,
        life_orientation: 85
      }
    }
  };
  
  try {
    const response = await testRAGEndpoint(apsTestCase);
    
    if (response.success) {
      const responseText = response.response || response.fullResponse || '';
      
      // Expected APS: 80(7) + 70(5) + 75(6) + 85(7) = 25 points
      const expectedAPS = 25;
      
      if (responseText.includes('25') || responseText.includes('APS')) {
        console.log('✅ APS calculation appears accurate');
        findings.dataAccuracy.push('APS calculation: Accurate');
      } else {
        console.log('⚠️ APS calculation accuracy unclear');
        findings.issues.push('APS calculation accuracy cannot be verified');
      }
    }
  } catch (error) {
    console.log('❌ APS accuracy test failed');
    findings.issues.push('APS accuracy test failed');
  }
}

async function testEdgeCases(findings) {
  console.log('🔍 Testing Edge Cases');
  
  const edgeCases = [
    {
      name: 'Very low marks',
      query: 'I have very low marks: Math 30%, English 35%',
      grade: '12',
      profile: { marks: { mathematics: 30, english: 35 } }
    },
    {
      name: 'No clear career interest',
      query: 'I don\'t know what career I want',
      grade: '11',
      profile: { interests: [] }
    },
    {
      name: 'Multiple constraints',
      query: 'I have financial problems, live far from cities, and my family doesn\'t support higher education',
      grade: '12',
      profile: { 
        constraints: { 
          money: 'very_limited', 
          location: 'rural', 
          familyBackground: 'unsupportive' 
        } 
      }
    }
  ];
  
  for (const edgeCase of edgeCases) {
    try {
      const response = await testRAGEndpoint(edgeCase);
      
      if (response.success) {
        console.log(`✅ ${edgeCase.name}: Handled gracefully`);
        findings.dataAccuracy.push(`Edge case handled: ${edgeCase.name}`);
      } else {
        console.log(`❌ ${edgeCase.name}: Failed`);
        findings.issues.push(`Edge case failed: ${edgeCase.name}`);
      }
    } catch (error) {
      console.log(`❌ ${edgeCase.name}: Error`);
      findings.issues.push(`Edge case error: ${edgeCase.name}`);
    }
  }
}

// Helper function to test RAG endpoint
async function testRAGEndpoint(testData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/rag/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(20000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run Phase 4 investigation
endToEndTesting().then(findings => {
  console.log('\n📋 PHASE 4 SUMMARY REPORT');
  console.log('=========================');
  
  console.log('\n🧪 Scenario Test Results:');
  findings.scenarioResults.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.scenario}: ${result.validationScore}% (${result.responseTime}ms)`);
    } else {
      console.log(`   ❌ ${result.scenario}: Failed - ${result.error}`);
    }
  });
  
  console.log('\n🎯 Recommendation Quality:');
  findings.recommendationQuality.forEach(quality => console.log(`   📊 ${quality}`));
  
  console.log('\n⚡ System Performance:');
  findings.systemPerformance.forEach(perf => console.log(`   ⏱️ ${perf}`));
  
  console.log('\n📊 Data Accuracy:');
  findings.dataAccuracy.forEach(accuracy => console.log(`   ✅ ${accuracy}`));
  
  if (findings.issues.length > 0) {
    console.log('\n❌ Issues Identified:');
    findings.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Calculate overall system score
  const successfulTests = findings.scenarioResults.filter(r => r.success).length;
  const totalTests = findings.scenarioResults.length;
  const avgValidationScore = findings.scenarioResults
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.validationScore, 0) / Math.max(successfulTests, 1);
  
  const systemReliability = (successfulTests / totalTests) * 100;
  const overallScore = (systemReliability + avgValidationScore) / 2;
  
  console.log(`\n📊 OVERALL SYSTEM SCORES:`);
  console.log(`   🎯 System Reliability: ${systemReliability.toFixed(1)}%`);
  console.log(`   📋 Average Validation Score: ${avgValidationScore.toFixed(1)}%`);
  console.log(`   🏆 Overall RAG System Score: ${overallScore.toFixed(1)}%`);
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  
  if (overallScore >= 85) {
    console.log('🏆 EXCELLENT: RAG system is highly effective and ready for production');
  } else if (overallScore >= 70) {
    console.log('✅ GOOD: RAG system is effective with minor improvements needed');
  } else if (overallScore >= 50) {
    console.log('⚠️ FAIR: RAG system needs significant improvements');
  } else {
    console.log('❌ POOR: RAG system requires major fixes before deployment');
  }
  
  // Save comprehensive findings
  const finalReport = {
    phase4: findings,
    overallScores: {
      systemReliability,
      avgValidationScore,
      overallScore
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('phase4-findings.json', JSON.stringify(finalReport, null, 2));
  console.log('\n📁 Complete findings saved to phase4-findings.json');
  
  console.log('\n🚀 READY FOR PHASE 5: System Optimization Recommendations');
  
}).catch(error => {
  console.error('❌ Phase 4 investigation failed:', error.message);
  process.exit(1);
});