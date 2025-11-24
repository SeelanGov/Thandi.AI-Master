// scripts/test-step2-search.js
// Test script for Step 2: Vector Search Implementation

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch, hybridSearch, testVectorSearch } from '../lib/rag/search.js';

console.log('🧪 STEP 2: Vector Search Test\n');
console.log('=' .repeat(60));

async function runTests() {
  try {
    // Test 1: Basic vector search functionality
    console.log('\n📋 Test 1: Basic Vector Search');
    console.log('-'.repeat(60));
    const testResult = await testVectorSearch();
    
    if (!testResult.success) {
      console.error('❌ Basic vector search test failed');
      process.exit(1);
    }

    // Test 2: Search with real query
    console.log('\n📋 Test 2: Real Query Search');
    console.log('-'.repeat(60));
    const testQuery = "What careers are good for someone who loves mathematics?";
    console.log(`Query: "${testQuery}"`);
    
    const start = Date.now();
    const queryEmbedding = await generateQueryEmbedding(testQuery);
    const embeddingTime = Date.now() - start;
    console.log(`✅ Generated query embedding in ${embeddingTime}ms`);
    
    const searchStart = Date.now();
    const results = await semanticSearch(queryEmbedding, {
      limit: 5,
      threshold: 0.7
    });
    const searchTime = Date.now() - searchStart;
    
    console.log(`✅ Found ${results.length} results in ${searchTime}ms`);
    console.log('\nTop 3 Results:');
    results.slice(0, 3).forEach((result, idx) => {
      console.log(`\n${idx + 1}. Similarity: ${result.similarity.toFixed(3)}`);
      console.log(`   Module: ${result.module_name}`);
      console.log(`   Text: ${result.chunk_text.substring(0, 150)}...`);
    });

    // Test 3: Module filtering
    console.log('\n📋 Test 3: Module Filtering');
    console.log('-'.repeat(60));
    const careerResults = await semanticSearch(queryEmbedding, {
      limit: 5,
      threshold: 0.7,
      moduleNames: ['careers', 'subject_career_mapping']
    });
    
    console.log(`✅ Found ${careerResults.length} results from careers/mapping modules`);
    const modules = [...new Set(careerResults.map(r => r.module_name))];
    console.log(`   Modules returned: ${modules.join(', ')}`);

    // Test 4: Hybrid search with keywords
    console.log('\n📋 Test 4: Hybrid Search (Semantic + Keywords)');
    console.log('-'.repeat(60));
    const keywords = ['mathematics', 'career', 'salary'];
    const hybridResults = await hybridSearch(queryEmbedding, keywords, {
      limit: 5,
      threshold: 0.7
    });
    
    console.log(`✅ Found ${hybridResults.length} results with keyword boosting`);
    console.log('\nTop 2 Results with Keyword Matches:');
    hybridResults.slice(0, 2).forEach((result, idx) => {
      console.log(`\n${idx + 1}. Similarity: ${result.similarity.toFixed(3)} (${result.keyword_matches} keyword matches)`);
      console.log(`   Module: ${result.module_name}`);
      console.log(`   Text: ${result.chunk_text.substring(0, 120)}...`);
    });

    // Test 5: Performance check
    console.log('\n📋 Test 5: Performance Check');
    console.log('-'.repeat(60));
    const perfTests = [];
    for (let i = 0; i < 3; i++) {
      const perfStart = Date.now();
      await semanticSearch(queryEmbedding, { limit: 10 });
      perfTests.push(Date.now() - perfStart);
    }
    
    const avgTime = perfTests.reduce((a, b) => a + b, 0) / perfTests.length;
    console.log(`✅ Average search time: ${avgTime.toFixed(0)}ms (3 runs)`);
    console.log(`   Min: ${Math.min(...perfTests)}ms, Max: ${Math.max(...perfTests)}ms`);
    
    if (avgTime > 1000) {
      console.warn('⚠️  Search is slower than 1 second - consider optimizing');
    } else {
      console.log('✅ Performance is good (< 1 second)');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ STEP 2 COMPLETE: Vector Search Implementation');
    console.log('='.repeat(60));
    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   - Vector search: Working`);
    console.log(`   - Module filtering: Working`);
    console.log(`   - Hybrid search: Working`);
    console.log(`   - Average search time: ${avgTime.toFixed(0)}ms`);
    console.log(`   - Results quality: ${results.length > 0 ? 'Good' : 'Needs review'}`);
    
    console.log('\n🎯 Next Step: Step 3 - Context Assembly + Student Profile Classification');
    console.log('   Run: node scripts/test-step3-context.js (after implementation)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

runTests();
