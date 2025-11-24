# Knowledge Base Remediation - Design Document

## Overview

This design document outlines the architecture and implementation strategy for remediating Thandi's knowledge base to achieve a 70-80% test pass rate. The remediation follows a phased approach, with Sprint 1.1 focusing on Decision-Making Frameworks as the highest-impact, quickest-win module.

## Architecture

### Knowledge Base Structure

```
thandi_knowledge_base/
├── decision_making_framework/          # NEW - Sprint 1.1
│   ├── README.md                       # Module documentation
│   ├── decision_making.json            # Structured chunk data
│   ├── decision_making.html            # Formatted content
│   └── sources.md                      # Research citations
├── career_misconceptions_framework/    # NEW - Sprint 1.2
├── 4ir_careers_framework/              # NEW - Sprint 2.1
├── financial_planning_expanded/        # EXPANDED - Sprint 2.2
├── subject_career_matching/            # EXPANDED - Sprint 2.3
└── [existing modules...]               # UNCHANGED
```

### Content Chunk Schema

Each knowledge chunk follows this standardized structure:

```json
{
  "chunk_id": "dm_chunk_01_career_choice_matrix",
  "module": "decision_making_framework",
  "title": "The Career Choice Matrix: How to Score Your Options",
  "content": {
    "question_misconception": "I'm stuck between two career paths...",
    "reality": "Choosing a career is not a single, irreversible decision...",
    "practical_examples": [
      {
        "scenario": "Teaching vs Engineering comparison",
        "matrix": {
          "factors": ["Interest", "Ability", "Security", "Salary", "Affordability"],
          "weights": [3, 3, 2, 2, 2],
          "career_a_scores": [9, 8, 8, 5, 10],
          "career_b_scores": [6, 7, 10, 9, 7],
          "totals": [91, 83]
        }
      }
    ],
    "action_steps": [
      "Calculate Your V.I.S. Score using the matrix",
      "Move to Chunk 2 to understand weight factors",
      "Cross-reference with financial reality"
    ],
    "sources": [
      "Career development theory (Super, 1990)",
      "V.I.S. Model research citations"
    ]
  },
  "tags": ["decision_making", "career_choice", "vis_model", "matrix"],
  "related_chunks": ["dm_chunk_02", "dm_chunk_03", "dm_chunk_08"],
  "target_questions": ["Q19", "Q20"],
  "sa_specific": true,
  "created_at": "2024-11-10",
  "version": "1.0"
}
```

## Components and Interfaces

### 1. Content Generation Pipeline

```
Research Sources → Content Template → Structured JSON → HTML Format → Embedding Generation → Supabase Upload
```

**Input**: 15 chunk specifications (provided in requirements)
**Output**: 15 JSON files + 15 HTML files + embeddings in Supabase

### 2. Chunk Template System

Each chunk uses a 5-section template:

```markdown
## [Title]

### The Question/Misconception
[Student's actual question or common misconception]

### The Reality
[Evidence-based answer with V.I.S. Model integration]

### Practical Examples
[2-3 SA-specific scenarios with numbers, matrices, or comparisons]

### Action Steps
[Numbered list of concrete next steps]

### Sources
[Research citations and data sources]
```

### 3. Cross-Module Integration

Decision-making chunks reference existing modules:

```
Decision-Making → NSFAS Framework (affordability assessment)
Decision-Making → TVET Framework (alternative pathways)
Decision-Making → Bursary Framework (funding options)
Decision-Making → University Framework (degree requirements)
```

### 4. RAG Retrieval Enhancement

**Current Retrieval Logic** (lib/rag/search.js):
```javascript
semanticSearch(embedding, { limit: 10, module: null })
```

**Enhanced for Decision-Making**:
```javascript
// Prioritize decision-making chunks for indecision queries
if (query.includes("stuck") || query.includes("choose") || query.includes("decide")) {
  priorityModules = ["decision_making_framework"];
}

// Multi-module retrieval for complex queries
if (query.includes("afford") && query.includes("choose")) {
  modules = ["decision_making_framework", "nsfas_framework", "financial_planning"];
}
```

## Data Models

### Knowledge Chunk Table (Existing)

```sql
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chunk_id TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_text TEXT NOT NULL,  -- For full-text search
  embedding vector(1536),       -- OpenAI ada-002 embedding
  tags TEXT[],
  related_chunks TEXT[],
  target_questions TEXT[],
  sa_specific BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chunks_module ON knowledge_chunks(module);
CREATE INDEX idx_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_chunks_tags ON knowledge_chunks USING GIN(tags);
```

### Decision-Making Specific Fields

```json
{
  "content": {
    "vis_components": {
      "values": ["financial_security", "work_life_balance"],
      "interests": ["problem_solving", "helping_people"],
      "skills": ["mathematics", "communication"]
    },
    "decision_framework": "career_choice_matrix",
    "scenario_type": "passion_vs_pay",
    "risk_level": "medium"
  }
}
```

## Error Handling

### Content Validation

```javascript
function validateChunk(chunk) {
  const required = [
    'chunk_id',
    'module',
    'title',
    'content.question_misconception',
    'content.reality',
    'content.practical_examples',
    'content.action_steps',
    'content.sources'
  ];
  
  for (const field of required) {
    if (!getNestedValue(chunk, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate SA-specific content
  if (chunk.sa_specific) {
    const hasZAR = chunk.content_text.includes('R') || chunk.content_text.includes('ZAR');
    const hasSAInstitution = /UCT|Wits|Stellenbosch|NSFAS|TVET/.test(chunk.content_text);
    
    if (!hasZAR && !hasSAInstitution) {
      console.warn(`Chunk ${chunk.chunk_id} marked SA-specific but lacks SA references`);
    }
  }
  
  return true;
}
```

### Embedding Generation Failures

```javascript
async function generateEmbeddingsWithRetry(chunks, maxRetries = 3) {
  for (const chunk of chunks) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const embedding = await generateQueryEmbedding(chunk.content_text);
        chunk.embedding = embedding;
        break;
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          console.error(`Failed to generate embedding for ${chunk.chunk_id} after ${maxRetries} attempts`);
          // Store chunk without embedding for manual review
          chunk.embedding_failed = true;
        }
        await sleep(1000 * attempt); // Exponential backoff
      }
    }
  }
}
```

## Testing Strategy

### Unit Testing (Content Quality)

```javascript
describe('Decision-Making Chunks', () => {
  test('All 15 chunks have required sections', () => {
    const chunks = loadChunks('decision_making_framework');
    expect(chunks.length).toBe(15);
    
    chunks.forEach(chunk => {
      expect(chunk.content.question_misconception).toBeDefined();
      expect(chunk.content.reality).toBeDefined();
      expect(chunk.content.practical_examples.length).toBeGreaterThanOrEqual(2);
      expect(chunk.content.action_steps.length).toBeGreaterThanOrEqual(3);
      expect(chunk.content.sources.length).toBeGreaterThanOrEqual(1);
    });
  });
  
  test('Career Choice Matrix chunks include scoring data', () => {
    const matrixChunks = ['dm_chunk_01', 'dm_chunk_02', 'dm_chunk_03'];
    matrixChunks.forEach(id => {
      const chunk = getChunk(id);
      expect(chunk.content.practical_examples[0].matrix).toBeDefined();
      expect(chunk.content.practical_examples[0].matrix.factors).toHaveLength(5);
    });
  });
});
```

### Integration Testing (RAG Retrieval)

```javascript
describe('Decision-Making RAG Integration', () => {
  test('Q19 retrieves decision tree and matrix chunks', async () => {
    const query = "I'm stuck between two career paths. How do I choose?";
    const embedding = await generateQueryEmbedding(query);
    const chunks = await semanticSearch(embedding, { limit: 10 });
    
    const chunkIds = chunks.map(c => c.chunk_id);
    expect(chunkIds).toContain('dm_chunk_01'); // Career Choice Matrix
    expect(chunkIds).toContain('dm_chunk_09'); // Decision Tree
    expect(chunkIds).toContain('dm_chunk_11'); // Gut Check
  });
  
  test('Q20 retrieves passion vs pay framework chunks', async () => {
    const query = "Should I study what I love or what pays well?";
    const embedding = await generateQueryEmbedding(query);
    const chunks = await semanticSearch(embedding, { limit: 10 });
    
    const chunkIds = chunks.map(c => c.chunk_id);
    expect(chunkIds).toContain('dm_chunk_04'); // 4 Scenarios
    expect(chunkIds).toContain('dm_chunk_05'); // Financial Security
    expect(chunkIds).toContain('dm_chunk_07'); // Long-term Goals
  });
});
```

### End-to-End Testing (Test Suite)

```bash
# Run test suite on Q19 and Q20 after Sprint 1.1
npm run test:rag:suite -- --questions Q19,Q20

# Expected output:
# Q19: PASS (85% key points covered)
# Q20: PASS (82% key points covered)
```

## Implementation Phases

### Phase 1: Content Creation (Days 1-3)

1. **Day 1**: Create chunks 1-5 (Career Choice Matrix + Passion vs Pay intro)
2. **Day 2**: Create chunks 6-10 (Passion vs Pay scenarios + Decision tools)
3. **Day 3**: Create chunks 11-15 (Career change + Foundational concepts)

### Phase 2: Technical Integration (Day 4)

1. Generate embeddings for all 15 chunks
2. Upload to Supabase knowledge_chunks table
3. Verify pgvector indexing
4. Test semantic search retrieval

### Phase 3: Validation (Day 5)

1. Run test suite on Q19 and Q20
2. Analyze failure points if pass rate < 100%
3. Revise chunks based on failure analysis
4. Re-run test suite
5. Document results and lessons learned

## Performance Considerations

### Embedding Generation Cost

```
15 chunks × ~500 tokens/chunk = 7,500 tokens
7,500 tokens × $0.0001/1K tokens = $0.00075 (~R0.01)
```

### Retrieval Performance

```
Query: "I'm stuck between two career paths"
├─ Embedding generation: ~200ms
├─ Semantic search (pgvector): ~50ms
├─ Context assembly: ~100ms
└─ Total retrieval: ~350ms (well under 2s target)
```

### Storage Impact

```
15 chunks × 2KB/chunk = 30KB
30KB / 500MB free tier = 0.006% of quota
```

## Security Considerations

- All content is public-facing (no PII)
- No authentication required for knowledge base access
- Content versioning for audit trail
- Source citations for legal compliance

## Monitoring and Metrics

### Success Metrics

1. **Test Pass Rate**: Q19 and Q20 achieve 80%+ key point coverage
2. **Retrieval Accuracy**: Decision-making chunks appear in top 5 results for relevant queries
3. **Response Quality**: Generated responses include V.I.S. Model references
4. **Cost Efficiency**: Sprint 1.1 costs < R1.00 in API fees

### Logging

```javascript
// Log chunk retrieval for analysis
console.log({
  query: "I'm stuck between two career paths",
  retrieved_chunks: chunks.map(c => c.chunk_id),
  similarity_scores: chunks.map(c => c.similarity),
  response_includes_vis: response.includes('Values') && response.includes('Interests'),
  test_result: 'PASS'
});
```

## Future Enhancements (Post-Sprint 1.1)

- Interactive decision matrix calculator in frontend
- Personalized weight recommendations based on student profile
- Visual decision tree flowchart
- Career change success stories database
- Integration with student assessment results

## References

- Career development theory (Super, 1990)
- V.I.S. Model research
- South African career guidance frameworks
- DHET career counseling guidelines
- Test suite ideal answers (PRD/thandi_prd_and_test_suite.md)
