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
    chunk_text: `# Chef: Your 2026 Career Guide (Tourism Recovery Driving Demand)

Chefs prepare food professionally in restaurants, hotels, catering, cruise ships. In SA's tourism/hospitality sector (3.7% of GDP), this is HIGH DEMAND—especially post-COVID recovery. Work: Restaurants (fine dining to fast casual), hotels (Sun International, Tsogo Sun, Protea), catering companies, cruise ships (international), self-employed (food truck, private chef, meal prep).

**Real SA Example:** As a Sous Chef at a Sun International hotel in Cape Town, you manage a team of 8 cooks, prepare 200+ meals daily for buffet and à la carte, create seasonal menus, manage food costs, and train junior chefs. You work 12-hour shifts including weekends—earning R32K/month plus meals and uniform.

# Specializations
- **Executive Chef:** Runs entire kitchen
- **Sous Chef:** Second-in-command
- **Chef de Partie:** Section chef (grill, pastry, sauce)
- **Pastry Chef:** Desserts specialist
- **Private Chef:** For wealthy families
- **Food Stylist:** For ads, photography

## Why It's High Demand
- Tourism recovery creating 10,000+ chef jobs
- Skills shortage: SA needs 5,000+ qualified chefs
- International opportunities (cruise ships, UAE, UK)
- Cannot be automated

# Salary Progression (ZAR, 2025)
- Commis Chef (entry): R8,000-R15,000/month
- Chef de Partie: R15,000-R25,000/month
- Sous Chef: R25,000-R40,000/month
- Executive Chef (5+ years): R40,000-R80,000/month (top hotels R80K-R120K)
- Private Chef: R50,000-R150,000/month

**International:** Cruise ships $2,000-$4,000/month (R35K-R70K) tax-free + accommodation/food

**Path:** Matric → Culinary School (1-2 years) OR Apprenticeship → Commis → CDP → Sous → Executive

**NO university required—practical skills paramount**

**Reality Check:** Unlike cooking at home, professional cheffing is HIGH PRESSURE—fast-paced, long hours, physically demanding, hot kitchens, weekend/holiday work`,
    tags: ['chef', 'trades', 'culinary', 'hospitality', 'tourism', 'cruise ships', 'private chef', 'no university', 'high pressure']
  },
  {
    career_name: 'Chef',
    chunk_type: 'education',
    chunk_text: `# Chef: Education Pathways (Two Main Routes)

**1. CULINARY SCHOOL (Formal):**

**Top Schools:**
- Capsicum Culinary Studio (Jhb, CT, DBN—1 year diploma R55,000-R95,000)
- Prue Leith Culinary Institute (Jhb—2 year diploma R95,000-R150,000, includes accommodation)
- Institute of Culinary Arts (ICA, Stellenbosch—2 year advanced R120,000-R180,000)
- SA Chefs Academy (Durbanville—1 year R50,000-R80,000)

**Admission:** Matric preferred BUT NOT mandatory—some schools accept Grade 11 with experience
**NO mathematics/science required**—passion and aptitude sufficient

**Programme:** Practical cooking (60%), theory (nutrition, hygiene, costing), internship (3-6 months)

**2. APPRENTICESHIP (Earn While Learning):**
- Join hotel/restaurant as kitchen steward/demi-chef
- Work up through ranks while learning on job
- Many hotels (Sun International, Tsogo Sun) have internal training programmes
- Pays R4,000-R8,000/month while you train

**Path:** Commis (1-2 years) → Chef de Partie (2-3 years) → Sous (3-5 years) → Executive (5-10 years)

**Short Courses:** For those unsure—Capsicum, Prue Leith offer 3-month intro courses (R15,000-R25,000) to test interest

**Certifications:**
- Food Safety (HACCP)—mandatory for all chefs (1 week, R2,000-R4,000)
- City & Guilds Diploma (UK qualification)—offered at some SA schools, recognized globally for cruise ships/overseas work

**Diploma vs Apprenticeship:**
- Diploma: Faster (1-2 years) but costs money
- Apprenticeship: Slower (5-7 years to Executive) but you earn while learning

**NSFAS:** Covers culinary diplomas at public TVET colleges (R5,000-R15,000/year)

**Pro Tip:** Work in kitchen during school holidays—shows passion, builds experience, helps secure apprenticeship`,
    tags: ['chef education', 'culinary school', 'capsicum', 'prue leith', 'apprenticeship', 'no matric required', 'haccp', 'nsfas', 'earn while learning']
  },
  {
    career_name: 'Chef',
    chunk_type: 'salary',
    chunk_text: `# Chef: Salary & Job Outlook (Hierarchy-Based)

**Salaries (ZAR, 2025):**
- Commis Chef (entry, 0-2 years): R8,000-R15,000/month
- Chef de Partie (section chef, 2-4 years): R15,000-R25,000/month
- Sous Chef (second-in-command, 4-7 years): R25,000-R40,000/month
- Executive Chef (runs kitchen, 7-15 years): R40,000-R80,000/month (top hotels R80K-R120K)
- Private Chef (wealthy families): R50,000-R150,000/month (plus accommodation, car)

**International Opportunities:**
- Cruise Ships: R35,000-R70,000/month tax-free PLUS free accommodation, food, medical—save 90% of salary
- UAE (Dubai): R25,000-R50,000 tax-free
- UK pubs: £1,800-£2,500/month (R40,000-R55,000)

**Other Roles:**
- Food Stylist (ads, TV): R500-R2,000/day freelance
- Catering Business: Self-employed, R20,000-R100,000/month (variable, depends on clients)

**SA Sectors:**
- Hotels: Most stable, benefits
- Fine dining restaurants: Lower pay (R8K-R15K) but prestige
- Chain restaurants (Spur, Doppio): Better pay (R12K-R20K for Commis)
- Catering: Event-based

**Job Outlook:**
- Tourism recovery post-COVID driving demand
- 10,000+ chef jobs created 2023-2024
- Skills shortage: SA produces 2,000 culinary graduates/year but needs 5,000+

**Career Progression:** Executive Chef → Food & Beverage Manager → General Manager (hotel)

**Some open own restaurants:** High risk, high reward

**Pro Tip:** Specialize early—pastry chefs always in demand, sushi chefs earn premium (R30,000-R50,000)`,
    tags: ['chef salary', 'commis chef', 'sous chef', 'executive chef', 'cruise ships', 'private chef', 'international', 'tourism', 'skills shortage']
  },
  {
    career_name: 'Chef',
    chunk_type: 'requirements',
    chunk_text: `# Chef: Requirements & Skills (Passion + Stamina Required)

**Matric:** NOT MANDATORY—some culinary schools accept Grade 11
**Hospitality Studies 60%+** helpful but not required

**Essential Skills:**
- Passion for food (non-negotiable)
- Stamina (stand 10-14 hours)
- Time management (juggle multiple orders)
- Teamwork (kitchen is brigade)
- Creativity (plate presentation)
- Pressure handling (Friday night rush)
- Attention to detail (consistency)

**Physical Demands (EXTREME):**
- On feet 10-14 hours
- Lift heavy pots (5-10kg)
- Hot kitchen (30-40°C)
- Cuts/burns common
- Repetitive strain injuries (wrists, back)

**Safety:**
- Knife skills (proper handling)
- Fire safety
- Food safety (HACCP certification mandatory—1 week, R2,000-R4,000)
- Chemical safety (cleaning agents)

**Certifications:**
- HACCP (food safety)—MANDATORY
- First Aid (recommended, R1,000-R2,000)

**Personality:**
- Thick skin (chefs shout)
- Resilience
- Passion
- Teamwork
- Creativity under pressure

**Work Environment:**
- High stress, fast pace, loud, hot
- Hierarchical (Executive Chef is boss)
- Hours: 10-14 hour shifts, weekends, public holidays
- Miss family events

**Benefits:** Hotels provide uniforms, meals, sometimes accommodation

**Gender:** Male-dominated but changing—many female pastry chefs, some head chefs

**Health:** Back/knee problems common—wear good shoes (R1,000-R2,000 chef clogs), stretch, gym for strength

**SA Context:**
- Must understand diverse cuisines—SA fusion, braai, Cape Malay, Indian, African dishes
- Religious dietary requirements—halal, kosher certification important

**Languages:** English essential, Afrikaans helpful, African languages advantage`,
    tags: ['chef requirements', 'no matric required', 'physical demands', 'haccp', 'stamina', 'passion', 'long hours', 'high pressure', 'food safety']
  },
  {
    career_name: 'Chef',
    chunk_type: 'bursaries',
    chunk_text: `# Chef: Bursaries & International Opportunities

**Chef bursaries—LIMITED but options exist:**

**1. NSFAS:**
- Covers culinary diplomas at public TVET colleges (R5,000-R15,000/year)
- FULLY FUNDED for qualifying students (family income <R350k)
- Apply via NSFAS website by November

**2. School-Specific Bursaries:**
- Prue Leith, Capsicum offer limited merit bursaries (R10,000-R30,000)
- Apply directly to school

**3. Employer-Sponsored:**
- Hotels (Sun International, Tsogo Sun) sponsor staff for culinary diplomas
- Work 2 years, they pay for school
- Approach HR

**4. SETAs:**
- CATHSSETA (Culture, Arts, Tourism, Hospitality) offers discretionary grants
- Apply through employer

**5. International Scholarships:**
- Prue Leith: Occasional full bursaries for disadvantaged students
- Capsicum: Work-back bursaries (work for them after graduation)

**INTERNATIONAL OPPORTUNITIES:**

**Cruise Ships:**
- SA qualification recognized
- Agencies recruit actively (CT, DBN)
- Salary: R35,000-R70,000/month TAX-FREE
- Plus free accommodation, food, medical
- Save 90% of salary
- Contracts: 6-9 months on, 2-3 months off

**UAE:**
- Dubai, Abu Dhabi hotels (Jumeirah, Rotana) hire SA chefs
- R25,000-R50,000 tax-free, accommodation provided

**UK:**
- Pubs, restaurants, hotels
- Tier 2 visa if experienced
- Salary: £1,800-£2,500/month (R40,000-R55,000)

**Pro Tip:** Get 2-3 years SA experience first, learn international cuisines (Italian, Asian)

**Own Business:**
- Catering: Low startup—R10,000-R30,000 for equipment
- Food truck: R200,000-R500,000
- Restaurant: R500,000-R2M (high risk)

**Backup Plan:** Skills transfer to food blogging (content creator), food photography (R500-R5,000/shoot), catering manager (R25,000-R40,000)

**CRITICAL:** Build portfolio—photos of best dishes, menu concepts. References from Executive Chefs essential for international jobs`,
    tags: ['chef bursaries', 'nsfas', 'cathsseta', 'cruise ships', 'international', 'uae', 'uk', 'own business', 'food truck', 'catering']
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
    
    console.log(`\n✅ Chef: ${count}/5 chunks uploaded`)
    
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
