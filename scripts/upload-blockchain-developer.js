#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('⛓️  UPLOADING BLOCKCHAIN DEVELOPER CONTENT (3 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Blockchain Developer',
    chunk_type: 'career_overview',
    chunk_text: `# Blockchain Developer: Your 2026 Career Guide (High Risk, High Reward)

Blockchain Developers build decentralized applications and smart contracts using blockchain technology. In SA, this is NICHE but GROWING—fintech, cryptocurrency (Luno, VALR), supply chain transparency (diamonds, agriculture), identity management. Work: Crypto exchanges (Luno, VALR), fintech startups (Yoco investigating blockchain), consulting (Deloitte Blockchain Lab), international (remote for Ethereum Foundation, ConsenSys).

**Real SA Example:** As a blockchain developer at Luno, you write smart contracts in Solidity for DeFi products, build dApps for cryptocurrency trading, audit blockchain security, and design token economics. You work remotely for international clients—earning $10K+/month (R180K+).

# Specializations
- **Smart Contract Development:** Solidity, Ethereum
- **Blockchain Architecture:** System design, consensus
- **DeFi (Decentralized Finance):** Lending, trading protocols
- **NFTs:** Digital assets, marketplaces
- **Enterprise Blockchain:** Hyperledger for business

## Why It's High Risk, High Reward
- NICHE demand: ~200-300 jobs in SA
- INTERNATIONAL REMOTE demand is HUGE
- 70% of SA blockchain devs work remotely for US/EU companies
- Earning $5,000-$15,000/month (R90,000-R280,000)
- Regulatory uncertainty (crypto regulation pending)
- Skills are global and transferable

# Salary Progression (ZAR, 2025)
- Junior (0-2 years, local): R30,000-R50,000/month
- Mid-level (3-5 years, local): R60,000-R100,000/month
- Senior/Lead (5+ years): R120,000-R200,000+/month
- **INTERNATIONAL REMOTE:** $8,000-$20,000/month (R150K-R360K)

**Employers:** Luno, VALR, fintech startups, Deloitte/PwC blockchain labs, remote (Ethereum Foundation, ConsenSys)

**Key Difference:** Unlike software engineers who build centralized apps, blockchain developers work on DECENTRALIZED, trustless systems.

**Reality:** Smart contract bugs can lose millions—high stress, high responsibility`,
    tags: ['blockchain developer', '4ir', 'cryptocurrency', 'smart contracts', 'solidity', 'defi', 'nfts', 'ethereum', 'remote work', 'luno', 'valr']
  },
  {
    career_name: 'Blockchain Developer',
    chunk_type: 'education',
    chunk_text: `# Blockchain Developer: Education Path (Self-Study Mandatory)

**Degree:** BSc Computer Science (3 years) OR BEng Software Engineering (4 years)—NO dedicated blockchain degree yet

**Universities:** UCT, Wits, UP, Stellenbosch have blockchain research labs and electives

**Admission:**
- Mathematics 75%+
- Physical Sciences 70% (engineering) OR NOT NEEDED (CS route)

**CRITICAL:** Self-study is MANDATORY—blockchain moves faster than universities

**Learning Path:**
1. Master JavaScript/Python (foundational)
2. Learn Solidity (Ethereum smart contract language)—CryptoZombies.io (FREE interactive course)
3. Study blockchain fundamentals (Andreas Antonopoulos books, free YouTube)
4. Build projects: Create your own token, build simple dApp, contribute to open-source
5. Certifications: Certified Blockchain Developer (CBD, $300), Ethereum Developer Certification

**Alternative Routes:**
- Blockchain Bootcamps: ConsenSys Academy (10 weeks, $1,000), B9Lab
- University Short Courses: UCT, Wits have 6-week blockchain courses (R8,000-R12,000)

**Master's:** MSc Blockchain at UCT (research-focused) for advanced roles

**Timeline:** 3-4 years degree + 1 year self-study/projects → Junior Dev

**Pro Tips:**
- Join SA blockchain meetups (Joburg, Cape Town)
- Attend ETHGlobal hackathons
- Networking is KEY in this small community
- Build DeFi project on GitHub—this is your golden ticket
- Contribute to OpenZeppelin contracts—shows expertise`,
    tags: ['blockchain education', 'computer science', 'solidity', 'cryptozombies', 'ethereum', 'self study', 'consensys', 'open source', 'defi projects']
  },
  {
    career_name: 'Blockchain Developer',
    chunk_type: 'salary_skills_reality',
    chunk_text: `# Blockchain Developer: Salary, Skills & Reality Check

**Salaries (ZAR, 2025):**
- Junior (0-2 years, local): R30,000-R50,000/month
- Mid-level (3-5 years, local): R60,000-R100,000/month
- Senior/Lead (5+ years): R120,000-R200,000+/month
- **INTERNATIONAL REMOTE:** $8,000-$20,000/month (R150,000-R360,000)—tax-free threshold applies

**Essential Skills:**
- Solidity (Ethereum)
- Rust (Solana)
- JavaScript (dApp frontend)
- Web3.js/ethers.js (blockchain interaction)
- Smart contract security auditing (CRITICAL—bugs cost millions)

**Employers:**
- Luno, VALR (crypto exchanges, 10-15 blockchain devs each)
- Fintech startups
- Consulting (Deloitte, PwC blockchain labs)
- Remote (Ethereum Foundation, ConsenSys, OpenZeppelin)

**Work Reality:**
- 70% smart contract development
- 20% DeFi protocols
- 10% enterprise blockchain
- HIGH RISK: Smart contract bugs can lose millions—stressful

**Freelance Opportunities:**
- Smart contract auditing: $10,000-$50,000 per audit
- DeFi protocol development: $100,000+ for senior devs

**Bursaries:** NONE specific—rely on CS bursaries (Bank IT, ISFAP, NSFAS)

**Alternative Path:** Work as software dev (R30K-R50K) → self-study blockchain → transition internally

**Regulatory Reality:** SA crypto regulation unclear, but blockchain skills are global

**WARNING:** Cryptocurrency volatility affects job stability—bear markets see layoffs. Skills are transferable to traditional fintech.

**Growth Outlook:** Tokenization of assets (property, commodities) will create 1,000s of jobs 2025-2030. SA companies adopting blockchain for supply chain—demand growing.`,
    tags: ['blockchain salary', 'solidity', 'smart contracts', 'defi', 'crypto volatility', 'remote work', 'freelance', 'security auditing', 'luno', 'valr']
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
    
    console.log(`\n✅ Blockchain Developer: ${count}/3 chunks uploaded`)
    
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
