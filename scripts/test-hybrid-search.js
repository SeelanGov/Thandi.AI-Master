// scripts/test-hybrid-search.js
// Test the new hybrid search implementation

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

const testQueries = [
  {
    name: 'TEST-1: Creative + Tech',
    query: 'I want something creative but also tech',
    expectedCareers: ['ux_ui_designer', 'graphic_designer', 'content_creator']
  },
  {
    name: 'TEST-2: No University',
    query: "I don't want to go to university but need good salary",
    expectedCareers: ['electrician', 'chef', 'software_engineer']
  },
  {
    name: 'TEST-3: No Matric',
    query: "I don't have matric what can I do",
    expectedCareers: ['electrician', 'chef', 'content_creator']
  },
  {
    name: 'TEST-4: Remote Dollars',
    query: 'work from home earn dollars',
    expectedCareers: ['software_engineer', 'ux_ui_designer', 'data_scientist']
  },
  {
    name: 'TEST-5: Fast Earnings',
    query: 'fast money quick start earning',
    expectedCareers: ['electrician', 'chef', 'renewable_energy_engineer']
  },
  {
    name: 'TEST-6: Biology + Tech',
    query: 'I like biology and technology',
    expectedCareers: ['medical_doctor', 'pharmacist', 'data_scientist']
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    // Generate embedding
    const embedding = await generateQueryEmbedding(testCase.query);
    
    // Run hybrid search
    const results = await hybridSearch(testCase.query, embedding, { 
      limit: 10,
      debug: true 
    });
    
    // Analyze results
    console.log(`\n📊 RESULTS ANALYSIS:`);
    console.log(`Total chunks: ${results.length}`);
    
    // Extract careers from results
    const foundCareers = new Set();
    results.forEach(r => {
      // Check both career and career_name fields
      if (r.chunk_metadata?.career) {
        foundCareers.add(r.chunk_metadata.career);
      } else if (r.chunk_metadata?.career_name) {
        // Convert display name to slug
        const slug = r.chunk_metadata.career_name.toLowerCase().replace(/[\/\s]+/g, '_');
        foundCareers.add(slug);
      }
    });
    
    console.log(`\nCareers found: ${Array.from(foundCareers).join(', ') || 'None'}`);
    console.log(`Expected: ${testCase.expectedCareers.join(', ')}`);
    
    // Check if expected careers are present
    const matches = testCase.expectedCareers.filter(career => 
      foundCareers.has(career)
    );
    
    const score = (matches.length / testCase.expectedCareers.length) * 5;
    console.log(`\n⭐ Score: ${score.toFixed(1)}/5.0 (${matches.length}/${testCase.expectedCareers.length} expected careers found)`);
    
    // Show top 5 results
    console.log(`\n📋 Top 5 Results:`);
    results.slice(0, 5).forEach((r, i) => {
      const career = r.chunk_metadata?.career || r.chunk_metadata?.career_name || 'N/A';
      const category = r.chunk_metadata?.category || r.chunk_metadata?.chunk_type || 'N/A';
      console.log(`${i+1}. [${r.source}] ${career} - ${category} (score: ${r.final_score.toFixed(3)})`);
    });
    
    return { success: true, score, foundCareers: Array.from(foundCareers) };
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🧪 HYBRID SEARCH VALIDATION SUITE\n');
  
  const results = [];
  
  for (const testCase of testQueries) {
    const result = await runTest(testCase);
    results.push({ ...testCase, ...result });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const successfulTests = results.filter(r => r.success);
  const averageScore = successfulTests.reduce((sum, r) => sum + (r.score || 0), 0) / successfulTests.length;
  
  console.log(`\nTests completed: ${successfulTests.length}/${results.length}`);
  console.log(`Average score: ${averageScore.toFixed(2)}/5.0`);
  console.log(`Target: 4.5+/5.0`);
  
  if (averageScore >= 4.5) {
    console.log(`\n✅ VALIDATION PASSED - Ready for pilot!`);
  } else if (averageScore >= 4.0) {
    console.log(`\n⚠️  VALIDATION PARTIAL - Close to target, minor tuning needed`);
  } else {
    console.log(`\n❌ VALIDATION FAILED - Needs more work`);
  }
  
  return results;
}

// Run single test if query provided
if (process.argv[2]) {
  const customQuery = process.argv.slice(2).join(' ');
  console.log('🎯 CUSTOM QUERY TEST\n');
  
  (async () => {
    try {
      const embedding = await generateQueryEmbedding(customQuery);
      const results = await hybridSearch(customQuery, embedding, { 
        limit: 10,
        debug: true 
      });
      
      console.log(`\n📋 Results (${results.length} chunks):`);
      results.forEach((r, i) => {
        const career = r.chunk_metadata?.career || r.chunk_metadata?.career_name || 'N/A';
        const category = r.chunk_metadata?.category || r.chunk_metadata?.chunk_type || 'N/A';
        console.log(`${i+1}. [${r.source}] ${career} - ${category}`);
        console.log(`   Score: ${r.final_score.toFixed(3)}`);
        console.log(`   Preview: ${r.chunk_text.substring(0, 100)}...`);
      });
    } catch (error) {
      console.error('Error:', error.message);
    }
  })();
} else {
  // Run all tests
  runAllTests().catch(console.error);
}
