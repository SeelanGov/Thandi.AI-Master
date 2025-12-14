/**
 * APSCalculator - South African APS (Admission Point Score) calculation system
 * 
 * This class implements the official South African university admission point
 * calculation system, with university requirement mapping and improvement
 * scenario generation.
 * 
 * Requirements addressed: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3, 7.4
 */

export class APSCalculator {
  constructor() {
    // APS conversion table (percentage to points)
    this.apsConversionTable = {
      80: 7, 70: 6, 60: 5, 50: 4, 40: 3, 30: 2, 0: 1
    };
    
    // Core subjects required for APS calculation
    this.coreSubjects = [
      'mathematics', 'math_literacy', 'english', 'afrikaans', 
      'life_orientation', 'physical_science', 'life_sciences'
    ];
    
    // University APS requirements by field
    this.universityRequirements = {
      medicine: {
        typical: 42,
        competitive: 45,
        minimum: 40,
        requiredSubjects: ['mathematics', 'physical_science', 'life_sciences']
      },
      engineering: {
        typical: 35,
        competitive: 40,
        minimum: 32,
        requiredSubjects: ['mathematics', 'physical_science']
      },
      commerce: {
        typical: 30,
        competitive: 35,
        minimum: 26,
        requiredSubjects: ['mathematics', 'math_literacy']
      },
      law: {
        typical: 32,
        competitive: 38,
        minimum: 28,
        requiredSubjects: ['english']
      },
      education: {
        typical: 26,
        competitive: 30,
        minimum: 24,
        requiredSubjects: ['english']
      },
      humanities: {
        typical: 28,
        competitive: 32,
        minimum: 24,
        requiredSubjects: ['english']
      },
      sciences: {
        typical: 32,
        competitive: 36,
        minimum: 28,
        requiredSubjects: ['mathematics', 'physical_science']
      },
      technology: {
        typical: 28,
        competitive: 32,
        minimum: 25,
        requiredSubjects: ['mathematics', 'physical_science']
      }
    };
  }

  /**
   * Calculate APS score from student marks
   * @param {Object} marks - Object with subject: markData pairs
   * @param {number} grade - Student's grade (10, 11, or 12)
   * @param {string} curriculumFramework - 'CAPS' or 'IEB'
   * @returns {Object} APS calculation result
   */
  calculateAPS(marks, grade, curriculumFramework = 'CAPS') {
    try {
      const validMarks = this.validateMarks(marks);
      const apsBreakdown = {};
      let totalScore = 0;
      let subjectCount = 0;
      
      // Calculate APS points for each subject
      Object.entries(validMarks).forEach(([subject, markData]) => {
        if (markData && typeof markData.normalizedValue === 'number') {
          const apsPoints = this.convertToAPS(markData.normalizedValue);
          apsBreakdown[subject] = {
            mark: markData.normalizedValue,
            apsPoints: apsPoints,
            excludedFromAPS: this.isExcludedFromAPS(subject)
          };
          
          // Only count towards total if not excluded
          if (!this.isExcludedFromAPS(subject)) {
            totalScore += apsPoints;
            subjectCount++;
          }
        }
      });
      
      // Calculate maximum possible score
      const maxPossible = subjectCount * 7;
      
      // Get university requirements for context
      const universityRequirements = this.getUniversityRequirementsContext(totalScore);
      
      // Generate improvement scenarios
      const improvementScenarios = this.generateImprovementScenarios(validMarks, totalScore);
      
      return {
        totalScore,
        maxPossible,
        subjectCount,
        breakdown: apsBreakdown,
        universityRequirements,
        improvementScenarios,
        gradeContext: this.getGradeContext(grade, totalScore),
        calculatedAt: new Date().toISOString(),
        isValid: subjectCount >= 6 // Need at least 6 subjects for valid APS
      };
    } catch (error) {
      return {
        totalScore: 0,
        maxPossible: 0,
        subjectCount: 0,
        breakdown: {},
        universityRequirements: {},
        improvementScenarios: [],
        error: error.message,
        isValid: false
      };
    }
  }

  /**
   * Convert percentage mark to APS points
   * @param {number} percentage - Mark as percentage (0-100)
   * @returns {number} APS points (1-7)
   */
  convertToAPS(percentage) {
    if (percentage >= 80) return 7;
    if (percentage >= 70) return 6;
    if (percentage >= 60) return 5;
    if (percentage >= 50) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 30) return 2;
    return 1;
  }

  /**
   * Check if subject is excluded from APS calculation
   * @param {string} subject - Subject identifier
   * @returns {boolean} True if excluded
   */
  isExcludedFromAPS(subject) {
    // Life Orientation is typically excluded from APS calculation
    return subject.toLowerCase().includes('life_orientation') || 
           subject.toLowerCase().includes('lo');
  }

  /**
   * Validate marks data
   * @param {Object} marks - Marks object to validate
   * @returns {Object} Validated marks
   */
  validateMarks(marks) {
    if (!marks || typeof marks !== 'object') {
      throw new Error('Invalid marks data provided');
    }
    
    const validMarks = {};
    let validSubjectCount = 0;
    
    Object.entries(marks).forEach(([subject, markData]) => {
      if (markData && 
          typeof markData.normalizedValue === 'number' && 
          markData.normalizedValue >= 0 && 
          markData.normalizedValue <= 100) {
        validMarks[subject] = markData;
        validSubjectCount++;
      }
    });
    
    if (validSubjectCount < 6) {
      throw new Error('At least 6 valid subject marks required for APS calculation');
    }
    
    return validMarks;
  }

  /**
   * Get university requirements context based on current APS
   * @param {number} currentAPS - Current APS score
   * @returns {Object} University requirements context
   */
  getUniversityRequirementsContext(currentAPS) {
    const context = {};
    
    Object.entries(this.universityRequirements).forEach(([field, requirements]) => {
      context[field] = {
        ...requirements,
        accessible: currentAPS >= requirements.minimum,
        competitive: currentAPS >= requirements.competitive,
        gap: Math.max(0, requirements.typical - currentAPS)
      };
    });
    
    return context;
  }

  /**
   * Generate improvement scenarios
   * @param {Object} marks - Current marks
   * @param {number} currentAPS - Current APS score
   * @returns {Array} Array of improvement scenarios
   */
  generateImprovementScenarios(marks, currentAPS) {
    const scenarios = [];
    
    // Find subjects with improvement potential
    Object.entries(marks).forEach(([subject, markData]) => {
      if (markData && markData.normalizedValue < 80) {
        const currentMark = markData.normalizedValue;
        const currentAPS_points = this.convertToAPS(currentMark);
        
        // Calculate potential improvements
        const improvements = [
          { targetMark: Math.min(100, currentMark + 10), effort: 'moderate' },
          { targetMark: Math.min(100, currentMark + 20), effort: 'significant' },
          { targetMark: 80, effort: currentMark < 60 ? 'major' : 'moderate' }
        ];
        
        improvements.forEach(improvement => {
          if (improvement.targetMark > currentMark) {
            const newAPSPoints = this.convertToAPS(improvement.targetMark);
            const apsGain = newAPSPoints - currentAPS_points;
            
            if (apsGain > 0) {
              scenarios.push({
                subject,
                currentMark,
                targetMark: improvement.targetMark,
                markImprovement: improvement.targetMark - currentMark,
                apsGain,
                newTotalAPS: currentAPS + apsGain,
                effort: improvement.effort,
                timeframe: this.estimateTimeframe(improvement.targetMark - currentMark),
                description: `Improve ${subject} from ${currentMark}% to ${improvement.targetMark}%`
              });
            }
          }
        });
      }
    });
    
    // Sort by APS gain (highest first)
    return scenarios
      .sort((a, b) => b.apsGain - a.apsGain)
      .slice(0, 5); // Return top 5 scenarios
  }

  /**
   * Estimate timeframe for mark improvement
   * @param {number} markImprovement - Points to improve
   * @returns {string} Estimated timeframe
   */
  estimateTimeframe(markImprovement) {
    if (markImprovement <= 5) return 'next test';
    if (markImprovement <= 10) return 'next term';
    if (markImprovement <= 20) return 'this year';
    return 'next year';
  }

  /**
   * Get grade-specific context and interpretation
   * @param {number} grade - Student's grade
   * @param {number} apsScore - Current APS score
   * @returns {Object} Grade context
   */
  getGradeContext(grade, apsScore) {
    const contexts = {
      10: {
        interpretation: 'foundation-building',
        message: 'These marks show your current foundation. Focus on building strong study habits.',
        timeline: 'You have 2+ years to improve before university applications.',
        focus: 'Identify strengths and areas for improvement early.'
      },
      11: {
        interpretation: 'trajectory-indicator',
        message: 'These marks indicate your trajectory for Grade 12 performance.',
        timeline: 'Final year performance will determine university admission.',
        focus: 'Strengthen weak subjects and maintain strong ones.'
      },
      12: {
        interpretation: 'admission-prospects',
        message: 'These marks directly impact your university admission prospects.',
        timeline: 'Current performance determines immediate university options.',
        focus: 'Maximize remaining opportunities to improve marks.'
      }
    };
    
    const context = contexts[grade] || contexts[12];
    
    // Add APS-specific guidance
    if (apsScore >= 35) {
      context.prospects = 'Excellent - competitive for most programs';
    } else if (apsScore >= 30) {
      context.prospects = 'Good - eligible for many programs';
    } else if (apsScore >= 25) {
      context.prospects = 'Fair - some programs accessible';
    } else {
      context.prospects = 'Limited - focus on improvement strategies';
    }
    
    return context;
  }

  /**
   * Get specific university requirements for a career field
   * @param {string} careerField - Career field identifier
   * @returns {Object|null} Requirements or null if not found
   */
  getUniversityRequirements(careerField) {
    const field = careerField.toLowerCase();
    
    // Map career fields to requirement categories
    const fieldMapping = {
      'doctor': 'medicine',
      'medicine': 'medicine',
      'engineer': 'engineering',
      'engineering': 'engineering',
      'lawyer': 'law',
      'law': 'law',
      'teacher': 'education',
      'education': 'education',
      'business': 'commerce',
      'commerce': 'commerce',
      'accounting': 'commerce',
      'science': 'sciences',
      'technology': 'technology',
      'it': 'technology',
      'computer': 'technology'
    };
    
    const mappedField = fieldMapping[field];
    return mappedField ? this.universityRequirements[mappedField] : null;
  }

  /**
   * Suggest specific mark improvement targets
   * @param {number} currentAPS - Current APS score
   * @param {number} targetAPS - Target APS score
   * @param {Object} marks - Current marks
   * @returns {Array} Improvement suggestions
   */
  suggestImprovements(currentAPS, targetAPS, marks) {
    const apsGapNeeded = targetAPS - currentAPS;
    
    if (apsGapNeeded <= 0) {
      return [{
        message: 'You already meet the target APS score!',
        type: 'success'
      }];
    }
    
    const suggestions = [];
    
    // Find subjects with the most improvement potential
    const improvementPotential = [];
    
    Object.entries(marks).forEach(([subject, markData]) => {
      if (markData && markData.normalizedValue < 80) {
        const currentMark = markData.normalizedValue;
        const currentAPSPoints = this.convertToAPS(currentMark);
        const maxPossibleAPS = 7;
        const potentialGain = maxPossibleAPS - currentAPSPoints;
        
        if (potentialGain > 0) {
          improvementPotential.push({
            subject,
            currentMark,
            currentAPSPoints,
            potentialGain,
            // Calculate mark needed for next APS level
            nextLevelMark: this.getMarkForNextAPSLevel(currentMark)
          });
        }
      }
    });
    
    // Sort by potential gain
    improvementPotential.sort((a, b) => b.potentialGain - a.potentialGain);
    
    // Generate specific suggestions
    let remainingGapNeeded = apsGapNeeded;
    
    improvementPotential.forEach(potential => {
      if (remainingGapNeeded > 0) {
        const suggestion = {
          subject: potential.subject,
          currentMark: potential.currentMark,
          targetMark: potential.nextLevelMark,
          apsGain: Math.min(potential.potentialGain, remainingGapNeeded),
          priority: remainingGapNeeded >= potential.potentialGain ? 'high' : 'medium',
          message: `Improve ${potential.subject} from ${potential.currentMark}% to ${potential.nextLevelMark}% for +${Math.min(potential.potentialGain, remainingGapNeeded)} APS points`
        };
        
        suggestions.push(suggestion);
        remainingGapNeeded -= Math.min(potential.potentialGain, remainingGapNeeded);
      }
    });
    
    return suggestions;
  }

  /**
   * Get the mark needed to reach the next APS level
   * @param {number} currentMark - Current mark percentage
   * @returns {number} Mark needed for next APS level
   */
  getMarkForNextAPSLevel(currentMark) {
    if (currentMark < 30) return 30;
    if (currentMark < 40) return 40;
    if (currentMark < 50) return 50;
    if (currentMark < 60) return 60;
    if (currentMark < 70) return 70;
    if (currentMark < 80) return 80;
    return 100;
  }

  /**
   * Get APS statistics for context
   * @returns {Object} APS statistics
   */
  getAPSStatistics() {
    return {
      maxPossible: 42, // 6 subjects × 7 points (excluding Life Orientation)
      averageRequired: {
        university: 24,
        competitive: 30,
        topTier: 35
      },
      subjectsRequired: 6,
      excludedSubjects: ['Life Orientation']
    };
  }
}