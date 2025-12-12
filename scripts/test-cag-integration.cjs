/**
 * CAG Quality Layer - Task 7 Integration Test
 * 
 * Tests the complete RAG → LLM → CAG pipeline integration.
 * Validates that CAG properly verifies LLM-generated career guidance.
 */

const { CAGLayer } = require('../lib/cag/index.cjs');

// Mock RAG report data
const mockReportData = {
  personalizedGuidance: 'Based on your strong performance in Mathematics and Physical Sciences, you are well-suited for careers in healthcare and engineering.',
  careers: [
    {
      title: 'Medical Doctor',
      description: 'Diagnose and treat patients in hospitals and clinics',
      requirements: 'MBChB degree (6 years), strong Math and Science',
      pathways: ['University of Cape Town', 'University of Pretoria', 'University of Witwatersrand'],
      salaryRange: 'R400,000 - R1,200,000 per year',
      demand: 'High',
      match: 'excellent'
    },
    {
      title: 'Civil Engineer',
      description: 'Design and oversee construction of infrastructure projects',
      requirements: 'BSc Engineering (4 years), strong Math and Science',
      pathways: ['University of Stellenbosch', 'University of Cape Town'],
      salaryRange: 'R350,000 - R900,000 per year',
      demand: 'High',
      match: 'good'
    }
  ],
  nextSteps: [
    'Research university programs',
    'Prepare for NBT tests',
    'Apply for NSFAS funding'
  ],
  additionalResources: [
    'Visit university open days',
    'Speak with career counselors'
  ],
  matchingMethod: 'subject_based'
};

const mockStudentProfile = {
  grade: '12',
  subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
  mathMark: 85,
  mathType: 'Mathematics',
  province: 'Western Cape',
  budgetLimit: 'limited'
};

// Test cases
const testCases = [
  {
    name: 'Good LLM Output - Should Approve',
    llmOutput: `### Your Personalized Career Matches

Based on your strong performance in Mathematics (85%) and Physical Sciences, you are well-suited for careers in healthcare and engineering. Your subject choices open doors to many rewarding professions.

**1. Medical Doctor** (excellent match)
- Diagnose and treat patients in hospitals and clinics
- Requirements: MBChB degree (6 years), strong Math and Science
- Pathways: University of Cape Town, University of Pretoria, University of Witwatersrand
- Salary: R400,000 - R1,200,000 per year
- Demand: High

**2. Civil Engineer** (good match)
- Design and oversee construction of infrastructure projects
- Requirements: BSc Engineering (4 years), strong Math and Science
- Pathways: University of Stellenbosch, University of Cape Town
- Salary: R350,000 - R900,000 per year
- Demand: High

### Next Steps

1. Research university programs
2. Prepare for NBT tests
3. Apply for NSFAS funding (given your budget constraints)

### Additional Resources

- Visit university open days
- Speak with career counselors

⚠️ **Verify before you decide:**
1. Speak with your school counselor
2. Call the institution directly
3. Check official websites

*Thandi's data may be outdated. Always confirm with real people.*`,
    expectedDecision: 'approved'
  },
  {
    name: 'Hallucinated Content - Should Reject/Revise',
    llmOutput: `### Your Career Matches

You can become a doctor by studying at Harvard Medical School in Johannesburg. The program costs only R10,000 total and takes 2 years. Doctors in South Africa earn R5,000,000 per year on average.

You can also study engineering at Oxford University Cape Town campus. This is a 1-year program costing R5,000.

Apply now!`,
    expectedDecision: 'reject'
  },
  {
    name: 'Missing Verification Warning - Should Revise',
    llmOutput: `### Your Career Matches

Based on your subjects, consider these careers:

**Medical Doctor**
- Study MBChB at UCT
- Salary: R400,000 - R1,200,000

**Civil Engineer**
- Study BSc Engineering
- Salary: R350,000 - R900,000

Good luck with your applications!`,
    expectedDecision: 'revise'
  }
];

// Convert report data to RAG chunks
function convertReportDataToChunks(reportData) {
  const chunks = [];
  
  reportData.careers?.forEach((career, index) => {
    chunks.push({
      id: `career_${index}`,
      chunk_text: `${career.title}: ${career.description}. Requirements: ${career.requirements}. Pathways: ${career.pathways.join(', ')}. Salary: ${career.salaryRange}.`,
      chunk_metadata: {
        source: `career_${career.title.toLowerCase().replace(/\s+/g, '_')}`,
        category: 'career',
        career: career.title
      },
      similarity: career.match === 'excellent' ? 0.95 : career.match === 'good' ? 0.85 : 0.75
    });
  });
  
  if (reportData.personalizedGuidance) {
    chunks.push({
      id: 'guidance',
      chunk_text: reportData.personalizedGuidance,
      chunk_metadata: {
        source: 'personalized_guidance',
        category: 'guidance'
      },
      similarity: 1.0
    });
  }
  
  return chunks;
}

// Main test runner
async function runIntegrationTests() {
  console.log('🧪 CAG Quality Layer - Task 7 Integration Test\n');
  console.log('Testing RAG → LLM → CAG pipeline...\n');
  
  const cag = new CAGLayer();
  const ragChunks = convertReportDataToChunks(mockReportData);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.name} ===\n`);
    
    try {
      const result = await cag.verify({
        draftAnswer: testCase.llmOutput,
        ragChunks: ragChunks,
        studentProfile: mockStudentProfile,
        query: 'What careers can I pursue?',
        ragDraft: 'You can pursue careers in healthcare and engineering.',
        options: {
          skipLLMVerification: false,
          strictMode: false
        }
      });
      
      console.log('Decision:', result.decision);
      console.log('Confidence:', result.metadata.confidence);
      console.log('Processing time:', result.metadata.processingTime + 'ms');
      console.log('Stages:', result.metadata.stagesCompleted.join(' → '));
      console.log('Issues detected:', result.metadata.issuesDetected.length);
      console.log('Revisions applied:', result.metadata.revisionsApplied.length);
      
      if (result.metadata.issuesDetected.length > 0) {
        console.log('\nIssues:');
        result.metadata.issuesDetected.slice(0, 3).forEach(issue => {
          console.log(`  - ${issue.severity}: ${issue.type}`);
        });
      }
      
      // Check if decision matches expectation
      const decisionMatch = result.decision === testCase.expectedDecision ||
                           (testCase.expectedDecision === 'reject' && result.decision === 'revise');
      
      if (decisionMatch) {
        console.log('\n✅ PASS');
        passed++;
      } else {
        console.log('\n❌ FAIL');
        console.log(`  Expected: ${testCase.expectedDecision}, Got: ${result.decision}`);
        failed++;
      }
      
    } catch (error) {
      console.log('Error:', error.message);
      console.log('\n❌ FAIL');
      failed++;
    }
  }
  
  // Test CAG statistics
  console.log('\n=== CAG Statistics Test ===\n');
  
  const stats = cag.getStats();
  console.log('Total verifications:', stats.totalVerifications);
  console.log('Average processing time:', stats.avgProcessingTime.toFixed(0) + 'ms');
  console.log('Decision distribution:', stats.decisionDistribution);
  console.log('Decision percentages:', stats.decisionPercentages);
  
  const hasStats = stats.totalVerifications === testCases.length;
  console.log(`\nStatus: ${hasStats ? '✅ PASS' : '❌ FAIL'}`);
  
  if (hasStats) passed++;
  else failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Integration Test Summary');
  console.log('='.repeat(50));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('\n🎉 All integration tests passed! Task 7 complete.\n');
    console.log('The CAG Quality Layer is now fully integrated with the RAG pipeline.');
    console.log('LLM-generated career guidance will be automatically verified before delivery.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.\n');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runIntegrationTests().catch(error => {
  console.error('Integration test suite failed:', error);
  process.exit(1);
});
