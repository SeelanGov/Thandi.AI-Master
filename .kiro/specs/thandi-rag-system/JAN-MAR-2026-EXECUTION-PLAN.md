# January-March 2026: Execution Plan
**Revised Timeline for March Pilot Launch**

---

## JANUARY 2026: Foundation Building

### Week 1 (Jan 6-10): Content Sprint 1 + Frontend Kickoff

#### Content Work (40 hours)
**Priority Careers to Add:**

1. **Accountant/Chartered Accountant (CA)**
   - Entry requirements: BCom Accounting (UCT, Wits, Stellenbosch, UP)
   - Salary: R15K-R25K entry, R40K-R80K qualified CA
   - Bursaries: SAICA, Big 4 firms (Deloitte, PwC, KPMG, EY)
   - Path: 3-year degree + 3-year articles + board exams
   - Subjects needed: Math 60%+, Accounting 70%+

2. **Teacher (B.Ed)**
   - Entry requirements: B.Ed at any university (4 years)
   - Salary: R18K-R28K entry (government scale)
   - Bursaries: Funza Lushaka (FULL government bursary)
   - Subjects needed: 60%+ in teaching subjects
   - High demand: Math/Science teachers especially

3. **Lawyer (LLB)**
   - Entry requirements: LLB at UCT/Wits/UP/UWC (5 years)
   - Salary: R20K-R35K entry, R50K-R150K senior
   - Bursaries: Law Society, corporate law firms
   - Subjects needed: English 70%+, no math required
   - Path: 5-year degree + 2-year articles + bar exam

**Deliverables:**
- 3 career profiles (2,000 words each)
- 3 keyword-rich summaries
- Upload to Supabase
- Generate embeddings
- Test retrieval

#### Frontend Work (Contractor Start)
**Contractor Onboarding:**
- Repo access, environment setup
- Design system: Tailwind + shadcn/ui
- API documentation handover
- User stories for assessment flow

**Week 1 Deliverable:**
- Single-page assessment (questions 1-5)
- Mobile-responsive layout
- Progress bar
- Local storage for responses

---

### Week 2 (Jan 13-17): Content Sprint 2 + Assessment Completion

#### Content Work (40 hours)
**Priority Careers:**

4. **Social Worker**
   - Entry: BSocSc Social Work (4 years)
   - Salary: R12K-R22K entry (NGO/government)
   - Bursaries: NSFAS, DSD bursaries
   - Subjects: No math required, English 60%+
   - High demand: Child protection, community development

5. **Actuary**
   - Entry: BCom Actuarial Science (UCT, Stellenbosch, Wits, UP)
   - Salary: R25K-R45K entry, R80K-R200K qualified
   - Bursaries: Old Mutual, Discovery, Sanlam, Liberty
   - Subjects: Math 80%+, very competitive
   - Path: 3-year degree + professional exams (8-10 years total)

6. **Nurse (Professional Nurse)**
   - Entry: BCur/BNursing (4 years) or Diploma (3 years)
   - Salary: R15K-R30K entry (government scale)
   - Bursaries: Provincial health departments, NSFAS
   - Subjects: Life Sciences 60%+, Math 50%+
   - High demand: Critical shortage in SA

**Deliverables:**
- 3 career profiles
- 3 keyword-rich summaries
- Upload + embeddings
- Test retrieval

#### Frontend Work
**Assessment Completion:**
- Questions 6-15 (full assessment)
- Question types: Multiple choice, sliders, ranking
- Validation and error handling
- Save progress functionality
- Submit button + loading state

**Week 2 Deliverable:**
- Complete 15-question assessment
- Works on 4-inch screens
- Tested on 3G network

---

### Week 3 (Jan 20-24): Content Sprint 3 + Results Display

#### Content Work (40 hours)
**Priority Careers:**

7. **Journalist**
   - Entry: BA Journalism (Rhodes, Wits, Stellenbosch)
   - Salary: R12K-R25K entry, R30K-R60K senior
   - Bursaries: Media companies, Tiso Foundation
   - Subjects: English 70%+, no math required
   - Paths: Traditional media, digital media, freelance

8. **Agricultural Scientist**
   - Entry: BSc Agriculture (UP, Stellenbosch, UKZN)
   - Salary: R18K-R30K entry, R40K-R70K senior
   - Bursaries: Grain SA, AgriSETA, provincial agriculture depts
   - Subjects: Life Sciences 60%+, Math 50%+
   - DHET priority: Food security, sustainable farming

9. **Financial Advisor**
   - Entry: BCom Finance/Financial Planning
   - Salary: R15K-R30K entry + commission (R40K-R100K potential)
   - Bursaries: Banks (FNB, Nedbank, Standard Bank)
   - Subjects: Math 60%+, Accounting helpful
   - Path: Degree + CFP certification

**Deliverables:**
- 3 career profiles
- 3 keyword-rich summaries
- Upload + embeddings
- Test retrieval

#### Frontend Work
**Results Display:**
- Call RAG API with assessment data
- Display 3-5 career recommendations
- Show match percentage + reasoning
- Display salary ranges
- Show bursary options
- Next steps section
- Loading state (10s timeout)

**Week 3 Deliverable:**
- Working end-to-end flow
- Assessment → API → Results
- Mobile-optimized display

---

### Week 4 (Jan 27-31): Content Sprint 4 + PDF + Teacher View

#### Content Work (40 hours)
**Priority Careers:**

10. **Marketing Manager**
    - Entry: BCom Marketing (any university)
    - Salary: R18K-R30K entry, R40K-R80K senior
    - Bursaries: Corporate (Unilever, P&G, Coca-Cola)
    - Subjects: No math required, English 60%+
    - Paths: Digital marketing, brand management, market research

11. **Plumber/Artisan**
    - Entry: TVET diploma (2-3 years) + apprenticeship
    - Salary: R12K-R25K entry, R30K-R50K qualified
    - Bursaries: MERSETA, construction companies
    - Subjects: Math 50%+, no matric required for some paths
    - High demand: Critical skills shortage

**Deliverables:**
- 2 career profiles
- 2 keyword-rich summaries
- Upload + embeddings
- **Total: 35 careers in knowledge base**

#### Frontend Work
**PDF Generation:**
- Use @react-pdf/renderer or similar
- 3-4 page report template
- School branding placeholders
- Student profile summary
- Top 5 career recommendations
- Action plan with bursaries
- Download button

**Teacher View:**
- Read-only results page
- Student list (hardcoded for now)
- Click student → see their results
- Simple, clean layout
- No admin features yet

**Week 4 Deliverable:**
- PDF generation working
- Basic teacher view
- Ready for internal alpha

---

### Week 5 (Jan 31 - Feb 2): Internal Alpha Test

**Recruit 10 Students:**
- Friends, family, social media
- Mix: Grade 11 + Grade 12
- Mix: Urban + rural (test 3G)
- Mix: Different subject combinations

**Test Protocol:**
1. Student completes assessment (record time)
2. Review results with student (record feedback)
3. Ask: "Would you show this to your parents?"
4. Ask: "Did you learn about careers you didn't know?"
5. Ask: "What's confusing or missing?"

**Metrics to Track:**
- Completion rate (target: 90%+)
- Average time (target: 12-15 min)
- Helpfulness rating (target: 80%+)
- Technical issues (crashes, errors)

**Deliverable:** 10 completed tests, documented feedback

---

## FEBRUARY 2026: Alpha Testing + Iteration

### Week 1 (Feb 3-7): Large Alpha Test

**Recruit 50 Students:**
- Social media campaign (R2,000 ad spend)
- Offer R100 airtime incentive
- Target: Grade 11-12 students across SA
- Mix of provinces, schools, backgrounds

**Test Protocol:**
- Self-service (no hand-holding)
- Record sessions (with permission)
- Post-test survey (10 questions)
- Collect failure cases

**Metrics:**
- Completion rate
- Dropout points (which question?)
- Accuracy (do recommendations make sense?)
- Technical issues
- Feature requests

**Deliverable:** 50 completed tests, failure mode analysis

---

### Week 2 (Feb 10-14): Bug Fixes + Content Gaps

**Priority Fixes:**
- P0 bugs: Crashes, wrong information, broken flows
- P1 bugs: Confusing UI, slow loading, missing info
- P2 bugs: Nice-to-haves, polish

**Content Additions:**
- Add missing careers based on feedback
- Fix inaccurate salary data
- Update bursary deadlines
- Add provincial info (if requested)

**Deliverable:** Bug-free experience, updated content

---

### Week 3 (Feb 17-21): Teacher Training + Admin Dashboard

**Teacher Training Materials:**
- 30-minute video walkthrough
- 1-page quick-start guide
- FAQ document
- "When to review AI recommendations" guide
- Sample student reports

**Admin Dashboard (Basic):**
- Login (email + password)
- Student list with completion status
- Click student → see results
- Export to CSV
- Weekly email digest setup

**Deliverable:** Training materials, working admin dashboard

---

### Week 4 (Feb 24-28): Second Alpha + POPIA Audit

**Second Alpha (20 Students):**
- Test with updated version
- Focus on edge cases from first alpha
- Test admin dashboard with 2 teachers
- Validate training materials

**POPIA Compliance Audit:**
- Review data collection practices
- Ensure encryption at rest
- Verify row-level security
- Document data retention policy
- Create privacy policy
- Add consent forms

**Pilot School Contracts:**
- Finalize pricing (R12K/year per school)
- Draft service agreement
- Define SLAs (99% uptime, <5s response)
- Schedule kickoff meetings

**Deliverable:** Validated product, signed contracts, POPIA compliant

---

## MARCH 2026: Pilot Launch

### Week 1 (Mar 3-7): School 1 Launch

**School 1 (100 students):**
- Teacher training session (1 hour)
- Student onboarding (assembly presentation)
- Deploy to production
- Daily monitoring (response times, errors)
- Daily check-in with teacher

**Metrics:**
- Completion rate (target: 70%+)
- Technical issues (target: <5%)
- Teacher satisfaction
- Student feedback

**Deliverable:** 100 students completed, feedback collected

---

### Week 2 (Mar 10-14): School 2 Launch

**School 2 (150 students):**
- Teacher training
- Student onboarding
- Deploy
- Monitor + iterate

**Improvements from School 1:**
- Fix any bugs discovered
- Update content based on feedback
- Improve teacher dashboard

**Deliverable:** 150 students completed

---

### Week 3 (Mar 17-21): School 3 Launch

**School 3 (200 students):**
- Teacher training
- Student onboarding
- Deploy
- Monitor + iterate

**Weekly Check-ins:**
- Monday: Principal update email
- Wednesday: Teacher check-in call
- Friday: Student feedback review

**Deliverable:** 200 students completed

---

### Week 4 (Mar 24-28): Pilot Analysis + Conversion

**Pilot Results Analysis:**
- Aggregate completion rates
- Aggregate helpfulness ratings
- Collect testimonials
- Document success stories
- Identify improvement areas

**Conversion Discussions:**
- Schedule meetings with principals
- Present pilot results
- Discuss annual contract (R12K/year)
- Address concerns
- Negotiate terms

**Deliverable:** 3 pilot schools, conversion data, testimonials

---

## SUCCESS METRICS

### January Success Criteria
- ✅ 35 careers in knowledge base
- ✅ Working student UI (assessment + results)
- ✅ PDF generation functional
- ✅ Basic teacher view
- ✅ 10 internal alpha tests completed

### February Success Criteria
- ✅ 50 alpha tests completed
- ✅ <5% P0 bugs remaining
- ✅ Teacher training materials complete
- ✅ Admin dashboard working
- ✅ 3 pilot contracts signed
- ✅ POPIA audit complete

### March Success Criteria
- ✅ 450 students completed assessments (3 schools)
- ✅ 70%+ completion rate
- ✅ 80%+ helpfulness rating
- ✅ 90%+ principal recommendation
- ✅ 3/3 schools convert to paid (target)
- ✅ 5+ testimonials collected

---

## RISK MITIGATION

### Risk 1: Contractor Delays
**Mitigation:** 
- Weekly milestones with deliverables
- Payment tied to milestones
- Backup: I take over if contractor fails

### Risk 2: Alpha Test Recruitment
**Mitigation:**
- Start recruiting early (Week 4 Jan)
- Offer incentives (R100 airtime)
- Partner with schools for access

### Risk 3: Content Creation Bottleneck
**Mitigation:**
- Batch content creation (3 careers/week)
- Use templates for consistency
- Prioritize DHET scarce skills

### Risk 4: Pilot Schools Back Out
**Mitigation:**
- Sign contracts in February
- Provide free trial (no upfront cost)
- Offer money-back guarantee

### Risk 5: Technical Issues at Scale
**Mitigation:**
- Load testing before each school launch
- Monitor Supabase limits (500MB storage)
- Have fallback plan (cached results)

---

## BUDGET TRACKING

### January Costs
- Frontend contractor: R20,000
- API usage: R200
- **Total:** R20,200

### February Costs
- Alpha test incentives: R5,000
- API usage: R300
- Ad spend: R2,000
- **Total:** R7,300

### March Costs
- API usage: R500 (450 students)
- Support time: R0 (included)
- **Total:** R500

### Total Investment: R28,000

### Expected Revenue (March-June)
- 3 pilot schools × R12,000 = R36,000 (Q1)
- 5 additional schools × R12,000 = R60,000 (Q2)
- **Total:** R96,000

### Break-even: Month 4 (June 2026)
### ROI: 243% in 6 months

---

## WEEKLY REPORTING

**Every Monday:**
- Progress update (what shipped)
- Blockers (what's stuck)
- Metrics (tests completed, bugs fixed)
- Next week priorities
- Budget status

**Format:**
```
Week X Update:
✅ Shipped: [list]
⚠️ Blockers: [list]
📊 Metrics: [numbers]
🎯 Next Week: [priorities]
💰 Budget: [spent/remaining]
```

---

## COMMITMENT

This plan is:
- ✅ Realistic (3 months, not 5 days)
- ✅ Resourced (contractor for frontend)
- ✅ Validated (50 alpha tests before pilot)
- ✅ Budgeted (R28K investment, R96K return)
- ✅ Measurable (clear success criteria)

**No more overpromising. Time to execute.**

---

**Next Update:** Wednesday, Nov 20 (pricing + content audit)  
**Pilot Launch:** March 3, 2026  
**Break-even:** June 2026
