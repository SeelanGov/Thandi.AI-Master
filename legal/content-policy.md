# AI Content Policy

**Status:** ✅ READY  
**ARTIFICIAL INTELLIGENCE USAGE & CONTENT GOVERNANCE**

**THANDI AI (PTY) LTD** | Registration No: 2025/939429/07 | POPIA Reg: 2025-068149  
**Information Officer:** Seelan Govender | hello@thandi.online  
**AI Ethics Officer:** Seelan Govender (interim)

**Version:** 1.0 (Beta) | **Effective Date:** 21 December 2025

---

## 1. PURPOSE & SCOPE

This policy governs the development, deployment, and usage of Artificial Intelligence systems within Thandi.ai, specifically for career guidance, educational recommendations, and student support services.

**Applies to:**
- All AI models powering career recommendations
- Natural language generation in reports
- Chatbot interactions (future feature)
- Image/text analysis capabilities
- Automated decision-making systems

---

## 2. AI SYSTEMS IN USE (BETA PHASE)

### 2.1 Career Matching Engine

**Type:** Supervised machine learning (random forest + gradient boosting)  
**Purpose:** Match students to careers based on academic performance, interests, and labor market data  
**Training data:** 50,000+ historical student records (anonymized), SAQA occupational database, DHET labor market surveys

### 2.2 University Admission Predictor

**Type:** Logistic regression + neural network  
**Purpose:** Estimate probability of admission to specific programs  
**Training data:** Historical admission data from 26 SA universities (2020-2024)

### 2.3 Bursary Eligibility Classifier

**Type:** Rule-based system + NLP  
**Purpose:** Match students to bursary opportunities  
**Training data:** 200+ bursary databases, NSFAS guidelines, corporate bursary criteria

### 2.4 Content Generation (Reports)

**Type:** Template-based generation with GPT-4 fine-tuning  
**Purpose:** Create personalized career guidance reports  
**Training data:** Career counseling best practices, educational psychology literature

---

## 3. PLATFORM-SPECIFIC AI USAGE POLICIES

### 3.1 Student-Facing AI

**Principles:**
- **Empowerment, not replacement:** AI supports human decision-making, does not replace counselors
- **Transparency:** Students informed they're interacting with AI
- **Age-appropriate:** Content tailored for 14-18 year old comprehension
- **Safety-first:** No advice that could cause physical, emotional, or financial harm

**Prohibited Uses:**
- ❌ No medical/psychological diagnosis
- ❌ No financial advice beyond bursary identification
- ❌ No encouragement of risky or illegal activities
- ❌ No collection of sensitive data (sexual orientation, political views, religious beliefs)
- ❌ No creation of addictive engagement loops

### 3.2 School-Facing AI (Analytics Dashboard)

**Principles:**
- **Aggregated only:** Individual student data never shown to schools
- **Anonymization minimum:** 10+ students required for any school-level statistic
- **Purpose limitation:** School data only for institutional planning, not student surveillance

**Prohibited Uses:**
- ❌ No individual student tracking by schools
- ❌ No teacher performance evaluation based on AI recommendations
- ❌ No automated disciplinary action based on predicted outcomes
- ❌ No sharing school data with third parties without explicit consent

### 3.3 Research & Development AI

**Principles:**
- **Anonymization:** All research data stripped of identifiers
- **Consent:** Opt-in required for research participation (separate from service consent)
- **Transparency:** Publish research findings openly (where appropriate)

**Prohibited Uses:**
- ❌ No using student data to train general-purpose AI models
- ❌ No selling anonymized data to third-party AI companies
- ❌ No psychological experiments without IRB approval
---

## 4. CONTENT GENERATION GUIDELINES

### 4.1 Report Content Standards

All AI-generated career reports must:

**✅ Include:**
- Clear statement that recommendations are AI-generated and probabilistic
- Confidence level indicators (e.g., "High confidence: 85% match")
- Explicit verification requirements ("⚠️ Verify with university")
- Multiple alternative pathways (not single recommendation)
- Resources for human support (school counselor contact)

**✅ Tone & Language:**
- Encouraging and supportive (not deterministic: "You WILL succeed")
- Culturally sensitive (South African context-aware)
- Age-appropriate reading level (Grade 9 comprehension minimum)
- Gender-neutral career descriptions (unless specific program requirements exist)
- Multi-language support (primary: English, secondary: isiZulu, Afrikaans in development)

**❌ Avoid:**
- Definitive statements: "You are guaranteed admission"
- Discouraging language: "You are not good enough for this career"
- Gender stereotyping: "This career is better for boys/girls"
- Socio-economic bias: Assuming financial resources beyond stated constraints
- Racial or cultural assumptions: All recommendations based on merit and interest only

### 4.2 Bursary Content Accuracy

**Verification Protocol:**
- All bursary information cross-checked against provider website (automated monthly)
- Human verification of top 50 bursaries quarterly
- "Last verified" date displayed on every bursary listing
- User flagging system for outdated information

**Non-inclusion Criteria:**
- Bursaries requiring payment to apply (likely scams)
- Bursaries with opaque selection criteria (unfair practices)
- Bursaries from unregistered organizations
- Bursaries with discriminatory requirements (unless legally exempted, e.g., certain transformation bursaries)

### 4.3 Career Description Content

**Source Standards:**
- SAQA occupational descriptions (authoritative)
- DHET career guidance materials (government-endorsed)
- O*NET database (international, adapted for SA context)
- Industry body input (Engineering Council of SA, HPCSA, etc.)

**Update Frequency:**
- Annual review of all career descriptions
- Quarterly updates for high-growth sectors (tech, renewable energy)
- Real-time updates for discontinued programs or qualifications

---

## 5. AI BIAS MITIGATION MEASURES

### 5.1 Identified Bias Risks

**Historical Bias Risk:** Training data reflects historical inequalities in education system

**Mitigation:**
- **Oversampling:** Augment training data with records from quintile 1-3 schools
- **Fairness constraints:** Explicitly penalize model for disparate impact based on school type
- **Benchmarking:** Test model performance across different school quintiles before deployment

**Socio-economic Bias Risk:** AI may favor careers requiring resources unavailable to low-income students

**Mitigation:**
- **Bursary integration:** prominently display financial aid for high-cost pathways
- **Cost filtering:** Allow students to filter careers by "low-cost entry"
- **Barrier flagging:** Identify careers with expensive requirements (e.g., medical school fees)

**Gender Bias Risk:** Stereotypical career recommendations based on gender (if provided)

**Mitigation:**
- **Optional gender field:** Not required for core recommendations
- **Blind testing:** Evaluate model outputs with and without gender data
- **Gender-neutral language:** All career descriptions reviewed for bias
- **Counter-stereotypical examples:** Actively promote careers in non-traditional fields

**Geographic Bias Risk:** Bias toward urban, Western Cape/Gauteng opportunities

**Mitigation:**
- **Provincial filters:** Students select home province for local opportunities
- **Rural opportunities:** Highlight careers viable in rural areas (agriculture, teaching, telecommuting)
- **Distance learning:** Include UNISA and other distance options prominently

**Racial Bias Risk:** Training data may reflect apartheid-era educational disparities

**Mitigation:**
- **Blind processing:** AI does not consider race in core recommendation algorithms
- **Transformation bursary matching:** Race considered ONLY for explicit transformation bursaries with consent
- **Equity audits:** Quarterly bias audits across demographic groups
- **B-BBEE transparency:** We are 100% black-owned, committed to transformation
### 5.2 Bias Testing & Auditing

**Quarterly Bias Audits:**
- **Disparate impact analysis:** Compare recommendation distributions across school quintiles
- **Counterfactual testing:** Same student profile, different school location/socio-economic status
- **Gender parity:** Ensure recommendation variance by gender <5%
- **Rural/urban parity:** No systematic preference for urban careers

**External Auditing:**
- Annual third-party algorithmic audit (planned for 2026)
- B-BBEE verification includes data transformation practices
- Open to Information Regulator audits at any time

**User Reporting:**
- **"Bias Report" button** in every recommendation
- Anonymous flagging of potentially biased content
- All reports reviewed within 5 business days
- Pattern analysis of bias reports quarterly

### 5.3 Model Update & Retraining Policy

**Retraining Frequency:**
- **Major retrain:** Annually with new admission cycle data
- **Minor updates:** Quarterly for new programs/courses
- **Hotfixes:** Immediate for identified bias issues

**Data Drift Monitoring:**
- Track model performance metrics weekly
- Alert if recommendation patterns shift significantly
- Investigate any demographic group performance degradation

**Version Control:**
- All model versions documented and archived
- Ability to rollback to previous version if bias detected
- A/B testing for major model changes (limited beta group first)

---

## 6. ETHICAL AI PRINCIPLES

### 6.1 Human-Centered AI
- **Human in the loop:** School counselors/parents must review critical recommendations
- **Override capability:** Students/parents can manually adjust recommendations
- **Explanation requirement:** All recommendations include reasoning ("Why this career?")

### 6.2 Beneficence
- **Student welfare:** All features must demonstrably benefit students
- **Harm prevention:** Proactive identification and mitigation of potential harms
- **Positive impact:** Track downstream outcomes (university admission rates, student satisfaction)

### 6.3 Justice & Fairness
- **Equitable access:** Free tier available for all South African students
- **No discrimination:** Race, gender, disability, religion never used to deny opportunities
- **Affirmative action:** Actively promote transformation bursaries and historically disadvantaged access programs

### 6.4 Transparency
- **Open source:** Core recommendation algorithms will be open-sourced (post-beta)
- **Explainability:** White-box models preferred over black-box where possible
- **Public documentation:** This policy and model cards publicly available

### 6.5 Accountability
- **Named responsibility:** Seelan Govender accountable for AI ethics
- **Impact assessments:** Algorithmic impact assessments before major model changes
- **Stakeholder input:** Student, parent, teacher advisory panels for major features

---

## 7. PROHIBITED CONTENT & USE CASES

### We will NOT generate or allow:
- ❌ Content promoting illegal activities (drug trafficking, fraud)
- ❌ Explicit sexual content or sexual career advice
- ❌ Hate speech or discriminatory content
- ❌ Violence or self-harm encouragement
- ❌ Medical diagnoses or treatment recommendations
- ❌ Financial investment advice (beyond bursary identification)
- ❌ Political campaigning or partisan content
- ❌ Religious proselytizing
- ❌ Content encouraging academic dishonesty
- ❌ Misinformation about COVID-19, vaccines, or public health

### We will NOT permit AI use for:
- ❌ Surveillance of students or teachers
- ❌ Automated grading or disciplinary decisions
- ❌ Predicting student failure or "risk" scoring
- ❌ Commercial advertising targeting minors
- ❌ Creating behavioral profiles for third parties
- ❌ Law enforcement investigations
- ❌ Immigration decisions
- ❌ Credit scoring or financial services

---

## 8. USER RESPONSIBILITIES

### As a student/parent using Thandi.ai:
- ✅ Provide accurate information (garbage in, garbage out)
- ✅ Use AI recommendations as **one input** among many
- ✅ Consult with human counselors, teachers, parents
- ✅ Verify information independently
- ✅ Report suspicious or biased recommendations
- ✅ Understand AI limitations (not infallible)

### As a school/educator:
- ✅ Ensure proper consent obtained
- ✅ Supervise appropriate use (not during unauthorized times)
- ✅ Teach AI literacy and critical thinking
- ✅ Do NOT use AI to replace professional counseling
- ✅ Protect student login credentials
- ✅ Report AI errors or biases promptly
---

## 9. AI ACCIDENT & FAILURE RESPONSE

### If AI produces harmful recommendation:
1. **Immediate:** User reports via "Flag Issue" button
2. **Within 2 hours:** AI recommendation disabled pending review
3. **Within 24 hours:** Human review by qualified counselor
4. **Within 48 hours:** Corrected recommendation issued if error confirmed
5. **Within 7 days:** Root cause analysis and model update if systematic issue
6. **Communication:** Affected user(s) notified with explanation

### If AI bias detected:
1. **Immediate investigation** by AI Ethics Officer
2. **Bias audit** within 5 business days
3. **Model adjustment** if bias confirmed
4. **User notification** if recommendations may have been affected
5. **Report to regulator** if systematic discrimination occurred

---

## 10. POLICY ENFORCEMENT

### Monitoring:
- Automated content filtering (profanity, hate speech detection)
- Human review of flagged recommendations (daily during beta)
- Monthly AI ethics committee review (Seelan Govender + external advisor)

### Consequences of Violation:

**User violations** (attempting to misuse AI):
- Warning for first minor offense
- Suspension for repeated violations
- Permanent ban for serious violations (hate speech, illegal activities)

**System violations** (AI produces prohibited content):
- Immediate model update
- Feature temporarily disabled
- Root cause analysis
- Public incident report if widespread

---

## 11. POLICY UPDATES

**Version history:**
- **v1.0 (21 Dec 2025):** Initial beta release

**Update frequency:** Quarterly review during beta, annually post-launch

**Stakeholder input:** Policy changes reviewed by student, parent, and teacher advisory panels

**Notification:** Material changes posted on thandi.online/legal with 14-day notice

---

## 12. CONTACT & GOVERNANCE

### AI Ethics Officer:

**Seelan Govender** (interim)  
hello@thandi.online  
0781298701

**Responsibilities:**
- Oversee AI bias audits
- Review flagged content
- Approve major model changes
- Liaise with Information Regulator on AI matters

### Advisory Panel (Planned Q1 2026):
- 2 Student representatives (Grade 11-12)
- 2 Parent representatives
- 2 School counselor representatives
- 1 AI ethics academic
- 1 Disability rights advocate

---

## 13. COMPLIANCE & STANDARDS

We commit to:
- ✅ **POPIA compliance:** All AI processing POPIA-compliant
- ✅ **Ubuntu AI Principles:** African-centered AI ethics framework
- ✅ **UNESCO AI Ethics:** Following UNESCO AI ethics recommendations
- ✅ **South African AI Blueprint:** Aligned with DTIC AI strategy
- ✅ **IEEE Ethically Aligned Design:** Technical standards for AI systems

---

## 14. BETA-SPECIFIC LIMITATIONS

**During beta (Dec 2025 - Feb 2026):**
- AI models have limited training data in some career fields
- Bias testing is ongoing; not all metrics validated
- Human review of recommendations not yet automated
- Model explainability features under development
- Limited language support (primarily English)

**Post-beta improvements:**
- Expanded training data (5x increase)
- Full bias audit completion
- All recommendations human-validated
- Full isiZulu and Afrikaans support
- Enhanced explainability features

---

## 15. ACKNOWLEDGMENT

By using Thandi.ai, you acknowledge:
- AI is a tool, not a crystal ball
- Recommendations contain uncertainty
- Bias may exist despite our mitigation efforts
- Human judgment is essential
- You will verify all critical decisions independently

---

**Document Version:** 1.0 Beta  
**Last Updated:** 21 December 2025  
**Next Review:** 21 March 2026 (post-beta)

**THANDI AI (PTY) LTD**  
170 Innes Road, Morningside, Durban, Kwa-Zulu Natal, 4001  
www.thandi.online | hello@thandi.online | 0781298701

**B-BBEE Level 1 Contributor | 100% Black-Owned | POPIA Reg: 2025-068149**