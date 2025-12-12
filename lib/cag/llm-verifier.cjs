/**
 * CAG Quality Layer - LLM Verifier
 * 
 * Performs semantic validation of LLM-generated answers using another LLM.
 * This component provides deep verification beyond rule-based checks.
 * 
 * @typedef {import('./types').LLMVerificationResult} LLMVerificationResult
 * @typedef {import('./types').Issue} Issue
 */

const CAGConfig = require('../../config/cag.config.cjs');

/**
 * LLM Verifier Component
 * 
 * Performs LLM-based verification by:
 * - Building structured verification prompts
 * - Calling LLM for semantic validation
 * - Parsing and validating JSON responses
 * - Detecting hallucinations and inaccuracies
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 9.2, 6.1, 6.2, 6.5, 5.1, 5.2, 8.2
 */
class LLMVerifier {
  constructor(llmAdapter, config = {}) {
    this.llm = llmAdapter;
    this.config = { ...CAGConfig, ...config };
    this.timeout = config.timeout || 10000; // 10 second timeout
  }

  /**
   * Task 4.1: Main verification method
   * Validates Requirements: 1.1, 9.2
   * 
   * @param {Object} input - Verification input
   * @param {string} input.draftAnswer - LLM-generated draft answer
   * @param {Array} input.ragChunks - Retrieved knowledge chunks
   * @param {Object} input.studentProfile - Student context
   * @param {Object} ruleResult - Results from rule-based checker
   * @returns {Promise<LLMVerificationResult>} Verification results
   */
  async verify(input, ruleResult) {
    const startTime = Date.now();

    try {
      // Skip LLM verification if rule checks failed critically
      if (ruleResult && ruleResult.confidence < 0.3) {
        return {
          skipped: true,
          reason: 'rule_check_failed',
          approved: false,
          issues: [],
          recommendation: 'reject',
          metadata: {
            processingTime: Date.now() - startTime,
            skippedReason: 'Rule confidence too low'
          }
        };
      }

      // Task 4.2: Build verification prompt
      const prompt = this._buildVerificationPrompt(input);

      // Call LLM with timeout
      const response = await this._callLLMWithTimeout(prompt);

      // Task 4.3: Parse response
      const parsed = this._parseResponse(response);

      // Task 4.4: Enhance with hallucination detection
      const enhanced = this._enhanceWithHallucinationDetection(parsed, input);

      const processingTime = Date.now() - startTime;

      // Log performance warning if exceeding target
      if (processingTime > (this.config.performanceTargets?.llmVerification || 1500)) {
        console.warn(`[CAG] LLM verification exceeded target: ${processingTime}ms > 1500ms`);
      }

      return {
        ...enhanced,
        metadata: {
          processingTime,
          model: this.llm?.name || 'unknown',
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0
        }
      };
    } catch (error) {
      console.error('[CAG] LLM verification failed:', error);
      return {
        skipped: true,
        reason: 'llm_error',
        approved: false,
        issues: [{
          type: 'structure',
          severity: 'high',
          location: 'llm_verification',
          problem: `LLM verification failed: ${error.message}`,
          correction: 'Unable to perform LLM verification'
        }],
        recommendation: 'fallback',
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Task 4.2: Build verification prompt template
   * Validates Requirements: 1.2, 5.1, 5.2
   * @private
   */
  _buildVerificationPrompt(input) {
    const { draftAnswer, ragChunks, studentProfile } = input;

    // Format RAG chunks for prompt
    const sourcesText = ragChunks
      .map((chunk, idx) => `[Source ${idx + 1}]\n${chunk.chunk_text}\n`)
      .join('\n');

    // Format student context
    const studentContext = studentProfile
      ? `Grade: ${studentProfile.grade || 'Unknown'}\nSubjects: ${(studentProfile.subjects || []).join(', ')}\nInterests: ${(studentProfile.interests || []).join(', ')}`
      : 'No student context provided';

    const prompt = `You are the CAG (Critic-Auditor-Governance) verifier for Thandi.ai, a South African career guidance platform.

Your job is to verify that the draft answer is:
1. Factually accurate and grounded in the provided sources
2. Free from hallucinations (invented facts not in sources)
3. Compliant with South African educational standards
4. Appropriate in tone for school-age students

RETRIEVED SOURCES:
${sourcesText}

DRAFT ANSWER:
${draftAnswer}

STUDENT CONTEXT:
${studentContext}

VERIFICATION TASKS:
1. Check EVERY factual claim against the sources above
2. Flag ANY information not present in the sources
3. Verify SA-specific details (institutions, qualifications, salaries in Rands)
4. Confirm tone is encouraging, supportive, and age-appropriate
5. Ensure no definitive prescriptions (use "consider", "explore", not "you must")

SOUTH AFRICAN CONTEXT:
- Universities: UCT, Wits, UP, UJ, UKZN, Stellenbosch, etc.
- Qualifications: Bachelor's, Diploma, Certificate, NQF levels
- Currency: South African Rand (R)
- Funding: NSFAS, bursaries
- Education system: Grade 10-12, Matric, APS scores

RESPONSE FORMAT (return ONLY valid JSON):
{
  "approved": boolean,
  "issues": [
    {
      "type": "hallucination" | "inaccuracy" | "tone" | "policy",
      "severity": "low" | "medium" | "high" | "critical",
      "location": "specific text from draft",
      "problem": "description of issue",
      "correction": "suggested fix using sources"
    }
  ],
  "recommendation": "approve" | "revise" | "reject"
}

Return ONLY the JSON object, no additional text.`;

    return prompt;
  }

  /**
   * Task 4.1: Call LLM with timeout handling
   * Validates Requirements: 9.2
   * @private
   */
  async _callLLMWithTimeout(prompt) {
    return Promise.race([
      this._callLLM(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('LLM verification timeout')), this.timeout)
      )
    ]);
  }

  /**
   * Call LLM adapter
   * @private
   */
  async _callLLM(prompt) {
    if (!this.llm) {
      throw new Error('LLM adapter not configured');
    }

    // Use generateJSON if available, otherwise generateText
    if (typeof this.llm.generateJSON === 'function') {
      return await this.llm.generateJSON(prompt, {
        maxTokens: 1000,
        temperature: 0.1, // Low temperature for consistency
        responseFormat: 'json'
      });
    } else if (typeof this.llm.generateText === 'function') {
      const response = await this.llm.generateText(prompt, {
        maxTokens: 1000,
        temperature: 0.1
      });
      return { text: response };
    } else {
      throw new Error('LLM adapter does not support generateText or generateJSON');
    }
  }

  /**
   * Task 4.3: Parse JSON response from LLM
   * Validates Requirements: 1.3, 8.2
   * @private
   */
  _parseResponse(response) {
    try {
      // Extract text from response
      let text = response.text || response.content || response;
      
      if (typeof text !== 'string') {
        text = JSON.stringify(text);
      }

      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        text = jsonMatch[1];
      }

      // Remove any leading/trailing whitespace
      text = text.trim();

      // Parse JSON
      const parsed = JSON.parse(text);

      // Validate structure
      if (typeof parsed.approved !== 'boolean') {
        throw new Error('Missing or invalid "approved" field');
      }

      if (!Array.isArray(parsed.issues)) {
        throw new Error('Missing or invalid "issues" array');
      }

      if (!['approve', 'revise', 'reject'].includes(parsed.recommendation)) {
        throw new Error('Invalid recommendation value');
      }

      // Normalize issues
      parsed.issues = parsed.issues.map(issue => ({
        type: issue.type || 'inaccuracy',
        severity: issue.severity || 'medium',
        location: issue.location || 'unknown',
        problem: issue.problem || 'Issue detected',
        correction: issue.correction || 'Review and correct'
      }));

      return parsed;
    } catch (error) {
      console.error('[CAG] Failed to parse LLM response:', error);
      
      // Return safe fallback
      return {
        approved: false,
        issues: [{
          type: 'structure',
          severity: 'high',
          location: 'llm_response',
          problem: `Failed to parse LLM response: ${error.message}`,
          correction: 'Unable to verify answer'
        }],
        recommendation: 'fallback'
      };
    }
  }

  /**
   * Task 4.4: Enhance with hallucination detection
   * Validates Requirements: 6.1, 6.2, 6.5
   * @private
   */
  _enhanceWithHallucinationDetection(parsed, input) {
    const { draftAnswer, ragChunks } = input;
    const additionalIssues = [];

    // Extract all text from RAG chunks for comparison
    const sourceText = ragChunks
      .map(chunk => chunk.chunk_text.toLowerCase())
      .join(' ');

    // Detect specific numbers that might be hallucinated
    const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g;
    const draftNumbers = draftAnswer.match(numberPattern) || [];
    
    for (const number of draftNumbers) {
      const cleanNumber = number.replace(/,/g, '');
      if (!sourceText.includes(cleanNumber) && !sourceText.includes(number)) {
        // Check if it's a significant number (not year, not small number)
        const numValue = parseFloat(cleanNumber);
        if (numValue > 100 && numValue < 10000) {
          additionalIssues.push({
            type: 'hallucination',
            severity: 'high',
            location: `Number: ${number}`,
            problem: `Specific number "${number}" not found in sources`,
            correction: 'Verify this number against source documents or remove it'
          });
        }
      }
    }

    // Detect invented institution names
    const institutionPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|TVET))\b/g;
    const draftInstitutions = draftAnswer.match(institutionPattern) || [];
    
    for (const institution of draftInstitutions) {
      if (!sourceText.includes(institution.toLowerCase())) {
        additionalIssues.push({
          type: 'hallucination',
          severity: 'critical',
          location: `Institution: ${institution}`,
          problem: `Institution "${institution}" not found in sources`,
          correction: 'Remove this institution or replace with one from sources'
        });
      }
    }

    // Detect specific dates that might be hallucinated
    const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi;
    const draftDates = draftAnswer.match(datePattern) || [];
    
    for (const date of draftDates) {
      if (!sourceText.includes(date.toLowerCase())) {
        additionalIssues.push({
          type: 'hallucination',
          severity: 'medium',
          location: `Date: ${date}`,
          problem: `Specific date "${date}" not found in sources`,
          correction: 'Verify this date against source documents'
        });
      }
    }

    // Merge additional issues with parsed issues
    const allIssues = [...parsed.issues, ...additionalIssues];

    // Update recommendation if critical hallucinations found
    let recommendation = parsed.recommendation;
    const criticalHallucinations = additionalIssues.filter(i => i.severity === 'critical');
    
    if (criticalHallucinations.length > 0 && recommendation === 'approve') {
      recommendation = 'revise';
    }

    return {
      approved: parsed.approved && additionalIssues.length === 0,
      issues: allIssues,
      recommendation,
      hallucinationsDetected: additionalIssues.length,
      skipped: false
    };
  }
}

module.exports = LLMVerifier;
