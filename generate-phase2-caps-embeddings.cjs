#!/usr/bin/env node

/**
 * Phase 2 CAPS Embedding Generation Script
 * 
 * Focused script to generate embeddings specifically for the 8 new Phase 2 CAPS files:
 * - agricultural-sciences.md
 * - consumer-studies.md  
 * - tourism.md
 * - hospitality-studies.md
 * - marine-sciences.md
 * - engineering-graphics-design.md
 * - isizulu-home-language.md
 * - isixhosa-home-language.md
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Phase 2 CAPS files to process
const PHASE2_CAPS_FILES = [
  'agricultural-sciences.md',
  'consumer-studies.md',
  'tourism.md', 
  'hospitality-studies.md',
  'marine-sciences.md',
  'engineering-graphics-design.md',
  'isizulu-home-language.md',
  'isixhosa-home-language.md'
];

const CAPS_SUBJECTS_DIR = path.join(__dirname, 'thandi_knowledge_base', 'caps', 'subjects');

/**
 * Extract metadata from markdown file
 */
function extractMetadata(content, filePath) {
  const lines = content.split('\n');
  const metadata = {};
  let inFrontmatter = false;
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        contentStart = i + 1;
        break;
      }
    }
    
    if (inFrontmatter && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      metadata[key.trim()] = value;
    }
  }

  // Extract content without frontmatter
  const mainContent = lines.slice(contentStart).join('\n').trim();
  
  // Determine curriculum and subject from file path
  const fileName = path.basename(filePath, '.md');
  metadata.curriculum = 'CAPS';
  metadata.subject = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  metadata.file_path = filePath;
  
  return { metadata, content: mainContent };
}

/**
 * Generate embedding using OpenAI
 */
async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Split content into chunks
 */
function splitIntoChunks(content, maxChunkSize = 1000) {
  const chunks = [];
  const paragraphs = content.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Insert chunk into database
 */
async function insertChunk(chunk, metadata, embedding, chunkIndex) {
  try {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .insert({
        chunk_text: chunk,
        embedding: embedding,
        chunk_metadata: {
          curriculum: metadata.curriculum,
          subject: metadata.subject,
          file_path: metadata.file_path,
          chunk_index: chunkIndex,
          ...metadata
        }
      });

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting chunk:', error);
    throw error;
  }
}

/**
 * Process a single CAPS file
 */
async function processFile(fileName) {
  const filePath = path.join(CAPS_SUBJECTS_DIR, fileName);
  
  console.log(`\n📄 Processing: ${fileName}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return { processed: false, chunks: 0 };
  }

  try {
    // Read and parse file
    const content = fs.readFileSync(filePath, 'utf8');
    const { metadata, content: mainContent } = extractMetadata(content, filePath);
    
    console.log(`   📋 Subject: ${metadata.subject}`);
    console.log(`   🎓 Curriculum: ${metadata.curriculum}`);
    
    // Split into chunks
    const chunks = splitIntoChunks(mainContent);
    console.log(`   📦 Chunks: ${chunks.length}`);
    
    let processedChunks = 0;
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate embedding
        const embedding = await generateEmbedding(chunk);
        
        // Insert into database
        await insertChunk(chunk, metadata, embedding, i);
        
        processedChunks++;
        process.stdout.write(`   ⚡ Chunk ${i + 1}/${chunks.length} processed\r`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`\n   ❌ Error processing chunk ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n   ✅ Completed: ${processedChunks}/${chunks.length} chunks`);
    return { processed: true, chunks: processedChunks };
    
  } catch (error) {
    console.error(`   ❌ Error processing file:`, error.message);
    return { processed: false, chunks: 0 };
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Phase 2 CAPS Embedding Generation Started');
  console.log('=' .repeat(50));
  
  // Debug environment loading
  console.log('🔧 Environment check:');
  console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   CAPS Directory: ${CAPS_SUBJECTS_DIR}`);
  
  // Verify environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase credentials not found in environment');
    process.exit(1);
  }
  
  // Test database connection
  console.log('🔗 Testing database connection...');
  try {
    const { data, error } = await supabase.from('knowledge_chunks').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  // Check if CAPS directory exists
  if (!fs.existsSync(CAPS_SUBJECTS_DIR)) {
    console.error(`❌ CAPS subjects directory not found: ${CAPS_SUBJECTS_DIR}`);
    process.exit(1);
  }
  
  console.log(`📁 Processing ${PHASE2_CAPS_FILES.length} Phase 2 CAPS files...`);
  
  let totalProcessed = 0;
  let totalChunks = 0;
  const results = [];
  
  // Process each Phase 2 file
  for (const fileName of PHASE2_CAPS_FILES) {
    const result = await processFile(fileName);
    results.push({ fileName, ...result });
    
    if (result.processed) {
      totalProcessed++;
      totalChunks += result.chunks;
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 PHASE 2 CAPS EMBEDDING GENERATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Files Processed: ${totalProcessed}/${PHASE2_CAPS_FILES.length}`);
  console.log(`📦 Total Chunks: ${totalChunks}`);
  console.log(`🎯 Success Rate: ${((totalProcessed / PHASE2_CAPS_FILES.length) * 100).toFixed(1)}%`);
  
  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.processed ? '✅' : '❌';
    console.log(`   ${status} ${result.fileName}: ${result.chunks} chunks`);
  });
  
  // Verify database insertion
  console.log('\n🔍 Verifying database insertion...');
  try {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('chunk_metadata')
      .eq('chunk_metadata->>curriculum', 'CAPS');
    
    if (error) throw error;
    
    const capsCount = data.length;
    console.log(`📊 CAPS chunks in database: ${capsCount}`);
    
    // Count Phase 2 specific subjects
    const phase2Subjects = data.filter(chunk => {
      const subject = chunk.chunk_metadata?.subject?.toLowerCase().replace(/\s+/g, '-');
      return PHASE2_CAPS_FILES.some(file => file.replace('.md', '') === subject);
    });
    
    console.log(`🎯 Phase 2 chunks in database: ${phase2Subjects.length}`);
    
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
  }
  
  console.log('\n🎉 Phase 2 CAPS embedding generation complete!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}