#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('💻 UPLOADING UX/UI DESIGNER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'UX/UI Designer',
    chunk_type: 'career_overview',
    chunk_text: `# UX/UI Designer: Your 2026 Career Guide (THE HOTTEST Creative Career)

UX/UI Designers create digital experiences—app interfaces, website design, user research. UX (User Experience) focuses on research, psychology, and making apps EASY to use. UI (User Interface) focuses on visual design, colors, fonts, and making apps BEAUTIFUL. In SA's tech boom, this is THE HOTTEST creative career—every app needs UX/UI.

**Real SA Example:** As a UX/UI designer at Yoco, you research how small business owners use payment systems, design intuitive card reader interfaces, create prototypes in Figma, conduct usability tests with 50+ merchants, and collaborate with developers. You work remotely 3 days/week—earning R45K+/month.

# What's the Difference?
- **UX (User Experience):** Research, psychology, making apps EASY to use
- **UI (User Interface):** Visual design, colors, fonts, making apps BEAUTIFUL

# Specializations
- User Research
- Interaction Design
- Visual/UI Design
- Product Design
- Design Systems

## Why It's THE Hottest Creative Career
- EXPLOSIVE demand: 5,000+ vacancies, 40% YoY growth
- Salary premium: 30-50% more than graphic designers
- Remote work: 70% work for US/EU clients
- Earning $40-$120/hour (R730-R2,200/hour)
- NO coding required (but helps)

# Salary Progression (ZAR, 2025)
- Junior (0-1 year): R15,000-R25,000/month
- Mid-level (2-4 years): R30,000-R55,000/month
- Senior (5+ years): R60,000-R90,000/month
- Lead/Head of Design: R100,000-R150,000/month

**International Remote:** $40-$120/hour

**Employers:** Banks (FNB, Standard Bank—UX teams 50+), fintech (Yoco, Luno, JUMO), e-commerce (Takealot, Superbalist)

**Key Advantage:** HIGH job satisfaction—see real users benefit from your designs

**Key Difference:** Unlike graphic designers who create static visuals, UX/UI is about INTERACTION and user psychology.`,
    tags: ['ux ui designer', 'creative arts', 'user experience', 'user interface', 'figma', 'product design', 'remote work', 'fintech']
  },
  {
    career_name: 'UX/UI Designer',
    chunk_type: 'education',
    chunk_text: `# UX/UI Designer: Education Path (Multiple Routes, Portfolio is Key)

**Multiple pathways available:**

**1. University:**
- BSc Computer Science (3 years) OR BA Design (3 years) OR BCom Marketing (3 years) with UX modules
- Top programmes: UCT HCI (Human-Computer Interaction), Wits Digital Arts, UP Information Design, Stellenbosch Visual Arts
- Admission: Mathematics 60%+ (CS route) OR NO MATHS required (design route)—opens doors for arts students!

**2. UX Bootcamps:**
- ExploreAI (6 months, R30,000)
- Academy Xi (online, R25,000)
- Udacity UX Nanodegree ($400)
- Employers HIRE bootcamp grads with strong portfolios

**3. Self-Taught:**
- FREE resources: Google UX Design Certificate (Coursera, $39/month), Figma tutorials (free), Nielsen Norman Group articles
- YouTube: AJ&Smart, Femke
- Timeline: 6-12 months self-study → junior role

**4. Diploma:**
- National Diploma in Graphic Design at DUT, CPUT, TUT → UX modules
- NSFAS-covered

**KEY DIFFERENCE:** PORTFOLIO is everything—3-5 case studies showing design process (research → wireframes → testing) beats any degree

**Internships:** CRITICAL—apply to bank UX teams (FNB, Standard Bank), Takealot, Yoco for vacation work

**Reality:** Many SA UX designers transitioned from graphic design (self-taught Figma)

**Average Timeline:** 6-12 months focused study → Junior UX Designer (R15,000-R25,000)`,
    tags: ['ux ui education', 'google ux certificate', 'figma', 'bootcamp', 'self taught', 'portfolio', 'case studies', 'no maths required']
  },
  {
    career_name: 'UX/UI Designer',
    chunk_type: 'salary',
    chunk_text: `# UX/UI Designer: Salary & Job Outlook (PREMIUM for Creative Field)

**Salaries (ZAR, 2025):**
- Junior (0-1 year): R15,000-R25,000/month
- Mid-level (2-4 years): R30,000-R55,000/month
- Senior (5+ years): R60,000-R90,000/month
- Lead/Head of Design: R100,000-R150,000/month

**International Remote:**
- Mid-level: $40-$80/hour (R730-R1,460/hour)
- Senior: $80-$120/hour (R1,460-R2,200/hour)
- Tax-free under R1.2M

**Major Employers:**
- Banks (FNB, Standard Bank—UX teams 50+)
- Fintech (Yoco, Luno, JUMO)
- E-commerce (Takealot, Superbalist)
- Telecoms (MTN, Vodacom)
- Consulting (Deloitte Digital, BCG)
- Startups

**Sector Premium:** Fintech pays 20-30% more than agencies

**Freelancing:** Upwork, Toptal, Fiverr—SA designers building international client bases

**Reality Check:**
- Junior roles: 50% UI design, 30% research, 20% wireframing
- Senior roles: Strategic—user research, stakeholder management, design systems

**Growth Path:** Transition to Product Manager is common (15-20% salary bump)

**Contracting:** Daily rates R1,500-R3,500 for experienced—higher than permanent

**Job Outlook:** 5,000+ vacancies, growing as companies digitize`,
    tags: ['ux ui salary', 'remote work', 'fintech salary', 'product designer', 'freelance rates', 'international clients']
  },
  {
    career_name: 'UX/UI Designer',
    chunk_type: 'requirements',
    chunk_text: `# UX/UI Designer: Requirements & Skills (Uniquely Accessible!)

**Matric:** Mathematics 60%+ (CS route) OR NO MATHS required (design route)—uniquely accessible!
**English 60%+** for user research

**Key Personality Traits:**
- Empathy (understand users)
- Curiosity (ask why)
- Communication (sell designs to stakeholders)
- Resilience (iterate based on feedback)

**Technical Skills:**
- **Figma** (ESSENTIAL—industry standard)
- User research (interviews, surveys)
- Wireframing
- Prototyping
- Usability testing
- Design systems

**UI Skills:**
- Color theory
- Typography
- Layout
- Visual hierarchy

**NO CODING REQUIRED** but understanding HTML/CSS helps collaboration with developers

**Portfolio:** 3-5 case studies showing FULL process—problem, research, wireframes, testing, final UI

**Soft Skills:**
- Presenting designs
- Handling criticism
- Facilitating workshops

**Physical:** None—office/computer work

**Work-Life Balance:** BEST in tech—40-45 hrs/week, remote-friendly

**Gender:** Female-friendly—many women in UX, supportive community (Ladies That UX SA)

**Learning Resources:**
- Figma Community (free templates)
- Nielsen Norman Group (free articles)
- Google UX Design Certificate ($39/month)

**Network:** SA UX communities—UX South Africa conference, local meetups (Joburg, Cape Town, Durban)

**Pro Tip:** Volunteer UX for NGO (Siyavula, homeless shelters)—builds portfolio, helps community`,
    tags: ['ux ui requirements', 'figma', 'no maths required', 'empathy', 'user research', 'portfolio', 'case studies', 'female friendly']
  },
  {
    career_name: 'UX/UI Designer',
    chunk_type: 'bursaries',
    chunk_text: `# UX/UI Designer: Bursaries & Alternative Paths (Low-Cost Entry)

**UX/UI bursaries—LIMITED but alternative funding exists:**

**1. Bank IT Bursaries:**
- FNB, Standard Bank, ABSA fund Computer Science degrees
- If you study CS, you can transition to UX
- 2,000+ awards, deadline July

**2. ISFAP (Ikusasa):**
- Covers CS, Design, Market Research for missing middle (R350k-R600k income)

**3. NSFAS:**
- Covers BSc Computer Science, BA Design at all public universities

**4. Design-Specific Bursaries:**
- Rare, but some agencies offer small bursaries (R10,000-R30,000)
- Check with Design Education Forum SA (DEFSA)

**FUNDING REALITY:**
Most UX designers are self-funded—BUT cost is LOW:
- Google UX Certificate: $39/month × 6 = $234 ≈ R4,300 total
- Figma: FREE for students

**Bootcamp Funding:**
- Some bootcamps offer income-share agreements—pay when employed (e.g., ExploreAI)

**Employer-Sponsored:**
- Banks and fintechs sponsor senior designers to do Master's in HCI (R80,000-R100,000)
- Work 2 years, they fund it

**SELF-TAUGHT PATH:**
FREE resources → build portfolio → junior role (R15,000-R25,000) → employer funds upskilling

**Total Investment:** R0-R5,000

**Pro Tip:** Apply for bank CS bursary, study CS, but do UX projects on side—graduate with CS degree + UX portfolio = UNSTOPPABLE combo. Companies LOVE designers who understand code.`,
    tags: ['ux ui bursaries', 'bank it bursaries', 'isfap', 'nsfas', 'google ux certificate', 'self taught', 'low cost', 'income share']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'creative_arts_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating creative arts careers module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'creative_arts_careers',
          description: 'Creative arts and design careers',
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
            category: 'creative_arts',
            tags: chunk.tags,
            sprint: 'Week 3 - Creative Arts',
            source: `creative_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ UX/UI Designer: ${count}/5 chunks uploaded`)
    
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
