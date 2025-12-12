import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalCheck() {
  console.log('🔍 FINAL STATUS CHECK\n');
  console.log('═'.repeat(80));
  
  // Total chunks
  const { count: totalChunks } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total Chunks: ${totalChunks}`);
  
  // Chunks with embeddings
  const { count: withEmbeddings } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);
  
  console.log(`✅ With Embeddings: ${withEmbeddings} (${((withEmbeddings/totalChunks)*100).toFixed(1)}%)`);
  
  // Check specific careers
  console.log('\n🎯 Critical Careers Status:');
  const careers = [
    'Electrician',
    'Chef',
    'Software Engineer',
    'UX/UI Designer',
    'Content Creator',
    'Graphic Designer',
    'Data Scientist',
    'Medical Doctor',
    'Pharmacist'
  ];
  
  for (const career of careers) {
    const { data } = await supabase
      .from('knowledge_chunks')
      .select('id, embedding')
      .ilike('chunk_text', `%${career}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      const hasEmbedding = !!data[0].embedding;
      console.log(`  ${hasEmbedding ? '✅' : '⚠️ '} ${career}: ${hasEmbedding ? 'Ready' : 'No embedding'}`);
    } else {
      console.log(`  ❌ ${career}: Not found`);
    }
  }
  
  // Module breakdown
  console.log('\n📦 Modules:');
  const { data: modules } = await supabase
    .from('knowledge_modules')
    .select('module_name');
  
  for (const mod of modules || []) {
    const { count } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', (await supabase
        .from('knowledge_modules')
        .select('id')
        .eq('module_name', mod.module_name)
        .single()).data?.id);
    
    if (count > 0) {
      console.log(`  ${mod.module_name}: ${count} chunks`);
    }
  }
  
  console.log('\n═'.repeat(80));
}

finalCheck().catch(console.error);
