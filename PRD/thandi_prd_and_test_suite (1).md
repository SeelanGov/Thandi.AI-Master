# Thandi MVP: Product Requirements Document + Test Suite
## For January 2026 School Pilots | Version 1.0

---

## PART 1: PRODUCT REQUIREMENTS DOCUMENT

### 1. Business Context (Give This to Cursor First)

**Company:** EduEasy  
**Product:** Thandi - AI Career Guidance Platform  
**Business Model:** B2B School Licensing (NOT B2C consumer subscriptions)  
**Target Revenue:** R10,000-R15,000 per school per year  
**Pilot Start Date:** January 2026 (10 weeks from now)

**Critical Success Factors:**
1. Close 3 paid school contracts by March 2026
2. Achieve 70%+ student completion rate during pilots
3. Generate testimonials from principals for sales collateral
4. Prove ROI to schools: "Students who use Thandi make better career choices"

**Current Status:**
- 3 pilot schools verbally committed (need working product to convert to paid)
- R80K personal investment already spent on validation
- Solo founder + Cursor AI as technical partner
- Must stay within free tier hosting limits (Vercel/Supabase)

---

### 2. Target Users & Their Jobs-to-be-Done

#### **Primary User: Grade 11-12 Students (Ages 16-18)**

**Jobs to be Done:**
- "Help me understand which careers match my interests and abilities"
- "Show me realistic career options I can actually afford to study"
- "Tell me which university programs accept students with my subjects"
- "Alert me to bursary deadlines before I miss them"

**User Constraints:**
- Access via smartphone (70% of users, not desktop)
- Slow internet in townships/rural areas (< 1 Mbps common)
- Low digital literacy (some have never used web apps)
- Time-poor (15-20 min max attention span)

**Success Metric:** 70%+ complete the full assessment

#### **Secondary User: Career Counselors/Life Orientation Teachers**

**Jobs to be Done:**
- "Show me which students have completed assessments"
- "Give me a printable report I can file in student records"
- "Help me identify at-risk students (unclear career path, unrealistic choices)"
- "Provide data I can show to principal: 'Our career program is working'"

**User Constraints:**
- Teaching 200-300 students across multiple grades
- Limited tech skills (Excel is their comfort zone)
- Need simple dashboards, not complex analytics
- Want outputs they can print/email to parents

**Success Metric:** 80%+ rate admin dashboard as "easy to use"

#### **Tertiary User: School Principals**

**Jobs to be Done:**
- "Prove to parents/board that our career guidance is world-class"
- "Show measurable improvement in university acceptance rates"
- "Justify the R10K-R15K annual expense to school board"
- "Get weekly summary emails, not daily noise"

**User Constraints:**
- Extremely busy (5 min/week max for Thandi)
- Care about outcomes, not features
- Want simple success stories for newsletters
- Need data in formats they can present to board (PDF, PowerPoint export)

**Success Metric:** 90%+ would recommend Thandi to peer principals

---

### 3. Must-Have Features (MVP - January 2026 Launch)

#### **Feature 1: Career Assessment (Priority 1 - CRITICAL)**

**User Story:** As a student, I complete a 15-20 minute assessment that asks about my interests, abilities, values, and constraints, so I get personalized career recommendations.

**Technical Requirements:**
- 15-20 questions maximum (attention span limit)
- Mix of multiple choice, slider scales, and ranking questions
- Mobile-first UI (works on 4-inch smartphone screens)
- Progress bar showing "Question 5 of 18" to reduce dropout
- Save progress feature (students can pause and resume)
- Works offline (save responses locally, sync when online)

**Assessment Categories:**
1. Academic strengths (5 questions): "Which subjects do you excel at?"
2. Interest areas (5 questions): "Would you rather work with people, data, or things?"
3. Values & lifestyle (3 questions): "Do you want to travel for work or stay local?"
4. Constraints (3 questions): "Can your family afford R50K+/year university fees?"
5. Career awareness (2 questions): "Have you heard of data science as a career?"

**Success Criteria:**
- < 5% dropout rate during assessment
- Average completion time: 12-15 minutes
- 90%+ students say questions were "clear and relevant"

#### **Feature 2: AI Career Recommendations (Priority 1 - CRITICAL)**

**User Story:** As a student, I receive 3-5 personalized career recommendations immediately after completing the assessment, with clear reasoning for each match.

**Technical Requirements:**
- RAG system retrieves from 10 knowledge modules
- Recommendations prioritize:
  1. Careers matching academic strengths
  2. Careers with available bursaries (if student indicated financial need)
  3. Careers with growth in SA job market (4IR focus)
  4. Careers matching student's lifestyle preferences
- Each recommendation shows:
  - Career title + 2-sentence description
  - Required subjects/degrees
  - Typical starting salary
  - Bursary options (if available)
  - Next steps: "Apply here, study there"

**Example Output:**
```
Career Match #1: Data Scientist (92% match)
Why: You excel at math and enjoy problem-solving with data. 
Salary: R25K-R45K/month entry-level
Study Path: BSc Data Science (UCT, Wits, Stellenbosch)
Bursaries: Sasol Bursary (Deadline: 30 June), FNB Tech Bursary
Next Step: Apply to Sasol by 30 June 2026 → [Link]
```

**Success Criteria:**
- Students can explain why they got each recommendation
- 80%+ say "I learned about careers I didn't know existed"
- Recommendations include at least 1 emerging career (AI, green energy, etc.)

#### **Feature 3: Printable PDF Report (Priority 1 - CRITICAL)**

**User Story:** As a student, I download a professional PDF report with my results that I can show to parents, save for university applications, or give to teachers.

**Technical Requirements:**
- School branding (school logo, colors customizable per school)
- 3-4 page report including:
  - Page 1: Assessment summary (strengths, interests, values)
  - Page 2-3: Top 5 career recommendations with details
  - Page 4: Action plan (bursaries to apply for, courses to research, people to contact)
- Professional design (teachers should be proud to file this)
- Export as PDF (no reliance on internet after download)

**Design Notes:**
- Use school logo from admin settings
- Simple, clean layout (not flashy graphics)
- Printable in black & white (many schools can't afford color printing)
- Include student name, date, and unique report ID

**Success Criteria:**
- 90%+ students download their report
- 70%+ show report to parents or teachers
- Teachers say "This looks more professional than our current reports"

#### **Feature 4: Admin Dashboard (Priority 2 - IMPORTANT)**

**User Story:** As a career counselor, I log into a dashboard where I see which students have completed assessments, view their results at a glance, and generate reports for the principal.

**Technical Requirements:**
- Login with email + password (role-based access)
- Dashboard shows:
  - Completion rate (e.g., "142 of 200 students completed = 71%")
  - List of students with status: Completed / In Progress / Not Started
  - Click student name → see their career recommendations
  - Filter by grade (11 vs 12) or class
  - Export to CSV for Excel analysis
- Weekly email digest to counselor: "This week, 23 new students completed"

**Admin Views:**
1. **Overview Page:** Big numbers (completion %, top careers recommended)
2. **Student List Page:** Searchable, sortable table
3. **Individual Student Page:** Full assessment results + recommendations
4. **Reports Page:** Generate principal summary reports

**Success Criteria:**
- Counselors can find any student's results in < 30 seconds
- 80%+ say dashboard is "easy to navigate"
- Principals receive weekly email summaries automatically

#### **Feature 5: Bursary Deadline Alerts (Priority 3 - NICE-TO-HAVE)**

**User Story:** As a student who indicated financial need, I receive email/WhatsApp alerts when bursaries matching my career path are closing soon.

**Technical Requirements:**
- Database of 50+ major SA bursaries with deadlines
- Match bursaries to student's recommended careers
- Send alert 2 weeks before deadline: "Sasol Engineering Bursary closes 30 June"
- Include direct application link
- Option to opt-out of alerts

**Phase 1 (MVP):** Email alerts only  
**Phase 2:** Add WhatsApp bot integration

**Success Criteria:**
- 50%+ students who get alerts click the application link
- At least 10% of pilot students apply to a bursary they learned about via Thandi

---

### 4. Explicitly OUT OF SCOPE (Don't Build This in MVP)

❌ **WhatsApp Bot** (Phase 2 - after pilots succeed)  
❌ **Parent Portal** (too complex, low adoption expected)  
❌ **Live Chat with Counselors** (requires human staffing)  
❌ **Peer Mentorship Matching** (network effects need scale first)  
❌ **Job Board Integration** (matric students aren't job-hunting yet)  
❌ **Multilingual Support** (English-only for MVP, add Zulu/Afrikaans in Phase 2)  
❌ **Mobile App** (web-first, progressive web app sufficient)  

**Why These Are Out:** They don't directly impact the 3 pilot success metrics (completion rate, helpfulness rating, principal recommendation). Build them AFTER you've closed 10 paid schools.

---

### 5. Technical Constraints & Non-Functional Requirements

#### **Performance**
- Assessment loads in < 3 seconds on 3G connection
- RAG recommendations generated in < 10 seconds
- PDF report generates in < 5 seconds
- Dashboard loads in < 2 seconds

#### **Reliability**
- 99% uptime during school hours (8am-4pm SAST)
- Graceful degradation if AI service down (show cached results)
- Automatic error reporting (Sentry or similar)

#### **Security**
- Student data encrypted at rest (Supabase encryption)
- POPIA-compliant (no data sharing without consent)
- Role-based access control (students can't see others' results)
- API keys stored in environment variables (never in code)

#### **Scalability**
- Must handle 500 concurrent students (3 schools × 200 students, peak usage)
- Stays within Vercel free tier limits (100GB bandwidth/month)
- Stays within Supabase free tier (500MB storage, 2GB bandwidth)

#### **Accessibility**
- Works on smartphones as small as 4-inch screens
- Works on slow internet (< 1 Mbps)
- Readable on cheap smartphones (not just latest iPhones)
- Color contrast meets WCAG AA standards (some students are colorblind)

---

### 6. Success Metrics (How We Know MVP Works)

**Metric 1: Student Completion Rate**
- Target: 70%+ of students who start assessment finish it
- Measure: (Students who completed) / (Students who started) × 100
- Red flag: < 50% completion means assessment is too long or confusing

**Metric 2: Helpfulness Rating**
- Target: 80%+ rate recommendations as "helpful" or "very helpful"
- Measure: Post-assessment survey question
- Red flag: < 60% means RAG quality is poor

**Metric 3: Principal Recommendation**
- Target: 90%+ of pilot principals say "I'd recommend Thandi to peer schools"
- Measure: End-of-pilot survey
- Red flag: < 70% means we're not delivering enough value to justify R10K-R15K price

**Metric 4: Conversion to Paid**
- Target: 3 of 3 pilot schools convert to paid annual contracts
- Measure: Signed contracts by March 2026
- Red flag: < 2 conversions means product isn't ready for scale

---

### 7. Roadmap & Phasing

**Phase 1 (Weeks 1-2): Validation & Planning**
- [ ] Finalize 20 test questions with ideal answers
- [ ] Interview 3-5 teachers about UI preferences
- [ ] Cursor analyzes knowledge base for gaps
- [ ] Cursor designs database schema

**Phase 2 (Weeks 3-4): Core RAG System**
- [ ] Upload 10 modules to Supabase
- [ ] Build Chroma vector database
- [ ] Implement RAG retrieval logic
- [ ] Build 20-question test suite
- [ ] Achieve 18/20 test pass rate

**Phase 3 (Weeks 5-6): User-Facing Features**
- [ ] Build student assessment interface
- [ ] Build RAG recommendation display
- [ ] Build PDF report generator
- [ ] Test with 10 students, iterate on feedback

**Phase 4 (Weeks 7-8): School-Facing Features**
- [ ] Build admin dashboard
- [ ] Build email digest system
- [ ] Implement user authentication
- [ ] Deploy to Vercel, test with pilot schools

**Phase 5 (Weeks 9-10): Pilot Preparation**
- [ ] Create school onboarding guide
- [ ] Train 3 teachers on admin usage
- [ ] Set up support channels
- [ ] Launch with 3 pilot schools

---

## PART 2: THE 20 TEST QUESTIONS (AI Quality Check)

### Purpose
These 20 questions test whether Thandi's RAG system gives accurate, helpful career advice. Cursor must build the RAG logic to pass 18/20 of these tests BEFORE we show it to students.

### Testing Methodology
1. Input each question into Thandi's RAG system
2. Compare AI output to "Ideal Answer"
3. Pass criteria: AI answer covers 80%+ of key points in ideal answer
4. Fail criteria: AI gives factually wrong information or unhelpful generic advice

---

### **Category A: Subject-Career Matching (5 Questions)**

#### Q1: "I'm good at math but hate physics. What should I study?"

**Ideal Answer:**
"Great question! Many students think engineering is the only math-heavy career, but physics is a core requirement there. Consider these alternatives:

1. **Data Science / Analytics**: Uses statistics, linear algebra, and coding—no physics needed. Strong demand in SA (Capitec, Discovery, banks hiring). Study: BSc Data Science at UCT/Wits/Stellenbosch.

2. **Actuarial Science**: Math-focused, well-paid (R40K-R80K entry-level), no physics. Study: BCom Actuarial Science at UCT/UP/Stellenbosch. Competitive (need 80%+ math).

3. **Economics / Econometrics**: Math modeling for policy/finance. Study: BCom Economics at any university.

4. **Computer Science**: Logic and algorithms, minimal physics. Study: BSc/BCom Computer Science widely available.

Next steps: Research these on SA Youth platform, check NSFAS eligibility."

**Why This Answer:** Challenges the "math = engineering" assumption. Gives 4 specific alternatives with clear paths. Mentions salary and admission requirements. Actionable next step.

---

#### Q2: "I love biology but don't want to be a doctor. What else can I do?"

**Ideal Answer:**
"Medicine isn't the only biology career! Here are high-growth options in South Africa:

1. **Biotechnology**: Lab research on diseases, crops, biotech products. Study: BSc Biotechnology at Stellenbosch/Wits. Bursaries: CSIR, NRF.

2. **Environmental Science / Conservation**: Climate change, renewable energy, wildlife management. Study: BSc Environmental Science at most universities. Jobs: WWF, SANBI, consulting firms.

3. **Physiotherapy / Occupational Therapy**: Healthcare without the 7-year medical degree. Study: 4-year degree at UCT/Wits/UWC. High demand, R25K-R40K starting.

4. **Pharmaceutical Science**: Drug development, pharmacy tech. Study: BPharm (4 years) at any university.

5. **Agricultural Science**: Food security, sustainable farming (4IR focus). Study: BSc Agriculture at UP/Stellenbosch. Bursaries: Grain SA, AgriSETA.

Pro tip: Life Sciences opens many doors beyond medicine. Research which matches your interests (lab work? outdoors? patient care?)."

**Why This Answer:** Addresses misconception that biology = only medicine. Shows diverse paths (lab, fieldwork, healthcare). Includes emerging areas (biotech, climate). Bursary mentions.

---

#### Q3: "I'm creative but my parents want me to study something 'practical.' What should I do?"

**Ideal Answer:**
"This is a common dilemma. The good news: creativity IS practical in the 4IR economy. Here are careers that blend both:

1. **UX/UI Design**: Design apps, websites, user experiences. Tech companies pay R20K-R40K entry-level. Study: Interaction Design at UJ/Vega, or learn online via Udemy + build portfolio.

2. **Digital Marketing / Content Creation**: Social media, video, branding. Study: BCom Marketing at any university. Freelance potential (side income).

3. **Architecture**: Creative + technical. Study: BArch at UCT/Wits/UP (5 years). Competitive (need math).

4. **Industrial Design**: Design products (cars, furniture, tech). Study: BTech Industrial Design at TUT/CPUT.

5. **Game Design / Animation**: Growing SA industry. Study: Digital Arts at Wits/UJ.

**How to persuade parents:** Show them SA job market data—creative industries growing 15% annually. UX designers earn as much as engineers. Combine creativity with business skills (e.g., BCom Marketing) to prove 'practicality.'

Next step: Show parents this report + research salaries on PayScale."

**Why This Answer:** Validates the student's feelings. Provides data to convince parents (salary figures). Offers hybrid options (creative + business). Actionable advice.

---

#### Q4: "I don't have math in matric. Am I stuck with limited options?"

**Ideal Answer:**
"Not having Math doesn't close all doors, but it does limit STEM fields (engineering, medicine, science). However, many great careers remain open:

**High-Growth Options Without Math:**

1. **Teaching (Humanities)**: Always in demand. Study: B.Ed at any university. Bursaries: Funza Lushaka (full government bursary).

2. **Law**: Strong analytical career. Study: LLB at UCT/Wits/UP/UWC (5 years). No math required, but need 75%+ English.

3. **Social Work**: Help communities, address social issues. Study: BSocSc Social Work at most universities. Funded via NSFAS.

4. **HR / Industrial Psychology**: People management, corporate training. Study: BCom HR or BA Psychology.

5. **Journalism / Media**: Content creation, reporting. Study: BA Journalism at Rhodes/Wits.

6. **Business Admin**: Management, entrepreneurship. Study: BCom Management at any university.

**Important:** Some careers (e.g., accounting, actuarial science) require Math. If you change your mind, consider upgrading Math via UNISA or matric rewrite.

Next step: Check university websites for admission requirements without Math."

**Why This Answer:** Honest about limitations (STEM closed) but offers 6 strong alternatives. Includes bursary info. Mentions "upgrade Math" option for students who change minds.

---

#### Q5: "I want to work in AI and technology. What should I study?"

**Ideal Answer:**
"AI is one of the fastest-growing fields in South Africa! Here's your path:

**Undergraduate Degrees:**

1. **Computer Science** (BSc/BCom): UCT, Wits, Stellenbosch, UP, Rhodes. Covers programming, algorithms, data structures. 3-4 years.

2. **Data Science** (BSc): UCT, Wits, UP. Focuses on statistics, machine learning, Python/R. 3 years.

3. **Engineering (Electrical/Computer)**: UCT, Wits, Stellenbosch. 4 years. More hardware-focused.

**What to Study in High School:**
- Math (essential—aim for 70%+)
- Physical Science (helpful but not always required)
- IT/CAT (optional, shows interest)

**Bursaries:**
- Sasol (engineering/science): Closes 30 June
- FNB Tech Talent: Closes 31 August
- Microsoft 4Afrika: Check DHET website
- NSFAS: If family earns < R350K/year

**Career Outlook:**
- Junior developers: R15K-R30K/month
- Mid-level AI engineers: R40K-R80K/month
- High demand at Capitec, Takealot, Discovery, startups

**Next Steps:**
1. Learn Python online (free: Codecademy, freeCodeCamp)
2. Build 1-2 small projects (shows universities you're serious)
3. Apply to bursaries by mid-2026

SA is investing heavily in AI skills (DHET-Microsoft partnership). Great timing!"

**Why This Answer:** Specific degree names and universities. Clear high school subject requirements. Salary data. Bursary deadlines. Actionable steps (learn Python). Mentions government AI push.

---

### **Category B: Financial Constraints (5 Questions)**

#### Q6: "My family can't afford university. What options do I have?"

**Ideal Answer:**
"There are multiple pathways even if university seems unaffordable:

**Option 1: NSFAS Funding**
- Government bursary for students from households earning < R350K/year
- Covers tuition, accommodation, books, living allowance
- Apply: nsfas.org.za (opens October yearly, closes November)
- 788,741 students funded in 2025—you can be one of them

**Option 2: TVET Colleges**
- Technical & Vocational Education & Training (TVET)
- Cheaper than university (R2K-R5K/year vs R40K-R60K)
- Practical skills: plumbing, electrical, IT, hospitality, business
- 50 public TVET colleges nationwide
- NSFAS also funds TVET

**Option 3: Company-Sponsored Learnerships**
- Companies like Sasol, Eskom, Transnet offer "earn while you learn"
- Study + work simultaneously
- No upfront fees, get stipend
- Apply via SA Youth platform or company websites

**Option 4: Corporate Bursaries**
- FNB, Nedbank, Discovery, mining companies offer full bursaries
- Competitive (need 70%+ academic average)
- Usually require working for company 1-2 years after graduation
- Check career junction, company websites

**Action Plan:**
1. Apply to NSFAS by 30 November 2025
2. Research TVET colleges in your area
3. Check SA Youth for learnerships
4. Apply to 5+ corporate bursaries (shotgun approach)

Don't let money stop you. Options exist."

**Why This Answer:** Gives 4 concrete pathways. Specific numbers (788K NSFAS recipients, R350K threshold). Deadlines and URLs. Realistic about competition. Encouraging tone.

---

#### Q7: "Should I choose the cheapest university or the 'best' one?"

**Ideal Answer:**
"This depends on your career field and financial situation. Here's the nuanced answer:

**When 'Best' University Matters:**
1. **Law, Medicine, Engineering**: Employers care about university reputation. UCT/Wits grads often get better internships.
2. **Limited bursaries**: Some corporate bursaries only fund students at top 5 universities.
3. **Research careers**: If you want PhD/academia, go to research-intensive universities.

**When 'Best' Doesn't Matter:**
1. **Teaching, Social Work, Nursing**: All universities produce equally qualified graduates. Go local, save costs.
2. **Business, Marketing, HR**: Your skills + experience matter more than university name.
3. **Technical skills (IT, design)**: Employers care about portfolio/projects, not where you studied.

**Smart Strategy:**
- If NSFAS funds you OR you have full bursary: Choose best university you're accepted to
- If self-funding OR partial bursary: Choose local university (save on accommodation = R40K-R60K/year)
- If studying business/tech: University brand less important, focus on internships + projects

**Example:** Studying BCom Accounting at UP vs UJ vs local university? All produce qualified CAs. Choose local, save R50K/year on accommodation, use that money for laptops/books.

**Studying Medicine?** Go to UCT/Wits if accepted—better hospitals for training, stronger alumni network.

Bottom line: Optimize for total cost + career outcome, not just university name."

**Why This Answer:** Avoids "one size fits all" advice. Nuanced by field and finances. Real-world examples. Quantifies savings (R40K-R60K accommodation).

---

#### Q8: "What are the hidden costs of university I should budget for?"

**Ideal Answer:**
"Great question—many students only budget for tuition and get surprised. Here's the full picture:

**Annual University Costs (2025 estimates):**

1. **Tuition:** R40K-R60K/year (public universities)
2. **Accommodation:**
   - On-campus residence: R35K-R50K/year
   - Off-campus rental: R30K-R45K/year (cheaper but less support)
   - Living at home: R0 (if university nearby)
3. **Meals:** R20K-R30K/year (if not included in residence)
4. **Books & Materials:** R5K-R10K/year (varies by field—engineering more expensive)
5. **Laptop:** R8K-R15K (one-time, essential for most degrees)
6. **Transport:** R5K-R15K/year (if commuting)
7. **Data & Internet:** R3K-R5K/year
8. **Misc (printing, social, emergencies):** R5K-R10K/year

**Total Annual Cost:** R80K-R150K/year (if living away from home)  
**Total Annual Cost:** R50K-R80K/year (if living at home)

**What NSFAS Covers:**
- Tuition: ✅ Full
- Accommodation: ✅ Full (if on-campus)
- Meals: ✅ R15K/year allowance
- Books: ✅ R5K/year allowance
- Transport: ✅ R7.5K/year allowance
- Laptop: ✅ Once-off (if first-time student)

**What NSFAS Doesn't Cover:**
- Off-campus rent (only covers on-campus)
- Personal expenses (clothes, entertainment)
- Data/internet for off-campus students

**Budget Tips:**
1. Choose university close to home if possible (save R30K-R50K/year)
2. Buy second-hand textbooks (save 50%)
3. Apply for multiple bursaries (NSFAS + corporate bursary = extra money)
4. Work part-time in 2nd-4th year (tutoring, retail) for pocket money

Bottom line: Budget R80K-R150K/year if living away, R50K-R80K if at home. NSFAS covers most of this if you qualify."

**Why This Answer:** Specific numbers for every cost category. Clarifies what NSFAS covers vs doesn't. Practical tips to reduce costs. Realistic budgeting.

---

#### Q9: "Is a TVET qualification 'worth less' than a university degree?"

**Ideal Answer:**
"This is a myth that needs to die. The truth: it depends on your career goals.

**When TVET is BETTER than University:**

1. **Practical Skills Jobs:** Plumbing, electrical work, welding, hospitality, beauty therapy, automotive—you'll earn FASTER with TVET than a university degree in unrelated field.

2. **Cost:** TVET is 75% cheaper (R2K-R5K/year vs R40K-R60K). Less debt = more financial freedom.

3. **Time to Employment:** TVET = 2-3 years → immediate work. University = 3-4 years → still need internship. TVET grads often earn income 1-2 years earlier.

4. **Demand:** SA has critical skills shortages in trades (electricians earn R15K-R30K/month, experienced plumbers R25K-R40K). Government is pushing artisan training.

**When University is Better:**

1. **Professional Careers:** Medicine, law, engineering, teaching (B.Ed required), accounting (CA route).

2. **Research/Academia:** Need PhD → need degree first.

3. **Corporate Management:** Large companies often require degrees for senior roles.

**Example Comparison:**

| Path | Cost | Time | Starting Salary | 5-Year Outlook |
|------|------|------|-----------------|----------------|
| **TVET Electrical** | R10K total | 3 years | R15K/month | R30K+ (qualified electrician) |
| **University Engineering** | R200K total | 4 years | R18K/month (if you find job) | R35K+ |

TVET winner: Lower cost, faster income  
University winner: Slightly higher ceiling

**The Smart Move:**
- TVET → Work → Save money → Study further later (many TVET diplomas count toward degrees)
- University → If family can afford OR NSFAS funds you AND you want professional career

**Bottom Line:** TVET ≠ "second choice." It's a smart, practical path for hands-on careers. SA needs 30,000 artisans by 2030. You'll have job security.

Don't let stigma make decisions for you. Choose based on your strengths (academic vs practical) and financial reality."

**Why This Answer:** Destroys stigma with data. Specific salary comparisons. Shows TVET can lead to university later. Practical career examples. Validates both paths.

---

#### Q10: "Can I study part-time while working? How does that work?"

**Ideal Answer:**
"Yes! Part-time study is a smart strategy if you need income or can't commit full-time. Here's how:

**Part-Time Study Options:**

1. **UNISA (University of SA)**: Fully distance learning. Study while working. Degrees take 5-6 years (vs 3-4 full-time). Fees: R20K-R35K/year. Self-discipline essential.

2. **Private Colleges (Damelin, Boston, CTI)**: Evening classes + weekend. BCom, IT, business diplomas. Fees: R25K-R40K/year. Flexible schedules.

3. **Online Platforms (Coursera, Udemy, ALX)**: Certifications (not degrees) in tech, data, business. R3K-R15K. Employers increasingly accept these.

4. **University Part-Time Programs**: Some universities offer evening BCom, BA, B.Ed. Check UCT, UJ, UP websites. Fees similar to full-time but spread over longer period.

**Pros:**
- ✅ Earn income while studying
- ✅ Gain work experience simultaneously
- ✅ Less financial pressure
- ✅ Can switch careers without quitting job

**Cons:**
- ❌ Takes 1.5-2x longer to graduate
- ❌ Juggling work + study is exhausting
- ❌ Miss campus life (friends, networking, societies)
- ❌ NSFAS doesn't fund part-time (only full-time)

**Realistic Schedule Example:**
- Work: 8am-5pm Monday-Friday
- Study: 6pm-10pm weeknights + Saturdays
- Requires 20-25 hours/week for part-time degree
- Social life suffers (be honest with yourself)

**Who Should Do Part-Time:**
- You need income NOW (family dependents, bills)
- You're already working and want to upgrade skills
- You tried full-time and struggled (part-time = second chance)
- You're 25+ (older students often prefer part-time)

**Who Should NOT Do Part-Time:**
- Matric leavers 18-20 years old (go full-time, you have time)
- If NSFAS will fund you full-time (take the free option)
- If studying medicine/engineering (too intensive for part-time)

**Bottom Line:** Part-time works if you're balancing work/family, but full-time is ideal if you can afford it. Be realistic about your discipline—50% of part-time students drop out due to exhaustion."

**Why This Answer:** Honest about pros and cons. Specific institutions and costs. Realistic schedule example. Clear guidance on who should/shouldn't do part-time.

---

### **Category C: Career Misconceptions (5 Questions)**

#### Q11: "Do I need a degree to be successful?"

**Ideal Answer:**
"Short answer: No, but it depends on your definition of 'success' and your career path.

**Careers That DON'T Require Degrees:**
1. **Trades (Electrician, Plumber, Welder):** TVET certificate → R15K-R40K/month. High demand.
2. **Entrepreneurship:** Start business with skills. Examples: catering, hair salon, car wash, online store.
3. **Tech (Self-Taught):** Web development, graphic design, digital marketing. Learn online, build portfolio. Junior devs earn R15K-R25K/month.
4. **Sales:** Many sales roles train on the job. Top performers earn R20K-R50K/month (commission-based).
5. **Creative (Photography, Videography, Music Production):** Portfolio matters more than paper.

**Careers That REQUIRE Degrees:**
1. **Professional (Doctor, Lawyer, Engineer, Teacher, Accountant):** Non-negotiable. Regulated by professional bodies.
2. **Corporate Management:** Most companies require degrees for management roles (though this is changing slowly).
3. **Government Jobs:** Often require minimum qualifications.

**The Nuanced Truth:**
- Without degree: You can earn good money, but career ceiling may be lower. R40K/month possible, R80K+ harder.
- With degree: Opens more doors, higher salary ceiling (R50K-R100K+ at senior levels), but comes with debt/time cost.

**Success Stories Without Degrees:**
- Many SA entrepreneurs (e.g., restaurant owners, tech startup founders)
- Artisans running their own businesses
- Creative professionals with strong portfolios

**Success Stories Needing Degrees:**
- Doctors saving lives
- Engineers building infrastructure
- Teachers shaping next generation

**Bottom Line:** You don't NEED a degree to earn a living or be successful. But certain careers (medicine, law, engineering) absolutely require it. Choose based on your career goals, not pressure."

**Why This Answer:** Balanced perspective. Concrete examples both ways. Doesn't romanticize "no degree" path (acknowledges ceiling). Empowers student to choose based on goals.

---

#### Q12: "Is studying humanities/arts a waste of time?"

**Ideal Answer:**
"Absolutely not—but you need a plan. Humanities open doors if you combine them strategically.

**Why Humanities Get Bad Reputation:**
- Parents fear 'no jobs' (partly true if you ONLY do BA English with no extras)
- STEM fields have clearer career paths (engineering → engineer)
- Humanities require self-direction (you build your own career path)

**Where Humanities Graduates Thrive:**

1. **Communications/Marketing:** BA + internships → R15K-R30K starting. Grow to R40K+ (copywriters, brand managers, PR).

2. **HR/Industrial Psychology:** BA Psychology → BCom HR postgrad → R18K-R35K starting.

3. **Journalism/Media:** BA Journalism + portfolio → R12K-R25K starting (tough field, but rewarding).

4. **Social Work/NGO Sector:** BA Social Work → R15K-R25K starting. Meaningful work.

5. **Teaching:** BA + PGCE (postgrad teaching diploma) → R18K-R28K starting. Stable, pensioned.

6. **Law:** BA → LLB (postgraduate law) → R20K-R40K starting (corporate law R50K+).

7. **Policy/Research:** BA + Honours/Masters → government, think tanks, R20K-R40K.

**The Catch:** Humanities require YOU to build experience:
- Internships are critical (do 2-3 during degree)
- Build portfolio (write for student paper, start blog, volunteer)
- Network actively (LinkedIn, attend industry events)
- Consider postgrad (Honours/Masters often needed for good jobs)

**Smart Humanities Strategy:**
1. Choose employable combination: BA Psychology + HR courses, BA + Marketing, BA Politics + Law
2. Do internships every summer vacation
3. Learn business skills (Excel, project management, basic finance)
4. Build online presence (LinkedIn articles, portfolio website)

**Comparison:**

| Engineering Graduate | Humanities Graduate |
|---------------------|---------------------|
| ✅ Clear career path | ❌ Build your own path |
| ✅ R18K-R25K starting guaranteed | ⚠️ R12K-R30K starting (depends on hustle) |
| ⚠️ Rigid career options | ✅ Diverse career options |
| ❌ Less creativity | ✅ More creativity/flexibility |

**Bottom Line:** Humanities aren't a waste IF you're strategic (internships, network, build portfolio). Without strategy, yes—it's hard. But the same is true for any field. If you're passionate about people, ideas, society—study humanities. Just go in with eyes open and a plan."

**Why This Answer:** Validates concerns (yes, harder than STEM). Shows concrete career paths. Emphasizes strategy and hustle. Salary transparency. Balanced pros/cons.

---

#### Q13: "Should I study what I love or what pays well?"

**Ideal Answer:**
"This is THE question everyone asks. Here's the framework to decide:

**Scenario 1: You Love Something That Pays Well**
- Examples: Love coding → study Computer Science. Love medicine → study to be doctor.
- **Decision:** Easy. Do it. You're lucky.

**Scenario 2: You Love Something That Pays Poorly**
- Examples: Love music → studying Music Performance pays R8K-R15K/month (rare gigs). Love poetry → no direct career.
- **Decision:** Two options:
  - **Option A:** Study your passion + build side income plan (e.g., BA Music + teach music lessons + gig on weekends)
  - **Option B:** Study something practical (e.g., BCom) + pursue passion as hobby/side project until it's viable

**Scenario 3: You Don't Love Anything Specific Yet**
- You're 17, haven't experienced enough careers to know
- **Decision:** Study something practical with job security (teaching, nursing, BCom, IT). Discover passions through work experience.

**Scenario 4: You Hate What Pays Well**
- Example: Parents push engineering, but you hate it
- **Decision:** DON'T do it. You'll drop out or be miserable. Find middle ground (data science if you like patterns but not engines).

**The Middle Path (Recommended):**
1. Study something you're GOOD at and can tolerate (not hate, not obsessed love—just solid)
2. Ensure it has job market demand
3. Build financial security first (R20K-R30K/month stable)
4. Then explore passion projects on side
5. Eventually, passion project may become main income

**Example:**
- Study BCom Marketing (you're decent at it, jobs exist)
- Work 2-3 years, save R50K-R100K
- Start photography side business (your passion)
- If photography grows, transition full-time
- If not, you still have stable marketing career

**Real Talk from SA Context:**
- Unemployment is 33%. Passion alone doesn't pay rent.
- Many 'follow your passion' grads are unemployed/underemployed
- BUT passion + strategy + financial literacy = sustainable career

**Questions to Ask Yourself:**
1. Can I see myself doing this 8 hours/day for 5+ years? (if no, don't study it)
2. Will this career pay R15K+ starting salary in SA? (if no, have a backup plan)
3. Am I choosing this because I want it, or because parents/society expect it? (be honest)

**Bottom Line:** Study something you can tolerate that has job demand. Once financially stable, chase passion. Passion without income = stress. Income without passion = tolerable if you build life outside work."

**Why This Answer:** Framework for decision-making. Covers all scenarios. Realistic about SA unemployment. Offers "middle path" (not extremes). Empowering questions.

---

#### Q14: "Do employers care about which university I attended?"

**Ideal Answer:**
"It depends on the industry, role, and stage of your career. Here's the breakdown:

**Industries Where University Matters A LOT:**
1. **Law:** Top firms recruit heavily from UCT/Wits law schools. Stellenbosch also respected. Regional universities get fewer interviews.
2. **Investment Banking/Finance:** Banks (Investec, RMB, etc.) prefer UCT/Wits/Stellenbosch BCom grads.
3. **Medicine:** Hospital training quality varies. Wits/UCT = better hospital networks.
4. **Engineering (Big Companies):** Eskom, Sasol prefer top university grads for graduate programs.

**Industries Where University Matters LESS:**
1. **Tech/IT:** Skills + portfolio matter most. Self-taught devs get hired if they can code well.
2. **Teaching:** All B.Ed graduates are equally qualified. Schools hire based on personality/experience.
3. **Nursing:** All nursing degrees meet SANC standards. Hospitals don't discriminate by university.
4. **SMEs/Startups:** Small companies care about skills, not credentials.
5. **Sales/Marketing:** Results matter more than education.

**The Truth About University Brand:**
- **Year 1-3 of Career:** University name helps get first interview. After that, work experience matters more.
- **By Year 5+:** Nobody cares. Your track record speaks for itself.

**Example:**
- **Graduate A:** BCom Accounting from UCT. Gets interview at PwC easier due to brand.
- **Graduate B:** BCom Accounting from UJ. May need to apply to 20 companies vs 10, but still gets hired.
- **5 Years Later:** Both are CAs. Clients don't ask where they studied. Performance matters.

**Smart Strategy:**
- **If top university accepts you + you have funding:** Go. It helps short-term.
- **If top university = R100K debt vs local university = R20K debt:** Go local, invest savings in skills (courses, internships).
- **If studying tech/teaching/nursing:** Local university is fine.
- **If aiming for McKinsey/investment banking:** Top 3 universities help significantly.

**Harsh Truth:** University brand matters most for:
- Students with no work experience (i.e., fresh graduates)
- Elite corporate roles (law firms, banks, consulting)
- Students with average grades (university brand compensates)

**University brand matters less for:**
- Students with strong internship experience
- Tech/creative roles (portfolio matters more)
- Students with 70%+ grades (performance speaks for itself)

**Bottom Line:** University matters for first job, then fades. Choose based on affordability + field. Don't go R200K into debt for brand name if studying teaching/IT."

**Why This Answer:** Nuanced by industry and career stage. Real examples. Practical decision framework. Addresses "elite university anxiety."

---

#### Q15: "Is entrepreneurship a realistic career path straight out of school?"

**Ideal Answer:**
"Short answer: Possible, but hard. Most successful entrepreneurs start businesses AFTER gaining work experience and saving capital.

**The Harsh Reality:**
- 90% of SA startups fail
- You need capital (even small businesses need R10K-R50K startup costs)
- You need business skills (sales, finance, operations)—hard to learn in classroom
- No income for 6-12 months (or longer) while building business
- No safety net if it fails

**When Straight-to-Entrepreneurship Works:**

1. **Low-Capital Businesses:**
   - Examples: tutoring, car wash, event planning, social media management, graphic design
   - Start with R2K-R10K
   - Test on weekends while studying or working

2. **Skills-Based Services:**
   - You have a skill (coding, baking, hairdressing)
   - Freelance first, build clients, then go full-time

3. **Family Business:**
   - Family has existing business you can join/grow
   - Lower risk (infrastructure already exists)

4. **You Have Savings/Support:**
   - Parents can support you for 12-24 months while you build
   - OR you saved R50K-R100K from part-time work

**When You Should Get a Job First:**

1. **You have zero capital:** Need income to survive, pay rent, eat. Entrepreneurship requires runway.

2. **You don't have a validated business idea:** Don't quit everything to "figure it out." Test idea part-time first.

3. **You lack business skills:** Work 2-3 years in sales, operations, or finance. Learn how businesses actually work. THEN start yours.

4. **Your family depends on your income:** Too risky if siblings/parents rely on you.

**Recommended Path (Smart Entrepreneurship):**

**Year 1-3:** Get a job in your field. Learn industry secrets. Build network. Save R50K-R100K.

**Year 2-4:** Start side business (nights/weekends). Test if customers will pay. Refine model.

**Year 4-5:** If side business earns 50% of salary, consider going full-time. If not, keep as side income.

**Example:**
- Thabo studies BCom Marketing
- Works at advertising agency (R18K/month starting, grows to R25K by Year 3)
- Saves R10K/month = R360K over 3 years
- Starts graphic design agency on weekends (Year 2-3)
- By Year 3, agency earns R15K/month
- Quits job Year 4 when agency hits R30K/month
- Now has runway (R360K saved) to grow agency

vs.

- Sipho drops out of university to start business
- Zero capital, zero experience
- Business fails after 8 months (ran out of money)
- Now has no degree, no income, no savings
- Back to square one

**Bottom Line:** Entrepreneurship is romantic but risky. If you're passionate, TEST your idea while working/studying. Don't bet your future on unvalidated dreams. Build runway first."

**Why This Answer:** Realistic about failure rates. Shows smart path (job → side business → full-time). Concrete example comparison. Doesn't kill dreams, but grounds them.

---

### **Category D: 4IR / Emerging Careers (3 Questions)**

#### Q16: "What are the fastest-growing careers in South Africa right now?"

**Ideal Answer:**
"Based on 2025 SA labor market data, here are the high-growth fields:

**1. AI / Data Science / Machine Learning**
- **Why:** Every company is digitizing. Need data analysts, AI engineers, machine learning specialists.
- **Demand:** Capitec, Discovery, banks, retailers hiring heavily
- **Salary:** R25K-R50K starting, R80K+ with 3-5 years experience
- **Study:** BSc Data Science, Computer Science, or BCom Analytics

**2. Renewable Energy / Green Jobs**
- **Why:** Load shedding forcing solar/wind adoption. Government's Just Energy Transition plan.
- **Demand:** Solar installers, wind technicians, energy consultants
- **Salary:** R18K-R35K starting, R50K+ senior level
- **Study:** Electrical Engineering (renewables focus), TVET electrical, BSc Environmental Science

**3. Cybersecurity**
- **Why:** Increasing cyberattacks on SA companies (Transnet, Deloitte hacked).
- **Demand:** All large companies need cybersecurity analysts
- **Salary:** R25K-R45K starting, R100K+ senior level
- **Study:** BCom Informatics, BSc Computer Science + certifications (CompTIA, CISSP)

**4. Healthcare (Especially Nursing, Physio, OT)**
- **Why:** Aging population, post-COVID health focus
- **Demand:** 31,000+ vacant healthcare positions in public sector
- **Salary:** Nurses R15K-R30K, Physiotherapists R20K-R40K
- **Study:** Nursing diploma (4 years), BSc Physiotherapy

**5. Digital Marketing / E-Commerce**
- **Why:** Businesses moving online (DHET-Takealot partnership proves this)
- **Demand:** Social media managers, SEO specialists, content creators
- **Salary:** R12K-R25K starting, R40K+ with experience
- **Study:** BCom Marketing + online courses (Google Analytics, Meta Blueprint)

**6. Logistics / Supply Chain**
- **Why:** E-commerce growth (Takealot, Makro) needs logistics managers
- **Demand:** Warehouse managers, supply chain analysts
- **Salary:** R15K-R30K starting
- **Study:** BCom Supply Chain, BTech Logistics

**7. Financial Technology (Fintech)**
- **Why:** Digital banking (TymeBank, Bank Zero growing fast)
- **Demand:** Product managers, UX designers, data analysts
- **Salary:** R25K-R45K starting
- **Study:** BCom Finance + tech skills

**Declining Careers to Avoid:**
- ❌ Traditional print journalism (industry shrinking)
- ❌ Bank tellers (automation replacing roles)
- ❌ Coal industry jobs (Just Energy Transition phasing out coal)
- ❌ General admin roles (being automated)

**How to Choose:**
1. Pick a growth field that matches your strengths (math = data science, people = healthcare, creativity = digital marketing)
2. Check DHET-Microsoft/Takealot partnerships—they're investing in these fields
3. Research starting salaries (avoid fields below R15K unless passionate)

**Bottom Line:** AI, green energy, cybersecurity, and healthcare are booming. Position yourself in growth industries for job security."

**Why This Answer:** Data-driven (2025 labor market). Specific salary ranges. Shows declining careers (helps avoid bad choices). Links to government initiatives (DHET partnerships).

---

#### Q17: "Do I need to know coding to work in tech?"

**Ideal Answer:**
"No! Tech industry has many non-coding roles. Here's the breakdown:

**Tech Roles That DON'T Require Coding:**

1. **UX/UI Designer**
   - Design user experiences for apps/websites
   - Tools: Figma, Adobe XD (no code needed)
   - Salary: R18K-R35K starting
   - Study: Interaction Design, Visual Communication, or learn online

2. **Product Manager**
   - Decide WHAT to build (not how to build it)
   - Manage developers, prioritize features
   - Salary: R25K-R50K starting
   - Study: BCom Informatics, Engineering (then transition), or work up from junior roles

3. **Digital Marketing / Growth**
   - Drive traffic, run ads, analyze data
   - Tools: Google Ads, Facebook Ads, Google Analytics
   - Salary: R15K-R30K starting
   - Study: BCom Marketing + online courses

4. **Technical Writer**
   - Write documentation, help guides, API docs
   - Need to understand tech, not code it
   - Salary: R18K-R30K starting
   - Study: BA English/Communications + tech interest

5. **Quality Assurance (QA) Tester**
   - Test software for bugs
   - Some coding helps but not required
   - Salary: R12K-R25K starting
   - Study: BCom Informatics or learn on the job

6. **Tech Sales / Account Management**
   - Sell software to businesses
   - Need to understand product, not build it
   - Salary: R15K-R30K base + commission (can reach R50K+)
   - Study: BCom Marketing/Sales

7. **Data Analyst (Basic)**
   - Analyze data in Excel/Tableau (not always coding)
   - Salary: R18K-R30K starting
   - Study: BCom Analytics, BCom Informatics

**Tech Roles That DO Require Coding:**
- Software Engineer/Developer
- Data Scientist (Python/R required)
- DevOps Engineer
- Machine Learning Engineer

**Should You Learn Coding Anyway?**
**Yes—even if you don't code for a living, basic coding helps:**
- Understand how products work (makes you better PM/designer)
- Automate boring tasks (Excel macros, Python scripts)
- Career flexibility (can transition to developer role later)
- Higher salary potential (coding = premium skill)

**How to Enter Tech Without Coding:**
1. Start in non-coding role (QA tester, tech support, marketing)
2. Learn product/users/industry
3. If you enjoy it, learn basic coding (Python, SQL) via online courses
4. Transition to hybrid role (product manager, data analyst) over 2-3 years

**Bottom Line:** You DON'T need to code to work in tech. Many roles focus on design, strategy, marketing, or operations. But learning basic coding makes you more valuable and opens more doors. Start without code, add it later if interested."

**Why This Answer:** Lists 7 specific non-coding tech roles with salaries. Shows path into tech without coding background. Encourages learning coding as career enhancer, not requirement.

---

#### Q18: "Should I learn AI tools (like ChatGPT) or will they replace my job?"

**Ideal Answer:**
"Great question—this is THE career question of 2025. Here's the nuanced answer:

**AI Will NOT Replace You IF You Learn to Use AI**

Think of AI like Excel in 1990:
- People feared: 'Excel will replace accountants!'
- Reality: Excel made accountants MORE valuable (faster analysis, better insights)
- Accountants who refused to learn Excel? They got replaced.

**Same with AI in 2025:**
- AI will replace people who DON'T use AI
- AI will make people who USE AI 10x more productive

**Jobs at HIGHEST Risk (Will Shrink 30-50% by 2030):**
1. Data entry clerks (ChatGPT can automate)
2. Basic customer service (chatbots replacing humans)
3. Simple copywriting (AI writes ads now)
4. Junior research analysts (AI summarizes reports)
5. Basic translation (Google Translate improving)

**Jobs at LOWEST Risk (Will Grow Despite AI):**
1. Healthcare (nursing, doctors)—humans need human touch
2. Trades (electricians, plumbers)—AI can't fix pipes
3. Teaching (young children)—social skills matter
4. Creative strategy (AI executes, humans ideate)
5. Complex problem-solving (engineers, scientists)
6. Sales/relationships (humans buy from humans)

**How to Be AI-Proof:**

**Strategy 1: Learn to Use AI Tools**
- ChatGPT for research, writing, brainstorming
- Midjourney/DALL-E for design
- GitHub Copilot for coding
- Notion AI for project management

**Strategy 2: Focus on Human Skills AI Can't Do:**
- Emotional intelligence (reading people, empathy)
- Complex decision-making (strategic thinking)
- Creativity (original ideas, not just execution)
- Physical skills (surgery, plumbing, hairdressing)
- Relationship building (networking, sales)

**Strategy 3: Choose AI-Enhanced Careers (Not AI-Replaced):**
- **Doctor + AI:** AI diagnoses, you treat (faster, better care)
- **Teacher + AI:** AI grades, you mentor (more time with students)
- **Designer + AI:** AI generates options, you refine (faster workflow)
- **Lawyer + AI:** AI researches cases, you argue (better preparation)

**Real Example:**
- **Graphic Designer A:** Refuses to learn AI tools. Takes 5 hours to design a logo. Clients leave.
- **Graphic Designer B:** Uses AI (Midjourney) to generate 20 logo concepts in 10 minutes. Refines best one. Charges same price, serves more clients. Thrives.

**What to Do NOW:**
1. **Sign up for free AI tools:** ChatGPT, Claude (you're using it now!), Canva AI
2. **Experiment:** Use AI for homework, projects, side hustles
3. **Study AI-adjacent fields:** Data science, UX design, product management (AI enhances these, doesn't replace)
4. **Stay curious:** AI is changing monthly. People who adapt win.

**Bottom Line:** AI won't replace YOU if you learn to use AI. Think of AI as your assistant, not your replacement. The future belongs to humans who collaborate with AI, not compete against it."

**Why This Answer:** Reframes fear into opportunity. Concrete examples of at-risk vs safe jobs. Actionable steps (sign up for tools, experiment). Analogy to Excel makes it relatable.

---

### **Category E: Decision-Making Process (2 Questions)**

#### Q19: "I'm stuck between two career paths. How do I choose?"

**Ideal Answer:**
"Being stuck is normal—it means you're thinking deeply. Here's a decision framework:

**Step 1: Write Down Both Options with Full Details**

Example:
- **Option A:** Study Medicine (MBChB at Wits)
- **Option B:** Study Physiotherapy (BSc Physio at UCT)

**Step 2: Score Each Option on These 7 Factors (1-10 scale):**

| Factor | Weight | Option A Score | Option B Score |
|--------|--------|----------------|----------------|
| **Interest** (Do I enjoy this?) | ×3 | 8 | 7 |
| **Ability** (Am I good at required subjects?) | ×3 | 6 | 9 |
| **Job Security** (Will I find work?) | ×2 | 10 | 8 |
| **Salary Potential** (Can I support myself/family?) | ×2 | 10 | 7 |
| **Affordability** (Can I fund this study path?) | ×2 | 4 (need bursary) | 8 (cheaper) |
| **Work-Life Balance** (Will I have time for family/hobbies?) | ×1 | 5 (doctors work long hours) | 8 |
| **Alignment with Values** (Does this feel meaningful?) | ×2 | 10 (save lives) | 9 (help people recover) |

**Total Weighted Scores:**
- Option A (Medicine): (8×3) + (6×3) + (10×2) + (10×2) + (4×2) + (5×1) + (10×2) = **111 points**
- Option B (Physiotherapy): (7×3) + (9×3) + (8×2) + (7×2) + (8×2) + (8×1) + (9×2) = **124 points**

**Result:** Physiotherapy wins (124 > 111) because of higher ability match, affordability, and work-life balance.

**Step 3: Test Your Gut Reaction**

After seeing the scores, ask yourself:
- "Do I feel relieved that Physio won, or disappointed that Medicine lost?"
- If relieved → go with the winner
- If disappointed → your gut wants the "loser" (scores may have wrong weights)

**Step 4: Talk to Professionals in Both Fields**

- Find a doctor and a physiotherapist (LinkedIn, family friends, cold messages)
- Ask: "What do you wish you knew before studying this?"
- Real-world insights beat career guide books

**Step 5: Try Before You Decide (If Possible)**

- Job shadow a doctor for 1 day
- Job shadow a physiotherapist for 1 day
- See which environment feels right

**Common Stuck Points:**

**'Both look great, I can't choose':**
- Solution: Pick the MORE AFFORDABLE one. You can always switch careers later (many doctors trained as something else first).

**'Family wants A, I want B':**
- Solution: Show family your scoring matrix. If they can't counter with logic (just emotion), choose B.

**'I'm scared of choosing wrong':**
- Solution: There is no 'wrong' choice, only different paths. Both lead to good lives if you work hard. Choose, commit, don't look back.

**Bottom Line:** Use data (scoring system) + gut feeling + real-world research. If still stuck after this, flip a coin—your reaction to the coin flip reveals what you truly want."

**Why This Answer:** Provides concrete decision-making tool (scoring matrix). Covers emotional factors (gut check). Addresses common stuck points. Empowers student to decide logically."

---

#### Q20: "What if I choose a career and later realize I made a mistake?"

**Ideal Answer:**
"This fear stops many students from deciding. Here's the truth: career changes are NORMAL and common in modern SA economy.

**Reality Check:**
- Average person changes careers 3-5 times over lifetime
- 40% of SA professionals work in fields unrelated to their degrees
- Career 'mistakes' are learning experiences, not failures

**What to Do If You Realize You Made a Mistake:**

**Scenario 1: You're Still Studying (Year 1-2)**

**Option A:** Switch degrees (if you're early enough)
- Most universities allow degree changes in Year 1
- You might lose 1 semester, but that's better than 4 years in wrong field
- Check: Will NSFAS still fund you if you change?

**Option B:** Finish degree, pivot after
- If you're Year 3+, finishing might be faster than restarting
- Use electives to explore other interests
- Example: Finish BA History, then do postgrad in Education or Law

**Scenario 2: You've Graduated But Hate Your Job (Year 1-3 Post-Grad)**

**Option A:** Find related role that fits better
- Example: Studied accounting, hate auditing → try financial analysis, tax consulting, or corporate finance
- Your degree still has value, just different application

**Option B:** Postgraduate study in new field
- Example: BCom → PGCE (teaching diploma) in 1 year
- Example: BSc → MBA → transition to business
- Example: Engineering → Data Science Masters

**Option C:** Learn new skills (faster than new degree)
- Example: Studied marketing, want to do UX design → 6-month UX bootcamp (ALX, Udacity)
- Example: Studied teaching, want tech career → self-learn coding + build portfolio

**Scenario 3: You're 5+ Years Into Career, Want Complete Change**

**Option A:** Side hustle transition (safest)
- Keep day job, start new career on weekends
- Once side income = 50% of salary, consider full transition
- Example: Accountant starts photography business, transitions over 2 years

**Option B:** Study part-time while working
- UNISA, online courses, evening classes
- Takes longer but financially safer

**Option C:** Bold move (quitting to retrain)
- Only if: You have R50K-R100K saved (6-12 month runway)
- Rare but sometimes necessary for major pivots (e.g., corporate banker becoming social worker)

**Real SA Example:**
- Thando studied law (LLB), worked at firm 2 years, realized she hated litigation
- Tried corporate law (still hated it)
- Did 6-month digital marketing course (RedAcademy)
- Now works as legal tech product manager (combines law knowledge + tech)
- Salary: R45K/month (more than junior lawyer)
- Loves her job, no regrets

**Cost of 'Mistakes':**
- 1 year 'wasted' = not a big deal in 40-year career
- R50K-R100K debt = manageable over 5-10 years
- Real cost is STAYING in wrong career for 10 years (burnout, regret)

**How to Minimize 'Mistakes':**
1. Research careers deeply BEFORE studying (job shadowing, informational interviews)
2. Do internships during degree (test if you actually like the work)
3. Choose flexible degrees (BCom, BSc, BA open many doors)
4. Don't study hyper-specialized fields unless you're 90% sure (e.g., Marine Biology vs general BSc Biology)

**Bottom Line:** 'Mistakes' are fixable. Career changes are normal. The only real mistake is staying miserable for years because you're too scared to pivot. SA economy rewards adaptability. Choose, learn, adjust as needed."

**Why This Answer:** Normalizes career changes (data on 3-5 career shifts). Provides 3 scenarios with specific solutions. Real SA example (Thando). Addresses fear directly. Empowering tone.

---

## PART 3: IMPLEMENTATION GUIDE FOR CURSOR AI

### How to Use This Document with Cursor

**Step 1: Share This Entire Document with Cursor**

Copy the full PRD + 20 test questions and paste into Cursor with this prompt:

```
Cursor, this is the Product Requirements Document and Test Suite for Thandi MVP.

CRITICAL CONTEXT:
- This is a B2B school licensing product (NOT B2C consumer app)
- We're building for 3 school pilots launching January 2026
- Success = 70% student completion + 80% helpfulness rating + 3 paid contracts
- Budget constraint: Must stay within Vercel/Supabase free tiers

BEFORE you write ANY code:
1. Analyze the 10 knowledge modules against the 20 test questions
2. Tell me which questions we CAN'T answer well with current knowledge
3. Suggest what additional content we need

DO NOT proceed to building until I confirm the knowledge base is complete.
```

**Step 2: Create .cursorrules File**

Create a file called `.cursorrules` in your project root with this content:

```
# Thandi Development Rules

## Mission
Build a B2B career guidance platform that helps SA schools convert matric students into university-ready, career-focused graduates.

## Priority Order (Always Choose in This Order)
1. School pilot success > Technical elegance
2. Printable outputs > Beautiful UI  
3. Admin visibility > Student features
4. Simple & working > Complex & broken
5. Free tier compatibility > Premium features

## Code Standards
- Every feature must answer: "Will this help close school deals?"
- Always add comments explaining "why" not just "what"
- Every RAG response must cite source module (for audit trail)
- Optimize for 1 Mbps internet (township/rural schools)
- Mobile-first design (70% of students use smartphones)

## Security Requirements
- Never commit .env files or API keys
- Always use Supabase Row Level Security
- Encrypt student assessment data at rest
- POPIA-compliant data handling (no sharing without consent)

## Testing Requirements
- Run 20-question test suite before each commit to main
- Target: 18/20 questions must pass (90% accuracy)
- Test on slow internet (throttle to 1 Mbps in Chrome DevTools)
- Test on mobile (4-inch screen minimum)

## Before Suggesting Code
Ask yourself:
1. Does this help principals see student completion rates?
2. Can teachers print/file this output?
3. Will this work on a 2015 Android phone with 3G?
4. Does this stay within free tier limits?

If answer is "no" to any, revise approach.

## Git Commit Standards
Format: [CATEGORY] Brief description

Categories:
- [RAG] Changes to RAG retrieval/matching logic
- [ADMIN] Admin dashboard features
- [STUDENT] Student-facing features
- [PDF] PDF report generation
- [AUTH] Authentication/security
- [DB] Database schema changes
- [TEST] Test suite updates
- [FIX] Bug fixes

Example: [RAG] Improve career matching accuracy for business careers
```

**Step 3: Knowledge Base Gap Analysis Workflow**

After Cursor analyzes the 10 modules against 20 questions, it might say:

> "I can answer 14/20 questions well. Issues:
> - Q6 (NSFAS info): Module doesn't include 2025 application deadlines
> - Q16 (Fastest-growing careers): Missing salary data for green energy jobs
> - Q18 (AI tools): No content on AI career impact
> - Q7, Q8, Q9: Partial info, need more detail on costs/TVET"

**Your Response:**

```
Understood. Here's the plan:
1. I'll research and add the missing content to relevant modules this week
2. For now, build the RAG system using the 14 questions we CAN answer
3. We'll iterate to 18/20 pass rate before pilot launch

Proceed with building core RAG infrastructure:
- Supabase upload scripts for 10 existing modules
- Chroma vector database setup  
- Basic matching algorithm
- Test framework for the 20 questions

Build it modular so we can easily add content later.
```

**Step 4: Checkpoint Review Schedule**

Set calendar reminders every 3-4 days:

**Day 3 Checkpoint:**
- Cursor: "I've built the Supabase upload scripts. Here's how to run them."
- You: Run scripts, verify modules uploaded correctly
- Test: Can you query the database and retrieve career profiles?

**Day 7 Checkpoint:**
- Cursor: "I've built the RAG retrieval logic. Here's the test suite running."
- You: Review test results (likely 8-10/20 passing at this stage)
- Provide feedback: "Q3's answer is too generic, needs specific university names"

**Day 10 Checkpoint:**
- Cursor: "I've improved RAG based on feedback. Now 14/20 passing."
- You: Test with a real student (friend's child, family member)
- Observe: Do they understand the recommendations? Do they find it helpful?

**Day 14 Checkpoint:**
- Cursor: "I've built the student assessment interface. Try it on mobile."
- You: Complete assessment on your phone, note UX issues
- Feedback: "Question 5 is confusing, progress bar is hard to see on small screen"

**Continue this pattern every 3-4 days through Week 8.**

---

## PART 4: SUCCESS CRITERIA FOR MVP LAUNCH

### Definition of "Ready for Pilot Launch"

**Technical Criteria:**
- [ ] RAG system passes 18/20 test questions (90% accuracy)
- [ ] Assessment loads in < 3 seconds on 3G
- [ ] PDF reports generate without errors
- [ ] Admin dashboard shows real-time completion rates
- [ ] System handles 50 concurrent users (stress test)
- [ ] Zero critical bugs in production

**User Experience Criteria:**
- [ ] 5 test students complete assessment with < 5% dropout
- [ ] Test students rate clarity of questions as 8/10 or higher
- [ ] Teachers can navigate admin dashboard in < 30 seconds (first time)
- [ ] PDF reports look professional when printed black & white

**Business Criteria:**
- [ ] School onboarding guide written (< 5 pages)
- [ ] Teacher training video recorded (< 10 minutes)
- [ ] Support email/WhatsApp set up with auto-responder
- [ ] Pilot agreement signed with 3 schools

**You Launch When All Boxes Are Checked.**

### Launch Day Checklist

**Week Before Launch:**
- [ ] Email pilot schools: "We're launching Monday. Here's what to expect."
- [ ] Train 3 teachers via Zoom (30 min sessions)
- [ ] Send login credentials to school admins
- [ ] Set up monitoring dashboard (track errors, usage, performance)

**Launch Day:**
- [ ] Send launch email to students: "Your career assessment is ready!"
- [ ] Be available on WhatsApp/email 8am-6pm for support questions
- [ ] Monitor error logs every 2 hours
- [ ] Check completion rates evening of Day 1 (target: 20+ students started)

**Week 1 Post-Launch:**
- [ ] Daily check-ins with teachers: "Any issues? What feedback are students giving?"
- [ ] Fix critical bugs within 24 hours
- [ ] Document all feature requests (don't build yet, prioritize after pilot)
- [ ] Friday of Week 1: Send pilot principals weekly summary email

**Week 4 Post-Launch:**
- [ ] Survey students: Helpfulness rating (target: 80%+ say "helpful")
- [ ] Survey teachers: Ease of use rating (target: 80%+ say "easy")
- [ ] Survey principals: Would you recommend? (target: 90%+ say "yes")

**Week 8 Post-Launch:**
- [ ] Analyze completion rates (target: 70%+)
- [ ] Compile testimonials from students, teachers, principals
- [ ] Create case study: "School X achieved Y% completion, students said Z"
- [ ] Pitch paid contracts: "Pilot proved value, here's pricing for full year"

---

## PART 5: WHAT TO GIVE CURSOR NEXT

Now that you have the PRD and 20 test questions, here's your immediate action plan:

### Action 1: Send This Document to Cursor (Today)

Copy this entire artifact and paste into Cursor with this prompt:

```
Cursor, I'm attaching the complete Product Requirements Document and 20-question test suite for Thandi MVP.

First task: Analyze my 10 existing knowledge modules (in Thandi_Knowledge_Base folder) against these 20 test questions.

For each question, tell me:
1. Can we answer it well with current knowledge? (Yes/Partial/No)
2. If Partial or No, what specific content is missing?
3. Which module(s) would I need to update?

Give me a summary table like this:

| Question # | Topic | Answerable? | Missing Content | Module to Update |
|------------|-------|-------------|-----------------|------------------|
| Q1 | Math-career matching | Yes | - | Module 3 already covers |
| Q6 | NSFAS funding | Partial | 2025 deadlines, income threshold | Module 5 (Financial Aid) |
| Q18 | AI career impact | No | No content on AI tools | New module needed |

Do this analysis first. Do NOT start building code until I review the gaps.
```

### Action 2: Fix Knowledge Base Gaps (Next 2-3 Days)

Once Cursor identifies gaps, research and add missing content to your modules. Priority order:

1. **Critical gaps** (questions you absolutely must answer): NSFAS info, bursary deadlines, 4IR careers
2. **Important gaps** (nice-to-have): Detailed salary data, specific university comparisons
3. **Low-priority** (can add post-pilot): Advanced topics, niche careers

### Action 3: Approve Cursor to Start Building (After Gaps Fixed)

Once you've updated modules, tell Cursor:

```
Knowledge base is now complete for 18/20 questions (good enough for MVP).

Proceed with Phase 2: Build the core RAG system.

Deliverables for next checkpoint (3 days):
1. Supabase tables created and 10 modules uploaded
2. Chroma vector database initialized
3. Basic RAG retrieval function (input: question, output: answer from modules)
4. Test suite framework (can run 20 questions and score results)

Build it modular and well-commented. I'll review in 3 days.
```

### Action 4: Set Up Checkpoint Reviews

**Every 3 days, stop Cursor and do this:**

1. **Review what it built:** Run the code, test features, check for bugs
2. **Test with a real person:** Friend, family member, student—get fresh eyes
3. **Give specific feedback:** Not "this is bad" but "Q7's answer doesn't mention TVET, add that"
4. **Prioritize next 3 days:** "Great progress. Next: build admin dashboard, then PDF reports"

---

## FINAL WORDS: YOUR PARTNERSHIP WITH CURSOR

Remember this framework:

**Cursor's Job:**
- Write clean, efficient, secure code
- Implement the RAG pipeline technically
- Build the UI components
- Handle deployment and infrastructure

**Your Job:**
- Define WHAT to build (this PRD does that)
- Validate it works for REAL USERS (schools, students, teachers)
- Make strategic decisions (features to prioritize, trade-offs to make)
- Keep Cursor aligned with business goals (B2B school sales, not consumer virality)

**Together, You'll Build:**
- A working RAG-based career guidance MVP
- That helps 3 schools in January 2026 pilots
- That converts to 3 paid contracts by March 2026
- That proves Thandi is a viable R240K-R500K Year 1 business

**You have everything you need now. Execute.**

---

## Document Version Control

**Version:** 1.0  
**Date:** October 2025  
**Author:** Claude (Anthropic) + Your Business Insights  
**Status:** Ready for Cursor Implementation  

**Next Update:** After knowledge base gap analysis (expected: within 3 days)

**Changelog:**
- v1.0 (Oct 2025): Initial PRD with 20 test questions, implementation guide, success criteria

---

**Now go build Thandi. South Africa's students are waiting.**