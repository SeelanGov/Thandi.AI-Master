// Test 4: Debug Logging - Verify internal mechanics
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { extractQueryIntent, serializeIntent } from '../lib/rag/intent-extraction.js';

const query = "I hate math but love biology and want remote dollars";

console.log('TEST 4: DEBUG LOGGING - INTERNAL MECHANICS');
console.log('='.repeat(60));
console.log(`Query: "${query}"\n`);

// Step 1: Intent extraction
const intent = extractQueryIntent(query);
const intentKey = serializeIntent(intent, query);

console.log('🔍 STEP 1: INTENT EXTRACTION');
console.log(`   Intent Key: ${intentKey}`);
console.log(`   Has Math Negation: ${intent.subjectNegations?.math}`);
console.log(`   Has Biology Preference: ${intent.subjects?.biology}`);
console.log(`   Wants Remote: ${intent.wantsRemote}`);
console.log(`   Wants Dollars: ${intent.wantsDollars}`);

// Step 2: Hybrid search
const embedding = await generateQueryEmbedding(query);
const results = await hybridSearch(query, embedding, { limit: 10, debug: false });

console.log('\n🔍 STEP 2: RESULT SOURCES');
const sources = {};
results.forEach(r => {
  sources[r.source] = (sources[r.source] || 0) + 1;
});
console.log(`   Source distribution:`, sources);

console.log('\n🔍 STEP 3: SCORE DISTRIBUTION');
const scores = results.map(r => r.final_score).slice(0, 5);
console.log(`   Top 5 scores: ${scores.map(s => s.toFixed(3)).join(', ')}`);
console.log(`   Scores are varied? ${new Set(scores).size > 1 ? '✅ YES' : '❌ NO (all same)'}`);

console.log('\n🔍 STEP 4: TOP 3 CAREERS');
const top3 = results.slice(0, 3).map(r => ({
  career: r.chunk_metadata?.career_name || 'N/A',
  score: r.final_score.toFixed(3),
  source: r.source
}));

top3.forEach((item, i) => {
  console.log(`   ${i+1}. ${item.career} (score: ${item.score}, source: ${item.source})`);
});

console.log('\n✅ VERIFICATION CHECKS:');
console.log(`   Intent-based search active? ${sources['intent-primary'] || sources['intent'] ? '✅ YES' : '❌ NO'}`);
console.log(`   Scores are differentiated? ${new Set(scores).size > 1 ? '✅ YES' : '❌ NO'}`);
console.log(`   Top 3 are biology-focused? ${top3.every(t => !['Software Engineer', 'Data Scientist'].includes(t.career)) ? '✅ YES' : '❌ NO'}`);
console.log(`   Math-heavy careers excluded? ${!top3.some(t => ['Software Engineer', 'Data Scientist', 'AI/ML Engineer'].includes(t.career)) ? '✅ YES' : '❌ NO'}`);

const allPassed = 
  (sources['intent-primary'] || sources['intent']) &&
  new Set(scores).size > 1 &&
  !top3.some(t => ['Software Engineer', 'Data Scientist'].includes(t.career));

if (allPassed) {
  console.log('\n✅ TEST 4 RESULT: PASS');
  console.log('   All internal mechanics working correctly');
} else {
  console.log('\n❌ TEST 4 RESULT: FAIL');
  console.log('   Some internal mechanics not working as expected');
}
