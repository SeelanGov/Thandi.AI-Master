# Knowledge Base Remediation - Requirements Document

## Introduction

This specification addresses the critical knowledge gaps in Thandi's RAG system that resulted in a 15% pass rate (3/20) on the test suite. The remediation focuses on creating 70 targeted content chunks across 2 weeks to achieve a 70-80% pass rate (14-16/20) before the January 2026 pilot launch.

## Glossary

- **RAG System**: Retrieval-Augmented Generation system that retrieves knowledge chunks and generates AI responses
- **V.I.S. Model**: Values, Interests, Skills/Abilities - the three-pillar framework for career decision-making
- **Knowledge Chunk**: A structured content piece stored in the knowledge base with embeddings for semantic search
- **Pass Rate**: Percentage of test questions where AI response covers 80%+ of key points in ideal answer
- **Sprint**: A focused content creation phase targeting specific knowledge gaps

## Requirements

### Requirement 1: Sprint 1.1 - Decision-Making Frameworks Module

**User Story:** As a Grade 11-12 student stuck between two career paths, I want structured decision-making frameworks so that I can make confident career choices based on my values, interests, and abilities.

#### Acceptance Criteria

1. THE Knowledge Base SHALL contain 15 decision-making framework chunks covering career choice methodology
2. WHEN a student asks "I'm stuck between two career paths. How do I choose?" (Q19), THE RAG System SHALL retrieve relevant decision-making chunks and generate a response covering 80%+ of key points
3. WHEN a student asks "Should I study what I love or what pays well?" (Q20), THE RAG System SHALL retrieve passion vs pay framework chunks and generate a response covering 80%+ of key points
4. WHERE the student query involves career indecision, THE RAG System SHALL prioritize V.I.S. Model-based guidance over generic advice
5. THE Knowledge Base SHALL structure each chunk with: Question/Misconception, Reality, Practical Examples, Action Steps, and Sources sections

### Requirement 2: Content Structure and Quality Standards

**User Story:** As the RAG system, I need consistently structured knowledge chunks so that I can retrieve and assemble coherent, actionable responses.

#### Acceptance Criteria

1. THE Knowledge Base SHALL format each chunk using the standardized template with 5 sections
2. WHEN creating practical examples, THE Content SHALL include specific South African data (universities, salaries in ZAR, bursaries)
3. THE Content SHALL include quantitative scoring matrices where applicable (e.g., Career Choice Matrix with weighted factors)
4. THE Content SHALL cite research sources for all claims about career outcomes, salary ranges, and decision frameworks
5. THE Content SHALL avoid generic advice and provide specific, actionable next steps

### Requirement 3: Sprint 1.1 Content Coverage

**User Story:** As a student facing career decisions, I want comprehensive guidance on all aspects of decision-making so that I can address my specific situation.

#### Acceptance Criteria

1. THE Module SHALL include the Career Choice Matrix framework (Chunks 1-3) with scoring methodology
2. THE Module SHALL include the Passion vs Pay framework (Chunks 4-7) with 4 scenario types
3. THE Module SHALL include practical decision tools (Chunks 8-11) including 5 must-ask questions, decision tree, job shadowing guide, and gut check method
4. THE Module SHALL include career change guidance (Chunks 12-13) normalizing uncertainty and pivot strategies
5. THE Module SHALL include foundational concepts (Chunks 14-15) covering whole-person approach and risk tolerance assessment

### Requirement 4: Integration with Existing Knowledge Base

**User Story:** As the system administrator, I need the new decision-making module to integrate seamlessly with existing knowledge modules so that cross-module queries work correctly.

#### Acceptance Criteria

1. THE Decision-Making Module SHALL reference existing modules (NSFAS, TVET, Bursaries) where relevant
2. WHEN a decision involves financial constraints, THE RAG System SHALL retrieve both decision-making chunks AND financial planning chunks
3. THE Module SHALL use consistent terminology with existing modules (e.g., "NSFAS", "TVET", "4IR")
4. THE Module SHALL be stored in the knowledge base with module identifier "decision_making_framework"
5. THE Module SHALL generate embeddings compatible with existing pgvector search infrastructure

### Requirement 5: Validation and Testing

**User Story:** As the product owner, I need to validate that Sprint 1.1 content improves test performance so that I can confirm the remediation strategy is working.

#### Acceptance Criteria

1. AFTER Sprint 1.1 completion, THE Test Suite SHALL be run on Q19 and Q20
2. THE RAG System SHALL achieve 2/2 pass rate (100%) on decision-making questions (Q19, Q20)
3. IF pass rate is below 2/2, THE Content SHALL be revised based on failure analysis
4. THE System SHALL log which specific chunks were retrieved for each test question
5. THE Validation SHALL confirm response includes V.I.S. Model references and specific decision frameworks

### Requirement 6: File Structure and Organization

**User Story:** As a developer, I need clear file organization so that I can easily locate, update, and maintain knowledge base content.

#### Acceptance Criteria

1. THE Module SHALL be stored in directory `thandi_knowledge_base/decision_making_framework/`
2. THE Module SHALL include files: `decision_making.json` (structured data) and `decision_making.html` (formatted content)
3. EACH chunk SHALL have a unique identifier (e.g., "dm_chunk_01_career_choice_matrix")
4. THE Module SHALL include a README.md documenting chunk purposes and cross-references
5. THE Module SHALL be version-controlled with clear commit messages for each chunk addition

### Requirement 7: Sprint 1.1 Specific Content Requirements

**User Story:** As a content creator, I need detailed specifications for each of the 15 chunks so that I can generate high-quality, consistent content.

#### Acceptance Criteria

1. **Chunk 1-3 (Career Choice Matrix)**: THE Content SHALL include weighted scoring matrix with Interest (×3), Ability (×3), Security (×2), Salary (×2), Affordability (×2) factors
2. **Chunk 4-7 (Passion vs Pay)**: THE Content SHALL define 4 scenarios (Dream Job, Safety Net, Gamble, Disaster) with specific recommendations for each
3. **Chunk 8 (5 Must-Ask Questions)**: THE Content SHALL include questions testing V.I.S. alignment, financial reality, external pressure, academic feasibility, and affordability
4. **Chunk 9 (Decision Tree)**: THE Content SHALL provide 4-step process: Know Yourself (V.I.S.) → Know Options → Use Matrix → Test & Commit
5. **Chunk 10 (Job Shadowing)**: THE Content SHALL include scripts for informational interviews with 3 specific questions
6. **Chunk 11 (Gut Check)**: THE Content SHALL explain how to reconcile rational matrix scores with emotional intuition
7. **Chunk 12-13 (Career Change)**: THE Content SHALL normalize career pivots with SA-specific examples and 3-step pivot strategy
8. **Chunk 14 (Whole Person)**: THE Content SHALL address family pressure, emotional distress, and holistic well-being
9. **Chunk 15 (Risk Tolerance)**: THE Content SHALL include financial risk assessment questions and safety cushion recommendations

### Requirement 8: Success Metrics

**User Story:** As the product owner, I need clear success metrics so that I can determine if Sprint 1.1 achieved its objectives.

#### Acceptance Criteria

1. THE Sprint 1.1 SHALL be considered successful WHEN Q19 and Q20 achieve 80%+ key point coverage
2. THE Sprint 1.1 SHALL be considered successful WHEN overall test pass rate increases from 15% (3/20) to at least 25% (5/20)
3. THE Sprint 1.1 SHALL be completed within 5 days (Week 1, Days 1-5)
4. THE Sprint 1.1 SHALL cost less than R1.00 in embedding generation fees
5. THE Sprint 1.1 SHALL produce reusable content that can be referenced in future sprints

## Out of Scope for Sprint 1.1

- Sprint 1.2 (Career Misconceptions - 20 chunks)
- Sprint 2.1 (4IR Careers Deep-Dive - 25 chunks)
- Sprint 2.2 (Financial Planning Expansion - 10 chunks)
- Sprint 2.3 (Subject-Career Matching - 15 chunks)
- Frontend UI updates to display decision-making frameworks
- PDF report generation with decision matrix visualizations
- Student profile integration with decision-making logic

## Dependencies

- Existing RAG system infrastructure (embeddings.js, search.js, retrieval.js, generation.js)
- Supabase database with knowledge_chunks table and pgvector extension
- OpenAI API for embedding generation
- Groq API for response generation
- Test suite (scripts/test-rag-suite.js) for validation

## Constraints

- Content must be appropriate for Grade 11-12 students (ages 16-18)
- All salary figures must be in South African Rands (ZAR)
- All university and bursary references must be South African institutions
- Content must align with South African education system (NSC, TVET, NSFAS)
- Must stay within Supabase free tier limits (500MB storage)
- Must stay within OpenAI free tier limits for embedding generation

## Acceptance Criteria Summary

Sprint 1.1 is complete when:
- ✅ 15 decision-making framework chunks created and stored
- ✅ All chunks follow standardized 5-section template
- ✅ Chunks uploaded to Supabase with embeddings generated
- ✅ Test suite run on Q19 and Q20 shows 2/2 pass rate
- ✅ Content includes V.I.S. Model, Career Choice Matrix, and Passion vs Pay frameworks
- ✅ Documentation updated with chunk references and cross-links
- ✅ Overall test pass rate increases to at least 25% (5/20)
