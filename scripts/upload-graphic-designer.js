#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🎨 UPLOADING GRAPHIC DESIGNER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Graphic Designer',
    chunk_type: 'career_overview',
    chunk_text: `# Graphic Designer: Your 2026 Career Guide (Portfolio > Qualifications)

Graphic Designers create visual content—logos, ads, social media graphics, packaging. In SA's digital economy, this is HIGH DEMAND—every business needs design. Work: Design agencies (Grid Worldwide, Joe Public), in-house (banks, retailers), freelance (Upwork, Fiverr), startups.

**Real SA Example:** As a graphic designer at Woolworths, you design packaging for 100+ products, create social media campaigns reaching 2M+ followers, develop brand guidelines, and collaborate with marketing teams. You work with Adobe Creative Suite—earning R25K+/month.

# Specializations
- **Brand Identity:** Logos, corporate identity systems
- **Digital Design:** Social media, web graphics
- **Packaging:** Product packaging, labels
- **Publication Design:** Magazines, books, brochures
- **UI/UX Design:** App interfaces, websites

## Why It's High Demand
- 20,000+ jobs on PNET, LinkedIn
- Remote work: 60% of SA designers work internationally
- Earning $30-$100/hour (R550-R1,800/hour)
- Every business needs visual content

# Salary Progression (ZAR, 2025)
- Junior Designer (0-2 years): R12,000-R20,000/month
- Mid-level Designer (3-5 years): R20,000-R35,000/month
- Senior Designer (5+ years): R35,000-R50,000/month
- Art Director: R50,000-R70,000+/month
- Creative Director: R70,000-R120,000+/month

**Freelance:** $30-$100/hour international clients

**Employers:** Grid Worldwide, Joe Public, banks, retailers, startups

**Key Advantage:** PORTFOLIO > qualifications—strong portfolio can override lack of degree

**Key Difference:** Unlike fine artists who create for expression, designers solve BUSINESS problems visually.`,
    tags: ['graphic designer', 'creative arts', 'adobe creative suite', 'brand identity', 'digital design', 'freelance', 'portfolio', 'remote work']
  },
  {
    career_name: 'Graphic Designer',
    chunk_type: 'education',
    chunk_text: `# Graphic Designer: Education Path (Multiple Routes)

**Multiple pathways available:**

**1. University Degree:**
- BA Graphic Design (3 years) or BTech Graphic Design (4 years)
- Universities: Wits, UP, UJ, DUT, CPUT
- Admission: No specific subject requirements (English 50%+ typical)
- Tuition: R40,000-R60,000/year
- Advantage: Structured learning, industry connections

**2. Private Design Schools:**
- Vega School, Red & Yellow, AAA School of Advertising (2-3 years)
- Cost: R60,000-R100,000/year
- Advantage: Industry-focused, portfolio building

**3. Diploma Route:**
- National Diploma Graphic Design (3 years) at DUT, TUT, CPUT
- NSFAS-covered
- Advantage: Affordable, practical focus

**4. Self-Taught:**
- Online courses: Skillshare, Udemy, YouTube (FREE to R500/month)
- Build portfolio with personal/volunteer projects
- Timeline: 6-12 months to job-ready
- Advantage: Lowest cost, flexible

**Essential Skills:**
- Adobe Creative Suite (Photoshop, Illustrator, InDesign)
- Typography, color theory, layout
- Communication, client management

**Portfolio Building:** 8-12 diverse projects showing range

**Reality:** Employers hire based on PORTFOLIO first, qualifications second`,
    tags: ['graphic design education', 'ba graphic design', 'vega school', 'red yellow', 'self taught', 'adobe creative suite', 'portfolio', 'nsfas']
  },
  {
    career_name: 'Graphic Designer',
    chunk_type: 'salary',
    chunk_text: `# Graphic Designer: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Junior Designer (0-2 years): R12,000-R20,000/month
- Mid-level Designer (3-5 years): R20,000-R35,000/month
- Senior Designer (5+ years): R35,000-R50,000/month
- Art Director: R50,000-R70,000+/month
- Creative Director: R70,000-R120,000+/month

**Freelance Rates:**
- Local: R300-R800/hour
- International: $30-$100/hour (R550-R1,800/hour)

**Major Employers:**
- Design agencies (Grid Worldwide, Joe Public, Ogilvy)
- In-house (banks, retailers, corporates)
- Startups (tech companies, e-commerce)
- Media companies (magazines, publishers)

**Remote Work:** 60% of SA designers work for international clients

**Specialization Premiums:**
- UI/UX designers: 30-50% higher
- Motion graphics: 20-30% higher
- Brand strategists: 40-60% higher

**Job Outlook:** STRONG—20,000+ active positions

**Reality Check:**
- Entry-level competitive (many graduates)
- Portfolio quality determines opportunities
- Freelance income variable (feast or famine)
- Client revisions can be frustrating

**Growth Path:** Junior → Senior → Art Director → Creative Director`,
    tags: ['graphic designer salary', 'freelance rates', 'design agencies', 'remote work', 'art director', 'creative director']
  },
  {
    career_name: 'Graphic Designer',
    chunk_type: 'requirements',
    chunk_text: `# Graphic Designer: Requirements & Skills

**Matric:** No specific subjects required (English 50%+ helpful)

**Essential Skills:**
- Adobe Creative Suite (Photoshop, Illustrator, InDesign)—MANDATORY
- Typography and layout principles
- Color theory
- Visual communication
- Client communication

**Personality Traits:**
- Creative problem-solver
- Detail-oriented
- Handles criticism well (client feedback)
- Deadline-driven
- Collaborative

**Portfolio:** 8-12 diverse projects showing:
- Logo design
- Print materials
- Digital/social media
- Packaging or publication work

**Physical:** None—office/computer work

**Work-Life Balance:** Generally good (40-45 hrs/week), crunch during deadlines

**Software Costs:**
- Adobe Creative Cloud: R700/month (student discount R350/month)
- Alternative: Affinity Suite (one-time R1,500), Canva Pro (R150/month)

**Equipment:** Decent computer (R15,000+), graphics tablet optional (R2,000+)

**Gender:** Balanced field, women well-represented

**Continuous Learning:** Design trends change—must stay current

**Pro Tip:** Build portfolio while studying—volunteer for NGOs, small businesses`,
    tags: ['graphic design requirements', 'adobe creative suite', 'portfolio', 'typography', 'no matric subjects', 'creative problem solving']
  },
  {
    career_name: 'Graphic Designer',
    chunk_type: 'bursaries',
    chunk_text: `# Graphic Designer: Bursaries & Funding (Limited but Available)

**Design bursaries—LIMITED:**

**1. NSFAS:**
- Covers Graphic Design diplomas/degrees at public universities
- DUT, TUT, CPUT, UJ all offer NSFAS-covered design programmes

**2. University Merit Bursaries:**
- Wits, UP, UJ offer merit bursaries for design students
- R10,000-R30,000/year for 70%+ average

**3. Private School Scholarships:**
- Vega School: Limited merit scholarships (10-20% tuition)
- Red & Yellow: Occasional bursaries (check website)

**4. Corporate Bursaries:**
- Rare—some advertising agencies offer internship-to-bursary programmes

**FUNDING REALITY:**
Most design students rely on:
- NSFAS (public institutions)
- Private loans (Fundi, Nedbank at prime +2%)
- Part-time work while studying

**Alternative Path:**
Self-taught (FREE online courses) → build portfolio → freelance (R5,000-R15,000/month) → save for formal education if desired

**Equipment Funding:**
- Adobe Creative Cloud student discount: R350/month (50% off)
- Free alternatives: GIMP, Inkscape, Canva (learn basics)

**Pro Tip:** Start freelancing in Grade 12—design for local businesses, build portfolio AND earn money

**Total Investment (Self-Taught):** R0-R10,000 (software + courses)
**ROI:** 6-12 months to first paid projects`,
    tags: ['graphic design bursaries', 'nsfas', 'vega school', 'self taught', 'freelance', 'adobe student discount', 'alternative funding']
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
      const { data: newModule, error: insertError } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'creative_arts_careers',
          description: 'Creative arts and design careers',
          priority: 1
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Module creation error:', insertError);
        // Try to fetch again in case it was created by another process
        const { data: refetch } = await supabase
          .from('knowledge_modules')
          .select('*')
          .eq('module_name',
    
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
    
    console.log(`\n✅ Graphic Designer: ${count}/5 chunks uploaded`)
    
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
