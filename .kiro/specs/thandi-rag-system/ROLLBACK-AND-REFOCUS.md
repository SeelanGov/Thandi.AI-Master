# Rollback and Refocus - Immediate Action Plan

**Date**: November 19, 2025  
**Status**: URGENT - Scope creep identified and stopped

---

## What Went Wrong

I added **1,500+ untested knowledge chunks** to a system that was **87% accurate with 90 chunks**. That's a **17x complexity increase** with zero testing.

**The mistake**: Solving a future problem (post-matric crisis management) instead of the pilot problem (Grade 11/12 career guidance).

---

## Immediate Rollback Actions

### 1. DO NOT Upload Pathway Content ❌

**Delete these upload intentions**:
- ❌ `scripts/upload-university-pathways.js` - DO NOT RUN
- ❌ `scripts/upload-tvet-pathways.js` - DO NOT RUN
- ❌ `scripts/upload-private-institutions.js` - DO NOT RUN
- ❌ `scripts/upload-private-higher-ed.js` - DO NOT RUN
- ❌ `scripts/upload-seta-pathways.js` - DO NOT RUN

**These files stay as reference only for Phase 2 (March 2026)**

### 2. Keep Pathway Data as Reference Only

**Files to KEEP but NOT upload**:
- `thandi_knowledge_base/university_pathways/` - Reference for Phase 2
- `thandi_knowledge_base/tvet_pathways/` - Reference for Phase 2
- `thandi_knowledge_base/private_institutions/` - Reference for Phase 2
- `thandi_knowledge_base/private_higher_ed/` - Reference for Phase 2
- `thandi_knowledge_base/seta_pathways/` - Reference for Phase 2

**Label them clearly**: "PHASE 2 - NOT FOR PILOT"

### 3. Current Knowledge Base Status

**What's Actually in Supabase** (as of now):
- ✅ ~90 career chunks (tested, 87% accurate)
- ✅ Decision-making framework
- ✅ Career misconceptions framework
- ✅ Subject-to-career mapping

**Total**: ~90-100 chunks (TESTED AND WORKING)

---

## Refocused Pilot Scope

### The Real Problem
**Grade 11/12 students asking**: "What should I study? What careers match my subjects?"

**NOT**: "I didn't get into university, what now?" (That's January 2026, Phase 2)

### Approved Knowledge Base (110 chunks max)

#### Core Content (90 chunks) ✅
Already uploaded and tested:
- 24 career profiles
- Decision framework
- Misconceptions framework
- Subject mapping

#### Controlled Pathway Experiment (20 chunks)
**Purpose**: Test if minimal pathways improve guidance without killing performance

**Strict Selection**:
1. **5 Universities** (top institutions students actually ask about)
   - University of Cape Town
   - University of the Witwatersrand
   - University of Pretoria
   - Stellenbosch University
   - University of KwaZulu-Natal

2. **5 TVET Colleges** (1 per major province)
   - Western Cape: False Bay TVET College
   - Gauteng: Ekurhuleni East TVET College
   - KwaZulu-Natal: Coastal TVET College
   - Eastern Cape: Buffalo City TVET College
   - Limpopo: Capricorn TVET College

3. **5 Private Institutions** (DHET-accredited only)
   - Damelin
   - Boston City Campus
   - CTI Education Group
   - Rosebank College
   - Varsity College

4. **5 SETAs** (active learnerships, high student interest)
   - MERSETA (Engineering/Manufacturing)
   - CATHSSETA (Hospitality/Tourism)
   - EWSETA (Electrician/Plumber)
   - BANKSETA (Banking/Finance)
   - MICT SETA (IT/Digital)

**Each institution gets 1 chunk only** = 20 total chunks

---

## Next Steps (Priority Order)

### TODAY (November 19)

#### 1. Create Minimal Pathway Upload Script ✅
**File**: `scripts/upload-minimal-pathways.js`

**Content**: Exactly 20 chunks (5+5+5+5)
- Manual verification required for each
- Current 2025 data only
- Links to existing career content
- Functional application links

#### 2. Manual Verification Checklist
For each of the 20 institutions:
- [ ] Still operating (2025 check)
- [ ] Entry requirements current
- [ ] Maps to career in our 90-chunk database
- [ ] Application link works
- [ ] Contact info verified

#### 3. Test Performance Impact
**Before upload**: Record baseline
- Query time with 90 chunks
- Accuracy with 90 chunks

**After upload**: Measure impact
- Query time with 110 chunks
- Accuracy with 110 chunks

**If performance degrades**: Delete all 20 pathway chunks, ship with 90

### THIS WEEK (November 20-22)

#### 4. Focus on MVP Features (NOT content)
**What's actually missing from the pilot**:
- [ ] Assessment form (4 screens)
- [ ] Results display page
- [ ] PDF generator for results
- [ ] Admin dashboard
- [ ] Teacher training materials

**Stop building content. Build the product.**

#### 5. Test Real Student Queries
With 110 chunks only:
- "Should I study engineering?"
- "What careers match Maths and Science?"
- "Is B.Compt right for me?"
- "How do I know if I'll like medicine?"

**Focus**: Decision-making support, not comprehensive alternatives

### NEXT WEEK (November 25-29)

#### 6. Pilot Deployment Prep
- Finalize assessment form
- Complete PDF generator
- Train pilot teachers
- Set up feedback collection

#### 7. Performance Monitoring
- Track query response times
- Monitor accuracy rates
- Collect edge cases
- Document failures

---

## Performance Guardrails (Non-Negotiable)

### Red Lines
- Query time: **< 5 seconds** (current: ~3.7s)
- Accuracy: **> 85%** (current: 87%)
- Upload time: **< 30 minutes**

### If Any Metric Fails
**Action**: Delete all 20 pathway chunks immediately
**Ship with**: Original 90 chunks only
**No exceptions**

---

## What Gets Deferred to Phase 2 (March 2026)

### Comprehensive Pathways (1,500+ chunks)
**Trigger**: Pilot feedback explicitly requests "What if I don't get in?"

**Requirements before building**:
1. Pilot deployed to 3+ schools
2. 50+ students tested
3. Feedback proves need
4. Funding secured
5. Current system maintains performance

**Timeline**: March 2026 earliest

### Enhanced Features
- Bursary information
- Application deadline tracking
- Success rate statistics
- Comprehensive SETA database
- All TVET colleges
- All private institutions

**All deferred until pilot proves core value**

---

## The Refocused Mission

### What We're Building (Pilot)
A tool that helps Grade 11/12 students:
1. Understand what careers actually involve
2. Match their subjects to career options
3. Verify career fit before committing
4. Make informed decisions with confidence

### What We're NOT Building (Yet)
- Post-matric crisis management
- Comprehensive alternative pathways
- Every possible backup plan
- Safety net for university rejection

**Build the pre-flight checklist, not the parachute.**

---

## Cofounder Feedback Integration

### Key Insights Accepted
1. ✅ "This is strategic scope creep" - Correct
2. ✅ "17x complexity increase with zero testing" - Reckless
3. ✅ "Solving future problem, not pilot problem" - Accurate
4. ✅ "Performance death spiral risk" - Real danger
5. ✅ "Doesn't protect your son" - True, missed the point

### Course Correction
- Stop content expansion
- Focus on MVP features
- Test minimal pathways (20 chunks)
- Ship pilot by November 25
- Defer comprehensive pathways to Phase 2

---

## Success Metrics (Pilot)

### Technical
- [ ] 110 chunks uploaded and tested
- [ ] Query time < 5s maintained
- [ ] Accuracy > 85% maintained
- [ ] Assessment form complete
- [ ] PDF generator working

### User
- [ ] Students understand careers better
- [ ] Confident in subject choices
- [ ] Can verify career fit
- [ ] Make informed decisions

### Business
- [ ] 3 pilot schools deployed
- [ ] Teacher feedback positive
- [ ] Students recommend to peers
- [ ] Clear path to Phase 2 funding

---

## Commit to Discipline

### The Rule
"If it doesn't solve the Grade 11/12 career guidance problem, it's Phase 2."

### The Test
Before adding any content, ask:
1. Does this help students choose subjects?
2. Does this help students understand careers?
3. Does this help students verify fit?

If answer is "No, but it helps with alternatives" → **Phase 2**

---

## Files Created for Discipline

1. ✅ `rules/thandi-scope-boundary.md` - Hard limits on scope
2. ✅ This file - Rollback documentation
3. 🔄 `scripts/upload-minimal-pathways.js` - Next to create (20 chunks only)

---

## Confirmation Required

**Rollback complete when**:
- [ ] No pathway uploads executed
- [ ] Scope boundary rule committed
- [ ] Minimal pathway script created (20 chunks)
- [ ] Manual verification checklist ready
- [ ] Focus shifted to MVP features

**Target**: Tomorrow morning (November 20)

---

**Status**: Rollback in progress  
**Next Action**: Create minimal pathway upload script (20 chunks only)  
**Deadline**: November 20, 2025
