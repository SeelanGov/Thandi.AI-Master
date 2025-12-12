#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('📊 UPLOADING DATA SCIENTIST CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Data Scientist',
    chunk_type: 'career_overview',
    chunk_text: `# Data Scientist: Your 2026 Career Guide

Data Scientists extract insights from data to drive business decisions—think Netflix recommendations, Uber pricing, retail inventory optimization. In SA, this is the "sexiest job" of 4IR with MASSIVE demand across all sectors. Work: Banks (credit scoring, fraud detection), telecoms (customer churn prediction), retailers (inventory optimization), insurance (risk models), government (SASSA fraud detection).

**Real SA Example:** As a data scientist at Shoprite, you analyze 50M+ transactions weekly to optimize inventory, predict which products will sell in which stores, build pricing models, and create executive dashboards showing R500M+ savings from your recommendations. You work with SQL, Python, Tableau—earning R70K+/month.

# Specializations
- **Business Intelligence:** Dashboards, reports, executive insights
- **Machine Learning:** Predictive models, forecasting
- **Statistical Modeling:** Research, hypothesis testing
- **Data Engineering:** Pipeline building, data infrastructure

## Why It's THE Most Versatile 4IR Career
- INSANE demand: 30,000+ vacancies, 35% YoY growth
- EVERY company needs data scientists
- Better work-life balance than AI engineering
- More accessible entry than AI/ML

# Salary Progression (ZAR, 2025)
- Junior Data Analyst (0-2 years): R25,000-R40,000/month
- Data Scientist (3-5 years): R45,000-R85,000/month
- Senior/Lead (5+ years): R90,000-R150,000/month
- Chief Data Officer: R180,000+/month

**Sector Premium:** Banking pays 20-30% more than retail

**Employers:** Banks (500+ data scientists), telecoms, retailers, insurance, consulting, e-commerce

**Key Difference:** Unlike AI engineers who build production ML systems, data scientists focus on INSIGHTS and storytelling.`,
    tags: ['data scientist', '4ir', 'data analysis', 'business intelligence', 'machine learning', 'statistics', 'sql', 'python', 'tableau']
  },
  {
    career_name: 'Data Scientist',
    chunk_type: 'education',
    chunk_text: `# Data Scientist: Education Path

**Degree Options:** BSc in Computer Science, Statistics, Mathematics, Physics, Actuarial Science, or Engineering (3-4 years)

**THEN:** Honours in Data Science (1 year) or MSc Data Science (1-2 years)—POSTGRADUATE is STANDARD for senior roles

**Universities:** UCT, Wits, UP, Stellenbosch have dedicated Data Science programmes

**Admission:**
- Mathematics 75%+
- Physical Sciences 70% (engineering route) OR NOT NEEDED (stats/math route)
- Statistics is MORE important than programming initially

**Tuition:** R45,000-R75,000/year

**Curriculum:** Statistics, R/Python, SQL, Machine Learning, Data Visualization (Tableau, Power BI)

**Alternative Routes:**
- Data Science Bootcamps: ExploreAI, HyperionDev (6 months, R30,000-R50,000)
- Self-taught: Kaggle Learn, Coursera, build portfolio of 5-7 projects

**Career Progression:** Data Analyst → Data Scientist → Senior/Lead → Chief Data Officer

**Average Timeline:** 5-7 years to senior

**Golden Combination:** Double major in Stats + CS`,
    tags: ['data scientist education', 'statistics', 'computer science', 'honours', 'msc data science', 'bootcamp', 'exploreai', 'kaggle']
  },
  {
    career_name: 'Data Scientist',
    chunk_type: 'salary',
    chunk_text: `# Data Scientist: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Junior Data Analyst (0-2 years): R25,000-R40,000/month
- Data Scientist (3-5 years): R45,000-R85,000/month
- Senior/Lead (5+ years): R90,000-R150,000/month
- Chief Data Officer: R180,000+/month

**REMOTE INTERNATIONAL:** $6,000-$12,000/month (R110,000-R220,000)

**Major Employers:**
- Banks (FNB, Standard Bank, ABSA—500+ data scientists)
- Telecoms (MTN, Vodacom)
- Retailers (Shoprite, Checkers)
- Insurance (Discovery, Sanlam)
- Consulting (McKinsey, BCG)
- E-commerce (Takealot, Superbalist)

**Sector Premiums:**
- Banking pays 20-30% more than retail
- Fintech startups pay equity + salary

**Government:** SARS, SASSA building data teams (R30,000-R60,000 + pension)

**Freelancing:** $50-$150/hour for experienced

**Reality Check:** Junior roles are "data janitor"—80% cleaning data, 20% modeling. Senior roles are strategic.

**Job Outlook:** 30,000+ vacancies, growing as companies digitalize`,
    tags: ['data scientist salary', 'analytics salary', 'banking data science', 'remote work', 'freelancing', 'chief data officer']
  },
  {
    career_name: 'Data Scientist',
    chunk_type: 'requirements',
    chunk_text: `# Data Scientist: Requirements & Skills

**Matric:**
- Mathematics 75%+
- Physical Sciences 70% (engineering route) OR NOT NEEDED (stats route)

**STATISTICS is KING:** Must love working with numbers, distributions, hypothesis testing

**Essential Skills:**
- R or Python (Python preferred)
- SQL (database querying)—LEARN THIS FIRST
- Statistics (regression, hypothesis testing)
- Machine Learning (scikit-learn)
- Data Visualization (Tableau, Power BI, matplotlib)
- Communication (presenting to non-technical executives)

**Portfolio:** Kaggle competitions, 5-7 projects showing data cleaning → modeling → insight

**Mindset:**
- Comfortable with AMBIGUITY—data is messy, questions are vague
- Patience: 60-80% time is data cleaning
- Business acumen: Understanding WHY you're analyzing data

**Physical:** None—office/computer work

**Work-Life Balance:** BEST in tech—40-45 hrs/week, remote-friendly

**Gender:** Male-dominated but improving—Women in Data Science SA active

**Critical:** SQL mastery, Excel mastery assumed, POPIA compliance for personal data

**Continuous Learning:** New ML algorithms weekly`,
    tags: ['data scientist requirements', 'mathematics 75%', 'statistics', 'sql', 'python', 'tableau', 'excel', 'kaggle']
  },
  {
    career_name: 'Data Scientist',
    chunk_type: 'bursaries',
    chunk_text: `# Data Scientist: Bursaries & Accessible Entry

**Data Science bursaries—GROWING:**

**1. Bank IT Bursaries:**
- FNB, Standard Bank, ABSA cover CS/Stats Hons/MSc
- 200+ awards, deadline July
- GUARANTEED data analyst graduate programme

**2. Insurance Bursaries:**
- Discovery, Sanlam, Old Mutual
- Actuarial/data science focus, 100+ awards

**3. Telkom/MTN Bursary:** Telecoms data science

**4. CSIR Hons/MSc:** R80,000/year for stats/CS Honours

**5. Nedbank Data Science Challenge:** Competition with bursary prizes

**FUNDING REALITY:**
- NSFAS (undergrad Stats/CS)
- Postgraduate loans (Nedbank, Fundi)
- Employer sponsorship (work 2 years, company funds MSc)

**ALTERNATIVE PATH:**
BSc Stats/CS (NSFAS) → Honours (loan) → Junior Data Analyst (R25K-R35K) → employer funds MSc → Data Scientist (R50K+)

**Total Investment:** R100,000-R150,000
**ROI:** 18-24 months

**Bootcamp Options:**
- Microsoft Data Science Learning Path (free)
- IBM Data Science Professional Certificate ($39/month)

**Quick Entry:** SQL + Excel + Tableau (free) can get you R20,000-R30,000 data analyst job in 6 months. Build portfolio on Tableau Public.`,
    tags: ['data scientist bursaries', 'bank it bursaries', 'insurance bursaries', 'csir', 'nsfas', 'bootcamp', 'tableau public']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', '4ir_emerging_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating 4IR emerging careers module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: '4ir_emerging_careers',
          description: '4IR and emerging technology careers',
          priority: 1
        })
        .select()
        .single()
      module = newModule
    }
    
    console.log(`✓ Module: ${module.module_name}\n`)
    
    let count = 0
    for (const chunk of chunks) {
      console.log(`Inserting: ${chunk.career_name} - ${chunk.chunk_type}`)
      
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert({
          module_id: module.id,
          chunk_text: chunk.chunk_text,
          chunk_metadata: {
            career_name: chunk.career_name,
            chunk_type: chunk.chunk_type,
            category: '4ir_emerging',
            tags: chunk.tags,
            sprint: 'Week 2 Day 4 - 4IR Emerging',
            source: `4ir_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ Data Scientist: ${count}/5 chunks uploaded`)
    
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total: ${total} chunks\n`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

uploadBatch()
