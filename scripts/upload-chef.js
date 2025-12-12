#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('👨‍🍳 UPLOADING CHEF CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Chef',
    chunk_type: 'career_overview',
    chunk_text: `# Electrician: Your 2026 Career Guide (SA's Most Stable Trade)

Electricians install and maintain electrical systems—wiring, lighting, power distribution, solar PV installations. In SA's construction and renewable energy boom, this is CRITICAL SKILL—massive shortage. Work: Construction companies, electrical contractors, mines, manufacturing, self-employed, renewable energy (solar installation).

**Real SA Example:** As a qualified electrician at a solar installation company, you install backup power systems for homes and businesses during loadshedding. You wire solar panels, connect inverters, install batteries, test systems, and issue Certificates of Compliance (COCs). You earn R35K/month plus overtime, with demand so high you're booked 3 months ahead.

# Specializations
- **Residential Wiring:** Houses, apartments
- **Commercial Installations:** Offices, shops
- **Industrial Maintenance:** Factories, plants
- **Solar PV Installation:** HUGE growth area
- **High-Voltage:** Eskom, mines

## Why It's Critical in SA
- CRITICAL demand: 30,000+ vacancies, chronic shortage
- Cannot be outsourced—local demand permanent
- Loadshedding increased demand 200% for solar installations
- Stable income, always needed

# Salary Progression (ZAR, 2025)
- Apprentice Year 1-2: R5,000-R8,000/month
- Apprentice Year 3-4: R8,000-R12,000/month
- Qualified Electrician: R20,000-R35,000/month
- Experienced (5+ years): R35,000-R50,000/month
- Master Electrician/Contractor: R40,000-R80,000/month
- Solar PV Specialist: R30,000-R50,000 (20-30% premium)

**Path:** Matric OR Grade 9 → Apprenticeship (3-4 years) → Trade Test → Qualified → Wireman's License → Master

**NO university required—earn while you learn**

**Key Difference:** Unlike engineers who design systems, electricians DO THE HANDS-ON WORK—practical, essential

**SA Context:** Must register with Department of Labour, Electrical Contracting Board (ECB), pass Trade Test at MERSETA`,
    tags: ['electrician', 'trades', 'apprenticeship', 'solar pv', 'merseta', 'trade test', 'wiremans license', 'loadshedding', 'earn while learning']
  },
  {
    career_name: 'Electrician',
    chunk_type: 'education',
    chunk_text: `# Electrician: Education & Apprenticeship Path

**Pathway 1 (TRADITIONAL):**
- Matric with Mathematics 50%+ and Physical Sciences 50% (helps but NOT mandatory—Grade 9 can start)
- Find employer willing to take apprentice—construction companies, electrical contractors, mines
- Apprenticeship: 3-4 years—work 80% of time, attend trade school 20% (TVET college)

**Trade School:**
- DUT, TUT, VUT, CPUT, public TVET colleges
- N1-N6 Electrical Engineering certificates
- Cost: R5,000-R15,000/year (NSFAS covers TVET!)
- Employer usually pays if you sign apprenticeship contract

**Trade Test:**
- After 3-4 years and N6 certificate, register at MERSETA
- Test: Theory exam + practical assessment
- Cost: R2,000-R4,000
- Pass rate: 70% if properly prepared

**Wireman's License:**
- After trade test, apply to Department of Labour
- Allows you to sign COCs (Certificate of Compliance)
- Requires: Trade certificate, 2 years post-trade experience, pass wireman's exam
- Cost: R1,500-R3,000

**Pathway 2 (ACCELERATED):**
Complete N1-N6 full-time at TVET college (2 years, NSFAS-covered) → find employer for 12-month practical → trade test

**Pathway 3 (SOLAR SPECIALIST):**
After qualified, do solar PV installer course (1 week, R3,000-R8,000)—Green Card certification from SAWEA. HIGH DEMAND, premium salary.

**Timeline:** Grade 9 → Apprentice (3-4 years) → Qualified (R20K-R35K) → Wireman's License (2 years) → Master (R40K-R80K)

**Total:** 5-7 years to master status`,
    tags: ['electrician education', 'apprenticeship', 'tvet', 'nsfas', 'merseta', 'trade test', 'wiremans license', 'solar certification', 'green card']
  },
  {
    career_name: 'Electrician',
    chunk_type: 'salary',
    chunk_text: `# Electrician: Salary & Job Outlook (STABLE with Growth)

**Salaries (ZAR, 2025):**
- Apprentice Year 1-2: R5,000-R8,000/month (employer pays, plus trade school)
- Apprentice Year 3-4: R8,000-R12,000/month
- Qualified Electrician: R20,000-R35,000/month
- Experienced (5+ years): R35,000-R50,000/month
- Master Electrician/Contractor: R40,000-R80,000/month (self-employed, variable)
- Solar PV Specialist: R30,000-R50,000 (premium 20-30% above general)
- High-Voltage (Eskom, mines): R40,000-R70,000/month

**Major Employers:**
- Electrical contractors (Burmeister, Conco, Power Group)
- Construction (WBHO, Murray & Roberts)
- Mines (Anglo, Implats—industrial electricians)
- Eskom (high-voltage)
- Manufacturing (Toyota, VW)
- Solar companies (Sola, Genergy)

**Self-Employed:**
- Residential callouts: R500-R1,500 per job
- COCs: R1,500-R3,000 each
- Can earn R40,000-R80,000/month if established

**International:** Australia, Canada, UK desperate for electricians—SA trade certificate recognized after assessment
- Salary: AUD 6,000-10,000/month (R70,000-R120,000)

**Renewables Boom:** Solar installation is GOLDMINE—every home/business installing backup. Electrician with solar cert is UNEMPLOYABLE (in a good way!)

**Job Security:** Cannot be outsourced, always needed for maintenance, new construction, loadshedding solutions

**Contracting:** Daily rates R800-R1,500 for qualified electricians

**SA Context:** Construction sector cyclical—downturns affect hiring, but maintenance work always exists`,
    tags: ['electrician salary', 'apprentice salary', 'solar premium', 'self employed', 'international', 'australia', 'job security', 'contracting rates']
  },
  {
    career_name: 'Electrician',
    chunk_type: 'requirements',
    chunk_text: `# Electrician: Requirements & Skills

**Matric:** NOT MANDATORY—Grade 9 with Mathematics 50%+ and Physical Sciences 50% can start apprenticeship. BUT Matric increases employer preference.

**Essential Skills:**
- Technical aptitude (understand circuits, voltage)
- Problem-solving (fault finding)
- Physical fitness (climb ladders, work in confined spaces)
- Safety consciousness (electricity kills)
- Color vision (identify wires)
- Manual dexterity (handle tools)

**Safety Training:** Mandatory before apprenticeship—Basic Electrical Safety (1 week, R1,000-R2,000). MUST understand lock-out/tag-out procedures.

**Tools:** Apprentice must buy basic tool set (R2,000-R5,000):
- Multimeter
- Screwdrivers, pliers, wire strippers
- Safety boots (R500-R1,000)
- Hard hat (R200)
- Employer provides specialized tools

**Registration Steps:**
1. Department of Labour—register as apprentice
2. MERSETA—track training logbook
3. Trade Test at MERSETA-accredited centre
4. Electrical Contracting Board (ECB)—register as qualified electrician
5. Wireman's License—Department of Labour, allows signing COCs

**COCs (Certificate of Compliance):**
- Legal requirement for all electrical installations
- R1,500-R3,000 per certificate
- Only Wireman's License holder can sign
- Major income source for contractors

**Insurance:** Professional indemnity essential (R500-R1,000/month)

**Physical:** Work at heights (roofs for solar), confined spaces (ceilings), outdoor in all weather

**Work-Life Balance:**
- Apprenticeship: 40-45 hrs/week
- Qualified: 45-50 hrs/week
- Self-employed: variable (can be 60+ hrs)
- On-call for emergencies

**Gender:** Male-dominated but women electricians highly sought after—some contractors actively recruit women`,
    tags: ['electrician requirements', 'grade 9', 'no matric required', 'safety training', 'tools', 'merseta', 'ecb', 'cocs', 'physical demands']
  },
  {
    career_name: 'Electrician',
    chunk_type: 'bursaries',
    chunk_text: `# Electrician: Bursaries & Solar Specialization

**Electrician bursaries—DIFFERENT from academic:**

**1. TVET College NSFAS:**
- NSFAS fully covers N1-N6 Electrical Engineering at public TVET colleges
- Includes tuition, accommodation, stipend
- This is PRIMARY funding route
- Apply via NSFAS website by November

**2. Employer-Funded Apprenticeships:**
- Major contractors (Burmeister, Conco, Power Group)
- Mines (Anglo, Implats)
- Eskom
- They pay for trade school, salary during training, tools
- Competition is MODERATE
- Apply in Grade 11/12
- Requirements: Mathematics 50%+, Physical Sciences 50%+, technical aptitude

**3. SETAs (Sector Education & Training Authorities):**
- MERSETA, Energy SETA have discretionary grants for apprentices
- Apply through employer

**4. Solar PV Specialization:**
- After qualified, do Green Card certification (SAWEA, 1 week, R3,000-R8,000)
- HIGH DEMAND—solar companies hiring qualified electricians aggressively
- Some solar companies sponsor this training (e.g., Sola, Genergy)

**Self-Funded:** If no bursary, TVET college fees R5,000-R15,000/year—work part-time to fund

**Apprenticeship Advantage:** Earn while you learn—apprentice salary R5K-R12K/month covers living costs

**International Funding:** Australia, Canada offer skilled migrant visas—once qualified, can move

**Business Startup:**
- After Wireman's License, start own contractor business
- ECB registration R2,000, insurance R500/month
- Market: Solar installation (loadshedding boom), residential wiring, COCs
- Income potential: R40,000-R100,000/month if you build client base

**SA Context:** National Skills Fund (NSF) offers grants for trades—apply via Department of Labour

**Pro Tip:** Start at TVET college (NSFAS-covered), get N3 certificate, approach employers for apprenticeship—shows commitment

**CRITICAL:** Solar PV certification is SHORT-TERM GOLDMINE—can earn R30K-R50K/month immediately`,
    tags: ['electrician bursaries', 'nsfas', 'tvet', 'apprenticeship', 'employer funded', 'merseta', 'solar certification', 'green card', 'business startup']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'trades_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating trades careers module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'trades_careers',
          description: 'Trades and vocational careers',
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
            category: 'trades',
            tags: chunk.tags,
            sprint: 'Week 3 - Trades',
            source: `trades_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ Electrician: ${count}/5 chunks uploaded`)
    
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
