/**
 * CAG Quality Layer - Source Grounding Validator
 * 
 * Verifies that factual claims in LLM-generated answers are grounded in retrieved RAG sources.
 * This component performs fact extraction and chunk matching to ensure source attribution.
 * 
 * @typedef {import('./types').RAGChunk} RAGChunk
 * @typedef {import('./types').Issue} Issue
 */

/**
 * Source Grounding Validator Component
 * 
 * Performs source grounding validation by:
 * - Extracting factual claims from draft answers
 * - Matching claims against RAG chunk content
 * - Calculating grounding scores
 * - Identifying ungrounded facts
 * 
 * Validates Requirements: 2.1, 2.2, 2.4, 4.1, 4.2, 4.3, 6.1
 */
class SourceGroundingValidator {
  constructor(config = {}) {
    this.config = config;
    // Minimum similarity threshold for considering a fact grounded
    this.similarityThreshold = config.similarityThreshold || 0.6;
  }

  /**
   * Task 3.1: Validate that claims in draft answer are grounded in RAG sources
   * 
   * @param {string} draftAnswer - LLM-generated draft answer
   * @param {RAGChunk[]} ragChunks - Retrieved knowledge chunks
   * @returns {Promise<Object>} Grounding validation result
   */
  async validate(draftAnswer, ragChunks) {
    const startTime = Date.now();

    try {
      // Task 3.1: Extract factual claims from draft answer
      const facts = this._extractFacts(draftAnswer);

      // Task 3.2: Check each fact against sources
      const groundingResults = await Promise.all(
        facts.map(async (fact) => {
          const matchingChunks = this._findMatchingChunks(fact, ragChunks);
          return {
            fact: fact.text,
            type: fact.type,
            grounded: matchingChunks.length > 0,
            sources: matchingChunks.map(c => c.id),
            confidence: this._calculateGroundingConfidence(fact, matchingChunks)
          };
        })
      );

      // Calculate overall grounding metrics
      const fullyGrounded = groundingResults.every(r => r.grounded);
      const partiallyGrounded = groundingResults.some(r => r.grounded);
      const ungroundedFacts = groundingResults.filter(r => !r.grounded);
      const groundingScore = this._calculateOverallScore(groundingResults);

      // Task 3.3: Generate grounding report with issues
      const issues = this._generateGroundingIssues(ungroundedFacts, groundingResults);

      return {
        fullyGrounded,
        partiallyGrounded,
        groundingScore,
        ungroundedFacts: ungroundedFacts.map(r => r.fact),
        groundingResults,
        issues,
        metadata: {
          processingTime: Date.now() - startTime,
          totalFacts: facts.length,
          groundedFacts: groundingResults.filter(r => r.grounded).length,
          ungroundedCount: ungroundedFacts.length
        }
      };
    } catch (error) {
      console.error('[CAG] Source grounding validation failed:', error);
      return {
        fullyGrounded: false,
        partiallyGrounded: false,
        groundingScore: 0,
        ungroundedFacts: [],
        groundingResults: [],
        issues: [{
          type: 'structure',
          severity: 'high',
          location: 'source_grounding',
          problem: `Source grounding validation failed: ${error.message}`,
          correction: 'Unable to verify source grounding'
        }],
        metadata: {
          processingTime: Date.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Task 3.1: Extract factual claims from draft answer
   * Validates Requirements: 2.1, 4.1
   * @private
   */
  _extractFacts(draftAnswer) {
    const facts = [];

    // Extract institution mentions
    const institutionPatterns = [
      /(?:at|from|study at|attend|enroll at|apply to)\s+([A-Z][A-Za-z\s]+(?:University|College|TVET|Institute))/g,
      /(University of [A-Z][A-Za-z\s]+)/g,
      /([A-Z][A-Za-z\s]+University)/g,
      /(UCT|Wits|UP|Stellenbosch|UJ|UKZN|NWU|UFS|UFH|WSU|CPUT|DUT|TUT|VUT|MUT)/g
    ];

    for (const pattern of institutionPatterns) {
      let match;
      while ((match = pattern.exec(draftAnswer)) !== null) {
        const institution = (match[1] || match[0]).trim();
        if (institution.length > 2) {
          facts.push({
            text: institution,
            type: 'institution',
            context: this._getContext(draftAnswer, match.index, 50)
          });
        }
      }
    }

    // Extract career mentions
    const careerPatterns = [
      /(?:become a|work as a|career as a|pursue a career in|job as a)\s+([A-Z][A-Za-z\s]+?)(?:\.|,|;|\s+(?:at|in|with|requires|involves))/g,
      /([A-Z][A-Za-z\s]+?)\s+(?:career|profession|field|occupation)/g
    ];

    for (const pattern of careerPatterns) {
      let match;
      while ((match = pattern.exec(draftAnswer)) !== null) {
        const career = match[1].trim();
        if (career.length > 3 && career.length < 50) {
          facts.push({
            text: career,
            type: 'career',
            context: this._getContext(draftAnswer, match.index, 50)
          });
        }
      }
    }

    // Extract salary mentions
    const salaryPattern = /R\s*([0-9,\s]+(?:\s*-\s*R?\s*[0-9,\s]+)?)\s*(?:per month|per year|monthly|annually)?/g;
    let match;
    while ((match = salaryPattern.exec(draftAnswer)) !== null) {
      facts.push({
        text: match[0].trim(),
        type: 'salary',
        context: this._getContext(draftAnswer, match.index, 50)
      });
    }

    // Extract qualification mentions
    const qualificationPatterns = [
      /(Bachelor|Diploma|Certificate|Honours|Masters|PhD|Doctorate)\s+(?:of|in|degree)\s+([A-Z][A-Za-z\s]+)/g,
      /(B\.?[A-Z][a-z]+|M\.?[A-Z][a-z]+|PhD)\s+in\s+([A-Z][A-Za-z\s]+)/g,
      /(NQF Level [0-9]+)/g
    ];

    for (const pattern of qualificationPatterns) {
      let match;
      while ((match = pattern.exec(draftAnswer)) !== null) {
        facts.push({
          text: match[0].trim(),
          type: 'qualification',
          context: this._getContext(draftAnswer, match.index, 50)
        });
      }
    }

    // Extract APS score mentions
    const apsPattern = /APS\s*(?:score\s*)?(?:of\s*)?([0-9]+)/gi;
    while ((match = apsPattern.exec(draftAnswer)) !== null) {
      facts.push({
        text: match[0].trim(),
        type: 'aps_score',
        context: this._getContext(draftAnswer, match.index, 50)
      });
    }

    // Extract specific numeric claims (durations, requirements, etc.)
    const numericPattern = /(?:requires?|takes?|lasts?|duration of)\s+([0-9]+)\s+(years?|months?|weeks?)/gi;
    while ((match = numericPattern.exec(draftAnswer)) !== null) {
      facts.push({
        text: match[0].trim(),
        type: 'duration',
        context: this._getContext(draftAnswer, match.index, 50)
      });
    }

    return facts;
  }

  /**
   * Task 3.2: Find RAG chunks that match a given fact
   * Validates Requirements: 2.2, 4.2, 4.3
   * @private
   */
  _findMatchingChunks(fact, ragChunks) {
    const matchingChunks = [];

    for (const chunk of ragChunks) {
      const chunkText = chunk.chunk_text.toLowerCase();
      const factText = fact.text.toLowerCase();

      // Check for direct text match
      if (chunkText.includes(factText)) {
        matchingChunks.push({
          ...chunk,
          matchType: 'exact',
          matchScore: 1.0
        });
        continue;
      }

      // Check for partial match (for longer facts)
      if (fact.text.length > 10) {
        const words = factText.split(/\s+/).filter(w => w.length > 3);
        const matchedWords = words.filter(word => chunkText.includes(word));
        const matchRatio = matchedWords.length / words.length;

        if (matchRatio >= this.similarityThreshold) {
          matchingChunks.push({
            ...chunk,
            matchType: 'partial',
            matchScore: matchRatio
          });
          continue;
        }
      }

      // Check metadata for entity matches
      if (fact.type === 'institution' && chunk.chunk_metadata?.institution) {
        if (this._fuzzyMatch(factText, chunk.chunk_metadata.institution.toLowerCase())) {
          matchingChunks.push({
            ...chunk,
            matchType: 'metadata',
            matchScore: 0.9
          });
        }
      }

      if (fact.type === 'career' && chunk.chunk_metadata?.career) {
        if (this._fuzzyMatch(factText, chunk.chunk_metadata.career.toLowerCase())) {
          matchingChunks.push({
            ...chunk,
            matchType: 'metadata',
            matchScore: 0.9
          });
        }
      }

      if (fact.type === 'qualification' && chunk.chunk_metadata?.qualification) {
        if (this._fuzzyMatch(factText, chunk.chunk_metadata.qualification.toLowerCase())) {
          matchingChunks.push({
            ...chunk,
            matchType: 'metadata',
            matchScore: 0.9
          });
        }
      }

      // For salary facts, check for numeric matches
      if (fact.type === 'salary') {
        const factNumbers = fact.text.match(/[0-9,]+/g);
        if (factNumbers) {
          const hasMatchingNumber = factNumbers.some(num => 
            chunkText.includes(num.replace(/,/g, ''))
          );
          if (hasMatchingNumber) {
            matchingChunks.push({
              ...chunk,
              matchType: 'numeric',
              matchScore: 0.8
            });
          }
        }
      }
    }

    // Sort by match score (highest first)
    return matchingChunks.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Task 3.3: Generate grounding issues for ungrounded facts
   * Validates Requirements: 2.4, 6.1
   * @private
   */
  _generateGroundingIssues(ungroundedFacts, allResults) {
    const issues = [];

    for (const result of ungroundedFacts) {
      const severity = this._determineIssueSeverity(result.type);
      
      issues.push({
        type: 'hallucination',
        severity,
        location: `${result.type}: "${result.fact}"`,
        problem: `Claim "${result.fact}" is not supported by retrieved sources`,
        correction: 'Remove this claim or replace with information from retrieved documents'
      });
    }

    // Check for low-confidence grounded facts
    const lowConfidenceFacts = allResults.filter(r => 
      r.grounded && r.confidence < 0.7
    );

    for (const result of lowConfidenceFacts) {
      issues.push({
        type: 'inaccuracy',
        severity: 'medium',
        location: `${result.type}: "${result.fact}"`,
        problem: `Claim "${result.fact}" has weak source support (confidence: ${result.confidence.toFixed(2)})`,
        correction: 'Verify this claim more explicitly matches source documents'
      });
    }

    return issues;
  }

  /**
   * Calculate grounding confidence for a fact
   * @private
   */
  _calculateGroundingConfidence(fact, matchingChunks) {
    if (matchingChunks.length === 0) return 0;

    // Use the best match score
    const bestMatch = matchingChunks[0];
    let confidence = bestMatch.matchScore;

    // Boost confidence if multiple chunks support the fact
    if (matchingChunks.length > 1) {
      confidence = Math.min(1.0, confidence + 0.1 * (matchingChunks.length - 1));
    }

    // Boost confidence for exact matches
    if (bestMatch.matchType === 'exact') {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    return confidence;
  }

  /**
   * Calculate overall grounding score
   * @private
   */
  _calculateOverallScore(groundingResults) {
    if (groundingResults.length === 0) return 1.0; // No facts to check

    const totalConfidence = groundingResults.reduce((sum, r) => sum + r.confidence, 0);
    return totalConfidence / groundingResults.length;
  }

  /**
   * Determine issue severity based on fact type
   * @private
   */
  _determineIssueSeverity(factType) {
    const severityMap = {
      'institution': 'high',      // Critical - must be accurate
      'qualification': 'high',    // Critical - must be accurate
      'salary': 'medium',         // Important but can vary
      'aps_score': 'high',        // Critical - specific requirement
      'career': 'medium',         // Important but more flexible
      'duration': 'medium'        // Important but can vary
    };

    return severityMap[factType] || 'medium';
  }

  /**
   * Get context around a match position
   * @private
   */
  _getContext(text, position, contextLength) {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(text.length, position + contextLength);
    return text.substring(start, end).trim();
  }

  /**
   * Fuzzy matching for entity names
   * @private
   */
  _fuzzyMatch(str1, str2) {
    // Handle common SA university abbreviations
    const abbrevMap = {
      'uct': 'university of cape town',
      'wits': 'university of the witwatersrand',
      'up': 'university of pretoria',
      'uj': 'university of johannesburg',
      'ukzn': 'university of kwazulu-natal',
      'nwu': 'north-west university',
      'ufs': 'university of the free state'
    };

    const mapped1 = abbrevMap[str1] || str1;
    const mapped2 = abbrevMap[str2] || str2;

    // Check for exact match
    if (mapped1 === mapped2) return true;

    // Check for substring match
    if (mapped1.includes(mapped2) || mapped2.includes(mapped1)) return true;

    // Check for word overlap
    const words1 = mapped1.split(/\s+/).filter(w => w.length > 3);
    const words2 = mapped2.split(/\s+/).filter(w => w.length > 3);
    
    if (words1.length === 0 || words2.length === 0) return false;

    const commonWords = words1.filter(w => words2.includes(w));
    const overlapRatio = commonWords.length / Math.min(words1.length, words2.length);

    return overlapRatio >= 0.5;
  }
}

module.exports = SourceGroundingValidator;
