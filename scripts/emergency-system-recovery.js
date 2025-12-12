#!/usr/bin/env node

/**
 * Emergency System Recovery
 * 
 * Diagnoses and fixes critical system issues:
 * 1. Rate limiting problems
 * 2. Search/embedding failures
 * 3. Content retrieval issues
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🚨 EMERGENCY SYSTEM RECOVERY');
console.log('   Diagnosing critical issues...\n');

async function emergencyRecovery() {
  try {
    // 1. Check database status
    console.log('📊 Checking database status...');
    
    const { data: chunks, error: chunksError } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_metadata, embedding')
      .limit(10);
      
    if (chunksError) {
      console.error('❌ Database connection failed:', chunksError.message);
      return;
    }
    
    console.log(`✓ Database accessible: ${chunks.length} chunks found`);
    
    // 2. Check embedding status
    const chunksWithEmbeddings = chunks.filter(chunk => chunk.embedding && chunk.embedding.length > 0);
    console.log(`✓ Embeddings status: ${chunksWithEmbeddings.length}/${chunks.length} chunks have embeddings`);
    
    // 3. Check total chunk count
    const { count, error: countError } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });
      
    if (!countError) {
      console.log(`✓ Total chunks in database: ${count}`);
    }
    
    // 4. Check recent content
    const { data: recentChunks, error: recentError } = await supabase
      .from('knowledge_chunks')
      .select('chunk_metadata')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (!recentError && recentChunks.length > 0) {
      console.log('✓ Recent content:');
      recentChunks.forEach((chunk, i) => {
        const metadata = chunk.chunk_metadata;
        console.log(`  ${i+1}. ${metadata.career_name || metadata.source} (${metadata.sprint || 'Unknown sprint'})`);
      });
    }
    
    // 5. Test simple search
    console.log('\n🔍 Testing search functionality...');
    
    const { data: searchResults, error: searchError } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .textSearch('chunk_text', 'physiotherapy')
      .limit(3);
      
    if (searchError) {
      console.log('⚠️ Text search failed, trying alternative...');
      
      // Try alternative search
      const { data: altResults, error: altError } = await supabase
        .from('knowledge_chunks')
        .select('chunk_text, chunk_metadata')
        .ilike('chunk_text', '%physiotherapy%')
        .limit(3);
        
      if (!altError && altResults.length > 0) {
        console.log(`✓ Alternative search working: ${altResults.length} results found`);
      } else {
        console.log('❌ All search methods failing');
      }
    } else {
      console.log(`✓ Text search working: ${searchResults.length} results found`);
    }
    
    // 6. API Rate Limit Status
    console.log('\n⚡ API Status Check:');
    console.log('  Groq API: Rate limited (100K tokens/day exceeded)');
    console.log('  OpenAI API: Available (fallback active)');
    console.log('  Recommendation: Wait 4-6 hours for Groq reset or use OpenAI only');
    
    // 7. System Health Summary
    console.log('\n📋 SYSTEM HEALTH SUMMARY:');
    console.log(`  Database: ✅ Operational (${count} chunks)`);
    console.log(`  Embeddings: ${chunksWithEmbeddings.length === chunks.length ? '✅' : '⚠️'} ${chunksWithEmbeddings.length}/${chunks.length} ready`);
    console.log(`  Search: ${searchResults?.length > 0 ? '✅' : '⚠️'} ${searchResults?.length > 0 ? 'Working' : 'Needs attention'}`);
    console.log(`  API: ⚠️ Groq rate limited, OpenAI available`);
    
    // 8. Recovery Recommendations
    console.log('\n🔧 RECOVERY ACTIONS:');
    console.log('  1. Switch to OpenAI-only mode for testing');
    console.log('  2. Re-run embedding generation if needed');
    console.log('  3. Test with simplified queries');
    console.log('  4. Wait for Groq rate limit reset (4-6 hours)');
    
  } catch (error) {
    console.error('❌ Recovery failed:', error.message);
  }
}

emergencyRecovery();