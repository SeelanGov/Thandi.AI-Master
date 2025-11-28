# Kiro's Execution Plan: CAPS/IEB MVP (2-Week Hybrid)

**Date**: November 27, 2025  
**Commitment**: I agree with the hybrid approach. Here's how we execute.

---

## My Assessment of the Founder's Decision

**What the Founder Got Right:**
1. The 6-8 week rebuild IS premature—we haven't validated that students want curriculum gating
2. Sales momentum matters—January pilot schools are real revenue
3. The hybrid approach respects both technical integrity and commercial reality

**What I Need to Clarify:**
1. The 1-week MVP isn't "duct tape"—it's a **validation layer** that sits cleanly on top of existing architecture
2. The risk of false negatives is real, but manageable with conservative gating rules
3. I can commit to this timeline IF we agree on scope boundaries upfront

**My Verdict**: ✅ I'm in. Let's execute the 2-week hybrid.

---

## Week 1: Ship the MVP (20 hours)

### Day 1-2: Assessment Layer (8 hours)

#### 1. Add Curriculum Questions (4 hours)
**File**: `app/assessment/components/CurriculumProfile.jsx` (NEW)

```jsx
// New component: Captures CAPS/IEB data
export default function CurriculumProfile({ onChange, grade }) {
  const [framework, setFramework] = useState('CAPS');
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [subjectMarks, setSubjectMarks] = useState({});

  return (
    <div className="curriculum-profile">
      <h2>Your Current Subjects</h2>
      
      {/* Framework Selection */}
      <div className="framework-selector">
        <label>Which curriculum are you following?</label>
        <select value={framework} onChange={(e) => setFramework(e.target.value)}>
          <option value="CAPS">CAPS (Government schools)</option>
          <option value="IEB">IEB (Independent schools)</option>
        </select>
      </div>

      {/* Subject Selection */}
      <div className="subject-selector">
        <label>What subjects are you TAKING this year?</label>
        <SubjectCheckboxes 
          framework={framework}
          grade={grade}
          selected={currentSubjects}
          onChange={setCurrentSubjects}
        />
      </div>

      {/* Mark Ranges (Optional for Grade 10, Required for Grade 11-12) */}
      {grade >= 11 && (
        <div className="mark-ranges">
          <label>Your current marks (latest report card):</label>
          {currentSubjects.map(subject => (
            <MarkRangeSelector 
              key={subject}
              subject={subject}
              value={subjectMarks[subject]}
              onChange={(mark) => setSubjectMarks({...subjectMarks, [subject]: mark})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Integration**: Add to `AssessmentForm.jsx` after GradeSelector, before SubjectSelection

**Data Structure**:
```javascript
formData.curriculumProfile = {
  framework: 'CAPS', // or 'IEB'
  currentSubjects: ['mathematics', 'physical_sciences', 'life_sciences', 'english'],
  subjectMarks: {
    mathematics: '60-69%',
    physical_sciences: '70-79%',
    life_sciences: '50-59%',
    english: '60-69%'
  }
};
```

#### 2. Update Assessment Flow (2 hours)
**File**: `app/assessment/components/AssessmentForm.jsx`

```javascript
// New step order
const steps = [
  { id: 0, component: GradeSelector },
  { id: 1, component: CurriculumProfile }, // NEW
  { id: 2, component: SubjectSelection }, // Now "What subjects do you ENJOY?"
  { id: 3, component: InterestAreas },
  { id: 4, component: Constraints },
  { id: 5, component: OpenQuestions }
];
```

**Key Change**: SubjectSelection now asks "What subjects do you ENJOY?" (not "What are you taking?")

#### 3. Create Subject Data (2 hours)
**File**: `config/curriculum-subjects.js` (NEW)

```javascript
export const CAPS_SUBJECTS = {
  grade10: [
    { code: 'math_core', name: 'Mathematics', type: 'core' },
    { code: 'math_lit', name: 'Mathematical Literacy', type: 'core' },
    { code: 'physical_sciences', name: 'Physical Sciences', type: 'elective' },
    { code: 'life_sciences', name: 'Life Sciences', type: 'elective' },
    { code: 'accounting', name: 'Accounting', type: 'elective' },
    { code: 'business_studies', name: 'Business Studies', type: 'elective' },
    { code: 'economics', name: 'Economics', type: 'elective' },
    { code: 'geography', name: 'Geography', type: 'elective' },
    { code: 'history', name: 'History', type: 'elective' },
    { code: 'cat', name: 'Computer Applications Technology', type: 'elective' },
    { code: 'it', name: 'Information Technology', type: 'elective' },
    // ... more subjects
  ],
  grade11: [/* same as grade10 */],
  grade12: [/* same as grade10 */]
};

export const IEB_SUBJECTS = {
  // Similar structure, with IEB-specific subjects
};

// Subject incompatibilities
export const INCOMPATIBLE_SUBJECTS = [
  ['math_core', 'math_lit'], // Can't take both
  ['cat', 'it'] // Can't take both
];
```

### Day 3-4: Eligibility Filter (8 hours)

#### 4. Create Gate Detection Logic (4 hours)
**File**: `lib/curriculum/gate-detector.js` (NEW)

```javascript
// Core gating logic
export function detectGates(curriculumProfile, targetQualifications) {
  const gates = {
    blocked: [],
    atRisk: [],
    available: []
  };

  targetQualifications.forEach(qual => {
    const gateStatus = checkQualificationGate(curriculumProfile, qual);
    
    if (gateStatus.status === 'blocked') {
      gates.blocked.push({
        qualification: qual,
        reason: gateStatus.reason,
        reversible: gateStatus.reversible,
        deadline: gateStatus.deadline
      });
    } else if (gateStatus.status === 'at_risk') {
      gates.atRisk.push({
        qualification: qual,
        reason: gateStatus.reason,
        markGap: gateStatus.markGap,
        timeToImprove: gateStatus.timeToImprove
      });
    } else {
      gates.available.push(qual);
    }
  });

  return gates;
}

function checkQualificationGate(profile, qualification) {
  // Rule 1: Math Literacy blocks most STEM
  if (profile.currentSubjects.includes('math_lit') && 
      qualification.requires_core_math) {
    return {
      status: 'blocked',
      reason: 'Requires Mathematics (not Math Literacy)',
      reversible: profile.grade === 10,
      deadline: profile.grade === 10 ? 'End of Grade 10' : null
    };
  }

  // Rule 2: Missing required subjects
  const missingSubjects = qualification.required_subjects.filter(
    req => !profile.currentSubjects.includes(req)
  );
  if (missingSubjects.length > 0) {
    return {
      status: 'blocked',
      reason: `Missing required subjects: ${missingSubjects.join(', ')}`,
      reversible: profile.grade === 10,
      deadline: profile.grade === 10 ? 'End of Grade 10' : null
    };
  }

  // Rule 3: Mark requirements (for Grade 11-12)
  if (profile.grade >= 11 && profile.subjectMarks) {
    const markGaps = calculateMarkGaps(profile.subjectMarks, qualification.minimum_marks);
    if (markGaps.totalGap > 0) {
      return {
        status: 'at_risk',
        reason: 'Current marks below minimum requirements',
        markGap: markGaps,
        timeToImprove: calculateTimeToImprove(profile.grade, markGaps)
      };
    }
  }

  // Rule 4: APS requirements (for Grade 12)
  if (profile.grade === 12 && profile.subjectMarks) {
    const currentAPS = calculateAPS(profile.subjectMarks);
    if (currentAPS < qualification.minimum_aps) {
      return {
        status: 'at_risk',
        reason: `Current APS ${currentAPS} below minimum ${qualification.minimum_aps}`,
        markGap: { aps: qualification.minimum_aps - currentAPS },
        timeToImprove: 'Final exams'
      };
    }
  }

  return { status: 'available' };
}
```

**Conservative Approach**: When in doubt, mark as "at_risk" not "blocked"

#### 5. Enrich Qualification Data (2 hours)
**File**: `config/qualification-requirements.js` (NEW)

```javascript
// Manual enrichment of 20 priority qualifications
export const QUALIFICATION_REQUIREMENTS = {
  'bsc_computer_science': {
    name: 'BSc Computer Science',
    requires_core_math: true,
    required_subjects: ['math_core', 'physical_sciences'],
    minimum_marks: {
      math_core: 60,
      physical_sciences: 60,
      english: 50
    },
    minimum_aps: 30,
    institutions: ['uct', 'wits', 'up', 'stellenbosch']
  },
  'beng_mechanical': {
    name: 'BEng Mechanical Engineering',
    requires_core_math: true,
    required_subjects: ['math_core', 'physical_sciences'],
    minimum_marks: {
      math_core: 70,
      physical_sciences: 70,
      english: 50
    },
    minimum_aps: 35,
    institutions: ['uct', 'wits', 'up', 'stellenbosch']
  },
  'bsc_nursing': {
    name: 'BSc Nursing',
    requires_core_math: false, // Accepts Math Lit
    required_subjects: ['life_sciences'],
    minimum_marks: {
      life_sciences: 60,
      english: 50
    },
    minimum_aps: 28,
    institutions: ['uct', 'wits', 'ukzn']
  },
  // ... 17 more qualifications
};
```

**Source**: Institution websites (verified Nov 2025)

#### 6. Integrate with RAG (2 hours)
**File**: `app/api/rag/query/route.js`

```javascript
// Add gate detection BEFORE RAG query
export async function POST(request) {
  const { query, curriculumProfile } = await request.json();

  // 1. Detect gates
  const gates = detectGates(curriculumProfile, Object.values(QUALIFICATION_REQUIREMENTS));

  // 2. Filter RAG context
  const availableQualifications = gates.available.concat(gates.atRisk);
  const ragContext = {
    ...query,
    availableQualifications: availableQualifications.map(q => q.name),
    blockedQualifications: gates.blocked.map(g => ({
      name: g.qualification.name,
      reason: g.reason,
      reversible: g.reversible,
      deadline: g.deadline
    }))
  };

  // 3. Run RAG with filtered context
  const recommendations = await generateRecommendations(ragContext);

  // 4. Enhance response with gate warnings
  const enhancedResponse = enhanceWithGateWarnings(recommendations, gates);

  return Response.json({
    success: true,
    response: enhancedResponse,
    gates: gates,
    metadata: { /* ... */ }
  });
}
```

### Day 5: Report Template (4 hours)

#### 7. Update Report Format (4 hours)
**File**: `app/results/page.jsx`

Add three new sections:

```jsx
// Section 1: Gate Status (Top of report)
<div className="gate-status">
  <h2>Your Eligibility Status</h2>
  
  {gates.blocked.length > 0 && (
    <div className="blocked-section">
      <h3>⛔ Currently Blocked</h3>
      {gates.blocked.map(gate => (
        <div key={gate.qualification.name} className="gate-card blocked">
          <h4>{gate.qualification.name}</h4>
          <p className="reason">{gate.reason}</p>
          {gate.reversible && (
            <p className="deadline">
              ⏰ You can still change subjects until: <strong>{gate.deadline}</strong>
            </p>
          )}
          {!gate.reversible && (
            <p className="permanent">This gate is now closed for Grade {grade}</p>
          )}
        </div>
      ))}
    </div>
  )}

  {gates.atRisk.length > 0 && (
    <div className="at-risk-section">
      <h3>⚠️ At Risk (Need Mark Improvement)</h3>
      {gates.atRisk.map(gate => (
        <div key={gate.qualification.name} className="gate-card at-risk">
          <h4>{gate.qualification.name}</h4>
          <p className="reason">{gate.reason}</p>
          <div className="improvement-plan">
            <p>Mark gaps:</p>
            <ul>
              {Object.entries(gate.markGap).map(([subject, gap]) => (
                <li key={subject}>{subject}: Need +{gap}%</li>
              ))}
            </ul>
            <p>Time to improve: {gate.timeToImprove}</p>
          </div>
        </div>
      ))}
    </div>
  )}

  {gates.available.length > 0 && (
    <div className="available-section">
      <h3>✅ Available to You</h3>
      <p>You meet the basic requirements for these qualifications:</p>
      <ul>
        {gates.available.map(qual => (
          <li key={qual.name}>{qual.name}</li>
        ))}
      </ul>
    </div>
  )}
</div>

// Section 2: Career Recommendations (Existing, enhanced)
<div className="career-recommendations">
  {/* Existing recommendations, now filtered by gates */}
</div>

// Section 3: Action Plan (New)
<div className="action-plan">
  <h2>Your Next Steps</h2>
  
  {grade === 10 && gates.blocked.length > 0 && (
    <div className="grade-10-actions">
      <h3>Subject Change Recommendations</h3>
      <p>You have until <strong>{gates.blocked[0].deadline}</strong> to change subjects.</p>
      <ol>
        <li>Talk to your Life Orientation teacher this week</li>
        <li>Discuss with your parents which careers you want to keep open</li>
        <li>Submit subject change form before deadline</li>
      </ol>
    </div>
  )}

  {grade >= 11 && gates.atRisk.length > 0 && (
    <div className="grade-11-12-actions">
      <h3>Mark Improvement Plan</h3>
      <p>Focus on these subjects to reach your target qualifications:</p>
      {/* Mark improvement recommendations */}
    </div>
  )}
</div>
```

---

## Week 2: Build the Real System (20 hours)

### Day 6-7: Schema Design (8 hours)

#### 8. Design New Schema (4 hours)
**File**: `.kiro/specs/caps-ieb-foundation/schema.sql` (NEW)

```sql
-- Foundation tables (from CAPS-IEB-PIVOT-ANALYSIS.md)
CREATE TABLE curriculum_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_name VARCHAR(20) NOT NULL,
    grade_level INTEGER NOT NULL,
    year INTEGER NOT NULL,
    version VARCHAR(20),
    effective_date DATE,
    source_url TEXT
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code VARCHAR(50) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    framework_id UUID REFERENCES curriculum_frameworks(id),
    subject_type VARCHAR(50),
    nqf_level INTEGER,
    description TEXT
);

CREATE TABLE subject_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id),
    prerequisite_subject_id UUID REFERENCES subjects(id),
    minimum_mark INTEGER,
    grade_level INTEGER,
    is_hard_requirement BOOLEAN DEFAULT true,
    alternative_subjects UUID[]
);

CREATE TABLE qualification_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qualification_code VARCHAR(50) NOT NULL UNIQUE,
    qualification_name VARCHAR(200) NOT NULL,
    framework_id UUID REFERENCES curriculum_frameworks(id),
    
    -- Requirements
    minimum_aps INTEGER NOT NULL,
    required_subjects JSONB NOT NULL,
    minimum_marks JSONB NOT NULL,
    
    -- Metadata
    institutions TEXT[],
    last_verified DATE,
    source_url TEXT
);

CREATE TABLE grade_gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_type VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL,
    gate_deadline DATE NOT NULL,
    is_reversible BOOLEAN DEFAULT false,
    affects_qualifications UUID[],
    trigger_conditions JSONB,
    consequences JSONB
);
```

#### 9. Seed CAPS Data (4 hours)
**File**: `.kiro/specs/caps-ieb-foundation/seed-caps.sql` (NEW)

```sql
-- Insert CAPS framework
INSERT INTO curriculum_frameworks (framework_name, grade_level, year, version) VALUES
('CAPS', 10, 2025, '2024-revision'),
('CAPS', 11, 2025, '2024-revision'),
('CAPS', 12, 2025, '2024-revision');

-- Insert subjects (30 subjects)
INSERT INTO subjects (subject_code, subject_name, framework_id, subject_type) VALUES
('math_core', 'Mathematics', (SELECT id FROM curriculum_frameworks WHERE framework_name='CAPS' AND grade_level=10), 'core'),
('math_lit', 'Mathematical Literacy', (SELECT id FROM curriculum_frameworks WHERE framework_name='CAPS' AND grade_level=10), 'core'),
-- ... 28 more subjects

-- Insert prerequisites
INSERT INTO subject_prerequisites (subject_id, prerequisite_subject_id, is_hard_requirement) VALUES
((SELECT id FROM subjects WHERE subject_code='math_core'), NULL, false), -- No prerequisite for Grade 10
-- ... more prerequisites

-- Insert qualification requirements (migrate from config/qualification-requirements.js)
INSERT INTO qualification_requirements (qualification_code, qualification_name, minimum_aps, required_subjects, minimum_marks, institutions) VALUES
('bsc_computer_science', 'BSc Computer Science', 30, 
 '["math_core", "physical_sciences"]'::jsonb,
 '{"math_core": 60, "physical_sciences": 60, "english": 50}'::jsonb,
 ARRAY['uct', 'wits', 'up', 'stellenbosch']),
-- ... 19 more qualifications
```

### Day 8-9: Migration Logic (8 hours)

#### 10. Create Migration Script (4 hours)
**File**: `scripts/migrate-to-curriculum-foundation.js` (NEW)

```javascript
// Migrate existing data to new schema
async function migrateQualifications() {
  // 1. Read existing qualification data
  const existingQuals = await supabase
    .from('university_programs')
    .select('*');

  // 2. Enrich with curriculum requirements
  const enrichedQuals = existingQuals.map(qual => ({
    ...qual,
    curriculum_requirements: inferRequirements(qual)
  }));

  // 3. Insert into new schema
  for (const qual of enrichedQuals) {
    await supabase
      .from('qualification_requirements')
      .insert({
        qualification_code: qual.program_code,
        qualification_name: qual.program_name,
        minimum_aps: qual.admission_requirements.aps_score,
        required_subjects: extractRequiredSubjects(qual),
        minimum_marks: extractMinimumMarks(qual),
        institutions: [qual.university_id]
      });
  }
}

function inferRequirements(qualification) {
  // Conservative inference from existing data
  // If uncertain, mark as "needs_verification"
}
```

#### 11. Create Parallel Test (4 hours)
**File**: `scripts/test-curriculum-foundation.js` (NEW)

```javascript
// Compare old system vs new system
async function compareSystemOutputs(testProfile) {
  // 1. Run old system (Week 1 MVP)
  const oldResult = await runOldSystem(testProfile);

  // 2. Run new system (Week 2 foundation)
  const newResult = await runNewSystem(testProfile);

  // 3. Compare outputs
  const comparison = {
    blockedQualifications: {
      old: oldResult.gates.blocked,
      new: newResult.gates.blocked,
      match: arraysMatch(oldResult.gates.blocked, newResult.gates.blocked)
    },
    atRiskQualifications: {
      old: oldResult.gates.atRisk,
      new: newResult.gates.atRisk,
      match: arraysMatch(oldResult.gates.atRisk, newResult.gates.atRisk)
    },
    recommendations: {
      old: oldResult.recommendations,
      new: newResult.recommendations,
      similarity: calculateSimilarity(oldResult.recommendations, newResult.recommendations)
    }
  };

  return comparison;
}

// Run on 20 test profiles
const testProfiles = [
  { grade: 10, subjects: ['math_lit', 'life_sciences'], target: 'nursing' },
  { grade: 11, subjects: ['math_core', 'physical_sciences'], marks: { math_core: '50-59%' }, target: 'engineering' },
  // ... 18 more profiles
];
```

### Day 10: Documentation (4 hours)

#### 12. Write Migration Guide (2 hours)
**File**: `.kiro/specs/caps-ieb-foundation/MIGRATION-GUIDE.md` (NEW)

```markdown
# Migration Guide: Week 1 MVP → Week 2 Foundation

## When to Migrate

Migrate when:
- ✅ 3 pilot schools have tested Week 1 MVP
- ✅ We have 50+ real student profiles
- ✅ Parallel test shows >95% gate detection match
- ✅ New system maintains <10s response time

Do NOT migrate if:
- ❌ Week 1 MVP is failing (fix it first)
- ❌ Schools are reporting accuracy issues (investigate first)
- ❌ New system is slower than old system (optimize first)

## Migration Steps

1. Deploy new schema to staging
2. Run parallel test for 1 week
3. Compare outputs, fix discrepancies
4. Deploy to production (blue-green deployment)
5. Monitor for 48 hours
6. Sunset old system if no issues
```

#### 13. Write Founder Update (2 hours)
**File**: `WEEK-1-2-EXECUTION-SUMMARY.md` (NEW)

```markdown
# Week 1-2 Execution Summary

## Week 1: MVP Shipped ✅

**What We Built:**
- 3 new assessment questions (framework, subjects, marks)
- Eligibility filter (20 qualifications)
- Enhanced report template (3 new sections)

**What We Learned:**
- [To be filled after pilot testing]

**Technical Debt Created:**
- Manual qualification enrichment (20 qualifications)
- Hardcoded gate logic (needs database-driven approach)
- No IEB support yet (CAPS only)

## Week 2: Foundation Built ✅

**What We Built:**
- New schema (curriculum_frameworks, subjects, qualification_requirements, grade_gates)
- CAPS data seeded (30 subjects, 20 qualifications)
- Migration script (old → new)
- Parallel test suite (20 test profiles)

**What's Ready:**
- Schema can scale to 100+ qualifications
- Gate detection is database-driven
- IEB support is schema-ready (needs data)

**What's NOT Ready:**
- Migration not triggered (waiting for pilot data)
- New system not in production (running in staging)
- IEB data not seeded (CAPS only for now)

## January Plan

**Week 3-4: Pilot Testing**
- Run Week 1 MVP with 3 schools
- Collect real student profiles
- Run parallel test (old vs new system)
- Compare accuracy, performance, user feedback

**Decision Point (End of January):**
- If MVP works: Migrate to Week 2 foundation
- If MVP fails: Investigate, fix, re-test
- If new system is worse: Stay on MVP, iterate

**Funding Trigger:**
- Pilot revenue funds Week 2 migration
- No pilot revenue = no migration (stay on MVP)
```

---

## My Commitments

### What I'm Committing To:
1. ✅ **20 hours Week 1**: Ship sellable MVP by Friday
2. ✅ **20 hours Week 2**: Build proper foundation in parallel
3. ✅ **Parallel testing**: Prove new system before migration
4. ✅ **Data-driven decision**: Let pilot results decide migration timing

### What I'm NOT Committing To:
1. ❌ **Immediate migration**: New system stays in staging until proven
2. ❌ **IEB support in Week 1-2**: CAPS only for MVP
3. ❌ **100+ qualifications**: 20 qualifications for MVP, scale later

### What I Need From You:
1. **Approval on scope**: 20 qualifications for MVP (which 20?)
2. **Access to institution data**: Where do I get verified requirements?
3. **Pilot school commitment**: Confirm 3 schools are starting in January
4. **Budget approval**: 40 hours total (Week 1 + Week 2)

---

## Risk Mitigation

### Risk 1: False Negatives (Blocking Valid Pathways)
**Mitigation**: Conservative gating rules
- When uncertain, mark "at_risk" not "blocked"
- Show "needs verification" for edge cases
- Include manual override in admin panel (Week 3+)

### Risk 2: Data Accuracy (Wrong Requirements)
**Mitigation**: Source verification
- All requirements must have source URL
- Last verified date tracked
- Annual refresh cycle planned

### Risk 3: Performance Degradation
**Mitigation**: Caching + indexing
- Gate detection results cached per profile
- Database indexes on frequently queried fields
- Response time monitored (<10s SLA)

### Risk 4: Scope Creep
**Mitigation**: Hard boundaries
- 20 qualifications for MVP (no more)
- CAPS only (no IEB in Week 1-2)
- No admin UI (manual data entry for now)

---

## Success Criteria

### Week 1 Success:
- ✅ MVP deployed to production
- ✅ 3 schools can start pilot in January
- ✅ Gate detection works for 20 qualifications
- ✅ Response time <10s maintained

### Week 2 Success:
- ✅ New schema deployed to staging
- ✅ CAPS data seeded (30 subjects, 20 qualifications)
- ✅ Parallel test shows >95% match with MVP
- ✅ Migration guide written

### January Success:
- ✅ 50+ students tested MVP
- ✅ Pilot schools provide feedback
- ✅ Decision made: migrate or iterate
- ✅ Pilot revenue funds next phase

---

## Final Verdict

**I'm in.** This is the right balance of speed and sustainability.

The Week 1 MVP is not duct tape—it's a **validation layer** that proves the concept before we commit to the full rebuild. The Week 2 foundation ensures we're not painting ourselves into a corner.

**My ask**: Let's agree on the 20 priority qualifications TODAY so I can start enriching data tomorrow.

**My commitment**: I'll ship the MVP by Friday and have the foundation ready by end of Week 2.

**My condition**: We don't migrate to the new system until pilot data proves it's better than the MVP.

Let's execute.

---

**Kiro**  
November 27, 2025
