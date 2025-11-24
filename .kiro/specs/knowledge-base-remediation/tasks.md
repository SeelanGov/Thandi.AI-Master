# Knowledge Base Remediation - Implementation Tasks

## Sprint 1.1: Decision-Making Frameworks (Week 1, Days 1-5)

### Phase 1: Content Creation (Days 1-3)

- [x] 1. Create Career Choice Matrix chunks (Chunks 1-3)


  - Create chunk 1: Career Choice Matrix - How to Score Your Options
  - Create chunk 2: Career Choice Matrix - Setting Your Weights
  - Create chunk 3: Career Choice Matrix - Common Trade-Offs
  - Include weighted scoring matrix with 5 factors (Interest ×3, Ability ×3, Security ×2, Salary ×2, Affordability ×2)
  - Include 2-3 practical examples with SA-specific careers and salary data
  - _Requirements: Req 1.1, Req 2.2, Req 7.1_




- [ ] 2. Create Passion vs Pay Framework chunks (Chunks 4-7)
  - Create chunk 4: Passion vs Pay - The Four Scenarios
  - Create chunk 5: Passion vs Pay - Prioritizing Financial Security
  - Create chunk 6: Passion vs Pay - Learning to Love a Lucrative Career
  - Create chunk 7: Passion vs Pay - Aligning with Long-Term Goals


  - Define 4 scenario types: Dream Job, Safety Net, Gamble, Disaster
  - Include specific recommendations for financially constrained students
  - _Requirements: Req 1.1, Req 2.3, Req 7.2_

- [ ] 3. Create Decision Tools chunks (Chunks 8-11)
  - Create chunk 8: The 5 Must-Ask Career Test Questions
  - Create chunk 9: Decision Tree - Stuck Between Two Paths

  - Create chunk 10: Decision Tool - Job Shadowing and Informational Interviews
  - Create chunk 11: Decision Tool - The Gut Check Method
  - Include 4-step decision tree: Know Yourself (V.I.S.) → Know Options → Use Matrix → Test & Commit
  - Include informational interview scripts with 3 specific questions
  - _Requirements: Req 1.2, Req 3.2, Req 7.3-7.6_



- [ ] 4. Create Career Change Reality chunks (Chunks 12-13)
  - Create chunk 12: Career Change Reality - Normalizing Uncertainty
  - Create chunk 13: Career Change Reality - How to Pivot Successfully
  - Include SA-specific career pivot examples (e.g., Architect to UX Designer, TVET to University)
  - Include 3-step pivot strategy: Audit Assets → Target Gap → Start Side Hustle
  - _Requirements: Req 1.3, Req 3.3, Req 7.7_


- [ ] 5. Create Foundational Concepts chunks (Chunks 14-15)
  - Create chunk 14: Foundational Concept - The Whole Person
  - Create chunk 15: Tool - Risk Tolerance Assessment
  - Address family pressure, emotional distress, and holistic well-being
  - Include financial risk assessment questions and safety cushion recommendations



  - _Requirements: Req 1.4, Req 3.4, Req 7.8-7.9_

### Phase 2: Technical Integration (Day 4)

- [ ] 6. Set up knowledge base folder structure
  - Create directory `thandi_knowledge_base/decision_making_framework/`
  - Create README.md documenting chunk purposes and cross-references
  - Create sources.md with research citations
  - _Requirements: Req 6.1, Req 6.4_



- [ ] 7. Convert content to structured JSON format
  - Convert all 15 chunks to JSON schema with chunk_id, module, title, content, tags, related_chunks
  - Validate each chunk has all 5 required sections (Question, Reality, Examples, Actions, Sources)
  - Assign unique chunk IDs (dm_chunk_01 through dm_chunk_15)
  - Add tags for semantic categorization (decision_making, vis_model, career_choice, etc.)

  - _Requirements: Req 2.1, Req 6.3, Req 7_

- [ ] 8. Generate HTML formatted versions
  - Create decision_making.html with all 15 chunks in formatted layout
  - Ensure readability for manual review and debugging
  - Include navigation links between related chunks
  - _Requirements: Req 6.2_



- [ ] 9. Generate embeddings for all chunks
  - Use OpenAI ada-002 to generate 1536-dimensional embeddings
  - Implement retry logic with exponential backoff for API failures
  - Log embedding generation costs (target: < R0.01)
  - Validate embedding dimensions and format
  - _Requirements: Req 4.5, Req 8.4_

- [ ] 10. Upload chunks to Supabase
  - Insert all 15 chunks into knowledge_chunks table
  - Verify pgvector indexing on embedding column
  - Test semantic search retrieval for sample queries
  - Validate cross-module references work correctly
  - _Requirements: Req 4.1, Req 4.4_

### Phase 3: Validation and Testing (Day 5)

- [ ] 11. Run test suite on Q19 (decision-making)
  - Execute: `npm run test:rag:suite -- --questions Q19`
  - Verify response includes V.I.S. Model references
  - Verify response includes Career Choice Matrix or Decision Tree
  - Check key point coverage (target: 80%+)
  - Log which chunks were retrieved and their similarity scores
  - _Requirements: Req 5.1, Req 5.2, Req 5.4_

- [ ] 12. Run test suite on Q20 (passion vs pay)
  - Execute: `npm run test:rag:suite -- --questions Q20`
  - Verify response includes Passion vs Pay framework
  - Verify response addresses financial security considerations
  - Check key point coverage (target: 80%+)
  - Log which chunks were retrieved and their similarity scores
  - _Requirements: Req 5.1, Req 5.2, Req 5.4_

- [ ] 13. Analyze test results and revise if needed
  - If Q19 or Q20 fails, analyze which key points were missed
  - Identify which chunks should have been retrieved but weren't
  - Revise chunk content to improve semantic matching
  - Re-generate embeddings for revised chunks
  - Re-run test suite until 2/2 pass rate achieved
  - _Requirements: Req 5.3, Req 5.5_

- [ ] 14. Run full test suite to measure overall improvement
  - Execute: `npm run test:rag:suite` (all 20 questions)
  - Verify overall pass rate increased from 15% (3/20) to at least 25% (5/20)
  - Document which additional questions improved (likely Q1, Q3, Q5 due to decision-making overlap)
  - Generate test report with before/after comparison
  - _Requirements: Req 8.2_

- [ ] 15. Document Sprint 1.1 results and lessons learned
  - Create Sprint 1.1 completion report with metrics
  - Document which content patterns worked best for retrieval
  - Document any unexpected test improvements or failures
  - Identify optimizations for Sprint 1.2 (Career Misconceptions)
  - Update knowledge base README with Sprint 1.1 summary
  - _Requirements: Req 8.5_

## Success Criteria

Sprint 1.1 is complete when:
- ✅ All 15 decision-making framework chunks created and validated
- ✅ All chunks uploaded to Supabase with embeddings
- ✅ Q19 and Q20 achieve 80%+ key point coverage (2/2 pass rate)
- ✅ Overall test pass rate increases to at least 25% (5/20)
- ✅ Total cost < R1.00 in API fees
- ✅ Documentation updated with Sprint 1.1 results

## Next Steps (Sprint 1.2)

After Sprint 1.1 completion:
- Sprint 1.2: Career Misconceptions Framework (20 chunks, Days 6-10)
- Target: Q11-Q15 achieve 3-4/5 pass rate
- Target: Overall pass rate increases to 40-50% (8-10/20)
