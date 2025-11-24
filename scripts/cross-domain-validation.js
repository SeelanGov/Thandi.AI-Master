import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';
import { semanticSearch } from '../lib/rag/search.js';
import { 
  extractStudentProfile, 
  assembleContext, 
  reRankChunks,
  deduplicateChunks 
} from '../lib/rag/retrieval.js';
import { generateResponse } from '../lib/rag/generation.js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Run RAG pipeline for a query
 */
async function queryRAG(queryText) {
  // Extract profile
  const studentProfile = extractStudentProfile(queryText);
  
  // Generate embedding
  const queryEmbedding = await generateQueryEmbedding(queryText);
  
  // Search with LAYER 1 FIX: Lower threshold, no module filtering for cross-domain
  const searchResults = await semanticSearch(queryEmbedding, {
    limit: 10,
    threshold: 0.55, // Lowered from 0.7
    moduleNames: null, // LAYER 2: Remove module filtering to unlock cross-domain
    queryText: queryText // Pass query for context-aware re-ranking
  });
  
  if (process.env.DEBUG_VALIDATION) {
    console.log(`\nSearch Results: ${searchResults.length} chunks found`);
    searchResults.slice(0, 3).forEach((chunk, i) => {
      console.log(`\nChunk ${i+1}:`);
      console.log(`  Module: ${chunk.module_name}`);
      console.log(`  Similarity: ${chunk.similarity}`);
      console.log(`  Preview: ${chunk.chunk_text.substring(0, 150)}...`);
    });
  }
  
  if (searchResults.length === 0) {
    throw new Error('No search results found');
  }
  
  // Re-rank and assemble
  const reRanked = reRankChunks(searchResults, studentProfile);
  const deduplicated = deduplicateChunks(reRanked, 0.9);
  const assembled = assembleContext(deduplicated, studentProfile, {
    maxTokens: 3000,
    format: 'structured'
  });
  
  // Generate response
  const result = await generateResponse(
    queryText,
    assembled.context,
    studentProfile,
    { maxRetries: 2, timeout: 10000 }
  );
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate response');
  }
  
  return result.response;
}

const TEST_QUERIES = [
  {
    id: 'TEST-1',
    name: 'Creative + Technology Intersection',
    query: "I'm creative but also like technology—what careers combine both?",
    expectedCareers: ['UX/UI Designer', 'Graphic Designer', 'Content Creator', 'Software Engineer'],
    minCareers: 3
  },
  {
    id: 'TEST-2',
    name: 'Non-University High-Income Paths',
    query: "I don't want university but need good salary—what are my options?",
    expectedCareers: ['Electrician', 'Chef', 'Software Engineer', 'Content Creator'],
    minCareers: 3
  },
  {
    id: 'TEST-3',
    name: 'No-Matric Career Paths',
    query: "I might not get matric—what careers can I still do?",
    expectedCareers: ['Electrician', 'Chef', 'Content Creator', 'Trades'],
    minCareers: 3
  },
  {
    id: 'TEST-4',
    name: 'Remote Dollar Earning Careers',
    query: "I want to work remotely and earn dollars—what should I study?",
    expectedCareers: ['Software Engineer', 'UX/UI Designer', 'Data Scientist', 'AI/ML Engineer'],
    minCareers: 3
  },
  {
    id: 'TEST-5',
    name: 'Fastest Path to Earnings',
    query: "What's the fastest way to start earning after matric?",
    expectedCareers: ['Electrician', 'Chef', 'Coding bootcamp', 'Content Creator'],
    minCareers: 3
  },
  {
    id: 'TEST-6',
    name: 'Mixed Interest Synthesis (Biology + Tech)',
    query: "I love biology AND tech—what are my options?",
    expectedCareers: ['Medical Doctor', 'Biomedical', 'Pharmacist', 'Data Scientist'],
    minCareers: 3
  }
];

function scoreResponse(response, testCase) {
  const scores = {
    relevance: 0,
    completeness: 0,
    saSpecificity: 0,
    accuracy: 0,
    actionability: 0
  };

  const lowerResponse = response.toLowerCase();

  // Relevance: Check if expected careers are mentioned
  const careersFound = testCase.expectedCareers.filter(career => 
    lowerResponse.includes(career.toLowerCase())
  ).length;
  scores.relevance = Math.min(5, Math.ceil((careersFound / testCase.minCareers) * 5));

  // Completeness: Check for salary, pathways, requirements
  const hasContent = {
    salary: /r\d{1,3}[,\s]?\d{3}|salary|\$\d+/i.test(response),
    pathway: /degree|diploma|apprenticeship|bootcamp|course|study/i.test(response),
    requirements: /grade|matric|mathematics|science|qualification/i.test(response),
    timeline: /year|month|week|time/i.test(response)
  };
  scores.completeness = Object.values(hasContent).filter(Boolean).length + 1;

  // SA Specificity: Check for SA context
  const saMarkers = [
    /wits|uct|stellenbosch|up\b|university of/i,
    /nsfas|bursary|bursaries/i,
    /\br\d{1,3}[,\s]?\d{3}/i, // Rand amounts
    /south africa|sa\b|local/i,
    /eskom|sasol|discovery|netcare/i
  ];
  scores.saSpecificity = Math.min(5, saMarkers.filter(marker => marker.test(response)).length + 1);

  // Accuracy: Check for realistic salary ranges and timelines
  const hasRealisticContent = {
    salaryRange: /r\d{1,3}[,\s]?\d{3}.*?-.*?r\d{1,3}[,\s]?\d{3}/i.test(response),
    timeline: /\d+\s*(year|month|week)/i.test(response),
    progression: /start|entry|junior|senior|qualified/i.test(response)
  };
  scores.accuracy = Object.values(hasRealisticContent).filter(Boolean).length + 2;

  // Actionability: Check for clear next steps
  const actionMarkers = [
    /apply|enroll|register|contact/i,
    /step|pathway|route|path/i,
    /requirement|need|must|should/i,
    /start|begin|first/i
  ];
  scores.actionability = Math.min(5, actionMarkers.filter(marker => marker.test(response)).length + 1);

  return scores;
}

async function runValidation() {
  console.log('🎯 THANDI.AI CROSS-DOMAIN VALIDATION PROTOCOL\n');
  console.log('Testing system ability to synthesize across domains...\n');
  console.log('═'.repeat(80));

  const results = [];

  for (const testCase of TEST_QUERIES) {
    console.log(`\n${testCase.id}: ${testCase.name}`);
    console.log('─'.repeat(80));
    console.log(`Query: "${testCase.query}"\n`);

    try {
      const response = await queryRAG(testCase.query);
      
      console.log('Response Preview:');
      console.log(response.substring(0, 500) + '...\n');
      
      // Show full response for debugging
      if (process.env.DEBUG_VALIDATION) {
        console.log('\n--- FULL RESPONSE ---');
        console.log(response);
        console.log('--- END RESPONSE ---\n');
      }

      const scores = scoreResponse(response, testCase);
      const avgScore = (
        scores.relevance + 
        scores.completeness + 
        scores.saSpecificity + 
        scores.accuracy + 
        scores.actionability
      ) / 5;

      results.push({
        testCase,
        scores,
        avgScore,
        response
      });

      console.log('📊 SCORES:');
      console.log(`  Relevance:       ${'⭐'.repeat(scores.relevance)} (${scores.relevance}/5)`);
      console.log(`  Completeness:    ${'⭐'.repeat(scores.completeness)} (${scores.completeness}/5)`);
      console.log(`  SA Specificity:  ${'⭐'.repeat(scores.saSpecificity)} (${scores.saSpecificity}/5)`);
      console.log(`  Accuracy:        ${'⭐'.repeat(scores.accuracy)} (${scores.accuracy}/5)`);
      console.log(`  Actionability:   ${'⭐'.repeat(scores.actionability)} (${scores.actionability}/5)`);
      console.log(`  AVERAGE:         ${avgScore.toFixed(1)}/5 ${avgScore >= 4 ? '✅' : '⚠️'}`);

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      results.push({
        testCase,
        error: error.message,
        avgScore: 0
      });
    }
  }

  // Final Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 VALIDATION SUMMARY\n');

  const validResults = results.filter(r => !r.error);
  const overallAvg = validResults.reduce((sum, r) => sum + r.avgScore, 0) / validResults.length;

  console.log('Test Results:');
  results.forEach(r => {
    const status = r.error ? '❌ ERROR' : r.avgScore >= 4 ? '✅ PASS' : '⚠️  NEEDS IMPROVEMENT';
    console.log(`  ${r.testCase.id}: ${status} (${r.error ? 'Failed' : r.avgScore.toFixed(1) + '/5'})`);
  });

  console.log(`\nOverall Average Score: ${overallAvg.toFixed(2)}/5`);
  console.log(`Tests Passed (≥4.0): ${validResults.filter(r => r.avgScore >= 4).length}/${TEST_QUERIES.length}`);
  
  if (overallAvg >= 4) {
    console.log('\n✅ VALIDATION PASSED - System ready for pilot testing!');
  } else {
    console.log('\n⚠️  VALIDATION NEEDS IMPROVEMENT - Review low-scoring tests');
  }

  console.log('═'.repeat(80));
}

runValidation().catch(console.error);
