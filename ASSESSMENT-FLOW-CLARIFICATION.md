# Assessment Flow Clarification

## Current Issue from Live Testing

**Problem 1:** Grade 11 student treated as Grade 10
**Problem 2:** No marks being collected for enhancement

## Current Assessment Flow

```
Step 1: CurriculumProfile (subjects only - NO marks)
Step 2: SubjectSelection (enjoyed subjects)
Step 3: InterestAreas (career interests)
Step 4: Constraints (time/money/location)
Step 5: OpenQuestions (open-ended)
```

## The Real Problem

**The enhancement needs marks data but NO STEP collects marks!**

MarksCollection component exists but is NOT in the flow.

## Proposed Solutions

### Option 1: Enhanced CurriculumProfile (RECOMMENDED)
```
Step 1: CurriculumProfile (subjects + marks together)
Step 2: SubjectSelection (enjoyed subjects)
Step 3: InterestAreas (career interests)
Step 4: Constraints (time/money/location)
Step 5: OpenQuestions (open-ended)
```

**Pros:**
- Fewer steps (better UX)
- Logical flow (subjects + marks together)
- No duplicate data collection

**Cons:**
- Step 1 becomes longer

### Option 2: Add MarksCollection Step
```
Step 1: CurriculumProfile (subjects only)
Step 2: MarksCollection (marks for selected subjects)
Step 3: SubjectSelection (enjoyed subjects)
Step 4: InterestAreas (career interests)
Step 5: Constraints (time/money/location)
Step 6: OpenQuestions (open-ended)
```

**Pros:**
- Focused steps
- Existing MarksCollection component

**Cons:**
- More steps (6 instead of 5)
- Longer assessment

## Recommendation

**Use Option 1: Enhanced CurriculumProfile**

1. Modify CurriculumProfile to collect marks after subject selection
2. Keep 5-step flow
3. Pass marks data to enhancement

## Implementation Plan

1. **Fix Grade Detection** - Ensure grade parameter is sent correctly
2. **Enhance CurriculumProfile** - Add marks collection after subject selection
3. **Update API Integration** - Extract marks from curriculumProfile
4. **Test with Grade 11 student** - Verify both fixes work

## Which Option Do You Prefer?

Please confirm which approach you want me to implement:
- **Option 1**: Enhanced CurriculumProfile (subjects + marks in Step 1)
- **Option 2**: Add MarksCollection as separate Step 2