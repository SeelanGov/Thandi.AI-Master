// Check embeddings schema and data
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmbeddingsSchema() {
  console.log('🔍 EMBEDDINGS SCHEMA INVESTIGATION\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // 1. Check knowledge_chunks table structure
  console.log('1️⃣ Checking knowledge_chunks table structure...\n');
  
  const { data: chunks, error: chunksError } = await supabase
    .from('knowledge_chunks')
    .select('*')
    .limit(1);
  
  if (chunksError) {
    console.error('❌ Error querying knowledge_chunks:', chunksError);
  } else if (chunks && chunks.length > 0) {
    console.log('✅ knowledge_chunks table exists');
    console.log('📋 Columns found:', Object.keys(chunks[0]));
    console.log('\n📄 Sample record:');
    console.log(JSON.stringify(chunks[0], null, 2));
  }
  
  // 2. Check total count
  console.log('\n\n2️⃣ Checking total embeddings count...\n');
  
  const { count, error: countError } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error counting chunks:', countError);
  } else {
    console.log(`✅ Total chunks in database: ${count}`);
  }
  
  // 3. Check knowledge_modules
  console.log('\n\n3️⃣ Checking knowledge_modules...\n');
  
  const { data: modules, error: modulesError } = await supabase
    .from('knowledge_modules')
    .select('*');
  
  if (modulesError) {
    console.error('❌ Error querying knowledge_modules:', modulesError);
  } else {
    console.log(`✅ Found ${modules.length} modules:`);
    modules.forEach(m => {
      console.log(`   - ${m.module_name} (ID: ${m.id})`);
    });
  }
  
  // 4. Check chunks by module
  console.log('\n\n4️⃣ Checking chunks distribution by module...\n');
  
  for (const module of modules) {
    const { count: moduleCount } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', module.id);
    
    console.log(`   ${module.module_name}: ${moduleCount} chunks`);
  }
  
  // 5. Check if embeddings exist (vector column)
  console.log('\n\n5️⃣ Checking if embeddings (vectors) exist...\n');
  
  const { data: withEmbedding, error: embError } = await supabase
    .from('knowledge_chunks')
    .select('id, embedding')
    .not('embedding', 'is', null)
    .limit(5);
  
  if (embError) {
    console.error('❌ Error checking embeddings:', embError);
  } else {
    console.log(`✅ Found ${withEmbedding.length} chunks with embeddings`);
    if (withEmbedding.length > 0) {
      console.log('📊 Sample embedding info:');
      withEmbedding.forEach((chunk, i) => {
        const embLength = chunk.embedding ? (Array.isArray(chunk.embedding) ? chunk.embedding.length : 'unknown') : 'null';
        console.log(`   Chunk ${i + 1}: embedding dimensions = ${embLength}`);
      });
    }
  }
  
  // 6. Check for chunks WITHOUT embeddings
  console.log('\n\n6️⃣ Checking for chunks WITHOUT embeddings...\n');
  
  const { count: missingCount } = await supabase
    .from('knowledge_chunks')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);
  
  console.log(`⚠️  Chunks missing embeddings: ${missingCount}`);
  
  if (missingCount > 0) {
    const { data: missingSample } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_metadata')
      .is('embedding', null)
      .limit(5);
    
    console.log('\n📋 Sample chunks missing embeddings:');
    missingSample.forEach((chunk, i) => {
      console.log(`   ${i + 1}. ID: ${chunk.id}, Source: ${chunk.chunk_metadata?.source || 'unknown'}`);
    });
  }
  
  // 7. Test vector search function
  console.log('\n\n7️⃣ Testing vector search function...\n');
  
  const { data: functions, error: funcError } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: new Array(1536).fill(0.1), // Dummy embedding
    match_threshold: 0.5,
    match_count: 3
  });
  
  if (funcError) {
    console.error('❌ Vector search function error:', funcError);
    console.log('   This function may not exist or needs to be created');
  } else {
    console.log(`✅ Vector search function works! Found ${functions.length} results`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ SCHEMA INVESTIGATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
}

checkEmbeddingsSchema().catch(console.error);
