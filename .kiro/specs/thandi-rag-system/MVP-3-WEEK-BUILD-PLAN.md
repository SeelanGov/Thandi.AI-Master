# THANDI MVP: 3-Week Build Plan
**Ship Date: January 20, 2026 (3 weeks from today)**

---

## MANDATE (Read This First)

**What we're building:**
- Mobile-first 15-question assessment form (4 screens)
- Connect to existing RAG endpoint (87% accurate)
- Display 3-5 career recommendations with VERIFY links
- Generate PDF report
- Build admin dashboard

**What we're NOT building:**
- ❌ Web search integration
- ❌ Agentic RAG
- ❌ New features without explicit approval
- ❌ Anything that delays January 20 ship date

**Success criteria:**
- 70%+ completion rate
- 0 confident wrong answers
- 1 proud father

---

## WEEK 1: Multi-Step Assessment Form (Dec 30 - Jan 5)

### Day 1 (Monday): Component Architecture

**Build:** `/components/AssessmentForm.js`

**Features:**
- 4 screens (Academic, Interests, Constraints, Goals)
- Progress bar (1/4, 2/4, 3/4, 4/4)
- localStorage save/resume
- Mobile-first (max-width 400px)
- Touch-friendly buttons (min 44px height)

**Tech Stack:**
- React functional component
- useState for form state
- Tailwind CSS for styling
- localStorage API

**Deliverable:** Working form UI, no backend connection yet

**Test:** Can navigate between screens, progress bar updates

---

### Day 2 (Tuesday): Form State & Validation

**Build:** Form state management

**Features:**
- useReducer or useState for 15 questions
- Required fields marked with `*`
- Inline error messages (red text below field)
- localStorage: Save after each screen
- localStorage: Load on page refresh

**Validation Rules:**
- Screen 1 (Academic): Grade, subjects, marks required
- Screen 2 (Interests): At least 1 activity selected
- Screen 3 (Constraints): Income bracket required
- Screen 4 (Goals): Career interests required

**Deliverable:** Form validates, saves progress, prevents submit if incomplete

**Test:** Refresh page mid-form, data persists

---

### Day 3 (Wednesday): RAG Integration

**Build:** Connect form to `/api/rag/query`

**Payload Format:**
```javascript
{
  query: "Generated from student profile",
  studentProfile: {
    grade: "12",
    subjects: ["Mathematics", "Physical Sciences", "English"],
    subjectStrengths: ["Mathematics"],
    subjectWeaknesses: ["Languages"],
    marks: {
      mathematics: 75,
      physical_sciences: 68,
      english: 62
    },
    activities: "Soccer, coding club",
    workPreference: "data",
    householdIncome: "<350k",
    travelDistance: "national",
    workEnvironment: "office",
    careerInterests: "Software, AI",
    salaryVsPassion: 7,
    targetUniversity: "UCT",
    willingToRelocate: "yes",
    biggestWorry: "Choosing wrong path"
  }
}
```

**Features:**
- Submit button triggers API call
- Loading state (spinner + "Analyzing your profile...")
- Timeout after 15 seconds
- Navigate to results page on success

**Deliverable:** Submit button triggers RAG query, shows loading state

**Test:** Submit form, see loading spinner, wait for response

---

### Day 4 (Thursday): Error Handling & Edge Cases

**Build:** Resilient error handling

**Error Scenarios:**
1. **Network failure:** "Connection lost. Check your internet and try again."
2. **RAG timeout (>15s):** "Taking longer than expected. Try again or contact support."
3. **Empty response:** "We couldn't generate recommendations. Please review your answers and try again."
4. **API error:** "Something went wrong. Please try again later."

**Features:**
- Error message display (red box, clear text)
- Retry button (resubmits form)
- "Contact support" link (email or WhatsApp)
- Never show blank screen or technical errors

**Deliverable:** Resilient error handling, user never sees blank screen

**Test:** Disconnect internet, submit form, see error message

---

### Day 5 (Friday): Mobile Responsive Polish

**Build:** Mobile optimization

**Features:**
- Test on actual smartphone (4-inch screen minimum)
- Fix layout breaks
- Ensure text is readable (min 16px font)
- Buttons are tappable (min 44px height)
- Loading spinner is visible
- Smooth transitions between screens

**Performance:**
- Each screen loads in <1 second
- Form submission in <3 seconds (excluding RAG processing)
- No janky animations

**Deliverable:** Form feels native on mobile, no zooming required

**Test:** Complete form on smartphone, no issues

---

### Weekend (Jan 4-5): FOUNDER TESTING

**Founder's job:**
- Test form with 16-year-old son
- Record Loom video of him using it
- Document red flags:
  - Questions he hesitates on >5 seconds
  - Answers that confuse him
  - Any UI issues

**Deliverable:** Loom video + red flag list sent to Kiro

---

## WEEK 2: Results Display & PDF (Jan 6-12)

### Day 6 (Monday): Results Page Mockup

**Build:** `/components/ResultsPage.js`

**Features:**
- Career title + match percentage (e.g., "Data Scientist - 92% match")
- "Why this fits you" section (2-3 sentences)
- Study path (degree, universities, duration)
- Bursaries (name, amount, deadline, link)
- Salary range (entry-level, mid-career)
- Next steps (numbered list, 3-5 items)

**Styling:**
- Mobile-first
- Card layout for each career
- Expandable sections (tap to see more)
- Print-friendly

**Deliverable:** Pixel-perfect results page with mock data

**Test:** Looks good on mobile and desktop

---

### Day 7 (Tuesday): Real RAG Data Integration

**Build:** Connect results page to RAG response

**Features:**
- Parse RAG response JSON
- Render 3-5 career recommendations dynamically
- Handle missing fields gracefully (e.g., no bursaries available)
- Fallback: If <3 careers, show "Limited matches found. Speak with your counselor."

**Verification Footer (RULE #1):**
```
⚠️ VERIFY THIS INFORMATION:
1. Check [official source URL]
2. Call [institution] at [phone number]
3. Ask your Life Orientation teacher

Thandi provides guidance, not decisions. Always verify before making choices.
```

**Deliverable:** Results page renders real data, handles edge cases

**Test:** Submit 5 different profiles, verify results display correctly

---

### Day 8 (Wednesday): PDF Generator

**Build:** `/lib/pdf/generateReport.js`

**Library:** `jsPDF` (lightweight, free tier compatible)

**Template:**
- **Page 1:** Assessment summary (strengths, interests, constraints)
- **Page 2-3:** Top 5 career recommendations (full details)
- **Page 4:** Action plan (bursaries, next steps, timeline)

**Branding:**
- School logo placeholder (configurable)
- School name in header
- Student name, date, report ID in footer

**Verification Footer:** Must appear on every page

**Deliverable:** "Download PDF" button works, generates PDF in <5s

**Test:** Download PDF, open on phone, verify readable

---

### Day 9 (Thursday): PDF Review & Polish

**Build:** PDF quality improvements

**Features:**
- Black & white print quality (test actual print)
- Font sizes readable (min 10pt)
- Layout doesn't break across pages
- Unique report ID (UUID)
- Student name, date, school name in footer

**Deliverable:** PDF is professional enough for teacher to file

**Test:** Print PDF in black & white, verify quality

---

### Day 10 (Friday): End-to-End Testing

**Build:** Full flow testing

**Flow:**
1. Start assessment
2. Complete 15 questions
3. Submit
4. See results
5. Download PDF

**Performance Testing:**
- Test on 3G network (Chrome dev tools throttle)
- Measure total time (target: <60 seconds)
- Identify bottlenecks

**Deliverable:** Working end-to-end flow, performance benchmarked

**Test:** Complete flow 5 times, document any issues

---

### Weekend (Jan 11-12): FOUNDER TESTING

**Founder's job:**
- Test full flow with son
- Review PDF he generates
- Document red flags:
  - Career recommendations that feel "off"
  - Missing information
  - Confusing language

**Deliverable:** PDF + red flag list sent to Kiro

---

## WEEK 3: Admin Dashboard & Deployment (Jan 13-20)

### Day 11 (Monday): Admin Login & Auth

**Build:** `/pages/admin/login.js`

**Features:**
- Supabase auth (email/password)
- Role-based access: `counselor`, `principal`
- Secure session management
- Redirect to dashboard on success

**Deliverable:** Secure login, redirects to dashboard

**Test:** Login with test account, verify redirect

---

### Day 12 (Tuesday): Dashboard Overview

**Build:** `/components/AdminDashboard.js`

**Features:**
- Total students (count)
- Completion rate (percentage)
- Top 3 recommended careers (across all students)
- Recent activity (last 10 students)

**Performance:** Dashboard loads in <2 seconds

**Deliverable:** Dashboard loads, displays key metrics

**Test:** View dashboard, verify metrics accurate

---

### Day 13 (Wednesday): Student List View

**Build:** Student list table

**Features:**
- Sortable columns (name, grade, date, status)
- Search by student name
- Filter by grade (11, 12)
- Filter by status (completed, in progress)
- Pagination (20 students per page)

**Deliverable:** Counselor can find any student in <30 seconds

**Test:** Search for student, verify found quickly

---

### Day 14 (Thursday): Individual Student View

**Build:** Student detail page

**Features:**
- Click student → see full assessment
- Display all 15 answers
- Display career recommendations
- PDF download link
- "Flag for review" button (optional)

**Deliverable:** Counselor can review student results before meeting

**Test:** Click student, verify all data visible

---

### Day 15 (Friday): Deployment Prep

**Build:** Production deployment

**Tasks:**
1. Deploy to Vercel production
2. Configure Supabase prod environment
3. Set environment variables (API keys, school logos)
4. Test live URL: `thandi-pilot.vercel.app`
5. Performance testing (load time, API response)

**Deliverable:** Live URL ready for pilot school testing

**Test:** Access live URL on mobile, verify works

---

### Weekend (Jan 18-19): FINAL TESTING

**Founder's job:**
- Send live URL to 1 pilot school teacher
- Request 5-minute Loom review
- Document red flags

**Deliverable:** Teacher feedback video

---

## MONDAY JAN 20: CODE FREEZE & REVIEW

**Kiro stops building. Founder reviews.**

### Founder Deliverables:
1. ✅ Son test video (assessment + results)
2. ✅ Teacher test video (5-minute review)
3. ✅ Red flag list (any violations of parental rules)

### Kiro Review Checklist:
- [ ] Performance: <5s per screen, <60s total?
- [ ] Safety: Verification footer on every response?
- [ ] Accuracy: Career recommendations make sense?
- [ ] UX: 16-year-old can complete without help?

### Decision Point:
- ✅ **GO:** Ship to 3 pilot schools on Jan 22
- ⚠️ **FIX:** 2-day sprint to patch critical issues, ship Jan 24
- ❌ **STOP:** Fundamental flaw, delay pilot (last resort)

---

## IMPLEMENTATION CHECKLIST

### Before Starting Day 1:
- [ ] Read Rule #1 (Verification Mandate)
- [ ] Commit to no new features without approval
- [ ] Accept January 20 ship date
- [ ] Review existing RAG endpoint (`/api/rag/query`)

### Daily Checklist:
- [ ] Build today's deliverable
- [ ] Test on mobile device
- [ ] Commit code to Git
- [ ] Update progress in daily standup

### Weekly Checklist:
- [ ] Review week's deliverables
- [ ] Test end-to-end flow
- [ ] Document any blockers
- [ ] Prepare for founder testing

---

## RED LINES (Non-Negotiable)

1. **Verification Mandate:** Every response MUST have verification footer
2. **Mobile-First:** Must work on 4-inch smartphone screens
3. **Performance:** <60 seconds total time (assessment to PDF)
4. **No Hallucination:** If RAG returns empty, show "contact counselor"
5. **Ship Date:** January 20, 2026 - no exceptions

---

## SUCCESS METRICS

**Technical:**
- 70%+ completion rate (students finish assessment)
- <5% error rate (technical failures)
- <60s total time (assessment to PDF)

**Safety:**
- 0 confident wrong answers (verification footer always present)
- 100% verification footer compliance

**User Satisfaction:**
- 1 proud father (son completes successfully)
- 1 happy teacher (finds it useful)
- 0 red flags (no violations of parental rules)

---

## KIRO'S COMMITMENT

I commit to:
1. ✅ Build only what's in this plan
2. ✅ No new features without explicit approval
3. ✅ Ship by January 20, 2026
4. ✅ Include verification footer on every response
5. ✅ Test on mobile device daily
6. ✅ Document any blockers immediately

I will NOT:
- ❌ Propose "What if we added..."
- ❌ Build features not in this plan
- ❌ Skip verification footer
- ❌ Miss the January 20 deadline
- ❌ Ship without founder approval

---

**Plan Status:** LOCKED  
**Ship Date:** January 20, 2026  
**Code Freeze:** January 20, 2026 (morning)  
**Pilot Launch:** January 22, 2026 (if GO decision)

---

**Ready to start Day 1 tomorrow.**
