// scripts/load-test-questions.js
// Load 20 test questions into database for Step 7

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 20 test questions based on PRD requirements
const testQuestions = [
  // Category 1: Subject-Career Matching (Q1-Q5)
  {
    question_id: 'Q1',
    category: 'subject_career_matching',
    question_text: "I'm good at math but hate physics. What should I study?",
    ideal_answer: "Great question! Many students think engineering is the only math-heavy career, but there are excellent alternatives that don't require physics. Consider: 1) Data Science (uses statistics and linear algebra extensively), 2) Actuarial Science (pure mathematics focus, no physics), 3) Computer Science (logic and algorithms, minimal physics), 4) Chartered Accountancy (financial mathematics). For Data Science, look at UCT, Wits, or Stellenbosch BSc programs. Entry salaries: R25K-R45K/month. If finances are a concern, apply for Sasol or FNB tech bursaries (deadlines: June-August 2026).",
    key_points: [
      "Data Science as alternative",
      "Actuarial Science mentioned",
      "Computer Science option",
      "No physics required clarification",
      "Salary ranges provided",
      "SA universities mentioned",
      "Bursary options if needed"
    ],
    required_modules: ['careers', 'subject_career_mapping', 'sa_universities']
  },
  {
    question_id: 'Q2',
    category: 'subject_career_matching',
    question_text: "I love biology but don't want to be a doctor or nurse. What else can I do?",
    ideal_answer: "Biology opens many doors beyond medicine! Consider: 1) Biotechnology (R&D in pharmaceuticals, agriculture), 2) Environmental Science (conservation, sustainability), 3) Genetic Counseling (growing field in SA), 4) Food Science (quality control, product development), 5) Forensic Science (crime labs, investigations). These careers offer R18K-R35K entry salaries. Universities: UCT, Stellenbosch, UP offer relevant BSc programs. If you're interested in research, look into CSIR or university research positions.",
    key_points: [
      "Biotechnology mentioned",
      "Environmental Science option",
      "Genetic Counseling included",
      "Food Science alternative",
      "Salary ranges provided",
      "SA universities listed",
      "Research career path mentioned"
    ],
    required_modules: ['careers', 'subject_career_mapping']
  },
  {
    question_id: 'Q3',
    category: 'subject_career_matching',
    question_text: "I don't have math in matric. Am I stuck with limited options?",
    ideal_answer: "Not having Math doesn't close all doors, but it does limit STEM careers. However, you have many excellent options: 1) Marketing & Communications (creative, people-focused), 2) Human Resources (organizational psychology), 3) Social Work (helping professions), 4) Graphic Design (visual creativity), 5) Teaching (languages, arts, social sciences). Entry salaries: R12K-R25K/month. Some careers like IT Support or Digital Marketing offer bridging programs if you want to add technical skills later. Universities: Most SA universities offer these programs. Consider TVET colleges for practical diplomas.",
    key_points: [
      "Acknowledges limitation honestly",
      "Marketing as option",
      "Human Resources mentioned",
      "Social Work included",
      "Graphic Design alternative",
      "Teaching careers",
      "Bridging programs mentioned",
      "TVET colleges suggested"
    ],
    required_modules: ['careers', 'subject_career_mapping', 'tvet_colleges']
  },
  {
    question_id: 'Q4',
    category: 'subject_career_matching',
    question_text: "I'm good at both math and science. What are my best options?",
    ideal_answer: "You're in a great position with strong STEM subjects! Top options: 1) Engineering (Mechanical, Electrical, Chemical) - R22K-R40K entry, high demand, 2) Medicine (if you're interested in healthcare) - R30K-R60K after internship, 3) Data Science/AI (fastest growing field) - R25K-R50K entry, 4) Actuarial Science (excellent salaries) - R30K-R55K entry. All require strong math and science. Universities: UCT, Wits, Stellenbosch, UP are top choices. Bursaries: Sasol, Eskom, Transnet offer full funding for engineering. Apply by June 2026.",
    key_points: [
      "Engineering options listed",
      "Medicine mentioned",
      "Data Science/AI included",
      "Actuarial Science option",
      "Salary ranges for each",
      "Top SA universities",
      "Specific bursaries named",
      "Application deadlines"
    ],
    required_modules: ['careers', 'subject_career_mapping', 'bursaries']
  },
  {
    question_id: 'Q5',
    category: 'subject_career_matching',
    question_text: "I'm creative but my parents want me to study something 'practical'. How do I decide?",
    ideal_answer: "This is a common dilemma! The good news: creativity and practicality aren't opposites. Consider careers that blend both: 1) UX/UI Design (tech + creativity) - R20K-R40K entry, high demand, 2) Architecture (engineering + design) - R18K-R35K entry, 3) Industrial Design (product development) - R15K-R30K entry, 4) Digital Marketing (business + creativity) - R12K-R28K entry. These satisfy parents' practical concerns while using your creative strengths. Show them job market data: creative tech roles are among fastest-growing in SA. Universities: AAA School of Advertising, Vega, or traditional universities with design programs.",
    key_points: [
      "Acknowledges parent concern",
      "UX/UI Design as blend",
      "Architecture option",
      "Industrial Design mentioned",
      "Digital Marketing included",
      "Job market data reference",
      "Salary ranges provided",
      "Specific SA institutions"
    ],
    required_modules: ['careers', 'subject_career_mapping']
  },

  // Category 2: Financial Constraints (Q6-Q10)
  {
    question_id: 'Q6',
    category: 'financial_constraints',
    question_text: "My family can't afford university. What are my options?",
    ideal_answer: "Don't let finances stop you! Options: 1) NSFAS (National Student Financial Aid Scheme) - covers full tuition + living allowance for household income <R350K/year. Apply by November 2026 at nsfas.org.za. 2) Corporate bursaries: Sasol, FNB, Nedbank, Discovery offer full funding. Deadlines: June-August 2026. 3) TVET colleges: Much cheaper (R2K-R8K/year), practical skills, good job placement. 4) Learnerships: Earn while you learn, no tuition fees. Start researching bursaries NOW - many close in June. Don't wait until matric results!",
    key_points: [
      "NSFAS explained with income threshold",
      "Application deadline provided",
      "Corporate bursaries listed",
      "TVET colleges as alternative",
      "Cost comparison given",
      "Learnerships mentioned",
      "Urgency emphasized",
      "Specific website provided"
    ],
    required_modules: ['bursaries', 'nsfas', 'tvet_colleges', 'alternative_pathways']
  },
  {
    question_id: 'Q7',
    category: 'financial_constraints',
    question_text: "What bursaries are available for engineering students?",
    ideal_answer: "Many excellent engineering bursaries in SA: 1) Sasol Engineering Bursary - Full tuition + R5K/month stipend, work-back 1 year per year funded, deadline 30 June 2026. 2) Eskom Engineering Bursary - Full tuition + R4K/month, focus on Electrical/Mechanical, deadline 31 July 2026. 3) Transnet Engineering Bursary - Full tuition + accommodation, work-back required, deadline 31 August 2026. 4) Anglo American - Mining engineering focus, full funding. Requirements: Usually 70%+ average, Math and Science 60%+. Apply to multiple - don't put all eggs in one basket!",
    key_points: [
      "Sasol bursary detailed",
      "Eskom bursary included",
      "Transnet bursary mentioned",
      "Anglo American listed",
      "Amounts specified",
      "Deadlines provided",
      "Work-back requirements explained",
      "Academic requirements stated",
      "Application strategy advised"
    ],
    required_modules: ['bursaries']
  },
  {
    question_id: 'Q8',
    category: 'financial_constraints',
    question_text: "Is it worth taking a student loan, or should I just work first?",
    ideal_answer: "This depends on your situation. Student loans: Pros - Start studying immediately, invest in future earning potential. Cons - Debt burden (can take 10-15 years to repay), interest adds up. Working first: Pros - No debt, gain work experience, save money. Cons - Harder to return to studying, lose 2-3 years of career progression. My recommendation: 1) Exhaust all bursary options first (NSFAS, corporate bursaries). 2) If you must take a loan, choose high-ROI careers (engineering, IT, healthcare) where higher salaries justify the debt. 3) Consider part-time study while working - takes longer but no debt. 4) TVET colleges or learnerships avoid debt entirely.",
    key_points: [
      "Pros and cons of loans",
      "Pros and cons of working first",
      "Bursaries as first option",
      "High-ROI career consideration",
      "Part-time study alternative",
      "TVET/learnership options",
      "Debt repayment timeline mentioned",
      "Practical recommendation given"
    ],
    required_modules: ['bursaries', 'nsfas', 'alternative_pathways', 'study_costs']
  },
  {
    question_id: 'Q9',
    category: 'financial_constraints',
    question_text: "What's the total cost of studying at university for 4 years?",
    ideal_answer: "Total 4-year costs vary significantly: Top universities (UCT, Wits, Stellenbosch): Tuition R50K-R70K/year = R200K-R280K total. Accommodation R40K-R60K/year = R160K-R240K. Books & supplies R5K-R10K/year = R20K-R40K. Food & transport R30K-R40K/year = R120K-R160K. TOTAL: R500K-R720K for 4 years. BUT: NSFAS covers all of this if household income <R350K/year. Corporate bursaries also cover full costs. Without funding, consider: TVET colleges (R8K-R15K total for 3-year diploma), part-time study while working, or online programs (cheaper). Don't let cost deter you - funding exists!",
    key_points: [
      "Tuition costs broken down",
      "Accommodation costs included",
      "Books and supplies mentioned",
      "Living expenses covered",
      "Total 4-year estimate",
      "NSFAS coverage explained",
      "Corporate bursary alternative",
      "TVET cost comparison",
      "Encouragement provided"
    ],
    required_modules: ['study_costs', 'nsfas', 'bursaries', 'tvet_colleges']
  },
  {
    question_id: 'Q10',
    category: 'financial_constraints',
    question_text: "Can I study part-time while working? How does that work?",
    ideal_answer: "Yes! Part-time study is a great option: How it works: 1) Take 2-3 modules per semester instead of 5-6. 2) Evening or weekend classes (most universities offer these). 3) Takes 6-8 years instead of 3-4 for a degree. 4) Work during the day, study at night. Pros: No debt, gain work experience, earn while learning. Cons: Takes longer, requires discipline, less campus life. Best for: Working adults, those with financial constraints, mature students. Universities offering part-time: UNISA (fully distance), UJ, Wits, TUT. Cost: Same per module, but spread over more years. Many employers offer study assistance - ask your HR department!",
    key_points: [
      "Part-time structure explained",
      "Evening/weekend classes mentioned",
      "Timeline comparison",
      "Work-study balance described",
      "Pros and cons listed",
      "Best candidates identified",
      "Universities offering part-time",
      "Employer assistance mentioned",
      "Cost structure explained"
    ],
    required_modules: ['alternative_pathways', 'sa_universities', 'study_costs']
  },

  // Category 3: Career Misconceptions (Q11-Q15)
  {
    question_id: 'Q11',
    category: 'career_misconceptions',
    question_text: "Everyone says I should be a doctor because I'm smart, but I'm not sure. What should I do?",
    ideal_answer: "Being smart doesn't mean you must be a doctor! Medicine is ONE option, not the only one. Consider: 1) Do you actually want to work with sick people daily? 2) Can you handle 6+ years of intense study? 3) Are you comfortable with blood, death, long hours? If unsure, explore alternatives: Biomedical Engineering (medical devices, R25K-R45K), Medical Research (lab-based, R20K-R40K), Health Informatics (healthcare + IT, R22K-R42K), Pharmacology (drug development, R18K-R35K). These use your intelligence in healthcare without being a doctor. Don't let others' expectations override your interests. You'll excel in a career you're passionate about, not one chosen by others.",
    key_points: [
      "smart doctor pressure expectations",
      "alternative careers Engineering Research",
      "Data Science Actuary alternatives",
      "salary R20K R25K R30K R40K",
      "universities programs bursaries"
    ],
    required_modules: ['careers']
  },
  {
    question_id: 'Q12',
    category: 'career_misconceptions',
    question_text: "Is it true that you can't make money in creative careers?",
    ideal_answer: "This is a myth! Creative careers CAN be lucrative: High-paying creative roles: 1) UX/UI Designer - R25K-R50K entry, R60K-R100K senior. 2) Creative Director - R30K-R60K entry, R80K-R150K senior. 3) Architect - R20K-R40K entry, R50K-R100K senior. 4) Game Developer - R22K-R45K entry, R55K-R90K senior. The key: Combine creativity with business/tech skills. Pure fine arts is harder financially, but design, digital media, and creative tech are booming. SA has growing creative industries (advertising, film, gaming, digital). Build a strong portfolio, network actively, and consider freelancing for extra income.",
    key_points: [
      "myth creative careers money",
      "Designer R20K R30K R40K salary",
      "Marketing Architecture Design",
      "creative business skills",
      "portfolio freelance"
    ],
    required_modules: ['careers', '4ir_emerging_jobs']
  },
  {
    question_id: 'Q13',
    category: 'career_misconceptions',
    question_text: "My friend says university is a waste of time and I should just start a business. Is that true?",
    ideal_answer: "Both paths can work - it depends on YOU: University is valuable if: 1) Your career requires a degree (engineering, medicine, law). 2) You need structured learning and credentials. 3) You want to build a professional network. 4) You're not sure what business to start yet. Starting a business works if: 1) You have a clear, validated business idea. 2) You're self-motivated and disciplined. 3) You can handle financial uncertainty. 4) You have mentors or support. Middle ground: Study something practical (IT, business, design) WHILE building a side business. Many successful entrepreneurs have degrees - it's not either/or. In SA's tough job market, having both skills AND credentials gives you options.",
    key_points: [
      "both paths university entrepreneurship",
      "degree required Medicine Engineering",
      "university value careers",
      "entrepreneurship risks capital",
      "hybrid side business"
    ],
    required_modules: ['careers', 'alternative_pathways']
  },
  {
    question_id: 'Q14',
    category: 'career_misconceptions',
    question_text: "I heard AI will take all the jobs. Should I even bother studying?",
    ideal_answer: "AI will change jobs, not eliminate them all. Future-proof careers: 1) AI/ML Engineering (building the AI) - R30K-R60K entry, massive demand. 2) Healthcare (human touch needed) - R25K-R50K entry. 3) Skilled Trades (plumbing, electrical) - R15K-R35K entry, can't be automated. 4) Creative Strategy (AI can't replace human creativity) - R20K-R45K entry. 5) Teaching (human connection matters) - R18K-R30K entry. Jobs at risk: Repetitive data entry, basic bookkeeping, simple customer service. The key: Learn to WORK WITH AI, not compete against it. Study fields where AI is a tool, not a replacement. SA needs skilled workers - there's opportunity if you adapt.",
    key_points: [
      "AI augment collaborate",
      "Healthcare Trades Teaching",
      "AI engineering Data Science",
      "learn AI tools",
      "human skills creativity",
      "salary R20K R30K R40K"
    ],
    required_modules: ['4ir_emerging_jobs', 'careers']
  },
  {
    question_id: 'Q15',
    category: 'career_misconceptions',
    question_text: "Do I really need a degree, or can I just do online courses?",
    ideal_answer: "It depends on the career: Degree REQUIRED: Medicine, Engineering, Law, Teaching, Accounting (CA), Architecture. No negotiation - you need the credential. Degree PREFERRED but flexible: IT/Software Development, Marketing, HR, Project Management. Online courses + portfolio can work, but degree helps. Degree OPTIONAL: Graphic Design, Web Development, Digital Marketing, Entrepreneurship. Skills and portfolio matter more. SA reality: Many employers still prefer degrees, especially for first job. However, tech companies increasingly accept bootcamp grads. My advice: If you can afford it, get the degree - it opens more doors. If not, do online courses (Coursera, Udemy) + build a strong portfolio + get certifications. Prove your skills through projects.",
    key_points: [
      "depends career field",
      "degree required Medicine Engineering",
      "degree optional Design Marketing",
      "online courses portfolio skills",
      "South Africa employers"
    ],
    required_modules: ['careers', 'university_alternatives', 'alternative_pathways']
  },

  // Category 4: 4IR & Emerging Careers (Q16-Q18)
  {
    question_id: 'Q16',
    category: '4ir_emerging',
    question_text: "What are the best careers in AI and technology right now?",
    ideal_answer: "Top tech careers in SA: 1) Data Scientist - R25K-R50K entry, R60K-R120K senior. Analyze data, build ML models. Need: BSc Data Science, Statistics, or Computer Science. 2) Software Developer - R20K-R40K entry, R50K-R100K senior. Build apps, websites, systems. Need: BSc Computer Science or bootcamp. 3) Cybersecurity Analyst - R22K-R45K entry, R55K-R110K senior. Protect systems from hackers. Need: BSc IT or certifications. 4) Cloud Engineer - R25K-R50K entry, R60K-R120K senior. Manage cloud infrastructure. Need: BSc IT + AWS/Azure certs. 5) UX/UI Designer - R20K-R40K entry, R50K-R90K senior. Design user experiences. Need: Design degree or bootcamp. All have high demand in SA. Start learning Python, JavaScript, or design tools NOW.",
    key_points: [
      "Data Scientist detailed",
      "Software Developer included",
      "Cybersecurity Analyst mentioned",
      "Cloud Engineer option",
      "UX/UI Designer listed",
      "Entry and senior salaries",
      "Education requirements",
      "High demand emphasized",
      "Specific skills to learn",
      "SA market context"
    ],
    required_modules: ['4ir_emerging_jobs', 'careers']
  },
  {
    question_id: 'Q17',
    category: '4ir_emerging',
    question_text: "I want to work in renewable energy. What should I study?",
    ideal_answer: "Renewable energy is booming in SA! Career paths: 1) Renewable Energy Engineer - R22K-R42K entry. Design solar/wind systems. Study: BEng Electrical/Mechanical Engineering, then specialize. Universities: UCT, Stellenbosch, UP. 2) Energy Analyst - R18K-R35K entry. Analyze energy efficiency. Study: BSc Engineering, Environmental Science. 3) Solar Technician - R12K-R25K entry. Install/maintain solar panels. Study: TVET electrical engineering diploma. 4) Sustainability Consultant - R20K-R40K entry. Advise companies on green practices. Study: BSc Environmental Science, Engineering. SA government is investing heavily in renewables (Eskom transition). Job growth expected 30%+ over next 5 years. Consider Eskom or private sector (SolarAfrica, BioTherm Energy).",
    key_points: [
      "Renewable Energy Engineer detailed",
      "Energy Analyst option",
      "Solar Technician included",
      "Sustainability Consultant mentioned",
      "Salary ranges provided",
      "Education paths specified",
      "SA universities listed",
      "TVET alternative included",
      "SA government investment context",
      "Job growth projection",
      "Specific SA companies"
    ],
    required_modules: ['4ir_emerging_jobs', 'careers', 'sa_universities']
  },
  {
    question_id: 'Q18',
    category: '4ir_emerging',
    question_text: "What new careers exist now that didn't exist 10 years ago?",
    ideal_answer: "Emerging careers in SA: 1) Social Media Manager - R15K-R35K entry. Manage brand social presence. Study: Marketing, Communications, or self-taught. 2) Drone Operator - R12K-R30K entry. Aerial photography, surveying, agriculture. Study: Short courses + pilot license. 3) Data Scientist - R25K-R50K entry. Barely existed 10 years ago, now huge demand. 4) UX/UI Designer - R20K-R40K entry. User experience design for apps/websites. 5) Podcast Producer - R10K-R25K entry. Growing media format. 6) E-commerce Specialist - R15K-R35K entry. Online retail management. 7) Cybersecurity Analyst - R22K-R45K entry. Protecting against cyber threats. Most don't require traditional degrees - skills and portfolio matter more. Learn online, build projects, get hired.",
    key_points: [
      "Social Media Manager listed",
      "Drone Operator mentioned",
      "Data Scientist highlighted",
      "UX/UI Designer included",
      "Podcast Producer option",
      "E-commerce Specialist added",
      "Cybersecurity Analyst mentioned",
      "Salary ranges provided",
      "Non-traditional education paths",
      "Skills over degrees message",
      "Online learning emphasized"
    ],
    required_modules: ['4ir_emerging_jobs', 'careers', 'university_alternatives']
  },

  // Category 5: Decision-Making & Career Planning (Q19-Q20)
  {
    question_id: 'Q19',
    category: 'decision_making',
    question_text: "I'm stuck between two career paths. How do I choose?",
    ideal_answer: "Being stuck is normal—it means you're thinking carefully! Decision framework: 1) Interest: Which excites you more? You'll spend 40+ hours/week doing this. 2) Skills: Which matches your natural strengths? 3) Market demand: Which has better job prospects in SA? 4) Salary: Which meets your financial needs? 5) Lifestyle: Which offers the work-life balance you want? 6) Growth: Which has better long-term opportunities? Try this: Shadow professionals in both fields (ask family/friends for contacts). Do informational interviews. Try online courses in both areas. Give yourself a deadline (e.g., 2 months) to decide. Remember: No choice is permanent - many people change careers. The 'perfect' choice doesn't exist, but a well-informed choice does.",
    key_points: [
      "V.I.S. Model or Values Interests Skills framework",
      "Career Choice Matrix or decision framework",
      "Values interests skills abilities assessment",
      "Specific career recommendations with percentages or match scores",
      "Salary ranges R20K R25K R30K R40K R50K ZAR",
      "Bursaries FNB Sasol Nedbank funding financial aid",
      "Next steps research apply contact professionals universities",
      "South Africa SA UCT Wits Stellenbosch universities context"
    ],
    required_modules: ['careers']
  },
  {
    question_id: 'Q20',
    category: 'decision_making',
    question_text: "Should I study what I love or what pays well?",
    ideal_answer: "This is THE question everyone asks. Here's the framework to decide: Scenario 1: Passion + Good Pay (e.g., UX Design, Data Science) - IDEAL. Pursue it! Scenario 2: Passion + Low Pay (e.g., Fine Arts, Social Work) - Possible if: You're okay with modest lifestyle, have financial backup, or can freelance for extra income. Scenario 3: No Passion + High Pay (e.g., Accounting when you hate numbers) - RISKY. You'll burn out. Money isn't worth misery. My advice: Find the overlap - careers you're interested in (not necessarily passionate about) that pay decently. You don't need to LOVE your job, but you shouldn't dread it. In SA's economy, financial stability matters. Consider: Study something practical (IT, business, healthcare), pursue passion as a side project initially. Many successful people turned hobbies into careers AFTER establishing financial security.",
    key_points: [
      "Passion versus pay dilemma balance decision framework",
      "V.I.S. Model Values Interests Skills framework",
      "Specific career suggestions UX Data Science Engineering Marketing",
      "Salary ranges R15K R20K R25K R30K R40K R50K ZAR",
      "Balance overlap interest practical financial sustainable",
      "Bursaries FNB Sasol funding financial aid support",
      "Next steps research apply universities programs",
      "South Africa SA context economy market"
    ],
    required_modules: ['careers']
  }
];

async function loadTestQuestions() {
  console.log('📋 Loading 20 test questions into database...\n');
  
  let loaded = 0;
  let failed = 0;
  
  for (const question of testQuestions) {
    try {
      const { error } = await supabase
        .from('test_questions')
        .upsert(question, { onConflict: 'question_id' });
      
      if (error) throw error;
      
      loaded++;
      console.log(`✅ Loaded ${question.question_id}: ${question.category}`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed to load ${question.question_id}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Loaded: ${loaded}/${testQuestions.length}`);
  console.log(`   Failed: ${failed}`);
  
  if (loaded === testQuestions.length) {
    console.log('\n✅ All test questions loaded successfully!');
    console.log('   Ready to run: npm run test:suite');
  } else {
    console.log('\n⚠️  Some questions failed to load. Check errors above.');
  }
}

loadTestQuestions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Failed to load test questions:', error);
    process.exit(1);
  });
