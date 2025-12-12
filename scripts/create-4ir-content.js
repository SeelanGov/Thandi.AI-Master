#!/usr/bin/env node

/**
 * Create 4IR Careers Content - Sprint 2.1
 * 
 * Generates structured content chunks for 4IR careers to address Q16-Q18 gaps
 * Target: 0% → 60% pass rate on 4IR emerging career questions
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('🚀 THANDI RAG SYSTEM - 4IR CAREERS CONTENT CREATION');
console.log('   Sprint 2.1: Addressing Q16-Q18 Knowledge Gaps');
console.log('═══════════════════════════════════════════════════════\n');

async function create4IRContent() {
  try {
    // Read the content specification
    const contentPath = path.join(process.cwd(), 'thandi_knowledge_base/4ir_careers_framework/CONTENT-SPEC.md');
    const contentSpec = await fs.readFile(contentPath, 'utf-8');
    
    console.log('📚 Processing 4IR careers content specification...');
    
    // Parse chunks from the content spec
    const chunks = parseContentChunks(contentSpec);
    
    console.log(`  ✓ Extracted ${chunks.length} content chunks`);
    
    // Create knowledge module entry
    const { data: module, error: moduleError } = await supabase
      .from('knowledge_modules')
      .upsert({
        module_name: '4ir_careers_framework',
        description: '4IR and emerging technology careers - cybersecurity, cloud, renewable energy, AI/ML',
        version: 1,
        priority: 1
      })
      .select()
      .single();
      
    if (moduleError) {
      throw new Error(`Failed to create module: ${moduleError.message}`);
    }
    
    console.log(`  ✓ Created knowledge module: ${module.module_name}`);
    
    // Insert chunks into database
    let insertedCount = 0;
    
    for (const chunk of chunks) {
      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .upsert({
          module_id: module.id,
          source_entity_id: null, // We'll use metadata to track the career
          source_entity_type: '4ir_career',
          chunk_text: chunk.content,
          chunk_metadata: {
            source: `4ir_career_${chunk.career_id}`,
            career_id: chunk.career_id,
            career_name: chunk.career_name,
            chunk_type: chunk.chunk_type,
            chunk_index: chunk.chunk_index,
            total_chunks: chunk.total_chunks,
            tags: chunk.tags,
            target_questions: ['Q16', 'Q17', 'Q18'],
            salary_range: chunk.salary_range,
            required_subjects: chunk.required_subjects
          }
        });
        
      if (chunkError) {
        console.error(`  ❌ Failed to insert chunk ${chunk.career_id}-${chunk.chunk_index}: ${chunkError.message}`);
      } else {
        insertedCount++;
        console.log(`  ✓ Inserted chunk: ${chunk.career_name} - ${chunk.chunk_type}`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total chunks created: ${insertedCount}/${chunks.length}`);
    console.log(`   Module: 4ir_careers_framework`);
    console.log(`   Target questions: Q16, Q17, Q18`);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ 4IR CAREERS CONTENT CREATION COMPLETE!');
    console.log('   Next: Run embedding generation and test improvements');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error creating 4IR content:', error.message);
    process.exit(1);
  }
}

function parseContentChunks(contentSpec) {
  const chunks = [];
  
  // Parse cybersecurity engineer chunks
  const cybersecurityChunks = [
    {
      career_id: 'cybersecurity_engineer',
      career_name: 'Cybersecurity Engineer',
      chunk_type: 'career_overview',
      chunk_index: 1,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 1: Cybersecurity Engineer - Career Overview'),
      tags: ['cybersecurity', 'engineer', 'digital security', 'SA market demand', 'career progression'],
      salary_range: 'R35K-R60K',
      required_subjects: ['Math 60%+', 'English 60%+']
    },
    {
      career_id: 'cybersecurity_engineer',
      career_name: 'Cybersecurity Engineer',
      chunk_type: 'skills_education',
      chunk_index: 2,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 2: Cybersecurity Engineer - Skills & Education'),
      tags: ['cybersecurity education', 'university programs', 'certifications', 'technical skills', 'TVET options'],
      salary_range: 'R35K-R60K',
      required_subjects: ['Math 60%+', 'Physical Science 50%+', 'English 60%+']
    },
    {
      career_id: 'cybersecurity_engineer',
      career_name: 'Cybersecurity Engineer',
      chunk_type: 'financial_reality',
      chunk_index: 3,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 3: Cybersecurity Engineer - Financial Reality & Job Market'),
      tags: ['cybersecurity salary', 'job market', 'banking sector', 'government roles', 'remote work'],
      salary_range: 'R25K-R200K (progression)',
      required_subjects: ['Math 60%+']
    }
  ];
  
  // Parse cloud engineer chunks
  const cloudChunks = [
    {
      career_id: 'cloud_engineer',
      career_name: 'Cloud Engineer',
      chunk_type: 'career_overview',
      chunk_index: 1,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 4: Cloud Engineer - Career Overview'),
      tags: ['cloud engineer', 'aws', 'azure', 'google cloud', 'digital transformation', 'infrastructure'],
      salary_range: 'R20K-R180K (progression)',
      required_subjects: ['Math 60%+', 'Physical Science 50%+']
    },
    {
      career_id: 'cloud_engineer',
      career_name: 'Cloud Engineer',
      chunk_type: 'skills_education',
      chunk_index: 2,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 5: Cloud Engineer - Skills & Education'),
      tags: ['cloud education', 'aws certification', 'azure certification', 'university programs', 'networking'],
      salary_range: 'R40K-R65K',
      required_subjects: ['Math 60%+', 'Physical Science 50%+', 'English 60%+']
    },
    {
      career_id: 'cloud_engineer',
      career_name: 'Cloud Engineer',
      chunk_type: 'financial_reality',
      chunk_index: 3,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 6: Cloud Engineer - Financial Reality & Job Market'),
      tags: ['cloud salary', 'banking sector', 'telecommunications', 'remote work', 'digital transformation'],
      salary_range: 'R20K-R180K (progression)',
      required_subjects: ['Math 60%+']
    }
  ];
  
  // Parse data scientist chunks
  const dataScientistChunks = [
    {
      career_id: 'data_scientist',
      career_name: 'Data Scientist',
      chunk_type: 'career_overview',
      chunk_index: 1,
      total_chunks: 3,
      content: extractChunkContent(contentSpec, 'CHUNK 7: Data Scientist - Career Overview'),
      tags: ['data scientist', 'ai engineer', 'machine learning', 'python', 'analytics', '4ir'],
      salary_range: 'R18K-R180K (progression)',
      required_subjects: ['Math 70%+', 'Physical Science 50%+']
    }
  ];
  
  chunks.push(...cybersecurityChunks, ...cloudChunks, ...dataScientistChunks);
  
  return chunks;
}

function extractChunkContent(contentSpec, chunkTitle) {
  const startIndex = contentSpec.indexOf(`## ${chunkTitle}`);
  if (startIndex === -1) {
    throw new Error(`Chunk not found: ${chunkTitle}`);
  }
  
  // Find the next chunk or end of content
  const nextChunkIndex = contentSpec.indexOf('\n## CHUNK', startIndex + 1);
  const endIndex = nextChunkIndex === -1 ? contentSpec.length : nextChunkIndex;
  
  return contentSpec.substring(startIndex, endIndex).trim();
}

// Run the script
create4IRContent();