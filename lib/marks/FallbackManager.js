/**
 * FallbackManager - Graceful fallback system for mark collection
 * 
 * This class provides fallback mechanisms when students don't know their exact marks
 * or when technical issues prevent normal mark collection. It ensures the assessment
 * can continue while providing appropriate messaging about data limitations.
 * 
 * Requirements addressed: 9.1, 9.2, 9.3
 */

export class FallbackManager {
  constructor() {
    this.fallbackOptions = {
      DONT_KNOW: 'dont_know',
      ESTIMATE: 'estimate',
      SKIP: 'skip',
      TECHNICAL_ISSUE: 'technical_issue'
    };
    
    this.estimateRanges = {
      'excellent': { min: 80, max: 100, display: '80-100%' },
      'good': { min: 70, max: 79, display: '70-79%' },
      'average': { min: 60, max: 69, display: '60-69%' },
      'below_average': { min: 50, max: 59, display: '50-59%' },
      'struggling': { min: 30, max: 49, display: '30-49%' },
      'very_low': { min: 0, max: 29, display: 'Below 30%' }
    };
  }

  /**
   * Create fallback mark data for unknown marks
   * @param {string} subjectId - Subject identifier
   * @param {string} fallbackType - Type of fallback
   * @param {Object} options - Additional options
   * @returns {Object} Fallback mark data
   */
  createFallbackMark(subjectId, fallbackType, options = {}) {
    const fallbackData = {
      subjectId,
      fallbackType,
      isFallback: true,
      timestamp: new Date().toISOString(),
      validationState: 'fallback',
      canProgress: true
    };

    switch (fallbackType) {
      case this.fallbackOptions.DONT_KNOW:
        return this.createDontKnowFallback(fallbackData, options);
      
      case this.fallbackOptions.ESTIMATE:
        return this.createEstimateFallback(fallbackData, options);
      
      case this.fallbackOptions.SKIP:
        return this.createSkipFallback(fallbackData, options);
      
      case this.fallbackOptions.TECHNICAL_ISSUE:
        return this.createTechnicalIssueFallback(fallbackData, options);
      
      default:
        throw new Error(`Unknown fallback type: ${fallbackType}`);
    }
  }

  /**
   * Create "Don't know" fallback
   * @param {Object} baseData - Base fallback data
   * @param {Object} options - Options
   * @returns {Object} Don't know fallback data
   */
  createDontKnowFallback(baseData, options) {
    return {
      ...baseData,
      displayValue: "Don't know",
      normalizedValue: null,
      estimatedRange: null,
      message: "You indicated you don't know this mark. The assessment will continue with general guidance.",
      limitations: [
        "Career suggestions will be based on subject preferences only",
        "APS calculation not available",
        "University admission guidance will be general"
      ],
      suggestedActions: [
        "Check your latest report card or test results",
        "Ask your teacher for your current standing",
        "You can update this later if you find your mark"
      ]
    };
  }

  /**
   * Create estimate fallback
   * @param {Object} baseData - Base fallback data
   * @param {Object} options - Options including estimateLevel
   * @returns {Object} Estimate fallback data
   */
  createEstimateFallback(baseData, options) {
    const { estimateLevel } = options;
    
    if (!estimateLevel || !this.estimateRanges[estimateLevel]) {
      throw new Error(`Invalid estimate level: ${estimateLevel}`);
    }

    const range = this.estimateRanges[estimateLevel];
    const midpoint = Math.round((range.min + range.max) / 2);

    return {
      ...baseData,
      displayValue: `~${range.display}`,
      normalizedValue: midpoint,
      estimatedRange: range,
      estimateLevel,
      isEstimate: true,
      message: `You estimated your mark as ${range.display}. This will be used for approximate guidance.`,
      limitations: [
        "Guidance based on estimated marks may not be fully accurate",
        "APS calculation will be approximate",
        "Consider getting exact marks for better guidance"
      ],
      suggestedActions: [
        "Try to get your exact mark when possible",
        "Use this as a starting point for career exploration",
        "Update with exact marks for more precise guidance"
      ]
    };
  }

  /**
   * Create skip fallback
   * @param {Object} baseData - Base fallback data
   * @param {Object} options - Options
   * @returns {Object} Skip fallback data
   */
  createSkipFallback(baseData, options) {
    return {
      ...baseData,
      displayValue: "Skipped",
      normalizedValue: null,
      estimatedRange: null,
      message: "You chose to skip this mark. The assessment will focus on other subjects.",
      limitations: [
        "This subject won't be included in APS calculation",
        "Career guidance will focus on other subjects",
        "Some career paths may not be fully evaluated"
      ],
      suggestedActions: [
        "Consider adding this mark later if it's important for your career goals",
        "Focus on the subjects you did provide marks for",
        "You can always return to add more marks"
      ]
    };
  }

  /**
   * Create technical issue fallback
   * @param {Object} baseData - Base fallback data
   * @param {Object} options - Options including errorType
   * @returns {Object} Technical issue fallback data
   */
  createTechnicalIssueFallback(baseData, options) {
    const { errorType = 'unknown' } = options;

    return {
      ...baseData,
      displayValue: "Technical issue",
      normalizedValue: null,
      estimatedRange: null,
      errorType,
      message: "There was a technical issue processing this mark. You can continue without it.",
      limitations: [
        "This subject won't be included in calculations",
        "Guidance will be based on other available data",
        "Some features may be limited"
      ],
      suggestedActions: [
        "Try refreshing the page and entering the mark again",
        "Continue with other subjects for now",
        "Contact support if the issue persists"
      ],
      technicalDetails: {
        timestamp: new Date().toISOString(),
        errorType,
        canRetry: true
      }
    };
  }

  /**
   * Check if assessment can progress with current fallback data
   * @param {Object} marks - All marks including fallbacks
   * @param {Array} selectedSubjects - Selected subjects
   * @returns {Object} Progression validation result
   */
  validateProgression(marks, selectedSubjects) {
    const totalSubjects = selectedSubjects.length;
    const validMarks = Object.values(marks).filter(mark => 
      mark && (mark.validationState === 'valid' || mark.validationState === 'fallback')
    ).length;
    
    const exactMarks = Object.values(marks).filter(mark => 
      mark && mark.validationState === 'valid' && !mark.isFallback
    ).length;
    
    const fallbackMarks = Object.values(marks).filter(mark => 
      mark && mark.isFallback
    ).length;

    const progressionResult = {
      canProgress: validMarks >= Math.min(2, totalSubjects), // Need at least 2 subjects or all selected
      totalSubjects,
      validMarks,
      exactMarks,
      fallbackMarks,
      completionPercentage: Math.round((validMarks / totalSubjects) * 100),
      dataQuality: this.assessDataQuality(exactMarks, fallbackMarks, totalSubjects),
      limitations: [],
      recommendations: []
    };

    // Add limitations based on fallback usage
    if (fallbackMarks > 0) {
      progressionResult.limitations.push(
        `${fallbackMarks} subject${fallbackMarks > 1 ? 's' : ''} using estimated or unknown marks`
      );
      
      if (fallbackMarks > exactMarks) {
        progressionResult.limitations.push("More estimated than exact marks - guidance will be general");
      }
    }

    // Add recommendations
    if (exactMarks < totalSubjects / 2) {
      progressionResult.recommendations.push("Try to provide exact marks for at least half your subjects");
    }
    
    if (progressionResult.canProgress && fallbackMarks > 0) {
      progressionResult.recommendations.push("You can continue now and add exact marks later for better guidance");
    }

    return progressionResult;
  }

  /**
   * Assess data quality based on exact vs fallback marks
   * @param {number} exactMarks - Number of exact marks
   * @param {number} fallbackMarks - Number of fallback marks
   * @param {number} totalSubjects - Total subjects
   * @returns {string} Data quality assessment
   */
  assessDataQuality(exactMarks, fallbackMarks, totalSubjects) {
    const exactPercentage = (exactMarks / totalSubjects) * 100;
    
    if (exactPercentage >= 80) return 'high';
    if (exactPercentage >= 60) return 'good';
    if (exactPercentage >= 40) return 'moderate';
    if (exactPercentage >= 20) return 'limited';
    return 'very_limited';
  }

  /**
   * Generate user-friendly message about data limitations
   * @param {Object} progressionResult - Result from validateProgression
   * @returns {Object} User message with guidance
   */
  generateLimitationsMessage(progressionResult) {
    const { dataQuality, exactMarks, fallbackMarks, totalSubjects } = progressionResult;
    
    const messages = {
      high: {
        title: "Excellent data quality! 🎯",
        message: "You've provided exact marks for most subjects. Your career guidance will be highly accurate.",
        color: "green"
      },
      good: {
        title: "Good data quality ✅",
        message: "You have enough exact marks for reliable career guidance. Some suggestions may be general.",
        color: "blue"
      },
      moderate: {
        title: "Moderate data quality ⚠️",
        message: "Career guidance will be somewhat general due to limited exact marks. Consider adding more when possible.",
        color: "amber"
      },
      limited: {
        title: "Limited data quality 📊",
        message: "Guidance will be quite general. Try to add exact marks for better personalized advice.",
        color: "orange"
      },
      very_limited: {
        title: "Very limited data 🔍",
        message: "Guidance will be very general. We recommend getting exact marks for meaningful career advice.",
        color: "red"
      }
    };

    const baseMessage = messages[dataQuality];
    
    return {
      ...baseMessage,
      details: {
        exactMarks,
        fallbackMarks,
        totalSubjects,
        dataQuality
      },
      actionable: dataQuality !== 'high',
      suggestions: progressionResult.recommendations
    };
  }

  /**
   * Get fallback options for UI display
   * @param {string} subjectName - Name of the subject
   * @returns {Array} Available fallback options
   */
  getFallbackOptions(subjectName) {
    return [
      {
        id: this.fallbackOptions.DONT_KNOW,
        label: "I don't know my mark",
        description: `I don't know my current ${subjectName} mark`,
        icon: "❓",
        recommended: false
      },
      {
        id: this.fallbackOptions.ESTIMATE,
        label: "I can estimate",
        description: `I can give a rough estimate of my ${subjectName} performance`,
        icon: "📊",
        recommended: true,
        requiresEstimateLevel: true
      },
      {
        id: this.fallbackOptions.SKIP,
        label: "Skip this subject",
        description: `Continue without ${subjectName} mark`,
        icon: "⏭️",
        recommended: false
      }
    ];
  }

  /**
   * Get estimate level options for UI
   * @returns {Array} Estimate level options
   */
  getEstimateLevelOptions() {
    return [
      {
        id: 'excellent',
        label: 'Excellent (80-100%)',
        description: 'I consistently get high marks in this subject',
        range: this.estimateRanges.excellent
      },
      {
        id: 'good',
        label: 'Good (70-79%)',
        description: 'I usually do well in this subject',
        range: this.estimateRanges.good
      },
      {
        id: 'average',
        label: 'Average (60-69%)',
        description: 'I get average marks in this subject',
        range: this.estimateRanges.average
      },
      {
        id: 'below_average',
        label: 'Below Average (50-59%)',
        description: 'I struggle a bit with this subject',
        range: this.estimateRanges.below_average
      },
      {
        id: 'struggling',
        label: 'Struggling (30-49%)',
        description: 'This subject is quite challenging for me',
        range: this.estimateRanges.struggling
      },
      {
        id: 'very_low',
        label: 'Very Low (Below 30%)',
        description: 'I find this subject very difficult',
        range: this.estimateRanges.very_low
      }
    ];
  }

  /**
   * Convert fallback marks to format suitable for APS calculation
   * @param {Object} marks - All marks including fallbacks
   * @returns {Object} Processed marks for APS calculation
   */
  processMarksForAPS(marks) {
    const processedMarks = {};
    const warnings = [];
    
    Object.entries(marks).forEach(([subjectId, markData]) => {
      if (!markData) return;
      
      if (markData.validationState === 'valid' && !markData.isFallback) {
        // Use exact marks as-is
        processedMarks[subjectId] = markData;
      } else if (markData.isFallback && markData.normalizedValue !== null) {
        // Use fallback marks with warnings
        processedMarks[subjectId] = {
          ...markData,
          isEstimated: true
        };
        warnings.push(`${subjectId}: Using estimated mark (${markData.displayValue})`);
      }
      // Skip marks without normalized values (don't know, skip, technical issues)
    });
    
    return {
      marks: processedMarks,
      warnings,
      hasEstimates: warnings.length > 0,
      exactMarkCount: Object.values(processedMarks).filter(m => !m.isFallback).length,
      estimateCount: warnings.length
    };
  }
}