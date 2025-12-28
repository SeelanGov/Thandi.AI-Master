import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('🔧 UNIVERSITY SEARCH OPTIMIZATION');
console.log('   Mission: Optimize search for specific university queries');
console.log('═══════════════════════════════════════════════════════\n');

// Get all university chunks to see what we're working with
console.log('📊 ANALYZING CURRENT UNIVERSITY CHUNKS\n');

const { data: allUniversityChunks } = await supabase
  .from('knowledge_chunks')
  .select('chunk_text, chunk_metadata')
  .eq('source_entity_type', 'university_program_2026')
  .order('created_at', { ascending: false });

console.log(`Found ${allUniversityChunks.length} university chunks`);

// Group by university name from metadata
const universitiesByName = {};
allUniversityChunks.forEach(chunk => {
  const uniName = chunk.chunk_metadata?.university;
  if (uniName) {
    if (!universitiesByName[uniName]) {
      universitiesByName[uniName] = [];
    }
    universitiesByName[uniName].push(chunk);
  }
});

console.log('\n🏛️ UNIVERSITIES IN DATABASE:');
Object.keys(universitiesByName).sort().forEach(uniName => {
  console.log(`   ${uniName}: ${universitiesByName[uniName].length} chunks`);
});

// Test the problematic queries with optimized search
console.log('\n🧪 OPTIMIZED SEARCH TESTS\n');

const problematicQueries = [
  { query: "UNISA BCom APS requirements 2026", expectedUni: "UNISA" },
  { query: "TUT engineering APS requirements", expectedUni: "TUT" },
  { query: "cheapest university BCom options", expectedUni: "any" },
  { query: "distance learning university options", expectedUni: "UNISA" }
];

for (const test of problematicQueries) {
  console.log(`🔍 Testing: ${test.query}`);
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: test.query
    });
    
    // Search with lower threshold and more results
    const { data: results } = await supabase.rpc('search_knowledge_chunks', {
      query_embedding: `[${response.data[0].embedding.join(',')}]`,
      match_threshold: 0.2,
      match_count: 10
    });
    
    if (results?.length > 0) {
      // Filter for university results and sort by relevance
      const universityResults = results.filter(r => 
        r.source_entity_type === 'university_program_2026' ||
        r.chunk_metadata?.university ||
        r.chunk_text.toLowerCase().includes('university') ||
        r.chunk_text.toLowerCase().includes('aps')
      );
      
      if (universityResults.length > 0) {
        const topResult = universityResults[0];
        const university = topResult.chunk_metadata?.university || 'Unknown';
        console.log(`   ✅ FOUND (${topResult.similarity?.toFixed(3)}) - ${university}`);
        console.log(`      Content: ${topResult.chunk_text.substring(0, 150)}...`);
        
        // Check if we found the expected university
        if (test.expectedUni !== 'any' && university.includes(test.expectedUni)) {
          console.log(`      🎯 EXACT MATCH: Found expected university ${test.expectedUni}`);
        }
      } else {
        console.log(`   ⚠️ PARTIAL: Found ${results.length} results, but none university-specific`);
        console.log(`      Top result: ${results[0].chunk_text.substring(0, 100)}...`);
      }
    } else {
      console.log(`   ❌ NO RESULTS: No matches found`);
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
}

// Create enhanced chunks for better searchability
console.log('\n🚀 CREATING ENHANCED SEARCH CHUNKS\n');

const enhancedChunks = [];

// Create specific query-optimized chunks for key universities
const keyUniversities = ['UNISA', 'TUT', 'UCT', 'Wits', 'CPUT'];

for (const uniName of keyUniversities) {
  if (universitiesByName[uniName]) {
    const uniChunks = universitiesByName[uniName];
    const originalContent = uniChunks[0].chunk_text;
    
    // Extract key information
    const apsMatches = originalContent.match(/APS (\d+)/g) || [];
    const programMatches = originalContent.match(/(Engineering|BCom|Medicine|Law|BSc): ([^.]+)/g) || [];
    
    // Create enhanced searchable content
    const enhancedContent = `${uniName} University 2026 Requirements:

${originalContent}

Quick Reference:
- University: ${uniName}
- Programs: ${programMatches.join(', ')}
- APS Requirements: ${apsMatches.join(', ')}
- Search Terms: ${uniName} university, ${uniName} APS, ${uniName} requirements, ${uniName} programs 2026`;

    enhancedChunks.push({
      university: uniName,
      content: enhancedContent,
      metadata: uniChunks[0].chunk_metadata
    });
  }
}

// Ingest enhanced chunks
let enhancedInserted = 0;

for (const enhanced of enhancedChunks) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: enhanced.content
    });
    
    const { error } = await supabase.from('knowledge_chunks').insert({
      module_id: enhanced.metadata.module_id || null,
      source_entity_id: null,
      source_entity_type: 'university_enhanced_2026',
      chunk_text: enhanced.content,
      chunk_metadata: {
        ...enhanced.metadata,
        enhanced: true,
        search_optimized: true,
        university: enhanced.university
      },
      embedding: JSON.stringify(response.data[0].embedding)
    });
    
    if (error) {
      console.log(`❌ ${enhanced.university}: ${error.message}`);
    } else {
      console.log(`✅ ${enhanced.university}: Enhanced chunk created`);
      enhancedInserted++;
    }
    
  } catch (error) {
    console.log(`❌ ${enhanced.university}: ${error.message}`);
  }
}

console.log(`\n📊 Enhanced chunks created: ${enhancedInserted}/${enhancedChunks.length}`);

// Test again with enhanced chunks
console.log('\n🧪 TESTING WITH ENHANCED CHUNKS\n');

for (const test of problematicQueries) {
  console.log(`🔍 Re-testing: ${test.query}`);
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: test.query
    });
    
    const { data: results } = await supabase.rpc('search_knowledge_chunks', {
      query_embedding: `[${response.data[0].embedding.join(',')}]`,
      match_threshold: 0.3,
      match_count: 5
    });
    
    if (results?.length > 0) {
      const universityResults = results.filter(r => 
        r.source_entity_type?.includes('university') ||
        r.chunk_metadata?.university
      );
      
      if (universityResults.length > 0) {
        const topResult = universityResults[0];
        const university = topResult.chunk_metadata?.university || 'Unknown';
        console.log(`   ✅ IMPROVED (${topResult.similarity?.toFixed(3)}) - ${university}`);
        console.log(`      Enhanced: ${topResult.chunk_metadata?.enhanced ? 'YES' : 'NO'}`);
      } else {
        console.log(`   ⚠️ Still partial results`);
      }
    } else {
      console.log(`   ❌ Still no results`);
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('🎯 OPTIMIZATION COMPLETE');
console.log(`   Enhanced chunks created: ${enhancedInserted}`);
console.log('   University search should now be more accurate');
console.log('═══════════════════════════════════════════════════════');