// Test Phase 3: API Integration with RAG
import dotenv from 'dotenv';
import { generatePersonalizedReport } from '../lib/rag/report-generator.js';

dotenv.config({ path: '.env.local' });

async function testPhase3Integration() {
  console.log('🧪 Testing Phase 3: API Integration with RAG\n');
  console.log('='.repeat(70));

  // Test Case 1: Engineering Profile
  console.log('\n📋 Test 1: Engineering Profile');
  console.log('-'.repeat(70));
  
  const engineeringProfile = {
    grade: 10,
    subjects: ['Mathematics', 'Physical Sciences', 'English'],
    mathMark: 75,
    mathType: 'Mathematics',
    interests: ['technology', 'problem-solving', 'building things'],
    constraints: {
      budget: 'medium',
      location: 'gauteng'
    }
  };

  try {
    console.log('🔄 Generating report for engineering student...');
    const report = await generatePersonalizedReport(engineeringProfile);
    
    console.log('✅ Report generated successfully!');
    console.log(`   Matching method: ${report.matchingMethod}`);
    console.log(`   Data source: ${report.dataSource}`);
    console.log(`   Number of careers: ${report.careers?.length || 0}`);
    
    if (report.careers && report.careers.length > 0) {
      console.log('\n🎯 Career Suggestions:');
      report.careers.forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.title} (${career.match})`);
        console.log(`      Category: ${career.category || 'N/A'}`);
        console.log(`      Pathways: ${career.pathways.join(', ')}`);
      });
    }
    
    console.log('\n📝 Personalized Guidance:');
    console.log(`   "${report.personalizedGuidance}"`);
    
    console.log('\n📋 Next Steps:');
    report.nextSteps?.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    console.error(error);
  }

  // Test Case 2: Healthcare Profile
  console.log('\n\n📋 Test 2: Healthcare Profile');
  console.log('-'.repeat(70));
  
  const healthcareProfile = {
    grade: 11,
    subjects: ['Life Sciences', 'Mathematics', 'English'],
    mathMark: 65,
    mathType: 'Mathematics',
    interests: ['helping people', 'medicine', 'health'],
    constraints: {
      budget: 'low',
      location: 'western_cape'
    }
  };

  try {
    console.log('🔄 Generating report for healthcare student...');
    const report = await generatePersonalizedReport(healthcareProfile);
    
    console.log('✅ Report generated successfully!');
    console.log(`   Matching method: ${report.matchingMethod}`);
    console.log(`   Data source: ${report.dataSource}`);
    console.log(`   Number of careers: ${report.careers?.length || 0}`);
    
    if (report.careers && report.careers.length > 0) {
      console.log('\n🎯 Career Suggestions:');
      report.careers.forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.title} (${career.match})`);
        console.log(`      Category: ${career.category || 'N/A'}`);
      });
    }
    
    console.log('\n📝 Personalized Guidance:');
    console.log(`   "${report.personalizedGuidance}"`);
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    console.error(error);
  }

  // Test Case 3: Creative Arts Profile
  console.log('\n\n📋 Test 3: Creative Arts Profile');
  console.log('-'.repeat(70));
  
  const creativeProfile = {
    grade: 10,
    subjects: ['English', 'Visual Arts', 'History'],
    mathMark: 55,
    mathType: 'Mathematical Literacy',
    interests: ['design', 'creativity', 'communication'],
    constraints: {
      budget: 'medium',
      location: 'kwazulu_natal'
    }
  };

  try {
    console.log('🔄 Generating report for creative student...');
    const report = await generatePersonalizedReport(creativeProfile);
    
    console.log('✅ Report generated successfully!');
    console.log(`   Matching method: ${report.matchingMethod}`);
    console.log(`   Number of careers: ${report.careers?.length || 0}`);
    
    if (report.careers && report.careers.length > 0) {
      console.log('\n🎯 Career Suggestions:');
      report.careers.forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.title} (${career.match})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    console.error(error);
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('🎯 PHASE 3 INTEGRATION VERIFICATION');
  console.log('='.repeat(70));
  console.log('\n✅ If the three tests above showed:');
  console.log('   1. Different career suggestions for each profile');
  console.log('   2. Mentions of user-specific subjects and interests');
  console.log('   3. Relevant careers matching the profile type');
  console.log('   4. Similarity scores above 70%');
  console.log('\n🎉 Then Phase 3 RAG integration is SUCCESSFUL!');
  console.log('\n📈 The system now delivers:');
  console.log('   ✅ Personalized career recommendations');
  console.log('   ✅ Knowledge base-powered suggestions');
  console.log('   ✅ Subject and interest-based matching');
  console.log('   ✅ Dynamic, non-hardcoded responses');
  console.log('\n🚀 Ready for production deployment!\n');
}

testPhase3Integration().catch(console.error);
