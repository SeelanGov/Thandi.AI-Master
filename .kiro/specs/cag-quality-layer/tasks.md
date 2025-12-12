# CAG Quality Layer - Implementation Tasks

## Implementation Plan

This plan builds the CAG (Critic-Auditor-Governance) Quality Layer incrementally, starting with core components and progressively adding verification capabilities.

---

- [x] 1. Set up CAG infrastructure and core interfaces



  - Create directory structure for CAG components
  - Define TypeScript interfaces for CAGInput, VerificationResult, Issue
  - Set up configuration file for CAG settings


  - _Requirements: 9.1, 9.2_


- [ ] 2. Implement RuleBasedChecker component
  - [ ] 2.1 Create RuleBasedChecker class with check() method
    - Implement basic structure and interface

    - Add confidence scoring logic
    - _Requirements: 1.1, 8.1_
  
  - [ ] 2.2 Implement entity verification
    - Check institution names against database

    - Verify career titles exist in careers table
    - Validate qualification names
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 2.3 Implement data validation

    - Validate salary format (R prefix, reasonable ranges)
    - Check date formats
    - Detect hallucinated URLs
    - _Requirements: 2.4, 5.4_
  

  - [ ] 2.4 Implement policy rule loader
    - Load rules from rules/ directory
    - Parse rule markdown files





    - Create rule application engine
    - _Requirements: 7.1, 7.2_
  
  - [x] 2.5 Implement structural checks

    - Verify required sections present
    - Check verification warning included
    - Ensure no definitive prescriptions
    - _Requirements: 7.5, 1.5_


- [ ] 3. Implement SourceGroundingValidator
  - [x] 3.1 Create fact extraction logic





    - Extract factual claims from draft answer

    - Identify career, institution, and salary claims
    - _Requirements: 2.1, 4.1_

  
  - [ ] 3.2 Implement chunk matching algorithm
    - Match facts against RAG chunks
    - Calculate grounding scores
    - Identify ungrounded facts

    - _Requirements: 2.2, 4.2, 4.3_
  
  - [ ] 3.3 Build grounding report generator
    - Create detailed grounding analysis
    - Flag ungrounded claims

    - Suggest source-based corrections
    - _Requirements: 2.4, 6.1_





- [ ] 4. Implement LLMVerifier component
  - [ ] 4.1 Create LLMVerifier class with model adapter
    - Integrate with existing LLMAdapter
    - Support multiple models (GPT, Claude, Groq)

    - Add timeout handling
    - _Requirements: 1.1, 9.2_
  
  - [ ] 4.2 Build verification prompt template
    - Create structured prompt for CAG verification

    - Include source grounding instructions
    - Add SA-specific validation requirements
    - _Requirements: 1.2, 5.1, 5.2_
  







  - [ ] 4.3 Implement response parsing
    - Parse JSON responses from LLM

    - Handle invalid responses gracefully
    - Extract issues and recommendations
    - _Requirements: 1.3, 8.2_
  
  - [ ] 4.4 Add hallucination detection logic
    - Identify claims without source support

    - Flag specific numbers/dates that don't match
    - Detect invented entities
    - _Requirements: 6.1, 6.2, 6.5_






- [ ] 5. Implement DecisionMaker component
  - [ ] 5.1 Create decision logic
    - Combine rule and LLM results

    - Implement decision tree (approve/revise/reject/fallback)
    - Calculate final confidence scores
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 5.2 Implement revision engine

    - Apply corrections from LLM verification
    - Rewrite ungrounded claims using sources
    - Fix policy violations
    - _Requirements: 1.5, 2.5, 8.2_
  
  - [ ] 5.3 Build fallback handler
    - Detect critical failures
    - Return RAG draft safely
    - Log fallback reasons
    - _Requirements: 8.4, 8.5_

- [ ] 6. Implement main CAGLayer orchestrator
  - [ ] 6.1 Create CAGLayer class
    - Implement verify() method
    - Coordinate all components
    - Add timing and logging
    - _Requirements: 1.1, 9.1, 10.1_
  
  - [ ] 6.2 Add stage execution logic
    - Execute rule checks (Stage 1)
    - Execute LLM verification (Stage 2)
    - Execute decision making (Stage 3)
    - Handle stage failures gracefully
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 6.3 Implement performance optimizations
    - Add parallel execution for rule checks
    - Cache entity lookups
    - Skip LLM if rule confidence is high
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 7. Integrate CAG with RAG pipeline
  - [ ] 7.1 Update /api/rag/query route
    - Add CAG verification after LLM generation
    - Pass RAG chunks to CAG layer
    - Handle CAG results
    - _Requirements: 1.1, 2.1_
  
  - [ ] 7.2 Wire up rule loading
    - Load rules from rules/ directory
    - Pass rules to RuleBasedChecker
    - Apply rules during verification
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 7.3 Add monitoring and logging
    - Log CAG decisions
    - Track processing times
    - Record issue types and frequencies
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Create configuration and environment setup
  - [ ] 8.1 Create CAG configuration file
    - Define default settings
    - Add model selection options
    - Set timeout values
    - _Requirements: 9.1, 9.2_
  
  - [ ] 8.2 Add environment variables
    - CAG_LLM_MODEL
    - CAG_LLM_PROVIDER
    - CAG_STRICT_MODE
    - CAG_ENABLE_LOGGING
    - _Requirements: 9.2_
  
  - [ ] 8.3 Create CAG monitoring dashboard queries
    - Query for decision distribution
    - Query for processing times
    - Query for issue detection rates
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 9. Write unit tests for CAG components
  - [ ] 9.1 Test RuleBasedChecker
    - Test entity verification with known/unknown entities
    - Test data validation with valid/invalid formats
    - Test policy rule application
    - Test structural checks
  
  - [ ] 9.2 Test SourceGroundingValidator
    - Test fact extraction
    - Test chunk matching
    - Test grounding score calculation
  
  - [ ] 9.3 Test LLMVerifier
    - Test prompt generation
    - Test response parsing
    - Test timeout handling
    - Test model switching
  
  - [ ] 9.4 Test DecisionMaker
    - Test decision logic with all result combinations
    - Test revision application
    - Test fallback triggers

- [ ] 10. Write property-based tests for CAG
  - [ ] 10.1 Property test: Source grounding completeness
    - **Property 1: Source Grounding Completeness**
    - **Validates: Requirements 2.1, 2.2, 6.1**
    - For any approved answer, all factual claims must have corresponding RAG sources
  
  - [ ] 10.2 Property test: Hallucination detection
    - **Property 2: Hallucination Detection**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5**
    - For any draft with fake entities, CAG must detect them
  
  - [ ] 10.3 Property test: Policy rule application
    - **Property 3: Policy Rule Application**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - For any draft, all applicable rules must be applied
  
  - [ ] 10.4 Property test: Processing time bound
    - **Property 7: Processing Time Bound**
    - **Validates: Requirements 9.1, 9.4**
    - For any input, CAG must complete within 2 seconds
  
  - [ ] 10.5 Property test: Fallback safety
    - **Property 6: Fallback Safety**
    - **Validates: Requirements 8.5**
    - For any critical failure, system must return RAG draft

- [ ] 11. Write integration tests
  - [ ] 11.1 Test end-to-end CAG flow
    - Test with approved answer
    - Test with revised answer
    - Test with rejected answer
    - Test fallback scenarios
  
  - [ ] 11.2 Test rule integration
    - Test with math-hate-healthcare rule
    - Test with NSFAS-prioritization rule
    - Test with multiple rules active
  
  - [ ] 11.3 Test RAG pipeline integration
    - Test CAG in full RAG → LLM → CAG flow
    - Test with real student profiles
    - Test with various career types

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Create CAG documentation
  - [ ] 13.1 Write developer guide
    - How to configure CAG
    - How to add new rules
    - How to switch LLM models
    - _Requirements: 9.2_
  
  - [ ] 13.2 Write monitoring guide
    - How to track CAG performance
    - How to interpret decision logs
    - How to debug verification failures
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 13.3 Create troubleshooting guide
    - Common issues and solutions
    - How to handle fallback scenarios
    - How to tune confidence thresholds
    - _Requirements: 8.4, 8.5_

- [ ] 14. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Verify CAG is integrated with RAG pipeline
  - Confirm monitoring is working
  - Test with real student queries

---

## Implementation Notes

### Build Order Rationale

1. **Infrastructure first** (Task 1): Set up the foundation
2. **Rule-based checks** (Task 2): Fast, deterministic validation
3. **Source grounding** (Task 3): Core verification logic
4. **LLM verification** (Task 4): Semantic validation
5. **Decision making** (Task 5): Combine results
6. **Orchestration** (Task 6): Wire everything together
7. **Integration** (Task 7): Connect to RAG pipeline
8. **Configuration** (Task 8): Make it configurable
9. **Testing** (Tasks 9-11): Ensure correctness
10. **Documentation** (Task 13): Enable maintenance

### Key Dependencies

- Task 2 must complete before Task 6
- Task 3 must complete before Task 5
- Task 4 must complete before Task 5
- Tasks 2-5 must complete before Task 6
- Task 6 must complete before Task 7
- Task 7 must complete before Task 11 (integration tests)

### Testing Strategy

- Unit tests are optional but recommended for core logic
- Property-based tests are optional but provide strong correctness guarantees
- Integration tests are optional but validate the full pipeline
- Manual testing with real queries is required before production

### Performance Targets

- Rule-based checks: < 200ms
- LLM verification: < 1500ms
- Total CAG processing: < 2000ms
- Fallback decision: < 50ms

### Monitoring Requirements

Track these metrics in production:
- CAG processing time (p50, p95, p99)
- Decision distribution (approved/revised/rejected/fallback)
- Issue detection rate by type
- LLM verification skip rate
- Fallback trigger rate

---

## Next Steps

Once this implementation is complete, the CAG Quality Layer will:
- Prevent hallucinations from reaching students
- Ensure all career guidance is properly sourced
- Enforce SA-specific educational standards
- Apply Thandi.ai policies automatically
- Provide fast, reliable verification (sub-2-second)

The system will be model-agnostic, allowing you to use GPT, Claude, Groq, or any other LLM for verification while maintaining consistent quality standards.
