#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧩 UPLOADING OCCUPATIONAL THERAPIST CONTENT...\n')

const otChunks = [
  {
    career_name: 'Occupational Therapist',
    chunk_type: 'role_overview',
    chunk_text: `# Occupational Therapist: Your 2026 Career Guide

An Occupational Therapist (OT) helps people regain independence in daily activities after injury, illness, or disability. In South Africa, OTs work in hospitals, rehabilitation centers, schools (special needs education), psychiatric facilities, and community health centers.

**Key Difference from Physiotherapy:** While physiotherapists focus on physical movement and strength, OTs address daily living skills—dressing, cooking, bathing, work tasks, cognitive function, and environmental adaptations.

**Real SA Example:** A stroke patient at Groote Schuur Hospital can't dress himself or use his dominant hand. As an OT, you assess his abilities, create adaptive equipment (button hooks, one-handed cutting boards), teach compensatory techniques, and work with his family to modify his home environment. You help him return to work as an accountant by adapting his computer setup and teaching one-handed typing strategies.

# Daily Responsibilities
- Assess patients' functional abilities and limitations
- Create individualized treatment plans for daily living skills
- Design and recommend adaptive equipment and environmental modifications
- Teach coping strategies and compensatory techniques
- Work with families and caregivers on home adaptations
- Conduct cognitive assessments and rehabilitation
- Collaborate with multidisciplinary teams (doctors, physios, speech therapists)
- Document progress and adjust treatment plans

# Work Environment

**Hospital-Based (Netcare, Mediclinic, Government):**
- Hours: 8am-4pm weekdays, occasional weekends
- Settings: Acute care, stroke units, ICU, psychiatric wards
- Focus: Functional assessments, discharge planning, acute rehabilitation
- Salary: R25K-R45K/month

**Rehabilitation Centers (Netcare Rehab, Life Rehab):**
- Hours: Standard weekday hours
- Focus: Intensive rehabilitation programs, spinal cord injury, brain injury
- Salary: R30K-R50K/month

**Schools (Special Needs Education):**
- Hours: School hours (7:30am-2pm), school holidays off
- Focus: Sensory integration, learning support, adaptive equipment for classrooms
- Salary: R25K-R40K/month
- **Benefit:** School holiday schedule

**Community Health Centers:**
- Hours: 8am-4pm
- Focus: Home visits, community-based rehabilitation, disability support
- Salary: R20K-R35K/month (government)
- **Benefit:** Rural allowances, housing provided

**Private Practice:**
- Hours: Flexible, client-based
- Focus: Pediatrics, hand therapy, mental health
- Earnings: R600-R900/hour (after 5+ years experience)

**Mental Health/Psychiatry:**
- Settings: Psychiatric hospitals, community mental health
- Focus: Life skills training, vocational rehabilitation, coping strategies
- **High Demand:** Critical shortage in mental health OTs

## Why It's Critical in SA
- **Chronic shortage:** Especially in rural areas, mental health, and pediatrics
- **Disability support:** 7.5% of SA population has disabilities (Census 2022)
- **Stroke epidemic:** Growing elderly population needs rehabilitation
- **Mental health crisis:** OTs essential for psychiatric rehabilitation
- **NHI implementation:** Will significantly increase public sector OT demand
- **Rural clinics:** Often the only rehabilitation professional available

# Salary Progression (ZAR, 2025 data)
- **Community Service Year (mandatory):** R20,000 - R28,000/month
- **Junior OT (1-3 years):** R25,000 - R35,000/month
- **Experienced OT (3-7 years):** R35,000 - R55,000/month
- **Senior/Specialist (7+ years):** R55,000 - R90,000/month
- **Private Practice Owner:** R60,000 - R120,000/month (depends on client base)

**Employers Hiring Right Now:** Government hospitals (largest employer), Netcare Rehab, Life Rehab, special needs schools, Disabled People South Africa (DPSA), insurance companies (functional assessments)

**Bottom Line:** OT offers excellent job security with VERY HIGH demand, especially in underserved areas. If you have Life Sciences 60%+ and enjoy creative problem-solving to help people regain independence, this is an outstanding career. Unlike Pharmacy, you can use Math Lit, making it more accessible.`,
    tags: ['occupational therapist', 'occupational therapy', 'ot', 'healthcare', 'grade 11', 'grade 12', 'life sciences', 'rehabilitation', 'disability', 'mental health', 'pediatrics', 'salary', 'career overview']
  },
  {
    career_name: 'Occupational Therapist',
    chunk_type: 'education_requirements',
    chunk_text: `# Occupational Therapist: What You Need to Study

## High School Subjects (Grade 10-12)

**MUST HAVE:**
- **Life Sciences:** 60% minimum, 65%+ recommended (human biology, anatomy)
- **Mathematics OR Mathematical Literacy:** 60%+ (either is accepted!)
- **English:** 60%+ (for patient communication and documentation)

**RECOMMENDED:**
- **Life Sciences:** 65%+ (this is the most important subject)
- **Physical Sciences:** 50%+ (helpful but not required)

**ADVANTAGE OF OT:**
- **Mathematical Literacy IS accepted** (unlike Pharmacy, Physiotherapy, Medicine)
- This makes OT more accessible if you're strong in Life Sciences but struggle with Mathematics

## University Degree Requirements

**ONE PATHWAY ONLY:**
BSc Occupational Therapy is a **4-year professional degree**

**Admission Requirements (2026):**
- APS Score: **28-34+ depending on university**
- **Life Sciences:** 60%+ (most important)
- **Mathematics OR Math Lit:** 60%+
- **English:** 60%+
- **Some universities require interviews** (UCT, Wits)

### Where You Can Study

**TIER 1 (Established Programs):**

### University of Cape Town (UCT)
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 34+, Life Sciences 65%+, **Interview required**
- **Cost:** R65,000/year
- **Why Choose UCT:** World-class clinical training, Groote Schuur Hospital placements, strong research focus
- **Clinical Placements:** Groote Schuur, Red Cross Children's Hospital, psychiatric facilities
- **Bursaries:** UCT Financial Aid, Western Cape Health Dept

### University of the Witwatersrand (Wits)
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 32+, Life Sciences 65%+, **Interview required**
- **Cost:** R60,000/year
- **Why Choose Wits:** Johannesburg = large hospital network, diverse patient populations
- **Clinical Placements:** Charlotte Maxeke Hospital, Tara Psychiatric Hospital, schools
- **Bursaries:** Wits Financial Aid, Gauteng Health Dept

**TIER 2 (Accessible Programs):**

### University of Pretoria (UP)
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 30+, Life Sciences 60%+
- **Cost:** R50,000/year
- **Why Choose UP:** Strong community health focus, affordable
- **Clinical Placements:** Steve Biko Hospital, Weskoppies Psychiatric Hospital
- **Bursaries:** UP Financial Aid, Gauteng Health Dept

### University of the Western Cape (UWC)
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 28+, Life Sciences 60%+
- **Cost:** R40,000/year (Most affordable)
- **Why Choose UWC:** Accessible, strong social justice focus, community-based rehabilitation
- **Clinical Placements:** Tygerberg Hospital, community health centers
- **Bursaries:** UWC Financial Aid, NSFAS, Western Cape Health Dept

### Stellenbosch University
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 32+, Life Sciences 65%+
- **Cost:** R55,000/year
- **Clinical Placements:** Tygerberg Hospital, private practices

### University of KwaZulu-Natal (UKZN)
- **Program:** BSc Occupational Therapy (4 years)
- **Admission:** APS 30+, Life Sciences 60%+
- **Cost:** R45,000/year
- **Clinical Placements:** Inkosi Albert Luthuli Hospital, King Edward Hospital

**Competitiveness:** MODERATE. 40-60 students accepted per university per year (less competitive than medicine/physiotherapy, more than pharmacy).

## After Graduation: Community Service & Registration

**Mandatory 1-Year Community Service:**
- Work at government-assigned facility (often rural)
- Salary: R20,000-R28,000/month
- Housing often provided in rural areas
- Gain diverse experience across settings
- **Cannot be avoided** - required by law for all health professions

**HPCSA Registration:**
- Health Professions Council of South Africa
- Register as Occupational Therapist after community service
- Annual registration fees: ~R1,500
- Required to practice legally in SA

**Postgraduate Options:**
- MSc Occupational Therapy (specializations: hand therapy, neurorehabilitation, pediatrics)
- PhD for academic/research careers

**Pro Tip:** Volunteer at a special needs school, rehab center, or old age home NOW. Shows commitment and helps you understand the work. Contact local schools or hospitals directly.`,
    tags: ['ot education', 'bsc occupational therapy', 'uct ot', 'wits ot', 'up ot', 'uwc ot', 'stellenbosch ot', 'ukzn ot', 'admission requirements', 'life sciences', 'math lit accepted', 'hpcsa', 'community service', 'university requirements']
  },
  {
    career_name: 'Occupational Therapist',
    chunk_type: 'funding_bursaries',
    chunk_text: `# Occupational Therapist: How to Fund Your Studies (2026)

## Government Funding

### NSFAS (National Student Financial Aid Scheme)
**Who Qualifies:** Household income < R350,000/year
**What It Covers:**
- Full tuition (R40K-R65K/year depending on university)
- Accommodation (R45,000/year cap)
- Books (R5,200/year)
- Living allowance (R15,000/year)
- Laptop (one-time, first-year only)

**How to Apply:** nsfas.org.za
**Relevance:** YES, fully funds BSc Occupational Therapy at public universities
**When:** Opens 1 October 2026, closes November 2026

## Provincial Health Department Bursaries (BEST OPTION FOR OT)

### Gauteng Department of Health Bursary
**Who:** Gauteng residents accepted to UP, Wits
**Coverage:** Full tuition + R2,000/month stipend
**Obligation:** Work in Gauteng public facilities 1 year per year funded
**Application:** Via Gauteng Health website (opens July-August 2026)
**Success Rate:** Higher for OT than medicine (less competition)

### Western Cape Department of Health
**Who:** WC residents accepted to UCT, UWC, Stellenbosch
**Coverage:** Full tuition + accommodation allowance
**Obligation:** Work in Western Cape public facilities after graduation
**Application:** Via Western Cape Government website (opens July 2026)
**Note:** WC has highest success rate for allied health bursaries

### Eastern Cape Department of Health
**Who:** EC residents accepted to any SA university
**Coverage:** Full tuition + stipend
**Obligation:** Work in EC public facilities (often rural)
**Application:** Via EC Health website (opens August 2026)
**Advantage:** Less competitive, higher approval rate

### KwaZulu-Natal Department of Health
**Who:** KZN residents accepted to UKZN
**Coverage:** Full tuition + accommodation
**Obligation:** Work in KZN public facilities
**Application:** Via KZN Health website (opens July 2026)

## University-Specific Bursaries

### UCT Occupational Therapy Faculty Bursary
**Who:** UCT OT students
**Coverage:** R10,000-R30,000/year
**Selection:** Academic merit (top 20% of class) + financial need
**Application:** Automatic consideration after first year

### Wits Allied Health Bursary
**Who:** Wits OT students
**Coverage:** R15,000-R35,000/year
**Selection:** Academic performance + financial need
**Application:** Via Wits Financial Aid Office

### UWC Rehabilitation Sciences Bursary
**Who:** UWC OT students
**Coverage:** R10,000-R25,000/year
**Selection:** Financial need + academic performance
**Application:** Via UWC Financial Aid Office

## NGO & Foundation Bursaries

### Charlize Theron Africa Outreach Project
**Who:** Allied health students (including OT) from disadvantaged backgrounds
**Coverage:** R20,000-R40,000/year
**Selection:** Financial need + commitment to community service
**Application:** Via CTAOP website (opens June 2026)

### Disabled People South Africa (DPSA) Bursary
**Who:** Students with disabilities studying rehabilitation sciences
**Coverage:** Varies, R15,000-R30,000/year
**Application:** Via DPSA regional offices

## Private Student Loans

### Fundi Student Loans
- Interest rate: Prime + 2-4%
- Repayment starts after graduation
- No collateral required for amounts < R100,000
- OT graduates have good approval rates (stable employment)

### Nedbank Student Loans
- Interest rate: Prime + 3%
- Requires guarantor
- Flexible repayment terms

## Application Timeline (CRITICAL)

**June 2026:** NGO bursaries open (CTAOP)
**July 2026:** Provincial health bursaries open (WC, GP, EC, KZN)
**August 2026:** University-specific bursaries open
**September 2026:** University applications open
**1 October 2026:** NSFAS opens
**30 September 2026:** Most university applications CLOSE
**November 2026:** NSFAS closes
**December 2026:** Bursary results
**January 2027:** Acceptance letters, Registration

## Pro Tips for OT Bursary Applications

1. **Apply to Multiple Provincial Depts:** WC and EC have highest success rates
2. **Emphasize Rural Commitment:** Mention willingness to work in underserved areas
3. **Highlight Relevant Experience:** Volunteer work with disabled people, special needs schools
4. **Maintain 65%+ Average:** Required to retain most bursaries
5. **Apply Early:** Provincial health bursaries are first-come, first-served
6. **Customize Motivation Letters:** Each bursary needs specific focus (community service, disability advocacy, etc.)

**Bottom Line:** OT has EXCELLENT bursary options, especially provincial health departments which actively recruit OTs due to chronic shortages. If you have Life Sciences 60%+ and financial need, funding is very achievable through NSFAS + provincial bursaries. Work-back obligations (1 year per year funded) provide guaranteed employment after graduation.`,
    tags: ['ot funding', 'ot bursaries', 'occupational therapy bursaries', 'nsfas ot', 'provincial health bursaries', 'gauteng health', 'western cape health', 'eastern cape health', 'kzn health', 'ctaop', 'dpsa', 'ot financial aid', 'community service', 'work-back bursaries']
  }
]

async function upload() {
  try {
    // Get healthcare module
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
    for (const chunk of otChunks) {
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
            source: `healthcare_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ DONE: ${count}/${otChunks.length} chunks uploaded`)
    
    // Verify
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total chunks in database: ${total}`)
    console.log(`\n🎯 Healthcare Progress:`)
    console.log(`   - Physiotherapy: 3 chunks ✅`)
    console.log(`   - Pharmacist: 3 chunks ✅`)
    console.log(`   - Occupational Therapist: 3 chunks ✅`)
    console.log(`   - Total: 9 healthcare career chunks`)
    console.log(`\n   Next: Generate embeddings, then test healthcare queries`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
