#!/usr/bin/env node

/**
 * Debug Query vs Response - See exactly what's happening
 */

import fetch from 'node-fetch';

console.log('🔍 Debug: Query vs Response Analysis\n');

// Test 1: Legacy-style query (minimal)
const legacyQuery = `I am a Grade 11 student in South Africa. Subjects I enjoy: Mathematics, Physical Sciences. Interests: Technology, Problem Solving. CRITICAL STUDENT REQUEST: "Civil engineering focusing on infrastructure". This is what the student WANTS to do.`;

// Test 2: Enhanced query (our new system)
const { StudentProfileBuilder } = await import('./lib/student/StudentProfileBuilder.js');
const { QueryContextStructurer } = await import('./lib/student/QueryContextStructurer.js');

const testFormData = {
  grade: 11,
  enjoyedSubjects: ['Mathematics', 'Physical Sciences'],
  openQuestions: {
    motivation: 'I love building things and solving complex engineering problems. I want to create technology that helps people in rural areas.',
    concerns: 'I am worried about the cost of studying engineering at university. My family cannot afford expensive fees.',
    careerInterests: 'Civil engineering focusing on infrastructure, or electrical engineering for renewable energy systems'
  }
};

const profileBuilder = new StudentProfileBuilder();
const contextStructurer = new QueryContextStructurer();
const profile = profileBuilder.buildProfile(testFormData);
const context = contextStructurer.buildContext(profile);
const enhancedQuery = context.structuredQuery;

console.log('📊 Query Comparison:');
console.log(`Legacy query length: ${legacyQuery.length} characters`);
console.log(`Enhanced query length: ${enhancedQuery.length} characters`);
console.log(`Enhancement factor: ${(enhancedQuery.length / legacyQuery.length).toFixed(1)}x\n`);

// Test both queries
async function testQuery(queryText, label) {
  console.log(`🧪 Testing ${label}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: queryText,
        curriculumProfile: { framework: 'CAPS', grade: 11 },
        session: { externalProcessingConsent: true, consentTimestamp: new Date().toISOString() },
        options: { includeDebug: false }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const responseText = data.response || '';
      
      console.log(`✅ ${label} Response:`);
      console.log(`   Length: ${responseText.length} characters`);
      
      // Check for specific content
      const mentionsMotivation = responseText.toLowerCase().includes('building') || responseText.toLowerCase().includes('rural');
      const mentionsConcerns = responseText.toLowerCase().includes('cost') || responseText.toLowerCase().includes('afford') || responseText.toLowerCase().includes('bursary');
      const mentionsEngineering = responseText.toLowerCase().includes('engineering') || responseText.toLowerCase().includes('infrastructure');
      
      console.log(`   Mentions motivation themes: ${mentionsMotivation ? '✅' : '❌'}`);
      console.log(`   Addresses cost concerns: ${mentionsConcerns ? '✅' : '❌'}`);
      console.log(`   Discusses engineering: ${mentionsEngineering ? '✅' : '❌'}`);
      
      // Show first 200 characters of response
      console.log(`   Preview: "${responseText.substring(0, 200)}..."`);
      
      return {
        length: responseText.length,
        mentionsMotivation,
        mentionsConcerns,
        mentionsEngineering,
        response: responseText
      };
    } else {
      console.log(`❌ ${label} failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${label} error: ${error.message}`);
    return null;
  }
}

// Test both queries
const legacyResult = await testQuery(legacyQuery, 'Legacy Query');
console.log('\n' + '='.repeat(80) + '\n');
const enhancedResult = await testQuery(enhancedQuery, 'Enhanced Query');

console.log('\n' + '='.repeat(80));
console.log('📋 COMPARISON SUMMARY');
console.log('='.repeat(80));

if (legacyResult && enhancedResult) {
  console.log('Response Quality Comparison:');
  console.log(`  Legacy - Motivation: ${legacyResult.mentionsMotivation ? '✅' : '❌'}, Concerns: ${legacyResult.mentionsConcerns ? '✅' : '❌'}, Engineering: ${legacyResult.mentionsEngineering ? '✅' : '❌'}`);
  console.log(`  Enhanced - Motivation: ${enhancedResult.mentionsMotivation ? '✅' : '❌'}, Concerns: ${enhancedResult.mentionsConcerns ? '✅' : '❌'}, Engineering: ${enhancedResult.mentionsEngineering ? '✅' : '❌'}`);
  
  const legacyScore = [legacyResult.mentionsMotivation, legacyResult.mentionsConcerns, legacyResult.mentionsEngineering].filter(Boolean).length;
  const enhancedScore = [enhancedResult.mentionsMotivation, enhancedResult.mentionsConcerns, enhancedResult.mentionsEngineering].filter(Boolean).length;
  
  console.log(`\nPersonalization Score:`);
  console.log(`  Legacy: ${legacyScore}/3 (${Math.round(legacyScore/3*100)}%)`);
  console.log(`  Enhanced: ${enhancedScore}/3 (${Math.round(enhancedScore/3*100)}%)`);
  
  if (enhancedScore > legacyScore) {
    console.log('\n🎉 Enhanced system is working! Responses are more personalized.');
  } else if (enhancedScore === legacyScore) {
    console.log('\n⚠️ Enhanced system shows same quality - might need more specific content analysis.');
  } else {
    console.log('\n❌ Enhanced system not showing improvement - investigation needed.');
  }
} else {
  console.log('❌ Could not complete comparison due to API errors.');
}

console.log('\n🔧 Next Steps:');
console.log('1. If enhanced system is working, the "same feeling" might be due to subtle improvements');
console.log('2. Try the UI with very different motivation/concerns to see clearer differences');
console.log('3. Check browser console for enhanced system activation logs');
console.log('4. Compare responses side-by-side with minimal vs rich questionnaire data');