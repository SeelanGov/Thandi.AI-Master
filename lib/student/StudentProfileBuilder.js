/**
 * StudentProfileBuilder - Comprehensive student data extraction and validation
 * 
 * This class addresses the critical gap where 67% of questionnaire data 
 * (motivation and concerns) was being ignored by the RAG system.
 * 
 * Requirements addressed: 1.1, 1.2, 1.3, 1.5
 */

export class StudentProfileBuilder {
  constructor() {
    this.validationErrors = [];
  }

  /**
   * Build complete student profile from assessment form data
   * @param {Object} formData - Raw form data from AssessmentForm
   * @returns {Object} Structured student profile
   */
  buildProfile(formData) {
    this.validationErrors = [];
    
    try {
      const profile = {
        demographics: this.extractDemographics(formData),
        academic: this.extractAcademicData(formData),
        motivations: this.extractMotivations(formData),
        concerns: this.extractConcerns(formData),
        careerInterests: this.extractCareerInterests(formData),
        constraints: this.extractConstraints(formData),
        metadata: {
          profileCompleteness: 0,
          dataQuality: 'unknown',
          extractedAt: new Date().toISOString()
        }
      };

      // Calculate profile completeness
      profile.metadata.profileCompleteness = this.calculateCompleteness(profile);
      profile.metadata.dataQuality = this.assessDataQuality(profile);

      return profile;
    } catch (error) {
      console.error('[StudentProfileBuilder] Profile building failed:', error);
      return this.buildFallbackProfile(formData);
    }
  }

  /**
   * Extract demographic information
   * @param {Object} formData 
   * @returns {Object} Demographics section
   */
  extractDemographics(formData) {
    const demographics = {
      grade: this.sanitizeGrade(formData.grade),
      timelineContext: this.determineTimelineContext(formData.grade),
      academicCalendarPhase: this.determineAcademicPhase(),
      curriculumFramework: formData.curriculumProfile?.framework || 'CAPS'
    };

    // Validate grade
    if (!demographics.grade || demographics.grade < 10 || demographics.grade > 12) {
      this.validationErrors.push('Invalid or missing grade information');
      demographics.grade = 10; // Safe fallback
    }

    return demographics;
  }

  /**
   * Extract academic performance data
   * @param {Object} formData 
   * @returns {Object} Academic section
   */
  extractAcademicData(formData) {
    const academic = {
      enjoyedSubjects: this.sanitizeSubjectList(formData.enjoyedSubjects || []),
      currentMarks: this.extractMarksData(formData),
      strugglingSubjects: this.sanitizeSubjectList(formData.strugglingSubjects || []),
      curriculumFramework: formData.curriculumProfile?.framework || 'CAPS',
      currentSubjects: this.sanitizeSubjectList(formData.curriculumProfile?.currentSubjects || []),
      marksAvailable: this.hasMarksData(formData)
    };

    // Validate subject data
    if (academic.enjoyedSubjects.length === 0) {
      this.validationErrors.push('No enjoyed subjects specified');
    }

    return academic;
  }

  /**
   * Extract and structure motivation data
   * @param {Object} formData 
   * @returns {Object} Motivations section
   */
  extractMotivations(formData) {
    const rawMotivation = formData.openQuestions?.motivation || '';
    
    const motivations = {
      rawText: this.sanitizeText(rawMotivation),
      hasContent: rawMotivation.trim().length > 0,
      extractedThemes: this.extractMotivationThemes(rawMotivation),
      careerAlignment: this.identifyCareerAlignment(rawMotivation),
      characterCount: rawMotivation.trim().length
    };

    return motivations;
  }

  /**
   * Extract and structure concerns data
   * @param {Object} formData 
   * @returns {Object} Concerns section
   */
  extractConcerns(formData) {
    const rawConcerns = formData.openQuestions?.concerns || '';
    
    const concerns = {
      rawText: this.sanitizeText(rawConcerns),
      hasContent: rawConcerns.trim().length > 0,
      concernCategories: this.categorizeConcerns(rawConcerns),
      addressingStrategies: this.identifyAddressingStrategies(rawConcerns),
      characterCount: rawConcerns.trim().length
    };

    return concerns;
  }

  /**
   * Extract career interests (already working, but standardize format)
   * @param {Object} formData 
   * @returns {Object} Career interests section
   */
  extractCareerInterests(formData) {
    const rawInterests = formData.openQuestions?.careerInterests || '';
    
    const careerInterests = {
      rawText: this.sanitizeText(rawInterests),
      hasContent: rawInterests.trim().length > 0,
      specificCareers: this.extractSpecificCareers(rawInterests),
      priorityLevel: this.determinePriorityLevel(rawInterests),
      characterCount: rawInterests.trim().length
    };

    return careerInterests;
  }

  /**
   * Extract constraints and limitations
   * @param {Object} formData 
   * @returns {Object} Constraints section
   */
  extractConstraints(formData) {
    const constraints = formData.constraints || {};
    
    return {
      financial: this.sanitizeText(constraints.money || ''),
      geographic: this.sanitizeText(constraints.location || ''),
      time: this.sanitizeText(constraints.time || ''),
      family: this.sanitizeText(constraints.familyBackground || ''),
      hasConstraints: Object.values(constraints).some(val => val && val.trim().length > 0)
    };
  }

  // === UTILITY METHODS ===

  /**
   * Sanitize grade input
   */
  sanitizeGrade(grade) {
    const numGrade = parseInt(grade);
    return (numGrade >= 10 && numGrade <= 12) ? numGrade : null;
  }

  /**
   * Sanitize subject lists
   */
  sanitizeSubjectList(subjects) {
    if (!Array.isArray(subjects)) return [];
    return subjects.filter(subject => 
      typeof subject === 'string' && subject.trim().length > 0
    ).map(subject => subject.trim());
  }

  /**
   * Sanitize text input
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.trim().substring(0, 1000); // Prevent excessive length
  }

  /**
   * Extract marks data from various form structures
   */
  extractMarksData(formData) {
    if (formData.subjectMarks && Array.isArray(formData.subjectMarks)) {
      return formData.subjectMarks.map(mark => ({
        subject: this.sanitizeText(mark.subject),
        mark: this.sanitizeMark(mark.exactMark || mark.mark),
        isValid: this.isValidMark(mark.exactMark || mark.mark)
      })).filter(mark => mark.isValid);
    }
    return [];
  }

  /**
   * Check if marks data is available
   */
  hasMarksData(formData) {
    return formData.subjectMarks && 
           Array.isArray(formData.subjectMarks) && 
           formData.subjectMarks.length > 0 &&
           !formData.marksUnknown;
  }

  /**
   * Sanitize mark values
   */
  sanitizeMark(mark) {
    const numMark = parseFloat(mark);
    return (numMark >= 0 && numMark <= 100) ? numMark : null;
  }

  /**
   * Validate mark values
   */
  isValidMark(mark) {
    const numMark = parseFloat(mark);
    return !isNaN(numMark) && numMark >= 0 && numMark <= 100;
  }

  /**
   * Extract motivation themes using keyword analysis
   */
  extractMotivationThemes(motivationText) {
    if (!motivationText || motivationText.trim().length === 0) return [];
    
    const text = motivationText.toLowerCase();
    const themes = [];
    
    // Problem-solving themes
    if (text.includes('problem') || text.includes('solve') || text.includes('challenge')) {
      themes.push('problem-solving');
    }
    
    // Helping people themes
    if (text.includes('help') || text.includes('people') || text.includes('community')) {
      themes.push('helping-others');
    }
    
    // Creative themes
    if (text.includes('creative') || text.includes('art') || text.includes('design') || text.includes('build')) {
      themes.push('creativity');
    }
    
    // Technology themes
    if (text.includes('tech') || text.includes('computer') || text.includes('digital')) {
      themes.push('technology');
    }
    
    // Leadership themes
    if (text.includes('lead') || text.includes('manage') || text.includes('organize')) {
      themes.push('leadership');
    }

    return themes;
  }

  /**
   * Identify career alignment from motivation text
   */
  identifyCareerAlignment(motivationText) {
    const themes = this.extractMotivationThemes(motivationText);
    const alignments = [];
    
    if (themes.includes('problem-solving') && themes.includes('technology')) {
      alignments.push('engineering', 'software-development');
    }
    if (themes.includes('helping-others')) {
      alignments.push('healthcare', 'education', 'social-work');
    }
    if (themes.includes('creativity')) {
      alignments.push('design', 'arts', 'media');
    }
    if (themes.includes('leadership')) {
      alignments.push('business', 'management');
    }
    
    return alignments;
  }

  /**
   * Categorize student concerns
   */
  categorizeConcerns(concernsText) {
    if (!concernsText || concernsText.trim().length === 0) return [];
    
    const text = concernsText.toLowerCase();
    const categories = [];
    
    // Financial concerns
    if (text.includes('money') || text.includes('afford') || text.includes('expensive') || text.includes('cost')) {
      categories.push('financial');
    }
    
    // Academic concerns
    if (text.includes('marks') || text.includes('grades') || text.includes('study') || text.includes('pass')) {
      categories.push('academic-performance');
    }
    
    // Career uncertainty
    if (text.includes('job') || text.includes('career') || text.includes('work') || text.includes('employment')) {
      categories.push('career-uncertainty');
    }
    
    // University access
    if (text.includes('university') || text.includes('college') || text.includes('admission')) {
      categories.push('university-access');
    }
    
    // Family pressure
    if (text.includes('family') || text.includes('parents') || text.includes('pressure')) {
      categories.push('family-expectations');
    }

    return categories;
  }

  /**
   * Identify strategies for addressing concerns
   */
  identifyAddressingStrategies(concernsText) {
    const categories = this.categorizeConcerns(concernsText);
    const strategies = [];
    
    if (categories.includes('financial')) {
      strategies.push('bursary-information', 'nsfas-guidance', 'affordable-alternatives');
    }
    if (categories.includes('academic-performance')) {
      strategies.push('study-techniques', 'mark-improvement-plan', 'tutoring-resources');
    }
    if (categories.includes('career-uncertainty')) {
      strategies.push('career-exploration', 'job-market-insights', 'skills-development');
    }
    if (categories.includes('university-access')) {
      strategies.push('admission-requirements', 'alternative-pathways', 'application-guidance');
    }
    
    return strategies;
  }

  /**
   * Extract specific career mentions
   */
  extractSpecificCareers(careerText) {
    if (!careerText || careerText.trim().length === 0) return [];
    
    const text = careerText.toLowerCase();
    const careers = [];
    
    // Common career keywords
    const careerKeywords = {
      'doctor': 'medicine',
      'engineer': 'engineering',
      'teacher': 'education',
      'lawyer': 'law',
      'nurse': 'nursing',
      'programmer': 'software-development',
      'designer': 'design',
      'business': 'business',
      'scientist': 'science'
    };
    
    Object.entries(careerKeywords).forEach(([keyword, career]) => {
      if (text.includes(keyword)) {
        careers.push(career);
      }
    });
    
    return [...new Set(careers)]; // Remove duplicates
  }

  /**
   * Determine priority level based on text specificity
   */
  determinePriorityLevel(careerText) {
    if (!careerText || careerText.trim().length === 0) return 'low';
    
    const specificCareers = this.extractSpecificCareers(careerText);
    const textLength = careerText.trim().length;
    
    if (specificCareers.length > 0 && textLength > 50) return 'high';
    if (specificCareers.length > 0 || textLength > 20) return 'medium';
    return 'low';
  }

  /**
   * Determine timeline context based on grade
   */
  determineTimelineContext(grade) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    if (grade === 12) {
      if (currentMonth >= 10) return 'final-exam-period';
      if (currentMonth >= 8) return 'pre-finals';
      return 'mid-year-assessment';
    } else if (grade === 11) {
      if (currentMonth >= 10) return 'end-of-year';
      return 'academic-year-progress';
    } else {
      return 'early-career-exploration';
    }
  }

  /**
   * Determine current academic calendar phase
   */
  determineAcademicPhase() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    if (currentMonth >= 1 && currentMonth <= 3) return 'first-quarter';
    if (currentMonth >= 4 && currentMonth <= 6) return 'second-quarter';
    if (currentMonth >= 7 && currentMonth <= 9) return 'third-quarter';
    return 'fourth-quarter';
  }

  /**
   * Calculate profile completeness percentage
   */
  calculateCompleteness(profile) {
    let completeness = 0;
    let totalSections = 6;
    
    // Demographics (always present)
    completeness += 1;
    
    // Academic data
    if (profile.academic.enjoyedSubjects.length > 0) completeness += 1;
    
    // Motivations
    if (profile.motivations.hasContent) completeness += 1;
    
    // Concerns
    if (profile.concerns.hasContent) completeness += 1;
    
    // Career interests
    if (profile.careerInterests.hasContent) completeness += 1;
    
    // Constraints
    if (profile.constraints.hasConstraints) completeness += 1;
    
    return Math.round((completeness / totalSections) * 100);
  }

  /**
   * Assess overall data quality
   */
  assessDataQuality(profile) {
    if (this.validationErrors.length > 2) return 'poor';
    if (profile.metadata.profileCompleteness >= 80) return 'excellent';
    if (profile.metadata.profileCompleteness >= 60) return 'good';
    if (profile.metadata.profileCompleteness >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Build fallback profile when main building fails
   */
  buildFallbackProfile(formData) {
    return {
      demographics: {
        grade: formData.grade || 10,
        timelineContext: 'unknown',
        academicCalendarPhase: 'unknown',
        curriculumFramework: 'CAPS'
      },
      academic: {
        enjoyedSubjects: formData.enjoyedSubjects || [],
        currentMarks: [],
        strugglingSubjects: [],
        curriculumFramework: 'CAPS',
        currentSubjects: [],
        marksAvailable: false
      },
      motivations: {
        rawText: '',
        hasContent: false,
        extractedThemes: [],
        careerAlignment: [],
        characterCount: 0
      },
      concerns: {
        rawText: '',
        hasContent: false,
        concernCategories: [],
        addressingStrategies: [],
        characterCount: 0
      },
      careerInterests: {
        rawText: formData.openQuestions?.careerInterests || '',
        hasContent: Boolean(formData.openQuestions?.careerInterests),
        specificCareers: [],
        priorityLevel: 'low',
        characterCount: (formData.openQuestions?.careerInterests || '').length
      },
      constraints: {
        financial: '',
        geographic: '',
        time: '',
        family: '',
        hasConstraints: false
      },
      metadata: {
        profileCompleteness: 20,
        dataQuality: 'fallback',
        extractedAt: new Date().toISOString(),
        errors: this.validationErrors
      }
    };
  }

  /**
   * Get validation errors
   */
  getValidationErrors() {
    return this.validationErrors;
  }
}