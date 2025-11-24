#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('💊 UPLOADING PHARMACIST CONTENT...\n')

const pharmacistChunks = [
  {
    career_name: 'Pharmacist',
    chunk_type: 'role_overview',
    chunk_text: `# Pharmacist: Your 2026 Career Guide

A pharmacist is a healthcare professional who dispenses medications, counsels patients on proper usage, and ensures drug safety. In South Africa, pharmacists work in retail pharmacies (Clicks, Dis-Chem), hospital pharmacies, pharmaceutical companies (Aspen Pharmacare, Adcock Ingram), and regulatory bodies like SAHPRA (South African Health Products Regulatory Authority).

**Real SA Example:** A patient comes to your pharmacy with a prescription for chronic medication. You notice a potential drug interaction with their existing medication, contact the doctor to adjust the prescription, and counsel the patient on proper timing and side effects. This intervention prevents a serious health complication.

# Daily Responsibilities
- Review and dispense prescriptions accurately
- Counsel patients on medication usage, side effects, and interactions
- Manage chronic disease programs (diabetes, hypertension, HIV/AIDS)
- Conduct medication reviews and identify drug interactions
- Manage pharmaceutical inventory and ordering
- Supervise pharmacy assistants and interns
- Collaborate with doctors and healthcare teams
- Ensure compliance with SAHPRA regulations

# Work Environment

**Retail Pharmacy (Clicks, Dis-Chem, Independent):**
- Hours: 8am-6pm weekdays, Saturday mornings, some Sunday shifts
- Fast-paced, customer-facing
- Focus: Dispensing, patient counseling, OTC recommendations
- Salary: R15K-R35K/month

**Hospital Pharmacy (Netcare, Mediclinic, Government):**
- Hours: Shift work (day/night), weekends rotational
- Clinical focus, ward rounds with doctors
- Focus: Complex medications, IV preparations, clinical consultations
- Salary: R25K-R45K/month

**Pharmaceutical Industry (Aspen, Adcock Ingram):**
- Hours: Standard office hours (8-5)
- Roles: Medical rep, regulatory affairs, quality assurance, R&D
- Focus: Product development, compliance, sales
- Salary: R30K-R80K/month

**Regulatory/Academic:**
- SAHPRA, university lecturer, research
- Hours: Standard office/academic hours
- Salary: R35K-R70K/month

## Why It's Critical in SA
- 3,500+ pharmacies nationwide (urban and rural)
- Chronic disease burden (HIV, TB, diabetes, hypertension)
- Medication access point for underserved communities
- Growing clinical pharmacy roles in hospitals
- Shortage in rural areas (government incentives available)

# Salary Progression (ZAR, 2025 data)
- **Intern Pharmacist (1 year mandatory):** R15,000 - R20,000/month
- **Community Pharmacist (1-3 years):** R20,000 - R30,000/month
- **Hospital/Clinical Pharmacist (3-5 years):** R25,000 - R45,000/month
- **Pharmacy Manager (5-10 years):** R40,000 - R60,000/month
- **Industry/Senior Roles (10+ years):** R50,000 - R80,000+/month
- **Pharmacy Owner:** R60,000 - R150,000/month (depends on location and business)

**Employers Hiring Right Now:** Clicks (700+ stores), Dis-Chem (200+ stores), Netcare, Mediclinic, Life Healthcare, Aspen Pharmacare, Adcock Ingram, government hospitals

**Bottom Line:** Pharmacy offers stable employment, diverse career paths, and good earning potential. If you have Physical Sciences 60%+ and enjoy helping people through medication management, this is an excellent career. Unlike doctors, you don't need 70%+ in all subjects, making it more accessible.`,
    tags: ['pharmacist', 'pharmacy', 'healthcare', 'grade 11', 'grade 12', 'physical sciences', 'clicks', 'dis-chem', 'salary', 'career overview', 'medication', 'bpharm']
  },
  {
    career_name: 'Pharmacist',
    chunk_type: 'education_requirements',
    chunk_text: `# Pharmacist: What You Need to Study

## High School Subjects (Grade 10-12)

**MUST HAVE:**
- **Mathematics:** 50% minimum, 60%+ recommended (for pharmaceutical calculations)
- **Physical Sciences:** 60% minimum, 65%+ essential (chemistry focus crucial)
- **Life Sciences:** 50% minimum, 60%+ recommended (human biology, pharmacology)
- **English:** 60%+ (for patient communication and documentation)

**HIGHLY RECOMMENDED:**
- **Physical Sciences:** 65%+ (chemistry is the core of pharmacy)
- **Mathematics:** 60%+ (for dosage calculations and statistics)

**WARNING:**
- No Physical Sciences = No Pharmacy. Chemistry knowledge is non-negotiable.
- Mathematical Literacy is NOT accepted (you need Mathematics)

## University Degree Requirements

**ONE PATHWAY ONLY:**
Bachelor of Pharmacy (BPharm) is a **4-year professional degree**

**Admission Requirements (2026):**
- APS Score: **28-32+ depending on university**
- **Physical Sciences:** 60%+ (chemistry component essential)
- **Mathematics:** 50%+
- **Life Sciences:** 50%+
- **English:** 60%+

### Where You Can Study

**TIER 1 (Established Programs):**

### Rhodes University
- **Program:** BPharm (4 years)
- **Admission:** APS 30+, Physical Sciences 65%+
- **Cost:** R45,000/year
- **Why Choose Rhodes:** Small class sizes, strong clinical training, Grahamstown location (lower cost of living)
- **Clinical Placements:** Settler's Hospital, community pharmacies
- **Bursaries:** Rhodes Financial Aid, pharmaceutical company bursaries

### University of the Witwatersrand (Wits)
- **Program:** BPharm (4 years)
- **Admission:** APS 32+, Physical Sciences 65%+
- **Cost:** R55,000/year
- **Why Choose Wits:** Johannesburg = large hospital network, strong industry connections
- **Clinical Placements:** Charlotte Maxeke Hospital, Helen Joseph Hospital, retail chains
- **Bursaries:** Wits Financial Aid, Discovery, Aspen Pharmacare

**TIER 2 (Accessible Programs):**

### University of Pretoria (UP)
- **Program:** BPharm (4 years)
- **Admission:** APS 30+, Physical Sciences 60%+
- **Cost:** R48,000/year
- **Why Choose UP:** Strong community pharmacy focus, affordable
- **Clinical Placements:** Steve Biko Hospital, Tshwane pharmacies
- **Bursaries:** UP Financial Aid, Clicks Pharmacy Bursary

### University of the Western Cape (UWC)
- **Program:** BPharm (4 years)
- **Admission:** APS 28+, Physical Sciences 60%+
- **Cost:** R38,000/year (Most affordable)
- **Why Choose UWC:** Accessible, strong social justice focus, accredited
- **Clinical Placements:** Tygerberg Hospital, community pharmacies
- **Bursaries:** UWC Financial Aid, NSFAS, Western Cape Health Dept

### Nelson Mandela University (NMU)
- **Program:** BPharm (4 years)
- **Admission:** APS 28+, Physical Sciences 60%+
- **Cost:** R40,000/year
- **Location:** Port Elizabeth/Gqeberha
- **Clinical Placements:** Livingstone Hospital, Eastern Cape pharmacies

**Competitiveness:** MODERATE. 100-150 students accepted per university per year (less competitive than medicine/physiotherapy).

## After Graduation: Internship & Registration

**Mandatory 1-Year Internship:**
- Work under registered pharmacist supervision
- Rotate through different pharmacy settings
- Salary: R15,000-R20,000/month
- Arranged by university or self-sourced

**SAPC Board Exam:**
- South African Pharmacy Council registration exam
- Written and practical components
- Pass required to practice as registered pharmacist
- Most graduates pass on first attempt

**Pro Tip:** Volunteer at a local pharmacy NOW (even 2 hours/week). Shows commitment and helps you understand the daily work. Contact Clicks/Dis-Chem store managers directly.`,
    tags: ['pharmacy education', 'bpharm', 'rhodes pharmacy', 'wits pharmacy', 'up pharmacy', 'uwc pharmacy', 'nmu pharmacy', 'admission requirements', 'physical sciences', 'mathematics', 'sapc', 'pharmacy internship', 'university requirements']
  },
  {
    career_name: 'Pharmacist',
    chunk_type: 'funding_bursaries',
    chunk_text: `# Pharmacist: How to Fund Your Studies (2026)

## Government Funding

### NSFAS (National Student Financial Aid Scheme)
**Who Qualifies:** Household income < R350,000/year
**What It Covers:**
- Full tuition (R38K-R55K/year depending on university)
- Accommodation (R45,000/year cap)
- Books (R5,200/year)
- Living allowance (R15,000/year)
- Laptop (one-time, first-year only)

**How to Apply:** nsfas.org.za
**Relevance:** YES, fully funds BPharm degrees at public universities
**When:** Opens 1 October 2026, closes November 2026

## Corporate & Retail Bursaries

### Discovery Foundation Scholarship
**Who:** 2nd year+ pharmacy students at any SA university
**Coverage:** Full tuition + R30,000/year stipend
**Selection:** Academic merit (65%+ average), leadership, financial need
**Obligation:** 2-year work-back at Discovery Health
**Application:** Via Discovery website (opens June 2026)
**Awards:** 10-15 students annually

### Clicks Pharmacy Bursary
**Who:** Pharmacy students at any SA university
**Coverage:** R30,000/year
**Obligation:** Work at Clicks during holidays + 1 year post-graduation
**Application:** Via Clicks careers website (opens July 2026)
**Selection:** Academic performance + interview

### Aspen Pharmacare Bursary
**Who:** Pharmacy students (2nd year+)
**Coverage:** Full tuition + accommodation
**Obligation:** 2-year work-back at Aspen (industry role)
**Application:** Via Aspen website (opens August 2026)
**Selection:** Academic merit + career interest in pharmaceutical industry

### Adcock Ingram Bursary
**Who:** Pharmacy students at Wits, Rhodes, UP
**Coverage:** R40,000/year
**Obligation:** 1-year work-back (flexible roles)
**Application:** Via Adcock Ingram website (opens August 2026)

## Provincial Health Department Bursaries

### Gauteng Dept of Health Bursary
**Who:** Gauteng residents accepted to UP, Wits
**Coverage:** Full tuition + small allowance
**Obligation:** Work in Gauteng public hospital pharmacy 1 year per year funded
**Application:** Via Gauteng Health website (opens August 2026)
**Note:** Limited slots (priority given to medicine/nursing)

### Western Cape Dept of Health
**Who:** WC residents accepted to UWC
**Coverage:** Full tuition
**Obligation:** Work in Western Cape public facilities after graduation
**Application:** Via Western Cape Government website (opens July 2026)

## University-Specific Bursaries

### Wits Pharmacy Faculty Bursary
**Who:** Wits pharmacy students
**Coverage:** R20,000-R40,000/year
**Selection:** Academic merit (top 10% of class)
**Application:** Automatic consideration, no separate application

### Rhodes Pharmacy Bursary
**Who:** Rhodes pharmacy students
**Coverage:** R15,000-R30,000/year
**Selection:** Financial need + academic performance
**Application:** Via Rhodes Financial Aid Office

## Private Student Loans

### Fundi Student Loans
- Interest rate: Prime + 2-4%
- Repayment starts after graduation
- No collateral required for amounts < R100,000

### Nedbank Student Loans
- Interest rate: Prime + 3%
- Requires guarantor
- Flexible repayment terms

## Application Timeline (CRITICAL)

**June 2026:** Discovery, Clicks bursaries open
**July 2026:** Provincial health bursaries open
**August 2026:** Aspen, Adcock Ingram bursaries open
**September 2026:** University applications open
**1 October 2026:** NSFAS opens
**30 September 2026:** Most university applications CLOSE
**November 2026:** NSFAS closes
**December 2026:** Bursary results
**January 2027:** Acceptance letters, Registration

**Pro Tip:** Apply to 3-4 universities (1-2 reach, 1-2 safety). Each bursary application requires separate motivation letter—customize each! Maintain 65%+ average to retain bursaries.

**Bottom Line:** Pharmacy has MORE bursary options than many health sciences because of corporate/retail involvement. If you have Physical Sciences 60%+ and financial need, funding is very achievable through NSFAS + corporate bursaries.`,
    tags: ['pharmacy funding', 'pharmacy bursaries', 'nsfas pharmacy', 'discovery bursary', 'clicks bursary', 'aspen bursary', 'adcock ingram', 'provincial health bursaries', 'pharmacy financial aid', 'bpharm funding', 'student loans']
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
    for (const chunk of pharmacistChunks) {
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
    
    console.log(`\n✅ DONE: ${count}/${pharmacistChunks.length} chunks uploaded`)
    
    // Verify
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total chunks in database: ${total}`)
    console.log(`\n🎯 Healthcare Progress: Physiotherapy (3) + Pharmacist (3) = 6 chunks`)
    console.log(`   Next: Generate embeddings, then add Occupational Therapist`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
