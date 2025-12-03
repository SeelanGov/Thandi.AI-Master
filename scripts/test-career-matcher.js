// Test script for career matcher
import dotenv from 'dotenv';
import { matchCareersToProfile, getFallbackCareers } from '../lib/rag/career-matcher.js';

dotenv.config({ path: '.env.local' });

async function testCareerMatcher() {
  console.log('🧪 Testing Career Matcher\n');
  console.log('='.repeat(60));
  
  // Test Case 1: Math + Physical Sciences (Engineering profile)
  console.log('\n📋 Test 1: Engineering Profile');
  console.log('-'.repeat(60));
  const engineeringProfile = {
    grade: 10,
    subjects: ['Mathematics', 'Physical Sciences', 'English'],
    interests: ['technology', 'problem-solving', 'building things'],
    mathMark: 75,
    mathType: 'Mathematics'
  };
  
  try {
    const matches1 = await matchCareersToProfile(engineeringProfile, { limit: 3 });
    console.log(`\n✅ Found ${matches1.length} matches:`);
    matches1.forEach((career, i) => {
      console.log(`\n${i + 1}. ${career.title}`);
      console.log(`   Category: ${career.category || 'N/A'}`);
      console.log(`   Similarity: ${(career.similarity * 100).toFixed(1)}%`);
      console.log(`   Education: ${career.education || 'N/A'}`);
      if (career.salaryRange?.entry) {
        console.log(`   Salary: R${career.salaryRange.entry.min?.toLocaleString()} - R${career.salaryRange.entry.max?.toLocaleString()}`);
      }
    });
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }
  
  // Test Case 2: Life Sciences + Biology (Healthcare profile)
  console.log('\n\n📋 Test 2: Healthcare Profile');
  console.log('-'.repeat(60));
  const healthcareProfile = {
    grade: 11,
    subjects: ['Life Sciences', 'Mathematics', 'English'],
    interests: ['helping people', 'medicine', 'health'],
    mathMark: 65,
    mathType: 'Mathematics'
  };
  
  try {
    const matches2 = await matchCareersToProfile(healthcareProfile, { limit: 3 });
    console.log(`\n✅ Found ${matches2.length} matches:`);
    matches2.forEach((career, i) => {
      console.log(`\n${i + 1}. ${career.title}`);
      console.log(`   Category: ${career.category || 'N/A'}`);
      console.log(`   Similarity: ${(career.similarity * 100).toFixed(1)}%`);
      console.log(`   Education: ${career.education || 'N/A'}`);
    });
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // Test Case 3: Arts + Languages (Creative profile)
  console.log('\n\n📋 Test 3: Creative Arts Profile');
  console.log('-'.repeat(60));
  const creativeProfile = {
    grade: 10,
    subjects: ['English', 'Visual Arts', 'History'],
    interests: ['design', 'creativity', 'communication'],
    mathMark: 55,
    mathType: 'Mathematical Literacy'
  };
  
  try {
    const matches3 = await matchCareersToProfile(creativeProfile, { limit: 3 });
    console.log(`\n✅ Found ${matches3.length} matches:`);
    matches3.forEach((career, i) => {
      console.log(`\n${i + 1}. ${career.title}`);
      console.log(`   Category: ${career.category || 'N/A'}`);
      console.log(`   Similarity: ${(career.similarity * 100).toFixed(1)}%`);
    });
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  // Test Case 4: Fallback
  console.log('\n\n📋 Test 4: Fallback Careers');
  console.log('-'.repeat(60));
  try {
    const fallback = await getFallbackCareers({});
    console.log(`\n✅ Found ${fallback.length} fallback careers:`);
    fallback.forEach((career, i) => {
      console.log(`   ${i + 1}. ${career.title} (${career.demand})`);
    });
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Career Matcher Testing Complete!\n');
}

testCareerMatcher().catch(console.error);
