import fetch from 'node-fetch';

console.log('🔍 DETAILED RESPONSE ANALYSIS');
console.log('   Mission: Get full response content to identify issues');
console.log('═══════════════════════════════════════════════════════\n');

const LOCAL_URL = 'http://localhost:3000';

// Test the Grade 10 engineering query and get the FULL response
console.log('📋 TESTING GRADE 10 ENGINEERING QUERY - FULL RESPONSE\n');

try {
  const response = await fetch(`${LOCAL_URL}/api/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "I'm a Grade 10 student interested in engineering. What subjects should I choose for Grade 11?",
      grade: "10",
      curriculum: "caps",
      profile: {
        grade: "10",
        curriculum: "caps",
        subjects: ["Mathematics", "Physical Sciences", "Life Sciences", "English Home Language"],
        marks: {
          "Mathematics": "75",
          "Physical Sciences": "72"
        },
        careerInterests: ["engineering"],
        sessionId: `detailed-test-${Date.now()}`
      }
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    
    console.log('✅ RESPONSE RECEIVED');
    console.log('═'.repeat(80));
    console.log('FULL RESPONSE CONTENT:');
    console.log('═'.repeat(80));
    console.log(data.response);
    console.log('═'.repeat(80));
    
    console.log('\n📊 RESPONSE ANALYSIS:');
    console.log(`   Grade in response: ${data.grade}`);
    console.log(`   Curriculum in response: ${data.curriculum}`);
    console.log(`   Response length: ${data.response?.length || 0} characters`);
    console.log(`   Has results array: ${data.results ? 'YES' : 'NO'}`);
    console.log(`   Results count: ${data.results?.length || 0}`);
    
    console.log('\n🔍 CONTENT ANALYSIS:');
    const content = data.response || '';
    
    // Check for specific Grade 10 guidance
    const hasGrade10Specific = content.includes('Grade 10') || content.includes('GRADE 10');
    const hasSubjectSelection = content.includes('Grade 11 subjects') || content.includes('subject selection');
    const hasEngineeringSubjects = content.includes('Mathematics') && content.includes('Physical Sciences');
    const hasUniversityPrep = content.includes('university') || content.includes('University');
    const hasAPSInfo = content.includes('APS') || content.includes('points');
    const hasSpecificUniversities = content.includes('UCT') || content.includes('Wits') || content.includes('UP');
    
    console.log(`   ✅ Grade 10 specific content: ${hasGrade10Specific}`);
    console.log(`   ✅ Subject selection advice: ${hasSubjectSelection}`);
    console.log(`   ✅ Engineering subjects mentioned: ${hasEngineeringSubjects}`);
    console.log(`   ✅ University preparation: ${hasUniversityPrep}`);
    console.log(`   ✅ APS information: ${hasAPSInfo}`);
    console.log(`   ✅ Specific universities: ${hasSpecificUniversities}`);
    
    console.log('\n🎯 ISSUE IDENTIFICATION:');
    
    if (!hasSubjectSelection) {
      console.log('   ❌ ISSUE: Missing specific Grade 11 subject selection advice');
    }
    
    if (!hasEngineeringSubjects) {
      console.log('   ❌ ISSUE: Not mentioning specific engineering subjects (Math, Physical Sciences)');
    }
    
    if (!hasSpecificUniversities) {
      console.log('   ❌ ISSUE: Not mentioning specific universities from our 26-university expansion');
    }
    
    if (content.length < 500) {
      console.log('   ❌ ISSUE: Response seems too short/generic');
    }
    
    // Check if it's using the minimal route
    if (content.includes('Technology & Engineering') && content.includes('Healthcare & Sciences')) {
      console.log('   ⚠️ WARNING: Appears to be using minimal/generic response template');
      console.log('   🔧 DIAGNOSIS: The comprehensive knowledge base may not be integrated');
    }
    
  } else {
    console.log(`❌ FAILED (${response.status}): ${response.statusText}`);
    const errorText = await response.text();
    console.log(`Error details: ${errorText}`);
  }
  
} catch (error) {
  console.log(`❌ ERROR: ${error.message}`);
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('🎯 DIAGNOSIS SUMMARY');
console.log('═══════════════════════════════════════════════════════');

console.log('\nBased on the response analysis, the likely issues are:');
console.log('1. The RAG route may be using the minimal template we created for deployment');
console.log('2. The comprehensive knowledge base integration may not be working');
console.log('3. The 26-university expansion data may not be accessible');
console.log('4. CAPS/IEB curriculum-specific guidance may be generic');

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('1. Restore the full RAG route with knowledge base integration');
console.log('2. Verify the knowledge base chunks are accessible');
console.log('3. Test the university expansion data integration');
console.log('4. Ensure CAPS/IEB specific guidance is working');

console.log('\n📋 NEXT STEPS:');
console.log('1. Check the current RAG route implementation');
console.log('2. Restore comprehensive functionality if needed');
console.log('3. Test knowledge base integration');
console.log('4. Verify university data accessibility');
console.log('═══════════════════════════════════════════════════════');