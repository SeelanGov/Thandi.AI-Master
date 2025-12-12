// scripts/test-explicit-rag.js
// Test explicit RAG prompt with mock student data

import { generateResponse } from '../lib/rag/generation.js';

const mockStudent = {
  grade: 10,
  subjectMarks: {
    'Mathematics': '60-69%',
    'Physical Sciences': '70-79%',
    'Computer Applications Technology': '80-100%'
  },
  supportSystem: ['school tutoring', 'family help', 'online resources'],
  constraints: { money: 'low' },
  interests: ['technology', 'problem-solving'],
  financialConstraint: 'low'
};

const mockQuery = "What technology careers can I pursue with my marks?";

const mockContext = `
Software Engineering Career Path:
- Entry requirements: Mathematics 60%+, Physical Sciences 60%+
- Salary: R25,000-R45,000/month entry-level
- Universities: UCT, Wits, Stellenbosch, UP
- Bursaries: Sasol Engineering Bursary R120,000/year, NSFAS R80,000/year

Data Science Career Path:
- Entry requirements: Mathematics 70%+, Physical Sciences 65%+
- Salary: R30,000-R55,000/month entry-level
- Universities: UCT, Wits, UP
- Bursaries: Discovery Data Science Bursary R100,000/year, NSFAS R80,000/year

Computer Systems Engineering (TVET):
- Entry requirements: Mathematics 50%+, Physical Sciences 50%+
- Cost: R5,000/year (vs R60,000 university)
- Salary: R15,000-R30,000/month entry-level
- Colleges: Ekurhuleni East TVET, Central Johannesburg TVET
`;

console.log('🧪 Testing Explicit RAG Prompt...\n');
console.log('Mock Student Profile:');
console.log(JSON.stringify(mockStudent, null, 2));
console.log('\n' + '='.repeat(60) + '\n');

try {
  const result = await generateResponse(mockQuery, mockContext, mockStudent, {
    preferredModel: 'groq', // Use Groq
    timeout: 30000
  });

  if (result.success) {
    console.log('✅ Generation successful!\n');
    console.log('Generated Response:');
    console.log('='.repeat(60));
    console.log(result.response);
    console.log('='.repeat(60));
    
    // Count "YOUR" occurrences
    const yourCount = (result.response.match(/\bYOUR\b/gi) || []).length;
    console.log(`\n📊 "YOUR" count: ${yourCount} ${yourCount >= 20 ? '✅' : '⚠️ (should be ≥20)'}`);
    
    // Check for specific data references
    const checks = {
      'References Grade 10': /Grade 10/i.test(result.response),
      'References Mathematics 60-69%': /Mathematics.*60-69%|60-69%.*Mathematics/i.test(result.response),
      'References Physical Sciences 70-79%': /Physical Sciences.*70-79%|70-79%.*Physical Sciences/i.test(result.response),
      'References school tutoring': /school tutoring/i.test(result.response),
      'References family help': /family help/i.test(result.response),
      'Shows R amounts': /R\d+[,\d]*/i.test(result.response),
      'References low income': /low|NSFAS|affordable|FREE/i.test(result.response)
    };
    
    console.log('\n📋 Data Reference Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
    });
    
    const allPassed = Object.values(checks).every(v => v);
    console.log(`\n${allPassed ? '✅ ALL CHECKS PASSED' : '⚠️ SOME CHECKS FAILED'}`);
    
    // Check for generic statements (should be minimal)
    const genericPatterns = [
      /you should(?! YOUR)/i,
      /consider (?!YOUR)/i,
      /it's important to(?! YOUR)/i
    ];
    
    const genericCount = genericPatterns.reduce((count, pattern) => {
      return count + (result.response.match(pattern) || []).length;
    }, 0);
    
    console.log(`\n⚠️ Generic statements found: ${genericCount} ${genericCount === 0 ? '✅' : '(should be 0)'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    
  } else {
    console.error('❌ Generation failed:', result.error);
    console.error('Metadata:', result.metadata);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
