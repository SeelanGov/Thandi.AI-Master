# Critical Fixes Plan - Tested Before Implementation

**Date:** November 29, 2025  
**Issues Found:** 3 critical bugs  
**Approach:** Test logic first, then implement

---

## Issues Identified

### Issue 1: Math Lit Gate Shows for Pure Math Students ❌
**What's wrong:**
- Student has "Mathematics" (Pure Math)
- System shows "GATE: Math Literacy blocks Engineering"
- This is FALSE - Pure Math students CAN do engineering

**Root cause:**
```javascript
// Current logic in query-gates-simple.js line 31-35
if ((subjectsLower.includes('mathematical literacy') || subjectsLower.includes('math lit')) &&
    (query.includes('engineer') || query.includes('stem'))) {
  if (metadata.gate_type === 'irreversible') {
    score = 100;
  }
}
```

**Problem:** This logic is CORRECT for detecting Math Lit, but the gate is being shown anyway.

**Actual bug:** The gate detection works, but the DISPLAY logic doesn't check if student actually HAS Math Lit before showing the warning.

---

### Issue 2: Career Interests Ignored ❌
**What's wrong:**
- Student types "I want to be an architect"
- System recommends: Software Engineer, Data Scientist, UX Designer
- Architect is completely ignored

**Root cause:**
- `careerInterests` field is collected ✓
- But RAG query doesn't prioritize stated career ✗
- LLM generates generic matches based on subjects only ✗

**Fix needed:**
- Update query building to emphasize career interest
- Add "Student explicitly wants: [career]" to query
- Tell LLM to prioritize this career if feasible

---

### Issue 3: Chat Repeats Same Results ❌
**What's wrong:**
- Chat just repeats initial recommendations
- No conversation memory
- No contextual follow-ups

**Root cause:**
- ThandiChat.jsx builds context but doesn't use previous chat history
- Each question is isolated
- No memory of what was already discussed

**Fix needed:**
- Add conversation history to context
- Build cumulative context from previous Q&A
- Prevent repeating same information

---

## Fix Strategy

### Priority 1: Fix Math Lit Gate (CRITICAL - Breaks existing)
**Test cases:**
1. Pure Math + Engineering query → Should NOT show Math Lit gate
2. Math Lit + Engineering query → SHOULD show Math Lit gate
3. Pure Math + Medicine query → Should NOT show Math Lit gate
4. Math Lit + Medicine query → SHOULD show Math Lit gate

**Fix:**
```javascript
// In query-gates-simple.js
// Add explicit check: Only show gate if student ACTUALLY has Math Lit

export function shouldShowGate(gate, studentProfile) {
  if (!gate || !gate.metadata) return false;

  const { gate_type, subjects } = gate.metadata;
  const studentSubjects = studentProfile.currentSubjects || [];
  const studentSubjectsLower = studentSubjects.map(s => s.toLowerCase());

  // CRITICAL: Math Lit gate should ONLY show if student has Math Lit
  if (gate_type === 'irreversible' && subjects.includes('Mathematical Literacy')) {
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

  // Rest of logic...
  return true;
}
```

---

### Priority 2: Use Career Interests (HIGH - User expectation)
**Test cases:**
1. Career interest: "architect" → Should prioritize architecture careers
2. Career interest: "doctor" + Math Lit → Should warn + suggest alternatives
3. Career interest: empty → Should give general recommendations
4. Career interest: "not sure" → Should give diverse options

**Fix:**
```javascript
// In AssessmentForm.jsx - Update query building

// Add career interests emphasis
if (formData.openQuestions?.careerInterests) {
  query += ` IMPORTANT: Student explicitly stated career interest: "${formData.openQuestions.careerInterests}". 
  Prioritize this career if their subjects and marks make it feasible. 
  If not feasible, explain why and suggest closest alternatives.`;
}
```

---

### Priority 3: Fix Chat Context (MEDIUM - UX improvement)
**Test cases:**
1. Ask "What bursaries?" → Should reference specific bursaries from results
2. Ask "Tell me more about career 1" → Should expand on that specific career
3. Ask same question twice → Should say "As I mentioned earlier..."
4. Ask follow-up → Should build on previous answer

**Fix:**
```javascript
// In ThandiChat.jsx - Add conversation memory

const [conversationHistory, setConversationHistory] = useState([]);

const handleSend = async (question) => {
  // Build cumulative context
  const contextQuery = `
Previous conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Current question: ${question}

Student's assessment results:
- Top career: ${assessmentData.topCareer}
- Subjects: ${assessmentData.enjoyedSubjects?.join(', ')}
- Grade: ${assessmentData.grade}

Answer the current question based on the conversation history and assessment results.
If you already answered this, reference your previous answer.
`;

  // After response, update history
  setConversationHistory(prev => [
    ...prev,
    { role: 'user', content: question },
    { role: 'assistant', content: response }
  ]);
};
```

---

## Test Plan (Run BEFORE implementing)

### Test 1: Math Lit Detection Logic
```javascript
// Test file: scripts/test-math-lit-gate-fix.js

const testCases = [
  {
    name: 'Pure Math + Engineering',
    subjects: ['Mathematics', 'Physical Sciences', 'EGD'],
    query: 'I want to be an engineer',
    expectedGate: null, // Should NOT show Math Lit gate
    expectedPass: true
  },
  {
    name: 'Math Lit + Engineering',
    subjects: ['Mathematical Literacy', 'Physical Sciences', 'EGD'],
    query: 'I want to be an engineer',
    expectedGate: 'irreversible', // SHOULD show Math Lit gate
    expectedPass: true
  },
  {
    name: 'Pure Math + Medicine',
    subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
    query: 'I want to study medicine',
    expectedGate: null, // Should NOT show Math Lit gate
    expectedPass: true
  },
  {
    name: 'Math Lit + Medicine',
    subjects: ['Mathematical Literacy', 'Life Sciences', 'English'],
    query: 'I want to study medicine',
    expectedGate: 'irreversible', // SHOULD show Math Lit gate
    expectedPass: true
  }
];

// Run tests
testCases.forEach(test => {
  const gate = getRelevantGate(10, test.subjects, test.query);
  const shouldShow = shouldShowGate(gate, { currentSubjects: test.subjects });
  
  const pass = shouldShow === (test.expectedGate !== null);
  console.log(`${pass ? '✅' : '❌'} ${test.name}`);
  if (!pass) {
    console.log(`  Expected: ${test.expectedGate}, Got: ${gate?.metadata?.gate_type}`);
  }
});
```

### Test 2: Career Interest Priority
```javascript
// Test file: scripts/test-career-interest-priority.js

const testCases = [
  {
    name: 'Architect with relevant subjects',
    careerInterest: 'I want to be an architect',
    subjects: ['Mathematics', 'Physical Sciences', 'EGD'],
    expectedTopCareer: 'architect', // Should prioritize
    expectedPass: true
  },
  {
    name: 'Doctor with Math Lit',
    careerInterest: 'I want to be a doctor',
    subjects: ['Mathematical Literacy', 'Life Sciences'],
    expectedWarning: true, // Should warn about Math Lit
    expectedAlternatives: ['Nursing', 'Radiography'],
    expectedPass: true
  },
  {
    name: 'No career interest',
    careerInterest: '',
    subjects: ['Mathematics', 'Physical Sciences'],
    expectedTopCareer: 'generic', // Should give general recommendations
    expectedPass: true
  }
];

// Run tests
testCases.forEach(test => {
  const query = buildQuery(test);
  const containsCareer = query.includes(test.careerInterest);
  
  console.log(`${containsCareer ? '✅' : '❌'} ${test.name}`);
  if (!containsCareer && test.careerInterest) {
    console.log(`  Career interest not in query!`);
  }
});
```

### Test 3: Chat Memory
```javascript
// Test file: scripts/test-chat-memory.js

const testCases = [
  {
    name: 'First question',
    history: [],
    question: 'What bursaries are available?',
    expectedContext: 'assessment results',
    expectedPass: true
  },
  {
    name: 'Follow-up question',
    history: [
      { role: 'user', content: 'What bursaries?' },
      { role: 'assistant', content: 'Sasol, NSFAS, Eskom' }
    ],
    question: 'Tell me more about Sasol',
    expectedContext: 'previous conversation + Sasol',
    expectedPass: true
  },
  {
    name: 'Repeated question',
    history: [
      { role: 'user', content: 'What is APS?' },
      { role: 'assistant', content: 'APS is Admission Point Score...' }
    ],
    question: 'What is APS?',
    expectedResponse: 'As I mentioned',
    expectedPass: true
  }
];

// Run tests
testCases.forEach(test => {
  const context = buildChatContext(test.history, test.question);
  const hasHistory = test.history.length === 0 || context.includes(test.history[0].content);
  
  console.log(`${hasHistory ? '✅' : '❌'} ${test.name}`);
});
```

---

## Implementation Order

1. **Create test files** (above)
2. **Run tests with current code** → Should FAIL
3. **Implement Fix 1** (Math Lit gate)
4. **Run Test 1** → Should PASS
5. **Implement Fix 2** (Career interests)
6. **Run Test 2** → Should PASS
7. **Implement Fix 3** (Chat memory)
8. **Run Test 3** → Should PASS
9. **Manual browser test** → Verify all 3 fixes work
10. **Deploy**

---

## Success Criteria

### Fix 1: Math Lit Gate
- ✅ Pure Math students see NO Math Lit warning
- ✅ Math Lit students see warning for STEM careers
- ✅ Gate only shows when relevant

### Fix 2: Career Interests
- ✅ Stated career appears in top 3 recommendations (if feasible)
- ✅ If not feasible, system explains why + suggests alternatives
- ✅ Generic recommendations only when no career stated

### Fix 3: Chat Memory
- ✅ Chat references previous conversation
- ✅ No repetition of same information
- ✅ Follow-ups build on previous answers
- ✅ Contextual responses

---

## Rollback Plan

If any fix breaks:
1. Git revert specific commit
2. Re-run tests
3. Fix issue
4. Re-test
5. Re-deploy

---

**Next Step:** Create test files, run them, verify they FAIL with current code, then implement fixes.

**Estimated Time:**
- Test creation: 30 minutes
- Fix implementation: 45 minutes
- Testing + verification: 30 minutes
- **Total: 1 hour 45 minutes**

---

**Ready to proceed?** Say "create tests" and I'll build the test files first.
