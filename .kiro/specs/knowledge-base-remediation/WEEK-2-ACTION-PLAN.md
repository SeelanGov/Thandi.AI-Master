# Week 2 Action Plan: Knowledge Gaps + Sustainable System

**Date:** November 12, 2025  
**Status:** 🚀 Active (Concurrent with Frontend Development)  
**Goal:** Fill critical gaps while building sustainable update foundation

---

## 🎯 This Week's Priorities

### Day 1-2 (Today-Tomorrow): Sprint 2.1 - 4IR Careers
**Target:** Q16-Q18 from 0% → 60% pass rate

**Immediate Actions:**
1. ✅ **Complete Cybersecurity Content** (Already started)
   - 3 comprehensive chunks created
   - Covers career overview, education, financial reality
   
2. **Add Cloud Engineer Content** (4 hours)
   - Career overview: AWS, Azure, Google Cloud roles
   - Education: Computer Science, IT degrees, certifications
   - Salary: R40K-R70K, high demand in digital transformation

3. **Add Data Scientist/AI Engineer Content** (4 hours)
   - Career overview: Machine learning, analytics, AI development
   - Education: Statistics, Computer Science, Math requirements
   - Salary: R30K-R55K, growing across all sectors

**Scripts to Run:**
```bash
# Create and embed new content
node scripts/create-4ir-content.js
node scripts/generate-embeddings.js
node scripts/test-q16-q18-improvements.js
```

### Day 3-4: Sprint 2.2 - Financial Alternatives
**Target:** Q6, Q10 from 20% → 50% pass rate

**Content to Create:**
1. **TVET Colleges Comprehensive Guide**
   - All SA TVET colleges, programs, costs
   - Learnerships and apprenticeships
   - Industry partnerships and job placement

2. **Part-Time Study Structures**
   - Evening classes, weekend programs
   - Distance learning options
   - Work-study balance strategies

3. **Alternative Funding Sources**
   - Corporate bursaries beyond NSFAS
   - SETA funding and skills development
   - Study loans and payment plans

### Day 5: Foundation System Setup
**Target:** Begin sustainable update system

**Technical Setup:**
1. **Automated Salary Feeds** (Basic version)
   - PayScale scraper for SA salary data
   - Quarterly update schedule
   - Database integration

2. **Gap Detection Algorithm** (MVP)
   - Analyze failing test questions
   - Extract missing keywords
   - Generate content priority list

3. **Expert Review Workflow** (Basic)
   - Simple review portal
   - Email notifications for new content
   - Approval/feedback system

---

## 📋 Detailed Implementation Plan

### Sprint 2.1: 4IR Careers (Today-Tomorrow)

**Cloud Engineer Content Structure:**
```markdown
## CHUNK 4: Cloud Engineer - Career Overview
- Role: Design and manage cloud infrastructure (AWS, Azure, Google Cloud)
- Daily tasks: Server management, security, cost optimization
- SA demand: Digital transformation driving 40% growth
- Career path: Junior → Senior → Cloud Architect → CTO

## CHUNK 5: Cloud Engineer - Skills & Education  
- Required: Math 60%+, Computer Science/IT degree
- Certifications: AWS Solutions Architect, Azure Administrator
- Universities: UCT, Wits, UP offering cloud specializations
- Skills: Linux, networking, automation, security

## CHUNK 6: Cloud Engineer - Financial Reality
- Entry: R40K-R50K, Mid: R60K-R80K, Senior: R90K-R120K
- High demand: Banking, retail, government migration to cloud
- Remote work: 80% of positions offer remote/hybrid
- Job security: Critical infrastructure, recession-proof
```

**Data Scientist Content Structure:**
```markdown
## CHUNK 7: Data Scientist - Career Overview
- Role: Extract insights from data, build predictive models
- Daily tasks: Data analysis, machine learning, business reporting
- SA demand: All sectors adopting data-driven decisions
- Career path: Analyst → Scientist → Senior → Chief Data Officer

## CHUNK 8: Data Scientist - Skills & Education
- Required: Math 70%+, Statistics/Computer Science degree
- Programming: Python, R, SQL, machine learning libraries
- Universities: UCT Statistics, Wits Data Science, UP Analytics
- Certifications: Google Data Analytics, Microsoft Azure Data

## CHUNK 9: Data Scientist - Financial Reality  
- Entry: R30K-R45K, Mid: R50K-R70K, Senior: R80K-R120K
- Sectors: Banking (highest pay), retail, healthcare, government
- Freelance: R800-R1,500/hour for specialized projects
- Growth: 35% annual increase in data science hiring
```

### Sprint 2.2: Financial Alternatives (Day 3-4)

**TVET Colleges Guide:**
- All 50 SA TVET colleges with programs and costs
- Learnerships in high-demand fields (IT, engineering, healthcare)
- Success stories and job placement rates
- Application processes and deadlines

**Part-Time Study Options:**
- University evening programs (UCT, Wits, UP, UJ)
- Distance learning (Unisa, private colleges)
- Work-study balance strategies
- Employer study support programs

**Alternative Funding:**
- Corporate bursaries (Sasol, Anglo American, MTN, Vodacom)
- SETA funding by industry sector
- Study loan options and repayment terms
- Crowdfunding and community support

### Foundation System (Day 5)

**Salary Data Automation:**
```javascript
// Basic salary scraper
async function updateSalaryData() {
  const careers = ['cybersecurity_engineer', 'cloud_engineer', 'data_scientist'];
  
  for (const career of careers) {
    const salaryData = await scrapeSalaryData(career);
    await updateCareerSalary(career, salaryData);
    console.log(`Updated ${career}: ${salaryData.entry_min}-${salaryData.entry_max}`);
  }
}
```

**Gap Detection MVP:**
```javascript
// Identify content gaps from test failures
async function detectGaps() {
  const failingQuestions = await getQuestionsBelow60Percent();
  const missingKeywords = extractMissingKeywords(failingQuestions);
  
  return prioritizeContentNeeds(missingKeywords);
}
```

---

## 🎯 Success Metrics for Week 2

### Content Quality Targets
- **Q16-Q18 Pass Rate:** 0% → 60% (4IR careers)
- **Q6, Q10 Pass Rate:** 20% → 50% (Financial alternatives)
- **Overall Pass Rate:** 40% → 55% (maintain existing + new content)

### System Foundation Targets
- **Automated Salary Updates:** Basic scraper operational
- **Gap Detection:** MVP algorithm identifying content needs
- **Expert Review:** Simple workflow for content validation

### Integration Targets
- **New Content Embedded:** All new chunks in vector database
- **Test Suite Updated:** Validate improvements on target questions
- **Frontend Ready:** Content available for student UI integration

---

## 🚀 Execution Commands

### Today (Day 1):
```bash
# Complete cybersecurity content
node scripts/create-4ir-content.js

# Add cloud engineer and data scientist content
# (Extend the content spec and script)

# Generate embeddings for new content
node scripts/generate-embeddings.js

# Test improvements
node scripts/test-q16-q18-improvements.js
```

### Tomorrow (Day 2):
```bash
# Verify Q16-Q18 improvements
node scripts/test-rag-suite.js --questions Q16,Q17,Q18

# Start financial alternatives content
mkdir thandi_knowledge_base/financial_alternatives_framework
```

### Day 3-4:
```bash
# Create financial content
node scripts/create-financial-content.js
node scripts/generate-embeddings.js
node scripts/test-q6-q10-improvements.js
```

### Day 5:
```bash
# Set up automation foundation
node scripts/setup-salary-automation.js
node scripts/setup-gap-detection.js
node scripts/setup-expert-review.js
```

---

## 🎉 Expected Outcomes

### By End of Week 2:
- **4IR Careers:** Comprehensive content for cybersecurity, cloud, data science
- **Financial Alternatives:** TVET, part-time, alternative funding guides
- **Test Improvements:** 55%+ overall pass rate (up from 40%)
- **System Foundation:** Basic automation and gap detection operational

### Ready for Week 3:
- **Alpha Testing:** Students get helpful responses on previously failing questions
- **Content Pipeline:** Sustainable system for ongoing updates
- **Expert Network:** Basic validation workflow operational

**This positions Thandi for successful pilot launch with both immediate content improvements and long-term sustainability.**