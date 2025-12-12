#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('📹 UPLOADING CONTENT CREATOR CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Content Creator',
    chunk_type: 'career_overview',
    chunk_text: `# Content Creator: Your 2026 Career Guide (High Risk, High Reward)

Content Creators produce digital content—YouTube videos, TikTok, Instagram, podcasts, blogs. In SA's growing creator economy, this is a VIABLE but HIGH-RISK career. Top SA creators earn R100,000-R500,000/month, but REALITY CHECK: 95% earn under R5,000/month.

**Real SA Example:** Kay Yarms (beauty creator, 500K+ followers) creates makeup tutorials, product reviews, and brand partnerships. She films 3-4 videos weekly, edits content, manages sponsorships with brands like Clicks and Woolworths, and engages with her community. Estimated earnings: R80K+/month after 4 years of consistent posting.

# Revenue Streams
- **AdSense:** YouTube ads (R10-R50 per 1,000 views)
- **Brand Sponsorships:** R500-R50,000 per post
- **Affiliate Marketing:** 5-20% commission on sales
- **Merchandise:** Print-on-demand products
- **Patreon:** Fan subscriptions (R5-R50/month per fan)
- **Platform Creator Funds:** TikTok, Instagram

# Popular Niches in SA
- Beauty & lifestyle
- Finance ("how to make money")
- Gaming
- Education
- Comedy
- Tech reviews

## SA Success Stories
- Kay Yarms (beauty, 500K+ followers, est. R80K+/month)
- Mark FitzGerald (photography)
- Caspar Lee (entertainment)
- Nadia Jaftha (lifestyle)

## Reality Check
- **Top 5%:** R50,000-R500,000/month
- **95%:** Under R5,000/month
- **Timeline:** 12-24 months to monetize meaningfully
- **Success factors:** Consistency (post 3-7x/week), quality, audience connection, niche expertise

**Unlike traditional careers:** NO formal qualifications needed

**Growth Path:** Hobby → Side hustle (R1K-R5K/month) → Full-time (R10K-R30K) → Established (R50K+) → Agency/brand

**BACKUP PLAN essential:** Skills transfer to digital marketing, video editing, social media management`,
    tags: ['content creator', 'creative arts', 'youtube', 'tiktok', 'influencer', 'brand partnerships', 'adsense', 'high risk', 'no qualifications']
  },
  {
    career_name: 'Content Creator',
    chunk_type: 'education',
    chunk_text: `# Content Creator: Education Path (No Formal Education Required)

**NO formal education required**—this is 100% portfolio/skill-based. However, structured learning accelerates success:

**1. University (Optional):**
- BA Media Studies, BA Film, BCom Marketing—helpful for strategy, but NOT mandatory
- Universities: Wits, UCT, Stellenbosch, Rhodes have media programmes
- Admission: English 60%+, NO mathematics required

**2. Diploma/Certificate:**
- CityVarsity (1 year, R50,000)—film/video production
- SAE Institute (1 year, R60,000)—digital content creation
- AAA School of Advertising—content marketing

**3. SELF-TAUGHT (MOST COMMON):**
- YouTube tutorials (FREE)
- Skillshare ($15/month)
- MasterClass ($180/year)—learn from global creators
- Timeline: 3-6 months learning + practice → start posting → 12-24 months to monetization

**Key Skills (Learn Free):**
- Video editing (CapCut FREE, DaVinci Resolve FREE)
- Graphic design (Canva FREE)
- Storytelling
- Basic marketing
- Analytics (YouTube Studio, Instagram Insights)

**Platform-Specific:**
- YouTube: Long-form, high AdSense
- TikTok: Short-form, viral potential
- Instagram: Brand partnerships
- Podcasting: Sponsorships

**Mentorship:** Find established SA creator—many offer coaching (R500-R2,000/hour)

**Internship:** Digital agencies hire content assistants (R8,000-R15,000)—learn while earning

**Reality:** Many SA creators study part-time (marketing, business) while building audience—degree as backup plan`,
    tags: ['content creator education', 'self taught', 'no degree required', 'video editing', 'capcut', 'canva', 'youtube tutorials', 'backup plan']
  },
  {
    career_name: 'Content Creator',
    chunk_type: 'monetization',
    chunk_text: `# Content Creator: Monetization & Salary Reality (HIGHLY VARIABLE)

**Content creator income—HIGHLY VARIABLE, no guaranteed salary:**

**YouTube AdSense:**
- R10-R50 per 1,000 views
- 100K views/month = R1,000-R5,000
- Requires 1,000 subscribers + 4,000 watch hours to monetize

**Brand Sponsorships:**
- Micro-influencer (10K-50K followers): R500-R5,000 per post
- Macro (100K+ followers): R10,000-R50,000 per post

**Affiliate Marketing:**
- 5-20% commission on sales
- Amazon Associates, Superbalist affiliate
- Can add R2,000-R20,000/month

**Patreon:**
- Fan subscriptions R5-R50/month
- 1,000 fans = R5,000-R50,000/month

**Merchandise:**
- Print-on-demand (Teemill, Spring)
- Profit R50-R200 per item

**TikTok Creator Fund:**
- R0.02-R0.05 per 1,000 views—minimal in SA

**Realistic Timeline:**
- Months 1-6: R0 (build audience)
- Months 6-12: R1,000-R5,000
- Year 1-2: R5,000-R15,000
- Year 2-3: R15,000-R30,000+
- Top SA creators (5%): R50,000-R500,000/month

**Expenses:**
- Equipment (phone upgrade R5,000-R15,000)
- Editing software (CapCut FREE, Adobe Premiere R300/month)
- Internet (R500-R1,000/month)

**Reality:** Many creators work part-time job for 12-24 months before going full-time

**Multiple Income Streams Essential:** Rely on 3-4 sources, not just one

**Tax:** Register as provisional taxpayer—30-45% tax on earnings >R95,750/year`,
    tags: ['content creator salary', 'monetization', 'adsense', 'brand sponsorships', 'affiliate marketing', 'patreon', 'variable income', 'timeline']
  },
  {
    career_name: 'Content Creator',
    chunk_type: 'equipment_skills',
    chunk_text: `# Content Creator: Equipment & Skills (Start Cheap, Upgrade as You Earn)

**Equipment Tiers:**

**BEGINNER (R0-R2,000):**
- Smartphone (you already have)
- CapCut (free editing app)
- Canva (free for thumbnails)
- Natural light
- Free wifi

**INTERMEDIATE (R5,000-R15,000):**
- Better phone (R5,000-R10,000)
- Ring light (R300-R500)
- Lavalier mic (R200-R500)
- Tripod (R200-R400)
- DaVinci Resolve (free) or Adobe Premiere (R300/month)

**PROFESSIONAL (R20,000-R50,000):**
- DSLR/mirrorless camera (R15,000-R30,000)
- Lighting kit (R2,000-R5,000)
- Shotgun mic (R1,000-R3,000)
- Green screen (R500)
- Editing PC (R10,000-R20,000)

**Essential Skills:**
- Video editing (CapCut/DaVinci)
- Storytelling (hook viewers in first 3 seconds)
- SEO (titles, tags)
- Thumbnail design (Canva)
- Community engagement (reply to comments)
- Analytics (interpret YouTube Studio)
- Basic marketing (promote on socials)
- Negotiation (brand deals)

**Soft Skills:**
- Resilience (handle negative comments)
- Consistency (post schedule)
- Creativity (trendjacking)
- Business acumen (track income/expenses)

**Physical:** Long hours filming/editing (8-12 hrs/day), repetitive strain injury risk

**Mental Health:** Burnout common—take breaks

**Team (At Scale):**
- Editor (R5,000-R15,000/month)
- Thumbnail designer (R2,000-R5,000)
- Manager (10-20% of earnings)

**SA Context:**
- Loadshedding: Backup power essential (power bank R500, inverter R5,000)
- Data costs: Use wifi, or buy data bundles (R500-R1,000/month)
- Crime: Don't film expensive equipment in public
- Cloud storage: Google Drive 100GB R30/month`,
    tags: ['content creator equipment', 'start cheap', 'capcut', 'video editing', 'storytelling', 'loadshedding', 'backup power', 'sa challenges']
  },
  {
    career_name: 'Content Creator',
    chunk_type: 'business_reality',
    chunk_text: `# Content Creator: Business Reality & Backup Plan

**Bursaries—PRACTICALLY NONE.** This is a self-funded career.

**Alternative Funding:**
1. **NSFAS:** Can study BA Media, BCom Marketing, Film—covers tuition if you want degree as backup
2. **ISFAP:** Covers media/marketing degrees for missing middle families
3. **Agency Sponsorship:** Webfluential, Sconet sometimes sponsor micro-influencers (R5,000-R10,000)—rare
4. **Brand Partnerships:** Early stage—approach local businesses for free content/practice
5. **YouTube Partner Program:** Once monetized, YouTube pays monthly—reinvest in equipment

**Business Setup:**
- Register as sole proprietor (free at CIPC) or Pty Ltd (R125)
- Tax benefits, liability protection

**Tax:**
- Register for provisional tax—pay SARS every 6 months
- Deduct expenses: equipment, internet, phone, home office (20% of rent if dedicated space)

**Accounting:**
- Use Wave (free) or QuickBooks (R200/month)
- Track income/expenses

**BACKUP PLAN (CRITICAL—95% don't make it):**

Develop transferable skills:
- Video editing (editor job R15,000-R30,000)
- Digital marketing (R20,000-R40,000)
- Social media manager (R15,000-R35,000)
- Photographer (R500-R5,000 per shoot)

Many creators pivot to agency work

**Timeline:** Give yourself 12-24 months to reach R10,000/month. If not, transition to employed role with skills gained.

**Mental Prep:** Income instability is STRESSFUL—emergency fund (3-6 months expenses) essential before going full-time

**Success Factors:**
- Consistency > quality initially
- Niche down (e.g., "budget travel for students" not "travel")
- Engage audience (reply to every comment early)
- Collaborate (cross-promote)

**SA Examples:**
- Kay Yarms (beauty, 4 years to R80K+/month)
- Mark FitzGerald (photography, 3 years to R50K+/month)
- Nadia Jaftha (lifestyle, 5 years to R100K+/month)`,
    tags: ['content creator business', 'backup plan', 'no bursaries', 'tax', 'sole proprietor', 'transferable skills', 'digital marketing', 'video editing', 'emergency fund']
  }
]

async function uploadBatch() {
  try {
    let { data: modules } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'creative_arts_careers')
    
    let module = modules?.[0]
    
    if (!module) {
      console.log('Creating creative arts careers module...')
      const { data: newModule } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'creative_arts_careers',
          description: 'Creative arts and design careers',
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
            category: 'creative_arts',
            tags: chunk.tags,
            sprint: 'Week 3 - Creative Arts',
            source: `creative_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}_${chunk.chunk_type}`
          }
        })
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        count++
        console.log(`  ✓ Success`)
      }
    }
    
    console.log(`\n✅ Content Creator: ${count}/5 chunks uploaded`)
    
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
