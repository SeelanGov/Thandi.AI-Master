import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking database content...\n');
  
  // Check for electrician chunks specifically
  console.log('🔍 Checking Electrician chunks...');
  const { data: elecChunks, error: elecError } = await supabase
    .from('knowledge_chunks')
    .select('id, module_id, chunk_text')
    .ilike('chunk_text', '%electrician%')
    .limit(3);
  
  if (elecChunks && elecChunks.length > 0) {
    console.log(`Found ${elecChunks.length} electrician chunks:`);
    elecChunks.forEach(c => {
      console.log(`  Module ID: ${c.module_id}`);
      console.log(`  Preview: ${c.chunk_text.substring(0, 100)}...\n`);
    });
  } else {
    console.log('❌ No electrician chunks found');
  }
  
  // Get module counts
  const { data: chunks, error: chunkError } = await supabase
    .from('knowledge_chunks')
    .select('id, module_id, chunk_metadata');
  
  if (chunkError) {
    console.error('Error:', chunkError);
    return;
  }
  
  // Get module names
  const { data: moduleList, error: moduleError } = await supabase
    .from('knowledge_modules')
    .select('id, module_name');
  
  if (moduleError) {
    console.error('Error:', moduleError);
    return;
  }
  
  const moduleMap = {};
  moduleList.forEach(m => {
    moduleMap[m.id] = m.module_name;
  });
  
  // Count by module
  const moduleCounts = {};
  chunks.forEach(c => {
    const moduleName = moduleMap[c.module_id] || 'unknown';
    moduleCounts[moduleName] = (moduleCounts[moduleName] || 0) + 1;
  });
  
  console.log('📊 Chunks by Module:');
  Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([module, count]) => {
      console.log(`  ${module}: ${count} chunks`);
    });
  
  console.log(`\nTotal: ${chunks.length} chunks`);
  
  // Check for specific careers
  console.log('\n🔍 Searching for specific careers...');
  const careers = ['Electrician', 'Chef', 'UX/UI Designer', 'Software Engineer', 'Data Scientist'];
  
  for (const career of careers) {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_id, module_name, chunk_text')
      .ilike('chunk_text', `%${career}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      console.log(`  ✅ ${career}: Found in module "${data[0].module_name}"`);
    } else {
      console.log(`  ❌ ${career}: NOT FOUND`);
    }
  }
}

checkDatabase().catch(console.error);
