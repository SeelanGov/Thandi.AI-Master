# Subject Marks Collection Enhancement - Requirements

## Introduction

This specification addresses the critical enhancement of collecting current academic marks alongside subject selection to enable realistic, data-driven career guidance. Currently, the system only knows which subjects students enjoy but lacks their actual performance data, limiting the accuracy of university admission guidance and career feasibility assessments.

## Glossary

- **Current Marks**: Student's most recent academic performance in each subject (percentage or symbol)
- **APS Score**: Admission Point Score used by South African universities for admission requirements
- **Subject Performance Profile**: Complete view of student's academic standing across all selected subjects
- **Realistic Guidance**: Career recommendations based on actual academic performance rather than aspirational goals
- **Mark Validation**: System verification that entered marks are within acceptable ranges (0-100% or valid symbols)

## Requirements

### Requirement 1: Integrated Subject and Marks Collection

**User Story:** As a student, I want to provide my current marks alongside my subject preferences, so that I receive realistic career guidance based on my actual academic performance.

#### Acceptance Criteria

1. WHEN a student selects a subject they enjoy, THE System SHALL immediately prompt for their current mark in that subject
2. WHEN a student enters a mark, THE System SHALL validate it is within acceptable range (0-100% or valid grade symbols)
3. WHEN a student deselects a subject, THE System SHALL remove the associated mark data
4. WHEN a student has selected subjects but not provided marks, THE System SHALL clearly indicate which marks are missing
5. WHEN all selected subjects have valid marks, THE System SHALL enable progression to the next step

### Requirement 2: Flexible Mark Input System

**User Story:** As a student with different grading systems, I want to enter my marks in the format I'm familiar with, so that I can provide accurate information without confusion.

#### Acceptance Criteria

1. WHEN a student enters a percentage mark, THE System SHALL accept values from 0-100 with decimal precision
2. WHEN a student enters a symbol grade, THE System SHALL accept A, B, C, D, E, F with + and - modifiers
3. WHEN a student enters an invalid mark format, THE System SHALL provide clear error messaging and examples
4. WHEN a student switches between percentage and symbol input, THE System SHALL maintain the most recent valid entry
5. WHEN a student leaves a mark field empty, THE System SHALL treat it as incomplete and prevent progression

### Requirement 3: Real-time APS Calculation and Feedback

**User Story:** As a Grade 11-12 student planning for university, I want to see my projected APS score as I enter marks, so that I understand my current university admission prospects.

#### Acceptance Criteria

1. WHEN a Grade 11-12 student enters marks for core subjects, THE System SHALL calculate and display their current APS score
2. WHEN APS calculation is possible, THE System SHALL show the score prominently with context about university requirements
3. WHEN marks are insufficient for common university programs, THE System SHALL provide specific improvement targets
4. WHEN APS score changes, THE System SHALL update the display in real-time without page refresh
5. WHEN Grade 10 students enter marks, THE System SHALL show projected trajectory rather than current APS

### Requirement 4: Mark-Based Career Feasibility Indicators

**User Story:** As a student with specific career interests, I want to understand if my current marks align with my goals, so that I can make informed decisions about my academic focus.

#### Acceptance Criteria

1. WHEN a student's marks are entered, THE System SHALL cross-reference with typical requirements for their stated career interests
2. WHEN marks align well with career goals, THE System SHALL provide encouraging feedback with specific pathways
3. WHEN marks are below typical requirements, THE System SHALL suggest specific improvement strategies and alternative pathways
4. WHEN marks exceed requirements, THE System SHALL highlight advanced opportunities and stretch goals
5. WHEN career interests haven't been stated yet, THE System SHALL store marks for later analysis

### Requirement 5: Privacy and Data Sensitivity

**User Story:** As a student sharing sensitive academic information, I want assurance that my marks are handled securely and used only for guidance purposes.

#### Acceptance Criteria

1. WHEN marks are entered, THE System SHALL store them locally in the browser session only
2. WHEN the assessment is completed, THE System SHALL use marks for guidance generation but not permanently store them
3. WHEN marks are displayed in results, THE System SHALL show them only in the context of improvement suggestions
4. WHEN sharing results via PDF, THE System SHALL include marks only if explicitly requested by the student
5. WHEN the browser session ends, THE System SHALL clear all mark data automatically

### Requirement 6: Enhanced User Experience and Validation

**User Story:** As a student entering multiple marks, I want a smooth, intuitive interface that helps me provide accurate information quickly.

#### Acceptance Criteria

1. WHEN entering marks, THE System SHALL provide auto-focus progression from one field to the next
2. WHEN a mark is entered, THE System SHALL provide immediate visual feedback (green for good, amber for concerning, red for problematic)
3. WHEN marks seem inconsistent (e.g., very high in one subject, very low in related subjects), THE System SHALL prompt for confirmation
4. WHEN all marks are entered, THE System SHALL provide a summary view for student verification before proceeding
5. WHEN students want to edit marks, THE System SHALL allow easy modification without losing other data

### Requirement 7: Grade-Specific Mark Interpretation

**User Story:** As a student in a specific grade, I want the system to interpret my marks appropriately for my academic stage, so that I receive relevant guidance for my current situation.

#### Acceptance Criteria

1. WHEN a Grade 10 student enters marks, THE System SHALL interpret them as foundation-building indicators with growth potential
2. WHEN a Grade 11 student enters marks, THE System SHALL interpret them as trajectory indicators for final year performance
3. WHEN a Grade 12 student enters mid-year marks, THE System SHALL interpret them as current admission prospects with improvement potential
4. WHEN a Grade 12 student enters final marks, THE System SHALL interpret them as definitive admission qualifications
5. WHEN grade context affects interpretation, THE System SHALL explain the reasoning to the student

### Requirement 8: Integration with Existing Assessment Flow

**User Story:** As a user of the current assessment system, I want the marks collection to integrate seamlessly with the existing flow, so that the enhanced experience feels natural and intuitive.

#### Acceptance Criteria

1. WHEN the subject selection step is enhanced, THE System SHALL maintain all existing functionality while adding marks collection
2. WHEN students complete the enhanced subject selection, THE System SHALL pass both subject preferences and marks to subsequent steps
3. WHEN the RAG system generates guidance, THE System SHALL utilize both subject enjoyment and performance data for personalization
4. WHEN students use the system on mobile devices, THE System SHALL ensure mark input fields are appropriately sized and accessible
5. WHEN students navigate back to edit subjects/marks, THE System SHALL preserve all previously entered data

### Requirement 9: Fallback and Error Handling

**User Story:** As a student who may not know all my marks or encounter technical issues, I want the system to handle incomplete data gracefully while encouraging complete information.

#### Acceptance Criteria

1. WHEN a student cannot provide a specific mark, THE System SHALL offer "Don't know" or "Estimate" options
2. WHEN technical issues prevent mark entry, THE System SHALL allow progression with subject preferences only
3. WHEN marks are partially complete, THE System SHALL use available data while noting limitations in guidance quality
4. WHEN mark data seems unrealistic, THE System SHALL request confirmation but not block progression
5. WHEN students return to complete missing marks, THE System SHALL highlight incomplete fields clearly

### Requirement 10: Analytics and Quality Improvement

**User Story:** As a system administrator, I want to understand how mark collection affects guidance quality, so that I can continuously improve the feature's effectiveness.

#### Acceptance Criteria

1. WHEN students provide marks, THE System SHALL track completion rates and identify common abandonment points
2. WHEN guidance is generated with marks data, THE System SHALL measure improvement in personalization quality
3. WHEN students interact with mark-based guidance, THE System SHALL track engagement and satisfaction indicators
4. WHEN mark data reveals patterns, THE System SHALL provide insights for educational content improvement
5. WHEN system performance is affected by mark processing, THE System SHALL monitor and optimize response times

---

## Success Metrics

### Completion and Adoption
- Target: >70% of students provide marks for all selected subjects
- Target: <5% abandonment rate during marks collection
- Target: >80% of students find marks collection "easy" or "very easy"

### Guidance Quality Improvement
- Target: >25% improvement in personalization scores when marks are provided
- Target: >90% accuracy in APS calculations and university requirement matching
- Target: >80% of students report guidance feels "more realistic" with marks included

### Technical Performance
- Target: <2 second response time for APS calculations
- Target: 100% data privacy compliance (no permanent storage of marks)
- Target: <1% error rate in mark validation and processing

---

## Out of Scope

- Historical mark tracking across multiple assessments
- Integration with school management systems
- Automated mark verification against official transcripts
- Comparative analysis with other students' marks
- Predictive modeling for future academic performance
- Integration with university application systems

---

## Implementation Priority

### Phase 1: Core Marks Collection (MVP)
- Basic mark input alongside subject selection
- Simple validation (0-100% range)
- Local storage and privacy compliance
- Integration with existing RAG system

### Phase 2: Enhanced Experience
- APS calculation and real-time feedback
- Grade-specific interpretation
- Visual feedback and validation improvements
- Mobile optimization

### Phase 3: Advanced Features
- Career feasibility indicators
- Improvement target suggestions
- Analytics and quality monitoring
- Advanced error handling and fallbacks