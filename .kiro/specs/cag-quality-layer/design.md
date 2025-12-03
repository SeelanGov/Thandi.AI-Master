# CAG Quality Layer - Design Document

## Overview

The CAG (Critic-Auditor-Governance) Layer is a quality assurance system that validates LLM-generated career guidance before delivery to students. It sits between the RAG generation step and final answer delivery, ensuring all content is factually accurate, properly sourced, and compliant with South African educational standards and Thandi.ai policies.

**Key Design Principles:**
- Model-agnostic: Works with any LLM (GPT, Claude, Groq, Llama)
- Hybrid approach: Combines rule-based checks with LLM verification
- Fast: Sub-2-second processing target
- Fail-safe: Falls back to RAG draft if verification fails
- Transparent: Logs all decisions and modifications

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    THANDI.AI PIPELINE                       │
└─────────────────────────────────────────────────────────────┘

Student Query
     ↓
[1] RAG Retrieval (Supabase Vector Search)
     ├─ Retrieve relevant knowledge chunks
     ├─ Career matching
     └─ Pathway information
     ↓
[2] Draft Generation (LLM: GPT/Groq/Claude)
     ├─ Generate personalized report
     ├─ Format career recommendations
     └─ Add contextual guidance
     ↓
[3] CAG QUALITY LAYER ← THIS DESIGN
     ├─ Critic: Validate accuracy
     ├─ Auditor: Check sources
     └─ Governance: Enforce policies
     ↓
[4] Final Answer Delivery
     └─ Send to student (Web/WhatsApp/App)
```

### CAG Layer Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CAG QUALITY LAYER                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  INPUT: {draftAnswer, ragChunks, studentProfile, rules}     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  STAGE 1: RULE-BASED CHECKS (Fast, Deterministic)     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  • Regex validation (URLs, dates, numbers)            │ │
│  │  • Entity verification (institutions, careers)        │ │
│  │  • Policy rule application (from rules/ directory)    │ │
│  │  • Structural validation (required sections present)  │ │
│  │                                                        │ │
│  │  Result: PASS / FAIL / NEEDS_REVIEW                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  STAGE 2: LLM VERIFICATION (Semantic, Contextual)     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  • Source grounding check                             │ │
│  │  • Hallucination detection                            │ │
│  │  • Logical consistency validation                     │ │
│  │  • Tone and appropriateness review                    │ │
│  │                                                        │ │
│  │  Model: GPT-4o-mini / Groq Llama 3.1 (configurable)  │ │
│  │  Result: APPROVED / REVISED / REJECTED                │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  STAGE 3: DECISION & LOGGING                          │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  • Combine results from both stages                   │ │
│  │  • Apply revision if needed                           │ │
│  │  • Log decision and metadata                          │ │
│  │  • Return final answer or fallback                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  OUTPUT: {finalAnswer, metadata, decision}                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. CAGLayer (Main Orchestrator)

**Purpose:** Coordinates the entire verification process

**Interface:**
```javascript
class CAGLayer {
  /**
   * Verify and approve LLM-generated answer
   * @param {Object} input - Verification input
   * @param {string} input.draftAnswer - LLM-generated draft
   * @param {Array} input.ragChunks - Retrieved knowledge chunks
   * @param {Object} input.studentProfile - Student context
   * @param {Object} input.options - Configuration options
   * @returns {Promise<Object>} - Verification result
   */
  async verify(input) {
    // Stage 1: Rule-based checks
    const ruleResult = await this.ruleChecker.check(input);
    
    // Stage 2: LLM verification (if needed)
    const llmResult = await this.llmVerifier.verify(input, ruleResult);
    
    // Stage 3: Decision
    return this.decisionMaker.decide(ruleResult, llmResult, input);
  }
}
```

**Output Format:**
```javascript
{
  success: true,
  decision: 'approved' | 'revised' | 'rejected' | 'fallback',
  finalAnswer: string,
  metadata: {
    processingTime: number,
    stagesCompleted: string[],
    issuesDetected: string[],
    revisionsApplied: string[],
    sourcesUsed: string[]
  }
}
```

### 2. RuleBasedChecker

**Purpose:** Fast, deterministic validation checks

**Checks Performed:**
1. **Entity Verification**
   - Institution names exist in database
   - Career titles match careers table
   - Qualification names are valid

2. **Data Validation**
   - Salary ranges are in Rands (R prefix)
   - Dates follow SA format
   - No hallucinated URLs

3. **Policy Rules**
   - Load rules from `rules/` directory
   - Apply math-hate-healthcare rule
   - Apply NSFAS-prioritization rule
   - Apply scope-boundary rule
   - Apply verification-mandate rule

4. **Structural Checks**
   - Required sections present
   - Verification warning included
   - No definitive prescriptions

**Interface:**
```javascript
class RuleBasedChecker {
  async check(input) {
    const results = {
      entityCheck: await this.verifyEntities(input.draftAnswer),
      dataCheck: await this.validateData(input.draftAnswer),
      policyCheck: await this.applyPolicies(input),
      structureCheck: await this.checkStructure(input.draftAnswer)
    };
    
    return {
      passed: this.allPassed(results),
      issues: this.extractIssues(results),
      confidence: this.calculateConfidence(results)
    };
  }
}
```

### 3. LLMVerifier

**Purpose:** Semantic validation using LLM

**Verification Prompt Template:**
```
You are the CAG (Critic-Auditor-Governance) verifier for Thandi.ai.

Your job is to verify that the draft answer is:
1. Factually accurate and grounded in the provided sources
2. Free from hallucinations
3. Compliant with South African educational standards
4. Appropriate in tone for school-age students

RETRIEVED SOURCES:
{ragChunks}

DRAFT ANSWER:
{draftAnswer}

STUDENT CONTEXT:
{studentProfile}

VERIFICATION TASKS:
1. Check every factual claim against the sources
2. Flag any information not present in sources
3. Verify SA-specific details (institutions, qualifications, salaries)
4. Confirm tone is encouraging and age-appropriate

RESPONSE FORMAT:
{
  "approved": boolean,
  "issues": [
    {
      "type": "hallucination" | "inaccuracy" | "tone" | "policy",
      "location": "specific text from draft",
      "problem": "description of issue",
      "correction": "suggested fix using sources"
    }
  ],
  "recommendation": "approve" | "revise" | "reject"
}

Return ONLY valid JSON.
```

**Interface:**
```javascript
class LLMVerifier {
  constructor(llmAdapter) {
    this.llm = llmAdapter; // Model-agnostic adapter
  }
  
  async verify(input, ruleResult) {
    // Skip if rule checks failed critically
    if (ruleResult.confidence < 0.3) {
      return { skipped: true, reason: 'rule_check_failed' };
    }
    
    const prompt = this.buildPrompt(input);
    const response = await this.llm.generateText(prompt, {
      maxTokens: 1000,
      temperature: 0.1, // Low temp for consistency
      responseFormat: 'json'
    });
    
    return this.parseResponse(response);
  }
}
```

### 4. DecisionMaker

**Purpose:** Combine results and make final decision

**Decision Logic:**
```javascript
class DecisionMaker {
  decide(ruleResult, llmResult, input) {
    // Critical failure → fallback to RAG draft
    if (ruleResult.confidence < 0.3 && llmResult.recommendation === 'reject') {
      return this.fallback(input, 'critical_failure');
    }
    
    // Minor issues → auto-revise
    if (llmResult.issues.length > 0 && llmResult.issues.length < 5) {
      return this.revise(input, llmResult.issues);
    }
    
    // All good → approve
    if (ruleResult.passed && llmResult.approved) {
      return this.approve(input.draftAnswer);
    }
    
    // Too many issues → fallback
    return this.fallback(input, 'too_many_issues');
  }
}
```

### 5. SourceGroundingValidator

**Purpose:** Verify claims match RAG sources

**Algorithm:**
```javascript
class SourceGroundingValidator {
  async validate(claim, ragChunks) {
    // Extract key facts from claim
    const facts = this.extractFacts(claim);
    
    // Check each fact against sources
    const groundingResults = facts.map(fact => {
      const matchingChunks = this.findMatchingChunks(fact, ragChunks);
      return {
        fact,
        grounded: matchingChunks.length > 0,
        sources: matchingChunks.map(c => c.id)
      };
    });
    
    return {
      fullyGrounded: groundingResults.every(r => r.grounded),
      partiallyGrounded: groundingResults.some(r => r.grounded),
      ungroundedFacts: groundingResults.filter(r => !r.grounded)
    };
  }
}
```

## Data Models

### CAGInput
```typescript
interface CAGInput {
  draftAnswer: string;           // LLM-generated draft
  ragChunks: RAGChunk[];         // Retrieved sources
  studentProfile: StudentProfile; // Student context
  options?: {
    skipLLMVerification?: boolean;
    strictMode?: boolean;
    llmModel?: string;
  };
}
```

### RAGChunk
```typescript
interface RAGChunk {
  id: string;
  chunk_text: string;
  chunk_metadata: {
    source: string;
    category: string;
    career?: string;
    institution?: string;
  };
  similarity: number;
}
```

### VerificationResult
```typescript
interface VerificationResult {
  success: boolean;
  decision: 'approved' | 'revised' | 'rejected' | 'fallback';
  finalAnswer: string;
  metadata: {
    processingTime: number;
    stagesCompleted: string[];
    issuesDetected: Issue[];
    revisionsApplied: Revision[];
    sourcesUsed: string[];
    llmModel?: string;
  };
}
```

### Issue
```typescript
interface Issue {
  type: 'hallucination' | 'inaccuracy' | 'tone' | 'policy' | 'structure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  problem: string;
  correction?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Source Grounding Completeness
*For any* approved answer, all factual claims about careers, institutions, qualifications, and salaries must have corresponding evidence in the retrieved RAG chunks.

**Validates: Requirements 2.1, 2.2, 6.1**

### Property 2: Hallucination Detection
*For any* draft answer containing institution names, career titles, or qualification names, the CAG Layer must verify these entities exist in the knowledge base before approval.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

### Property 3: Policy Rule Application
*For any* draft answer, all applicable rules from the rules directory must be loaded and applied before approval.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 4: SA Context Enforcement
*For any* approved answer containing educational pathways, the institutions and qualifications must reference South African entities using correct SAQA/NQF terminology.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 5: Verification Warning Inclusion
*For any* approved answer, the verification-mandate warning must be present in the final output.

**Validates: Requirements 7.5**

### Property 6: Fallback Safety
*For any* verification that fails critically, the system must return the RAG draft instead of the unverified LLM output.

**Validates: Requirements 8.5**

### Property 7: Processing Time Bound
*For any* verification request, the CAG Layer must complete within 2 seconds or trigger a timeout fallback.

**Validates: Requirements 9.1, 9.4**

### Property 8: Decision Determinism
*For any* identical input (draft + sources + profile), the CAG Layer must produce the same decision when using rule-based checks only.

**Validates: Requirements 8.1, 8.2**

## Error Handling

### Error Categories

1. **Rule Check Failures**
   - Missing entities → Flag for revision
   - Policy violations → Auto-correct or reject
   - Structural issues → Auto-fix if possible

2. **LLM Verification Failures**
   - LLM timeout → Skip LLM stage, use rule results
   - Invalid JSON response → Retry once, then skip
   - API error → Fall back to RAG draft

3. **Critical Failures**
   - Both stages fail → Return RAG draft
   - Timeout exceeded → Return RAG draft
   - Unknown error → Return RAG draft with error log

### Fallback Strategy

```javascript
async function handleFailure(input, error) {
  console.error('[CAG] Verification failed:', error);
  
  // Log failure for monitoring
  await logCAGFailure({
    error: error.message,
    input: sanitize(input),
    timestamp: new Date()
  });
  
  // Return safe fallback
  return {
    success: true, // Still successful from user perspective
    decision: 'fallback',
    finalAnswer: input.ragDraft, // Use RAG draft without LLM enhancement
    metadata: {
      fallbackReason: error.type,
      processingTime: Date.now() - input.startTime
    }
  };
}
```

## Testing Strategy

### Unit Tests

1. **RuleBasedChecker Tests**
   - Test entity verification with known/unknown entities
   - Test data validation with valid/invalid formats
   - Test policy rule loading and application
   - Test structural checks with complete/incomplete drafts

2. **LLMVerifier Tests**
   - Test prompt generation with various inputs
   - Test response parsing with valid/invalid JSON
   - Test timeout handling
   - Test model switching

3. **DecisionMaker Tests**
   - Test decision logic with all combinations of results
   - Test revision application
   - Test fallback triggers

4. **SourceGroundingValidator Tests**
   - Test fact extraction from claims
   - Test chunk matching with similar/dissimilar content
   - Test grounding score calculation

### Integration Tests

1. **End-to-End CAG Flow**
   - Test complete verification with approved answer
   - Test complete verification with revised answer
   - Test complete verification with rejected answer
   - Test fallback scenarios

2. **Rule Integration**
   - Test with math-hate-healthcare rule active
   - Test with NSFAS-prioritization rule active
   - Test with multiple rules active
   - Test with no rules (baseline)

3. **Performance Tests**
   - Test processing time under load
   - Test concurrent verifications
   - Test with large draft answers
   - Test with many RAG chunks

### Property-Based Tests

1. **Property 1 Test: Source Grounding**
   ```javascript
   // For any approved answer, verify all claims have sources
   fc.assert(
     fc.property(
       generateRandomDraft(),
       generateRandomRAGChunks(),
       async (draft, chunks) => {
         const result = await cagLayer.verify({ draft, chunks });
         if (result.decision === 'approved') {
           const claims = extractClaims(result.finalAnswer);
           return claims.every(claim => 
             hasMatchingSource(claim, chunks)
           );
         }
         return true; // Skip if not approved
       }
     )
   );
   ```

2. **Property 2 Test: Hallucination Detection**
   ```javascript
   // For any draft with fake entities, CAG must detect them
   fc.assert(
     fc.property(
       generateDraftWithFakeEntities(),
       generateValidRAGChunks(),
       async (draft, chunks) => {
         const result = await cagLayer.verify({ draft, chunks });
         return result.decision !== 'approved' || 
                result.metadata.issuesDetected.some(i => 
                  i.type === 'hallucination'
                );
       }
     )
   );
   ```

3. **Property 3 Test: Processing Time**
   ```javascript
   // For any input, CAG must complete within 2 seconds
   fc.assert(
     fc.property(
       generateRandomInput(),
       async (input) => {
         const start = Date.now();
         await cagLayer.verify(input);
         const duration = Date.now() - start;
         return duration < 2000;
       }
     )
   );
   ```

## Performance Considerations

### Optimization Strategies

1. **Parallel Execution**
   - Run rule checks in parallel where possible
   - Cache entity lookups
   - Batch database queries

2. **Smart LLM Usage**
   - Skip LLM verification if rule checks are highly confident
   - Use faster models (GPT-4o-mini, Groq) for verification
   - Cache verification results for similar drafts

3. **Early Termination**
   - Stop processing on critical failures
   - Skip remaining checks if confidence is very high
   - Timeout after 2 seconds

### Performance Targets

- Rule-based checks: < 200ms
- LLM verification: < 1500ms
- Total processing: < 2000ms
- Fallback decision: < 50ms

## Integration Points

### 1. Integration with RAG Pipeline

**Current Flow:**
```javascript
// app/api/rag/query/route.js
const reportData = await generatePersonalizedReport(profile);
const draftReport = formatReportAsText(reportData, gate);

// Enhancement with LLM
const result = await guardedClient.execute(
  async () => provider.generateText(prompt),
  { fallback: draftReport }
);
```

**New Flow with CAG:**
```javascript
// app/api/rag/query/route.js
const reportData = await generatePersonalizedReport(profile);
const draftReport = formatReportAsText(reportData, gate);

// Enhancement with LLM
const llmResult = await guardedClient.execute(
  async () => provider.generateText(prompt),
  { fallback: draftReport }
);

// CAG VERIFICATION (NEW)
const cagResult = await cagLayer.verify({
  draftAnswer: llmResult.data,
  ragChunks: reportData.chunksUsed,
  studentProfile: profile,
  ragDraft: draftReport // Fallback
});

return cagResult.finalAnswer;
```

### 2. Integration with Rules System

```javascript
// Load rules from rules/ directory
const rules = await loadRules([
  'rules/thandi-math-hate-healthcare.md',
  'rules/thandi-nsfas-prioritization.md',
  'rules/thandi-scope-boundary.md',
  'rules/thandi-verification-mandate.md',
  'rules/thandi-dangerous-queries.md'
]);

// Apply rules during verification
const policyResult = await applyRules(draftAnswer, studentProfile, rules);
```

### 3. Integration with Monitoring

```javascript
// Log CAG decisions for analysis
await logCAGDecision({
  sessionId: session.id,
  decision: result.decision,
  processingTime: result.metadata.processingTime,
  issuesDetected: result.metadata.issuesDetected.length,
  llmModel: result.metadata.llmModel,
  timestamp: new Date()
});
```

## Deployment Considerations

### Configuration

```javascript
// config/cag.config.js
export const CAGConfig = {
  // LLM settings
  llmModel: process.env.CAG_LLM_MODEL || 'gpt-4o-mini',
  llmProvider: process.env.CAG_LLM_PROVIDER || 'openai',
  llmTimeout: 1500, // ms
  
  // Processing settings
  maxProcessingTime: 2000, // ms
  skipLLMIfRuleConfidence: 0.95, // Skip LLM if rules are very confident
  
  // Strictness
  strictMode: process.env.CAG_STRICT_MODE === 'true',
  
  // Fallback
  enableFallback: true,
  fallbackToRAGDraft: true
};
```

### Environment Variables

```bash
# .env.local
CAG_LLM_MODEL=gpt-4o-mini
CAG_LLM_PROVIDER=openai
CAG_STRICT_MODE=false
CAG_ENABLE_LOGGING=true
```

### Monitoring Metrics

Track these metrics in production:
- CAG processing time (p50, p95, p99)
- Decision distribution (approved/revised/rejected/fallback)
- Issue detection rate by type
- LLM verification skip rate
- Fallback trigger rate
- Rule check pass rate

## Security Considerations

1. **Input Sanitization**
   - Sanitize student profile before logging
   - Remove PII from error logs
   - Validate RAG chunk structure

2. **LLM Safety**
   - Use guarded client for LLM calls
   - Validate JSON responses
   - Timeout protection

3. **Data Privacy**
   - Don't log student names or personal details
   - Sanitize before external LLM calls
   - Comply with POPIA requirements

## Future Enhancements

1. **Adaptive Verification**
   - Learn from user feedback
   - Adjust confidence thresholds
   - Improve rule weights

2. **Multi-Model Verification**
   - Use multiple LLMs for critical checks
   - Consensus-based decisions
   - Model voting

3. **Real-Time Learning**
   - Track which issues are most common
   - Auto-generate new rules
   - Improve prompts based on failures

4. **Advanced Grounding**
   - Semantic similarity scoring
   - Citation generation
   - Source attribution in output

---

## Summary

The CAG Quality Layer provides a robust, model-agnostic verification system that ensures all career guidance is accurate, properly sourced, and compliant with South African standards. By combining fast rule-based checks with semantic LLM verification, it achieves both speed and accuracy while maintaining a safe fallback strategy.

**Key Benefits:**
- Prevents hallucinations from reaching students
- Ensures SA-specific accuracy
- Enforces policy compliance automatically
- Fast processing (sub-2-second target)
- Model-agnostic and extensible
