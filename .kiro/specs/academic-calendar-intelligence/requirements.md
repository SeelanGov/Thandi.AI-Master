# Academic Calendar Intelligence - Requirements

**Date:** December 13, 2024  
**Purpose:** Fix critical date/time logic in assessment system  
**Priority:** HIGH - System currently provides incorrect timeline information  

---

## Introduction

The Thandi assessment system currently has hardcoded assumptions about when South African Matric finals occur, leading to incorrect timeline guidance for students. The system needs accurate academic calendar intelligence to provide contextually appropriate advice based on the actual South African school year.

## Glossary

- **Academic Calendar**: The official South African school year schedule including terms, holidays, and exam periods
- **Matric Finals**: Grade 12 final examinations (October-November)
- **Academic Year**: South African school year (January-December)
- **Timeline Context**: Grade-appropriate messaging based on current date and academic calendar position

---

## Requirements

### Requirement 1: Accurate Academic Calendar Integration

**User Story:** As a Grade 12 student taking an assessment in December, I want to receive advice that acknowledges my finals are complete, so that I get relevant guidance about results and next steps.

#### Acceptance Criteria

1. WHEN the current date is December THEN the system SHALL recognize that Grade 12 finals are complete
2. WHEN the current date is January-September THEN the system SHALL calculate accurate months until next finals
3. WHEN the current date is October-November THEN the system SHALL recognize finals are currently happening
4. WHEN providing timeline context THEN the system SHALL use actual South African academic calendar dates
5. WHEN calculating "time until finals" THEN the system SHALL account for the specific month and academic year cycle

### Requirement 2: Grade-Specific Timeline Accuracy

**User Story:** As a Grade 11 student, I want accurate information about when my Grade 12 finals will occur, so that I can plan my preparation timeline correctly.

#### Acceptance Criteria

1. WHEN a Grade 11 student takes assessment in December THEN the system SHALL indicate finals are 10 months away (October next year)
2. WHEN a Grade 11 student takes assessment in March THEN the system SHALL indicate finals are 7 months away
3. WHEN a Grade 10 student takes assessment THEN the system SHALL calculate accurate timeline to their Grade 12 year
4. WHEN providing multi-year timelines THEN the system SHALL account for academic year boundaries
5. WHEN the academic year changes THEN the system SHALL update grade progression automatically

### Requirement 3: Context-Aware Messaging

**User Story:** As a student, I want the system to provide advice that matches my current academic situation, so that the guidance is relevant and actionable.

#### Acceptance Criteria

1. WHEN finals are complete (December-January) THEN the system SHALL focus on results, applications, and next year preparation
2. WHEN finals are approaching (September-October) THEN the system SHALL focus on final preparation and backup plans
3. WHEN in mid-academic year (February-August) THEN the system SHALL focus on improvement and preparation
4. WHEN during exam period (October-November) THEN the system SHALL provide appropriate support messaging
5. WHEN providing bursary information THEN the system SHALL include accurate application deadlines based on current date

### Requirement 4: Academic Year Transitions

**User Story:** As a Grade 12 student who has completed finals, I want guidance about university applications and gap year options, so that I can make informed decisions about my next steps.

#### Acceptance Criteria

1. WHEN Grade 12 finals are complete THEN the system SHALL shift focus to post-matric planning
2. WHEN a new academic year begins THEN the system SHALL update grade-level assumptions
3. WHEN university application periods open THEN the system SHALL highlight relevant deadlines
4. WHEN results are released THEN the system SHALL provide results-based guidance
5. WHEN gap year periods occur THEN the system SHALL provide appropriate gap year advice

### Requirement 5: Bursary and Application Timeline Accuracy

**User Story:** As a student researching funding options, I want accurate information about application deadlines, so that I don't miss important opportunities.

#### Acceptance Criteria

1. WHEN providing bursary information THEN the system SHALL include accurate current-year deadlines
2. WHEN university applications open THEN the system SHALL highlight immediate action items
3. WHEN application deadlines approach THEN the system SHALL create appropriate urgency
4. WHEN deadlines have passed THEN the system SHALL focus on next available opportunities
5. WHEN multiple application cycles exist THEN the system SHALL distinguish between current and future cycles

### Requirement 6: Dynamic Date Calculations

**User Story:** As a system administrator, I want the academic calendar logic to update automatically, so that students always receive accurate timeline information without manual updates.

#### Acceptance Criteria

1. WHEN the system calculates timelines THEN it SHALL use dynamic date calculations not hardcoded assumptions
2. WHEN academic years change THEN the system SHALL automatically adjust grade progressions
3. WHEN exam periods occur THEN the system SHALL recognize current academic calendar position
4. WHEN providing future dates THEN the system SHALL calculate based on standard South African academic calendar
5. WHEN the calendar logic updates THEN existing functionality SHALL remain unaffected

---

## South African Academic Calendar Reference

### Standard Academic Year Structure
- **January:** New academic year begins, Grade 12 applications open
- **February-March:** First term, university late applications
- **April:** First term holidays
- **May-June:** Second term, mid-year exams
- **July:** Winter holidays
- **August-September:** Third term, preliminary exams
- **October:** Matric finals begin, NSFAS applications open
- **November:** Matric finals complete, university applications close
- **December:** Results released, summer holidays

### Critical Deadlines (Annual)
- **NSFAS Applications:** October-November
- **University Applications:** March-September (varies by institution)
- **Matric Finals:** October-November
- **Results Release:** December/January
- **University Registration:** January-February

---

## Current System Issues

### Identified Problems
1. **December 2024:** System incorrectly states "finals in ~1 month"
2. **Hardcoded Logic:** `late November/early December ${currentYear}` assumption
3. **No Calendar Intelligence:** System doesn't understand academic calendar position
4. **Incorrect Urgency:** Creates false urgency or misses real deadlines
5. **Bursary Timing:** May provide outdated deadline information

### Impact Assessment
- **High Impact:** Grade 12 students receive incorrect timeline advice
- **Medium Impact:** All grades receive inaccurate planning timelines
- **Low Impact:** Bursary and application deadlines may be misleading

---

## Success Metrics

### Accuracy Metrics
- **Timeline Accuracy:** 100% correct academic calendar positioning
- **Deadline Accuracy:** All bursary/application deadlines current and accurate
- **Context Relevance:** Grade-appropriate messaging matches academic calendar reality

### User Experience Metrics
- **Student Confusion:** Reduce timeline-related confusion to <5%
- **Advice Relevance:** >95% of students find timeline advice accurate and helpful
- **Action Item Accuracy:** All suggested deadlines and timelines actionable

---

## Out of Scope

- Custom academic calendars for private schools
- International academic calendar support
- Historical academic calendar data
- Integration with specific school management systems
- Real-time exam schedule updates
