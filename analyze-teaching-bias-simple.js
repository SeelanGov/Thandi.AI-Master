#!/usr/bin/env node

/**
 * Simple analysis of why teaching might appear first
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function analyzeTeachingBias() {
  console.log('🔍 ANALYZING TEACHING BIAS IN RAG SYSTEM');
  console.log('='.repeat(50));
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // 1. Check knowledge base content
  console.log('1. 📚 Knowledge Base Content Analysis');
  try {
    const { data: allChunks, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .limit(500);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Analyzing ${allChunks.length} chunks...`);
    
    // Count career type mentions
    let teachingCount = 0;
    let engineeringCount = 0;
    let businessCount = 0;
    let healthcareCount = 0;
    
    allChunks.forEach(chunk => {
      const text = chunk.chunk_text.toLowerCase();
      
      if (/teach|education|instructor|professor|educator/gi.test(text)) {
        teachingCount++;
      }
      if (/engineer|software|programming|technology|developer/gi.test(text)) {
        engineeringCount++;
      }
      if (/business|finance|accounting|management|analyst/gi.test(text)) {
        businessCount++;
      }
      if (/doctor|nurse|medical|health|medicine/gi.test(text)) {
        healthcareCount++;
      }
    });
    
    console.log('📊 Career mentions in knowledge base:');
    console.log(`   Teaching/Education: ${teachingCount} chunks (${(teachingCount/allChunks.length*100).toFixed(1)}%)`);
    console.log(`   Engineering/Tech:   ${engineeringCount} chunks (${(engineeringCount/allChunks.length*100).toFixed(1)}%)`);
    console.log(`   Business/Finance:   ${businessCount} chunks (${(businessCount/allChunks.length*100).toFixed(1)}%)`);
    console.log(`   Healthcare:         ${healthcareCount} chunks (${(healthcareCount/allChunks.length*100).toFixed(1)}%)`);
    
    if (teachingCount > engineeringCount) {
      console.log('   ⚠️ Teaching content is more prevalent than engineering!');
    }
    
  } catch (error) {
    console.log('❌ Error in analysis:', error.message);
  }
  
  // 2. Test mathematics-specific search
  console.log('\n2. 🧮 Mathematics Career Search Test');
  try {
    const { data: mathChunks, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata')
      .textSearch('chunk_text', 'mathematics career')
      .limit(10);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log(`📊 Found ${mathChunks.length} mathematics career chunks`);
      
      mathChunks.forEach((chunk, i) => {
        const text = chunk.chunk_text;
        const isTeaching = /teach|education|instructor|professor/gi.test(text);
        const isEngineering = /engineer|software|programming/gi.test(text);
        const isFinance = /finance|banking|actuary/gi.test(text);
        
        let type = 'Other';
        if (isTeaching) type = 'TEACHING';
        else if (isEngineering) type = 'ENGINEERING';
        else if (isFinance) type = 'FINANCE';
        
        console.log(`   ${i+1}. [${type}] ${text.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.log('❌ Error in math search:', error.message);
  }
  
  // 3. Check careers database
  console.log('\n3. 🗃️ Careers Database Check');
  try {
    const { data: careers, error } = await supabase
      .from('careers')
      .select('career_title, career_category, demand_level')
      .limit(50);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log(`📊 Found ${careers.length} careers in database`);
      
      // Count by category
      const categories = {};
      careers.forEach(career => {
        const cat = career.career_category || 'Unknown';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      console.log('📊 Career categories:');
      Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([cat, count]) => {
          console.log(`   ${cat}: ${count} careers`);
        });
      
      // Find teaching careers
      const teachingCareers = careers.filter(c => 
        /teach|education|instructor|professor/gi.test(c.career_title)
      );
      
      console.log(`\n📊 Teaching careers: ${teachingCareers.length}`);
      teachingCareers.slice(0, 3).forEach(career => {
        console.log(`   - ${career.career_title} (${career.demand_level})`);
      });
    }
  } catch (error) {
    console.log('❌ Error in careers check:', error.message);
  }
  
  // 4. Test vector search directly
  console.log('\n4. 🔍 Vector Search Test');
  try {
    // Get a sample embedding
    const { data: sample, error: sampleError } = await supabase
      .from('knowledge_chunks')
      .select('embedding')
      .limit(1)
      .single();
    
    if (sampleError || !sample) {
      console.log('⚠️ Could not get sample embedding');
    } else {
      const embedding = JSON.parse(sample.embedding);
      
      const { data: results, error: searchError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: embedding,
          match_threshold: 0.1,
          match_count: 5
        }
      );
      
      if (searchError) {
        console.log('❌ Vector search error:', searchError.message);
      } else {
        console.log(`📊 Vector search returned ${results.length} results`);
        
        results.forEach((result, i) => {
          const text = result.chunk_text;
          const sim = result.similarity.toFixed(3);
          const isTeaching = /teach|education|instructor|professor/gi.test(text);
          
          console.log(`   ${i+1}. [${sim}] ${isTeaching ? '🎓 TEACHING' : '💼 OTHER'} - ${text.substring(0, 80)}...`);
        });
        
        // Check if first result is teaching
        if (results.length > 0) {
          const firstIsTeaching = /teach|education|instructor|professor/gi.test(results[0].chunk_text);
          if (firstIsTeaching) {
            console.log('   ⚠️ FIRST RESULT IS TEACHING-RELATED!');
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Error in vector search test:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 SUMMARY & RECOMMENDATIONS');
  console.log('='.repeat(50));
  
  console.log('\n🔍 LIKELY CAUSES OF TEACHING BIAS:');
  console.log('1. 📚 Knowledge base may have more teaching content');
  console.log('2. 🎯 Mathematics strongly associated with teaching in SA');
  console.log('3. 🔍 Vector embeddings favor teaching-related content');
  console.log('4. 📊 Teaching careers may have higher similarity scores');
  
  console.log('\n🔧 SOLUTIONS TO IMPLEMENT:');
  console.log('1. 📊 Add career diversity requirements');
  console.log('2. 🎯 Boost STEM careers for math students');
  console.log('3. 🔍 Implement category balancing in ranking');
  console.log('4. 📈 Adjust similarity thresholds by career type');
  console.log('5. 🎨 Ensure variety in top 3 recommendations');
}

analyzeTeachingBias();