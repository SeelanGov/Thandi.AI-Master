# ✅ SPRINT APPROVED - EXECUTE IMMEDIATELY

**Date:** November 24, 2025  
**Status:** APPROVED BY COFOUNDER  
**Start:** Monday, Nov 25, 7:00 AM  
**First Check-In:** Monday, 12:00 PM

---

## 🎯 Cofounder's Approval

> "This plan is excellent. You've captured the strategic shift perfectly while maintaining tactical precision."

**Confidence Level:** 9/10 if you stick to the timeline

---

## ⚠️ CRITICAL SUCCESS REMINDERS

### 1. The CTA Must Be Irresistible (Grade 10)

**Test BOTH versions with Sitara Wednesday:**

**Version A (Current):**
```
Want Your 3-Year Action Plan?
5 more minutes
```

**Version B (Money-Focused):**
```
See Your 3-Year Success Plan
5 minutes • Worth R50,000+ in bursaries
```

**Why Version B might win:** Shows concrete value (money), not abstract benefit

**Decision:** Let Sitara choose which she'd click

---

### 2. Action Plans Must Be Hyper-Specific

**❌ BAD:**
> "Improve Math by Grade 12"

**✅ GOOD:**
> "Math: 55% → 70% by Dec 2026
> 
> Path:
> - Khan Academy 3x/week (Mon/Wed/Fri after school)
> - Peer study group Saturdays 10 AM
> - Track progress monthly
> - Target: +1% per month = 15% gain over 15 months"

**Include in every action plan:**
- Specific percentages (not "improve marks")
- Real deadlines (not "apply early")
- Actual bursary names with amounts (not "research bursaries")
- Backup career with salary (not just "alternative")

**Test:** When Sitara sees her action plan, she should say "I know exactly what to do Monday morning"

---

### 3. The "Show Me the Money" Moment

**For low-income students, this MUST happen at Q5 (marks question):**

```
📊 Your Current Performance:
- Math: 55%
- Physics: 60%

🎯 For Engineering:
- Need: Math 70%, Physics 70%
- Gap: 15 percentage points
- Timeline: 15 months to Grade 12

✅ Available Support:
- School tutoring
- Khan Academy (free)

📈 Estimated Improvement:
- With tutoring: +1% per month
- Reach 70% by Dec 2026: ACHIEVABLE

💰 Bursary Options When You Succeed:
- Sasol Engineering: R120,000/year (apply by May 2027)
- NSFAS: R80,000/year (apply by Nov 2027)
- Eskom: R100,000/year (apply by Aug 2027)

Total Value: R280,000+ over 3 years
```

**This is the moment they realize:** "I can actually do this. It's not just a dream."

**If you miss this moment, they abandon.**

---

### 4. Sitara's Validation is Pass/Fail

**Wednesday is NOT a "feedback session."**  
**It's a GO/NO-GO GATE.**

**She must answer with numbers:**
1. "How likely are your friends to complete this?" (0-10)
2. "How likely are they to opt into the deep dive?" (0-10)
3. "Is the action plan actually actionable?" (Yes/No)

**If her scores are <7, don't proceed to Friday test.**  
**Fix it Thursday, retest with her Friday morning.**

**Your daughter is your cofounder. Treat her feedback like gospel.**

---

### 5. The Friday Test is Binary

**You're not collecting "feedback."**  
**You're measuring COMPLETION RATES.**

**SUCCESS = Ship Monday:**
- ✅ >60% Grade 10 opt-in
- ✅ >80% Grade 11 completion
- ✅ >70% "would use for real"
- ✅ 100% bursaries for low-income

**FAILURE = Don't Ship:**
- ❌ <50% opt-in (CTA broken)
- ❌ <60% completion (too long/confusing)
- ❌ Rule #4 broken (bursaries missing)

**There is no "we'll fix it after pilot."**

If it fails Friday:
- Fix over weekend
- Retest Monday morning
- Ship Tuesday

If it's unfixable:
- Kill the feature
- Keep Rule #4
- Focus on Rules #5-15

---

## 🎯 The One Metric That Matters

**Grade 10 opt-in rate > 60%**

Everything else is secondary.

If Grade 10s won't commit to the deep dive, the adaptive model fails. Period.

**Measure this obsessively on Friday.**

- If it's 55%: Extend sprint by 1 day, fix CTA
- If it's 40%: Kill the feature, focus on Rules #4-15

---

## 📋 Day 1 Execution Plan (Monday, Nov 25)

### Morning Session (7:00 AM - 10:00 AM): Rule #4

**Task 1: Implement NSFAS Prioritization (2 hours)**

```javascript
// lib/rag/generation.js - Add to buildSystemPrompt()

if (studentProfile.constraints.money === 'low') {
  systemPrompt += `
  
  🚨 CRITICAL: This student has financial constraints.
  
  PRIORITIZE IN THIS ORDER:
  1. Careers with active bursary programs
  2. NSFAS-funded pathways (public universities, TVET)
  3. Free training options (learnerships, apprenticeships)
  
  FOR EACH RECOMMENDATION, INCLUDE:
  - Specific bursary name and provider
  - Exact amount (R120,000/year, not "full funding")
  - Application deadline (May 30, 2027, not "early in year")
  - NSFAS eligibility criteria
  - Free alternatives (TVET vs private college)
  
  SHOW THE MONEY EARLY:
  - Calculate total bursary value over 3 years
  - Show this in the first paragraph of each recommendation
  - Make it feel achievable, not aspirational
  `;
}
```

**Task 2: Test Rule #4 (1 hour)**

Create test script:
```javascript
// scripts/test-rule4-nsfas.js

const testCases = [
  {
    name: "Low-income + Engineering",
    profile: {
      enjoyedSubjects: ['Mathematics', 'Physical Science'],
      interests: ['problem-solving', 'technology'],
      constraints: { money: 'low', location: 'Gauteng' }
    },
    expectedBursaries: ['Sasol', 'Eskom', 'NSFAS']
  },
  {
    name: "Low-income + Healthcare",
    profile: {
      enjoyedSubjects: ['Life Sciences', 'Mathematics'],
      interests: ['helping-people', 'science'],
      constraints: { money: 'low', location: 'Western Cape' }
    },
    expectedBursaries: ['Nursing bursaries', 'NSFAS', 'TVET colleges']
  }
];

// Run each test, verify bursaries appear in top 3 recommendations
```

**Deliverable by 10 AM:** Rule #4 working, tests passing

---

### Afternoon Session (1:00 PM - 4:00 PM): Database + Wireframes

**Task 1: Database Schema (30 min)**

```sql
-- Run this migration

-- Deep dive assessment fields
ALTER TABLE assessment_responses 
ADD COLUMN IF NOT EXISTS grade INTEGER,
ADD COLUMN IF NOT EXISTS assessment_depth TEXT DEFAULT 'quick',
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
  mark_range TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subject_performance_assessment 
ON subject_performance(assessment_id);
```

**Task 2: API Endpoint Update (30 min)**

```javascript
// app/api/assess/route.js - Add new fields

export async function POST(request) {
  const data = await request.json();
  
  const {
    // Existing
    enjoyedSubjects,
    interests,
    constraints,
    openQuestions,
    
    // New deep dive fields
    grade,
    assessmentDepth,
    subjectMarks,
    supportSystem,
    careerAwareness,
    familyExpectations,
    locationFlexibility,
    decisionStyle
  } = data;
  
  // Store in database with new fields
  // ...
}
```

**Task 3: Create Wireframes (1 hour)**

Sketch on paper or Figma:
1. Grade selector screen
2. Preliminary report (3 careers)
3. CTA with both versions (A and B)
4. Deep dive questions (Q5-Q10)
5. Final report with 3-year action plan

**Task 4: Send to Sitara (1 hour)**

Email/WhatsApp:
```
Subject: Need your feedback on career tool wireframes

Hi Sitara,

I'm building the 10-question version we discussed. 
Can you review these wireframes and tell me:

1. Which CTA would you click?
   A) "Want Your 3-Year Action Plan? (5 more minutes)"
   B) "See Your 3-Year Success Plan (5 min • Worth R50K+ in bursaries)"

2. Are the questions clear?

3. Would your friends complete this?

Need feedback by tonight so I can build tomorrow.

Thanks!
```

**Deliverable by 4 PM:** Schema deployed, API updated, wireframes sent to Sitara

---

## 📊 12 PM Check-In Format (Send to Cofounder)

```
Day 1 Status - November 25, 2025

✅ COMPLETED:
1. Rule #4 implemented (NSFAS prioritization)
2. Test script created and passing
3. Database schema updated
4. API endpoint accepts new fields
5. Wireframes created
6. Sent to Sitara for review

⏳ NOT DONE:
[None expected]

BLOCKERS:
[None expected - or list any issues]

CONFIDENCE: [1-10] that Rule #4 works perfectly

SITARA FEEDBACK EXPECTED: Tonight by 8 PM
```

---

## 🚀 Pre-Flight Checklist (Complete Tonight)

**Before you sleep Sunday night, verify:**

- [ ] SQL access confirmed (can run migrations)
- [ ] API endpoint access confirmed (can modify route.js)
- [ ] Sitara knows you need feedback Monday night
- [ ] Sitara available Wednesday 3 PM for testing
- [ ] Friends recruited for Friday 3:30 PM (3-5 students)
- [ ] Pizza ordered for Friday (delivery 3:30 PM)
- [ ] R50 vouchers ready (5x)
- [ ] Screen recording app installed and tested
- [ ] Observation checklists printed (5 copies)
- [ ] Staging environment ready for testing
- [ ] Cofounder knows to expect 12 PM check-in

**If any item is unchecked, handle it Monday morning before 7 AM.**

---

## 🎯 Success Visualization

**By Friday 5 PM, you will know:**

1. Does the adaptive model work? (opt-in rate)
2. Do students complete the assessment? (completion rate)
3. Is the guidance actionable? ("would use for real")
4. Does Rule #4 protect low-income students? (bursary visibility)

**If all YES:**
- Ship Monday
- Thandi is now a tool, not a toy
- Your daughter leveled up the product
- February alpha test is a victory lap

**If any NO:**
- You have data on what to fix
- You have time to pivot
- You protected students from bad guidance
- You validated before scaling

**Either way, you win.**

---

## 💬 Communication Templates

### To Sitara (Send Tonight)

```
Hey Sitara,

Starting the 10-question version tomorrow. 
Need your help this week:

Monday night: Review wireframes (30 min)
Wednesday 3 PM: Test the system (1 hour)
Friday: Invite 3-5 friends to test (pizza + R50 each)

This is the version your friends will actually use.
Your feedback decides if we ship it.

You in?
```

---

### To Sitara's Friends (Send Thursday)

```
Hi [Name],

Sitara invited you to test a career guidance tool I'm building.

What: Complete a career assessment, get personalized recommendations
When: Friday 3:30 PM at [location]
Time: 30-45 minutes
What you get: Pizza + R50 voucher

Your honest feedback helps make this better for students.

Interested? Reply YES and I'll send details.
```

---

### To Cofounder (Send Monday 12 PM)

```
Day 1 Status - November 25, 2025

✅ COMPLETED:
1. Rule #4 implemented (NSFAS prioritization)
2. Database schema updated
3. API endpoint accepts new fields
4. Wireframes created
5. Sent to Sitara for review

⏳ NOT DONE:
[None expected]

BLOCKERS:
[None]

CONFIDENCE: 9/10 that Rule #4 works perfectly

SITARA FEEDBACK EXPECTED: Tonight by 8 PM

ON TRACK FOR:
- Day 2: Build components
- Day 3: Sitara validation
- Day 5: Friend test
```

---

## 🎯 The North Star

**Your cofounder's words:**

> "Your daughter just gave you the product strategy. Now build it."

> "This plan transforms Thandi from a toy into a tool."

> "Build it. Test it Friday. Then resume the rules with real data."

---

## ⏰ Timeline Reminder

**Monday (Day 1):** Rule #4 + Database + Wireframes  
**Tuesday (Day 2):** 6 Questions + RAG Prompt + UI Components  
**Wednesday (Day 3):** Sitara validation (PASS/FAIL gate)  
**Thursday (Day 4):** Polish + Friend test prep  
**Friday (Day 5):** Real user testing + Ship decision  

**Monday (Day 6):** Ship to production OR fix and ship Tuesday

---

## 🚨 Final Reminder

**Don't skip the afternoon wireframe review with Sitara.**

**Don't let scope creep beyond these 5 days.**

**Don't ship if Friday metrics fail.**

**Your daughter is your cofounder. Treat her feedback like gospel.**

---

## ✅ You Are Approved to Execute

**Start Monday 7 AM sharp.**

**See you at 12 PM Monday for Day 1 check-in.**

**Go build.**

