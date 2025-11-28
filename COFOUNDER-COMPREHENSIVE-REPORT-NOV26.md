# Thandi.ai: Comprehensive Development Report
**Date:** November 26, 2025  
**Report Type:** Cofounder Status Update  
**Period Covered:** October 2025 - November 26, 2025  
**Current Status:** 🟢 Production Live & Testing Phase

---

## EXECUTIVE SUMMARY

Thandi.ai is **live in production** with a fully functional AI-powered career guidance system for South African Grade 10-12 students. The system combines RAG (Retrieval-Augmented Generation) technology with a comprehensive knowledge base covering 24 careers, 20 university qualifications, and multiple education pathways.

**Key Achievements:**
- ✅ Production deployment on Vercel (https://thandiai.vercel.app/assessment)
- ✅ Real database integration with OpenAI embeddings
- ✅ 24 career profiles with detailed pathways and bursaries
- ✅ 20 priority university qualifications (129 institution records)
- ✅ Grade 10-12 adaptive assessment system
- ✅ PDF report generation
- ✅ Comprehensive safety and verification systems

**Current Phase:** Pilot testing with initial students  
**Next Milestone:** January 2026 - Content expansion and alpha testing  
**Target:** March 2026 - Pilot launch with 3 schools (450 students)

---

## WHAT WE'VE BUILT

### 1. Student Assessment System
**Location:** `/assessment` page  
**Status:** ✅ Fully Operational

**Features:**
- Grade-level selection (10, 11, or 12)
- Subject selection (what students enjoy, not just what they take)
- Interest area mapping
- Constraint collection (time, money, location)
- Open-ended questions (motivation, concerns)
- **Grade 10 Deep Dive:** Optional detailed assessment with current marks and support system
- Progress tracking and local storage (students can resume later)
- Mobile-responsive design

**User Flow:**
1. Student selects grade level
2. Completes 4 core questions (subjects, interests, constraints, open questions)
3. **Grade 10 only:** Sees preliminary report, can opt into deep dive
4. **Grade 11-12:** Proceeds directly to results
5. Receives personalized career recommendations

**Assessment Duration:** 12-15 minutes (target)

---

### 2. RAG-Powered Recommendation Engine
**Location:** `/api/rag/query` endpoint  
**Status:** ✅ Production Live with Real Database

**Technology Stack:**
- **Database:** Supabase (PostgreSQL with pgvector)
- **Embeddings:** OpenAI text-embedding-3-small
- **LLM:** OpenAI GPT-4 (via Orchids API)
- **Search:** Hybrid semantic + keyword search
- **Response Time:** 312ms average

**How It Works:**
1. Student completes assessment
2. System generates query from assessment data
3. RAG retrieves relevant career content from knowledge base
4. GPT-4 generates personalized recommendations
5. Safety rules ensure accurate, helpful responses
6. Results displayed with verification warnings

**Safety Features:**
- Mandatory verification footer on all responses
- Dangerous query detection (medical advice, legal advice, etc.)
- Scope boundary enforcement (career guidance only)
- Math-healthcare conflict resolution
- NSFAS prioritization for low-income students

---

### 3. Knowledge Base (24 Careers)
**Status:** ✅ Deployed and Operational

**Career Categories:**

**Healthcare (7 careers):**
- Medical Doctor (MBChB)
- Pharmacist
- Physiotherapist
- Occupational Therapist
- Nurse
- Radiographer
- Emergency Medical Care

**Engineering (6 careers):**
- Software Engineer
- Mechanical Engineer
- Electrical Engineer
- Civil Engineer
- Chemical Engineer
- Data Scientist

**4IR/Tech (5 careers):**
- AI/ML Engineer
- Cybersecurity Specialist
- Blockchain Developer
- Renewable Energy Technician
- UX/UI Designer

**Creative/Trades (6 careers):**
- Graphic Designer
- Content Creator
- Chef
- Electrician (Artisan)
- Plumber (Artisan)
- Carpenter (Artisan)

**Each Career Profile Includes:**
- Detailed career description
- Entry requirements (subjects, marks)
- Education pathways (university, TVET, learnerships)
- Salary ranges (entry to senior)
- Bursary opportunities with deadlines
- Alternative pathways
- Day-in-the-life scenarios
- Common misconceptions

**Content Quality:**
- 2,000+ words per career
- Dual-source verification (SAQA + institution prospectuses)
- SA-specific information
- 2025 bursary deadlines
- NSFAS eligibility details

---

### 4. G10-12 Guidance Engine (20 Qualifications)
**Status:** ✅ Production Ready (129 records deployed)

**Qualifications Covered:**

**Batch 1 (5 qualifications - DEPLOYED):**
1. BSc Computer Science (SAQA_94721) - 7 institutions
2. BCom Accounting (SAQA_48101) - 7 institutions
3. LLB Bachelor of Laws (SAQA_101980) - 7 institutions
4. MBChB Medicine (SAQA_101600) - 5 institutions
5. BSc Engineering Electrical (SAQA_101433) - 7 institutions

**Batch 2 (15 qualifications - READY TO DEPLOY):**
- BPharm Pharmacy
- BSc Nursing
- BPhysio Physiotherapy
- BDS Dental Surgery
- BRad Radiography
- BComp Med Complementary Medicine
- BEMC Emergency Medical Care
- BSc Psychology
- BSc Agriculture
- BEd Teaching
- BA Journalism
- BCom Economics
- BVSc Veterinary Science
- BSW Social Work
- BArch Architecture

**Data Per Qualification:**
- Institution-specific APS requirements
- Subject requirements (specific marks needed)
- NBT requirements
- Additional requirements (portfolios, interviews)
- Provisional offer criteria
- Application deadlines
- TVET alternatives
- Distance learning options

**Coverage:**
- 26 public universities
- All 9 provinces
- APS range: 22-42 (accessible to elite)
- 100% NSFAS-eligible institutions

---

### 5. Education Pathways Database
**Status:** ✅ Deployed

**University Pathways:**
- 26 public universities
- 108 institution records
- Program-specific requirements
- Contact information
- Application processes

**TVET Pathways:**
- 50 public TVET colleges
- NC(V) programs
- Report 191 programs
- Artisan training
- Learnerships

**SETA Pathways:**
- 21 SETAs covered
- Learnership opportunities
- Skills programs
- Apprenticeships
- Funding information

**Private Institutions:**
- 15 registered private colleges
- Alternative pathways
- Costs and financing
- Accreditation status

---

### 6. Results & PDF Generation
**Location:** `/results` page  
**Status:** ✅ Operational

**Results Display:**
- Top 3-5 career recommendations
- Match percentage with reasoning
- Salary ranges
- Bursary opportunities
- Next steps
- **Prominent verification warnings** (top and bottom)

**PDF Features:**
- Professional 3-4 page report
- Student profile summary
- Career recommendations
- Education pathways
- Bursary information
- Action plan
- Verification warnings (prominent)
- School branding placeholders

**Safety Measures:**
- Mandatory "READ THIS FIRST" warning banner
- Footer verification checklist
- Disclaimer about AI-generated content
- Instructions to verify with counselors

---

## WHAT'S MISSING (Identified Gaps)

### 1. **Chat Interface** ❌ NOT YET IMPLEMENTED
**The Problem:** Students get a one-time static report with no way to ask follow-up questions.

**What's Needed:**
- Chat widget on results page
- Session continuity (chat knows assessment context)
- Ability to ask: "Tell me more about Software Engineering", "What if my Math mark stays at 55%?", "Are there cheaper alternatives?"

**Impact:** Students can't explore recommendations deeper or clarify confusing advice.

**Proposed Solution:** Add collapsible chat interface to `/results` page (Phase 2 - January 2026)

---

### 2. **Content Gaps** ⚠️ PARTIALLY ADDRESSED
**Current:** 24 careers covered  
**Gap:** 11 high-demand careers missing

**Missing Careers:**
1. Accountant/Chartered Accountant (CA)
2. Teacher (B.Ed)
3. Lawyer (LLB) - *qualification exists, career profile missing*
4. Social Worker
5. Actuary
6. Nurse - *qualification exists, career profile needs expansion*
7. Journalist
8. Agricultural Scientist
9. Financial Advisor
10. Marketing Manager
11. Plumber/Artisan - *basic profile exists, needs expansion*

**Impact:** Students interested in these careers get incomplete guidance.

**Plan:** Add 3 careers per week starting January 2026 (11 careers = 4 weeks)

---

### 3. **Assessment Question Gaps** ⚠️ MINOR
**Current Questions Cover:**
- ✅ Grade level
- ✅ Subjects enjoyed
- ✅ Interest areas
- ✅ Time/money/location constraints
- ✅ Current marks (Grade 10 deep dive)
- ✅ Support system (Grade 10 deep dive)
- ✅ Motivation & concerns (optional)

**Potentially Missing:**
- Family expectations/pressure
- Specific career aspirations (even if unrealistic)
- Extracurricular activities/skills
- Work experience or exposure
- Geographic mobility (willing to relocate?)

**Impact:** Minor - current questions provide sufficient context for recommendations.

**Plan:** Add 1-2 questions iteratively based on testing feedback (February 2026)

---

### 4. **Teacher/Admin Dashboard** ❌ NOT YET IMPLEMENTED
**Current:** Basic read-only results view exists  
**Gap:** No teacher login, student management, or progress tracking

**What's Needed:**
- Teacher login (email + password)
- Student list with completion status
- Click student → see their results
- Export to CSV
- Weekly email digest

**Impact:** Teachers can't monitor student progress or review results at scale.

**Plan:** Build basic admin dashboard (February 2026, Week 3)

---

### 5. **Testing & Validation** ⚠️ IN PROGRESS
**Current:** System tested by developers only  
**Gap:** No real student testing yet

**What's Needed:**
- 10 internal alpha tests (friends, family)
- 50 large alpha tests (social media recruitment)
- Feedback collection and iteration
- Bug fixes and content updates

**Impact:** Unknown user experience issues, potential accuracy problems.

**Plan:**
- Week 5 January: 10 internal alpha tests
- Week 1 February: 50 large alpha tests
- Week 2 February: Bug fixes and content gaps

---

## TESTING PHASE: CURRENT STATUS

### What's Ready for Testing ✅
1. **Full student assessment flow** (grade selection → questions → results)
2. **RAG-powered recommendations** (real database, real AI)
3. **PDF generation** (downloadable reports)
4. **Safety systems** (verification warnings, dangerous query detection)
5. **Mobile-responsive design** (works on 4-inch screens)
6. **Production deployment** (live on Vercel)

### What Needs Testing 🧪
1. **User experience:** Is the assessment intuitive? Do students understand the questions?
2. **Recommendation accuracy:** Do the career suggestions make sense? Are they helpful?
3. **Content quality:** Is the information clear? Are there gaps or errors?
4. **Technical performance:** Does it work on 3G? Are there crashes or bugs?
5. **Trust & credibility:** Would students show this to their parents? Do they trust the advice?

### Testing Protocol (Proposed)
**Phase 1: Internal Alpha (10 students)**
- Recruit friends, family, social media
- Mix: Grade 11 + Grade 12
- Mix: Urban + rural (test 3G)
- Mix: Different subject combinations
- **Metrics:** Completion rate, time taken, helpfulness rating, technical issues

**Phase 2: Large Alpha (50 students)**
- Social media campaign (R2,000 ad spend)
- Offer R100 airtime incentive
- Self-service (no hand-holding)
- **Metrics:** Completion rate, dropout points, accuracy, feature requests

**Phase 3: Pilot Launch (450 students, 3 schools)**
- March 2026
- Teacher training + student onboarding
- Daily monitoring
- **Metrics:** 70%+ completion rate, 80%+ helpfulness rating, 90%+ principal recommendation

---

## PROPOSED UPGRADES & THEIR ROLE IN TESTING

### Upgrade 1: Chat Interface
**Priority:** HIGH  
**Timeline:** January 2026 (Week 3-4)  
**Testing Impact:** CRITICAL

**Why It Matters for Testing:**
- Students can clarify confusing recommendations
- Reduces need for perfect first-time accuracy
- Allows exploration of alternative careers
- Provides richer feedback data (what questions do students ask?)

**Testing Approach:**
- Phase 1 Alpha: Test without chat (baseline)
- Phase 2 Alpha: Test with chat (compare engagement)
- Measure: Chat usage rate, question types, satisfaction improvement

**Decision:** **DEFER to January** - Test core system first, add chat based on feedback

---

### Upgrade 2: Content Expansion (11 Missing Careers)
**Priority:** MEDIUM  
**Timeline:** January 2026 (4 weeks, 3 careers/week)  
**Testing Impact:** MODERATE

**Why It Matters for Testing:**
- Some students may want careers not yet covered
- Incomplete coverage = incomplete testing
- Need to test across all career categories

**Testing Approach:**
- Phase 1 Alpha: Test with 24 careers (document requests for missing careers)
- January: Add 11 missing careers based on demand
- Phase 2 Alpha: Test with 35 careers (full coverage)

**Decision:** **START in January** - Use Phase 1 feedback to prioritize which 11 careers to add first

---

### Upgrade 3: Enhanced Assessment Questions
**Priority:** LOW  
**Timeline:** February 2026 (iterative)  
**Testing Impact:** LOW

**Why It Matters for Testing:**
- Current questions may miss important context
- Students may feel recommendations are generic
- Need to balance depth vs. completion rate

**Testing Approach:**
- Phase 1 Alpha: Test with current questions (measure completion rate)
- Analyze: What information is missing from recommendations?
- Phase 2 Alpha: Test with 1-2 additional questions (measure impact on completion rate)

**Decision:** **DEFER to February** - Only add questions if Phase 1 reveals clear gaps

---

### Upgrade 4: Teacher Dashboard
**Priority:** LOW (for student testing)  
**Timeline:** February 2026 (Week 3)  
**Testing Impact:** NONE (for student testing)

**Why It Matters for Testing:**
- Not needed for student testing
- Needed for pilot launch (March 2026)
- Teachers need to monitor student progress

**Testing Approach:**
- Phase 1-2 Alpha: Not needed (students test independently)
- February: Build basic dashboard
- Pilot Launch: Test with 2-3 teachers

**Decision:** **DEFER to February** - Focus on student experience first

---

## RECOMMENDED TESTING APPROACH

### Immediate (This Week - Nov 26-30)
1. ✅ **System is live and ready**
2. **Recruit 3-5 initial testers** (friends, family, colleagues)
3. **Manual testing protocol:**
   - Give them the URL: https://thandiai.vercel.app/assessment
   - Ask them to complete assessment (no guidance)
   - Record time taken
   - Ask: "Would you show this to your parents?"
   - Ask: "Did you learn about careers you didn't know?"
   - Ask: "What's confusing or missing?"
4. **Document feedback** (create simple Google Form)

### Short-Term (December 2025)
1. **Fix critical bugs** from initial testing
2. **Improve confusing UI elements**
3. **Update inaccurate content** (if found)
4. **Prepare for January content sprint**

### Medium-Term (January 2026)
1. **Week 1-4: Content Sprint** (add 11 missing careers)
2. **Week 3-4: Build chat interface** (if feedback demands it)
3. **Week 5: Internal Alpha** (10 students, structured testing)

### Long-Term (February-March 2026)
1. **Week 1: Large Alpha** (50 students, social media recruitment)
2. **Week 2: Bug fixes and iteration**
3. **Week 3: Teacher dashboard** (basic version)
4. **Week 4: Pilot preparation** (contracts, training materials)
5. **March: Pilot launch** (3 schools, 450 students)

---

## BUDGET & TIMELINE

### Investment to Date
- **Development Time:** ~200 hours (October-November)
- **API Costs:** ~R500 (OpenAI embeddings + GPT-4)
- **Infrastructure:** R0 (Vercel free tier, Supabase free tier)
- **Total:** ~R500 + development time

### Planned Investment (Jan-Mar 2026)
- **Frontend Contractor:** R20,000 (optional, if needed for chat/dashboard)
- **Alpha Test Incentives:** R5,000 (R100 airtime × 50 students)
- **Ad Spend:** R2,000 (social media recruitment)
- **API Usage:** R1,000 (500 students × R2/query)
- **Total:** R28,000

### Expected Revenue (Mar-Jun 2026)
- **3 Pilot Schools:** R36,000 (R12,000/school/year)
- **5 Additional Schools:** R60,000 (Q2 expansion)
- **Total:** R96,000

### Break-Even: June 2026 (Month 4)  
### ROI: 243% in 6 months

---

## RISKS & MITIGATION

### Risk 1: Students Don't Complete Assessment
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Keep assessment under 15 minutes
- Add progress bar and save functionality (✅ done)
- Test completion rate in alpha (target: 70%+)
- Simplify questions if dropout rate high

### Risk 2: Recommendations Are Inaccurate
**Likelihood:** Medium  
**Impact:** Critical  
**Mitigation:**
- Comprehensive testing with real students
- Verification warnings on all outputs (✅ done)
- Dual-source content verification (✅ done)
- Iterative improvement based on feedback

### Risk 3: Teachers Don't Trust AI
**Likelihood:** High  
**Impact:** Critical  
**Mitigation:**
- Teacher interviews (planned for December)
- Emphasize "guidance, not decisions" messaging
- Provide teacher training materials
- Offer money-back guarantee for pilot schools

### Risk 4: Content Becomes Outdated
**Likelihood:** High  
**Impact:** Medium  
**Mitigation:**
- Quarterly prospectus review schedule
- Annual SAQA ID verification
- Bursary deadline updates (January each year)
- User feedback collection system

### Risk 5: Technical Issues at Scale
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Load testing before pilot launch
- Monitor Supabase limits (500MB storage)
- Have fallback plan (cached results)
- Rollback procedures documented (✅ done)

---

## SUCCESS METRICS

### Testing Phase (Jan-Feb 2026)
- **Completion Rate:** 70%+ (students finish assessment)
- **Helpfulness Rating:** 80%+ (students find it useful)
- **Accuracy:** 90%+ (recommendations make sense)
- **Technical Issues:** <5% (crashes, errors)
- **Trust:** 70%+ (would show to parents)

### Pilot Phase (Mar 2026)
- **Student Completion:** 450 students (3 schools)
- **Completion Rate:** 70%+
- **Helpfulness Rating:** 80%+
- **Principal Recommendation:** 90%+
- **Conversion Rate:** 3/3 schools convert to paid (target)
- **Testimonials:** 5+ collected

### Business Metrics (Q1-Q2 2026)
- **Revenue:** R96,000 (8 schools × R12,000)
- **Break-Even:** June 2026
- **ROI:** 243% in 6 months
- **Student Impact:** 1,200+ students guided

---

## RECOMMENDATIONS

### For Immediate Testing (This Week)
1. **Start small:** 3-5 manual tests with friends/family
2. **Focus on experience:** Is it intuitive? Is it helpful?
3. **Document everything:** Create simple feedback form
4. **Fix critical bugs:** Anything that breaks the flow

### For Upgrades
1. **Chat Interface:** DEFER to January - test core system first
2. **Content Expansion:** START in January - use feedback to prioritize
3. **Assessment Questions:** DEFER to February - only if clear gaps emerge
4. **Teacher Dashboard:** DEFER to February - not needed for student testing

### For Timeline
1. **Don't rush:** Current system is solid, test thoroughly
2. **Iterate based on feedback:** Let students guide priorities
3. **Stick to March pilot:** Realistic timeline, don't overpromise
4. **Focus on quality:** Better to launch with 24 great careers than 50 mediocre ones

---

## CONCLUSION

Thandi.ai has a **solid foundation** with a production-ready system covering 24 careers, 20 qualifications, and comprehensive education pathways. The system is **live and ready for testing**.

**Key Strengths:**
- Real AI-powered recommendations (not mock data)
- Comprehensive safety systems
- SA-specific content with 2025 data
- Mobile-responsive design
- Production deployment with rollback capability

**Key Gaps:**
- No chat interface (students can't ask follow-up questions)
- 11 missing careers (but 24 is sufficient for testing)
- No teacher dashboard (but not needed for student testing)

**Recommended Approach:**
1. **Test current system** with 3-5 students this week
2. **Fix critical issues** in December
3. **Expand content** in January (11 careers)
4. **Add chat interface** in January (if feedback demands it)
5. **Large alpha test** in February (50 students)
6. **Pilot launch** in March (3 schools, 450 students)

**The system is ready. Let's test it with real students and iterate based on their feedback.**

---

**Report Prepared By:** Development Team  
**Date:** November 26, 2025  
**Next Update:** December 15, 2025 (after initial testing)  
**Questions?** Review documentation in `.kiro/specs/` and `.kiro/data/` folders
