import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateMissingEmbeddings() {
  console.log('🔍 Finding chunks without embeddings...\n');
  
  // Get chunks without embeddings
  const { data: chunks, error } = await supabase
    .from('knowledge_chunks')
    .select('id, chunk_text')
    .is('embedding', null);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`Found ${chunks.length} chunks without embeddings\n`);
  
  if (chunks.length === 0) {
    console.log('✅ All chunks have embeddings!');
    return;
  }
  
  console.log('🔮 Generating embeddings...');
  console.log(`Estimated cost: $${(chunks.length * 0.0001).toFixed(4)}\n`);
  
  let processed = 0;
  let failed = 0;
  
  // Process in batches of 10
  for (let i = 0; i < chunks.length; i += 10) {
    const batch = chunks.slice(i, i + 10);
    
    console.log(`Processing batch ${Math.floor(i/10) + 1}/${Math.ceil(chunks.length/10)}...`);
    
    for (const chunk of batch) {
      try {
        const embedding = await generateQueryEmbedding(chunk.chunk_text);
        
        const { error: updateError } = await supabase
          .from('knowledge_chunks')
          .update({ embedding })
          .eq('id', chunk.id);
        
        if (updateError) {
          console.error(`  ❌ Failed to update chunk ${chunk.id}:`, updateError.message);
          failed++;
        } else {
          processed++;
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed to generate embedding for chunk ${chunk.id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`  ✓ Processed: ${processed}/${chunks.length} chunks`);
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Success: ${processed}`);
  console.log(`   Failed: ${failed}`);
}

generateMissingEmbeddings().catch(console.error);
