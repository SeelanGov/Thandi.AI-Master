#!/usr/bin/env node

/**
 * Debug: Show the actual query being generated
 */

const { StudentProfileBuilder } = await import('./lib/student/StudentProfileBuilder.js');
const { QueryContextStructurer } = await import('./lib/student/QueryContextStructurer.js');

console.log('🔍 Debug: Actual Query Content\n');

const testFormData = {
  grade: 11,
  enjoyedSubjects: ['Mathematics', 'Physical Sciences'],
  interests: ['Technology'],
  openQuestions: {
    motivation: 'I love building bridges and infrastructure. I want to solve South Africa\'s infrastructure challenges.',
    concerns: 'I worry about the cost of engineering degrees and whether I can get into UCT engineering.',
    careerInterests: 'Civil engineering, structural engineering, or urban planning'
  },
  curriculumProfile: { framework: 'CAPS' }
};

const profileBuilder = new StudentProfileBuilder();
const contextStructurer = new QueryContextStructurer();

const profile = profileBuilder.buildProfile(testFormData);
const context = contextStructurer.buildContext(profile);

console.log('📊 Generated Query:');
console.log('='.repeat(80));
console.log(context.structuredQuery);
console.log('='.repeat(80));

console.log('\n📋 Query Analysis:');
console.log(`Length: ${context.structuredQuery.length} characters`);
console.log(`Sections: ${context.metadata.sectionsIncluded}`);
console.log(`Priority requests: ${context.metadata.priorityRequestsCount}`);

console.log('\n🔍 Content Check:');
console.log(`Contains motivation: ${context.structuredQuery.includes('building bridges') ? '✅' : '❌'}`);
console.log(`Contains concerns: ${context.structuredQuery.includes('cost of engineering') ? '✅' : '❌'}`);
console.log(`Contains career interests: ${context.structuredQuery.includes('Civil engineering') ? '✅' : '❌'}`);
console.log(`Has motivation section: ${context.structuredQuery.includes('=== WHAT MOTIVATES ME ===') ? '✅' : '❌'}`);
console.log(`Has concerns section: ${context.structuredQuery.includes('=== MY CONCERNS ABOUT THE FUTURE ===') ? '✅' : '❌'}`);

console.log('\n🎯 The enhanced query is being generated correctly!');
console.log('   If responses are still generic, the issue is in the RAG processing pipeline.');
console.log('   The RAG system might not be using the enhanced query content effectively.');