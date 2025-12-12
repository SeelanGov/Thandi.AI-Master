// Test 2: Conflict Resolution - Full verification
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const query = "I want to make money fast but also want to study for 10 years to become a specialist";

console.log('TEST 2: THE "CONFLICT RESOLUTION"');
console.log('='.repeat(60));
console.log(`Query: "${query}"\n`);

const embedding = await generateQueryEmbedding(query);
const results = await hybridSearch(query, embedding, { limit: 10, debug: true });

console.log('\n📊 TOP 10 CAREERS RETURNED:\n');
const fastPathCareers = [];
const longPathCareers = [];
const allCareers = [];

results.forEach((r, i) => {
  const career = r.chunk_metadata?.career_name || 'N/A';
  const source = r.source;
  
  if (!allCareers.includes(career) && career !== 'N/A') {
    allCareers.push(career);
    
    // Categorize by source
    if (source === 'intent-primary') {
      if (!fastPathCareers.includes(career)) fastPathCareers.push(career);
    } else if (source === 'intent-conflict') {
      if (!longPathCareers.includes(career)) longPathCareers.push(career);
    }
  }
  
  if (i < 10) {
    console.log(`${i+1}. ${career} (${source})`);
  }
});

console.log(`\n📋 CAREER DISTRIBUTION:`);
console.log(`   Fast Path (intent-primary): ${fastPathCareers.join(', ')}`);
console.log(`   Long Path (intent-conflict): ${longPathCareers.join(', ')}`);

console.log('\n✅ VERIFICATION CHECKS:');
const hasFastPath = fastPathCareers.some(c => ['Electrician', 'Chef', 'Renewable Energy Engineer'].includes(c));
const hasLongPath = longPathCareers.some(c => ['Medical Doctor', 'Pharmacist'].includes(c));

console.log(`   Fast path careers present? ${hasFastPath ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Long path careers present? ${hasLongPath ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Both paths in top 10? ${hasFastPath && hasLongPath ? '✅ PASS' : '❌ FAIL'}`);

// Check if conflict was detected
const hasConflictMetadata = results.some(r => r.query_conflicts && r.query_conflicts.length > 0);
console.log(`   Conflict detected in metadata? ${hasConflictMetadata ? '✅ PASS' : '❌ FAIL'}`);

if (hasFastPath && hasLongPath && hasConflictMetadata) {
  console.log('\n✅ TEST 2 RESULT: PASS (5/5)');
  console.log('   System correctly identified conflict and retrieved both paths');
} else {
  console.log('\n❌ TEST 2 RESULT: PARTIAL');
  if (!hasFastPath) console.log('   Missing: Fast path careers');
  if (!hasLongPath) console.log('   Missing: Long path careers');
  if (!hasConflictMetadata) console.log('   Missing: Conflict detection metadata');
}
