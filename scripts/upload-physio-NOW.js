#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🏥 UPLOADING PHYSIOTHERAPY CONTENT...\n')

const physiotherapyChunks = [
  {
    career_name: 'Physiotherapist',
    chunk_type: 'role_overview',
    chunk_text: `# Physiotherapist: Your 2026 Career Guide

A physiotherapist helps people recover from injuries, surgeries, and illnesses by improving their movement and managing pain. Unlike doctors who prescribe medicine, you use physical techniques like exercise, massage, and specialized equipment. In South Africa, physiotherapists work in government hospitals, private hospitals (Netcare, Mediclinic), sports clinics, old age homes, and private practice.

**Real SA Example:** After a taxi accident, a patient comes to you with back pain. You design exercises to strengthen their muscles and restore movement so they can return to work.

# Work Environment
- **Where:** Government hospitals, private hospitals, sports clinics, rehabilitation centers, schools for disabled children, private practice, sports teams (Kaizer Chiefs, Springbok)
- **Team:** Work with doctors, nurses, occupational therapists
- **Hours:** Standard 8-5 in hospitals; flexible in private practice
- **Location:** Everywhere—cities, towns, rural clinics (high demand in rural areas)

## Why It's Critical in SA
- High trauma rates (car accidents, violence) = sports-related injuries
- Growing elderly population needing rehabilitation
- Shortage of physiotherapists—government actively recruiting

# Salary Progression (ZAR, 2025 data)
- **Community Service Year (Year 1 post-grad):** R18,000 - R22,000/month (mandatory)
- **Junior Physiotherapist (1-3 years):** R22,000 - R35,000/month
- **Experienced Physio (3-7 years):** R35,000 - R55,000/month
- **Senior/Specialist (7+ years):** R55,000 - R80,000/month
- **Private Practice Owner:** R40,000 - R120,000/month (depends on client base)

**Employers Hiring Right Now:** Netcare, Mediclinic, Life Healthcare, Virgin Active, SARU (SA Rugby), SASCOC (Sports Commission)`,
    tags: ['physiotherapy', 'healthcare', 'grade 11', 'grade 12', 'life sciences', 'salary', 'career overview']
  },
  {
    career_name: 'Physiotherapist',
    chunk_type: 'education_requirements',
    chunk_text: `# Physiotherapist: What You Need to Study

## High School Subjects (Grade 10-12)
**MUST HAVE:**
- **Mathematics:** 50% minimum, 60%+ recommended
- **Physical Science:** 50% minimum, 60%+ recommended
- **Life Sciences (Biology):** 60% minimum, 65%+ essential
- **English:** 60%+ (you write patient reports constantly)

**WARNING:** No Life Sciences = No Physiotherapy. This is non-negotiable.

## University Degree Requirements
**ONE PATHWAY ONLY:** BSc Physiotherapy is a **4-year professional degree**

**Admission Requirements (2026):**
- APS Score: **32+ (UCT, Wits), 30+ (UP, UWC), 28+ (UKZN)**
- **Life Sciences:** 60%+
- **Physical Science:** 50%+
- **Mathematics:** 50%+
- **English:** 60%+

### Where You Can Study
**TIER 1 (Most Competitive):**
- **UCT:** APS 36+, Life Sciences 70%+, Cost: R65,000/year
- **Wits:** APS 34+, Life Sciences 65%+, Cost: R62,000/year

**TIER 2 (Excellent Programs, More Accessible):**
- **UP:** APS 30+, Life Sciences 60%+, Cost: R48,000/year
- **UWC:** APS 28+, Life Sciences 60%+, Cost: R38,000/year (Most affordable)
- **UKZN:** APS 30+, Life Sciences 60%+, Cost: R45,000/year

**Competitiveness:** HIGH. Only 80-120 students accepted per university per year.`,
    tags: ['physiotherapy education', 'bsc physiotherapy', 'university requirements', 'admission requirements', 'life sciences', 'mathematics', 'uct', 'wits', 'up', 'uwc', 'ukzn']
  },
  {
    career_name: 'Physiotherapist',
    chunk_type: 'funding_bursaries',
    chunk_text: `# Physiotherapist: How to Fund Your Studies (2026)

## Government Funding

### NSFAS (National Student Financial Aid Scheme)
**Who Qualifies:** Household income < R350,000/year
**What It Covers:**
- Full tuition (R35K-R65K/year depending on university)
- Accommodation (R45,000/year cap)
- Books (R5,200/year)
- Living allowance (R15,000/year)
- Laptop (one-time, first-year only)

**How to Apply:** nsfas.org.za
**When:** Opens 1 October 2026, closes November 2026

## Provincial Health Department Bursaries

### Gauteng Dept of Health Bursary
**Who:** Gauteng residents accepted to UP, Wits
**Coverage:** Full tuition + small allowance per year
**Obligation:** Work in Gauteng public hospital 1 year for each year funded
**Application:** Via Gauteng Health website (opens August 2026)

### Western Cape Dept of Health
**Who:** WC residents accepted to UCT, UWC
**Coverage:** Full tuition + allowance
**Obligation:** Work in Western Cape public facilities after graduation
**Application:** Via Western Cape Government website (opens July 2026)

### KwaZulu-Natal Dept of Health
**Who:** KZN residents accepted to UKZN
**Coverage:** Full tuition + accommodation
**Obligation:** Work in KZN public hospitals
**Application:** Via KZN Health website (opens July 2026)

## Corporate & Private Bursaries

### Charl van der Merwe Trust (Physiotherapy-Specific)
**Who:** Physiotherapy students at UCT
**Coverage:** R30,000-R50,000/year
**Application:** Via UCT Financial Aid Office

### Old Mutual Foundation
**Who:** Health science students at any SA university
**Coverage:** R20,000 - R40,000/year
**Application:** Via Old Mutual website (opens August 2026)

### Netcare Education Foundation
**Who:** Students studying physiotherapy, nursing, medicine
**Coverage:** Up to R50,000/year
**Obligation:** Work at Netcare hospitals during vacation
**Application:** Via Netcare careers website (opens June 2026)`,
    tags: ['physiotherapy funding', 'nsfas', 'bursaries', 'provincial health bursaries', 'gauteng health', 'western cape health', 'kzn health', 'charl van der merwe trust', 'old mutual', 'netcare', 'financial aid']
  }
]

async function upload() {
  try {
    // Get or create module
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'healthcare_extended')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating healthcare module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'healthcare_extended',
          description: 'Extended healthcare careers',
          priority: 1
        })
        .select()
        .single()
      module = newModule
    }
    
    console.log(`✓ Module ready: ${module.module_name} (ID: ${module.id})\n`)
    
    // Insert chunks
    let count = 0
    for (const chunk of physiotherapyChunks) {
      console.log(`Inserting: ${chunk.career_name} - ${chunk.chunk_type}`)
      
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert({
          module_id: module.id,
          chunk_text: chunk.chunk_text,
          chunk_metadata: {
            career_name: chunk.career_name,
            chunk_type: chunk.chunk_type,
            tags: chunk.tags,
            sprint: 'Week 1 - Healthcare',
            source: `healthcare_${chunk.career_name.toLowerCase()}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ DONE: ${count}/${physiotherapyChunks.length} chunks uploaded`)
    
    // Verify
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total chunks in database: ${total}`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
