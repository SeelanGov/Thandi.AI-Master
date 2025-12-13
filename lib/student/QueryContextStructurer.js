/**
 * QueryContextStructurer - Organize student data into optimal LLM query format
 * 
 * This class addresses the critical gap by structuring all questionnaire data
 * (including previously ignored motivation and concerns) into logical sections
 * optimized for LLM comprehension and personalized response generation.
 * 
 * Requirements addressed: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4
 */

export class QueryContextStructurer {
  constructor() {
    this.contextSections = [];
    this.priorityRequests = [];
  }

  /**
   * Build complete query context from student profile
   * @param {Object} studentProfile - Structured profile from StudentProfileBuilder
   * @returns {Object} Optimized query context for LLM
   */
  buildContext(studentProfile) {
    try {
      this.contextSections = [];
      this.priorityRequests = [];

      const context = {
        baseContext: this.buildBaseContext(studentProfile),
        priorityRequests: this.buildPriorityRequests(studentProfile),
        motivationContext: this.buildMotivationContext(studentProfile),
        concernsContext: this.buildConcernsContext(studentProfile),
        academicContext: this.buildAcademicContext(studentProfile),
        constraintsContext: this.buildConstraintsContext(studentProfile),
        metadata: {
          sectionsIncluded: this.contextSections.length,
          priorityRequestsCount: this.priorityRequests.length,
          structuredAt: new Date().toISOString(),
          profileCompleteness: studentProfile.metadata?.profileCompleteness || 0
        }
      };

      // Build final structured query
      context.structuredQuery = this.assembleStructuredQuery(context);
      
      return context;
    } catch (error) {
      console.error('[QueryContextStructurer] Context building failed:', error);
      return this.buildFallbackContext(studentProfile);
    }
  }

  /**
   * Build base demographic and academic context
   * @param {Object} studentProfile 
   * @returns {string} Base context section
   */
  buildBaseContext(studentProfile) {
    const { demographics, academic } = studentProfile;
    
    let baseContext = `I am a Grade ${demographics.grade} student in South Africa. `;
    
    // Add timeline context
    if (demographics.timelineContext) {
      baseContext += this.getTimelineMessage(demographics.grade, demographics.timelineContext);
    }
    
    // Add curriculum framework
    if (demographics.curriculumFramework) {
      baseContext += `I follow the ${demographics.curriculumFramework} curriculum. `;
    }
    
    // Add enjoyed subjects
    if (academic.enjoyedSubjects && academic.enjoyedSubjects.length > 0) {
      baseContext += `Subjects I enjoy: ${academic.enjoyedSubjects.join(', ')}. `;
    }
    
    this.contextSections.push('base-demographics');
    return baseContext;
  }

  /**
   * Build priority requests based on student profile
   * @param {Object} studentProfile 
   * @returns {string} Priority requests section
   */
  buildPriorityRequests(studentProfile) {
    const requests = [];
    
    // Career interests priority (maintain existing emphasis)
    if (studentProfile.careerInterests.hasContent) {
      requests.push(`CRITICAL STUDENT REQUEST: "${studentProfile.careerInterests.rawText}"`);
      requests.push('This is what the student WANTS to do. Prioritize this career if their subjects and marks make it feasible.');
      requests.push('If not feasible with current marks, explain EXACTLY what marks they need and provide realistic stepping-stone alternatives.');
      requests.push('Always acknowledge their stated interest directly in your response.');
      this.priorityRequests.push('career-interests-emphasis');
    }
    
    // Academic performance priority
    if (studentProfile.academic.marksAvailable) {
      requests.push('Base all career suggestions on the ACTUAL marks provided below.');
      requests.push('If marks are too low for stated career goals, provide specific improvement targets.');
      this.priorityRequests.push('marks-based-guidance');
    }
    
    // Motivation alignment priority
    if (studentProfile.motivations.hasContent) {
      requests.push('Consider the student\'s motivations when suggesting careers that would be fulfilling.');
      this.priorityRequests.push('motivation-alignment');
    }
    
    // Concerns addressing priority
    if (studentProfile.concerns.hasContent) {
      requests.push('Address the specific concerns mentioned by the student in your guidance.');
      this.priorityRequests.push('concerns-addressing');
    }
    
    this.contextSections.push('priority-requests');
    return requests.join(' ');
  }

  /**
   * Build motivation context section (PREVIOUSLY IGNORED)
   * @param {Object} studentProfile 
   * @returns {string} Motivation context section
   */
  buildMotivationContext(studentProfile) {
    if (!studentProfile.motivations.hasContent) {
      return '';
    }
    
    let motivationContext = `\n\n=== WHAT MOTIVATES ME ===\n`;
    motivationContext += `"${studentProfile.motivations.rawText}"\n`;
    
    // Add extracted themes for LLM guidance
    if (studentProfile.motivations.extractedThemes.length > 0) {
      motivationContext += `Key motivation themes: ${studentProfile.motivations.extractedThemes.join(', ')}\n`;
    }
    
    // Add career alignment suggestions
    if (studentProfile.motivations.careerAlignment.length > 0) {
      motivationContext += `Potential career alignments: ${studentProfile.motivations.careerAlignment.join(', ')}\n`;
    }
    
    motivationContext += `INSTRUCTION: Please consider these motivations when suggesting careers that would be personally fulfilling for this student. `;
    motivationContext += `Explain how suggested careers align with what drives and excites them.`;
    
    this.contextSections.push('motivation-context');
    return motivationContext;
  }

  /**
   * Build concerns context section (PREVIOUSLY IGNORED)
   * @param {Object} studentProfile 
   * @returns {string} Concerns context section
   */
  buildConcernsContext(studentProfile) {
    if (!studentProfile.concerns.hasContent) {
      return '';
    }
    
    let concernsContext = `\n\n=== MY CONCERNS ABOUT THE FUTURE ===\n`;
    concernsContext += `"${studentProfile.concerns.rawText}"\n`;
    
    // Add concern categories for targeted guidance
    if (studentProfile.concerns.concernCategories.length > 0) {
      concernsContext += `Concern categories: ${studentProfile.concerns.concernCategories.join(', ')}\n`;
    }
    
    // Add addressing strategies
    if (studentProfile.concerns.addressingStrategies.length > 0) {
      concernsContext += `Recommended addressing strategies: ${studentProfile.concerns.addressingStrategies.join(', ')}\n`;
    }
    
    concernsContext += `INSTRUCTION: Please address these specific concerns in your guidance. `;
    concernsContext += `Provide practical advice and resources to help with these worries. `;
    concernsContext += `Be empathetic and offer concrete steps to address each concern.`;
    
    this.contextSections.push('concerns-context');
    return concernsContext;
  }

  /**
   * Build academic context with marks and performance data
   * @param {Object} studentProfile 
   * @returns {string} Academic context section
   */
  buildAcademicContext(studentProfile) {
    const { academic, demographics } = studentProfile;
    let academicContext = '';
    
    // Add current marks if available
    if (academic.marksAvailable && academic.currentMarks.length > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      academicContext += `\n\n=== MY ACTUAL MARKS (as of ${currentMonth} ${currentYear}) ===\n`;
      academic.currentMarks.forEach(mark => {
        if (mark.isValid) {
          academicContext += `${mark.subject}: ${mark.mark}%\n`;
        }
      });
      
      academicContext += `INSTRUCTION: Base all career suggestions on these ACTUAL marks. `;
      academicContext += `If marks are insufficient for stated goals, explain specific improvements needed.`;
    }
    
    // Add struggling subjects if available
    if (academic.strugglingSubjects && academic.strugglingSubjects.length > 0) {
      academicContext += `\n\nSubjects I'm struggling with: ${academic.strugglingSubjects.join(', ')}\n`;
      academicContext += `INSTRUCTION: Consider these challenges when suggesting careers and provide study guidance.`;
    }
    
    // Add grade-specific guidance requests
    academicContext += this.buildGradeSpecificGuidance(demographics.grade, demographics.timelineContext);
    
    if (academicContext.trim()) {
      this.contextSections.push('academic-context');
    }
    
    return academicContext;
  }

  /**
   * Build constraints context
   * @param {Object} studentProfile 
   * @returns {string} Constraints context section
   */
  buildConstraintsContext(studentProfile) {
    const { constraints } = studentProfile;
    
    if (!constraints.hasConstraints) {
      return '';
    }
    
    let constraintsContext = `\n\n=== MY CONSTRAINTS AND LIMITATIONS ===\n`;
    
    if (constraints.financial) {
      constraintsContext += `Financial situation: ${constraints.financial}\n`;
    }
    
    if (constraints.geographic) {
      constraintsContext += `Location preferences: ${constraints.geographic}\n`;
    }
    
    if (constraints.time) {
      constraintsContext += `Time constraints: ${constraints.time}\n`;
    }
    
    if (constraints.family) {
      constraintsContext += `Family background: ${constraints.family}\n`;
      
      // Add first-generation student context
      if (constraints.family === 'no') {
        constraintsContext += `NOTE: I would be the first in my family to go to university (first-generation student).\n`;
      }
    }
    
    constraintsContext += `INSTRUCTION: Consider these constraints when suggesting career paths and education options. `;
    constraintsContext += `Provide practical alternatives that work within these limitations.`;
    
    this.contextSections.push('constraints-context');
    return constraintsContext;
  }

  /**
   * Build grade-specific guidance requests
   * @param {number} grade 
   * @param {string} timelineContext 
   * @returns {string} Grade-specific guidance
   */
  buildGradeSpecificGuidance(grade, timelineContext) {
    let guidance = `\n\n=== GRADE-SPECIFIC GUIDANCE NEEDED ===\n`;
    
    if (grade === 12) {
      if (timelineContext === 'final-exam-period') {
        guidance += `I need: 1) University application guidance for next year, `;
        guidance += `2) NSFAS funding options and deadlines, `;
        guidance += `3) Results-based planning (results expected December), `;
        guidance += `4) Gap year alternatives if needed.`;
      } else if (timelineContext === 'pre-finals') {
        guidance += `I need: 1) Focus strategies for remaining exams, `;
        guidance += `2) Stress management techniques, `;
        guidance += `3) Post-exam planning guidance.`;
      } else {
        guidance += `I need: 1) What marks I need in upcoming finals, `;
        guidance += `2) Bursaries with approaching deadlines, `;
        guidance += `3) Application preparation timeline, `;
        guidance += `4) Realistic backup options.`;
      }
    } else if (grade === 11) {
      guidance += `I need: 1) What marks to target by end of Grade 12, `;
      guidance += `2) Bursaries to apply for next year, `;
      guidance += `3) Year-by-year improvement plan (Grade 11→12), `;
      guidance += `4) Subject choices to reconsider.`;
    } else {
      guidance += `I need: 1) Mark targets for Grade 12, `;
      guidance += `2) Bursaries I can qualify for, `;
      guidance += `3) Year-by-year plan (Grade ${grade}→12), `;
      guidance += `4) Backup career options.`;
    }
    
    return guidance;
  }

  /**
   * Assemble all sections into final structured query
   * @param {Object} context 
   * @returns {string} Complete structured query
   */
  assembleStructuredQuery(context) {
    let structuredQuery = '';
    
    // Start with base context
    structuredQuery += context.baseContext;
    
    // Add priority requests
    if (context.priorityRequests) {
      structuredQuery += `\n\n${context.priorityRequests}`;
    }
    
    // Add motivation context (NEW - previously ignored)
    if (context.motivationContext) {
      structuredQuery += context.motivationContext;
    }
    
    // Add concerns context (NEW - previously ignored)
    if (context.concernsContext) {
      structuredQuery += context.concernsContext;
    }
    
    // Add academic context
    if (context.academicContext) {
      structuredQuery += context.academicContext;
    }
    
    // Add constraints context
    if (context.constraintsContext) {
      structuredQuery += context.constraintsContext;
    }
    
    return structuredQuery.trim();
  }

  /**
   * Get timeline message based on grade and context
   * @param {number} grade 
   * @param {string} timelineContext 
   * @returns {string} Timeline message
   */
  getTimelineMessage(grade, timelineContext) {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    let message = `Today is ${currentMonth} ${currentYear}. `;
    
    if (grade === 12) {
      if (timelineContext === 'final-exam-period') {
        message += `I am in my final exam period of Grade 12. `;
      } else if (timelineContext === 'pre-finals') {
        message += `I am preparing for my Grade 12 final exams. `;
      } else {
        message += `I am in Grade 12 working toward my final exams. `;
      }
    } else if (grade === 11) {
      if (timelineContext === 'end-of-year') {
        message += `I am completing my Grade 11 year. `;
      } else {
        message += `I am progressing through Grade 11. `;
      }
    } else {
      message += `I am in Grade ${grade} exploring career options. `;
    }
    
    return message;
  }

  /**
   * Build fallback context when main building fails
   * @param {Object} studentProfile 
   * @returns {Object} Fallback context
   */
  buildFallbackContext(studentProfile) {
    const grade = studentProfile.demographics?.grade || 10;
    const enjoyedSubjects = studentProfile.academic?.enjoyedSubjects || [];
    const careerInterests = studentProfile.careerInterests?.rawText || '';
    
    let fallbackQuery = `I am a Grade ${grade} student in South Africa. `;
    
    if (enjoyedSubjects.length > 0) {
      fallbackQuery += `Subjects I enjoy: ${enjoyedSubjects.join(', ')}. `;
    }
    
    if (careerInterests) {
      fallbackQuery += `Career interests: ${careerInterests}. `;
    }
    
    fallbackQuery += `Please provide career guidance based on this information.`;
    
    return {
      baseContext: fallbackQuery,
      priorityRequests: '',
      motivationContext: '',
      concernsContext: '',
      academicContext: '',
      constraintsContext: '',
      structuredQuery: fallbackQuery,
      metadata: {
        sectionsIncluded: 1,
        priorityRequestsCount: 0,
        structuredAt: new Date().toISOString(),
        profileCompleteness: 0,
        fallback: true
      }
    };
  }

  /**
   * Validate context structure
   * @param {Object} context 
   * @returns {Object} Validation results
   */
  validateContext(context) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      completeness: 0
    };
    
    // Check required sections
    if (!context.baseContext || context.baseContext.trim().length === 0) {
      validation.errors.push('Missing base context');
      validation.isValid = false;
    }
    
    if (!context.structuredQuery || context.structuredQuery.trim().length === 0) {
      validation.errors.push('Missing structured query');
      validation.isValid = false;
    }
    
    // Check completeness
    const totalPossibleSections = 6; // base, priority, motivation, concerns, academic, constraints
    validation.completeness = Math.round((context.metadata.sectionsIncluded / totalPossibleSections) * 100);
    
    // Add warnings for missing important sections
    if (!context.motivationContext && !context.concernsContext) {
      validation.warnings.push('No questionnaire context included - may reduce personalization');
    }
    
    if (!context.academicContext) {
      validation.warnings.push('No academic performance context - may reduce accuracy');
    }
    
    return validation;
  }

  /**
   * Get context statistics
   * @param {Object} context 
   * @returns {Object} Context statistics
   */
  getContextStatistics(context) {
    return {
      totalLength: context.structuredQuery.length,
      sectionsIncluded: context.metadata.sectionsIncluded,
      priorityRequestsCount: context.metadata.priorityRequestsCount,
      hasMotivationContext: Boolean(context.motivationContext),
      hasConcernsContext: Boolean(context.concernsContext),
      hasAcademicContext: Boolean(context.academicContext),
      hasConstraintsContext: Boolean(context.constraintsContext),
      completenessScore: context.metadata.profileCompleteness
    };
  }
}