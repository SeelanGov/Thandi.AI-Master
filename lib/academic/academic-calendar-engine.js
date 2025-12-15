/**
 * Academic Calendar Engine - South African Academic Calendar Intelligence
 * 
 * Provides accurate timeline calculations and academic phase detection
 * for South African school system (CAPS and IEB curricula)
 * 
 * Critical for fixing hardcoded "finals in 1 month" messaging
 */

class AcademicCalendarEngine {
  constructor() {
    this.academicCalendar = this.initializeAcademicCalendar();
    this.currentYear = new Date().getFullYear();
  }

  /**
   * Initialize South African academic calendar structure
   * Based on Department of Basic Education guidelines
   */
  initializeAcademicCalendar() {
    return {
      2025: {
        terms: {
          1: { start: new Date(2025, 0, 15), end: new Date(2025, 2, 28) }, // Jan 15 - Mar 28
          2: { start: new Date(2025, 3, 8), end: new Date(2025, 5, 27) },  // Apr 8 - Jun 27
          3: { start: new Date(2025, 6, 15), end: new Date(2025, 8, 19) }, // Jul 15 - Sep 19
          4: { start: new Date(2025, 9, 7), end: new Date(2025, 11, 10) }  // Oct 7 - Dec 10
        },
        examPeriods: {
          midYear: { start: new Date(2025, 4, 26), end: new Date(2025, 5, 13) }, // May 26 - Jun 13
          finals: { start: new Date(2025, 9, 14), end: new Date(2025, 10, 21) }  // Oct 14 - Nov 21
        },
        holidays: {
          easter: { start: new Date(2025, 2, 29), end: new Date(2025, 3, 7) },   // Mar 29 - Apr 7
          winter: { start: new Date(2025, 5, 28), end: new Date(2025, 6, 14) },  // Jun 28 - Jul 14
          spring: { start: new Date(2025, 8, 20), end: new Date(2025, 9, 6) },   // Sep 20 - Oct 6
          summer: { start: new Date(2025, 11, 11), end: new Date(2026, 0, 14) }  // Dec 11 - Jan 14
        },
        applicationDeadlines: {
          university: { start: new Date(2025, 2, 1), end: new Date(2025, 8, 30) }, // Mar 1 - Sep 30
          nsfas: { start: new Date(2025, 0, 1), end: new Date(2025, 11, 31) },     // Jan 1 - Dec 31
          bursaries: { start: new Date(2025, 1, 1), end: new Date(2025, 7, 31) }  // Feb 1 - Aug 31
        }
      },
      2026: {
        terms: {
          1: { start: new Date(2026, 0, 14), end: new Date(2026, 2, 27) },
          2: { start: new Date(2026, 3, 7), end: new Date(2026, 5, 26) },
          3: { start: new Date(2026, 6, 14), end: new Date(2026, 8, 18) },
          4: { start: new Date(2026, 9, 6), end: new Date(2026, 11, 9) }
        },
        examPeriods: {
          midYear: { start: new Date(2026, 4, 25), end: new Date(2026, 5, 12) },
          finals: { start: new Date(2026, 9, 13), end: new Date(2026, 10, 20) }
        },
        holidays: {
          easter: { start: new Date(2026, 2, 28), end: new Date(2026, 3, 6) },
          winter: { start: new Date(2026, 5, 27), end: new Date(2026, 6, 13) },
          spring: { start: new Date(2026, 8, 19), end: new Date(2026, 9, 5) },
          summer: { start: new Date(2026, 11, 10), end: new Date(2027, 0, 13) }
        },
        applicationDeadlines: {
          university: { start: new Date(2026, 2, 1), end: new Date(2026, 8, 30) },
          nsfas: { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) },
          bursaries: { start: new Date(2026, 1, 1), end: new Date(2026, 7, 31) }
        }
      }
    };
  }

  /**
   * Calculate accurate timeline to finals based on current date and grade
   * @param {Date} currentDate - Current date
   * @param {number} grade - Student grade (10, 11, or 12)
   * @returns {Object} Timeline information
   */
  calculateTimelineToFinals(currentDate = new Date(), grade = 12) {
    const year = currentDate.getFullYear();
    const calendar = this.academicCalendar[year];
    
    if (!calendar) {
      return this.getFallbackTimeline(currentDate, grade);
    }

    const finalsStart = calendar.examPeriods.finals.start;
    const finalsEnd = calendar.examPeriods.finals.end;
    
    // Calculate time differences
    const msToFinalsStart = finalsStart.getTime() - currentDate.getTime();
    const msToFinalsEnd = finalsEnd.getTime() - currentDate.getTime();
    
    const daysToFinalsStart = Math.ceil(msToFinalsStart / (1000 * 60 * 60 * 24));
    const daysToFinalsEnd = Math.ceil(msToFinalsEnd / (1000 * 60 * 60 * 24));
    const weeksToFinalsStart = Math.ceil(daysToFinalsStart / 7);
    const monthsToFinalsStart = Math.ceil(daysToFinalsStart / 30);

    // Determine phase
    const phase = this.determineAcademicPhase(currentDate, grade, calendar);
    
    return {
      daysToFinalsStart,
      daysToFinalsEnd,
      weeksToFinalsStart,
      monthsToFinalsStart,
      finalsStartDate: finalsStart,
      finalsEndDate: finalsEnd,
      phase: phase.phase,
      phaseDescription: phase.description,
      timelineMessage: this.generateTimelineMessage(phase, daysToFinalsStart, weeksToFinalsStart, grade),
      isFinalsActive: currentDate >= finalsStart && currentDate <= finalsEnd,
      isFinalsComplete: currentDate > finalsEnd,
      isPreFinalsPhase: currentDate < finalsStart
    };
  }

  /**
   * Determine current academic phase based on date and grade
   * @param {Date} currentDate - Current date
   * @param {number} grade - Student grade
   * @param {Object} calendar - Academic calendar for the year
   * @returns {Object} Phase information
   */
  determineAcademicPhase(currentDate, grade, calendar) {
    const finalsStart = calendar.examPeriods.finals.start;
    const finalsEnd = calendar.examPeriods.finals.end;
    const midYearStart = calendar.examPeriods.midYear.start;
    const midYearEnd = calendar.examPeriods.midYear.end;
    
    // Check if currently in finals period
    if (currentDate >= finalsStart && currentDate <= finalsEnd) {
      return {
        phase: 'finals_active',
        description: 'Final examinations in progress',
        urgency: 'critical',
        focus: 'exam_performance'
      };
    }
    
    // Check if finals are complete
    if (currentDate > finalsEnd) {
      if (grade === 12) {
        return {
          phase: 'post_finals_grade12',
          description: 'Grade 12 finals complete - university preparation phase',
          urgency: 'high',
          focus: 'university_applications'
        };
      } else {
        return {
          phase: 'post_finals_holiday',
          description: 'Finals complete - holiday and preparation for next year',
          urgency: 'low',
          focus: 'rest_and_planning'
        };
      }
    }
    
    // Check if in mid-year exams
    if (currentDate >= midYearStart && currentDate <= midYearEnd) {
      return {
        phase: 'midyear_exams',
        description: 'Mid-year examinations in progress',
        urgency: 'high',
        focus: 'exam_performance'
      };
    }
    
    // Calculate days to finals
    const daysToFinals = Math.ceil((finalsStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToFinals <= 30) {
      return {
        phase: 'finals_approach',
        description: 'Final examinations approaching - intensive preparation phase',
        urgency: 'high',
        focus: 'exam_preparation'
      };
    } else if (daysToFinals <= 90) {
      return {
        phase: 'pre_finals_preparation',
        description: 'Pre-finals preparation phase',
        urgency: 'medium',
        focus: 'academic_improvement'
      };
    } else {
      // Determine term
      const currentTerm = this.getCurrentTerm(currentDate, calendar);
      return {
        phase: `term_${currentTerm}_regular`,
        description: `Term ${currentTerm} - regular academic phase`,
        urgency: 'low',
        focus: 'learning_and_exploration'
      };
    }
  }

  /**
   * Get current academic term
   * @param {Date} currentDate - Current date
   * @param {Object} calendar - Academic calendar
   * @returns {number} Current term (1-4)
   */
  getCurrentTerm(currentDate, calendar) {
    for (let term = 1; term <= 4; term++) {
      const termPeriod = calendar.terms[term];
      if (currentDate >= termPeriod.start && currentDate <= termPeriod.end) {
        return term;
      }
    }
    
    // If not in any term, determine based on proximity
    const term1Start = calendar.terms[1].start;
    const term4End = calendar.terms[4].end;
    
    if (currentDate < term1Start) {
      return 1; // Before year starts, preparing for term 1
    } else if (currentDate > term4End) {
      return 4; // After year ends, term 4 complete
    }
    
    // Find closest term
    let closestTerm = 1;
    let minDistance = Math.abs(currentDate.getTime() - calendar.terms[1].start.getTime());
    
    for (let term = 2; term <= 4; term++) {
      const distance = Math.abs(currentDate.getTime() - calendar.terms[term].start.getTime());
      if (distance < minDistance) {
        minDistance = distance;
        closestTerm = term;
      }
    }
    
    return closestTerm;
  }

  /**
   * Generate contextually appropriate timeline message
   * @param {Object} phase - Academic phase information
   * @param {number} daysToFinals - Days until finals start
   * @param {number} weeksToFinals - Weeks until finals start
   * @param {number} grade - Student grade
   * @returns {string} Timeline message
   */
  generateTimelineMessage(phase, daysToFinals, weeksToFinals, grade) {
    switch (phase.phase) {
      case 'finals_active':
        return `You are currently writing your final examinations. Focus on performing your best in each exam.`;
      
      case 'post_finals_grade12':
        return `Your Grade 12 final examinations are complete! Now is the time to focus on university applications and career planning.`;
      
      case 'post_finals_holiday':
        return `Your final examinations are complete. Enjoy your well-deserved break and start planning for next year.`;
      
      case 'midyear_exams':
        return `You are currently writing mid-year examinations. These results will help guide your final year preparation.`;
      
      case 'finals_approach':
        if (daysToFinals <= 7) {
          return `Final examinations start in ${daysToFinals} day${daysToFinals === 1 ? '' : 's'}. Focus on final revision and exam preparation.`;
        } else if (daysToFinals <= 14) {
          return `Final examinations start in ${daysToFinals} days (${Math.ceil(daysToFinals/7)} week${Math.ceil(daysToFinals/7) === 1 ? '' : 's'}). Intensive preparation time.`;
        } else {
          return `Final examinations start in ${daysToFinals} days (about ${weeksToFinals} weeks). Focus on consistent study and preparation.`;
        }
      
      case 'pre_finals_preparation':
        if (weeksToFinals <= 8) {
          return `Final examinations are ${weeksToFinals} weeks away. This is a crucial preparation period for Grade ${grade}.`;
        } else {
          return `Final examinations are approximately ${Math.ceil(daysToFinals/30)} months away. Focus on building strong foundations.`;
        }
      
      default:
        if (grade === 12) {
          return `As a Grade 12 student, you have ${weeksToFinals} weeks until final examinations. Use this time to build strong academic foundations.`;
        } else {
          return `You have ${weeksToFinals} weeks until final examinations. Focus on learning and exploring your interests.`;
        }
    }
  }

  /**
   * Get fallback timeline for years not in calendar
   * @param {Date} currentDate - Current date
   * @param {number} grade - Student grade
   * @returns {Object} Fallback timeline
   */
  getFallbackTimeline(currentDate, grade) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Estimate finals period (typically October-November)
    let finalsStart = new Date(year, 9, 15); // October 15
    let finalsEnd = new Date(year, 10, 20);  // November 20
    
    // If we're past November, assume next year's finals
    if (month >= 11) {
      finalsStart = new Date(year + 1, 9, 15);
      finalsEnd = new Date(year + 1, 10, 20);
    }
    
    const daysToFinals = Math.ceil((finalsStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksToFinals = Math.ceil(daysToFinals / 7);
    
    let phase, description;
    if (daysToFinals < 0 && currentDate <= finalsEnd) {
      phase = 'finals_active';
      description = 'Final examinations in progress';
    } else if (currentDate > finalsEnd) {
      phase = 'post_finals';
      description = 'Final examinations complete';
    } else if (daysToFinals <= 30) {
      phase = 'finals_approach';
      description = 'Final examinations approaching';
    } else {
      phase = 'regular_academic';
      description = 'Regular academic period';
    }
    
    return {
      daysToFinalsStart: Math.max(0, daysToFinals),
      weeksToFinalsStart: Math.max(0, weeksToFinals),
      finalsStartDate: finalsStart,
      finalsEndDate: finalsEnd,
      phase,
      phaseDescription: description,
      timelineMessage: this.generateTimelineMessage({ phase }, daysToFinals, weeksToFinals, grade),
      isFinalsActive: phase === 'finals_active',
      isFinalsComplete: phase === 'post_finals',
      isPreFinalsPhase: daysToFinals > 0,
      fallback: true
    };
  }

  /**
   * Get relevant deadlines for current date and grade
   * @param {Date} currentDate - Current date
   * @param {number} grade - Student grade
   * @returns {Array} Array of relevant deadlines
   */
  getRelevantDeadlines(currentDate = new Date(), grade = 12) {
    const year = currentDate.getFullYear();
    const calendar = this.academicCalendar[year];
    
    if (!calendar) {
      return [];
    }
    
    const deadlines = [];
    const applicationDeadlines = calendar.applicationDeadlines;
    
    // University application deadlines (primarily for Grade 12)
    if (grade === 12 && currentDate <= applicationDeadlines.university.end) {
      deadlines.push({
        type: 'university_applications',
        description: 'University application deadline',
        date: applicationDeadlines.university.end,
        daysRemaining: Math.ceil((applicationDeadlines.university.end.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'high',
        actionRequired: 'Submit university applications'
      });
    }
    
    // NSFAS deadlines (all grades)
    if (currentDate <= applicationDeadlines.nsfas.end) {
      deadlines.push({
        type: 'nsfas_application',
        description: 'NSFAS funding application deadline',
        date: applicationDeadlines.nsfas.end,
        daysRemaining: Math.ceil((applicationDeadlines.nsfas.end.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'high',
        actionRequired: 'Apply for NSFAS funding'
      });
    }
    
    // Bursary deadlines (primarily Grade 11-12)
    if (grade >= 11 && currentDate <= applicationDeadlines.bursaries.end) {
      deadlines.push({
        type: 'bursary_applications',
        description: 'Private bursary application deadlines',
        date: applicationDeadlines.bursaries.end,
        daysRemaining: Math.ceil((applicationDeadlines.bursaries.end.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'medium',
        actionRequired: 'Research and apply for bursaries'
      });
    }
    
    // Sort by priority and days remaining
    return deadlines
      .filter(deadline => deadline.daysRemaining > 0)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.daysRemaining - b.daysRemaining;
      })
      .slice(0, 5); // Return top 5 most relevant deadlines
  }

  /**
   * Get academic context for query generation
   * @param {Date} currentDate - Current date
   * @param {number} grade - Student grade
   * @returns {Object} Academic context for LLM queries
   */
  getAcademicContext(currentDate = new Date(), grade = 12) {
    const timeline = this.calculateTimelineToFinals(currentDate, grade);
    const deadlines = this.getRelevantDeadlines(currentDate, grade);
    
    return {
      timeline,
      deadlines,
      contextMessage: this.buildContextMessage(timeline, deadlines, grade),
      urgencyLevel: timeline.phase.includes('finals') ? 'high' : 'medium',
      focusArea: this.determineFocusArea(timeline.phase, grade)
    };
  }

  /**
   * Build context message for LLM queries
   * @param {Object} timeline - Timeline information
   * @param {Array} deadlines - Relevant deadlines
   * @param {number} grade - Student grade
   * @returns {string} Context message
   */
  buildContextMessage(timeline, deadlines, grade) {
    let message = timeline.timelineMessage;
    
    if (deadlines.length > 0) {
      message += ' Important upcoming deadlines: ';
      const urgentDeadlines = deadlines.filter(d => d.daysRemaining <= 60);
      if (urgentDeadlines.length > 0) {
        message += urgentDeadlines.map(d => 
          `${d.description} (${d.daysRemaining} days remaining)`
        ).join(', ') + '.';
      }
    }
    
    return message;
  }

  /**
   * Determine focus area based on academic phase and grade
   * @param {string} phase - Academic phase
   * @param {number} grade - Student grade
   * @returns {string} Focus area
   */
  determineFocusArea(phase, grade) {
    if (phase.includes('finals_active')) {
      return 'exam_performance';
    } else if (phase.includes('post_finals') && grade === 12) {
      return 'university_preparation';
    } else if (phase.includes('finals_approach')) {
      return 'exam_preparation';
    } else if (grade === 12) {
      return 'career_planning';
    } else {
      return 'exploration_and_development';
    }
  }

  /**
   * Validate calendar data consistency
   * @param {number} year - Year to validate
   * @returns {Object} Validation results
   */
  validateCalendarData(year) {
    const calendar = this.academicCalendar[year];
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!calendar) {
      validation.isValid = false;
      validation.errors.push(`No calendar data available for year ${year}`);
      return validation;
    }
    
    // Validate term dates
    for (let term = 1; term <= 4; term++) {
      const termData = calendar.terms[term];
      if (!termData || !termData.start || !termData.end) {
        validation.errors.push(`Missing or invalid term ${term} data`);
        validation.isValid = false;
      } else if (termData.start >= termData.end) {
        validation.errors.push(`Term ${term} start date is after end date`);
        validation.isValid = false;
      }
    }
    
    // Validate exam periods
    const { midYear, finals } = calendar.examPeriods;
    if (!midYear || !finals) {
      validation.errors.push('Missing exam period data');
      validation.isValid = false;
    } else {
      if (midYear.start >= midYear.end) {
        validation.errors.push('Mid-year exam start date is after end date');
        validation.isValid = false;
      }
      if (finals.start >= finals.end) {
        validation.errors.push('Finals exam start date is after end date');
        validation.isValid = false;
      }
      if (midYear.end >= finals.start) {
        validation.warnings.push('Mid-year exams end very close to finals start');
      }
    }
    
    return validation;
  }

  /**
   * Update calendar data for a specific year
   * @param {number} year - Year to update
   * @param {Object} calendarData - New calendar data
   * @returns {boolean} Success status
   */
  updateCalendarData(year, calendarData) {
    try {
      // Validate new data
      const tempCalendar = { ...this.academicCalendar };
      tempCalendar[year] = calendarData;
      
      const validation = this.validateCalendarData(year);
      if (!validation.isValid) {
        console.error('Calendar data validation failed:', validation.errors);
        return false;
      }
      
      // Update if valid
      this.academicCalendar[year] = calendarData;
      return true;
    } catch (error) {
      console.error('Error updating calendar data:', error);
      return false;
    }
  }
}

export default AcademicCalendarEngine;