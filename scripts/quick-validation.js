import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';

const TEST_QUERIES = [
  {
    id: 'TEST-1',
    query: "I'm creative but also like technology—what careers combine both?",
    expectedCareers: ['UX/UI Designer', 'Graphic Designer', 'Content Creator', 'Software Engineer']
  },
  {
    id: 'TEST-2',
    query: "I don't want university but need good salary—what are my options?",
    expectedCareers: ['Electrician', 'Chef', 'Software Engineer', 'Content Creator']
  },
  {
    id: 'TEST-3',
    query: "I might not get matric—what careers can I still do?",
    expectedCareers: ['Electrician', 'Chef', 'Content Creator']
  },
  {
    id: 'TEST-4',
    query: "I want to work remotely and earn dollars—what should I study?",
    expectedCareers: ['Software Engineer', 'UX/UI Designer', 'Data Scientist', 'AI/ML Engineer']
  },
  {
    id: 'TEST-5',
    query: "What's the fastest way to start earning after matric?",
    expectedCareers: ['Electrician', 'Chef', 'Content Creator']
  },
  {
    id: 'TEST-6',
    query: "I love biology AND tech—what are my options?",
    expectedCareers: ['Medical Doctor', 'Pharmacist', 'Data Scientist']
  }
];

async function quickValidation() {
  console.log('🎯 QUICK VALIDATION: Career Retrieval Check\n');
  console.log('Testing if semantic search finds the right careers...\n');
  console.log('═'.repeat(80));

  const results = [];

  for (const test of TEST_QUERIES) {
    console.log(`\n${test.id}: ${test.query.substring(0, 60)}...`);
    console.log('─'.repeat(80));

    try {
      const embedding = await generateQueryEmbedding(test.query);
      const chunks = await semanticSearch(embedding, {
        limit: 10,
        threshold: 0.55,
        moduleNames: null,
        queryText: test.query
      });

      console.log(`\n📊 Retrieved ${chunks.length} chunks`);
      
      // Check which expected careers are found
      const foundCareers = [];
      const allText = chunks.map(c => c.chunk_text).join(' ').toLowerCase();
      
      test.expectedCareers.forEach(career => {
        const careerLower = career.toLowerCase();
        if (allText.includes(careerLower) || 
            allText.includes(career.replace(/\//g, ' ').toLowerCase())) {
          foundCareers.push(career);
        }
      });

      const score = foundCareers.length / test.expectedCareers.length;
      const passed = score >= 0.5; // At least 50% of expected careers found

      console.log(`\n✅ Found careers: ${foundCareers.join(', ') || 'None'}`);
      console.log(`❌ Missing: ${test.expectedCareers.filter(c => !foundCareers.includes(c)).join(', ')}`);
      console.log(`📈 Score: ${(score * 100).toFixed(0)}% (${foundCareers.length}/${test.expectedCareers.length})`);
      console.log(`${passed ? '✅ PASS' : '⚠️  NEEDS IMPROVEMENT'}`);

      // Show top 3 chunks
      console.log('\nTop 3 chunks:');
      chunks.slice(0, 3).forEach((chunk, i) => {
        console.log(`  ${i+1}. [${chunk.module_name}] ${chunk.chunk_text.substring(0, 80)}...`);
      });

      results.push({
        test: test.id,
        score,
        passed,
        foundCareers,
        missingCareers: test.expectedCareers.filter(c => !foundCareers.includes(c))
      });

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      results.push({
        test: test.id,
        score: 0,
        passed: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 VALIDATION SUMMARY\n');

  const passedTests = results.filter(r => r.passed).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  results.forEach(r => {
    const status = r.error ? '❌ ERROR' : r.passed ? '✅ PASS' : '⚠️  FAIL';
    console.log(`  ${r.test}: ${status} (${(r.score * 100).toFixed(0)}%)`);
  });

  console.log(`\nOverall: ${passedTests}/${TEST_QUERIES.length} tests passed`);
  console.log(`Average Score: ${(avgScore * 100).toFixed(1)}%`);
  
  if (avgScore >= 0.7) {
    console.log('\n✅ VALIDATION PASSED - Retrieval working well!');
  } else if (avgScore >= 0.5) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some careers being found');
  } else {
    console.log('\n❌ VALIDATION FAILED - Retrieval needs improvement');
  }

  console.log('═'.repeat(80));
}

quickValidation().catch(console.error);
