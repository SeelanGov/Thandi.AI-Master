/**
 * CAG Quality Layer - Task 6 Test Suite
 * 
 * Tests the complete CAGLayer orchestrator with all components integrated.
 * Validates the 4-stage verification pipeline and performance targets.
 */

const { CAGLayer } = require('../lib/cag/index.cjs');

// Test data
const mockRAGChunks = [
  {
    id: '1',
    chunk_text: 'Medical doctors in South Africa earn between R400,000 and R1,200,000 per year. They must complete a 6-year MBChB degree at a South African university.',
    chunk_metadata: {
      source: 'career_medical_doctor',
      category: 'healthcare',
      career: 'Medical Doctor'
    },
    similarity: 0.95
  },
  {
    id: '2',
    chunk_text: 'The University of Cape Town offers a highly regarded MBChB program. Admission requires strong performance in Mathematics and Physical Sciences.',
    chunk_metadata: {
      source: 'institution_uct',
      category: 'university',
      institution: 'University of Cape Town'
    },
    similarity: 0.88
  }
];

const mockStudentProfile = {
  grade: '12',
  subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
  apsScore: 42,
  interests: ['healthcare', 'helping people']
};

// Test cases
const testCases = [
  {
    name: 'Approved Answer - High Quality',
    input: {
      draftAnswer: 'Medical doctors in South Africa typically earn between R400,000 and R1,200,000 annually. To become a medical doctor, you need to complete a 6-year MBChB degree at a South African university like the University of Cape Town. Strong performance in Mathematics and Physical Sciences is required for admission.\n\n⚠️ Please verify this information with official sources before making decisions.',
      ragChunks: mockRAGChunks,
      studentProfile: mockStudentProfile,
      query: 'How much do doctors earn in South Africa?',
      ragDraft: 'Medical doctors earn good salaries in South Africa.'
    },
    expectedDecision: 'approved',
    expectedStages: ['rule_checks', 'grounding_validation']
  },
  {
    name: 'Fallback - Invalid Input',
    input: {
      draftAnswer: '', // Empty input
      ragChunks: mockRAGChunks,
      studentProfile: mockStudentProfile,
      ragDraft: 'Fallback answer from RAG.'
    },
    expectedDecision: 'fallback',
    shouldFail: true
  }
];

// Performance test
async function testPerformance() {
  console.log('\n=== Performance Test ===\n');
  
  const cag = new CAGLayer();
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    
    await cag.verify({
      draftAnswer: 'Medical doctors earn between R400,000 and R1,200,000 per year in South Africa.\n\n⚠️ Please verify this information.',
      ragChunks: mockRAGChunks,
      studentProfile: mockStudentProfile,
      query: 'Doctor salaries?',
      ragDraft: 'Doctors earn good salaries.'
    });
    
    const time = Date.now() - start;
    times.push(time);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  
  console.log(`Average processing time: ${avgTime.toFixed(0)}ms`);
  console.log(`Min: ${minTime}ms, Max: ${maxTime}ms`);
  console.log(`Target: <2000ms`);
  console.log(`Status: ${avgTime < 2000 ? '✅ PASS' : '❌ FAIL'}`);
  
  return avgTime < 2000;
}

// Statistics test
async function testStatistics() {
  console.log('\n=== Statistics Test ===\n');
  
  const cag = new CAGLayer();
  
  // Run multiple verifications
  await cag.verify({
    draftAnswer: 'Good answer with verification warning.\n\n⚠️ Please verify.',
    ragChunks: mockRAGChunks,
    studentProfile: mockStudentProfile,
    ragDraft: 'Fallback'
  });
  
  await cag.verify({
    draftAnswer: 'Another good answer.\n\n⚠️ Please verify.',
    ragChunks: mockRAGChunks,
    studentProfile: mockStudentProfile,
    ragDraft: 'Fallback'
  });
  
  const stats = cag.getStats();
  
  console.log('Total verifications:', stats.totalVerifications);
  console.log('Average processing time:', stats.avgProcessingTime.toFixed(0) + 'ms');
  console.log('Decision distribution:', stats.decisionDistribution);
  console.log('Decision percentages:', stats.decisionPercentages);
  
  const hasStats = stats.totalVerifications === 2;
  console.log(`\nStatus: ${hasStats ? '✅ PASS' : '❌ FAIL'}`);
  
  return hasStats;
}

// Main test runner
async function runTests() {
  console.log('🧪 CAG Quality Layer - Task 6 Test Suite\n');
  console.log('Testing complete CAGLayer orchestrator...\n');
  
  const cag = new CAGLayer();
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.name} ===\n`);
    
    try {
      const result = await cag.verify(testCase.input);
      
      console.log('Decision:', result.decision);
      console.log('Processing time:', result.metadata.processingTime + 'ms');
      console.log('Stages completed:', result.metadata.stagesCompleted.join(' → '));
      console.log('Issues detected:', result.metadata.issuesDetected.length);
      console.log('Revisions applied:', result.metadata.revisionsApplied.length);
      
      if (testCase.shouldFail) {
        console.log('\n❌ FAIL: Expected failure but succeeded');
        failed++;
      } else {
        const decisionMatch = result.decision === testCase.expectedDecision;
        
        if (decisionMatch) {
          console.log('\n✅ PASS');
          passed++;
        } else {
          console.log('\n❌ FAIL');
          console.log(`  Expected decision: ${testCase.expectedDecision}, got: ${result.decision}`);
          failed++;
        }
      }
      
    } catch (error) {
      if (testCase.shouldFail) {
        console.log('Error (expected):', error.message);
        console.log('\n✅ PASS');
        passed++;
      } else {
        console.log('Error:', error.message);
        console.log('\n❌ FAIL');
        failed++;
      }
    }
  }
  
  // Run performance test
  const perfPass = await testPerformance();
  if (perfPass) passed++;
  else failed++;
  
  // Run statistics test
  const statsPass = await testStatistics();
  if (statsPass) passed++;
  else failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Task 6 complete.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.\n');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
