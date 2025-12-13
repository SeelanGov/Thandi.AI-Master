import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugIEBContent() {
  console.log('🔍 Debugging IEB Content in Database');
  console.log('=' .repeat(50));
  
  // Get all IEB chunks
  const { data: iebChunks, error } = await supabase
    .from('knowledge_chunks')
    .select('chunk_text, chunk_metadata')
    .eq('chunk_metadata->>curriculum', 'ieb');
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Found ${iebChunks.length} IEB chunks`);
  
  // Analyze content
  iebChunks.forEach((chunk, i) => {
    console.log(`\n📄 IEB Chunk ${i + 1}:`);
    console.log(`   Curriculum: ${chunk.chunk_metadata?.curriculum}`);
    console.log(`   Category: ${chunk.chunk_metadata?.category}`);
    console.log(`   Subject: ${chunk.chunk_metadata?.subject_name || chunk.chunk_metadata?.university_name || 'unknown'}`);
    console.log(`   Content length: ${chunk.chunk_text.length} chars`);
    console.log(`   Content preview: ${chunk.chunk_text.substring(0, 200)}...`);
    
    // Check for key terms
    const hasUniversity = chunk.chunk_text.toLowerCase().includes('university');
    const hasMath = chunk.chunk_text.toLowerCase().includes('math');
    const hasEngineering = chunk.chunk_text.toLowerCase().includes('engineering');
    const hasAPS = chunk.chunk_text.toLowerCase().includes('aps');
    
    console.log(`   Contains: university=${hasUniversity}, math=${hasMath}, engineering=${hasEngineering}, aps=${hasAPS}`);
  });
  
  // Test specific searches
  console.log('\n🔍 Testing specific search terms...');
  
  const searchTerms = ['mathematics', 'university', 'engineering', 'wits', 'aps'];
  
  for (const term of searchTerms) {
    const { data: results, error: searchError } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .eq('chunk_metadata->>curriculum', 'ieb')
      .ilike('chunk_text', `%${term}%`);
      
    if (!searchError) {
      console.log(`   "${term}": ${results.length} matches`);
    }
  }
}

debugIEBContent().catch(console.error);