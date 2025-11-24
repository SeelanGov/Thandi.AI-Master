import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSearch() {
  const query = "electrician";
  console.log('🔍 Testing search for:', query);
  
  // Generate embedding
  const embedding = await generateQueryEmbedding(query);
  console.log('✅ Generated embedding');
  
  // Test RPC function directly
  const embeddingStr = `[${embedding.join(',')}]`;
  
  console.log('\n📊 Testing with threshold 0.55, limit 25...');
  const { data: results, error } = await supabase.rpc(
    'search_knowledge_chunks',
    {
      query_embedding: embeddingStr,
      match_threshold: 0.55,
      match_count: 25,
      filter_module_ids: null
    }
  );
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`\n✅ Found ${results.length} chunks`);
  
  // Show top 10
  results.slice(0, 10).forEach((r, i) => {
    console.log(`\n${i+1}. Similarity: ${r.similarity.toFixed(3)}`);
    console.log(`   Preview: ${r.chunk_text.substring(0, 120)}...`);
  });
  
  // Check if any are actual electrician career chunks
  const careerChunks = results.filter(r => 
    r.chunk_text.toLowerCase().includes('career: electrician') ||
    r.chunk_text.toLowerCase().includes('electrician description:')
  );
  
  console.log(`\n📋 Career-specific electrician chunks: ${careerChunks.length}`);
  if (careerChunks.length > 0) {
    console.log('Sample:', careerChunks[0].chunk_text.substring(0, 200));
  }
}

debugSearch().catch(console.error);
