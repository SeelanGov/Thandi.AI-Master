#!/usr/bin/env node

/**
 * Manual 4IR Content Addition - Sprint 2.1
 * 
 * Directly inserts 4IR career content chunks into database
 * Bypasses file parsing issues and gets content live immediately
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n═══════════════════════════════════════════════════════');
console.log('🚀 MANUAL 4IR CONTENT ADDITION - Sprint 2.1');
console.log('   Direct database insertion for immediate testing');
console.log('═══════════════════════════════════════════════════════\n');

async function addManual4IRContent() {
  try {
    // Get or create the 4IR module
    let { data: module, error: moduleError } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', '4ir_careers_framework')
      .single();
      
    if (moduleError || !module) {
      const { data: newModule, error: createError } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: '4ir_careers_framework',
          description: '4IR and emerging technology careers - cybersecurity, cloud, renewable energy, AI/ML',
          version: 1,
          priority: 1
        })
        .select()
        .single();
        
      if (createError) {
        throw new Error(`Failed to create module: ${createError.message}`);
      }
      module = newModule;
    }
    
    console.log(`✓ Using module: ${module.module_name} (ID: ${module.id})`);
    
    // Define the 4IR content chunks
    const chunks = [
      {
        career_name: 'Cybersecurity Engineer',
        chunk_type: 'overview',
        content: `# Cybersecurity Engineer Career Overview

Cybersecurity Engineers are the digital guardians of South Africa's growing tech economy. They design, implement, and maintain security systems that protect organizations from cyber threats. In South Africa, cybersecurity demand is exploding due to digital transformation, remote work adoption, and increasing cyber attacks on banks, government, and businesses.

**Daily Tasks:**
- Review overnight security alerts, analyze potential threats
- Design security protocols for new company systems
- Conduct vulnerability assessments and penetration testing
- Monitor network traffic and investigate security incidents
- Train staff on security best practices

**SA Market Demand (2024-2025):**
- Banking Sector: FNB, Standard Bank, Nedbank hiring 200+ cybersecurity professionals annually
- Government: SITA, Department of Defence expanding cybersecurity teams
- Corporate: Shoprite, MTN, Vodacom, Discovery investing heavily in cyber defense
- Consulting: Deloitte, PwC, KPMG cybersecurity practices growing 30% annually

**Career Progression:**
- Junior Cybersecurity Analyst: R25K-R35K per month
- Cybersecurity Engineer: R35K-R60K per month
- Senior Security Architect: R60K-R90K per month
- Chief Information Security Officer: R100K-R200K per month

**Required Skills:** Math 60%+, logical thinking, continuous learning mindset
**Education:** BSc Computer Science, BSc IT, BSc Cybersecurity
**Certifications:** CompTIA Security+, Certified Ethical Hacker (CEH), CISSP`,
        tags: ['cybersecurity analyst', 'cybersecurity engineer', 'security engineer', 'information security', 'cyber defense', 'network security', 'banking sector', 'government security', 'r35k', 'r60k', 'math 60%']
      },
      {
        career_name: 'Cloud Engineer',
        chunk_type: 'overview',
        content: `# Cloud Engineer Career Overview

Cloud Engineers build and manage the digital infrastructure that runs apps, websites, and business systems in the cloud. When you use Capitec's banking app, watch Showmax, or shop on Takealot, cloud engineers ensure those services stay online 24/7.

**Daily Responsibilities:**
- Set up and configure cloud servers (AWS, Azure, Google Cloud)
- Automate software deployments and system updates
- Monitor system performance and fix outages
- Manage security and data backups
- Optimize costs for cloud usage

**Why Growing in SA:**
- Load shedding driving companies to cloud migration
- 4IR policy pushing digital transformation
- Cheaper than owning/maintaining physical hardware

**Work Environment:**
- Tech companies, banks (FNB, Nedbank, Discovery)
- Telecoms (MTN, Vodacom), e-commerce (Takealot)
- Government (SITA), startups
- 80% remote/hybrid work opportunities

**Salary Progression (2024-2025):**
- Junior Cloud Engineer: R20K-R35K per month
- Cloud Engineer: R40K-R65K per month
- Senior Cloud Architect: R70K-R120K per month
- Principal Cloud Engineer: R120K-R180K per month

**Required Skills:** Math 60%+, networking, automation, problem-solving
**Education:** BSc Computer Science, BSc IT, BCom Information Systems
**Certifications:** AWS Solutions Architect, Azure Administrator, Google Cloud Professional`,
        tags: ['cloud engineer', 'cloud architect', 'aws', 'azure', 'google cloud', 'digital transformation', 'infrastructure', 'remote work', 'r40k', 'r65k', 'math 60%']
      },
      {
        career_name: 'Data Scientist',
        chunk_type: 'overview',
        content: `# Data Scientist & AI Engineer Career Overview

Data Scientists analyze data to find patterns and build predictive models that help businesses make decisions. AI Engineers build and deploy AI systems like recommendation engines and chatbots. In SA, both roles often overlap and are in high demand.

**Real SA Examples:**
- Data Scientist at Capitec: Analyze transaction data to detect fraud
- AI Engineer at Discovery: Build AI predicting health risks for Vitality members
- Data Analyst at Takealot: Create recommendation systems for shoppers
- AI Researcher at Wits: Machine learning for healthcare diagnostics

**Daily Responsibilities:**
- Write code in Python or R to analyze data
- Build machine learning models for predictions
- Create charts and dashboards to show insights
- Clean and prepare data (80% of the job)
- Present findings to business teams

**Why Red-Hot in SA:**
- 4IR policy prioritizing AI/data skills
- Every company needs data insights
- Severe shortage of qualified professionals
- Government-DHET-Microsoft partnership training 50,000 SA youth in AI

**Work Environment:**
- Banks (FNB, Nedbank, Discovery), telecoms (MTN)
- Retailers (Takealot, Checkers), startups
- Government (Stats SA, SITA), research institutions
- High remote work flexibility

**Salary Progression (2024-2025):**
- Entry-Level Data Analyst: R18K-R30K per month
- Junior Data Scientist: R30K-R45K per month
- Data Scientist: R45K-R70K per month
- Senior Data Scientist/AI Engineer: R70K-R110K per month
- Lead Data Scientist: R110K-R180K per month

**Required Skills:** Math 70%+, Python programming, statistics, curiosity
**Education:** BSc Data Science, BSc Computer Science, BSc Statistics`,
        tags: ['data scientist', 'ai engineer', 'machine learning', 'python', 'analytics', '4ir', 'artificial intelligence', 'statistics', 'r30k', 'r45k', 'math 70%']
      },
      {
        career_name: 'Renewable Energy Engineer',
        chunk_type: 'overview',
        content: `# Renewable Energy Engineer Career Overview

Renewable Energy Engineers design, develop, and maintain sustainable energy systems including solar, wind, and other clean energy technologies. In South Africa, this field is rapidly growing due to load shedding challenges and government renewable energy initiatives.

**Daily Responsibilities:**
- Design solar panel installations and wind farm layouts
- Conduct energy efficiency assessments
- Monitor renewable energy system performance
- Develop sustainable energy solutions for businesses
- Collaborate with environmental scientists and project managers

**SA Market Growth:**
- Government Renewable Energy Independent Power Producer Procurement Programme (REIPPPP)
- Corporate solar installations due to load shedding
- Green hydrogen projects in Northern Cape
- Solar technician roles growing 40% annually

**Career Specializations:**
- Solar Energy Engineer: R30K-R50K per month
- Wind Energy Engineer: R35K-R55K per month
- Sustainability Consultant: R40K-R65K per month
- Energy Systems Analyst: R25K-R45K per month

**Work Environment:**
- Engineering consultancies (AECOM, Aurecon)
- Renewable energy companies (BioTherm Energy, Mainstream Renewable Power)
- Government departments (Department of Energy)
- Solar installation companies

**Required Skills:** Math 65%+, Physical Science 60%+, environmental awareness
**Education:** BEng Electrical Engineering, BSc Environmental Science, BTech Renewable Energy
**Growth Outlook:** 35% annual growth expected through 2030`,
        tags: ['renewable energy engineer', 'solar technician', 'wind energy', 'sustainability consultant', 'green energy', 'environmental engineer', 'load shedding', 'r30k', 'r50k', 'math 65%']
      }
    ];
    
    // Insert chunks
    let insertedCount = 0;
    
    for (const chunk of chunks) {
      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert({
          module_id: module.id,
          source_entity_id: null,
          source_entity_type: '4ir_career',
          chunk_text: chunk.content,
          chunk_metadata: {
            source: `4ir_career_${chunk.career_name.toLowerCase().replace(/\s+/g, '_')}`,
            career_name: chunk.career_name,
            chunk_type: chunk.chunk_type,
            tags: chunk.tags,
            target_questions: ['Q16', 'Q17', 'Q18'],
            sprint: 'Sprint 2.1'
          }
        });
        
      if (chunkError) {
        console.error(`  ❌ Failed to insert ${chunk.career_name}: ${chunkError.message}`);
      } else {
        insertedCount++;
        console.log(`  ✓ Inserted: ${chunk.career_name} - ${chunk.chunk_type}`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total chunks added: ${insertedCount}/${chunks.length}`);
    console.log(`   Module: 4ir_careers_framework`);
    console.log(`   Target questions: Q16, Q17, Q18`);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ MANUAL 4IR CONTENT ADDITION COMPLETE!');
    console.log('   Next: Generate embeddings and test improvements');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error adding 4IR content:', error.message);
    process.exit(1);
  }
}

// Run the script
addManual4IRContent();