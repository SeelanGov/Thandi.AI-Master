# UX Flow Bias Correction Design

## Architecture Overview

This design addresses the critical UX issues by implementing proactive bias detection and correction in the user flow, ensuring complete subject access for IEB students, and providing grade-appropriate assessment questions.

## System Architecture

```
User Assessment Flow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Grade Select  │ -> │  Subject Select  │ -> │  Deep Dive Q's  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                         │
                              v                         v
                    ┌──────────────────┐    ┌─────────────────┐
                    │ Complete IEB     │    │ Grade-Specific  │
                    │ Subject List     │    │ Questions       │
                    │ (24 subjects)    │    │ (Current/Final) │
                    └──────────────────┘    └─────────────────┘
                                                      │
                                                      v
                                            ┌─────────────────┐
                                            │   RAG Query     │
                                            │   Generation    │
                                            └─────────────────┘
                                                      │
                                                      v
                                            ┌─────────────────┐
                                            │ Career Matching │
                                            │ & Generation    │
                                            └─────────────────┘
                                                      │
                                                      v
                                            ┌─────────────────┐
                                            │ BIAS DETECTION  │ <- NEW INTEGRATION POINT
                                            │ & CORRECTION    │
                                            └─────────────────┘
                                                      │
                                                      v
                                            ┌─────────────────┐
                                            │ Filtered Results│
                                            │ (Bias-Free)     │
                                            └─────────────────┘
                                                      │
                                                      v
                                            ┌─────────────────┐
                                            │ Results Display │
                                            │ + Chat Context  │
                                            └─────────────────┘
```

## Component Design

### 1. Enhanced Subject Selection Fix

**File**: `app/assessment/components/EnhancedSubjectSelection.jsx`

**Current Issue**: 
```javascript
const availableSubjects = curriculumProfile?.currentSubjects?.length > 0 
  ? SUBJECTS.filter(subject => 
      curriculumProfile.currentSubjects.some(currentSubj => 
        currentSubj.toLowerCase().includes(subject.name.toLowerCase()) ||
        subject.name.toLowerCase().includes(currentSubj.toLowerCase())
      )
    )
  : SUBJECTS;
```

**Problem**: This filtering logic is too restrictive for IEB students, causing subjects to be hidden.

**Solution**:
```javascript
const availableSubjects = useMemo(() => {
  // For IEB students, show all IEB subjects regardless of curriculumProfile filtering
  if (curriculumProfile?.framework === 'IEB') {
    return IEB_SUBJECTS; // Import from lib/curriculum/ieb-subjects.js
  }
  
  // For CAPS students, use existing filtering logic
  return curriculumProfile?.currentSubjects?.length > 0 
    ? SUBJECTS.filter(subject => 
        curriculumProfile.currentSubjects.some(currentSubj => 
          currentSubj.toLowerCase().includes(subject.name.toLowerCase()) ||
          subject.name.toLowerCase().includes(currentSubj.toLowerCase())
        )
      )
    : SUBJECTS;
}, [curriculumProfile]);
```

### 2. Grade-Specific Deep Dive Questions

**File**: `app/assessment/components/DeepDiveQuestions.jsx`

**Current Issue**: All grades see "final marks" questions which confuses Grade 10-11 students.

**Solution**: Implement grade-specific question rendering:

```javascript
const getMarksQuestionText = (grade) => {
  switch(grade) {
    case 10:
      return {
        title: "Your Current Academic Performance 📊",
        description: "Tell us about your current marks to help us understand your academic strengths",
        markLabel: "Current Mark",
        placeholder: "e.g., 75% (your latest test/exam mark)"
      };
    case 11:
      return {
        title: "Your Current Academic Performance 📊", 
        description: "Share your current marks - we'll help you plan for Grade 12 and beyond",
        markLabel: "Current Mark",
        placeholder: "e.g., 80% (your latest test/exam mark)"
      };
    case 12:
      return {
        title: "Your Final Academic Results 🎓",
        description: "Share your final/trial exam marks for accurate university application guidance",
        markLabel: "Final Mark",
        placeholder: "e.g., 85% (final exam or trial exam mark)"
      };
    default:
      return {
        title: "Your Academic Performance 📊",
        description: "Tell us about your current academic performance",
        markLabel: "Current Mark", 
        placeholder: "e.g., 75%"
      };
  }
};
```

### 3. Proactive Bias Detection Integration

**File**: `app/api/rag/query/route.js`

**Current Flow**:
```
RAG Generation -> LLM Enhancement -> CAG Verification -> Results Display
```

**New Flow**:
```
RAG Generation -> LLM Enhancement -> CAG Verification -> BIAS DETECTION & CORRECTION -> Results Display
```

**Implementation**:

```javascript
// Add after CAG verification, before final response
import { BiasDetector } from '@/lib/rag/bias-detector.js';

// Initialize bias detector
const biasDetector = new BiasDetector({
  teachingBiasThreshold: 0.6,
  enableLogging: true,
  enablePatternTracking: true
});

// After CAG verification
const cagResult = await cag.verify({...});

// NEW: Bias detection and correction
console.log('[BIAS] Starting proactive bias detection...');
const biasStartTime = Date.now();

// Extract careers from CAG result for bias analysis
const careers = extractCareersFromResponse(cagResult.finalAnswer);
const studentProfile = {
  grade: sanitisedProfile.grade,
  subjects: sanitisedProfile.subjects || [],
  // Add other relevant profile data
};

// Detect bias patterns
const biasAnalysis = biasDetector.performComprehensiveBiasAnalysis(careers, studentProfile);

let finalAnswer = cagResult.finalAnswer;
let biasCorrections = [];

// Apply corrections if significant bias detected
if (biasAnalysis.riskLevel === 'high' || biasAnalysis.riskLevel === 'critical') {
  console.log(`[BIAS] ${biasAnalysis.riskLevel.toUpperCase()} bias detected, applying corrections...`);
  
  // Apply specific corrections based on detected patterns
  const correctedResult = await applyBiasCorrections(
    cagResult.finalAnswer, 
    biasAnalysis, 
    studentProfile,
    provider
  );
  
  if (correctedResult.success) {
    finalAnswer = correctedResult.correctedAnswer;
    biasCorrections = correctedResult.corrections;
    console.log(`[BIAS] Applied ${biasCorrections.length} corrections`);
  }
}

const biasProcessingTime = Date.now() - biasStartTime;
console.log(`[BIAS] Bias detection complete: ${biasAnalysis.riskLevel} risk (${biasProcessingTime}ms)`);
```

### 4. Bias Correction Logic

**New File**: `lib/rag/bias-corrector.js`

```javascript
export class BiasCorrector {
  constructor(llmProvider) {
    this.llmProvider = llmProvider;
  }

  async applyCorrections(originalAnswer, biasAnalysis, studentProfile) {
    const corrections = [];
    let correctedAnswer = originalAnswer;

    // Apply STEM teaching bias correction
    if (this.hasSTEMTeachingBias(biasAnalysis)) {
      const correction = await this.correctSTEMTeachingBias(
        correctedAnswer, 
        studentProfile
      );
      if (correction.success) {
        correctedAnswer = correction.answer;
        corrections.push({
          type: 'stem_teaching_bias',
          action: 'Limited teaching careers to 1 in top 3, boosted STEM careers',
          confidence: correction.confidence
        });
      }
    }

    // Apply category dominance correction
    if (this.hasCategoryDominance(biasAnalysis)) {
      const correction = await this.correctCategoryDominance(
        correctedAnswer,
        biasAnalysis.crossCategoryAnalysis
      );
      if (correction.success) {
        correctedAnswer = correction.answer;
        corrections.push({
          type: 'category_dominance',
          action: 'Diversified career categories',
          confidence: correction.confidence
        });
      }
    }

    return {
      success: corrections.length > 0,
      correctedAnswer,
      corrections,
      originalBiasLevel: biasAnalysis.riskLevel,
      correctedBiasLevel: await this.assessCorrectedBias(correctedAnswer, studentProfile)
    };
  }

  async correctSTEMTeachingBias(answer, profile) {
    const prompt = `You are a career counselor reviewing recommendations for a STEM student. The current recommendations show teaching bias (too many teaching careers).

STUDENT PROFILE:
- Grade: ${profile.grade}
- STEM Subjects: ${profile.subjects.filter(s => this.isSTEMSubject(s)).join(', ')}

CURRENT RECOMMENDATIONS:
${answer}

CORRECTION NEEDED:
1. Limit teaching careers to maximum 1 in the top 3 recommendations
2. Boost STEM careers (engineering, technology, research, data science, etc.)
3. Maintain the same helpful tone and structure
4. Keep the verification warning at the end

Return the corrected recommendations:`;

    const result = await this.llmProvider.generateText(prompt, {
      maxTokens: 2000,
      temperature: 0.3
    });

    return {
      success: result.success,
      answer: result.data,
      confidence: result.success ? 0.8 : 0
    };
  }

  // Additional correction methods...
}
```

### 5. Results Display Enhancement

**File**: `app/results/page.js` (or wherever results are displayed)

Add subtle transparency messaging:

```javascript
// If bias corrections were applied, show a brief note
{biasCorrections && biasCorrections.length > 0 && (
  <div className="bias-transparency-note">
    <div className="note-content">
      <span className="note-icon">✨</span>
      <span className="note-text">
        Results optimized for diversity and relevance to your profile
      </span>
    </div>
  </div>
)}
```

### 6. Chat Context Enhancement

**File**: Chat component (wherever chat is implemented)

Ensure chat maintains context from bias-corrected results:

```javascript
const chatContext = {
  originalAssessment: assessmentData,
  initialResults: resultsData,
  biasCorrections: resultsData.biasCorrections || [],
  correctionReason: resultsData.biasAnalysis?.riskLevel || 'none'
};

// Include in chat prompt
const chatPrompt = `You are Thandi, continuing a conversation about career recommendations.

CONTEXT:
- Student completed assessment and received initial recommendations
- ${biasCorrections.length > 0 ? `Bias corrections were applied: ${biasCorrections.map(c => c.type).join(', ')}` : 'No bias corrections needed'}
- User is now asking follow-up questions

IMPORTANT: Build upon the initial recommendations rather than contradicting them. If suggesting new careers, explain them as additional options or refinements.

USER QUESTION: ${userMessage}`;
```

## Data Flow

### 1. Subject Selection Data Flow

```
IEB Student -> Grade Selection -> Curriculum Profile (framework: 'IEB') 
-> Subject Selection -> Show ALL 24 IEB subjects -> User selects subjects
-> Continue to next step
```

### 2. Assessment Question Data Flow

```
User Grade -> Deep Dive Questions -> Grade-specific question text
-> Grade 10/11: "Current marks" -> Grade 12: "Final marks"
-> Collect appropriate mark data -> Continue to RAG query
```

### 3. Bias Detection Data Flow

```
RAG Query -> Career Generation -> LLM Enhancement -> CAG Verification
-> Extract careers from response -> Bias Detection Analysis
-> If bias detected: Apply corrections -> Return corrected response
-> If no bias: Return original response -> Results Display
```

## Error Handling

### 1. Bias Detection Failures
```javascript
try {
  const biasAnalysis = biasDetector.performComprehensiveBiasAnalysis(careers, studentProfile);
  // Apply corrections...
} catch (error) {
  console.error('[BIAS] Bias detection failed:', error.message);
  // Fallback to original results
  finalAnswer = cagResult.finalAnswer;
  biasCorrections = [];
}
```

### 2. Subject Selection Fallbacks
```javascript
const availableSubjects = useMemo(() => {
  try {
    if (curriculumProfile?.framework === 'IEB') {
      return IEB_SUBJECTS;
    }
    // ... existing logic
  } catch (error) {
    console.error('Subject filtering error:', error);
    // Fallback to all subjects
    return SUBJECTS;
  }
}, [curriculumProfile]);
```

### 3. Grade Question Fallbacks
```javascript
const getMarksQuestionText = (grade) => {
  try {
    // Grade-specific logic...
  } catch (error) {
    console.error('Grade question error:', error);
    return DEFAULT_QUESTION_TEXT;
  }
};
```

## Performance Considerations

### 1. Bias Detection Performance
- Target: <200ms additional processing time
- Implementation: Async bias detection with timeout
- Fallback: Original results if bias detection takes too long

### 2. Subject Filtering Performance
- Use `useMemo` for subject filtering to prevent unnecessary re-renders
- Cache IEB subject list to avoid repeated imports

### 3. Question Rendering Performance
- Memoize question text generation
- Pre-compute grade-specific content

## Testing Strategy

### 1. Unit Tests
- Test IEB subject filtering logic
- Test grade-specific question generation
- Test bias detection integration
- Test error handling scenarios

### 2. Integration Tests
- Test complete assessment flow for IEB students
- Test bias correction pipeline
- Test chat context preservation

### 3. User Testing
- Verify IEB students can see all 24 subjects
- Confirm Grade 10-11 students understand "current marks" questions
- Validate bias-free initial results for STEM students
- Test chat consistency with initial results

## Monitoring and Metrics

### 1. Bias Detection Metrics
- Bias detection rate by student profile type
- Correction application success rate
- Performance impact measurement
- User satisfaction with corrected results

### 2. Subject Selection Metrics
- IEB subject selection completion rate
- Subject diversity in selections
- Assessment completion rate by curriculum type

### 3. Question Clarity Metrics
- Grade-specific question completion rates
- User feedback on question clarity
- Assessment abandonment rates by grade

## Security Considerations

### 1. Data Privacy
- Ensure bias detection doesn't log sensitive student data
- Sanitize profile data before bias analysis
- Maintain existing POPIA compliance

### 2. System Integrity
- Validate bias correction results before applying
- Implement safeguards against over-correction
- Maintain audit trail of bias corrections applied

## Deployment Strategy

### 1. Phased Rollout
1. **Phase 1**: Deploy IEB subject fix and grade-specific questions
2. **Phase 2**: Deploy bias detection integration with monitoring
3. **Phase 3**: Deploy chat context enhancements

### 2. Feature Flags
- Enable/disable bias detection per user segment
- A/B test bias correction effectiveness
- Gradual rollout to monitor performance impact

### 3. Rollback Plan
- Quick rollback capability for bias detection
- Fallback to original results if corrections fail
- Monitoring alerts for performance degradation