/**
 * Bursary Validation Engine
 * 
 * Validates bursary recommendations to ensure students receive accurate,
 * current, and personally relevant financial aid information.
 * 
 * @author Kiro AI Assistant
 * @version 1.0.0
 * @created 2026-01-07
 */

/**
 * Major bursary providers and their current programs
 */
const BURSARY_DATABASE = {
  NSFAS: {
    name: 'National Student Financial Aid Scheme',
    type: 'government',
    fields: ['all'],
    maxAmount: 'Full tuition + allowances',
    deadline: '2025-12-31',
    requirements: {
      citizenship: 'South African',
      income: 'Household income ≤ R350,000',
      academic: 'NSC pass or equivalent'
    },
    applicationUrl: 'https://www.nsfas.org.za',
    reliability: 0.98,
    currentlyOpen: true
  },
  
  SASOL: {
    name: 'Sasol Bursary Programme',
    type: 'corporate',
    fields: ['engineering', 'science', 'technology'],
    maxAmount: 'R120,000 per year',
    deadline: '2026-03-31',
    requirements: {
      citizenship: 'South African',
      academic: 'APS ≥ 35',
      subjects: ['Mathematics', 'Physical Sciences']
    },
    applicationUrl: 'https://www.sasol.com/careers/bursaries',
    reliability: 0.95,
    currentlyOpen: true
  },
  
  ANGLO_AMERICAN: {
    name: 'Anglo American Bursary',
    type: 'corporate',
    fields: ['mining engineering', 'metallurgy', 'geology'],
    maxAmount: 'R100,000 per year',
    deadline: '2026-02-28',
    requirements: {
      citizenship: 'South African',
      academic: 'APS ≥ 32',
      subjects: ['Mathematics', 'Physical Sciences']
    },
    applicationUrl: 'https://www.angloamerican.com/careers/bursaries',
    reliability: 0.93,
    currentlyOpen: true
  },
  
  DISCOVERY: {
    name: 'Discovery Bursary Programme',
    type: 'corporate',
    fields: ['actuarial science', 'statistics', 'data science', 'computer science'],
    maxAmount: 'R80,000 per year',
    deadline: '2026-04-15',
    requirements: {
      citizenship: 'South African',
      academic: 'APS ≥ 38',
      subjects: ['Mathematics', 'Physical Sciences or Life Sciences']
    },
    applicationUrl: 'https://www.discovery.co.za/careers/bursaries',
    reliability: 0.92,
    currentlyOpen: true
  },
  
  ESKOM: {
    name: 'Eskom Bursary Scheme',
    type: 'soe', // State-owned enterprise
    fields: ['electrical engineering', 'mechanical engineering', 'civil engineering'],
    maxAmount: 'R90,000 per year',
    deadline: '2026-04-30',
    requirements: {
      citizenship: 'South African',
      academic: 'APS ≥ 30',
      subjects: ['Mathematics', 'Physical Sciences']
    },
    applicationUrl: 'https://www.eskom.co.za/careers/bursaries',
    reliability: 0.88,
    currentlyOpen: true
  },
  
  GOOGLE_DEVELOPER: {
    name: 'Google Developer Scholarship',
    type: 'international',
    fields: ['computer science', 'software engineering'],
    maxAmount: 'R60,000 per year',
    deadline: 'Rolling applications',
    requirements: {
      citizenship: 'Any',
      academic: 'Strong coding portfolio',
      subjects: ['Mathematics', 'Computer Science or IT']
    },
    applicationUrl: 'https://developers.google.com/scholarships',
    reliability: 0.85,
    currentlyOpen: true
  }
};

/**
 * Field mapping for bursary matching
 */
const FIELD_MAPPINGS = {
  'engineering': ['engineering', 'civil engineering', 'mechanical engineering', 'electrical engineering'],
  'computer science': ['computer science', 'software engineering', 'information technology', 'data science'],
  'medicine': ['medicine', 'health sciences', 'biomedical sciences'],
  'science': ['physical sciences', 'life sciences', 'chemistry', 'physics', 'biology'],
  'business': ['business administration', 'commerce', 'accounting', 'finance'],
  'mathematics': ['mathematics', 'applied mathematics', 'statistics', 'actuarial science']
};

/**
 * Bursary Validation Engine Class
 */
export class BursaryValidationEngine {
  constructor() {
    this.validationCache = new Map();
    this.lastDatabaseUpdate = new Date().toISOString();
  }

  /**
   * Validates bursary recommendations in career guidance response
   * 
   * @param {Object} ragResponse - Career guidance response containing bursary mentions
   * @param {Object} studentProfile - Student's academic and personal profile
   * @returns {Promise<Object>} Bursary validation results
   */
  async validateBursaryRecommendations(ragResponse, studentProfile) {
    const startTime = Date.now();
    
    try {
      console.log('[BURSARY VALIDATION] Starting bursary recommendation validation');

      // Extract bursary mentions from response
      const mentionedBursaries = this.extractBursaryMentions(ragResponse.response);
      
      if (mentionedBursaries.length === 0) {
        return this.createBursaryValidationResult(
          true, 
          'No specific bursary recommendations to validate', 
          [], 
          startTime
        );
      }

      // Validate each mentioned bursary
      const validationResults = await Promise.all(
        mentionedBursaries.map(bursary => this.validateSpecificBursary(bursary, studentProfile))
      );

      // Find missing bursary opportunities
      const missedOpportunities = await this.findMissedBursaryOpportunities(
        ragResponse.response, 
        studentProfile
      );

      // Validate bursary information accuracy
      const accuracyValidation = this.validateBursaryAccuracy(ragResponse.response);

      // Calculate overall bursary validation score
      const overallScore = this.calculateBursaryScore(
        validationResults, 
        missedOpportunities, 
        accuracyValidation
      );

      const finalResult = {
        criterion: 'bursary_accuracy',
        passed: overallScore >= 70,
        score: overallScore,
        checks: {
          bursaryAccuracy: accuracyValidation.accurate,
          eligibilityMatch: validationResults.every(v => v.eligible),
          completeness: missedOpportunities.length <= 2,
          currentDeadlines: validationResults.every(v => v.deadlineValid)
        },
        issues: this.aggregateIssues(validationResults, missedOpportunities, accuracyValidation),
        corrections: this.generateCorrections(validationResults, missedOpportunities, accuracyValidation),
        confidence: Math.min(95, overallScore + 5),
        bursaryData: {
          mentionedBursaries,
          validationResults,
          missedOpportunities: missedOpportunities.slice(0, 3), // Top 3 missed opportunities
          accuracyValidation,
          lastValidated: new Date().toISOString()
        },
        processingTime: Date.now() - startTime
      };

      console.log(`[BURSARY VALIDATION] Completed in ${finalResult.processingTime}ms - Score: ${overallScore}`);
      
      return finalResult;

    } catch (error) {
      console.error('[BURSARY VALIDATION] Validation failed:', error);
      
      return this.createBursaryValidationResult(
        false, 
        `Bursary validation error: ${error.message}`, 
        [], 
        startTime
      );
    }
  }

  /**
   * Extracts bursary mentions from response text
   */
  extractBursaryMentions(responseText) {
    const bursaries = [];
    const text = responseText.toLowerCase();

    // Check for specific bursary names
    for (const [key, bursary] of Object.entries(BURSARY_DATABASE)) {
      const bursaryName = bursary.name.toLowerCase();
      const shortName = key.toLowerCase();
      
      if (text.includes(bursaryName) || text.includes(shortName)) {
        bursaries.push({
          id: key,
          name: bursary.name,
          mentionedAs: bursaryName,
          found: true
        });
      }
    }

    // Check for generic bursary mentions
    const genericMentions = [
      'bursary', 'scholarship', 'financial aid', 'funding', 'nsfas'
    ];

    for (const mention of genericMentions) {
      if (text.includes(mention) && !bursaries.some(b => b.mentionedAs.includes(mention))) {
        bursaries.push({
          id: 'GENERIC',
          name: 'Generic Bursary Mention',
          mentionedAs: mention,
          found: true
        });
      }
    }

    return bursaries;
  }

  /**
   * Validates a specific bursary recommendation
   */
  async validateSpecificBursary(mentionedBursary, studentProfile) {
    try {
      // Skip validation for generic mentions
      if (mentionedBursary.id === 'GENERIC') {
        return {
          bursaryId: 'GENERIC',
          name: 'Generic Bursary Mention',
          eligible: true,
          deadlineValid: true,
          fieldMatch: true,
          issues: [],
          corrections: []
        };
      }

      const bursaryData = BURSARY_DATABASE[mentionedBursary.id];
      if (!bursaryData) {
        return {
          bursaryId: mentionedBursary.id,
          name: mentionedBursary.name,
          eligible: false,
          deadlineValid: false,
          fieldMatch: false,
          issues: [`Unknown bursary: ${mentionedBursary.name}`],
          corrections: ['Verify bursary exists and is currently available']
        };
      }

      // Validate eligibility
      const eligibilityCheck = this.checkEligibility(bursaryData, studentProfile);
      
      // Validate deadline
      const deadlineCheck = this.checkDeadline(bursaryData);
      
      // Validate field match
      const fieldCheck = this.checkFieldMatch(bursaryData, studentProfile);

      return {
        bursaryId: mentionedBursary.id,
        name: bursaryData.name,
        eligible: eligibilityCheck.eligible,
        deadlineValid: deadlineCheck.valid,
        fieldMatch: fieldCheck.matches,
        eligibilityScore: eligibilityCheck.score,
        issues: [
          ...eligibilityCheck.issues,
          ...deadlineCheck.issues,
          ...fieldCheck.issues
        ],
        corrections: [
          ...eligibilityCheck.corrections,
          ...deadlineCheck.corrections,
          ...fieldCheck.corrections
        ],
        bursaryDetails: {
          amount: bursaryData.maxAmount,
          deadline: bursaryData.deadline,
          requirements: bursaryData.requirements,
          applicationUrl: bursaryData.applicationUrl
        }
      };

    } catch (error) {
      console.error(`[BURSARY VALIDATION] Failed to validate ${mentionedBursary.name}:`, error);
      
      return {
        bursaryId: mentionedBursary.id,
        name: mentionedBursary.name,
        eligible: false,
        deadlineValid: false,
        fieldMatch: false,
        issues: [`Validation error for ${mentionedBursary.name}`],
        corrections: ['Manual verification required']
      };
    }
  }

  /**
   * Checks student eligibility for a bursary
   */
  checkEligibility(bursaryData, studentProfile) {
    const issues = [];
    const corrections = [];
    let score = 100;

    // Check citizenship requirement
    if (bursaryData.requirements.citizenship === 'South African') {
      // Assume South African unless specified otherwise
      const isSouthAfrican = !studentProfile?.citizenship || 
                            studentProfile.citizenship === 'South African';
      if (!isSouthAfrican) {
        issues.push('South African citizenship required');
        corrections.push('Verify citizenship requirements');
        score -= 30;
      }
    }

    // Check academic requirements
    if (bursaryData.requirements.academic) {
      const academicReq = bursaryData.requirements.academic;
      
      if (academicReq.includes('APS')) {
        const requiredAPS = parseInt(academicReq.match(/\d+/)?.[0] || '0');
        const studentAPS = this.calculateStudentAPS(studentProfile);
        
        if (studentAPS > 0 && studentAPS < requiredAPS) {
          issues.push(`APS requirement: ${requiredAPS}, student projected: ${studentAPS}`);
          corrections.push('Focus on improving academic performance to meet APS requirement');
          score -= 25;
        }
      }
    }

    // Check subject requirements
    if (bursaryData.requirements.subjects) {
      const requiredSubjects = bursaryData.requirements.subjects;
      const studentSubjects = Object.keys(studentProfile?.marks || {});
      
      for (const reqSubject of requiredSubjects) {
        const hasSubject = studentSubjects.some(subject => 
          subject.toLowerCase().includes(reqSubject.toLowerCase()) ||
          reqSubject.toLowerCase().includes(subject.toLowerCase())
        );
        
        if (!hasSubject) {
          issues.push(`Required subject missing: ${reqSubject}`);
          corrections.push(`Ensure ${reqSubject} is included in subject selection`);
          score -= 15;
        }
      }
    }

    // Check income requirements (if available)
    if (bursaryData.requirements.income && studentProfile?.householdIncome) {
      const maxIncome = parseInt(bursaryData.requirements.income.match(/\d+/)?.[0] || '0');
      if (studentProfile.householdIncome > maxIncome) {
        issues.push('Household income exceeds bursary limit');
        corrections.push('Consider other funding options or income-based bursaries');
        score -= 20;
      }
    }

    return {
      eligible: score >= 70,
      score: Math.max(0, score),
      issues,
      corrections
    };
  }

  /**
   * Checks if bursary deadline is still valid
   */
  checkDeadline(bursaryData) {
    const issues = [];
    const corrections = [];

    try {
      if (bursaryData.deadline === 'Rolling applications') {
        return { valid: true, issues, corrections };
      }

      const deadlineDate = new Date(bursaryData.deadline);
      const currentDate = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline < 0) {
        issues.push(`Deadline passed: ${bursaryData.deadline}`);
        corrections.push('Update to current application deadlines');
        return { valid: false, issues, corrections };
      }

      if (daysUntilDeadline <= 30) {
        issues.push(`Urgent deadline: ${bursaryData.deadline} (${daysUntilDeadline} days remaining)`);
        corrections.push('Emphasize urgency of application');
      }

      return { valid: true, issues, corrections };

    } catch (error) {
      issues.push('Unable to validate deadline format');
      corrections.push('Verify deadline format and currency');
      return { valid: false, issues, corrections };
    }
  }

  /**
   * Checks if bursary field matches student interests
   */
  checkFieldMatch(bursaryData, studentProfile) {
    const issues = [];
    const corrections = [];

    // If bursary covers all fields, it's always a match
    if (bursaryData.fields.includes('all')) {
      return { matches: true, issues, corrections };
    }

    // Check against student interests
    const studentInterests = studentProfile?.interests || [];
    const studentSubjects = Object.keys(studentProfile?.marks || {});

    let hasMatch = false;

    // Check direct field matches
    for (const field of bursaryData.fields) {
      const fieldLower = field.toLowerCase();
      
      // Check against interests
      const interestMatch = studentInterests.some(interest => 
        interest.toLowerCase().includes(fieldLower) ||
        fieldLower.includes(interest.toLowerCase())
      );

      // Check against subjects using field mappings
      const subjectMatch = this.checkSubjectFieldAlignment(fieldLower, studentSubjects);

      if (interestMatch || subjectMatch) {
        hasMatch = true;
        break;
      }
    }

    if (!hasMatch) {
      issues.push(`Bursary fields (${bursaryData.fields.join(', ')}) don't match student profile`);
      corrections.push('Recommend bursaries aligned with student interests and subjects');
    }

    return { matches: hasMatch, issues, corrections };
  }

  /**
   * Checks if student subjects align with bursary field
   */
  checkSubjectFieldAlignment(field, studentSubjects) {
    const fieldMappings = FIELD_MAPPINGS[field] || [field];
    
    return studentSubjects.some(subject => {
      const subjectLower = subject.toLowerCase();
      return fieldMappings.some(mapping => 
        subjectLower.includes(mapping.toLowerCase()) ||
        mapping.toLowerCase().includes(subjectLower)
      );
    });
  }

  /**
   * Finds missed bursary opportunities for the student
   */
  async findMissedBursaryOpportunities(responseText, studentProfile) {
    const mentionedBursaryIds = this.extractBursaryMentions(responseText)
      .map(b => b.id)
      .filter(id => id !== 'GENERIC');

    const missedOpportunities = [];

    for (const [bursaryId, bursaryData] of Object.entries(BURSARY_DATABASE)) {
      // Skip if already mentioned
      if (mentionedBursaryIds.includes(bursaryId)) continue;

      // Check if student is eligible
      const eligibilityCheck = this.checkEligibility(bursaryData, studentProfile);
      const fieldCheck = this.checkFieldMatch(bursaryData, studentProfile);
      const deadlineCheck = this.checkDeadline(bursaryData);

      // If eligible and relevant, it's a missed opportunity
      if (eligibilityCheck.eligible && fieldCheck.matches && deadlineCheck.valid) {
        missedOpportunities.push({
          bursaryId,
          name: bursaryData.name,
          amount: bursaryData.maxAmount,
          deadline: bursaryData.deadline,
          matchScore: eligibilityCheck.score,
          reason: `Eligible for ${bursaryData.name} - ${bursaryData.maxAmount}`,
          applicationUrl: bursaryData.applicationUrl
        });
      }
    }

    // Sort by match score (highest first)
    return missedOpportunities.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Validates accuracy of bursary information in response
   */
  validateBursaryAccuracy(responseText) {
    const issues = [];
    const corrections = [];

    // Check for common inaccuracies
    const inaccurateStatements = [
      { pattern: /nsfas.*guaranteed/i, issue: 'NSFAS is not guaranteed', correction: 'Clarify NSFAS application process and eligibility' },
      { pattern: /bursary.*easy/i, issue: 'Bursaries are competitive, not easy to obtain', correction: 'Emphasize competitive nature of bursaries' },
      { pattern: /free.*university/i, issue: 'University is not automatically free', correction: 'Explain funding requirements and application processes' }
    ];

    for (const check of inaccurateStatements) {
      if (check.pattern.test(responseText)) {
        issues.push(check.issue);
        corrections.push(check.correction);
      }
    }

    // Check for missing important information
    if (responseText.includes('bursary') || responseText.includes('NSFAS')) {
      if (!responseText.includes('deadline') && !responseText.includes('apply')) {
        issues.push('Missing application deadline information');
        corrections.push('Include specific application deadlines and processes');
      }

      if (!responseText.includes('requirement') && !responseText.includes('eligible')) {
        issues.push('Missing eligibility requirements');
        corrections.push('Include clear eligibility criteria for bursaries');
      }
    }

    return {
      accurate: issues.length === 0,
      accuracyScore: Math.max(0, 100 - (issues.length * 20)),
      issues,
      corrections
    };
  }

  /**
   * Calculates student's projected APS score
   */
  calculateStudentAPS(studentProfile) {
    if (!studentProfile?.marks) return 0;

    const marks = Object.values(studentProfile.marks);
    const validMarks = marks.filter(mark => mark && !isNaN(parseFloat(mark)));
    
    if (validMarks.length === 0) return 0;

    // Simple APS calculation (7 best subjects)
    const sortedMarks = validMarks
      .map(mark => parseFloat(mark))
      .sort((a, b) => b - a)
      .slice(0, 7);

    const apsPoints = sortedMarks.map(mark => {
      if (mark >= 80) return 7;
      if (mark >= 70) return 6;
      if (mark >= 60) return 5;
      if (mark >= 50) return 4;
      if (mark >= 40) return 3;
      if (mark >= 30) return 2;
      return 1;
    });

    return apsPoints.reduce((sum, points) => sum + points, 0);
  }

  /**
   * Calculates overall bursary validation score
   */
  calculateBursaryScore(validationResults, missedOpportunities, accuracyValidation) {
    let score = 100;

    // Penalize for validation failures
    const failedValidations = validationResults.filter(v => !v.eligible || !v.fieldMatch);
    score -= failedValidations.length * 15;

    // Penalize for missed opportunities (but not too harshly)
    score -= Math.min(missedOpportunities.length * 5, 20);

    // Factor in accuracy
    score = (score * accuracyValidation.accuracyScore) / 100;

    return Math.max(0, Math.round(score));
  }

  /**
   * Aggregates all validation issues
   */
  aggregateIssues(validationResults, missedOpportunities, accuracyValidation) {
    const issues = [];

    // Add validation issues
    for (const result of validationResults) {
      issues.push(...result.issues);
    }

    // Add missed opportunity issues
    if (missedOpportunities.length > 0) {
      issues.push(`${missedOpportunities.length} relevant bursary opportunities not mentioned`);
    }

    // Add accuracy issues
    issues.push(...accuracyValidation.issues);

    return issues;
  }

  /**
   * Generates correction recommendations
   */
  generateCorrections(validationResults, missedOpportunities, accuracyValidation) {
    const corrections = [];

    // Add validation corrections
    for (const result of validationResults) {
      corrections.push(...result.corrections);
    }

    // Add missed opportunity corrections
    if (missedOpportunities.length > 0) {
      corrections.push('Include additional relevant bursary opportunities');
      corrections.push(`Consider mentioning: ${missedOpportunities.slice(0, 2).map(b => b.name).join(', ')}`);
    }

    // Add accuracy corrections
    corrections.push(...accuracyValidation.corrections);

    return corrections;
  }

  /**
   * Creates standardized bursary validation result
   */
  createBursaryValidationResult(passed, message, bursaryData, startTime) {
    return {
      criterion: 'bursary_accuracy',
      passed,
      score: passed ? 85 : 25,
      checks: { bursaryAccuracy: passed },
      issues: passed ? [] : [message],
      corrections: passed ? [] : ['Implement comprehensive bursary validation'],
      confidence: passed ? 85 : 25,
      bursaryData: bursaryData || [],
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Gets personalized bursary recommendations for a student
   */
  async getPersonalizedBursaryRecommendations(studentProfile) {
    const recommendations = [];

    for (const [bursaryId, bursaryData] of Object.entries(BURSARY_DATABASE)) {
      const eligibilityCheck = this.checkEligibility(bursaryData, studentProfile);
      const fieldCheck = this.checkFieldMatch(bursaryData, studentProfile);
      const deadlineCheck = this.checkDeadline(bursaryData);

      if (eligibilityCheck.eligible && fieldCheck.matches && deadlineCheck.valid) {
        recommendations.push({
          id: bursaryId,
          name: bursaryData.name,
          amount: bursaryData.maxAmount,
          deadline: bursaryData.deadline,
          matchScore: eligibilityCheck.score,
          applicationUrl: bursaryData.applicationUrl,
          requirements: bursaryData.requirements,
          type: bursaryData.type,
          urgency: this.calculateUrgency(bursaryData.deadline)
        });
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculates urgency level based on deadline
   */
  calculateUrgency(deadline) {
    if (deadline === 'Rolling applications') return 'LOW';

    try {
      const deadlineDate = new Date(deadline);
      const currentDate = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate - currentDate) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 7) return 'CRITICAL';
      if (daysUntilDeadline <= 30) return 'HIGH';
      if (daysUntilDeadline <= 90) return 'MEDIUM';
      return 'LOW';
    } catch (error) {
      return 'UNKNOWN';
    }
  }
}

export default BursaryValidationEngine;