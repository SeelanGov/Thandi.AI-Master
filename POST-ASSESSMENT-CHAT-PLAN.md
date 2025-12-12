# Post-Assessment Chat Feature Plan

## Current Issues

### 1. Grade Journey Problems
- ❌ Grade 11-12 students skip deep dive (goes straight to submit)
- ❌ Grade 10 flow works but Grade 11-12 doesn't get personalized guidance
- ✅ Grade 10: Core questions → Preliminary report → Deep dive opt-in → Results

### 2. No Chat Access After PDF
- Students get PDF but can't ask follow-up questions
- No way to clarify recommendations
- No exploration of alternatives
- One-way communication only

## Solution: Two-Part Fix

### Part 1: Fix Grade 11-12 Journey (Quick Fix)
**File:** `app/assessment/components/AssessmentForm.jsx`

Change line ~115:
```javascript
// BEFORE
} else {
  // Grade 11-12: Auto-advance to deep dive (for now, just submit)
  handleSubmit();
}

// AFTER
} else {
  // Grade 11-12: Show deep dive (no preliminary report)
  setShowDeepDive(true);
}
```

**Why:** Grade 11-12 students need the deep dive questions to get personalized mark-based guidance.

### Part 2: Add Post-Assessment Chat (Main Feature)
**New Component:** `app/results/components/ThandiChat.jsx`

**Features:**
- Appears below PDF download button
- Context-aware (knows student's assessment data)
- Scoped to career guidance only
- Rate-limited to prevent abuse
- Maintains verification warnings

**UI Flow:**
```
Results Page
├── Header (Download PDF, Start New)
├── Warning Banner
├── Gate Warnings (if any)
├── Results Content
├── Footer Verification
└── 💬 Chat with Thandi (NEW)
    ├── "Have questions about your results?"
    ├── Chat interface
    └── Suggested questions
```

**Suggested Questions:**
- "What if my marks improve by Grade 12?"
- "Are there other careers similar to [top match]?"
- "How do I apply for [specific bursary]?"
- "What subjects should I focus on improving?"
- "Can you explain the [pathway] option more?"

**Technical Implementation:**
1. Use existing `/api/rag/query` endpoint
2. Pass assessment context + chat history
3. Prepend system message: "Student is asking follow-up questions about their career assessment results. Context: [assessment data]"
4. Maintain verification footer in all responses
5. Rate limit: 10 questions per session

**Safety Measures:**
- Every chat response includes verification footer
- Scope detection: Reject off-topic questions
- Session-based (no persistent chat history)
- Clear disclaimer: "This is still AI advice - verify everything"

## Implementation Order

1. **Quick Win:** Fix Grade 11-12 flow (5 min)
2. **Main Feature:** Build chat component (30 min)
3. **Integration:** Add to results page (10 min)
4. **Testing:** Verify both flows work (15 min)

## Files to Modify

1. `app/assessment/components/AssessmentForm.jsx` - Fix Grade 11-12 flow
2. `app/results/components/ThandiChat.jsx` - NEW chat component
3. `app/results/page.jsx` - Integrate chat component
4. `app/api/rag/query/route.js` - Add chat context handling (optional, already works)

## Success Criteria

✅ Grade 11-12 students see deep dive questions
✅ All students can chat with Thandi after getting results
✅ Chat maintains context from assessment
✅ Verification warnings appear in every chat response
✅ Rate limiting prevents abuse
✅ Off-topic questions are rejected

## Next Steps

Ready to implement? Say "fix grade journeys and add chat" to proceed.
