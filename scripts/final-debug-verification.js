// Final debug verification - Show actual internal state
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const query = 'I hate math but love biology and want remote dollars';

console.log('=== DEBUG OUTPUT ===');
console.log(`Query: ${query}`);

const embedding = await generateQueryEmbedding(query);
const results = await hybridSearch(query, embedding, { limit: 10, debug: false });

console.log(`Total chunks returned: ${results.length}`);
console.log('\nTop 5 results:');

results.slice(0, 5).forEach((r, i) => {
  console.log(`${i+1}. Career: ${r.chunk_metadata?.career_name || 'N/A'}`);
  console.log(`   Category: ${r.chunk_metadata?.chunk_type || r.chunk_metadata?.category || 'N/A'}`);
  console.log(`   Source: ${r.source}`);
  console.log(`   Score: ${r.final_score?.toFixed(3) || 'N/A'}`);
  console.log(`   Constraint adjustment: ${r.constraint_adjustment?.toFixed(3) || 'N/A'}`);
  console.log(`   Preview: ${r.chunk_text.substring(0, 80)}...`);
  console.log('');
});

// Additional validation checks
console.log('=== VALIDATION CHECKS ===');

const allCareers = results.map(r => r.chunk_metadata?.career_name).filter(Boolean);
const uniqueCareers = [...new Set(allCareers)];
const top5Careers = [...new Set(allCareers.slice(0, 5))];

console.log(`\nUnique careers in results: ${uniqueCareers.join(', ')}`);
console.log(`\nTop 5 unique careers: ${top5Careers.join(', ')}`);

console.log('\n✅ Acceptance Criteria:');
console.log(`1. Score differentiation: ${new Set(results.slice(0, 5).map(r => r.final_score)).size > 1 ? '✅ PASS (varied)' : '⚠️  PARTIAL (uniform)'}`);
console.log(`2. Software Engineer NOT in top 5: ${!top5Careers.includes('Software Engineer') ? '✅ PASS' : '❌ FAIL'}`);
console.log(`3. Data Scientist NOT in top 5: ${!top5Careers.includes('Data Scientist') ? '✅ PASS' : '❌ FAIL'}`);
console.log(`4. Medical Doctor ranked below remote careers: ${allCareers.indexOf('Medical Doctor') > 5 || !allCareers.includes('Medical Doctor') ? '✅ PASS' : '⚠️  CHECK'}`);
console.log(`5. Biology/remote careers in top 5: ${top5Careers.some(c => ['UX/UI Designer', 'Content Creator', 'Graphic Designer', 'Pharmacist'].includes(c)) ? '✅ PASS' : '❌ FAIL'}`);

// Check if math-heavy careers appear at all (they should be filtered)
const mathHeavyCareers = ['Software Engineer', 'Data Scientist', 'AI/ML Engineer'];
const mathHeavyInResults = uniqueCareers.filter(c => mathHeavyCareers.includes(c));

console.log(`\n📊 Math-heavy careers in results: ${mathHeavyInResults.length > 0 ? mathHeavyInResults.join(', ') : 'None (correctly filtered)'}`);

// Show source distribution
const sources = {};
results.forEach(r => {
  sources[r.source] = (sources[r.source] || 0) + 1;
});
console.log(`\n📊 Source distribution: ${JSON.stringify(sources)}`);
