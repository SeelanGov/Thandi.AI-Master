#!/usr/bin/env node

/**
 * Debug why teaching is recommended first in RAG system
 * Analyze the career matching and ranking logic
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function debugTeachingRecommendation() {
  console.log('🔍 DEBUGGING: Why Teaching is Recommended First');
  console.log('='.repeat(60));
  
  // Test with a typical Grade 12 mathematics student profile
  const testProfile = {
    grade: 12,
    subjects: ['Mathematics', 'Physical Sciences', 'English Home Language'],
    mathMark: 85,
    mathType: 'Mathematics',
    province: 'Gauteng',
    budgetLimit: 'medium',
    interests: ['problem-solving', 'technology'],
    concerns: ['career stability', 'good salary']
  };
  
  console.log('📋 Test Profile:');
  console.log(`   Grade: ${testProfile.grade}`);
  console.log(`   Subjects: ${testProfile.subjects.join(', ')}`);
  console.log(`   Math Mark: ${testProfile.mathMark}% (${testProfile.mathType})`);
  console.log(`   Province: ${testProfile.province}`);
  console.log(`   Budget: ${testProfile.budgetLimit}`);
  console.log(`   Interests: ${testProfile.interests.join(', ')}`);
  console.log(`   Concerns: ${testProfile.concerns.join(', ')}`);
  
  console.log('\n🎯 Testing RAG Endpoints...\n');
  
  // Test 1: Simple RAG endpoint
  console.log('1. 🔍 Simple RAG Endpoint Analysis');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/rag/simple-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'What careers are available for mathematics students?',
        curriculum: 'caps'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Response received');
      console.log(`   📊 Sources: ${data.sources?.length || 0}`);
      console.log(`   📄 Answer length: ${data.answer?.length || 0} chars`);
      
      // Analyze the response for teaching mentions
      const answer = data.answer || '';
      const teachingMentions = (answer.match(/teach|education|instructor|professor/gi) || []).length;
      const engineeringMentions = (answer.match(/engineer|software|technology|programming/gi) || []).length;
      const financeMentions = (answer.match(/finance|banking|accounting|analyst/gi) || []).length;
      
      console.log(`   🎯 Career mentions in response:`);
      console.log(`      Teaching/Education: ${teachingMentions} mentions`);
      console.log(`      Engineering/Tech: ${engineeringMentions} mentions`);
      console.log(`      Finance/Business: ${financeMentions} mentions`);
      
      console.log(`   📝 First 200 chars: ${answer.substring(0, 200)}...`);
      
      // Analyze sources
      if (data.sources && data.sources.length > 0) {
        console.log(`   📚 Source analysis:`);
        data.sources.forEach((source, i) => {
          console.log(`      ${i + 1}. ${source.subject || 'Unknown'} (${source.curriculum || 'Unknown'}) - Similarity: ${source.similarity?.toFixed(3) || 'N/A'}`);
        });
      }
    } else {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Full RAG endpoint with profile
  console.log('\n2. 🔍 Full RAG Endpoint Analysis');
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'What careers should I consider based on my profile?',
        curriculumProfile: testProfile,
        consent: true
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Response received');
      console.log(`   📊 Source: ${data.source}`);
      console.log(`   📄 Response length: ${data.response?.length || 0} chars`);
      
      // Parse the career recommendations
      const response_text = data.response || '';
      
      // Look for numbered career recommendations
      const careerMatches = response_text.match(/\d+\.\s*([^(]+)\s*\([^)]*match\)/g) || [];
      console.log(`   🎯 Career recommendations found: ${careerMatches.length}`);
      
      careerMatches.forEach((match, i) => {
        const careerName = match.replace(/\d+\.\s*/, '').replace(/\s*\([^)]*\)/, '').trim();
        const matchQuality = match.match(/\(([^)]*match)\)/)?.[1] || 'unknown';
        console.log(`      ${i + 1}. ${careerName} - ${matchQuality}`);
      });
      
      // Analyze why teaching might be first
      if (careerMatches.length > 0) {
        const firstCareer = careerMatches[0];
        console.log(`   🔍 First recommendation analysis:`);
        console.log(`      Career: ${firstCareer}`);
        
        // Look for the reasoning in the text
        const teachingSection = response_text.match(/1\.\s*[^2]*/s)?.[0] || '';
        console.log(`      Reasoning: ${teachingSection.substring(0, 300)}...`);
      }
      
      // Check CAG decision
      if (data.cag) {
        console.log(`   🤖 CAG Quality Layer:`);
        console.log(`      Decision: ${data.cag.decision}`);
        console.log(`      Confidence: ${data.cag.confidence}`);
        console.log(`      Issues detected: ${data.cag.issuesDetected}`);
        console.log(`      Revisions applied: ${data.cag.revisionsApplied}`);
      }
      
    } else {
      console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 ANALYSIS COMPLETE');
  console.log('\n📋 POSSIBLE REASONS FOR TEACHING BEING FIRST:');
  console.log('1. 📚 Knowledge Base Content: Teaching careers may have more detailed content');
  console.log('2. 🎯 Subject Matching: Mathematics strongly associated with teaching in data');
  console.log('3. 🔍 Vector Similarity: Teaching content may have higher embedding similarity');
  console.log('4. 📊 Career Ranking Logic: Teaching may score higher in matching algorithm');
  console.log('5. 🏫 South African Context: Teaching may be emphasized in SA career guidance');
  console.log('6. 💼 Stability Factor: Teaching seen as stable career option');
  
  console.log('\n🔧 RECOMMENDATIONS TO INVESTIGATE:');
  console.log('1. Check knowledge base content for career diversity');
  console.log('2. Review career matching algorithm weights');
  console.log('3. Analyze vector embeddings for different career types');
  console.log('4. Examine re-ranking logic in search.js');
  console.log('5. Review report generation logic');
}

debugTeachingRecommendation();