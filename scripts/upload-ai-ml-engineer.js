#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🤖 UPLOADING AI/ML ENGINEER CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'AI/ML Engineer',
    chunk_type: 'career_overview',
    chunk_text: `# AI/ML Engineer: Your 2026 Career Guide (4IR Cutting Edge)

AI/ML Engineers build intelligent systems that learn from data—think ChatGPT, self-driving cars, fraud detection. In SA's 4IR context, this is the MOST CUTTING-EDGE career. Work: Banks (FNB, Standard Bank—fraud detection, chatbots), telecoms (MTN, Vodacom—network optimization), retailers (Takealot—recommendation engines), mining (Anglo—predictive maintenance), startups (Clevva, DataProphet).

**Real SA Example:** As an AI/ML engineer at Standard Bank's innovation lab, you build fraud detection models processing 50M+ transactions daily, train neural networks to predict customer churn, deploy NLP chatbots, and optimize credit scoring algorithms. You work with TensorFlow, Python, and massive datasets—earning R120K+/month.

# Specializations
- **Computer Vision:** Image recognition, facial detection, medical imaging
- **Natural Language Processing (NLP):** ChatGPT-type systems, sentiment analysis
- **Predictive Analytics:** Forecasting, risk modeling
- **Reinforcement Learning:** Game AI, robotics
- **Deep Learning:** Neural networks, advanced AI

## Why It's Critical in SA
- Government 4IR Commission priority
- Growing 45% YoY (but still NICHE ~500 jobs)
- HIGHEST-paying tech career in SA
- Most academically demanding—requires strong mathematics

# Salary Progression (ZAR, 2025)
- Junior (0-2 years): R40,000-R60,000/month
- Mid-level (3-5 years): R70,000-R120,000/month
- Senior (5+ years): R130,000-R200,000+/month
- **INTERNATIONAL REMOTE:** $8,000-$15,000/month (R150K-R280K)—tax-free first R1.2M

**PhD Premium:** Adds 30-40% salary

**Employers:** Banks (60% of SA AI roles), telecoms, mining tech, CSIR, startups

**Key Difference:** Unlike software engineers who build apps, AI engineers build BRAINS for apps. Requires strong mathematics.`,
    tags: ['ai ml engineer', '4ir', 'artificial intelligence', 'machine learning', 'deep learning', 'computer vision', 'nlp', 'data science', 'mathematics 80%', 'cutting edge', 'highest salary']
  },
  {
    career_name: 'AI/ML Engineer',
    chunk_type: 'education',
    chunk_text: `# AI/ML Engineer: Education Path (MSc ALMOST MANDATORY)

**Degree:** BSc Computer Science (3 years) OR BEng Computer/Electrical Engineering (4 years) with AI/ML specialization

**THEN:** MSc in Artificial Intelligence or Machine Learning (1-2 years)—**ALMOST MANDATORY** for serious AI roles

**Universities:** UCT, Wits, UP have AI research labs and MSc programmes. Stellenbosch's MIH (Machine Intelligence) is world-class.

**Admission:** 
- Mathematics 80%+ (NON-NEGOTIABLE—AI is applied mathematics)
- Physical Sciences 70% (for engineering route) OR NOT NEEDED (CS route)
- English 70%+ for research papers

**Tuition:** 
- Undergrad: R45,000-R75,000/year
- MSc: R70,000-R100,000 total (expensive but ROI is 12-18 months)

**Curriculum:** Linear Algebra, Calculus, Statistics, Algorithms, Neural Networks, Deep Learning, Computer Vision, NLP

**Alternative Routes:**
- Google/IBM AI Certifications (6-12 months) via Coursera—can land JUNIOR roles but degree preferred
- Self-taught via fast.ai, Kaggle competitions—need PROOF (win competitions, build impressive projects like malaria diagnosis from cell images)

**PhD:** Required for research roles at CSIR, universities

**Average Path:** 5-6 years (BSc 3 years + MSc 2 years)

**Reality Check:** Most serious AI roles require postgraduate education—this is NOT a bootcamp career`,
    tags: ['ai ml education', 'msc mandatory', 'computer science', 'uct', 'wits', 'stellenbosch', 'mathematics 80%', 'postgraduate', 'kaggle', 'fast.ai']
  },
  {
    career_name: 'AI/ML Engineer',
    chunk_type: 'salary',
    chunk_text: `# AI/ML Engineer: Salary & Job Outlook (HIGHEST IN SA TECH)

**Local Salaries (ZAR, 2025):**
- Junior (0-2 years): R40,000-R60,000/month
- Mid-level (3-5 years): R70,000-R120,000/month
- Senior (5+ years): R130,000-R200,000+/month

**INTERNATIONAL REMOTE:**
- SA AI engineers work for US/EU companies
- $8,000-$15,000/month (R150,000-R280,000)
- Tax-free on first R1.2M/year

**Premiums:**
- PhD adds 30-40% salary
- NLP specialists earn 20% more than general ML
- Computer vision: High demand in security/agriculture

**Major Employers:**
- Banks (FNB, Standard Bank—large AI teams) - 60% of SA AI roles
- Telecoms (MTN, Vodacom—network optimization)
- Consulting (BCG, Bain—AI strategy)
- Mining tech (Anglo, Implats—predictive maintenance)
- Startups (DataProphet—manufacturing AI, Clevva—digital workers)
- CSIR (research)

**Job Outlook:**
- EXPLOSIVE growth—45% YoY
- Still NICHE—~500 jobs total in SA
- Competition FIERCE—need stellar GitHub, Kaggle rankings

**Reality Check:** Most SA AI roles are in FINANCIAL SERVICES (fraud detection, credit scoring), not sexy stuff like robots

**Manufacturing AI:** Growing sector—predictive maintenance for factories

**Emigration:** Canada, EU desperate for AI engineers—fast-track visas`,
    tags: ['ai ml salary', 'highest tech salary', 'remote work', 'phd premium', 'banking ai', 'financial services', 'kaggle', 'manufacturing ai']
  },
  {
    career_name: 'AI/ML Engineer',
    chunk_type: 'requirements',
    chunk_text: `# AI/ML Engineer: Requirements & Skills (MATHEMATICS INTENSIVE)

**Matric:** 
- Mathematics 80%+ (NON-NEGOTIABLE—AI is applied mathematics)
- Physical Sciences 70% (engineering route) OR NOT NEEDED (CS route)
- English 70%+ for research papers

**Personality Traits:**
- Obsessed with problem-solving
- LOVES mathematics (linear algebra, calculus, statistics)
- Patient (training models takes days)
- Resilient (90% of experiments fail)

**Essential Skills:**
- Python (ESSENTIAL—industry standard)
- TensorFlow/PyTorch (deep learning frameworks)
- Statistics & Probability
- Linear Algebra & Calculus
- Data Visualization (matplotlib, seaborn)
- Reinforcement Learning

**Portfolio Requirements:**
- GitHub with 3-5 projects (image classifier, NLP model, stock predictor)
- Kaggle competitions—PARTICIPATE, employers check rankings
- Research papers—read arXiv, implement latest algorithms

**Physical:** Office work only—sedentary

**Work-Life Balance:** 45-50 hrs/week, but model training runs overnight

**Gender:** Male-dominated, but AI4SA, Women in AI initiatives strong

**CRITICAL MINDSET:** Must be comfortable with 70% failure rate—most models don't work on first try

**Ethics:** Understand bias, fairness in AI—especially important in SA's diverse context

**Continuous Learning:** Field evolves monthly—must stay current with latest research

**Reality Check:** This is the most academically demanding tech career`,
    tags: ['ai ml requirements', 'mathematics 80%', 'python', 'tensorflow', 'pytorch', 'kaggle', 'statistics', 'linear algebra', 'research papers']
  },
  {
    career_name: 'AI/ML Engineer',
    chunk_type: 'bursaries',
    chunk_text: `# AI/ML Engineer: Bursaries & Alternative Paths (LIMITED BUT GROWING)

**AI/ML bursaries—LIMITED but growing:**

**1. CSIR MSc Bursary**
- R120,000/year for AI research
- Requires 2-year work-back at CSIR
- Deadline: AUGUST
- Highly competitive

**2. TIA (Technology Innovation Agency)**
- 4IR bursaries for postgraduate AI/ML
- R100,000/year
- Competitive application process

**3. Bank IT Bursaries:**
- FNB, Standard Bank cover CS/AI MSc programmes
- Apply in final undergrad year
- Work-back obligation

**4. Google Africa Scholarship**
- Udacity nanodegree in ML (free)
- Limited slots—very competitive

**5. AWS AI/ML Scholarship**
- Certification-focused
- Free training materials

**FUNDING REALITY:**
Most AI students rely on:
- NSFAS (undergrad BSc Computer Science)
- Postgraduate loans (Nedbank, Fundi at prime +2%)
- Research assistantships (universities pay R8,000-R15,000/month stipend)

**ALTERNATIVE PATH:**
BSc Computer Science (NSFAS-covered) → self-study AI (fast.ai, Coursera) → junior data scientist role (R35K-R50K) → company funds MSc

**COST REALITY:** MSc AI at UCT/Wits costs R70,000-R100,000—expensive but ROI is 12-18 months

**International Options:**
- Commonwealth Scholarships for UK AI MSc
- Fulbright for US programmes

**PRO TIP:** Start Kaggle competitions NOW in Grade 12—strong rankings can override lack of formal AI degree for some roles`,
    tags: ['ai ml bursaries', 'csir msc', 'tia 4ir', 'bank it bursaries', 'google africa', 'aws scholarship', 'kaggle', 'nsfas', 'research assistantship']
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
    
    console.log(`\n✅ AI/ML Engineer: ${count}/5 chunks uploaded`)
    
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
