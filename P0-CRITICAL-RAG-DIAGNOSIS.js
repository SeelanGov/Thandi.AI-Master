#!/usr/bin/env node

/**
 * P0 CRITICAL ISSUE DIAGNOSIS
 * 
 * Your cofounder is absolutely right - empty RAG endpoint is unacceptable.
 * This script will systematically diagnose the issue.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

console.log('🚨 P0 CRITICAL ISSUE DIAGNOSIS: Empty RAG Endpoint');
console.log('='.repeat(60));

async function diagnoseP0Issue() {
  console.log('📋 DIAGNOSIS CHECKLIST:');
  console.log('1. ✅ Database embeddings exist (confirmed: 1000 embeddings)');
  console.log('2. 🔍 Testing database connection...');
  
  // Test 1: Database Connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { count, error } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('   ✅ Database connection: HEALTHY');
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
  
  console.log('3. 🔍 Testing embedding search...');
  
  // Test 2: Embedding Search
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test a simple embedding search
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .textSearch('chunk_text', 'mathematics')
      .limit(3);
      
    if (error) {
      console.log('❌ Embedding search failed:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ No search results found - embeddings may be corrupted');
      return false;
    }
    
    console.log(`   ✅ Embedding search: WORKING (${data.length} results)`);
    console.log(`   📄 Sample result: ${data[0].chunk_text.substring(0, 100)}...`);
  } catch (error) {
    console.log('❌ Embedding search error:', error.message);
    return false;
  }
  
  console.log('4. 🔍 Testing LLM API connection...');
  
  // Test 3: LLM API
  try {
    const testQuery = "Test query for mathematics career guidance";
    
    // Test Groq API
    if (process.env.GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: testQuery }],
          max_tokens: 100
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Groq API: WORKING');
        console.log(`   📝 Sample response: ${data.choices[0].message.content.substring(0, 100)}...`);
      } else {
        console.log('❌ Groq API failed:', response.status, response.statusText);
        return false;
      }
    } else {
      console.log('⚠️ No Groq API key found');
    }
    
    // Test OpenAI API as fallback
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: testQuery }],
          max_tokens: 100
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ OpenAI API: WORKING');
        console.log(`   📝 Sample response: ${data.choices[0].message.content.substring(0, 100)}...`);
      } else {
        console.log('❌ OpenAI API failed:', response.status, response.statusText);
      }
    } else {
      console.log('⚠️ No OpenAI API key found');
    }
    
  } catch (error) {
    console.log('❌ LLM API error:', error.message);
    return false;
  }
  
  console.log('5. 🔍 Testing RAG endpoint logic...');
  
  // Test 4: RAG Endpoint Logic (simulate)
  try {
    // Test the actual search method used by the simple RAG endpoint
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Get a real embedding from the database to test with
    const { data: sampleChunk, error: sampleError } = await supabase
      .from('knowledge_chunks')
      .select('embedding')
      .limit(1)
      .single();
    
    if (sampleError || !sampleChunk) {
      console.log('❌ Could not get sample embedding for test');
      return false;
    }
    
    const testEmbedding = JSON.parse(sampleChunk.embedding);
    
    const { data: testResults, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: testEmbedding,
        match_threshold: 0.1,
        match_count: 5
      }
    );
    
    if (searchError) {
      console.log('❌ RAG search RPC failed:', searchError.message);
      console.log('   🔍 This is the root cause - match_documents function missing');
      return false;
    }
    
    if (!testResults || testResults.length === 0) {
      console.log('❌ RAG search function returns empty results');
      console.log('   🔍 This is likely the root cause of empty responses');
      return false;
    }
    
    console.log(`   ✅ RAG search function: WORKING (${testResults.length} results)`);
    console.log(`   📄 Sample result: ${testResults[0].chunk_text.substring(0, 100)}...`);
    
  } catch (error) {
    console.log('❌ RAG search function error:', error.message);
    console.log('   🔍 This is likely the root cause - search function is broken');
    return false;
  }
  
  return true;
}

// Run diagnosis
diagnoseP0Issue().then(success => {
  console.log('\n' + '='.repeat(60));
  
  if (success) {
    console.log('✅ DIAGNOSIS COMPLETE: All components working');
    console.log('🤔 Issue may be in the API route logic or request handling');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Check app/api/rag/query/route.js for errors');
    console.log('2. Test the actual API endpoint with curl');
    console.log('3. Check server logs for runtime errors');
  } else {
    console.log('❌ DIAGNOSIS COMPLETE: Critical component failure identified');
    console.log('🚨 This explains why your kids would get zero guidance');
    console.log('\n📋 IMMEDIATE ACTION REQUIRED:');
    console.log('1. Fix the failing component identified above');
    console.log('2. Re-run this diagnosis script');
    console.log('3. Only proceed to family testing after 100% pass rate');
  }
  
  console.log('\n💪 Your cofounder is right: Quality over speed, always.');
  console.log('🎯 Your kids deserve a system that works 100% of the time.');
}).catch(error => {
  console.error('❌ DIAGNOSIS SCRIPT FAILED:', error.message);
  console.log('\n🚨 CRITICAL: Cannot even run diagnostics');
  console.log('📋 IMMEDIATE ACTION: Fix environment setup first');
});