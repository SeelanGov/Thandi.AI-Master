// Upload curriculum gate chunks to Supabase
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { CURRICULUM_GATE_CHUNKS } from '../thandi_knowledge_base/curriculum_gates/gate-chunks.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

async function uploadCurriculumGates() {
  console.log('🚀 Starting curriculum gate upload...\n');

  for (const chunk of CURRICULUM_GATE_CHUNKS) {
    console.log(`📝 Processing: ${chunk.metadata.gate_type}`);
    
    // Generate embedding
    const embedding = await generateEmbedding(chunk.chunk_text);
    
    // Upload to knowledge_chunks
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .insert({
        chunk_text: chunk.chunk_text,
        chunk_metadata: chunk.metadata,
        embedding: embedding,
        module_id: null, // Not tied to existing modules
        source_entity_type: 'curriculum_gate'
      });

    if (error) {
      console.error(`❌ Error uploading ${chunk.metadata.gate_type}:`, error);
    } else {
      console.log(`✅ Uploaded: ${chunk.metadata.gate_type}\n`);
    }
  }

  console.log('🎉 All curriculum gates uploaded!');
}

// Run upload
uploadCurriculumGates().catch(console.error);
