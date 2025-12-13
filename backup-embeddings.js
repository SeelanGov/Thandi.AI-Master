import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backupEmbeddings() {
  console.log('💾 Backing up knowledge_chunks table...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backups/knowledge_chunks_final_${timestamp}.json`;
  
  try {
    // Get all embeddings
    const { data: embeddings, error } = await supabase
      .from('knowledge_chunks')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    console.log(`✅ Retrieved ${embeddings.length} embeddings`);
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups');
    }
    
    // Save to JSON file
    fs.writeFileSync(filename, JSON.stringify(embeddings, null, 2));
    
    console.log(`✅ Backup saved to: ${filename}`);
    console.log(`📊 Backup contains ${embeddings.length} embeddings`);
    
    // Show curriculum distribution
    const curriculumCounts = {};
    embeddings.forEach(row => {
      const curriculum = row.chunk_metadata?.curriculum || 'unknown';
      curriculumCounts[curriculum] = (curriculumCounts[curriculum] || 0) + 1;
    });
    
    console.log('\n📈 Backup curriculum distribution:');
    Object.entries(curriculumCounts).forEach(([curriculum, count]) => {
      console.log(`  ${curriculum.toUpperCase()}: ${count} embeddings`);
    });
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

backupEmbeddings().catch(console.error);