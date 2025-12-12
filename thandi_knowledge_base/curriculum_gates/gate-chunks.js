// 5 Gate Chunks for CAPS/IEB Curriculum Knowledge
// Each chunk is a self-contained decision node

export const CURRICULUM_GATE_CHUNKS = [
  // ------------------------------------------------------------------
  // CHUNK 1: MATH LIT → ENGINEERING (The Death Gate)
  // ------------------------------------------------------------------
  {
    chunk_text: `**GATE: Math Literacy blocks Engineering**

**Why**: Engineering requires Grade 12 Mathematics (algebra/calculus). Math Lit teaches budgeting/statistics—no university accepts it for BSc/BEng.

**Irreversibility**: Cannot switch Math Lit → Math after Grade 10 (CAPS 3-year content arc). DBE policy enforces this; schools have zero exceptions.

**Deadline**: End of Grade 10 Term 4 (November 30). After this, you're locked.

**Action if in Grade 10**:
1. Request subject change form from HOD immediately
2. Attend catch-up sessions in December-January
3. Minimum mark to switch: 50% in Grade 9 Math

**Action if in Grade 11/12**:
1. Pivot to careers accepting Math Lit: Business Management (APS 25), Hospitality, TVET Engineering diplomas
2. Consider post-matric bridging at TVET (1 year, then university access)

**APS Impact**:
- With Math Lit: Max APS ~32 (no STEM)
- With Math: APS 35+ unlocks Engineering

**Student Query Trigger**: "I'm in Math Lit but want Engineering"`,
    metadata: {
      gate_type: 'irreversible',
      grade_level: '10',
      subjects: ['Mathematical Literacy', 'Mathematics'],
      career_impact: 'Engineering',
      urgency: 'critical'
    }
  },

  // ------------------------------------------------------------------
  // CHUNK 2: MEDICINE SUBJECT CHAIN (The Hope Gate)
  // ------------------------------------------------------------------
  {
    chunk_text: `**GATE: Medicine requires Physical Sciences**

**Why**: MBChB programs need Physics (mechanics) + Life Sciences (biology). Life Sciences alone is insufficient.

**Required Subject Chain**:
- Grade 10: Mathematics (50%+) + Physical Sciences (50%+) + Life Sciences (50%+)
- Grade 11: Mathematics (60%+) + Physical Sciences (60%+) + Life Sciences (60%+)
- Grade 12: Mathematics (60%+) + Physical Sciences (60%+) + Life Sciences (70%+)

**Irreversibility**:
- Grade 10: Can add Physical Sciences if timetable allows
- Grade 11: Cannot add new subjects (too late)

**APS Target**: 40+ (average 67% across 6 subjects)

**Action if missing Physical Sciences**:
1. **Grade 10**: Add it now. Talk to Science HOD before Nov 30.
2. **Grade 11**: Pivot to Nursing (requires Life Sciences only, APS 30)
3. **Grade 12**: Apply to BSc Biological Sciences (bridge to Medicine post-grad)

**NBT Requirement**: Medicine also requires NBT (National Benchmark Test) - book by March of Grade 12.

**Student Query Trigger**: "I want Medicine but don't take Physical Sciences"`,
    metadata: {
      gate_type: 'subject_chain',
      grade_level: '10,11',
      subjects: ['Physical Sciences', 'Life Sciences'],
      career_impact: 'Medicine',
      urgency: 'high'
    }
  },

  // ------------------------------------------------------------------
  // CHUNK 3: APS CALCULATION & MARK GAPS (The Shock Gate)
  // ------------------------------------------------------------------
  {
    chunk_text: `**GATE: APS too low for target career**

**APS Calculation Formula**:
- Take best 6 subjects (exclude Life Orientation)
- Convert each mark to points:
  - 80-100% = 7 points
  - 70-79% = 6 points
  - 60-69% = 5 points
  - 50-59% = 4 points
  - 40-49% = 3 points
  - 30-39% = 2 points
  - 0-29% = 1 point
- **Max APS**: 42

**Career APS Requirements**:
- Engineering: 35+ (need ~58% average)
- Medicine: 40+ (need ~67% average)
- BCom (General): 30+ (need ~50% average)
- BA Humanities: 25+ (need ~42% average)
- TVET Diploma: 20+ (need ~33% average)

**Fastest APS Improvements**:
1. **Boost one subject by 15%** (e.g., Math 55% → 70% = +3 points)
2. **Improve two subjects by 10%** (e.g., Physics 58% → 68% = +2 points)
3. **Add 8th subject** (IEB only) = +3-4 points

**Timeline**: You have until June trials in Grade 12 to improve marks for university applications.

**Student Query Trigger**: "My APS is 28, can I do Engineering?"`,
    metadata: {
      gate_type: 'aps_shortfall',
      grade_level: '10,11,12',
      subjects: ['APS'],
      career_impact: 'all',
      urgency: 'medium'
    }
  },

  // ------------------------------------------------------------------
  // CHUNK 4: GRADE-SPECIFIC DEADLINES (The Panic Gate)
  // ------------------------------------------------------------------
  {
    chunk_text: `**GATE: Grade-specific irreversibility**

**GRADE 10** (Planning Year):
- **Can change**: Any elective subject (with HOD approval)
- **Can switch**: Math ↔ Math Lit (Math→Math Lit easy, Math Lit→Math hard)
- **Deadline**: November 30 (Term 4 end)
- **Action**: Finalize subjects by Nov 30. Get sign-off from parents + HOD.

**GRADE 11** (Lock-in Year):
- **Can change**: Drop a subject only (reduce from 7 to 6)
- **Cannot change**: Add new subjects, switch cores
- **Deadline**: No changes after Term 1 (school policy)
- **Action**: Focus on maxing current subjects. Aim for 60%+ in all.

**GRADE 12** (Action Year):
- **Can change**: Nothing (NSC registration locked with DBE)
- **Cannot change**: All subjects final
- **Deadlines**:
  - NBT registration: March 2026
  - University applications: May-July 2026 (varies by uni)
  - NSFAS bursary: July 31, 2026
- **Action**: Apply to 3 universities + 2 bursaries NOW.

**Student Query Trigger**: "Can I change subjects in Grade 11?"`,
    metadata: {
      gate_type: 'deadline',
      grade_level: '10,11,12',
      subjects: ['all'],
      career_impact: 'none',
      urgency: 'critical'
    }
  },

  // ------------------------------------------------------------------
  // CHUNK 5: IEB vs CAPS EQUIVALENCE (The Fear Gate)
  // ------------------------------------------------------------------
  {
    chunk_text: `**GATE: IEB vs CAPS confusion**

**Equivalence**: Both IEB and CAPS lead to the **same NSC certificate**. Universities treat them equally for admission.

**Key Differences**:
- **CAPS**: 7 subjects, 75% exam-based, standardized nationally
- **IEB**: 7-9 subjects, 60% continuous assessment, school flexibility

**APS Calculation**: IEB marks convert to APS identically. No penalty for IEB.

**Advantages of IEB**:
- 8th/9th subject can boost APS by 3-4 points
- Advanced Programme Math/English = A-level equivalent (global recognition)
- Better prep for university-style continuous assessment

**Disadvantages of IEB**:
- Fees R50K-200K/year (bursaries limited)
- Some corporate bursaries prioritize CAPS schools (equity targets)

**Action for IEB Students**:
- Verify bursary T&Cs (90% accept IEB)
- Use 8th subject strategically (e.g., AP Math for Engineering)
- Don't worry about university acceptance—it's identical

**Student Query Trigger**: "Is IEB worse than CAPS for university?"`,
    metadata: {
      gate_type: 'curriculum_type',
      grade_level: '10,11,12',
      subjects: ['IEB', 'CAPS'],
      career_impact: 'bursaries',
      urgency: 'low'
    }
  }
];
