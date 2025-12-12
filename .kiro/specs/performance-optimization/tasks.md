# 3-Day Emergency Fix Plan

## Day 1: Fix APIs (Today)
- [ ] 1.1 Create app/api/assessment/save/route.js
  - Write 20-line POST handler for saving assessment data
  - Copy pattern from existing working API endpoints
  - _Requirements: 2.1_

- [ ] 1.2 Create app/api/privacy/route.js
  - Write 15-line GET handler returning privacy policy
  - Return static policy document with proper headers
  - _Requirements: 2.2_

- [ ] 1.3 Create app/api/consent/route.js
  - Write 25-line POST handler for consent processing
  - Store consent data in Supabase with POPIA compliance
  - _Requirements: 2.3_

- [ ] 1.4 Deploy and verify
  - Run: vercel --prod --force
  - Test all 3 endpoints return 200 OK (not 404/405)
  - _Requirements: 2.4_

## Day 2: Add Caching (Tomorrow)
- [ ] 2.1 Add Redis caching to RAG endpoint
  - Add 5 lines to check Redis cache first in app/api/rag/query/route.js
  - Return cached response if exists (should be <50ms)
  - _Requirements: 3.1_

- [ ] 2.2 Test speed improvement
  - Use Measure-Command to test response times
  - Target: Reduce from 12.6s to <5s with caching
  - _Requirements: 1.1_

## Day 3: Polish (Day After)
- [ ] 3.1 Store career descriptions in database
  - If still >3s: Add career descriptions to Supabase careers table
  - Bypass LLM calls for common career queries
  - _Requirements: 1.5_

- [ ] 3.2 Final speed test
  - Verify response times are <3s for cached queries
  - Test with realistic user queries
  - _Requirements: 1.1_

- [ ] 3.3 Push to GitHub and document
  - Create simple README.md with setup instructions
  - Push all changes to GitHub repository
  - _Requirements: Documentation_