// Generate embeddings for academic progression knowledge base content
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration
const CHUNK_SIZE = 800; // tokens (larger for comprehensive guidance)
const CHUNK_OVERLAP = 100; // tokens
const EMBEDDING_MODEL = 'text-embedding-ada-002';

// Simple token counter (approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Chunk text into smaller pieces with better context preservation
function chunkText(text, maxTokens = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  
  // Split by major sections first (## headers)
  const sections = text.split(/(?=^## )/gm).filter(section => section.trim());
  
  for (const section of sections) {
    const sectionTokens = estimateTokens(section);
    
    if (sectionTokens <= maxTokens) {
      // Section fits in one chunk
      chunks.push(section.trim());
    } else {
      // Need to split section further
      const paragraphs = section.split(/\n\s*\n/).filter(p => p.trim());
      let currentChunk = '';
      let currentTokens = 0;
      
      for (const paragraph of paragraphs) {
        const paragraphTokens = estimateTokens(paragraph);
        
        if (currentTokens + paragraphTokens > maxTokens && currentChunk) {
          // Save current chunk
          chunks.push(currentChunk.trim());
          
          // Start new chunk with section header if available
          const sectionHeader = section.match(/^##[^\n]+/)?.[0] || '';
          currentChunk = sectionHeader ? sectionHeader + '\n\n' + paragraph : paragraph;
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          currentTokens += paragraphTokens;
        }
      }
      
      // Add final chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }
  }
  
  return chunks.filter(chunk => chunk.trim().length > 50); // Filter out tiny chunks
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

// Process academic progression files
async function processAcademicProgressionFiles() {
  console.log('\n📚 Processing academic progression knowledge base files...');
  
  const files = [
    {
      path: 'thandi_knowledge_base/academic_progression/grade10_guidance.md',
      grade: 'grade10',
      title: 'Grade 10 Student Guidance - Academic Progression'
    },
    {
      path: 'thandi_knowledge_base/academic_progression/grade11_guidance.md',
      grade: 'grade11', 
      title: 'Grade 11 Student Guidance - Academic Progression'
    },
    {
      path: 'thandi_knowledge_base/academic_progression/grade12_guidance.md',
      grade: 'grade12',
      title: 'Grade 12 Student Guidance - Academic Progression'
    }
  ];
  
  const allChunks = [];
  
  for (const file of files) {
    try {
      console.log(`\n  Processing ${file.path}...`);
      
      // Read file content
      const content = readFileSync(file.path, 'utf-8');
      
      // Chunk the content
      const chunks = chunkText(content);
      
      console.log(`    ✓ Created ${chunks.length} chunks`);
      
      // Create chunk objects
      chunks.forEach((chunk, index) => {
        allChunks.push({
          module_name: 'academic_progression',
          source_entity_type: 'knowledge_base_file',
          source_entity_id: null, // Use null for file-based content
          chunk_text: chunk,
          chunk_metadata: {
            source: file.path,
            grade: file.grade,
            title: file.title,
            chunk_index: index,
            total_chunks: chunks.length,
            tags: ['academic_progression', file.grade, 'caps', 'ieb', 'student_guidance'],
            curriculum: ['caps', 'ieb'],
            grade_level: parseInt(file.grade.replace('grade', ''))
          }
        });
      });
      
    } catch (error) {
      console.error(`    ❌ Error processing ${file.path}:`, error.message);
    }
  }
  
  console.log(`\n  📊 Total chunks created: ${allChunks.length}`);
  return allChunks;
}

// Generate embeddings and insert into database
async function generateAndInsertEmbeddings(chunks) {
  console.log(`\n🔮 Generating embeddings for ${chunks.length} chunks...`);
  console.log(`   Estimated cost: $${(chunks.length * 0.0001).toFixed(4)} (~R${(chunks.length * 0.0001 * 18).toFixed(2)})`);
  
  // Check if academic_progression module exists
  let { data: modules } = await supabase
    .from('knowledge_modules')
    .select('id, module_name')
    .eq('module_name', 'academic_progression');
  
  let moduleId;
  if (!modules || modules.length === 0) {
    // Create the module
    console.log('   Creating academic_progression module...');
    const { data: newModule, error } = await supabase
      .from('knowledge_modules')
      .insert({
        module_name: 'academic_progression',
        description: 'Grade-specific academic progression guidance for CAPS and IEB students'
      })
      .select()
      .single();
    
    if (error) {
      console.error('   ❌ Error creating module:', error);
      throw error;
    }
    
    moduleId = newModule.id;
    console.log('   ✓ Module created with ID:', moduleId);
  } else {
    moduleId = modules[0].id;
    console.log('   ✓ Using existing module ID:', moduleId);
  }
  
  let processed = 0;
  let failed = 0;
  
  // Process chunks one by one with rate limiting
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    try {
      console.log(`\n  Processing chunk ${i + 1}/${chunks.length} (${chunk.chunk_metadata.grade})...`);
      
      // Generate embedding
      const embedding = await generateEmbedding(chunk.chunk_text);
      
      // Insert into database
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert({
          module_id: moduleId,
          source_entity_id: chunk.source_entity_id,
          source_entity_type: chunk.source_entity_type,
          chunk_text: chunk.chunk_text,
          chunk_metadata: chunk.chunk_metadata,
          embedding: embedding // Supabase handles pgvector format
        });
      
      if (error) {
        console.error(`    ❌ Database error:`, error.message);
        failed++;
      } else {
        processed++;
        console.log(`    ✓ Embedded and stored successfully`);
      }
      
      // Rate limiting: wait 200ms between requests
      await sleep(200);
      
    } catch (error) {
      failed++;
      console.error(`    ❌ Failed to process chunk: ${error.message}`);
    }
  }
  
  console.log(`\n  📊 RESULTS:`);
  console.log(`     ✅ Successfully processed: ${processed} chunks`);
  if (failed > 0) {
    console.log(`     ❌ Failed: ${failed} chunks`);
  }
  
  return { processed, failed };
}

// Test the new embeddings with grade-specific queries
async function testGradeSpecificEmbeddings() {
  console.log('\n🧪 Testing grade-specific embeddings...');
  
  const testQueries = [
    {
      query: 'I am a Grade 10 student, what subjects should I choose?',
      expectedGrade: 'grade10'
    },
    {
      query: 'Grade 11 student needs help with university research',
      expectedGrade: 'grade11'
    },
    {
      query: 'Grade 12 final year NSC examination preparation',
      expectedGrade: 'grade12'
    }
  ];
  
  for (const test of testQueries) {
    try {
      console.log(`\n  🔍 Testing: "${test.query}"`);
      
      // Generate query embedding
      const queryEmbedding = await generateEmbedding(test.query);
      
      // Search for relevant chunks
      const { data: results, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3
      });
      
      if (error) {
        console.error(`    ❌ Search error:`, error.message);
        continue;
      }
      
      console.log(`    ✓ Found ${results.length} relevant chunks`);
      
      // Check if results include expected grade content
      const gradeMatches = results.filter(r => 
        r.chunk_metadata?.grade === test.expectedGrade ||
        r.chunk_metadata?.tags?.includes(test.expectedGrade)
      );
      
      if (gradeMatches.length > 0) {
        console.log(`    ✅ Grade-specific content found: ${gradeMatches.length} chunks for ${test.expectedGrade}`);
      } else {
        console.log(`    ⚠️  No grade-specific content found for ${test.expectedGrade}`);
      }
      
    } catch (error) {
      console.error(`    ❌ Test failed:`, error.message);
    }
    
    // Rate limiting
    await sleep(200);
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎓 ACADEMIC PROGRESSION EMBEDDINGS GENERATION');
  console.log('   Grade-specific knowledge base content processing');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Process academic progression files
    const chunks = await processAcademicProgressionFiles();
    
    if (chunks.length === 0) {
      console.log('\n❌ No chunks created. Check file paths and content.');
      return;
    }
    
    // Generate embeddings and insert
    const results = await generateAndInsertEmbeddings(chunks);
    
    if (results.processed > 0) {
      // Test the new embeddings
      await testGradeSpecificEmbeddings();
      
      // Verify total count
      const { count } = await supabase
        .from('knowledge_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('chunk_metadata->>source', 'thandi_knowledge_base/academic_progression/grade10_guidance.md')
        .or('chunk_metadata->>source.eq.thandi_knowledge_base/academic_progression/grade11_guidance.md,chunk_metadata->>source.eq.thandi_knowledge_base/academic_progression/grade12_guidance.md');
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ ACADEMIC PROGRESSION EMBEDDINGS COMPLETE!');
      console.log(`   Academic progression chunks in database: ${count}`);
      console.log(`   Successfully processed: ${results.processed}`);
      console.log(`   Failed: ${results.failed}`);
      console.log('═══════════════════════════════════════════════════════');
      
      console.log('\n📝 NEXT STEPS:');
      console.log('   1. Test RAG API with grade-specific queries');
      console.log('   2. Verify contextual responses for each grade');
      console.log('   3. Deploy and test in production environment');
      
    } else {
      console.log('\n❌ No embeddings were successfully generated.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();