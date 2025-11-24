import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { 
  extractStudentProfile, 
  assembleContext, 
  reRankChunks,
  deduplicateChunks 
} from '../lib/rag/retrieval.js';
import { generateResponse } from '../lib/rag/generation.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery(queryText) {
  console.log('🧪 Testing Query:', queryText);
  console.log('═'.repeat(80));
  
  // Extract profile
  const studentProfile = extractStudentProfile(queryText);
  console.log('\n📊 Student Profile:');
  console.log('  Priority Modules:', studentProfile.priorityModules);
  
  // Generate embedding
  const queryEmbedding = await generateQueryEmbedding(queryText);
  
  // Search with new settings
  const searchResults = await semanticSearch(queryEmbedding, {
    limit: 10,
    threshold: 0.55,
    moduleNames: null, // No filtering
    queryText: queryText
  });
  
  console.log(`\n🔍 Search Results: ${searchResults.length} chunks found`);
  
  searchResults.slice(0, 5).forEach((chunk, i) => {
    console.log(`\n${i+1}. Module: ${chunk.module_name}`);
    console.log(`   Similarity: ${chunk.original_similarity?.toFixed(3) || chunk.similarity.toFixed(3)}`);
    if (chunk.boosted_similarity) {
      console.log(`   Boosted: ${chunk.boosted_similarity.toFixed(3)} (boost: ${chunk.quality_boost > 0 ? '+' : ''}${chunk.quality_boost.toFixed(3)})`);
    }
    console.log(`   Preview: ${chunk.chunk_text.substring(0, 120)}...`);
  });
  
  // Re-rank and assemble
  const reRanked = reRankChunks(searchResults, studentProfile);
  const deduplicated = deduplicateChunks(reRanked, 0.9);
  const assembled = assembleContext(deduplicated, studentProfile, {
    maxTokens: 3000,
    format: 'structured'
  });
  
  console.log(`\n📦 Context Assembly:`);
  console.log(`   Chunks used: ${assembled.chunks.length}`);
  console.log(`   Tokens: ${assembled.metadata.tokensUsed}`);
  
  // Generate response
  console.log('\n🤖 Generating response...\n');
  const result = await generateResponse(
    queryText,
    assembled.context,
    studentProfile,
    { maxRetries: 2, timeout: 10000 }
  );
  
  if (result.success) {
    console.log('✅ Response Generated:\n');
    console.log(result.response);
  } else {
    console.log('❌ Generation failed:', result.error);
  }
}

const query = process.argv[2] || "I don't want university but need good salary—what are my options?";
testQuery(query).catch(console.error);
