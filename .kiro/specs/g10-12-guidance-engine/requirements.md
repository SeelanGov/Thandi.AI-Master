# Requirements Document

## Introduction

The G10-12 Guidance Engine addresses a critical gap in Thandi's knowledge base: institution-specific admission requirement granularity for Grades 10-12 learners. Currently, Thandi can provide academically sound career recommendations but lacks the ability to warn learners about practical barriers such as subject choice irreversibility, minimum performance thresholds, and institution-specific requirements. This feature will enable Thandi to provide course-correction warnings for Grade 10, gatekeeping clarity for Grade 11, and application precision for Grade 12.

**Scope:** This is a 48-hour prototype focusing on fixing 3 diagnostic queries. Admin UI, QA automation, and expanded coverage are Week 2+ features.

## Glossary

- **Thandi**: The career guidance system that provides personalized recommendations to South African learners
- **G10 Correction Gates**: Rules and thresholds that determine when Grade 10 learners can still change subject choices to pursue specific careers
- **Institution Gates**: Hard admission requirements per qualification and institution, including APS minimums and subject requirements
- **G12 Logistics**: Non-academic requirements such as portfolio deadlines, NBT requirements, and application procedures
- **APS**: Admission Point Score, a standardized scoring system used by South African universities
- **SAQA**: South African Qualifications Authority, which assigns unique codes to qualifications
- **NBT**: National Benchmark Tests, standardized assessments required by some institutions
- **LO**: Life Orientation, a subject that may be excluded from APS calculations
- **Requirements Engine**: The Supabase Edge Function that processes learner profiles against admission requirements
- **Maths Literacy**: Mathematical Literacy, a subject that disqualifies learners from most STEM programs
- **Core Maths**: Mathematics (also called Pure Mathematics), required for STEM programs

## Requirements

### Requirement 1

**User Story:** As a Grade 10 learner, I want to know if my current subject choices will prevent me from pursuing my desired career, so that I can make informed decisions before subject changes become irreversible.

#### Acceptance Criteria

1. WHEN a Grade 10 learner selects a career interest that requires specific subjects THEN the system SHALL identify any subject choice conflicts
2. WHEN a subject choice conflict exists THEN the system SHALL display the deadline by which the learner can still change subjects
3. WHEN a subject choice is irreversible THEN the system SHALL suggest alternative career pathways that align with the learner's current subjects
4. WHEN displaying correction warnings THEN the system SHALL include minimum Grade 11 performance thresholds required for the desired career
5. WHERE the learner's profile includes performance data THEN the system SHALL assess whether the learner is likely to meet minimum thresholds

### Requirement 2

**User Story:** As a Grade 11 learner, I want to understand my realistic chances of admission to specific programs based on my current performance, so that I can set achievable goals or adjust my plans.

#### Acceptance Criteria

1. WHEN a Grade 11 learner queries about a specific qualification THEN the system SHALL retrieve institution-specific admission requirements
2. WHEN displaying admission requirements THEN the system SHALL include minimum APS scores and required subject marks
3. WHEN the learner's current marks are below minimum thresholds THEN the system SHALL clearly indicate disqualification
4. WHEN multiple institutions offer the same qualification THEN the system SHALL compare requirements across institutions
5. WHEN provisional offer criteria exist THEN the system SHALL display the minimum Grade 11 final marks and Grade 12 September marks required

### Requirement 3

**User Story:** As a Grade 12 learner, I want to know all application requirements and deadlines for my target programs, so that I can submit complete applications on time.

#### Acceptance Criteria

1. WHEN a Grade 12 learner selects a target qualification THEN the system SHALL retrieve all logistical requirements
2. WHEN portfolio requirements exist THEN the system SHALL display the portfolio deadline
3. WHEN NBT tests are required THEN the system SHALL indicate this requirement
4. WHEN Life Orientation is excluded from APS calculations THEN the system SHALL inform the learner
5. WHEN interview requirements exist THEN the system SHALL notify the learner
6. WHEN displaying requirements THEN the system SHALL organize them by deadline chronologically

### Requirement 4

**User Story:** As a system administrator, I want to store and manage admission requirements in a structured database, so that Thandi can provide accurate and up-to-date guidance.

#### Acceptance Criteria

1. WHEN storing G10 correction gates THEN the system SHALL record subject choices, career categories, reversibility dates, and minimum thresholds
2. WHEN storing institution gates THEN the system SHALL record qualification IDs, institution names, APS minimums, and subject rules
3. WHEN storing G12 logistics THEN the system SHALL record deadlines, NBT requirements, and additional requirements
4. WHEN requirements are updated THEN the system SHALL maintain referential integrity across related tables
5. WHEN querying requirements THEN the system SHALL return results within 500 milliseconds

### Requirement 5

**User Story:** As a developer, I want a requirements engine API that processes learner profiles against admission requirements, so that the frontend can display personalized guidance.

#### Acceptance Criteria

1. WHEN the requirements engine receives a learner profile THEN the system SHALL validate the profile structure
2. WHEN processing a Grade 10 profile THEN the system SHALL query G10 correction gates and return relevant warnings
3. WHEN processing a Grade 11 profile THEN the system SHALL query institution gates and return admission requirements
4. WHEN processing a Grade 12 profile THEN the system SHALL query G12 logistics and return application requirements
5. WHEN the engine encounters errors THEN the system SHALL return structured error messages with appropriate HTTP status codes

### Requirement 6

**User Story:** As a frontend developer, I want to integrate the requirements engine into Thandi's guidance workflow, so that learners receive comprehensive advice.

#### Acceptance Criteria

1. WHEN generating guidance for a learner THEN the system SHALL call the requirements engine with the learner's profile
2. WHEN the requirements engine returns data THEN the system SHALL merge it with base guidance
3. WHEN displaying guidance THEN the system SHALL present requirements in a user-friendly format
4. WHEN API calls fail THEN the system SHALL gracefully degrade and display base guidance without requirements
5. WHEN requirements data is unavailable THEN the system SHALL log the gap for administrator review

### Requirement 7

**User Story:** As a content manager, I want to seed the database with priority qualifications and institutions, so that Thandi can provide guidance for the most common learner queries.

#### Acceptance Criteria

1. WHEN seeding data THEN the system SHALL include the top 20 qualifications most frequently queried by learners
2. WHEN seeding data THEN the system SHALL include requirements for at least 5 major institutions
3. WHEN seeding data THEN the system SHALL validate all SAQA qualification codes
4. WHEN seeding data THEN the system SHALL ensure all dates are in ISO 8601 format
5. WHEN seeding completes THEN the system SHALL generate a summary report of inserted records

### Requirement 8

**User Story:** As a quality assurance tester, I want to run diagnostic queries against Thandi, so that I can verify the system provides accurate and specific guidance.

#### Acceptance Criteria

1. WHEN testing G10 guidance THEN the system SHALL correctly identify subject choice conflicts and provide specific deadlines
2. WHEN testing G11 guidance THEN the system SHALL accurately assess admission chances based on current performance
3. WHEN testing G12 guidance THEN the system SHALL display all required application materials and deadlines
4. WHEN running diagnostic queries THEN the system SHALL respond with specific, actionable information rather than generic advice
5. WHEN comparing responses before and after implementation THEN the system SHALL demonstrate measurable improvement in specificity
