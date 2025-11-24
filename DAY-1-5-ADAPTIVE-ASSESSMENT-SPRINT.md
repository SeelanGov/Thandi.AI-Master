# 5-Day Adaptive Assessment Sprint

**Date:** November 24, 2025  
**Status:** APPROVED - Ready to Execute  
**Goal:** Transform Thandi from toy to tool with Grade 10 opt-in deep dive

---

## Sprint Overview

**What We're Building:**
- Adaptive assessment (4 questions → opt-in → 10 questions)
- Rule #4: NSFAS prioritization for low-income students
- 3-year action plan generator
- Database schema updates
- Real user validation (Sitara + friends)

**Timeline:** 5 days (Nov 25-29)  
**Validation:** Sitara tests Day 3, friends test Day 5

---

## Day 1 (Monday, Nov 25): Foundation

### Morning (3 hours): Rule #4 - NSFAS Prioritization

**Task:** Protect low-income students with bursary-first recommendations

**Implementation:**
```javascript
// lib/rag/generation.js - Add to system prompt builder

if (studentProfile.constraints.money === 'low') {
  systemPrompt += `
  CRITICAL: This student has financial constraints.
  
  PRIORITIZE:
  - Careers with active bursary programs (Sasol, Eskom, etc.)
  - NSFAS-funded pathways (public universities, TVET colleges)
  - Free/low-cost training options (learnerships, apprenticeships)
  
  FOR EACH RECOMMENDATION:
  - Include specific bursary names and amounts
  - Mention application deadlines
  - Show NSFAS eligibility criteria
  - Highlight free alternatives (TVET vs private college)
  `;
}
```

**Test Cases:**
1. Low-income + Engineering interest → Sasol bursary, NSFAS universities
2. Low-income + Healthcare → Nursing bursaries, TVET colleges
3. Verify bursary info appears in top 3 recommendations

**Deliverable:** Rule #4 working with current 4-question flow

---

### Afternoon (3 hours): Database Schema + Wireframes

**Task 1: Database Updates (30 min)**
```sql
-- Add to database-schema.sql

-- Deep dive assessment fields
ALTER TABLE assessment_responses 
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS assessment_depth TEXT DEFAULT 'quick', -- 'quick' or 'comprehensive'
ADD COLUMN IF NOT EXISTS support_system JSONB,
ADD COLUMN IF NOT EXISTS career_awareness_level TEXT,
ADD COLUMN IF NOT EXISTS family_expectations TEXT,
ADD COLUMN IF NOT EXISTS location_flexibility TEXT,
ADD COLUMN IF NOT EXISTS decision_style TEXT;

-- Subject performance tracking
CREATE TABLE IF NOT EXISTS subject_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessment_responses(id),
  subject TEXT NOT NULL,
  mark_range TEXT NOT NULL, -- '40-49%', '50-59%', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subject_performance_assessment 
ON subject_performance(assessment_id);
```

**Task 2: API Endpoint Update (30 min)**
```javascript
// app/api/assess/route.js - Accept new fields

export async function POST(request) {
  const data = await request.json();
  
  // Existing fields
  const { enjoyedSubjects, interests, constraints, openQuestions } = data;
  
  // New deep dive fields
  const { 
    grade,
    assessmentDepth,
    subjectMarks,
    supportSystem,
    careerAwareness,
    familyExpectations,
    locationFlexibility,
    decisionStyle
  } = data;
  
  // Store in database...
}
```

**Task 3: Wireframes (1 hour)**
- Sketch preliminary report screen
- Design "Build 3-year plan" CTA
- Map deep dive question flow

**Task 4: Sitara Review (1 hour)**
- Send wireframes for overnight feedback
- Ask: "Would you click this CTA?"
- Get input on question wording

**Deliverable:** Schema deployed, API updated, wireframes approved

---

## Day 2 (Tuesday, Nov 26): Deep Dive Implementation

### Morning (3 hours): Questions + RAG Prompt Engineering

**Task 1: Finalize 6 Questions (1 hour)**

Based on Sitara feedback, finalize wording:

**Q5: Current Performance**
```
"What are your current marks for each subject you enjoy?"
[For each subject from Q1: Dropdown 0-39%, 40-49%, 50-59%, 60-69%, 70-79%, 80-100%]
```

**Q6: Support System**
```
"What support do you have for improving your marks?"
☐ School tutoring available
☐ Private tutor (family can afford)
☐ Study groups with friends
☐ Online resources (Khan Academy, etc.)
☐ Family help with homework
☐ None of the above
```

**Q7: Career Awareness**
```
"How familiar are you with different career options?"
○ I know exactly what I want to do
○ I have some ideas but want to explore
○ I'm completely unsure where to start
```

**Q8: Family Expectations**
```
"Do your family's career expectations match your interests?"
○ Yes, we're aligned
○ Somewhat different
○ Very different (they want X, I want Y)
○ No family expectations/pressure
```

**Q9: Location Flexibility**
```
"Are you willing to move to another city for studies?"
○ Yes, anywhere in South Africa
○ Only to nearby cities (within 200km)
○ Must stay in my province
○ Must stay at home (commute only)
```

**Q10: Decision Style**
```
"If your first choice doesn't work out, how do you feel about alternatives?"
○ I have backup plans ready
○ I'm open to alternatives
○ I only want my first choice
○ I'm not sure how I'd handle it
```

---

**Task 2: Enhanced RAG Prompt Builder (1 hour)**

```javascript
// lib/rag/generation.js

function buildEnhancedPrompt(studentData) {
  let prompt = baseSystemPrompt;
  
  // Q5: Subject marks - Identify improvement gaps
  if (studentData.subjectMarks) {
    prompt += `\n\nSTUDENT PERFORMANCE DATA:\n`;
    for (const subject of studentData.subjectMarks) {
      prompt += `- ${subject.name}: ${subject.markRange}\n`;
    }
    prompt += `\nUse this to identify improvement pathways and realistic timelines.\n`;
    prompt += `If marks are below career requirements, suggest tutoring and improvement plans.\n`;
  }
  
  // Q6: Support system - Reality-check recommendations
  if (studentData.supportSystem) {
    prompt += `\n\nAVAILABLE SUPPORT:\n${JSON.stringify(studentData.supportSystem)}\n`;
    prompt += `Recommendations must be achievable with these resources.\n`;
    prompt += `If no tutoring available, suggest free alternatives (Khan Academy, peer groups).\n`;
  }
  
  // Q7: Career awareness - Calibrate explanation depth
  if (studentData.careerAwareness === 'completely-unsure') {
    prompt += `\n\nEXPLAIN CAREER OPTIONS IN DETAIL - student is a beginner.\n`;
    prompt += `Include: What the job actually involves, typical day, work environment.\n`;
  } else if (studentData.careerAwareness === 'exactly-know') {
    prompt += `\n\nVALIDATE and CHALLENGE their assumption - they may be wrong.\n`;
    prompt += `Ask: "Have you shadowed someone in this career? Talked to people doing it?"\n`;
  }
  
  // Q8: Family expectations - Flag conflict zones
  if (studentData.familyExpectations === 'very-different') {
    prompt += `\n\nINCLUDE SECTION: "How to talk to your family about this career path."\n`;
    prompt += `Provide specific conversation starters and reasoning they can use.\n`;
  }
  
  // Q9: Location flexibility - Filter institutions
  if (studentData.locationFlexibility) {
    prompt += `\n\nINSTITUTION FILTER: Only recommend institutions matching ${studentData.locationFlexibility}\n`;
    if (studentData.locationFlexibility === 'must-stay-home') {
      prompt += `Focus on: Local universities, TVET colleges, online options.\n`;
    }
  }
  
  // Q10: Decision style - Identify rigid thinking
  if (studentData.decisionStyle === 'only-first-choice') {
    prompt += `\n\nCRITICAL: Student has rigid thinking. MUST include backup career options.\n`;
    prompt += `Explain: "What if you don't get in? What if you hate it after 1 year?"\n`;
  }
  
  return prompt;
}
```

---

**Task 3: 3-Year Action Plan Generator (1 hour)**

```javascript
// lib/rag/action-plan.js (new file)

export function generateActionPlan(studentData, recommendedCareer) {
  const plan = [];
  const currentGrade = studentData.grade;
  
  // Year 1 (Current grade)
  if (currentGrade === 10) {
    plan.push("### Grade 10 Action Plan (This Year)");
    
    // Subject improvement
    const weakSubjects = studentData.subjectMarks
      .filter(s => s.markRange.startsWith('40') || s.markRange.startsWith('50'))
      .map(s => s.name);
    
    if (weakSubjects.length > 0) {
      plan.push(`1. **Subject Performance**: Focus on improving ${weakSubjects.join(', ')}`);
      
      if (studentData.supportSystem.includes('tutoring')) {
        plan.push(`   - Use available tutoring at school`);
      } else {
        plan.push(`   - Find peer study groups or use Khan Academy`);
      }
    }
    
    plan.push(`2. **Subject Choices**: Ensure you take ${recommendedCareer.requiredSubjects.join(', ')} next year`);
    plan.push(`3. **Exploration**: Shadow someone in ${recommendedCareer.title} during school holidays`);
  }
  
  // Year 2 (Grade 11)
  plan.push("\n### Grade 11 Action Plan (Next Year)");
  plan.push(`1. **Target Marks**: Maintain ${recommendedCareer.minimumMarks}+ in key subjects`);
  plan.push(`2. **Bursary Research**: Start researching these bursaries:`);
  recommendedCareer.bursaries.forEach(b => {
    plan.push(`   - ${b.name} (deadline: ${b.deadline})`);
  });
  
  // Year 3 (Grade 12)
  plan.push("\n### Grade 12 Action Plan (Final Year)");
  plan.push(`1. **Applications**: Apply to these institutions by July:`);
  recommendedCareer.institutions.forEach(i => {
    plan.push(`   - ${i.name}`);
  });
  plan.push(`2. **NSFAS**: Submit application by November if needed`);
  plan.push(`3. **Backup Plan**: If marks drop, consider ${recommendedCareer.alternativePath}`);
  
  return plan.join('\n');
}
```

**Deliverable:** Questions finalized, RAG prompt enhanced, action plan generator built

---

### Afternoon (4 hours): UI Components

**Task 1: Grade Selector (30 min)**
```jsx
// app/assessment/components/GradeSelector.jsx (new file)

export default function GradeSelector({ onSelect }) {
  return (
    <div className="grade-selector">
      <h2>What grade are you in?</h2>
      <div className="grade-buttons">
        <button onClick={() => onSelect(10)} className="grade-btn">
          Grade 10
        </button>
        <button onClick={() => onSelect(11)} className="grade-btn">
          Grade 11
        </button>
        <button onClick={() => onSelect(12)} className="grade-btn">
          Grade 12
        </button>
      </div>
    </div>
  );
}
```

---

**Task 2: Preliminary Report Component (1 hour)**
```jsx
// app/assessment/components/PreliminaryReport.jsx (new file)

export default function PreliminaryReport({ careers, onDeepDive, onSkip }) {
  return (
    <div className="preliminary-report">
      <h2>📊 Your Quick Career Matches</h2>
      <p>Based on your interests, here are 3 careers to explore:</p>
      
      <div className="career-list">
        {careers.slice(0, 3).map((career, i) => (
          <div key={i} className="career-card-preview">
            <h3>{i + 1}. {career.title}</h3>
            <p className="match-score">{career.matchPercentage}% match</p>
            <p className="one-liner">{career.oneSentenceWhy}</p>
          </div>
        ))}
      </div>

      <div className="deep-dive-cta">
        <div className="cta-header">
          <h3>Want Your 3-Year Action Plan?</h3>
          <span className="time-badge">5 more minutes</span>
        </div>
        
        <p>Get personalized guidance on:</p>
        <ul className="benefits-list">
          <li>✓ How to improve your marks year by year</li>
          <li>✓ Specific bursary deadlines and amounts</li>
          <li>✓ Backup plans if things change</li>
          <li>✓ How to talk to your family about your choices</li>
        </ul>
        
        <div className="cta-buttons">
          <button onClick={onDeepDive} className="btn-primary">
            Build My 3-Year Plan →
          </button>
          <button onClick={onSkip} className="btn-secondary">
            This Is Enough For Now
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

**Task 3: Deep Dive Questions Component (1.5 hours)**
```jsx
// app/assessment/components/DeepDiveQuestions.jsx (new file)

export default function DeepDiveQuestions({ 
  currentQuestion, 
  formData, 
  onChange, 
  onNext, 
  onPrev 
}) {
  
  const renderQuestion = () => {
    switch(currentQuestion) {
      case 5:
        return <SubjectMarksQuestion 
          subjects={formData.enjoyedSubjects}
          marks={formData.subjectMarks}
          onChange={(marks) => onChange('subjectMarks', marks)}
        />;
      
      case 6:
        return <SupportSystemQuestion 
          selected={formData.supportSystem}
          onChange={(support) => onChange('supportSystem', support)}
        />;
      
      case 7:
        return <CareerAwarenessQuestion 
          value={formData.careerAwareness}
          onChange={(awareness) => onChange('careerAwareness', awareness)}
        />;
      
      case 8:
        return <FamilyExpectationsQuestion 
          value={formData.familyExpectations}
          onChange={(expectations) => onChange('familyExpectations', expectations)}
        />;
      
      case 9:
        return <LocationFlexibilityQuestion 
          value={formData.locationFlexibility}
          onChange={(location) => onChange('locationFlexibility', location)}
        />;
      
      case 10:
        return <DecisionStyleQuestion 
          value={formData.decisionStyle}
          onChange={(style) => onChange('decisionStyle', style)}
        />;
      
      default:
        return null;
    }
  };
  
  return (
    <div className="deep-dive-questions">
      <div className="progress-indicator">
        Question {currentQuestion} of 10
      </div>
      
      {renderQuestion()}
      
      <div className="navigation">
        <button onClick={onPrev} className="btn-secondary">
          ← Previous
        </button>
        <button onClick={onNext} className="btn-primary">
          {currentQuestion === 10 ? 'Get My Results' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
```

---

**Task 4: Update AssessmentForm Logic (1 hour)**
```javascript
// app/assessment/components/AssessmentForm.jsx - Add adaptive logic

const [currentStep, setCurrentStep] = useState(0); // Start at grade selection
const [grade, setGrade] = useState(null);
const [showPreliminaryReport, setShowPreliminaryReport] = useState(false);
const [preliminaryData, setPreliminaryData] = useState(null);

// Step 0: Grade selection
if (currentStep === 0) {
  return <GradeSelector onSelect={(g) => { 
    setGrade(g); 
    setCurrentStep(1); 
  }} />;
}

// Steps 1-4: Core questions (existing)
// ... existing code ...

// After step 4 completion
const handleCoreQuestionsComplete = async () => {
  if (grade === 10) {
    // Generate preliminary report
    const quickReport = await generateQuickReport(formData);
    setPreliminaryData(quickReport);
    setShowPreliminaryReport(true);
  } else {
    // Grade 11-12: Auto-advance with message
    setShowAutoAdvanceMessage(true);
    setTimeout(() => {
      setShowAutoAdvanceMessage(false);
      setCurrentStep(5);
    }, 2000);
  }
};

// Show preliminary report (Grade 10 only)
if (showPreliminaryReport) {
  return (
    <PreliminaryReport
      careers={preliminaryData.careers}
      onDeepDive={() => {
        setShowPreliminaryReport(false);
        setCurrentStep(5);
      }}
      onSkip={() => {
        handleSubmit(preliminaryData, 'quick');
      }}
    />
  );
}

// Steps 5-10: Deep dive questions
if (currentStep >= 5 && currentStep <= 10) {
  return (
    <DeepDiveQuestions
      currentQuestion={currentStep}
      formData={formData}
      onChange={updateFormData}
      onNext={() => {
        if (currentStep === 10) {
          handleSubmit(formData, 'comprehensive');
        } else {
          setCurrentStep(prev => prev + 1);
        }
      }}
      onPrev={() => setCurrentStep(prev => prev - 1)}
    />
  );
}
```

**Deliverable:** All UI components built, adaptive logic implemented

---

## Day 3 (Wednesday, Nov 27): Sitara Validation

### Morning (3 hours): Comprehensive Testing

**Test Protocol:**

**Test 1: Grade 11 Flow (30 min)**
- Sitara completes as Grade 11 student
- Verify: Auto-advances to deep dive after Q4
- Check: All 10 questions feel natural
- Observe: Does she understand each question?

**Test 2: Grade 10 Opt-Out (30 min)**
- Sitara completes as Grade 10 student
- Stops at preliminary report
- Clicks "This Is Enough"
- Verify: Gets quick 3-career report
- Ask: "Is this helpful enough?"

**Test 3: Grade 10 Opt-In (45 min)**
- Sitara completes as Grade 10 student
- Views preliminary report
- Clicks "Build My 3-Year Plan"
- Completes all 10 questions
- Verify: Gets comprehensive report with action plan
- Ask: "Is the 3-year plan worth the extra time?"

**Test 4: Low-Income Integration (45 min)**
- Sitara tests with `constraints.money = 'low'`
- Verify: Bursary info appears in recommendations
- Verify: NSFAS options mentioned
- Verify: Affordable pathways prioritized
- Ask: "Would this help someone who can't afford university?"

**Test 5: CTA Effectiveness (30 min)**
- Show preliminary report to Sitara
- Ask: "Would you click 'Build My 3-Year Plan'?"
- If no: "What would make you click it?"
- If yes: "What made it compelling?"

---

### Afternoon (2 hours): Iterate Based on Feedback

**Common Issues to Fix:**

**Issue 1: Questions unclear**
- Rewrite confusing questions
- Add examples or tooltips
- Simplify language

**Issue 2: CTA not compelling**
- Adjust language ("Get Your Plan" vs "Build My Plan")
- Change time estimate if needed
- Highlight different benefits

**Issue 3: Too long**
- Consider reducing to 8 questions
- Remove Q7 (career awareness) and Q9 (location) if needed
- Keep critical ones: marks, support, family, decision style

**Issue 4: Action plan not actionable**
- Add more specific steps
- Include actual dates and deadlines
- Make recommendations more concrete

**Decision Criteria:**
- ✅ Sitara completes all 10 questions without frustration
- ✅ She says "This is way better than the quick version"
- ✅ She would recommend it to friends
- ✅ Bursary info appears for low-income students

**If she says "too long":**
- Reduce to 8 questions (remove Q7, Q9)
- Test again tomorrow

**Deliverable:** System validated by primary user, bugs fixed

---

## Day 4 (Thursday, Nov 28): Polish + Prep

### Morning (3 hours): Final Polish

**Task 1: UI/UX Refinements (1 hour)**
- Improve mobile responsiveness
- Add loading states
- Polish transitions between steps
- Add progress indicators

**Task 2: Error Handling (1 hour)**
- Handle incomplete responses
- Add validation messages
- Implement auto-save
- Test offline behavior

**Task 3: Performance Optimization (1 hour)**
- Optimize RAG query time
- Cache preliminary reports
- Reduce API calls
- Test on 3G connection

---

### Afternoon (3 hours): Friend Test Preparation

**Task 1: Recruit Testers (1 hour)**
- Sitara invites 3-5 friends
- Mix of Grade 10 and Grade 11
- Different financial backgrounds
- Schedule for Friday after school

**Task 2: Test Protocol Document (1 hour)**
```markdown
# Friday Friend Test Protocol

## Setup
- Pizza arrives at 3:30 PM
- Each student gets their own phone/laptop
- Screen recording enabled (with permission)
- You observe silently

## Instructions to Students
"This is a career guidance tool. Complete the assessment honestly.
We want to know if it's helpful and where it's confusing.
There are no wrong answers."

## Observation Checklist
For each student, note:
- [ ] Grade level
- [ ] Completed assessment? (Yes/No)
- [ ] If no, where did they stop?
- [ ] Time taken (minutes)
- [ ] Opted into deep dive? (Grade 10 only)
- [ ] Facial expressions (confused, engaged, bored)
- [ ] Questions asked during assessment

## Post-Assessment Questions
1. "Did you finish? If not, where did you stop and why?"
2. "What was confusing or unclear?"
3. "Would you use this for real career decisions?"
4. "What would make this better?"
5. (Grade 10 only) "Did you click 'Build My 3-Year Plan'? Why or why not?"

## Success Metrics
- Grade 10 completion (opt-in): >60%
- Grade 11 completion: >80%
- "Would use for real": >70%
- Low-income students see bursaries: 100%
```

**Task 3: Prepare Test Environment (1 hour)**
- Deploy to staging URL
- Test on multiple devices
- Prepare screen recording setup
- Print observation checklists

**Deliverable:** Ready for real user testing

---

## Day 5 (Friday, Nov 29): Real User Testing

### Afternoon (3 hours): Friend Test Session

**3:00 PM - Setup**
- Pizza arrives
- Students arrive
- Brief introduction
- Hand out devices

**3:15 PM - Testing Begins**
- Students start assessment
- You observe silently
- Take notes on observation checklist
- Screen recordings capture interactions

**4:00 PM - Debrief**
- Ask post-assessment questions
- Group discussion
- Collect feedback forms
- Thank students (pizza + R50 voucher each)

**4:30 PM - Analysis**
- Review completion rates
- Identify common drop-off points
- Note confusing questions
- Compile feedback themes

---

### Evening (2 hours): Results Analysis

**Metrics to Calculate:**

1. **Completion Rates**
   - Grade 10 (4 questions only): ___%
   - Grade 10 (opted into 10): ___%
   - Grade 11 (10 questions): ___%

2. **Time Taken**
   - Quick assessment (4 questions): ___ minutes
   - Full assessment (10 questions): ___ minutes

3. **Opt-In Rate**
   - Grade 10 students who clicked "Build My 3-Year Plan": ___%

4. **Quality Indicators**
   - Students who said "would use for real": ___%
   - Students who found it confusing: ___%
   - Low-income students who saw bursaries: ___%

**Decision Matrix:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| G10 opt-in rate | >60% | ___% | ✅/❌ |
| G11 completion | >80% | ___% | ✅/❌ |
| "Would use" | >70% | ___% | ✅/❌ |
| Bursaries shown | 100% | ___% | ✅/❌ |

**If All Green (✅):**
- Ship to production Monday
- Update documentation
- Prepare for pilot deployment

**If Any Red (❌):**
- Identify root cause
- Fix critical issues over weekend
- Retest with Sitara Monday
- Ship Tuesday

---

### Deliverable: Go/No-Go Decision

**Ship if:**
- ✅ >60% Grade 10 opt-in rate
- ✅ >70% completion rate overall
- ✅ >70% "would use for real"
- ✅ 100% bursary visibility for low-income
- ✅ No critical bugs

**Don't ship if:**
- ❌ <50% Grade 10 opt-in (CTA not compelling)
- ❌ <60% completion (too long/confusing)
- ❌ <50% "would use" (not trustworthy)
- ❌ Bursaries missing for low-income (Rule #4 broken)
- ❌ Critical bugs (data loss, crashes)

---

## Success Criteria Summary

### Technical Success
- ✅ Rule #4 implemented (NSFAS prioritization)
- ✅ Database schema updated
- ✅ Adaptive assessment logic working
- ✅ 3-year action plan generator functional
- ✅ All grade flows tested

### User Success
- ✅ Sitara approves (Day 3)
- ✅ Friends complete assessment (Day 5)
- ✅ >60% Grade 10 opt-in rate
- ✅ >70% "would use for real"
- ✅ Bursaries visible for low-income students

### Product Success
- ✅ Thandi transformed from toy to tool
- ✅ Grade 10 students get actionable guidance
- ✅ Low-income students protected
- ✅ System ready for pilot deployment

---

## Risk Mitigation

### Risk 1: Sitara says "too long"
**Mitigation:** Reduce to 8 questions (remove Q7, Q9)  
**Backup:** Keep 4 questions, add "Schedule counselor session" CTA

### Risk 2: Friends don't complete assessment
**Mitigation:** Identify drop-off point, simplify that section  
**Backup:** Make deep dive optional for all grades

### Risk 3: Rule #4 doesn't work
**Mitigation:** Debug immediately, this is non-negotiable  
**Backup:** None - must work before shipping

### Risk 4: Action plans not actionable
**Mitigation:** Add more specific steps, dates, resources  
**Backup:** Remove action plan, focus on career matching only

### Risk 5: Technical bugs block testing
**Mitigation:** Have Day 4 buffer for bug fixes  
**Backup:** Extend sprint by 1 day if needed

---

## Post-Sprint Actions

### If Successful (Ship Monday, Dec 2)
1. Deploy to production
2. Update documentation
3. Train Orchids team on new flow
4. Prepare pilot school materials
5. Resume Rule #5-15 implementation

### If Needs Iteration (Ship Tuesday, Dec 3)
1. Fix critical issues over weekend
2. Retest with Sitara Monday morning
3. Deploy Monday afternoon
4. Same as above

### If Major Pivot Needed
1. Document what didn't work
2. Revert to 4-question flow
3. Keep Rule #4 (NSFAS prioritization)
4. Revisit deep dive after pilot feedback

---

## Communication Plan

### To Sitara (Tonight)
> "I'm building the 10-question version for your friends. Can you test it Wednesday at 3 PM? 
> I need to know if Grade 10s will actually finish it."

### To Sitara's Friends (Thursday)
> "Hi! Sitara invited you to test a career guidance tool. Takes 10-15 minutes, 
> you get pizza and R50 voucher. Friday 3:30 PM at [location]. Interested?"

### To Cofounder (Friday Evening)
> "Friend test complete. Results: [metrics]. 
> Decision: [Ship Monday / Fix and ship Tuesday / Pivot].
> Confidence: [1-10]."

---

## The Bottom Line

**This sprint transforms Thandi from a toy into a tool.**

The 4-question version tells students WHAT they could be.  
The 10-question version tells them HOW to become it.

**Your daughter just leveled up Thandi from "quick quiz" to "life planning tool."**

Build it. Test it Friday. Then resume the rules with real data.

---

## Ready to Start?

**Checklist before Day 1:**
- [ ] SQL access confirmed
- [ ] API endpoint access confirmed
- [ ] Sitara available Wednesday 3 PM
- [ ] Friends recruited for Friday 3:30 PM
- [ ] Pizza ordered for Friday
- [ ] R50 vouchers ready (5x)
- [ ] Screen recording setup tested
- [ ] Observation checklists printed

**If all checked, start Day 1 tomorrow (Monday, Nov 25).**

**Your call.**

