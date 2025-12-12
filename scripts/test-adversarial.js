// scripts/test-adversarial.js
// ADVERSARIAL STRESS TESTS - Unfakeable verification

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { hybridSearch } from '../lib/rag/hybrid-search.js';
import { generateQueryEmbedding } from '../lib/rag/embeddings.js';

async function testImpossibleQuery() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: THE "IMPOSSIBLE QUERY" CHALLENGE');
  console.log('='.repeat(60));
  
  const query = "I hate math but love biology and want to earn dollars remotely without studying for 6 years";
  console.log(`Query: "${query}"\n`);
  
  console.log('Expected:');
  console.log('  ✅ Should exclude: Medical Doctor (6+ years), Software Engineer (needs math)');
  console.log('  ✅ Should include: Pharmacist (4 years, biology), Content Creator (remote)\n');
  
  try {
    const embedding = await generateQueryEmbedding(query);
    const results = await hybridSearch(query, embedding, { limit: 10, debug: true });
    
    console.log('\n📊 RESULTS:');
    const careers = new Set();
    results.forEach((r, i) => {
      const career = r.chunk_metadata?.career_name;
      if (career) careers.add(career);
      if (i < 5) {
        console.log(`${i+1}. ${career || 'N/A'} - ${r.chunk_metadata?.chunk_type || 'N/A'} (score: ${r.final_score.toFixed(3)})`);
      }
    });
    
    console.log(`\nCareers found: ${Array.from(careers).join(', ')}`);
    
    // Scoring
    let score = 5;
    const violations = [];
    
    if (careers.has('Medical Doctor')) {
      score -= 2;
      violations.push('❌ Medical Doctor appears (violates 6-year constraint)');
    }
    if (careers.has('Software Engineer')) {
      score -= 1;
      violations.push('⚠️  Software Engineer appears (requires math)');
    }
    if (!careers.has('Pharmacist') && !careers.has('Content Creator')) {
      score -= 1;
      violations.push('⚠️  Missing expected careers (Pharmacist or Content Creator)');
    }
    
    if (violations.length > 0) {
      console.log('\n⚠️  VIOLATIONS:');
      violations.forEach(v => console.log(`  ${v}`));
    }
    
    console.log(`\n⭐ SCORE: ${score}/5`);
    return { test: 'Impossible Query', score, maxScore: 5 };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { test: 'Impossible Query', score: 0, maxScore: 5, error: error.message };
  }
}

async function testConflictResolution() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: THE "CONFLICT RESOLUTION" CHALLENGE');
  console.log('='.repeat(60));
  
  const query = "I want to make money fast but also want to study for 10 years to become a specialist";
  console.log(`Query: "${query}"\n`);
  
  console.log('Expected:');
  console.log('  ✅ Should present BOTH paths: Fast earning AND long-term specialist');
  console.log('  ✅ Fast path: Electrician, Chef, Software bootcamp');
  console.log('  ✅ Long path: Medical Doctor specialization\n');
  
  try {
    const embedding = await generateQueryEmbedding(query);
    const results = await hybridSearch(query, embedding, { limit: 10, debug: true });
    
    console.log('\n📊 RESULTS:');
    const careers = new Set();
    results.forEach((r, i) => {
      const career = r.chunk_metadata?.career_name;
      if (career) careers.add(career);
      if (i < 5) {
        console.log(`${i+1}. ${career || 'N/A'} - ${r.chunk_metadata?.chunk_type || 'N/A'} (score: ${r.final_score.toFixed(3)})`);
      }
    });
    
    console.log(`\nCareers found: ${Array.from(careers).join(', ')}`);
    
    // Scoring - check if BOTH paths are represented in top 10
    let score = 5;
    const hasFastPath = careers.has('Electrician') || careers.has('Chef') || careers.has('Software Engineer');
    const hasLongPath = careers.has('Medical Doctor') || careers.has('Pharmacist');
    
    if (!hasFastPath) {
      score -= 2;
      console.log('\n⚠️  Missing fast-earning path careers');
    }
    if (!hasLongPath) {
      score -= 2;
      console.log('\n⚠️  Missing long-term specialist path');
    }
    if (hasFastPath && hasLongPath) {
      console.log('\n✅ Both paths represented in results');
      // Check if they're balanced (not all fast or all long)
      const fastCount = [careers.has('Electrician'), careers.has('Chef'), careers.has('Renewable Energy Engineer')].filter(Boolean).length;
      const longCount = [careers.has('Medical Doctor'), careers.has('Pharmacist')].filter(Boolean).length;
      if (fastCount > 0 && longCount > 0) {
        console.log(`   Fast path: ${fastCount} careers, Long path: ${longCount} careers`);
      }
    }
    
    console.log(`\n⭐ SCORE: ${score}/5`);
    return { test: 'Conflict Resolution', score, maxScore: 5 };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { test: 'Conflict Resolution', score: 0, maxScore: 5, error: error.message };
  }
}

async function testNonExistentCareer() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: THE "NON-EXISTENT CAREER" TRAP');
  console.log('='.repeat(60));
  
  const query = "Tell me about becoming a professional underwater basket weaver in South Africa";
  console.log(`Query: "${query}"\n`);
  
  console.log('Expected:');
  console.log('  ✅ Should NOT hallucinate details about underwater basket weaving');
  console.log('  ✅ Should suggest real alternative careers (Content Creator, Designer)\n');
  
  try {
    const embedding = await generateQueryEmbedding(query);
    const results = await hybridSearch(query, embedding, { limit: 10, debug: true });
    
    console.log('\n📊 RESULTS:');
    const careers = new Set();
    results.forEach((r, i) => {
      const career = r.chunk_metadata?.career_name;
      if (career) careers.add(career);
      if (i < 5) {
        console.log(`${i+1}. ${career || 'N/A'} - ${r.chunk_metadata?.chunk_type || 'N/A'} (score: ${r.final_score.toFixed(3)})`);
      }
    });
    
    console.log(`\nCareers found: ${Array.from(careers).join(', ')}`);
    
    // Scoring - this test is about what the LLM does with these results
    // For now, we check if reasonable alternatives are suggested
    let score = 5;
    
    if (careers.size === 0) {
      score = 3;
      console.log('\n⚠️  No careers returned - system might be too restrictive');
    } else {
      const hasReasonableAlternatives = 
        careers.has('Content Creator') || 
        careers.has('Graphic Designer') ||
        careers.has('UX/UI Designer');
      
      if (hasReasonableAlternatives) {
        console.log('\n✅ Reasonable creative alternatives suggested');
      } else {
        score -= 2;
        console.log('\n⚠️  No obvious creative alternatives in results');
      }
    }
    
    console.log(`\n⭐ SCORE: ${score}/5`);
    console.log('Note: Final hallucination check requires LLM response analysis');
    return { test: 'Non-Existent Career', score, maxScore: 5 };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { test: 'Non-Existent Career', score: 0, maxScore: 5, error: error.message };
  }
}

async function runAdversarialTests() {
  console.log('🧪 ADVERSARIAL STRESS TEST SUITE\n');
  console.log('Testing hybrid search with edge cases that expose hallucinations\n');
  
  const results = [];
  
  results.push(await testImpossibleQuery());
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.push(await testConflictResolution());
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.push(await testNonExistentCareer());
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ADVERSARIAL TEST SUMMARY');
  console.log('='.repeat(60));
  
  let totalScore = 0;
  let maxScore = 0;
  
  results.forEach(r => {
    totalScore += r.score;
    maxScore += r.maxScore;
    const status = r.score >= 4 ? '✅' : r.score >= 3 ? '⚠️ ' : '❌';
    console.log(`${status} ${r.test}: ${r.score}/${r.maxScore}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  
  const percentage = (totalScore / maxScore) * 100;
  console.log(`\nTotal: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%)`);
  
  if (percentage >= 90) {
    console.log('\n✅ EXCELLENT - System handles edge cases well');
  } else if (percentage >= 70) {
    console.log('\n⚠️  GOOD - Minor issues with edge cases');
  } else if (percentage >= 50) {
    console.log('\n⚠️  FAIR - Significant edge case issues');
  } else {
    console.log('\n❌ POOR - System struggles with edge cases');
  }
}

runAdversarialTests().catch(console.error);
