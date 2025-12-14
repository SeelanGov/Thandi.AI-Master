#!/usr/bin/env node

/**
 * Check Phase 2 CAPS content in database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('🔍 Checking Phase 2 CAPS in Database');
  console.log('=' .repeat(40));
  
  try {
    // Check all CAPS content
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_metadata, chunk_text')
      .eq('chunk_metadata->>curriculum', 'CAPS');
    
    if (error) throw error;
    
    console.log(`📊 Total CAPS chunks: ${data.length}`);
    
    // Group by subject
    const subjectCounts = {};
    data.forEach(chunk => {
      const subject = chunk.chunk_metadata?.subject || 'Unknown';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    console.log('\n📋 CAPS Subjects in Database:');
    Object.entries(subjectCounts).forEach(([subject, count]) => {
      console.log(`   ${subject}: ${count} chunks`);
    });
    
    // Check for Phase 2 specifically
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
    
    console.log('\n🎯 Phase 2 Subject Status:');
    phase2Subjects.forEach(subject => {
      const count = subjectCounts[subject] || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${subject}: ${count} chunks`);
    });
    
    // Show sample content from Phase 2
    const phase2Content = data.filter(chunk => 
      phase2Subjects.includes(chunk.chunk_metadata?.subject)
    );
    
    if (phase2Content.length > 0) {
      console.log('\n📄 Sample Phase 2 Content:');
      phase2Content.slice(0, 3).forEach(chunk => {
        console.log(`   📋 ${chunk.chunk_metadata.subject}:`);
        console.log(`      ${chunk.chunk_text.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();