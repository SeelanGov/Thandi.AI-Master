// scripts/test-step4-generation.js
// Test script for Step 4: LLM Generation + Response Validation

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { 
  extractStudentProfile, 
  assembleContext, 
  reRankChunks 
} from '../lib/rag/retrieval.js';
import { generateResponse, validateResponse } from '../lib/rag/generation.js';

console.log('🧪 STEP 4: LLM Generation + Response Validation\n');
console.log('='.repeat(60));

async function runTests() {
  try {
    // Test Query
    const testQuery = "I'm good at math but hate physics. My family can't afford university.";
    console.log(`\n📝 Test Query: "${testQuery}"\n`);

    // Step 1: Extract profile
    console.log('📋 Step 1: Extracting student profile...');
    const profile = extractStudentProfile(testQuery);
    console.log('Profile:', JSON.stringify(profile, null, 2));

    // Step 2: Generate embedding
    console.log('\n📋 Step 2: Generating query embedding...');
    const embeddingStart = Date.now();
    const embedding = await generateQueryEmbedding(testQuery);
    console.log(`✅ Embedding generated in ${Date.now() - embeddingStart}ms`);

    // Step 3: Search
    console.log('\n📋 Step 3: Searching knowledge base...');
    const searchStart = Date.now();
    const chunks = await semanticSearch(embedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: profile.priorityModules
    });
    console.log(`✅ Retrieved ${chunks.length} chunks in ${Date.now() - searchStart}ms`);

    // Step 4: Re-rank and assemble context
    console.log('\n📋 Step 4: Assembling context...');
    const reRanked = reRankChunks(chunks, profile);
    const assembled = assembleContext(reRanked, profile, {
      maxTokens: 3000,
      format: 'structured'
    });
    console.log(`✅ Context assembled: ${assembled.metadata.tokensUsed} tokens`);

    // Step 5: Generate response
    console.log('\n📋 Step 5: Generating LLM response...');
    console.log('⏳ This may take 5-10 seconds...\n');
    
    const generationStart = Date.now();
    const result = await generateResponse(
      testQuery,
      assembled.context,
      profile,
      { maxRetries: 2, timeout: 10000 }
    );
    const totalTime = Date.now() - generationStart;

    if (!result.success) {
      console.error('❌ Generation failed:', result.error);
      console.error('Metadata:', result.metadata);
      process.exit(1);
    }

    console.log('✅ Response generated successfully!\n');
    console.log('='.repeat(60));
    console.log('GENERATED RESPONSE:');
    console.log('='.repeat(60));
    console.log(result.response);
    console.log('='.repeat(60));

    // Validation Results
    console.log('\n📊 CHECKPOINT 2 - VALIDATION RESULTS\n');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣ VALIDATION CHECKS:');
    console.log(JSON.stringify(result.validation.checks, null, 2));
    
    console.log('\n2️⃣ VALIDATION DETAILS:');
    console.log(`   - Career count: ${result.validation.details.careerCount}`);
    console.log(`   - Salary range count: ${result.validation.details.salaryRangeCount}`);
    console.log(`   - Response length: ${result.validation.details.responseLength} chars`);
    console.log(`   - Overall validation: ${result.validation.passed ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n3️⃣ PERFORMANCE METRICS:');
    console.log(JSON.stringify(result.metadata, null, 2));

    // Detailed validation breakdown
    console.log('\n4️⃣ DETAILED VALIDATION BREAKDOWN:\n');
    
    const checks = result.validation.checks;
    console.log(`   ${checks.hasCareerMatches ? '✅' : '❌'} Career Matches (3-5): ${result.validation.details.careerCount} careers found`);
    console.log(`   ${checks.hasReasoningForCareer ? '✅' : '❌'} Career Reasoning: ${checks.hasReasoningForCareer ? 'Present' : 'Missing'}`);
    console.log(`   ${checks.hasBursaries ? '✅' : '❌'} Bursaries (with deadlines): ${checks.hasBursaries ? 'Present' : 'Missing'}`);
    console.log(`   ${checks.hasSalaries ? '✅' : '❌'} Salary Ranges (ZAR): ${result.validation.details.salaryRangeCount} ranges found`);
    console.log(`   ${checks.hasNextSteps ? '✅' : '❌'} Next Steps: ${checks.hasNextSteps ? 'Present' : 'Missing'}`);
    console.log(`   ${checks.hasSAContext ? '✅' : '❌'} SA Context: ${checks.hasSAContext ? 'Present' : 'Missing'}`);
    console.log(`   ${checks.hasSubstantialContent ? '✅' : '❌'} Substantial Content: ${result.validation.details.responseLength} chars (500-2000 target)`);

    // Performance check
    console.log('\n5️⃣ PERFORMANCE CHECK:\n');
    console.log(`   Generation time: ${result.metadata.generationTime}ms`);
    console.log(`   Model used: ${result.metadata.modelUsed}`);
    console.log(`   Retries: ${result.metadata.retries}`);
    console.log(`   Fallback used: ${result.metadata.fallbackUsed ? 'Yes (OpenAI)' : 'No (Groq)'}`);
    console.log(`   Tokens used: ${result.metadata.tokensUsed?.total || 'N/A'}`);
    
    if (result.metadata.generationTime > 10000) {
      console.log('   ⚠️  WARNING: Generation exceeded 10s target');
    } else {
      console.log('   ✅ Performance within 10s requirement');
    }

    // Total pipeline time (from very start to end)
    const embeddingTime = Date.now() - embeddingStart;
    const searchTime = Date.now() - searchStart;
    const pipelineTime = embeddingTime + searchTime + result.metadata.generationTime;
    console.log(`\n   Total pipeline time: ${pipelineTime}ms (~${(pipelineTime/1000).toFixed(1)}s)`);
    if (pipelineTime > 10000) {
      console.log('   ⚠️  WARNING: Total pipeline exceeded 10s target');
    } else {
      console.log('   ✅ Total pipeline within 10s requirement');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ STEP 4 COMPLETE: LLM Generation + Response Validation');
    console.log('='.repeat(60));
    
    console.log('\n📊 Summary:');
    console.log(`   - Response generated: ${result.success ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   - Validation passed: ${result.validation.passed ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   - Model used: ${result.metadata.modelUsed}`);
    console.log(`   - Generation time: ${result.metadata.generationTime}ms`);
    console.log(`   - Retries needed: ${result.metadata.retries}`);
    console.log(`   - Career count: ${result.validation.details.careerCount}`);
    console.log(`   - Salary ranges: ${result.validation.details.salaryRangeCount}`);
    console.log(`   - Response length: ${result.validation.details.responseLength} chars`);

    if (!result.validation.passed) {
      console.log('\n⚠️  WARNING: Response validation failed. Check validation details above.');
    }

    console.log('\n🎯 Next Step: Step 5 - API Endpoint');
    console.log('   Run: node scripts/test-step5-api.js (after implementation)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

runTests();
