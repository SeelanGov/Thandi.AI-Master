#!/usr/bin/env node

/**
 * Debug Enhanced System - Check if our classes work in isolation
 */

console.log('🔍 Debugging Enhanced System...\n');

try {
  console.log('1. Testing StudentProfileBuilder import...');
  const { StudentProfileBuilder } = await import('./lib/student/StudentProfileBuilder.js');
  console.log('✅ StudentProfileBuilder imported successfully');
  
  console.log('2. Testing QueryContextStructurer import...');
  const { QueryContextStructurer } = await import('./lib/student/QueryContextStructurer.js');
  console.log('✅ QueryContextStructurer imported successfully');
  
  console.log('3. Testing basic functionality...');
  const profileBuilder = new StudentProfileBuilder();
  const contextStructurer = new QueryContextStructurer();
  
  const testData = {
    grade: 11,
    enjoyedSubjects: ['Mathematics'],
    openQuestions: {
      motivation: 'I love solving problems',
      concerns: 'I worry about costs',
      careerInterests: 'Engineering'
    }
  };
  
  console.log('4. Building profile...');
  const profile = profileBuilder.buildProfile(testData);
  console.log('✅ Profile built:', {
    motivationCaptured: profile.motivations.hasContent,
    concernsCaptured: profile.concerns.hasContent,
    careerInterestsCaptured: profile.careerInterests.hasContent
  });
  
  console.log('5. Building context...');
  const context = contextStructurer.buildContext(profile);
  console.log('✅ Context built:', {
    sectionsIncluded: context.metadata.sectionsIncluded,
    queryLength: context.structuredQuery.length,
    hasMotivation: context.structuredQuery.includes('solving problems'),
    hasConcerns: context.structuredQuery.includes('worry about costs')
  });
  
  console.log('\n🎉 Enhanced system is working correctly!');
  console.log('\n📋 If UI feels the same, the issue might be:');
  console.log('   1. Browser cache - try hard refresh (Ctrl+F5)');
  console.log('   2. Development server needs restart');
  console.log('   3. JavaScript error in browser console');
  console.log('   4. Enhanced system falling back to legacy');
  
} catch (error) {
  console.error('❌ Enhanced system error:', error);
  console.log('\n🔧 This explains why UI feels the same - enhanced system is failing!');
}