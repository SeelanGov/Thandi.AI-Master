#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🎯 UPLOADING KEYWORD-RICH CAREER SUMMARIES\n');

// Keyword-rich summaries designed to match common student queries
const summaries = [
  {
    career: 'Electrician',
    module: 'trades_careers',
    text: `Electrician: NO UNIVERSITY NEEDED. Apprenticeship route - earn while you learn. Start with Grade 9 + Math 50%. Salary R20K-R35K/month qualified, R40K-R80K+ as contractor. Fastest path to good income after matric. Solar PV specialization pays premium. Cannot be outsourced - permanent SA demand. Trade test after 3-4 years. TVET colleges offer courses. Perfect for: hands-on work, no university, good salary, stable career, loadshedding opportunities.`
  },
  {
    career: 'Chef',
    module: 'trades_careers',
    text: `Chef: NO UNIVERSITY NEEDED. Culinary school 1-2 years OR apprenticeship. Some schools accept Grade 11. Salary R8K-R25K starting, R40K-R80K+ executive chef. International opportunities: cruise ships R35K-R70K/month tax-free. Earn while learning possible. Fast entry to job market. Tourism growth sector. Perfect for: creative, no university, travel opportunities, good salary potential, passion for food.`
  },
  {
    career: 'Software Engineer',
    module: 'engineering_careers',
    text: `Software Engineer: MULTIPLE ROUTES - university degree, coding bootcamp (3-6 months), OR self-taught. NO PHYSICS required, just Math 70%+. Salary R25K-R40K junior, R150K-R280K senior. REMOTE WORK - earn dollars from SA ($3K-$20K/month). Work for international companies. Bootcamp fastest route without university. High demand, cannot be outsourced. Perfect for: technology, remote work, high salary, international opportunities, no physics, creative problem-solving.`
  },
  {
    career: 'UX/UI Designer',
    module: 'creative_arts_careers',
    text: `UX/UI Designer: CREATIVE + TECHNOLOGY combined. Multiple routes - degree, bootcamp, OR self-taught with portfolio. Salary R15K-R30K junior, R80K-R150K+ senior. 70% remote work possible. Earn dollars: $40-$120/hour international. Portfolio matters more than qualifications. 3-6 month bootcamps available. Perfect for: creative AND tech, remote work, design, problem-solving, no specific matric subjects, international opportunities.`
  },
  {
    career: 'Content Creator',
    module: 'creative_arts_careers',
    text: `Content Creator: NO FORMAL EDUCATION NEEDED. Start immediately with smartphone. Revenue: AdSense, sponsorships, affiliates. Reality: 95% earn <R5K/month, top 5% earn R50K-R500K+. Can earn dollars from international audience. Skills: video editing, social media, storytelling. Equipment: R5K-R50K. Perfect for: creative, no university, no matric needed, self-employed, flexible schedule, international audience. HIGH RISK but no barriers to entry.`
  },
  {
    career: 'Graphic Designer',
    module: 'creative_arts_careers',
    text: `Graphic Designer: PORTFOLIO > QUALIFICATIONS. Multiple routes - degree, diploma, OR self-taught (6-12 months). No specific matric subjects. Salary R12K-R20K junior, R35K-R50K+ senior. Freelance: $30-$100/hour international. 60% work remotely. Adobe Creative Suite essential. NSFAS covers design diplomas. Perfect for: creative, visual arts, remote work, freelance, no specific subjects, international clients, flexible career.`
  },
  {
    career: 'Data Scientist',
    module: '4ir_emerging_jobs',
    text: `Data Scientist: Math 75%+ required. University degree needed (BSc Data Science, Statistics, Computer Science). Salary R25K-R45K junior, R180K+ senior. REMOTE WORK - earn dollars from international companies. Called "sexiest job of 4IR". High demand, cannot be outsourced. Python, statistics, machine learning. Perfect for: mathematics, technology, problem-solving, remote work, high salary, international opportunities, analytical thinking.`
  },
  {
    career: 'AI/ML Engineer',
    module: '4ir_emerging_jobs',
    text: `AI/ML Engineer: Math 80%+ essential (AI is applied mathematics). University degree in Computer Science, Engineering, or Math. HIGHEST-PAYING tech career in SA. Salary R30K-R50K junior, R150K-R280K+ senior. REMOTE WORK for US/EU companies possible. Cutting-edge technology. High demand globally. Perfect for: mathematics, technology, problem-solving, remote work, highest salary, international opportunities, innovation.`
  },
  {
    career: 'Medical Doctor',
    module: 'healthcare_extended',
    text: `Medical Doctor: Life Sciences 70%+, Math 60%+, Physical Sciences 60%+ required. 6-year MBChB degree. Salary R40K-R70K intern, R80K-R200K+ specialist. NSFAS covers medical degrees. Bursaries: Discovery, Netcare, government. Rural service for loan forgiveness. Combines biology AND technology (medical tech advancing). Perfect for: biology, science, helping people, high salary, job security, respected career, technology in healthcare.`
  },
  {
    career: 'Pharmacist',
    module: 'healthcare_extended',
    text: `Pharmacist: Life Sciences 70%+, Math 60%+ required. 4-year BPharm degree (shorter than medicine). Salary R25K-R70K/month. Good work-life balance. NSFAS covers pharmacy degrees. Retail, hospital, or industrial pharmacy. Combines chemistry AND patient care. Less expensive than medical school. Perfect for: biology, chemistry, healthcare, good salary, work-life balance, helping people, science AND people skills.`
  },
  {
    career: 'Cybersecurity Specialist',
    module: '4ir_emerging_jobs',
    text: `Cybersecurity Specialist: Math 70%+ recommended. Degree OR certifications (CompTIA Security+, CEH). Salary R25K-R45K junior, R100K-R200K+ senior. REMOTE WORK - SOC analyst roles for international companies. HIGH DEMAND - every company needs cybersecurity. Cannot be outsourced. Earn dollars possible. Perfect for: technology, problem-solving, remote work, high salary, job security, international opportunities, ethical hacking.`
  },
  {
    career: 'Blockchain Developer',
    module: '4ir_emerging_jobs',
    text: `Blockchain Developer: Math 70%+ helpful. Computer Science degree OR self-taught with portfolio. Salary R30K-R60K junior, R150K-R300K+ senior. REMOTE WORK for crypto companies globally. Earn dollars/crypto. Cutting-edge technology. High demand, limited supply. Perfect for: technology, innovation, remote work, highest salaries, international opportunities, cryptocurrency, decentralized systems.`
  },
  {
    career: 'Renewable Energy Specialist',
    module: '4ir_emerging_jobs',
    text: `Renewable Energy Specialist: Math 70%+, Physical Sciences 70%+ required. Engineering degree OR technical diploma. Salary R25K-R50K qualified. Solar PV installation: 1-week course → employable. HUGE growth due to loadshedding. Government priority sector. Cannot be outsourced. Perfect for: science, hands-on work, environmental impact, growing industry, job security, loadshedding solutions, practical engineering.`
  },
  {
    career: 'Mechanical Engineer',
    module: 'engineering_careers',
    text: `Mechanical Engineer: Math 70%+, Physical Sciences 70%+ required. 4-year BEng degree. Salary R25K-R40K graduate, R150K+ with PE registration. Work in automotive, renewable energy, manufacturing. SASOL, Eskom bursaries available. Professional registration increases salary 20-40%. Perfect for: mathematics, physics, problem-solving, design, hands-on engineering, good salary, bursary opportunities, diverse industries.`
  },
  {
    career: 'Electrical Engineer',
    module: 'engineering_careers',
    text: `Electrical Engineer: Math 75%+, Physical Sciences 75%+ required. 4-year BEng degree. Salary R28K-R45K graduate, R160K+ with PE registration. Critical for SA renewable energy and loadshedding solutions. Eskom, Exxaro bursaries. High demand. Perfect for: mathematics, physics, problem-solving, renewable energy, loadshedding solutions, high salary, bursary opportunities, job security.`
  },
  {
    career: 'Chemical Engineer',
    module: 'engineering_careers',
    text: `Chemical Engineer: Math 70%+, Physical Sciences 70%+ required. 4-year BEng degree. HIGHEST graduate engineering salary R30K-R40K/month starting. SASOL offers 400+ bursaries with GUARANTEED employment. Work in petrochemicals, mining, pharmaceuticals. Perfect for: mathematics, chemistry, physics, problem-solving, highest engineering salary, guaranteed employment, SASOL bursaries, diverse industries.`
  },
  {
    career: 'Civil Engineer',
    module: 'engineering_careers',
    text: `Civil Engineer: Math 70%+, Physical Sciences 70%+ required. 4-year BEng degree. Salary R25K-R40K graduate, R150K+ with PE registration. Design infrastructure: roads, bridges, buildings, water systems. Government infrastructure spend creating demand. Perfect for: mathematics, physics, design, infrastructure, visible impact, good salary, bursary opportunities, public sector opportunities.`
  },
  {
    career: 'Physiotherapist',
    module: 'healthcare_extended',
    text: `Physiotherapist: Life Sciences 70%+, Math 60%+ required. 4-year degree, MORE AFFORDABLE than medicine. Salary R25K-R80K/month. High demand especially sports physio. Good work-life balance. Bursaries available. Help people recover from injuries. Perfect for: biology, helping people, sports, healthcare without medical school cost, good salary, work-life balance, hands-on treatment.`
  },
  {
    career: 'Occupational Therapist',
    module: 'healthcare_extended',
    text: `Occupational Therapist: Life Sciences 70%+, Math 60%+ required. 4-year degree. Salary R20K-R60K/month. Help people with disabilities/injuries. Growing field with aging population. More affordable than medicine. NSFAS covers OT degrees. Perfect for: biology, helping people, healthcare, problem-solving, work-life balance, meaningful impact, affordable healthcare career.`
  }
];

async function uploadSummaries() {
  let uploaded = 0;
  let failed = 0;

  for (const summary of summaries) {
    try {
      // Get module ID
      const { data: module } = await supabase
        .from('knowledge_modules')
        .select('id')
        .eq('module_name', summary.module)
        .single();

      if (!module) {
        console.log(`⚠️  Module not found: ${summary.module} for ${summary.career}`);
        failed++;
        continue;
      }

      // Insert chunk
      const { error } = await supabase
        .from('knowledge_chunks')
        .insert({
          module_id: module.id,
          source_entity_type: 'career_summary',
          chunk_text: summary.text,
          chunk_metadata: {
            career: summary.career,
            type: 'keyword_rich_summary',
            keywords: summary.text.toLowerCase().split(/[,.\s]+/).filter(w => w.length > 3)
          }
        });

      if (error) {
        console.log(`❌ Failed: ${summary.career} - ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${summary.career}`);
        uploaded++;
      }

    } catch (error) {
      console.log(`❌ Error: ${summary.career} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Failed: ${failed}`);
  console.log(`\n🔮 Generating embeddings...`);
}

uploadSummaries().catch(console.error);
