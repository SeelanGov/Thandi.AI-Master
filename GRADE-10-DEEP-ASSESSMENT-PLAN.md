# Grade 10 Deep Assessment: Strategic Action Plan

**Date:** November 24, 2025  
**Decision Point:** Should Grade 10 students get the deep 10-question assessment?  
**Your Cofounder's Answer:** Yes, but make it opt-in to avoid overwhelming them.

---

## Executive Summary

**Current State:**
- 4-question assessment (subjects enjoyed, interests, constraints, open questions)
- Designed for Grade 11-12 (original spec)
- Your daughter (Grade 10) tested and approved the UX
- System works but guidance may be too shallow for serious decisions

**The Core Tension:**
- Grade 10 students need deep guidance (subject choices lock in career paths)
- But they're younger, less urgent, might abandon long assessments
- Completion rates drop from 85% (<5 min) to 45% (10-15 min)

**Recommended Solution: Adaptive Assessment with Opt-In Deep Dive**

| Grade | Core Questions | Deep Dive | User Experience |
|-------|----------------|-----------|-----------------|
| **10** | 4 questions | ✅ Optional | Quick report → "Want 3-year plan?" CTA |
| **11-12** | 4 questions | ✅ Required | Auto-advance to deep dive |

**Philosophy:** Prove value first (Grade 10), then ask for more time. Grade 11-12 already know they need help.

---

## What You've Built (Current System)

**Thandi.AI Career Guidance Platform:**
- RAG system with 110 knowledge chunks (90 careers + 20 pathways)
- 4-question assessment taking ~3-5 minutes
- Real validation: Your daughter tested, found UX flaw, you fixed it
- 3 rules implemented: Scope boundary, dangerous queries, math-hate healthcare
- **Missing:** Rule #4 (NSFAS prioritization for low-income students)

**Current Assessment Flow:**
1. Which subjects do you ENJOY? (not just take)
2. What are your interests?
3. What are your constraints? (time, money, location)
4. Open questions (motivation, concerns)
5. → Generate 3-5 career recommendations

**The Problem:** This works for quick guidance but lacks depth for Grade 10 subject choice decisions.

---

## Recommended Action Plan: Path 1 (Balanced Approach)

**Timeline:** 3 days (Nov 25-27, 2025)  
**Philosophy:** Build foundation right, protect vulnerable students first

### Day 1 (Monday, Nov 25): Foundation + Framework

#### Morning Session (3 hours): Rule #4 Implementation
**Task:** NSFAS prioritization for low-income students

**What to Build:**
1. Add financial constraint detection to RAG prompt
2. Prioritize affordable careers when `constraints.money === 'low'`
3. Include bursary information in recommendations
4. Add NSFAS-funded pathway options

**Implementation:**
```javascript
// In lib/rag/generation.js
if (studentProfile.constraints.financial === 'low') {
  systemPrompt += `
  CRITICAL: This student has financial constraints.
  - Prioritize careers with bursary opportunities
  - Include NSFAS-funded pathways (universities, TVET)
  - Mention free/low-cost training options
  - Be specific about application deadlines
  `;
}
```

**Test Cases:**
- Low-income student interested in Engineering → Show Sasol bursary, NSFAS options
- Low-income student interested in Healthcare → Show nursing bursaries, TVET colleges
- Verify bursary info appears in recommendations

**Deliverable:** Rule #4 working with current 4-question flow

---

#### Afternoon Session (3 hours): Adaptive Framework Design
**Task:** Design the opt-in deep dive system

**What to Design:**
1. Grade detection in assessment form (add grade selector)
2. Preliminary report component (for Grade 10 opt-out)
3. "Build 3-year plan" CTA design
4. 6 additional deep dive questions
5. Updated RAG prompt to use additional data

**Wireframe Flow:**
```
Grade 10 Path:
[4 questions] → [Generate quick report] → [Show 3 careers + CTA]
                                          ↓
                                    [Click "Build 3-year plan"]
                                          ↓
                                    [6 more questions] → [Full report]

Grade 11-12 Path:
[4 questions] → [Auto-advance message] → [6 more questions] → [Full report]
```

**Deliverable:** Design document + wireframes

---

### Day 2 (Tuesday, Nov 26): Deep Dive Questions + Implementation

#### Morning Session (4 hours): Design 6 Deep Dive Questions

**Question 5: Current Performance**
```
"What are your current marks for each subject you enjoy?"

For each selected subject from Q1:
- Dropdown: 0-39%, 40-49%, 50-59%, 60-69%, 70-79%, 80-100%

Why: Identifies improvement gaps
Example output: "You need Math 70%+ for Engineering (currently 55%). 
Consider tutoring or pivot to Engineering Technology."
```

**Question 6: Support System**
```
"What support do you have for improving your marks?"

Checkboxes:
- School tutoring available
- Private tutor (family can afford)
- Study groups with friends
- Online resources (Khan Academy, etc.)
- Family help with homework
- None of the above

Why: Informs realistic improvement recommendations
Example output: "With tutoring, you can improve Math from 55% to 70% by Grade 12."
```

**Question 7: Career Awareness**
```
"How familiar are you with different career options?"

Radio buttons:
- I know exactly what I want to do
- I have some ideas but want to explore
- I'm completely unsure where to start

Why: Adjusts explanation depth
Example: "Unsure" → More career education, "Know exactly" → Verification focus
```

**Question 8: Family Expectations**
```
"Do your family's career expectations match your interests?"

Radio buttons:
- Yes, we're aligned
- Somewhat different
- Very different (they want X, I want Y)
- No family expectations/pressure

Why: Flags potential conflict, suggests communication strategies
Example output: "Talk to your family about why you prefer Y over X. 
Show them this report to explain your reasoning."
```

**Question 9: Location Flexibility**
```
"Are you willing to move to another city for studies?"

Radio buttons:
- Yes, anywhere in South Africa
- Only to nearby cities (within 200km)
- Must stay in my province
- Must stay at home (commute only)

Why: Filters institution recommendations realistically
Example: "Must stay home" → Only show local universities/TVET
```

**Question 10: Decision Style**
```
"If your first choice doesn't work out, how do you feel about alternatives?"

Radio buttons:
- I have backup plans ready
- I'm open to alternatives
- I only want my first choice
- I'm not sure how I'd handle it

Why: Identifies rigid thinking, prompts flexibility coaching
Example: "Only first choice" → Add section on backup planning
```

---

#### Afternoon Session (3 hours): Implement Conditional Logic

**File Changes:**

1. **app/assessment/components/AssessmentForm.jsx**
   - Add grade selector (step 0)
   - Add conditional step logic
   - Add preliminary report component
   - Add deep dive CTA

2. **app/assessment/components/DeepDiveQuestions.jsx** (new file)
   - Questions 5-10 component
   - Conditional rendering based on grade

3. **app/assessment/components/PreliminaryReport.jsx** (new file)
   - Quick 3-career summary
   - "Build 3-year plan" CTA
   - "This is enough" skip button

4. **lib/rag/generation.js**
   - Update prompt to use deep dive data when available
   - Add 3-year action plan section for deep dive users

**Deliverable:** 10-question system with adaptive flow implemented

---

### Day 3 (Wednesday, Nov 27): Testing + Validation

#### Morning Session (3 hours): Test All Grade Flows

**Test Scenarios:**

1. **Grade 10 - Opt Out Path**
   - Complete 4 questions
   - View preliminary report
   - Click "This is enough"
   - Verify: Gets quick guidance (3 careers, basic info)

2. **Grade 10 - Opt In Path**
   - Complete 4 questions
   - View preliminary report
   - Click "Build my 3-year plan"
   - Complete 6 more questions
   - Verify: Gets comprehensive guidance with action plan

3. **Grade 11 Path**
   - Complete 4 questions
   - See "Let's go deeper" auto-advance
   - Complete 6 more questions
   - Verify: Gets comprehensive guidance

4. **Grade 12 Path**
   - Same as Grade 11
   - Verify: Urgency messaging appropriate

5. **Rule #4 Integration**
   - Test low-income Grade 10 opt-in
   - Verify: Gets affordable careers + 3-year plan + bursaries
   - Test low-income Grade 11
   - Verify: Same quality guidance

**Test Script:**
```javascript
// scripts/test-adaptive-assessment.js
const testCases = [
  { grade: 10, optIn: false, financial: 'low' },
  { grade: 10, optIn: true, financial: 'low' },
  { grade: 11, financial: 'low' },
  { grade: 12, financial: 'high' }
];
// Run each, verify output quality
```

**Deliverable:** All flows tested, bugs fixed

---

#### Afternoon Session (2 hours): Daughter Validation Round 2

**Test Protocol:**

1. **Show her the opt-in flow**
   - "Here's the quick report. Would you click 'Build my 3-year plan'?"
   - Observe: Does the CTA feel compelling or pushy?

2. **Test 10-question flow**
   - Have her complete all 10 questions
   - Ask: "Did this feel too long?"
   - Time it: Should be 10-15 minutes max

3. **Review output quality**
   - Show her the 3-year action plan
   - Ask: "Is this more helpful than the quick version?"
   - Ask: "Would your friends complete this?"

4. **Get specific feedback**
   - Which questions felt unclear?
   - Which questions felt unnecessary?
   - What would make her abandon the assessment?

**Decision Criteria:**
- If she says "too long" → Reduce to 8 questions
- If she says "CTA feels pushy" → Soften language
- If she says "questions unclear" → Rewrite
- If she says "this is great" → Ship it

**Deliverable:** Validated system ready for pilot

---


## Why This Sequence Works

1. **Rule #4 First** = Protects vulnerable students NOW (with current 4-question flow)
2. **Deep Dive Second** = Makes guidance more accurate TOMORROW
3. **Together** = Low-income Grade 10 student gets prioritized, affordable career with 3-year action plan

This aligns with your "no rush" philosophy while building the right foundation.

---

## The Value Proposition

**Don't say:** "Answer 10 questions"  
**Say:** "Get your 3-year university preparation plan"

**Current 4-question guidance:**
> "Based on your marks, consider Engineering."

**10-question deep dive guidance:**
> "You enjoy Physics (60%) but struggle with Math (45%). For Engineering, you need Math 70%+ by Grade 12.
> 
> **Your 3-Year Action Plan:**
> - **Grade 10 (Now):** Get Math tutoring, aim for 55%+ by year-end
> - **Grade 11:** Join study group, use Khan Academy, target 65%+
> - **Grade 12:** Maintain 70%+, apply for Sasol Engineering Bursary (deadline: June 30)
> 
> **Alternative Path:** If Math doesn't improve, consider Engineering Technology (lower Math requirement, still engineering work)
> 
> **Next Steps This Week:**
> 1. Talk to your Math teacher about tutoring options
> 2. Research Sasol bursary requirements
> 3. Shadow an engineer (ask your school's career counselor)"

**The difference:** Actionability. Student knows exactly what to do tomorrow.

---

