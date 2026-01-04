// Pure CommonJS Academic Calendar - No ES6 syntax
console.log('Loading pure CommonJS calendar...');

function AcademicCalendar() {
  console.log('Creating AcademicCalendar...');
  
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
      ]
    },
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
      description: "New Grade 10 student, first year of Senior Phase",
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

AcademicCalendar.prototype.getCurrentAcademicYear = function() {
  var now = new Date();
  var year = now.getFullYear();
  
  // Academic year starts January 14 (DBE official date)
  if (now.getMonth() === 0 && now.getDate() < 14) {
    return year - 1;
  }
  return year;
};

AcademicCalendar.prototype.getCurrentTerm = function(academicYear) {
  if (!academicYear) {
    academicYear = this.getCurrentAcademicYear();
  }
  
  var now = new Date();
  var yearData = this.academicYears[academicYear];
  
  if (!yearData) return null;

  for (var i = 0; i < yearData.terms.length; i++) {
    var term = yearData.terms[i];
    if (now >= term.startDate && now <= term.endDate) {
      return term.term;
    }
  }
  return null;
};

AcademicCalendar.prototype.getStudentContext = function(gradeLevel, availableMarks) {
  var currentYear = this.getCurrentAcademicYear();
  var currentTerm = this.getCurrentTerm(currentYear);
  
  var progressionData = this.studentProgression['grade' + gradeLevel];
  
  var context = {
    gradeLevel: gradeLevel,
    currentAcademicYear: currentYear,
    currentTerm: currentTerm,
    hasMarks: !!availableMarks
  };
  
  if (progressionData) {
    context.context = progressionData.context;
    context.description = progressionData.description;
    context.guidanceFocus = progressionData.guidanceFocus;
  }
  
  return context;
};

AcademicCalendar.prototype.buildContextualQuery = function(gradeLevel, availableMarks) {
  var context = this.getStudentContext(gradeLevel, availableMarks);
  
  var query = "I'm a Grade " + gradeLevel + " student";
  
  if (context.currentTerm) {
    query += " in Term " + context.currentTerm + " of " + context.currentAcademicYear;
  }

  if (context.context === 'new') {
    query += ", first year of high school, no marks available yet";
  } else if (context.hasMarks) {
    query += ", with marks from Grade " + (gradeLevel - 1);
  }

  if (context.context === 'final') {
    query += ", my final matric year";
  }

  query += ". " + context.description + ".";

  return query;
};

// Create instance
console.log('Creating calendar instance...');
var academicCalendar = new AcademicCalendar();

// Create utility functions
var calendarUtils = {
  getCurrentYear: function() { return academicCalendar.getCurrentAcademicYear(); },
  getCurrentTerm: function() { return academicCalendar.getCurrentTerm(); },
  getStudentContext: function(grade, marks) { return academicCalendar.getStudentContext(grade, marks); },
  buildRAGQuery: function(grade, marks) { return academicCalendar.buildContextualQuery(grade, marks); }
};

// Set up exports
console.log('Setting up exports...');
var exports = {
  AcademicCalendar: AcademicCalendar,
  academicCalendar: academicCalendar,
  calendarUtils: calendarUtils
};

console.log('Exports ready:', Object.keys(exports));

module.exports = exports;