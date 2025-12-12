// scripts/test-api-hybrid.js
// Test the full API with hybrid search integration

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Simulate API call
async function testAPIQuery(query) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: "${query}"`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // Import the modules
    const { generateQueryEmbedding } = await import('../lib/rag/embeddings.js');
    const { hybridSearch } = await import('../lib/rag/hybrid-search.js');
    const { extractStudentProfile, assembleContext } = await import('../lib/rag/retrieval.js');
    
    const startTime = Date.now();
    
    // Step 1: Extract student profile
    const profileStart = Date.now();
    const studentProfile = extractStudentProfile(query);
    const profileTime = Date.now() - profileStart;
    console.log(`✅ Profile extracted (${profileTime}ms)`);
    console.log(`   Strengths: ${studentProfile.academicStrengths.join(', ') || 'None'}`);
    console.log(`   Interests: ${studentProfile.interests.join(', ') || 'None'}`);
    
    // Step 2: Generate embedding
    const embeddingStart = Date.now();
    const queryEmbedding = await generateQueryEmbedding(query);
    const embeddingTime = Date.now() - embeddingStart;
    console.log(`✅ Embedding generated (${embeddingTime}ms)`);
    
    // Step 3: Hybrid search
    const searchStart = Date.now();
    const searchResults = await hybridSearch(query, queryEmbedding, {
      limit: 10,
      debug: true
    });
    const searchTime = Date.now() - searchStart;
    console.log(`✅ Search completed (${searchTime}ms)`);
    console.log(`   Retrieved: ${searchResults.length} chunks`);
    
    // Step 4: Assemble context
    const contextStart = Date.now();
    const assembled = assembleContext(searchResults, studentProfile, {
      maxTokens: 3000,
      format: 'structured'
    });
    const contextTime = Date.now() - contextStart;
    console.log(`✅ Context assembled (${contextTime}ms)`);
    console.log(`   Chunks used: ${assembled.metadata.includedChunks}`);
    console.log(`   Tokens: ${assembled.metadata.tokensUsed}`);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n📊 Total processing time: ${totalTime}ms`);
    console.log(`\n📋 Top 5 chunks:`);
    searchResults.slice(0, 5).forEach((r, i) => {
      const career = r.chunk_metadata?.career_name || 'N/A';
      const category = r.chunk_metadata?.chunk_type || 'N/A';
      console.log(`${i+1}. [${r.source}] ${career} - ${category} (score: ${r.final_score.toFixed(3)})`);
    });
    
    return { success: true, totalTime, searchResults: searchResults.length };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test queries
const testQueries = [
  "I don't want to go to university but I need a good salary",
  "I want something creative but also involves technology",
  "I like biology and I'm interested in technology careers"
];

async function runTests() {
  console.log('🧪 API HYBRID SEARCH INTEGRATION TEST\n');
  
  const results = [];
  
  for (const query of testQueries) {
    const result = await testAPIQuery(query);
    results.push({ query, ...result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const successful = results.filter(r => r.success);
  const avgTime = successful.reduce((sum, r) => sum + r.totalTime, 0) / successful.length;
  
  console.log(`\nTests passed: ${successful.length}/${results.length}`);
  console.log(`Average processing time: ${avgTime.toFixed(0)}ms`);
  console.log(`Average chunks retrieved: ${(successful.reduce((sum, r) => sum + r.searchResults, 0) / successful.length).toFixed(1)}`);
  
  if (successful.length === results.length) {
    console.log(`\n✅ ALL TESTS PASSED - API integration working!`);
  } else {
    console.log(`\n⚠️  Some tests failed - check errors above`);
  }
}

runTests().catch(console.error);
