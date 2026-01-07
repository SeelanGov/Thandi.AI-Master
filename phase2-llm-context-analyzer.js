/**
 * PHASE 2: LLM CONTEXT UTILIZATION ANALYZER
 * 
 * Tests how effectively the LLM system uses assessment data and knowledge base context
 * Validates personalization depth and recommendation accuracy
 */

const http = require('http');
const fs = require('fs');

async function analyzeLLMContextUtilization() {
  console.log('🔍 PHASE 2: LLM CONTEXT UTILIZATION ANALYSIS');
  console.log('=============================================\n');
  
  const findings = {
    promptEngineering: [],
    contextAwareness: [],
    personalization: [],
    ragRetrieval: [],
    recommendationQuality: [],
    issues: []
  };
  
  // 1. Prompt Engineering Analysis
  console.log('1️⃣ System Prompt Analysis');
  console.log('--------------------------');
  
  try {
    const ragContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
    
    // Check for grade-specific prompt handling
    if (ragContent.includes('generateCareerGuidance') && ragContent.includes('grade')) {
      console.log('✅ Grade-specific prompt generation found');
      findings.promptEngineering.push('Grade-specific prompts implemented');
    }
    
    // Check for student profile integration in prompts
    if (ragContent.includes('studentProfile') && ragContent.includes('marks')) {
      console.log('✅ Student profile integration in prompts');
      findings.promptEngineering.push('Student marks integrated in prompt construction');
    }
    
    // Check for academic calendar context
    if (ragContent.includes('calendarUtils') && ragContent.includes('getStudentContext')) {
      console.log('✅ Academic calendar context integration');
      findings.promptEngineering.push('Academic calendar context added to prompts');
    }
    
    // Check for specific recommendations generation
    if (ragContent.includes('generateSpecificRecommendations')) {
      console.log('✅ Specific recommendations generation found');
      findings.promptEngineering.push('CAG generates specific program recommendations');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing prompts:', error.message);
    findings.issues.push('Cannot analyze prompt engineering');
  }
  
  console.log('');
  
  // 2. Context Awareness Testing
  console.log('2️⃣ Context Awareness Testing');
  console.log('-----------------------------');
  
  // Test scenarios with different student profiles
  const testScenarios = [
    {
      name: 'High-performing Grade 12 STEM student',
      profile: {
        grade: '12',
        marks: {
          mathematics: 85,
          physical_sciences: 80,
          english: 75
        },
        interests: ['engineering', 'technology'],
        query: 'I am a Grade 12 student interested in engineering with strong math and science marks'
      }
    },
    {
      name: 'Average Grade 11 student exploring options',
      profile: {
        grade: '11',
        marks: {
          mathematics: 65,
          english: 70,
          life_sciences: 60
        },
        interests: ['healthcare', 'business'],
        query: 'I am a Grade 11 student with average marks, interested in healthcare or business'
      }
    },
    {
      name: 'Grade 10 student with financial constraints',
      profile: {
        grade: '10',
        marks: {},
        constraints: {
          money: 'limited',
          location: 'rural'
        },
        query: 'I am a Grade 10 student from a rural area with limited financial resources'
      }
    }
  ];
  
  console.log('Testing context awareness with different student profiles...\n');
  
  for (const scenario of testScenarios) {
    console.log(`📝 Testing: ${scenario.name}`);
    
    try {
      const response = await testRAGEndpoint(scenario.profile);
      
      if (response.success) {
        // Check if response is personalized to the student profile
        const responseText = response.response || response.fullResponse || '';
        
        // Check grade-specific content
        const hasGradeSpecificContent = responseText.includes(`Grade ${scenario.profile.grade}`) ||
                                       responseText.includes(`GRADE ${scenario.profile.grade}`);
        
        if (hasGradeSpecificContent) {
          console.log('   ✅ Grade-specific content found');
          findings.contextAwareness.push(`${scenario.name}: Grade-specific guidance provided`);
        } else {
          console.log('   ⚠️ No grade-specific content');
          findings.issues.push(`${scenario.name}: Missing grade-specific content`);
        }
        
        // Check marks utilization (for students with marks)
        if (Object.keys(scenario.profile.marks || {}).length > 0) {
          const hasMarksReference = responseText.includes('APS') || 
                                   responseText.includes('performance') ||
                                   responseText.includes('marks');
          
          if (hasMarksReference) {
            console.log('   ✅ Academic performance referenced');
            findings.contextAwareness.push(`${scenario.name}: Academic performance utilized`);
          } else {
            console.log('   ⚠️ Academic performance not referenced');
            findings.issues.push(`${scenario.name}: Marks data not utilized`);
          }
        }
        
        // Check interest alignment
        if (scenario.profile.interests && scenario.profile.interests.length > 0) {
          const hasInterestAlignment = scenario.profile.interests.some(interest => 
            responseText.toLowerCase().includes(interest.toLowerCase())
          );
          
          if (hasInterestAlignment) {
            console.log('   ✅ Career interests addressed');
            findings.contextAwareness.push(`${scenario.name}: Career interests addressed`);
          } else {
            console.log('   ⚠️ Career interests not addressed');
            findings.issues.push(`${scenario.name}: Career interests ignored`);
          }
        }
        
        // Check constraint consideration
        if (scenario.profile.constraints) {
          const hasConstraintConsideration = responseText.includes('financial') ||
                                           responseText.includes('bursary') ||
                                           responseText.includes('NSFAS') ||
                                           responseText.includes('rural');
          
          if (hasConstraintConsideration) {
            console.log('   ✅ Constraints considered');
            findings.contextAwareness.push(`${scenario.name}: Financial/location constraints addressed`);
          } else {
            console.log('   ⚠️ Constraints not considered');
            findings.issues.push(`${scenario.name}: Student constraints ignored`);
          }
        }
        
      } else {
        console.log('   ❌ API request failed');
        findings.issues.push(`${scenario.name}: API request failed`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error testing scenario: ${error.message}`);
      findings.issues.push(`${scenario.name}: Test failed - ${error.message}`);
    }
    
    console.log('');
  }
  
  // 3. RAG Retrieval Quality Assessment
  console.log('3️⃣ RAG Retrieval Quality Assessment');
  console.log('------------------------------------');
  
  // Test if knowledge base is being queried effectively
  try {
    const testQuery = {
      grade: '12',
      query: 'I want to study engineering at UCT with mathematics 80% and physics 75%',
      profile: {
        marks: { mathematics: 80, physical_sciences: 75 },
        interests: ['engineering']
      }
    };
    
    console.log('Testing knowledge base retrieval with specific query...');
    
    const response = await testRAGEndpoint(testQuery);
    
    if (response.success) {
      const responseText = response.response || response.fullResponse || '';
      
      // Check for specific university information
      const hasUniversityInfo = responseText.includes('UCT') || 
                               responseText.includes('University of Cape Town') ||
                               responseText.includes('university');
      
      if (hasUniversityInfo) {
        console.log('✅ University-specific information retrieved');
        findings.ragRetrieval.push('University information successfully retrieved');
      } else {
        console.log('⚠️ No university-specific information');
        findings.issues.push('University information not retrieved from knowledge base');
      }
      
      // Check for engineering program details
      const hasEngineeringInfo = responseText.includes('engineering') ||
                                responseText.includes('Engineering');
      
      if (hasEngineeringInfo) {
        console.log('✅ Engineering program information found');
        findings.ragRetrieval.push('Program-specific information retrieved');
      } else {
        console.log('⚠️ No engineering program information');
        findings.issues.push('Program-specific information not retrieved');
      }
      
      // Check for APS/admission requirements
      const hasAdmissionInfo = responseText.includes('APS') ||
                              responseText.includes('admission') ||
                              responseText.includes('requirement');
      
      if (hasAdmissionInfo) {
        console.log('✅ Admission requirements information found');
        findings.ragRetrieval.push('Admission requirements retrieved from knowledge base');
      } else {
        console.log('⚠️ No admission requirements information');
        findings.issues.push('Admission requirements not retrieved');
      }
      
    } else {
      console.log('❌ RAG retrieval test failed');
      findings.issues.push('RAG retrieval test failed');
    }
    
  } catch (error) {
    console.log('❌ Error testing RAG retrieval:', error.message);
    findings.issues.push('RAG retrieval test error');
  }
  
  console.log('');
  
  // 4. Recommendation Quality Analysis
  console.log('4️⃣ Recommendation Quality Analysis');
  console.log('-----------------------------------');
  
  // Test recommendation specificity and viability
  try {
    const qualityTestQuery = {
      grade: '12',
      query: 'I have Mathematics 85%, Physical Sciences 80%, English 75%. I want to become a civil engineer.',
      profile: {
        grade: 12,
        marks: {
          mathematics: 85,
          physical_sciences: 80,
          english: 75
        },
        interests: ['engineering', 'civil engineering']
      }
    };
    
    console.log('Testing recommendation quality and specificity...');
    
    const response = await testRAGEndpoint(qualityTestQuery);
    
    if (response.success) {
      const responseText = response.response || response.fullResponse || '';
      
      // Check for specific program recommendations
      const hasSpecificPrograms = responseText.includes('Civil Engineering') ||
                                 responseText.includes('Bachelor') ||
                                 responseText.includes('program');
      
      if (hasSpecificPrograms) {
        console.log('✅ Specific program recommendations provided');
        findings.recommendationQuality.push('Specific program recommendations generated');
      } else {
        console.log('⚠️ Generic recommendations only');
        findings.issues.push('Recommendations lack specificity');
      }
      
      // Check for bursary information
      const hasBursaryInfo = responseText.includes('bursary') ||
                            responseText.includes('NSFAS') ||
                            responseText.includes('financial aid');
      
      if (hasBursaryInfo) {
        console.log('✅ Financial aid information included');
        findings.recommendationQuality.push('Financial aid recommendations provided');
      } else {
        console.log('⚠️ No financial aid information');
        findings.issues.push('Missing financial aid recommendations');
      }
      
      // Check for actionable next steps
      const hasActionableSteps = responseText.includes('apply') ||
                                responseText.includes('deadline') ||
                                responseText.includes('next steps');
      
      if (hasActionableSteps) {
        console.log('✅ Actionable next steps provided');
        findings.recommendationQuality.push('Actionable guidance provided');
      } else {
        console.log('⚠️ No actionable next steps');
        findings.issues.push('Recommendations lack actionable guidance');
      }
      
      // Check for verification warning (critical safety feature)
      const hasVerificationWarning = responseText.includes('verify') ||
                                    responseText.includes('Verify') ||
                                    responseText.includes('⚠️');
      
      if (hasVerificationWarning) {
        console.log('✅ Verification warning present');
        findings.recommendationQuality.push('Safety verification warning included');
      } else {
        console.log('❌ CRITICAL: No verification warning');
        findings.issues.push('CRITICAL: Missing verification warning');
      }
      
    } else {
      console.log('❌ Quality test failed');
      findings.issues.push('Recommendation quality test failed');
    }
    
  } catch (error) {
    console.log('❌ Error testing recommendation quality:', error.message);
    findings.issues.push('Recommendation quality test error');
  }
  
  console.log('');
  
  return findings;
}

// Helper function to test RAG endpoint
async function testRAGEndpoint(testData) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: testData.query,
      grade: testData.grade,
      profile: testData.profile || testData
    });
    
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
    
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run Phase 2 investigation
analyzeLLMContextUtilization().then(findings => {
  console.log('\n📋 PHASE 2 SUMMARY REPORT');
  console.log('=========================');
  
  console.log('\n🔧 Prompt Engineering:');
  findings.promptEngineering.forEach(item => console.log(`   ✅ ${item}`));
  
  console.log('\n🧠 Context Awareness:');
  findings.contextAwareness.forEach(item => console.log(`   ✅ ${item}`));
  
  console.log('\n🔍 RAG Retrieval:');
  findings.ragRetrieval.forEach(item => console.log(`   ✅ ${item}`));
  
  console.log('\n🎯 Recommendation Quality:');
  findings.recommendationQuality.forEach(item => console.log(`   ✅ ${item}`));
  
  if (findings.issues.length > 0) {
    console.log('\n⚠️ Issues Identified:');
    findings.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Calculate overall score
  const totalChecks = findings.promptEngineering.length + 
                     findings.contextAwareness.length + 
                     findings.ragRetrieval.length + 
                     findings.recommendationQuality.length;
  
  const totalIssues = findings.issues.length;
  const effectivenessScore = Math.max(0, ((totalChecks - totalIssues) / Math.max(totalChecks, 1)) * 100);
  
  console.log(`\n📊 LLM Context Utilization Score: ${effectivenessScore.toFixed(1)}%`);
  
  console.log('\n🎯 KEY FINDINGS:');
  
  if (findings.promptEngineering.length >= 3) {
    console.log('✅ ADVANCED PROMPT ENGINEERING: System uses sophisticated prompt construction');
  } else {
    console.log('⚠️ BASIC PROMPT ENGINEERING: Limited prompt sophistication');
  }
  
  if (findings.contextAwareness.length >= 6) {
    console.log('✅ HIGH CONTEXT AWARENESS: System effectively uses student profile data');
  } else {
    console.log('⚠️ LIMITED CONTEXT AWARENESS: Student data not fully utilized');
  }
  
  if (findings.ragRetrieval.length >= 2) {
    console.log('✅ EFFECTIVE RAG RETRIEVAL: Knowledge base properly queried and utilized');
  } else {
    console.log('❌ POOR RAG RETRIEVAL: Knowledge base not effectively utilized');
  }
  
  if (findings.recommendationQuality.length >= 3) {
    console.log('✅ HIGH-QUALITY RECOMMENDATIONS: Specific, actionable, and safe guidance');
  } else {
    console.log('⚠️ LOW-QUALITY RECOMMENDATIONS: Generic or incomplete guidance');
  }
  
  // Check for critical issues
  const hasCriticalIssues = findings.issues.some(issue => issue.includes('CRITICAL'));
  if (hasCriticalIssues) {
    console.log('🚨 CRITICAL SAFETY ISSUES DETECTED: Immediate attention required');
  }
  
  console.log('\n🚀 NEXT PHASE: CAG Integration Investigation');
  console.log('Ready to proceed to Phase 3? (Y/n)');
  
  // Save findings for next phase
  fs.writeFileSync('phase2-findings.json', JSON.stringify(findings, null, 2));
  console.log('📁 Findings saved to phase2-findings.json');
  
}).catch(error => {
  console.error('❌ Phase 2 investigation failed:', error.message);
  process.exit(1);
});