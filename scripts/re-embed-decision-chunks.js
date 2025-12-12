// Delete old decision-making chunks and re-embed with full content
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 RE-EMBEDDING DECISION-MAKING CHUNKS WITH FULL CONTENT');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    // Get or create module ID
    let { data: module } = await supabase
      .from('knowledge_modules')
      .select('id')
      .eq('module_name', 'decision_making_framework')
      .single();
    
    if (!module) {
      console.log('Creating decision_making_framework module...');
      const { data: newModule, error } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'decision_making_framework',
          description: 'Decision-making frameworks using V.I.S. Model',
          priority: 1
        })
        .select()
        .single();
      if (error) throw error;
      module = newModule;
    }
    
    console.log(`✓ Found module ID: ${module.id}\n`);
    
    // Delete old chunks
    console.log('🗑️  Deleting old chunks...');
    const { error: deleteError } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('module_id', module.id);
    
    if (deleteError) throw deleteError;
    console.log('✓ Old chunks deleted\n');
    
    // Load new chunks with full content
    const jsonPath = join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');
    const chunks = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`✓ Loaded ${chunks.length} chunks with full content\n`);
    console.log('🔮 Generating embeddings with rich content...');
    console.log(`   Estimated cost: $${(chunks.length * 0.0001).toFixed(4)} (~R${(chunks.length * 0.0001 * 18).toFixed(2)})\n`);
    
    let processed = 0;
    
    for (const chunk of chunks) {
      try {
        // Generate embedding from FULL content_text (2000 chars)
        const embedding = await generateEmbedding(chunk.content_text);
        
        // Insert with new embedding
        const { error } = await supabase
          .from('knowledge_chunks')
          .insert({
            module_id: module.id,
            source_entity_id: null,
            source_entity_type: 'framework_chunk',
            chunk_text: chunk.content_text,
            chunk_metadata: {
              chunk_id: chunk.chunk_id,
              title: chunk.title,
              tags: chunk.tags,
              target_questions: chunk.target_questions,
              sa_specific: chunk.sa_specific,
              version: chunk.version,
              content_length: chunk.content_text.length
            },
            embedding: JSON.stringify(embedding)
          });
        
        if (error) throw error;
        
        processed++;
        console.log(`  ✓ [${processed}/${chunks.length}] ${chunk.chunk_id}: ${chunk.title.substring(0, 50)}... (${chunk.content_text.length} chars)`);
        
        await sleep(200);
        
      } catch (error) {
        console.error(`  ✗ Failed ${chunk.chunk_id}: ${error.message}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ RE-EMBEDDING COMPLETE!');
    console.log(`   Successfully processed: ${processed}/${chunks.length} chunks`);
    console.log('═══════════════════════════════════════════════════════');
    
    console.log('\n🧪 CRITICAL TEST: Run Q19 & Q20 validation');
    console.log('   Command: node scripts/test-rag-suite.js 2>&1 | Select-String -Pattern "Q19|Q20|FINAL"');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
