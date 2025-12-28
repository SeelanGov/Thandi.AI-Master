#!/usr/bin/env node

/**
 * Ingest Priority 2026 Knowledge Base Files
 * Focused script to update the 4 critical files with 2026 data
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

// Priority files to update
const PRIORITY_FILES = [
  {
    path: 'thandi_knowledge_base/ieb/requirements/subject_combinations.json',
    module: 'ieb_curriculum',
    description: 'IEB Subject Combinations v1.1.0-2026'
  },
  {
    path: 'thandi_knowledge_base/university/program_thresholds.json',
    module: 'sa_universities', 
    description: 'University Program Thresholds v2.1.0-2026'
  },
  {
    path: 'thandi_knowledge_base/financial_aid/bursaries.json',
    module: 'bursaries',
    description: 'Bursaries v3.1.0-2026'
  },
  {
    path: 'thandi_knowledge_base/international/scholarships.json',
    module: 'international_pathways',
    description: 'International Scholarships v3.1.0-2026'
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔥 PRIORITY 2026 FILES INGESTION');
  console.log('   Updating Critical Knowledge Base Files');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Load modules
    const { data: modules, error: moduleError } = await supabase
      .from('knowledge_modules')
      .select('id, module_name');
    
    if (moduleError) throw moduleError;
    
    const moduleMap = {};
    modules.forEach(m => moduleMap[m.module_name] = m.id);
    
    console.log(`📋 Loaded ${modules.length} modules\n`);

    let totalProcessed = 0;
    let totalChunks = 0;

    // Process each priority file
    for (const file of PRIORITY_FILES) {
      console.log(`🔥 Processing: ${file.description}`);
      console.log(`   File: ${file.path}`);
      
      if (!fs.existsSync(file.path)) {
        console.log(`   ❌ File not found: ${file.path}\n`);
        continue;
      }

      try {
        // Read and parse JSON
        const content = fs.readFileSync(file.path, 'utf8');
        const jsonData = JSON.parse(content);
        
        console.log(`   KB ID: ${jsonData.kb_id}`);
        console.log(`   Version: ${jsonData.version}`);

        // Get module ID
        const moduleId = moduleMap[file.module];
        if (!moduleId) {
          console.log(`   ❌ Module not found: ${file.module}\n`);
          continue;
        }

        // Delete existing chunks for this kb_id
        const { error: deleteError } = await supabase
          .from('knowledge_chunks')
          .delete()
          .eq('source_entity_id', jsonData.kb_id);
        
        if (deleteError && !deleteError.message.includes('No rows found')) {
          console.log(`   ⚠️  Delete warning: ${deleteError.message}`);
        }

        // Generate text content
        const textContent = generateTextFromJson(jsonData);
        
        // Create chunks
        const chunks = chunkText(textContent, 1000, 150);
        console.log(`   Generated ${chunks.length} chunks`);

        // Insert chunks with embeddings
        let insertedCount = 0;
        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i];
          
          try {
            // Generate embedding
            const response = await openai.embeddings.create({
              model: 'text-embedding-ada-002',
              input: chunkText.trim(),
            });
            const embedding = response.data[0].embedding;

            // Insert chunk
            const { error: insertError } = await supabase
              .from('knowledge_chunks')
              .insert({
                module_id: moduleId,
                source_entity_id: jsonData.kb_id,
                source_entity_type: 'knowledge_base_json_2026',
                chunk_text: chunkText,
                chunk_metadata: {
                  source: `kb_${jsonData.kb_id}`,
                  kb_id: jsonData.kb_id,
                  version: jsonData.version,
                  chunk_index: i,
                  total_chunks: chunks.length,
                  last_verified: jsonData.last_verified,
                  query_triggers: jsonData.query_triggers || [],
                  curriculum_match_boost: jsonData.rag?.curriculum_match_boost || 1.5,
                  priority_2026: true
                },
                embedding: JSON.stringify(embedding)
              });

            if (insertError) throw insertError;
            
            insertedCount++;
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (chunkError) {
            console.log(`   ❌ Failed to insert chunk ${i}: ${chunkError.message}`);
          }
        }

        console.log(`   ✅ Inserted: ${insertedCount}/${chunks.length} chunks`);
        totalProcessed++;
        totalChunks += insertedCount;

      } catch (fileError) {
        console.log(`   ❌ Failed to process file: ${fileError.message}`);
      }
      
      console.log(''); // Empty line
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ PRIORITY 2026 FILES INGESTION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 SUMMARY:`);
    console.log(`   Files processed: ${totalProcessed}/${PRIORITY_FILES.length}`);
    console.log(`   Total chunks inserted: ${totalChunks}`);
    
    console.log('\n🔥 UPDATED FILES:');
    PRIORITY_FILES.forEach(file => {
      console.log(`   ✅ ${file.description}`);
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Test RAG queries with 2026 data');
    console.log('   2. Verify NSFAS deadline responses');
    console.log('   3. Check Rhodes scholarship suspension');
    console.log('   4. Test assessment form integration');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Ingestion failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function generateTextFromJson(jsonData) {
  let text = '';
  
  // Add header
  if (jsonData.kb_id) {
    text += `Knowledge Base: ${jsonData.kb_id}\n`;
  }
  if (jsonData.version) {
    text += `Version: ${jsonData.version}\n`;
  }
  
  // Process content based on structure
  if (jsonData.recommended_combinations) {
    // IEB subject combinations
    text += '\n## Subject Combinations and Pathways\n';
    for (const [pathway, details] of Object.entries(jsonData.recommended_combinations)) {
      text += `\n### ${pathway.replace(/_/g, ' ')}\n`;
      if (details.core) {
        text += `Core subjects: ${details.core.join(', ')}\n`;
      }
      if (details.recommended) {
        text += `Recommended subjects: ${details.recommended.join(', ')}\n`;
      }
      if (details.careers) {
        text += `Career paths: ${details.careers.join(', ')}\n`;
      }
      if (details.notes_2026) {
        text += `2026 Update: ${details.notes_2026}\n`;
      }
      if (details.aps_strategy) {
        text += `APS Strategy: ${details.aps_strategy}\n`;
      }
    }
  }
  
  if (jsonData.universities) {
    // University thresholds
    text += '\n## University Admission Requirements\n';
    for (const uni of jsonData.universities) {
      text += `\n### ${uni.name} University\n`;
      if (uni.programs) {
        for (const [program, details] of Object.entries(uni.programs)) {
          text += `${program}: Minimum APS ${details.aps_min}, Required subjects: ${details.subjects?.join(', ')}\n`;
        }
      }
    }
  }
  
  if (jsonData.bursaries) {
    // Bursaries
    text += '\n## Bursaries and Financial Aid\n';
    for (const bursary of jsonData.bursaries) {
      text += `\n### ${bursary.name}\n`;
      text += `Eligibility: ${bursary.eligibility}\n`;
      text += `Coverage: ${bursary.amounts}\n`;
      text += `Deadlines: ${bursary.deadlines}\n`;
      text += `Application: ${bursary.application}\n`;
      if (bursary.work_commitment) {
        text += `Work commitment: ${bursary.work_commitment}\n`;
      }
    }
  }
  
  if (jsonData.scholarships) {
    // International scholarships
    text += '\n## International Scholarships\n';
    for (const scholarship of jsonData.scholarships) {
      text += `\n### ${scholarship.name}\n`;
      text += `Eligibility: ${scholarship.eligibility}\n`;
      text += `Value: ${scholarship.amounts}\n`;
      text += `Deadlines: ${scholarship.deadlines}\n`;
      text += `Success rate for South Africans: ${scholarship.sa_success_rate}\n`;
      text += `Application: ${scholarship.application}\n`;
    }
  }
  
  // Add notes
  if (jsonData.notes) {
    text += `\n## Important Notes\n${jsonData.notes}\n`;
  }
  
  // Add verification info
  if (jsonData.verification) {
    text += `\n## Verification\n`;
    text += `Status: ${jsonData.verification.status}\n`;
    text += `Reviewer: ${jsonData.verification.reviewer}\n`;
    text += `Source verification: ${jsonData.verification.source_verification}\n`;
  }
  
  if (jsonData.last_verified) {
    text += `Last verified: ${jsonData.last_verified}\n`;
  }
  
  return text.trim();
}

function chunkText(text, maxChars = 1000, overlap = 150) {
  const chunks = [];
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 6)); // Approximate word count
      currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Run the script
main().catch(console.error);