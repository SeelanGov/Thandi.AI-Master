/**
 * Curriculum-Aware Embedding Generation Script
 * 
 * This script generates embeddings with curriculum context preservation:
 * - Reads files from /caps/ and /ieb/ directories
 * - Adds metadata: {curriculum: "caps|ieb", category: "subject|university|requirement"}
 * - Generates embeddings preserving curriculum context
 * 
 * Target: 300+ embeddings (vs current 87)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in environment');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract curriculum and category from file path and content
 * @param {string} filePath - Full path to the file
 * @param {string} content - File content to extract YAML metadata
 * @returns {object} - {curriculum, category, subject_name, university_name}
 */
function extractMetadata(filePath, content) {
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/');
  const pathParts = normalizedPath.split('/');
  
  // Extract YAML frontmatter
  let yamlData = {};
  if (content.startsWith('---')) {
    const yamlEndIndex = content.indexOf('---', 3);
    if (yamlEndIndex !== -1) {
      const yamlContent = content.substring(3, yamlEndIndex);
      try {
        // Simple YAML parsing for our specific format
        yamlContent.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            yamlData[key.trim()] = value;
          }
        });
      } catch (error) {
        console.warn(`Failed to parse YAML in ${filePath}:`, error.message);
      }
    }
  }
  
  // Check if file is in curriculum-specific directory
  if (pathParts.includes('caps')) {
    const curriculum = 'caps';
    const category = pathParts.includes('subjects') ? 'subject' :
                    pathParts.includes('universities') ? 'university' :
                    pathParts.includes('requirements') ? 'requirement' : 'general';
    return { 
      curriculum, 
      category,
      subject_name: yamlData.subject_name || null,
      university_name: yamlData.university_name || null,
      file_path: normalizedPath
    };
  }
  
  if (pathParts.includes('ieb')) {
    const curriculum = 'ieb';
    const category = pathParts.includes('subjects') ? 'subject' :
                    pathParts.includes('universities') ? 'university' :
                    pathParts.includes('requirements') ? 'requirement' : 'general';
    return { 
      curriculum, 
      category,
      subject_name: yamlData.subject_name || null,
      university_name: yamlData.university_name || null,
      file_path: normalizedPath
    };
  }
  
  // Default for shared content
  return { curriculum: 'shared', category: 'general', file_path: normalizedPath };
}

/**
 * Chunk content into smaller pieces for better embedding
 * @param {string} content - File content
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @returns {array} - Array of content chunks
 */
function chunkContent(content, maxChunkSize = 400) {
  const chunks = [];
  
  // For very large files, split by sentences first
  if (content.length > 8000) {
    const sentences = content.split(/[.!?]+\s+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
  } else {
    // For smaller files, split by paragraphs
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
  }
  
  return chunks.filter(chunk => chunk.length > 50 && chunk.length < 2000); // Filter out very small and very large chunks
}

/**
 * Process a single file and generate embeddings
 * @param {string} filePath - Path to the file
 * @returns {array} - Array of embedding objects
 */
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = extractMetadata(filePath, content);
    const chunks = chunkContent(content);
    
    const embeddings = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk,
      });
      
      const embedding = embeddingResponse.data[0].embedding;
      
      embeddings.push({
        chunk_text: chunk,
        embedding,
        chunk_metadata: {
          ...metadata,
          source_file: path.relative(path.join(__dirname, '..'), filePath),
          file_path: metadata.file_path || path.relative(path.join(__dirname, '..'), filePath),
          chunk_index: i,
          total_chunks: chunks.length,
          created_at: new Date().toISOString()
        }
      });
      
      console.log(`✅ Generated embedding for ${metadata.curriculum}/${metadata.category}: ${path.basename(filePath)} (chunk ${i + 1}/${chunks.length})`);
    }
    
    return embeddings;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Recursively find all markdown and text files
 * @param {string} dir - Directory to search
 * @returns {array} - Array of file paths
 */
function findFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (item.match(/\.(md|txt|json|html)$/i)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Curriculum-Aware Embedding Generation');
  console.log('=' .repeat(60));
  
  const knowledgeBaseDir = path.join(__dirname, '..', 'thandi_knowledge_base');
  
  // Find all files
  const allFiles = findFiles(knowledgeBaseDir);
  console.log(`📁 Found ${allFiles.length} files to process`);
  
  // Clear existing embeddings (optional - comment out to keep existing)
  console.log('🗑️ Clearing existing embeddings...');
  await supabase.from('knowledge_chunks').delete().neq('id', 0);
  
  let totalEmbeddings = 0;
  const batchSize = 10; // Process files in batches to avoid rate limits
  
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allFiles.length / batchSize)}`);
    
    const batchPromises = batch.map(processFile);
    const batchResults = await Promise.all(batchPromises);
    
    // Flatten and insert embeddings
    const embeddings = batchResults.flat();
    
    if (embeddings.length > 0) {
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert(embeddings);
      
      if (error) {
        console.error('❌ Error inserting embeddings:', error);
      } else {
        totalEmbeddings += embeddings.length;
        console.log(`✅ Inserted ${embeddings.length} embeddings from batch`);
      }
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 EMBEDDING GENERATION COMPLETE');
  console.log('=' .repeat(60));
  console.log(`📊 Total embeddings generated: ${totalEmbeddings}`);
  console.log(`🎯 Target achieved: ${totalEmbeddings >= 300 ? '✅ YES' : '❌ NO'} (target: 300+)`);
  
  // Verify curriculum distribution
  const { data: curriculumStats } = await supabase
    .from('knowledge_chunks')
    .select('chunk_metadata')
    .then(result => {
      if (result.data) {
        const stats = {};
        result.data.forEach(row => {
          const curriculum = row.chunk_metadata?.curriculum || 'unknown';
          stats[curriculum] = (stats[curriculum] || 0) + 1;
        });
        return { data: stats };
      }
      return { data: {} };
    });
  
  console.log('\n📈 CURRICULUM DISTRIBUTION:');
  Object.entries(curriculumStats || {}).forEach(([curriculum, count]) => {
    console.log(`  ${curriculum.toUpperCase()}: ${count} embeddings`);
  });
}

// Execute if run directly - always run main function
console.log('✅ Running main function...');
main().catch(console.error);

export { main as generateCurriculumEmbeddings };