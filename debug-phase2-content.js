#!/usr/bin/env node

/**
 * Debug Phase 2 content to see what's actually in the database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugContent() {
  console.log('🔍 DEBUGGING PHASE 2 CAPS CONTENT');
  console.log('=' .repeat(50));
  
  try {
    // Get all CAPS content
    const { data: capsData, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_metadata, chunk_text')
      .eq('chunk_metadata->>curriculum', 'CAPS');
    
    if (error) throw error;
    
    console.log(`📊 Total CAPS chunks: ${capsData.length}`);
    
    // Group by subject and show details
    const subjectGroups = {};
    capsData.forEach(chunk => {
      const subject = chunk.chunk_metadata?.subject || 'Unknown';
      if (!subjectGroups[subject]) {
        subjectGroups[subject] = [];
      }
      subjectGroups[subject].push(chunk);
    });
    
    console.log('\n📋 CAPS Content by Subject:');
    Object.entries(subjectGroups).forEach(([subject, chunks]) => {
      console.log(`\n📄 ${subject}: ${chunks.length} chunks`);
      
      // Show first chunk content preview
      if (chunks.length > 0) {
        const preview = chunks[0].chunk_text.substring(0, 200).replace(/\n/g, ' ');
        console.log(`   Preview: ${preview}...`);
        console.log(`   Metadata: ${JSON.stringify(chunks[0].chunk_metadata, null, 2)}`);
      }
    });
    
    // Test direct search for specific Phase 2 subjects
    console.log('\n🔍 Testing Direct Subject Search:');
    const phase2Subjects = [
      'Agricultural Sciences',
      'Consumer Studies', 
      'Tourism',
      'Hospitality Studies',
      'Marine Sciences',
      'Engineering Graphics Design',
      'Isizulu Home Language',
      'Isixhosa Home Language'
    ];
    
    for (const subject of phase2Subjects) {
      const { data: subjectData, error: subjectError } = await supabase
        .from('knowledge_chunks')
        .select('chunk_text, chunk_metadata')
        .eq('chunk_metadata->>subject', subject);
      
      if (subjectError) {
        console.log(`❌ ${subject}: Error - ${subjectError.message}`);
      } else {
        console.log(`${subjectData.length > 0 ? '✅' : '❌'} ${subject}: ${subjectData.length} chunks`);
        
        if (subjectData.length > 0) {
          const preview = subjectData[0].chunk_text.substring(0, 100);
          console.log(`   Content: ${preview}...`);
        }
      }
    }
    
    // Check if vector search function exists
    console.log('\n🔧 Checking Vector Search Function:');
    try {
      const { data: functions, error: funcError } = await supabase.rpc('match_documents', {
        query_embedding: new Array(1536).fill(0),
        match_threshold: 0.1,
        match_count: 1
      });
      
      if (funcError) {
        console.log(`❌ Vector search function error: ${funcError.message}`);
        console.log('   This function needs to be created in Supabase');
      } else {
        console.log('✅ Vector search function is available');
      }
    } catch (error) {
      console.log(`❌ Vector search function not available: ${error.message}`);
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugContent();