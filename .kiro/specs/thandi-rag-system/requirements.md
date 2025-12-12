# Requirements Document

## Introduction

The Thandi RAG (Retrieval-Augmented Generation) System is the core AI recommendation engine for a career guidance platform targeting South African high school students (Grade 11-12). The system processes student assessment responses and provides personalized career recommendations by retrieving relevant information from 10 knowledge modules covering South African universities, bursaries, careers, TVET colleges, and related educational pathways.

## Glossary

- **Thandi_System**: The complete AI career guidance platform
- **RAG_Engine**: The retrieval-augmented generation component that matches student profiles to career recommendations
- **Assessment_Module**: The 15-20 question career assessment component
- **Knowledge_Base**: Collection of 10 structured knowledge modules containing SA educational and career data
- **Student_Profile**: Aggregated data from student assessment responses including interests, strengths, and constraints
- **Career_Match**: A recommended career path with supporting rationale, requirements, and next steps
- **Vector_Store**: Database storing embedded representations of knowledge content for semantic search
- **Recommendation_Report**: Generated output containing 3-5 career matches with bursary information and action steps

## Requirements

### Requirement 1

**User Story:** As a Grade 11-12 student, I want to receive personalized career recommendations based on my assessment responses, so that I can make informed decisions about my future education and career path.

#### Acceptance Criteria

1. WHEN a student completes the assessment, THE RAG_Engine SHALL process their responses within 10 seconds
2. THE RAG_Engine SHALL retrieve relevant information from the Knowledge_Base using semantic search
3. THE RAG_Engine SHALL generate exactly 3-5 Career_Match recommendations per student
4. WHEN generating recommendations, THE RAG_Engine SHALL include reasoning, educational requirements, and bursary opportunities for each Career_Match
5. THE RAG_Engine SHALL achieve an 18/20 pass rate on the predefined test scenarios

### Requirement 2

**User Story:** As a career counselor, I want students to receive accurate and relevant career guidance, so that they can pursue realistic and achievable educational pathways.

#### Acceptance Criteria

1. THE RAG_Engine SHALL retrieve information from all 10 Knowledge_Base modules during recommendation generation
2. WHEN a student indicates financial constraints, THE RAG_Engine SHALL prioritize bursary and NSFAS funding options in recommendations
3. WHEN a student shows strong academic performance, THE RAG_Engine SHALL include university pathways in Career_Match results
4. WHEN a student prefers practical learning, THE RAG_Engine SHALL include TVET college options in Career_Match results
5. THE RAG_Engine SHALL provide specific next steps and admission requirements for each Career_Match

### Requirement 3

**User Story:** As a system administrator, I want the RAG system to operate within technical constraints, so that the platform remains cost-effective and performant for schools.

#### Acceptance Criteria

1. THE RAG_Engine SHALL complete recommendation generation within 10 seconds on 3G network connections
2. THE Vector_Store SHALL operate within Supabase 500MB storage limits
3. THE RAG_Engine SHALL maintain 99% uptime during school hours (8am-4pm SAST)
4. WHEN processing student data, THE RAG_Engine SHALL comply with POPIA data protection requirements
5. THE RAG_Engine SHALL support concurrent processing for up to 100 students per school

### Requirement 4

**User Story:** As a student with limited internet connectivity, I want the system to work reliably on slow connections, so that I can complete my assessment and receive recommendations despite technical limitations.

#### Acceptance Criteria

1. THE Assessment_Module SHALL load within 3 seconds on 3G connections
2. WHEN internet connectivity is intermittent, THE Assessment_Module SHALL save responses locally and sync when connection is restored
3. THE RAG_Engine SHALL optimize API responses to minimize bandwidth usage
4. WHEN generating recommendations, THE RAG_Engine SHALL compress response data while maintaining content quality
5. THE RAG_Engine SHALL provide meaningful error messages when network issues occur

### Requirement 5

**User Story:** As a school principal, I want to generate professional reports for students, so that I can provide formal career guidance documentation to students and parents.

#### Acceptance Criteria

1. WHEN recommendations are generated, THE RAG_Engine SHALL format data for PDF report generation
2. THE RAG_Engine SHALL include school branding placeholders in report data structure
3. THE RAG_Engine SHALL generate report data within 5 seconds of recommendation completion
4. THE RAG_Engine SHALL structure Career_Match data to support 3-4 page professional report layout
5. THE RAG_Engine SHALL include bursary deadline information in report data when applicable

### Requirement 6

**User Story:** As a system developer, I want comprehensive API endpoints for the RAG system, so that I can integrate career recommendations with the frontend application and admin dashboard.

#### Acceptance Criteria

1. THE RAG_Engine SHALL provide a POST endpoint for processing Student_Profile assessment data
2. THE RAG_Engine SHALL provide a GET endpoint for retrieving generated Career_Match recommendations
3. THE RAG_Engine SHALL provide a GET endpoint for accessing Knowledge_Base statistics and health metrics
4. WHEN API requests are made, THE RAG_Engine SHALL return structured JSON responses with consistent error handling
5. THE RAG_Engine SHALL implement rate limiting to prevent abuse while supporting school usage patterns