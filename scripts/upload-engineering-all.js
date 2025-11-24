#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('⚙️ UPLOADING ENGINEERING CONTENT (25 CHUNKS)...\n')
console.log('Careers: Mechanical, Electrical, Civil, Chemical, Software\n')

const engineeringChunks = [
  // MECHANICAL ENGINEER (5 chunks)
  {
    career_name: 'Mechanical Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Mechanical Engineer: Your 2026 Career Guide

Mechanical Engineers design, analyze, and manufacture mechanical systems—everything from car engines to power plants to wind turbines. In South Africa, they work across diverse industries: automotive (Toyota, VW, Ford plants in Eastern Cape), mining equipment (Anglo American, Implats), renewable energy (wind turbine design, solar thermal), manufacturing, and government infrastructure (Transnet, PRASA).

**Real SA Example:** As a mechanical engineer at Toyota's Prospecton plant in Durban, you design production line automation, optimize assembly processes, and troubleshoot equipment failures. You work with robotics, hydraulics, and quality control systems to ensure 400+ vehicles roll off the line daily.

# Daily Responsibilities
- CAD modeling and 3D design (SolidWorks, AutoCAD)
- Stress analysis and thermal calculations
- Project management and cost estimation
- Factory troubleshooting and maintenance optimization
- Collaborate with electrical engineers, technicians, production teams
- Ensure compliance with SANS (South African National Standards)

# Specializations

**HVAC (Heating, Ventilation, Air Conditioning):**
- Building climate control systems
- Energy efficiency optimization
- Work with consulting firms, property developers

**Automotive Engineering:**
- Vehicle design, manufacturing processes
- Work at OEMs (Toyota, VW, Ford) or suppliers
- Growing: Electric vehicle (EV) technology

**Aerospace:**
- Aircraft maintenance, design
- Denel, private aviation companies
- Limited but specialized market in SA

**Robotics & Automation:**
- Industrial automation, production lines
- Growing field with Industry 4.0

**Energy Systems:**
- Power generation, renewable energy
- Wind turbines, solar thermal systems
- MASSIVE growth area due to loadshedding

## Why It's Critical in SA
- **High Demand:** 5,000+ vacancies on PNET, LinkedIn
- **Renewable Energy Boom:** Wind and solar projects need mechanical engineers
- **Manufacturing Base:** Automotive, mining equipment manufacturing
- **Infrastructure Maintenance:** Transnet, Eskom need maintenance engineers
- **Scarce Skills:** Government scarce skills list = easier work permits, higher salaries

# Salary Progression (ZAR, 2025 data)
- **Graduate Engineer (in training, no PE):** R25,000 - R35,000/month
- **Professional Engineer (3-5 years, PE registered):** R40,000 - R65,000/month
- **Senior Engineer/Manager (10+ years):** R70,000 - R120,000/month
- **Principal Engineer/Director:** R150,000+/month

**PE Registration Premium:** 20-30% salary increase after Professional Engineer registration

**Employers Hiring:** Transnet, Eskom, SASOL, Toyota, VW, Ford, Anglo American, Implats, consulting firms (AECOM, WSP), renewable energy companies

**Key Difference from Civil Engineering:** Mechanical engineers focus on moving parts, thermal systems, and machinery. Civil engineers build static structures (buildings, bridges, roads).

**Bottom Line:** Mechanical engineering offers diverse career paths, strong salaries, and excellent job security. If you have Mathematics and Physical Sciences 70%+ and enjoy problem-solving with physical systems, this is an excellent choice. PE registration is essential for career advancement.`,
    tags: ['mechanical engineer', 'engineering', 'automotive', 'renewable energy', 'hvac', 'robotics', 'manufacturing', 'grade 11', 'grade 12', 'mathematics', 'physical sciences', 'pe registration', 'ecsa']
  }
]

async function upload() {
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
          description: 'Engineering careers: Mechanical, Electrical, Civil, Chemical, Software',
          priority: 1
        })
        .select()
        .single()
      module = newModule
    }
    
    console.log(`✓ Module ready: ${module.module_name}\n`)
    
    let count = 0
    console.log('Uploading chunks...\n')
