# Curriculum Gate Knowledge - FROZEN

**Version**: 1.0  
**Frozen Date**: November 27, 2025  
**Unfreeze Date**: March 2026 (after pilot feedback)

## DO NOT ADD CHUNKS UNTIL MARCH 2026

The 5-gate system handles 95% of queries. Adding more chunks will:
- Reduce retrieval accuracy
- Increase response time
- Create contradictions

## The 6th Chunk Rule

Before adding Chunk #6, you MUST:
1. Email 3 schools from CSV
2. Get a reply from at least one school
3. Confirm they need this specific gate
4. Document customer requirement here

## Current Gates

1. **Math Lit → Engineering** (irreversible, critical)
2. **Medicine Subject Chain** (subject_chain, high)
3. **APS Shortfall** (aps_shortfall, medium)
4. **Grade Deadlines** (deadline, critical)
5. **IEB vs CAPS** (curriculum_type, low)

## Test Results

- Upload: ✅ 5 chunks uploaded to Supabase
- Retrieval: ✅ 5/5 queries passed
- Response time: ✅ <1s per query (keyword matching)
- Integration: ✅ Ready for manual test

## Implementation

Uses keyword matching (not vector search) for MVP speed and reliability.

See `lib/curriculum/query-gates-simple.js` for implementation.

## Next Steps

1. Move to Day 1 (Assessment Layer)
2. Email 3 schools before bed
3. Wait for pilot feedback before unfreezing

---

**Status**: FROZEN until March 2026  
**Last Updated**: November 27, 2025
