/**
 * PHASE 3: CAG INTEGRATION ANALYZER
 * 
 * Investigates where and how CAG (Career Assessment Generator) is integrated
 * Compares CAG vs base LLM responses and identifies integration gaps
 */

const fs = require('fs');
const http = require('http');

async function analyzeCagIntegration() {
  console.log('🔍 PHASE 3: CAG INTEGRATION INVESTIGATION');
  console.log('=========================================\n');
  
  const findings = {
    cagActivationPoints: [],
    cagVsBaseLLM: [],
    integrationGaps: [],
    cagEffectiveness: [],
    issues: []
  };
  
  // 1. CAG Activation Points Mapping
  console.log('1️⃣ CAG Activation Points Mapping');
  console.log('---------------------------------');
  
  try {
    // Check RAG query endpoint for CAG usage
    const ragContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
    
    // Look for CAG-specific functions and imports
    const cagPatterns = [
      { pattern: 'generateSpecificRecommendations', description: 'CAG recommendation engine' },
      { pattern: 'formatRecommendationsForLLM', description: 'CAG output formatting' },
      { pattern: 'program-matcher', description: 'CAG program matching system' },
      { pattern: 'Career Assessment Generator', description: 'CAG reference' },
      { pattern: 'CAG', description: 'CAG acronym usage' }
    ];
    
    cagPatterns.forEach(({ pattern, description }) => {
      if (ragContent.includes(pattern)) {
        console.log(`✅ ${description} found`);
        findings.cagActivationPoints.push(`RAG endpoint: ${description}`);
      } else {
        console.log(`⚠️ ${description} not found`);
        findings.integrationGaps.push(`Missing: ${description}`);
      }
    });
    
    // Check for conditional CAG activation
    if (ragContent.includes('if (studentProfile') && ragContent.includes('generateSpecificRecommendations')) {
      console.log('✅ Conditional CAG activation based on student profile');
      findings.cagActivationPoints.push('CAG activated when student profile available');
    } else {
      console.log('⚠️ No conditional CAG activation found');
      findings.integrationGaps.push('CAG activation not conditional on student data');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing RAG endpoint:', error.message);
    findings.issues.push('Cannot analyze RAG endpoint for CAG integration');
  }
  
  console.log('');
  
  // 2. Check for CAG in other endpoints
  console.log('2️⃣ CAG Integration in Other Endpoints');
  console.log('-------------------------------------');
  
  // Check G10-12 endpoint
  try {
    const g1012Content = fs.readFileSync('app/api/g10-12/route.js', 'utf8');
    
    if (g1012Content.includes('requirements-engine')) {
      console.log('✅ Requirements engine found in G10-12 endpoint');
      findings.cagActivationPoints.push('G10-12 endpoint: Requirements engine integration');
    } else {
      console.log('⚠️ No requirements engine in G10-12 endpoint');
      findings.integrationGaps.push('G10-12 endpoint lacks requirements engine');
    }
    
    // Check if G10-12 uses CAG or just basic processing
    if (g1012Content.includes('career_interests') && g1012Content.includes('subjects')) {
      console.log('✅ Career and subject processing in G10-12');
      findings.cagActivationPoints.push('G10-12 endpoint: Career and subject processing');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing G10-12 endpoint:', error.message);
    findings.issues.push('Cannot analyze G10-12 endpoint');
  }
  
  // Check chat functionality (ThandiChat component)
  try {
    const chatFiles = [
      'app/results/components/ThandiChat.jsx',
      'components/ThandiChat.jsx'
    ];
    
    let chatContent = null;
    for (const file of chatFiles) {
      try {
        chatContent = fs.readFileSync(file, 'utf8');
        console.log(`✅ Found ThandiChat component: ${file}`);
        break;
      } catch (e) {
        // Try next file
      }
    }
    
    if (chatContent) {
      if (chatContent.includes('/api/rag/query')) {
        console.log('✅ ThandiChat uses RAG endpoint (includes CAG)');
        findings.cagActivationPoints.push('ThandiChat: Uses RAG endpoint with CAG');
      } else {
        console.log('⚠️ ThandiChat may not use CAG-enabled endpoint');
        findings.integrationGaps.push('ThandiChat may bypass CAG system');
      }
    } else {
      console.log('⚠️ ThandiChat component not found');
      findings.issues.push('Cannot locate ThandiChat component');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing ThandiChat:', error.message);
    findings.issues.push('Cannot analyze ThandiChat component');
  }
  
  console.log('');
  
  // 3. CAG vs Base LLM Comparison Testing
  console.log('3️⃣ CAG vs Base LLM Effectiveness Testing');
  console.log('------------------------------------------');
  
  // Test with and without student profile to compare CAG vs base LLM
  const testScenarios = [
    {
      name: 'With Student Profile (CAG should activate)',
      query: 'I need career advice for engineering',
      grade: '12',
      profile: {
        marks: {
          mathematics: 85,
          physical_sciences: 80,
          english: 75
        },
        interests: ['engineering'],
        grade: 12
      }
    },
    {
      name: 'Without Student Profile (Base LLM only)',
      query: 'I need career advice for engineering',
      grade: '12',
      profile: null
    }
  ];
  
  console.log('Testing CAG activation vs base LLM responses...\n');
  
  for (const scenario of testScenarios) {
    console.log(`📝 Testing: ${scenario.name}`);
    
    try {
      const response = await testRAGEndpoint({
        query: scenario.query,
        grade: scenario.grade,
        profile: scenario.profile
      });
      
      if (response.success) {
        const responseText = response.response || response.fullResponse || '';
        
        // Check for CAG-specific indicators
        const cagIndicators = [
          'APS Score',
          'Admission Chance',
          'specific program',
          'Bachelor of',
          'University of',
          'application deadline',
          'bursary',
          'NSFAS'
        ];
        
        const cagIndicatorCount = cagIndicators.filter(indicator => 
          responseText.toLowerCase().includes(indicator.toLowerCase())
        ).length;
        
        console.log(`   📊 CAG indicators found: ${cagIndicatorCount}/${cagIndicators.length}`);
        
        if (scenario.profile && cagIndicatorCount >= 4) {
          console.log('   ✅ Strong CAG activation detected');
          findings.cagEffectiveness.push(`${scenario.name}: Strong CAG response (${cagIndicatorCount} indicators)`);
        } else if (scenario.profile && cagIndicatorCount >= 2) {
          console.log('   ⚠️ Moderate CAG activation');
          findings.cagEffectiveness.push(`${scenario.name}: Moderate CAG response (${cagIndicatorCount} indicators)`);
        } else if (scenario.profile) {
          console.log('   ❌ Weak CAG activation');
          findings.issues.push(`${scenario.name}: CAG not properly activated`);
        } else {
          console.log('   ✅ Base LLM response (expected)');
          findings.cagVsBaseLLM.push(`Base LLM: ${cagIndicatorCount} specific indicators (expected to be lower)`);
        }
        
        // Check response length and detail level
        const responseLength = responseText.length;
        console.log(`   📏 Response length: ${responseLength} characters`);
        
        if (scenario.profile && responseLength > 2000) {
          console.log('   ✅ Detailed CAG response');
          findings.cagEffectiveness.push(`${scenario.name}: Comprehensive response (${responseLength} chars)`);
        } else if (!scenario.profile && responseLength < 2000) {
          console.log('   ✅ Concise base LLM response');
          findings.cagVsBaseLLM.push(`Base LLM: Appropriate length (${responseLength} chars)`);
        }
        
      } else {
        console.log('   ❌ API request failed');
        findings.issues.push(`${scenario.name}: API test failed`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      findings.issues.push(`${scenario.name}: Test error - ${error.message}`);
    }
    
    console.log('');
  }
  
  // 4. Integration Gap Analysis
  console.log('4️⃣ Integration Gap Analysis');
  console.log('----------------------------');
  
  // Check if main assessment flow uses CAG
  try {
    const assessmentFormContent = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
    
    // Look for API calls in assessment submission
    if (assessmentFormContent.includes('/api/rag/query')) {
      console.log('✅ Assessment form uses RAG endpoint (CAG-enabled)');
      findings.cagActivationPoints.push('Assessment form: Uses CAG-enabled RAG endpoint');
    } else if (assessmentFormContent.includes('/api/g10-12')) {
      console.log('✅ Assessment form uses G10-12 endpoint');
      findings.cagActivationPoints.push('Assessment form: Uses G10-12 endpoint');
    } else {
      console.log('⚠️ Assessment form API usage unclear');
      findings.integrationGaps.push('Assessment form API integration unclear');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing assessment form:', error.message);
    findings.issues.push('Cannot analyze assessment form API usage');
  }
  
  // Check for CAG in results generation
  try {
    const resultsPageContent = fs.readFileSync('app/results/page.jsx', 'utf8');
    
    if (resultsPageContent.includes('ThandiChat')) {
      console.log('✅ Results page includes ThandiChat (CAG access)');
      findings.cagActivationPoints.push('Results page: ThandiChat provides CAG access');
    } else {
      console.log('⚠️ Results page may not have CAG access');
      findings.integrationGaps.push('Results page lacks direct CAG access');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing results page:', error.message);
    findings.issues.push('Cannot analyze results page');
  }
  
  console.log('');
  
  return findings;
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
    
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run Phase 3 investigation
analyzeCagIntegration().then(findings => {
  console.log('\n📋 PHASE 3 SUMMARY REPORT');
  console.log('=========================');
  
  console.log('\n🎯 CAG Activation Points:');
  findings.cagActivationPoints.forEach(point => console.log(`   ✅ ${point}`));
  
  console.log('\n⚖️ CAG vs Base LLM Comparison:');
  findings.cagVsBaseLLM.forEach(comparison => console.log(`   📊 ${comparison}`));
  
  console.log('\n🚀 CAG Effectiveness:');
  findings.cagEffectiveness.forEach(effectiveness => console.log(`   ✅ ${effectiveness}`));
  
  if (findings.integrationGaps.length > 0) {
    console.log('\n⚠️ Integration Gaps:');
    findings.integrationGaps.forEach(gap => console.log(`   - ${gap}`));
  }
  
  if (findings.issues.length > 0) {
    console.log('\n❌ Issues Identified:');
    findings.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Calculate CAG integration score
  const totalActivationPoints = findings.cagActivationPoints.length;
  const totalGaps = findings.integrationGaps.length;
  const totalIssues = findings.issues.length;
  
  const cagScore = Math.max(0, ((totalActivationPoints - totalGaps - totalIssues) / Math.max(totalActivationPoints, 1)) * 100);
  
  console.log(`\n📊 CAG Integration Score: ${cagScore.toFixed(1)}%`);
  
  console.log('\n🎯 KEY FINDINGS:');
  
  if (totalActivationPoints >= 5) {
    console.log('✅ COMPREHENSIVE CAG INTEGRATION: CAG is well-integrated across multiple touchpoints');
  } else {
    console.log('⚠️ LIMITED CAG INTEGRATION: CAG integration is incomplete');
  }
  
  if (findings.cagEffectiveness.length >= 2) {
    console.log('✅ EFFECTIVE CAG RESPONSES: CAG provides enhanced career guidance when activated');
  } else {
    console.log('❌ INEFFECTIVE CAG: CAG not providing enhanced responses');
  }
  
  if (totalGaps === 0) {
    console.log('✅ NO INTEGRATION GAPS: CAG is properly integrated throughout the system');
  } else {
    console.log(`⚠️ ${totalGaps} INTEGRATION GAPS: Some areas lack CAG integration`);
  }
  
  // Specific recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (findings.integrationGaps.some(gap => gap.includes('Assessment form'))) {
    console.log('🔧 Ensure main assessment flow uses CAG-enabled endpoints');
  }
  
  if (findings.integrationGaps.some(gap => gap.includes('ThandiChat'))) {
    console.log('🔧 Verify ThandiChat uses RAG endpoint with CAG integration');
  }
  
  if (findings.cagEffectiveness.length < 2) {
    console.log('🔧 Improve CAG activation conditions and response quality');
  }
  
  console.log('\n🚀 NEXT PHASE: End-to-End Testing');
  console.log('Ready to proceed to Phase 4? (Y/n)');
  
  // Save findings for next phase
  fs.writeFileSync('phase3-findings.json', JSON.stringify(findings, null, 2));
  console.log('📁 Findings saved to phase3-findings.json');
  
}).catch(error => {
  console.error('❌ Phase 3 investigation failed:', error.message);
  process.exit(1);
});