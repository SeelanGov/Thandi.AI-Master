/**
 * Backup Current Embeddings Script
 * Creates a backup of all current embeddings before testing
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backupEmbeddings() {
  try {
    console.log('🔄 Starting embeddings backup...');
    
    // Get all embeddings
    const { data: embeddings, error } = await supabase
      .from('knowledge_chunks')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 Found ${embeddings.length} embeddings to backup`);
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');
    
    // Ensure backups directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `knowledge_chunks_final_${timestamp}.json`);
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(embeddings, null, 2));
    
    // Get file size
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup created successfully:`);
    console.log(`   File: ${backupFile}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log(`   Embeddings: ${embeddings.length}`);
    
    // Analyze curriculum distribution
    const curriculumStats = {};
    embeddings.forEach(embedding => {
      const curriculum = embedding.chunk_metadata?.curriculum || 'unknown';
      curriculumStats[curriculum] = (curriculumStats[curriculum] || 0) + 1;
    });
    
    console.log('\n📈 Curriculum Distribution:');
    Object.entries(curriculumStats).forEach(([curriculum, count]) => {
      console.log(`   ${curriculum.toUpperCase()}: ${count} embeddings`);
    });
    
    return {
      success: true,
      backupFile,
      totalEmbeddings: embeddings.length,
      fileSizeMB,
      curriculumStats
    };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backupEmbeddings().then(result => {
    if (result.success) {
      console.log('\n🎉 Backup completed successfully!');
    } else {
      console.log('\n💥 Backup failed!');
      process.exit(1);
    }
  });
}

export { backupEmbeddings };