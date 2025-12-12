#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('⚡ UPLOADING RENEWABLE ENERGY ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Renewable Energy Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Renewable Energy Engineer: Your 2026 Career Guide (SA's #1 Engineering Priority)

Renewable Energy Engineers design solar farms, wind turbines, and energy storage systems to solve SA's loadshedding crisis. This is SA's #1 ENGINEERING PRIORITY—R200B+ invested in REIPPP program. Work: Independent Power Producers (IPPs like Mainstream Renewable Power, Scatec), Eskom (grid integration), consulting (Aurecon, WSP—renewable projects), manufacturing (solar panel/wind turbine installers), government (DMRE—policy).

**Real SA Example:** As a renewable energy engineer at Mainstream Renewable Power, you design 100MW solar farms in Northern Cape, conduct wind resource assessments, size battery storage systems, model PPAs (Power Purchase Agreements), and manage grid connection studies with Eskom. You work with PVSyst, WindPro, and financial models—earning R60K+/month.

# Specializations
- **Solar PV Engineering:** Solar farm design, rooftop systems
- **Wind Engineering:** Wind turbine placement, resource assessment
- **Battery Storage Systems:** Energy storage, grid stabilization
- **Grid Integration:** Connecting renewables to Eskom grid
- **Hybrid Systems:** Solar + wind + batteries

## Why It's SA's Most Socially Impactful Career
- CRITICAL demand: 500+ active projects, 2,000+ engineers needed
- Literally keeping lights on during loadshedding
- Government target: 60% renewable by 2030
- R200B+ REIPPP investment = MASSIVE job creation

# Salary Progression (ZAR, 2025)
- Junior EPC Engineer (0-2 years): R30,000-R45,000/month
- Project Engineer (3-5 years): R50,000-R80,000/month
- Project Manager (5+ years): R85,000-R130,000/month
- Director/Head of Renewables: R150,000-R200,000+/month

**IPPs Pay Premium:** 20-30% above Eskom/government

**Employers:** IPPs (Mainstream, Scatec, ACWA, Enel), Eskom, consulting (Aurecon, WSP, Hatch), EPC contractors, equipment suppliers

**Key Difference:** Unlike traditional electrical engineers who design general power systems, renewable engineers specialize in INTERMITTENT energy sources and storage.`,
    tags: ['renewable energy engineer', '4ir', 'solar', 'wind', 'battery storage', 'loadshedding', 'reippp', 'grid integration', 'eskom', 'ipps']
  },
  {
    career_name: 'Renewable Energy Engineer',
    chunk_type: 'education',
    chunk_text: `# Renewable Energy Engineer: Education Path

**Degree:** BEng Electrical Engineering (4 years) OR BEng Mechanical Engineering (4 years) + MSc Renewable Energy (1-2 years)

**NO dedicated undergrad renewable degree in SA yet**—must do electrical/mechanical first

**Universities:** UCT MSc Renewable Energy (best in SA), Stellenbosch MSc Renewable Energy, Wits, UP have energy systems modules

**Admission:**
- Mathematics 70%+
- Physical Sciences 70%+
- English 60%+

**CRITICAL:** Choose final year projects in renewable energy—this is your portfolio

**Diploma Route:**
Electrical Engineering diploma (3 years) at DUT, TUT → BTech → Junior renewable technician (R20,000-R30,000) → employer funds BEng

**Alternative:** "Green Certificate" programmes—solar PV installer certification (1 month, R5,000-R10,000) can get you employed immediately installing panels (R15,000-R25,000/month)

**Career Progression:**
BEng → Junior EPC engineer (R30K-R45K) → Project Engineer (R50K-R75K) → Project Manager (R80K-R120K)

**Internships:** CRITICAL—apply to IPPs for vacation work in 2nd/3rd year. DMRE offers renewable energy learnerships.

**Software Skills:** Learn PVSyst (solar design software) and WindPro—employers value this`,
    tags: ['renewable energy education', 'beng electrical', 'beng mechanical', 'msc renewable energy', 'uct', 'stellenbosch', 'pvsyst', 'windpro', 'solar installer']
  },
  {
    career_name: 'Renewable Energy Engineer',
    chunk_type: 'salary',
    chunk_text: `# Renewable Energy Engineer: Salary & Job Outlook (PREMIUM Due to Urgency)

**Salaries (ZAR, 2025):**
- Junior EPC Engineer (0-2 years): R30,000-R45,000/month
- Project Engineer (3-5 years): R50,000-R80,000/month
- Project Manager (5+ years): R85,000-R130,000/month
- Director/Head of Renewables: R150,000-R200,000+/month

**IPPs Pay Premium:** Mainstream Renewable Power, Scatec, ACWA Power pay 20-30% above Eskom/government—graduate salary R40,000-R60,000

**Major Employers:**
- IPPs (Mainstream, Scatec, ACWA, Enel—500+ engineers)
- Eskom (grid integration team)
- Consulting (Aurecon, WSP, Hatch—project design)
- EPC contractors (building farms)
- Equipment suppliers (SMA Solar, Vestas Wind)
- DMRE (policy)

**International:** EU renewable boom—Germany, Netherlands hiring SA engineers: €5,000-€8,000/month (R100,000-R160,000)

**Remote Consulting:** Design solar farms for African projects from SA

**Freelance:** Small commercial/industrial solar design—R50,000-R150,000 per project

**Reality Check:**
- 70% of work is in SOLAR PV, 20% wind, 10% storage
- Grid integration is bottleneck—high demand for grid specialists
- Loadshedding urgency means FAST-TRACKED projects, high pressure but high reward

**Emerging:** Green hydrogen (R300B), offshore wind (R500B pipeline)—future job magnets`,
    tags: ['renewable energy salary', 'ipps salary', 'solar engineer salary', 'wind engineer salary', 'eskom', 'international renewable jobs']
  },
  {
    career_name: 'Renewable Energy Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Renewable Energy Engineer: Requirements & Skills

**Matric:**
- Mathematics 70%+
- Physical Sciences 70%+
- English 60%+

**ELECTRICAL ENGINEERING is OPTIMAL**—grid integration, power electronics critical. Mechanical engineers do wind turbine design.

**Essential Skills:**
- Electrical power systems
- Solar PV design (PVSyst software)
- Wind resource assessment (WindPro)
- Battery storage systems
- Grid connection studies
- Energy yield assessment
- Financial modelling (PPAs)

**Safety:** Working at heights (solar roofs), electrical safety CRITICAL

**Physical:** Site visits to solar/wind farms—outdoor work, travel

**Work-Life Balance:** Project-based—crunch during commissioning (60-80 hrs/week), but between projects is calm

**Personality:**
- Detail-oriented (energy calculations must be precise)
- Optimistic (solving SA's energy crisis)
- Resilient (project delays common)

**Software Mastery:**
- Excel (financial models)
- AutoCAD (layouts)
- PVSyst (solar)
- WindPro (wind)
- HOMER (hybrid systems)

**Grid Knowledge:** Understanding Eskom grid codes is SPECIALIZED skill—highly valued

**Pro Tip:** Do vacation work at Eskom Transmission—learn grid integration

**Foreign Qualifications:** ECSA evaluation for engineers; IPP experience valued globally`,
    tags: ['renewable energy requirements', 'mathematics 70%', 'physical sciences 70%', 'pvsyst', 'windpro', 'grid integration', 'eskom grid codes']
  },
  {
    career_name: 'Renewable Energy Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Renewable Energy Engineer: Bursaries & Funding (EXPANDING)

**Renewable energy bursaries—EXPANDING:**

**1. DMRE (Dept Mineral Resources & Energy) Renewable Energy Bursary:**
- R50,000-R80,000/year
- Service obligation at DMRE or IPPs
- Deadline: AUGUST
- PRIORITY for renewable career

**2. Eskom Bursary:**
- Electrical engineering with renewable energy focus
- 300+ awards
- Deadline: JULY

**3. CSIR Renewable Energy Research Bursary:**
- R100,000 for MSc in renewables
- Research-focused

**4. Mainstream Renewable Power Bursary:**
- Solar/wind focus
- R60,000-R80,000/year
- Internship GUARANTEED
- Deadline: MAY

**5. Scatec Solar Bursary:**
- Norwegian IPP
- 50+ awards for SA students
- Strong community development focus

**6. IPPs' Community Trusts:**
- Many IPPs have bursaries for local community youth
- Check project websites

**Alternative Path:**
Study BEng Electrical (Eskom/Transnet bursary) → specialize in renewables via MSc (company-funded)

**Diploma Route:**
Electrical diploma at DUT/TUT (NSFAS-covered) → solar installer cert (R5,000) → employed (R15,000-R25,000) → employer funds BEng

**Pro Tip:** DMRE bursary has LOWER competition than Eskom—apply there FIRST

**Engineering Bursary Pool:** R300M+/year for renewables

**Emerging:** Green Hydrogen Consortium launching bursaries 2025—watch for announcements`,
    tags: ['renewable energy bursaries', 'dmre bursary', 'eskom bursary', 'mainstream bursary', 'scatec bursary', 'csir', 'solar installer', 'green hydrogen']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', '4ir_emerging_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating 4IR emerging careers module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: '4ir_emerging_careers',
          description: '4IR and emerging technology careers',
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
            category: '4ir_emerging',
            tags: chunk.tags,
            sprint: 'Week 2 Day 4 - 4IR Emerging',
            source: `4ir_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ Renewable Energy Engineer: ${count}/5 chunks uploaded`)
    
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
