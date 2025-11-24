# Grade 10 Deep Assessment: Implementation Details

**Companion to:** GRADE-10-DEEP-ASSESSMENT-PLAN.md

---

## The Opt-In CTA Design (Grade 10 Only)

### Preliminary Report Component

```jsx
// app/assessment/components/PreliminaryReport.jsx

export default function PreliminaryReport({ careers, onDeepDive, onSkip }) {
  return (
    <div className="preliminary-report">
      <h2>📊 Your Quick Career Matches</h2>
      <p>Based on your interests, here are 3 careers to explore:</p>
      
      <div className="career-list">
        {careers.map((career, i) => (
          <div key={i} className="career-card">
            <h3>{i + 1}. {career.title}</h3>
            <p>{career.oneSentenceWhy}</p>
          </div>
        ))}
      </div>

      <div className="deep-dive-cta">
        <h3>Want More Detail?</h3>
        <p>Get your personalized 3-year action plan:</p>
        <ul>
          <li>✓ How to improve your marks</li>
          <li>✓ Specific steps for each year</li>
          <li>✓ Bursary deadlines and requirements</li>
          <li>✓ Backup plans if things change</li>
        </ul>
        <p className="time-estimate">Takes 5 more minutes</p>
        
        <div className="cta-buttons">
          <button onClick={onDeepDive} className="btn-primary">
            Build My 3-Year Plan →
          </button>
          <button onClick={onSkip} className="btn-secondary">
            This Is Enough
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Updated Assessment Form Logic

```javascript
// app/assessment/components/AssessmentForm.jsx

const [currentStep, setCurrentStep] = useState(0); // Start at 0 for grade selection
const [grade, setGrade] = useState(null);
const [showPreliminaryReport, setShowPreliminaryReport] = useState(false);
const [preliminaryData, setPreliminaryData] = useState(null);

// Step 0: Grade Selection
if (currentStep === 0) {
  return <GradeSelector onSelect={(g) => { setGrade(g); setCurrentStep(1); }} />;
}

// Steps 1-4: Core questions (same for all grades)
// ... existing code ...

// After step 4:
const handleCoreQuestionsComplete = async () => {
  if (grade === 10) {
    // Generate preliminary report
    const quickReport = await generateQuickReport(formData);
    setPreliminaryData(quickReport);
    setShowPreliminaryReport(true);
  } else {
    // Grade 11-12: Auto-advance to deep dive
    setCurrentStep(5);
  }
};

// Preliminary report decision
if (showPreliminaryReport) {
  return (
    <PreliminaryReport
      careers={preliminaryData.careers}
      onDeepDive={() => {
        setShowPreliminaryReport(false);
        setCurrentStep(5); // Continue to deep dive
      }}
      onSkip={() => {
        // Generate final report with preliminary data
        handleSubmit(preliminaryData);
      }}
    />
  );
}

// Steps 5-10: Deep dive questions
// ... new deep dive components ...
```

---

## RAG Prompt Updates

### Updated System Prompt (lib/rag/generation.js)

```javascript
function buildSystemPrompt(studentProfile, hasDeepDiveData) {
  let prompt = `You are Thandi, an AI career counselor for South African high school students.

Student Profile:
- Grade: ${studentProfile.grade}
- Subjects enjoyed: ${studentProfile.enjoyedSubjects.join(', ')}
- Interests: ${studentProfile.interests.join(', ')}
- Financial constraints: ${studentProfile.constraints.money}
- Location: ${studentProfile.constraints.location}
`;

  // Rule #4: NSFAS prioritization
  if (studentProfile.constraints.money === 'low') {
    prompt += `
CRITICAL: This student has financial constraints.
- Prioritize careers with bursary opportunities
- Include NSFAS-funded pathways (universities, TVET)
- Mention free/low-cost training options
- Be specific about application deadlines and amounts
`;
  }

  // Deep dive data available
  if (hasDeepDiveData) {
    prompt += `
DEEP DIVE DATA AVAILABLE:
- Current marks: ${JSON.stringify(studentProfile.currentMarks)}
- Support system: ${studentProfile.supportSystem.join(', ')}
- Career awareness: ${studentProfile.careerAwareness}
- Family expectations: ${studentProfile.familyExpectations}
- Location flexibility: ${studentProfile.locationFlexibility}
- Decision style: ${studentProfile.decisionStyle}

GENERATE 3-YEAR ACTION PLAN:
For each recommended career, provide:
1. Current state assessment (where they are now)
2. Year-by-year improvement plan (Grade 10 → 11 → 12)
3. Specific actions for each year
4. Backup plans if marks don't improve
5. How to verify this career is right for them
`;
  }

  prompt += `
Generate exactly 3-5 career recommendations that match this student's profile.
Include: reasoning, requirements, salary ranges, bursaries, next steps.
`;

  return prompt;
}
```

---

## Success Metrics

### Completion Rates (Target)
- **Grade 10 (4 questions only):** >80% completion
- **Grade 10 (opt-in to 10):** >60% of those who see CTA
- **Grade 11-12 (10 questions):** >70% completion

### Quality Metrics
- **Actionability:** Every recommendation includes specific next steps
- **3-year plans:** Clear year-by-year progression
- **Bursary info:** Specific amounts and deadlines when financial constraints exist
- **Backup plans:** Alternative paths if first choice doesn't work

### User Feedback (From Daughter)
- [ ] "The CTA made me want to continue"
- [ ] "10 questions didn't feel too long"
- [ ] "The 3-year plan is way more helpful"
- [ ] "My friends would complete this"

---

## Risk Mitigation

### Risk 1: Grade 10 abandonment rate too high
**Mitigation:** 
- A/B test CTA language
- Reduce to 8 questions if needed
- Make questions more engaging

### Risk 2: Deep dive data doesn't improve recommendations
**Mitigation:**
- Compare 4-question vs 10-question outputs
- If no quality difference, keep 4 questions
- Use deep dive data only when it adds value

### Risk 3: Rule #4 conflicts with deep dive
**Mitigation:**
- Test low-income students with both flows
- Ensure bursary info appears in both quick and deep reports
- Prioritize Rule #4 over deep dive if conflict

### Risk 4: Daughter says "too long"
**Mitigation:**
- Have 8-question backup ready
- Remove Questions 7 and 9 (least critical)
- Keep: marks, support, family, decision style

---

## Decision Framework

### When to Ship This

**Ship if:**
- ✅ Rule #4 works (low-income students get bursary info)
- ✅ All grade flows tested and working
- ✅ Daughter approves the 10-question flow
- ✅ Completion time <15 minutes
- ✅ 3-year action plans are actionable

**Don't ship if:**
- ❌ Daughter says "too long, I'd quit"
- ❌ Deep dive doesn't improve recommendation quality
- ❌ Rule #4 fails for low-income students
- ❌ Completion time >20 minutes
- ❌ Technical bugs in conditional logic

### Fallback Plan

If deep dive doesn't work:
1. Keep Rule #4 (NSFAS prioritization)
2. Ship with 4 questions for all grades
3. Add "Talk to your counselor for detailed planning" message
4. Revisit deep dive after pilot feedback

**The non-negotiable:** Rule #4 must ship. Deep dive is optional.

---

## Your Cofounder's Core Insight

> "Do we want Thandi to be a toy (quick, fun, shallow) or a tool (deep, actionable, trusted)?"

**Your vision:** "Ensure they can maintain the marks and become better people."

**That's a tool, not a toy.**

The 4-question version tells students WHAT they could be.  
The 10-question version tells them HOW to become it.

Grade 10 is when the HOW becomes important. They're choosing subjects that lock or unlock futures.

**Build the deep dive. But build Rule #4 first** - because the kid who needs NSFAS doesn't have time to wait for perfect.

---

## Next Steps

1. **Review this plan** - Does this align with your vision?
2. **Approve or modify** - What would you change?
3. **Set start date** - Ready to begin Monday, Nov 25?
4. **Confirm daughter availability** - Can she test on Day 3?

**Your call.**

