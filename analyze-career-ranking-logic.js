#!/usr/bin/env node

/**
 * Comprehensive analysis of career ranking logic
 * Investigate why teaching appears first in recommendations
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function analyzeCareerRankingLogic() {
  console.log('🔍 COMPREHENSIVE CAREER RANKING ANALYSIS');
  console.log('='.repeat(60));
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // 1. Analyze knowledge base content for teaching vs other careers
  console.log('1. 📚 KNOWLEDGE BASE CONTENT ANALYSIS');
  console.log('-'.repeat(40));
  
  try {
    // Count chunks by career type
    const { data: allChunks, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata, module_name, source_entity_type')
      .limit(1000);
    
    if (error) {
      console.log('❌ Error fetching chunks:', error.message);
      return;
    }
    
    console.log(`📊 Total chunks analyzed: ${allChunks.length}`);
    
    // Analyze content by career type
    const careerCounts = {
      teaching: 0,
      engineering: 0,
      healthcare: 0,
      business: 0,
      technology: 0,
      other: 0
    };
    
    const teachingKeywords = /teach|education|instructor|professor|educator|school|classroom/gi;
    const engineeringKeywords = /engineer|software|programming|technology|coding|development/gi;
    const healthcareKeywords = /doctor|nurse|medical|health|medicine|hospital/gi;
    const businessKeywords = /business|management|finance|accounting|marketing|analyst/gi;
    const technologyKeywords = /computer|IT|information technology|data|digital/gi;
    
    allChunks.forEach(chunk => {
      const text = chunk.chunk_text.toLowerCase();
      const metadata = JSON.stringify(chunk.chunk_metadata || {}).toLowerCase();
      const combined = text + ' ' + metadata;
      
      if (teachingKeywords.test(combined)) {
        careerCounts.teaching++;
      } else if (engineeringKeywords.test(combined)) {
        careerCounts.engineering++;
      } else if (healthcareKeywords.test(combined)) {
        careerCounts.healthcare++;
      } else if (businessKeywords.test(combined)) {
        careerCounts.business++;
      } else if (technologyKeywords.test(combined)) {
        careerCounts.technology++;
      } else {
        careerCounts.other++;
      }
    });
    
    console.log('📊 Content distribution by career type:');
    Object.entries(careerCounts).forEach(([type, count]) => {
      const percentage = ((count / allChunks.length) * 100).toFixed(1);
      console.log(`   ${type.padEnd(12)}: ${count.toString().padStart(4)} chunks (${percentage}%)`);
    });
    
    // Check if teaching has disproportionate representation
    const teachingPercentage = (careerCounts.teaching / allChunks.length) * 100;
    if (teachingPercentage > 20) {
      console.log(`   ⚠️ WARNING: Teaching content is ${teachingPercentage.toFixed(1)}% of knowledge base`);
      console.log(`   🔍 This could bias recommendations toward teaching careers`);
    }
    
  } catch (error) {
    console.log('❌ Error in content analysis:', error.message);
  }
  
  // 2. Analyze specific mathematics-related content
  console.log('\n2. 🧮 MATHEMATICS CAREER CONTENT ANALYSIS');
  console.log('-'.repeat(40));
  
  try {
    const { data: mathChunks, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_text, chunk_metadata, similarity')
      .textSearch('chunk_text', 'mathematics')
      .limit(20);
    
    if (error) {
      console.log('❌ Error fetching math chunks:', error.message);
    } else {
      console.log(`📊 Mathematics-related chunks: ${mathChunks.length}`);
      
      // Analyze what careers are mentioned in math-related content
      const mathCareerMentions = {
        teaching: 0,
        engineering: 0,
        finance: 0,
        research: 0,
        other: 0
      };
      
      mathChunks.forEach(chunk => {
        const text = chunk.chunk_text.toLowerCase();
        
        if (/teach|education|instructor|professor/gi.test(text)) {
          mathCareerMentions.teaching++;
        }
        if (/engineer|software|programming|technology/gi.test(text)) {
          mathCareerMentions.engineering++;
        }
        if (/finance|banking|actuary|analyst/gi.test(text)) {
          mathCareerMentions.finance++;
        }
        if (/research|scientist|academic/gi.test(text)) {
          mathCareerMentions.research++;
        } else {
          mathCareerMentions.other++;
        }
      });
      
      console.log('📊 Career mentions in mathematics content:');
      Object.entries(mathCareerMentions).forEach(([type, count]) => {
        console.log(`   ${type.padEnd(12)}: ${count} mentions`);
      });
      
      // Show sample math-teaching content
      const mathTeachingChunks = mathChunks.filter(chunk => 
        /teach|education|instructor|professor/gi.test(chunk.chunk_text)
      );
      
      if (mathTeachingChunks.length > 0) {
        console.log('\n📝 Sample mathematics-teaching content:');
        mathTeachingChunks.slice(0, 2).forEach((chunk, i) => {
          console.log(`   ${i + 1}. ${chunk.chunk_text.substring(0, 150)}...`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Error in mathematics analysis:', error.message);
  }
  
  // 3. Test actual RAG search with mathematics query
  console.log('\n3. 🔍 RAG SEARCH SIMULATION');
  console.log('-'.repeat(40));
  
  try {
    // Get a sample embedding for mathematics careers
    const { data: sampleChunk, error: sampleError } = await supabase
      .from('knowledge_chunks')
      .select('embedding')
      .textSearch('chunk_text', 'mathematics career')
      .limit(1)
      .single();
    
    if (sampleError || !sampleChunk) {
      console.log('⚠️ Could not get sample embedding, using text search');
      
      // Fallback to text search
      const { data: textResults, error: textError } = await supabase
        .from('knowledge_chunks')
        .select('chunk_text, chunk_metadata, module_name')
        .textSearch('chunk_text', 'mathematics career teacher engineer')
        .limit(10);
      
      if (!textError && textResults) {
        console.log(`📊 Text search results: ${textResults.length}`);
        
        textResults.forEach((result, i) => {
          const text = result.chunk_text;
          const isTeaching = /teach|education|instructor|professor/gi.test(text);
          const isEngineering = /engineer|software|programming/gi.test(text);
          const isFinance = /finance|banking|actuary/gi.test(text);
          
          let careerType = 'other';
          if (isTeaching) careerType = 'teaching';
          else if (isEngineering) careerType = 'engineering';
          else if (isFinance) careerType = 'finance';
          
          console.log(`   ${i + 1}. [${careerType.toUpperCase()}] ${text.substring(0, 100)}...`);
        });
      }
    } else {
      // Use vector similarity search
      const testEmbedding = JSON.parse(sampleChunk.embedding);
      
      const { data: vectorResults, error: vectorError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: testEmbedding,
          match_threshold: 0.1,
          match_count: 10
        }
      );
      
      if (!vectorError && vectorResults) {
        console.log(`📊 Vector search results: ${vectorResults.length}`);
        
        vectorResults.forEach((result, i) => {
          const text = result.chunk_text;
          const similarity = result.similarity;
          const isTeaching = /teach|education|instructor|professor/gi.test(text);
          const isEngineering = /engineer|software|programming/gi.test(text);
          const isFinance = /finance|banking|actuary/gi.test(text);
          
          let careerType = 'other';
          if (isTeaching) careerType = 'teaching';
          else if (isEngineering) careerType = 'engineering';
          else if (isFinance) careerType = 'finance';
          
          console.log(`   ${i + 1}. [${careerType.toUpperCase()}] Sim: ${similarity.toFixed(3)} - ${text.substring(0, 80)}...`);
        });
        
        // Check if teaching appears first
        const firstResult = vectorResults[0];
        if (firstResult && /teach|education|instructor|professor/gi.test(firstResult.chunk_text)) {
          console.log(`   ⚠️ TEACHING APPEARS FIRST in vector search results!`);
          console.log(`   🔍 Similarity score: ${firstResult.similarity.toFixed(3)}`);
          console.log(`   📝 Content: ${firstResult.chunk_text.substring(0, 200)}...`);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error in RAG search simulation:', error.message);
  }
  
  // 4. Check careers table for teaching bias
  console.log('\n4. 🗃️ CAREERS DATABASE ANALYSIS');
  console.log('-'.repeat(40));
  
  try {
    const { data: allCareers, error } = await supabase
      .from('careers')
      .select('career_title, career_category, demand_level, salary_entry_min')
      .limit(100);
    
    if (error) {
      console.log('❌ Error fetching careers:', error.message);
    } else {
      console.log(`📊 Total careers in database: ${allCareers.length}`);
      
      // Analyze career distribution
      const categoryCount = {};
      const demandCount = {};
      
      allCareers.forEach(career => {
        const category = career.career_category || 'Unknown';
        const demand = career.demand_level || 'Unknown';
        
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        demandCount[demand] = (demandCount[demand] || 0) + 1;
      });
      
      console.log('📊 Career categories:');
      Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`   ${category.padEnd(15)}: ${count} careers`);
        });
      
      console.log('\n📊 Demand levels:');
      Object.entries(demandCount)
        .sort(([,a], [,b]) => b - a)
        .forEach(([demand, count]) => {
          console.log(`   ${demand.padEnd(15)}: ${count} careers`);
        });
      
      // Check for teaching careers specifically
      const teachingCareers = allCareers.filter(career => 
        /teach|education|instructor|professor/gi.test(career.career_title)
      );
      
      console.log(`\n📊 Teaching careers found: ${teachingCareers.length}`);
      teachingCareers.slice(0, 5).forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.career_title} (${career.career_category}) - Demand: ${career.demand_level}`);
      });
    }
  } catch (error) {
    console.log('❌ Error in careers database analysis:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 ANALYSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n🔍 POSSIBLE REASONS FOR TEACHING APPEARING FIRST:');
  console.log('1. 📚 Knowledge Base Bias: Teaching content may be overrepresented');
  console.log('2. 🎯 Mathematics Association: Math strongly linked to teaching in SA context');
  console.log('3. 🔍 Vector Embeddings: Teaching content may have higher similarity scores');
  console.log('4. 📊 Database Weighting: Teaching careers may have higher demand ratings');
  console.log('5. 🏫 Cultural Context: Teaching emphasized as stable career in South Africa');
  console.log('6. 💼 Subject Matching: Mathematics teachers are common career path');
  
  console.log('\n🔧 RECOMMENDATIONS TO BALANCE RECOMMENDATIONS:');
  console.log('1. 📊 Review knowledge base content distribution');
  console.log('2. 🎯 Adjust career ranking weights to favor diversity');
  console.log('3. 🔍 Implement category diversity requirements');
  console.log('4. 📈 Boost STEM careers for mathematics students');
  console.log('5. 🎨 Add career variety requirements in matching algorithm');
  console.log('6. 📋 Review and update career demand ratings');
}

analyzeCareerRankingLogic();