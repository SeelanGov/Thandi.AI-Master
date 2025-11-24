import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const query = 'I want to make money fast but also want to study for 10 years to become a specialist';
const emb = await generateQueryEmbedding(query);
const results = await hybridSearch(query, emb, { limit: 15, debug: false });

console.log('Top 15 careers:');
results.forEach((chunk, i) => {
  const career = chunk.chunk_metadata?.career_name || 'N/A';
  console.log(`${i+1}. ${career} (score: ${chunk.final_score.toFixed(3)}, source: ${chunk.source})`);
});

const careers = new Set(results.map(r => r.chunk_metadata?.career_name).filter(Boolean));
console.log(`\nUnique careers: ${Array.from(careers).join(', ')}`);
console.log(`Has Medical Doctor: ${careers.has('Medical Doctor')}`);
console.log(`Has Electrician: ${careers.has('Electrician')}`);
