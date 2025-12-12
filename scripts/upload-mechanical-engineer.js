#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('⚙️ UPLOADING MECHANICAL ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Mechanical Engineer: Your 2026 Career Guide

Mechanical Engineers design, analyze, and manufacture mechanical systems—everything from car engines to power plants to wind turbines. In South Africa, they work across diverse industries: automotive (Toyota, VW, Ford plants in Eastern Cape), mining equipment (Anglo American, Implats), renewable energy (wind turbine design, solar thermal), manufacturing, and government infrastructure (Transnet, PRASA).

**Real SA Example:** As a mechanical engineer at Toyota's Prospecton plant in Durban, you design production line automation, optimize assembly processes, and troubleshoot equipment failures. You work with robotics, hydraulics, and quality control systems to ensure 400+ vehicles roll off the line daily.

# Specializations
- **HVAC:** Building climate control, energy efficiency
- **Automotive:** Vehicle design, manufacturing, EV technology
- **Aerospace:** Aircraft maintenance, Denel
- **Robotics & Automation:** Industrial automation, Industry 4.0
- **Energy Systems:** Power generation, wind turbines, solar thermal

## Why It's Critical in SA
- 5,000+ vacancies, renewable energy boom, manufacturing base
- Scarce skills list = higher salaries, easier work permits

# Salary Progression (ZAR, 2025)
- Graduate (no PE): R25,000-R35,000/month
- Professional Engineer (PE, 3-5 years): R40,000-R65,000/month
- Senior/Manager (10+ years): R70,000-R120,000/month
- Principal/Director: R150,000+/month

**PE Registration Premium:** 20-30% salary increase

**Employers:** Transnet, Eskom, SASOL, Toyota, VW, Ford, Anglo American, consulting firms (AECOM, WSP)

**Key Difference from Civil:** Mechanical = moving parts/thermal systems. Civil = static structures.`,
    tags: ['mechanical engineer', 'engineering', 'automotive', 'renewable energy', 'hvac', 'robotics', 'manufacturing', 'pe registration', 'ecsa', 'mathematics', 'physical sciences']
  },
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'education',
    chunk_text: `# Mechanical Engineer: Education Path

**Degree:** BEng Mechanical Engineering (4 years)

**Universities:** Wits, UP, UCT, Stellenbosch, UKZN, NWU, UFS

**Admission:** Mathematics 70%+, Physical Sciences 70%+, English 60%+ (competitive: 75%+)
**AP Mathematics:** Strongly recommended

**Tuition:** R45,000-R75,000/year

**Curriculum:** Thermodynamics, Fluid Mechanics, Strength of Materials, CAD, Manufacturing

**After Degree:** Work under registered engineer for 3 years → ECSA Professional Engineer (PE) exam

**Without PE:** Cannot sign off projects or start own firm

**Alternative:** National Diploma (3 years) at DUT, TUT, VUT for technician route → BTech for technologist`,
    tags: ['mechanical engineering education', 'beng mechanical', 'ecsa', 'pe registration', 'wits', 'uct', 'up', 'stellenbosch', 'mathematics 70%', 'physical sciences 70%']
  },
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'salary',
    chunk_text: `# Mechanical Engineer: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Graduate (in training): R25,000-R35,000/month
- Professional Engineer (PE, 3-5 years): R40,000-R65,000/month
- Senior/Manager (10+ years): R70,000-R120,000/month
- Principal/Director: R150,000+/month

**PE Registration:** Typically increases salary by 20-30%

**Major Employers:**
- Transnet (rail equipment)
- Eskom (power generation)
- SASOL (chemical processing)
- Automotive OEMs (VW, Toyota, Ford)
- Mining houses (Anglo, Implats)
- Consulting firms (AECOM, WSP) - premium pay
- Renewable energy companies

**Renewable Energy Boom:** Wind/solar companies hiring aggressively

**International:** Canada, Australia actively recruit SA engineers (skills shortage list)`,
    tags: ['mechanical engineer salary', 'engineering salary', 'pe registration', 'transnet', 'eskom', 'sasol', 'automotive', 'renewable energy jobs']
  },
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Mechanical Engineer: Requirements & Skills

**Matric:** Mathematics 70%+, Physical Sciences 70%+, English 60%+
**Life Sciences:** Not required
**EGD (Engineering Graphics & Design):** Advantageous but not mandatory

**Personality:** Analytical problem-solver, detail-oriented, practical, enjoys hands-on work

**Essential Skills:**
- CAD software (SolidWorks, AutoCAD)
- Thermodynamics, mechanics
- Project management, teamwork

**Physical:** None, but factory visits require safety gear

**Work-Life Balance:** Generally good (40-50 hrs/week) except project deadlines

**Gender:** Male-dominated (80%) but female engineers highly sought for diversity

**ECSA CPD:** 25 hours/year continuous development required

**Foreign Qualifications:** ECSA evaluation required, may need adaption exam`,
    tags: ['mechanical engineering requirements', 'mathematics 70%', 'physical sciences 70%', 'cad', 'solidworks', 'ecsa', 'egd']
  },
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Mechanical Engineer: Bursaries & Financial Aid

**Mechanical Engineering bursaries are PLENTIFUL:**

**1. Eskom Bursary**
- Full tuition + stipend + accommodation
- 500+ awarded annually
- Work-back at Eskom required
- Deadline: July

**2. SASOL Bursary**
- Full cost, strong preference for Mechanical/Chemical
- 300+ awards
- Deadline: March

**3. Transnet Bursary**
- Rail/port infrastructure focus
- Deadline: August

**4. Murray & Roberts Bursary**
- Construction/engineering
- Excellent mentor program

**5. AEMFC (African Exploration Mining)**
- Mining-focused

**6. NSTF (National Students Financial Aid)**
- Government scheme

**University Merit:** Wits, UP have Dean's bursaries (R20,000-R40,000 for 75%+ average)

**Private Loans:** Fundi, Nedbank at prime +1%

**Tips:** Apply to ALL—success rate increases dramatically. Maintain 65% average to retain.`,
    tags: ['mechanical engineering bursaries', 'eskom bursary', 'sasol bursary', 'transnet bursary', 'murray roberts', 'engineering funding', 'nstf']
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
    
    console.log(`\n✅ Mechanical Engineer: ${count}/5 chunks uploaded`)
    
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
