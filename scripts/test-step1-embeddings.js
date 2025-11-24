// Test STEP 1: Query Embedding Generation
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { testEmbeddingGeneration } from '../lib/rag/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 STEP 1 TEST: Query Embedding Generation');
console.log('═══════════════════════════════════════════════════════\n');

testEmbeddingGeneration()
  .then(result => {
    if (result.success) {
      console.log('\n✅ STEP 1 COMPLETE: Embedding generation working!');
      console.log('   Ready to proceed to STEP 2 (Vector Search)');
    } else {
      console.log('\n❌ STEP 1 FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  });
