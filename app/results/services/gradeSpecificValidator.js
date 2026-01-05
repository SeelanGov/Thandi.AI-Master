/**
 * Grade-Specific Validator Service
 * 
 * This service validates that AI-generated content is appropriate for the student's
 * grade level and flags any grade-inappropriate guidance or information.
 */

export class GradeSpecificValidator {
  constructor(grade) {
    this.grade = grade;
    this.validationRules = this.getValidationRules(grade);
  }

  /**
   * Validate content for grade-specific appropriateness
   * @param {string} content - The AI-generated content to validate
   * @returns {string} The validated content (unchanged, but logged if issues found)
   */
  validateContent(content) {
    const issues = [];
    
    // Check for grade-inappropriate content
    if (this.grade === '10') {
      issues.push(...this.validateGrade10Content(content));
    } else if (this.grade === '11') {
      issues.push(...this.validateGrade11Content(content));
    } else if (this.grade === '12') {
      issues.push(...this.validateGrade12Content(content));
    }
    
    // Check for general grade compliance
    issues.push(...this.validateGeneralCompliance(content));
    
    // Log validation issues for monitoring
    if (issues.length > 0) {
      console.warn(`Grade ${this.grade} content validation issues:`, issues);
      
      // Track validation issues for analytics
      this.trackValidationIssues(issues);
    }
    
    return content;
  }

  /**
   * Validate Grade 10 specific content
   */
  validateGrade10Content(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    // Grade 10 students should focus on exploration, not applications
    if (lowerContent.includes('university applications')) {
      issues.push('Grade 10 students should focus on exploration, not applications');
    }
    
    if (lowerContent.includes('application deadline') && !lowerContent.includes('future')) {
      issues.push('Grade 10 students should see future deadlines, not immediate ones');
    }
    
    // Grade 10 students should not have current APS scores
    if (lowerContent.includes('your aps score') && !lowerContent.includes('projected')) {
      issues.push('Grade 10 students do not have current APS scores');
    }
    
    if (lowerContent.includes('current aps')) {
      issues.push('Grade 10 students should see projected APS, not current APS');
    }
    
    // Grade 10 should not see final year pressure
    if (lowerContent.includes('final year') || lowerContent.includes('matric year')) {
      issues.push('Grade 10 students should not see final year pressure');
    }
    
    // Check for appropriate focus areas
    const hasExplorationFocus = lowerContent.includes('explore') || 
                               lowerContent.includes('discovery') || 
                               lowerContent.includes('foundation');
    
    if (!hasExplorationFocus) {
      issues.push('Grade 10 content should emphasize exploration and foundation building');
    }
    
    return issues;
  }

  /**
   * Validate Grade 11 specific content
   */
  validateGrade11Content(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    // Grade 11 students should not see NSC examination pressure
    if (lowerContent.includes('nsc examinations') && !lowerContent.includes('prepare for')) {
      issues.push('Grade 11 students should focus on Grade 11 performance first');
    }
    
    if (lowerContent.includes('matric exams') && !lowerContent.includes('next year')) {
      issues.push('Grade 11 students should prepare for next year\'s matric exams');
    }
    
    // Grade 11 should not see subject change options (too late)
    if (lowerContent.includes('change subjects') && !lowerContent.includes('limited')) {
      issues.push('Grade 11 students have limited subject change options');
    }
    
    // Check for strategic planning focus
    const hasStrategicFocus = lowerContent.includes('research') || 
                             lowerContent.includes('planning') || 
                             lowerContent.includes('improvement');
    
    if (!hasStrategicFocus) {
      issues.push('Grade 11 content should emphasize strategic planning and research');
    }
    
    // Grade 11 should reference Grade 10 marks
    if (!lowerContent.includes('grade 10') && !lowerContent.includes('previous year')) {
      issues.push('Grade 11 content should reference Grade 10 performance context');
    }
    
    return issues;
  }

  /**
   * Validate Grade 12 specific content
   */
  validateGrade12Content(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    // Grade 12 students cannot change subjects
    if (lowerContent.includes('change subjects') || lowerContent.includes('subject changes')) {
      issues.push('Grade 12 students cannot change subjects');
    }
    
    if (lowerContent.includes('subject selection') && !lowerContent.includes('chosen')) {
      issues.push('Grade 12 students have already selected subjects');
    }
    
    // Grade 12 should not see long-term exploration
    if (lowerContent.includes('explore careers') && !lowerContent.includes('final')) {
      issues.push('Grade 12 students should focus on final decisions, not broad exploration');
    }
    
    // Grade 12 should see urgency and deadlines
    const hasUrgency = lowerContent.includes('deadline') || 
                      lowerContent.includes('urgent') || 
                      lowerContent.includes('critical');
    
    if (!hasUrgency) {
      issues.push('Grade 12 content should emphasize urgency and deadlines');
    }
    
    // Grade 12 should reference Grade 11 marks
    if (!lowerContent.includes('grade 11') && !lowerContent.includes('previous year')) {
      issues.push('Grade 12 content should reference Grade 11 performance context');
    }
    
    return issues;
  }

  /**
   * Validate general grade compliance
   */
  validateGeneralCompliance(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    // Check for grade-specific timeline mentions
    const timelinePatterns = {
      '10': ['3 years', 'foundation', 'building'],
      '11': ['2 years', 'strategic', 'planning'],
      '12': ['1 year', 'final', 'critical']
    };
    
    const expectedPatterns = timelinePatterns[this.grade] || [];
    const hasAppropriateTimeline = expectedPatterns.some(pattern => 
      lowerContent.includes(pattern)
    );
    
    if (!hasAppropriateTimeline) {
      issues.push(`Content should include Grade ${this.grade} appropriate timeline references`);
    }
    
    // Check for marks context appropriateness
    const marksAvailable = this.getMarksAvailability();
    
    if (!marksAvailable && lowerContent.includes('your marks')) {
      issues.push(`Grade ${this.grade} students do not have previous marks available`);
    }
    
    if (marksAvailable && !lowerContent.includes('marks') && !lowerContent.includes('performance')) {
      issues.push(`Grade ${this.grade} content should reference available marks context`);
    }
    
    return issues;
  }

  /**
   * Get validation rules for specific grade
   */
  getValidationRules(grade) {
    return {
      '10': {
        allowedConcepts: [
          'career exploration', 
          'subject confirmation', 
          'foundation building',
          'study habits',
          'broad career options',
          'subject adjustment'
        ],
        forbiddenConcepts: [
          'university applications', 
          'current APS score', 
          'final year pressure',
          'application deadlines',
          'matric stress'
        ],
        timeHorizon: '3 years',
        marksAvailable: false,
        focusAreas: ['exploration', 'foundation', 'discovery'],
        urgencyLevel: 'low'
      },
      '11': {
        allowedConcepts: [
          'university research', 
          'mark improvement', 
          'strategic planning',
          'bursary preparation',
          'grade 10 performance',
          'subject optimization'
        ],
        forbiddenConcepts: [
          'subject changes', 
          'NSC pressure', 
          'final applications',
          'matric examinations',
          'last chance'
        ],
        timeHorizon: '2 years', 
        marksAvailable: true,
        focusAreas: ['research', 'planning', 'improvement'],
        urgencyLevel: 'medium'
      },
      '12': {
        allowedConcepts: [
          'university applications', 
          'NSC preparation', 
          'final decisions',
          'application deadlines',
          'grade 11 performance',
          'backup planning'
        ],
        forbiddenConcepts: [
          'subject changes', 
          'long-term exploration', 
          'foundation building',
          'broad career discovery',
          'subject selection'
        ],
        timeHorizon: '1 year',
        marksAvailable: true,
        focusAreas: ['applications', 'preparation', 'decisions'],
        urgencyLevel: 'high'
      }
    }[grade] || {};
  }

  /**
   * Check if marks are available for this grade
   */
  getMarksAvailability() {
    return {
      '10': false, // No previous marks
      '11': true,  // Grade 10 marks available
      '12': true   // Grade 11 marks available
    }[this.grade] || false;
  }

  /**
   * Get expected urgency level for grade
   */
  getExpectedUrgency() {
    return {
      '10': 'LOW',     // Foundation year, no rush
      '11': 'MEDIUM',  // Planning year, moderate urgency
      '12': 'HIGH'     // Final year, high urgency
    }[this.grade] || 'MEDIUM';
  }

  /**
   * Validate timeline appropriateness
   */
  validateTimeline(content) {
    const timelineMap = {
      '10': '3 years to matric',
      '11': '2 years to matric',
      '12': '1 year to matric'
    };
    
    const expectedTimeline = timelineMap[this.grade];
    const lowerContent = content.toLowerCase();
    
    if (expectedTimeline && !lowerContent.includes(expectedTimeline.toLowerCase())) {
      return [`Content should mention appropriate timeline: ${expectedTimeline}`];
    }
    
    return [];
  }

  /**
   * Validate focus areas appropriateness
   */
  validateFocusAreas(content) {
    const issues = [];
    const rules = this.validationRules;
    const lowerContent = content.toLowerCase();
    
    // Check for forbidden concepts
    rules.forbiddenConcepts?.forEach(concept => {
      if (lowerContent.includes(concept.toLowerCase())) {
        issues.push(`Grade ${this.grade} content should not include: ${concept}`);
      }
    });
    
    // Check for required concepts
    const hasAllowedConcepts = rules.allowedConcepts?.some(concept => 
      lowerContent.includes(concept.toLowerCase())
    );
    
    if (!hasAllowedConcepts) {
      issues.push(`Grade ${this.grade} content should include appropriate concepts: ${rules.allowedConcepts?.join(', ')}`);
    }
    
    return issues;
  }

  /**
   * Track validation issues for analytics and monitoring
   */
  trackValidationIssues(issues) {
    // This would integrate with your analytics system
    try {
      // Example analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'grade_validation_issue', {
          grade: this.grade,
          issue_count: issues.length,
          issues: issues.join('; ')
        });
      }
      
      // Log for server-side monitoring
      console.log('Grade validation tracking:', {
        grade: this.grade,
        timestamp: new Date().toISOString(),
        issues: issues
      });
      
    } catch (error) {
      console.error('Failed to track validation issues:', error);
    }
  }

  /**
   * Generate grade-appropriate content suggestions
   */
  generateContentSuggestions() {
    const rules = this.validationRules;
    
    return {
      recommendedConcepts: rules.allowedConcepts || [],
      avoidConcepts: rules.forbiddenConcepts || [],
      timeHorizon: rules.timeHorizon,
      focusAreas: rules.focusAreas || [],
      urgencyLevel: rules.urgencyLevel,
      marksContext: this.getMarksAvailability() ? 
        `Previous year marks available for planning` : 
        `Building academic foundation - no previous marks yet`
    };
  }

  /**
   * Validate specific content sections
   */
  validateSection(sectionContent, sectionType) {
    const issues = [];
    
    switch (sectionType) {
      case 'header':
        issues.push(...this.validateHeaderSection(sectionContent));
        break;
      case 'programs':
        issues.push(...this.validateProgramsSection(sectionContent));
        break;
      case 'bursaries':
        issues.push(...this.validateBursariesSection(sectionContent));
        break;
      case 'actions':
        issues.push(...this.validateActionsSection(sectionContent));
        break;
    }
    
    return issues;
  }

  /**
   * Validate header section content
   */
  validateHeaderSection(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    if (this.grade === '10' && lowerContent.includes('current aps')) {
      issues.push('Grade 10 header should not show current APS score');
    }
    
    if (!this.getMarksAvailability() && lowerContent.includes('your marks')) {
      issues.push(`Grade ${this.grade} header should not reference unavailable marks`);
    }
    
    return issues;
  }

  /**
   * Validate programs section content
   */
  validateProgramsSection(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    if (this.grade === '10' && lowerContent.includes('apply now')) {
      issues.push('Grade 10 programs should be exploratory, not application-focused');
    }
    
    if (this.grade === '12' && !lowerContent.includes('deadline')) {
      issues.push('Grade 12 programs should emphasize application deadlines');
    }
    
    return issues;
  }

  /**
   * Validate bursaries section content
   */
  validateBursariesSection(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    if (this.grade === '10' && lowerContent.includes('urgent')) {
      issues.push('Grade 10 bursaries should be informational, not urgent');
    }
    
    if (this.grade === '12' && !lowerContent.includes('deadline')) {
      issues.push('Grade 12 bursaries should emphasize application deadlines');
    }
    
    return issues;
  }

  /**
   * Validate actions section content
   */
  validateActionsSection(content) {
    const issues = [];
    const lowerContent = content.toLowerCase();
    
    const expectedActions = {
      '10': ['explore', 'foundation', 'subjects'],
      '11': ['research', 'improve', 'plan'],
      '12': ['apply', 'prepare', 'decide']
    };
    
    const expected = expectedActions[this.grade] || [];
    const hasAppropriateActions = expected.some(action => 
      lowerContent.includes(action)
    );
    
    if (!hasAppropriateActions) {
      issues.push(`Grade ${this.grade} actions should include: ${expected.join(', ')}`);
    }
    
    return issues;
  }
}