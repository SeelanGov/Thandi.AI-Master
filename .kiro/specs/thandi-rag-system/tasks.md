# Implementation Tasks - Sprint 1-2 (Weeks 1-2)

## Sprint Goal
Build and test the core RAG system with 5 priority knowledge modules. Achieve 14/20 test pass rate by end of Week 2.

## Week 1: Foundation & Database Setup

### Task 1.1: Project Setup & Environment Configuration
**Estimated Time**: 4 hours
**Priority**: Critical

**Subtasks**:
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Supabase project and configure environment variables
- [ ] Install dependencies: `@supabase/supabase-js`, `openai`, `@supabase/auth-helpers-nextjs`
- [ ] Configure Vercel deployment pipeline
- [ ] Set up environment variables for OpenAI API key and Supabase credentials

**Acceptance Criteria**:
- Project deploys successfully to Vercel
- Supabase connection established
- OpenAI API connection tested

### Task 1.2: Database Schema Implementation
**Estimated Time**: 6 hours
**Priority**: Critical

**Subtasks**:
- [ ] Enable pgvector extension in Supabase
- [ ] Create all tables from design schema
- [ ] Set up Row Level Security (RLS) policies for POPIA compliance
- [ ] Create database indexes for performance
- [ ] Test database connections and basic CRUD operations

**Acceptance Criteria**:
- All tables created successfully
- pgvector extension working
- RLS policies prevent cross-school data access
- Basic database operations tested

### Task 1.3: Knowledge Module Data Structure
**Estimated Time**: 8 hours
**Priority**: Critical

**Subtasks**:
- [ ] Define TypeScript interfaces for all 10 knowledge modules
- [ ] Create data ingestion scripts for priority modules (1, 2, 3, 6, 7)
- [ ] Parse existing knowledge base files into structured format
- [ ] Implement text chunking strategy (500 tokens, 50 overlap)
- [ ] Create embedding generation pipeline using OpenAI ada-002

**Priority Modules for Sprint 1-2**:
1. **SA Universities**: Parse university_framework data
2. **Bursaries**: Parse busary_scholarship_framework data  
3. **Careers Database**: Parse critical_skills_framework + future_trends_framework
4. **Subject-Career Mapping**: Extract from nsc_framework
5. **4IR/Emerging Jobs**: Parse future_trends_framework

**Acceptance Criteria**:
- 5 priority modules loaded into database
- Text chunks generated and embedded
- Structured data properly formatted
- Data validation scripts pass

### Task 1.4: Test Suite Infrastructure
**Estimated Time**: 6 hours
**Priority**: High

**Subtasks**:
- [ ] Extract 20 test questions from PRD into structured format
- [ ] Create test runner that can execute RAG pipeline
- [ ] Implement semantic similarity scoring for answer comparison
- [ ] Build test results tracking and reporting
- [ ] Create baseline test run (expect low scores initially)

**Test Question Structure**:
```typescript
interface TestQuestion {
  id: string; // 'Q1', 'Q2', etc.
  category: string; // 'subject_career_matching', 'financial_constraints', etc.
  question: string;
  idealAnswer: string;
  keyPoints: string[]; // For scoring
  requiredModules: string[]; // Which knowledge modules should be used
}
```

**Acceptance Criteria**:
- All 20 test questions loaded
- Test runner executes without errors
- Scoring mechanism implemented
- Baseline results recorded (likely 0-2/20 pass rate initially)

## Week 2: RAG Implementation & Testing

### Task 2.1: Student Profile Processing
**Estimated Time**: 8 hours
**Priority**: Critical

**Subtasks**:
- [ ] Create student profile extraction from assessment responses
- [ ] Implement profile classification logic (academic strengths, financial constraints, interests)
- [ ] Build query generation from student profile
- [ ] Create module prioritization based on student profile
- [ ] Test profile processing with sample assessment data

**Profile Classification Logic**:
```typescript
interface StudentProfile {
  academicStrengths: string[]; // ['mathematics', 'physical_science']
  financialConstraint: 'low' | 'medium' | 'high';
  interestAreas: string[]; // ['technology', 'problem_solving']
  careerAwareness: 'low' | 'medium' | 'high';
  priorityModules: string[]; // Which modules to search first
}
```

**Acceptance Criteria**:
- Profile extraction works for various assessment combinations
- Module prioritization logic implemented
- Query generation produces relevant search terms
- Unit tests pass for profile processing

### Task 2.2: Vector Search Implementation
**Estimated Time**: 10 hours
**Priority**: Critical

**Subtasks**:
- [ ] Implement semantic search using pgvector
- [ ] Create hybrid search (semantic + keyword matching)
- [ ] Build retrieval ranking and filtering
- [ ] Implement module-specific search strategies
- [ ] Optimize search performance for <10 second requirement

**Search Strategy**:
1. Generate embeddings for student profile queries
2. Search priority modules first (based on profile)
3. Retrieve top-3 chunks per priority module
4. Fallback search in remaining modules if needed
5. Re-rank results by relevance to student constraints

**Acceptance Criteria**:
- Semantic search returns relevant results
- Search completes within 3 seconds
- Results properly ranked by relevance
- Module prioritization working correctly

### Task 2.3: LLM Integration & Prompt Engineering
**Estimated Time**: 12 hours
**Priority**: Critical

**Subtasks**:
- [ ] Design system prompt for Thandi persona
- [ ] Implement context assembly from retrieved chunks
- [ ] Create structured output format for recommendations
- [ ] Build error handling and fallback mechanisms
- [ ] Optimize prompts for South African context

**System Prompt Template**:
```
You are Thandi, an AI career counselor for South African high school students. 
You provide practical, actionable career advice that considers:
- South African education system and universities
- Financial constraints and bursary opportunities  
- Local job market and salary expectations
- Cultural context and family expectations

Student Profile: {profile}
Retrieved Knowledge: {context}

Generate exactly 3-5 career recommendations that match this student's profile...
```

**Acceptance Criteria**:
- LLM generates structured recommendations
- Output format matches CareerRecommendation interface
- Error handling prevents API failures from breaking system
- Recommendations include SA-specific information

### Task 2.4: End-to-End RAG Pipeline
**Estimated Time**: 8 hours
**Priority**: Critical

**Subtasks**:
- [ ] Connect all RAG components into single pipeline
- [ ] Implement caching for repeated queries
- [ ] Add performance monitoring and logging
- [ ] Create API endpoints for RAG processing
- [ ] Test complete pipeline with sample data

**API Endpoints**:
```
POST /api/rag/process-assessment
- Input: Assessment responses
- Output: Student profile + recommendations

GET /api/rag/recommendations/:assessmentId  
- Input: Assessment ID
- Output: Cached recommendations

POST /api/test/run-question
- Input: Test question ID
- Output: RAG response + scoring
```

**Acceptance Criteria**:
- Complete pipeline processes assessment to recommendations
- API endpoints respond within 10 seconds
- Caching prevents duplicate processing
- Logging captures performance metrics

### Task 2.5: Test Suite Execution & Optimization
**Estimated Time**: 10 hours
**Priority**: High

**Subtasks**:
- [ ] Run all 20 test questions through RAG pipeline
- [ ] Analyze failing tests and identify knowledge gaps
- [ ] Optimize prompts and retrieval based on test results
- [ ] Add missing knowledge content for failing tests
- [ ] Iterate until 14/20 tests pass (70% pass rate)

**Test Categories & Target Pass Rates**:
- Subject-Career Matching (Q1-Q5): 4/5 pass required
- Financial Constraints (Q6-Q10): 3/5 pass required  
- Career Misconceptions (Q11-Q15): 3/5 pass required
- 4IR/Emerging Careers (Q16-Q18): 2/3 pass required
- Decision-Making Process (Q19-Q20): 2/2 pass required

**Optimization Strategy**:
1. Identify which knowledge modules are missing for failing tests
2. Add specific content chunks to address gaps
3. Refine prompts to better utilize retrieved context
4. Adjust retrieval parameters (number of chunks, similarity thresholds)
5. Re-run tests and measure improvement

**Acceptance Criteria**:
- 14/20 tests pass with 80%+ key points covered
- Test results documented with failure analysis
- Knowledge gaps identified and addressed
- Performance metrics within requirements (<10s generation)

## Sprint 1-2 Deliverables

### Week 1 Deliverables
- [ ] Working Supabase database with 5 priority knowledge modules
- [ ] Test suite infrastructure with all 20 questions loaded
- [ ] Basic RAG pipeline components (profile processing, search, LLM integration)
- [ ] Baseline test results (likely 0-5/20 pass rate)

### Week 2 Deliverables  
- [ ] Complete RAG pipeline processing assessments to recommendations
- [ ] 14/20 test questions passing (70% pass rate)
- [ ] API endpoints for assessment processing and recommendation retrieval
- [ ] Performance metrics showing <10 second generation time
- [ ] Documentation of knowledge gaps and optimization strategies

## Risk Mitigation

### High-Risk Items
1. **pgvector Performance**: If Supabase pgvector is too slow, fallback to Pinecone free tier
2. **OpenAI Rate Limits**: Implement exponential backoff and GPT-3.5-turbo fallback
3. **Test Pass Rate**: If <14/20 tests pass, prioritize adding missing knowledge content over optimization

### Contingency Plans
- **Vector DB Backup**: Pinecone free tier setup ready if pgvector fails
- **LLM Backup**: GPT-3.5-turbo prompts optimized for cost efficiency
- **Knowledge Gaps**: Manual content creation process for critical missing information

## Success Metrics

### Week 1 Success Criteria
- [ ] All 5 priority knowledge modules loaded (100%)
- [ ] Test infrastructure running all 20 questions (100%)
- [ ] Basic RAG components functional (100%)
- [ ] Database performance <3 seconds for queries (100%)

### Week 2 Success Criteria  
- [ ] 14/20 test questions passing (70% minimum)
- [ ] End-to-end processing <10 seconds (100%)
- [ ] API endpoints stable and documented (100%)
- [ ] Ready for Week 3-4 frontend integration (100%)

## Next Sprint Preview (Weeks 3-4)
- Student assessment interface (React mobile-first)
- Recommendation display and PDF generation
- Admin dashboard for counselors
- Integration testing with real student data