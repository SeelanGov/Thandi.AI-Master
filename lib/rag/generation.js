// lib/rag/generation.js
// STEP 4: LLM Generation + Response Validation

import Groq from 'groq-sdk';
import OpenAI from 'openai';

// RULE #2: DANGEROUS QUERY DETECTION
// Queries that require "I don't have verified information" responses
const DANGER_TRIGGERS = {
  droppingOut: {
    patterns: [
      /(should i|can i|want to|thinking of|considering).*(drop out|leave school|quit school|stop school)/i,
      /do i need.*(matric|grade 12|to finish school)/i,
      /(drop|leave|quit).*(school|matric)/i,
      /dropping out/i
    ],
    response: "I don't have verified information on leaving school before completing matric. This is a serious decision with long-term consequences. Please speak with your school principal, parents/guardians, and a career counselor before considering this option."
  },
  
  noMatric: {
    patterns: [
      /(what can i do|careers|jobs|options).*(without|with no|if i don't have).*(matric|grade 12)/i,
      /(failed|didn't pass|no).* matric/i,
      /only grade (9|10|11)/i,
      /without matric/i,
      /no matric/i
    ],
    response: "I don't have verified information on pathways without matric completion. Please verify your options with your school's career counselor or contact the Department of Higher Education and Training (DHET) at www.dhet.gov.za."
  },
  
  unaccreditedInstitution: {
    patterns: [
      /\bis\s+[\w\s]+\s+(good|accredited|legitimate|real|recognized)\?/i,
      /\bshould i\s+(study at|enroll at|apply to)\s+[\w\s]+\?/i
    ],
    response: "I don't have verified information on this institution. Before enrolling anywhere, verify that it's registered with the Department of Higher Education and Training (DHET) at www.dhet.gov.za or check the Council on Higher Education (CHE) accreditation list at www.che.ac.za."
  },
  
  largeFinancialDecision: {
    patterns: [
      /should i.*(take|get|apply for).*(loan|student loan|debt)/i,
      /(this course|this program).*worth.*R\d+/i,
      /should i pay.*R\d+/i,
      /R[1-9]\d{4,}/i, // R10,000 or more
      /student loan/i
    ],
    response: "I don't have verified information on financial decisions of this scale. Please consult with your parents/guardians and verify costs directly with the institution. For funding options, contact NSFAS at www.nsfas.org.za or speak with your school's financial aid advisor."
  },
  
  legalRequirements: {
    patterns: [
      /\bdo i qualify for\s+nsfas/i,
      /\bnsfas\s+(eligibility|requirements|application)/i,
      /\b(can i|am i allowed to)\s+work\s+(while studying|as a student)/i,
      /\b(visa|work permit|legal)\s+requirements/i,
      /\blegal\s+(requirements|rules|regulations)/i
    ],
    response: "I don't have verified information on legal requirements and eligibility. Please verify directly with:\n- NSFAS eligibility: www.nsfas.org.za or call 08000 67327\n- Work permits: Department of Home Affairs\n- Study requirements: The specific institution you're applying to\n- Legal questions: Your school counselor or the relevant government department"
  },
  
  medicalRequirements: {
    patterns: [
      /\bcan i be a\s+(doctor|nurse|medical)\s+with\s+(my|this|these)/i,
      /\bwill\s+(my|a|this)\s+[\w\s]+(condition|disability|illness)\s+stop me/i,
      /\bdo i need to disclose\s+(my|a)\s+[\w\s]+(condition|medical)/i,
      /\bmedical\s+requirements\s+for/i
    ],
    response: "I don't have verified information on medical requirements for healthcare careers. Please verify directly with:\n- The Health Professions Council of South Africa (HPCSA): www.hpcsa.co.za\n- The specific university's admissions office\n- A qualified career counselor\n- Your school's guidance department"
  },
  
  timingDecisions: {
    patterns: [
      /\bshould i\s+(take|have)\s+a\s+gap year/i,
      /\bam i\s+(too young|too old)\s+for/i,
      /\bshould i wait\s+(before|to)\s+(study|apply)/i,
      /\b(defer|postpone|delay)\s+(my|studying|university)/i
    ],
    response: "I don't have verified information on timing decisions like gap years or deferring studies. This is a personal choice that depends on your specific circumstances, goals, and readiness. Please discuss with your parents/guardians, teachers, and school counselor who know your situation."
  }
};

/**
 * Check if query contains dangerous triggers requiring safe response
 * @param {string} query - Student's question
 * @returns {Object|null} - Danger info if triggered, null otherwise
 */
function checkDangerousTriggers(query) {
  for (const [category, config] of Object.entries(DANGER_TRIGGERS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(query)) {
        return {
          category,
          response: config.response,
          triggered: true
        };
      }
    }
  }
  return null;
}

// Lazy initialization
let groqClient = null;
let openaiClient = null;

function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqClient;
}

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

/**
 * Generate career recommendation response using LLM
 * @param {string} query - Student's question
 * @param {string} context - Assembled context from retrieval
 * @param {Object} studentProfile - Student profile
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated response with metadata
 */
export async function generateResponse(query, context, studentProfile, options = {}) {
  const {
    maxRetries = 2,
    timeout = 10000,
    preferredModel = process.env.TESTING === 'true' ? 'openai' : 'groq' // Use OpenAI for testing to avoid Groq rate limits
  } = options;

  // RULE #2: Check for dangerous queries FIRST
  const dangerCheck = checkDangerousTriggers(query);
  if (dangerCheck) {
    console.log(`⚠️ Dangerous query detected: ${dangerCheck.category}`);
    
    // Return safe response immediately without calling LLM
    const safeResponse = dangerCheck.response + `\n\n---\n\n⚠️ **Verify before you decide:**\n1. Check with your school counselor\n2. Talk to your parents/guardians\n3. Contact the official authority (listed above)\n\nThis is a serious decision. Get personalized guidance from people who know your situation.`;
    
    return {
      success: true,
      response: safeResponse,
      validation: { passed: true, dangerousQueryHandled: true },
      metadata: {
        generationTime: 0,
        modelUsed: 'safety-filter',
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
        retries: 0,
        validationPassed: true,
        dangerCategory: dangerCheck.category,
        safetyTriggered: true
      }
    };
  }

  const startTime = Date.now();
  let attempt = 0;
  let lastError = null;
  let modelUsed = preferredModel;

  while (attempt <= maxRetries) {
    try {
      // Build prompt
      const prompt = buildPrompt(query, context, studentProfile, attempt);
      
      // Try Groq first
      let response;
      if (modelUsed === 'groq') {
        try {
          response = await generateWithGroq(prompt, { timeout });
          modelUsed = 'groq-llama-3.1-70b';
        } catch (groqError) {
          console.warn('Groq failed, falling back to OpenAI:', groqError.message);
          response = await generateWithOpenAI(prompt, { timeout });
          modelUsed = 'openai-gpt-3.5-turbo';
        }
      } else {
        response = await generateWithOpenAI(prompt, { timeout });
        modelUsed = 'openai-gpt-3.5-turbo';
      }

      // Validate response
      const validation = validateResponse(response.content, studentProfile, context);
      
      if (validation.passed) {
        // RULE #1: VERIFICATION MANDATE - Append verification footer to EVERY response (50 words max)
        const verificationFooter = `\n\n---\n\n⚠️ **Verify before you decide:**\n1. Check with your school counselor\n2. Call the institution directly (phone above)\n3. Visit official websites for current info\n\nThandi's data may be outdated. Always confirm with real people.`;

        const responseWithVerification = response.content + verificationFooter;
        
        const generationTime = Date.now() - startTime;
        return {
          success: true,
          response: responseWithVerification,
          validation,
          metadata: {
            generationTime,
            modelUsed,
            tokensUsed: response.tokensUsed,
            retries: attempt,
            validationPassed: true,
            fallbackUsed: modelUsed.includes('openai'),
            verificationFooterAdded: true
          }
        };
      }

      // Validation failed, retry with modified prompt
      console.warn(`Validation failed on attempt ${attempt + 1}:`, validation.checks);
      lastError = new Error('Response validation failed: ' + JSON.stringify(validation.checks));
      attempt++;

    } catch (error) {
      console.error(`Generation attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      attempt++;
      
      // Wait before retry (exponential backoff)
      if (attempt <= maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  // All retries exhausted
  const generationTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError?.message || 'Generation failed after retries',
    metadata: {
      generationTime,
      modelUsed,
      retries: maxRetries,
      validationPassed: false
    }
  };
}

/**
 * Generate response using Groq (Llama 3.1 70B)
 * @param {string} prompt - Full prompt
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Response with content and metadata
 */
async function generateWithGroq(prompt, options = {}) {
  const { timeout = 10000 } = options;
  
  const groq = getGroqClient();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Thandi, an AI career counselor for South African Grade 11-12 students. You provide practical, encouraging career guidance based on their academic profile and financial situation.

CRITICAL: You MUST extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided. Always:
- Name the frameworks you're using (e.g., "V.I.S. Model", "Career Choice Matrix", "Passion vs Pay Framework")
- Use exact terminology from the knowledge base
- Structure your response around the frameworks provided
- Reference specific tools and assessments mentioned in the knowledge
- Include concrete examples and strategies from the retrieved content

Your responses should demonstrate that you're using the specialized knowledge provided, not just general career advice.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200, // Increased from 800 to allow framework walkthroughs
      top_p: 0.9
    }, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return {
      content: completion.choices[0]?.message?.content || '',
      tokensUsed: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Groq request timeout');
    }
    throw error;
  }
}

/**
 * Generate response using OpenAI (GPT-3.5-turbo) as fallback
 * @param {string} prompt - Full prompt
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Response with content and metadata
 */
async function generateWithOpenAI(prompt, options = {}) {
  const { timeout = 10000 } = options;
  
  const openai = getOpenAIClient();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are Thandi, an AI career counselor for South African Grade 11-12 students. You provide practical, encouraging career guidance based on their academic profile and financial situation.

CRITICAL: You MUST extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided. Always:
- Name the frameworks you're using (e.g., "V.I.S. Model", "Career Choice Matrix", "Passion vs Pay Framework")
- Use exact terminology from the knowledge base
- Structure your response around the frameworks provided
- Reference specific tools and assessments mentioned in the knowledge
- Include concrete examples and strategies from the retrieved content

Your responses should demonstrate that you're using the specialized knowledge provided, not just general career advice.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200 // Increased from 800 to allow framework walkthroughs
    }, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    return {
      content: completion.choices[0]?.message?.content || '',
      tokensUsed: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OpenAI request timeout');
    }
    throw error;
  }
}

/**
 * Build prompt for LLM with ENHANCED KEY POINT EXTRACTION
 * @param {string} query - Student's question
 * @param {string} context - Retrieved context
 * @param {Object} studentProfile - Student profile
 * @param {number} attempt - Retry attempt number
 * @returns {string} - Formatted prompt
 */
function buildPrompt(query, context, studentProfile, attempt = 0) {
  // Detect query type for specialized instructions
  const isDecisionMaking = /stuck|choose|decision|between|paths|love.*pay|passion.*pay/i.test(query);
  const isMisconception = /everyone says|is it true|heard|friend says|myth|waste of time|AI.*jobs|degree.*online/i.test(query);
  const isCreativeCareer = /creative|artist|music|design|art|writer/i.test(query);
  const isAIFuture = /AI|artificial intelligence|automation|robots|future.*jobs/i.test(query);
  
  // RULE #3: Math-Hate Healthcare Detection
  const hasMathAversion = /hate math|bad at math|struggle with math|math is hard|don't like math|worst subject.*math/i.test(query) ||
                          studentProfile.academicWeaknesses?.some(w => /math/i.test(w));
  
  // RULE #4: NSFAS Prioritization (Low-Income Student Protection)
  const hasFinancialConstraints = studentProfile.financialConstraint === 'low' || 
                                  studentProfile.constraints?.money === 'low' ||
                                  /can't afford|no money|poor|financial|bursaries?|nsfas/i.test(query);
  
  let specializedInstructions = '';
  
  // RULE #3: Math-Hate Healthcare Rule
  if (hasMathAversion) {
    specializedInstructions += `\n\nRULE #3 - MATH-HATE HEALTHCARE (CRITICAL):
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

REMEMBER: Math anxiety ≠ Math inability. Do not eliminate healthcare careers.`
;
  }
  
  // RULE #4: NSFAS Prioritization for Low-Income Students
  if (hasFinancialConstraints) {
    specializedInstructions += `\n\nRULE #4 - NSFAS PRIORITIZATION (CRITICAL):
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

REMEMBER: Show the money early. Make it feel achievable, not aspirational.`;
  }
  
  if (isDecisionMaking) {
    specializedInstructions = `\n\nDECISION-MAKING FRAMEWORK REQUIRED:
- START by validating their feeling of being stuck (e.g., "Being stuck is normal...")
- EXPLICITLY mention the V.I.S. Model (Values, Interests, Skills/Abilities)
- Reference the Career Choice Matrix with weighted factors (Interest ×3, Ability ×3, Security ×2, Salary ×2, Affordability ×2)
- Suggest job shadowing and informational interviews as validation tools
- Mention that career changes are normal (most people change careers 3-5 times)
- Provide the 4-step decision tree: Know Yourself → Know Options → Use Matrix → Test & Commit`;
  }
  
  if (isMisconception) {
    specializedInstructions = `\n\nMYTH-BUSTING FRAMEWORK REQUIRED:
- START by directly acknowledging and challenging the misconception (e.g., "This is a common myth, but here's the reality...")
- Provide EVIDENCE to debunk the myth (statistics, salary data, success stories)
- Address the emotional/social pressure behind the misconception (family expectations, peer pressure, fear)
- Offer alternative perspectives and frameworks for thinking about the issue
- Validate their feelings while correcting the misinformation`;
  }
  
  if (isCreativeCareer) {
    specializedInstructions += `\n\nCREATIVE CAREER GUIDANCE:
- Distinguish between "passion hobbies" and "creative professions"
- Provide HIGH-PAYING creative-tech hybrids (UX/UI Designer R25K-R45K, Game Designer R25K-R50K)
- Mention the 70/30 rule (70% stable income, 30% passion projects)
- Include freelance + corporate hybrid strategies
- Reference SA creative success stories if available in context`;
  }
  
  if (isAIFuture) {
    specializedInstructions += `\n\nAI & FUTURE OF WORK GUIDANCE:
- Acknowledge AI anxiety as valid but provide nuanced perspective
- Categorize jobs: HIGH risk (data entry, telemarketers), MEDIUM risk (will change not disappear), LOW risk (AI-resistant)
- Emphasize AI AUGMENTATION (jobs become more interesting) not just displacement
- List NEW careers created by AI (ML Engineer, AI Ethics Specialist, Prompt Engineer)
- Highlight AI-proof skills: creativity, emotional intelligence, complex problem-solving, critical thinking, adaptability`;
  }

  let emphasisNote = '';
  if (attempt > 0) {
    emphasisNote = `\n\nIMPORTANT: Your previous response was incomplete. Please ensure you include:
- Exactly 3-5 career options (numbered 1., 2., 3., etc.)
- Match percentage and reasoning for EACH career (e.g., "85% match - Why: uses mathematics extensively")
- Salary range in ZAR for EACH career (e.g., "R25,000-R45,000/month")
${studentProfile.financialConstraint === 'low' ? '- At least 2 specific bursaries with names, amounts, and deadlines' : ''}
- Specific next steps (numbered list)
- EXTRACT and USE specific frameworks, models, and concepts from the retrieved knowledge above`;
  }

  // Check if context has frameworks (if context is object with frameworks property)
  const hasFrameworks = context.frameworksDetected && context.frameworks && context.frameworks.length > 0;
  const contextText = typeof context === 'string' ? context : context.context;
  
  // Build frameworks section if detected
  let frameworksSection = '';
  if (hasFrameworks) {
    frameworksSection = `\n\n═══════════════════════════════════════
🎯 FRAMEWORKS TO USE (MANDATORY):
═══════════════════════════════════════

The following frameworks have been detected in the retrieved knowledge. You MUST explicitly reference these by name in your response:

${context.frameworks.map((f, i) => `
${i + 1}. ${f.name}
   Source: ${f.source}
   
   Content Preview:
   ${f.content.substring(0, 500)}...
   
   ⚠️ REQUIREMENT: You MUST mention "${f.name}" by name in your response.
   Example: "Let's use the ${f.name} to help you decide..."
`).join('\n')}

═══════════════════════════════════════\n\n`;
  }

  return `RETRIEVED KNOWLEDGE (USE THIS INFORMATION):
${contextText}${frameworksSection}

Student Question: ${query}

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

4. ${studentProfile.financialConstraint === 'low' ? 'Bursaries (at least 2 specific):' : 'Bursaries (if relevant):'}
   - Bursary name (e.g., "Sasol Engineering Bursary")
   - Amount/description (e.g., "Full tuition + R5,000/month")
   - Application deadline (e.g., "Deadline: 30 June 2026")

5. Next Steps (numbered list, 3-5 actionable items):
   - Reference specific tools from knowledge (e.g., "Complete the Career Choice Matrix", "Try the 5 Reality Check Questions")
   - Include concrete actions (visit, apply, research, shadow)

6. Closing (1-2 sentences):
   - Encouraging message
   - Reminder that career planning is a process${specializedInstructions}${emphasisNote}

Response:`;
}

/**
 * Framework aliases for flexible matching
 */
const FRAMEWORK_ALIASES = {
  'V.I.S. Model': ['Values-Interest-Skills', 'VIS Model', 'V.I.S framework', 'Values, Interests, Skills', 'Values Interests Skills'],
  'Career Choice Matrix': ['career matrix', 'decision matrix', 'choice framework', 'scoring matrix'],
  'Passion vs Pay': ['passion versus pay', 'love vs money', 'interest vs salary', 'passion or pay'],
  'AI Augmentation': ['AI augment', 'human-AI collaboration', 'AI enhancement'],
  '70/30 Rule': ['70-30 rule', 'seventy thirty', '70 percent stable']
};

/**
 * Validate response meets PRD requirements
 * STRENGTHENED VALIDATION per feedback
 * @param {string} response - Generated response
 * @param {Object} studentProfile - Student profile
 * @param {Object} context - Retrieved context with frameworks
 * @returns {Object} - Validation result
 */
export function validateResponse(response, studentProfile, context = {}) {
  const checks = {
    hasCareerMatches: false,
    hasReasoningForCareer: false,
    hasBursaries: true, // Default true if no financial need
    hasSalaries: false,
    hasNextSteps: false,
    hasSAContext: false,
    hasSubstantialContent: false
  };

  // MODIFICATION 1: Count career mentions (flexible for MVP)
  // Accept either numbered sections OR career keywords with context
  const numberedSections = (response.match(/^\d+[\.\)]\s+/gm) || []).length;
  const careerKeywords = (response.match(/\b(scientist|analyst|developer|engineer|accountant|actuary|programmer|designer|consultant|teacher|nurse|doctor|architect|technician)\b/gi) || []).length;
  const careerCount = Math.max(numberedSections, Math.min(careerKeywords, 5));
  checks.hasCareerMatches = careerCount >= 3;

  // MODIFICATION 1b: Check for career reasoning (RELAXED for MVP - any explanation counts)
  checks.hasReasoningForCareer = 
    response.length > 300 && (
      /\b(ideal|suitable|perfect|excellent|great|good|recommended|match|aligns|fits|because|since|as|why)\b/i.test(response) ||
      /given your|based on your|considering your|this career|these careers|option|path/i.test(response)
    );

  // MODIFICATION 2: Strengthen bursary validation (name + deadline)
  if (studentProfile.financialConstraint === 'low' || studentProfile.financialConstraint === 'medium') {
    const bursaryPattern = /(?:sasol|fnb|nedbank|discovery|anglo|eskom|transnet|nsfas|standard bank|absa|capitec|old mutual).+?(?:deadline|closes|apply by|due)/gis;
    checks.hasBursaries = bursaryPattern.test(response);
  }

  // MODIFICATION 3: Validate multiple salary ranges (at least 3)
  // Match formats: R25,000-R45,000 or R25K-R45K or R25000-R45000
  const salaryRanges = response.match(/R\d+[,\d]*[kK]?\s*(?:-|to|–)\s*R\d+[,\d]*[kK]?/g) || [];
  checks.hasSalaries = salaryRanges.length >= 3;

  // Check for next steps
  checks.hasNextSteps = /next step|action|apply|visit|contact|prepare|research/gi.test(response) &&
                        (response.match(/^\d+\.\s+[A-Z]/gm) || []).length >= 2;

  // Check for SA context
  checks.hasSAContext = /university|south africa|gauteng|western cape|kwazulu|uct|wits|stellenbosch|pretoria/gi.test(response);

  // MODIFICATION 4: Add response length check (FURTHER RELAXED for MVP)
  checks.hasSubstantialContent = response.length >= 300 && response.length <= 3000;

  // MODIFICATION 5: Framework citation check with flexible matching
  checks.hasFrameworkReference = (() => {
    if (!context.frameworksDetected || !context.frameworks || context.frameworks.length === 0) {
      return true; // Not applicable if no frameworks provided
    }
    
    // Check if ANY framework (or its aliases) appears in response
    return context.frameworks.some(f => {
      // Exact match
      if (new RegExp(f.name, 'i').test(response)) return true;
      
      // Alias matching
      const aliases = FRAMEWORK_ALIASES[f.name] || [];
      return aliases.some(alias => new RegExp(alias, 'i').test(response));
    });
  })();

  // Overall validation
  const passed = Object.values(checks).every(check => check === true);

  return {
    passed,
    checks,
    details: {
      careerCount,
      salaryRangeCount: salaryRanges.length,
      responseLength: response.length
    }
  };
}

/**
 * Sleep utility for retry backoff
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
