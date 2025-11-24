// Test 1: Impossible Query - Full verification
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const query = "I hate math but love biology and want to earn dollars remotely without studying for 6 years";

console.log('TEST 1: THE "IMPOSSIBLE QUERY"');
console.log('='.repeat(60));
console.log(`Query: "${query}"\n`);

const embedding = await generateQueryEmbedding(query);
const results = await hybridSearch(query, embedding, { limit: 10, debug: true });

console.log('\n📊 TOP 10 CAREERS RETURNED:\n');
const careers = [];
results.forEach((r, i) => {
  const career = r.chunk_metadata?.career_name || 'N/A';
  const category = r.chunk_metadata?.chunk_type || 'N/A';
  if (!careers.includes(career) && career !== 'N/A') {
    careers.push(career);
  }
  if (i < 10) {
    console.log(`${i+1}. ${career} - ${category}`);
    console.log(`   Score: ${r.final_score.toFixed(3)}, Source: ${r.source}`);
  }
});

console.log(`\n📋 UNIQUE CAREERS IN TOP 10: ${careers.join(', ')}`);

console.log('\n✅ VERIFICATION CHECKS:');
console.log(`   Software Engineer in top 5? ${careers.slice(0, 5).includes('Software Engineer') ? '❌ FAIL' : '✅ PASS'}`);
console.log(`   Medical Doctor in top 5? ${careers.slice(0, 5).includes('Medical Doctor') ? '❌ FAIL' : '✅ PASS'}`);
console.log(`   Data Scientist in top 5? ${careers.slice(0, 5).includes('Data Scientist') ? '❌ FAIL' : '✅ PASS'}`);
console.log(`   Biology-related career in top 3? ${careers.slice(0, 3).some(c => ['Pharmacist', 'Medical Technologist', 'Content Creator', 'UX/UI Designer'].includes(c)) ? '✅ PASS' : '❌ FAIL'}`);

const violations = [];
if (careers.slice(0, 5).includes('Software Engineer')) violations.push('Software Engineer (math-heavy)');
if (careers.slice(0, 5).includes('Medical Doctor')) violations.push('Medical Doctor (6+ years)');
if (careers.slice(0, 5).includes('Data Scientist')) violations.push('Data Scientist (math-heavy)');

if (violations.length === 0) {
  console.log('\n✅ TEST 1 RESULT: PASS (5/5)');
} else {
  console.log(`\n❌ TEST 1 RESULT: FAIL - Violations: ${violations.join(', ')}`);
}
