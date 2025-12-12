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
      // Build prompt (with requirements data if available)
      const prompt = buildPrompt(query, context, studentProfile, attempt, options.requirementsData);
      
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

CRITICAL REQUIREMENTS:
1. SALARY RANGES: You MUST include salary ranges in ZAR for EVERY career you recommend (e.g., "R25,000-R45,000/month entry-level"). This is MANDATORY.
2. FRAMEWORKS: Extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided
3. PERSONALIZATION: Reference the student's specific data (marks, support system, grade) in every section
4. STRUCTURE: Follow the exact format provided in the prompt

SALARY REQUIREMENT (CRITICAL):
- Recommend 3-5 careers
- Each career MUST have a salary range
- Format: "R[min]-R[max]/month entry-level"
- Example: "Software Engineer: R25,000-R45,000/month entry-level"

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

CRITICAL REQUIREMENTS:
1. SALARY RANGES: You MUST include salary ranges in ZAR for EVERY career you recommend (e.g., "R25,000-R45,000/month entry-level"). This is MANDATORY.
2. FRAMEWORKS: Extract and explicitly reference specific frameworks, models, and concepts from the retrieved knowledge provided
3. PERSONALIZATION: Reference the student's specific data (marks, support system, grade) in every section
4. STRUCTURE: Follow the exact format provided in the prompt

SALARY REQUIREMENT (CRITICAL):
- Recommend 3-5 careers
- Each career MUST have a salary range
- Format: "R[min]-R[max]/month entry-level"
- Example: "Software Engineer: R25,000-R45,000/month entry-level"

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
 * Build EXPLICIT prompt that forces "YOUR" data references
 * COFOUNDER MANDATE: Every sentence must show student's specific data
 * @param {string} query - Student's question
 * @param {string} context - Retrieved context
 * @param {Object} studentProfile - Student profile
 * @param {number} attempt - Retry attempt number
 * @param {Object} requirementsData - Grade-specific requirements from requirements engine
 * @returns {string} - Formatted prompt with explicit data requirements
 */
function buildPrompt(query, context, studentProfile, attempt = 0, requirementsData = null) {
  // Extract student data for easy reference
  const grade = studentProfile.grade || 'unknown';
  const marks = studentProfile.subjectMarks || {};
  const support = studentProfile.supportSystem || [];
  const financial = studentProfile.constraints?.money || studentProfile.financialConstraint || 'unknown';
  const interests = studentProfile.interests || [];
  
  // Format marks for display
  const marksDisplay = Object.entries(marks).map(([subject, mark]) => 
    `   - ${subject}: YOUR ${mark}`
  ).join('\n') || '   - No marks provided';
  
  // Format requirements data if available
  let requirementsSection = '';
  if (requirementsData) {
    requirementsSection = `\n\n## VERIFIED ADMISSION REQUIREMENTS (USE THESE SPECIFIC FACTS):\n${JSON.stringify(requirementsData, null, 2)}\n\nIMPORTANT: Reference these specific requirements in your response. Do NOT give generic advice. Use the exact deadlines, APS scores, and requirements provided above.`;
  
  // Format support system
  const supportDisplay = support.length > 0 ? support.join(', ') : 'none specified';
  
  // Check if context has frameworks
  const hasFrameworks = context.frameworksDetected && context.frameworks && context.frameworks.length > 0;
  const contextText = typeof context === 'string' ? context : context.context;
  
  // Build frameworks section if detected
  let frameworksSection = '';
  if (hasFrameworks) {
    frameworksSection = `\n\n═══════════════════════════════════════
🎯 FRAMEWORKS TO USE (MANDATORY):
═══════════════════════════════════════

${context.frameworks.map((f, i) => `${i + 1}. ${f.name} - ${f.source}`).join('\n')}

═══════════════════════════════════════\n\n`;
  }

  return `RETRIEVED KNOWLEDGE (USE THIS INFORMATION):
${contextText}${frameworksSection}

Student Question: ${query}

═══════════════════════════════════════
🎯 STUDENT'S SPECIFIC DATA (MUST REFERENCE IN EVERY SECTION):
═══════════════════════════════════════

Grade: YOUR Grade ${grade}
Financial Situation: YOUR ${financial} income household
Support System: YOUR ${supportDisplay}

YOUR Subject Marks:
${marksDisplay}

YOUR Interests: ${interests.join(', ') || 'not specified'}

═══════════════════════════════════════

🚨 CRITICAL RULE - EXPLICIT DATA REFERENCES (MANDATORY):

EVERY sentence in your response MUST contain ONE of:
1. The word "YOUR" or "YOURS" (e.g., "YOUR Mathematics mark of 60-69%")
2. A specific number from student data (e.g., "60-69%", "Grade ${grade}")
3. A specific R amount (e.g., "R120,000 Sasol bursary")
4. Reference to their support system (e.g., "YOUR school tutoring")

NO GENERIC ADVICE ALLOWED. Examples:
❌ BAD: "You should improve your math skills"
✅ GOOD: "YOUR Mathematics mark of 60-69% needs to reach 70% by YOUR Grade 11 final exams"

❌ BAD: "Consider applying for bursaries"
✅ GOOD: "Apply for the R120,000 Sasol bursary using YOUR Physical Sciences mark of 70-79%"

❌ BAD: "Use available resources"
✅ GOOD: "Use YOUR school tutoring 2x/week to improve YOUR Mathematics from 60-69% to 70%"

═══════════════════════════════════════

RESPONSE FORMAT (EVERY SECTION MUST REFERENCE STUDENT DATA):

🚨 CRITICAL: You MUST recommend 3-5 careers. Each career MUST include a salary range in ZAR.

### [Career Name] ([X]% match)

**SALARY:** R[min]-R[max]/month entry-level (MANDATORY - DO NOT SKIP)

**WHY THIS FITS YOUR PROFILE:**
- Based on YOUR interest in [specific interest from data]: [connection]
- YOUR [subject] mark of [X%] shows [strength/weakness]

**YOUR MARKS vs CAREER REQUIREMENTS:**
- [Subject 1]: YOUR [current mark] → NEED [target mark] for this career
- [Subject 2]: YOUR [current mark] → NEED [target mark] for this career
- Gap to close: [number] percentage points by YOUR Grade ${grade === 10 ? '11' : '12'} finals

**YOUR IMPROVEMENT PLAN (Using YOUR Resources):**
${support.includes('school tutoring') ? '- Use YOUR school tutoring 2x/week for [weak subject]' : ''}
${support.includes('family help') ? '- Ask YOUR family to quiz you weekly on [subject]' : ''}
${support.includes('online resources') ? '- Use YOUR online resources (Khan Academy) for [subject]' : ''}
${!support.includes('private tutor') ? '- Use Khan Academy (free) since YOU don\'t have a private tutor' : ''}

**YOUR AFFORDABLE PATHWAY:**${financial === 'low' ? `
- TVET College: [Program] (FREE, YOU qualify NOW with YOUR marks)
- NSFAS University: Apply with YOUR [subject] at 70% by Grade 12
- Bursaries: [Name] (R[amount], apply [date] using YOUR Grade ${grade} marks)` : `
- University: [Name] with YOUR current marks
- Bursaries available: [List with R amounts]`}

**YOUR 3-YEAR ACTION PLAN:**

**YOUR Grade ${grade} (THIS YEAR):**
1. Improve YOUR [weak subject] from YOUR ${Object.entries(marks)[0]?.[1] || 'current mark'}
2. Use YOUR ${supportDisplay} for support
3. Target: Reach [X]% by YOUR Grade ${grade} final exams

**YOUR Grade ${grade === 10 ? '11' : '12'} (NEXT YEAR):**
1. Maintain YOUR [strong subject] at ${Object.entries(marks)[0]?.[1] || 'current level'}
2. Apply for bursaries using YOUR Grade ${grade} marks
3. Visit universities with YOUR family

**YOUR BACKUP PLANS:**
- If YOUR marks don't improve: [alternative career with lower requirements]
- If YOUR family disagrees: Show them salary data (R[amount]/month)
- If YOU can't afford university: TVET with YOUR current marks (FREE)

═══════════════════════════════════════

VALIDATION CHECKLIST (Before submitting response):
✅ Every career recommendation references YOUR specific marks
✅ Every career MUST have salary range (e.g., "R25,000-R45,000/month")
✅ At least 3 careers with 3 salary ranges (MANDATORY)
✅ Every improvement plan references YOUR support system
✅ Every financial pathway shows R amounts for bursaries
✅ Every timeline references YOUR Grade ${grade}
✅ Count "YOUR" occurrences: Should be ≥20 times
✅ No generic "you should" statements without data

🚨 SALARY REQUIREMENT: Include salary for EVERY career. Format: "R[min]-R[max]/month"
Examples:
- Software Engineer: R25,000-R45,000/month entry-level
- Data Scientist: R30,000-R55,000/month entry-level  
- UX Designer: R20,000-R40,000/month entry-level

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
