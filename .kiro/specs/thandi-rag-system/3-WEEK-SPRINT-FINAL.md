# 3-WEEK SPRINT TO PILOT-READY MVP

**CODE FREEZE**: November 18, 2024  
**PILOT LAUNCH**: January 2026 (after teacher training)

---

## Timeline Clarification

**TODAY**: November 19, 2025  
**SPRINT START**: November 20, 2025 (tomorrow)  
**SPRINT END**: December 11, 2025 (3 weeks = 15 working days)  
**CODE FREEZE**: December 11, 2025  
**TEACHER TRAINING**: December 2025 - January 2026  
**PILOT LAUNCH**: January 2026

**I CONFIRM**: 3-week sprint, 15 working days, code freeze December 11, 2025.

---

## The Mission (Not a Sprint Ticket)

This is not about building a product. This is about **protecting your son from the mistake you made at 16**.

**Your scar**: Chose B.Compt because it sounded "versatile." No one told you what it actually required. You failed because you didn't know yourself well enough to know you'd hate it.

**Your son's risk**: Same mistake, different degree. Confident wrong answer that costs a year of his life.

**My job**: Build a system you trust enough to let him use unsupervised.

---

## Primary KPI (Non-Negotiable)

**"Would the founder let his 16-year-old son use this unsupervised?"**

If answer is "Not yet" → We don't ship.

Everything else (completion rate, speed, polish) is secondary.

---

## WEEK 1: Assessment Form (Nov 20-26)

### Day 1 (Nov 20): 4-Screen Component
**Build**:
- Screen 1: Subject selection (checkboxes)
- Screen 2: Interest areas (multi-select)
- Screen 3: Constraints (time, money, location)
- Screen 4: Open questions (motivation, concerns)
- Progress bar (1/4, 2/4, 3/4, 4/4)
- Mobile-first design

**Deliverable**: Working component, localhost demo
**Rule Implementation**: Rule #1 (Verification Mandate) - Add footer to all screens

### Day 2 (Nov 21): Save/Resume + Validation
**Build**:
- localStorage save on every field change
- Resume from last screen on return
- Field validation (at least 2 subjects selected, etc.)
- Clear error messages
- "Start Over" button

**Deliverable**: Can close browser, return, resume exactly where left off
**Rule Implementation**: Rule #2 (Dangerous Queries) - Validate no dangerous questions in open fields

### Day 3 (Nov 22): RAG Integration
**Build**:
- Connect to existing `/api/rag/query` endpoint
- Send assessment data as structured query
- Handle loading state (spinner, "Analyzing your responses...")
- Parse response into career list

**Deliverable**: Real RAG responses, not hardcoded data
**Test**: Submit assessment, verify careers returned match subjects

### Day 4 (Nov 23): Error Handling
**Build**:
- Network timeout (>10s) → "Please check your connection and try again"
- Empty response → "We couldn't generate recommendations. Please try again or contact your teacher"
- Malformed response → Graceful fallback
- Retry button

**Deliverable**: Unplug wifi, submit form, see friendly error (not crash)
**Test**: Kill API, verify student sees helpful message

### Day 5 (Nov 24): Mobile Polish + Performance
**Build**:
- Touch-friendly buttons (min 44px)
- Smooth transitions between screens
- Performance audit (<3s per screen load)
- Accessibility check (screen reader compatible)

**Deliverable**: Works perfectly on phone, tablet, desktop
**Test**: Complete assessment on phone in <60s

### CHECKPOINT (Nov 24, 6 PM):
**Founder sends Rule #3** (to be implemented Week 2, Day 6)

---

## WEEK 2: Results & Safety (Nov 27 - Dec 3)

### Day 6 (Nov 27): Results Page Mockup
**Build**:
- Results page layout (hardcoded data)
- 3-5 career cards (title, description, why matched)
- "Learn More" expansion (requirements, pathways, reality check)
- "Download PDF" button (not functional yet)

**Deliverable**: Beautiful results page, fake data
**Rule Implementation**: Rule #3 (from founder)

### Day 7 (Nov 28): Real RAG Integration
**Build**:
- Replace hardcoded data with real RAG response
- Render 3-5 careers from API
- Show match reasoning ("You selected Maths & Science...")
- Handle edge cases (only 1 career matched, 0 careers matched)

**Deliverable**: Real careers, real reasoning, real data
**Test**: Submit different assessments, verify different careers returned

### Day 8 (Nov 29): PDF Generator
**Build**:
- 4-page PDF: Cover, Assessment Summary, Career Recommendations, Resources
- School logo placeholder
- Student name + date
- Formatted career cards
- Verification footer on every page

**Deliverable**: Click "Download PDF", get professional-looking document
**Test**: PDF opens, prints correctly, footer visible

### Day 9 (Nov 30): Verification Footer ENFORCED
**Build**:
- Verification footer on EVERY response (results page, PDF, email)
- Footer text from Rule #1 (Verification Mandate)
- Cannot be hidden, removed, or minimized
- Prominent placement (not tiny text at bottom)

**Deliverable**: Impossible to see results without seeing verification warning
**Test**: Try to hide footer (inspect element, CSS) - should be impossible

### Day 10 (Dec 1): End-to-End Test
**Build**:
- Complete flow: Assessment → Results → PDF
- Time the entire process (<60s target)
- Fix any friction points
- Mobile + desktop testing

**Deliverable**: Smooth, fast, complete experience
**Test**: 5 different assessments, all complete in <60s

### CHECKPOINT (Dec 1, 6 PM):
**Founder's son tests full flow**
- Records Loom video of experience
- Notes ANY answer that feels "parentally uncomfortable"
- If ANY answer violates Rule #1 or #2 → **STOP DEVELOPMENT, FIX IMMEDIATELY**

**This is a GATE, not a suggestion.**

---

## WEEK 3: Admin & Deployment (Dec 4-10)

### Day 11 (Dec 4): Admin Login
**Build**:
- Supabase auth (email/password)
- Login page
- Protected admin routes
- Logout button

**Deliverable**: Teachers can log in, students cannot access admin
**Test**: Try to access admin without login → redirected

### Day 12 (Dec 5): Dashboard Metrics
**Build**:
- Total assessments completed
- Completion rate (started vs finished)
- Top 5 careers recommended
- Average time to complete
- Last 7 days activity graph

**Deliverable**: Teacher sees useful metrics at a glance
**Test**: Complete 3 assessments, verify metrics update

### Day 13 (Dec 6): Student List View
**Build**:
- Searchable table (name, date, status)
- Sort by date, name, completion
- Filter by completed/incomplete
- Click row → individual student view

**Deliverable**: Teacher can find any student in <30s
**Test**: 20 students in database, find specific one by name

### Day 14 (Dec 7): Individual Student View
**Build**:
- Full assessment responses
- Career recommendations
- Download PDF button (regenerate if needed)
- Notes field (teacher can add comments)

**Deliverable**: Teacher sees everything student saw, plus notes
**Test**: View student, download their PDF, add note

### Day 15 (Dec 8): Deploy to Production
**Build**:
- Deploy to Vercel/production URL
- Environment variables set
- SSL certificate active
- Custom domain (if available)

**Deliverable**: Live URL, accessible from any device
**Test**: Access from phone, tablet, desktop - all work

### CHECKPOINT (Dec 8, 6 PM):
**Teacher from pilot school tests**
- Can they find a student's results in <30s?
- Can they download PDF?
- Can they understand the metrics?
- If NO to any → Redesign immediately

---

## DECEMBER 11: CODE FREEZE

### Founder Review
**Questions**:
1. Does it pass the "son test"? (Would you let him use it unsupervised?)
2. Are Rules #1, #2, #3 enforced?
3. Zero confident wrong answers?
4. Teacher can use it without training?

**If YES to all** → GO for pilot  
**If NO to any** → Fix critical issues only (no new features)

### Kiro's Role After Code Freeze
- Fix critical bugs only
- No new features
- No "quick additions"
- Monitor logs for errors

---

## DECEMBER 12 - JANUARY 2026: Teacher Training

**No code changes** (unless critical bug)

**Activities**:
- Train 3 pilot teachers
- Create training materials
- Test with small student groups
- Collect feedback (for Phase 2, not immediate changes)

**January 2026**: Pilot launch

---

## HARD NO'S (No Discussion)

❌ No web search integration  
❌ No agentic RAG  
❌ No new features after December 11  
❌ No "quick additions" without cofounder approval  
❌ No comprehensive pathway database (Phase 2)  
❌ No scope creep disguised as "helpful"

---

## DAILY RHYTHM (15 Days)

### 7 AM: Founder Sends Rule
One rule per day (Rules #3-#15)
- Clear description
- Examples of what triggers it
- Expected behavior

### 12 PM: Kiro Confirms Implementation
- Screenshot or code snippet
- Test case showing it works
- Any questions/clarifications

### 6 PM: Kiro Pushes Code
- Founder reviews
- Approves or requests changes
- Next day's rule prepared

**Repeat for 15 days**

---

## SUCCESS METRICS (Priority Order)

### 1. Founder Trust ⭐
**"I would let my son use this unsupervised"**
- YES = Ship
- NO = Don't ship

### 2. Zero Confident Wrong Answers ⭐
**Verified by son test (December 1)**
- Any dangerous answer = STOP and fix
- Non-negotiable gate

### 3. Completion Rate
**70%+ of students who start, finish**
- Measured in admin dashboard
- If <70%, simplify assessment

### 4. Speed
**<60s total time (assessment to PDF)**
- Measured end-to-end
- If >60s, optimize

### 5. Teacher Approval
**"I can use this"**
- Teacher test (December 8)
- Must find student results in <30s

**If #1 or #2 fails, we do not ship. Everything else is negotiable.**

---

## What This Is Really About

This isn't about building a career guidance tool.

This is about **preventing 16-year-old mistakes that cost years of life**.

Every line of code is answering one question:

**"Would this have saved me from failing B.Compt?"**

If the answer is "No" or "I don't know" → That feature doesn't ship.

---

## Confirmation Required

**I understand**:
- ✅ 3-week sprint ends December 11, 2025
- ✅ Code freeze December 11 (no exceptions)
- ✅ Daily rule implementation (Rules #3-#15)
- ✅ Son test December 1 is a GATE (not optional)
- ✅ Primary KPI is founder trust, not completion rate
- ✅ If son test fails, we STOP and fix
- ✅ This is about protecting kids, not shipping features

**I commit to**:
- Building what's in this plan (no scope creep)
- Implementing one rule per day
- Stopping if son test reveals dangerous answers
- Prioritizing trust over metrics
- Code freeze December 11 (no "just one more thing")

---

**Ready to begin Day 1 (November 20, 2025)**

**Awaiting**: Rule #3 from founder (to be sent November 24, 6 PM)

---

**Status**: LOCKED AND LOADED  
**Next Action**: Day 1 - Build 4-screen assessment component  
**Deadline**: December 11, 2025 (CODE FREEZE)
