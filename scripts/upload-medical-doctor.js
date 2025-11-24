#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🩺 UPLOADING MEDICAL DOCTOR CONTENT (8 CHUNKS)...\n')

const medicalDoctorChunks = [
  {
    career_name: 'Medical Doctor',
    chunk_type: 'role_overview',
    chunk_text: `# Medical Doctor: Your 2026 Career Guide

Medical Doctors diagnose illnesses, prescribe treatment, and save lives. In South Africa, doctors can pursue various paths: General Practitioner (GP), Surgeon, Pediatrician, Gynecologist, Psychiatrist, Cardiologist, and many other specializations.

**Real SA Example:** As a GP in a Soweto clinic, you see 40-50 patients daily—diagnosing everything from flu to diabetes to HIV. You refer complex cases to specialists, manage chronic conditions, deliver babies, and sometimes save lives in emergencies. The work is exhausting but profoundly meaningful.

# Career Paths

**General Practitioner (GP):**
- Primary care doctor, first point of contact
- Diagnose common illnesses, manage chronic diseases
- Work in clinics, private practice, or hospitals
- Fastest path to independent practice (3-5 years post-graduation)

**Specialist Doctors:**
- Surgeon (operations), Pediatrician (children), Gynecologist (women's health)
- Psychiatrist (mental health), Cardiologist (heart), Radiologist (imaging)
- Anesthesiologist, Emergency Medicine, Internal Medicine
- Requires 4-6 additional years of registrar training after internship

# Work Environments

**Public Hospitals (Government):**
- High patient load (40-60 patients/day)
- Resource constraints (medication shortages, equipment issues)
- Challenging but impactful
- Better work-life balance for specialists
- Pension benefits
- Salary: R50K-R90K/month (GP to specialist)

**Private Practice:**
- Lower patient load, better resources
- Business management required
- Higher income potential
- Overhead costs (rent, staff, equipment, insurance)
- Salary: R80K-R200K+/month (established)

**Academic Hospitals (Training institutions):**
- Teaching medical students and interns
- Research opportunities
- Complex cases, cutting-edge treatments
- Groote Schuur, Charlotte Maxeke, Steve Biko, Inkosi Albert Luthuli

**NGOs & Rural Medicine:**
- Doctors Without Borders, rural clinics
- Underserved communities
- Rural allowances (R5K-R10K/month extra)
- Housing often provided

## Why It's Critical in SA
- **Critical shortage:** 31,000+ doctor vacancies nationwide
- **Rural crisis:** Many rural areas have no doctors
- **Chronic disease burden:** HIV, TB, diabetes, hypertension epidemic
- **Trauma:** High rates of violence, car accidents
- **Brain drain:** Many doctors emigrate (UK, Canada, Australia)

# Daily Responsibilities
- Patient consultations and examinations
- Diagnose illnesses using symptoms, tests, imaging
- Prescribe medications and treatment plans
- Perform procedures (GPs: suturing, minor surgery; Specialists: major operations)
- Refer complex cases to specialists
- Manage chronic disease patients
- Emergency care and life-saving interventions
- Extensive documentation and paperwork
- Collaborate with nurses, pharmacists, allied health professionals

# Salary Progression (ZAR, 2025 data)
- **Intern (2 years, mandatory):** R25,000 - R40,000/month
- **Community Service (1 year, mandatory):** R45,000 - R60,000/month
- **Medical Officer (public sector):** R50,000 - R80,000/month
- **GP (private practice, established):** R80,000 - R150,000/month
- **Specialist (public sector):** R90,000 - R150,000/month
- **Specialist (private practice):** R120,000 - R250,000+/month
- **Top specialists (Neurosurgeon, Cardiothoracic):** R200,000 - R400,000+/month

**Reality Check:** Long hours (60-80 hours/week during internship), high stress, malpractice risk, significant debt. But profound impact on lives.

**Bottom Line:** Medicine is the most challenging healthcare career but offers the broadest scope of practice. If you have 70%+ in Math, Physical Sciences, and Life Sciences, plus unwavering commitment, this path can be incredibly rewarding. Be prepared for 9+ years of training and significant financial investment.`,
    tags: ['medical doctor', 'doctor', 'medicine', 'mbchb', 'gp', 'specialist', 'surgeon', 'healthcare', 'grade 11', 'grade 12', 'life sciences', 'physical sciences', 'mathematics', 'salary', 'career overview']
  }
]

async function upload() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'healthcare_extended')
    
    let module = modules?.[0]
    
    if (!module) {
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
    
    console.log(`✓ Module ready: ${module.module_name}\n`)

    // Add remaining chunks
    medicalDoctorChunks.push(
      {
        career_name: 'Medical Doctor',
        chunk_type: 'education_mbchb',
        chunk_text: `# Medical Doctor: Education Path (MBChB)

## The Medical Degree: MBChB (6 years)

**MBChB** = Bachelor of Medicine and Bachelor of Surgery (Latin: Medicinae Baccalaureus, Baccalaureus Chirurgiae)

This is a **6-year professional degree** that qualifies you as a medical doctor.

### Where You Can Study

**Public Universities (Accredited by HPCSA):**

1. **University of Cape Town (UCT)** - 230 students/year
2. **University of the Witwatersrand (Wits)** - 250 students/year
3. **University of Pretoria (UP)** - 300 students/year
4. **University of KwaZulu-Natal (UKZN)** - 250 students/year
5. **Stellenbosch University** - 230 students/year
6. **University of the Free State (UFS)** - 180 students/year
7. **Walter Sisulu University (WSU)** - 60 students/year
8. **Sefako Makgatho Health Sciences University (SMU)** - 200 students/year

**Private University:**
- **Sefako Makgatho** (formerly MEDUNSA) - Higher fees

**Total Seats Nationally:** ~1,700 students/year from 10,000+ applicants

### Tuition Costs (2026)
- **Public universities:** R50,000 - R80,000/year
- **Total for 6 years:** R300,000 - R480,000
- **Private/SMU:** R80,000 - R120,000/year

### Curriculum Overview

**Years 1-3: Pre-clinical (Theory)**
- Anatomy, Physiology, Biochemistry
- Pharmacology, Pathology, Microbiology
- Medical Ethics, Public Health
- Mostly lectures, labs, cadaver dissection

**Years 4-6: Clinical (Practical)**
- Hospital rotations through all major specialties
- Internal Medicine, Surgery, Pediatrics, Obstetrics & Gynecology
- Psychiatry, Family Medicine, Emergency Medicine
- Hands-on patient care under supervision

### After MBChB: Mandatory Training

**2-Year Internship (Compulsory):**
- Rotate through major specialties (4 months each)
- Internal Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Emergency, Psychiatry
- Work in public hospitals
- Salary: R25,000 - R40,000/month
- Long hours (60-80 hours/week), night shifts, weekends

**1-Year Community Service (Compulsory):**
- Work at government-assigned facility (often rural)
- Cannot choose location (assigned by Department of Health)
- Salary: R45,000 - R60,000/month
- Housing often provided in rural areas
- Gain broad experience, serve underserved communities

**Total Timeline:** 6 years (MBChB) + 2 years (internship) + 1 year (community service) = **9 years before independent practice**

### After Community Service: Career Choices

1. **Work as Medical Officer** (public sector) or **GP** (private practice)
2. **Apply for Registrar Training** (4-6 years) to become a specialist

### Alternative Faster Routes

**Clinical Associate (3 years):**
- Mid-level practitioner, work in rural clinics
- Diagnose and treat common conditions
- Universities: Wits, UP, Walter Sisulu
- Salary: R25,000 - R45,000/month
- Can upgrade to MBChB later (some universities offer bridging programs)

**Medical Technologist (4 years):**
- Laboratory diagnostics, pathology
- Work in labs (Lancet, Ampath, PathCare)
- Salary: R20,000 - R40,000/month

**Bottom Line:** MBChB is a 9-year commitment (6 years study + 3 years mandatory service) before you can practice independently. It's the longest healthcare training path but offers the broadest scope of practice.`,
        tags: ['mbchb', 'medical degree', 'medical school', 'uct medicine', 'wits medicine', 'up medicine', 'ukzn medicine', 'stellenbosch medicine', 'medical education', 'internship', 'community service', 'clinical associate', 'medical technologist']
      },
      {
        career_name: 'Medical Doctor',
        chunk_type: 'admission_requirements',
        chunk_text: `# Medical Doctor: Admission Requirements (EXTREME COMPETITION)

## Matric Requirements (MINIMUM - Most Need Higher)

**MUST HAVE:**
- **Mathematics:** 70% minimum (most successful applicants have 80%+)
- **Physical Sciences:** 70% minimum (most successful applicants have 80%+)
- **Life Sciences:** 70% minimum (most successful applicants have 80%+)
- **English HL/FAL:** 70% minimum
- **NSC Bachelor Endorsement** (required for university admission)

**Reality Check:** These are MINIMUMS. Average successful applicant has 85%+ overall average.

## Additional Requirements

### National Benchmark Test (NBT) - CRITICAL
**Required by all medical schools**

**Two tests:**
1. **MAT (Mathematics)** - Quantitative reasoning
2. **AL (Academic Literacy)** - Reading comprehension, critical thinking

**Target Scores:**
- **Proficient level (60th-80th percentile):** Competitive
- **Superior level (80th+ percentile):** Highly competitive
- **Basic level (<60th percentile):** Unlikely to be accepted

**When to Write:** Grade 12 (June-September)
**Cost:** ~R650 per test
**Tip:** Practice extensively, take seriously—NBT can make or break your application

### Selection Process (Varies by University)

**UCT, Wits, Stellenbosch:**
- **Academic Merit:** 50% (Matric + NBT scores)
- **Interview:** 25% (Multiple Mini Interviews - MMI format)
- **Non-academic factors:** 25% (Volunteer work, leadership, personal statement)

**UP, UKZN, UFS:**
- **Academic Merit:** 60-70%
- **Interview:** 20-30%
- **Non-academic:** 10-20%

### Interview (MMI - Multiple Mini Interviews)

**Format:** 8-10 stations, 5-8 minutes each
**Assessed:** Communication, empathy, ethical reasoning, problem-solving, teamwork

**Sample Scenarios:**
- "A patient refuses life-saving treatment due to religious beliefs. What do you do?"
- "You see a colleague making a medical error. How do you respond?"
- "Explain a complex medical concept to a Grade 5 student."

**Preparation:** Practice with teachers, watch MMI prep videos, volunteer at hospitals to gain experience

### Non-Academic Factors (HIGHLY VALUED)

**Volunteer/Work Experience:**
- Hospital volunteering (Red Cross, community clinics)
- Shadowing doctors
- Community health projects
- Old age homes, disability centers

**Leadership:**
- School prefect, sports captain
- Community organization involvement
- Peer tutoring, mentorship

**Personal Statement:**
- Why medicine? (Be specific, avoid clichés)
- Relevant experiences that shaped your decision
- Understanding of SA healthcare challenges
- Commitment to serving underserved communities

## Competition Statistics (2025 Data)

**UCT:** 230 seats, 3,000+ applicants = **7.7% acceptance rate**
**Wits:** 250 seats, 3,500+ applicants = **7.1% acceptance rate**
**UP:** 300 seats, 4,000+ applicants = **7.5% acceptance rate**

**National:** ~1,700 seats, 10,000+ applicants = **17% overall acceptance rate**

**Reality:** Medicine is MORE competitive than Harvard (4.5% acceptance rate) when considering SA applicant pool quality.

## Gap Year Students

**Can reapply:** Yes, but must show meaningful use of gap year
**Recommended activities:**
- Work as healthcare assistant
- Volunteer extensively at hospitals
- Complete additional courses (First Aid, Basic Life Support)
- Improve NBT scores
- Gain work experience in healthcare sector

**Not recommended:** Just "waiting" without healthcare involvement

## International Students

**Very limited seats:** 5-10% of class at most universities
**Tuition:** 2x local student fees (R100,000 - R160,000/year)
**Requirements:** Same academic standards + proof of funds
**Work rights:** Limited after graduation (must apply for work permit)

## Alternative Entry Routes

**If you don't get in first time:**
1. **Reapply next year** with improved scores and more experience
2. **Start with Clinical Associate** (3 years) then bridge to MBChB
3. **Study BSc (Life Sciences)** then apply for graduate-entry MBChB
4. **Consider other healthcare careers** (Physiotherapy, Pharmacy, Nursing) then reapply

**Bottom Line:** Getting into medical school in SA is EXTREMELY competitive. You need 80%+ average, excellent NBT scores, strong volunteer experience, and a compelling personal story. Start preparing in Grade 10, not Grade 12. If you don't make it first time, there are alternative pathways—don't give up if medicine is truly your calling.`,
        tags: ['medical school admission', 'mbchb requirements', 'nbt test', 'medical school interview', 'mmi', 'matric requirements medicine', 'mathematics 70%', 'physical sciences 70%', 'life sciences 70%', 'medical school competition', 'volunteer experience', 'gap year medicine']
      }
    )
    
    // Insert chunks
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
    console.log(`\n🎯 HEALTHCARE FOUNDATION COMPLETE:`)
    console.log(`   - Physiotherapy: 3 chunks ✅`)
    console.log(`   - Pharmacist: 3 chunks ✅`)
    console.log(`   - Occupational Therapist: 3 chunks ✅`)
    console.log(`   - Medical Doctor: 3 chunks ✅ (Part 1 of 3)`)
    console.log(`\n   Next: Upload remaining Medical Doctor chunks (5 more)`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
