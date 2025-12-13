# Assessment Flow & Information Analysis

**Date:** December 13, 2025  
**Focus:** Grade-specific flow and anti-hallucination measures  
**Status:** Comprehensive analysis of current system  

---

## 🎯 **CURRENT ASSESSMENT FLOW ANALYSIS**

### **Grade-Specific Flow Structure**

#### **1. Grade Selection & Routing**
```javascript
// Current flow logic in AssessmentForm.jsx
const handleCoreQuestionsComplete = () => {
  if (grade === 10) {
    // Grade 10: Show preliminary report with opt-in
    setShowPreliminaryReport(true);
  } else {
    // Grade 11-12: Go straight to deep dive (no preliminary report)
    setShowDeepDive(true);
  }
};
```

**✅ WORKING CORRECTLY:**
- Grade 10 gets preliminary report + optional deep dive
- Grade 11-12 skip preliminary, go straight to comprehensive assessment
- Clear differentiation in user experience

#### **2. Information Collection Per Grade**

**Grade 10 Flow:**
1. Basic assessment (subjects, interests, constraints)
2. Preliminary report with mock careers
3. Optional deep dive for comprehensive analysis

**Grade 11-12 Flow:**
1. Basic assessment (subjects, interests, constraints)
2. Mandatory deep dive with marks and support system
3. Grade-specific timeline messaging (now fixed with emergency calendar)

---

## 🔍 **INFORMATION ACCURACY & ANTI-HALLUCINATION ANALYSIS**

### **Current Data Collection Structure**

#### **1. Assessment Form Data Structure**
```javascript
const [formData, setFormData] = useState({
  enjoyedSubjects: [],        // ✅ Clear: subjects student ENJOYS
  interests: [],              // ✅ Clear: student interests
  constraints: {
    time: '',                 // ✅ Time constraints
    money: '',                // ✅ Financial constraints  
    location: '',             // ✅ Location preferences
    familyBackground: ''      // ✅ First-generation status
  },
  openQuestions: {
    motivation: '',           // ✅ Student motivation
    concerns: '',             // ✅ Student concerns
    careerInterests: ''       // ✅ Explicit career interests
  },
  grade: null,                // ✅ Grade level
  assessmentDepth: 'quick',   // ✅ Assessment type
  curriculumProfile: {
    framework: 'CAPS',        // ✅ SA curriculum
    currentSubjects: []       // ✅ Current subjects
  }
});
```

#### **2. Deep Dive Data Collection**
```javascript
const deepDiveData = {
  subjectMarks: [            // ✅ Specific marks per subject
    { subject: 'Mathematics', exactMark: 65 }
  ],
  marksUnknown: false,       // ✅ Clear flag for unknown marks
  supportSystem: [],         // ✅ Available support
  strugglingSubjects: [],    // ✅ Subjects needing help
  assessmentDepth: 'comprehensive'
};
```

---

## 🚨 **IDENTIFIED ISSUES & HALLUCINATION RISKS**

### **1. Query Generation Issues**

#### **Problem: Hardcoded Grade 12 Logic (PARTIALLY FIXED)**
```javascript
// STILL PROBLEMATIC in AssessmentForm.jsx line 245-247:
if (formData.grade === 12) {
  query += `I need: 1) What marks I need in my FINAL EXAMS (writing in ~1 month)...`;
}
```
**Issue:** Still contains hardcoded "writing in ~1 month" despite emergency calendar fix
**Risk:** Incorrect timeline information in query context

#### **Problem: Inconsistent Data Emphasis**
```javascript
// Good: Career interests are emphasized
if (formData.openQuestions?.careerInterests) {
  query += `\n\nIMPORTANT: Student explicitly stated career interest: "${formData.openQuestions.careerInterests}". `;
}

// Missing: Subject marks are not emphasized enough
query += ` My current marks: `;
formData.subjectMarks.forEach(({subject, exactMark}) => {
  query += `${subject}: ${exactMark}%, `;
});
```
**Issue:** Marks are mentioned but not emphasized as critical for career matching
**Risk:** AI may not prioritize actual academic performance

### **2. RAG System Information Handling**

#### **Problem: Metadata Filtering Gaps**
```javascript
// In metadata-filter.js - good exclusion logic but potential gaps
const nonCareerSources = [
  'test_question', 'question', 'bursary', 'program', 'university',
  'admission', 'general', 'faq', 'help'
];
```
**Issue:** May not catch all non-career content
**Risk:** Bursary info or university programs presented as careers

#### **Problem: Career Validation Logic**
```javascript
// In career-matcher.js - basic validation
function isValidCareer(career) {
  const invalidTitles = [
    'question', 'bursary', 'program', 'university', 'college'
  ];
  // ... basic checks
}
```
**Issue:** Limited validation criteria
**Risk:** Invalid or misleading career suggestions

### **3. Grade-Specific Context Issues**

#### **Problem: Inconsistent Grade Handling**
```javascript
// Different grade references throughout system:
formData.grade           // Assessment form
profile.grade           // RAG system  
curriculumProfile.grade // Curriculum context
```
**Issue:** Multiple grade references may cause inconsistency
**Risk:** Grade-inappropriate advice

---

## 🛡️ **ANTI-HALLUCINATION MEASURES ANALYSIS**

### **Current Safeguards**

#### **1. CAG (Content Accuracy Guardian) Layer** ✅
```javascript
// In route.js - CAG verification
const cagResult = await cag.verify({
  draftAnswer: result.data,
  ragChunks: ragChunks,
  studentProfile: sanitisedProfile,
  query: sanitisedQuery
});
```
**Status:** Working - provides content verification

#### **2. Safety Validation** ✅
```javascript
// Multiple validation layers
const safetyValidation = safetyValidator.validateCareers(finalCareers, {
  profile: profile,
  source: 'enhanced_rag_matching'
});
```
**Status:** Working - validates career suggestions

#### **3. Verification Footer** ✅
```javascript
text += `\n⚠️ **Verify before you decide:**\n`;
text += `1. Speak with your school counselor\n`;
text += `2. Call the institution directly\n`;
text += `3. Check official websites\n\n`;
text += `*Thandi's data may be outdated. Always confirm with real people.*`;
```
**Status:** Working - warns users to verify information

### **Missing Safeguards**

#### **1. Grade-Specific Validation** ❌
- No validation that career suggestions are appropriate for student's grade level
- No check that timeline advice matches academic calendar

#### **2. Mark-Based Reality Checks** ❌
- No validation that suggested careers align with student's actual marks
- No warning when marks are too low for suggested careers

#### **3. Subject-Career Alignment Validation** ❌
- Limited validation that suggested careers match enjoyed subjects
- No check for subject prerequisites

---

## 🎯 **RECOMMENDATIONS FOR IMPROVEMENT**

### **1. Fix Remaining Timeline Issues**

#### **Update Query Generation**
```javascript
// REPLACE hardcoded timeline logic with dynamic calendar
if (formData.grade === 12) {
  // Use academicContext.timelineMessage instead of hardcoded text
  const academicContext = getAcademicContext(currentDate, formData.grade);
  
  if (academicContext.isPostFinals) {
    query += `I need: 1) University application guidance for 2026, 2) NSFAS funding options, 3) Results-based planning, 4) Gap year alternatives if needed.`;
  } else if (academicContext.isFinalsActive) {
    query += `I need: 1) Focus on remaining exams, 2) Stress management, 3) Post-exam planning.`;
  } else {
    query += `I need: 1) What marks I need in upcoming finals, 2) Bursaries with approaching deadlines, 3) Application preparation.`;
  }
}
```

### **2. Enhance Information Emphasis**

#### **Prioritize Critical Data**
```javascript
// EMPHASIZE marks and grade context
let query = `I am a Grade ${formData.grade} student in South Africa. `;
query += academicContext.timelineMessage + ' ';

// CRITICAL: Emphasize actual marks
if (formData.subjectMarks && formData.subjectMarks.length > 0) {
  query += `\n\nCRITICAL - MY ACTUAL MARKS: `;
  formData.subjectMarks.forEach(({subject, exactMark}) => {
    query += `${subject}: ${exactMark}%, `;
  });
  query += `\nIMPORTANT: Only suggest careers where my marks meet the requirements. If my marks are too low, explain what I need to improve and provide realistic alternatives.`;
}
```

### **3. Add Grade-Specific Validation**

#### **Career Appropriateness Check**
```javascript
function validateCareerForGrade(career, grade, marks) {
  // Check if career is appropriate for grade level
  if (grade === 10 && career.requiresSpecialization) {
    return { valid: false, reason: 'Too specialized for Grade 10' };
  }
  
  // Check if marks meet requirements
  if (marks && career.minimumMarks) {
    const mathMark = marks.find(m => m.subject === 'Mathematics')?.exactMark;
    if (career.requiresMath && mathMark < career.minimumMarks.mathematics) {
      return { 
        valid: false, 
        reason: `Mathematics mark (${mathMark}%) below requirement (${career.minimumMarks.mathematics}%)` 
      };
    }
  }
  
  return { valid: true };
}
```

### **4. Improve Subject-Career Alignment**

#### **Enhanced Subject Matching**
```javascript
function validateSubjectAlignment(career, enjoyedSubjects, marks) {
  const alignment = {
    score: 0,
    warnings: [],
    recommendations: []
  };
  
  // Check if enjoyed subjects align with career requirements
  if (career.requiredSubjects) {
    const missingSubjects = career.requiredSubjects.filter(
      req => !enjoyedSubjects.includes(req)
    );
    
    if (missingSubjects.length > 0) {
      alignment.warnings.push(
        `This career requires ${missingSubjects.join(', ')} which you haven't selected as enjoyed subjects`
      );
    }
  }
  
  return alignment;
}
```

---

## 🎯 **PRIORITY ACTIONS**

### **Immediate (This Week)**
1. **Fix remaining hardcoded timeline logic** in AssessmentForm.jsx
2. **Enhance mark emphasis** in query generation
3. **Add grade-specific validation** to career suggestions

### **Short-term (Next 2 weeks)**
4. **Implement subject-career alignment validation**
5. **Add mark-based reality checks**
6. **Enhance metadata filtering** for better career identification

### **Long-term (Next month)**
7. **Build comprehensive validation pipeline**
8. **Add automated testing** for grade-specific flows
9. **Implement user feedback loop** for accuracy improvement

---

## 📊 **SUCCESS METRICS**

### **Accuracy Metrics**
- **Timeline Accuracy:** 100% correct academic phase messaging
- **Career Relevance:** >90% of suggestions align with student's marks and subjects
- **Grade Appropriateness:** 100% of suggestions appropriate for student's grade level

### **Anti-Hallucination Metrics**
- **False Career Rate:** <5% of suggestions are non-careers (bursaries, programs, etc.)
- **Unrealistic Suggestions:** <10% of careers require marks significantly above student's current performance
- **Subject Misalignment:** <15% of careers don't align with enjoyed subjects

---

**The system has strong foundations but needs targeted improvements in grade-specific validation and information emphasis to prevent hallucinations and ensure accurate, relevant career guidance.**