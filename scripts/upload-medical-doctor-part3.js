#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🩺 UPLOADING MEDICAL DOCTOR CONTENT - PART 3 (FINAL 3 CHUNKS)...\n')

const medicalDoctorChunks = [
  {
    career_name: 'Medical Doctor',
    chunk_type: 'specializations',
    chunk_text: `# Medical Doctor: Specializations & Career Paths

After completing MBChB (6 years) + Internship (2 years) + Community Service (1 year), doctors choose their career path:

## Option 1: General Practice (GP) - Fastest Path

**Timeline:** Start practicing immediately after community service (9 years total)

**What GPs Do:**
- Primary care for all ages and conditions
- Diagnose common illnesses, manage chronic diseases
- Refer complex cases to specialists
- Preventive care, health education
- Minor procedures (suturing, injections, IUD insertion)

**Work Settings:**
- Private practice (own clinic or group practice)
- Public clinics (government)
- Occupational health (companies, mines)
- Locum work (temporary shifts)

**Income:** R60,000 - R150,000/month (private practice, established)

**Pros:** Fastest to independent practice, broad scope, flexible
**Cons:** High patient load, less specialized, lower income than specialists

## Option 2: Specialist Training (Registrar) - 4-6 Years

**Application Process:**
- Apply for registrar posts (highly competitive)
- Requires excellent academic record + work experience
- Some specialties have entrance exams

**Training:** 4-6 years of supervised specialist training while working

### Surgical Specialties (5-6 years)

**General Surgery:**
- Abdominal operations, trauma surgery
- Competitiveness: High
- Income: R150,000 - R250,000/month (private)

**Orthopedic Surgery:**
- Bones, joints, fractures, joint replacements
- Competitiveness: VERY HIGH (most competitive surgical specialty)
- Income: R180,000 - R300,000/month

**Neurosurgery:**
- Brain and spine surgery
- Competitiveness: EXTREME (2-3 registrars accepted nationally/year)
- Income: R250,000 - R400,000+/month
- Training: 6 years

**Cardiothoracic Surgery:**
- Heart and lung surgery
- Competitiveness: EXTREME
- Income: R200,000 - R350,000/month

**Plastic & Reconstructive Surgery:**
- Cosmetic + reconstructive (burns, trauma)
- Competitiveness: VERY HIGH
- Income: R150,000 - R280,000/month

### Medical Specialties (4-5 years)

**Internal Medicine:**
- Adult medicine, complex medical conditions
- Subspecialties: Cardiology, Gastroenterology, Nephrology, Pulmonology
- Competitiveness: Moderate-High
- Income: R90,000 - R180,000/month

**Pediatrics:**
- Children's health (0-18 years)
- Subspecialties: Neonatology, Pediatric Cardiology
- Competitiveness: Moderate
- Income: R90,000 - R160,000/month

**Psychiatry:**
- Mental health, psychiatric disorders
- Competitiveness: Moderate (shortage of psychiatrists)
- Income: R80,000 - R140,000/month
- Work-life balance: Better than most specialties

**Obstetrics & Gynecology:**
- Women's reproductive health, pregnancy, childbirth
- Competitiveness: High
- Income: R100,000 - R180,000/month
- Hours: Unpredictable (deliveries at any time)

### Diagnostic & Support Specialties (4-5 years)

**Radiology:**
- Medical imaging (X-rays, CT, MRI, ultrasound)
- Competitiveness: HIGH
- Income: R120,000 - R200,000/month
- Work-life balance: Good (no night calls in private practice)

**Anesthesiology:**
- Anesthesia for surgeries, pain management
- Competitiveness: Moderate-High
- Income: R120,000 - R200,000/month
- Hours: Long (surgeries can run late)

**Pathology:**
- Laboratory medicine, disease diagnosis
- Subspecialties: Anatomical Pathology, Chemical Pathology, Hematology
- Competitiveness: Moderate
- Income: R100,000 - R180,000/month
- Work-life balance: Excellent (lab-based, regular hours)

**Emergency Medicine:**
- Emergency department, trauma, acute care
- Competitiveness: Moderate (growing field)
- Income: R90,000 - R150,000/month
- Hours: Shift work (day/night)

### Primary Care Specialties (4 years)

**Family Medicine:**
- Advanced primary care, community health
- Competitiveness: LOW (shortage, actively recruiting)
- Income: R70,000 - R120,000/month
- Work-life balance: Good
- High demand in rural areas

**Public Health Medicine:**
- Health policy, epidemiology, program management
- Competitiveness: LOW
- Income: R70,000 - R110,000/month
- Work: Government, WHO, NGOs (not clinical)

## Option 3: Academic Medicine

**Path:** Specialist training + MMed/PhD (research degree)
**Work:** University lecturer + clinical practice + research
**Income:** R80,000 - R150,000/month
**Pros:** Teaching, research, intellectual stimulation
**Cons:** Lower income than pure private practice

## How to Choose Your Specialty

**Consider:**
1. **Interest:** What medical conditions fascinate you?
2. **Lifestyle:** Surgery = long hours; Pathology = regular hours
3. **Income:** Neurosurgery pays most; Psychiatry pays less
4. **Competitiveness:** Can you get into that specialty?
5. **Personality:** Surgeon = decisive, quick; Psychiatrist = patient, empathetic
6. **Work-life balance:** Emergency Medicine = shift work; Obstetrics = unpredictable

**Exposure During Medical School:**
- Years 4-6 rotations help you discover interests
- Shadow specialists, ask questions
- Consider lifestyle implications (family, hobbies)

**Don't Choose Based on Money Alone:**
- You'll spend 40+ years in this specialty
- Passion and interest matter more than R50K/month difference
- Burnout is real—choose what you love

## Emerging/Growing Specialties in SA

**Geriatric Medicine:** Aging population, high demand
**Palliative Care:** End-of-life care, growing field
**Sports Medicine:** Growing with sports industry
**Addiction Medicine:** Substance abuse epidemic
**Telemedicine:** Remote consultations (post-COVID growth)

## Bottom Line

After 9 years of training (MBChB + internship + community service), you choose:
- **GP:** Start practicing immediately, broad scope, good income
- **Specialist:** 4-6 more years training, higher income, focused practice
- **Academic:** Teaching + research + clinical, lower income but intellectually rewarding

Most doctors work as GPs for 2-5 years before applying for specialist training. This gives you time to:
- Pay off student debt
- Gain clinical experience
- Decide which specialty truly interests you
- Build competitive CV for registrar applications

**Choose based on passion, not just money. You'll be doing this for 40+ years.**`,
    tags: ['medical specializations', 'gp vs specialist', 'surgery specialties', 'internal medicine', 'pediatrics', 'psychiatry', 'radiology', 'anesthesiology', 'family medicine', 'registrar training', 'specialist income', 'medical career paths']
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

    // Add remaining 2 chunks
    medicalDoctorChunks.push(
      {
        career_name: 'Medical Doctor',
        chunk_type: 'challenges_sa_context',
        chunk_text: `# Medical Doctor: Challenges & SA Context

## The Reality of Being a Doctor in South Africa

Medicine is rewarding but comes with significant challenges unique to the SA context.

### Challenge 1: Workload & Burnout

**Public Sector:**
- Interns work 60-80 hours/week
- 24-hour shifts common
- Patient load: 40-60 patients/day (should be 20-30)
- Understaffing chronic

**Example:** As an intern at Chris Hani Baragwanath Hospital, you might see 50+ patients in a 12-hour shift, with limited senior support, making life-or-death decisions while exhausted.

**Burnout Rate:** 40-50% of SA doctors report burnout symptoms

### Challenge 2: Resource Constraints

**Public Hospitals:**
- Medication shortages (patients can't afford prescriptions)
- Equipment breakdowns (X-ray machines, ventilators)
- Bed shortages (patients in corridors)
- Limited specialist support in rural areas

**Reality:** You'll often have to improvise, make do with limited resources, and face ethical dilemmas about rationing care.

### Challenge 3: Violence & Safety

**Hospital Violence:**
- Assaults on healthcare workers increasing
- Patients' families threatening staff
- Theft of equipment, medications
- Security inadequate at many public hospitals

**High-Crime Areas:**
- Hospitals in townships face gang violence
- Trauma cases from shootings, stabbings daily
- Staff parking areas unsafe

**Mental Health Impact:** Many doctors experience PTSD from violence exposure

### Challenge 4: Rural Service & Isolation

**Community Service (Mandatory 1 Year):**
- Often placed in remote rural areas
- Limited specialist backup
- Basic equipment only
- Social isolation (far from family/friends)
- Language barriers (need to learn local languages)

**Example:** Placed in a rural Eastern Cape clinic, you're the only doctor for 50km radius, handling everything from deliveries to trauma to chronic disease management, with no specialist to consult.

**Coping:** Many doctors find rural service rewarding despite challenges—direct impact, grateful communities.

### Challenge 5: Malpractice & Litigation

**Malpractice Lawsuits:**
- Increasing litigation culture in SA
- Patients suing for adverse outcomes
- Even good doctors face lawsuits
- Stressful, time-consuming legal processes

**Malpractice Insurance:**
- Mandatory: R15,000 - R50,000/year
- Higher for high-risk specialties (Obstetrics, Surgery)
- Premiums increasing annually

**Defensive Medicine:** Doctors order extra tests to avoid lawsuits, increasing healthcare costs.

### Challenge 6: Brain Drain & Emigration

**Why Doctors Leave SA:**
- Better pay abroad (UK: £60,000-£100,000 = R1.4M-R2.3M/year)
- Better working conditions
- Safety concerns
- Better work-life balance
- Children's education/future

**Popular Destinations:**
- United Kingdom (NHS)
- Canada
- Australia
- New Zealand
- Middle East (UAE, Saudi Arabia)

**Impact:** SA loses 30-40% of medical graduates to emigration within 10 years of qualification.

**Ethical Dilemma:** SA taxpayers fund your training (R1M+ subsidy), then you leave. Some argue for mandatory service periods.

### Challenge 7: NHI Uncertainty

**National Health Insurance (NHI):**
- Government plan for universal healthcare
- May shift doctors to salaried positions
- Private practice income may decrease
- Implementation timeline unclear (2026-2030)
- Many doctors uncertain about future

**Concerns:**
- Will salaries be competitive?
- Will private practice still be viable?
- Will quality of care improve or decline?

### Challenge 8: HIV/TB Burden

**SA has world's largest HIV epidemic:**
- 8 million+ people living with HIV
- TB co-infection common
- Drug-resistant TB increasing
- Occupational exposure risk (needle sticks)

**Emotional Toll:** Treating young patients dying from preventable diseases.

### Challenge 9: Mental Health & Suicide

**Doctor Suicide Rate:** Higher than general population
- Stress, burnout, depression common
- Stigma prevents seeking help
- Long hours leave no time for self-care

**Support Available:**
- SASOP (SA Society of Psychiatry) offers counseling
- Doctor support groups
- Employee assistance programs

**Culture Shift Needed:** Medicine is moving toward acknowledging mental health struggles.

## The Rewards (Why Doctors Stay)

Despite challenges, many doctors find medicine deeply rewarding:

**Patient Impact:**
- Saving lives, alleviating suffering
- Building long-term patient relationships
- Being there for people in their most vulnerable moments

**Intellectual Stimulation:**
- Constant learning, complex problem-solving
- Medical advances, new treatments
- Every patient is different

**Respect & Status:**
- Doctors highly respected in SA society
- Trusted profession
- Influence on health policy

**Job Security:**
- 31,000+ vacancies—you'll always find work
- Diverse career options (clinical, academic, policy, industry)
- Portable skills (can work internationally)

**Community Service:**
- Especially in rural areas, you're a hero
- Direct, visible impact on underserved communities
- Gratitude from patients

## Coping Strategies

**For Burnout:**
- Set boundaries (learn to say no)
- Take leave regularly
- Find hobbies outside medicine
- Connect with colleagues (peer support)

**For Safety:**
- Work in teams, never alone
- Know hospital security protocols
- Park in safe areas
- Trust your instincts

**For Rural Service:**
- Connect with other rural doctors (online groups)
- Learn local language basics
- Embrace the experience (it's only 1 year)
- Document interesting cases for learning

**For Mental Health:**
- Seek counseling early (don't wait for crisis)
- Join doctor support groups
- Practice self-care (exercise, sleep, nutrition)
- Remember why you chose medicine

## Bottom Line

**Being a doctor in SA is HARD.** You'll face:
- Long hours, high stress, burnout risk
- Resource constraints, violence, litigation
- Rural service, brain drain pressure
- HIV/TB burden, mental health challenges

**But it's also PROFOUNDLY MEANINGFUL.** You'll:
- Save lives, alleviate suffering
- Serve underserved communities
- Have job security and respect
- Make a real difference in SA's health crisis

**Don't romanticize medicine.** It's not Grey's Anatomy. It's exhausting, stressful, and sometimes heartbreaking.

**But if you're passionate about patient care, resilient, and committed to serving SA, medicine can be incredibly rewarding.**

**Ask yourself:** Am I choosing medicine because I genuinely want to help people, or because of status/money/family pressure? Only choose medicine if your answer is the former.`,
        tags: ['doctor challenges', 'medical burnout', 'hospital violence', 'rural service', 'malpractice', 'brain drain', 'doctor emigration', 'nhi impact', 'hiv tb burden', 'doctor mental health', 'doctor suicide', 'sa healthcare challenges']
      },
      {
        career_name: 'Medical Doctor',
        chunk_type: 'alternative_pathways',
        chunk_text: `# Medical Doctor: Alternative Healthcare Careers

If MBChB is too competitive, too long, or too expensive, consider these alternative healthcare careers that still allow you to make a significant impact:

## 1. Clinical Associate (Mid-Level Practitioner)

**What They Do:**
- Diagnose and treat common medical conditions
- Work in rural clinics, district hospitals
- Bridge gap between nurses and doctors
- Perform minor procedures, prescribe medications

**Education:**
- **Degree:** Bachelor of Clinical Medical Practice (3 years)
- **Universities:** Wits, UP, Walter Sisulu University
- **Requirements:** Mathematics 50%+, Physical Sciences 50%+, Life Sciences 60%+
- **Cost:** R120,000 - R180,000 total (much cheaper than MBChB)

**Career:**
- Work in rural/underserved areas (government placement)
- Salary: R25,000 - R45,000/month
- Can upgrade to MBChB later (some universities offer bridging programs)

**Pros:**
- Faster (3 years vs 6 years)
- Cheaper (R180K vs R500K+)
- Lower matric requirements (50% vs 70%+)
- Direct patient care
- High demand (critical shortage)

**Cons:**
- Limited scope (can't do surgery, complex cases)
- Lower income than doctors
- Mostly rural placements
- Less prestige

**Best For:** Students who want to practice medicine but don't have 70%+ marks or can't afford MBChB.

## 2. Medical Technologist (Laboratory Diagnostics)

**What They Do:**
- Perform laboratory tests (blood, urine, tissue samples)
- Diagnose diseases through lab analysis
- Work in pathology labs (Lancet, Ampath, PathCare)
- Specialize in hematology, microbiology, chemical pathology

**Education:**
- **Degree:** BSc Medical Technology (4 years) or National Diploma (3 years)
- **Universities:** UKZN, UJ, TUT, DUT
- **Requirements:** Mathematics 50%+, Physical Sciences 60%+, Life Sciences 60%+
- **Cost:** R160,000 - R240,000 total

**Career:**
- Work in hospital labs, private pathology companies
- Salary: R20,000 - R40,000/month (entry to mid-career)
- Specialists: R40,000 - R70,000/month

**Pros:**
- Regular hours (no night shifts, weekends)
- Good work-life balance
- Job security (labs always needed)
- Less stressful than clinical medicine

**Cons:**
- No direct patient contact
- Lab-based (not for everyone)
- Lower income than doctors

**Best For:** Students who love science but prefer lab work over patient interaction.

## 3. Emergency Care Practitioner (Advanced Paramedic)

**What They Do:**
- Respond to medical emergencies (ambulance, helicopter)
- Provide advanced life support
- Stabilize patients before hospital
- Work for EMS, Netcare 911, ER24

**Education:**
- **Degree:** Bachelor of Emergency Medical Care (4 years) or Diploma (3 years)
- **Universities:** UJ, DUT, CUT
- **Requirements:** Mathematics 50%+, Physical Sciences 50%+, Life Sciences 50%+
- **Cost:** R140,000 - R200,000 total

**Career:**
- Work for emergency services, private ambulance companies
- Salary: R18,000 - R35,000/month
- Shift work (day/night)

**Pros:**
- Action-packed, adrenaline-filled
- Direct life-saving impact
- Faster training than medicine
- Diverse work environments

**Cons:**
- High stress, traumatic cases
- Shift work (irregular hours)
- Physical demands (lifting patients)
- Lower income than doctors

**Best For:** Students who want action, emergency medicine, but not 6 years of medical school.

## 4. Physiotherapist (Already Covered)

**Quick Summary:**
- 4 years BSc Physiotherapy
- Help patients recover movement after injury/illness
- Salary: R22,000 - R80,000/month
- Requirements: Life Sciences 60%+, Mathematics 50%+
- Good work-life balance, high demand

## 5. Occupational Therapist (Already Covered)

**Quick Summary:**
- 4 years BSc Occupational Therapy
- Help patients regain daily living skills
- Salary: R20,000 - R90,000/month
- Requirements: Life Sciences 60%+, Math OR Math Lit 60%+
- Very high demand, especially mental health and pediatrics

## 6. Pharmacist (Already Covered)

**Quick Summary:**
- 4 years BPharm
- Dispense medications, counsel patients
- Salary: R15,000 - R80,000/month
- Requirements: Physical Sciences 60%+, Mathematics 50%+
- Stable employment, diverse career paths

## 7. Nursing (Professional Nurse)

**What They Do:**
- Direct patient care in hospitals, clinics
- Administer medications, monitor patients
- Assist doctors, coordinate care
- Specialize in ICU, theater, community health

**Education:**
- **Degree:** Bachelor of Nursing (4 years) or Diploma (3 years)
- **Universities:** All major universities + nursing colleges
- **Requirements:** Mathematics OR Math Lit 50%+, Life Sciences 50%+, English 50%+
- **Cost:** R120,000 - R200,000 (degree) or R60,000 - R100,000 (diploma)

**Career:**
- Work in hospitals, clinics, schools, occupational health
- Salary: R15,000 - R50,000/month
- Critical shortage (31,000+ vacancies)

**Pros:**
- Direct patient care
- High demand, job security
- Diverse specializations
- Can upgrade to advanced practice nurse

**Cons:**
- Shift work (day/night/weekends)
- Physically demanding
- High stress, burnout risk
- Lower income than doctors

**Best For:** Students who want direct patient care but more accessible entry requirements.

## Comparison Table

| Career | Duration | Cost | Entry Requirements | Salary Range | Demand |
|--------|----------|------|-------------------|--------------|--------|
| Medical Doctor | 6 years | R500K+ | 70%+ all sciences | R50K-R250K+ | Critical |
| Clinical Associate | 3 years | R180K | 50-60% sciences | R25K-R45K | Critical |
| Medical Technologist | 4 years | R200K | 50-60% sciences | R20K-R70K | High |
| Emergency Care | 4 years | R180K | 50% sciences | R18K-R35K | High |
| Physiotherapist | 4 years | R240K | 60% Life Sci, 50% Math | R22K-R80K | Very High |
| Occupational Therapist | 4 years | R240K | 60% Life Sci, Math Lit OK | R20K-R90K | Very High |
| Pharmacist | 4 years | R240K | 60% Phys Sci, 50% Math | R15K-R80K | Stable |
| Professional Nurse | 4 years | R180K | 50% sciences, Math Lit OK | R15K-R50K | Critical |

## Bridging to Medicine Later

**Some alternative careers allow you to upgrade to MBChB:**

1. **Clinical Associate → MBChB:** Some universities offer bridging programs (2-3 years)
2. **BSc (Life Sciences) → Graduate-Entry MBChB:** 4-year accelerated program (UCT, Wits)
3. **Work Experience → Reapply:** Gain healthcare experience, improve application

**Strategy:** If you don't get into medicine first time, start with Clinical Associate or BSc, work for 2-3 years, save money, then reapply with stronger CV.

## Bottom Line

**Don't give up on healthcare if MBChB doesn't work out.** There are MANY rewarding healthcare careers that:
- Require lower matric scores (50-60% vs 70%+)
- Cost less (R180K-R240K vs R500K+)
- Take less time (3-4 years vs 6 years)
- Still allow you to help people and make a difference

**Clinical Associate is the closest alternative to being a doctor** - you diagnose, treat, prescribe, but with 3 years training instead of 6.

**Choose based on your interests:**
- Love lab work? → Medical Technologist
- Love emergencies? → Emergency Care Practitioner
- Love rehabilitation? → Physiotherapist/Occupational Therapist
- Love medications? → Pharmacist
- Love direct patient care? → Nursing

**All these careers are in HIGH DEMAND in SA. You'll find work, make good money, and help people.**`,
        tags: ['clinical associate', 'medical technologist', 'emergency care practitioner', 'alternative to medicine', 'healthcare careers', 'mid-level practitioner', 'paramedic', 'laboratory medicine', 'bridging to medicine', 'healthcare alternatives']
      }
    )
    
    // Upload chunks
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
    
    console.log(`\n✅ MEDICAL DOCTOR COMPLETE: ${count}/${medicalDoctorChunks.length} chunks uploaded`)
    
    const { count: total } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Total chunks in database: ${total}`)
    console.log(`\n🎉 HEALTHCARE FOUNDATION COMPLETE!`)
    console.log(`   - Physiotherapy: 3 chunks ✅`)
    console.log(`   - Pharmacist: 3 chunks ✅`)
    console.log(`   - Occupational Therapist: 3 chunks ✅`)
    console.log(`   - Medical Doctor: 8 chunks ✅`)
    console.log(`   - Total: 17 healthcare career chunks`)
    console.log(`\n   Next: Generate embeddings and test healthcare coverage!`)
    
  } catch (err) {
    console.error('Fatal error:', err.message)
    process.exit(1)
  }
}

upload()
