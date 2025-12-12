// generate-embeddings.js
// Week 1 Day 2: Generate embeddings for knowledge chunks
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration
const CHUNK_SIZE = 500; // tokens
const CHUNK_OVERLAP = 50; // tokens
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 10; // Process 10 chunks at a time to avoid rate limits

// Simple token counter (approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Chunk text into smaller pieces
function chunkText(text, maxTokens = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  const words = text.split(/\s+/);
  let currentChunk = [];
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens = estimateTokens(word);
    
    if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.join(' '));
      
      // Start new chunk with overlap
      const overlapWords = Math.floor(currentChunk.length * (overlap / maxTokens));
      currentChunk = currentChunk.slice(-overlapWords);
      currentTokens = estimateTokens(currentChunk.join(' '));
    }
    
    currentChunk.push(word);
    currentTokens += wordTokens;
  }
  
  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  
  return chunks;
}

// Generate embedding for text
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

// Sleep function for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract and chunk test questions (ideal answers)
async function processTestQuestions() {
  console.log('\n📚 Processing test questions...');
  
  const { data: questions, error } = await supabase
    .from('test_questions')
    .select('*')
    .order('question_id');
  
  if (error) throw error;
  
  const chunks = [];
  for (const question of questions) {
    const text = `Question: ${question.question_text}\n\nIdeal Answer: ${question.ideal_answer}`;
    const textChunks = chunkText(text);
    
    textChunks.forEach((chunk, index) => {
      chunks.push({
        module_name: 'test_questions',
        source_entity_id: question.id,
        source_entity_type: 'test_question',
        chunk_text: chunk,
        chunk_metadata: {
          source: `test_question_${question.question_id}`,
          question_id: question.question_id,
          category: question.category,
          chunk_index: index,
          total_chunks: textChunks.length,
          tags: question.key_points || [],
          required_modules: question.required_modules || []
        }
      });
    });
  }
  
  console.log(`  ✓ Created ${chunks.length} chunks from ${questions.length} test questions`);
  return chunks;
}

// Extract and chunk careers
async function processCareers() {
  console.log('\n💼 Processing careers...');
  
  const { data: careers, error } = await supabase
    .from('careers')
    .select('*')
    .order('career_code');
  
  if (error) throw error;
  
  const chunks = [];
  for (const career of careers) {
    const text = `Career: ${career.career_title}\n\nDescription: ${career.short_description}\n\n${career.detailed_description || ''}\n\nRequired Education: ${career.required_education}\nRequired Qualifications: ${career.required_qualifications?.join(', ')}\nSalary Range: R${career.salary_entry_min}-${career.salary_entry_max}/month (entry), R${career.salary_mid_min}-${career.salary_mid_max}/month (mid-level)\nJob Outlook: ${career.job_outlook}\nDemand Level: ${career.demand_level}\nSkills Required: ${career.skills_required?.join(', ')}`;
    
    const textChunks = chunkText(text);
    
    textChunks.forEach((chunk, index) => {
      chunks.push({
        module_name: 'careers',
        source_entity_id: career.id,
        source_entity_type: 'career',
        chunk_text: chunk,
        chunk_metadata: {
          source: `career_${career.career_code}`,
          career_code: career.career_code,
          career_title: career.career_title,
          career_category: career.career_category,
          chunk_index: index,
          total_chunks: textChunks.length,
          tags: [career.career_category, career.job_outlook, career.demand_level]
        }
      });
    });
  }
  
  console.log(`  ✓ Created ${chunks.length} chunks from ${careers.length} careers`);
  return chunks;
}

// Extract and chunk bursaries
async function processBursaries() {
  console.log('\n💰 Processing bursaries...');
  
  const { data: bursaries, error } = await supabase
    .from('bursaries')
    .select('*')
    .order('bursary_code');
  
  if (error) throw error;
  
  const chunks = [];
  for (const bursary of bursaries) {
    const eligibility = JSON.stringify(bursary.eligibility_criteria);
    const text = `Bursary: ${bursary.bursary_name}\n\nProvider: ${bursary.provider_name}\nType: ${bursary.bursary_type}\nAmount: ${bursary.amount_description}\nFields of Study: ${bursary.fields_of_study?.join(', ')}\nEligibility: ${eligibility}\nDeadline: ${bursary.application_deadline}\nApplication URL: ${bursary.application_url}`;
    
    const textChunks = chunkText(text);
    
    textChunks.forEach((chunk, index) => {
      chunks.push({
        module_name: 'bursaries',
        source_entity_id: bursary.id,
        source_entity_type: 'bursary',
        chunk_text: chunk,
        chunk_metadata: {
          source: `bursary_${bursary.bursary_code}`,
          bursary_code: bursary.bursary_code,
          provider_name: bursary.provider_name,
          chunk_index: index,
          total_chunks: textChunks.length,
          tags: bursary.fields_of_study || [],
          deadline: bursary.application_deadline
        }
      });
    });
  }
  
  console.log(`  ✓ Created ${chunks.length} chunks from ${bursaries.length} bursaries`);
  return chunks;
}

// Extract and chunk university programs
async function processUniversityPrograms() {
  console.log('\n🎓 Processing university programs...');
  
  const { data: programs, error } = await supabase
    .from('university_programs')
    .select(`
      *,
      universities (
        university_code,
        university_name,
        province
      )
    `)
    .order('program_code');
  
  if (error) throw error;
  
  const chunks = [];
  for (const program of programs) {
    const admissionReqs = JSON.stringify(program.admission_requirements);
    const text = `Program: ${program.program_name}\n\nUniversity: ${program.universities?.university_name} (${program.universities?.province})\nDegree Type: ${program.degree_type}\nDuration: ${program.duration_years} years\nAnnual Tuition: R${program.annual_tuition_min}-${program.annual_tuition_max}\nAdmission Requirements: ${admissionReqs}\nCareer Outcomes: ${program.career_outcomes?.join(', ')}\nDescription: ${program.program_description || ''}`;
    
    const textChunks = chunkText(text);
    
    textChunks.forEach((chunk, index) => {
      chunks.push({
        module_name: 'sa_universities',
        source_entity_id: program.id,
        source_entity_type: 'university_program',
        chunk_text: chunk,
        chunk_metadata: {
          source: `program_${program.program_code}`,
          university_code: program.universities?.university_code,
          program_code: program.program_code,
          chunk_index: index,
          total_chunks: textChunks.length,
          tags: [program.degree_type, program.faculty, program.universities?.province]
        }
      });
    });
  }
  
  console.log(`  ✓ Created ${chunks.length} chunks from ${programs.length} university programs`);
  return chunks;
}

// Extract and chunk emerging careers
async function processEmergingCareers() {
  console.log('\n🚀 Processing emerging careers...');
  
  const { data: careers, error } = await supabase
    .from('emerging_careers')
    .select('*')
    .order('career_code');
  
  if (error) throw error;
  
  const chunks = [];
  for (const career of careers) {
    const text = `Emerging Career: ${career.career_title}\n\nCategory: ${career.technology_category}\nDescription: ${career.short_description}\nSalary Range: ${career.salary_range_description}\nSkills Required: ${career.skills_required?.join(', ')}\nEducation Pathways: ${career.education_pathways?.join(', ')}\nGrowth Projection: ${career.growth_projection_5yr}\nSA Companies Hiring: ${career.sa_companies_hiring?.join(', ')}\nGovernment Initiatives: ${career.government_initiatives?.join(', ')}\nLearning Resources: ${career.learning_resources?.join(', ')}`;
    
    const textChunks = chunkText(text);
    
    textChunks.forEach((chunk, index) => {
      chunks.push({
        module_name: '4ir_emerging_jobs',
        source_entity_id: career.id,
        source_entity_type: 'emerging_career',
        chunk_text: chunk,
        chunk_metadata: {
          source: `emerging_career_${career.career_code}`,
          career_code: career.career_code,
          technology_category: career.technology_category,
          chunk_index: index,
          total_chunks: textChunks.length,
          tags: [career.technology_category, career.sa_adoption_level, career.maturity_stage]
        }
      });
    });
  }
  
  console.log(`  ✓ Created ${chunks.length} chunks from ${careers.length} emerging careers`);
  return chunks;
}

// Generate embeddings and insert into database
async function generateAndInsertEmbeddings(chunks) {
  console.log(`\n🔮 Generating embeddings for ${chunks.length} chunks...`);
  console.log(`   Estimated cost: $${(chunks.length * 0.0001).toFixed(4)} (~R${(chunks.length * 0.0001 * 18).toFixed(2)})`);
  
  // Get module IDs
  const { data: modules } = await supabase
    .from('knowledge_modules')
    .select('id, module_name');
  
  const moduleMap = {};
  modules.forEach(m => moduleMap[m.module_name] = m.id);
  
  let processed = 0;
  let failed = 0;
  
  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    
    console.log(`\n  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`);
    
    for (const chunk of batch) {
      try {
        // Generate embedding
        const embedding = await generateEmbedding(chunk.chunk_text);
        
        // Insert into database
        const { error } = await supabase
          .from('knowledge_chunks')
          .insert({
            module_id: moduleMap[chunk.module_name],
            source_entity_id: chunk.source_entity_id,
            source_entity_type: chunk.source_entity_type,
            chunk_text: chunk.chunk_text,
            chunk_metadata: chunk.chunk_metadata,
            embedding: JSON.stringify(embedding) // pgvector expects array as string
          });
        
        if (error) throw error;
        
        processed++;
        process.stdout.write(`\r    ✓ Processed: ${processed}/${chunks.length} chunks`);
        
        // Rate limiting: wait 100ms between requests
        await sleep(100);
        
      } catch (error) {
        failed++;
        console.error(`\n    ✗ Failed to process chunk: ${error.message}`);
      }
    }
  }
  
  console.log(`\n\n  ✓ Successfully processed: ${processed} chunks`);
  if (failed > 0) {
    console.log(`  ✗ Failed: ${failed} chunks`);
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 THANDI RAG SYSTEM - EMBEDDING GENERATION');
  console.log('   Week 1 Day 2: Generate Knowledge Chunks & Embeddings');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Extract and chunk all data sources
    const testQuestionChunks = await processTestQuestions();
    const careerChunks = await processCareers();
    const bursaryChunks = await processBursaries();
    const programChunks = await processUniversityPrograms();
    const emergingCareerChunks = await processEmergingCareers();
    
    // Combine all chunks
    const allChunks = [
      ...testQuestionChunks,
      ...careerChunks,
      ...bursaryChunks,
      ...programChunks,
      ...emergingCareerChunks
    ];
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total chunks created: ${allChunks.length}`);
    console.log(`   - Test questions: ${testQuestionChunks.length}`);
    console.log(`   - Careers: ${careerChunks.length}`);
    console.log(`   - Bursaries: ${bursaryChunks.length}`);
    console.log(`   - University programs: ${programChunks.length}`);
    console.log(`   - Emerging careers: ${emergingCareerChunks.length}`);
    
    // Generate embeddings and insert
    await generateAndInsertEmbeddings(allChunks);
    
    // Verify insertion
    const { count } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ EMBEDDING GENERATION COMPLETE!');
    console.log(`   Total chunks in database: ${count}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Verify embeddings: SELECT COUNT(*) FROM knowledge_chunks;');
    console.log('   2. Test vector search: Use pgvector similarity search');
    console.log('   3. Build RAG retrieval system (Week 1 Day 3-4)');
    console.log('   4. Test with 20 questions (Week 2)');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
