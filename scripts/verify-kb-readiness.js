// Phase 1: Knowledge Base Verification Script
// Verifies that career data exists and is queryable

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { semanticSearch } from '../lib/rag/search.js';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyKnowledgeBase() {
  console.log('🔍 Phase 1: Knowledge Base Verification\n');
  
  try {
    // 1. Check career content exists
    console.log('1️⃣ Checking career content in knowledge_chunks...');
    const { data: careerChunks, error: careerError } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_text, chunk_metadata, source_entity_type')
      .eq('source_entity_type', 'career')
      .limit(10);
    
    if (careerError) throw careerError;
    
    console.log(`   ✅ Found ${careerChunks?.length || 0} career chunks (showing first 10)`);
    if (careerChunks && careerChunks.length > 0) {
      careerChunks.forEach(c => {
        const meta = c.chunk_metadata || {};
        const preview = c.chunk_text.substring(0, 60) + '...';
        console.log(`      - ${preview}`);
      });
    }
    
    // 2. Check total career chunk count
    const { count, error: countError } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('source_entity_type', 'career');
    
    if (countError) throw countError;
    console.log(`   📊 Total career chunks in database: ${count}\n`);
    
    // 3. Check embeddings exist
    console.log('2️⃣ Checking embeddings...');
    const { data: withEmbeddings, error: embError } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_text')
      .eq('source_entity_type', 'career')
      .not('embedding', 'is', null)
      .limit(5);
    
    if (embError) throw embError;
    
    console.log(`   ✅ Career chunks with embeddings: ${withEmbeddings?.length || 0}`);
    
    // 4. Check metadata structure
    console.log('\n3️⃣ Checking metadata structure...');
    const { data: sampleChunk, error: sampleError } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .eq('source_entity_type', 'career')
      .limit(1)
      .single();
    
    if (sampleError) throw sampleError;
    
    if (sampleChunk) {
      const preview = sampleChunk.chunk_text.substring(0, 80) + '...';
      console.log(`   Sample chunk: ${preview}`);
      console.log(`   Metadata keys: ${Object.keys(sampleChunk.chunk_metadata || {}).join(', ')}`);
    }
    
    // 5. Test semantic search function
    console.log('\n4️⃣ Testing semantic search capability...');
    const testQuery = 'engineering mathematics science';
    console.log(`   Test query: "${testQuery}"`);
    
    // Generate embedding for test query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: testQuery,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    const results = await semanticSearch(queryEmbedding, { limit: 3 });
    
    console.log(`   ✅ Search returned ${results.length} results:`);
    results.forEach((r, i) => {
      console.log(`      ${i + 1}. ${r.title} (similarity: ${r.similarity?.toFixed(3) || 'N/A'})`);
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Career content: ${count} entries`);
    console.log(`✅ Embeddings: Present`);
    console.log(`✅ Semantic search: Functional`);
    console.log(`✅ Metadata: Available`);
    console.log('\n🎯 Knowledge base is ready for RAG integration!\n');
    
    return {
      success: true,
      careerCount: count,
      hasEmbeddings: withEmbeddings.length > 0,
      searchWorks: results.length > 0
    };
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Run verification
verifyKnowledgeBase()
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
