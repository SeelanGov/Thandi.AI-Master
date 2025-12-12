# Sitara Issue Diagnosis: Single/Generic Results

## Issue Report
**Reporter:** Sitara  
**Problem:** Results showing only one option and may be generic  
**Date:** January 2, 2026

## Root Cause Analysis

### Problem 1: Overly Restrictive Filtering
The career matching pipeline has **multiple filtering stages** that are too strict:

#### Stage 1: Similarity Threshold (Line 147 in career-matcher.js)
```javascript
.filter(r => r.similarity >= minSimilarity)  // minSimilarity = 0.7 (70%)
```
- **Issue:** 70% similarity threshold may be too high
- **Impact:** Eliminates potentially good matches

#### Stage 2: Metadata Format Check (Lines 148-156)
```javascript
.filter(r => {
  const metadata = r.chunk_metadata || {};
  const hasCareerData = (metadata.career_code && metadata.career_title) ||
                       (metadata.career_code && metadata.career_name) ||
                       (metadata.career && metadata.type === 'keyword_rich_summary') ||
                       metadata.career_name;
  return hasCareerData;
})
```
- **Issue:** Requires very specific metadata formats
- **Impact:** Chunks with slightly different metadata structures are excluded

#### Stage 3: Title Extraction (Lines 207-212 in enrichCareerData)
```javascript
const title = metadata.career_title || 
             metadata.career_name || 
             metadata.career ||
             careerData?.career_title;

if (!title) {
  console.log(`   ⚠️ Skipping chunk without career title`);
  continue;  // SKIPS THE CAREER!
}
```
- **Issue:** Silently skips careers without extractable titles
- **Impact:** Further reduces the number of returned careers

### Problem 2: Generic Results
If only 1 career passes all filters, the system may be:
1. Returning a very broad/generic match
2. Falling back to emergency fallback careers
3. Not personalizing based on student profile

## Evidence

### Filtering Pipeline Flow
```
Initial Search Results (e.g., 20 chunks)
    ↓
Filter 1: Similarity >= 0.7
    ↓ (maybe 8 chunks remain)
Filter 2: Has correct metadata format
    ↓ (maybe 3 chunks remain)
Filter 3: Has extractable title
    ↓ (maybe 1 chunk remains)
Final Result: 1 career
```

### Code Locations
1. **career-matcher.js:147-161** - Main filtering logic
2. **career-matcher.js:207-212** - Title extraction that skips careers
3. **report-generator.js:25-28** - Fallback when no matches found

## Impact Assessment

### User Experience Impact
- **Severity:** HIGH
- **User sees:** Only 1 career option instead of 3-5
- **Perception:** System seems limited, not personalized
- **Trust:** Reduced confidence in recommendations

### Data Quality Impact
- Many valid career matches are being filtered out
- Knowledge base content may not be fully utilized
- Student profiles not getting diverse options

## Recommended Fixes

### Fix 1: Lower Similarity Threshold (QUICK WIN)
```javascript
// Change from 0.7 to 0.6
minSimilarity = 0.6  // 60% instead of 70%
```
**Impact:** More careers pass initial filter  
**Risk:** Low - still maintains quality threshold

### Fix 2: More Flexible Metadata Checking (MEDIUM)
```javascript
// Accept any chunk with career-related metadata
const hasCareerData = metadata.career_code || 
                     metadata.career_title || 
                     metadata.career_name ||
                     metadata.career ||
                     metadata.type?.includes('career');
```
**Impact:** Accepts more metadata formats  
**Risk:** Low - still validates career relevance

### Fix 3: Better Title Extraction (MEDIUM)
```javascript
// Extract title from chunk text if metadata missing
const title = metadata.career_title || 
             metadata.career_name || 
             metadata.career ||
             careerData?.career_title ||
             extractTitleFromText(chunk.chunk_text);  // NEW: fallback extraction

if (!title) {
  console.log(`   ⚠️ Skipping chunk without career title`);
  continue;
}
```
**Impact:** Fewer careers skipped  
**Risk:** Low - adds fallback extraction

### Fix 4: Increase Search Results (QUICK WIN)
```javascript
// Change from limit * 4 to limit * 8
results = await hybridSearch(queryEmbedding, keywords, { 
  limit: limit * 8  // Get 40 results instead of 20
});
```
**Impact:** More candidates to filter from  
**Risk:** Very low - just increases initial pool

### Fix 5: Add Logging for Debugging (IMMEDIATE)
```javascript
console.log(`[FILTER] Stage 1 (similarity): ${beforeSim} → ${afterSim}`);
console.log(`[FILTER] Stage 2 (metadata): ${afterSim} → ${afterMeta}`);
console.log(`[FILTER] Stage 3 (enrichment): ${afterMeta} → ${final}`);
```
**Impact:** Visibility into where careers are lost  
**Risk:** None - just logging

## Testing Plan

### Test Case 1: Sitara's Profile
```javascript
{
  grade: 11,
  subjects: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
  interests: ['helping people', 'science'],
  mathMark: 75
}
```
**Expected:** 3-5 diverse career options  
**Current:** 1 career option

### Test Case 2: Diverse Interests
```javascript
{
  grade: 10,
  subjects: ['Mathematics', 'Business Studies', 'IT'],
  interests: ['technology', 'business', 'creativity']
}
```
**Expected:** Mix of tech, business, and creative careers

### Test Case 3: Low Similarity Threshold
- Run with threshold = 0.5
- Verify quality doesn't degrade
- Confirm more options returned

## Priority Recommendations

### IMMEDIATE (Deploy Today)
1. ✅ Lower similarity threshold to 0.6
2. ✅ Increase search results pool to limit * 8
3. ✅ Add detailed logging

### SHORT TERM (This Week)
4. ⏳ More flexible metadata checking
5. ⏳ Better title extraction with fallback
6. ⏳ Test with real student profiles

### MEDIUM TERM (Next Sprint)
7. ⏳ Review knowledge base metadata consistency
8. ⏳ Add diversity scoring to ensure varied options
9. ⏳ Implement A/B testing for threshold values

## Success Metrics

### Before Fix
- Average careers returned: 1-2
- User satisfaction: Unknown (but likely low)
- Fallback rate: Unknown

### After Fix (Target)
- Average careers returned: 3-5
- User satisfaction: Improved feedback
- Fallback rate: < 10%
- Diversity score: > 0.7 (different categories)

## Next Steps

1. **Implement Quick Wins** (Fixes 1, 4, 5)
2. **Deploy to Production**
3. **Monitor Logs** for 24 hours
4. **Collect User Feedback** from Sitara
5. **Iterate** based on results

---

**Status:** DIAGNOSED - Ready for implementation  
**Owner:** Development Team  
**Reviewer:** Sitara (User Testing)
