#!/usr/bin/env node

/**
 * Ingest Updated 2026 Knowledge Base Files
 * Processes the updated JSON files and inserts them into the vector store
 * Focus: IEB subject combinations v1.1.0-2026, university thresholds v2.1.0-2026, 
 *        bursaries v3.1.0-2026, scholarships v3.1.0-2026
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration
const EMBEDDING_MODEL = 'text-embedding-ada-002';
const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 150; // characters
const BATCH_SIZE = 5; // Process 5 chunks at a time to avoid rate limits

// Priority files to update (2026 versions)
const PRIORITY_FILES = [
  'thandi_knowledge_base/ieb/requirements/subject_combinations.json',
  'thandi_knowledge_base/university/program_thresholds.json', 
  'thandi_knowledge_base/financial_aid/bursaries.json',
  'thandi_knowledge_base/international/scholarships.json'
];

class KnowledgeBaseIngester {
  constructor() {
    this.processedFiles = 0;
    this.totalChunks = 0;
    this.failedChunks = 0;
    this.moduleCache = new Map();
  }

  async run() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 THANDI 2026 KNOWLEDGE BASE INGESTION');
    console.log('   Processing Updated JSON Files for Vector Store');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
      // Load module cache
      await this.loadModuleCache();
      
      // Process priority files first
      console.log('📋 Processing Priority 2026 Files...\n');
      for (const filePath of PRIORITY_FILES) {
        await this.processFile(filePath, true);
      }

      // Process remaining files
      console.log('\n📁 Processing Remaining Knowledge Base Files...\n');
      await this.processDirectory('thandi_knowledge_base');

      this.generateSummary();

    } catch (error) {
      console.error('❌ Ingestion failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  async loadModuleCache() {
    console.log('🔄 Loading knowledge modules...');
    
    const { data: modules, error } = await supabase
      .from('knowledge_modules')
      .select('id, module_name');
    
    if (error) throw error;
    
    modules.forEach(module => {
      this.moduleCache.set(module.module_name, module.id);
    });
    
    console.log(`   ✅ Loaded ${modules.length} modules\n`);
  }

  async processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        await this.processDirectory(fullPath);
      } else if (item.name.endsWith('.json')) {
        // Skip if already processed as priority file
        if (!PRIORITY_FILES.includes(fullPath)) {
          await this.processFile(fullPath, false);
        }
      }
    }
  }

  async processFile(filePath, isPriority = false) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Skip if no kb_id (not a knowledge base file)
      if (!jsonData.kb_id) {
        return;
      }

      const priority = isPriority ? '🔥 PRIORITY' : '📄';
      console.log(`${priority} Processing: ${filePath}`);
      console.log(`   KB ID: ${jsonData.kb_id}`);
      console.log(`   Version: ${jsonData.version || 'N/A'}`);

      // Determine module name from file path
      const moduleName = this.extractModuleName(filePath, jsonData);
      const moduleId = this.moduleCache.get(moduleName);
      
      if (!moduleId) {
        console.warn(`   ⚠️  Module not found: ${moduleName}, skipping...`);
        return;
      }

      // Delete existing chunks for this kb_id to avoid duplicates
      await this.deleteExistingChunks(jsonData.kb_id);

      // Generate chunks from JSON content
      const chunks = this.generateChunks(jsonData, moduleName);
      
      if (chunks.length === 0) {
        console.warn(`   ⚠️  No chunks generated from ${filePath}`);
        return;
      }

      // Insert chunks with embeddings
      const insertedCount = await this.insertChunks(chunks, moduleId, jsonData.kb_id);
      
      console.log(`   ✅ Inserted: ${insertedCount}/${chunks.length} chunks`);
      this.processedFiles++;
      this.totalChunks += insertedCount;

      // Rate limiting
      await this.sleep(500);

    } catch (error) {
      console.error(`   ❌ Failed to process ${filePath}: ${error.message}`);
    }
  }

  extractModuleName(filePath, jsonData) {
    // Extract module name from file path
    const pathParts = filePath.split('/');
    
    // Map file paths to module names
    const moduleMap = {
      'ieb': 'ieb_curriculum',
      'caps': 'caps_curriculum', 
      'university': 'sa_universities',
      'financial_aid': 'bursaries',
      'international': 'international_pathways',
      'careers': 'careers',
      'comparison': 'curriculum_comparison',
      'seta_pathways': 'seta_learnership_framework',
      'rag': 'rag_templates',
      'system': 'system_framework',
      'curriculum_gates': 'curriculum_gates'
    };

    // Find the first matching directory
    for (const [dir, module] of Object.entries(moduleMap)) {
      if (pathParts.includes(dir)) {
        return module;
      }
    }

    // Fallback to generic module
    return 'unknown';
  }

  async deleteExistingChunks(kbId) {
    const { error } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('source_entity_id', kbId);
    
    if (error && !error.message.includes('No rows found')) {
      console.warn(`   ⚠️  Could not delete existing chunks: ${error.message}`);
    }
  }

  generateChunks(jsonData, moduleName) {
    const chunks = [];
    
    // Convert JSON to searchable text
    const textContent = this.jsonToText(jsonData);
    
    // Split into chunks
    const textChunks = this.chunkText(textContent, CHUNK_SIZE, CHUNK_OVERLAP);
    
    textChunks.forEach((chunkText, index) => {
      chunks.push({
        chunk_text: chunkText,
        chunk_metadata: {
          source: `kb_${jsonData.kb_id}`,
          kb_id: jsonData.kb_id,
          version: jsonData.version,
          chunk_index: index,
          total_chunks: textChunks.length,
          module_name: moduleName,
          last_verified: jsonData.last_verified,
          query_triggers: jsonData.query_triggers || [],
          curriculum_match_boost: jsonData.rag?.curriculum_match_boost || 1.5
        }
      });
    });

    return chunks;
  }

  jsonToText(jsonData) {
    let text = '';
    
    // Add title/description
    if (jsonData.kb_id) {
      text += `Knowledge Base: ${jsonData.kb_id}\n`;
    }
    if (jsonData.version) {
      text += `Version: ${jsonData.version}\n`;
    }
    
    // Process main content based on structure
    if (jsonData.recommended_combinations) {
      // IEB subject combinations
      text += '\n## Subject Combinations\n';
      for (const [pathway, details] of Object.entries(jsonData.recommended_combinations)) {
        text += `\n### ${pathway}\n`;
        text += `Core subjects: ${details.core?.join(', ')}\n`;
        text += `Recommended subjects: ${details.recommended?.join(', ')}\n`;
        text += `Career paths: ${details.careers?.join(', ')}\n`;
        if (details.notes_2026) {
          text += `2026 Update: ${details.notes_2026}\n`;
        }
      }
    }
    
    if (jsonData.universities) {
      // University thresholds
      text += '\n## University Programs\n';
      for (const uni of jsonData.universities) {
        text += `\n### ${uni.name}\n`;
        for (const [program, details] of Object.entries(uni.programs)) {
          text += `${program}: APS ${details.aps_min}+, ${details.subjects?.join(', ')}\n`;
        }
      }
    }
    
    if (jsonData.bursaries) {
      // Bursaries
      text += '\n## Bursaries and Financial Aid\n';
      for (const bursary of jsonData.bursaries) {
        text += `\n### ${bursary.name}\n`;
        text += `Eligibility: ${bursary.eligibility}\n`;
        text += `Amount: ${bursary.amounts}\n`;
        text += `Deadline: ${bursary.deadlines}\n`;
        text += `Application: ${bursary.application}\n`;
      }
    }
    
    if (jsonData.scholarships) {
      // International scholarships
      text += '\n## International Scholarships\n';
      for (const scholarship of jsonData.scholarships) {
        text += `\n### ${scholarship.name}\n`;
        text += `Eligibility: ${scholarship.eligibility}\n`;
        text += `Amount: ${scholarship.amounts}\n`;
        text += `Deadline: ${scholarship.deadlines}\n`;
        text += `Success Rate: ${scholarship.sa_success_rate}\n`;
      }
    }
    
    // Add notes
    if (jsonData.notes) {
      text += `\n## Important Notes\n${jsonData.notes}\n`;
    }
    
    // Add query triggers for better searchability
    if (jsonData.query_triggers) {
      text += `\n## Search Terms\n${jsonData.query_triggers.join(', ')}\n`;
    }
    
    return text.trim();
  }

  chunkText(text, maxChars = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentLength = 0;
    
    for (const sentence of sentences) {
      const sentenceLength = sentence.length;
      
      if (currentLength + sentenceLength > maxChars && currentChunk.length > 0) {
        // Save current chunk
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + sentence;
        currentLength = overlapText.length + sentenceLength;
      } else {
        currentChunk += sentence + '.';
        currentLength += sentenceLength + 1;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  async insertChunks(chunks, moduleId, kbId) {
    let insertedCount = 0;
    
    // Process in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      
      for (const chunk of batch) {
        try {
          // Generate embedding
          const embedding = await this.generateEmbedding(chunk.chunk_text);
          
          // Insert chunk
          const { error } = await supabase
            .from('knowledge_chunks')
            .insert({
              module_id: moduleId,
              source_entity_id: kbId,
              source_entity_type: 'knowledge_base_json',
              chunk_text: chunk.chunk_text,
              chunk_metadata: chunk.chunk_metadata,
              embedding: JSON.stringify(embedding)
            });
          
          if (error) throw error;
          
          insertedCount++;
          
          // Rate limiting
          await this.sleep(100);
          
        } catch (error) {
          console.error(`     ❌ Failed to insert chunk: ${error.message}`);
          this.failedChunks++;
        }
      }
    }
    
    return insertedCount;
  }

  async generateEmbedding(text) {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    });
    
    return response.data[0].embedding;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateSummary() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ 2026 KNOWLEDGE BASE INGESTION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 SUMMARY:`);
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total chunks inserted: ${this.totalChunks}`);
    console.log(`   Failed chunks: ${this.failedChunks}`);
    console.log(`   Success rate: ${((this.totalChunks / (this.totalChunks + this.failedChunks)) * 100).toFixed(1)}%`);
    
    console.log('\n🔥 PRIORITY FILES UPDATED:');
    PRIORITY_FILES.forEach(file => {
      console.log(`   ✅ ${file}`);
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Test RAG queries with 2026 data');
    console.log('   2. Verify assessment form integration');
    console.log('   3. Check response accuracy for current deadlines');
    console.log('   4. Monitor system performance');
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// Run the ingestion
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.replace(/\\/g, '/') === `file://${process.argv[1].replace(/\\/g, '/')}`;

if (isMainModule) {
  const ingester = new KnowledgeBaseIngester();
  ingester.run().catch(console.error);
}

export default KnowledgeBaseIngester;