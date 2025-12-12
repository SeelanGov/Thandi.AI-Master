# Thandi Scope Boundary Rule

## The Hard Line: Pilot vs Future Product

### Pilot Scope (NOW - November 2025)
**Problem**: Grade 11/12 students asking "What should I study? What careers match my subjects?"

**Solution**: Career guidance with 110 knowledge chunks maximum
- 90 career chunks (TESTED, 87% accurate)
- 20 pathway chunks (CONTROLLED EXPERIMENT)

### Out of Scope for Pilot
**Problem**: Post-matric crisis management ("I didn't get into university, what now?")

**Timeline**: Phase 2 - March 2026 (after pilot feedback + funding)

---

## Knowledge Base Limits

### Current Approved Content (110 chunks max)

#### Core Career Content (90 chunks)
- 24 career profiles (tested, validated)
- Decision-making framework
- Career misconceptions framework
- Subject-to-career mapping

#### Pathway Experiment (20 chunks ONLY)
**Purpose**: Test if pathways improve accuracy or kill performance

**Strict Limits**:
- 5 universities (UCT, Wits, UP, Stellenbosch, UKZN)
- 5 TVET colleges (1 per major province)
- 5 private institutions (DHET-accredited only)
- 5 SETAs (with active learnerships: MERSETA, CATHSSETA, EWSETA, BANKSETA, MICT)

**Verification Required**:
- [ ] Institution still operating (2025 check)
- [ ] Entry requirements current (2025 data)
- [ ] Maps to existing career in our 90-chunk database
- [ ] Application link functional
- [ ] Contact information verified

### Forbidden Content (Until Phase 2)
❌ Comprehensive university database (24 institutions)  
❌ All TVET colleges (50 institutions)  
❌ Private training institutions (30 institutions)  
❌ Private universities (31 institutions)  
❌ All SETAs (21 institutions)  

**Total Forbidden**: 1,500+ untested chunks

---

## Performance Guardrails

### Non-Negotiable Metrics
- Query response time: **< 5 seconds**
- RAG accuracy: **> 85%**
- Upload/validation time: **< 30 minutes**

### If Metrics Fail with 110 Chunks
**Action**: Delete all 20 pathway chunks, ship with original 90

**No exceptions. No "just one more institution."**

---

## Thandi's Response to Out-of-Scope Queries

When students ask about content beyond the 110 chunks:

```
"I can provide guidance on [career name] and limited pathway information for major institutions. For comprehensive options and alternatives, please verify with your school's career counselor or visit the DHET website.

My focus is helping you understand careers and make informed decisions about your subjects and initial study choices."
```

### Examples:
**Student**: "I didn't get into university, what are my alternatives?"  
**Thandi**: "I can provide guidance on careers and limited pathway information. For comprehensive post-matric alternatives, please consult your school's career counselor."

**Student**: "Tell me about all the TVET colleges in Gauteng"  
**Thandi**: "I have information on selected major institutions. For a complete list of TVET colleges, visit www.dhet.gov.za or speak with your career counselor."

---

## Scope Creep Detection

### Red Flags (Automatic Rejection)
- "Let's add all the [institutions]..."
- "Students might need to know about..."
- "It would be helpful to include..."
- "Just a few more chunks for..."

### The Test
**Question**: "Is this solving the Grade 11/12 career guidance problem, or the post-matric crisis problem?"

If answer is "post-matric crisis" → **Phase 2, not pilot**

---

## Phase 2 Criteria (March 2026)

Pathways expansion ONLY happens if:
1. ✅ Pilot deployed to 3+ schools
2. ✅ 50+ students tested the system
3. ✅ Feedback explicitly requests "What if I don't get in?"
4. ✅ Funding secured from pilot revenue
5. ✅ Current 110-chunk system maintains >85% accuracy
6. ✅ Query time remains <5s

**No pilot feedback = No expansion**

---

## The Parent's Rule

> "If my son asks 'Should I do B.Compt?', the answer isn't 'Here's 5 TVET alternatives if you fail.'
> 
> The answer is: 'Here's what B.Compt actually involves. Here's how to know if you'll hate it. Here's how to verify with people doing it now.'
> 
> Build a pre-flight checklist, not a parachute."

### What This Means
Focus on:
- ✅ What the career/degree actually requires (motivation, skills, reality)
- ✅ How to verify fit (talk to people doing it, shadow, research)
- ✅ Decision ownership (how to pivot when it gets hard)

Not on:
- ❌ Comprehensive alternatives if you fail
- ❌ Every possible backup plan
- ❌ Post-failure crisis management

---

## Enforcement

### If Scope Creep Occurs
1. **Stop immediately**
2. **Delete unapproved content**
3. **Return to 110-chunk limit**
4. **Document what happened**
5. **Recommit to pilot scope**

### Approval Process for New Content
1. Write 1-page justification: "Why this solves the Grade 11/12 guidance problem"
2. Estimate chunk count impact
3. Predict performance impact
4. Get explicit approval
5. Add to controlled experiment (within 20-chunk pathway limit)

---

## Success Definition

**Pilot Success** = Students get accurate career guidance that helps them choose subjects and initial study paths confidently

**NOT** = Students have every possible backup plan mapped out

---

## Commit Message
"Scope boundary established: 110 chunks max (90 career + 20 pathway experiment). Phase 2 pathways deferred to March 2026 pending pilot feedback."

---

**Last Updated**: November 19, 2025  
**Status**: ACTIVE - NO EXCEPTIONS  
**Review Date**: After pilot deployment (January 2026)
