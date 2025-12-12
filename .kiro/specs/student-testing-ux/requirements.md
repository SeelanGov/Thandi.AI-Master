# Student Testing UX - Requirements

**Date:** November 26, 2025  
**Purpose:** Optimize assessment flow and results for Grade 10-12 student testing  
**Goal:** Get actionable feedback on core user experience

---

## Introduction

We are preparing the Thandi.ai assessment system for student testing with Grade 10-12 learners. The focus is on ensuring the core assessment flow and results presentation are clear, functional, and provide value to students. This is NOT about branding or marketing - it's about making sure students can complete the assessment and understand their results.

## Glossary

- **Assessment Flow**: The sequence of questions from grade selection through to results
- **Deep Dive**: Optional extended questions for Grade 10 students (Q5-Q10)
- **Results Page**: The page showing career recommendations and action plans
- **Student Tester**: Grade 10-12 learner providing feedback on the system

---

## Requirements

### Requirement 1: Clear Assessment Flow

**User Story:** As a Grade 10-12 student, I want to understand what I'm being asked and why, so that I can provide accurate answers.

#### Acceptance Criteria

1. WHEN a student starts the assessment THEN the system SHALL display clear question text with context
2. WHEN a student views a question THEN the system SHALL show their progress (current question number and total)
3. WHEN a student selects an answer THEN the system SHALL provide immediate visual feedback
4. WHEN a student navigates between questions THEN the system SHALL preserve their previous answers
5. WHEN a student completes the assessment THEN the system SHALL clearly indicate submission is in progress

### Requirement 2: Mobile-Optimized Experience

**User Story:** As a student using my phone, I want the assessment to work smoothly on mobile, so that I can complete it anywhere.

#### Acceptance Criteria

1. WHEN a student taps a button THEN the system SHALL respond immediately without requiring double-tap
2. WHEN a student views the assessment on mobile THEN the system SHALL display all content without horizontal scrolling
3. WHEN a student selects multiple options THEN the system SHALL provide clear visual indication of selected items
4. WHEN a student views long lists THEN the system SHALL make all options easily tappable (minimum 44px touch targets)
5. WHEN a student rotates their device THEN the system SHALL maintain their current state and answers

### Requirement 3: Understandable Results

**User Story:** As a student, I want to understand my career recommendations and next steps, so that I know what to do after the assessment.

#### Acceptance Criteria

1. WHEN a student views results THEN the system SHALL display career matches with clear explanations
2. WHEN a student sees a career recommendation THEN the system SHALL explain why it matches their profile
3. WHEN a student views bursary information THEN the system SHALL show amounts and deadlines clearly
4. WHEN a student sees an action plan THEN the system SHALL provide specific, actionable steps
5. WHEN a student finishes reading results THEN the system SHALL provide clear options (download PDF, start new assessment)

### Requirement 4: Error Prevention and Recovery

**User Story:** As a student, I want to avoid losing my progress if something goes wrong, so that I don't have to start over.

#### Acceptance Criteria

1. WHEN a student's internet connection drops THEN the system SHALL save their progress locally
2. WHEN a student accidentally closes the browser THEN the system SHALL restore their session when they return
3. WHEN a student encounters an error THEN the system SHALL display a clear error message with recovery options
4. WHEN a student submits incomplete data THEN the system SHALL highlight missing required fields
5. WHEN a student wants to change an answer THEN the system SHALL allow navigation back to previous questions

### Requirement 5: Loading State Clarity

**User Story:** As a student waiting for results, I want to know the system is working, so that I don't think it's broken.

#### Acceptance Criteria

1. WHEN a student submits the assessment THEN the system SHALL display a loading indicator immediately
2. WHEN results are being generated THEN the system SHALL show progress or estimated time remaining
3. WHEN the system is processing THEN the system SHALL prevent duplicate submissions
4. WHEN loading takes longer than expected THEN the system SHALL reassure the student the system is still working
5. WHEN results are ready THEN the system SHALL transition smoothly to the results page

### Requirement 6: Verification Footer Visibility

**User Story:** As a student viewing AI-generated advice, I want to see clear warnings about verification, so that I know to confirm information with real people.

#### Acceptance Criteria

1. WHEN a student views results THEN the system SHALL display a prominent warning banner at the top
2. WHEN a student scrolls through results THEN the system SHALL display a verification footer at the bottom
3. WHEN a student downloads a PDF THEN the system SHALL include verification warnings in the PDF
4. WHEN a student sees career advice THEN the system SHALL use clear warning symbols (⚠️) that stand out
5. WHEN a student reads the footer THEN the system SHALL provide specific verification steps (counselor, institution, websites)

### Requirement 7: Feedback Collection Readiness

**User Story:** As a tester, I want to easily provide feedback on my experience, so that the team can improve the system.

#### Acceptance Criteria

1. WHEN a student completes the assessment THEN the system SHALL provide a way to share feedback
2. WHEN a student encounters a problem THEN the system SHALL allow them to report it
3. WHEN a student has suggestions THEN the system SHALL provide a feedback mechanism
4. WHEN a student rates their experience THEN the system SHALL capture the rating
5. WHEN a student submits feedback THEN the system SHALL confirm receipt

### Requirement 8: Grade-Specific Flow Clarity

**User Story:** As a Grade 10 student, I want to understand the preliminary report and deep dive option, so that I can make an informed choice.

#### Acceptance Criteria

1. WHEN a Grade 10 student completes core questions THEN the system SHALL show a preliminary report with 3 career matches
2. WHEN a Grade 10 student views the preliminary report THEN the system SHALL clearly explain the deep dive benefits
3. WHEN a Grade 10 student sees the deep dive CTA THEN the system SHALL show time commitment (5 more minutes)
4. WHEN a Grade 10 student opts into deep dive THEN the system SHALL show progress for the additional questions
5. WHEN a Grade 11-12 student completes core questions THEN the system SHALL proceed directly to results

### Requirement 9: Results Actionability

**User Story:** As a student viewing my results, I want clear next steps I can take this week, so that I can start working toward my goals immediately.

#### Acceptance Criteria

1. WHEN a student views a career match THEN the system SHALL provide immediate next steps (this week)
2. WHEN a student sees bursary information THEN the system SHALL include application deadlines and links
3. WHEN a student views mark requirements THEN the system SHALL show their current marks vs required marks
4. WHEN a student sees an action plan THEN the system SHALL break it down by grade year (G10, G11, G12)
5. WHEN a student views backup options THEN the system SHALL explain alternative pathways if primary goals aren't met

### Requirement 10: PDF Export Quality

**User Story:** As a student, I want to download a PDF I can share with my parents and counselor, so that I can discuss my options with them.

#### Acceptance Criteria

1. WHEN a student downloads a PDF THEN the system SHALL include all career recommendations
2. WHEN a student opens the PDF THEN the system SHALL display verification warnings prominently
3. WHEN a student shares the PDF THEN the system SHALL include all bursary information and deadlines
4. WHEN a student prints the PDF THEN the system SHALL format content for readability on paper
5. WHEN a student views the PDF THEN the system SHALL include page numbers and proper formatting

---

## Testing Focus Areas

### Critical Path (Must Work Perfectly)
1. Grade selection → Q1-Q4 → Results → PDF download
2. Mobile touch interactions (no double-tap issues)
3. Loading states during submission
4. Results page readability
5. Verification footer visibility

### Important (Should Work Well)
1. Grade 10 preliminary report → deep dive opt-in
2. Progress saving (localStorage)
3. Error messages and recovery
4. Back navigation between questions
5. PDF formatting and content

### Nice to Have (Can Improve Later)
1. Smooth animations between questions
2. Help tooltips on questions
3. Feedback collection mechanism
4. Comparison between careers
5. Sharing results via social media

---

## Success Metrics for Testing

### Completion Rate
- Target: >80% of students complete the assessment
- Measure: Track students who start vs finish

### Time to Complete
- Target: 5-7 minutes for core assessment
- Target: 10-12 minutes with deep dive
- Measure: Track time from start to results

### Mobile Usability
- Target: >90% of mobile users complete without issues
- Measure: Track mobile vs desktop completion rates

### Results Clarity
- Target: >80% of students understand their recommendations
- Measure: Post-assessment survey question

### PDF Downloads
- Target: >50% of students download their PDF
- Measure: Track download button clicks

### Verification Awareness
- Target: >90% of students notice the verification warnings
- Measure: Post-assessment survey question

---

## Out of Scope (Not for Testing Phase)

- Landing page design
- User accounts/login
- Assessment history
- Career library/browsing
- Social sharing features
- Advanced analytics
- A/B testing
- Brand identity/logo
- Marketing content
- Payment/monetization

---

## Testing Protocol

### Pre-Test Setup
1. Verify assessment flow works on desktop
2. Verify assessment flow works on mobile
3. Verify results page displays correctly
4. Verify PDF download works
5. Verify verification footer is visible

### During Testing
1. Observe students completing assessment
2. Note any confusion or hesitation
3. Track completion time
4. Record any errors encountered
5. Capture verbal feedback

### Post-Test Collection
1. Ask: "Was anything confusing?"
2. Ask: "Did you understand your results?"
3. Ask: "Would you show this to your parents?"
4. Ask: "What would you change?"
5. Ask: "Did you notice the verification warnings?"

---

## Priority Fixes Before Testing

### P0 (Must Fix)
- [ ] Verify mobile touch events work (no double-tap)
- [ ] Ensure loading states are clear
- [ ] Confirm verification footer is prominent
- [ ] Test PDF download on mobile
- [ ] Verify localStorage persistence works

### P1 (Should Fix)
- [ ] Improve error messages
- [ ] Add progress indicators
- [ ] Enhance results page readability
- [ ] Optimize for slow connections
- [ ] Test on various devices

### P2 (Nice to Fix)
- [ ] Add help tooltips
- [ ] Improve button styling
- [ ] Add smooth transitions
- [ ] Enhance loading messages
- [ ] Add feedback mechanism
