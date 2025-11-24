#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('⚡ UPLOADING ELECTRICAL ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Electrical Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Electrical Engineer: Your 2026 Career Guide

Electrical Engineers design, develop, and maintain electrical systems—from power grids to renewable energy to telecommunications. In South Africa, they're critical for: Eskom power generation/distribution, renewable energy (solar farms, wind turbines), mining electrification, telecommunications (MTN, Vodacom towers), and manufacturing automation.

**Real SA Example:** As an electrical engineer at Eskom's Kusile Power Station, you design high-voltage switchgear, troubleshoot turbine control systems, and ensure 4,800 MW of power flows safely to the national grid. You work with protection relays, SCADA systems, and transformer maintenance.

# Specializations
- **Power Systems:** Grid management, substations, Eskom
- **Renewable Energy:** Solar PV design, wind farm integration (HOTTEST area)
- **Control & Automation:** PLCs, SCADA, Industry 4.0
- **Telecommunications:** Network infrastructure, 5G rollout
- **Electronics:** Circuit design, embedded systems

## Why It's Critical in SA
- Load shedding crisis = massive demand for power engineers
- Renewable energy boom (IRP 2030: 18 GW solar, 8 GW wind)
- Scarce skills list = premium salaries

# Salary Progression (ZAR, 2025)
- Graduate (no PE): R28,000-R38,000/month
- Professional Engineer (PE, 3-5 years): R45,000-R70,000/month
- Senior/Manager (10+ years): R75,000-R130,000/month
- Principal/Director: R160,000+/month

**Renewable Energy Premium:** 15-25% higher than traditional roles

**Employers:** Eskom, renewable IPPs (BioTherm, Mainstream), Transnet, mines (Anglo, Sibanye), telecoms (MTN, Vodacom), consulting (AECOM, Zutari)

**Key Difference from Electronic:** Electrical = power/energy systems. Electronic = low-voltage circuits/devices.`,
    tags: ['electrical engineer', 'engineering', 'power systems', 'renewable energy', 'eskom', 'solar', 'wind energy', 'pe registration', 'ecsa', 'load shedding', 'mathematics', 'physical sciences']
  },
  {
    career_name: 'Electrical Engineer',
    chunk_type: 'education',
    chunk_text: `# Electrical Engineer: Education Path

**Degree:** BEng Electrical Engineering (4 years)

**Universities:** Wits, UP, UCT, Stellenbosch, UKZN, NWU (power systems focus)

**Admission:** Mathematics 75%+, Physical Sciences 75%+, English 60%+ (highly competitive: 80%+)
**AP Mathematics:** Strongly recommended

**Tuition:** R45,000-R75,000/year

**Curriculum:** Circuit Theory, Power Systems, Control Systems, Electromagnetics, Digital Electronics, Renewable Energy

**After Degree:** Work under registered engineer for 3 years → ECSA Professional Engineer (PE) exam

**Without PE:** Cannot sign off electrical installations or start own firm (legal requirement)

**Alternative:** National Diploma (3 years) at DUT, TUT, CPUT for technician route → BTech for technologist

**Renewable Energy Focus:** Stellenbosch, UP have specialized renewable energy modules`,
    tags: ['electrical engineering education', 'beng electrical', 'ecsa', 'pe registration', 'wits', 'uct', 'up', 'stellenbosch', 'mathematics 75%', 'physical sciences 75%', 'renewable energy']
  },
  {
    career_name: 'Electrical Engineer',
    chunk_type: 'salary',
    chunk_text: `# Electrical Engineer: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Graduate (in training): R28,000-R38,000/month
- Professional Engineer (PE, 3-5 years): R45,000-R70,000/month
- Senior/Manager (10+ years): R75,000-R130,000/month
- Principal/Director: R160,000+/month

**PE Registration:** Typically increases salary by 25-35%

**Renewable Energy Premium:** Solar/wind engineers earn 15-25% more than traditional roles

**Major Employers:**
- Eskom (power generation, transmission)
- Renewable IPPs (BioTherm, Mainstream, Scatec)
- Mining houses (Anglo, Sibanye, Implats)
- Transnet (rail electrification)
- Telecoms (MTN, Vodacom, Telkom)
- Consulting firms (AECOM, Zutari, WSP) - premium pay
- Municipalities (infrastructure)

**Job Outlook:** EXCELLENT—5,000+ vacancies, renewable energy boom, load shedding crisis

**International:** Australia, Canada, Middle East actively recruit SA electrical engineers`,
    tags: ['electrical engineer salary', 'engineering salary', 'pe registration', 'eskom', 'renewable energy jobs', 'solar jobs', 'wind energy', 'load shedding']
  },
  {
    career_name: 'Electrical Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Electrical Engineer: Requirements & Skills

**Matric:** Mathematics 75%+, Physical Sciences 75%+, English 60%+
**Life Sciences:** Not required
**EGD (Engineering Graphics & Design):** Not required

**Personality:** Analytical problem-solver, detail-oriented, safety-conscious, enjoys complex systems

**Essential Skills:**
- Circuit analysis, power systems
- CAD software (AutoCAD Electrical, ETAP)
- Programming (Python, MATLAB for simulations)
- Safety regulations (SANS 10142, OHS Act)

**Physical:** None, but substation/plant work requires safety gear, working at heights

**Work-Life Balance:** Generally good (40-50 hrs/week) except during outages/emergencies

**Gender:** Male-dominated (85%) but female engineers highly sought for diversity

**ECSA CPD:** 25 hours/year continuous development required

**Foreign Qualifications:** ECSA evaluation required, may need adaption exam

**Safety Critical:** High-voltage work requires strict adherence to safety protocols`,
    tags: ['electrical engineering requirements', 'mathematics 75%', 'physical sciences 75%', 'ecsa', 'autocad electrical', 'safety', 'sans 10142']
  },
  {
    career_name: 'Electrical Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Electrical Engineer: Bursaries & Financial Aid

**Electrical Engineering bursaries are ABUNDANT (power crisis = high demand):**

**1. Eskom Bursary**
- Full tuition + R60,000 stipend + accommodation
- 500+ awarded annually (electrical is priority)
- Work-back at Eskom required (excellent experience)
- Deadline: July
- Apply: www.eskom.co.za/careers

**2. Transnet Bursary**
- Rail electrification focus
- Full cost + stipend
- Deadline: August

**3. Sibanye-Stillwater Bursary**
- Mining electrification
- 100+ awards
- Deadline: September

**4. MTN/Vodacom Bursaries**
- Telecommunications focus
- Competitive stipends

**5. SANEDI (SA National Energy Development Institute)**
- Renewable energy focus
- R40,000-R60,000/year

**6. NSTF (National Students Financial Aid)**
- Government scheme

**University Merit:** Wits, UP have Dean's bursaries (R20,000-R40,000 for 75%+ average)

**Private Loans:** Fundi, Nedbank at prime +1%

**Tips:** Apply to ALL—success rate increases dramatically. Maintain 65% average to retain. Eskom bursary is most accessible.`,
    tags: ['electrical engineering bursaries', 'eskom bursary', 'transnet bursary', 'sibanye bursary', 'mtn bursary', 'engineering funding', 'nstf', 'renewable energy funding']
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
    
    console.log(`\n✅ Electrical Engineer: ${count}/5 chunks uploaded`)
    
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
