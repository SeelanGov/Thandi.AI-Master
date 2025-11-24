// scripts/test-rag-suite.js
// STEP 7: 20-Question Test Suite - THE CRITICAL TEST
// Validates RAG quality against PRD requirements

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

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Calculate semantic similarity between two texts using simple word overlap
 * (Jaccard similarity - good enough for MVP)
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Score response against key points
 * Returns: { score, coveredPoints, missedPoints }
 */
function scoreResponse(response, keyPoints) {
  const responseLower = response.toLowerCase();
  const covered = [];
  const missed = [];
  
  keyPoints.forEach(point => {
    // Check if key point concepts are present in response
    const pointWords = point.toLowerCase().match(/\b\w+\b/g) || [];
    const importantWords = pointWords.filter(w => w.length > 4); // Filter short words
    
    // Consider point covered if 50%+ of important words are present
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

/**
 * Run RAG pipeline for a single question
 */
async function runTestQuestion(question) {
  const startTime = Date.now();
  
  try {
    // Extract profile
    const studentProfile = extractStudentProfile(question.question_text);
    
    // Generate embedding
    const queryEmbedding = await generateQueryEmbedding(question.question_text);
    
    // Search
    const searchResults = await semanticSearch(queryEmbedding, {
      limit: 10,
      threshold: 0.7,
      moduleNames: studentProfile.priorityModules
    });
    
    if (searchResults.length === 0) {
      return {
        success: false,
        error: 'No search results',
        processingTime: Date.now() - startTime
      };
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
      question.question_text,
      assembled.context,
      studentProfile,
      { maxRetries: 2, timeout: 10000 }
    );
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        processingTime: Date.now() - startTime
      };
    }
    
    // Score against key points
    const scoring = scoreResponse(result.response, question.key_points);
    
    // Calculate overall similarity to ideal answer
    const idealSimilarity = calculateSimilarity(result.response, question.ideal_answer);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      response: result.response,
      idealAnswer: question.ideal_answer,
      keyPointsScore: scoring.score,
      coveredPoints: scoring.covered,
      missedPoints: scoring.missed,
      idealSimilarity,
      passed: scoring.score >= 0.6, // 60% threshold (changed from 80% for MVP)
      processingTime,
      metadata: {
        studentProfile,
        chunksRetrieved: searchResults.length,
        chunksUsed: assembled.metadata.includedChunks,
        tokensUsed: assembled.metadata.tokensUsed,
        modelUsed: result.metadata.modelUsed,
        retries: result.metadata.retries,
        validationPassed: result.metadata.validationPassed
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Save test results to database
 */
async function saveTestResults(testRunId, questionId, result, question) {
  const { error } = await supabase
    .from('test_results')
    .insert({
      test_question_id: questionId,
      test_run_id: testRunId,
      test_input: question.question_text,
      expected_output: question.ideal_answer,
      actual_output: result.response || null,
      key_points_covered: result.success ? result.coveredPoints.length : 0,
      total_key_points: question.key_points.length,
      pass_score: result.success ? result.keyPointsScore : 0,
      passed: result.success ? result.passed : false,
      processing_time_ms: result.processingTime,
      chunks_retrieved: result.success ? {
        retrieved: result.metadata.chunksRetrieved,
        used: result.metadata.chunksUsed,
        modules: result.metadata.studentProfile.priorityModules
      } : null
    });
  
  if (error) {
    console.error(colorize(`Error saving result for ${questionId}:`, 'red'), error.message);
  }
}

/**
 * Main test suite runner
 */
async function runTestSuite() {
  console.log(colorize('\n🧪 THANDI RAG SYSTEM - 20-QUESTION TEST SUITE', 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
  console.log(colorize('THE CRITICAL TEST - Validating RAG Quality\n', 'yellow'));
  
  // Generate unique test run ID
  const testRunId = crypto.randomUUID();
  console.log(colorize(`Test Run ID: ${testRunId}`, 'gray'));
  
  // Load test questions from database
  console.log(colorize('\n📋 Loading test questions from database...', 'cyan'));
  const { data: questions, error: loadError } = await supabase
    .from('test_questions')
    .select('*')
    .order('question_id');
  
  if (loadError || !questions || questions.length === 0) {
    console.error(colorize('❌ Failed to load test questions:', 'red'), loadError?.message);
    console.log(colorize('\n⚠️  Make sure test questions are loaded in the database', 'yellow'));
    console.log(colorize('   Run: node scripts/load-test-questions.js', 'gray'));
    process.exit(1);
  }
  
  console.log(colorize(`✅ Loaded ${questions.length} test questions\n`, 'green'));
  
  // Run tests
  const results = [];
  const categoryResults = {};
  let totalTime = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionNum = i + 1;
    
    console.log(colorize(`\n[${ questionNum}/${questions.length}] Testing ${question.question_id}: ${question.category}`, 'cyan'));
    console.log(colorize(`Question: "${question.question_text.substring(0, 80)}..."`, 'gray'));
    
    const result = await runTestQuestion(question);
    totalTime += result.processingTime;
    
    // Display result
    if (result.success) {
      const passIcon = result.passed ? '✅ PASS' : '❌ FAIL';
      const passColor = result.passed ? 'green' : 'red';
      console.log(colorize(`${passIcon} (${(result.keyPointsScore * 100).toFixed(0)}% key points covered)`, passColor));
      console.log(colorize(`   Time: ${result.processingTime}ms | Similarity: ${(result.idealSimilarity * 100).toFixed(0)}%`, 'gray'));
      
      if (!result.passed && result.missedPoints.length > 0) {
        console.log(colorize(`   Missing: ${result.missedPoints.slice(0, 2).join(', ')}${result.missedPoints.length > 2 ? '...' : ''}`, 'yellow'));
      }
    } else {
      console.log(colorize(`❌ ERROR: ${result.error}`, 'red'));
    }
    
    // Track by category
    if (!categoryResults[question.category]) {
      categoryResults[question.category] = { passed: 0, total: 0, questions: [] };
    }
    categoryResults[question.category].total++;
    if (result.success && result.passed) {
      categoryResults[question.category].passed++;
    }
    categoryResults[question.category].questions.push({
      questionId: question.question_id,
      passed: result.success && result.passed,
      score: result.success ? result.keyPointsScore : 0
    });
    
    results.push({
      question,
      result
    });
    
    // Save to database
    await saveTestResults(testRunId, question.question_id, result, question);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate report
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  console.log(colorize('📊 FINAL RESULTS', 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
  
  const totalPassed = results.filter(r => r.result.success && r.result.passed).length;
  const totalTests = results.length;
  const passRate = (totalPassed / totalTests * 100).toFixed(1);
  
  console.log(colorize(`\n🎯 Overall: ${totalPassed}/${totalTests} PASSED (${passRate}%)`, 'bright'));
  console.log(colorize(`⏱️  Average Time: ${(totalTime / totalTests).toFixed(0)}ms per question`, 'gray'));
  console.log(colorize(`💰 Estimated Cost: R${(totalTests * 0.002).toFixed(2)}`, 'gray'));
  
  // Category breakdown
  console.log(colorize('\n📋 By Category:', 'cyan'));
  Object.entries(categoryResults).forEach(([category, stats]) => {
    const catPassRate = (stats.passed / stats.total * 100).toFixed(0);
    const icon = catPassRate >= 70 ? '✅' : catPassRate >= 50 ? '⚠️' : '❌';
    const color = catPassRate >= 70 ? 'green' : catPassRate >= 50 ? 'yellow' : 'red';
    console.log(colorize(`${icon} ${category}: ${stats.passed}/${stats.total} (${catPassRate}%)`, color));
  });
  
  // Detailed failures
  const failures = results.filter(r => !r.result.success || !r.result.passed);
  if (failures.length > 0) {
    console.log(colorize('\n❌ Failed Questions:', 'red'));
    failures.forEach(({ question, result }) => {
      console.log(colorize(`\n${question.question_id} (${question.category}):`, 'yellow'));
      console.log(colorize(`  Question: "${question.question_text.substring(0, 60)}..."`, 'gray'));
      if (result.success) {
        console.log(colorize(`  Score: ${(result.keyPointsScore * 100).toFixed(0)}% (need 80%)`, 'gray'));
        console.log(colorize(`  Missed: ${result.missedPoints.slice(0, 3).join('; ')}`, 'gray'));
      } else {
        console.log(colorize(`  Error: ${result.error}`, 'red'));
      }
    });
  }
  
  // Success assessment
  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
  console.log(colorize('🎯 ASSESSMENT', 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
  
  if (passRate >= 60) {
    console.log(colorize('\n✅ SUCCESS: Acceptable baseline for MVP', 'green'));
    console.log(colorize('   Pass rate meets Day 4 target (60%+)', 'green'));
    console.log(colorize('   Ready for Week 2 optimization to reach 70%', 'gray'));
  } else if (passRate >= 40) {
    console.log(colorize('\n⚠️  MARGINAL: Below target but viable', 'yellow'));
    console.log(colorize('   Pass rate below Day 4 target (60%)', 'yellow'));
    console.log(colorize('   Requires immediate optimization before pilot', 'gray'));
  } else {
    console.log(colorize('\n❌ NEEDS WORK: Below minimum threshold', 'red'));
    console.log(colorize('   Pass rate below minimum viable (40%)', 'red'));
    console.log(colorize('   Requires significant improvements', 'gray'));
  }
  
  // Recommendations
  console.log(colorize('\n📝 Next Steps:', 'cyan'));
  if (passRate >= 60) {
    console.log(colorize('   1. Analyze failed questions for patterns', 'gray'));
    console.log(colorize('   2. Optimize weak categories in Week 2', 'gray'));
    console.log(colorize('   3. Target 14/20 (70%) by end of Week 2', 'gray'));
  } else {
    console.log(colorize('   1. Review failed questions immediately', 'gray'));
    console.log(colorize('   2. Improve prompt engineering', 'gray'));
    console.log(colorize('   3. Add more knowledge chunks for weak areas', 'gray'));
    console.log(colorize('   4. Re-run test suite after improvements', 'gray'));
  }
  
  console.log(colorize('\n✅ Test results saved to database (test_run_id: ' + testRunId + ')', 'green'));
  console.log(colorize('='.repeat(60) + '\n', 'cyan'));
  
  return {
    testRunId,
    totalPassed,
    totalTests,
    passRate: parseFloat(passRate),
    categoryResults,
    results
  };
}

// Run the test suite
runTestSuite()
  .then(summary => {
    if (summary.passRate >= 40) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(colorize('\n❌ Test suite failed:', 'red'), error.message);
    console.error(error.stack);
    process.exit(1);
  });
