# Academic Calendar Intelligence - Design Document

**Date:** December 13, 2024  
**Feature:** Academic Calendar Intelligence System  
**Priority:** HIGH - Critical fix for incorrect timeline logic  

---

## Overview

The Academic Calendar Intelligence system replaces hardcoded date assumptions with dynamic academic calendar awareness. This system provides accurate timeline calculations, contextual messaging, and deadline management based on the South African academic year structure.

## Architecture

### Current Architecture (Problematic)
```javascript
// WRONG: Hardcoded assumptions
if (formData.grade === 12) {
  query += `I am writing my final exams in about 1 month (late November/early December ${currentYear}). `;
}
```

### New Architecture (Calendar-Aware)
```javascript
// CORRECT: Dynamic calendar intelligence
const academicContext = getAcademicContext(currentDate, grade);
query += academicContext.timelineMessage;
```

## Components and Interfaces

### 1. Academic Calendar Engine
**Location:** `lib/academic/calendar-engine.js`

**Responsibilities:**
- Calculate current academic calendar position
- Determine timeline to key academic events
- Provide grade-specific context messaging
- Handle academic year transitions

**Interface:**
```javascript
class AcademicCalendarEngine {
  getCurrentAcademicContext(date, grade) {
    // Returns current position in academic calendar
  }
  
  getTimelineToFinals(date, grade) {
    // Calculates accurate time to finals
  }
  
  getContextualMessage(date, grade) {
    // Returns appropriate timeline message
  }
  
  getRelevantDeadlines(date, grade) {
    // Returns current/upcoming deadlines
  }
}
```

### 2. Academic Calendar Data
**Location:** `lib/academic/calendar-data.js`

**Structure:**
```javascript
const ACADEMIC_CALENDAR = {
  2024: {
    terms: [
      { name: 'Term 1', start: '2024-01-17', end: '2024-03-22' },
      { name: 'Term 2', start: '2024-04-08', end: '2024-06-28' },
      { name: 'Term 3', start: '2024-07-22', end: '2024-09-27' },
      { name: 'Term 4', start: '2024-10-07', end: '2024-12-06' }
    ],
    examPeriods: {
      matricFinals: { start: '2024-10-21', end: '2024-11-27' },
      resultsRelease: '2024-12-20'
    },
    applicationPeriods: {
      nsfas: { open: '2024-10-01', close: '2024-11-30' },
      universities: { open: '2024-03-01', close: '2024-09-30' }
    }
  },
  2025: {
    // Next year's calendar
  }
};
```

### 3. Timeline Calculator
**Location:** `lib/academic/timeline-calculator.js`

**Functions:**
```javascript
function calculateTimeToFinals(currentDate, grade) {
  // Returns accurate months/weeks to finals
}

function getAcademicPhase(currentDate) {
  // Returns: 'preparation', 'finals', 'post-finals', 'new-year'
}

function getGradeProgression(currentDate, currentGrade) {
  // Handles grade progression across academic years
}
```

### 4. Context Message Generator
**Location:** `lib/academic/context-generator.js`

**Responsibilities:**
- Generate grade and date-appropriate messages
- Handle different academic phases
- Provide accurate urgency levels

## Data Models

### Academic Context Object
```javascript
{
  currentDate: Date,
  academicYear: 2024,
  currentPhase: 'post-finals', // 'preparation', 'finals', 'post-finals', 'new-year'
  grade: 12,
  timelineToFinals: {
    months: 10,
    weeks: 43,
    phase: 'next-year'
  },
  contextualMessage: "Your Grade 12 finals are complete. Focus on results and university applications.",
  urgencyLevel: 'low', // 'low', 'medium', 'high', 'critical'
  relevantDeadlines: [
    {
      type: 'university-applications',
      deadline: '2025-09-30',
      daysUntil: 291,
      priority: 'high'
    }
  ]
}
```

### Calendar Phase Definitions
```javascript
const ACADEMIC_PHASES = {
  'new-year': {
    months: [1, 2], // January-February
    description: 'New academic year beginning',
    focus: 'goal-setting, subject selection'
  },
  'preparation': {
    months: [3, 4, 5, 6, 7, 8, 9], // March-September
    description: 'Academic year in progress',
    focus: 'learning, improvement, planning'
  },
  'finals-approach': {
    months: [10], // October (first half)
    description: 'Finals approaching',
    focus: 'final preparation, stress management'
  },
  'finals-active': {
    dateRange: ['2024-10-21', '2024-11-27'], // Actual exam dates
    description: 'Finals in progress',
    focus: 'exam support, stress management'
  },
  'post-finals': {
    months: [12], // December
    description: 'Finals complete, awaiting results',
    focus: 'applications, planning, results preparation'
  }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timeline Accuracy
*For any* current date and grade combination, the calculated timeline to finals should be mathematically accurate based on the South African academic calendar
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Phase Recognition
*For any* current date, the system should correctly identify the current academic phase (preparation, finals, post-finals, new-year)
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 3: Grade Progression Consistency
*For any* date that crosses academic year boundaries, grade progression should be handled consistently (Grade 10 in Dec 2024 becomes Grade 11 in Jan 2025)
**Validates: Requirements 4.1, 4.2**

### Property 4: Deadline Relevance
*For any* current date, all returned deadlines should be future dates that are relevant to the student's current grade and academic phase
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 5: Message Contextuality
*For any* academic phase and grade combination, the generated contextual message should match the appropriate focus area and urgency level
**Validates: Requirements 3.1, 3.4, 3.5**

## Error Handling

### Invalid Date Handling
```javascript
function validateDate(date) {
  if (!date || isNaN(date.getTime())) {
    return new Date(); // Default to current date
  }
  return date;
}
```

### Missing Calendar Data
```javascript
function getCalendarData(year) {
  if (!ACADEMIC_CALENDAR[year]) {
    // Generate standard calendar based on template
    return generateStandardCalendar(year);
  }
  return ACADEMIC_CALENDAR[year];
}
```

### Grade Validation
```javascript
function validateGrade(grade) {
  if (![10, 11, 12].includes(grade)) {
    console.warn(`Invalid grade: ${grade}, defaulting to 10`);
    return 10;
  }
  return grade;
}
```

## Testing Strategy

### Unit Tests
- Test timeline calculations for all months and grades
- Test phase recognition for boundary dates
- Test grade progression across academic years
- Test deadline filtering and relevance

### Property-Based Tests
- **Timeline Accuracy Test:** Generate random dates and grades, verify timeline calculations are mathematically correct
- **Phase Consistency Test:** Test phase recognition across academic year boundaries
- **Deadline Relevance Test:** Verify all returned deadlines are future and grade-appropriate
- **Message Appropriateness Test:** Verify contextual messages match academic phases

### Integration Tests
- Test integration with existing assessment form
- Test query generation with new timeline context
- Test results page with accurate timeline information
- Test PDF generation with correct deadlines

### Edge Case Tests
- Academic year boundary transitions (December 31 → January 1)
- Leap year handling
- Weekend and holiday date handling
- Future academic years (2025, 2026)

## Implementation Plan

### Phase 1: Core Calendar Engine (Week 1)
1. Create `AcademicCalendarEngine` class
2. Implement timeline calculation functions
3. Add South African academic calendar data
4. Create comprehensive unit tests

### Phase 2: Integration (Week 2)
1. Update `AssessmentForm.jsx` to use calendar engine
2. Replace hardcoded date logic with dynamic calculations
3. Update query generation with accurate context
4. Test integration with existing flows

### Phase 3: Enhanced Context (Week 3)
1. Implement contextual message generation
2. Add deadline management system
3. Update results page with accurate timelines
4. Add PDF generation improvements

### Phase 4: Validation & Deployment (Week 4)
1. Comprehensive testing across all scenarios
2. Property-based test implementation
3. Performance optimization
4. Production deployment with monitoring

## Migration Strategy

### Backward Compatibility
- Maintain existing API interfaces
- Gradual rollout with feature flags
- Fallback to current logic if calendar engine fails

### Data Migration
- No database changes required
- Calendar data stored in code (version controlled)
- Annual calendar updates through code deployment

### Rollback Plan
- Feature flag to disable calendar intelligence
- Immediate rollback to hardcoded logic if issues detected
- Monitoring alerts for timeline calculation errors

## Performance Considerations

### Caching Strategy
```javascript
// Cache calendar calculations for performance
const calendarCache = new Map();

function getCachedAcademicContext(date, grade) {
  const cacheKey = `${date.toISOString().split('T')[0]}-${grade}`;
  if (calendarCache.has(cacheKey)) {
    return calendarCache.get(cacheKey);
  }
  
  const context = calculateAcademicContext(date, grade);
  calendarCache.set(cacheKey, context);
  return context;
}
```

### Memory Management
- Limit calendar data to current + next 2 years
- Clear cache daily to prevent memory leaks
- Lazy load calendar data only when needed

## Monitoring and Alerting

### Key Metrics
- Timeline calculation accuracy (should be 100%)
- Calendar engine response time (<10ms)
- Error rate for date calculations (<0.1%)
- Cache hit rate (>90% for common date/grade combinations)

### Alerts
- Alert if timeline calculations return negative values
- Alert if academic phase detection fails
- Alert if deadline calculations return past dates
- Alert if calendar data is missing for current year

## Future Enhancements

### Potential Improvements
1. **School-Specific Calendars:** Support for different school calendar variations
2. **Real-Time Updates:** Integration with Department of Education calendar updates
3. **International Support:** Support for other country academic calendars
4. **Advanced Deadline Management:** Integration with specific university application systems

### Maintenance Requirements
- Annual calendar data updates (October each year)
- Quarterly validation of deadline accuracy
- Monthly monitoring of calculation accuracy
- Weekly cache performance review

---

**Implementation Priority:** HIGH  
**Estimated Effort:** 4 weeks  
**Risk Level:** LOW (well-defined problem with clear solution)  
**Dependencies:** None (self-contained enhancement)