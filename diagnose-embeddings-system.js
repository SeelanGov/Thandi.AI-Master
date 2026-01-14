// diagnose-embeddings-system.js
// Comprehensive embeddings system diagnostic
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 EMBEDDINGS SYSTEM DIAGNOSTIC');
console.log('   Investigating why embeddings are not showing up');
console.log('═══════════════════════════════════════════════════════\n');

async function checkDatabaseFunctions() {
  console.log('📋 STEP 1: Checking Database Functions');
  console.log('─────────────────────────────────────────────────────');
  
  try {
    // Check if search_knowledge_chunks exists
    const { data: searchFunc, error: searchError } = await supabase
      .rpc('search_knowledge_chunks', {
        query_embedding: '[0.1,0.2]', // dummy embedding
        match_threshold: 0.5,
        match_count: 1,
        filter_module_ids: null
      });
    
    if (searchError) {
      console.log('❌ search_knowledge_chunks: NOT FOUND');
      console.log(`   Error: ${searchError.message}`);
    } else {
      console.log('✅ search_knowledge_chunks: EXISTS');
    }
  } catch (error) {
    console.log('❌ search_knowledge_chunks: ERROR');
    console.log(`   ${error.message}`);
  }
  
  try {
    // Check if match_knowledge_chunks exists
    const { data: matchFunc, error: matchError } = await supabase
      .rpc('match_knowledge_chunks', {
        query_embedding: [0.1, 0.2], // dummy embedding
        match_threshold: 0.5,
        match_count: 1
      });
    
    if (matchError) {
      console.log('❌ match_knowledge_chunks: NOT FOUND');
      console.log(`   Error: ${matchError.message}`);
    } else {
      console.log('✅ match_knowledge_chunks: EXISTS');
    }
  } catch (error) {
    console.log('❌ match_knowledge_chunks: ERROR');
    console.log(`   ${error.message}`);
  }
  
  console.log('');
}

async function checkEmbeddingsFormat() {
  console.log('📋 STEP 2: Checking Embeddings Format');
  console.log('─────────────────────────────────────────────────────');
  
  const { data: chunks, error } = await supabase
    .from('knowledge_chunks')
    .select('id, embedding, module_id')
    .not('embedding', 'is', null)
    .limit(5);
  
  if (error) {
    console.log(`❌ Error fetching chunks: ${error.message}`);
    return;
  }
  
  if (!chunks || chunks.length === 0) {
    console.log('❌ No chunks with embeddings found');
    return;
  }
  
  console.log(`✅ Found ${chunks.length} chunks with embeddings`);
  
  // Check first embedding format
  const firstChunk = chunks[0];
  console.log(`\n📊 Sample Embedding Analysis:`);
  console.log(`   Chunk ID: ${firstChunk.id}`);
  console.log(`   Embedding Type: ${typeof firstChunk.embedding}`);
  
  if (typeof firstChunk.embedding === 'string') {
    try {
      const parsed = JSON.parse(firstChunk.embedding);
      console.log(`   ✅ Embedding is valid JSON string`);
      console.log(`   Dimensions: ${parsed.length}`);
      console.log(`   First 5 values: [${parsed.slice(0, 5).join(', ')}]`);
      
      // Check if all values are numbers
      const allNumbers = parsed.every(v => typeof v === 'number');
      if (allNumbers) {
        console.log(`   ✅ All values are numbers`);
      } else {
        console.log(`   ❌ Some values are not numbers`);
      }
    } catch (e) {
      console.log(`   ❌ Embedding is not valid JSON: ${e.message}`);
    }
  } else if (Array.isArray(firstChunk.embedding)) {
    console.log(`   ✅ Embedding is already an array`);
    console.log(`   Dimensions: ${firstChunk.embedding.length}`);
    console.log(`   First 5 values: [${firstChunk.embedding.slice(0, 5).join(', ')}]`);
  } else {
    console.log(`   ❌ Embedding is neither string nor array`);
  }
  
  console.log('');
}

async function checkModuleDistribution() {
  console.log('📋 STEP 3: Module Distribution Analysis');
  console.log('─────────────────────────────────────────────────────');
  
  // Get all modules
  const { data: modules, error: modulesError } = await supabase
    .from('knowledge_modules')
    .select('id, module_name');
  
  if (modulesError) {
    console.log(`❌ Error fetching modules: ${modulesError.message}`);
    return;
  }
  
  console.log(`📚 Total Modules: ${modules.length}\n`);
  
  // Count chunks per module
  for (const module of modules) {
    const { count, error } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', module.id);
    
    if (error) {
      console.log(`   ❌ ${module.module_name}: Error - ${error.message}`);
    } else {
      const status = count === 0 ? '⚠️' : '✅';
      console.log(`   ${status} ${module.module_name}: ${count} chunks`);
    }
  }
  
  console.log('');
}

async function checkKnowledgeBaseFiles() {
  console.log('📋 STEP 4: Knowledge Base Files Check');
  console.log('─────────────────────────────────────────────────────');
  
  const modulesToCheck = [
    { name: 'tvet_colleges', path: 'thandi_knowledge_base/tvet_pathways/tvet_colleges.json' },
    { name: 'nsfas', path: 'thandi_knowledge_base/nsfas_framework/nsfas_application.json' },
    { name: 'study_costs', path: 'thandi_knowledge_base/financial_aid/bursaries.json' },
    { name: 'university_alternatives', path: 'thandi_knowledge_base/private_institutions/institutions.json' },
    { name: 'subject_career_mapping', path: 'thandi_knowledge_base/careers/subject_mapper.json' }
  ];
  
  console.log('🗂️  Checking if content files exist:\n');
  
  for (const module of modulesToCheck) {
    try {
      const fs = await import('fs');
      const exists = fs.existsSync(module.path);
      if (exists) {
        const stats = fs.statSync(module.path);
        console.log(`   ✅ ${module.name}: ${module.path} (${stats.size} bytes)`);
      } else {
        console.log(`   ❌ ${module.name}: ${module.path} NOT FOUND`);
      }
    } catch (error) {
      console.log(`   ❌ ${module.name}: Error checking file - ${error.message}`);
    }
  }
  
  console.log('');
}

async function testVectorSearch() {
  console.log('📋 STEP 5: Testing Vector Search');
  console.log('─────────────────────────────────────────────────────');
  
  // Get a sample embedding
  const { data: sampleChunk, error: sampleError } = await supabase
    .from('knowledge_chunks')
    .select('embedding')
    .not('embedding', 'is', null)
    .limit(1)
    .single();
  
  if (sampleError || !sampleChunk) {
    console.log('❌ Could not get sample embedding for testing');
    return;
  }
  
  try {
    let embedding;
    if (typeof sampleChunk.embedding === 'string') {
      embedding = JSON.parse(sampleChunk.embedding);
    } else {
      embedding = sampleChunk.embedding;
    }
    
    console.log('🧪 Testing with sample embedding...\n');
    
    // Try search_knowledge_chunks
    try {
      const embeddingStr = `[${embedding.join(',')}]`;
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_knowledge_chunks', {
          query_embedding: embeddingStr,
          match_threshold: 0.5,
          match_count: 5,
          filter_module_ids: null
        });
      
      if (searchError) {
        console.log(`❌ search_knowledge_chunks failed: ${searchError.message}`);
      } else {
        console.log(`✅ search_knowledge_chunks: Found ${searchResults?.length || 0} results`);
        if (searchResults && searchResults.length > 0) {
          console.log(`   Top result similarity: ${searchResults[0].similarity?.toFixed(3)}`);
        }
      }
    } catch (error) {
      console.log(`❌ search_knowledge_chunks error: ${error.message}`);
    }
    
    // Try match_knowledge_chunks
    try {
      const { data: matchResults, error: matchError } = await supabase
        .rpc('match_knowledge_chunks', {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 5
        });
      
      if (matchError) {
        console.log(`❌ match_knowledge_chunks failed: ${matchError.message}`);
      } else {
        console.log(`✅ match_knowledge_chunks: Found ${matchResults?.length || 0} results`);
        if (matchResults && matchResults.length > 0) {
          console.log(`   Top result similarity: ${matchResults[0].similarity?.toFixed(3)}`);
        }
      }
    } catch (error) {
      console.log(`❌ match_knowledge_chunks error: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  console.log('');
}

async function checkRAGSystemIntegration() {
  console.log('📋 STEP 6: RAG System Integration Check');
  console.log('─────────────────────────────────────────────────────');
  
  console.log('🔍 Checking which RAG route is active:\n');
  
  const fs = await import('fs');
  const routeFiles = [
    'app/api/rag/query/route.js',
    'app/api/rag/query/route-real-db.js',
    'app/api/rag/query/route-with-cag.js',
    'app/api/rag/query/route-simple.js'
  ];
  
  for (const file of routeFiles) {
    const exists = fs.existsSync(file);
    if (exists) {
      console.log(`   ✅ ${file} EXISTS`);
    } else {
      console.log(`   ❌ ${file} NOT FOUND`);
    }
  }
  
  console.log('');
}

async function generateReport() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  await checkDatabaseFunctions();
  await checkEmbeddingsFormat();
  await checkModuleDistribution();
  await checkKnowledgeBaseFiles();
  await testVectorSearch();
  await checkRAGSystemIntegration();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎯 KEY FINDINGS & RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📌 ISSUES IDENTIFIED:');
  console.log('   1. Vector search function may not exist in database');
  console.log('   2. Several modules have 0 chunks (need embedding generation)');
  console.log('   3. Need to verify which RAG route is actually being used');
  console.log('   4. Need to check if embedding generation scripts were run\n');
  
  console.log('🔧 RECOMMENDED ACTIONS:');
  console.log('   1. Create/verify pgvector search function in Supabase');
  console.log('   2. Run embedding generation for missing modules');
  console.log('   3. Verify RAG API route configuration');
  console.log('   4. Test end-to-end RAG query flow\n');
  
  console.log('═══════════════════════════════════════════════════════');
}

// Run diagnostic
generateReport().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
