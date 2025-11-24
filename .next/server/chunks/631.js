"use strict";exports.id=631,exports.ids=[631],exports.modules={53731:(e,t,i)=>{i.d(t,{K:()=>s});var n=i(16832);let a=null;async function s(e){if(!e||"string"!=typeof e)throw Error("Query text must be a non-empty string");try{let t=(a||(a=new n.ZP({apiKey:process.env.OPENAI_API_KEY})),a),i=(await t.embeddings.create({model:"text-embedding-ada-002",input:e.trim()})).data[0].embedding;if(1536!==i.length)throw Error(`Expected 1536 dimensions, got ${i.length}`);return i}catch(e){throw console.error("Error generating query embedding:",e.message),Error(`Failed to generate embedding: ${e.message}`)}}},18166:(e,t,i)=>{i.d(t,{o:()=>c});var n=i(54),a=i(16832);let s={droppingOut:{patterns:[/(should i|can i|want to|thinking of|considering).*(drop out|leave school|quit school|stop school)/i,/do i need.*(matric|grade 12|to finish school)/i,/(drop|leave|quit).*(school|matric)/i,/dropping out/i],response:"I don't have verified information on leaving school before completing matric. This is a serious decision with long-term consequences. Please speak with your school principal, parents/guardians, and a career counselor before considering this option."},noMatric:{patterns:[/(what can i do|careers|jobs|options).*(without|with no|if i don't have).*(matric|grade 12)/i,/(failed|didn't pass|no).* matric/i,/only grade (9|10|11)/i,/without matric/i,/no matric/i],response:"I don't have verified information on pathways without matric completion. Please verify your options with your school's career counselor or contact the Department of Higher Education and Training (DHET) at www.dhet.gov.za."},unaccreditedInstitution:{patterns:[/\bis\s+[\w\s]+\s+(good|accredited|legitimate|real|recognized)\?/i,/\bshould i\s+(study at|enroll at|apply to)\s+[\w\s]+\?/i],response:"I don't have verified information on this institution. Before enrolling anywhere, verify that it's registered with the Department of Higher Education and Training (DHET) at www.dhet.gov.za or check the Council on Higher Education (CHE) accreditation list at www.che.ac.za."},largeFinancialDecision:{patterns:[/should i.*(take|get|apply for).*(loan|student loan|debt)/i,/(this course|this program).*worth.*R\d+/i,/should i pay.*R\d+/i,/R[1-9]\d{4,}/i,/student loan/i],response:"I don't have verified information on financial decisions of this scale. Please consult with your parents/guardians and verify costs directly with the institution. For funding options, contact NSFAS at www.nsfas.org.za or speak with your school's financial aid advisor."},legalRequirements:{patterns:[/\bdo i qualify for\s+nsfas/i,/\bnsfas\s+(eligibility|requirements|application)/i,/\b(can i|am i allowed to)\s+work\s+(while studying|as a student)/i,/\b(visa|work permit|legal)\s+requirements/i,/\blegal\s+(requirements|rules|regulations)/i],response:"I don't have verified information on legal requirements and eligibility. Please verify directly with:\n- NSFAS eligibility: www.nsfas.org.za or call 08000 67327\n- Work permits: Department of Home Affairs\n- Study requirements: The specific institution you're applying to\n- Legal questions: Your school counselor or the relevant government department"},medicalRequirements:{patterns:[/\bcan i be a\s+(doctor|nurse|medical)\s+with\s+(my|this|these)/i,/\bwill\s+(my|a|this)\s+[\w\s]+(condition|disability|illness)\s+stop me/i,/\bdo i need to disclose\s+(my|a)\s+[\w\s]+(condition|medical)/i,/\bmedical\s+requirements\s+for/i],response:"I don't have verified information on medical requirements for healthcare careers. Please verify directly with:\n- The Health Professions Council of South Africa (HPCSA): www.hpcsa.co.za\n- The specific university's admissions office\n- A qualified career counselor\n- Your school's guidance department"},timingDecisions:{patterns:[/\bshould i\s+(take|have)\s+a\s+gap year/i,/\bam i\s+(too young|too old)\s+for/i,/\bshould i wait\s+(before|to)\s+(study|apply)/i,/\b(defer|postpone|delay)\s+(my|studying|university)/i],response:"I don't have verified information on timing decisions like gap years or deferring studies. This is a personal choice that depends on your specific circumstances, goals, and readiness. Please discuss with your parents/guardians, teachers, and school counselor who know your situation."}},r=null,o=null;async function c(e,t,i,n={}){let{maxRetries:a=2,timeout:r=1e4,preferredModel:o="true"===process.env.TESTING?"openai":"groq"}=n,c=function(e){for(let[t,i]of Object.entries(s))for(let n of i.patterns)if(n.test(e))return{category:t,response:i.response,triggered:!0};return null}(e);if(c)return console.log(`⚠️ Dangerous query detected: ${c.category}`),{success:!0,response:c.response+`

---

⚠️ **Verify before you decide:**
1. Check with your school counselor
2. Talk to your parents/guardians
3. Contact the official authority (listed above)

This is a serious decision. Get personalized guidance from people who know your situation.`,validation:{passed:!0,dangerousQueryHandled:!0},metadata:{generationTime:0,modelUsed:"safety-filter",tokensUsed:{prompt:0,completion:0,total:0},retries:0,validationPassed:!0,dangerCategory:c.category,safetyTriggered:!0}};let d=Date.now(),m=0,g=null,p=o;for(;m<=a;)try{let n;let a=function(e,t,i,n=0){let a=/stuck|choose|decision|between|paths|love.*pay|passion.*pay/i.test(e),s=/everyone says|is it true|heard|friend says|myth|waste of time|AI.*jobs|degree.*online/i.test(e),r=/creative|artist|music|design|art|writer/i.test(e),o=/AI|artificial intelligence|automation|robots|future.*jobs/i.test(e),c=/hate math|bad at math|struggle with math|math is hard|don't like math|worst subject.*math/i.test(e)||i.academicWeaknesses?.some(e=>/math/i.test(e)),l="low"===i.financialConstraint||i.constraints?.money==="low"||/can't afford|no money|poor|financial|bursaries?|nsfas/i.test(e),h="";c&&(h+=`

RULE #3 - MATH-HATE HEALTHCARE (CRITICAL):
The student has expressed math anxiety or weakness. You MUST follow these rules:

1. DO NOT remove healthcare careers from recommendations
2. DO include healthcare careers that require moderate math (Nursing, Pharmacy, Physiotherapy, Occupational Therapy, Radiography, Dietetics)
3. FOR EACH healthcare career recommended, add this exact warning:

   ⚠️ Note: This requires moderate math (dosage calculations, statistics). Many students who struggle with math succeed with tutoring and extra support. Verify requirements with nursing/health sciences schools.

4. Be honest about math requirements but NOT discouraging
5. Mention tutoring/support as a viable path
6. DO filter out high-math careers (Engineering, Actuarial Science, Data Science) if math is a significant weakness

Example format:
**Nursing (75% match)**
Why: Strong fit for your caring nature and interest in health

⚠️ Note: This requires moderate math (dosage calculations, statistics). Many students who struggle with math succeed with tutoring and extra support. Verify requirements with nursing schools.

Entry: Grade 12 with Life Sciences, minimum APS 28-32
Salary: R15,000-R35,000/month

REMEMBER: Math anxiety ≠ Math inability. Do not eliminate healthcare careers.`),l&&(h+=`

RULE #4 - NSFAS PRIORITIZATION (CRITICAL):
This student has financial constraints. You MUST follow these rules:

1. PRIORITIZE careers in this order:
   a) Careers with active bursary programs (Sasol, Eskom, mining companies, banks)
   b) NSFAS-funded pathways (public universities, TVET colleges)
   c) Free training options (learnerships, apprenticeships, SETAs)

2. FOR EACH RECOMMENDATION, include in the FIRST paragraph:
   💰 Funding Available: [Total value over 3 years]
   - [Bursary Name]: R[Amount]/year (covers [what])
   - NSFAS: R[Amount]/year (covers [what])
   - [Other Bursary]: R[Amount]/year (covers [what])

3. SHOW SPECIFIC DETAILS:
   - Exact amounts (R120,000/year, NOT "full funding")
   - Application deadlines (May 30, 2027, NOT "early in year")
   - What's covered (tuition + accommodation + books)
   - Total value over 3-4 years

4. INCLUDE NSFAS GUIDANCE:
   - Eligibility: Household income <R350,000/year
   - Application: www.nsfas.org.za by November each year
   - Covers: Tuition + accommodation + meals + books + transport

5. HIGHLIGHT FREE ALTERNATIVES:
   - TVET colleges (R5,000/year vs R60,000/year private)
   - Learnerships (earn R3,000-R5,000/month while learning)
   - Apprenticeships (paid training programs)

6. MAKE IT FEEL ACHIEVABLE:
   - Use empowering language: "This career is AFFORDABLE for you"
   - Show the path: "With these bursaries, you can study without family financial stress"
   - Calculate total value: "Total potential funding: R800,000+ over 4 years"

EXAMPLE FORMAT:
**Engineering (85% match)**

💰 Funding Available: R280,000+ over 3 years
- Sasol Engineering Bursary: R120,000/year (covers tuition + R5K/month allowance)
- NSFAS: R80,000/year (covers tuition + accommodation)
- Eskom Bursary: R100,000/year (covers tuition + books)

This career is AFFORDABLE for you. With these bursaries, you can study Engineering without family financial stress.

Application Timeline:
- May 2027: Apply for Sasol bursary (Grade 11 marks required)
- August 2027: Apply for Eskom bursary
- November 2027: Apply for NSFAS (household income <R350K/year)

REMEMBER: Show the money early. Make it feel achievable, not aspirational.`),a&&(h=`

DECISION-MAKING FRAMEWORK REQUIRED:
- START by validating their feeling of being stuck (e.g., "Being stuck is normal...")
- EXPLICITLY mention the V.I.S. Model (Values, Interests, Skills/Abilities)
- Reference the Career Choice Matrix with weighted factors (Interest \xd73, Ability \xd73, Security \xd72, Salary \xd72, Affordability \xd72)
- Suggest job shadowing and informational interviews as validation tools
- Mention that career changes are normal (most people change careers 3-5 times)
- Provide the 4-step decision tree: Know Yourself → Know Options → Use Matrix → Test & Commit`),s&&(h=`

MYTH-BUSTING FRAMEWORK REQUIRED:
- START by directly acknowledging and challenging the misconception (e.g., "This is a common myth, but here's the reality...")
- Provide EVIDENCE to debunk the myth (statistics, salary data, success stories)
- Address the emotional/social pressure behind the misconception (family expectations, peer pressure, fear)
- Offer alternative perspectives and frameworks for thinking about the issue
- Validate their feelings while correcting the misinformation`),r&&(h+=`

CREATIVE CAREER GUIDANCE:
- Distinguish between "passion hobbies" and "creative professions"
- Provide HIGH-PAYING creative-tech hybrids (UX/UI Designer R25K-R45K, Game Designer R25K-R50K)
- Mention the 70/30 rule (70% stable income, 30% passion projects)
- Include freelance + corporate hybrid strategies
- Reference SA creative success stories if available in context`),o&&(h+=`

AI & FUTURE OF WORK GUIDANCE:
- Acknowledge AI anxiety as valid but provide nuanced perspective
- Categorize jobs: HIGH risk (data entry, telemarketers), MEDIUM risk (will change not disappear), LOW risk (AI-resistant)
- Emphasize AI AUGMENTATION (jobs become more interesting) not just displacement
- List NEW careers created by AI (ML Engineer, AI Ethics Specialist, Prompt Engineer)
- Highlight AI-proof skills: creativity, emotional intelligence, complex problem-solving, critical thinking, adaptability`);let u="";n>0&&(u=`

IMPORTANT: Your previous response was incomplete. Please ensure you include:
- Exactly 3-5 career options (numbered 1., 2., 3., etc.)
- Match percentage and reasoning for EACH career (e.g., "85% match - Why: uses mathematics extensively")
- Salary range in ZAR for EACH career (e.g., "R25,000-R45,000/month")
${"low"===i.financialConstraint?"- At least 2 specific bursaries with names, amounts, and deadlines":""}
- Specific next steps (numbered list)
- EXTRACT and USE specific frameworks, models, and concepts from the retrieved knowledge above`);let d=t.frameworksDetected&&t.frameworks&&t.frameworks.length>0,m="string"==typeof t?t:t.context,g="";return d&&(g=`

═══════════════════════════════════════
🎯 FRAMEWORKS TO USE (MANDATORY):
═══════════════════════════════════════

The following frameworks have been detected in the retrieved knowledge. You MUST explicitly reference these by name in your response:

${t.frameworks.map((e,t)=>`
${t+1}. ${e.name}
   Source: ${e.source}
   
   Content Preview:
   ${e.content.substring(0,500)}...
   
   ⚠️ REQUIREMENT: You MUST mention "${e.name}" by name in your response.
   Example: "Let's use the ${e.name} to help you decide..."
`).join("\n")}

═══════════════════════════════════════

`),`RETRIEVED KNOWLEDGE (USE THIS INFORMATION):
${m}${g}

Student Question: ${e}

CRITICAL INSTRUCTIONS - FRAMEWORK EXTRACTION:
You MUST extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge above. Look for:
- Named frameworks (e.g., "V.I.S. Model", "Career Choice Matrix", "Passion vs Pay Framework", "70/30 Rule")
- Specific tools and assessments (e.g., "5 Reality Check Questions", "Gut Check Method", "Risk Tolerance Assessment")
- Key concepts and terminology (e.g., "whole person approach", "AI augmentation", "hybrid career model")
- Concrete examples and case studies mentioned in the knowledge
- Specific strategies and action steps provided in the knowledge

RESPONSE STRUCTURE:
1. Opening (2-3 sentences):
   - Validate their question/concern
   - If misconception: directly challenge it with "This is a common myth, but..."
   - If decision-making: acknowledge feeling stuck is normal

2. Framework/Concept (1-2 paragraphs):
   - EXPLICITLY name and explain the relevant framework from retrieved knowledge
   - Use the exact terminology from the knowledge (e.g., "V.I.S. Model", "Career Choice Matrix")
   - Provide the structure/steps of the framework

3. Career Options (3-5 careers):
   For EACH career, include:
   - Career title with match percentage (e.g., "Data Scientist (85% match)")
   - 2-sentence explanation of WHY this matches
   - Salary range in ZAR (e.g., "R25,000-R45,000/month entry-level")
   - SA universities offering programs

4. ${"low"===i.financialConstraint?"Bursaries (at least 2 specific):":"Bursaries (if relevant):"}
   - Bursary name (e.g., "Sasol Engineering Bursary")
   - Amount/description (e.g., "Full tuition + R5,000/month")
   - Application deadline (e.g., "Deadline: 30 June 2026")

5. Next Steps (numbered list, 3-5 actionable items):
   - Reference specific tools from knowledge (e.g., "Complete the Career Choice Matrix", "Try the 5 Reality Check Questions")
   - Include concrete actions (visit, apply, research, shadow)

6. Closing (1-2 sentences):
   - Encouraging message
   - Reminder that career planning is a process${h}${u}

Response:`}(e,t,i,m);if("groq"===p)try{n=await l(a,{timeout:r}),p="groq-llama-3.1-70b"}catch(e){console.warn("Groq failed, falling back to OpenAI:",e.message),n=await h(a,{timeout:r}),p="openai-gpt-3.5-turbo"}else n=await h(a,{timeout:r}),p="openai-gpt-3.5-turbo";let s=function(e,t,i={}){let n={hasCareerMatches:!1,hasReasoningForCareer:!1,hasBursaries:!0,hasSalaries:!1,hasNextSteps:!1,hasSAContext:!1,hasSubstantialContent:!1},a=(e.match(/^\d+[\.\)]\s+/gm)||[]).length,s=Math.max(a,Math.min((e.match(/\b(scientist|analyst|developer|engineer|accountant|actuary|programmer|designer|consultant|teacher|nurse|doctor|architect|technician)\b/gi)||[]).length,5));n.hasCareerMatches=s>=3,n.hasReasoningForCareer=e.length>300&&(/\b(ideal|suitable|perfect|excellent|great|good|recommended|match|aligns|fits|because|since|as|why)\b/i.test(e)||/given your|based on your|considering your|this career|these careers|option|path/i.test(e)),("low"===t.financialConstraint||"medium"===t.financialConstraint)&&(n.hasBursaries=/(?:sasol|fnb|nedbank|discovery|anglo|eskom|transnet|nsfas|standard bank|absa|capitec|old mutual).+?(?:deadline|closes|apply by|due)/gis.test(e));let r=e.match(/R\d+[,\d]*[kK]?\s*(?:-|to|–)\s*R\d+[,\d]*[kK]?/g)||[];return n.hasSalaries=r.length>=3,n.hasNextSteps=/next step|action|apply|visit|contact|prepare|research/gi.test(e)&&(e.match(/^\d+\.\s+[A-Z]/gm)||[]).length>=2,n.hasSAContext=/university|south africa|gauteng|western cape|kwazulu|uct|wits|stellenbosch|pretoria/gi.test(e),n.hasSubstantialContent=e.length>=300&&e.length<=3e3,n.hasFrameworkReference=!i.frameworksDetected||!i.frameworks||0===i.frameworks.length||i.frameworks.some(t=>!!RegExp(t.name,"i").test(e)||(u[t.name]||[]).some(t=>RegExp(t,"i").test(e))),{passed:Object.values(n).every(e=>!0===e),checks:n,details:{careerCount:s,salaryRangeCount:r.length,responseLength:e.length}}}(n.content,i,t);if(s.passed){let e=`

---

⚠️ **Verify before you decide:**
1. Check with your school counselor
2. Call the institution directly (phone above)
3. Visit official websites for current info

Thandi's data may be outdated. Always confirm with real people.`,t=n.content+e,i=Date.now()-d;return{success:!0,response:t,validation:s,metadata:{generationTime:i,modelUsed:p,tokensUsed:n.tokensUsed,retries:m,validationPassed:!0,fallbackUsed:p.includes("openai"),verificationFooterAdded:!0}}}console.warn(`Validation failed on attempt ${m+1}:`,s.checks),g=Error("Response validation failed: "+JSON.stringify(s.checks)),m++}catch(e){console.error(`Generation attempt ${m+1} failed:`,e.message),g=e,++m<=a&&await function(e){return new Promise(t=>setTimeout(t,e))}(1e3*Math.pow(2,m))}let y=Date.now()-d;return{success:!1,error:g?.message||"Generation failed after retries",metadata:{generationTime:y,modelUsed:p,retries:a,validationPassed:!1}}}async function l(e,t={}){let{timeout:i=1e4}=t,a=(r||(r=new n.ZP({apiKey:process.env.GROQ_API_KEY})),r),s=new AbortController,o=setTimeout(()=>s.abort(),i);try{let t=await a.chat.completions.create({model:"llama-3.3-70b-versatile",messages:[{role:"system",content:`You are Thandi, an AI career counselor for South African Grade 11-12 students. You provide practical, encouraging career guidance based on their academic profile and financial situation.

CRITICAL: You MUST extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided. Always:
- Name the frameworks you're using (e.g., "V.I.S. Model", "Career Choice Matrix", "Passion vs Pay Framework")
- Use exact terminology from the knowledge base
- Structure your response around the frameworks provided
- Reference specific tools and assessments mentioned in the knowledge
- Include concrete examples and strategies from the retrieved content

Your responses should demonstrate that you're using the specialized knowledge provided, not just general career advice.`},{role:"user",content:e}],temperature:.7,max_tokens:1200,top_p:.9},{signal:s.signal});return clearTimeout(o),{content:t.choices[0]?.message?.content||"",tokensUsed:{prompt:t.usage?.prompt_tokens||0,completion:t.usage?.completion_tokens||0,total:t.usage?.total_tokens||0}}}catch(e){if(clearTimeout(o),"AbortError"===e.name)throw Error("Groq request timeout");throw e}}async function h(e,t={}){let{timeout:i=1e4}=t,n=(o||(o=new a.ZP({apiKey:process.env.OPENAI_API_KEY})),o),s=new AbortController,r=setTimeout(()=>s.abort(),i);try{let t=await n.chat.completions.create({model:"gpt-3.5-turbo",messages:[{role:"system",content:`You are Thandi, an AI career counselor for South African Grade 11-12 students. You provide practical, encouraging career guidance based on their academic profile and financial situation.

CRITICAL: You MUST extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided. Always:
- Name the frameworks you're using (e.g., "V.I.S. Model", "Career Choice Matrix", "Passion vs Pay Framework")
- Use exact terminology from the knowledge base
- Structure your response around the frameworks provided
- Reference specific tools and assessments mentioned in the knowledge
- Include concrete examples and strategies from the retrieved content

Your responses should demonstrate that you're using the specialized knowledge provided, not just general career advice.`},{role:"user",content:e}],temperature:.7,max_tokens:1200},{signal:s.signal});return clearTimeout(r),{content:t.choices[0]?.message?.content||"",tokensUsed:{prompt:t.usage?.prompt_tokens||0,completion:t.usage?.completion_tokens||0,total:t.usage?.total_tokens||0}}}catch(e){if(clearTimeout(r),"AbortError"===e.name)throw Error("OpenAI request timeout");throw e}}let u={"V.I.S. Model":["Values-Interest-Skills","VIS Model","V.I.S framework","Values, Interests, Skills","Values Interests Skills"],"Career Choice Matrix":["career matrix","decision matrix","choice framework","scoring matrix"],"Passion vs Pay":["passion versus pay","love vs money","interest vs salary","passion or pay"],"AI Augmentation":["AI augment","human-AI collaboration","AI enhancement"],"70/30 Rule":["70-30 rule","seventy thirty","70 percent stable"]}},3702:(e,t,i)=>{i.d(t,{iG:()=>l});var n=i(79224),a=i(23489);let s={"no-matric":["electrician","chef","content_creator"],"no-university-high-income":["electrician","chef","software_engineer","cybersecurity_specialist","renewable_energy_engineer","content_creator","ux_ui_designer"],"creative-tech":["ux_ui_designer","graphic_designer","content_creator","ai_ml_engineer","software_engineer"],"remote-dollars":["software_engineer","ux_ui_designer","data_scientist","ai_ml_engineer","cybersecurity_specialist","blockchain_developer","content_creator","graphic_designer"],"fast-earnings":["electrician","chef","renewable_energy_engineer","content_creator"],"biology-tech":["medical_doctor","pharmacist","data_scientist","biomedical_engineer"],"hands-on":["electrician","chef","renewable_energy_engineer","mechanical_engineer","civil_engineer","physiotherapist"],"helping-people":["medical_doctor","pharmacist","physiotherapist","occupational_therapist","chef"],"long-term-specialist":["medical_doctor","pharmacist","civil_engineer","mechanical_engineer"],general:[]},r={biology:["medical_doctor","pharmacist","physiotherapist","occupational_therapist","data_scientist","biomedical_engineer"],mathematics:["software_engineer","data_scientist","ai_ml_engineer","mechanical_engineer","electrical_engineer","civil_engineer","chemical_engineer","blockchain_developer","cybersecurity_specialist"],physical_sciences:["mechanical_engineer","electrical_engineer","civil_engineer","chemical_engineer","renewable_energy_engineer","biomedical_engineer"],avoid_math:["data_scientist","ai_ml_engineer","electrical_engineer","chemical_engineer","mechanical_engineer","civil_engineer","blockchain_developer","software_engineer"],avoid_science:["medical_doctor","pharmacist","biomedical_engineer","chemical_engineer","renewable_energy_engineer"],low_math_tech:["ux_ui_designer","graphic_designer","content_creator","cybersecurity_specialist"]},o=null;function c(){return o||(o=(0,n.eI)("https://pvvnxupuukuefajypovz.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY)),o}async function l(e,t,n={}){let{limit:o=10,debug:c=!1}=n,l=(0,a.Tl)(e),m=(0,a.w5)(l,e),{detectConflicts:p}=await Promise.resolve().then(i.bind(i,23489)),y=p(l,e);c&&(console.log("\uD83C\uDFAF Intent:",m),console.log("\uD83D\uDCCB Details:",l),y.length>0&&console.log("⚠️  Conflicts detected:",y.map(e=>e.type).join(", ")));let f=[];if(l.explicitCareers.length>0){let e=await u(l.explicitCareers);f.push(...e.map(e=>({...e,source:"explicit",priority:1}))),c&&console.log(`✅ Explicit matches: ${e.length} chunks`)}let w=s[m]||[],b=[];if(y.length>0&&(y.forEach(e=>{e.paths&&e.paths.forEach(e=>{if(e!==m){let t=s[e]||[];b=[...b,...t]}})}),b=[...new Set(b)],c&&console.log(`⚠️  Conflict detected - will retrieve both paths separately`)),w.length>0){w=h(w,l);let e=await d(w);f.push(...e.map(e=>({...e,source:"intent-primary",priority:2}))),c&&(console.log(`✅ Intent matches (${m}): ${e.length} chunks`),console.log(`   Careers: ${w.slice(0,8).join(", ")}${w.length>8?"...":""}`))}if(b.length>0){b=h(b,l);let e=await d(b);f.push(...e.map(e=>({...e,source:"intent-conflict",priority:2}))),c&&(console.log(`✅ Conflict path matches: ${e.length} chunks`),console.log(`   Careers: ${b.slice(0,8).join(", ")}${b.length>8?"...":""}`))}if(f.length<8){let e=await g(t,{threshold:.55,limit:25}),i=e.filter(e=>e.chunk_metadata?.career_name||e.module_name?.includes("career")||e.module_name?.includes("4ir")||e.module_name?.includes("engineering")||e.module_name?.includes("healthcare")||e.module_name?.includes("trades"));f.push(...i.map(e=>({...e,source:"semantic",priority:3}))),c&&console.log(`✅ Semantic matches: ${i.length} chunks (${e.length} before filtering)`)}else c&&console.log(`⏭️  Skipped semantic search (${f.length} results already)`);let _=function(e,t,i){let n=new Map;e.forEach(e=>{(!n.has(e.id)||n.get(e.id).priority>e.priority)&&n.set(e.id,e)});let a=Array.from(n.values()).map(e=>{let i=e.initial_score||.7;e.chunk_text.toLowerCase();let n=e.chunk_metadata||{};"explicit"===e.source&&(i-=.25),"intent-conflict"===e.source&&(i-=.22),("intent-primary"===e.source||"intent"===e.source)&&(i-=.2),(n.career_name||"career_summary"===e.source_entity_type)&&(i-=.15);let a=function(e,t,i){let n=0,a=e.chunk_text.toLowerCase(),s=e.chunk_metadata?.career_name,o=s?s.toLowerCase().replace(/[\/\s]+/g,"_"):null;return t.subjectNegations?.math&&(/(mathematics|calculus|algebra|statistics|math\s+required)/.test(a)&&(n+=.4),o&&r.avoid_math.includes(o)&&(n+=.35)),t.hasUniversityNegation&&/(bachelor|degree|bsc|ba\b|bcom|university required)/.test(a)&&(n+=.5),t.hasMatricNegation&&/(matric required|grade 12 required|nsc required)/.test(a)&&!/without matric|no matric/.test(a)&&(n+=.4),t.subjects?.biology&&(/(biology|life sciences|anatomy|physiology|medical|health)/.test(a)&&(n-=.25),o&&r.biology.includes(o)&&(n-=.2)),t.subjects?.maths&&!t.subjectNegations?.math&&(/(mathematics|calculus|statistics|quantitative)/.test(a)&&(n-=.2),o&&r.mathematics.includes(o)&&(n-=.15)),t.subjects?.physics&&(/(physics|mechanics|thermodynamics|engineering)/.test(a)&&(n-=.2),o&&r.physical_sciences.includes(o)&&(n-=.15)),t.subjectNegations?.math&&t.wantsTech&&o&&r.low_math_tech.includes(o)&&(n-=.15),t.wantsRemote&&/(remote|freelance|work from home|online|anywhere)/.test(a)&&(n-=.1),t.wantsFastPath&&/(\d+\s*(week|month)|quick|fast|immediate|apprenticeship)/.test(a)&&(n-=.1),(t.wantsHighIncome||t.wantsDollars)&&/(r\d{2,3}[,\s]?\d{3}|salary|earning|\$\d+|dollar|high.?income)/.test(a)&&(n-=.08),n}(e,t,0);return i+=a,("decision_making_framework"===e.module_name||"career_misconceptions_framework"===e.module_name)&&(i+=.15),"high"===n.priority&&(i-=.1),{...e,final_score:Math.max(0,Math.min(i,1)),constraint_adjustment:a}});return a.sort((e,t)=>{if(.05>Math.abs(e.final_score-t.final_score)){if("intent-conflict"===e.source&&"intent-primary"===t.source)return -1;if("intent-primary"===e.source&&"intent-conflict"===t.source)return 1}return e.final_score-t.final_score}),a}(f,l,0);return c&&(console.log(`
📊 Final results: ${_.length} chunks`),_.slice(0,5).forEach((e,t)=>{console.log(`${t+1}. [${e.source}] ${e.module_name} - Score: ${e.final_score.toFixed(3)}`)})),_.slice(0,o).map(e=>({...e,query_conflicts:y}))}function h(e,t){let i=[...e];if(t.subjectNegations?.math&&(i=i.filter(e=>!r.avoid_math.includes(e)),t.wantsTech)){let e=r.low_math_tech.filter(e=>!i.includes(e));i=[...i,...e]}t.subjectNegations?.science&&(i=i.filter(e=>!r.avoid_science.includes(e)));let n=[];if(t.subjects?.biology){let e=r.biology.filter(e=>i.includes(e));n.push(...e),i=i.filter(t=>!e.includes(t))}if(t.subjects?.maths&&!t.subjectNegations?.math){let e=r.mathematics.filter(e=>i.includes(e));n.push(...e),i=i.filter(t=>!e.includes(t))}if(t.subjects?.physics){let e=r.physical_sciences.filter(e=>i.includes(e));n.push(...e),i=i.filter(t=>!e.includes(t))}return[...new Set([...n,...i])]}async function u(e){let t=c();try{let i=[];for(let n of e)for(let e of m(n)){let{data:n,error:a}=await t.from("knowledge_chunks").select(`
            id,
            chunk_text,
            chunk_metadata,
            source_entity_type,
            knowledge_modules!inner(module_name)
          `).ilike("chunk_metadata->>career_name",e).limit(5);!a&&n&&i.push(...n)}return Array.from(new Map(i.map(e=>[e.id,e])).values()).slice(0,15).map(e=>({id:e.id,chunk_text:e.chunk_text,chunk_metadata:e.chunk_metadata,source_entity_type:e.source_entity_type,module_name:e.knowledge_modules?.module_name||"unknown",initial_score:.3}))}catch(e){return console.error("Explicit career search error:",e),[]}}async function d(e){let t=c();try{let i=[];for(let n of e)for(let e of m(n)){let{data:n,error:a}=await t.from("knowledge_chunks").select(`
            id,
            chunk_text,
            chunk_metadata,
            source_entity_type,
            knowledge_modules!inner(module_name)
          `).ilike("chunk_metadata->>career_name",e).limit(4);!a&&n&&i.push(...n)}return Array.from(new Map(i.map(e=>[e.id,e])).values()).slice(0,30).map(e=>({id:e.id,chunk_text:e.chunk_text,chunk_metadata:e.chunk_metadata,source_entity_type:e.source_entity_type,module_name:e.knowledge_modules?.module_name||"unknown",initial_score:.5}))}catch(e){return console.error("Intent career search error:",e),[]}}function m(e){return({electrician:["Electrician"],chef:["Chef"],software_engineer:["Software Engineer","Software Developer"],ux_ui_designer:["UX/UI Designer","UX Designer","UI Designer"],graphic_designer:["Graphic Designer"],content_creator:["Content Creator"],data_scientist:["Data Scientist"],ai_ml_engineer:["AI/ML Engineer","Machine Learning Engineer","AI Engineer"],cybersecurity_specialist:["Cybersecurity Specialist","Cybersecurity"],blockchain_developer:["Blockchain Developer"],renewable_energy_engineer:["Renewable Energy Engineer","Solar Technician","Renewable Energy Specialist"],medical_doctor:["Medical Doctor","Doctor"],biomedical_engineer:["Biomedical Engineer","Biomedical Engineering"],pharmacist:["Pharmacist"],physiotherapist:["Physiotherapist"],occupational_therapist:["Occupational Therapist"],civil_engineer:["Civil Engineer"],mechanical_engineer:["Mechanical Engineer"],electrical_engineer:["Electrical Engineer"],chemical_engineer:["Chemical Engineer"]})[e]||[e]}async function g(e,t={}){let{threshold:i=.55,limit:n=25}=t;if(!e||1536!==e.length)throw Error("Query embedding must be 1536-dimensional array");let a=c();try{let t=`[${e.join(",")}]`,{data:s,error:r}=await a.rpc("search_knowledge_chunks",{query_embedding:t,match_threshold:i,match_count:n,filter_module_ids:null});if(r)throw r;if(!s||0===s.length)return[];let o=s.map(e=>e.chunk_id),{data:c}=await a.from("knowledge_chunks").select(`
        id,
        knowledge_modules!inner(module_name)
      `).in("id",o),l=new Map;return c&&c.forEach(e=>{l.set(e.id,e.knowledge_modules?.module_name||"unknown")}),s.map(e=>({id:e.chunk_id,chunk_text:e.chunk_text,chunk_metadata:e.metadata,similarity:e.similarity,module_name:l.get(e.chunk_id)||"unknown",initial_score:.7}))}catch(e){return console.error("Semantic search error:",e),[]}}},23489:(e,t,i)=>{function n(e){let t=e.toLowerCase();return{hasUniversityNegation:/(don't want|no|without|not interested in|skip|avoid).*(university|college|degree)|university.*(don't|no|not)|can't afford university/.test(t),hasMatricNegation:/(don't have|no|without|didn't get|fail|drop out|didn't finish).*(matric|grade 12)|matric.*(don't|no|not|fail)/.test(t),wantsFastPath:/(fast|quick|immediately|asap|soon|rapid|shortest|fastest|start earning|quick money)/.test(t),wantsCreative:/(creative|artistic|design|visual|art|media|content|create|make|draw|graphic)/.test(t),wantsTech:/(tech|technology|digital|computer|code|program|software|online|internet|web|app)/.test(t),wantsRemote:/(remote|work from home|online|freelance|anywhere|location independent)/.test(t),wantsDollars:/(dollar|dollars|\$|usd|euro|euros|international|global|foreign currency|earn.*dollar)/.test(t),wantsHighIncome:/(good money|high salary|earn a lot|well paid|good pay|make money|rich|good salary|need.*salary)/.test(t),subjects:{biology:/(biology|life science|bio\b)/.test(t),physics:/(physics|physical science)/.test(t),maths:/(math|mathematics|maths)/.test(t),science:/(science|stem)/.test(t)},subjectNegations:{math:/(hate|bad at|weak in|struggle with|don't like|avoid).*(math|mathematics|maths)/.test(t),science:/(hate|bad at|weak in|struggle with|don't like|avoid).*(science|physics|chemistry)/.test(t),biology:/(hate|bad at|weak in|struggle with|don't like|avoid).*(biology|life science)/.test(t)},wantsHandsOn:/(hands.on|practical|build|fix|work with.*(hands|tools)|manual)/.test(t),wantsHelping:/(help|helping|care|caring|people|patients|community|social)/.test(t),explicitCareers:function(e){let t=e.toLowerCase(),i=[];return Object.entries({electrician:["electrician","electrical work","wiring","solar installation"],chef:["chef","cook","cooking","culinary","kitchen","restaurant"],software_engineer:["software","programming","coding","developer","programmer","software engineer"],ux_ui_designer:["\\bux\\b","\\bui\\b","user experience","user interface","ux designer","ui designer","ux/ui"],graphic_designer:["graphic design","graphic designer","graphics"],content_creator:["content creator","youtuber","influencer","social media"],data_scientist:["data science","data scientist","data analytics","data analyst"],ai_ml_engineer:["\\bai\\b","machine learning","artificial intelligence","ml engineer"],cybersecurity_specialist:["cybersecurity","cyber security","security","hacking","ethical hacker"],blockchain_developer:["blockchain","crypto","cryptocurrency","web3"],renewable_energy_engineer:["renewable energy","solar","wind energy","green energy"],medical_doctor:["doctor","medical doctor","physician","medicine"],biomedical_engineer:["biomedical","biomedical engineer","medical engineering"],pharmacist:["pharmacist","pharmacy","pharmaceutical"],physiotherapist:["physiotherapist","physio","physical therapy"],occupational_therapist:["occupational therapist","\\bot\\b","occupational therapy"],civil_engineer:["civil engineer","civil engineering"],mechanical_engineer:["mechanical engineer","mechanical engineering"],electrical_engineer:["electrical engineer","electrical engineering"],chemical_engineer:["chemical engineer","chemical engineering"]}).forEach(([e,n])=>{n.some(e=>e.startsWith("\\b")?RegExp(e,"i").test(t):t.includes(e))&&i.push(e)}),i}(e)}}function a(e,t){let i=[],n=t.toLowerCase(),a=/(10 years|decade|long.?term|specialist|specialization)/.test(n);e.wantsFastPath&&a&&i.push({type:"fast-vs-longterm",description:"User wants both fast earnings AND long-term study",paths:["fast-earnings","long-term-specialist"]}),e.wantsHighIncome&&e.hasUniversityNegation&&i.push({type:"income-vs-education",description:"User wants high income without university",note:"Some high-income paths exist without degrees (trades, bootcamps)"});let s=/(hate|don't like|bad at).*(art|design|creative|drawing)/.test(n);return e.wantsCreative&&s&&i.push({type:"creative-vs-aptitude",description:"User wants creative career but dislikes creative activities"}),e.wantsTech&&e.subjectNegations?.math&&i.push({type:"tech-vs-math",description:"User wants tech career but dislikes math",note:"Low-math tech options exist (UX/UI, Content Creation)"}),i}function s(e,t=""){return e.hasMatricNegation?"no-matric":e.hasUniversityNegation&&e.wantsHighIncome?"no-university-high-income":e.wantsCreative&&e.wantsTech?"creative-tech":e.wantsRemote&&(e.wantsDollars||e.wantsHighIncome)||e.wantsDollars?"remote-dollars":e.wantsFastPath?"fast-earnings":e.subjects.biology&&e.wantsTech?"biology-tech":e.wantsHandsOn?"hands-on":e.wantsHelping?"helping-people":"general"}i.d(t,{Tl:()=>n,detectConflicts:()=>a,w5:()=>s})},72786:(e,t,i)=>{function n(e){let t=e.toLowerCase(),i={academicStrengths:[],academicWeaknesses:[],interests:[],financialConstraint:"unknown",priorityModules:[]};[{pattern:/good at (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/strong in (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/love (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/excel at (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/good at (physics|physical science)/i,subject:"physics"},{pattern:/strong in (physics|physical science)/i,subject:"physics"},{pattern:/love (physics|physical science)/i,subject:"physics"},{pattern:/good at (science|life science)/i,subject:"science"},{pattern:/strong in (science|life science)/i,subject:"science"},{pattern:/good at (english|language)/i,subject:"english"},{pattern:/strong in (english|language)/i,subject:"english"},{pattern:/good at (accounting|business)/i,subject:"accounting"},{pattern:/strong in (accounting|business)/i,subject:"accounting"}].forEach(({pattern:e,subject:n})=>{e.test(t)&&!i.academicStrengths.includes(n)&&i.academicStrengths.push(n)}),[{pattern:/hate (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/bad at (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/struggle with (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/weak in (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/don't have (math|mathematics|maths)/i,subject:"mathematics"},{pattern:/hate (physics|physical science)/i,subject:"physics"},{pattern:/bad at (physics|physical science)/i,subject:"physics"},{pattern:/struggle with (physics|physical science)/i,subject:"physics"},{pattern:/weak in (physics|physical science)/i,subject:"physics"},{pattern:/don't have (physics|physical science)/i,subject:"physics"},{pattern:/hate (science|life science)/i,subject:"science"},{pattern:/bad at (science|life science)/i,subject:"science"},{pattern:/struggle with (science|life science)/i,subject:"science"}].forEach(({pattern:e,subject:n})=>{e.test(t)&&!i.academicWeaknesses.includes(n)&&i.academicWeaknesses.push(n)});let n={low:[/can't afford/i,/cannot afford/i,/can not afford/i,/too expensive/i,/no money/i,/poor family/i,/low income/i,/need financial help/i,/need funding/i,/need bursary/i,/need scholarship/i,/financial difficulty/i,/financial struggle/i],medium:[/limited budget/i,/tight budget/i,/looking for affordable/i,/cost is a concern/i]};return n.low.some(e=>e.test(t))?i.financialConstraint="low":n.medium.some(e=>e.test(t))&&(i.financialConstraint="medium"),[{pattern:/interested in (technology|tech|computers|coding|programming)/i,interest:"technology"},{pattern:/love (technology|tech|computers|coding|programming)/i,interest:"technology"},{pattern:/passionate about (technology|tech|computers|coding|programming)/i,interest:"technology"},{pattern:/interested in (business|entrepreneurship|commerce)/i,interest:"business"},{pattern:/love (business|entrepreneurship|commerce)/i,interest:"business"},{pattern:/interested in (healthcare|medicine|nursing|doctor)/i,interest:"healthcare"},{pattern:/love (healthcare|medicine|nursing|doctor)/i,interest:"healthcare"},{pattern:/interested in (engineering|building|design)/i,interest:"engineering"},{pattern:/love (engineering|building|design)/i,interest:"engineering"},{pattern:/interested in (data|analytics|statistics)/i,interest:"data"},{pattern:/love (data|analytics|statistics)/i,interest:"data"}].forEach(({pattern:e,interest:n})=>{e.test(t)&&!i.interests.includes(n)&&i.interests.push(n)}),i.priorityModules=function(e){let t=[];return("low"===e.financialConstraint||"medium"===e.financialConstraint)&&t.push("bursaries"),(e.academicStrengths.length>0||e.academicWeaknesses.length>0)&&t.push("subject_career_mapping"),t.push("careers"),(e.interests.includes("technology")||e.interests.includes("data"))&&t.push("4ir_emerging_jobs"),t.push("sa_universities"),t.includes("bursaries")||t.push("bursaries"),[...new Set(t)]}(i),i}function a(e,t,i={}){let n;let{maxTokens:a=3e3,includeMetadata:s=!0,format:r="structured"}=i,o=e=>Math.ceil(e.length/4),c="",l=0,h=[],u=new Set,d=(n="Student Profile:\n",t.academicStrengths.length>0&&(n+=`- Academic Strengths: ${t.academicStrengths.join(", ")}
`),t.academicWeaknesses.length>0&&(n+=`- Academic Weaknesses: ${t.academicWeaknesses.join(", ")}
`),t.interests.length>0&&(n+=`- Interests: ${t.interests.join(", ")}
`),"unknown"!==t.financialConstraint&&(n+=`- Financial Constraint: ${t.financialConstraint}
`),n+=`- Priority Modules: ${t.priorityModules.join(", ")}`);for(let t of(c+=d+"\n\n",l+=o(d),c+="Retrieved Knowledge:\n\n",e)){let i=function(e,t){let i=e.chunk_metadata?.source||"unknown",n=e.module_name||"general";return"structured"===t?`[Source: ${i} | Module: ${n}]
${e.chunk_text}`:e.chunk_text}(t,r),n=o(i);if(l+n>a){console.warn(`Token limit reached. Included ${h.length}/${e.length} chunks`);break}c+=i+"\n\n",l+=n,h.push(t),t.chunk_metadata?.source&&u.add(t.chunk_metadata.source)}let m=function(e){let t=[],i={"V.I.S. Model":/V\.I\.S\.|Values.*Interest.*Skills|Values, Interests, Skills/i,"Career Choice Matrix":/career choice matrix|decision matrix|weighted.*factors.*Interest.*Ability/i,"Passion vs Pay":/passion vs pay|passion versus pay|four scenarios.*Dream Job.*Safety Net/i,"70/30 Rule":/70\/30|seventy.*thirty|70%.*stable.*30%.*passion/i,"AI Augmentation":/AI.*augment|human.*AI collaboration|AI.*enhance.*jobs/i,"5 Reality Check Questions":/5.*reality check|five.*questions.*Monday Morning Test/i,"Gut Check Method":/gut check|intuition.*rational.*score/i,"Risk Tolerance Assessment":/risk tolerance|financial.*risk.*assessment/i};return e.forEach(e=>{let n=e.chunk_text||"",a=e.chunk_metadata||{};Object.entries(i).forEach(([i,s])=>{s.test(n)&&!t.some(e=>e.name===i)&&t.push({name:i,content:n,source:a.module||e.module_name||"unknown",chunkId:a.chunk_id||"unknown"})})}),t}(h);return{context:c.trim(),studentProfile:t,chunks:h,frameworks:m,frameworksDetected:m.length>0,metadata:{totalChunks:e.length,includedChunks:h.length,tokensUsed:l,sources:Array.from(u),priorityModules:t.priorityModules,frameworksFound:m.map(e=>e.name)}}}function s(e,t){return e.map(e=>{let i=0,n=e.chunk_text.toLowerCase();if(e.chunk_metadata,t.academicStrengths.forEach(e=>{n.includes(e)&&(i+=.1)}),t.interests.forEach(e=>{n.includes(e)&&(i+=.08)}),("low"===t.financialConstraint||"medium"===t.financialConstraint)&&(n.includes("bursary")||n.includes("scholarship")||n.includes("funding"))&&(i+=.15),e.module_name&&t.priorityModules.includes(e.module_name)){let n=t.priorityModules.indexOf(e.module_name);i+=(5-n)*.05}return{...e,boostedSimilarity:Math.min((e.similarity||0)+i,1),boostScore:i}}).sort((e,t)=>t.boostedSimilarity-e.boostedSimilarity)}function r(e,t=.9){let i=[];for(let n of e)i.some(e=>(function(e,t){let i=new Set(e.toLowerCase().split(/\s+/)),n=new Set(t.toLowerCase().split(/\s+/)),a=new Set([...i].filter(e=>n.has(e))),s=new Set([...i,...n]);return a.size/s.size})(n.chunk_text,e.chunk_text)>t)||i.push(n);return i}i.d(t,{$q:()=>n,OD:()=>a,iJ:()=>s,xF:()=>r})}};