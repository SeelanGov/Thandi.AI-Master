// scripts/test-rule4-nsfas.js
// Test Rule #4: NSFAS Prioritization for Low-Income Students

// Simple test using fetch to the API endpoint
async function queryRAG(query, options = {}) {
  const response = await fetch('http://localhost:3000/api/rag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, options })
  });
  return await response.json();
}

async function testRule4() {
  console.log('🧪 Testing Rule #4: NSFAS Prioritization\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Test Case 1: Low-income + Engineering
  console.log('Test 1: Low-income student interested in Engineering');
  console.log('─────────────────────────────────────────────────────────\n');
  
  const query1 = `I need career guidance. The subjects I ENJOY are: Mathematics, Physical Science. 
My interests include: problem-solving, technology. 
My constraints: time available is full-time, budget is low (can't afford university), location preference is Gauteng. 
My motivation: I want to build things and solve problems. 
My concerns: Can my family afford university? We don't have money for fees.`;

  try {
    const result1 = await queryRAG(query1, { includeDebug: false });
    
    if (result1.success) {
      console.log('✅ Response generated successfully\n');
      console.log('Response (first 800 chars):');
      console.log(result1.response.substring(0, 800));
      console.log('\n...\n');
      
      // Check for Rule #4 compliance
      console.log('🔍 Rule #4 Compliance Checks:');
      console.log('─────────────────────────────────────────────────────────');
      
      const checks = {
        hasBursaryMention: /sasol|eskom|nsfas|bursary/i.test(result1.response),
        hasSpecificAmounts: /R\d+[,\d]*\/year|R\d+[,\d]*\s*per\s*year/i.test(result1.response),
        hasDeadlines: /deadline|apply by|closes|due/i.test(result1.response),
        hasNSFAS: /nsfas/i.test(result1.response),
        hasTotalValue: /total|R\d+[,\d]*\+|over \d+ years/i.test(result1.response),
        hasAffordableLanguage: /affordable|without.*stress|can study|funding available/i.test(result1.response)
      };
      
      console.log(`✓ Mentions bursaries: ${checks.hasBursaryMention ? '✅' : '❌'}`);
      console.log(`✓ Shows specific amounts (R120,000/year): ${checks.hasSpecificAmounts ? '✅' : '❌'}`);
      console.log(`✓ Includes deadlines: ${checks.hasDeadlines ? '✅' : '❌'}`);
      console.log(`✓ Mentions NSFAS: ${checks.hasNSFAS ? '✅' : '❌'}`);
      console.log(`✓ Shows total value: ${checks.hasTotalValue ? '✅' : '❌'}`);
      console.log(`✓ Uses empowering language: ${checks.hasAffordableLanguage ? '✅' : '❌'}`);
      
      const passedChecks = Object.values(checks).filter(v => v).length;
      const totalChecks = Object.keys(checks).length;
      
      console.log(`\n📊 Score: ${passedChecks}/${totalChecks} checks passed`);
      
      if (passedChecks >= 5) {
        console.log('✅ Rule #4 is working correctly!\n');
      } else {
        console.log('⚠️ Rule #4 needs improvement\n');
      }
    } else {
      console.log('❌ Error:', result1.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  // Test Case 2: Low-income + Healthcare
  console.log('Test 2: Low-income student interested in Healthcare');
  console.log('─────────────────────────────────────────────────────────\n');
  
  const query2 = `I need career guidance. The subjects I ENJOY are: Life Sciences, Mathematics. 
My interests include: helping people, science. 
My constraints: time available is full-time, budget is low, location preference is Western Cape. 
My motivation: I want to help sick people and make a difference. 
My concerns: University is too expensive for my family.`;

  try {
    const result2 = await queryRAG(query2, { includeDebug: false });
    
    if (result2.success) {
      console.log('✅ Response generated successfully\n');
      console.log('Response (first 800 chars):');
      console.log(result2.response.substring(0, 800));
      console.log('\n...\n');
      
      // Check for healthcare-specific bursaries
      console.log('🔍 Healthcare Bursary Checks:');
      console.log('─────────────────────────────────────────────────────────');
      
      const healthcareChecks = {
        hasNursingBursaries: /nursing.*bursary|bursary.*nursing/i.test(result2.response),
        hasTVETOption: /tvet|college|technical/i.test(result2.response),
        hasNSFAS: /nsfas/i.test(result2.response),
        hasAffordableMessage: /affordable|can afford|funding/i.test(result2.response)
      };
      
      console.log(`✓ Mentions nursing bursaries: ${healthcareChecks.hasNursingBursaries ? '✅' : '❌'}`);
      console.log(`✓ Mentions TVET colleges: ${healthcareChecks.hasTVETOption ? '✅' : '❌'}`);
      console.log(`✓ Mentions NSFAS: ${healthcareChecks.hasNSFAS ? '✅' : '❌'}`);
      console.log(`✓ Emphasizes affordability: ${healthcareChecks.hasAffordableMessage ? '✅' : '❌'}`);
      
      const passedHealthcareChecks = Object.values(healthcareChecks).filter(v => v).length;
      const totalHealthcareChecks = Object.keys(healthcareChecks).length;
      
      console.log(`\n📊 Score: ${passedHealthcareChecks}/${totalHealthcareChecks} checks passed`);
      
      if (passedHealthcareChecks >= 3) {
        console.log('✅ Rule #4 works for healthcare careers!\n');
      } else {
        console.log('⚠️ Rule #4 needs improvement for healthcare\n');
      }
    } else {
      console.log('❌ Error:', result2.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🎯 Rule #4 Test Complete');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run the test
testRule4().catch(console.error);
