#!/usr/bin/env node

/**
 * Apply RPC Function Fix for CAPS Content
 * 
 * This script applies the fix to the search_knowledge_chunks RPC function
 * to properly handle CAPS content with NULL module_id.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRPCFix() {
  console.log('🔧 APPLYING RPC FUNCTION FIX FOR CAPS CONTENT');
  console.log('=' .repeat(50));
  
  try {
    // Read the SQL fix
    const sqlFix = fs.readFileSync('fix-rpc-function.sql', 'utf8');
    console.log('📄 Read SQL fix from file');
    
    // Extract just the function definition (remove comments and test queries)
    const functionDefinition = sqlFix.split('-- Test the fixed function')[0].trim();
    
    console.log('🔧 Applying RPC function fix...');
    
    // Apply the fix using rpc call to execute SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: functionDefinition
    });
    
    if (error) {
      // If exec RPC doesn't exist, try direct SQL execution
      console.log('⚠️ Direct RPC exec failed, trying alternative method...');
      
      // Alternative: Use a simple query to test if we can execute SQL
      // Note: This might not work depending on Supabase permissions
      console.log('❌ Cannot directly execute SQL from client');
      console.log('📋 Please execute the following SQL in your Supabase SQL editor:');
      console.log('\n' + '='.repeat(60));
      console.log(functionDefinition);
      console.log('='.repeat(60));
      
      return false;
    }
    
    console.log('✅ RPC function fix applied successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error applying RPC fix:', error.message);
    
    // Provide manual instructions
    console.log('\n📋 MANUAL FIX REQUIRED:');
    console.log('Please execute the SQL in fix-rpc-function.sql in your Supabase SQL editor');
    console.log('This will fix the search_knowledge_chunks function to handle CAPS content');
    
    return false;
  }
}

async function testRPCFix() {
  console.log('\n🧪 TESTING RPC FIX');
  console.log('=' .repeat(30));
  
  try {
    // Generate a test embedding
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: 'agricultural sciences farming crops livestock',
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const testEmbedding = data.data[0].embedding;
    
    console.log('✅ Generated test embedding');
    
    // Test the fixed RPC function
    const embeddingStr = `[${testEmbedding.join(',')}]`;
    
    const { data: results, error } = await supabase.rpc(
      'search_knowledge_chunks',
      {
        query_embedding: embeddingStr,
        match_threshold: 0.3,
        match_count: 20,
        filter_module_ids: null
      }
    );
    
    if (error) {
      console.log('❌ RPC test failed:', error.message);
      return false;
    }
    
    console.log(`✅ RPC returned ${results.length} results`);
    
    // Check for CAPS content
    const capsResults = results.filter(r => 
      r.source_entity_type === 'caps_subject'
    );
    
    console.log(`🎯 CAPS results: ${capsResults.length}`);
    
    if (capsResults.length > 0) {
      console.log('✅ CAPS content is now accessible!');
      console.log('📋 CAPS Results:');
      capsResults.forEach((result, index) => {
        const subject = result.metadata?.subject || 'Unknown';
        const similarity = result.similarity?.toFixed(3) || 'N/A';
        console.log(`   ${index + 1}. ${subject} - ${similarity}`);
      });
      return true;
    } else {
      console.log('❌ CAPS content still not accessible');
      return false;
    }
    
  } catch (error) {
    console.error('❌ RPC test error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 RPC FUNCTION FIX FOR PHASE 2 CAPS');
  console.log('Fixing search_knowledge_chunks to handle NULL module_id');
  console.log('=' .repeat(60));
  
  // Check environment
  if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  // Apply the fix
  const fixApplied = await applyRPCFix();
  
  if (!fixApplied) {
    console.log('\n⚠️ RPC fix could not be applied automatically');
    console.log('Please apply the fix manually using the Supabase SQL editor');
    console.log('Then run: node test-phase2-rag-fixed.js');
    process.exit(1);
  }
  
  // Test the fix
  const testPassed = await testRPCFix();
  
  if (testPassed) {
    console.log('\n🎉 RPC FIX SUCCESSFUL!');
    console.log('✅ Phase 2 CAPS content is now accessible through RAG search');
    console.log('🚀 You can now run: node test-phase2-rag-fixed.js');
  } else {
    console.log('\n❌ RPC fix test failed');
    console.log('Please check the Supabase logs and try again');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});