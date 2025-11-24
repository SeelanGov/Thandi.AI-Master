#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🏗️ UPLOADING CIVIL ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Civil Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# Civil Engineer: Your 2026 Career Guide

Civil Engineers design and build infrastructure—roads, bridges, dams, buildings, water systems. In SA, CRITICAL role in infrastructure backlog (R2 trillion maintenance deficit). Work: Government (SANRAL, Dept of Public Works), consulting firms (Aurecon, WSP, SMEC), construction companies (WBHO, Murray & Roberts), mining (tailings dams), water boards.

**Real SA Example:** As a civil engineer at SANRAL, you design highway upgrades on the N3 between Johannesburg and Durban. You calculate load-bearing capacity for heavy trucks, design drainage systems for KZN's heavy rains, and manage R500 million construction contracts with multiple contractors.

# Specializations
- **Structural:** Buildings, bridges, earthquake design
- **Transportation:** Roads, rail, traffic engineering
- **Water Resources:** Dams, supply, flood control
- **Geotechnical:** Soil, foundations, mining
- **Construction Management:** Site-based project delivery

## Why It's Critical in SA
- Infrastructure backlog: R2T maintenance deficit
- Water crisis: aging pipes, drought management
- Scarce skills list = premium salaries

# Salary Progression (ZAR, 2025)
- Graduate (EIT): R22,000-R32,000/month
- Professional Engineer (PE, 3-5 years): R40,000-R60,000/month
- Senior/Manager (10+ years): R65,000-R110,000/month
- Principal/Director: R130,000+/month

**PE Registration Premium:** 25-40% salary increase

**Employers:** SANRAL, Dept Public Works, municipalities, Aurecon, WSP, SMEC, WBHO, Murray & Roberts, water boards, mining houses

**Key Difference from Architect:** Architects focus on aesthetics, civil engineers ensure structures are SAFE and STAND UP.`,
    tags: ['civil engineer', 'engineering', 'infrastructure', 'roads', 'bridges', 'water', 'sanral', 'pe registration', 'ecsa', 'egd', 'mathematics', 'physical sciences']
  },
  {
    career_name: 'Civil Engineer',
    chunk_type: 'education',
    chunk_text: `# Civil Engineer: Education Path

**Degree:** BEng Civil Engineering (4 years) or BSc Engineering (Civil)

**Universities:** Wits, UP, UCT, Stellenbosch, UKZN, NWU, NMU

**Admission:** Mathematics 70%+, Physical Sciences 70%+, English 60%+ (competitive: 75%+)
**EGD (Engineering Graphics & Design):** HIGHLY ADVANTAGEOUS—universities give 10-15% admission preference for EGD 75%+

**Tuition:** R45,000-R75,000/year

**Curriculum:** Structural Analysis, Fluid Mechanics, Geotechnical Engineering, Transportation Engineering, Concrete Design

**After Degree:** 3-year mentorship → ECSA Professional Engineer (PE) exam

**Without PE:** Cannot sign off structural drawings—MAJOR career limitation

**Alternative:** National Diploma (3 years) at DUT, TUT, CPUT for technician route → BTech

**Gap Year Tip:** Work as engineering assistant at consulting firms—they hire matriculants with Maths/Physics 70%+ for assistant roles, giving huge university application advantage`,
    tags: ['civil engineering education', 'beng civil', 'ecsa', 'pe registration', 'wits', 'uct', 'up', 'stellenbosch', 'mathematics 70%', 'physical sciences 70%', 'egd highly recommended']
  },
  {
    career_name: 'Civil Engineer',
    chunk_type: 'salary',
    chunk_text: `# Civil Engineer: Salary & Job Outlook

**Salaries (ZAR, 2025):**
- Graduate (EIT—Engineer in Training): R22,000-R32,000/month
- Professional Engineer (PE, 3-5 years): R40,000-R60,000/month
- Senior/Project Manager (10+ years): R70,000-R110,000/month
- Principal/Director: R130,000+/month

**PE Registration Premium:** Registered engineers earn 25-40% more—critical for career growth

**Major Employers:**
- Government (SANRAL, Dept Public Works, municipalities)
- Consultants (Aurecon, WSP, SMEC, Hatch)
- Contractors (WBHO, Group Five, Murray & Roberts)
- Water boards, mining houses

**Infrastructure Push:** Government R800B infrastructure fund creating jobs, but procurement delays common

**International:** Middle East (Dubai, Qatar) actively recruits SA civil engineers for tax-free salaries (R80,000-R150,000/month)

**Water Engineering:** GROWING—climate change driving dam/water treatment projects

**Construction Management:** Premium pay for site-based work`,
    tags: ['civil engineer salary', 'engineering salary', 'pe registration', 'sanral', 'infrastructure jobs', 'water engineering', 'construction management']
  },
  {
    career_name: 'Civil Engineer',
    chunk_type: 'requirements',
    chunk_text: `# Civil Engineer: Requirements & Skills

**Matric:** Mathematics 70%+, Physical Sciences 70%+, English 60%+
**EGD (Engineering Graphics & Design):** CRITICAL—universities give 10-15% admission preference for EGD 75%+
**If no EGD:** Take online courses or Saturday classes at universities (Wits, UP offer this)

**Personality:** Detail-oriented, safety-conscious (lives depend on your calculations), patient with bureaucracy

**Essential Skills:**
- CAD (AutoCAD, Civil 3D)
- Structural analysis (STAAD.Pro)
- Project management (Primavera P6)
- Geotechnical investigation
- Concrete/steel design

**Physical:** Must do site visits—hard hat, safety boots, outdoor work

**Work-Life Balance:** Design office roles 40-50 hrs/week; site-based construction managers 60+ hrs

**Gender:** Male-dominated but changing—female engineers valued for diversity

**ECSA Registration:** Non-negotiable for senior roles

**SAICE:** SA Institution of Civil Engineering provides CPD and networking`,
    tags: ['civil engineering requirements', 'mathematics 70%', 'physical sciences 70%', 'egd critical', 'cad', 'autocad', 'structural analysis', 'ecsa', 'saice']
  },
  {
    career_name: 'Civil Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# Civil Engineer: Bursaries & Financial Aid

**Civil Engineering bursaries—PLENTIFUL:**

**1. SANRAL Bursary**
- Full cost + stipend
- FOR CIVIL ENGINEERING ONLY
- 200+ awards
- Post-grad work at SANRAL (great employer)
- Deadline: August

**2. Eskom Bursary**
- Civil for power station infrastructure

**3. Transnet Bursary**
- Ports, rail infrastructure

**4. Murray & Roberts Bursary**
- Construction/civil focus

**5. Aurecon Bursary**
- Consulting firm, offers bursary + vacation work
- Excellent mentor program

**6. SASOL Bursary**
- Civil for plant infrastructure

**7. Dept of Water & Sanitation**
- Water engineering bursaries, critical skills

**University Merit:** All universities offer Dean's bursaries for 75%+ average

**Private Loans:** Fundi, Nedbank at prime +1%

**EGD Advantage:** Students with EGD 75%+ have 30% higher bursary success rate

**Service Contracts:** Typically 1 year work per bursary year

**Total Pool:** R400M+/year. Apply to 10-15 to secure 1-2.`,
    tags: ['civil engineering bursaries', 'sanral bursary', 'eskom bursary', 'transnet bursary', 'murray roberts', 'aurecon', 'water sanitation', 'engineering funding']
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
    
    console.log(`\n✅ Civil Engineer: ${count}/5 chunks uploaded`)
    
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
