# COMPREHENSIVE AUDIT & CORRECTION PLAN
## Integrated Knowledge Base + Assessment Flow Fix

### EXECUTIVE SUMMARY

Your cofounder is absolutely right - we need to fix BOTH the knowledge base AND assessment flow simultaneously. The current "bandaid" approach won't solve the fundamental "garbage in → garbage out" problem. This plan addresses both root causes with a realistic 12-day timeline.

## CRITICAL ISSUES CONFIRMED

### 1. Assessment Flow - PARTIALLY FIXED BUT INCOMPLETE
✅ **Fixed**: DeepDiveQuestions now uses `curriculumProfile.currentSubjects`  
✅ **Fixed**: AssessmentForm passes `curriculumProfile` prop  
❌ **Still Broken**: No IEB curriculum support  
❌ **Still Broken**: CurriculumProfile only has CAPS subjects  
❌ **Still Broken**: Subject mismatch between Step 1 (currentSubjects) and Step 2 (enjoyedSubjects)

### 2. Knowledge Base - ZERO IEB SUPPORT
❌ **Critical Gap**: No `/ieb/` directory exists  
❌ **Critical Gap**: No IEB-specific university requirements  
❌ **Critical Gap**: No curriculum-aware career pathways  
❌ **Critical Gap**: Generic responses for 20% of market (IEB students)

## INTEGRATED 12-DAY CORRECTION PLAN

### PHASE 1: EMERGENCY AUDIT (Days 1-2) - START TODAY

#### Day 1: Complete Assessment Flow Audit
```powershell
# 1.1 Test current subject flow
# Student selects "Mathematical Literacy" in CurriculumProfile (Step 1)
# Student selects "Mathematics" in SubjectSelection (Step 2) 
# DeepDiveQuestions asks for "Mathematical Literacy" marks (Step 5)
# Result: Still potential mismatch between Steps 1 & 2

# 1.2 Inventory knowledge base structure
Get-ChildItem thandi_knowledge_base -Recurse -Filter "*.md" | 
    Group-Object Directory | 
    Select-Object Name, Count
```

**Expected Findings:**
- Assessment flow: 70% fixed, 30% still broken (IEB support missing)
- Knowledge base: 0% IEB support, flat structure, no curriculum differentiation

#### Day 2: Create Priority Matrix
| Issue | Impact | Effort | Priority | Timeline |
|-------|--------|--------|----------|----------|
| IEB Assessment Support | CRITICAL | 2 days | P0 | Days 3-4 |
| IEB Knowledge Base | CRITICAL | 5 days | P0 | Days 5-9 |
| Subject Flow Alignment | HIGH | 1 day | P1 | Day 10 |
| Knowledge Restructure | HIGH | 2 days | P1 | Days 11-12 |

### PHASE 2: FIX ASSESSMENT FLOW COMPLETELY (Days 3-4)

#### Day 3: Add Full IEB Support

**3.1 Create IEB Subject Lists**
```javascript
// lib/curriculum/ieb-subjects.js
export const IEB_SUBJECTS = [
  { name: 'Mathematics', warning: null, emoji: '🔢' },
  { name: 'Advanced Programme Mathematics', warning: 'IEB-specific advanced option', emoji: '🔢' },
  { name: 'Mathematical Literacy', warning: '⚠️ Limits engineering, medicine, science', emoji: '📊' },
  { name: 'Physical Sciences', warning: null, emoji: '⚗️' },
  { name: 'Life Sciences', warning: null, emoji: '🧬' },
  { name: 'Accounting', warning: null, emoji: '💰' },
  { name: 'Business Studies', warning: null, emoji: '💼' },
  { name: 'Economics', warning: null, emoji: '📈' },
  { name: 'Geography', warning: null, emoji: '🌍' },
  { name: 'History', warning: null, emoji: '📜' },
  { name: 'English Home Language', warning: null, emoji: '📚' },
  { name: 'Afrikaans Home Language', warning: null, emoji: '🗣️' },
  { name: 'French', warning: 'IEB schools often offer', emoji: '🇫🇷' },
  { name: 'German', warning: 'IEB schools often offer', emoji: '🇩🇪' },
  { name: 'Design', warning: 'IEB-specific creative subject', emoji: '🎨' },
  { name: 'Dramatic Arts', warning: null, emoji: '🎭' },
  { name: 'Music', warning: null, emoji: '🎵' },
  { name: 'Information Technology', warning: null, emoji: '💻' },
  { name: 'Computer Applications Technology', warning: null, emoji: '🖥️' },
  { name: 'Life Orientation', warning: null, emoji: '🏃' }
];
```

**3.2 Update CurriculumProfile.jsx**
```javascript
// Use curriculum-specific subjects
import { CAPS_SUBJECTS } from '../../../lib/curriculum/caps-subjects.js';
import { IEB_SUBJECTS } from '../../../lib/curriculum/ieb-subjects.js';

const subjectList = framework === 'IEB' ? IEB_SUBJECTS : CAPS_SUBJECTS;
```

#### Day 4: Fix Subject Flow Alignment

**4.1 Align Step 1 (Current) with Step 2 (Enjoyed)**
```javascript
// SubjectSelection.jsx - Filter by curriculum profile
export default function SubjectSelection({ selected, onChange, curriculumProfile }) {
  // Only show subjects student is actually taking
  const availableSubjects = SUBJECTS.filter(subject => 
    curriculumProfile?.currentSubjects?.includes(subject.name)
  );
}
```

**4.2 Update AssessmentForm.jsx**
```javascript
// Pass curriculumProfile to SubjectSelection
<SubjectSelection
  selected={formData.enjoyedSubjects}
  onChange={(enjoyedSubjects) => updateFormData('enjoyedSubjects', enjoyedSubjects)}
  curriculumProfile={formData.curriculumProfile}  // ADD THIS
/>
```

### PHASE 3: RESEARCH & BUILD IEB KNOWLEDGE BASE (Days 5-9)

#### Day 5: Intensive IEB Research

**5.1 IEB School Research (4 hours)**
- St John's College (Johannesburg)
- Redhill School (Johannesburg) 
- Crawford College (multiple campuses)
- Kingswood College (Grahamstown)
- St Andrew's College (Grahamstown)

**Research Focus:**
- IEB subject offerings vs CAPS
- University admission differences
- APS calculation variations
- Career pathway implications

**5.2 University IEB Requirements (4 hours)**
- Contact Wits, UCT, Stellenbosch admissions
- Get IEB-specific APS requirements
- Document Advanced Programme Mathematics acceptance
- Verify IEB vs CAPS equivalencies

**Output:** `research/ieb-comprehensive-findings.md`

#### Days 6-8: Write IEB Knowledge Files (3 days intensive)

**6.1 Create IEB Directory Structure**
```powershell
# Create curriculum-aware structure
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb"
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/subjects"
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/universities"
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/careers"
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/pathways"
```

**6.2 Write 15 IEB-Specific Files (5 files per day)**

**Day 6 Files:**
1. `ieb/subjects/advanced-programme-mathematics.md`
2. `ieb/subjects/ieb-vs-caps-mathematics.md`
3. `ieb/universities/wits-ieb-requirements.md`
4. `ieb/universities/uct-ieb-requirements.md`
5. `ieb/careers/engineering-ieb-pathway.md`

**Day 7 Files:**
6. `ieb/careers/medicine-ieb-pathway.md`
7. `ieb/careers/commerce-ieb-pathway.md`
8. `ieb/universities/stellenbosch-ieb-requirements.md`
9. `ieb/universities/up-ieb-requirements.md`
10. `ieb/pathways/science-careers-ieb.md`

**Day 8 Files:**
11. `ieb/pathways/commerce-careers-ieb.md`
12. `ieb/pathways/humanities-careers-ieb.md`
13. `ieb/subjects/ieb-language-options.md`
14. `ieb/subjects/ieb-creative-subjects.md`
15. `ieb/universities/private-universities-ieb.md`

**File Format (300-500 chars each):**
```markdown
---
curriculum: ieb
category: university-requirements
institution: wits
grade: 12
last_updated: 2024-12-15
---

# Wits University IEB Requirements

IEB students need APS 36 for Engineering (vs CAPS APS 35).
Advanced Programme Mathematics accepted as equivalent to CAPS Mathematics + Additional Mathematics.
IEB English Home Language meets language requirement.
No conversion needed - IEB marks used directly.
Application deadline: 30 September (same as CAPS).
```

#### Day 9: Restructure CAPS Knowledge

**9.1 Split Large Files into Focused Chunks**
```powershell
# BEFORE: Large generic files
# pharmacist_content.md (3000 chars)

# AFTER: Focused curriculum-aware chunks
# caps/careers/pharmacist/01-overview.md (150 chars)
# caps/careers/pharmacist/02-caps-requirements.md (120 chars)
# caps/careers/pharmacist/03-universities.md (100 chars)
# caps/careers/pharmacist/04-aps-scores.md (80 chars)
```

### PHASE 4: REGENERATE & VALIDATE (Days 10-12)

#### Day 10: Generate Curriculum-Aware Embeddings

**10.1 Clear Old Embeddings**
```sql
TRUNCATE knowledge_chunks;
```

**10.2 Run Enhanced Generation**
```javascript
// scripts/generate-curriculum-embeddings.js
// Include curriculum metadata in embeddings
const chunkWithMetadata = {
  content: chunk,
  metadata: {
    curriculum: 'IEB', // or 'CAPS'
    category: 'university-requirements',
    grade: 12,
    source_file: filename
  }
};
```

**Target:** 400-600 embeddings (vs current ~87)

#### Day 11: Test Curriculum Differentiation

**11.1 Test CAPS Student Query**
```javascript
const capsTest = {
  query: "APS for pharmacy at UJ with Mathematics 70%",
  curriculum: "CAPS",
  expected: "CAPS APS 35 required. Mathematics 70% meets requirement."
};
```

**11.2 Test IEB Student Query**
```javascript
const iebTest = {
  query: "Engineering at Wits with AP Mathematics",
  curriculum: "IEB", 
  expected: "IEB APS 36 required. AP Mathematics accepted as equivalent."
};
```

#### Day 12: Final Integration & Validation

**12.1 End-to-End Testing**
- CAPS student: Select Math Lit → Get appropriate career guidance
- IEB student: Select AP Math → Get engineering pathways
- Verify no subject mismatches in assessment flow

**12.2 Performance Validation**
- Response accuracy: Target 85%+ (vs current 50%)
- Curriculum differentiation: Target 100% (vs current 0%)
- Response length: Target 300-500 chars (vs current 1735)

## SUCCESS METRICS (Measurable)

### Before Fix:
❌ CAPS query accuracy: 50%  
❌ IEB query accuracy: 0% (no content)  
❌ Subject flow alignment: 70% (partial fix)  
❌ Curriculum differentiation: 0%  
❌ Knowledge base coverage: CAPS only  

### After Fix:
✅ CAPS query accuracy: 85%+  
✅ IEB query accuracy: 85%+  
✅ Subject flow alignment: 100%  
✅ Curriculum differentiation: 100%  
✅ Knowledge base coverage: CAPS + IEB  

## REALISTIC RESOURCE REQUIREMENTS

### Time Investment
| Phase | Duration | Daily Hours | Total Hours |
|-------|----------|-------------|-------------|
| Audit | 2 days | 4 hrs/day | 8 hours |
| Assessment Fix | 2 days | 6 hrs/day | 12 hours |
| IEB Research | 1 day | 8 hrs/day | 8 hours |
| IEB Content | 3 days | 8 hrs/day | 24 hours |
| CAPS Restructure | 1 day | 6 hrs/day | 6 hours |
| Embeddings | 1 day | 4 hrs/day | 4 hours |
| Testing | 2 days | 4 hrs/day | 8 hours |
| **TOTAL** | **12 days** | **6.7 hrs/day avg** | **70 hours** |

### Launch Timeline
- **Start Date:** December 16, 2024
- **Target Launch:** January 2, 2025 (realistic with holidays)
- **Buffer:** 3 days for unexpected issues

## IMMEDIATE NEXT STEPS - START TODAY

### Today (4 hours):
1. **Assessment Flow Audit** (1 hour)
   - Test current subject mismatch scenarios
   - Document remaining gaps

2. **Knowledge Base Inventory** (1 hour)
   - Count existing files by category
   - Identify IEB content gaps

3. **IEB Research Planning** (2 hours)
   - List 5 IEB schools to contact
   - Prepare university research questions
   - Create content creation schedule

### Tomorrow (6 hours):
1. **Complete Assessment Flow Fix** (4 hours)
   - Add IEB subject support
   - Fix subject flow alignment
   - Test end-to-end

2. **Begin IEB Research** (2 hours)
   - Contact first 2 IEB schools
   - Start university requirements research

## RISK MITIGATION

### Technical Risks
- **IEB Research Access**: Backup online resources if schools unresponsive
- **Embedding Generation**: Monitor for performance issues with larger dataset
- **Assessment Flow**: Thorough testing to prevent new bugs

### Quality Risks  
- **Content Accuracy**: Multiple source verification for IEB requirements
- **Curriculum Differentiation**: Clear metadata tagging and testing
- **User Experience**: Maintain simple interface while adding complexity

## CONCLUSION

This integrated plan addresses both root causes identified by your cofounder:
1. **Assessment Flow**: Complete IEB support + subject alignment
2. **Knowledge Base**: Full curriculum differentiation + proper structure

The 12-day timeline is realistic and accounts for the intensive research required for quality IEB content. This foundation will transform the system from generic responses to truly personalized, curriculum-aware career guidance.

**Ready to execute Phase 1 audit today?**