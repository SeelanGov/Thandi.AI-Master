#!/usr/bin/env node

/**
 * Add Financial Alternatives Content - Sprint 2.2
 * 
 * Addresses Q6 (NSFAS/funding) and Q10 (part-time study) gaps
 * Target: 20% → 50% pass rate on financial constraint questions
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
console.log('🚀 FINANCIAL ALTERNATIVES CONTENT - Sprint 2.2');
console.log('   Addressing Q6 (NSFAS) and Q10 (part-time study) gaps');
console.log('═══════════════════════════════════════════════════════\n');

async function addFinancialAlternatives() {
  try {
    // Get or create the financial alternatives module
    let { data: module, error: moduleError } = await supabase
      .from('knowledge_modules')
      .select('*')
      .eq('module_name', 'financial_alternatives_framework')
      .single();
      
    if (moduleError || !module) {
      const { data: newModule, error: createError } = await supabase
        .from('knowledge_modules')
        .insert({
          module_name: 'financial_alternatives_framework',
          description: 'Financial alternatives: NSFAS, TVET, part-time study, alternative funding',
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
    
    // Define the financial alternatives content chunks
    const chunks = [
      {
        topic: 'NSFAS Comprehensive Guide',
        chunk_type: 'funding_guide',
        content: `# NSFAS (National Student Financial Aid Scheme) - Complete Guide 2026

NSFAS is the South African government's primary funding mechanism for higher education. If your family can't afford university, NSFAS is likely your best option for full funding.

## Who Qualifies for NSFAS?

**Income Threshold (2026):**
- Household income must be R350,000 per year or less
- This includes ALL income: salaries, grants, pensions, business income
- Single parents or orphans: Automatic qualification regardless of income
- Students with disabilities: Special consideration and additional support

**Academic Requirements:**
- Must have NSC (National Senior Certificate) with Bachelor's pass
- No specific subject requirements - covers ALL degrees and diplomas
- Must maintain 50% pass rate to keep funding (not 60% like some think)

## What NSFAS Covers (2026 Amounts)

**Full Coverage Includes:**
- Tuition fees: 100% covered (no limit at public universities)
- Accommodation: R45,000 per year (on-campus) or R25,000 (off-campus)
- Books and study materials: R5,200 per year allowance
- Transport: R7,500 per year if living off-campus
- Personal care allowance: R2,900 per year
- Laptop allowance: R5,000 (one-time, first-year students)

**Total Value:** R60,000-R85,000 per year depending on accommodation choice

## How to Apply for NSFAS

**Application Timeline (2026):**
- Applications open: October 1, 2026
- Application deadline: November 30, 2026 (NEVER LATE - system closes automatically)
- Results announced: January 2027
- Appeals period: February 2027

**Required Documents:**
- Your ID document
- Parent/guardian ID documents
- Proof of income (payslips, bank statements, unemployment letter)
- School academic record (Grade 11 and 12 results)
- Proof of residence (municipal account, lease agreement)

**Application Process:**
1. Go to nsfas.org.za
2. Create student profile with ID number
3. Upload all required documents (PDF format only)
4. Submit application before November 30
5. Check application status regularly on website

## Common NSFAS Mistakes to Avoid

❌ **"My family earns R400K, I don't qualify"** → Many families earning R300K-R350K still qualify
❌ **"I'll apply in Grade 12"** → Apply in Grade 11 already (early applications get priority)
❌ **"NSFAS only covers certain degrees"** → NSFAS covers ALL degrees at public universities
❌ **"I need 60% to keep funding"** → You only need 50% pass rate to maintain NSFAS

**Success Tips:**
- Apply early (October, not November)
- Double-check all documents are uploaded correctly
- Keep checking your application status
- Have backup funding options (bursaries, student loans)`,
        tags: ['nsfas', 'government funding', 'student financial aid', 'r350000 income threshold', 'application deadline', 'tuition fees covered', 'accommodation allowance', 'books allowance', 'transport allowance', 'laptop allowance', 'public universities', 'grade 11 application', 'october application', 'november deadline']
      },
      {
        topic: 'TVET Colleges Alternative',
        chunk_type: 'education_pathway',
        content: `# TVET Colleges: Affordable Alternative to University

TVET (Technical and Vocational Education and Training) colleges offer practical, job-focused education at a fraction of university costs. If university is unaffordable or you prefer hands-on learning, TVET is an excellent pathway.

## What are TVET Colleges?

TVET colleges focus on practical skills training for specific careers. Unlike universities (theory-heavy), TVET programs are designed to get you job-ready quickly with hands-on experience.

**Key Differences from University:**
- Duration: 1-3 years (vs 3-4 years university)
- Cost: R2,000-R8,000 per year (vs R40,000-R70,000 university)
- Focus: Practical skills and workplace training
- Outcome: National Certificate (N1-N6) or National Diploma

## Popular TVET Programs and Career Outcomes

**Information Technology (N4-N6):**
- Duration: 2-3 years
- Cost: R3,000-R5,000 per year
- Career outcomes: IT Support Technician (R8K-R15K), Network Administrator (R12K-R20K)
- Pathway: Can bridge to university IT degree after N6

**Engineering Studies (N1-N6):**
- Duration: 3 years
- Cost: R4,000-R6,000 per year
- Career outcomes: Artisan (R15K-R25K), Technician (R12K-R22K)
- Specializations: Electrical, Mechanical, Civil, Mining

**Business Studies (N4-N6):**
- Duration: 2 years
- Cost: R2,500-R4,000 per year
- Career outcomes: Office Administrator (R8K-R12K), Bookkeeper (R10K-R18K)
- Pathway: Can bridge to BCom degree

**Hospitality and Tourism (N4-N6):**
- Duration: 2 years
- Cost: R3,000-R5,000 per year
- Career outcomes: Hotel Manager (R12K-R20K), Tour Guide (R8K-R15K)

## Major TVET Colleges in South Africa

**Gauteng:**
- Ekurhuleni East TVET College (Benoni, Boksburg, Kempton Park)
- South West Gauteng TVET College (Roodepoort, Dobsonville)
- Tshwane South TVET College (Pretoria, Centurion)

**Western Cape:**
- College of Cape Town (Cape Town, Bellville, Athlone)
- West Coast TVET College (Malmesbury, Vredenburg)

**KwaZulu-Natal:**
- Durban University of Technology (TVET programs)
- Coastal TVET College (Durban, Pietermaritzburg)

**Eastern Cape:**
- Buffalo City TVET College (East London, King William's Town)

## NSFAS Funding for TVET

**Good News:** NSFAS fully funds TVET colleges if you qualify (household income < R350,000)

**TVET NSFAS Coverage:**
- Tuition: 100% covered
- Accommodation: R24,000 per year
- Transport: R7,500 per year
- Books: R5,200 per year
- Meals: R15,000 per year

**Application:** Same process as university NSFAS (nsfas.org.za, October-November)

## TVET to University Bridge Programs

Many TVET graduates can continue to university:

**N6 + Work Experience → University:**
- Complete N6 diploma
- Work for 2+ years in your field
- Apply to university as mature student
- Some subjects may be credited (shorter degree)

**Popular Bridge Paths:**
- N6 IT → BSc Computer Science (2-year completion)
- N6 Engineering → BEng (3-year completion)
- N6 Business → BCom (2-3 year completion)

## When to Choose TVET Over University

**Choose TVET if:**
- You prefer hands-on learning over theory
- You want to start earning sooner (1-2 years vs 3-4 years)
- University is financially unaffordable even with NSFAS
- You have a clear career goal that doesn't require a degree
- You want to test a field before committing to full university study

**University Still Better for:**
- Professional careers (doctor, lawyer, engineer, teacher)
- Research and academic careers
- Management and executive positions
- International career mobility`,
        tags: ['tvet colleges', 'technical education', 'vocational training', 'affordable education', 'practical skills', 'n4 n5 n6', 'national certificate', 'national diploma', 'hands-on learning', 'job-ready training', 'artisan training', 'it support technician', 'network administrator', 'office administrator', 'bookkeeper', 'hotel manager', 'nsfas tvet funding', 'bridge programs', 'university alternative']
      },
      {
        topic: 'Part-Time Study Guide',
        chunk_type: 'study_structure',
        content: `# Part-Time Study While Working: Complete Guide

Part-time study allows you to earn a degree while working, spreading the cost and earning income during your studies. This is ideal if you can't afford full-time study or need to support your family.

## How Part-Time Study Works

**Time Commitment:**
- Classes: Evenings (6pm-9pm) and/or weekends (Saturdays)
- Study time: 15-20 hours per week (vs 40+ hours full-time)
- Duration: 4-6 years for bachelor's degree (vs 3 years full-time)
- Flexibility: Some programs allow you to take breaks between semesters

**Class Schedules:**
- **Evening classes:** Monday-Thursday, 6pm-9pm
- **Weekend classes:** Saturdays 8am-5pm, some Sundays
- **Block classes:** Intensive weeks during holidays
- **Online components:** Some lectures and assignments online

## Universities Offering Part-Time Programs

**University of South Africa (UNISA):**
- Fully distance learning (study from anywhere)
- Cost: R15,000-R25,000 per year
- Programs: All degrees available part-time
- Support: Online tutorials, regional centers

**University of the Witwatersrand (Wits):**
- Evening classes in Johannesburg
- Cost: R35,000-R45,000 per year (part-time rate)
- Programs: BCom, BA, BSc, some postgraduate
- Schedule: Monday-Thursday evenings

**University of Cape Town (UCT):**
- Part-time and evening programs
- Cost: R30,000-R40,000 per year
- Programs: Limited selection (BCom, BA)
- Location: Cape Town campus

**University of Pretoria (UP):**
- Evening and weekend classes
- Cost: R25,000-R35,000 per year
- Programs: BCom, BAdmin, some engineering
- Locations: Pretoria, satellite campuses

**Damelin, CTI, Rosebank College (Private):**
- Flexible evening and weekend schedules
- Cost: R20,000-R35,000 per year
- Programs: Business, IT, marketing
- Smaller class sizes, more support

## Work-Study Balance Strategies

**Time Management:**
- Work: 8am-5pm (40 hours per week)
- Classes: 6pm-9pm (12 hours per week)
- Study: Early mornings, weekends (15 hours per week)
- Total commitment: 67 hours per week (manageable with discipline)

**Employer Support Options:**
- **Study leave:** 2-3 days per semester for exams
- **Flexible hours:** Start early, leave early for evening classes
- **Financial support:** Some employers pay for job-related studies
- **Skills development:** Use SETA funding through your employer

**Financial Planning:**
- Salary: R8,000-R15,000 per month (entry-level jobs)
- Study costs: R2,000-R3,000 per month
- Living expenses: R5,000-R8,000 per month
- Net income: R3,000-R4,000 per month (still positive cash flow)

## Part-Time Study Success Tips

**Academic Success:**
- Start with 2-3 subjects per semester (not full load)
- Choose subjects that complement your work experience
- Form study groups with other part-time students
- Use work projects as case studies for assignments

**Career Integration:**
- Choose degree that advances your current career
- Apply new knowledge immediately at work
- Build portfolio of work + study achievements
- Network with classmates (many are working professionals)

**Employer Relationship:**
- Be transparent about your study plans
- Show how studies benefit your work performance
- Maintain work quality (don't let studies affect job)
- Consider internal promotions as you gain qualifications

## Alternative Part-Time Options

**TVET Part-Time Programs:**
- Evening classes at most TVET colleges
- Cost: R1,500-R3,000 per year
- Duration: 2-3 years for N6 diploma
- Practical focus, immediate job application

**Online Universities:**
- University of the People (free, US-accredited)
- Coursera degrees (University of London, etc.)
- Cost: R0-R15,000 per year
- Fully flexible, study anytime

**Professional Certifications:**
- IT: CompTIA, Microsoft, Cisco certifications
- Finance: CIMA, ACCA, CFA
- Project Management: PMP, PRINCE2
- Cost: R3,000-R10,000 per certification
- Duration: 3-12 months each

## When Part-Time Study Makes Sense

**Choose Part-Time if:**
- You need income to support family
- You have work experience in your field
- You're disciplined and can manage time well
- Your employer supports your studies
- You want to minimize student debt

**Full-Time Better if:**
- You can get full funding (NSFAS, bursaries)
- You want to focus completely on studies
- You're young with no financial responsibilities
- You want the full university experience
- Your field requires intensive practical work (medicine, engineering)

**Bottom Line:** Part-time study takes longer but allows you to earn while learning. With discipline and employer support, it's a viable path to a degree without student debt.`,
        tags: ['part-time study', 'evening classes', 'weekend classes', 'work while studying', 'distance learning', 'unisa', 'wits evening', 'uct part-time', 'up evening', 'flexible schedule', 'study leave', 'employer support', 'seta funding', 'time management', 'work-study balance', 'online learning', 'professional certifications', 'tvet evening classes', 'study groups', 'career advancement']
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
          source_entity_type: 'financial_alternative',
          chunk_text: chunk.content,
          chunk_metadata: {
            source: `financial_alternative_${chunk.topic.toLowerCase().replace(/\s+/g, '_')}`,
            topic: chunk.topic,
            chunk_type: chunk.chunk_type,
            tags: chunk.tags,
            target_questions: ['Q6', 'Q10'],
            sprint: 'Sprint 2.2'
          }
        });
        
      if (chunkError) {
        console.error(`  ❌ Failed to insert ${chunk.topic}: ${chunkError.message}`);
      } else {
        insertedCount++;
        console.log(`  ✓ Inserted: ${chunk.topic} - ${chunk.chunk_type}`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total chunks added: ${insertedCount}/${chunks.length}`);
    console.log(`   Module: financial_alternatives_framework`);
    console.log(`   Target questions: Q6, Q10`);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ FINANCIAL ALTERNATIVES CONTENT COMPLETE!');
    console.log('   Next: Generate embeddings and test Q6, Q10 improvements');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error adding financial alternatives:', error.message);
    process.exit(1);
  }
}

// Run the script
addFinancialAlternatives();