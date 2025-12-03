/**
 * CAG Quality Layer - Decision Maker
 * 
 * Combines rule-based and LLM verification results to make final decisions.
 * This component determines whether to approve, revise, reject, or fallback.
 * 
 * @typedef {import('./types').DecisionResult} DecisionResult
 * @typedef {import('./types').Issue} Issue
 */

const CAGConfig = require('../../config/cag.config.cjs');

/**
 * Decision Maker Component
 * 
 * Makes final decisions by:
 * - Combining rule-based and LLM verification results
 * - Implementing decision tree logic
 * - Applying automatic revisions when possible
 * - Handling fallback scenarios safely
 * 
 * Validates Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 1.5, 2.5
 */
class DecisionMaker {
  constructor(config = {}) {
    this.config = { ...CAGConfig, ...config };
  }

  /**
   * Task 5.1: Main decision method
   * Validates Requirements: 8.1, 8.2, 8.3
   * 
   * @param {Object} ruleResult - Results from rule-based checker
   * @param {Object} llmResult - Results from LLM verifier
   * @param {Object} input - Original input data
   * @returns {DecisionResult} Final decision with answer
   */
  decide(ruleResult, llmResult, input) {
    const startTime = Date.now();

    try {
      const { draftAnswer, ragDraft } = input;

      // Collect all issues from both stages
      const allIssues = [
        ...(ruleResult.issues || []),
        ...(llmResult.issues || [])
      ];

      // Calculate combined confidence
      const combinedConfidence = this._calculateCombinedConfidence(ruleResult, llmResult);

      // Task 5.3: Critical failure → fallback
      if (this._shouldFallback(ruleResult, llmResult, allIssues)) {
        return this._fallback(input, allIssues, {
          processingTime: Date.now() - startTime,
          combinedConfidence
        });
      }

      // Task 5.2: Minor issues → auto-revise
      if (this._shouldRevise(ruleResult, llmResult, allIssues)) {
        return this._revise(input, allIssues, {
          processingTime: Date.now() - startTime,
          combinedConfidence
        });
      }

      // All good → approve
      if (this._shouldApprove(ruleResult, llmResult, allIssues)) {
        return this._approve(draftAnswer, allIssues, {
          processingTime: Date.now() - startTime,
          combinedConfidence
        });
      }

      // Default: reject (too many issues, but not critical)
      return this._reject(input, allIssues, {
        processingTime: Date.now() - startTime,
        combinedConfidence
      });

    } catch (error) {
      console.error('[CAG] Decision making failed:', error);
      // On error, fallback to RAG draft
      return this._fallback(input, [], {
        processingTime: Date.now() - startTime,
        error: error.message
      });
    }
  }

  /**
   * Task 5.1: Calculate combined confidence from both stages
   * @private
   */
  _calculateCombinedConfidence(ruleResult, llmResult) {
    const ruleConfidence = ruleResult.confidence || 0;
    
    // If LLM was skipped, use only rule confidence
    if (llmResult.skipped) {
      return ruleConfidence;
    }

    // LLM approved = high confidence boost
    const llmConfidence = llmResult.approved ? 0.9 : 0.3;

    // Weighted average (rules 40%, LLM 60%)
    return (ruleConfidence * 0.4) + (llmConfidence * 0.6);
  }

  /**
   * Task 5.3: Determine if should fallback
   * Validates Requirements: 8.4, 8.5
   * @private
   */
  _shouldFallback(ruleResult, llmResult, allIssues) {
    // Critical rule failure
    if (ruleResult.confidence < 0.3) {
      return true;
    }

    // LLM recommends reject
    if (llmResult.recommendation === 'reject') {
      return true;
    }

    // Too many critical issues
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    if (criticalIssues.length >= 3) {
      return true;
    }

    // Too many total issues
    if (allIssues.length >= 10) {
      return true;
    }

    return false;
  }

  /**
   * Task 5.2: Determine if should revise
   * Validates Requirements: 8.2
   * @private
   */
  _shouldRevise(ruleResult, llmResult, allIssues) {
    // Don't revise if should fallback
    if (this._shouldFallback(ruleResult, llmResult, allIssues)) {
      return false;
    }

    // LLM recommends revise
    if (llmResult.recommendation === 'revise') {
      return true;
    }

    // Has fixable issues (not too many)
    if (allIssues.length > 0 && allIssues.length < 7) {
      const fixableIssues = allIssues.filter(i => 
        i.correction && i.severity !== 'critical'
      );
      return fixableIssues.length > 0;
    }

    return false;
  }

  /**
   * Task 5.1: Determine if should approve
   * Validates Requirements: 8.1
   * @private
   */
  _shouldApprove(ruleResult, llmResult, allIssues) {
    // Rule checks passed
    const rulePassed = ruleResult.passed || ruleResult.confidence >= 0.7;

    // LLM approved (or was skipped with high rule confidence)
    const llmApproved = llmResult.approved || 
                       (llmResult.skipped && ruleResult.confidence >= 0.8);

    // No critical issues
    const noCriticalIssues = !allIssues.some(i => i.severity === 'critical');

    // Few or no issues
    const fewIssues = allIssues.length <= 2;

    return rulePassed && llmApproved && noCriticalIssues && fewIssues;
  }

  /**
   * Task 5.1: Approve the draft answer
   * @private
   */
  _approve(draftAnswer, issues, metadata) {
    return {
      decision: 'approved',
      finalAnswer: draftAnswer,
      issues,
      revisionsApplied: [],
      metadata: {
        ...metadata,
        reason: 'All checks passed'
      }
    };
  }

  /**
   * Task 5.2: Revise the draft answer
   * Validates Requirements: 1.5, 2.5, 8.2
   * @private
   */
  _revise(input, issues, metadata) {
    const { draftAnswer, ragChunks } = input;

    // Apply corrections from issues
    let revisedAnswer = draftAnswer;
    const revisionsApplied = [];

    // Sort issues by severity (critical first)
    const sortedIssues = [...issues].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    });

    for (const issue of sortedIssues) {
      if (!issue.correction) continue;

      // Apply correction based on issue type
      const revision = this._applyCorrection(revisedAnswer, issue, ragChunks);
      
      if (revision.applied) {
        revisedAnswer = revision.text;
        revisionsApplied.push({
          issue: issue.problem,
          correction: issue.correction,
          type: issue.type
        });
      }

      // Limit revisions to prevent over-modification
      if (revisionsApplied.length >= 5) break;
    }

    return {
      decision: 'revised',
      finalAnswer: revisedAnswer,
      issues,
      revisionsApplied,
      metadata: {
        ...metadata,
        reason: `Applied ${revisionsApplied.length} correction(s)`
      }
    };
  }

  /**
   * Task 5.2: Apply a single correction
   * @private
   */
  _applyCorrection(text, issue, ragChunks) {
    try {
      // Handle different issue types
      switch (issue.type) {
        case 'hallucination':
          // Remove hallucinated content
          if (issue.location && text.includes(issue.location)) {
            return {
              applied: true,
              text: text.replace(issue.location, issue.correction || '')
            };
          }
          break;

        case 'inaccuracy':
          // Replace inaccurate content with correction
          if (issue.location && issue.correction) {
            return {
              applied: true,
              text: text.replace(issue.location, issue.correction)
            };
          }
          break;

        case 'policy':
          // Apply policy corrections (e.g., add verification warnings)
          if (issue.correction) {
            // Append correction at the end
            return {
              applied: true,
              text: text + '\n\n' + issue.correction
            };
          }
          break;

        case 'tone':
          // Tone corrections are usually suggestions, not automatic
          break;

        default:
          // Generic correction
          if (issue.location && issue.correction) {
            return {
              applied: true,
              text: text.replace(issue.location, issue.correction)
            };
          }
      }

      return { applied: false, text };
    } catch (error) {
      console.error('[CAG] Failed to apply correction:', error);
      return { applied: false, text };
    }
  }

  /**
   * Task 5.1: Reject the draft (return fallback)
   * @private
   */
  _reject(input, issues, metadata) {
    return this._fallback(input, issues, {
      ...metadata,
      reason: 'Too many issues to auto-correct'
    });
  }

  /**
   * Task 5.3: Fallback to RAG draft
   * Validates Requirements: 8.4, 8.5
   * @private
   */
  _fallback(input, issues, metadata) {
    const { ragDraft, draftAnswer } = input;

    // Use RAG draft if available, otherwise use original draft with warning
    const fallbackAnswer = ragDraft || draftAnswer;

    // Add safety warning if using original draft
    const needsWarning = !ragDraft;
    const finalAnswer = needsWarning
      ? fallbackAnswer + '\n\n⚠️ Note: Please verify this information with official sources.'
      : fallbackAnswer;

    return {
      decision: 'fallback',
      finalAnswer,
      issues,
      revisionsApplied: [],
      metadata: {
        ...metadata,
        reason: metadata.reason || 'Verification failed, using fallback',
        usedRAGDraft: !!ragDraft,
        addedWarning: needsWarning
      }
    };
  }
}

module.exports = DecisionMaker;
