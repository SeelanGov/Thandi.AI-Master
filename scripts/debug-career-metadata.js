// scripts/debug-career-metadata.js
// Check how career metadata is actually stored

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMetadata() {
  console.log('🔍 Checking career metadata structure...\n');
  
  // Get a few chunks with career metadata
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .select(`
      id,
      chunk_text,
      chunk_metadata,
      source_entity_type,
      knowledge_modules!inner(module_name)
    `)
    .limit(20);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${data.length} chunks\n`);
  
  // Show chunks with career metadata
  const withCareer = data.filter(d => d.chunk_metadata?.career);
  console.log(`Chunks with career metadata: ${withCareer.length}\n`);
  
  if (withCareer.length > 0) {
    console.log('Sample career chunks:');
    withCareer.slice(0, 5).forEach((chunk, i) => {
      console.log(`\n${i+1}. ID: ${chunk.id}`);
      console.log(`   Module: ${chunk.knowledge_modules?.module_name}`);
      console.log(`   Career: ${chunk.chunk_metadata.career}`);
      console.log(`   Category: ${chunk.chunk_metadata.category}`);
      console.log(`   Text preview: ${chunk.chunk_text.substring(0, 100)}...`);
    });
  }
  
  // Try searching for electrician specifically
  console.log('\n\n🔍 Searching for electrician chunks...\n');
  
  const { data: electricianData, error: elecError } = await supabase
    .from('knowledge_chunks')
    .select(`
      id,
      chunk_text,
      chunk_metadata,
      knowledge_modules!inner(module_name)
    `)
    .ilike('chunk_text', '%electrician%')
    .limit(5);
  
  if (elecError) {
    console.error('Error:', elecError);
  } else {
    console.log(`Found ${electricianData.length} electrician chunks`);
    electricianData.forEach((chunk, i) => {
      console.log(`\n${i+1}. Metadata:`, chunk.chunk_metadata);
      console.log(`   Text: ${chunk.chunk_text.substring(0, 150)}...`);
    });
  }
}

checkMetadata().catch(console.error);
