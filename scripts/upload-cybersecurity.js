#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔒 UPLOADING CYBERSECURITY SPECIALIST CONTENT (5 CHUNKS)...\n')

const chunks = [
  {
    career_name: 'Cybersecurity Specialist',
    chunk_type: 'career_overview',
    chunk_text: `# Cybersecurity Specialist: Your 2026 Career Guide (Most Job-Secure Tech Career)

Cybersecurity Specialists protect computer systems, networks, and data from cyberattacks—hacking, ransomware, data breaches. In SA, this is the FASTEST-GROWING 4IR career due to loadshedding (grid vulnerabilities), banking fraud (SIM swap scams), and POPIA compliance. Work: Banks (FNB, Standard Bank—security operations centers), telecoms (MTN, Vodacom—network security), government (State Security Agency, SITA), consulting (Deloitte Cyber, PwC Cyber), cybersecurity vendors (CipherWave, LAWTrust).

**Real SA Example:** As a SOC analyst at Standard Bank, you monitor 10M+ security alerts daily, investigate suspicious transactions, respond to ransomware attacks, conduct penetration tests on banking apps, and train staff on phishing awareness. You work with SIEM tools, firewalls, and incident response protocols—earning R45K+/month.

# Specializations
- **Penetration Testing:** Ethical hacker, finding vulnerabilities
- **Security Operations Center (SOC) Analyst:** Monitoring, incident response
- **Incident Response:** Handling breaches, forensics
- **Governance/Risk/Compliance (GRC):** POPIA compliance, audits
- **Cloud Security:** AWS/Azure security

## Why It's SA's Most Job-Secure Career
- CRITICAL demand: 30,000+ unfilled positions globally, SA has 3,000+ vacancies
- Banks lose R1B+ annually to cybercrime
- POPIA compliance mandatory
- Loadshedding creates grid vulnerabilities

# Salary Progression (ZAR, 2025)
- Junior SOC Analyst (0-2 years): R25,000-R40,000/month
- Penetration Tester (3-5 years): R50,000-R85,000/month
- Senior Security Architect (5+ years): R90,000-R150,000/month
- Chief Information Security Officer (CISO): R180,000-R300,000/month

**Consulting Premium:** Deloitte, PwC cyber consultants charge R1,500-R3,000/hour

**Employers:** Banks (100+ SOC analysts each), telecoms, government (SITA, SSA), MSSPs, cybersecurity vendors

**Key Difference:** Unlike software engineers who build systems, cybersecurity specialists BREAK and DEFEND them.`,
    tags: ['cybersecurity', '4ir', 'ethical hacking', 'penetration testing', 'soc analyst', 'incident response', 'popia', 'banking security', 'job secure']
  },
  {
    career_name: 'Cybersecurity Specialist',
    chunk_type: 'education',
    chunk_text: `# Cybersecurity Specialist: Education Path (Certifications are KING)

**Degree:** BSc Computer Science (3 years) OR BEng Computer Engineering (4 years) with cybersecurity electives

**THEN:** Cybersecurity certifications (MORE important than postgraduate degrees)

**Universities:** Wits, UP, UCT, Stellenbosch have security modules. NMU launching BSc Cybersecurity.

**Admission:**
- Mathematics 70%+
- Physical Sciences 70% (engineering) OR 65%+ (CS route)

**CRITICAL:** Certifications are KING—CISSP, CEH, CompTIA Security+, OSCP

**Certification Path:**
1. CompTIA Security+ (entry, $400)
2. CEH (Certified Ethical Hacker, $1,200)
3. CISSP (senior, $750 + 5 years experience)
4. OSCP (offensive security, $1,500, hands-on hacking exam)

**Alternative Routes:**
- Cybersecurity Bootcamps: NexGenT (6 months, R40,000), IT varsity (1 year, R60,000)
- Self-taught: TryHackMe, HackTheBox (free hacking labs), build home lab, get CompTIA Security+

**Government Path:** SITA (State IT Agency) offers cybersecurity learnerships—pays stipend, leads to employment

**Average Timeline:** 3-4 years degree + 2-3 years certs/experience to senior

**Reality:** EXPERIENCE and CERTS > degree. Can start at R25K-R35K with Security+ cert alone.`,
    tags: ['cybersecurity education', 'cissp', 'ceh', 'comptia security+', 'oscp', 'certifications', 'tryhackme', 'hackthebox', 'sita learnership']
  },
  {
    career_name: 'Cybersecurity Specialist',
    chunk_type: 'salary',
    chunk_text: `# Cybersecurity Specialist: Salary & Job Outlook (PREMIUM Due to Shortage)

**Salaries (ZAR, 2025):**
- Junior SOC Analyst (0-2 years): R25,000-R40,000/month
- Penetration Tester (3-5 years): R50,000-R85,000/month
- Senior Security Architect (5+ years): R90,000-R150,000/month
- Chief Information Security Officer (CISO): R180,000-R300,000/month

**Consulting Premium:** Deloitte, PwC, EY cyber consultants charge R1,500-R3,000/hour

**Major Employers:**
- Banks (FNB, Standard Bank—100+ SOC analysts each)
- Telecoms (MTN, Vodacom—fraud prevention)
- Government (SITA, SSA—lower pay R30K-R60K but pension)
- MSSPs (Managed Security Service Providers like CipherWave)
- Cybersecurity vendors (LAWTrust—PKI)

**Freelance:** Bug bounty programs—HackerOne, Bugcrowd—SA hackers earn $10,000-$100,000/year finding vulnerabilities

**INTERNATIONAL REMOTE:** US/EU companies hire SA cyber specialists: $6,000-$12,000/month (R110,000-R220,000)

**Certification Bonus:** CISSP adds 30-40% salary premium

**Reality Check:**
- SOC analyst roles are 24/7 shift work (nights/weekends) but pay overtime
- Penetration testing is project-based, better hours

**Job Outlook:** CRITICAL shortage—3,000+ vacancies in SA`,
    tags: ['cybersecurity salary', 'soc analyst salary', 'penetration tester salary', 'ciso salary', 'bug bounty', 'cissp premium', 'consulting rates']
  },
  {
    career_name: 'Cybersecurity Specialist',
    chunk_type: 'requirements',
    chunk_text: `# Cybersecurity Specialist: Requirements & Skills (Paranoid Mindset Required)

**Matric:**
- Mathematics 70%+
- Physical Sciences 70% (engineering) OR 65%+ (CS)
- LOGICAL THINKING is king

**Key Trait:** PARANOID mindset—always thinking "how can this be broken?"

**Essential Skills:**
- Networking (TCP/IP, firewalls)
- Operating Systems (Linux is ESSENTIAL)
- Programming (Python for scripting, Bash)
- Security tools (Wireshark, Metasploit, Nmap)
- Incident Response
- Risk Assessment

**Hacking Labs:** MUST practice on TryHackMe, HackTheBox, VulnHub (free)

**Portfolio:** CTF (Capture The Flag) competition rankings, blog posts about vulnerabilities you've found

**Ethics:** MUST have strong ethics—this is a position of trust

**Background Checks:** Banks require criminal clearance, credit checks

**Physical:** None—office/computer work

**Work-Life Balance:**
- SOC analysts: 12-hour shifts, 4 days on/4 off (compressed schedule)
- Penetration testers: Project-based, 40-50 hrs/week

**Gender:** Male-dominated, but Women in Cybersecurity (WiCyS SA) initiatives strong

**Stay Current:** Read security blogs (Krebs on Security), follow CVEs, attend BSides SA conference`,
    tags: ['cybersecurity requirements', 'mathematics 70%', 'linux', 'python', 'networking', 'tryhackme', 'ctf', 'ethics', 'background checks']
  },
  {
    career_name: 'Cybersecurity Specialist',
    chunk_type: 'bursaries',
    chunk_text: `# Cybersecurity Specialist: Bursaries & Accessible Entry

**Cybersecurity bursaries—RARE but alternative funding exists:**

**1. Bank IT Bursaries:**
- FNB, Standard Bank, ABSA fund CS/Cybersecurity
- 150+ awards, deadline July
- GUARANTEED SOC analyst graduate programme

**2. CSIR Cybersecurity MSc Bursary:**
- R100,000 for research
- Deadline: AUGUST

**3. SITA Learnerships:**
- State IT Agency pays stipend R5,000-R8,000/month while you train
- Leads to permanent SOC analyst role (R25,000-R35,000)

**4. MWR/Orange Cyberdefense:**
- Occasional bursaries for top students

**Certification Funding:** Many employers pay for certifications (CompTIA, CEH) once employed

**SELF-FUNDED PATH:**
BSc CS (NSFAS) → TryHackMe ($10/month) + HackTheBox (free) → CompTIA Security+ ($400) → Apply for SOC Analyst → employer funds CISSP/CEH → Senior

**Total Cost:** $400 (R7,500) for entry cert

**Bootcamp:** IT varsity Cybersecurity diploma (R60,000) plus certifications—can land R30,000+ SOC role

**Military:** SANDF Cyber Command—trains cyber specialists, requires 5-year service

**Home Lab:** Build with old laptop, VirtualBox, Kali Linux for free practice

**Pro Tip:** Apply to banks' SOC analyst roles in final year—train while studying part-time`,
    tags: ['cybersecurity bursaries', 'bank it bursaries', 'sita learnership', 'comptia security+', 'home lab', 'sandf cyber', 'certification funding']
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
    
    console.log(`\n✅ Cybersecurity Specialist: ${count}/5 chunks uploaded`)
    
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
