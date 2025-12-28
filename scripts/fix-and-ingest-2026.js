import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('🔥 FIXING AND INGESTING 2026 FILES NOW\n');

// Map files to correct modules (from the check-modules output)
const FILES = [
  { path: 'thandi_knowledge_base/university/program_thresholds.json', module_id: '2a3ed4d0-eeaf-46fa-8936-fed5560877f9' },
  { path: 'thandi_knowledge_base/financial_aid/bursaries.json', module_id: '29bb7dea-8a63-4d9b-9d2d-2c18f672775e' }
];

for (const file of FILES) {
  console.log(`Processing: ${file.path}`);
  
  const content = fs.readFileSync(file.path, 'utf8');
  const data = JSON.parse(content);
  
  // Delete old chunks
  await supabase.from('knowledge_chunks').delete().ilike('chunk_text', `%${data.kb_id}%`);
  
  // Create simple text
  let text = `${data.kb_id} ${data.version}\n`;
  
  if (data.universities) {
    for (const uni of data.universities) {
      text += `${uni.name}: `;
      for (const [prog, req] of Object.entries(uni.programs)) {
        text += `${prog} APS ${req.aps_min} ${req.subjects?.join(' ')} `;
      }
    }
  }
  
  if (data.bursaries) {
    for (const bursary of data.bursaries) {
      text += `${bursary.name}: ${bursary.eligibility} ${bursary.amounts} ${bursary.deadlines} `;
    }
  }
  
  if (data.notes) text += data.notes;
  
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  
  // Insert single chunk
  const { error } = await supabase.from('knowledge_chunks').insert({
    module_id: file.module_id,
    source_entity_id: null,
    source_entity_type: '2026_update',
    chunk_text: text,
    chunk_metadata: { kb_id: data.kb_id, version: data.version, priority_2026: true },
    embedding: JSON.stringify(response.data[0].embedding)
  });
  
  if (error) {
    console.log(`❌ ${error.message}`);
  } else {
    console.log(`✅ Inserted ${data.kb_id}`);
  }
}

console.log('\n🚀 TESTING RAG WITH 2026 DATA...');

// Test the RAG system
const testQuery = "What are the NSFAS deadlines for 2026?";
const testResponse = await openai.embeddings.create({
  model: 'text-embedding-ada-002',
  input: testQuery
});

const { data: results } = await supabase.rpc('search_knowledge_chunks', {
  query_embedding: `[${testResponse.data[0].embedding.join(',')}]`,
  match_threshold: 0.5,
  match_count: 5
});

console.log('Search results:');
results?.forEach(r => console.log(`- ${r.chunk_text.substring(0, 100)}...`));

console.log('\n✅ 2026 DATA INGESTION COMPLETE!');