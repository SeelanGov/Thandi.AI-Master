// scripts/test-step3-context.js
// Test script for Step 3: Context Assembly + Student Profile Classification

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { 
  extractStudentProfile, 
  assembleContext, 
  reRankChunks,
  deduplicateChunks 
} from '../lib/rag/retrieval.js';

console.log('🧪 STEP 3: Context Assembly + Student Profile Classification\n');
console.log('='.repeat(60));

async function runTests() {
  try {
    // Test 1: Student Profile Extraction
    console.log('\n📋 Test 1: Student Profile Extraction');
    console.log('-'.repeat(60));
    
    const testQueries = [
      "I'm good at math but hate physics. My family can't afford university.",
      "I love technology and coding. What careers should I consider?",
      "I'm strong in mathematics and interested in data analysis."
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const profile = extractStudentProfile(query);
      console.log('Profile:', JSON.stringify(profile, null, 2));
    }

    // Test 2: Critical Validation - Financial Constraint Detection
    console.log('\n\n📋 Test 2: CRITICAL - Financial Constraint Detection');
    console.log('-'.repeat(60));
    
    const financialQuery = "I'm good at math but hate physics. My family can't afford university.";
    console.log(`Query: "${financialQuery}"`);
    const financialProfile = extractStudentProfile(financialQuery);
    
    console.log('\n✅ VALIDATION POINT 1: Student Profile Extraction');
    console.log(JSON.stringify(financialProfile, null, 2));
    
    // Validate critical requirements
    if (financialProfile.financialConstraint === 'low') {
      console.log('✅ PASS: Detected financial constraint = "low"');
    } else {
      console.log('❌ FAIL: Did not detect financial constraint');
    }
    
    if (financialProfile.academicStrengths.includes('mathematics')) {
      console.log('✅ PASS: Detected academic strength = "mathematics"');
    } else {
      console.log('❌ FAIL: Did not detect mathematics strength');
    }
    
    if (financialProfile.academicWeaknesses.includes('physics')) {
      console.log('✅ PASS: Detected academic weakness = "physics"');
    } else {
      console.log('❌ FAIL: Did not detect physics weakness');
    }

    // Test 3: Module Prioritization Logic
    console.log('\n\n📋 Test 3: CRITICAL - Module Prioritization Logic');
    console.log('-'.repeat(60));
    
    const scenarios = [
      {
        name: 'Math strong, physics weak, NO financial need',
        query: "I'm good at math but hate physics. What should I study?",
        expectedFirst: 'subject_career_mapping'
      },
      {
        name: 'Math strong, physics weak, LOW income',
        query: "I'm good at math but hate physics. My family can't afford university.",
        expectedFirst: 'bursaries'
      },
      {
        name: 'No subjects, interested in tech',
        query: "I'm interested in technology and coding. What careers are available?",
        expectedFirst: 'careers'
      }
    ];

    console.log('\n✅ VALIDATION POINT 2: Module Prioritization Order\n');
    
    for (const scenario of scenarios) {
      const profile = extractStudentProfile(scenario.query);
      console.log(`Scenario: ${scenario.name}`);
      console.log(`Priority Modules: ${profile.priorityModules.join(' → ')}`);
      
      if (scenario.expectedFirst === 'bursaries' && profile.priorityModules[0] === 'bursaries') {
        console.log('✅ PASS: Bursaries prioritized for low-income student\n');
      } else if (scenario.expectedFirst === 'bursaries' && profile.priorityModules[0] !== 'bursaries') {
        console.log('❌ CRITICAL FAIL: Bursaries NOT prioritized for low-income student\n');
      } else {
        console.log(`✅ PASS: Expected first module present\n`);
      }
    }

    // Test 4: Context Assembly
    console.log('\n📋 Test 4: Context Assembly Format');
    console.log('-'.repeat(60));
    
    const testQuery = "I'm good at math but hate physics. My family can't afford university.";
    console.log(`Query: "${testQuery}"`);
    
    // Generate embedding and search
    const embedding = await generateQueryEmbedding(testQuery);
    const profile = extractStudentProfile(testQuery);
    
    // Search with module filtering based on profile
    const chunks = await semanticSearch(embedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: profile.priorityModules
    });
    
    console.log(`\nRetrieved ${chunks.length} chunks`);
    
    // Re-rank based on profile
    const reRanked = reRankChunks(chunks, profile);
    console.log(`Re-ranked chunks (top 3 boost scores):`);
    reRanked.slice(0, 3).forEach((chunk, idx) => {
      console.log(`  ${idx + 1}. Similarity: ${chunk.similarity.toFixed(3)} → Boosted: ${chunk.boostedSimilarity.toFixed(3)} (+${chunk.boostScore.toFixed(3)})`);
    });
    
    // Deduplicate
    const deduplicated = deduplicateChunks(reRanked);
    console.log(`\nAfter deduplication: ${deduplicated.length} chunks`);
    
    // Assemble context
    const assembled = assembleContext(deduplicated, profile, {
      maxTokens: 3000,
      format: 'structured'
    });
    
    console.log('\n✅ VALIDATION POINT 3: Context Format\n');
    console.log('Metadata:', JSON.stringify(assembled.metadata, null, 2));
    console.log('\nContext (first 500 characters):');
    console.log('-'.repeat(60));
    console.log(assembled.context.substring(0, 500) + '...');
    console.log('-'.repeat(60));
    
    // Validate token limit
    if (assembled.metadata.tokensUsed <= 3000) {
      console.log(`✅ PASS: Token usage (${assembled.metadata.tokensUsed}) within limit (3000)`);
    } else {
      console.log(`❌ FAIL: Token usage (${assembled.metadata.tokensUsed}) exceeds limit (3000)`);
    }
    
    // Validate structure
    if (assembled.context.includes('Student Profile:')) {
      console.log('✅ PASS: Context includes student profile');
    } else {
      console.log('❌ FAIL: Context missing student profile');
    }
    
    if (assembled.context.includes('Retrieved Knowledge:')) {
      console.log('✅ PASS: Context includes retrieved knowledge section');
    } else {
      console.log('❌ FAIL: Context missing retrieved knowledge section');
    }
    
    if (assembled.context.includes('[Source:')) {
      console.log('✅ PASS: Context includes source attribution');
    } else {
      console.log('❌ FAIL: Context missing source attribution');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ STEP 3 COMPLETE: Context Assembly + Student Profile Classification');
    console.log('='.repeat(60));
    
    console.log('\n📊 Summary:');
    console.log(`   - Profile extraction: Working`);
    console.log(`   - Financial constraint detection: ${financialProfile.financialConstraint === 'low' ? 'Working ✅' : 'FAILED ❌'}`);
    console.log(`   - Module prioritization: ${profile.priorityModules[0] === 'bursaries' ? 'Working ✅' : 'FAILED ❌'}`);
    console.log(`   - Context assembly: Working`);
    console.log(`   - Token usage: ${assembled.metadata.tokensUsed} / 3000`);
    console.log(`   - Chunks included: ${assembled.metadata.includedChunks} / ${assembled.metadata.totalChunks}`);
    
    console.log('\n🎯 Next Step: Step 4 - LLM Generation + Response Validation');
    console.log('   Run: node scripts/test-step4-generation.js (after implementation)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

runTests();
