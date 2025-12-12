# RAG Filtering Enhancement - Implementation Tasks

**Feature:** Enhanced RAG filtering for diverse career recommendations  
**Timeline:** 4 weeks  
**Priority:** High (fixes critical user experience issue)  

---

## Implementation Plan

- [x] 1. Enhanced Metadata Filtering Implementation


  - Create MetadataFilter class with multiple career identification methods
  - Update career-matcher.js to use enhanced filtering logic
  - Implement text pattern matching for career identification
  - Add comprehensive logging for filter stage analysis
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.1 Create MetadataFilter class


  - Write `lib/rag/metadata-filter.js` with flexible filtering criteria
  - Implement primary metadata checks (career_code, career_title)
  - Implement secondary source tag checks
  - Implement tertiary text pattern matching
  - Add validation methods for career chunk identification
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.2 Write property test for metadata filtering


  - **Property 2: Enhanced Metadata Recognition**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 1.3 Update career-matcher.js filtering logic


  - Replace restrictive metadata filter with enhanced MetadataFilter
  - Increase result multiplier from 4x to 8x for better coverage
  - Add detailed logging for each filter stage
  - Maintain backward compatibility with existing data
  - _Requirements: 2.1, 2.5_

- [x] 1.4 Write unit tests for MetadataFilter


  - Test each identification method independently
  - Test graceful handling of malformed metadata
  - Test backward compatibility with existing chunks
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [-] 2. Intelligent Fallback System Implementation

  - Create FallbackSelector class with subject-based prioritization
  - Implement subject-category mapping configuration
  - Integrate fallback system into career matching flow
  - Add confidence level adjustment for fallback careers
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.1 Create FallbackSelector class


  - Write `lib/rag/fallback-selector.js` with subject-based selection
  - Implement subject-category mapping configuration
  - Add grade-appropriate career filtering
  - Implement diversity maintenance across categories
  - Add confidence level calculation for fallback careers
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 2.2 Write property test for fallback quality

  - **Property 4: Fallback Quality Maintenance**
  - **Validates: Requirements 3.2, 3.3, 3.5**

- [x] 2.3 Integrate fallback system into career matching


  - Update `matchCareersToProfile` to check minimum career count
  - Trigger fallback selection when fewer than 3 careers found
  - Merge RAG and fallback results maintaining diversity
  - Add source tracking for career origin (rag/fallback/hybrid)
  - _Requirements: 3.1, 3.4_


- [ ] 2.4 Write property test for minimum career count
  - **Property 1: Minimum Career Count Guarantee**
  - **Validates: Requirements 1.1, 1.2, 3.1**


- [x] 2.5 Write unit tests for FallbackSelector

  - Test subject-based career prioritization
  - Test grade-appropriate career selection
  - Test diversity maintenance algorithms
  - Test confidence level calculations
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 3. Subject-Category Matching Enhancement



  - Implement subject-category mapping system
  - Add category-based career prioritization
  - Create interdisciplinary career matching for mixed subjects
  - Add category diversity validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.1 Create subject-category mapping configuration


  - Define comprehensive subject to career category mappings
  - Create `lib/rag/subject-category-map.js` configuration
  - Add support for interdisciplinary subject combinations
  - Implement category priority scoring system
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.2 Write property test for subject-category alignment


  - **Property 3: Subject-Category Alignment**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**


- [x] 3.3 Implement category-based career prioritization

  - Update career matching to use subject-category scores
  - Add category diversity validation in results
  - Implement interdisciplinary career matching logic
  - Add category distribution analysis and logging
  - _Requirements: 4.4, 4.5_

- [x] 3.4 Write property test for career diversity


  - **Property 5: Career Diversity Preservation**
  - **Validates: Requirements 1.3, 3.4**

- [x] 3.5 Write property test for unusual subjects

  - **Property 9: Unusual Subject Accommodation**
  - **Validates: Requirements 4.5**

- [ ] 4. Performance Optimization Implementation
  - Implement parallel processing for filter criteria
  - Add query optimization and result caching
  - Create performance monitoring and alerting
  - Optimize database queries and connection handling
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4.1 Implement parallel processing optimization
  - Refactor filtering stages to run in parallel where possible
  - Optimize database queries with proper indexing
  - Implement connection pooling for Supabase queries
  - Add query result caching for common patterns
  - _Requirements: 6.3, 6.4_

- [ ] 4.2 Write property test for performance boundaries
  - **Property 6: Performance Boundary Compliance**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 4.3 Add performance monitoring and alerting
  - Implement detailed timing logs for each processing stage
  - Add performance metrics collection and reporting
  - Create alerts for response time threshold breaches
  - Add memory usage monitoring during career matching
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 4.4 Write property test for scalability
  - **Property 7: Scalability Maintenance**
  - **Validates: Requirements 6.4, 6.5**

- [ ] 4.5 Write load tests for concurrent processing
  - Test 50+ simultaneous career matching requests
  - Verify memory usage under peak load
  - Test response time distribution under load
  - _Requirements: 6.5_

- [ ] 5. Checkpoint - Enhanced filtering core complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Integration and Error Handling
  - Implement comprehensive error handling for all components
  - Add graceful degradation for system failures
  - Integrate with existing CAG and safety systems
  - Add detailed logging and monitoring capabilities
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.1 Implement comprehensive error handling
  - Add error handling for metadata filter failures
  - Implement graceful degradation for fallback system failures
  - Add timeout handling for slow database queries
  - Create emergency fallback for complete system failures
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6.2 Integrate with existing safety systems
  - Ensure enhanced careers pass through CAG verification
  - Maintain all existing verification warning requirements
  - Preserve POPIA compliance and data sanitization
  - Add safety validation for fallback career content
  - _Requirements: 5.1, 5.4, 5.5_

- [ ] 6.3 Write integration tests with CAG system
  - Test enhanced careers through complete CAG pipeline
  - Verify safety warnings are maintained
  - Test error handling integration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.4 Add monitoring and analytics capabilities
  - Implement career count tracking per request
  - Add fallback usage frequency monitoring
  - Create career diversity metrics collection
  - Add filter stage performance analytics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6.5 Write monitoring validation tests
  - Test metrics collection accuracy
  - Verify analytics data integrity
  - Test monitoring system performance impact
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7. Broad Profile and Edge Case Handling
  - Implement handling for comprehensive subject profiles
  - Add support for unusual subject combinations
  - Create validation for maximum career limits
  - Add edge case testing and validation
  - _Requirements: 1.4, 1.5, 4.5_

- [ ] 7.1 Implement broad profile handling
  - Update system to return up to 5 careers for comprehensive profiles
  - Remove artificial limits that cap results at 2 careers
  - Add validation for maximum career count limits
  - Implement profile complexity scoring
  - _Requirements: 1.4, 1.5_

- [ ] 7.2 Write property test for broad profiles
  - **Property 8: Broad Profile Handling**
  - **Validates: Requirements 1.4, 1.5**

- [ ] 7.3 Add edge case handling and validation
  - Handle empty or invalid student profiles gracefully
  - Add validation for malformed subject combinations
  - Implement fallbacks for unsupported grade levels
  - Add comprehensive input validation
  - _Requirements: 4.5, 8.3, 8.4_

- [ ] 7.4 Write edge case validation tests
  - Test empty profile handling
  - Test invalid subject combinations
  - Test unsupported grade levels
  - Test malformed input data
  - _Requirements: 8.3, 8.4_

- [ ] 8. Knowledge Base Compatibility and Validation
  - Ensure compatibility with existing Supabase schema
  - Add validation for knowledge base data quality
  - Implement backward compatibility maintenance
  - Create data migration utilities if needed
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8.1 Validate knowledge base compatibility
  - Test enhanced filtering with current Supabase schema
  - Verify backward compatibility with existing career data
  - Add validation for inconsistent metadata handling
  - Test with production data copy
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 8.2 Add data quality validation utilities
  - Create tools to analyze knowledge base career coverage
  - Implement metadata consistency checking
  - Add career data completeness validation
  - Create reports for data quality improvements
  - _Requirements: 8.2, 8.3, 8.5_

- [ ] 8.3 Write knowledge base integration tests
  - Test with various knowledge base configurations
  - Verify handling of inconsistent metadata
  - Test automatic recognition of new career formats
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Comprehensive Testing and Validation
  - Implement comprehensive test suite for all components
  - Add end-to-end testing with diverse student profiles
  - Create performance validation under realistic load
  - Add regression testing for existing functionality
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9.1 Create comprehensive test suite
  - Implement test coverage for all new components
  - Add property-based tests for all correctness properties
  - Create integration tests for complete career matching flow
  - Add regression tests to prevent functionality breaks
  - _Requirements: 10.1, 10.2, 10.4_

- [ ] 9.2 Add diverse profile testing
  - Test with 20+ different student profile combinations
  - Validate STEM, Business, Arts, and Mixed subject profiles
  - Test edge cases with unusual subject combinations
  - Verify grade-specific behavior across all levels
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 9.3 Write end-to-end validation tests
  - Test complete student assessment to career recommendation flow
  - Verify integration with frontend and backend systems
  - Test PDF generation with enhanced career data
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9.4 Conduct performance validation testing
  - Load test with concurrent user scenarios
  - Validate response time requirements under realistic load
  - Test memory usage and resource consumption
  - Verify scalability with larger knowledge base
  - _Requirements: 10.5_

- [ ] 10. Deployment Preparation and Feature Flags
  - Implement feature flags for gradual rollout
  - Create deployment scripts and configuration
  - Add monitoring and alerting for production deployment
  - Prepare rollback procedures and documentation
  - _Requirements: All requirements for production readiness_

- [ ] 10.1 Implement feature flags system
  - Add `enhanced_rag_filtering` feature flag
  - Add `fallback_careers` feature flag  
  - Add `performance_monitoring` feature flag
  - Create feature flag configuration management
  - _Requirements: Production deployment safety_

- [ ] 10.2 Create deployment configuration
  - Update environment variables for enhanced filtering
  - Create deployment scripts for staged rollout
  - Add configuration validation for production settings
  - Create rollback scripts and procedures
  - _Requirements: Production deployment readiness_

- [ ] 10.3 Add production monitoring and alerting
  - Implement career count monitoring alerts
  - Add response time threshold alerts
  - Create error rate monitoring and notifications
  - Add diversity score tracking and reporting
  - _Requirements: Production system monitoring_

- [ ] 11. Final Checkpoint - System ready for deployment
  - Ensure all tests pass, ask the user if questions arise.
