/**
 * CAG Quality Layer - Main Orchestrator
 * 
 * Coordinates the entire verification pipeline through 3 stages:
 * Stage 1: Rule-based checks (fast, deterministic)
 * Stage 2: LLM verification (semantic, contextual)
 * Stage 3: Decision making and final output
 * 
 * @typedef {import('./types').CAGInput} CAGInput
 * @typedef {import('./types').VerificationResult} VerificationResult
 */

const RuleBasedChecker = require('./rule-based-checker.cjs');
const SourceGroundingValidator = require('./source-grounding-validator.cjs');
const LLMVerifier = require('./llm-verifier.cjs');
const DecisionMaker = require('./decision-maker.cjs');
const CAGConfig = require('../../config/cag.config.cjs');

/**
 * CAG Layer - Main Orchestrator
 * 
 * Orchestrates the complete verification pipeline:
 * 1. Rule-based checks (entity verification, data validation, policy rules)
 * 2. Source grounding validation (fact checking against RAG chunks)
 * 3. LLM verification (semantic validation, hallucination detection)
 * 4. Decision making (approve/revise/reject/fallback)
 * 
 * Validates Requirements: 1.1, 8.1, 8.2, 8.3, 9.1, 10.1
 */
class CAGLayer {
  constructor(config = {}) {
    this.config = { ...CAGConfig, ...config };
    
    // Initialize all components
    this.ruleChecker = new RuleBasedChecker(this.config);
    this.groundingValidator = new SourceGroundingValidator(this.config);
    this.llmVerifier = new LLMVerifier(this.config);
    this.decisionMaker = new DecisionMaker(this.config);
    
    // Performance tracking
    this.stats = {
      totalVerifications: 0,
      avgProcessingTime: 0,
      decisionDistribution: {
        approved: 0,
        revised: 0,
        rejected: 0,
        fallback: 0
      }
    };
  }

  /**
   * Task 6.1: Main verification method
   * Validates Requirements: 1.1, 9.1, 10.1
   * 
   * @param {CAGInput} input - Input containing draft answer, RAG chunks, and context
   * @returns {Promise<VerificationResult>} Verification result with final answer
   */
  async verify(input) {
    const startTime = Date.now();
    const stagesCompleted = [];
    const allIssues = [];
    
    try {
      // Validate input
      this._validateInput(input);
      
      // Task 6.2: Execute Stage 1 - Rule-based checks
      console.log('[CAG] Stage 1: Rule-based checks');
      const ruleResult = await this._executeRuleChecks(input);
      stagesCompleted.push('rule_checks');
      allIssues.push(...(ruleResult.issues || []));
      
      // Task 6.2: Execute Stage 2 - Source grounding validation
      console.log('[CAG] Stage 2: Source grounding validation');
      const groundingResult = await this._executeGroundingValidation(input);
      stagesCompleted.push('grounding_validation');
      allIssues.push(...(groundingResult.issues || []));
      
      // Task 6.3: Optimize - Skip LLM if rule confidence is very high
      let llmResult = null;
      const shouldSkipLLM = this._shouldSkipLLMVerification(ruleResult, input.options);
      
      if (!shouldSkipLLM) {
        // Task 6.2: Execute Stage 3 - LLM verification
        console.log('[CAG] Stage 3: LLM verification');
        llmResult = await this._executeLLMVerification(input, ruleResult, groundingResult);
        stagesCompleted.push('llm_verification');
        allIssues.push(...(llmResult.issues || []));
      } else {
        console.log('[CAG] Stage 3: LLM verification skipped (high rule confidence)');
        llmResult = {
          approved: true,
          skipped: true,
          reason: 'high_rule_confidence',
          issues: [],
          recommendation: 'approve'
        };
        stagesCompleted.push('llm_verification_skipped');
      }
      
      // Task 6.2: Execute Stage 4 - Decision making
      console.log('[CAG] Stage 4: Decision making');
      const decision = this.decisionMaker.decide(ruleResult, llmResult, {
        studentProfile: input.studentProfile,
        query: input.query,
        timeContext: input.timeContext
      });
      stagesCompleted.push('decision_making');
      
      // Task 6.2: Apply revisions if needed
      let finalAnswer = input.draftAnswer;
      const revisionsApplied = [];
      
      if (decision.decision === 'revise') {
        const revisionResult = await this._applyRevisions(
          input.draftAnswer,
          allIssues,
          input.ragChunks,
          llmResult
        );
        finalAnswer = revisionResult.revisedAnswer;
        revisionsApplied.push(...revisionResult.revisions);
        stagesCompleted.push('revisions_applied');
      } else if (decision.decision === 'fallback') {
        finalAnswer = input.ragDraft || input.draftAnswer;
        stagesCompleted.push('fallback_triggered');
      }
      
      const processingTime = Date.now() - startTime;
      
      // Update statistics
      this._updateStats(decision.decision, processingTime);
      
      // Log performance warning if exceeding target
      if (processingTime > (this.config.performanceTargets?.totalProcessing || 2000)) {
        console.warn(`[CAG] Total processing exceeded target: ${processingTime}ms > 2000ms`);
      }
      
      return {
        success: true,
        decision: decision.decision,
        finalAnswer,
        metadata: {
          processingTime,
          stagesCompleted,
          issuesDetected: allIssues,
          revisionsApplied,
          sourcesUsed: this._extractSourcesUsed(input.ragChunks),
          llmModel: llmResult?.skipped ? undefined : this.config.llmModel,
          confidence: decision.confidence,
          requiresHuman: decision.requiresHuman,
          ruleConfidence: ruleResult.confidence,
          groundingScore: groundingResult.overallScore,
          llmApproved: llmResult?.approved,
          decisionReasoning: decision.reasoning
        }
      };
      
    } catch (error) {
      console.error('[CAG] Verification failed:', error);
      
      // Task 6.2: Handle stage failures gracefully - fallback
      return this._handleCriticalFailure(error, input, startTime, stagesCompleted);
    }
  }

  /**
   * Task 6.2: Execute rule-based checks
   * Validates Requirements: 8.1
   * @private
   */
  async _executeRuleChecks(input) {
    try {
      return await this.ruleChecker.check({
        draftAnswer: input.draftAnswer,
        ragChunks: input.ragChunks,
        studentProfile: input.studentProfile,
        query: input.query
      });
    } catch (error) {
      console.error('[CAG] Rule checks failed:', error);
      return {
        passed: false,
        confidence: 0,
        issues: [{
          type: 'system',
          severity: 'critical',
          location: 'rule_checker',
          problem: `Rule checking failed: ${error.message}`
        }]
      };
    }
  }

  /**
   * Task 6.2: Execute source grounding validation
   * Validates Requirements: 8.1
   * @private
   */
  async _executeGroundingValidation(input) {
    try {
      return await this.groundingValidator.validate({
        draftAnswer: input.draftAnswer,
        ragChunks: input.ragChunks
      });
    } catch (error) {
      console.error('[CAG] Grounding validation failed:', error);
      return {
        isGrounded: false,
        overallScore: 0,
        issues: [{
          type: 'system',
          severity: 'critical',
          location: 'grounding_validator',
          problem: `Grounding validation failed: ${error.message}`
        }],
        ungroundedFacts: []
      };
    }
  }

  /**
   * Task 6.2: Execute LLM verification
   * Validates Requirements: 8.2
   * @private
   */
  async _executeLLMVerification(input, ruleResult, groundingResult) {
    try {
      return await this.llmVerifier.verify({
        draftAnswer: input.draftAnswer,
        ragChunks: input.ragChunks,
        studentProfile: input.studentProfile,
        ruleResult,
        groundingResult
      });
    } catch (error) {
      console.error('[CAG] LLM verification failed:', error);
      return {
        approved: false,
        skipped: true,
        reason: 'llm_error',
        issues: [{
          type: 'system',
          severity: 'high',
          location: 'llm_verifier',
          problem: `LLM verification failed: ${error.message}`
        }],
        recommendation: 'fallback'
      };
    }
  }

  /**
   * Task 6.3: Determine if LLM verification can be skipped
   * Validates Requirements: 9.2, 9.3
   * @private
   */
  _shouldSkipLLMVerification(ruleResult, options = {}) {
    // User explicitly requested to skip
    if (options.skipLLMVerification) {
      return true;
    }
    
    // Rule confidence is very high (>0.9) and no critical issues
    const highConfidence = ruleResult.confidence >= 0.9;
    const noCriticalIssues = !ruleResult.issues?.some(i => i.severity === 'critical');
    
    if (highConfidence && noCriticalIssues) {
      return true;
    }
    
    return false;
  }

  /**
   * Task 6.2: Apply revisions to draft answer
   * @private
   */
  async _applyRevisions(draftAnswer, issues, ragChunks, llmResult) {
    const revisions = [];
    let revisedAnswer = draftAnswer;
    
    // Apply LLM-suggested corrections
    if (llmResult?.corrections && llmResult.corrections.length > 0) {
      for (const correction of llmResult.corrections) {
        if (correction.original && correction.corrected) {
          revisedAnswer = revisedAnswer.replace(correction.original, correction.corrected);
          revisions.push({
            type: 'llm_correction',
            original: correction.original,
            corrected: correction.corrected,
            reason: correction.reason
          });
        }
      }
    }
    
    // Fix critical issues from rules
    const criticalIssues = issues.filter(i => i.severity === 'critical' && i.correction);
    for (const issue of criticalIssues) {
      if (issue.correction) {
        revisedAnswer = revisedAnswer.replace(issue.problem, issue.correction);
        revisions.push({
          type: 'rule_correction',
          original: issue.problem,
          corrected: issue.correction,
          reason: issue.type
        });
      }
    }
    
    return {
      revisedAnswer,
      revisions
    };
  }

  /**
   * Task 6.2: Handle critical failures with fallback
   * Validates Requirements: 8.4, 8.5
   * @private
   */
  _handleCriticalFailure(error, input, startTime, stagesCompleted) {
    const processingTime = Date.now() - startTime;
    
    console.error('[CAG] Critical failure, returning fallback');
    
    return {
      success: false,
      decision: 'fallback',
      finalAnswer: input.ragDraft || input.draftAnswer,
      metadata: {
        processingTime,
        stagesCompleted,
        issuesDetected: [{
          type: 'system',
          severity: 'critical',
          location: 'cag_layer',
          problem: `Critical failure: ${error.message}`
        }],
        revisionsApplied: [],
        sourcesUsed: [],
        error: error.message,
        fallbackReason: 'critical_system_failure'
      }
    };
  }

  /**
   * Validate input structure
   * @private
   */
  _validateInput(input) {
    if (!input.draftAnswer || typeof input.draftAnswer !== 'string') {
      throw new Error('Invalid input: draftAnswer is required and must be a string');
    }
    
    if (!input.ragChunks || !Array.isArray(input.ragChunks)) {
      throw new Error('Invalid input: ragChunks is required and must be an array');
    }
    
    if (!input.studentProfile || typeof input.studentProfile !== 'object') {
      throw new Error('Invalid input: studentProfile is required and must be an object');
    }
  }

  /**
   * Extract sources used from RAG chunks
   * @private
   */
  _extractSourcesUsed(ragChunks) {
    const sources = new Set();
    
    for (const chunk of ragChunks) {
      if (chunk.chunk_metadata?.source) {
        sources.add(chunk.chunk_metadata.source);
      }
    }
    
    return Array.from(sources);
  }

  /**
   * Update statistics
   * @private
   */
  _updateStats(decision, processingTime) {
    this.stats.totalVerifications++;
    this.stats.decisionDistribution[decision]++;
    
    // Update rolling average
    const prevAvg = this.stats.avgProcessingTime;
    const n = this.stats.totalVerifications;
    this.stats.avgProcessingTime = ((prevAvg * (n - 1)) + processingTime) / n;
  }

  /**
   * Get CAG statistics for monitoring
   * Validates Requirements: 10.1, 10.2, 10.3
   * @returns {Object} CAG statistics
   */
  getStats() {
    return {
      ...this.stats,
      decisionPercentages: {
        approved: (this.stats.decisionDistribution.approved / this.stats.totalVerifications * 100).toFixed(1),
        revised: (this.stats.decisionDistribution.revised / this.stats.totalVerifications * 100).toFixed(1),
        rejected: (this.stats.decisionDistribution.rejected / this.stats.totalVerifications * 100).toFixed(1),
        fallback: (this.stats.decisionDistribution.fallback / this.stats.totalVerifications * 100).toFixed(1)
      }
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalVerifications: 0,
      avgProcessingTime: 0,
      decisionDistribution: {
        approved: 0,
        revised: 0,
        rejected: 0,
        fallback: 0
      }
    };
  }
}

module.exports = CAGLayer;
