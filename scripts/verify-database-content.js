// scripts/verify-database-content.js
// UNFAKEABLE DATABASE VERIFICATION

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDatabaseContent() {
  console.log('🔍 DATABASE REALITY CHECK\n');
  console.log('='.repeat(60));
  
  // Test 1: Does electrician content exist?
  console.log('\n📋 TEST 1: Electrician Content Verification');
  const { data: electricianChunks, error: e1 } = await supabase
    .from('knowledge_chunks')
    .select('id, chunk_metadata, chunk_text')
    .ilike('chunk_metadata->>career_name', 'Electrician')
    .order('id');
  
  if (e1) {
    console.error('❌ Error:', e1.message);
  } else {
    console.log(`Found: ${electricianChunks.length} electrician chunks`);
    electricianChunks.forEach((chunk, i) => {
      console.log(`  ${i+1}. ${chunk.chunk_metadata?.chunk_type || 'N/A'} - ${chunk.chunk_text.substring(0, 60)}...`);
    });
  }
  
  // Test 2: Does "no university" language exist?
  console.log('\n📋 TEST 2: No-University Content Verification');
  const { data: noUniChunks, error: e2 } = await supabase
    .from('knowledge_chunks')
    .select('chunk_metadata, chunk_text')
    .or('chunk_text.ilike.%apprenticeship%,chunk_text.ilike.%bootcamp%,chunk_text.ilike.%no matric%,chunk_text.ilike.%without degree%')
    .limit(10);
  
  if (e2) {
    console.error('❌ Error:', e2.message);
  } else {
    console.log(`Found: ${noUniChunks.length} chunks with no-university language`);
    const careers = new Set(noUniChunks.map(c => c.chunk_metadata?.career_name).filter(Boolean));
    console.log(`  Careers: ${Array.from(careers).join(', ')}`);
  }
  
  // Test 3: Check embedding quality
  console.log('\n📋 TEST 3: Embedding Quality Check');
  const { data: embeddingChunks, error: e3 } = await supabase
    .from('knowledge_chunks')
    .select('id, chunk_metadata, embedding')
    .not('chunk_metadata->>career_name', 'is', null)
    .limit(5);
  
  if (e3) {
    console.error('❌ Error:', e3.message);
  } else {
    console.log(`Checked: ${embeddingChunks.length} chunks with embeddings`);
    embeddingChunks.forEach((chunk, i) => {
      const embedding = chunk.embedding ? JSON.parse(chunk.embedding) : null;
      const dim = embedding ? embedding.length : 0;
      console.log(`  ${i+1}. ${chunk.chunk_metadata?.career_name || 'N/A'} - Embedding dim: ${dim}`);
    });
  }
  
  // Test 4: Total career chunks count
  console.log('\n📋 TEST 4: Total Career Chunks Count');
  const { data: allCareerChunks, error: e4 } = await supabase
    .from('knowledge_chunks')
    .select('chunk_metadata', { count: 'exact', head: true })
    .not('chunk_metadata->>career_name', 'is', null);
  
  if (e4) {
    console.error('❌ Error:', e4.message);
  } else {
    console.log(`Total career chunks in database: ${allCareerChunks?.length || 0}`);
  }
  
  // Test 5: Career diversity check
  console.log('\n📋 TEST 5: Career Diversity Check');
  const { data: allChunks, error: e5 } = await supabase
    .from('knowledge_chunks')
    .select('chunk_metadata')
    .not('chunk_metadata->>career_name', 'is', null);
  
  if (e5) {
    console.error('❌ Error:', e5.message);
  } else {
    const careerCounts = {};
    allChunks.forEach(chunk => {
      const career = chunk.chunk_metadata?.career_name;
      if (career) {
        careerCounts[career] = (careerCounts[career] || 0) + 1;
      }
    });
    
    console.log(`Unique careers: ${Object.keys(careerCounts).length}`);
    console.log('\nTop 10 careers by chunk count:');
    Object.entries(careerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([career, count], i) => {
        console.log(`  ${i+1}. ${career}: ${count} chunks`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE VERIFICATION COMPLETE\n');
}

verifyDatabaseContent().catch(console.error);
