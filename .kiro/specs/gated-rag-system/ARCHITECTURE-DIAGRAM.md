# Architecture: Gated RAG System with Compliance

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT ASSESSMENT                        │
│  (Grade, Subjects, Marks, Interests, Budget, Location)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKER 2: CONSENT GATE                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Has user consented to external processing?               │   │
│  │ • Check externalProcessingConsent === true               │   │
│  │ • Verify consent < 90 days old                           │   │
│  │ • Log to audit trail                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────┬───────────────────┘
                 │                            │
          NO CONSENT                   CONSENT GIVEN
                 │                            │
                 ▼                            ▼
    ┌────────────────────────┐   ┌──────────────────────────────┐
    │  SKIP EXTERNAL AI      │   │ BLOCKER 1: POPIA SANITISER   │
    │  Return draft report   │   │  ┌────────────────────────┐  │
    │  (standard template)   │   │  │ Strip PII:             │  │
    └────────────────────────┘   │  │ • Remove name, ID, etc │  │
                                 │  │ • Generalise marks     │  │
                                 │  │ • Generalise location  │  │
                                 │  │ • Validate clean       │  │
                                 │  └────────────────────────┘  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │    LOAD ALL CAREERS (24)     │
                                 │  with metadata from database │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      RUN ELIGIBILITY GATES   │
                                 │  ┌────────────────────────┐  │
                                 │  │ Math Gate              │  │
                                 │  │ Science Gate           │  │
                                 │  │ APS Gate               │  │
                                 │  │ Budget Gate            │  │
                                 │  │ Deadline Gate          │  │
                                 │  └────────────────────────┘  │
                                 │  Result: 16 eligible careers │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │    RAG SEARCH (Hybrid)       │
                                 │  ┌────────────────────────┐  │
                                 │  │ Vector search          │  │
                                 │  │ + Keyword search       │  │
                                 │  │ + Intent extraction    │  │
                                 │  │ Only on eligible 16    │  │
                                 │  └────────────────────────┘  │
                                 │  Result: Top 5 matches       │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │   GENERATE DRAFT REPORT      │
                                 │  (Template-based, no AI)     │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ BLOCKER 4: LLM ADAPTER       │
                                 │  ┌────────────────────────┐  │
                                 │  │ Select provider:       │  │
                                 │  │ • Claude (default)     │  │
                                 │  │ • OpenAI (backup)      │  │
                                 │  │ • Mock (testing)       │  │
                                 │  └────────────────────────┘  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │ BLOCKER 3: GUARDED CLIENT    │
                                 │  ┌────────────────────────┐  │
                                 │  │ Enhance draft report   │  │
                                 │  │ • 5s timeout           │  │
                                 │  │ • 3000 token cap       │  │
                                 │  │ • Cost tracking        │  │
                                 │  │ • Fallback on failure  │  │
                                 │  └────────────────────────┘  │
                                 └──────────────┬───────────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │                       │
                                SUCCESS                 TIMEOUT/ERROR
                                    │                       │
                                    ▼                       ▼
                        ┌──────────────────┐   ┌──────────────────┐
                        │ ENHANCED REPORT  │   │  DRAFT REPORT    │
                        │ (AI-personalized)│   │  (fallback)      │
                        └──────────────────┘   └──────────────────┘
                                    │                       │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │    POST-CORRECTION           │
                                 │  ┌────────────────────────┐  │
                                 │  │ Fix misconceptions     │  │
                                 │  │ Add NSFAS info         │  │
                                 │  │ Add TVET alternatives  │  │
                                 │  └────────────────────────┘  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │    AUDIT & MONITORING        │
                                 │  ┌────────────────────────┐  │
                                 │  │ Log to popia_audit_log │  │
                                 │  │ Log to consent_log     │  │
                                 │  │ Track gate_metrics     │  │
                                 │  │ Track costs            │  │
                                 │  └────────────────────────┘  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      FINAL REPORT            │
                                 │  • Top 5 career matches      │
                                 │  • Personalized guidance     │
                                 │  • NSFAS/TVET info           │
                                 │  • Blocked careers explained │
                                 └──────────────────────────────┘
```

---

## Component Responsibilities

### Blocker 1: POPIA Sanitiser
**Input:** Student profile with PII  
**Output:** Sanitised profile (no PII)  
**Purpose:** Legal compliance (POPIA Act)

### Blocker 2: Consent Gate
**Input:** Session with consent status  
**Output:** Allow/block external processing  
**Purpose:** Legal compliance (explicit consent)

### Blocker 3: Guarded Client
**Input:** LLM API call  
**Output:** Response or timeout fallback  
**Purpose:** Demo reliability + cost control

### Blocker 4: LLM Adapter
**Input:** Provider name (claude/openai/mock)  
**Output:** Vendor-agnostic LLM interface  
**Purpose:** Prevent vendor lock-in

---

## Data Flow Example

### Scenario: Grade 11 Math Lit Student

```
INPUT:
{
  name: "Thabo Mokoena",
  grade: 11,
  mathType: "Math Literacy",
  subjects: ["Math Literacy", "Life Sciences", "English"],
  marks: { mathLit: 67, lifeSci: 72, english: 65 },
  location: "Johannesburg",
  interests: "I want to help people and work in healthcare"
}

↓ CONSENT GATE
✓ Consent given, proceed

↓ POPIA SANITISER
{
  grade: 11,
  mathType: "Math Literacy",
  subjects: ["Math Literacy", "Life Sciences", "English"],
  marks: { mathLit: 65, lifeSci: 70, english: 65 },  // Generalised
  province: "Gauteng",  // Generalised
  interests: "I want to help people and work in healthcare"
  // name, location REMOVED
}

↓ ELIGIBILITY GATES
24 careers → 16 eligible
Blocked: Medicine (needs Pure Math), Engineering (needs Pure Math)
Eligible: Nursing, Occupational Therapy, Social Work, etc.

↓ RAG SEARCH
Top 5 matches:
1. Nursing (0.89 similarity)
2. Occupational Therapy (0.85)
3. Social Work (0.82)
4. Paramedic (0.78)
5. Pharmacy Assistant (0.75)

↓ DRAFT REPORT
Template-based report with top 5 careers

↓ LLM ADAPTER (Claude)
↓ GUARDED CLIENT (5s timeout, 3000 tokens)
Enhanced report with personalized guidance

↓ POST-CORRECTION
• Add NSFAS info for Nursing
• Add TVET alternative (Nursing Assistant)
• Explain why Medicine blocked

↓ AUDIT
• Log PII sanitisation
• Log consent
• Track costs (R2.30)

OUTPUT:
{
  report: "Based on your interests in healthcare...",
  recommendations: [
    { name: "Nursing", match: 0.89, nsfas: true },
    { name: "Occupational Therapy", match: 0.85, nsfas: true },
    ...
  ],
  blockedCareers: [
    { name: "Medicine", reason: "Requires Pure Mathematics" }
  ],
  cost: 2.30,
  enhanced: true
}
```

---

## Error Handling

### No Consent Given
```
INPUT → CONSENT GATE → ❌ No consent
                     ↓
              SKIP EXTERNAL AI
                     ↓
              DRAFT REPORT ONLY
```

### API Timeout
```
INPUT → ... → GUARDED CLIENT → ⏱️ Timeout after 5s
                             ↓
                      FALLBACK TO DRAFT
                             ↓
                      DRAFT REPORT
```

### Invalid PII Detected
```
INPUT → POPIA SANITISER → ❌ Validation failed
                        ↓
                 THROW ERROR
                        ↓
                 BLOCK REQUEST
```

---

## Monitoring Points

1. **Consent Rate:** % of users who consent
2. **Sanitisation Rate:** % of profiles with PII detected
3. **Timeout Rate:** % of requests that timeout
4. **Cost per Student:** Average LLM cost
5. **Gate Block Rate:** % of careers blocked per gate
6. **Enhancement Success:** % of reports enhanced vs draft

---

## Database Tables

### popia_audit_log
```sql
id, session_id, pii_detected, sanitised_at, retention_until
```

### consent_log
```sql
id, session_id, consent_given, consent_text, timestamp, expires_at
```

### gate_metrics
```sql
id, session_id, careers_blocked, math_gate_blocked, science_gate_blocked, 
aps_gate_blocked, budget_gate_blocked, deadline_gate_blocked, created_at
```

---

## Environment Variables

```bash
# LLM Provider
LLM_PROVIDER=claude  # or openai, mock

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Timeouts
LLM_TIMEOUT=5000  # 5 seconds
MAX_TOKENS=3000   # Token cap
```

---

## Testing Strategy

### Unit Tests
- Each blocker tested independently
- Mock external dependencies
- Test edge cases

### Integration Tests
- All 4 blockers together
- Real database connections
- Mock LLM provider

### E2E Tests
- Complete user flow
- Real assessment submission
- Verify audit trail

---

**See Also:**
- `INTEGRATION-GUIDE.md` - Step-by-step integration
- `QUICK-REFERENCE.md` - Code examples
- `TUESDAY-CHECKLIST.md` - Next steps

