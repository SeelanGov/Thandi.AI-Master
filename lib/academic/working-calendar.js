// Working Academic Calendar - Step by step build
console.log('Loading working calendar...');

// Step 1: Basic Academic Calendar Class
class AcademicCalendar {
  constructor() {
    console.log('Creating AcademicCalendar...');
    
    // Official SA Academic Calendar Data (DBE Verified)
    this.academicYears = {
      2026: {
        year: 2026,
        startDate: new Date(2026, 0, 14), // 14 January 2026
        endDate: new Date(2026, 11, 9),   // 9 December 2026
        totalSchoolDays: 200,
        status: 'current',
        unifiedCalendar: true,
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
        ]
      }
    };

    // Student Progression Logic
    this.studentProgression = {
      grade10: {
        gradeLevel: 10,
        context: "new",
        description: "New Grade 10 student, first year of FET phase",
        hasMarks: false,
        guidanceFocus: ["Career exploration", "Subject selection confirmation"]
      },
      grade11: {
        gradeLevel: 11,
        context: "continuing",
        description: "Grade 11 student with Grade 10 marks available",
        hasMarks: true,
        guidanceFocus: ["University research", "Mark improvement strategies"]
      },
      grade12: {
        gradeLevel: 12,
        context: "final",
        description: "Grade 12 final year student, matric year",
        hasMarks: true,
        guidanceFocus: ["University applications", "Final year strategy"]
      }
    };
  }

  getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    
    // If before January 15, still in previous year
    if (now.getMonth() === 0 && now.getDate() < 15) {
      return year - 1;
    }
    return year;
  }

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

  getStudentContext(gradeLevel, availableMarks = null) {
    const currentYear = this.getCurrentAcademicYear();
    const currentTerm = this.getCurrentTerm(currentYear);
    
    const progressionData = this.studentProgression[`grade${gradeLevel}`];
    
    return {
      gradeLevel,
      currentAcademicYear: currentYear,
      currentTerm,
      hasMarks: !!availableMarks,
      ...progressionData
    };
  }

  buildContextualQuery(gradeLevel, availableMarks = null) {
    const context = this.getStudentContext(gradeLevel, availableMarks);
    
    let query = `I'm a Grade ${gradeLevel} student`;
    
    if (context.currentTerm) {
      query += ` in Term ${context.currentTerm} of ${context.currentAcademicYear}`;
    }

    if (context.context === 'new') {
      query += `, first year of high school, no marks available yet`;
    } else if (context.hasMarks) {
      query += `, with marks from Grade ${gradeLevel - 1}`;
    }

    if (context.context === 'final') {
      query += `, my final matric year`;
    }

    query += `. ${context.description}.`;

    return query;
  }
}

// Step 2: Create instances
console.log('Creating calendar instance...');
const academicCalendar = new AcademicCalendar();

// Step 3: Create utility functions
const calendarUtils = {
  getCurrentYear: () => academicCalendar.getCurrentAcademicYear(),
  getCurrentTerm: () => academicCalendar.getCurrentTerm(),
  getStudentContext: (grade, marks) => academicCalendar.getStudentContext(grade, marks),
  buildRAGQuery: (grade, marks) => academicCalendar.buildContextualQuery(grade, marks)
};

// Step 4: Set up exports
console.log('Setting up exports...');
const exports = {
  AcademicCalendar,
  academicCalendar,
  calendarUtils
};

console.log('Exports ready:', Object.keys(exports));

module.exports = exports;