#!/usr/bin/env node

/**
 * Debug CAPS Search Issues
 * 
 * This script debugs why the search_knowledge_chunks RPC function
 * is not returning CAPS content.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate embedding for testing
 */
async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function debugCAPSSearch() {
  console.log('🔍 DEBUGGING CAPS SEARCH ISSUES');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Check if CAPS chunks have embeddings
    console.log('\n📊 Step 1: Check CAPS Embeddings');
    const { data: capsChunks, error: capsError } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_text, embedding, chunk_metadata, source_entity_type')
      .eq('source_entity_type', 'caps_subject')
      .limit(5);
    
    if (capsError) {
      console.log('❌ Error fetching CAPS chunks:', capsError.message);
      return;
    }
    
    console.log(`✅ Found ${capsChunks.length} CAPS chunks`);
    
    for (const chunk of capsChunks) {
      const hasEmbedding = chunk.embedding && chunk.embedding.length > 0;
      const subject = chunk.chunk_metadata?.subject || 'Unknown';
      console.log(`   📋 ${subject}: ${hasEmbedding ? '✅ Has embedding' : '❌ No embedding'}`);
      
      if (hasEmbedding) {
        try {
          const embedding = JSON.parse(chunk.embedding);
          console.log(`      Embedding length: ${embedding.length}`);
        } catch (e) {
          console.log(`      ❌ Invalid embedding format`);
        }
      }
    }
    
    // Step 2: Test RPC function directly
    console.log('\n🔧 Step 2: Test RPC Function');
    
    // Generate a test embedding
    const testQuery = 'agricultural sciences farming crops';
    console.log(`   Query: "${testQuery}"`);
    
    const testEmbedding = await generateEmbedding(testQuery);
    console.log(`   ✅ Generated embedding: ${testEmbedding.length} dimensions`);
    
    // Test RPC with very low threshold
    const embeddingStr = `[${testEmbedding.join(',')}]`;
    
    const { data: rpcResults, error: rpcError } = await supabase.rpc(
      'search_knowledge_chunks',
      {
        query_embedding: embeddingStr,
        match_threshold: 0.1, // Very low threshold
        match_count: 50,
        filter_module_ids: null
      }
    );
    
    if (rpcError) {
      console.log('❌ RPC Error:', rpcError.message);
    } else {
      console.log(`   ✅ RPC returned ${rpcResults.length} results`);
      
      // Check if any are CAPS
      const capsResults = rpcResults.filter(r => 
        r.source_entity_type === 'caps_subject'
      );
      
      console.log(`   🎯 CAPS results: ${capsResults.length}`);
      
      if (capsResults.length > 0) {
        console.log('   📋 CAPS Results:');
        capsResults.forEach((result, index) => {
          const subject = result.metadata?.subject || 'Unknown';
          console.log(`     ${index + 1}. ${subject} - Similarity: ${result.similarity?.toFixed(3)}`);
        });
      }
      
      // Show top 5 results regardless of type
      console.log('   📋 Top 5 Results (any type):');
      rpcResults.slice(0, 5).forEach((result, index) => {
        const type = result.source_entity_type || 'unknown';
        const similarity = result.similarity?.toFixed(3) || 'N/A';
        console.log(`     ${index + 1}. ${type} - ${similarity}`);
      });
    }
    
    // Step 3: Check if RPC function exists and works
    console.log('\n🔧 Step 3: Check RPC Function Definition');
    
    const { data: functions, error: funcError } = await supabase.rpc('search_knowledge_chunks', {
      query_embedding: embeddingStr,
      match_threshold: 0.5,
      match_count: 1,
      filter_module_ids: null
    });
    
    if (funcError) {
      console.log('❌ RPC Function Error:', funcError.message);
      console.log('   This might indicate the RPC function is not properly defined');
    } else {
      console.log('✅ RPC Function is working');
    }
    
    // Step 4: Try direct similarity search without RPC
    console.log('\n🔧 Step 4: Direct Similarity Search (without RPC)');
    
    // Get a CAPS embedding to compare against
    if (capsChunks.length > 0 && capsChunks[0].embedding) {
      try {
        const capsEmbedding = JSON.parse(capsChunks[0].embedding);
        
        // Calculate cosine similarity manually (simplified)
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < Math.min(testEmbedding.length, capsEmbedding.length); i++) {
          dotProduct += testEmbedding[i] * capsEmbedding[i];
          normA += testEmbedding[i] * testEmbedding[i];
          normB += capsEmbedding[i] * capsEmbedding[i];
        }
        
        const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        console.log(`   📊 Manual similarity calculation: ${similarity.toFixed(4)}`);
        
        if (similarity > 0.1) {
          console.log('   ✅ CAPS content should be findable with low threshold');
        } else {
          console.log('   ⚠️ Low similarity - might need very low threshold');
        }
        
      } catch (e) {
        console.log('   ❌ Error calculating manual similarity:', e.message);
      }
    }
    
    // Step 5: Check database schema
    console.log('\n🔧 Step 5: Check Database Schema');
    
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('knowledge_chunks')
      .select('id, source_entity_type, module_id')
      .eq('source_entity_type', 'caps_subject')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema check error:', schemaError.message);
    } else if (schemaInfo.length > 0) {
      console.log('✅ CAPS chunks exist in knowledge_chunks table');
      console.log(`   Sample: ID=${schemaInfo[0].id}, module_id=${schemaInfo[0].module_id}`);
      
      if (schemaInfo[0].module_id === null) {
        console.log('   ⚠️ CAPS chunks have NULL module_id - this might be the issue!');
      }
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugCAPSSearch().then(() => {
  console.log('\n🏁 Debug complete');
}).catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});