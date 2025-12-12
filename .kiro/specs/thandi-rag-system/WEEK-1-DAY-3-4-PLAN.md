# Week 1 Day 3-4: RAG Retrieval System Implementation Plan

## 🎯 Goal
Build a working RAG (Retrieval-Augmented Generation) system that can:
1. Take a student's career question as input
2. Search the knowledge base for relevant information
3. Retrieve the most relevant chunks
4. Generate a personalized career recommendation using Groq LLM

## 📋 Prerequisites (Already Complete ✅)
- ✅ Database schema deployed
- ✅ Sample data loaded (10 universities, 10 bursaries, 10 careers, etc.)
- ✅ 88 knowledge chunks with embeddings generated
- ✅ pgvector extension enabled
- ✅ Groq API working (free tier)
- ✅ OpenAI API working (for embeddings)

## 🔨 What We'll Build

### Files to Create:
1. `lib/rag/embeddings.js` - Generate embeddings for queries
2. `lib/rag/search.js` - Vector search functions
3. `lib/rag/retrieval.js` - Context assembly and ranking
4. `lib/rag/generation.js` - LLM response generation
5. `app/api/rag/query/route.js` - API endpoint
6. `scripts/test-rag-query.js` - Test script for manual testing

### What We Won't Build (Yet):
- ❌ Frontend UI (Week 3-4)
- ❌ Student profile processing (Week 2)
- ❌ Full 20-question test suite (Week 2)
- ❌ PDF generation (Week 3-4)
- ❌ Admin dashboard (Week 3-4)

---

## 📝 Step-by-Step Implementation Plan

### **STEP 1: Query Embedding Generation** (30 minutes)
**File**: `lib/rag/embeddings.js`

**What it does**:
- Takes a text query (e.g., "I'm good at math but hate physics")
- Generates OpenAI ada-002 embedding (1536 dimensions)
- Returns the embedding vector

**Functions to create**:
```javascript
- generateQueryEmbedding(queryText) → returns embedding array
- batchGenerateEmbeddings(queries[]) → returns array of embeddings
```

**Why this step**:
- Converts user questions into the same vector space as knowledge chunks
- Required for semantic similarity search

**Testing**:
- Generate embedding for sample query
- Verify it returns 1536-dimensional array
- Check it completes in <2 seconds

---

### **STEP 2: Vector Search Implementation** (45 minutes)
**File**: `lib/rag/search.js`

**What it does**:
- Takes a query embedding
- Searches knowledge_chunks table using pgvector
- Returns top-k most similar chunks (default: 10)
- Supports filtering by module

**Functions to create**:
```javascript
- semanticSearch(embedding, options) → returns ranked chunks
- filterByModule(chunks, moduleNames[]) → filters chunks
- hybridSearch(embedding, keywords, options) → semantic + keyword search
```

**Search Strategy**:
1. Convert query to embedding
2. Use pgvector cosine similarity: `embedding <=> query_embedding`
3. Filter by module if specified (e.g., only search 'careers' module)
4. Return top 10 chunks with similarity scores

**Why this step**:
- Core retrieval mechanism for RAG
- Finds relevant knowledge based on semantic meaning, not just keywords

**Testing**:
- Search for "mathematics careers" → should return data scientist, actuarial science
- Search for "affordable university" → should return NSFAS, bursaries
- Verify results have similarity scores > 0.7

---

### **STEP 3: Context Assembly & Ranking** (30 minutes)
**File**: `lib/rag/retrieval.js`

**What it does**:
- Takes retrieved chunks
- Re-ranks by relevance
- Assembles into context for LLM
- Adds metadata (sources, tags)

**Functions to create**:
```javascript
- assembleContext(chunks, maxTokens) → returns formatted context string
- reRankChunks(chunks, query) → re-ranks by relevance
- deduplicateChunks(chunks) → removes similar/duplicate chunks
```

**Context Format**:
```
Retrieved Knowledge:

[Source: test_question_Q1]
Question: I'm good at math but hate physics. What should I study?
Answer: Consider Data Science, Actuarial Science, Computer Science...

[Source: career_data_scientist]
Career: Data Scientist
Description: Analyzes complex data using statistics and machine learning...
Salary: R25K-R45K entry level
Required: BSc Data Science, Mathematics (70%+)

[Source: bursary_fnb_tech]
Bursary: FNB Tech Talent Bursary
Amount: Full tuition + R4,500/month
Fields: Computer Science, Data Science
Deadline: 31 August 2026
```

**Why this step**:
- Organizes retrieved information for LLM
- Ensures context fits within token limits
- Provides source attribution

**Testing**:
- Assemble context from 10 chunks
- Verify it's under 3000 tokens
- Check sources are properly attributed

---

### **STEP 4: LLM Response Generation** (45 minutes)
**File**: `lib/rag/generation.js`

**What it does**:
- Takes assembled context + user query
- Sends to Groq LLM (free tier)
- Generates personalized career recommendation
- Falls back to OpenAI if Groq fails

**Functions to create**:
```javascript
- generateResponse(query, context, options) → returns AI response
- generateWithGroq(prompt) → uses Groq Llama 3.3 70B
- generateWithOpenAI(prompt) → fallback to GPT-3.5-turbo
```

**Prompt Template**:
```
You are Thandi, an AI career counselor for South African Grade 11-12 students.

Student Question: {query}

Retrieved Knowledge:
{context}

Instructions:
1. Answer the student's question using ONLY the retrieved knowledge
2. Provide 2-3 specific career options with SA universities and bursaries
3. Include salary ranges in ZAR (Rands)
4. Mention specific bursary deadlines if relevant
5. Keep response under 300 words
6. Be encouraging and practical

Response:
```

**Why this step**:
- Generates natural language responses
- Uses Groq (free) as primary LLM
- Ensures responses are grounded in retrieved knowledge

**Testing**:
- Generate response for "I'm good at math but hate physics"
- Verify it mentions Data Science, Actuarial Science
- Check it includes SA-specific info (universities, bursaries)
- Confirm response is under 300 words

---

### **STEP 5: API Endpoint** (30 minutes)
**File**: `app/api/rag/query/route.js`

**What it does**:
- Exposes RAG system as REST API
- Handles POST requests with query
- Returns AI-generated response

**Endpoint**:
```
POST /api/rag/query
Body: { "query": "I'm good at math but hate physics" }
Response: {
  "success": true,
  "query": "I'm good at math but hate physics",
  "response": "Great question! Consider these alternatives...",
  "sources": ["test_question_Q1", "career_data_scientist", "bursary_fnb_tech"],
  "processing_time_ms": 3500
}
```

**Why this step**:
- Makes RAG system accessible via HTTP
- Enables testing from any client
- Foundation for frontend integration

**Testing**:
- POST request with sample query
- Verify response in <10 seconds
- Check sources are included
- Test error handling (invalid query, LLM failure)

---

### **STEP 6: Test Script** (20 minutes)
**File**: `scripts/test-rag-query.js`

**What it does**:
- Command-line tool to test RAG system
- Runs sample queries
- Displays results with timing

**Usage**:
```bash
npm run test:rag "I'm good at math but hate physics"
```

**Output**:
```
🔍 Testing RAG Query...
Query: I'm good at math but hate physics

⏱️  Processing...
✓ Embedding generated (450ms)
✓ Retrieved 10 chunks (890ms)
✓ Generated response (2100ms)

📝 Response:
Great question! Many students think engineering is the only math-heavy career...
[Full response]

📚 Sources Used:
- test_question_Q1
- career_data_scientist
- career_actuarial_science
- bursary_fnb_tech

⏱️  Total Time: 3.44 seconds
```

**Why this step**:
- Easy manual testing without Postman
- Validates end-to-end pipeline
- Helps debug issues

---

## 🎯 Success Criteria

By end of Day 3-4, you should be able to:

✅ **Run a query**: `npm run test:rag "I'm good at math but hate physics"`
✅ **Get a response**: AI-generated career advice in <10 seconds
✅ **See sources**: Response references specific knowledge chunks
✅ **Verify accuracy**: Response mentions Data Science, Actuarial Science, Computer Science
✅ **Check SA context**: Response includes SA universities, bursaries, ZAR salaries
✅ **Test API**: `POST /api/rag/query` returns valid JSON response

---

## 📊 Implementation Order

### Day 3 (Today):
1. ✅ **STEP 1**: Query embedding generation (30 min)
2. ✅ **STEP 2**: Vector search implementation (45 min)
3. ✅ **STEP 3**: Context assembly (30 min)

**End of Day 3 Goal**: Can retrieve relevant chunks for any query

### Day 4 (Tomorrow):
4. ✅ **STEP 4**: LLM response generation (45 min)
5. ✅ **STEP 5**: API endpoint (30 min)
6. ✅ **STEP 6**: Test script (20 min)

**End of Day 4 Goal**: Working RAG system accessible via API

---

## 💰 Cost Estimate

**Day 3-4 Development**:
- Testing queries: ~20 test queries × $0.0001 = $0.002 (embeddings)
- LLM responses: ~20 test responses × $0 (Groq free tier)
- **Total**: ~R0.04 (less than 5 cents!)

**Week 1 Total So Far**:
- Day 1: R0 (database setup)
- Day 2: R0.16 (embeddings)
- Day 3-4: R0.04 (testing)
- **Total**: R0.20 (20 cents for entire Week 1!)

---

## 🚨 Risk Mitigation

### Risk 1: Groq Rate Limits
**Mitigation**: Implement exponential backoff + OpenAI fallback

### Risk 2: Poor Retrieval Quality
**Mitigation**: Start with top-10 chunks, adjust if needed. Add keyword filtering.

### Risk 3: Slow Response Times
**Mitigation**: Set 10-second timeout. Optimize chunk count if needed.

### Risk 4: Context Too Large
**Mitigation**: Limit to 3000 tokens (~10 chunks). Truncate if needed.

---

## 📝 Code Style Guidelines

1. **Use ES6 modules**: `import/export` syntax
2. **Error handling**: Try-catch blocks with meaningful errors
3. **Logging**: Console.log progress for debugging
4. **Comments**: Explain complex logic
5. **Type hints**: JSDoc comments for function parameters
6. **Async/await**: For all database and API calls

---

## 🧪 Testing Strategy

### Manual Testing (Day 3-4):
- Test 5-10 sample queries
- Verify responses are relevant
- Check response times
- Validate source attribution

### Automated Testing (Week 2):
- Run all 20 test questions
- Compare to ideal answers
- Calculate pass rate (target: 14/20)

---

## 📚 Dependencies (Already Installed)

- ✅ `openai` - For embeddings
- ✅ `groq-sdk` - For LLM responses
- ✅ `@supabase/supabase-js` - For database queries
- ✅ `dotenv` - For environment variables

No new dependencies needed!

---

## 🎓 Learning Outcomes

By completing Day 3-4, you'll have:
1. ✅ Built a production-ready RAG system
2. ✅ Implemented semantic search with pgvector
3. ✅ Integrated multiple LLMs (Groq + OpenAI)
4. ✅ Created a REST API for AI queries
5. ✅ Learned prompt engineering for career guidance

---

## ✅ APPROVED WITH MODIFICATIONS

### Critical Additions:

**STEP 7: 20-Question Test Suite** (CRITICAL - NON-NEGOTIABLE)
- File: `scripts/test-rag-suite.js`
- Runs all 20 test questions from database
- Compares RAG output to ideal answers using semantic similarity
- Scores based on key_points coverage (80%+ = pass)
- Generates report with pass rate by category
- **Target**: 10/20 pass rate by end of Day 4 (optimize to 14/20 in Week 2)

**MODIFICATION to STEP 3: Student Profile Classification**
- Add profile processor to context assembly
- Parse student constraints (academic, financial, interests)
- Prioritize relevant modules for retrieval
- Output: StudentProfile object with priorityModules

**MODIFICATION to STEP 4: Response Validation**
- Validate every response includes:
  - 3-5 career matches with percentages
  - Reasoning for each match
  - At least 1 bursary option (if financial need)
  - Salary ranges in ZAR
  - Specific next steps
- Retry with modified prompt if incomplete

**NOTED for Week 2: Offline Assessment Storage**
- localStorage for offline responses
- Sync to Supabase when online
- Not critical for Day 3-4

### Updated Success Criteria:
- ✅ RAG pipeline working end-to-end
- ✅ Student profile classification integrated
- ✅ Response validation enforced
- ✅ 20-question test suite runs and generates report
- ✅ **Target: 10/20 pass rate by end of Day 4**

---

## 🚀 Ready to Start?

Once you approve this plan, I'll:
1. Create `lib/rag/embeddings.js` (STEP 1)
2. Test it with a sample query
3. Move to STEP 2 (vector search)
4. Continue through all 6 steps
5. Provide progress updates after each step

**Estimated completion**: End of Day 4 (tomorrow)
**Deliverable**: Working RAG system with API endpoint

Do you approve this plan? Any changes or concerns?
