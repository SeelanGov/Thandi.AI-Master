# RAG Filtering Enhancement - Requirements

**Date:** December 12, 2024  
**Purpose:** Fix restrictive metadata filtering that limits career recommendations to 2 careers  
**Goal:** Ensure students receive 3-5 diverse, relevant career recommendations  

---

## Introduction

The THANDI AI RAG system currently has overly restrictive metadata filtering that reduces 40+ potential career matches to only 2 careers (Computer Engineer and Civil Engineer) for most student profiles. This creates a poor user experience where students perceive the system as having limited knowledge. The system architecture is solid, but the filtering logic needs enhancement to provide diverse, relevant career recommendations while maintaining quality standards.

## Glossary

- **RAG System**: Retrieval-Augmented Generation system that matches careers from knowledge base
- **Metadata Filtering**: Process that validates career chunks have proper career identification data
- **Career Chunk**: Individual knowledge base entry containing career information
- **Similarity Threshold**: Minimum semantic similarity score (0.6) for career relevance
- **Enrichment Process**: Adding full career data from database to matched chunks
- **Fallback Careers**: Backup career suggestions when insufficient matches found

---

## Requirements

### Requirement 1: Minimum Career Diversity

**User Story:** As a student completing the career assessment, I want to receive at least 3 different career recommendations, so that I have meaningful options to explore.

#### Acceptance Criteria

1. WHEN a student submits a valid assessment THEN the system SHALL return a minimum of 3 career recommendations
2. WHEN the RAG system finds fewer than 3 careers THEN the system SHALL automatically include fallback careers to reach the minimum
3. WHEN multiple students have similar profiles THEN the system SHALL still provide diverse career options across different categories
4. WHEN a student has a broad subject profile THEN the system SHALL return up to 5 career recommendations
5. WHEN the knowledge base contains relevant careers THEN the system SHALL not artificially limit results to 2 careers

### Requirement 2: Enhanced Metadata Filtering

**User Story:** As a system administrator, I want the RAG filtering to be flexible enough to capture all relevant careers while maintaining quality, so that students get comprehensive recommendations.

#### Acceptance Criteria

1. WHEN the system filters career chunks THEN the system SHALL accept chunks with any valid career identification method
2. WHEN a chunk has career_code or career_title metadata THEN the system SHALL include it in results
3. WHEN a chunk has career-related source tags THEN the system SHALL include it in results  
4. WHEN a chunk contains "Career:" in the text content THEN the system SHALL include it in results
5. WHEN traditional metadata is missing THEN the system SHALL use text pattern matching as backup identification

### Requirement 3: Intelligent Fallback System

**User Story:** As a student with a unique subject combination, I want to receive relevant career suggestions even if exact matches are limited, so that I can explore all my options.

#### Acceptance Criteria

1. WHEN the RAG system returns fewer than 3 careers THEN the system SHALL automatically trigger fallback career selection
2. WHEN selecting fallback careers THEN the system SHALL prioritize careers matching the student's subject areas
3. WHEN no subject-specific fallbacks exist THEN the system SHALL include high-demand careers appropriate for the student's grade level
4. WHEN combining RAG and fallback results THEN the system SHALL maintain career diversity across different categories
5. WHEN fallback careers are included THEN the system SHALL clearly indicate their match confidence level

### Requirement 4: Subject-Category Matching

**User Story:** As a student with specific subject strengths, I want career recommendations that align with my academic profile, so that the suggestions are relevant and achievable.

#### Acceptance Criteria

1. WHEN a student has STEM subjects THEN the system SHALL prioritize Engineering, Technology, and Science careers
2. WHEN a student has Business subjects THEN the system SHALL prioritize Business, Finance, and Economics careers
3. WHEN a student has Creative Arts subjects THEN the system SHALL prioritize Arts, Design, and Media careers
4. WHEN a student has mixed subjects THEN the system SHALL provide careers from multiple relevant categories
5. WHEN subject combinations are unusual THEN the system SHALL find interdisciplinary career matches

### Requirement 5: Quality Assurance Maintenance

**User Story:** As a compliance officer, I want enhanced filtering to maintain the same quality standards while increasing career diversity, so that students receive accurate and safe recommendations.

#### Acceptance Criteria

1. WHEN the system relaxes filtering criteria THEN the system SHALL maintain all existing safety and verification requirements
2. WHEN including additional careers THEN the system SHALL ensure all careers have valid descriptions and requirements
3. WHEN fallback careers are used THEN the system SHALL verify they come from the approved knowledge base
4. WHEN career recommendations are generated THEN the system SHALL include mandatory verification warnings
5. WHEN the CAG layer processes results THEN the system SHALL maintain the same quality verification standards

### Requirement 6: Performance Optimization

**User Story:** As a student waiting for career recommendations, I want the enhanced filtering to maintain fast response times, so that I don't experience delays.

#### Acceptance Criteria

1. WHEN the system processes enhanced filtering THEN the system SHALL complete career matching within 2 seconds
2. WHEN fallback careers are needed THEN the system SHALL retrieve them without adding more than 1 second to response time
3. WHEN multiple filtering criteria are checked THEN the system SHALL process them efficiently in parallel where possible
4. WHEN the knowledge base grows THEN the system SHALL maintain sub-3-second total response times
5. WHEN under load THEN the system SHALL prioritize response speed while maintaining minimum career count

### Requirement 7: Monitoring and Analytics

**User Story:** As a system administrator, I want to track the effectiveness of enhanced filtering, so that I can ensure students are getting better career diversity.

#### Acceptance Criteria

1. WHEN the system generates career recommendations THEN the system SHALL log the number of careers returned per request
2. WHEN fallback careers are used THEN the system SHALL track the frequency and reasons for fallback activation
3. WHEN different subject combinations are processed THEN the system SHALL monitor career diversity across categories
4. WHEN filtering criteria are applied THEN the system SHALL log how many careers pass each filter stage
5. WHEN the system is updated THEN the system SHALL provide metrics comparing before and after career diversity

### Requirement 8: Knowledge Base Compatibility

**User Story:** As a content manager, I want the enhanced filtering to work with the existing knowledge base structure, so that no data migration is required.

#### Acceptance Criteria

1. WHEN the system implements enhanced filtering THEN the system SHALL work with the current Supabase knowledge base schema
2. WHEN career chunks have inconsistent metadata THEN the system SHALL handle them gracefully without errors
3. WHEN new careers are added to the knowledge base THEN the system SHALL automatically include them in matching
4. WHEN metadata standards are improved THEN the system SHALL benefit from better data while maintaining backward compatibility
5. WHEN the knowledge base is updated THEN the system SHALL not require code changes to recognize new career formats

### Requirement 9: Grade-Specific Recommendations

**User Story:** As a Grade 10 student, I want career recommendations appropriate for my academic level and timeline, so that the guidance is relevant and actionable.

#### Acceptance Criteria

1. WHEN a Grade 10 student receives recommendations THEN the system SHALL include careers with 2+ year preparation timelines
2. WHEN a Grade 11 student receives recommendations THEN the system SHALL focus on university application requirements
3. WHEN a Grade 12 student receives recommendations THEN the system SHALL prioritize immediate next steps and application deadlines
4. WHEN any grade level is processed THEN the system SHALL ensure career recommendations match the student's academic timeline
5. WHEN career pathways are presented THEN the system SHALL show grade-appropriate preparation steps

### Requirement 10: Testing and Validation

**User Story:** As a quality assurance tester, I want comprehensive testing of the enhanced filtering system, so that I can verify it works correctly across all student profiles.

#### Acceptance Criteria

1. WHEN testing the enhanced system THEN the system SHALL be validated with at least 20 different student profile combinations
2. WHEN testing subject diversity THEN the system SHALL demonstrate appropriate career matching for STEM, Business, Arts, and Mixed profiles
3. WHEN testing edge cases THEN the system SHALL handle unusual subject combinations without errors
4. WHEN comparing before and after THEN the system SHALL show measurable improvement in career recommendation diversity
5. WHEN load testing THEN the system SHALL maintain performance standards under concurrent user scenarios

---

## Success Criteria

### Quantitative Metrics
- **Minimum 3 careers** returned for 95% of valid student profiles
- **Average 4-5 careers** returned for comprehensive profiles  
- **Sub-3-second response time** maintained for enhanced filtering
- **Zero system errors** during fallback career selection
- **100% verification warning** inclusion maintained

### Qualitative Improvements
- **Diverse career categories** represented in recommendations
- **Subject-relevant matching** improved across all academic areas
- **Student satisfaction** increased through more comprehensive options
- **System perception** improved from "limited" to "comprehensive"

### Testing Coverage
- **All grade levels** (10, 11, 12) tested and validated
- **All subject combinations** producing appropriate career matches
- **Edge cases** handled gracefully with meaningful fallbacks
- **Performance benchmarks** met under realistic load conditions

---

## Out of Scope

- Complete knowledge base restructuring or migration
- Changes to CAG verification or safety systems  
- Modifications to frontend user interface
- Integration with external career databases
- Real-time career market data updates
- Personalized learning path generation beyond career recommendations

---

## Dependencies

- Existing Supabase knowledge base with career data
- Current RAG search infrastructure (semantic and hybrid search)
- OpenAI embedding generation for career matching
- CAG quality verification system
- Redis caching system for performance optimization

---

## Risk Mitigation

### Technical Risks
- **Performance degradation**: Implement efficient parallel processing and maintain caching
- **Quality reduction**: Maintain all existing verification and safety checks
- **Database overload**: Use connection pooling and query optimization

### Business Risks  
- **Student confusion**: Ensure all recommendations include clear explanations and verification warnings
- **Compliance issues**: Maintain POPIA compliance and safety standards throughout enhancement
- **Rollback needs**: Implement feature flags for quick rollback if issues arise

</content>
</file></invoke>