// scripts/test-q11-q15.js
// Test Q11-Q15 (Career Misconceptions) after key points rewrite

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
  
  console.log(`Question: "${question.question_text.substring(0, 60)}..."`);
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
    
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${(scoring.score * 100).toFixed(0)}% key points covered`);
    console.log(`Covered: ${scoring.covered.length}/${question.key_points.length}`);
    
    if (scoring.missed.length > 0 && scoring.missed.length <= 3) {
      console.log(`Missed: ${scoring.missed.join(', ')}`);
    } else if (scoring.missed.length > 3) {
      console.log(`Missed: ${scoring.missed.slice(0, 2).join(', ')} + ${scoring.missed.length - 2} more`);
    }
    
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
  console.log('🧪 PHASE 2: Testing Q11-Q15 (Career Misconceptions)\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (let i = 11; i <= 15; i++) {
    const result = await testQuestion(`Q${i}`);
    if (result) results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHASE 2 RESULTS\n');
  
  results.forEach(r => {
    console.log(`${r.questionId}: ${r.passed ? '✅ PASS' : '❌ FAIL'} - ${(r.score * 100).toFixed(0)}% (${r.covered}/${r.total})`);
  });
  
  const passCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`Overall: ${passCount}/${totalCount} passed (${((passCount/totalCount)*100).toFixed(0)}%)`);
  
  if (passCount >= 4) {
    console.log('✅ SUCCESS: 4+ questions passing (80%+)');
    console.log('   Ready to proceed to PHASE 3 (Full Test Suite)');
  } else if (passCount >= 3) {
    console.log('⚠️  ACCEPTABLE: 3 questions passing (60%)');
    console.log('   May need minor adjustments');
  } else {
    console.log('❌ NEEDS WORK: <3 questions passing');
    console.log('   Review failed questions and adjust key points');
  }
  console.log('='.repeat(60) + '\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
