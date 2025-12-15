# UX Flow Bias Correction Requirements

## Overview
Critical UX issues identified through live testing that prevent the bias detection system from working effectively in the user flow. The bias detection system is working correctly but is not being applied at the right points in the user journey.

## Problem Statement
User testing revealed 4 critical UX issues:

1. **IEB Subject Selection Incomplete**: IEB page 2 not showing complete subject list (missing subjects for Grade 12 students)
2. **Grade 12 Final Marks Confusion**: "Final marks" question causing confusion for Grade 10-11 students
3. **Bias Detection Applied Too Late**: Results page showing biased results (4/4 teaching careers) despite working bias detection
4. **Flow Logic Inconsistency**: Chat provides better/different options than initial results, indicating flow problems

## Root Cause Analysis

### Issue 1: IEB Subject Selection
- **Current State**: EnhancedSubjectSelection shows limited subjects based on curriculumProfile.currentSubjects
- **Problem**: IEB students not seeing all 24 available subjects on page 2
- **Impact**: Incomplete academic profile leads to poor career matching

### Issue 2: Grade 12 Final Marks Question
- **Current State**: DeepDiveQuestions asks about "final marks" for all grades
- **Problem**: Confusing for Grade 10-11 students who don't have final marks yet
- **Impact**: User confusion and potential form abandonment

### Issue 3: Bias Detection Timing
- **Current State**: Bias detection happens in chat AFTER showing biased results
- **Problem**: Users see biased results first, then get corrections in chat
- **Impact**: Poor first impression, undermines trust in system

### Issue 4: Flow Logic Problems
- **Current State**: RAG query generates results → User sees results → Chat provides corrections
- **Problem**: Should be RAG query → Bias filtering → Show filtered results → Chat for refinement
- **Impact**: Inconsistent user experience, confusion about system capabilities

## User Stories

### Epic 1: Complete IEB Subject Access
**As an IEB student**
**I want to see all 24 IEB subjects available for selection**
**So that I can provide complete academic information for accurate career guidance**

#### User Story 1.1: Full IEB Subject List
- **Given** I am an IEB student on the subject selection page
- **When** I reach page 2 of the assessment
- **Then** I should see all 24 IEB subjects available for selection
- **And** subjects should be clearly categorized (core, science, commerce, etc.)

#### User Story 1.2: Subject Selection Validation
- **Given** I am selecting subjects as an IEB student
- **When** I have selected fewer than the minimum required subjects
- **Then** I should see clear guidance on minimum requirements
- **And** the system should prevent progression until requirements are met

### Epic 2: Grade-Appropriate Assessment Flow
**As a Grade 10-11 student**
**I want assessment questions appropriate to my grade level**
**So that I'm not confused by questions about final marks I don't have yet**

#### User Story 2.1: Grade-Specific Deep Dive Questions
- **Given** I am a Grade 10 or 11 student
- **When** I reach the deep dive questions
- **Then** I should see questions about "current marks" not "final marks"
- **And** questions should be contextualized for my grade level

#### User Story 2.2: Grade 12 Final Marks Clarity
- **Given** I am a Grade 12 student
- **When** I reach the deep dive questions
- **Then** I should see clear questions about my final/trial exam marks
- **And** the system should explain why final marks are important for university applications

### Epic 3: Proactive Bias Prevention
**As any student**
**I want to receive unbiased career recommendations from the start**
**So that I see diverse, appropriate career options without needing chat corrections**

#### User Story 3.1: Pre-Results Bias Filtering
- **Given** the system has generated career recommendations
- **When** bias detection identifies issues (e.g., >60% teaching careers for STEM students)
- **Then** the system should apply bias corrections BEFORE showing results to the user
- **And** the user should see the filtered, unbiased results initially

#### User Story 3.2: Bias Detection Integration
- **Given** I am a STEM student with Math and Science subjects
- **When** the system generates my career recommendations
- **Then** it should automatically limit teaching careers to maximum 1 in top 3 recommendations
- **And** it should boost STEM career recommendations by +0.15 similarity

#### User Story 3.3: Transparent Bias Mitigation
- **Given** the system has applied bias corrections to my results
- **When** I view my career recommendations
- **Then** I should see a brief note that results have been optimized for diversity
- **And** I should still be able to access chat for further refinement

### Epic 4: Consistent Flow Logic
**As any student**
**I want consistent career recommendations between initial results and chat**
**So that I have confidence in the system's reliability**

#### User Story 4.1: Aligned Recommendation Logic
- **Given** I have received my initial career recommendations
- **When** I use the chat feature for follow-up questions
- **Then** the chat should build upon my initial results, not contradict them
- **And** any new suggestions should be explained as refinements or alternatives

#### User Story 4.2: Progressive Enhancement
- **Given** I want to explore more career options
- **When** I use the chat after viewing my initial results
- **Then** the chat should offer to expand my search or explore specific areas
- **And** it should maintain context from my original assessment

## Acceptance Criteria

### AC1: Complete IEB Subject Access
- [ ] All 24 IEB subjects are available for selection on page 2
- [ ] Subjects are properly categorized and displayed
- [ ] Subject selection works correctly for all IEB students
- [ ] No subjects are missing from the IEB_SUBJECTS list

### AC2: Grade-Appropriate Assessment
- [ ] Grade 10-11 students see "current marks" questions
- [ ] Grade 12 students see "final marks" questions with clear context
- [ ] Question wording is appropriate for each grade level
- [ ] No confusion about mark types based on grade

### AC3: Proactive Bias Prevention
- [ ] Bias detection runs BEFORE showing results to users
- [ ] STEM students with >60% teaching careers get automatic corrections
- [ ] Teaching careers limited to max 1 in top 3 for STEM students
- [ ] STEM careers get +0.15 similarity boost for STEM students
- [ ] Users see filtered results initially, not biased results

### AC4: Consistent Flow Logic
- [ ] Initial results and chat recommendations are aligned
- [ ] Chat builds upon initial results rather than contradicting them
- [ ] Progressive enhancement approach in chat interactions
- [ ] Clear explanation when chat offers new/different options

### AC5: System Integration
- [ ] Bias detection integrates seamlessly with existing RAG pipeline
- [ ] Performance impact is minimal (<200ms additional processing)
- [ ] All existing functionality continues to work
- [ ] Error handling for bias detection failures

## Technical Requirements

### TR1: IEB Subject Integration
- Ensure `lib/curriculum/ieb-subjects.js` exports all 24 subjects
- Update `EnhancedSubjectSelection.jsx` to show complete IEB subject list
- Add proper filtering logic for IEB vs CAPS subjects

### TR2: Grade-Specific Question Logic
- Update `DeepDiveQuestions.jsx` to use grade-appropriate language
- Implement conditional question rendering based on grade level
- Add clear context for Grade 12 final marks questions

### TR3: Bias Detection Pipeline Integration
- Integrate `BiasDetector` into the RAG query pipeline BEFORE results display
- Apply bias corrections automatically based on detection results
- Implement fallback handling if bias detection fails

### TR4: Flow Consistency
- Ensure chat context includes initial assessment results
- Implement progressive enhancement logic in chat responses
- Add result alignment validation between initial and chat responses

## Success Metrics

### Primary Metrics
- **Bias Reduction**: <20% teaching careers for STEM students in initial results
- **Subject Completion**: 100% of IEB students can select from all 24 subjects
- **Grade Confusion**: <5% of Grade 10-11 students report confusion about marks questions
- **Flow Consistency**: >90% alignment between initial results and chat recommendations

### Secondary Metrics
- **User Satisfaction**: Improved ratings for result quality and relevance
- **Assessment Completion**: Reduced drop-off rates during subject selection
- **Chat Usage**: More refinement-focused chat interactions vs correction-focused
- **Performance**: <200ms additional processing time for bias detection

## Dependencies

### Internal Dependencies
- `lib/rag/bias-detector.js` - Bias detection system (already implemented)
- `lib/curriculum/ieb-subjects.js` - IEB subject definitions
- `app/assessment/components/EnhancedSubjectSelection.jsx` - Subject selection UI
- `app/assessment/components/DeepDiveQuestions.jsx` - Grade-specific questions
- `app/api/rag/query/route.js` - RAG pipeline integration point

### External Dependencies
- None identified

## Risks and Mitigation

### Risk 1: Performance Impact
- **Risk**: Bias detection adds processing time
- **Mitigation**: Implement async bias detection with fallback to original results

### Risk 2: Over-Correction
- **Risk**: Bias corrections might overcorrect and provide poor matches
- **Mitigation**: Implement confidence thresholds and gradual corrections

### Risk 3: User Confusion
- **Risk**: Users might not understand why results changed
- **Mitigation**: Add subtle transparency messaging about result optimization

## Out of Scope

- Complete redesign of assessment flow
- New bias detection algorithms (using existing BiasDetector)
- Changes to underlying RAG/embedding systems
- New subject categories or curriculum frameworks

## Definition of Done

- [ ] All acceptance criteria met
- [ ] User testing confirms issues are resolved
- [ ] Performance benchmarks met
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Deployment to staging successful
- [ ] Production deployment approved

## Priority

**P0 - Critical**

These UX issues directly impact user experience and system credibility. The bias detection system is working but not being applied correctly in the user flow, leading to poor first impressions and user confusion.