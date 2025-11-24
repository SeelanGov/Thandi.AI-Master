// scripts/test-q19-q20.js
// Quick test for Q19 and Q20 after key points rewrite

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function scoreResponse(response, keyPoints) {
  const responseLower = response.toLowerCase();
  const covered = [];
  const missed = [];
  
  keyPoints.forEach(point => {
    const pointWords = point.toLowerCase().match(/\b\w+\b/g) || [];
    const importantWords = pointWords.filter(w => w.length > 4);
    
    const matchCount = importantWords.filter(w => responseLower.includes(w)).length;
    const matchRatio = importantWords.length > 0 ? matchCount / importantWords.length : 0;
    
    if (matchRatio >= 0.5) {
      covered.push(point);
    } else {
      missed.push(point);
    }
  });
  
  const score = keyPoints.length > 0 ? covered.length / keyPoints.length : 0;
  
  return { score, covered, missed };
}

async function testQuestion(questionId) {
  console.log(`\n🧪 Testing ${questionId}...`);
  
  const { data: question, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('question_id', questionId)
    .single();
  
  if (error || !question) {
    console.error(`❌ Failed to load ${questionId}:`, error?.message);
    return null;
  }
  
  console.log(`Question: "${question.question_text}"`);
  console.log(`Key Points: ${question.key_points.length}`);
  
  try {
    const studentProfile = extractStudentProfile(question.question_text);
    const queryEmbedding = await generateQueryEmbedding(question.question_text);
    const searchResults = await semanticSearch(queryEmbedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: studentProfile.priorityModules
    });
    
    if (searchResults.length === 0) {
      console.error('❌ No search results');
      return null;
    }
    
    const reRanked = reRankChunks(searchResults, studentProfile);
    const deduplicated = deduplicateChunks(reRanked, 0.9);
    const assembled = assembleContext(deduplicated, studentProfile, {
      maxTokens: 3000,
      format: 'structured'
    });
    
    const result = await generateResponse(
      question.question_text,
      assembled.context,
      studentProfile,
      { maxRetries: 2, timeout: 10000 }
    );
    
    if (!result.success) {
      console.error('❌ Generation failed:', result.error);
      return null;
    }
    
    const scoring = scoreResponse(result.response, question.key_points);
    const passed = scoring.score >= 0.6;
    
    console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}: ${(scoring.score * 100).toFixed(0)}% key points covered`);
    console.log(`Covered: ${scoring.covered.length}/${question.key_points.length}`);
    
    if (scoring.missed.length > 0) {
      console.log(`\nMissed Points:`);
      scoring.missed.forEach(point => console.log(`  - ${point}`));
    }
    
    console.log(`\nResponse Preview:`);
    console.log(result.response.substring(0, 500) + '...\n');
    
    return {
      questionId,
      score: scoring.score,
      passed,
      covered: scoring.covered.length,
      total: question.key_points.length
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('🧪 PHASE 1: Testing Q19 and Q20 with Updated Key Points\n');
  console.log('='.repeat(60));
  
  const q19Result = await testQuestion('Q19');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const q20Result = await testQuestion('Q20');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE 1 RESULTS\n');
  
  if (q19Result) {
    console.log(`Q19: ${q19Result.passed ? '✅ PASS' : '❌ FAIL'} - ${(q19Result.score * 100).toFixed(0)}% (${q19Result.covered}/${q19Result.total})`);
  }
  
  if (q20Result) {
    console.log(`Q20: ${q20Result.passed ? '✅ PASS' : '❌ FAIL'} - ${(q20Result.score * 100).toFixed(0)}% (${q20Result.covered}/${q20Result.total})`);
  }
  
  const bothPassed = q19Result?.passed && q20Result?.passed;
  
  console.log('\n' + '='.repeat(60));
  if (bothPassed) {
    console.log('✅ SUCCESS: Both Q19 and Q20 passing at 60% threshold');
    console.log('   Ready to proceed to PHASE 2 (Q11-Q15)');
  } else {
    console.log('⚠️  NEEDS ADJUSTMENT: Review failed questions');
    console.log('   May need to refine key points further');
  }
  console.log('='.repeat(60) + '\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
