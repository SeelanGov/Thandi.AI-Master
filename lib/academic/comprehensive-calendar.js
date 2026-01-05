// lib/academic/comprehensive-calendar.js
// Comprehensive South African Academic Calendar & Student Progression System
// Based on official Department of Basic Education calendar data

/**
 * Efficient School SaaS Academic Calendar System
 * - Official DBE calendar compliance
 * - Student progression tracking
 * - Contextual guidance system
 * - Grade-specific logic
 */

class AcademicCalendar {
  constructor() {
    // Official SA Academic Calendar Data (DBE Verified)
    this.academicYears = {
      2025: {
        year: 2025,
        startDate: new Date(2025, 0, 15), // 15 January 2025
        endDate: new Date(2025, 11, 10),  // 10 December 2025
        totalSchoolDays: 200,
        status: 'completed',
        terms: [
          {
            term: 1,
            startDate: new Date(2025, 0, 15),  // 15 Jan
            endDate: new Date(2025, 2, 28),    // 28 Mar
            weeks: 11,
            schoolDays: 52
          },
          {
            term: 2,
            startDate: new Date(2025, 3, 8),   // 8 Apr
            endDate: new Date(2025, 5, 27),    // 27 Jun
            weeks: 12,
            schoolDays: 51
          },
          {
            term: 3,
            startDate: new Date(2025, 6, 22),  // 22 Jul
            endDate: new Date(2025, 9, 3),     // 3 Oct
            weeks: 11,
            schoolDays: 53
          },
          {
            term: 4,
            startDate: new Date(2025, 9, 13),  // 13 Oct
            endDate: new Date(2025, 11, 10),   // 10 Dec
            weeks: 9,
            schoolDays: 43
          }
        ],
        examinations: {
          preliminaryExams: {
            startDate: new Date(2025, 7, 25), // Late August
            endDate: new Date(2025, 9, 2),    // Early October
            grade12Only: true
          },
          finalExams: {
            startDate: new Date(2025, 9, 21), // 21 October
            endDate: new Date(2025, 10, 27),  // 27 November
            grade12Only: true
          },
          resultsRelease: new Date(2026, 0, 14) // 14 January 2026
        }
      },
      2026: {
        year: 2026,
        startDate: new Date(2026, 0, 14), // 14 January 2026
        endDate: new Date(2026, 11, 9),   // 9 December 2026
        totalSchoolDays: 200,
        status: 'current',
        unifiedCalendar: true, // Major change: all provinces same dates
        terms: [
          {
            term: 1,
            startDate: new Date(2026, 0, 14),  // 14 Jan
            endDate: new Date(2026, 2, 27),    // 27 Mar
            weeks: 11,
            schoolDays: 53
          },
          {
            term: 2,
            startDate: new Date(2026, 3, 8),   // 8 Apr
            endDate: new Date(2026, 5, 26),    // 26 Jun
            weeks: 12,
            schoolDays: 54
          },
          {
            term: 3,
            startDate: new Date(2026, 6, 21),  // 21 Jul
            endDate: new Date(2026, 8, 23),    // 23 Sep
            weeks: 10,
            schoolDays: 46
          },
          {
            term: 4,
            startDate: new Date(2026, 9, 6),   // 6 Oct
            endDate: new Date(2026, 11, 9),    // 9 Dec
            weeks: 10,
            schoolDays: 47
          }
        ],
        examinations: {
          preliminaryExams: {
            startDate: new Date(2026, 7, 25), // Late August (expected)
            endDate: new Date(2026, 9, 2),    // Early October (expected)
            grade12Only: true
          },
          finalExams: {
            startDate: new Date(2026, 9, 15), // Mid-October (expected)
            endDate: new Date(2026, 10, 27),  // Late November (expected)
            grade12Only: true
          },
          resultsRelease: new Date(2027, 0, 14) // Mid-January 2027 (expected)
        }
      }
    };

    // Student Progression Logic
    this.studentProgression = {
      grade10: {
        gradeLevel: 10,
        academicPhase: "FET",
        hasMarks: false,
        marksSource: null,
        context: "new",
        description: "New Grade 10 student, first year of FET phase",
        guidanceFocus: [
          "Career exploration",
          "Subject selection confirmation", 
          "Study habit development",
          "Academic foundation building"
        ]
      },
      grade11: {
        gradeLevel: 11,
        academicPhase: "FET",
        hasMarks: true,
        marksSource: "Grade 10 (previous year)",
        context: "continuing",
        description: "Grade 11 student with Grade 10 marks available",
        guidanceFocus: [
          "Grade 11-12 planning",
          "University research",
          "Mark improvement strategies",
          "Subject viability confirmation"
        ]
      },
      grade12: {
        gradeLevel: 12,
        academicPhase: "FET",
        hasMarks: true,
        marksSource: "Grade 11 (previous year)",
        context: "final",
        description: "Grade 12 final year student, matric year",
        guidanceFocus: [
          "Final year strategy",
          "University applications",
          "Mark targets",
          "Backup plan development"
        ]
      }
    };
  }

  /**
   * Get current academic year (efficient calculation)
   */
  getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    
    // Academic year runs January-December
    // If before January 15, still in previous year
    if (now.getMonth() === 0 && now.getDate() < 15) {
      return year - 1;
    }
    return year;
  }

  /**
   * Get current term (efficient lookup)
   */
  getCurrentTerm(academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.academicYears[academicYear];
    
    if (!yearData) return null;

    for (const term of yearData.terms) {
      if (now >= term.startDate && now <= term.endDate) {
        return term.term;
      }
    }
    return null;
  }

  /**
   * Detect student status based on grade and current year
   * Core logic for school SaaS efficiency
   */
  detectStudentStatus(gradeLevel, availableMarks = null) {
    const currentYear = this.getCurrentAcademicYear();
    const currentTerm = this.getCurrentTerm(currentYear);
    
    const status = {
      gradeLevel,
      currentAcademicYear: currentYear,
      currentTerm,
      isNewStudent: false,
      isContinuingStudent: false,
      isMatricStudent: false,
      hasMarks: false,
      marksSource: null,
      context: null,
      guidanceFocus: [],
      academicPhase: "FET"
    };

    // Apply progression logic
    const progressionData = this.studentProgression[`grade${gradeLevel}`];
    if (progressionData) {
      Object.assign(status, progressionData);
      
      // Override hasMarks based on actual data
      status.hasMarks = !!availableMarks;
      
      // Set student type flags
      status.isNewStudent = (gradeLevel === 10);
      status.isContinuingStudent = (gradeLevel === 11 || gradeLevel === 12);
      status.isMatricStudent = (gradeLevel === 12);
    }

    return status;
  }

  /**
   * Build contextual query for RAG system
   * Optimized for school SaaS efficiency
   */
  buildContextualQuery(gradeLevel, availableMarks = null) {
    const status = this.detectStudentStatus(gradeLevel, availableMarks);
    const currentYear = this.getCurrentAcademicYear();
    const currentTerm = this.getCurrentTerm(currentYear);
    
    let query = `I'm a Grade ${gradeLevel} student`;
    
    if (currentTerm) {
      query += ` in Term ${currentTerm} of ${currentYear}`;
    }

    if (status.isNewStudent) {
      query += `, first year of high school, no marks available yet`;
    } else if (status.hasMarks) {
      query += `, with marks from Grade ${gradeLevel - 1}`;
    }

    if (status.isMatricStudent) {
      query += `, my final matric year`;
    }

    query += `. ${status.description}.`;

    return query;
  }

  /**
   * Check if in examination period (Grade 12 specific)
   */
  isExaminationPeriod(academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.academicYears[academicYear];
    
    if (!yearData) return false;

    const { preliminaryExams, finalExams } = yearData.examinations;
    
    return (
      (now >= preliminaryExams.startDate && now <= preliminaryExams.endDate) ||
      (now >= finalExams.startDate && now <= finalExams.endDate)
    );
  }

  /**
   * Get assessment context for current period
   */
  getAssessmentContext(gradeLevel, currentTerm = this.getCurrentTerm()) {
    const contexts = {
      10: {
        1: "Building foundational knowledge",
        2: "Consolidating learning", 
        3: "Preparing for year-end assessments",
        4: "Final assessments and year-end marks"
      },
      11: {
        1: "Reviewing Grade 10 performance",
        2: "Focusing on mark improvement",
        3: "Intensive revision",
        4: "Preparing for Grade 12 transition"
      },
      12: {
        1: "Regular teaching and learning",
        2: "Continuing curriculum coverage",
        3: "Intensive revision begins",
        4: "Preliminary and final examinations"
      }
    };

    return contexts[gradeLevel]?.[currentTerm] || null;
  }

  /**
   * Get days until next milestone
   */
  getDaysUntilMilestone(milestone, academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.academicYears[academicYear];
    
    if (!yearData) return null;

    let targetDate;
    
    switch(milestone) {
      case 'termEnd':
        const currentTerm = this.getCurrentTerm(academicYear);
        const termData = yearData.terms.find(t => t.term === currentTerm);
        targetDate = termData?.endDate;
        break;
      case 'preliminaryExams':
        targetDate = yearData.examinations.preliminaryExams.startDate;
        break;
      case 'finalExams':
        targetDate = yearData.examinations.finalExams.startDate;
        break;
      case 'resultsRelease':
        targetDate = yearData.examinations.resultsRelease;
        break;
      default:
        return null;
    }

    if (!targetDate) return null;

    const diffTime = targetDate - now;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }

  /**
   * Get academic year summary (for school admin dashboards)
   */
  getAcademicYearSummary(academicYear = this.getCurrentAcademicYear()) {
    const yearData = this.academicYears[academicYear];
    if (!yearData) return null;

    return {
      year: yearData.year,
      status: yearData.status,
      totalSchoolDays: yearData.totalSchoolDays,
      currentTerm: this.getCurrentTerm(academicYear),
      isExaminationPeriod: this.isExaminationPeriod(academicYear),
      unifiedCalendar: yearData.unifiedCalendar || false,
      terms: yearData.terms.map(term => ({
        term: term.term,
        weeks: term.weeks,
        schoolDays: term.schoolDays,
        startDate: term.startDate.toLocaleDateString('en-ZA'),
        endDate: term.endDate.toLocaleDateString('en-ZA')
      }))
    };
  }
}

/**
 * Student Context Detector - Efficient helper class
 */
class StudentContextDetector {
  constructor(calendar = new AcademicCalendar()) {
    this.calendar = calendar;
  }

  /**
   * Detect and build complete student context
   * Optimized for school SaaS performance
   */
  getStudentContext(gradeLevel, availableMarks = null) {
    const status = this.calendar.detectStudentStatus(gradeLevel, availableMarks);
    const assessmentContext = this.calendar.getAssessmentContext(gradeLevel, status.currentTerm);
    const contextualQuery = this.calendar.buildContextualQuery(gradeLevel, availableMarks);

    return {
      ...status,
      assessmentContext,
      contextualQuery,
      isExaminationPeriod: this.calendar.isExaminationPeriod(),
      daysUntilTermEnd: this.calendar.getDaysUntilMilestone('termEnd')
    };
  }

  /**
   * Build enhanced RAG query with full context
   */
  buildEnhancedRAGQuery(studentData) {
    const {
      gradeLevel,
      availableMarks,
      subjects,
      marks,
      interests
    } = studentData;

    const context = this.getStudentContext(gradeLevel, availableMarks);
    
    let query = `Student Profile:\n`;
    query += `- Grade: ${gradeLevel}\n`;
    query += `- Academic Year: ${context.currentAcademicYear}\n`;
    query += `- Current Term: ${context.currentTerm}\n`;
    query += `- Student Status: ${context.context}\n`;
    query += `- Academic Phase: ${context.academicPhase}\n`;

    if (context.hasMarks && marks) {
      query += `- Available Marks: Grade ${gradeLevel - 1} marks\n`;
      query += `- Subject Performance: ${JSON.stringify(marks)}\n`;
    } else {
      query += `- Available Marks: None (new student)\n`;
    }

    if (subjects && subjects.length > 0) {
      query += `- Current Subjects: ${subjects.join(', ')}\n`;
    }

    if (interests && interests.length > 0) {
      query += `- Career Interests: ${interests.join(', ')}\n`;
    }

    query += `\nGuidance Focus Areas:\n`;
    context.guidanceFocus.forEach(focus => {
      query += `- ${focus}\n`;
    });

    if (context.assessmentContext) {
      query += `\nCurrent Assessment Context: ${context.assessmentContext}\n`;
    }

    if (context.isExaminationPeriod) {
      query += `\nNote: Currently in examination period\n`;
    }

    query += `\nContextual Query: ${context.contextualQuery}\n`;

    return query;
  }
}

/**
 * Assessment Period Tracker - For school admin efficiency
 */
class AssessmentPeriodTracker {
  constructor(calendar = new AcademicCalendar()) {
    this.calendar = calendar;
  }

  /**
   * Get current assessment period details
   */
  getCurrentAssessmentPeriod(academicYear = this.calendar.getCurrentAcademicYear()) {
    const currentTerm = this.calendar.getCurrentTerm(academicYear);
    
    const assessmentPeriods = {
      1: "First assessment period (January-March)",
      2: "Second assessment period (April-June)", 
      3: "Third assessment period (July-September)",
      4: "Final assessment period (October-December)"
    };

    return {
      term: currentTerm,
      description: assessmentPeriods[currentTerm] || null,
      isExaminationPeriod: this.calendar.isExaminationPeriod(academicYear)
    };
  }

  /**
   * Get assessment structure for grade (Grade 12 vs others)
   */
  getAssessmentStructure(gradeLevel) {
    if (gradeLevel === 12) {
      return {
        type: "NSC Assessment",
        continuousAssessment: "40% of final mark",
        finalExamination: "60% of final mark",
        components: [
          "Class tests and quizzes",
          "Assignments and projects", 
          "Practical tasks",
          "Oral presentations",
          "Portfolio work",
          "Final NSC examination"
        ]
      };
    }

    return {
      type: "Continuous Assessment",
      continuousAssessment: "Throughout year",
      termMarks: "Recorded each term",
      components: [
        "Class tests",
        "Assignments", 
        "Projects",
        "Practical work",
        "Term assessments"
      ]
    };
  }
}

// Create singleton instances
const academicCalendar = new AcademicCalendar();
const studentContextDetector = new StudentContextDetector(academicCalendar);
const assessmentPeriodTracker = new AssessmentPeriodTracker(academicCalendar);

// Quick utility functions for common operations
const calendarUtils = {
  getCurrentYear: () => academicCalendar.getCurrentAcademicYear(),
  getCurrentTerm: () => academicCalendar.getCurrentTerm(),
  getStudentContext: (grade, marks) => studentContextDetector.getStudentContext(grade, marks),
  buildRAGQuery: (studentData) => studentContextDetector.buildEnhancedRAGQuery(studentData),
  isExamPeriod: () => academicCalendar.isExaminationPeriod(),
  getYearSummary: () => academicCalendar.getAcademicYearSummary()
};

// CommonJS exports - using working pattern
const exports = {
  AcademicCalendar,
  StudentContextDetector,
  AssessmentPeriodTracker,
  academicCalendar,
  studentContextDetector,
  assessmentPeriodTracker,
  calendarUtils
};

module.exports = exports;