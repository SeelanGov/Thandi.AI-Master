# Thandi Architecture Analysis: CAPS/IEB Foundation Layer Pivot

**Date**: November 27, 2025  
**Context**: Introducing CAPS and IEB curriculum alignment as Thandi's foundation layer  
**Impact**: Fundamental architectural shift from career-first to curriculum-first approach

---

## Executive Summary

Thandi is currently built as a **career guidance system** that maps student interests → careers → pathways. The introduction of CAPS and IEB alignment requires a **fundamental inversion**: the system must become a **curriculum-first platform** where subject choices and performance gates determine career possibilities.

**Current State**: "What careers match my interests?"  
**Required State**: "What can I actually pursue with my subject choices and marks?"

This is not a feature addition—it's an **architectural pivot** that affects every layer of the system.

---

## Current Architecture Analysis

### 1. Data Flow (Current)

```
Student Input (Interests + Subjects) 
    ↓
RAG System (Semantic Search)
    ↓
Career Recommendations
    ↓
Pathway Suggestions (Universities, TVET, Bursaries)
```

**Problem**: Subject requirements are treated as **filters** applied AFTER career matching, not as **gates** that determine what's possible.

### 2. Knowledge Base Structure (Current)

**110 Chunks Total**:
- 90 career chunks (validated, 87% accurate)
- 20 pathway chunks (experimental)

**Modules**:
1. Universities (5 institutions)
2. Bursaries (corporate + NSFAS)
3. Careers (24 profiles)
4. Subject-Career Mapping (loose associations)
5. 4IR Careers
6. TVET Colleges (5 institutions)
7. Private Institutions (5)
8. SETAs (5)
9. Decision-Making Framework
10. Career Misconceptions Framework

**Critical Gap**: No CAPS/IEB curriculum data, no subject prerequisite chains, no performance thresholds.

### 3. Assessment Flow (Current)

**Grade Selection** → **Subject Enjoyment** → **Interests** → **Constraints** → **Open Questions**

**For Grade 10**: Optional deep dive (current marks, support system)  
**For Grade 11-12**: Direct to recommendations

**Problem**: System asks "What subjects do you ENJOY?" but doesn't validate "What subjects are you TAKING?" or "What marks are you GETTING?"

### 4. Business Rules (Current)

**Rule #3 (Math-Hate Healthcare)**: Don't eliminate healthcare careers if student hates math  
**Rule #4 (NSFAS Prioritization)**: Show bursaries early for low-income students  
**Scope Boundary**: 110 chunks max, no comprehensive pathway database

**Problem**: Rules are **advisory**, not **gatekeeping**. They guide recommendations but don't enforce curriculum requirements.

---

## Required Architecture: CAPS/IEB Foundation Layer

### 1. New Data Model: Curriculum-First

```
CAPS/IEB Curriculum (Foundation Layer)
    ↓
Subject Prerequisites & Combinations
    ↓
Performance Gates (APS, Subject Minimums)
    ↓
Qualification Requirements
    ↓
Career Possibilities
```

### 2. Foundation Tables (New)

#### A. Curriculum Framework
```sql
CREATE TABLE curriculum_frameworks (
    id UUID PRIMARY KEY,
    framework_name VARCHAR(20) NOT NULL, -- 'CAPS', 'IEB'
    grade_level INTEGER NOT NULL, -- 10, 11, 12
    year INTEGER NOT NULL, -- 2025, 2026, etc.
    version VARCHAR(20),
    effective_date DATE,
    source_url TEXT
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL UNIQUE, -- 'MATH_CORE', 'MATH_LIT', 'PHYS_SCI'
    subject_name VARCHAR(100) NOT NULL,
    framework_id UUID REFERENCES curriculum_frameworks(id),
    subject_type VARCHAR(50), -- 'core', 'elective', 'language'
    nqf_level INTEGER,
    credit_value INTEGER,
    description TEXT,
    assessment_structure JSONB -- {exams, coursework, practicals}
);

CREATE TABLE subject_prerequisites (
    id UUID PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id),
    prerequisite_subject_id UUID REFERENCES subjects(id),
    minimum_mark INTEGER, -- Required mark in prerequisite
    grade_level INTEGER, -- When prerequisite must be met
    is_hard_requirement BOOLEAN DEFAULT true,
    alternative_subjects UUID[], -- Other subjects that satisfy requirement
    notes TEXT
);

CREATE TABLE subject_combinations (
    id UUID PRIMARY KEY,
    combination_name VARCHAR(200),
    framework_id UUID REFERENCES curriculum_frameworks(id),
    required_subjects UUID[] NOT NULL, -- Must take these
    elective_subjects UUID[], -- Choose X from these
    minimum_electives INTEGER,
    maximum_electives INTEGER,
    incompatible_subjects UUID[], -- Cannot take together
    recommended_for TEXT[], -- Career categories
    closes_doors_to TEXT[], -- Career categories blocked
    reversibility_deadline DATE, -- Last date to change
    notes TEXT
);
```

#### B. Performance Gates
```sql
CREATE TABLE qualification_requirements (
    id UUID PRIMARY KEY,
    qualification_id UUID, -- Links to existing university_programs
    institution_id UUID, -- Links to existing universities
    framework_id UUID REFERENCES curriculum_frameworks(id),
    
    -- APS Requirements
    minimum_aps INTEGER NOT NULL,
    aps_calculation_method JSONB, -- {includes_lo, top_subjects_count}
    
    -- Subject Requirements
    required_subjects JSONB NOT NULL,
    -- [{subject_code, minimum_mark, minimum_level, is_essential}]
    
    -- Alternative Pathways
    alternative_requirements JSONB,
    -- [{pathway_name, subjects, marks, conditions}]
    
    -- Additional Gates
    nbt_required BOOLEAN DEFAULT false,
    nbt_minimum_scores JSONB,
    portfolio_required BOOLEAN DEFAULT false,
    portfolio_deadline DATE,
    interview_required BOOLEAN DEFAULT false,
    
    -- Timing
    application_opens DATE,
    application_deadline DATE,
    early_decision_deadline DATE,
    
    -- Metadata
    last_verified DATE,
    source_url TEXT,
    notes TEXT
);

CREATE TABLE grade_gates (
    id UUID PRIMARY KEY,
    gate_type VARCHAR(50) NOT NULL, -- 'subject_choice', 'stream_selection', 'performance_threshold'
    grade_level INTEGER NOT NULL,
    gate_deadline DATE NOT NULL,
    is_reversible BOOLEAN DEFAULT false,
    reversal_deadline DATE,
    
    -- What this gate controls
    affects_qualifications UUID[], -- Which qualifications become unavailable
    affects_subjects UUID[], -- Which subjects become unavailable
    
    -- Conditions
    trigger_conditions JSONB,
    -- {current_subjects, current_marks, current_stream}
    
    -- Consequences
    consequences JSONB,
    -- {blocked_careers, blocked_qualifications, alternative_pathways}
    
    -- Guidance
    warning_message TEXT,
    correction_options TEXT[],
    deadline_message TEXT
);
```

#### C. Student Curriculum Tracking
```sql
CREATE TABLE student_curriculum_profile (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES student_assessments(id),
    framework_id UUID REFERENCES curriculum_frameworks(id),
    grade_level INTEGER NOT NULL,
    
    -- Current State
    current_subjects UUID[] NOT NULL,
    current_marks JSONB, -- {subject_id: {mark_range, term, year}}
    current_aps_estimate INTEGER,
    
    -- Gates Passed/Failed
    gates_passed UUID[],
    gates_failed UUID[],
    gates_at_risk UUID[],
    
    -- Possibilities
    available_qualifications UUID[],
    blocked_qualifications UUID[],
    at_risk_qualifications UUID[],
    
    -- Recommendations
    subject_changes_needed JSONB,
    mark_improvements_needed JSONB,
    deadline_warnings JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. New Assessment Flow

#### Grade 10 Flow
```
1. Grade Selection (10)
2. Current Subjects (What are you TAKING?)
3. Subject Performance (Current marks)
4. Career Interests (What sounds interesting?)
5. Constraints (Time, money, location)

↓ ANALYSIS ↓

6. Gate Check:
   - Which careers are STILL POSSIBLE with current subjects?
   - Which careers are BLOCKED (irreversibly)?
   - Which careers are AT RISK (need mark improvement)?

7. Correction Warnings:
   - "You want [career] but you're taking Math Lit → BLOCKED"
   - "Deadline to switch to Core Math: [date]"
   - "Alternative careers with Math Lit: [list]"

8. Preliminary Report:
   - Careers you CAN pursue (with current subjects)
   - Careers you COULD pursue (if you change subjects by [date])
   - Careers you CANNOT pursue (gates closed)

9. Deep Dive (Optional):
   - Mark improvement plan
   - Subject change recommendations
   - Year-by-year roadmap
```

#### Grade 11 Flow
```
1. Grade Selection (11)
2. Current Subjects (What are you TAKING?)
3. Current Marks (Q3 report card)
4. Target Qualifications (What do you want to study?)
5. Constraints

↓ ANALYSIS ↓

6. Qualification Feasibility:
   - Current APS estimate
   - Required APS for targets
   - Gap analysis
   - Probability assessment

7. Institution Comparison:
   - Same qualification, different institutions
   - Different APS requirements
   - Different subject requirements
   - Backup options

8. Performance Plan:
   - Marks needed in Grade 12
   - Subject-by-subject targets
   - Bursary eligibility thresholds
   - Provisional offer criteria

9. Application Timeline:
   - NBT registration deadlines
   - Portfolio deadlines
   - Application deadlines
   - Bursary deadlines
```

#### Grade 12 Flow
```
1. Grade Selection (12)
2. Current Subjects
3. Final Grade 11 Marks
4. September Grade 12 Marks (if available)
5. Target Qualifications

↓ ANALYSIS ↓

6. Application Readiness:
   - APS calculation (with/without LO)
   - Qualification eligibility (hard yes/no)
   - Backup options (if targets unrealistic)

7. Logistics Checklist:
   - NBT status
   - Portfolio status
   - Application status
   - Bursary applications
   - Accommodation applications

8. Final Recommendations:
   - Primary targets (realistic)
   - Backup options (safe)
   - Alternative pathways (if needed)

9. Action Plan:
   - Immediate tasks (this week)
   - Short-term tasks (this month)
   - Long-term tasks (before deadlines)
```

### 4. New RAG Strategy

#### Current RAG Approach
```javascript
// Semantic search across all career content
const query = `Student enjoys ${subjects}, interested in ${interests}`;
const chunks = await semanticSearch(query, 10);
const recommendations = await generateRecommendations(chunks);
```

#### Required RAG Approach
```javascript
// 1. GATE CHECK (Hard constraints)
const curriculumProfile = await analyzeCurriculumProfile({
  grade,
  subjects,
  marks,
  framework: 'CAPS' // or 'IEB'
});

// 2. FILTER QUALIFICATIONS (Before semantic search)
const availableQualifications = await filterByGates({
  allQualifications,
  curriculumProfile,
  includeAtRisk: true
});

// 3. SEMANTIC SEARCH (Within available options)
const query = `Student profile: ${interests}, ${values}`;
const relevantChunks = await semanticSearch(query, {
  filterBy: availableQualifications,
  includeRequirements: true
});

// 4. GENERATE WITH GATES (Context-aware)
const recommendations = await generateRecommendations({
  chunks: relevantChunks,
  gates: curriculumProfile.gates,
  warnings: curriculumProfile.warnings,
  deadlines: curriculumProfile.deadlines
});
```

### 5. Integration Points

#### A. G10-12 Guidance Engine (Existing)
**Current**: Separate edge function for institution requirements  
**Required**: Merge with curriculum foundation layer

```javascript
// Instead of separate API call
const guidanceData = await fetch('/api/g10-12/guidance', {
  method: 'POST',
  body: JSON.stringify(studentProfile)
});

// Integrate into core RAG flow
const recommendations = await generateRecommendations({
  studentProfile,
  curriculumGates: await getCurriculumGates(studentProfile),
  qualificationRequirements: await getQualificationRequirements(studentProfile),
  careerContent: await getCareerContent(studentProfile)
});
```

#### B. Subject-Career Mapping (Existing)
**Current**: `config/subject-career-map.js` (static mapping)  
**Required**: Dynamic mapping based on curriculum requirements

```javascript
// Current: Static boost/filter
if (studentProfile.enjoyedSubjects.includes('mathematics')) {
  boostCareers(['software_engineer', 'data_scientist']);
}

// Required: Gate-based filtering
const availableCareers = await filterCareersByGates({
  currentSubjects: studentProfile.subjects,
  currentMarks: studentProfile.marks,
  grade: studentProfile.grade,
  framework: studentProfile.framework
});

// Then apply interest-based ranking within available options
const rankedCareers = rankByInterests(availableCareers, studentProfile.interests);
```

#### C. Rules Engine (Existing)
**Current**: Advisory rules (Rule #3, Rule #4)  
**Required**: Enforce curriculum gates, then apply advisory rules

```javascript
// Current: Rule #3 (Don't eliminate healthcare if hate math)
if (studentProfile.hatesMath) {
  // Still show healthcare with warning
}

// Required: Check gates FIRST
const healthcareCareers = ['nursing', 'pharmacy', 'physiotherapy'];
const gateStatus = await checkGates(healthcareCareers, studentProfile);

if (gateStatus.blocked.length > 0) {
  // Hard block: "You're taking Math Lit → Pharmacy BLOCKED"
  // Show deadline to change subjects
} else if (gateStatus.atRisk.length > 0) {
  // Soft warning: "Math 45% → need 60% for Nursing"
  // Apply Rule #3 (encourage with support)
}
```

---

## Migration Strategy

### Phase 1: Foundation Layer (Week 1-2)
**Goal**: Build curriculum database without breaking existing system

1. **Create new tables** (curriculum_frameworks, subjects, subject_prerequisites, qualification_requirements, grade_gates)
2. **Seed CAPS data** (Grade 10-12 subjects, prerequisites, combinations)
3. **Seed IEB data** (differences from CAPS)
4. **Map existing qualifications** (link university_programs to qualification_requirements)
5. **Create gate detection logic** (identify what's blocked/at-risk)

**Validation**: Run existing test suite, ensure 87% accuracy maintained

### Phase 2: Assessment Integration (Week 3)
**Goal**: Capture curriculum data in assessment flow

1. **Update AssessmentForm.jsx**:
   - Add "Current Subjects" question (what are you TAKING?)
   - Distinguish "taking" vs "enjoying"
   - Add framework selection (CAPS vs IEB)
2. **Update SubjectSelection.jsx**:
   - Show subject combinations
   - Highlight incompatible subjects
   - Show reversibility deadlines
3. **Create CurriculumAnalyzer**:
   - Analyze student_curriculum_profile
   - Detect gates passed/failed/at-risk
   - Generate warnings and deadlines

**Validation**: Test with real Grade 10-12 profiles, verify gate detection

### Phase 3: RAG Integration (Week 4)
**Goal**: Make RAG curriculum-aware

1. **Update query generation**:
   - Include curriculum profile in context
   - Filter qualifications by gates
   - Prioritize available options
2. **Update prompt engineering**:
   - Add gate warnings to system prompt
   - Include deadlines in context
   - Emphasize blocked vs at-risk vs available
3. **Update response formatting**:
   - Show gate status per recommendation
   - Include correction options
   - Display deadlines prominently

**Validation**: Run 20-question test suite, target 90% accuracy (up from 87%)

### Phase 4: Grade-Specific Flows (Week 5-6)
**Goal**: Differentiate Grade 10/11/12 experiences

1. **Grade 10 Flow**:
   - Correction warnings
   - Subject change recommendations
   - Deadline alerts
2. **Grade 11 Flow**:
   - Qualification feasibility
   - Institution comparison
   - Performance targets
3. **Grade 12 Flow**:
   - Application readiness
   - Logistics checklist
   - Final recommendations

**Validation**: User testing with 5 students per grade

### Phase 5: Monitoring & Iteration (Week 7+)
**Goal**: Refine based on real usage

1. **Track gate detection accuracy**
2. **Monitor recommendation quality**
3. **Collect user feedback**
4. **Update curriculum data** (annual refresh)

---

## Data Requirements

### CAPS Curriculum Data
- **Subjects**: ~30 subjects (core + electives)
- **Prerequisites**: ~50 prerequisite relationships
- **Combinations**: ~10 common combinations (STEM, Commerce, Humanities, etc.)
- **Gates**: ~15 critical gates (subject choice deadlines, stream selection, etc.)

**Source**: Department of Basic Education (DBE) curriculum documents

### IEB Curriculum Data
- **Differences from CAPS**: ~10 unique subjects, different assessment structures
- **Prerequisites**: Similar to CAPS with variations
- **Combinations**: More flexible than CAPS

**Source**: IEB curriculum documents

### Qualification Requirements
- **Universities**: 5 institutions × 20 qualifications = 100 requirement sets
- **TVET**: 5 colleges × 10 programs = 50 requirement sets
- **Private**: 5 institutions × 5 programs = 25 requirement sets

**Total**: ~175 qualification requirement sets

**Source**: Institution websites, DHET, verified by phone calls

### Performance Thresholds
- **APS calculations**: Per institution (some exclude LO, some don't)
- **Subject minimums**: Per qualification (Math 60%, Physics 70%, etc.)
- **NBT requirements**: Per institution
- **Portfolio deadlines**: Per program

**Source**: Institution prospectuses, admissions offices

---

## Risk Assessment

### High Risk
1. **Data accuracy**: Curriculum requirements change annually
   - **Mitigation**: Annual refresh cycle, version control, source URLs
2. **Gate detection errors**: False positives/negatives
   - **Mitigation**: Conservative approach (warn rather than block), manual review
3. **Performance impact**: More complex queries
   - **Mitigation**: Caching, indexing, query optimization

### Medium Risk
1. **User confusion**: More complex assessment flow
   - **Mitigation**: Clear UI, progressive disclosure, help text
2. **Scope creep**: Temptation to add all institutions
   - **Mitigation**: Maintain 110-chunk limit, prioritize top 5 institutions
3. **Maintenance burden**: Keeping curriculum data current
   - **Mitigation**: Automated scraping where possible, annual review process

### Low Risk
1. **Breaking existing functionality**: Well-tested migration
   - **Mitigation**: Phased rollout, feature flags, rollback plan
2. **User adoption**: Students may not know their marks
   - **Mitigation**: Allow mark ranges, make deep dive optional

---

## Success Metrics

### Accuracy Metrics
- **Gate detection accuracy**: >95% (critical)
- **Recommendation relevance**: >90% (up from 87%)
- **Deadline accuracy**: 100% (non-negotiable)

### User Experience Metrics
- **Assessment completion rate**: >70% (maintain current)
- **Deep dive opt-in rate**: >40% (Grade 10)
- **User satisfaction**: >4.0/5.0

### System Performance Metrics
- **Query response time**: <10 seconds (maintain current)
- **Database query time**: <500ms (new requirement)
- **Cache hit rate**: >80% (for common queries)

---

## Conclusion

The CAPS/IEB foundation layer is not a feature—it's a **fundamental architectural shift** that requires:

1. **New data model**: Curriculum-first, not career-first
2. **New assessment flow**: Capture what students are TAKING, not just what they ENJOY
3. **New RAG strategy**: Filter by gates before semantic search
4. **New user experience**: Grade-specific flows with gate warnings

**Estimated Effort**: 6-8 weeks for full implementation  
**Priority**: HIGH - This is the difference between "helpful advice" and "actionable guidance"  
**Risk**: MEDIUM - Complex but manageable with phased approach

**Recommendation**: Start with Phase 1 (Foundation Layer) immediately. This can be built in parallel with existing system without breaking current functionality.
