/**
 * Quick Database Status Check
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...');
    
    // Method 1: Direct count
    const { data: chunks, error } = await supabase
      .from('knowledge_chunks')
      .select('id, chunk_metadata');
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Total embeddings: ${chunks.length}`);
    
    // Curriculum distribution
    const curriculumStats = {};
    chunks.forEach(chunk => {
      const curriculum = chunk.chunk_metadata?.curriculum || 'unknown';
      curriculumStats[curriculum] = (curriculumStats[curriculum] || 0) + 1;
    });
    
    console.log('\n📚 Curriculum Distribution:');
    Object.entries(curriculumStats).forEach(([curriculum, count]) => {
      console.log(`   ${curriculum.toUpperCase()}: ${count} embeddings`);
    });
    
    // Check for IEB content specifically
    const iebChunks = chunks.filter(chunk => 
      chunk.chunk_metadata?.curriculum === 'ieb'
    );
    
    console.log(`\n🎓 IEB-specific embeddings: ${iebChunks.length}`);
    
    if (iebChunks.length > 0) {
      console.log('   Sample IEB subjects:');
      const subjects = [...new Set(iebChunks
        .map(chunk => chunk.chunk_metadata?.subject_name)
        .filter(Boolean)
        .slice(0, 5)
      )];
      subjects.forEach(subject => console.log(`     - ${subject}`));
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();