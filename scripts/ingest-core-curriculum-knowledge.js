import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('🎯 INGESTING CORE CURRICULUM KNOWLEDGE BASE');
console.log('   Phase 1: CAPS/IEB Foundation for Assessment Form');
console.log('═══════════════════════════════════════════════════════\n');

// Get available modules
const { data: modules } = await supabase.from('knowledge_modules').select('id, module_name');
const moduleMap = {};
modules.forEach(m => moduleMap[m.module_name] = m.id);

console.log('📋 Available modules:');
modules.forEach(m => console.log(`   ${m.module_name}`));
console.log('');

// Core curriculum files that MUST be in the vector store
const CORE_FILES = [
  // CAPS Core
  { path: 'thandi_knowledge_base/caps/requirements/subject_requirements.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/requirements/assessment_structure.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/requirements/grade_progression.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/requirements/provincial_variations.json', module: 'careers' },
  
  // IEB Core  
  { path: 'thandi_knowledge_base/ieb/requirements/subject_requirements.json', module: 'careers' },
  { path: 'thandi_knowledge_base/ieb/requirements/assessment_structure.json', module: 'careers' },
  { path: 'thandi_knowledge_base/ieb/requirements/advanced_programme.json', module: 'careers' },
  { path: 'thandi_knowledge_base/ieb/requirements/school_flexibility.json', module: 'careers' },
  
  // Comparison
  { path: 'thandi_knowledge_base/comparison/caps_vs_ieb_matrix.json', module: 'careers' },
  
  // Subject Details
  { path: 'thandi_knowledge_base/caps/subjects/mathematics/topic_breakdown.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/subjects/mathematics/exam_prep.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/subjects/physical_sciences/topic_breakdown.json', module: 'careers' },
  { path: 'thandi_knowledge_base/caps/subjects/physical_sciences/exam_prep.json', module: 'careers' },
  { path: 'thandi_knowledge_base/ieb/subjects/mathematics/topic_breakdown.json', module: 'careers' },
  
  // University Integration
  { path: 'thandi_knowledge_base/university/aps_calculator.json', module: 'sa_universities' },
  { path: 'thandi_knowledge_base/university/application_timelines.json', module: 'sa_universities' },
  
  // Career Mapping
  { path: 'thandi_knowledge_base/careers/subject_mapper.json', module: 'careers' },
  { path: 'thandi_knowledge_base/careers/profiles.json', module: 'careers' }
];

let processed = 0;
let totalChunks = 0;

for (const file of CORE_FILES) {
  console.log(`📄 Processing: ${path.basename(file.path)}`);
  
  if (!fs.existsSync(file.path)) {
    console.log(`   ❌ File not found: ${file.path}`);
    continue;
  }
  
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    const data = JSON.parse(content);
    
    // Create comprehensive text from JSON
    let text = '';
    
    // Add basic info
    if (data.kb_id) text += `${data.kb_id} `;
    if (data.exam_board) text += `${data.exam_board} curriculum `;
    if (data.version) text += `version ${data.version} `;
    
    // Process different content types
    if (data.subject_requirements) {
      text += 'Subject Requirements: ';
      Object.entries(data.subject_requirements).forEach(([subject, req]) => {
        text += `${subject} ${JSON.stringify(req)} `;
      });
    }
    
    if (data.assessment_structure) {
      text += 'Assessment Structure: ';
      Object.entries(data.assessment_structure).forEach(([key, value]) => {
        text += `${key} ${JSON.stringify(value)} `;
      });
    }
    
    if (data.grade_progression) {
      text += 'Grade Progression: ';
      Object.entries(data.grade_progression).forEach(([grade, rules]) => {
        text += `Grade ${grade} ${JSON.stringify(rules)} `;
      });
    }
    
    if (data.provincial_variations) {
      text += 'Provincial Variations: ';
      Object.entries(data.provincial_variations).forEach(([province, info]) => {
        text += `${province} ${JSON.stringify(info)} `;
      });
    }
    
    if (data.comparison_matrix) {
      text += 'CAPS vs IEB Comparison: ';
      Object.entries(data.comparison_matrix).forEach(([aspect, comparison]) => {
        text += `${aspect} ${JSON.stringify(comparison)} `;
      });
    }
    
    if (data.topic_breakdown) {
      text += 'Topic Breakdown: ';
      Object.entries(data.topic_breakdown).forEach(([grade, topics]) => {
        text += `Grade ${grade} topics ${JSON.stringify(topics)} `;
      });
    }
    
    if (data.career_profiles) {
      text += 'Career Profiles: ';
      data.career_profiles.forEach(career => {
        text += `${career.career_name} requirements ${career.required_subjects?.join(' ')} salary ${career.salary_range} `;
      });
    }
    
    if (data.subject_career_mapping) {
      text += 'Subject Career Mapping: ';
      Object.entries(data.subject_career_mapping).forEach(([subject, careers]) => {
        text += `${subject} leads to ${careers.join(' ')} `;
      });
    }
    
    if (data.universities) {
      text += 'Universities: ';
      data.universities.forEach(uni => {
        text += `${uni.name} programs ${JSON.stringify(uni.programs)} `;
      });
    }
    
    // Add any notes or descriptions
    if (data.notes) text += `Notes: ${data.notes} `;
    if (data.description) text += `Description: ${data.description} `;
    
    // Generate embedding
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.trim()
    });
    
    // Insert into appropriate module
    const moduleId = moduleMap[file.module];
    if (!moduleId) {
      console.log(`   ❌ Module not found: ${file.module}`);
      continue;
    }
    
    const { error } = await supabase.from('knowledge_chunks').insert({
      module_id: moduleId,
      source_entity_id: null,
      source_entity_type: 'curriculum_foundation',
      chunk_text: text.trim(),
      chunk_metadata: {
        kb_id: data.kb_id || path.basename(file.path, '.json'),
        file_path: file.path,
        curriculum: data.exam_board || 'general',
        phase: 'foundation',
        priority: 'core'
      },
      embedding: JSON.stringify(response.data[0].embedding)
    });
    
    if (error) {
      console.log(`   ❌ Insert failed: ${error.message}`);
    } else {
      console.log(`   ✅ Inserted successfully`);
      processed++;
      totalChunks++;
    }
    
  } catch (error) {
    console.log(`   ❌ Processing failed: ${error.message}`);
  }
}

// Test the foundation
console.log('\n🧪 TESTING CURRICULUM FOUNDATION\n');

const foundationTests = [
  "What subjects are required for CAPS Grade 11?",
  "How does IEB assessment structure work?", 
  "What's the difference between CAPS and IEB?",
  "What APS do I need for engineering?",
  "Which subjects lead to medicine careers?"
];

let testsPassed = 0;

for (const query of foundationTests) {
  console.log(`🔍 ${query}`);
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query
  });
  
  const { data: results } = await supabase.rpc('search_knowledge_chunks', {
    query_embedding: `[${response.data[0].embedding.join(',')}]`,
    match_threshold: 0.3,
    match_count: 1
  });
  
  if (results?.length > 0) {
    const result = results[0];
    console.log(`   ✅ Found (${result.similarity?.toFixed(3)}): ${result.chunk_text.substring(0, 100)}...`);
    testsPassed++;
  } else {
    console.log(`   ❌ No results found`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 CURRICULUM FOUNDATION INGESTION COMPLETE');
console.log('═══════════════════════════════════════════════════════');
console.log(`Files processed: ${processed}/${CORE_FILES.length}`);
console.log(`Total chunks added: ${totalChunks}`);
console.log(`Foundation tests passed: ${testsPassed}/${foundationTests.length}`);
console.log(`Foundation strength: ${Math.round((testsPassed/foundationTests.length)*100)}%`);

if (testsPassed >= 4) {
  console.log('\n✅ CURRICULUM FOUNDATION ESTABLISHED');
  console.log('   Thandi now understands CAPS/IEB basics');
  console.log('   Assessment form integration ready');
  console.log('   Students will get curriculum-specific guidance');
} else {
  console.log('\n⚠️ FOUNDATION NEEDS STRENGTHENING');
  console.log('   Some curriculum knowledge gaps remain');
  console.log('   May need additional content ingestion');
}

console.log('═══════════════════════════════════════════════════════');