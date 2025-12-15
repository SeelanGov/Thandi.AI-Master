# Career Bias Mitigation - Requirements

**Date:** December 14, 2024  
**Purpose:** Eliminate teaching bias in career recommendations and ensure diverse, fair guidance  
**Goal:** Provide balanced career recommendations that don't perpetuate cultural or algorithmic biases  

---

## Introduction

The THANDI AI career recommendation system was discovered to have a significant teaching bias, where mathematics students consistently received teaching careers as their primary recommendations, even when their profiles suggested stronger alignment with STEM fields like engineering or technology. This bias originated from vector embeddings that learned cultural associations between mathematics and teaching from training data, despite the knowledge base containing more engineering content (28.6%) than teaching content (16.8%).

This specification addresses the critical need for bias mitigation in AI-powered career guidance systems, ensuring that students receive diverse, relevant recommendations that truly reflect their potential rather than perpetuating outdated stereotypes.

## Glossary

- **Teaching Bias**: Algorithmic tendency to over-recommend teaching careers due to cultural associations in training data
- **Vector Embedding Bias**: Learned associations in AI embeddings that favor certain career types over others
- **Career Diversity Enforcement**: Algorithmic correction to ensure balanced representation across career categories
- **STEM Boosting**: Prioritization mechanism for Science, Technology, Engineering, and Mathematics careers
- **Cultural Bias**: Societal stereotypes embedded in AI training data (e.g., "math = teaching")
- **Similarity Score Adjustment**: Modification of AI confidence scores to correct for bias

---

## Requirements

### Requirement 1: Teaching Bias Detection and Correction

**User Story:** As a mathematics student, I want to receive diverse career recommendations that include STEM options, not just teaching careers, so that I can explore all pathways aligned with my strengths.

#### Acceptance Criteria

1. WHEN the system detects >60% teaching careers in recommendations THEN the system SHALL automatically apply diversity correction
2. WHEN applying diversity correction THEN the system SHALL limit teaching careers to maximum 1 in the top 3 recommendations
3. WHEN a student has strong mathematics performance THEN the system SHALL ensure STEM careers appear in top recommendations
4. WHEN bias correction is applied THEN the system SHALL log the correction for monitoring purposes
5. WHEN teaching careers are included THEN they SHALL be presented as one option among diverse alternatives

### Requirement 2: STEM Career Prioritization for Mathematics Students

**User Story:** As a student excelling in mathematics and physical sciences, I want STEM careers to be prioritized in my recommendations, so that I can see pathways that match my academic strengths.

#### Acceptance Criteria

1. WHEN a student profile includes mathematics or physical sciences THEN the system SHALL identify them as a STEM candidate
2. WHEN STEM candidates are detected THEN the system SHALL boost STEM career similarity scores by +0.15
3. WHEN STEM boosting is applied THEN engineering, technology, and science careers SHALL rank higher in results
4. WHEN re-ranking occurs THEN the system SHALL maintain overall recommendation quality and relevance
5. WHEN STEM careers are boosted THEN the system SHALL log the boost application for transparency

### Requirement 3: Category Diversity Enforcement

**User Story:** As any student using the career guidance system, I want to receive recommendations from multiple career categories, so that I can explore diverse pathways and not be limited by algorithmic bias.

#### Acceptance Criteria

1. WHEN generating career recommendations THEN the system SHALL ensure representation from multiple career categories
2. WHEN category dominance is detected (>60% from one category) THEN the system SHALL apply diversity correction
3. WHEN diversity correction is applied THEN the system SHALL maintain at least 2 different categories in top 3 recommendations
4. WHEN selecting careers THEN the system SHALL prioritize the highest-scoring career from each category first
5. WHEN diversity is enforced THEN the system SHALL not compromise overall recommendation quality below acceptable thresholds

### Requirement 4: Bias Monitoring and Transparency

**User Story:** As a system administrator, I want to monitor bias patterns in career recommendations, so that I can ensure the system provides fair guidance to all students.

#### Acceptance Criteria

1. WHEN bias correction is triggered THEN the system SHALL log the bias type, severity, and correction applied
2. WHEN recommendations are generated THEN the system SHALL track category distribution across all requests
3. WHEN STEM boosting occurs THEN the system SHALL record the boost application and impact on rankings
4. WHEN diversity enforcement activates THEN the system SHALL log the original vs. corrected recommendation distribution
5. WHEN monitoring data is collected THEN the system SHALL provide reports on bias mitigation effectiveness

### Requirement 5: Cultural Bias Resistance

**User Story:** As a student from any background, I want career recommendations that reflect my individual potential rather than cultural stereotypes, so that I can pursue careers based on merit and interest.

#### Acceptance Criteria

1. WHEN the system processes any student profile THEN it SHALL not favor careers based on cultural stereotypes
2. WHEN mathematics students are evaluated THEN the system SHALL not default to teaching as the primary recommendation
3. WHEN vector embeddings show cultural bias THEN the algorithmic correction SHALL override the biased associations
4. WHEN career categories are underrepresented THEN the system SHALL actively promote diversity in recommendations
5. WHEN bias patterns emerge THEN the system SHALL automatically adjust to maintain fair representation

### Requirement 6: Quality Preservation During Bias Correction

**User Story:** As a student receiving bias-corrected recommendations, I want the careers to still be relevant and high-quality, so that the diversity doesn't come at the expense of accuracy.

#### Acceptance Criteria

1. WHEN bias correction is applied THEN the system SHALL maintain minimum similarity thresholds for all recommendations
2. WHEN STEM careers are boosted THEN they SHALL still meet relevance criteria for the student's profile
3. WHEN teaching careers are limited THEN the remaining teaching career SHALL be the highest-quality match
4. WHEN diversity is enforced THEN all recommended careers SHALL have valid descriptions and requirements
5. WHEN corrections are made THEN the overall recommendation quality SHALL not drop below 70% confidence

### Requirement 7: Algorithmic Fairness Validation

**User Story:** As a compliance officer, I want to validate that the bias mitigation system treats all students fairly regardless of their demographic characteristics, so that we maintain ethical AI practices.

#### Acceptance Criteria

1. WHEN students with similar academic profiles are processed THEN they SHALL receive similarly diverse recommendations
2. WHEN bias correction algorithms are applied THEN they SHALL not introduce new forms of discrimination
3. WHEN STEM boosting occurs THEN it SHALL be based solely on academic subject performance, not demographic factors
4. WHEN diversity enforcement activates THEN it SHALL apply consistently across all student populations
5. WHEN fairness is evaluated THEN the system SHALL demonstrate equitable treatment across different student groups

### Requirement 8: Performance Impact Minimization

**User Story:** As a student using the career guidance system, I want bias correction to happen seamlessly without affecting response times, so that I receive fair recommendations quickly.

#### Acceptance Criteria

1. WHEN bias detection algorithms run THEN they SHALL add no more than 100ms to total response time
2. WHEN diversity enforcement is applied THEN the correction SHALL complete within 200ms
3. WHEN STEM boosting occurs THEN the re-ranking SHALL not exceed 150ms processing time
4. WHEN multiple bias corrections are needed THEN the total additional processing SHALL not exceed 500ms
5. WHEN the system is under load THEN bias correction SHALL maintain performance while preserving fairness

### Requirement 9: Bias Correction Configurability

**User Story:** As a system administrator, I want to configure bias correction parameters, so that I can fine-tune the system's fairness mechanisms as needed.

#### Acceptance Criteria

1. WHEN configuring bias detection THEN the system SHALL allow adjustment of the teaching bias threshold (default: 60%)
2. WHEN setting STEM boost values THEN the system SHALL accept similarity score adjustments (default: +0.15)
3. WHEN defining diversity requirements THEN the system SHALL allow configuration of minimum categories in top recommendations
4. WHEN updating bias parameters THEN the system SHALL apply changes without requiring system restart
5. WHEN configuration changes are made THEN the system SHALL validate parameters to prevent degradation

### Requirement 10: Continuous Bias Assessment

**User Story:** As a data scientist, I want the system to continuously assess and adapt to new bias patterns, so that fairness is maintained as the knowledge base and user patterns evolve.

#### Acceptance Criteria

1. WHEN new career data is added THEN the system SHALL reassess potential bias patterns
2. WHEN recommendation patterns change THEN the system SHALL detect emerging bias trends
3. WHEN bias thresholds are exceeded THEN the system SHALL automatically trigger enhanced monitoring
4. WHEN new subject combinations appear THEN the system SHALL evaluate them for bias susceptibility
5. WHEN bias mitigation effectiveness changes THEN the system SHALL alert administrators for review

---

## Success Criteria

### Quantitative Metrics
- **Teaching bias elimination**: <30% teaching careers in mathematics student recommendations
- **STEM representation**: ≥40% STEM careers for mathematics/science students
- **Category diversity**: ≥2 categories represented in 95% of top-3 recommendations
- **Performance impact**: <500ms additional processing time for bias correction
- **Quality maintenance**: ≥70% average confidence maintained after bias correction

### Qualitative Improvements
- **Fair representation** across all career categories for qualified students
- **Cultural stereotype resistance** in AI-generated recommendations
- **Student satisfaction** with diverse, relevant career options
- **Algorithmic transparency** through comprehensive bias monitoring
- **Ethical AI compliance** with fairness and non-discrimination principles

### Monitoring Coverage
- **Real-time bias detection** for all recommendation requests
- **Category distribution tracking** across student populations
- **Bias correction effectiveness** measurement and reporting
- **Performance impact assessment** for all fairness algorithms
- **Continuous fairness validation** across diverse student profiles

---

## Out of Scope

- Complete retraining of vector embedding models
- Manual curation of individual career recommendations
- Demographic-based recommendation adjustments
- External career market data integration for bias assessment
- User interface changes to display bias correction information
- Integration with external fairness assessment tools

---

## Dependencies

- Existing RAG career matching system with vector embeddings
- Career categorization and subject-category mapping systems
- Performance monitoring and logging infrastructure
- Knowledge base with diverse career content across categories
- Student profile processing and validation systems

---

## Risk Mitigation

### Technical Risks
- **Over-correction**: Implement gradual bias adjustment with quality thresholds
- **Performance degradation**: Use efficient algorithms with caching and parallel processing
- **New bias introduction**: Continuous monitoring and validation of correction algorithms

### Business Risks
- **Student confusion**: Maintain clear explanations and verification warnings
- **Compliance issues**: Ensure all corrections maintain POPIA and ethical AI standards
- **Quality perception**: Balance diversity with relevance through quality thresholds

### Ethical Risks
- **Reverse discrimination**: Ensure bias correction doesn't unfairly disadvantage any career category
- **Transparency requirements**: Provide clear logging and monitoring of all bias corrections
- **Fairness validation**: Regular assessment of algorithmic fairness across student populations