import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('🔍 DEEP DIVE CURRICULUM ANALYSIS - ROOT CAUSE INVESTIGATION');
console.log('   Goal: Identify exactly why queries fail and fix systematically');
console.log('═══════════════════════════════════════════════════════\n');

// FAILING QUERIES - Let's analyze each one in detail
const FAILING_QUERIES = [
  {
    query: "Can I do medicine with CAPS curriculum?",
    expected_keywords: ["medicine", "caps", "mathematics", "physical sciences", "life sciences"],
    current_issue: "Returns generic AI content instead of curriculum-specific"
  },
  {
    query: "Can I switch from Math Lit to Mathematics in CAPS?",
    expected_keywords: ["math lit", "mathematics", "switch", "caps", "grade 10"],
    current_issue: "Returns generic subject info instead of switching rules"
  }
];

console.log('🧪 ANALYZING FAILING QUERIES IN DETAIL\n');

for (const failingQuery of FAILING_QUERIES) {
  console.log(`🔍 DEEP ANALYSIS: ${failingQuery.query}`);
  console.log(`   Expected: ${failingQuery.expected_keywords.join(', ')}`);
  console.log(`   Issue: ${failingQuery.current_issue}\n`);
  
  // Generate embedding and search
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: failingQuery.query
  });
  
  const { data: results } = await supabase.rpc('search_knowledge_chunks', {
    query_embedding: `[${response.data[0].embedding.join(',')}]`,
    match_threshold: 0.1, // Lower threshold to see more results
    match_count: 5
  });
  
  console.log(`   📊 Found ${results?.length || 0} results:`);
  
  if (results?.length > 0) {
    results.forEach((result, index) => {
      const hasExpectedKeywords = failingQuery.expected_keywords.some(keyword =>
        result.chunk_text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      console.log(`   ${index + 1}. ${hasExpectedKeywords ? '✅' : '❌'} (${result.similarity?.toFixed(3)}): ${result.chunk_text.substring(0, 100)}...`);
      console.log(`      Source: ${result.source_entity_type || 'unknown'}`);
      console.log(`      Metadata: ${JSON.stringify(result.chunk_metadata || {})}`);
      console.log('');
    });
  }
  
  console.log('─────────────────────────────────────────────────────\n');
}

// ANALYZE CURRENT KNOWLEDGE BASE CONTENT
console.log('📚 ANALYZING CURRENT KNOWLEDGE BASE CONTENT\n');

// Check what curriculum-related content we have
const { data: curriculumChunks } = await supabase
  .from('knowledge_chunks')
  .select('chunk_text, chunk_metadata, source_entity_type')
  .or('chunk_text.ilike.%caps%,chunk_text.ilike.%ieb%,chunk_text.ilike.%curriculum%')
  .limit(10);

console.log(`Found ${curriculumChunks?.length || 0} curriculum-related chunks:`);
curriculumChunks?.forEach((chunk, index) => {
  console.log(`${index + 1}. ${chunk.source_entity_type}: ${chunk.chunk_text.substring(0, 80)}...`);
});

console.log('\n📊 KNOWLEDGE BASE STATISTICS\n');

// Get total chunks by source type
const { data: chunkStats } = await supabase
  .from('knowledge_chunks')
  .select('source_entity_type')
  .not('source_entity_type', 'is', null);

const sourceTypes = {};
chunkStats?.forEach(chunk => {
  sourceTypes[chunk.source_entity_type] = (sourceTypes[chunk.source_entity_type] || 0) + 1;
});

console.log('Chunks by source type:');
Object.entries(sourceTypes).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} chunks`);
});

console.log('\n🎯 ROOT CAUSE ANALYSIS COMPLETE');
console.log('═══════════════════════════════════════════════════════');