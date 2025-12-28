# IEB and CAPS Knowledge Base Report
*Generated: December 27, 2025*

## Executive Summary

### Current Status: **CRITICAL GAPS IDENTIFIED**
- **CAPS Directory**: Empty (0 content files)
- **IEB Directory**: Empty (0 content files)  
- **Curriculum Coverage**: Partial (NSC framework exists, specific CAPS/IEB content missing)
- **System Integration**: Functional (curriculum differentiation works in application)

---

## 1. Directory Structure Analysis

### 📁 CAPS Knowledge Base
```
thandi_knowledge_base/caps/
└── requirements/
    └── (EMPTY - 0 files)
```
**Status**: ❌ **CRITICAL GAP** - No CAPS-specific curriculum content

### 📁 IEB Knowledge Base  
```
thandi_knowledge_base/ieb/
└── requirements/
    └── (EMPTY - 0 files)
```
**Status**: ❌ **CRITICAL GAP** - No IEB-specific curriculum content

---

## 2. Existing Curriculum Content

### ✅ What We DO Have:

#### A. NSC Framework (General)
**Location**: `thandi_knowledge_base/nsc_framework/`
- **nsc_curriculum.json** - Comprehensive NSC metadata
- **nsc_curriculum.html** - Student-facing NSC guide
- **Coverage**: General NSC requirements, subject structure, pass requirements
- **Quality Score**: 10/10 (Complete and accurate)

#### B. Curriculum Gates System
**Location**: `thandi_knowledge_base/curriculum_gates/`
- **gate-chunks.js** - 5 critical decision points
- **Coverage**: CAPS vs IEB differences, subject switching rules, APS calculations
- **Quality Score**: 9/10 (Highly actionable)

#### C. SAQA Framework References
**Location**: `thandi_knowledge_base/saqa_framework/`
- **Mentions**: CAPS curriculum integration with NQF levels
- **Coverage**: Limited references to CAPS within broader framework

---

## 3. How Curriculum Information Is Currently Used

### 🔄 Application Integration Flow:

#### A. Frontend Assessment Form
```javascript
// User selects curriculum type
curriculumProfile: {
  framework: 'CAPS' | 'IEB',
  grade: 10|11|12,
  currentSubjects: ['Mathematics', 'Physical Sciences', ...]
}
```

#### B. Subject Filtering Logic
```javascript
// IEB-specific filtering in assessment
const availableSubjects = curriculumProfile?.currentSubjects?.length > 0 
  ? SUBJECTS.filter(subject => {
      return curriculumProfile.currentSubjects.some(currentSubj => {
        // Match subjects from curriculum profile
      });
    })
  : ALL_SUBJECTS;
```

#### C. RAG Query Processing
```javascript
// API processes curriculum context
const { grade, curriculum, curriculumProfile } = body;
const curriculumType = curriculum || 'caps';

// Generates curriculum-aware responses
generateCareerGuidance(query, grade, curriculumType, studentProfile);
```

#### D. Curriculum Gates Integration
```javascript
// Decision points loaded from curriculum_gates/gate-chunks.js
CURRICULUM_GATE_CHUNKS.forEach(chunk => {
  // Process CAPS vs IEB specific rules
  // Handle subject switching deadlines
  // Calculate APS differences
});
```

---

## 4. Critical Missing Content

### ❌ CAPS-Specific Content Needed:

#### A. Subject Requirements
- **File**: `caps/requirements/subject_requirements.json`
- **Content**: Grade-by-grade subject options, prerequisites, switching rules
- **Impact**: Cannot provide CAPS-specific subject guidance

#### B. Assessment Structure
- **File**: `caps/requirements/assessment_structure.json`  
- **Content**: SBA weightings, exam formats, term structures
- **Impact**: Cannot explain CAPS assessment differences

#### C. Provincial Variations
- **File**: `caps/requirements/provincial_differences.json`
- **Content**: How CAPS implementation varies by province
- **Impact**: Cannot provide location-specific advice

### ❌ IEB-Specific Content Needed:

#### A. Advanced Programme Details
- **File**: `ieb/requirements/advanced_programme.json`
- **Content**: AP Math, AP English, additional subjects
- **Impact**: Cannot advise on IEB's unique advantages

#### B. Continuous Assessment
- **File**: `ieb/requirements/assessment_structure.json`
- **Content**: 60% continuous vs 75% exam weighting
- **Impact**: Cannot explain IEB assessment advantages

#### C. School Variations
- **File**: `ieb/requirements/school_flexibility.json`
- **Content**: How IEB schools can customize curriculum
- **Impact**: Cannot advise on school-specific options

---

## 5. Current System Workarounds

### 🔧 How The System Currently Handles Missing Content:

#### A. Fallback to General NSC Content
```javascript
// When CAPS/IEB specific content missing, uses NSC framework
const curriculumType = curriculum || 'caps';
// Falls back to general NSC guidance
```

#### B. Hardcoded Curriculum Differences
```javascript
// Curriculum gates contain hardcoded CAPS vs IEB rules
chunk_text: `**GATE: IEB vs CAPS confusion**
**Equivalence**: Both IEB and CAPS lead to the same NSC certificate
**Key Differences**:
- CAPS: 7 subjects, 75% exam-based
- IEB: 7-9 subjects, 60% continuous assessment`
```

#### C. Query-Based Detection
```javascript
// System detects curriculum from user queries
const hasIEBMention = query.toLowerCase().includes('ieb');
const hasCAPSMention = query.toLowerCase().includes('caps');
```

---

## 6. Impact Assessment

### 🎯 What Works Despite Missing Content:

#### A. Basic Curriculum Differentiation
- ✅ System recognizes CAPS vs IEB selection
- ✅ Subject filtering works for both curricula
- ✅ APS calculations identical for both
- ✅ University admission guidance accurate

#### B. Critical Decision Points
- ✅ Subject switching deadlines (from curriculum gates)
- ✅ Math Lit vs Math implications
- ✅ Medicine subject requirements
- ✅ Engineering prerequisites

### ⚠️ What's Limited Without Specific Content:

#### A. Detailed Curriculum Advice
- ❌ Cannot explain CAPS SBA vs IEB continuous assessment
- ❌ Cannot advise on IEB Advanced Programme benefits
- ❌ Cannot provide provincial CAPS variations
- ❌ Cannot explain school-specific IEB flexibility

#### B. Assessment Strategy Guidance
- ❌ Cannot provide curriculum-specific study strategies
- ❌ Cannot explain different exam formats
- ❌ Cannot advise on optimal subject combinations per curriculum

---

## 7. Recommendations

### 🚀 Priority 1: Fill Critical Content Gaps

#### A. Create CAPS Requirements Package
```
caps/requirements/
├── subject_requirements.json
├── assessment_structure.json
├── provincial_variations.json
└── grade_progression.json
```

#### B. Create IEB Requirements Package
```
ieb/requirements/
├── advanced_programme.json
├── assessment_structure.json
├── school_flexibility.json
└── subject_combinations.json
```

### 🚀 Priority 2: Enhance RAG Integration

#### A. Curriculum-Specific RAG Queries
- Add CAPS/IEB specific document matching
- Create curriculum-aware response templates
- Implement curriculum context in embeddings

#### B. Dynamic Content Loading
- Load curriculum-specific content based on user selection
- Provide curriculum-comparative analysis
- Generate curriculum-specific action plans

### 🚀 Priority 3: Quality Assurance

#### A. Content Verification
- Verify all curriculum information with DBE/IEB sources
- Implement automated link checking
- Add content freshness monitoring

#### B. User Testing
- Test curriculum differentiation with real students
- Validate curriculum-specific advice accuracy
- Gather feedback on curriculum guidance quality

---

## 8. Technical Implementation Status

### ✅ Infrastructure Ready:
- Curriculum profile data structure exists
- Frontend curriculum selection functional
- API curriculum parameter processing works
- Subject filtering logic implemented

### ⚠️ Content Layer Missing:
- No structured CAPS curriculum data
- No structured IEB curriculum data
- Limited curriculum-specific RAG responses
- No curriculum comparison tools

### 🎯 Integration Points:
- Assessment form captures curriculum type
- RAG API processes curriculum context
- Subject filtering uses curriculum profile
- Results page maintains curriculum context

---

## Conclusion

**The system architecture for CAPS/IEB differentiation is solid, but the content layer is critically incomplete.** 

While students can select their curriculum type and the system processes this information correctly, we cannot provide curriculum-specific guidance due to empty CAPS and IEB knowledge base directories.

**Immediate Action Required**: Populate the CAPS and IEB requirements directories with structured curriculum data to unlock the full potential of the curriculum differentiation system.

**Current Workaround**: The system falls back to general NSC guidance and hardcoded curriculum differences from the curriculum gates, which provides basic functionality but lacks depth and specificity.

---

*This report identifies critical gaps that need immediate attention to provide comprehensive curriculum-specific career guidance.*