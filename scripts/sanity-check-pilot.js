// scripts/sanity-check-pilot.js
// Final sanity check with 5 real student queries before Week 2

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { extractStudentProfile, assembleContext, reRankChunks, deduplicateChunks } from '../lib/rag/retrieval.js';
import { generateResponse } from '../lib/rag/generation.js';

const realQueries = [
  {
    id: 1,
    query: "I want to be an engineer but my family can't afford it",
    expectedQuality: "Should mention NSFAS, corporate bursaries (Sasol, Eskom), work-back requirements"
  },
  {
    id: 2,
    query: "I'm good at art but my parents say it's a waste",
    expectedQuality: "Should challenge misconception, mention UX/UI Design, creative-tech hybrids, salary data"
  },
  {
    id: 3,
    query: "Should I study computer science or data science?",
    expectedQuality: "Should use V.I.S. Model, compare both careers, provide decision framework"
  },
  {
    id: 4,
    query: "What careers combine biology and technology?",
    expectedQuality: "Should mention Biomedical Engineering, Health Informatics, Bioinformatics"
  },
  {
    id: 5,
    query: "I'm not sure if I should go to university or start working",
    expectedQuality: "Should present both paths, mention degree-required vs optional careers, hybrid approach"
  }
];

async function testQuery(queryObj) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`QUERY ${queryObj.id}: "${queryObj.query}"`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Expected: ${queryObj.expectedQuality}\n`);
  
  try {
    const studentProfile = extractStudentProfile(queryObj.query);
    const queryEmbedding = await generateQueryEmbedding(queryObj.query);
    const searchResults = await semanticSearch(queryEmbedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: studentProfile.priorityModules
    });
    
    if (searchResults.length === 0) {
      console.log('❌ No search results found\n');
      return { id: queryObj.id, helpful: false, reason: 'No content retrieved' };
    }
    
    const reRanked = reRankChunks(searchResults, studentProfile);
    const deduplicated = deduplicateChunks(reRanked, 0.9);
    const assembled = assembleContext(deduplicated, studentProfile, {
      maxTokens: 3000,
      format: 'structured'
    });
    
    const result = await generateResponse(
      queryObj.query,
      assembled.context,
      studentProfile,
      { maxRetries: 2, timeout: 10000 }
    );
    
    if (!result.success) {
      console.log(`❌ Generation failed: ${result.error}\n`);
      return { id: queryObj.id, helpful: false, reason: result.error };
    }
    
    console.log('RESPONSE:');
    console.log('-'.repeat(70));
    console.log(result.response);
    console.log('-'.repeat(70));
    
    // Manual quality check prompts
    console.log('\n📋 QUALITY CHECK:');
    console.log('1. Does this answer the student\'s question?');
    console.log('2. Is it comprehensive enough for a Grade 11 student?');
    console.log('3. Does it include SA-specific information?');
    console.log('4. Are there actionable next steps?');
    console.log('5. Would you feel confident giving this to a real student?\n');
    
    // Auto-check for key elements
    const hasFramework = /V\.I\.S\.|Career Choice Matrix|framework|model/i.test(result.response);
    const hasSalary = /R\d+[kK]?/g.test(result.response);
    const hasSAContext = /UCT|Wits|Stellenbosch|South Africa|SA/i.test(result.response);
    const hasNextSteps = /next step|apply|research|contact|visit/i.test(result.response);
    const isSubstantial = result.response.length >= 400;
    
    console.log('AUTO-CHECK:');
    console.log(`  Framework mentioned: ${hasFramework ? '✅' : '❌'}`);
    console.log(`  Salary data: ${hasSalary ? '✅' : '❌'}`);
    console.log(`  SA context: ${hasSAContext ? '✅' : '❌'}`);
    console.log(`  Next steps: ${hasNextSteps ? '✅' : '❌'}`);
    console.log(`  Substantial (400+ chars): ${isSubstantial ? '✅' : '❌'}`);
    
    const autoScore = [hasFramework, hasSalary, hasSAContext, hasNextSteps, isSubstantial].filter(Boolean).length;
    const helpful = autoScore >= 4;
    
    console.log(`\n${helpful ? '✅ LIKELY HELPFUL' : '⚠️  MAY NEED IMPROVEMENT'} (${autoScore}/5 checks passed)\n`);
    
    return { 
      id: queryObj.id, 
      helpful, 
      autoScore,
      response: result.response.substring(0, 200) + '...'
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return { id: queryObj.id, helpful: false, reason: error.message };
  }
}

async function main() {
  console.log('\n🧪 SANITY CHECK: 5 Real Student Queries');
  console.log('Testing if responses are "good enough" for pilot\n');
  
  const results = [];
  
  for (const query of realQueries) {
    const result = await testQuery(query);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SANITY CHECK RESULTS');
  console.log('='.repeat(70) + '\n');
  
  results.forEach(r => {
    const status = r.helpful ? '✅ HELPFUL' : '❌ NEEDS WORK';
    console.log(`Query ${r.id}: ${status} ${r.autoScore ? `(${r.autoScore}/5)` : ''}`);
  });
  
  const helpfulCount = results.filter(r => r.helpful).length;
  const totalCount = results.length;
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`OVERALL: ${helpfulCount}/${totalCount} queries produced helpful responses`);
  console.log('='.repeat(70));
  
  if (helpfulCount >= 4) {
    console.log('\n✅ PILOT READY: 4+ queries helpful');
    console.log('   System is good enough to test with real students');
    console.log('   Proceed to Week 2 (Student UI Development)');
  } else if (helpfulCount >= 3) {
    console.log('\n⚠️  MARGINAL: 3 queries helpful');
    console.log('   System is viable but may need minor improvements');
    console.log('   Consider proceeding with caution');
  } else {
    console.log('\n❌ NOT READY: <3 queries helpful');
    console.log('   System needs more work before pilot');
    console.log('   Review failed queries and improve content');
  }
  
  console.log('\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Sanity check failed:', error);
    process.exit(1);
  });
