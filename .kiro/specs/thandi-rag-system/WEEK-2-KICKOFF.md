# Week 2 Kickoff: Student UI Development

**Date:** November 12, 2025  
**Status:** ✅ RAG System Pilot-Ready  
**Focus:** Build student-facing product

---

## 🎯 Week 1 Achievements

### ✅ RAG System Validated
- **Test Results:** 8/20 overall (40%)
- **Target Questions:** 6/7 (86%) ✅
- **Sanity Check:** 5/5 real queries helpful ✅

### ✅ Core Functionality Proven
- Decision-Making: 100% (Q19-Q20)
- Career Misconceptions: 80% (Q11-Q15)
- Framework Citation: Working (V.I.S. Model, Passion vs Pay)
- Content Quality: High (30K words, SA-specific, actionable)

### ✅ Confidence Level: HIGH
System is good enough to test with real students.

---

## 📋 Week 2 Goals

**Primary Objective:** Build working prototype for student testing

**Success Criteria:**
- Student can complete assessment (15-20 questions)
- System generates 3-5 career recommendations
- Recommendations include reasoning, salaries, next steps
- Bursaries shown if financial need
- Mobile-responsive design
- 5-10 students can test by Friday

---

## 🗓️ Week 2 Schedule

### Day 1-2 (Tue-Wed): Assessment Form
**Tasks:**
- [ ] Design assessment questions (academic, interests, financial)
- [ ] Build multi-step form component
- [ ] Add progress indicator
- [ ] Implement form validation
- [ ] Add save/resume functionality
- [ ] Mobile-first responsive design

**Deliverable:** Working assessment form

### Day 3-4 (Thu-Fri): Results Display
**Tasks:**
- [ ] Build loading state (while RAG processes)
- [ ] Design results layout (3-5 careers)
- [ ] Show match reasoning for each career
- [ ] Display salary ranges and job outlook
- [ ] Show bursary recommendations (if financial need)
- [ ] Add next steps section
- [ ] Implement print/save functionality

**Deliverable:** Working results page

### Day 5 (Sat): Profile Classification & Polish
**Tasks:**
- [ ] Implement profile classification logic
- [ ] Academic profile (STEM, humanities, creative, mixed)
- [ ] Interest profile (people, data, things, ideas)
- [ ] Financial profile (low, medium, high)
- [ ] Connect to RAG API
- [ ] Bug fixes and polish
- [ ] Prepare for alpha testing

**Deliverable:** End-to-end working prototype

---

## 🎨 Design Priorities

### Mobile-First
- 80% of students will use phones
- Touch-friendly buttons and inputs
- Readable font sizes (16px minimum)
- Simple, clean interface

### Accessibility
- High contrast colors
- Clear labels and instructions
- Keyboard navigation
- Screen reader friendly

### Performance
- Fast load times (<3 seconds)
- Smooth transitions
- Optimistic UI updates
- Offline-capable (progressive enhancement)

---

## 🔧 Technical Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Shadcn/ui components

### Backend
- Next.js API routes
- RAG system (already built)
- Supabase (database)

### Deployment
- Vercel (frontend)
- Supabase (backend)

---

## 📝 Assessment Questions (Draft)

### Academic Profile (5 questions)
1. What are your strongest subjects? (multi-select)
2. What is your average grade? (percentage)
3. Do you have Math in matric? (yes/no)
4. Do you have Science in matric? (yes/no)
5. What subjects do you enjoy most? (multi-select)

### Interest Profile (5 questions)
6. What activities do you enjoy? (multi-select)
7. Do you prefer working with people, data, or things? (select)
8. What problems interest you? (multi-select)
9. What kind of work environment appeals to you? (select)
10. What motivates you in a career? (multi-select)

### Financial Profile (3 questions)
11. What is your household income? (ranges)
12. Can your family afford university fees? (yes/no/unsure)
13. Are you interested in bursaries? (yes/no)

### Career Uncertainty (2 questions)
14. Are you stuck between career options? (yes/no)
15. What concerns you most about choosing a career? (multi-select)

**Total:** 15 questions (5-7 minutes to complete)

---

## 🎯 Results Display Structure

### Header
- Student name
- Assessment date
- Match score overview

### Career Recommendations (3-5 careers)
**For each career:**
- Career title
- Match percentage (e.g., "85% match")
- Why this matches you (2-3 sentences)
- Salary range (entry-level, ZAR)
- Job outlook (demand, growth)
- Study requirements (degree, universities)
- Next steps (3-5 actionable items)

### Bursaries Section (if financial need)
- 2-3 relevant bursaries
- Amount/coverage
- Deadline
- Eligibility
- Application link

### Next Steps
- Research recommended careers
- Apply for bursaries (if applicable)
- Visit university open days
- Talk to professionals
- Complete Career Choice Matrix

### Footer
- Print/save PDF
- Share with parents/teachers
- Retake assessment
- Contact support

---

## 🧪 Alpha Testing Plan (End of Week 2)

### Recruit 5-10 Students
- Grade 11-12
- Mix of academic profiles
- Mix of financial situations
- Mix of career certainty levels

### Test Protocol
1. Student completes assessment (observe)
2. Review results together
3. Ask feedback questions:
   - Was the assessment easy to complete?
   - Were the career recommendations helpful?
   - Did you learn something new?
   - What was missing?
   - Would you recommend this to a friend?

### Success Metrics
- 80%+ complete assessment
- 70%+ find recommendations helpful
- 60%+ would recommend to friend

---

## 📊 Week 2 Success Criteria

### Must Have ✅
- [ ] Working assessment form (15 questions)
- [ ] RAG integration (generate recommendations)
- [ ] Results display (3-5 careers with reasoning)
- [ ] Mobile-responsive design
- [ ] 5+ students tested successfully

### Nice to Have ⚠️
- [ ] Save/resume functionality
- [ ] Print/PDF export
- [ ] Share functionality
- [ ] Retake assessment

### Defer to Week 3 📅
- Admin dashboard
- Teacher view
- School branding
- Analytics

---

## 🚀 Let's Build!

**Mindset:** RAG is proven. Time to build the user-facing product.

**Focus:** Student experience first. Make it simple, helpful, and encouraging.

**Goal:** By Friday, have a prototype that real students can use and give feedback on.

**Week 2 starts now. Let's ship! 🎉**
