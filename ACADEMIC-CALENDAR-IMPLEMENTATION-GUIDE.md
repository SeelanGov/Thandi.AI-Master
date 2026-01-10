# Academic Calendar Implementation Guide for Thandi

**Purpose**: Integrate official South African academic calendar data into Thandi's system for compliant, contextually-aware student guidance.

**Status**: Ready for Implementation  
**Priority**: High - Core system requirement for school trust and compliance

---

## 1. IMPLEMENTATION OVERVIEW

### 1.1 What Needs to Be Built

1. **Academic Calendar Engine**
   - Store official DBE calendar dates
   - Calculate current term and academic year
   - Determine student cohort (new/continuing)
   - Track assessment periods

2. **Student Context Detection**
   - Identify student grade level
   - Determine if new or continuing student
   - Track available marks (Grade 10 has none, Grade 11 has Grade 10 marks, etc.)
   - Calculate academic progression stage

3. **Assessment Period Awareness**
   - Identify current assessment period
   - Show continuous assessment windows
   - Display examination schedules
   - Track preliminary vs. final exams

4. **Contextual Guidance System**
   - Provide grade-appropriate advice
   - Use academic calendar context
   - Reference relevant deadlines
   - Show subject selection constraints

---

## 2. DATA STRUCTURE

### 2.1 Academic Calendar Data

```javascript
// lib/academic/calendar-data.js

export const academicCalendar = {
  2025: {
    year: 2025,
    startDate: new Date(2025, 0, 15), // 15 January 2025
    endDate: new Date(2025, 11, 10),  // 10 December 2025
    totalSchoolDays: 200,
    totalWeeks: 43,
    terms: [
      {
        term: 1,
        startDate: new Date(2025, 0, 15),
        endDate: new Date(2025, 2, 28),
        weeks: 11,
        schoolDays: 52,
        publicHolidays: [
          { date: new Date(2025, 2, 21), name: "Human Rights Day" }
        ]
      },
      {
        term: 2,
        startDate: new Date(2025, 3, 8),
        endDate: new Date(2025, 5, 27),
        weeks: 12,
        schoolDays: 51,
        publicHolidays: [
          { date: new Date(2025, 3, 18), name: "Good Friday" },
          { date: new Date(2025, 3, 21), name: "Family Day" },
          { date: new Date(2025, 3, 28), name: "Freedom Day (observed)" },
          { date: new Date(2025, 4, 1), name: "Workers' Day" },
          { date: new Date(2025, 5, 16), name: "Youth Day" }
        ]
      },
      {
        term: 3,
        startDate: new Date(2025, 6, 22),
        endDate: new Date(2025, 9, 3),
        weeks: 11,
        schoolDays: 53,
        publicHolidays: [
          { date: new Date(2025, 8, 24), name: "Heritage Day" }
        ]
      },
      {
        term: 4,
        startDate: new Date(2025, 9, 13),
        endDate: new Date(2025, 11, 10),
        weeks: 9,
        schoolDays: 43,
        publicHolidays: []
      }
    ],
    examinations: {
      preliminaryExams: {
        startDate: new Date(2025, 7, 25), // Late August
        endDate: new Date(2025, 9, 2),    // Early October
        provincial: true,
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
    totalWeeks: 43,
    unifiedCalendar: true, // Major change: all provinces same dates
    terms: [
      {
        term: 1,
        startDate: new Date(2026, 0, 14),
        endDate: new Date(2026, 2, 27),
        weeks: 11,
        schoolDays: 53,
        publicHolidays: []
      },
      {
        term: 2,
        startDate: new Date(2026, 3, 8),
        endDate: new Date(2026, 5, 26),
        weeks: 12,
        schoolDays: 54,
        publicHolidays: [
          { date: new Date(2026, 3, 3), name: "Good Friday" },
          { date: new Date(2026, 3, 6), name: "Family Day" },
          { date: new Date(2026, 3, 27), name: "Freedom Day" },
          { date: new Date(2026, 4, 1), name: "Workers' Day" },
          { date: new Date(2026, 5, 16), name: "Youth Day" }
        ]
      },
      {
        term: 3,
        startDate: new Date(2026, 6, 21),
        endDate: new Date(2026, 8, 23),
        weeks: 10,
        schoolDays: 46,
        publicHolidays: [
          { date: new Date(2026, 7, 10), name: "National Women's Day (observed)" }
        ]
      },
      {
        term: 4,
        startDate: new Date(2026, 9, 6),
        endDate: new Date(2026, 11, 9),
        weeks: 10,
        schoolDays: 47,
        publicHolidays: []
      }
    ],
    examinations: {
      preliminaryExams: {
        startDate: new Date(2026, 7, 25), // Late August (expected)
        endDate: new Date(2026, 9, 2),    // Early October (expected)
        provincial: true,
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
```

### 2.2 Student Progression Data

```javascript
// lib/academic/student-progression.js

export const studentProgression = {
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
    ],
    subjectRequirements: {
      compulsory: [
        "Home Language",
        "First Additional Language",
        "Mathematics or Mathematical Literacy",
        "Life Orientation"
      ],
      elective: 3,
      total: 7
    },
    assessmentStructure: {
      continuousAssessment: "Throughout year",
      termMarks: "Recorded each term",
      finalExamination: "End of year"
    }
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
    ],
    subjectRequirements: {
      compulsory: [
        "Home Language",
        "First Additional Language",
        "Mathematics or Mathematical Literacy",
        "Life Orientation"
      ],
      elective: 3,
      total: 7
    },
    assessmentStructure: {
      continuousAssessment: "Throughout year",
      termMarks: "Recorded each term",
      finalExamination: "End of year"
    }
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
    ],
    subjectRequirements: {
      compulsory: [
        "Home Language",
        "First Additional Language",
        "Mathematics or Mathematical Literacy",
        "Life Orientation"
      ],
      elective: 3,
      total: 7
    },
    assessmentStructure: {
      continuousAssessment: "40% of final mark",
      finalExamination: "60% of final mark",
      preliminaryExams: "August-September",
      finalExams: "October-November",
      resultsRelease: "January (following year)"
    }
  }
};
```

---

## 3. IMPLEMENTATION COMPONENTS

### 3.1 Academic Calendar Engine

```javascript
// lib/academic/calendar-engine.js

export class AcademicCalendarEngine {
  constructor() {
    this.calendar = academicCalendar;
  }

  /**
   * Get current academic year
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
   * Get current term
   */
  getCurrentTerm(academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.calendar[academicYear];
    
    if (!yearData) return null;

    for (const term of yearData.terms) {
      if (now >= term.startDate && now <= term.endDate) {
        return term.term;
      }
    }
    return null;
  }

  /**
   * Get term details
   */
  getTermDetails(term, academicYear = this.getCurrentAcademicYear()) {
    const yearData = this.calendar[academicYear];
    if (!yearData) return null;

    return yearData.terms.find(t => t.term === term);
  }

  /**
   * Check if in examination period
   */
  isExaminationPeriod(academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.calendar[academicYear];
    
    if (!yearData) return false;

    const { preliminaryExams, finalExams } = yearData.examinations;
    
    return (
      (now >= preliminaryExams.startDate && now <= preliminaryExams.endDate) ||
      (now >= finalExams.startDate && now <= finalExams.endDate)
    );
  }

  /**
   * Get days until next milestone
   */
  getDaysUntilMilestone(milestone, academicYear = this.getCurrentAcademicYear()) {
    const now = new Date();
    const yearData = this.calendar[academicYear];
    
    if (!yearData) return null;

    let targetDate;
    
    switch(milestone) {
      case 'termEnd':
        const currentTerm = this.getCurrentTerm(academicYear);
        const termData = this.getTermDetails(currentTerm, academicYear);
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
```

### 3.2 Student Context Detector

```javascript
// lib/academic/student-context.js

export class StudentContextDetector {
  /**
   * Detect student status based on grade and marks
   */
  detectStudentStatus(gradeLevel, availableMarks = null) {
    const status = {
      gradeLevel,
      isNewStudent: false,
      isContinuingStudent: false,
      isMatricStudent: false,
      hasMarks: false,
      marksSource: null,
      context: null,
      guidanceFocus: []
    };

    switch(gradeLevel) {
      case 10:
        status.isNewStudent = true;
        status.hasMarks = false;
        status.context = "new";
        status.guidanceFocus = [
          "Career exploration",
          "Subject selection confirmation",
          "Study habit development"
        ];
        break;

      case 11:
        status.isContinuingStudent = true;
        status.hasMarks = !!availableMarks;
        status.marksSource = "Grade 10 (previous year)";
        status.context = "continuing";
        status.guidanceFocus = [
          "Grade 11-12 planning",
          "University research",
          "Mark improvement strategies"
        ];
        break;

      case 12:
        status.isMatricStudent = true;
        status.isContinuingStudent = true;
        status.hasMarks = !!availableMarks;
        status.marksSource = "Grade 11 (previous year)";
        status.context = "final";
        status.guidanceFocus = [
          "Final year strategy",
          "University applications",
          "Mark targets"
        ];
        break;
    }

    return status;
  }

  /**
   * Build contextual query for RAG system
   */
  buildContextualQuery(gradeLevel, availableMarks = null, currentTerm = null) {
    const status = this.detectStudentStatus(gradeLevel, availableMarks);
    
    let query = `I'm a Grade ${gradeLevel} student`;
    
    if (currentTerm) {
      query += ` in Term ${currentTerm}`;
    }

    if (status.isNewStudent) {
      query += `, first year of high school, no marks available yet`;
    } else if (status.hasMarks) {
      query += `, with marks from previous year`;
    }

    if (status.isMatricStudent) {
      query += `, my final year`;
    }

    return query;
  }

  /**
   * Get assessment context
   */
  getAssessmentContext(gradeLevel, currentTerm) {
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
}
```

### 3.3 Assessment Period Tracker

```javascript
// lib/academic/assessment-tracker.js

export class AssessmentPeriodTracker {
  /**
   * Get current assessment period
   */
  getCurrentAssessmentPeriod(academicYear, currentTerm) {
    const assessmentPeriods = {
      1: "First assessment period (January-March)",
      2: "Second assessment period (April-June)",
      3: "Third assessment period (July-September)",
      4: "Final assessment period (October-December)"
    };

    return assessmentPeriods[currentTerm] || null;
  }

  /**
   * Get assessment structure for grade
   */
  getAssessmentStructure(gradeLevel) {
    if (gradeLevel === 12) {
      return {
        continuousAssessment: "40% of final mark",
        finalExamination: "60% of final mark",
        components: [
          "Class tests and quizzes",
          "Assignments and projects",
          "Practical tasks",
          "Oral presentations",
          "Portfolio work",
          "Final examination"
        ]
      };
    }

    return {
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

  /**
   * Get examination schedule for grade
   */
  getExaminationSchedule(gradeLevel, academicYear) {
    if (gradeLevel !== 12) {
      return {
        hasExaminations: false,
        message: "Grade 12 only has formal NSC examinations"
      };
    }

    const yearData = academicCalendar[academicYear];
    if (!yearData) return null;

    return {
      hasExaminations: true,
      preliminaryExams: {
        startDate: yearData.examinations.preliminaryExams.startDate,
        endDate: yearData.examinations.preliminaryExams.endDate,
        purpose: "Practice examinations to prepare for final NSC exams"
      },
      finalExams: {
        startDate: yearData.examinations.finalExams.startDate,
        endDate: yearData.examinations.finalExams.endDate,
        purpose: "Official NSC examinations"
      },
      resultsRelease: yearData.examinations.resultsRelease
    };
  }
}
```

---

## 4. INTEGRATION WITH ASSESSMENT FORM

### 4.1 Enhanced Assessment Form Logic

```javascript
// app/assessment/components/AssessmentFormEnhanced.jsx

import { AcademicCalendarEngine } from '@/lib/academic/calendar-engine';
import { StudentContextDetector } from '@/lib/academic/student-context';
import { AssessmentPeriodTracker } from '@/lib/academic/assessment-tracker';

export function EnhancedAssessmentForm() {
  const calendarEngine = new AcademicCalendarEngine();
  const contextDetector = new StudentContextDetector();
  const assessmentTracker = new AssessmentPeriodTracker();

  const currentYear = calendarEngine.getCurrentAcademicYear();
  const currentTerm = calendarEngine.getCurrentTerm(currentYear);

  const handleGradeSelection = (grade) => {
    // Detect student status
    const status = contextDetector.detectStudentStatus(grade);
    
    // Build contextual query
    const contextualQuery = contextDetector.buildContextualQuery(
      grade,
      status.hasMarks,
      currentTerm
    );

    // Get assessment context
    const assessmentContext = contextDetector.getAssessmentContext(grade, currentTerm);

    // Get examination schedule (if Grade 12)
    const examSchedule = assessmentTracker.getExaminationSchedule(grade, currentYear);

    // Update form with context
    updateFormContext({
      status,
      contextualQuery,
      assessmentContext,
      examSchedule
    });
  };

  return (
    <div>
      {/* Form UI with enhanced context */}
    </div>
  );
}
```

---

## 5. INTEGRATION WITH RAG SYSTEM

### 5.1 Context-Aware Query Building

```javascript
// lib/assessment/context-builder.js

export function buildContextualRAGQuery(studentData) {
  const {
    gradeLevel,
    availableMarks,
    currentTerm,
    academicYear,
    subjects,
    marks
  } = studentData;

  const contextDetector = new StudentContextDetector();
  const status = contextDetector.detectStudentStatus(gradeLevel, availableMarks);
  
  let query = `Student Profile:\n`;
  query += `- Grade: ${gradeLevel}\n`;
  query += `- Academic Year: ${academicYear}\n`;
  query += `- Current Term: ${currentTerm}\n`;
  query += `- Student Status: ${status.context}\n`;

  if (status.hasMarks && marks) {
    query += `- Available Marks: Grade ${gradeLevel - 1} marks\n`;
    query += `- Subject Performance: ${JSON.stringify(marks)}\n`;
  } else {
    query += `- Available Marks: None (new student)\n`;
  }

  query += `\nGuidance Focus Areas:\n`;
  status.guidanceFocus.forEach(focus => {
    query += `- ${focus}\n`;
  });

  query += `\nContext: ${contextDetector.buildContextualQuery(gradeLevel, availableMarks, currentTerm)}\n`;

  return query;
}
```

---

## 6. TESTING CHECKLIST

### 6.1 Calendar Engine Tests

- [ ] Correctly identifies current academic year
- [ ] Correctly identifies current term
- [ ] Correctly identifies examination periods
- [ ] Correctly calculates days until milestones
- [ ] Handles year boundaries correctly
- [ ] Handles public holidays correctly

### 6.2 Student Context Tests

- [ ] Correctly detects new Grade 10 students
- [ ] Correctly detects continuing Grade 11 students
- [ ] Correctly detects matric Grade 12 students
- [ ] Correctly builds contextual queries
- [ ] Correctly identifies assessment contexts
- [ ] Correctly provides guidance focus areas

### 6.3 Assessment Tracker Tests

- [ ] Correctly identifies assessment periods
- [ ] Correctly provides assessment structure
- [ ] Correctly provides examination schedules
- [ ] Correctly handles non-Grade 12 students
- [ ] Correctly displays results release dates

### 6.4 Integration Tests

- [ ] Assessment form uses calendar context
- [ ] RAG system receives contextual queries
- [ ] Results page shows grade-appropriate guidance
- [ ] Calendar information displays correctly
- [ ] Examination schedules display correctly
- [ ] Student progression context is maintained

---

## 7. DEPLOYMENT CHECKLIST

- [ ] Academic calendar data is accurate and current
- [ ] Calendar engine is tested and working
- [ ] Student context detector is integrated
- [ ] Assessment tracker is functional
- [ ] RAG system receives contextual queries
- [ ] Assessment form displays context-aware guidance
- [ ] Results page shows grade-appropriate advice
- [ ] Examination schedules are displayed
- [ ] Public holidays are marked correctly
- [ ] Term dates are accurate
- [ ] System handles year boundaries correctly
- [ ] Documentation is complete and accurate

---

## 8. MAINTENANCE SCHEDULE

### Annual Updates (February)
- [ ] Update calendar for new academic year
- [ ] Verify all term dates
- [ ] Update examination schedules
- [ ] Update public holidays
- [ ] Test all calendar functions

### Quarterly Reviews (March, June, September, December)
- [ ] Verify current term calculations
- [ ] Check examination period accuracy
- [ ] Review student progression logic
- [ ] Test assessment period tracking

### As-Needed Updates
- [ ] Update when DBE announces changes
- [ ] Update when provincial variations occur
- [ ] Update when examination dates change
- [ ] Update when public holidays change

---

## 9. SUCCESS METRICS

### System Compliance
- ✅ 100% alignment with official DBE calendar
- ✅ All term dates accurate
- ✅ All examination schedules correct
- ✅ All public holidays included

### User Experience
- ✅ Students see grade-appropriate guidance
- ✅ Calendar context is clear and helpful
- ✅ Examination schedules are visible
- ✅ Assessment periods are understood

### School Trust
- ✅ Schools recognize official calendar
- ✅ Schools trust examination information
- ✅ Schools see professional implementation
- ✅ Schools recommend to other schools

---

## 10. NEXT STEPS

1. **Implement Calendar Engine**
   - Create calendar data structure
   - Build calendar calculation functions
   - Test all calendar logic

2. **Implement Student Context Detection**
   - Build status detection logic
   - Create contextual query builder
   - Integrate with assessment form

3. **Implement Assessment Tracking**
   - Build assessment period tracker
   - Create examination schedule display
   - Integrate with results page

4. **Integrate with RAG System**
   - Update query builder with context
   - Test contextual guidance generation
   - Verify grade-appropriate responses

5. **Testing and Deployment**
   - Run comprehensive test suite
   - Deploy to staging environment
   - Conduct user acceptance testing
   - Deploy to production

---

**Document Status**: Implementation Ready  
**Priority**: High  
**Estimated Effort**: 4-6 hours  
**Business Impact**: High - Establishes Thandi as professional, compliant solution
