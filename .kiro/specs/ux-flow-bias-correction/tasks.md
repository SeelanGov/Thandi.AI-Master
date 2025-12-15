# UX Flow Bias Correction Tasks

## Task Breakdown

### Phase 1: Foundation Fixes (Critical - Deploy First)

#### Task 1.1: Fix IEB Subject Selection
**Priority**: P0 - Critical
**Estimated Time**: 2 hours
**Dependencies**: None

**Description**: Fix the subject filtering logic in EnhancedSubjectSelection to show all 24 IEB subjects for IEB students.

**Subtasks**:
- [ ] Update `app/assessment/components/EnhancedSubjectSelection.jsx`
- [ ] Import `IEB_SUBJECTS` from `lib/curriculum/ieb-subjects.js`
- [ ] Modify `availableSubjects` logic to show all IEB subjects when framework is 'IEB'
- [ ] Add proper error handling and fallbacks
- [ ] Test with IEB student profile

**Acceptance Criteria**:
- [ ] IEB students see all 24 subjects on page 2
- [ ] CAPS students continue to see filtered subjects as before
- [ ] No subjects are missing from IEB selection
- [ ] Subject selection works correctly for both frameworks

**Files to Modify**:
- `app/assessment/components/EnhancedSubjectSelection.jsx`

#### Task 1.2: Implement Grade-Specific Deep Dive Questions
**Priority**: P0 - Critical  
**Estimated Time**: 3 hours
**Dependencies**: None

**Description**: Update DeepDiveQuestions component to show grade-appropriate question text and context.

**Subtasks**:
- [ ] Create `getMarksQuestionText(grade)` helper function
- [ ] Update question rendering logic in `DeepDiveQuestions.jsx`
- [ ] Add grade-specific context and explanations
- [ ] Update form labels and placeholders based on grade
- [ ] Test with all grade levels (10, 11, 12)

**Acceptance Criteria**:
- [ ] Grade 10-11 students see "current marks" questions
- [ ] Grade 12 students see "final marks" questions with university context
- [ ] Question text is clear and appropriate for each grade
- [ ] No confusion about mark types based on user testing

**Files to Modify**:
- `app/assessment/components/DeepDiveQuestions.jsx`

### Phase 2: Bias Detection Integration (High Priority)

#### Task 2.1: Create Bias Correction System
**Priority**: P1 - High
**Estimated Time**: 4 hours
**Dependencies**: Task 1.1, 1.2 completed

**Description**: Create a bias correction system that can apply fixes to career recommendations.

**Subtasks**:
- [ ] Create `lib/rag/bias-corrector.js`
- [ ] Implement `BiasCorrector` class with correction methods
- [ ] Add `correctSTEMTeachingBias()` method
- [ ] Add `correctCategoryDominance()` method
- [ ] Add `applyCorrections()` orchestration method
- [ ] Add error handling and fallbacks
- [ ] Write unit tests for correction logic

**Acceptance Criteria**:
- [ ] BiasCorrector can identify and fix STEM teaching bias
- [ ] Corrections maintain answer quality and structure
- [ ] Error handling prevents system failures
- [ ] Unit tests pass with >90% coverage

**Files to Create**:
- `lib/rag/bias-corrector.js`
- `lib/rag/__tests__/bias-corrector.test.js`

#### Task 2.2: Integrate Bias Detection into RAG Pipeline
**Priority**: P1 - High
**Estimated Time**: 5 hours
**Dependencies**: Task 2.1 completed

**Description**: Integrate bias detection and correction into the RAG query pipeline before results are shown to users.

**Subtasks**:
- [ ] Import `BiasDetector` and `BiasCorrector` in `app/api/rag/query/route.js`
- [ ] Add bias detection step after CAG verification
- [ ] Implement `extractCareersFromResponse()` helper
- [ ] Add `applyBiasCorrections()` integration
- [ ] Add performance monitoring for bias detection
- [ ] Add bias correction metadata to response
- [ ] Test integration with existing pipeline

**Acceptance Criteria**:
- [ ] Bias detection runs before results are shown to users
- [ ] STEM students with >60% teaching careers get automatic corrections
- [ ] Performance impact is <200ms additional processing time
- [ ] Existing functionality continues to work unchanged
- [ ] Bias corrections are logged and tracked

**Files to Modify**:
- `app/api/rag/query/route.js`

#### Task 2.3: Add Career Extraction Logic
**Priority**: P1 - High
**Estimated Time**: 2 hours
**Dependencies**: Task 2.2 in progress

**Description**: Create helper functions to extract career information from LLM responses for bias analysis.

**Subtasks**:
- [ ] Create `extractCareersFromResponse()` function
- [ ] Handle different response formats (markdown, plain text)
- [ ] Extract career titles, categories, and descriptions
- [ ] Add error handling for malformed responses
- [ ] Test with various response formats

**Acceptance Criteria**:
- [ ] Can extract careers from typical LLM responses
- [ ] Handles edge cases and malformed responses gracefully
- [ ] Returns structured career data for bias analysis
- [ ] Performance is acceptable (<50ms processing time)

**Files to Modify**:
- `app/api/rag/query/route.js` (add helper functions)

### Phase 3: User Experience Enhancements (Medium Priority)

#### Task 3.1: Add Bias Transparency Messaging
**Priority**: P2 - Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 2.2 completed

**Description**: Add subtle messaging to inform users when bias corrections have been applied to their results.

**Subtasks**:
- [ ] Design transparency message component
- [ ] Add conditional rendering based on bias corrections
- [ ] Style message to be informative but not alarming
- [ ] Test message display with corrected results
- [ ] Ensure message doesn't appear when no corrections applied

**Acceptance Criteria**:
- [ ] Users see subtle note when bias corrections are applied
- [ ] Message is informative and builds trust
- [ ] Message doesn't appear when no corrections needed
- [ ] Styling is consistent with overall design

**Files to Modify**:
- Results display component (location TBD)
- Add CSS styling for transparency message

#### Task 3.2: Enhance Chat Context Preservation
**Priority**: P2 - Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 2.2 completed

**Description**: Ensure chat interactions maintain context from bias-corrected initial results.

**Subtasks**:
- [ ] Identify chat implementation location
- [ ] Add bias correction context to chat initialization
- [ ] Update chat prompts to reference initial results
- [ ] Add logic to build upon rather than contradict initial results
- [ ] Test chat consistency with various correction scenarios

**Acceptance Criteria**:
- [ ] Chat maintains context from initial assessment
- [ ] Chat builds upon initial results rather than contradicting them
- [ ] New suggestions are explained as refinements or alternatives
- [ ] Chat quality remains high with context preservation

**Files to Modify**:
- Chat component files (location TBD)

### Phase 4: Testing and Validation (Ongoing)

#### Task 4.1: Comprehensive Testing Suite
**Priority**: P1 - High
**Estimated Time**: 4 hours
**Dependencies**: All previous tasks

**Description**: Create comprehensive tests to validate all fixes and ensure no regressions.

**Subtasks**:
- [ ] Write integration tests for IEB subject selection
- [ ] Write tests for grade-specific question rendering
- [ ] Write tests for bias detection pipeline
- [ ] Write tests for bias correction application
- [ ] Write performance tests for bias detection
- [ ] Create test data for various student profiles

**Acceptance Criteria**:
- [ ] All critical paths are covered by tests
- [ ] Tests pass consistently in CI/CD pipeline
- [ ] Performance benchmarks are met
- [ ] Edge cases are handled correctly

**Files to Create**:
- `tests/integration/ux-flow-bias-correction.test.js`
- `tests/performance/bias-detection.test.js`

#### Task 4.2: User Acceptance Testing
**Priority**: P1 - High
**Estimated Time**: 3 hours
**Dependencies**: Tasks 1.1, 1.2, 2.2 completed

**Description**: Conduct user testing to validate that the identified issues are resolved.

**Subtasks**:
- [ ] Test IEB student flow with all 24 subjects visible
- [ ] Test Grade 10-11 students with "current marks" questions
- [ ] Test Grade 12 students with "final marks" questions
- [ ] Test STEM students receive diverse career recommendations
- [ ] Test chat consistency with initial results
- [ ] Collect user feedback on improvements

**Acceptance Criteria**:
- [ ] IEB students can complete subject selection without issues
- [ ] Grade-specific questions are clear and appropriate
- [ ] STEM students see <20% teaching careers in initial results
- [ ] Users report improved satisfaction with result quality
- [ ] No critical usability issues identified

### Phase 5: Monitoring and Optimization (Post-Deploy)

#### Task 5.1: Implement Monitoring Dashboard
**Priority**: P2 - Medium
**Estimated Time**: 3 hours
**Dependencies**: Task 2.2 deployed

**Description**: Add monitoring and metrics collection for bias detection effectiveness.

**Subtasks**:
- [ ] Add bias detection metrics to performance monitoring
- [ ] Track bias correction application rates
- [ ] Monitor user satisfaction with corrected results
- [ ] Add alerts for bias detection failures
- [ ] Create dashboard for bias detection insights

**Acceptance Criteria**:
- [ ] Bias detection metrics are collected and stored
- [ ] Dashboard shows bias correction effectiveness
- [ ] Alerts notify team of system issues
- [ ] Data supports continuous improvement efforts

**Files to Modify**:
- `lib/rag/performance-monitor.js`
- Monitoring dashboard components

#### Task 5.2: Performance Optimization
**Priority**: P2 - Medium
**Estimated Time**: 2 hours
**Dependencies**: Task 5.1 completed

**Description**: Optimize bias detection performance based on production metrics.

**Subtasks**:
- [ ] Analyze bias detection performance in production
- [ ] Optimize slow bias detection operations
- [ ] Implement caching for repeated bias analyses
- [ ] Add timeout handling for bias detection
- [ ] Validate performance improvements

**Acceptance Criteria**:
- [ ] Bias detection processing time <200ms average
- [ ] No performance degradation in overall system
- [ ] Timeout handling prevents system hangs
- [ ] User experience remains smooth

## Task Dependencies

```
Phase 1 (Foundation):
Task 1.1 (IEB Subjects) -> No dependencies
Task 1.2 (Grade Questions) -> No dependencies

Phase 2 (Bias Detection):
Task 2.1 (Bias Corrector) -> Tasks 1.1, 1.2
Task 2.2 (RAG Integration) -> Task 2.1
Task 2.3 (Career Extraction) -> Task 2.2 (parallel)

Phase 3 (UX Enhancements):
Task 3.1 (Transparency) -> Task 2.2
Task 3.2 (Chat Context) -> Task 2.2

Phase 4 (Testing):
Task 4.1 (Test Suite) -> All previous tasks
Task 4.2 (User Testing) -> Tasks 1.1, 1.2, 2.2

Phase 5 (Monitoring):
Task 5.1 (Monitoring) -> Task 2.2 deployed
Task 5.2 (Optimization) -> Task 5.1
```

## Critical Path

The critical path for resolving the user-identified issues:

1. **Task 1.1** (IEB Subjects) - 2 hours
2. **Task 1.2** (Grade Questions) - 3 hours  
3. **Task 2.1** (Bias Corrector) - 4 hours
4. **Task 2.2** (RAG Integration) - 5 hours
5. **Task 4.2** (User Testing) - 3 hours

**Total Critical Path Time**: 17 hours

## Success Criteria

### Immediate Success (Phase 1-2)
- [ ] IEB students see all 24 subjects
- [ ] Grade-appropriate questions for all students
- [ ] STEM students see <20% teaching careers initially
- [ ] Bias detection integrated without performance issues

### Long-term Success (Phase 3-5)
- [ ] User satisfaction scores improve
- [ ] Assessment completion rates increase
- [ ] Chat interactions are more refinement-focused
- [ ] System maintains high performance with bias detection

## Risk Mitigation

### High-Risk Tasks
- **Task 2.2** (RAG Integration): Risk of breaking existing functionality
  - Mitigation: Comprehensive testing, feature flags, gradual rollout
- **Task 2.1** (Bias Corrector): Risk of over-correction or poor quality
  - Mitigation: Conservative correction thresholds, quality validation

### Medium-Risk Tasks  
- **Task 1.1** (IEB Subjects): Risk of showing wrong subjects
  - Mitigation: Thorough testing with IEB curriculum validation
- **Task 3.2** (Chat Context): Risk of chat quality degradation
  - Mitigation: A/B testing, user feedback collection

## Deployment Strategy

### Phase 1 Deployment (Week 1)
- Deploy IEB subject fix and grade-specific questions
- Low risk, immediate user benefit
- Monitor for any issues with subject selection

### Phase 2 Deployment (Week 2)  
- Deploy bias detection with feature flag
- Gradual rollout to monitor performance
- A/B test bias correction effectiveness

### Phase 3 Deployment (Week 3)
- Deploy UX enhancements
- Full rollout after validation
- Continuous monitoring and optimization

## Definition of Done

Each task is considered done when:
- [ ] Code is written and reviewed
- [ ] Unit tests pass with adequate coverage
- [ ] Integration tests validate functionality
- [ ] Performance benchmarks are met
- [ ] User acceptance criteria are satisfied
- [ ] Documentation is updated
- [ ] Code is deployed to staging
- [ ] Production deployment is approved