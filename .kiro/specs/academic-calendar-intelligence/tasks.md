# Academic Calendar Intelligence - Implementation Tasks

**Date:** December 13, 2025  
**Priority:** CRITICAL - Production bug affecting Grade 12 students  
**Goal:** Fix incorrect timeline messaging and implement South African academic calendar intelligence  

---

## Implementation Plan

- [x] 1. Create Academic Calendar Engine



  - Build core calendar intelligence system
  - Implement South African academic year structure
  - Create timeline calculation functions
  - _Requirements: 1.1, 1.2, 1.3, 6.1_


- [ ] 1.1 Create calendar data structure
  - Define South African academic calendar for 2025-2027
  - Include term dates, exam periods, application deadlines
  - Structure for easy annual updates
  - _Requirements: 1.4, 5.4_


- [ ] 1.2 Implement timeline calculator
  - Calculate accurate months/weeks to finals based on current date
  - Handle academic year transitions (Dec→Jan)
  - Account for grade progression

  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 1.3 Create academic phase detector
  - Identify current phase: preparation, finals-approach, finals-active, post-finals, new-year
  - Handle edge cases around exam periods
  - Support multiple academic years
  - _Requirements: 3.1, 3.2, 4.1_

- [ ]* 1.4 Write unit tests for calendar engine
  - Test timeline calculations for all months and grades
  - Test phase detection accuracy
  - Test academic year boundary handling
  - _Requirements: 6.1, 6.2_

- [ ] 2. Fix Assessment Form Timeline Logic
  - Replace hardcoded date assumptions with dynamic calendar intelligence
  - Update query generation to use accurate timeline context
  - Maintain backward compatibility
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2.1 Update AssessmentForm.jsx
  - Replace hardcoded "finals in 1 month" logic
  - Integrate academic calendar engine
  - Generate contextually appropriate messages
  - _Requirements: 1.1, 3.1, 3.2_

- [ ] 2.2 Create context message generator
  - Generate grade and date-appropriate timeline messages
  - Handle different academic phases with appropriate urgency
  - Support post-finals guidance (December 2025 case)
  - _Requirements: 3.1, 3.3, 4.1_

- [ ] 2.3 Update DeepDiveQuestions.jsx
  - Fix "finals in ~1 month" hardcoded message
  - Use dynamic calendar context for urgency banners
  - Adjust question framing based on academic phase
  - _Requirements: 3.1, 3.4_

- [ ]* 2.4 Write integration tests for assessment flow
  - Test assessment with different current dates
  - Verify correct timeline messages for each grade
  - Test academic phase transitions
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 3. Implement Deadline Management System
  - Create system for tracking and displaying relevant deadlines
  - Include NSFAS, university applications, and other key dates
  - Filter deadlines by relevance to current date and grade
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3.1 Create deadline database
  - Structure for bursary application deadlines
  - University application periods
  - Results release dates and registration periods
  - _Requirements: 5.1, 5.4_

- [ ] 3.2 Implement deadline filtering logic
  - Show only future, relevant deadlines
  - Prioritize by urgency and student grade
  - Handle multiple application cycles
  - _Requirements: 5.2, 5.3, 5.5_

- [ ] 3.3 Update query generation with deadline context
  - Include relevant deadlines in AI context
  - Adjust urgency based on approaching deadlines
  - Provide specific action items with dates
  - _Requirements: 5.1, 5.2_

- [ ]* 3.4 Write property tests for deadline management
  - **Property 1: Deadline Relevance** - All returned deadlines should be future dates relevant to student grade
  - **Property 2: Deadline Prioritization** - Deadlines should be ordered by urgency and relevance
  - _Requirements: 5.1, 5.2_

- [ ] 4. Create Data Gathering Framework
  - Build system for collecting and validating South African academic calendar data
  - Create annual update process
  - Implement data validation and verification
  - _Requirements: 6.1, 6.2_

- [ ] 4.1 Design data collection strategy
  - Identify authoritative sources (Department of Basic Education, universities)
  - Create data validation framework
  - Plan for annual calendar updates
  - _Requirements: 6.1, 6.4_

- [ ] 4.2 Implement calendar data validator
  - Validate calendar data consistency
  - Check for missing or conflicting dates
  - Verify deadline accuracy against official sources
  - _Requirements: 6.2, 6.4_

- [ ] 4.3 Create annual update workflow
  - Process for updating calendar data each year
  - Validation checks before deployment
  - Rollback procedures if data issues detected
  - _Requirements: 6.1, 6.5_

- [ ]* 4.4 Write property tests for data validation
  - **Property 3: Calendar Consistency** - Academic calendar should have no date conflicts or gaps
  - **Property 4: Deadline Accuracy** - All deadlines should be realistic and properly sequenced
  - _Requirements: 6.2, 6.4_

- [ ] 5. Emergency Production Fix (Immediate)
  - Deploy hotfix for December 2025 Grade 12 students
  - Implement basic calendar awareness for current academic phase
  - Ensure post-finals messaging is correct
  - _Requirements: 1.1, 3.1, 4.1_

- [x] 5.1 Create emergency calendar patch




  - Hardcode correct academic phase for December 2025
  - Fix Grade 12 messaging to reflect completed finals
  - Provide appropriate post-finals guidance
  - _Requirements: 1.1, 4.1_

- [ ] 5.2 Deploy emergency fix to production
  - Test emergency fix in staging environment
  - Deploy with feature flag for safe rollback
  - Monitor for any issues with timeline messaging
  - _Requirements: 3.1, 4.1_

- [ ] 5.3 Verify fix with Grade 12 test scenarios
  - Test Grade 12 assessment in December 2025
  - Verify correct "finals complete" messaging
  - Confirm appropriate next-steps guidance
  - _Requirements: 4.1, 4.2_

- [ ] 6. Comprehensive Testing and Validation
  - Test all grade and date combinations
  - Validate timeline accuracy across academic years
  - Ensure no regression in existing functionality
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 6.1 Create comprehensive test suite
  - Test matrix: all grades × all months × multiple years
  - Edge case testing for academic year boundaries
  - Performance testing for calendar calculations
  - _Requirements: 6.1, 6.2_

- [ ]* 6.2 Write property-based tests
  - **Property 5: Timeline Accuracy** - Timeline calculations should be mathematically correct for any date/grade
  - **Property 6: Phase Recognition** - Academic phase should be correctly identified for any date
  - **Property 7: Message Appropriateness** - Generated messages should match academic phase and grade
  - _Requirements: 1.1, 3.1, 6.1_

- [ ] 6.3 Performance optimization
  - Cache calendar calculations for common date/grade combinations
  - Optimize timeline calculation algorithms
  - Monitor memory usage and response times
  - _Requirements: 6.1_

- [ ] 7. Documentation and Monitoring
  - Document new calendar system for future maintenance
  - Set up monitoring for timeline accuracy
  - Create runbook for annual calendar updates
  - _Requirements: 6.1, 6.4_

- [ ] 7.1 Create system documentation
  - Document calendar data structure and update process
  - Create troubleshooting guide for timeline issues
  - Document data sources and validation procedures
  - _Requirements: 6.4_

- [ ] 7.2 Implement monitoring and alerting
  - Monitor timeline calculation accuracy
  - Alert on calendar data inconsistencies
  - Track user feedback on timeline relevance
  - _Requirements: 6.1, 6.2_

- [ ] 8. Checkpoint - Verify Production Fix
  - Ensure all tests pass, ask the user if questions arise.

---

## Priority Execution Order

### Phase 1: Emergency Fix (This Week)
- Tasks 5.1, 5.2, 5.3 - Fix immediate December 2025 issue

### Phase 2: Core Implementation (Week 2-3)
- Tasks 1.1, 1.2, 1.3, 2.1, 2.2, 2.3 - Build calendar engine and integrate

### Phase 3: Enhanced Features (Week 4)
- Tasks 3.1, 3.2, 3.3 - Add deadline management

### Phase 4: Data Framework (Week 5-6)
- Tasks 4.1, 4.2, 4.3 - Build data gathering system

### Phase 5: Testing & Validation (Week 7)
- Tasks 6.1, 6.2, 6.3 - Comprehensive testing

### Phase 6: Documentation (Week 8)
- Tasks 7.1, 7.2 - Documentation and monitoring

---

## Success Criteria

### Immediate (Phase 1)
- [ ] Grade 12 students in December 2025 receive "finals complete" messaging
- [ ] No more "finals in 1 month" errors for completed exams
- [ ] Appropriate post-finals guidance provided

### Short-term (Phase 2-3)
- [ ] All grades receive accurate timeline information year-round
- [ ] Academic phase detection works correctly
- [ ] Relevant deadlines displayed based on current date

### Long-term (Phase 4-6)
- [ ] Automated annual calendar updates
- [ ] Data validation prevents incorrect information
- [ ] Comprehensive monitoring ensures ongoing accuracy

---

## Risk Mitigation

### High Risk: Breaking Existing Functionality
- **Mitigation:** Feature flags for gradual rollout, comprehensive testing
- **Rollback:** Immediate revert to hardcoded logic if issues detected

### Medium Risk: Incorrect Calendar Data
- **Mitigation:** Multiple data source validation, manual verification
- **Monitoring:** Automated checks for calendar consistency

### Low Risk: Performance Impact
- **Mitigation:** Caching strategy, performance testing
- **Monitoring:** Response time tracking, memory usage alerts

---

## Dependencies

- No external dependencies required
- Self-contained enhancement to existing assessment system
- Can be developed and deployed independently

---

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP
- Emergency fix (Phase 1) can be deployed independently while building full solution
- Calendar data will be version-controlled and updated annually
- System designed for easy maintenance and future enhancements