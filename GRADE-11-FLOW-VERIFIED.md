# Grade 11 Flow - Verified & Ready for Testing

## ⚠️ CRITICAL: Grade 11 = Last Chance to Change Subjects

### Assessment Flow (Same as Grade 10)
```
1. Grade Selection (Grade 11)
   ↓
2. Subject Selection (What you ENJOY)
   ↓
3. Interest Areas
   ↓
4. Constraints
   ↓
5. Open Questions
   ↓
6. Curriculum Profile (What you're TAKING)
   ↓
7. Submit → Results Page
```

### Key Differences from Grade 10 ✅

| Aspect | Grade 10 | Grade 11 |
|--------|----------|----------|
| **Urgency** | "You have time" | "LAST CHANCE - decide NOW" |
| **Math Lit Gate** | HIGH urgency | CRITICAL urgency |
| **Subject Changes** | "Consider changing" | "Change NOW or never" |
| **Timeline** | 2 years to finals | 1 year to finals |
| **Bursaries** | "Start researching" | "Apply next year (2026)" |
| **Action Items** | Long-term planning | Immediate action required |

### Gate Detection Logic ✅

**Math Lit Gate:**
```javascript
// Shows if:
1. Student has Mathematical Literacy
2. Student does NOT have Pure Mathematics
3. Query mentions engineering/STEM
4. Urgency = CRITICAL (Grade 11)

// Message emphasis:
Grade 10: "You still have time to change to Pure Math"
Grade 11: "This is your LAST CHANCE to switch to Pure Math"
Grade 12: "Too late to change - here are alternatives"
```

**Subject Change Gate:**
```javascript
// Shows if:
1. Grade 11 or 12
2. Query includes: "change", "drop", "switch", "different subject"
3. Urgency = HIGH

// Message:
"You can still change subjects in Grade 11, but you must decide NOW. 
Talk to your teacher this week."
```

**Test Results:**
- ✅ Grade 11 Math Lit + Engineering → CRITICAL gate
- ✅ Grade 11 Pure Math + Engineering → NO gate
- ✅ Grade 11 + "drop subject" query → Subject change warning
- ✅ Urgency level = CRITICAL (higher than Grade 10)

### Query Building ✅

**Grade 11 Specific Components:**
```
I am a Grade 11 student in South Africa.
IMPORTANT: I am specifically interested in: [career interests].
Subjects I ENJOY: [enjoyed subjects].
Subjects I'm TAKING: [current subjects].
My current marks (as of November 2025): [marks].

I need:
1) What marks to target by end of Grade 12
2) Bursaries to apply for in 2026
3) Year-by-year improvement plan (Grade 11→12)
4) Subject choices to reconsider
```

**Key Features:**
- ✅ Emphasizes 1-year timeline
- ✅ Mentions specific bursary year (2026)
- ✅ Includes "Grade 11→12" progression
- ✅ Explicitly asks about subject reconsideration
- ✅ IMPORTANT prefix for career interests

### Results Page ✅

**Gate Warning Display (if Math Lit + STEM):**
```
⛔ CRITICAL DECISION

You have Mathematical Literacy, but engineering requires Pure Mathematics.

**This is your LAST CHANCE to change subjects.**

What you need to do THIS WEEK:
1. Talk to your teacher about switching to Pure Math
2. Check if you can handle the workload
3. Get extra tutoring if you switch
4. Decide by end of this term

If you DON'T switch:
- Engineering degrees will be blocked
- Medicine will be blocked
- Most science degrees will be blocked

Alternative careers with Math Lit:
- Business Management
- Accounting (some institutions)
- Social Sciences
- Creative fields
```

**Timeline Emphasis:**
- Shows "1 year to Grade 12"
- Bursary deadlines for 2026
- University application timeline
- Subject change deadline

### Testing Scenarios ✅

**Scenario 1: Grade 11 Math Lit + Engineering**
- Input: Math Lit, wants engineering
- Expected: CRITICAL gate warning
- Message: "LAST CHANCE to switch to Pure Math"
- Action: "Talk to teacher THIS WEEK"

**Scenario 2: Grade 11 Pure Math + Medicine**
- Input: Pure Math, Physical Sciences, Life Sciences
- Expected: NO gate warning
- Message: Positive encouragement
- Action: "Improve marks to 70%+ by Grade 12"

**Scenario 3: Grade 11 + Subject Change Query**
- Input: "Can I drop Physical Sciences?"
- Expected: Subject change warning
- Message: "You can still change, but decide NOW"
- Action: "Talk to teacher this week"

**Scenario 4: Grade 11 Low Marks**
- Input: Math 55%, Physical Sciences 58%
- Expected: Improvement plan
- Message: "You have 1 year to improve"
- Action: "Target 70%+ by end of Grade 12"

### Implementation Status ✅

**What's Working:**
1. ✅ Gate detection identifies Grade 11
2. ✅ Urgency level = CRITICAL
3. ✅ Query building includes Grade 11 specifics
4. ✅ Subject change detection (Rule 4)
5. ✅ Timeline awareness (1 year to Grade 12)
6. ✅ Bursary year calculation (2026)

**What's Mock (Will Be Real Later):**
- Career recommendations (hardcoded)
- RAG endpoint (mock responses)
- Bursary details (placeholder)

### Critical Messages for Grade 11 ✅

**Math Lit Gate:**
- "LAST CHANCE to switch to Pure Math"
- "Decide THIS WEEK"
- "Talk to your teacher NOW"

**Subject Changes:**
- "You can still change, but act NOW"
- "This is your final opportunity"
- "Grade 12 is too late"

**Timeline:**
- "1 year to Grade 12 finals"
- "Bursary applications open in 2026"
- "University applications next year"

**Action Items:**
1. Improve marks NOW (1 year left)
2. Research bursaries for 2026
3. Consider subject changes (last chance)
4. Start university research
5. Build CV/portfolio

## 🎯 Ready for Testing

### Grade 11 vs Grade 10 Comparison

| Feature | Grade 10 | Grade 11 |
|---------|----------|----------|
| Math Lit urgency | HIGH | CRITICAL |
| Subject change | "Consider it" | "Do it NOW" |
| Timeline | "2 years" | "1 year" |
| Tone | Exploratory | Urgent |
| Actions | Long-term | Immediate |

### Next Steps

When testing Grade 11:
1. Verify CRITICAL urgency shows for Math Lit
2. Check subject change warnings appear
3. Confirm 1-year timeline messaging
4. Validate bursary year (2026)
5. Test "Grade 11→12" progression language

## 📝 Notes

- Grade 11 is the MOST CRITICAL year
- Last chance to change subjects
- Urgency level higher than Grade 10
- Timeline emphasis: "1 year left"
- Action-oriented messaging
- Mock mode intentional for flow testing
