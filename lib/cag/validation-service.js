/**
 * CAG Validation Service
 * 
 * Core validation layer that ensures all career guidance meets professional standards
 * before being published to students. This service acts as the quality assurance
 * layer between RAG generation and student-facing results.
 * 
 * @author Kiro AI Assistant
 * @version 1.0.0
 * @created 2026-01-07
 */

/**
 * Validation criteria for career guidance responses
 */
const VALIDATION_CRITERIA = {
  MATHEMATICAL_ACCURACY: 'mathematical_accuracy',
  INFORMATION_CURRENCY: 'information_currency', 
  STUDENT_APPROPRIATENESS: 'student_appropriateness',
  SAFETY_COMPLIANCE: 'safety_compliance',
  COMPLETENESS_CHECK: 'completeness_check',
  BURSARY_ACCURACY: 'bursary_accuracy',
  MARKET_RELEVANCE: 'market_relevance'
};

/**
 * Validation result status codes
 */
const VALIDATION_STATUS = {
  APPROVED: 'approved',
  NEEDS_ENHANCEMENT: 'needs_enhancement',
  REQUIRES_CORRECTION: 'requires_correction',
  REJECTED: 'rejected'
};

/**
 * CAG Validation Service Class
 * 
 * Provides comprehensive validation of career guidance responses
 * ensuring accuracy, safety, and relevance before publication.
 */
export class CAGValidationService {
  constructor() {
    this.validationHistory = new Map();
    this.jobMarketIntelligence = null;
    this.bursaryValidator = null;
    
    // Initialize sub-services asynchronously
    this.initializeServices();
  }

  /**
   * Initialize validation sub-services
   */
  async initializeServices() {
    try {
      // Dynamic imports for sub-services
      const { JobMarketIntelligence } = await import('./job-market-intelligence.js');
      const { BursaryValidationEngine } = await import('./bursary-validation-engine.js');
      
      this.jobMarketIntelligence = new JobMarketIntelligence();
      this.bursaryValidator = new BursaryValidationEngine();
      
      console.log('[CAG VALIDATION] Sub-services initialized successfully');
    } catch (error) {
      console.warn('[CAG VALIDATION] Sub-services not available:', error.message);
      // Continue without sub-services - core validation will still work
    }
  }

  /**
   * Main validation method - validates complete career guidance response
   * 
   * @param {Object} ragResponse - The RAG-generated career guidance response
   * @param {Object} studentProfile - Student's assessment data and profile
   * @param {Object} options - Validation options and preferences
   * @returns {Promise<Object>} Comprehensive validation results
   */
  async validateCareerGuidance(ragResponse, studentProfile, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`[CAG VALIDATION] Starting validation for student grade ${studentProfile?.grade}`);
      
      // Initialize validation context
      const validationContext = {
        studentProfile,
        ragResponse,
        options,
        timestamp: new Date().toISOString(),
        validationId: this.generateValidationId()
      };

      // Run parallel validation checks
      const validationResults = await Promise.all([
        this.validateMathematicalAccuracy(ragResponse, studentProfile),
        this.validateInformationCurrency(ragResponse, studentProfile),
        this.validateStudentAppropriateness(ragResponse, studentProfile),
        this.validateSafetyCompliance(ragResponse),
        this.validateCompleteness(ragResponse, studentProfile),
        this.validateBursaryRecommendations(ragResponse, studentProfile),
        this.validateMarketRelevance(ragResponse, studentProfile)
      ]);

      // Aggregate validation results
      const aggregatedResults = this.aggregateValidationResults(validationResults);
      
      // Generate enhanced response based on validation
      const enhancedResponse = await this.generateEnhancedResponse(
        ragResponse, 
        studentProfile, 
        aggregatedResults
      );

      // Calculate overall validation score
      const overallScore = this.calculateOverallScore(aggregatedResults);
      
      // Determine validation status
      const validationStatus = this.determineValidationStatus(overallScore, aggregatedResults);

      const finalResult = {
        validationId: validationContext.validationId,
        status: validationStatus,
        overallScore,
        validationResults: aggregatedResults,
        enhancedResponse,
        originalResponse: ragResponse,
        studentProfile,
        processingTime: Date.now() - startTime,
        timestamp: validationContext.timestamp,
        recommendations: this.generateImprovementRecommendations(aggregatedResults)
      };

      // Store validation history for learning
      this.storeValidationHistory(finalResult);

      console.log(`[CAG VALIDATION] Completed in ${finalResult.processingTime}ms - Status: ${validationStatus}`);
      
      return finalResult;

    } catch (error) {
      console.error('[CAG VALIDATION] Validation failed:', error);
      
      // Return safe fallback response
      return {
        validationId: this.generateValidationId(),
        status: VALIDATION_STATUS.REJECTED,
        overallScore: 0,
        error: error.message,
        fallbackResponse: this.generateSafeFallbackResponse(studentProfile),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validates mathematical accuracy of APS calculations and grade requirements
   */
  async validateMathematicalAccuracy(ragResponse, studentProfile) {
    const checks = {
      apsCalculations: true,
      gradeRequirements: true,
      subjectCombinations: true,
      percentageCalculations: true
    };

    const issues = [];
    const corrections = [];

    try {
      // Validate APS calculations if present
      if (ragResponse.response?.includes('APS')) {
        const apsMatches = ragResponse.response.match(/APS\s*(\d+)/gi);
        if (apsMatches) {
          for (const match of apsMatches) {
            const apsValue = parseInt(match.match(/\d+/)[0]);
            if (apsValue < 14 || apsValue > 42) {
              checks.apsCalculations = false;
              issues.push(`Invalid APS value: ${apsValue} (valid range: 14-42)`);
              corrections.push(`Correct APS range validation needed`);
            }
          }
        }
      }

      // Validate grade requirements consistency
      const gradeMatches = ragResponse.response.match(/Grade\s*(\d+)/gi);
      if (gradeMatches && studentProfile?.grade) {
        const studentGrade = parseInt(studentProfile.grade.toString().replace('grade', ''));
        for (const match of gradeMatches) {
          const mentionedGrade = parseInt(match.match(/\d+/)[0]);
          if (mentionedGrade < 10 || mentionedGrade > 12) {
            checks.gradeRequirements = false;
            issues.push(`Invalid grade reference: Grade ${mentionedGrade}`);
            corrections.push(`Use valid grade range (10-12)`);
          }
        }
      }

      // Validate percentage calculations
      const percentageMatches = ragResponse.response.match(/(\d+)%/g);
      if (percentageMatches) {
        for (const match of percentageMatches) {
          const percentage = parseInt(match.replace('%', ''));
          if (percentage < 0 || percentage > 100) {
            checks.percentageCalculations = false;
            issues.push(`Invalid percentage: ${percentage}%`);
            corrections.push(`Ensure percentages are within 0-100% range`);
          }
        }
      }

    } catch (error) {
      console.error('[CAG VALIDATION] Mathematical accuracy check failed:', error);
      checks.apsCalculations = false;
      issues.push('Mathematical validation error occurred');
    }

    return {
      criterion: VALIDATION_CRITERIA.MATHEMATICAL_ACCURACY,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 95 : Math.max(50, 95 - (issues.length * 15))
    };
  }

  /**
   * Validates information currency - ensures data is current for 2026
   */
  async validateInformationCurrency(ragResponse, studentProfile) {
    const checks = {
      currentYear: true,
      applicationDeadlines: true,
      universityRequirements: true,
      bursaryAvailability: true
    };

    const issues = [];
    const corrections = [];

    try {
      // Check for outdated year references
      const yearMatches = ragResponse.response.match(/20\d{2}/g);
      if (yearMatches) {
        for (const year of yearMatches) {
          const yearNum = parseInt(year);
          if (yearNum < 2025 || yearNum > 2027) {
            checks.currentYear = false;
            issues.push(`Outdated year reference: ${year}`);
            corrections.push(`Update to current academic year (2026)`);
          }
        }
      }

      // Validate application deadlines are future dates
      const deadlineMatches = ragResponse.response.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi);
      if (deadlineMatches) {
        const currentDate = new Date();
        for (const deadline of deadlineMatches) {
          const deadlineDate = new Date(deadline);
          if (deadlineDate < currentDate) {
            checks.applicationDeadlines = false;
            issues.push(`Past deadline mentioned: ${deadline}`);
            corrections.push(`Update to current application deadlines`);
          }
        }
      }

      // Check for generic "current" requirements language
      if (ragResponse.response.includes('current requirements') || 
          ragResponse.response.includes('latest information')) {
        // This is good - indicates awareness of currency needs
        checks.universityRequirements = true;
      }

    } catch (error) {
      console.error('[CAG VALIDATION] Information currency check failed:', error);
      issues.push('Information currency validation error occurred');
    }

    return {
      criterion: VALIDATION_CRITERIA.INFORMATION_CURRENCY,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 90 : Math.max(60, 90 - (issues.length * 10))
    };
  }

  /**
   * Validates student appropriateness - ensures recommendations match student profile
   */
  async validateStudentAppropriateness(ragResponse, studentProfile) {
    const checks = {
      gradeAlignment: true,
      performanceAlignment: true,
      interestAlignment: true,
      constraintConsideration: true
    };

    const issues = [];
    const corrections = [];

    try {
      // Validate grade-appropriate content
      if (studentProfile?.grade) {
        const studentGrade = parseInt(studentProfile.grade.toString().replace('grade', ''));
        
        // Check for grade-inappropriate recommendations
        if (studentGrade === 10) {
          if (ragResponse.response.includes('university application') || 
              ragResponse.response.includes('final exams')) {
            checks.gradeAlignment = false;
            issues.push('University application advice inappropriate for Grade 10');
            corrections.push('Focus on subject selection and foundation building');
          }
        } else if (studentGrade === 12) {
          if (!ragResponse.response.includes('application') && 
              !ragResponse.response.includes('deadline')) {
            checks.gradeAlignment = false;
            issues.push('Missing urgent application guidance for Grade 12');
            corrections.push('Include application deadlines and urgent actions');
          }
        }
      }

      // Validate performance alignment
      if (studentProfile?.marks) {
        const marks = Object.values(studentProfile.marks);
        const averageMark = marks.reduce((sum, mark) => sum + parseFloat(mark || 0), 0) / marks.length;
        
        if (averageMark < 50 && ragResponse.response.includes('medicine')) {
          checks.performanceAlignment = false;
          issues.push('Medicine recommendation inappropriate for current performance');
          corrections.push('Suggest performance improvement or alternative pathways');
        }
      }

      // Validate interest alignment
      if (studentProfile?.interests) {
        const interests = Array.isArray(studentProfile.interests) ? 
          studentProfile.interests : [studentProfile.interests];
        
        // Check if recommendations align with stated interests
        const hasInterestAlignment = interests.some(interest => 
          ragResponse.response.toLowerCase().includes(interest.toLowerCase())
        );
        
        if (!hasInterestAlignment && interests.length > 0) {
          checks.interestAlignment = false;
          issues.push('Recommendations do not align with stated interests');
          corrections.push('Include career options matching student interests');
        }
      }

      // Validate constraint consideration
      if (studentProfile?.constraints) {
        if (studentProfile.constraints.financial === 'high' && 
            !ragResponse.response.includes('bursary') && 
            !ragResponse.response.includes('financial aid')) {
          checks.constraintConsideration = false;
          issues.push('Missing financial aid guidance for financially constrained student');
          corrections.push('Include comprehensive bursary and financial aid information');
        }
      }

    } catch (error) {
      console.error('[CAG VALIDATION] Student appropriateness check failed:', error);
      issues.push('Student appropriateness validation error occurred');
    }

    return {
      criterion: VALIDATION_CRITERIA.STUDENT_APPROPRIATENESS,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 92 : Math.max(65, 92 - (issues.length * 12))
    };
  }

  /**
   * Validates safety compliance - ensures appropriate disclaimers and warnings
   */
  async validateSafetyCompliance(ragResponse) {
    const checks = {
      verificationWarning: false,
      disclaimerPresent: false,
      noGuarantees: true,
      appropriateLanguage: true
    };

    const issues = [];
    const corrections = [];

    try {
      // Check for verification warning
      if (ragResponse.response.includes('⚠️') && 
          (ragResponse.response.includes('verify') || ragResponse.response.includes('confirm'))) {
        checks.verificationWarning = true;
      } else {
        issues.push('Missing verification warning');
        corrections.push('Add verification warning with ⚠️ symbol');
      }

      // Check for appropriate disclaimer
      if (ragResponse.response.includes('AI-generated') || 
          ragResponse.response.includes('consult') || 
          ragResponse.response.includes('professional advice')) {
        checks.disclaimerPresent = true;
      } else {
        issues.push('Missing AI-generated disclaimer');
        corrections.push('Add disclaimer about AI-generated content');
      }

      // Check for inappropriate guarantees
      const guaranteeWords = ['guarantee', 'promise', 'certain', 'definitely will'];
      for (const word of guaranteeWords) {
        if (ragResponse.response.toLowerCase().includes(word)) {
          checks.noGuarantees = false;
          issues.push(`Inappropriate guarantee language: "${word}"`);
          corrections.push('Remove guarantee language, use probability-based language');
        }
      }

      // Check for appropriate language tone
      const inappropriateWords = ['easy', 'simple', 'no problem', 'guaranteed success'];
      for (const word of inappropriateWords) {
        if (ragResponse.response.toLowerCase().includes(word)) {
          checks.appropriateLanguage = false;
          issues.push(`Inappropriate language: "${word}"`);
          corrections.push('Use realistic, balanced language about career challenges');
        }
      }

    } catch (error) {
      console.error('[CAG VALIDATION] Safety compliance check failed:', error);
      issues.push('Safety compliance validation error occurred');
    }

    return {
      criterion: VALIDATION_CRITERIA.SAFETY_COMPLIANCE,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 98 : Math.max(70, 98 - (issues.length * 8))
    };
  }

  /**
   * Validates completeness - ensures all required sections are present
   */
  async validateCompleteness(ragResponse, studentProfile) {
    const checks = {
      careerRecommendations: false,
      nextSteps: false,
      alternativeOptions: false,
      timelineGuidance: false
    };

    const issues = [];
    const corrections = [];

    try {
      // Check for career recommendations
      if (ragResponse.response.includes('career') || 
          ragResponse.response.includes('profession') ||
          ragResponse.response.includes('field')) {
        checks.careerRecommendations = true;
      } else {
        issues.push('Missing career recommendations');
        corrections.push('Include specific career recommendations');
      }

      // Check for actionable next steps
      if (ragResponse.response.includes('next step') || 
          ragResponse.response.includes('action') ||
          ragResponse.response.includes('should') ||
          ragResponse.response.match(/\d+\./)) { // Numbered lists
        checks.nextSteps = true;
      } else {
        issues.push('Missing actionable next steps');
        corrections.push('Include clear, actionable next steps');
      }

      // Check for alternative options
      if (ragResponse.response.includes('alternative') || 
          ragResponse.response.includes('backup') ||
          ragResponse.response.includes('other option') ||
          ragResponse.response.includes('consider')) {
        checks.alternativeOptions = true;
      } else {
        issues.push('Missing alternative options');
        corrections.push('Include backup career options');
      }

      // Check for timeline guidance
      if (ragResponse.response.includes('year') || 
          ragResponse.response.includes('month') ||
          ragResponse.response.includes('deadline') ||
          ragResponse.response.includes('timeline')) {
        checks.timelineGuidance = true;
      } else {
        issues.push('Missing timeline guidance');
        corrections.push('Include timeline and deadline information');
      }

    } catch (error) {
      console.error('[CAG VALIDATION] Completeness check failed:', error);
      issues.push('Completeness validation error occurred');
    }

    return {
      criterion: VALIDATION_CRITERIA.COMPLETENESS_CHECK,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 88 : Math.max(55, 88 - (issues.length * 10))
    };
  }

  /**
   * Validates bursary recommendations using specialized bursary engine
   */
  async validateBursaryRecommendations(ragResponse, studentProfile) {
    try {
      if (this.bursaryValidator) {
        return await this.bursaryValidator.validateBursaryRecommendations(
          ragResponse, 
          studentProfile
        );
      } else {
        // Fallback validation if bursary validator not available
        return this.validateBursaryRecommendationsFallback(ragResponse, studentProfile);
      }
    } catch (error) {
      console.error('[CAG VALIDATION] Bursary validation failed:', error);
      return {
        criterion: VALIDATION_CRITERIA.BURSARY_ACCURACY,
        passed: false,
        score: 0,
        checks: { bursaryAccuracy: false },
        issues: ['Bursary validation service unavailable'],
        corrections: ['Implement bursary validation'],
        confidence: 0
      };
    }
  }

  /**
   * Fallback bursary validation when service not available
   */
  validateBursaryRecommendationsFallback(ragResponse, studentProfile) {
    const checks = {
      bursaryMentioned: false,
      nsfasMentioned: false,
      appropriateGuidance: true
    };

    const issues = [];
    const corrections = [];

    // Check if bursaries are mentioned when appropriate
    if (studentProfile?.constraints?.financial === 'high') {
      if (ragResponse.response.includes('bursary') || ragResponse.response.includes('NSFAS')) {
        checks.bursaryMentioned = true;
      } else {
        issues.push('Missing bursary guidance for financially constrained student');
        corrections.push('Include bursary and financial aid information');
      }
    } else {
      checks.bursaryMentioned = true; // Not required for non-constrained students
    }

    // Check for NSFAS mention for South African students
    if (ragResponse.response.includes('NSFAS')) {
      checks.nsfasMentioned = true;
    }

    return {
      criterion: VALIDATION_CRITERIA.BURSARY_ACCURACY,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 75 : Math.max(50, 75 - (issues.length * 15))
    };
  }

  /**
   * Validates market relevance using job market intelligence
   */
  async validateMarketRelevance(ragResponse, studentProfile) {
    try {
      if (this.jobMarketIntelligence) {
        return await this.jobMarketIntelligence.validateMarketRelevance(
          ragResponse, 
          studentProfile
        );
      } else {
        // Fallback validation if job market intelligence not available
        return this.validateMarketRelevanceFallback(ragResponse, studentProfile);
      }
    } catch (error) {
      console.error('[CAG VALIDATION] Market relevance validation failed:', error);
      return {
        criterion: VALIDATION_CRITERIA.MARKET_RELEVANCE,
        passed: false,
        score: 0,
        checks: { marketRelevance: false },
        issues: ['Market relevance validation service unavailable'],
        corrections: ['Implement job market intelligence'],
        confidence: 0
      };
    }
  }

  /**
   * Fallback market relevance validation when service not available
   */
  validateMarketRelevanceFallback(ragResponse, studentProfile) {
    const checks = {
      careerMentioned: false,
      marketAware: false,
      realistic: true
    };

    const issues = [];
    const corrections = [];

    // Check if careers are mentioned
    if (ragResponse.response.includes('career') || ragResponse.response.includes('field')) {
      checks.careerMentioned = true;
    } else {
      issues.push('No specific career paths mentioned');
      corrections.push('Include specific career recommendations');
    }

    // Check for market awareness
    if (ragResponse.response.includes('demand') || 
        ragResponse.response.includes('opportunity') ||
        ragResponse.response.includes('growth')) {
      checks.marketAware = true;
    } else {
      issues.push('Missing market demand information');
      corrections.push('Include job market insights');
    }

    return {
      criterion: VALIDATION_CRITERIA.MARKET_RELEVANCE,
      passed: Object.values(checks).every(check => check),
      score: this.calculateCriterionScore(checks),
      checks,
      issues,
      corrections,
      confidence: issues.length === 0 ? 70 : Math.max(40, 70 - (issues.length * 15))
    };
  }

  /**
   * Aggregates individual validation results into comprehensive assessment
   */
  aggregateValidationResults(validationResults) {
    const aggregated = {
      criteria: {},
      overallIssues: [],
      overallCorrections: [],
      passedChecks: 0,
      totalChecks: 0,
      averageConfidence: 0
    };

    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const result of validationResults) {
      aggregated.criteria[result.criterion] = result;
      aggregated.overallIssues.push(...result.issues);
      aggregated.overallCorrections.push(...result.corrections);
      
      if (result.passed) aggregated.passedChecks++;
      aggregated.totalChecks++;
      
      if (result.confidence) {
        totalConfidence += result.confidence;
        confidenceCount++;
      }
    }

    aggregated.averageConfidence = confidenceCount > 0 ? 
      Math.round(totalConfidence / confidenceCount) : 0;

    return aggregated;
  }

  /**
   * Generates enhanced response based on validation results
   */
  async generateEnhancedResponse(ragResponse, studentProfile, validationResults) {
    try {
      // If validation passed with high confidence, return original with enhancements
      if (validationResults.passedChecks / validationResults.totalChecks >= 0.8) {
        return this.enhanceValidResponse(ragResponse, validationResults);
      }
      
      // If validation failed, generate corrected response
      return await this.generateCorrectedResponse(ragResponse, studentProfile, validationResults);
      
    } catch (error) {
      console.error('[CAG VALIDATION] Enhanced response generation failed:', error);
      return ragResponse; // Fallback to original
    }
  }

  /**
   * Enhances a valid response with additional context and improvements
   */
  enhanceValidResponse(ragResponse, validationResults) {
    let enhancedResponse = ragResponse.response;

    // Add market intelligence if available
    if (validationResults.criteria[VALIDATION_CRITERIA.MARKET_RELEVANCE]?.passed) {
      enhancedResponse += '\n\n📊 **Market Intelligence**: This career guidance is validated against current job market data.';
    }

    // Add validation confidence score
    enhancedResponse += `\n\n✅ **Quality Assurance**: This guidance has been validated by our Career Assessment Generator with ${validationResults.averageConfidence}% confidence.`;

    return {
      ...ragResponse,
      response: enhancedResponse,
      enhanced: true,
      validationScore: validationResults.averageConfidence
    };
  }

  /**
   * Generates corrected response addressing validation issues
   */
  async generateCorrectedResponse(ragResponse, studentProfile, validationResults) {
    // For now, return original with corrections noted
    // In production, this would call CAG to regenerate with specific corrections
    
    let correctedResponse = ragResponse.response;
    
    // Add correction notices
    if (validationResults.overallIssues.length > 0) {
      correctedResponse += '\n\n⚠️ **Important**: Some information in this guidance requires verification. Please confirm details with official sources.';
    }

    // Add missing safety warnings if needed
    if (!validationResults.criteria[VALIDATION_CRITERIA.SAFETY_COMPLIANCE]?.passed) {
      correctedResponse += '\n\n⚠️ **Verify before you decide**: This is AI-generated advice. Always confirm with school counselors, career advisors, and professionals in your field of interest before making important decisions about your future.';
    }

    return {
      ...ragResponse,
      response: correctedResponse,
      corrected: true,
      validationIssues: validationResults.overallIssues,
      corrections: validationResults.overallCorrections
    };
  }

  /**
   * Calculates overall validation score
   */
  calculateOverallScore(validationResults) {
    const weights = {
      [VALIDATION_CRITERIA.SAFETY_COMPLIANCE]: 0.25,
      [VALIDATION_CRITERIA.MATHEMATICAL_ACCURACY]: 0.20,
      [VALIDATION_CRITERIA.STUDENT_APPROPRIATENESS]: 0.20,
      [VALIDATION_CRITERIA.INFORMATION_CURRENCY]: 0.15,
      [VALIDATION_CRITERIA.COMPLETENESS_CHECK]: 0.10,
      [VALIDATION_CRITERIA.BURSARY_ACCURACY]: 0.05,
      [VALIDATION_CRITERIA.MARKET_RELEVANCE]: 0.05
    };

    let weightedScore = 0;
    let totalWeight = 0;

    for (const [criterion, result] of Object.entries(validationResults.criteria)) {
      const weight = weights[criterion] || 0.1;
      weightedScore += result.score * weight;
      totalWeight += weight;
    }

    return Math.round((weightedScore / totalWeight) * 100) / 100;
  }

  /**
   * Determines validation status based on score and critical issues
   */
  determineValidationStatus(overallScore, validationResults) {
    // Critical safety check
    if (!validationResults.criteria[VALIDATION_CRITERIA.SAFETY_COMPLIANCE]?.passed) {
      return VALIDATION_STATUS.REQUIRES_CORRECTION;
    }

    // Score-based determination
    if (overallScore >= 90) return VALIDATION_STATUS.APPROVED;
    if (overallScore >= 75) return VALIDATION_STATUS.NEEDS_ENHANCEMENT;
    if (overallScore >= 60) return VALIDATION_STATUS.REQUIRES_CORRECTION;
    
    return VALIDATION_STATUS.REJECTED;
  }

  /**
   * Generates improvement recommendations based on validation results
   */
  generateImprovementRecommendations(validationResults) {
    const recommendations = [];

    for (const [criterion, result] of Object.entries(validationResults.criteria)) {
      if (!result.passed) {
        recommendations.push({
          criterion,
          priority: this.getPriorityLevel(criterion),
          issues: result.issues,
          corrections: result.corrections,
          confidence: result.confidence
        });
      }
    }

    return recommendations.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Generates safe fallback response for critical failures
   */
  generateSafeFallbackResponse(studentProfile) {
    const grade = studentProfile?.grade || 'your current grade';
    
    return {
      response: `# Career Guidance - ${grade.toUpperCase()}

Thank you for completing your assessment. Due to a technical issue, we're unable to provide your personalized career recommendations at this time.

## What to do next:

1. **Contact your school counselor** - They can provide immediate career guidance
2. **Visit university websites** - Research programs that interest you
3. **Try again later** - Our system will be restored shortly

## Important Resources:

- **NSFAS Applications**: www.nsfas.org.za (Deadline: December 31, 2025)
- **University Applications**: Check individual university websites
- **Career Information**: www.careerhelp.org.za

⚠️ **Always verify career information with official sources before making decisions.**

We apologize for the inconvenience and are working to restore full service.`,
      
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper methods
   */
  
  generateValidationId() {
    return `cag_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateCriterionScore(checks) {
    const passedChecks = Object.values(checks).filter(check => check).length;
    const totalChecks = Object.values(checks).length;
    return totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
  }

  getPriorityLevel(criterion) {
    const priorities = {
      [VALIDATION_CRITERIA.SAFETY_COMPLIANCE]: 'CRITICAL',
      [VALIDATION_CRITERIA.MATHEMATICAL_ACCURACY]: 'HIGH',
      [VALIDATION_CRITERIA.STUDENT_APPROPRIATENESS]: 'HIGH',
      [VALIDATION_CRITERIA.INFORMATION_CURRENCY]: 'MEDIUM',
      [VALIDATION_CRITERIA.COMPLETENESS_CHECK]: 'MEDIUM',
      [VALIDATION_CRITERIA.BURSARY_ACCURACY]: 'LOW',
      [VALIDATION_CRITERIA.MARKET_RELEVANCE]: 'LOW'
    };
    return priorities[criterion] || 'MEDIUM';
  }

  getPriorityValue(priority) {
    const values = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return values[priority] || 2;
  }

  storeValidationHistory(validationResult) {
    // Store for learning and improvement
    this.validationHistory.set(validationResult.validationId, {
      timestamp: validationResult.timestamp,
      status: validationResult.status,
      score: validationResult.overallScore,
      studentGrade: validationResult.studentProfile?.grade,
      processingTime: validationResult.processingTime
    });

    // Keep only last 1000 validations in memory
    if (this.validationHistory.size > 1000) {
      const firstKey = this.validationHistory.keys().next().value;
      this.validationHistory.delete(firstKey);
    }
  }
}

export default CAGValidationService;