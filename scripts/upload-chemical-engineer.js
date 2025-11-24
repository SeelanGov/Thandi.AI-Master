#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧪 UPLOADING CHEMICAL ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Chemical Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Chemical Engineer: Your 2026 Career Guide

Chemical Engineers design processes to convert raw materials into products—fuels, plastics, pharmaceuticals, food. In SA, DOMINANT industries: Petrochemicals (SASOL, PetroSA), mining (mineral processing, Anglo, Implats), pharmaceuticals (Aspen, Adcock), food & beverages (SABMiller, Pioneer Foods), water treatment.

**Real SA Example:** As a chemical engineer at SASOL's Secunda plant, you optimize the coal-to-liquid fuel process, troubleshoot reactor performance, conduct safety audits, and manage R50M process improvement projects. You work with distillation columns, reactors, and process control systems producing 150,000 barrels/day.

# Specializations
- **Process Engineering:** Plant design, optimization
- **Petrochemicals:** Fuels, plastics production
- **Biotechnology:** Pharmaceuticals, fermentation
- **Environmental Engineering:** Waste treatment, emissions
- **Nuclear:** Future energy (Koeberg, Pebble Bed)

## Why It's Critical in SA
- SASOL R1T+ operations, mining R1T+ sector
- Green hydrogen R300B investment
- Scarce skills list = premium salaries

# Salary Progression (ZAR, 2025)
- Graduate (process engineer trainee): R30,000-R40,000/month (HIGHEST graduate salary)
- Professional Engineer (PE, 3-5 years): R50,000-R80,000/month
- Senior/Plant Manager (10+ years): R90,000-R140,000/month
- Principal/Technical Director: R160,000+/month

**SASOL Premium:** 20-30% above market with bonuses

**Employers:** SASOL, PetroSA, Anglo, Implats, Aspen, SABMiller, consulting (Worley, Hatch, Fluor)

**Key Difference from Chemist:** Chemists research in labs, chemical engineers SCALE UP to industrial production.`,
    tags: ['chemical engineer', 'engineering', 'petrochemicals', 'sasol', 'mining', 'pharmaceuticals', 'process engineering', 'pe registration', 'ecsa', 'green hydrogen', 'mathematics', 'physical sciences']
  },
  {
    career_name: 'Chemical Engineer',
    chunk_type: 'education',
    chunk_text: `# Chemical Engineer: Education Path

**Degree:** BEng Chemical Engineering (4 years) or BSc Chemical Engineering

**Universities:** Wits, UP, UCT, Stellenbosch, UKZN, NWU

**Admission:** Mathematics 70%+, Physical Sciences 70%+, English 60%+ (competitive: 75%+)
**Life Sciences:** Helpful for biotechnology track

**Tuition:** R45,000-R75,000/year

**Curriculum:** Thermodynamics, Mass & Energy Balances, Reaction Engineering, Process Control, Separation Processes, Plant Design

**After Degree:** 3-year mentorship → ECSA Professional Engineer (PE) exam

**Without PE:** Cannot sign off process designs or safety systems

**Alternative:** National Diploma (3 years) at DUT, TUT for chemical technician → BTech

**SASOL Graduate Training:** 1-2 year programmes that count toward PE mentorship—HIGHLY COMPETITIVE but GUARANTEE employment

**Lowest Dropout Rate:** Among engineering disciplines due to strong career prospects`,
    tags: ['chemical engineering education', 'beng chemical', 'ecsa', 'pe registration', 'wits', 'uct', 'up', 'stellenbosch', 'mathematics 70%', 'physical sciences 70%', 'sasol graduate training']
  },
  {
    career_name: 'Chemical Engineer',
    chunk_type: 'salary',
    chunk_text: `# Chemical Engineer: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Graduate (process engineer trainee): R30,000-R40,000/month—HIGHEST graduate engineering salary
- Professional Engineer (PE, 3-5 years): R50,000-R80,000/month
- Senior/Plant Manager (10+ years): R90,000-R140,000/month
- Principal/Technical Director: R160,000+/month

**SASOL Premium:** SASOL chemical engineers earn 20-30% above market with bonuses

**Major Employers:**
- SASOL (largest, Secunda, Sasolburg)
- PetroSA (Mossel Bay)
- Mining houses (Anglo, Implats, Amplats)
- Pharmaceuticals (Aspen, Adcock)
- Food (SABMiller, Tiger Brands)
- Consulting (Worley, Hatch, Fluor)

**Emerging:** Green hydrogen projects (R300B investment), renewable diesel—engineering firms hiring aggressively

**Process Safety Engineers:** Premium R80,000-R120,000 due to high responsibility

**Production Managers:** R120,000-R180,000 at plants

**International:** Middle East petrochemicals, Australia mining

**PE Registration:** Essential for senior roles—adds 30% salary premium`,
    tags: ['chemical engineer salary', 'engineering salary', 'pe registration', 'sasol', 'petrosa', 'green hydrogen', 'process safety', 'plant manager']
  },
  {
    career_name: 'Chemical Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Chemical Engineer: Requirements & Skills

**Matric:** Mathematics 70%+, Physical Sciences 70%+, English 60%+
**Life Sciences:** Recommended (especially for pharma/biotech track)

**Key Skill:** PROCESS THINKING—must visualize entire production flow from raw material to final product

**Essential Skills:**
- Process simulation (Aspen HYSYS, UniSim)
- Mass & energy balances
- Thermodynamics
- Safety analysis (HAZOP)
- Project economics

**Physical:** Plant visits require safety gear, climbing towers, outdoor work

**Work-Life Balance:** Plant-based roles have shift work (12-hour shifts, 4 days on/4 off); design/consulting 40-50 hrs/week

**Personality:** Detail-oriented, safety-conscious, enjoys optimization

**Gender:** Male-dominated but companies actively recruiting women for diversity

**ECSA Registration:** Required for senior roles

**SAIChemE:** SA Institute of Chemical Engineers provides CPD, networking

**Process Safety Training:** MANDATORY at major employers`,
    tags: ['chemical engineering requirements', 'mathematics 70%', 'physical sciences 70%', 'life sciences recommended', 'process simulation', 'aspen hysys', 'hazop', 'ecsa', 'saicheme']
  },
  {
    career_name: 'Chemical Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Chemical Engineer: Bursaries & Financial Aid

**Chemical Engineering bursaries—VERY PLENTIFUL:**

**1. SASOL Bursary (KING of chemical engineering)**
- FULL COST + stipend
- 400+ awards
- GUARANTEED employment
- Deadline: MARCH (CRITICAL!)
- Apply in GRADE 11—SASOL opens early
- Requires consistent 70%+ in Maths/Physics

**2. Eskom Bursary**
- Chemical for water treatment, emissions control

**3. Anglo American/Implats/Amplats**
- Mining extraction/processing
- 200+ awards

**4. PetroSA Bursary**
- Petrochemicals focus

**5. Clover/Danone**
- Food process engineering

**6. SABMiller Bursary**
- Beverage processing

**7. SASOL Mining**
- Mineral processing focus

**University Merit:** All engineering faculties offer merit bursaries for 75%+ average

**Private Loans:** Fundi, Nedbank at prime +1%

**Service Contract:** 1 year per bursary year at SASOL (SECUNDA or SASOLBURG relocation likely)

**Total Pool:** R500M+/year

**Success Tip:** Apply to 8-10, secure 2-3. Maintain 65% average to retain.`,
    tags: ['chemical engineering bursaries', 'sasol bursary', 'eskom bursary', 'anglo american', 'petrosa', 'sabmiller', 'engineering funding', 'grade 11 application']
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
    
    console.log(`\n✅ Chemical Engineer: ${count}/5 chunks uploaded`)
    
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
