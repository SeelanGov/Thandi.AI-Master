# Day 1 Execution Script - Monday, Nov 25, 2025

**Start Time:** 7:00 AM  
**Check-In:** 12:00 PM  
**End Time:** 4:00 PM

---

## Morning Routine (7:00 AM - 7:15 AM)

- [ ] Coffee/breakfast
- [ ] Review SPRINT-APPROVED-EXECUTE-NOW.md
- [ ] Open all necessary files in editor
- [ ] Start timer for 3-hour morning session

---

## Morning Session: Rule #4 Implementation

### 7:15 AM - 9:15 AM: Code Implementation (2 hours)

**Step 1: Open the file**
```bash
# Open in your editor
code lib/rag/generation.js
```

**Step 2: Find the buildSystemPrompt function**
Look for where the system prompt is constructed.

**Step 3: Add Rule #4 logic**
Add this code block:

```javascript
// Rule #4: NSFAS Prioritization
if (studentProfile.constraints && studentProfile.constraints.money === 'low') {
  systemPrompt += `

🚨 CRITICAL: This student has financial constraints.

PRIORITIZE IN THIS ORDER:
1. Careers with active bursary programs (Sasol, Eskom, mining companies)
2. NSFAS-funded pathways (public universities, TVET colleges)
3. Free training options (learnerships, apprenticeships)

FOR EACH RECOMMENDATION, INCLUDE IN FIRST PARAGRAPH:
- Specific bursary name and provider
- Exact amount (R120,000/year, not "full funding")
- Application deadline (May 30, 2027, not "early in year")
- Total value over 3 years
- NSFAS eligibility criteria

EXAMPLE FORMAT:
"💰 Funding Available: R280,000+ over 3 years
- Sasol Engineering Bursary: R120,000/year (apply by May 2027)
- NSFAS: R80,000/year (apply by November 2027)
- Eskom Bursary: R100,000/year (apply by August 2027)

This career is AFFORDABLE for you with these bursaries..."

SHOW THE MONEY EARLY. Make it feel achievable, not aspirational.
`;
}
```

**Step 4: Save and commit**
```bash
git add lib/rag/generation.js
git commit -m "Implement Rule #4: NSFAS prioritization for low-income students"
```

---

### 9:15 AM - 10:15 AM: Test Rule #4 (1 hour)

**Step 1: Create test script**
```bash
# Create new file
code scripts/test-rule4-nsfas.js
```

**Step 2: Write test**
```javascript
// scripts/test-rule4-nsfas.js

const { generateCareerGuidance } = require('../lib/rag/generation');

async function testRule4() {
  console.log('🧪 Testing Rule #4: NSFAS Prioritization\n');
  
  // Test Case 1: Low-income + Engineering
  console.log('Test 1: Low-income student interested in Engineering');
  const result1 = await generateCareerGuidance({
    enjoyedSubjects: ['Mathematics', 'Physical Science'],
    interests: ['problem-solving', 'technology'],
    constraints: { 
      money: 'low', 
      location: 'Gauteng',
      time: 'full-time'
    },
    openQuestions: {
      motivation: 'I want to build things',
      concerns: 'Can my family afford university?'
    }
  });
  
  console.log('Response:', result1.response.substring(0, 500));
  console.log('\n✅ Check: Does it mention specific bursaries?');
  console.log('✅ Check: Does it show amounts (R120,000/year)?');
  console.log('✅ Check: Does it show deadlines?');
  console.log('✅ Check: Does it mention NSFAS?\n');
  
  // Test Case 2: Low-income + Healthcare
  console.log('Test 2: Low-income student interested in Healthcare');
  const result2 = await generateCareerGuidance({
    enjoyedSubjects: ['Life Sciences', 'Mathematics'],
    interests: ['helping-people', 'science'],
    constraints: { 
      money: 'low', 
      location: 'Western Cape',
      time: 'full-time'
    },
    openQuestions: {
      motivation: 'I want to help sick people',
      concerns: 'University is expensive'
    }
  });
  
  console.log('Response:', result2.response.substring(0, 500));
  console.log('\n✅ Check: Does it mention nursing bursaries?');
  console.log('✅ Check: Does it mention TVET colleges?');
  console.log('✅ Check: Does it show NSFAS options?\n');
  
  console.log('🎯 Rule #4 Test Complete');
}

testRule4().catch(console.error);
```

**Step 3: Run test**
```bash
node scripts/test-rule4-nsfas.js
```

**Step 4: Verify output**
- [ ] Bursary names appear (Sasol, Eskom, NSFAS)
- [ ] Amounts are specific (R120,000/year)
- [ ] Deadlines are mentioned
- [ ] Tone is empowering

**If tests fail:** Debug and fix before moving to afternoon session.

---

### 10:15 AM - 10:30 AM: Break

- [ ] Stretch
- [ ] Snack
- [ ] Review progress

---

## Afternoon Session: Database + Wireframes

### 1:00 PM - 1:30 PM: Database Schema (30 min)

**Step 1: Open schema file**
```bash
code .kiro/specs/thandi-rag-system/database-schema.sql
```

**Step 2: Add migration**
```sql
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

**Step 3: Run migration**
```bash
# Connect to your database and run the migration
# (Use your database tool or command line)
```

**Step 4: Verify**
```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'assessment_responses';
```

---

### 1:30 PM - 2:00 PM: API Endpoint Update (30 min)

**Step 1: Open API file**
```bash
code app/api/assess/route.js
```

**Step 2: Add new fields to POST handler**
```javascript
export async function POST(request) {
  const data = await request.json();
  
  const {
    // Existing fields
    enjoyedSubjects,
    interests,
    constraints,
    openQuestions,
    
    // New deep dive fields
    grade,
    assessmentDepth = 'quick',
    subjectMarks = [],
    supportSystem = [],
    careerAwareness,
    familyExpectations,
    locationFlexibility,
    decisionStyle
  } = data;
  
  // Store in database
  const { data: assessment, error } = await supabase
    .from('assessment_responses')
    .insert({
      enjoyed_subjects: enjoyedSubjects,
      interests,
      constraints,
      open_questions: openQuestions,
      grade,
      assessment_depth: assessmentDepth,
      support_system: supportSystem,
      career_awareness_level: careerAwareness,
      family_expectations: familyExpectations,
      location_flexibility: locationFlexibility,
      decision_style: decisionStyle
    })
    .select()
    .single();
  
  // Store subject marks if provided
  if (subjectMarks.length > 0) {
    await supabase
      .from('subject_performance')
      .insert(
        subjectMarks.map(mark => ({
          assessment_id: assessment.id,
          subject: mark.subject,
          mark_range: mark.range
        }))
      );
  }
  
  // Continue with RAG generation...
}
```

**Step 3: Test API**
```bash
# Use your existing test script or create a quick test
node scripts/test-api-hybrid.js
```

---

### 2:00 PM - 3:00 PM: Create Wireframes (1 hour)

**Option A: Paper Sketches**
- Draw on paper
- Take photos
- Send to Sitara

**Option B: Figma/Digital**
- Create quick mockups
- Export as images
- Send to Sitara

**Screens to wireframe:**
1. Grade selector (3 buttons: Grade 10, 11, 12)
2. Preliminary report (3 career cards)
3. CTA with BOTH versions:
   - Version A: "Want Your 3-Year Action Plan? (5 more minutes)"
   - Version B: "See Your 3-Year Success Plan (5 min • Worth R50K+ in bursaries)"
4. Deep dive questions (Q5-Q10 layout)
5. Final report with 3-year action plan section

---

### 3:00 PM - 4:00 PM: Send to Sitara + Prepare Check-In (1 hour)

**Step 1: Package wireframes**
- Combine all images/sketches
- Add annotations if needed
- Prepare questions for her

**Step 2: Message Sitara**
```
Hey Sitara,

I built the first part of the 10-question version today. 
Need your feedback on these wireframes:

[Attach images]

Key questions:
1. Which CTA would you click - A or B?
2. Are the questions clear?
3. Would your friends complete this?

Need feedback by tonight so I can build the UI tomorrow.

Also confirming: Wednesday 3 PM you'll test the full system?

Thanks!
```

**Step 3: Prepare 12 PM check-in for cofounder**
```
Day 1 Status - November 25, 2025

✅ COMPLETED:
1. Rule #4 implemented (NSFAS prioritization)
2. Test script created - all tests passing
3. Database schema updated and deployed
4. API endpoint updated to accept new fields
5. Wireframes created (5 screens)
6. Sent to Sitara for review

⏳ NOT DONE:
[None]

BLOCKERS:
[None]

CONFIDENCE: 9/10 that Rule #4 works perfectly

SITARA FEEDBACK EXPECTED: Tonight by 8 PM

TOMORROW:
- Build 6 deep dive questions
- Build enhanced RAG prompt
- Build UI components
```

---

## End of Day Checklist (4:00 PM)

- [ ] Rule #4 implemented and tested
- [ ] Database schema deployed
- [ ] API endpoint updated
- [ ] Wireframes created
- [ ] Sitara messaged
- [ ] Cofounder check-in sent
- [ ] Tomorrow's tasks reviewed
- [ ] Code committed and pushed

---

## If You Get Stuck

**Problem: Rule #4 tests failing**
- Check if constraints.money is being passed correctly
- Verify system prompt is being used by LLM
- Test with manual prompt to isolate issue

**Problem: Database migration fails**
- Check if columns already exist
- Use IF NOT EXISTS clause
- Test on staging first

**Problem: Sitara doesn't respond**
- Follow up with phone call
- Can proceed to Day 2 without feedback
- Adjust on Day 3 based on her testing

---

## Success Criteria for Day 1

- ✅ Rule #4 working (bursaries appear for low-income students)
- ✅ Database ready for deep dive data
- ✅ API can accept new fields
- ✅ Wireframes sent to Sitara
- ✅ On track for Day 2

**If all checked, Day 1 is complete. Rest and prepare for Day 2.**

