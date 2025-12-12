# Rule #4: NSFAS Prioritization (The "Show Me the Money" Rule)

## Purpose
Protect low-income students by prioritizing affordable pathways and showing concrete bursary opportunities early.

## The Rule
**When student indicates financial constraints (`constraints.money === 'low'`), prioritize careers with bursary programs and show specific funding amounts.**

## Triggers
Student indicates financial constraints through:
- "I can't afford university"
- "My family has limited money"
- Selects "low" or "limited" in money constraint question
- Mentions NSFAS or bursaries in open questions

## What This Rule Does

### 1. Reorders Recommendations
Prioritize careers in this order:
1. **Careers with active bursary programs** (Sasol, Eskom, mining companies)
2. **NSFAS-funded pathways** (public universities, TVET colleges)
3. **Free training options** (learnerships, apprenticeships, SETAs)

### 2. Shows Money Early
For each recommendation, include in the FIRST paragraph:
- Specific bursary names and providers
- Exact amounts (R120,000/year, not "full funding")
- Total value over 3 years
- Application deadlines (May 30, 2027, not "early in year")

### 3. Provides NSFAS Guidance
- Explain NSFAS eligibility criteria
- Show application timeline
- Mention household income thresholds
- Link to NSFAS website

### 4. Highlights Free Alternatives
- TVET colleges vs private colleges (cost comparison)
- Learnerships (earn while you learn)
- Apprenticeships (paid training)
- Online courses (free certifications)

---

## Implementation

### In RAG System Prompt

```javascript
// lib/rag/generation.js

if (studentProfile.constraints.money === 'low') {
  systemPrompt += `
  
  🚨 CRITICAL: This student has financial constraints.
  
  PRIORITIZE IN THIS ORDER:
  1. Careers with active bursary programs
  2. NSFAS-funded pathways (public universities, TVET)
  3. Free training options (learnerships, apprenticeships)
  
  FOR EACH RECOMMENDATION, INCLUDE:
  - Specific bursary name and provider
  - Exact amount (R120,000/year, not "full funding")
  - Application deadline (May 30, 2027, not "early in year")
  - Total value over 3 years
  - NSFAS eligibility criteria
  - Free alternatives (TVET vs private college)
  
  SHOW THE MONEY EARLY:
  - Calculate total bursary value over 3 years
  - Show this in the first paragraph of each recommendation
  - Make it feel achievable, not aspirational
  
  EXAMPLE FORMAT:
  "Engineering (85% match)
  
  💰 Funding Available: R280,000+ over 3 years
  - Sasol Engineering Bursary: R120,000/year (apply by May 2027)
  - NSFAS: R80,000/year (apply by November 2027)
  - Eskom Bursary: R100,000/year (apply by August 2027)
  
  This career is AFFORDABLE for you with these bursaries..."
  `;
}
```

---

## Example Output

### For Low-Income Student Interested in Engineering

**Before Rule #4:**
> "Based on your interests in Math and problem-solving, consider Engineering. 
> You'll need to study at a university for 4 years. Entry requirements are 70%+ in Math and Physical Science."

**After Rule #4:**
> "**Engineering (85% match)**
> 
> 💰 **Funding Available: R280,000+ over 3 years**
> - Sasol Engineering Bursary: R120,000/year (covers tuition + R5K/month allowance)
> - NSFAS: R80,000/year (covers tuition + accommodation)
> - Eskom Bursary: R100,000/year (covers tuition + books)
> 
> **This career is AFFORDABLE for you.** With these bursaries, you can study Engineering without family financial stress.
> 
> **Application Timeline:**
> - May 2027: Apply for Sasol bursary (Grade 11 marks required)
> - August 2027: Apply for Eskom bursary
> - November 2027: Apply for NSFAS (household income <R350K/year)
> 
> **Requirements:**
> - Math 70%+ and Physical Science 70%+ by Grade 12
> - South African citizen
> - Household income <R600K/year (for most bursaries)
> 
> **Free Alternative if bursaries don't work:**
> - TVET Engineering diploma (R5K/year vs R60K/year at private college)
> - Apprenticeship programs (earn R3K/month while learning)"

---

## The "Show Me the Money" Moment

**For students with deep dive data (Q5: current marks), show this calculation:**

```
📊 Your Current Performance:
- Math: 55%
- Physics: 60%

🎯 For Engineering Bursaries:
- Need: Math 70%, Physics 70%
- Gap: 15 percentage points
- Timeline: 15 months to Grade 12

✅ Available Support:
- School tutoring
- Khan Academy (free)

📈 Estimated Improvement:
- With tutoring: +1% per month
- Reach 70% by Dec 2026: ACHIEVABLE

💰 Bursary Value When You Succeed:
- Sasol: R120,000/year × 4 years = R480,000
- NSFAS: R80,000/year × 4 years = R320,000
- Eskom: R100,000/year × 4 years = R400,000

Total Potential Value: R1.2 MILLION over 4 years

This is not a dream. This is achievable with your current marks + tutoring.
```

**This is the moment they realize:** "I can actually do this."

---

## Testing Checklist

Before shipping, verify:
- [ ] Low-income student sees bursary info in top 3 recommendations
- [ ] Bursary amounts are specific (R120K/year, not "full funding")
- [ ] Application deadlines are specific (May 30, not "early in year")
- [ ] Total value over 3 years is calculated
- [ ] NSFAS eligibility criteria mentioned
- [ ] Free alternatives provided (TVET, learnerships)
- [ ] "Show me the money" moment appears at Q5 (if deep dive)
- [ ] Tone is empowering, not patronizing

---

## Success Metric

**100% of low-income students see specific bursary information in their recommendations.**

If a low-income student completes the assessment and doesn't see bursary amounts and deadlines, Rule #4 has failed.

---

## Why This Rule Exists

### The Founder's Principle

> "The kid who needs NSFAS doesn't have time to wait for perfect."

Low-income students face unique barriers:
- Family pressure to work instead of study
- Belief that university is "not for people like us"
- Lack of information about bursaries
- Fear of debt

**Rule #4 removes the financial barrier from their mental model.**

When they see "R280,000+ available," they shift from "I can't afford this" to "How do I qualify?"

**That shift is everything.**

---

## Edge Cases

### What if student says "medium" financial constraints?
- Mention bursaries but don't prioritize them
- Show both funded and self-funded options
- Let them decide based on family situation

### What if no bursaries exist for their chosen career?
- Show NSFAS as fallback (covers most degrees)
- Highlight TVET alternatives (lower cost)
- Mention part-time work + study options

### What if they're interested in expensive private colleges?
- Show cost comparison (R60K/year private vs R5K/year TVET)
- Explain why public universities are better value
- Only recommend private if they have specific advantages

---

## Integration with Deep Dive

**If student completes deep dive (Q5: marks), enhance Rule #4:**

1. Calculate exact improvement needed for bursary eligibility
2. Show timeline (months to reach target marks)
3. Suggest specific resources based on Q6 (support system)
4. Make it feel achievable, not aspirational

**If student opts out of deep dive, still show bursaries but without personalized improvement plan.**

---

**Status:** ACTIVE - Implemented Day 1  
**Priority:** CRITICAL - Non-negotiable for shipping  
**Review:** After Friday friend test (Nov 29, 2025)

