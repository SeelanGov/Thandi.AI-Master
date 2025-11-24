// Test what chunks are retrieved for Q19
import dotenv from 'dotenv';
import { semanticSearch } from '../lib/rag/search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

dotenv.config({ path: '.env.local' });

async function test() {
  const question = "I'm stuck between two career paths. How do I choose?";
  console.log(`\n🔍 Testing retrieval for Q19: "${question}"\n`);
  
  const embedding = await generateQueryEmbedding(question);
  const chunks = await semanticSearch(embedding, { limit: 5, threshold: 0.5 });
  
  console.log(`Retrieved ${chunks.length} chunks:\n`);
  chunks.forEach((chunk, i) => {
    console.log(`${i+1}. [Similarity: ${(chunk.similarity * 100).toFixed(1)}%]`);
    console.log(`   Chunk ID: ${chunk.chunk_id}`);
    console.log(`   Metadata:`, JSON.stringify(chunk.chunk_metadata, null, 2));
    console.log(`   Preview: ${chunk.chunk_text.substring(0, 150)}...`);
    console.log('');
  });
}

test().catch(console.error);
