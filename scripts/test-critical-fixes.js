/**
 * Critical Fixes Test Suite
 * Tests all 3 issues before and after fixes
 */

console.log('🧪 CRITICAL FIXES TEST SUITE\n');
console.log('='.repeat(70));

// Mock the gate detection logic for testing
function mockShouldShowGate_CURRENT(gate, studentProfile) {
  // Current broken logic - always shows gate if it matches query
  if (!gate || !gate.metadata) return false;
  const { urgency } = gate.metadata;
  if (urgency === 'critical') return true;
  return false;
}

function mockShouldShowGate_FIXED(gate, studentProfile) {
  // Fixed logic - checks if student actually has Math Lit
  if (!gate || !gate.metadata) return false;

  const { gate_type, subjects } = gate.metadata;
  const studentSubjects = studentProfile.currentSubjects || [];
  const studentSubjectsLower = studentSubjects.map(s => s.toLowerCase());

  // CRITICAL FIX: Math Lit gate should ONLY show if student has Math Lit
  if (gate_type === 'irreversible' && subjects && subjects.includes('Mathematical Literacy')) {
    const hasMathLit = studentSubjectsLower.some(s => 
      s.includes('mathematical literacy') || s === 'math lit'
    );
    const hasPureMath = studentSubjectsLower.some(s => 
      s === 'mathematics' && !s.includes('literacy')
    );
    
    // If student has Pure Math, don't show Math Lit gate
    if (hasPureMath && !hasMathLit) {
      return false;
    }
    
    // If student doesn't have Math Lit, don't show gate
    if (!hasMathLit) {
      return false;
    }
  }

  // Show critical gates
  const { urgency } = gate.metadata;
  if (urgency === 'critical') return true;
  
  return false;
}

// ============================================================================
// TEST 1: Math Lit Gate Detection
// ============================================================================
console.log('\n📋 TEST 1: Math Lit Gate Detection');
console.log('-'.repeat(70));

const mathLitGate = {
  metadata: {
    gate_type: 'irreversible',
    subjects: ['Mathematical Literacy', 'Mathematics'],
    urgency: 'critical'
  }
};

const test1Cases = [
  {
    name: 'Pure Math + Engineering',
    profile: { currentSubjects: ['Mathematics', 'Physical Sciences', 'EGD'] },
    expectedShow: false,
    reason: 'Has Pure Math, should NOT show Math Lit warning'
  },
  {
    name: 'Math Lit + Engineering',
    profile: { currentSubjects: ['Mathematical Literacy', 'Physical Sciences', 'EGD'] },
    expectedShow: true,
    reason: 'Has Math Lit, SHOULD show warning'
  },
  {
    name: 'Pure Math + Medicine',
    profile: { currentSubjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'] },
    expectedShow: false,
    reason: 'Has Pure Math, should NOT show Math Lit warning'
  },
  {
    name: 'Math Lit + Medicine',
    profile: { currentSubjects: ['Mathematical Literacy', 'Life Sciences', 'English'] },
    expectedShow: true,
    reason: 'Has Math Lit, SHOULD show warning'
  },
  {
    name: 'No Math subjects',
    profile: { currentSubjects: ['Life Sciences', 'English', 'History'] },
    expectedShow: false,
    reason: 'No math subjects, should NOT show warning'
  }
];

let test1Passed = 0;
let test1Failed = 0;

console.log('\n🔴 CURRENT (Broken) Logic:');
test1Cases.forEach(test => {
  const result = mockShouldShowGate_CURRENT(mathLitGate, test.profile);
  const pass = result === test.expectedShow;
  console.log(`${pass ? '✅' : '❌'} ${test.name}`);
  console.log(`   Expected: ${test.expectedShow}, Got: ${result}`);
  console.log(`   Reason: ${test.reason}`);
  if (!pass) test1Failed++;
  else test1Passed++;
});

console.log('\n🟢 FIXED Logic:');
test1Passed = 0;
test1Failed = 0;
test1Cases.forEach(test => {
  const result = mockShouldShowGate_FIXED(mathLitGate, test.profile);
  const pass = result === test.expectedShow;
  console.log(`${pass ? '✅' : '❌'} ${test.name}`);
  console.log(`   Expected: ${test.expectedShow}, Got: ${result}`);
  if (!pass) {
    console.log(`   ⚠️ FAILED: ${test.reason}`);
    test1Failed++;
  } else {
    test1Passed++;
  }
});

console.log(`\nTest 1 Results: ${test1Passed}/${test1Cases.length} passed`);

// ============================================================================
// TEST 2: Career Interest Priority
// ============================================================================
console.log('\n\n📋 TEST 2: Career Interest Priority');
console.log('-'.repeat(70));

function buildQuery_CURRENT(formData) {
  // Current logic - doesn't emphasize career interest
  let query = `Grade ${formData.grade} student. `;
  query += `Subjects: ${formData.subjects.join(', ')}. `;
  query += `Interests: ${formData.interests.join(', ')}.`;
  if (formData.careerInterest) {
    query += ` Careers I'm considering: ${formData.careerInterest}.`;
  }
  return query;
}

function buildQuery_FIXED(formData) {
  // Fixed logic - emphasizes career interest
  let query = `Grade ${formData.grade} student. `;
  query += `Subjects: ${formData.subjects.join(', ')}. `;
  query += `Interests: ${formData.interests.join(', ')}.`;
  
  if (formData.careerInterest && formData.careerInterest.trim()) {
    query += `\n\nIMPORTANT: Student explicitly stated career interest: "${formData.careerInterest}". `;
    query += `Prioritize this career if their subjects and marks make it feasible. `;
    query += `If not feasible, explain why clearly and suggest closest alternatives.`;
  }
  
  return query;
}

const test2Cases = [
  {
    name: 'Architect with relevant subjects',
    formData: {
      grade: 10,
      subjects: ['Mathematics', 'Physical Sciences', 'EGD'],
      interests: ['Creativity', 'Problem-solving'],
      careerInterest: 'I want to be an architect'
    },
    shouldContain: ['IMPORTANT', 'architect', 'Prioritize'],
    reason: 'Should emphasize architect career'
  },
  {
    name: 'Doctor with Math Lit',
    formData: {
      grade: 11,
      subjects: ['Mathematical Literacy', 'Life Sciences'],
      interests: ['Helping people'],
      careerInterest: 'I want to be a doctor'
    },
    shouldContain: ['IMPORTANT', 'doctor', 'feasible'],
    reason: 'Should flag doctor career for checking'
  },
  {
    name: 'No career interest',
    formData: {
      grade: 10,
      subjects: ['Mathematics', 'Physical Sciences'],
      interests: ['Technology'],
      careerInterest: ''
    },
    shouldNotContain: ['IMPORTANT', 'Prioritize'],
    reason: 'Should not add career emphasis'
  }
];

let test2Passed = 0;
let test2Failed = 0;

console.log('\n🔴 CURRENT (Generic) Logic:');
test2Cases.forEach(test => {
  const query = buildQuery_CURRENT(test.formData);
  const hasEmphasis = query.includes('IMPORTANT');
  console.log(`\n${test.name}:`);
  console.log(`Query: ${query.substring(0, 150)}...`);
  console.log(`Has emphasis: ${hasEmphasis ? 'YES' : 'NO'}`);
});

console.log('\n🟢 FIXED (Prioritized) Logic:');
test2Cases.forEach(test => {
  const query = buildQuery_FIXED(test.formData);
  let pass = true;
  
  if (test.shouldContain) {
    pass = test.shouldContain.every(term => query.includes(term));
  }
  if (test.shouldNotContain) {
    pass = pass && !test.shouldNotContain.some(term => query.includes(term));
  }
  
  console.log(`\n${pass ? '✅' : '❌'} ${test.name}:`);
  console.log(`Query: ${query.substring(0, 200)}...`);
  console.log(`Reason: ${test.reason}`);
  
  if (pass) test2Passed++;
  else test2Failed++;
});

console.log(`\nTest 2 Results: ${test2Passed}/${test2Cases.length} passed`);

// ============================================================================
// TEST 3: Chat Memory
// ============================================================================
console.log('\n\n📋 TEST 3: Chat Conversation Memory');
console.log('-'.repeat(70));

function buildChatContext_CURRENT(history, question, assessmentData) {
  // Current logic - no history
  return `Follow-up question: ${question}\n\nStudent profile: ${JSON.stringify(assessmentData)}`;
}

function buildChatContext_FIXED(history, question, assessmentData) {
  // Fixed logic - includes history
  let context = '';
  
  if (history.length > 0) {
    context += 'Previous conversation:\n';
    history.slice(-4).forEach(msg => {
      context += `${msg.role}: ${msg.content.substring(0, 100)}...\n`;
    });
    context += '\n';
  }
  
  context += `Current question: ${question}\n\n`;
  context += `Student's assessment results:\n`;
  context += `- Grade: ${assessmentData.grade}\n`;
  context += `- Top career: ${assessmentData.topCareer}\n`;
  context += `- Subjects: ${assessmentData.subjects?.join(', ')}\n\n`;
  context += `Answer the current question based on the conversation history and assessment results.\n`;
  context += `If you already answered this, reference your previous answer briefly.`;
  
  return context;
}

const test3Cases = [
  {
    name: 'First question (no history)',
    history: [],
    question: 'What bursaries are available?',
    assessmentData: { grade: 10, topCareer: 'Software Engineer', subjects: ['Math', 'Physics'] },
    shouldInclude: ['assessment results', 'Grade: 10'],
    reason: 'Should include assessment context'
  },
  {
    name: 'Follow-up question',
    history: [
      { role: 'user', content: 'What bursaries are available?' },
      { role: 'assistant', content: 'Sasol Bursary (R120k/year), NSFAS (means-tested), Eskom Bursary (R100k/year)' }
    ],
    question: 'Tell me more about Sasol',
    assessmentData: { grade: 10, topCareer: 'Software Engineer', subjects: ['Math', 'Physics'] },
    shouldInclude: ['Previous conversation', 'Sasol', 'bursaries'],
    reason: 'Should include previous Q&A about bursaries'
  },
  {
    name: 'Repeated question',
    history: [
      { role: 'user', content: 'What is APS?' },
      { role: 'assistant', content: 'APS is Admission Point Score, calculated from your best 6 subjects...' }
    ],
    question: 'What is APS?',
    assessmentData: { grade: 11, topCareer: 'Engineer', subjects: ['Math', 'Physics'] },
    shouldInclude: ['Previous conversation', 'already answered', 'APS'],
    reason: 'Should detect repeated question'
  }
];

let test3Passed = 0;
let test3Failed = 0;

console.log('\n🔴 CURRENT (No Memory) Logic:');
test3Cases.forEach(test => {
  const context = buildChatContext_CURRENT(test.history, test.question, test.assessmentData);
  const hasHistory = context.includes('Previous conversation');
  console.log(`\n${test.name}:`);
  console.log(`Has history: ${hasHistory ? 'YES' : 'NO'}`);
  console.log(`Context length: ${context.length} chars`);
});

console.log('\n🟢 FIXED (With Memory) Logic:');
test3Cases.forEach(test => {
  const context = buildChatContext_FIXED(test.history, test.question, test.assessmentData);
  const pass = test.shouldInclude.every(term => context.toLowerCase().includes(term.toLowerCase()));
  
  console.log(`\n${pass ? '✅' : '❌'} ${test.name}:`);
  console.log(`Context preview: ${context.substring(0, 200)}...`);
  console.log(`Reason: ${test.reason}`);
  
  if (pass) test3Passed++;
  else test3Failed++;
});

console.log(`\nTest 3 Results: ${test3Passed}/${test3Cases.length} passed`);

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n\n' + '='.repeat(70));
console.log('📊 FINAL TEST SUMMARY');
console.log('='.repeat(70));

const totalTests = test1Cases.length + test2Cases.length + test3Cases.length;
const totalPassed = test1Passed + test2Passed + test3Passed;
const totalFailed = totalTests - totalPassed;

console.log(`\nTest 1 (Math Lit Gate): ${test1Passed}/${test1Cases.length} passed`);
console.log(`Test 2 (Career Priority): ${test2Passed}/${test2Cases.length} passed`);
console.log(`Test 3 (Chat Memory): ${test3Passed}/${test3Cases.length} passed`);
console.log(`\nOVERALL: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests*100)}%)`);

if (totalPassed === totalTests) {
  console.log('\n✅ ALL TESTS PASSED! Ready to implement fixes.');
} else {
  console.log(`\n⚠️ ${totalFailed} tests failed. Review logic before implementing.`);
}

console.log('\n' + '='.repeat(70));
console.log('Next step: Implement fixes in actual code files');
console.log('='.repeat(70) + '\n');
