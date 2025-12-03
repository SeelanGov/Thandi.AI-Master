// Quick script to check what career chunks we have
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCareerChunks() {
  console.log('🔍 Checking career chunks in database\n');
  
  // Get all career chunks with metadata
  const { data, error } = await supabase
    .from('knowledge_chunks')
    .select('id, chunk_text, chunk_metadata, source_entity_type')
    .eq('source_entity_type', 'career')
    .limit(20);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${data.length} career chunks:\n`);
  
  data.forEach((chunk, i) => {
    const meta = chunk.chunk_metadata || {};
    console.log(`${i + 1}. ${meta.career_title || 'NO TITLE'}`);
    console.log(`   Code: ${meta.career_code || 'NO CODE'}`);
    console.log(`   Category: ${meta.career_category || 'NO CATEGORY'}`);
    console.log(`   Type: ${chunk.source_entity_type}`);
    console.log(`   Preview: ${chunk.chunk_text.substring(0, 80)}...`);
    console.log('');
  });
}

checkCareerChunks();
