#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('💻 UPLOADING SOFTWARE ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Software Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Software Engineer: Your 2026 Career Guide (4IR Focus)

Software Engineers design and build applications, systems, and platforms. In SA's 4IR context, this is THE HIGHEST GROWTH career—everything is becoming digital. Work: Tech companies (Google, Amazon, Microsoft SA offices), banks (FNB, Standard Bank, ABSA have massive dev teams), fintech (Yoco, Luno, JUMO), e-commerce (Takealot, Superbalist), consulting (BCG, Deloitte Digital), startups.

**Real SA Example:** As a software engineer at FNB's innovation hub in Johannesburg, you build mobile banking features used by 10M+ customers, work with AI/ML for fraud detection, deploy microservices on AWS, and participate in agile sprints. You code in Java, Python, React—earning while working remotely 3 days/week.

# Specializations
- **Web Development:** Frontend (React, Vue), Backend (Node.js, Python)
- **Mobile Apps:** iOS, Android, React Native
- **Data Engineering:** Big data pipelines, analytics
- **AI/ML Engineering:** Machine learning models, AI systems
- **Cybersecurity:** Security systems, ethical hacking
- **DevOps:** Cloud infrastructure, automation

## Why It's THE Career
- 40,000+ vacancies on LinkedIn, PNET
- Remote work: 60% work fully remote for international companies earning USD/EUR
- NO PE registration needed—PORTFOLIO is your credential
- MOST FLEXIBLE engineering career

# Salary Progression (ZAR, 2025)
- Junior (0-2 years, local): R25,000-R40,000/month
- Mid-level (3-5 years): R50,000-R90,000/month
- Senior (5+ years, local): R90,000-R150,000/month
- **INTERNATIONAL REMOTE:** Junior $3,000-$5,000/month (R55K-R90K), Mid $6,000-$10,000 (R110K-R180K), Senior $12,000-$20,000+ (R220K-R360K)

**Tax Advantage:** Foreign income under R1.2M/year TAX-FREE!

**Employers:** Banks, fintech, tech giants, consulting, startups

**Key Difference:** Unlike traditional engineers who need PE, software engineers need PORTFOLIOS and CERTIFICATIONS (AWS, Azure).`,
    tags: ['software engineer', 'engineering', '4ir', 'remote work', 'web development', 'mobile apps', 'ai ml', 'cybersecurity', 'devops', 'fintech', 'mathematics', 'no physics required']
  },
  {
    career_name: 'Software Engineer',
    chunk_type: 'education',
    chunk_text: `# Software Engineer: Education Path (MULTIPLE ROUTES!)

Unlike traditional engineering, software has MULTIPLE pathways:

**1. University Route:**
- BSc Computer Science (3 years) or BEng Software Engineering (4 years)
- Universities: Wits, UP, UCT, Stellenbosch, UKZN
- Admission: Mathematics 70%+, NO Physical Sciences required (!)—opens doors for students strong in maths but weaker in physics
- English 60%+
- Tuition: R45,000-R75,000/year
- Curriculum: Programming, Algorithms, Data Structures, Databases, Software Design

**2. Coding Bootcamps:**
- HyperionDev, Umuzi, CodeSpace (3-6 months intensive)
- Cost: R30,000-R60,000
- Employers NOW HIRE bootcamp grads with strong portfolios
- Focus: JavaScript, React, Node.js—job-ready skills

**3. Self-Taught Route:**
- FreeCodeCamp, Codecademy, YouTube—FREE
- Build GitHub portfolio with 3-4 projects
- Can land junior roles in 6-12 months
- Average starting: R25,000-R40,000

**4. TVET Colleges:**
- National Diploma in IT (3 years) at DUT, TUT for technician route

**KEY DIFFERENCE:** Software values PORTFOLIO over degree—GitHub with 3-4 projects more important than marks for many employers

**International Certifications:** AWS Certified Developer, Microsoft Azure certs boost salary by 20-30%`,
    tags: ['software engineering education', 'computer science', 'coding bootcamp', 'self taught', 'hyperiondev', 'umuzi', 'mathematics 70%', 'no physics required', 'github portfolio']
  },
  {
    career_name: 'Software Engineer',
    chunk_type: 'salary',
    chunk_text: `# Software Engineer: Salary & Job Outlook (HIGHEST IN ENGINEERING!)

**Local Salaries (ZAR, 2025):**
- Junior (0-2 years): R25,000-R40,000/month
- Mid-level (3-5 years): R50,000-R90,000/month
- Senior (5+ years): R90,000-R150,000/month

**INTERNATIONAL REMOTE (GAME CHANGER):**
- Junior: $3,000-$5,000/month (R55,000-R90,000)
- Mid: $6,000-$10,000/month (R110,000-R180,000)
- Senior: $12,000-$20,000+/month (R220,000-R360,000)
- **TAX-FREE on foreign income under R1.2M/year!**

**Specialization Premiums:**
- AI/ML engineers: 30-50% premium
- Cybersecurity specialists: R70,000-R200,000
- DevOps engineers: R60,000-R180,000

**Major Employers:**
- Banks (FNB, Standard Bank, ABSA—massive dev teams)
- Fintech (Yoco, Luno, JUMO)
- Tech giants (Amazon AWS Cape Town, Google Jhb)
- Consulting (BCG Gamma, Deloitte Digital)
- Startups

**Freelancing:** Upwork, Toptal—global rates while living in SA (low cost of living advantage)

**Job Outlook:** INSANE—40,000+ vacancies, growing at 25%/year

**KEY ADVANTAGE:** Can earn USD/EUR while living in SA. Remote work standard.`,
    tags: ['software engineer salary', 'engineering salary', 'remote work', 'usd salary', 'tax free', 'fintech', 'ai ml salary', 'cybersecurity salary', 'devops salary']
  },
  {
    career_name: 'Software Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Software Engineer: Requirements & Skills (NO PHYSICS!)

**Matric:** Mathematics 70%+ (ESSENTIAL—programming is applied mathematics)
**PHYSICAL SCIENCES NOT REQUIRED**—this is the ONLY engineering where pure maths students can excel
**English 60%+** for documentation

**But:** You must LOVE problem-solving and logical thinking

**Essential Skills:**
- Programming languages (Python, JavaScript, Java)
- Data structures, algorithms
- Databases (SQL)
- Version control (Git)
- Cloud platforms (AWS, Azure)

**Soft Skills:**
- Teamwork (agile methodology)
- Communication
- Continuous learning (tech changes every 2-3 years)

**Physical:** None—office/computer work

**Work-Life Balance:** BEST among engineers—remote work, flexible hours, 40-45 hrs/week typical

**Personality:** Logical, patient debugger, enjoys continuous learning

**Gender:** Male-dominated but diversity initiatives strong—women in tech programmes at all major employers

**No Professional Registration:** PORTFOLIO is your credential

**Portfolio Building:** Build 3-4 GitHub projects (mobile app, website, data analysis) to land first job

**Foreign Qualifications:** No ECSA evaluation needed—skills-based hiring`,
    tags: ['software engineering requirements', 'mathematics 70%', 'physical sciences not required', 'programming', 'github portfolio', 'remote work', 'no pe registration']
  },
  {
    career_name: 'Software Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Software Engineer: Funding & Alternative Pathways

**Software engineering funding—DIFFERENT from other engineering:**

Traditional bursaries (Eskom, SASOL) ONLY for BEng Software, NOT for Computer Science or bootcamps.

**BUT:**

**1. Bank IT Bursaries:**
- FNB, Standard Bank, ABSA offer full-cost bursaries for Computer Science/Software
- 300+ awards
- Deadline: July-August
- GUARANTEED graduate programme employment

**2. Tech Company Bursaries:**
- Amazon Future Engineer (new in SA, 50 awards)
- Google Student Scholarships (merit-based)
- Microsoft Imagine Cup (competition prizes)

**3. ISFAP (Ikusasa Student Financial Aid Programme):**
- Covers IT degrees for missing middle (R350k-R600k household income)

**4. NSFAS:**
- Covers CS at all universities

**5. Bootcamp Financing:**
- HyperionDev, Umuzi offer income-share agreements—pay when employed

**ALTERNATIVE PATH (MOST ACCESSIBLE):**
- Self-taught (FREE) → junior dev job → company pays for certifications
- This is the MOST ACCESSIBLE high-paying career—NO expensive degree required
- Build portfolio, get hired
- Average time: 6-12 months self-study to junior role earning R25,000-R40,000

**University Merit:** All universities offer Dean's bursaries for 75%+ average

**Private Loans:** Fundi, Nedbank at prime +1%`,
    tags: ['software engineering bursaries', 'bank it bursaries', 'fnb bursary', 'amazon future engineer', 'isfap', 'nsfas', 'bootcamp financing', 'self taught', 'alternative pathway']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'engineering_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating engineering module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'engineering_careers',
          description: 'Engineering careers',
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
            category: 'engineering',
            tags: chunk.tags,
            sprint: 'Week 2 - Engineering',
            source: `engineering_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ Software Engineer: ${count}/5 chunks uploaded`)
    
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
