// Generate embeddings for decision-making framework chunks
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = 'text-embedding-ada-002';

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate embedding for text
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 SPRINT 1.1 - DECISION-MAKING FRAMEWORK EMBEDDINGS');
  console.log('   Generating embeddings for 15 chunks');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    // Load decision_making.json
    const jsonPath = join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');
    const chunks = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`✓ Loaded ${chunks.length} chunks from decision_making.json\n`);
    
    // Get or create decision_making_framework module
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
          description: 'Decision-making frameworks using V.I.S. Model for career choices',
          priority: 1
        })
        .select()
        .single();
      
      if (error) throw error;
      module = newModule;
      console.log(`✓ Created module with ID: ${module.id}\n`);
    } else {
      console.log(`✓ Using existing module ID: ${module.id}\n`);
    }
    
    console.log('🔮 Generating embeddings...');
    console.log(`   Estimated cost: $${(chunks.length * 0.0001).toFixed(4)} (~R${(chunks.length * 0.0001 * 18).toFixed(2)})\n`);
    
    let processed = 0;
    let failed = 0;
    
    for (const chunk of chunks) {
      try {
        // Generate embedding from content_text
        const embedding = await generateEmbedding(chunk.content_text);
        
        // Insert into knowledge_chunks
        const { error } = await supabase
          .from('knowledge_chunks')
          .insert({
            module_id: module.id,
            source_entity_id: null, // No source entity for framework chunks
            source_entity_type: 'framework_chunk',
            chunk_text: chunk.content_text,
            chunk_metadata: {
              chunk_id: chunk.chunk_id,
              title: chunk.title,
              tags: chunk.tags,
              related_chunks: chunk.related_chunks,
              target_questions: chunk.target_questions,
              sa_specific: chunk.sa_specific,
              version: chunk.version
            },
            embedding: JSON.stringify(embedding)
          });
        
        if (error) throw error;
        
        processed++;
        console.log(`  ✓ [${processed}/${chunks.length}] ${chunk.chunk_id}: ${chunk.title}`);
        
        // Rate limiting: wait 200ms between requests
        await sleep(200);
        
      } catch (error) {
        failed++;
        console.error(`  ✗ Failed ${chunk.chunk_id}: ${error.message}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ EMBEDDING GENERATION COMPLETE!');
    console.log(`   Successfully processed: ${processed}/${chunks.length} chunks`);
    if (failed > 0) {
      console.log(`   Failed: ${failed} chunks`);
    }
    console.log('═══════════════════════════════════════════════════════');
    
    // Verify insertion
    const { count } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', module.id);
    
    console.log(`\n📊 Verification: ${count} decision-making chunks in database`);
    
    console.log('\n🧪 NEXT STEP: Run test suite on Q19 & Q20');
    console.log('   Command: npm run test:rag:suite -- --questions Q19,Q20');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
