/**
 * PersonalizationValidator - Response quality analysis and scoring
 * 
 * Validates that generated responses properly reflect student questionnaire data,
 * addressing the core issue where 67% of student input was ignored.
 * 
 * Key Features:
 * - Motivation alignment checking against response content
 * - Concerns addressing validation with keyword analysis
 * - Career interest acknowledgment verification
 * - Comprehensive personalization scoring (target: 80%+)
 */

class PersonalizationValidator {
  constructor() {
    this.scoringWeights = {
      motivation: 0.30,      // 30% - Student's intrinsic motivations
      concerns: 0.25,        // 25% - Addressing specific worries
      careerInterests: 0.25, // 25% - Career interest acknowledgment
      academic: 0.20         // 20% - Academic performance integration
    };
    
    this.qualityThresholds = {
      excellent: 90,
      good: 80,
      moderate: 60,
      poor: 40
    };
  }

  /**
   * Validate complete response against student profile
   * @param {string} response - Generated LLM response
   * @param {Object} studentProfile - Student profile from StudentProfileBuilder
   * @returns {Object} Comprehensive validation results
   */
  validateResponse(response, studentProfile) {
    try {
      const validation = {
        motivationReflected: this.checkMotivationAlignment(response, studentProfile),
        concernsAddressed: this.checkConcernsHandling(response, studentProfile),
        careerInterestsAcknowledged: this.checkCareerAlignment(response, studentProfile),
        academicIntegration: this.checkAcademicIntegration(response, studentProfile),
        personalizationScore: 0,
        qualityLevel: 'poor',
        detailedAnalysis: {},
        recommendations: []
      };

      // Calculate overall personalization score
      validation.personalizationScore = this.calculatePersonalizationScore(validation);
      validation.qualityLevel = this.determineQualityLevel(validation.personalizationScore);
      validation.detailedAnalysis = this.generateDetailedAnalysis(validation, studentProfile);
      validation.recommendations = this.generateRecommendations(validation, studentProfile);

      return validation;
    } catch (error) {
      console.error('PersonalizationValidator: Error validating response:', error);
      return this.getErrorValidation(error);
    }
  }

  /**
   * Check if response reflects student's stated motivations
   */
  checkMotivationAlignment(response, studentProfile) {
    if (!studentProfile.motivations.hasMotivation) {
      return { score: 100, reason: 'No motivation data to validate', applicable: false };
    }

    const motivation = studentProfile.motivations;
    const responseLower = response.toLowerCase();
    const motivationLower = motivation.rawText.toLowerCase();

    let score = 0;
    const analysis = {
      themeMatches: [],
      keywordMatches: [],
      alignmentMatches: [],
      directReferences: 0
    };

    // Check for theme alignment
    motivation.extractedThemes.forEach(theme => {
      if (this.checkThemeInResponse(theme, responseLower)) {
        analysis.themeMatches.push(theme);
        score += 20;
      }
    });

    // Check for career field alignment
    motivation.careerAlignment.forEach(field => {
      if (responseLower.includes(field.toLowerCase())) {
        analysis.alignmentMatches.push(field);
        score += 15;
      }
    });

    // Check for direct motivation keywords
    const motivationKeywords = this.extractKeywords(motivationLower);
    motivationKeywords.forEach(keyword => {
      if (responseLower.includes(keyword) && keyword.length > 3) {
        analysis.keywordMatches.push(keyword);
        score += 10;
      }
    });

    // Check for direct references to motivation
    const motivationPhrases = motivationLower.split('.').map(s => s.trim()).filter(s => s.length > 10);
    motivationPhrases.forEach(phrase => {
      if (this.findSimilarPhrase(phrase, responseLower)) {
        analysis.directReferences++;
        score += 25;
      }
    });

    return {
      score: Math.min(100, score),
      analysis,
      applicable: true,
      reason: `Found ${analysis.themeMatches.length} theme matches, ${analysis.keywordMatches.length} keyword matches, ${analysis.directReferences} direct references`
    };
  }

  /**
   * Check if response addresses student's specific concerns
   */
  checkConcernsHandling(response, studentProfile) {
    if (!studentProfile.concerns.hasConcerns) {
      return { score: 100, reason: 'No concerns data to validate', applicable: false };
    }

    const concerns = studentProfile.concerns;
    const responseLower = response.toLowerCase();
    const concernsLower = concerns.rawText.toLowerCase();

    let score = 0;
    const analysis = {
      categoriesAddressed: [],
      strategiesProvided: [],
      keywordMatches: [],
      directAddressing: 0
    };

    // Check if concern categories are addressed
    concerns.concernCategories.forEach(category => {
      if (this.checkConcernCategoryAddressed(category, responseLower)) {
        analysis.categoriesAddressed.push(category);
        score += 25;
      }
    });

    // Check if addressing strategies are provided
    concerns.addressingStrategies.forEach(strategy => {
      if (this.checkStrategyInResponse(strategy, responseLower)) {
        analysis.strategiesProvided.push(strategy);
        score += 20;
      }
    });

    // Check for concern keywords
    const concernKeywords = this.extractKeywords(concernsLower);
    concernKeywords.forEach(keyword => {
      if (responseLower.includes(keyword) && keyword.length > 3) {
        analysis.keywordMatches.push(keyword);
        score += 10;
      }
    });

    // Check for direct concern addressing
    const concernPhrases = concernsLower.split('.').map(s => s.trim()).filter(s => s.length > 10);
    concernPhrases.forEach(phrase => {
      if (this.findSimilarPhrase(phrase, responseLower)) {
        analysis.directAddressing++;
        score += 30;
      }
    });

    return {
      score: Math.min(100, score),
      analysis,
      applicable: true,
      reason: `Addressed ${analysis.categoriesAddressed.length} concern categories, provided ${analysis.strategiesProvided.length} strategies`
    };
  }

  /**
   * Check if response acknowledges student's career interests
   */
  checkCareerAlignment(response, studentProfile) {
    if (!studentProfile.careerInterests.hasCareerInterests) {
      return { score: 100, reason: 'No career interests to validate', applicable: false };
    }

    const careerInterests = studentProfile.careerInterests;
    const responseLower = response.toLowerCase();

    let score = 0;
    const analysis = {
      specificCareersAcknowledged: [],
      careerFieldsMatched: [],
      feasibilityAnalysis: false,
      directAcknowledgment: false
    };

    // Check for specific career acknowledgment
    careerInterests.specificCareers.forEach(career => {
      if (responseLower.includes(career.toLowerCase())) {
        analysis.specificCareersAcknowledged.push(career);
        score += 30;
      }
    });

    // Check for career field matches
    careerInterests.careerFields.forEach(field => {
      if (responseLower.includes(field.toLowerCase())) {
        analysis.careerFieldsMatched.push(field);
        score += 20;
      }
    });

    // Check for feasibility analysis
    const feasibilityKeywords = ['feasible', 'realistic', 'achievable', 'requirements', 'marks needed', 'aps score'];
    if (feasibilityKeywords.some(keyword => responseLower.includes(keyword))) {
      analysis.feasibilityAnalysis = true;
      score += 25;
    }

    // Check for direct acknowledgment of career interests
    const careerText = careerInterests.rawText.toLowerCase();
    if (this.findSimilarPhrase(careerText, responseLower)) {
      analysis.directAcknowledgment = true;
      score += 25;
    }

    return {
      score: Math.min(100, score),
      analysis,
      applicable: true,
      reason: `Acknowledged ${analysis.specificCareersAcknowledged.length} specific careers, ${analysis.careerFieldsMatched.length} career fields`
    };
  }

  /**
   * Check if response integrates academic performance data
   */
  checkAcademicIntegration(response, studentProfile) {
    const academic = studentProfile.academic;
    const responseLower = response.toLowerCase();

    let score = 0;
    const analysis = {
      marksReferenced: false,
      apsScoreUsed: false,
      subjectsAcknowledged: [],
      improvementTargets: false
    };

    // Check if marks are referenced
    if (academic.hasMarks) {
      const markKeywords = ['marks', 'percentage', '%', 'score', 'grade'];
      if (markKeywords.some(keyword => responseLower.includes(keyword))) {
        analysis.marksReferenced = true;
        score += 25;
      }

      // Check if specific subjects are acknowledged
      academic.currentMarks.forEach(mark => {
        if (responseLower.includes(mark.subject.toLowerCase())) {
          analysis.subjectsAcknowledged.push(mark.subject);
          score += 10;
        }
      });
    }

    // Check if APS score is used
    if (academic.apsData && responseLower.includes('aps')) {
      analysis.apsScoreUsed = true;
      score += 25;
    }

    // Check for improvement targets
    const improvementKeywords = ['improve', 'increase', 'work on', 'focus on', 'strengthen'];
    if (improvementKeywords.some(keyword => responseLower.includes(keyword))) {
      analysis.improvementTargets = true;
      score += 20;
    }

    // Base score for having academic context
    if (academic.enjoyedSubjects.length > 0) {
      score += 20;
    }

    return {
      score: Math.min(100, score),
      analysis,
      applicable: true,
      reason: `Academic integration: marks ${analysis.marksReferenced ? 'referenced' : 'not referenced'}, ${analysis.subjectsAcknowledged.length} subjects acknowledged`
    };
  }

  /**
   * Calculate overall personalization score
   */
  calculatePersonalizationScore(validation) {
    let totalScore = 0;
    let totalWeight = 0;

    // Weight scores based on applicable sections
    if (validation.motivationReflected.applicable) {
      totalScore += validation.motivationReflected.score * this.scoringWeights.motivation;
      totalWeight += this.scoringWeights.motivation;
    }

    if (validation.concernsAddressed.applicable) {
      totalScore += validation.concernsAddressed.score * this.scoringWeights.concerns;
      totalWeight += this.scoringWeights.concerns;
    }

    if (validation.careerInterestsAcknowledged.applicable) {
      totalScore += validation.careerInterestsAcknowledged.score * this.scoringWeights.careerInterests;
      totalWeight += this.scoringWeights.careerInterests;
    }

    if (validation.academicIntegration.applicable) {
      totalScore += validation.academicIntegration.score * this.scoringWeights.academic;
      totalWeight += this.scoringWeights.academic;
    }

    // Normalize score based on available data
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Determine quality level based on score
   */
  determineQualityLevel(score) {
    if (score >= this.qualityThresholds.excellent) return 'excellent';
    if (score >= this.qualityThresholds.good) return 'good';
    if (score >= this.qualityThresholds.moderate) return 'moderate';
    return 'poor';
  }

  /**
   * Generate detailed analysis report
   */
  generateDetailedAnalysis(validation, studentProfile) {
    return {
      dataUtilization: {
        motivationUsed: validation.motivationReflected.applicable && validation.motivationReflected.score > 50,
        concernsAddressed: validation.concernsAddressed.applicable && validation.concernsAddressed.score > 50,
        careerInterestsAcknowledged: validation.careerInterestsAcknowledged.applicable && validation.careerInterestsAcknowledged.score > 50,
        academicDataIntegrated: validation.academicIntegration.score > 50
      },
      strengths: this.identifyStrengths(validation),
      weaknesses: this.identifyWeaknesses(validation),
      improvementAreas: this.identifyImprovementAreas(validation, studentProfile)
    };
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations(validation, studentProfile) {
    const recommendations = [];

    if (validation.motivationReflected.applicable && validation.motivationReflected.score < 70) {
      recommendations.push({
        area: 'motivation',
        issue: 'Student motivations not adequately reflected',
        suggestion: 'Ensure response explicitly connects career recommendations to student\'s stated motivations'
      });
    }

    if (validation.concernsAddressed.applicable && validation.concernsAddressed.score < 70) {
      recommendations.push({
        area: 'concerns',
        issue: 'Student concerns not properly addressed',
        suggestion: 'Provide specific advice and reassurance for each concern mentioned by the student'
      });
    }

    if (validation.careerInterestsAcknowledged.score < 80) {
      recommendations.push({
        area: 'career_interests',
        issue: 'Career interests not sufficiently acknowledged',
        suggestion: 'Directly reference and analyze feasibility of student\'s stated career interests'
      });
    }

    if (validation.academicIntegration.score < 60) {
      recommendations.push({
        area: 'academic',
        issue: 'Academic performance data underutilized',
        suggestion: 'Include specific mark-based guidance and improvement targets'
      });
    }

    return recommendations;
  }

  // Helper Methods

  checkThemeInResponse(theme, response) {
    const themeKeywords = {
      'helping others': ['help', 'assist', 'support', 'care', 'serve', 'community'],
      'creativity': ['creative', 'design', 'art', 'innovative', 'original'],
      'problem solving': ['solve', 'problem', 'solution', 'analytical', 'logical'],
      'leadership': ['lead', 'manage', 'direct', 'guide', 'influence'],
      'learning': ['learn', 'study', 'research', 'knowledge', 'education'],
      'financial security': ['financial', 'salary', 'income', 'stable', 'security'],
      'making a difference': ['difference', 'impact', 'change', 'contribute', 'meaningful']
    };

    const keywords = themeKeywords[theme] || [theme];
    return keywords.some(keyword => response.includes(keyword));
  }

  checkConcernCategoryAddressed(category, response) {
    const categoryKeywords = {
      'academic performance': ['study', 'marks', 'grades', 'academic', 'performance', 'improve'],
      'financial constraints': ['cost', 'afford', 'bursary', 'funding', 'financial', 'money'],
      'career uncertainty': ['guidance', 'direction', 'clarity', 'options', 'explore'],
      'family pressure': ['family', 'support', 'understanding', 'communication'],
      'competition': ['competitive', 'alternative', 'backup', 'options'],
      'time management': ['time', 'balance', 'organize', 'schedule', 'manage']
    };

    const keywords = categoryKeywords[category] || [category];
    return keywords.some(keyword => response.includes(keyword));
  }

  checkStrategyInResponse(strategy, response) {
    // Check if the strategy or similar advice appears in response
    const strategyKeywords = strategy.toLowerCase().split(' ').filter(word => word.length > 4);
    return strategyKeywords.some(keyword => response.includes(keyword));
  }

  extractKeywords(text) {
    // Extract meaningful keywords (longer than 3 characters, not common words)
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'now', 'air', 'any', 'may', 'say'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  findSimilarPhrase(phrase, text) {
    // Simple similarity check - looks for partial matches
    const phraseWords = phrase.split(' ').filter(word => word.length > 3);
    const matchCount = phraseWords.filter(word => text.includes(word)).length;
    return matchCount >= Math.ceil(phraseWords.length * 0.6); // 60% word match threshold
  }

  identifyStrengths(validation) {
    const strengths = [];
    
    if (validation.motivationReflected.score >= 80) strengths.push('Excellent motivation reflection');
    if (validation.concernsAddressed.score >= 80) strengths.push('Strong concern addressing');
    if (validation.careerInterestsAcknowledged.score >= 80) strengths.push('Clear career interest acknowledgment');
    if (validation.academicIntegration.score >= 80) strengths.push('Good academic data integration');
    
    return strengths;
  }

  identifyWeaknesses(validation) {
    const weaknesses = [];
    
    if (validation.motivationReflected.applicable && validation.motivationReflected.score < 50) {
      weaknesses.push('Poor motivation reflection');
    }
    if (validation.concernsAddressed.applicable && validation.concernsAddressed.score < 50) {
      weaknesses.push('Inadequate concern addressing');
    }
    if (validation.careerInterestsAcknowledged.score < 50) {
      weaknesses.push('Weak career interest acknowledgment');
    }
    if (validation.academicIntegration.score < 50) {
      weaknesses.push('Limited academic data use');
    }
    
    return weaknesses;
  }

  identifyImprovementAreas(validation, studentProfile) {
    const areas = [];
    
    if (studentProfile.motivations.hasMotivation && validation.motivationReflected.score < 70) {
      areas.push('Better integration of student motivations');
    }
    if (studentProfile.concerns.hasConcerns && validation.concernsAddressed.score < 70) {
      areas.push('More specific concern addressing');
    }
    if (studentProfile.academic.hasMarks && validation.academicIntegration.score < 70) {
      areas.push('Enhanced academic performance guidance');
    }
    
    return areas;
  }

  getErrorValidation(error) {
    return {
      motivationReflected: { score: 0, reason: 'Validation error', applicable: false },
      concernsAddressed: { score: 0, reason: 'Validation error', applicable: false },
      careerInterestsAcknowledged: { score: 0, reason: 'Validation error', applicable: false },
      academicIntegration: { score: 0, reason: 'Validation error', applicable: false },
      personalizationScore: 0,
      qualityLevel: 'error',
      error: error.message,
      detailedAnalysis: {},
      recommendations: []
    };
  }
}

module.exports = PersonalizationValidator;