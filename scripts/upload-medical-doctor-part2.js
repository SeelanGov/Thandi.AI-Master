#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🩺 UPLOADING MEDICAL DOCTOR CONTENT - PART 2 (5 CHUNKS)...\n')

const medicalDoctorChunks = [
  {
    career_name: 'Medical Doctor',
    chunk_type: 'salary_progression',
    chunk_text: `# Medical Doctor: Salary & Career Progression

## Salary Ranges in South Africa (ZAR, 2025 data)

### Training Phase (Mandatory)

**Intern (2 years post-MBChB):**
- Public sector: R25,000 - R40,000/month
- Work: 60-80 hours/week, night shifts, weekends
- Rotations through major specialties
- No private practice allowed

**Community Service Officer (1 year):**
- Public sector: R45,000 - R60,000/month
- Often rural placement
- Housing may be provided
- Cannot refuse placement

### General Practice

**Medical Officer (Public Sector):**
- Entry (post-community service): R50,000 - R65,000/month
- Mid-career (5-10 years): R65,000 - R90,000/month
- Senior (10+ years): R80,000 - R110,000/month
- Benefits: Pension, medical aid, job security

**GP (Private Practice):**
- Starting (first 2-3 years): R40,000 - R80,000/month (building patient base)
- Established (5+ years): R80,000 - R150,000/month
- Well-established (10+ years): R120,000 - R200,000/month
- Overhead costs: 40-50% (rent, staff, equipment, insurance)
- Must manage business aspects

### Specialist Doctors (After Registrar Training)

**Public Sector Specialists:**
- Entry specialist: R90,000 - R120,000/month
- Senior specialist: R120,000 - R180,000/month
- Head of department: R150,000 - R200,000/month
- Benefits: Pension, regular hours, academic opportunities

**Private Practice Specialists:**
- General specialists: R120,000 - R250,000/month
- High-demand specialists: R200,000 - R400,000+/month
- Top earners: Neurosurgeons, Cardiothoracic Surgeons, Orthopedic Surgeons, Plastic Surgeons
- Overhead: 30-40% (rooms, equipment, staff, insurance)

### Specialty-Specific Earnings (Private Practice, Established)

**High-Earning Specialties:**
- Neurosurgeon: R250,000 - R400,000+/month
- Cardiothoracic Surgeon: R200,000 - R350,000/month
- Orthopedic Surgeon: R180,000 - R300,000/month
- Plastic Surgeon: R150,000 - R280,000/month
- Cardiologist: R150,000 - R250,000/month

**Mid-Range Specialties:**
- Anesthesiologist: R120,000 - R200,000/month
- Radiologist: R120,000 - R200,000/month
- Gynecologist: R100,000 - R180,000/month
- Pediatrician: R90,000 - R160,000/month
- Dermatologist: R100,000 - R180,000/month

**Lower-Earning Specialties (but still good income):**
- Psychiatrist: R80,000 - R140,000/month
- Family Medicine: R70,000 - R120,000/month
- Public Health Medicine: R70,000 - R110,000/month

## Career Progression Paths

### Path 1: General Practice (Fastest)
- MBChB (6 years) → Internship (2 years) → Community Service (1 year) → **GP** (independent practice)
- Timeline: 9 years to independent practice
- Can start earning well immediately after community service

### Path 2: Specialist (Longer, Higher Earning)
- MBChB (6 years) → Internship (2 years) → Community Service (1 year) → **Registrar Training** (4-6 years) → **Specialist**
- Timeline: 13-15 years to specialist practice
- Higher income potential, more focused practice

### Path 3: Academic Medicine
- Specialist training + PhD/MMed (research degree)
- University lecturer + clinical practice
- Lower income but research opportunities, teaching
- Salary: R80,000 - R150,000/month

### Path 4: Public Health/Policy
- MBChB + MPH (Master of Public Health)
- Work in health departments, WHO, NGOs
- Policy development, program management
- Salary: R70,000 - R130,000/month

## Additional Income Sources

**Locum Work (Temporary Shifts):**
- GPs: R500 - R800/hour
- Specialists: R800 - R1,500/hour
- Common for doctors to do locum work on weekends/evenings

**Rural Allowances:**
- Government adds R5,000 - R10,000/month for rural posts
- Housing often provided
- Scarce skills allowances for specialists in rural areas

**Private Hospital Sessions:**
- Public sector doctors can do limited private work
- Additional R10,000 - R30,000/month

## Financial Reality Check

**Costs to Consider:**
- **Malpractice Insurance:** R15,000 - R50,000/year (mandatory)
- **HPCSA Registration:** R1,500/year
- **Continuing Medical Education:** R10,000 - R20,000/year
- **Private Practice Overhead:** 40-50% of gross income
- **Student Debt:** Many doctors graduate with R300,000 - R700,000 debt

**Break-Even Timeline:**
- If you have R500,000 student debt
- Earning R80,000/month as GP
- Living expenses R30,000/month
- Debt repayment R20,000/month
- Takes 2-3 years to pay off debt

## NHI Impact (Future Uncertainty)

**National Health Insurance (NHI) implementation may:**
- Shift more doctors to salaried positions
- Reduce private practice income
- Standardize fees across public/private
- Increase public sector employment
- Timeline uncertain (2026-2030 rollout)

**Bottom Line:** Medicine offers good earning potential, but it takes 9-15 years to reach peak earnings. Factor in student debt, long training period, and high stress. Don't choose medicine for money alone—choose it because you're passionate about patient care. If money is your primary motivation, consider business, engineering, or tech careers with faster ROI.`,
    tags: ['doctor salary', 'medical doctor salary', 'gp salary', 'specialist salary', 'surgeon salary', 'medical officer salary', 'intern salary', 'community service salary', 'private practice income', 'public sector doctor', 'locum work', 'rural allowance', 'nhi impact']
  },
  {
    career_name: 'Medical Doctor',
    chunk_type: 'bursaries_funding',
    chunk_text: `# Medical Doctor: Bursaries & Financial Reality

## The Harsh Truth About Medical School Funding

**Medical bursaries are SCARCE and EXTREMELY COMPETITIVE.**

Unlike other healthcare careers (Physiotherapy, Pharmacy, Nursing), there are very few bursaries specifically for medical students. Most students rely on:
1. Parent funding
2. Bank loans
3. NSFAS (limited universities)
4. Part-time work (nearly impossible due to study intensity)

**Total Cost Reality:**
- Tuition (6 years): R300,000 - R480,000
- Accommodation: R180,000 - R270,000 (R30K-R45K/year × 6)
- Books & equipment: R60,000 - R90,000
- Living expenses: R180,000 - R360,000
- **TOTAL: R720,000 - R1,200,000 for MBChB**

## Available Bursaries (Limited)

### Discovery Foundation Medical Scholarship
**Coverage:** Full tuition + R30,000/year stipend
**Who:** Medical students at any SA university
**Selection:** Academic excellence (70%+ average), leadership, financial need
**Obligation:** 2-year work-back at public facility or Discovery Health
**Awards:** 20-30 students nationally per year
**Application:** Via Discovery website (opens June annually)
**Competition:** 500+ applicants for 25 spots = 5% success rate

**Reality:** This is the BEST medical bursary in SA, but extremely competitive.

### Provincial Health Department Bursaries

**Eastern Cape Department of Health:**
- Coverage: R30,000 - R60,000/year (partial tuition)
- Obligation: Work in EC public facilities (1 year per year funded)
- Application: Via EC Health website (opens May-July)
- Success rate: Higher than other provinces (less competition)

**KwaZulu-Natal Department of Health:**
- Coverage: R40,000 - R70,000/year
- Obligation: Work in KZN public facilities
- Application: Via KZN Health website (opens July)
- Priority: KZN residents at UKZN

**Limpopo Department of Health:**
- Coverage: R30,000 - R50,000/year
- Obligation: Work in Limpopo (often rural)
- Application: Via Limpopo Health website
- Higher approval rate due to critical shortage

**Gauteng, Western Cape:** Very limited medical bursaries (priority to nursing/allied health)

### SANDF (South African National Defence Force) Medical Training Programme
**Coverage:** FULL tuition + stipend + accommodation
**Who:** SA citizens, physically fit, willing to serve
**Obligation:** 5-year military service after qualification
**Selection:** Academic merit + military aptitude tests + medical fitness
**Application:** Via SANDF recruitment (opens February-April)
**Awards:** 30-50 students per year

**Pros:**
- Full funding, no debt
- Guaranteed employment
- Military benefits (housing, medical aid)

**Cons:**
- 5-year military commitment (cannot refuse postings)
- May be deployed to conflict zones
- Limited private practice opportunities during service

### University Merit Bursaries (Top-Up Only)

**UCT, Wits, Stellenbosch:**
- Coverage: R10,000 - R30,000/year (partial)
- Selection: Top 5-10% of class academically
- Automatic consideration after first year
- Not full funding—supplements other sources

### NSFAS (National Student Financial Aid Scheme)

**Coverage:** Full tuition + accommodation + allowances
**Who Qualifies:** Household income < R350,000/year
**Which Universities:** UKZN, Walter Sisulu University, Sefako Makgatho
**NOT available at:** UCT, Wits, UP, Stellenbosch, UFS

**Reality:** NSFAS covers MBChB at only 3 universities. If you need NSFAS, your options are limited.

## Private Student Loans

### Nedbank Student Loans
- Interest rate: Prime + 3% (~14% total)
- Requires guarantor (parent/guardian)
- Repayment starts 6 months after graduation
- Maximum: R100,000/year
- Total debt for 6 years: R600,000+

### FNB Student Loans
- Interest rate: Prime + 2-4%
- Requires proof of acceptance
- Flexible repayment terms
- Maximum: R80,000/year

### Fundi Student Loans
- Interest rate: Prime + 4%
- No collateral for amounts < R100,000
- Repayment starts after graduation
- Good approval rates for medical students (stable career)

**Debt Reality:**
- Borrow R500,000 at 14% interest
- Monthly repayment: R10,000 - R15,000
- Takes 5-7 years to pay off
- Total repaid: R700,000 - R900,000

## Financial Planning Strategies

### Strategy 1: Parent Funding + Small Loan
- Parents cover R300,000 (tuition)
- Loan R200,000 for accommodation/living
- Graduate with manageable R200,000 debt

### Strategy 2: NSFAS + Part-Time Work (Limited Universities)
- NSFAS covers tuition at UKZN/WSU/SMU
- Work during holidays (tutoring, retail)
- Graduate debt-free but limited university choice

### Strategy 3: Gap Year + Savings
- Work for 1-2 years, save R100,000 - R150,000
- Apply for bursaries during gap year
- Reduce loan amount needed

### Strategy 4: Start with Clinical Associate (3 years)
- Shorter, cheaper program (R150,000 total)
- Work as Clinical Associate (R25K-R45K/month)
- Save money, then apply for MBChB
- Some universities offer bridging programs

### Strategy 5: Military Route (SANDF)
- Full funding, no debt
- 5-year service commitment
- Guaranteed employment
- Not for everyone (military lifestyle)

## What NOT to Do

❌ **Don't assume you'll get a bursary** - They're extremely rare
❌ **Don't rely on part-time work** - Medical school is too intense
❌ **Don't borrow maximum amounts** - Minimize debt where possible
❌ **Don't ignore alternative pathways** - Clinical Associate, then MBChB is valid

## Application Timeline

**February-April:** SANDF applications open
**May-July:** Provincial health bursaries open
**June:** Discovery Foundation applications open
**August-September:** University merit bursaries (after acceptance)
**October:** NSFAS opens (for eligible universities)

## Bottom Line

**Medical school funding is DIFFICULT.** Unlike Physiotherapy or Pharmacy where bursaries are plentiful, medical students face:
- Very few bursaries (20-30 Discovery scholarships nationally)
- Limited NSFAS access (only 3 universities)
- High total costs (R700K - R1.2M)
- Long training period (9 years before good income)

**Plan finances YEARS in advance.** If your family cannot afford R500,000+ and you don't qualify for NSFAS, seriously consider:
1. Applying for SANDF (full funding)
2. Starting with Clinical Associate (cheaper, faster)
3. Other healthcare careers with better funding (Physiotherapy, Pharmacy, Nursing)

**Don't let money alone stop you from medicine, but be realistic about the financial burden.** Many doctors graduate with R500,000+ debt and spend 5-7 years paying it off.`,
    tags: ['medical school funding', 'medical bursaries', 'discovery foundation', 'sandf medical', 'nsfas medicine', 'provincial health bursaries', 'student loans medicine', 'medical school cost', 'mbchb funding', 'medical school debt', 'clinical associate alternative']
  }
]

async function upload() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'healthcare_extended')
    
    let module = modules?.[0]
    
    console.log(`✓ Module ready: ${module.module_name}\n`)
    
    let count = 0
    for (const chunk of medicalDoctorChunks) {
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
    
    console.log(`\n✅ DONE: ${count}/${medicalDoctorChunks.length} chunks uploaded`)
    
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total chunks in database: ${total}`)
    console.log(`\n   Medical Doctor: 5/8 chunks complete`)
    console.log(`   Next: Upload final 3 Medical Doctor chunks`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
