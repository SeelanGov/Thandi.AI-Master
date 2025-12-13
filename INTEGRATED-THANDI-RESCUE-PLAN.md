# INTEGRATED THANDI RESCUE PLAN
## Fix BOTH Knowledge Base + Assessment Flow Simultaneously

### PHASE 1: EMERGENCY AUDIT (Days 1-2) - START TODAY

#### Day 1: Assessment Flow Data Flow Analysis

**1.1 Map Current Assessment Flow Props Passing**
```powershell
# Check how subjects flow between components
Select-String -Path "app/assessment/components/*" -Pattern "currentSubjects|enjoyedSubjects|subjects" | 
    Select-Object FileName, LineNumber, Line

# Expected: Should see props connecting CurriculumProfile → SubjectSelection → DeepDiveQuestions
# Reality: Likely hardcoded subjects in DeepDiveQuestions.jsx
```

**1.2 Inventory Current Knowledge Base Structure**
```powershell
# Count and categorize knowledge files
Get-ChildItem thandi_knowledge_base -Recurse -Filter "*.md" | 
    Group-Object Directory | 
    Select-Object Name, Count

# Expected: Should see /caps/, /ieb/, /careers/ directories
# Reality: Likely flat structure, no IEB folder
```

**1.3 Test Current Subject Mismatch Issue**
```javascript
// Test the exact problem cofounder identified
// Student selects "Mathematical Literacy" in Step 1
// But DeepDiveQuestions asks for "Mathematics" marks
// Result: Garbage in → Garbage out
```

#### Day 2: Gap Analysis and Priority Matrix

**2.1 Create Assessment Flow Gap Analysis**
| Component | Current State | Expected State | Priority | Fix Effort |
|-----------|---------------|----------------|----------|------------|
| CurriculumProfile | CAPS only | CAPS + IEB | CRITICAL | 2 days |
| SubjectSelection | Generic subjects | Curriculum-aware | HIGH | 1 day |
| DeepDiveQuestions | Hardcoded subjects | Dynamic from profile | CRITICAL | 1 day |

**2.2 Create Knowledge Base Gap Analysis**
| Category | Current Files | Quality Score | Missing Files | Priority |
|----------|---------------|---------------|---------------|----------|
| CAPS | 15 files | 6/10 | 5 files | HIGH |
| IEB | 0 files | 0/10 | 15 files | CRITICAL |
| Careers | 10 files | 5/10 | 14 files | HIGH |
| Bursaries | 3 files | 3/10 | 12 files | MEDIUM |

### PHASE 2: FIX ASSESSMENT FLOW (Days 3-4)

#### Day 3: Fix Subject Flow Connection

**3.1 Fix DeepDiveQuestions.jsx - Make Dynamic**
```javascript
// BEFORE (Hardcoded - BROKEN)
const subjects = ['Mathematics', 'Physical Science', 'Life Sciences', 'English', 'Afrikaans'];

// AFTER (Dynamic - FIXED)
export default function DeepDiveQuestions({ onComplete, grade, isLoading = false, curriculumProfile }) {
  const subjects = curriculumProfile?.currentSubjects || ['Mathematics', 'Physical Science', 'Life Sciences', 'English', 'Afrikaans'];
  // Now marks collection matches what student actually selected in Step 1
}
```

**3.2 Update AssessmentForm.jsx to Pass Props**
```javascript
// Ensure curriculumProfile flows from Step 1 → Step 5
<DeepDiveQuestions 
  onComplete={handleDeepDiveComplete}
  grade={grade}
  isLoading={isLoading}
  curriculumProfile={formData.curriculumProfile}  // ADD THIS
/>
```

#### Day 4: Add IEB Subject Options

**4.1 Create Curriculum-Aware Subject Lists**
```javascript
// Create lib/curriculum/subjects.js
export const CAPS_SUBJECTS = [
  'Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences',
  'Accounting', 'Business Studies', 'Economics', 'Geography', 'History',
  'English Home Language', 'Afrikaans Home Language', 'Life Orientation'
];

export const IEB_SUBJECTS = [
  'Mathematics', 'Advanced Programme Mathematics', 'Mathematical Literacy',
  'Physical Sciences', 'Life Sciences', 'Accounting', 'Business Studies',
  'Economics', 'Geography', 'History', 'English Home Language', 
  'Afrikaans Home Language', 'French', 'German', 'Design'
];
```

**4.2 Update CurriculumProfile.jsx for IEB Support**
```javascript
// Use curriculum-specific subject lists
const subjectList = framework === 'IEB' ? IEB_SUBJECTS : CAPS_SUBJECTS;
```

### PHASE 3: REBUILD KNOWLEDGE BASE (Days 5-9)

#### Day 5: Research IEB Curriculum (INTENSIVE)

**5.1 IEB School Website Research**
- Visit 5 IEB schools: St John's College, Redhill School, Crawford College, etc.
- Download curriculum guides and subject offerings
- Document IEB-specific requirements and differences

**5.2 University IEB Requirements Research**
- Contact Wits, UCT, Stellenbosch admissions offices
- Get IEB-specific APS calculations and requirements
- Document how IEB differs from CAPS in university admissions

**Output: research/ieb-curriculum-notes.md with comprehensive findings**

#### Days 6-8: Write IEB Knowledge Files (1 file per day minimum)

**6.1 Create Directory Structure**
```powershell
# Create IEB-specific knowledge structure
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/subjects"
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/universities" 
New-Item -ItemType Directory -Path "thandi_knowledge_base/ieb/requirements"
```

**6.2 Write Focused IEB Files (300-500 chars each)**
```markdown
---
curriculum: ieb
category: subject-requirements
grade: 12
last_updated: 2024-12-15
---

# IEB Mathematics vs CAPS Mathematics

IEB Mathematics includes Advanced Programme option not available in CAPS.
Universities accept IEB AP Mathematics as equivalent to CAPS Mathematics + Additional Mathematics.
APS calculation: IEB AP Math = 7 points (vs CAPS Math = 7 points).
Required for: Engineering, Actuarial Science, Computer Science at all SA universities.
```

#### Day 9: Restructure CAPS Knowledge for Better Chunking

**9.1 Split Large Files into Focused Chunks**
```powershell
# BEFORE: pharmacist_content.md (3000 chars - too long)
# AFTER: Split into focused chunks:
#   pharmacist/01-overview.md (150 chars)
#   pharmacist/02-requirements.md (120 chars) 
#   pharmacist/03-universities.md (100 chars)
#   pharmacist/04-aps-scores.md (80 chars)
```

### PHASE 4: REGENERATE & TEST (Days 10-11)

#### Day 10: Generate Optimized Embeddings

**10.1 Clear Old Embeddings**
```sql
-- Clear existing embeddings
TRUNCATE knowledge_chunks;
```

**10.2 Run Generation with New Structure**
```powershell
# Generate embeddings for restructured knowledge
node scripts/generate-embeddings.js > embedding-log.txt

# Verify count increased significantly
Get-Content embedding-log.txt | Select-String "Inserted chunk"
# Target: 300-500 chunks (vs previous ~87)
```

#### Day 11: Test Retrieval Quality with Measurable Metrics

**11.1 Test CAPS-Specific Query**
```powershell
# Test CAPS student query
$response = Invoke-WebRequest -Uri "https://thandiai.vercel.app/api/rag/query" `
  -Method POST `
  -Body '{"query":"APS for pharmacy at UJ for CAPS student with Mathematics 70%"}' `
  | ConvertFrom-Json

# Expected: "APS 35 required. Mathematics 70% meets requirement. Physical Sciences also required."
# NOT: "Pharmacists dispense medications and work in various settings..."
```

**11.2 Test IEB-Specific Query**
```powershell
# Test IEB student query  
$response = Invoke-WebRequest -Uri "https://thandiai.vercel.app/api/rag/query" `
  -Method POST `
  -Body '{"query":"IEB requirements for engineering at Wits with AP Mathematics"}' `
  | ConvertFrom-Json

# Expected: "IEB APS 36 required. AP Mathematics accepted as equivalent to CAPS Mathematics."
# NOT: "Standard CAPS requirements apply..."
```

### SUCCESS CRITERIA (Measurable)

#### Before Fix:
❌ CAPS query: Generic response (score 50%)
❌ IEB query: No relevant response (score 0%) 
❌ Subject mismatch: Hardcoded subjects disconnect
❌ Response length: 1735 chars (rambling)

#### After Fix:
✅ CAPS query: Specific APS + requirements (score 85%+)
✅ IEB query: IEB-specific requirements (score 85%+)
✅ Subject match: Dynamic subjects from student profile
✅ Response length: 300-500 chars (focused)

### REALISTIC TIMELINE

| Phase | Duration | Daily Effort | Risk Level |
|-------|----------|--------------|------------|
| Audit | 2 days | 4 hours/day | Low |
| Assessment Flow Fix | 2 days | 6 hours/day | Medium |
| Knowledge Base Rebuild | 5 days | 8 hours/day | High |
| Testing & Validation | 2 days | 4 hours/day | Medium |
| **TOTAL** | **11 days** | **60 hours** | **Manageable** |

**Target Launch: January 24-27** (realistic with proper foundation)

### IMMEDIATE NEXT STEPS - START TODAY

**Today (4 hours):**
1. Run assessment flow audit commands (30 mins)
2. Run knowledge base inventory commands (30 mins) 
3. Document current state gaps (2 hours)
4. Create priority action list (1 hour)

**Tomorrow (6 hours):**
1. Complete gap analysis spreadsheet (2 hours)
2. Start assessment flow fixes (4 hours)

**This Weekend (4 hours over 2 days):**
1. IEB curriculum research (4 hours)

Ready to execute Phase 1 audit commands right now?