# THANDI.AI Teacher Training Guide

**Version:** 1.0 (Pilot)  
**Date:** November 2025  
**System Grade:** B+ (87% accuracy)

---

## What THANDI.AI Does Well (87% of queries)

### ✅ Handles These Queries Perfectly:

1. **Simple Career Exploration**
   - "Tell me about becoming a software engineer"
   - "What does a chef earn in South Africa?"
   - "How do I become a pharmacist?"

2. **Educational Constraints**
   - "I don't have matric, what can I do?"
   - "I don't want to go to university but need good money"
   - "What careers can I do with a diploma?"

3. **Subject-Based Guidance**
   - "I'm good at math and physics, what careers?"
   - "I love biology but hate chemistry"
   - "I want tech but I'm not good at math"

4. **Work Format Preferences**
   - "I want to work from home and earn dollars"
   - "What careers let me start earning quickly?"
   - "I want hands-on practical work"

5. **Conflicting Goals**
   - "I want fast money but also want to study 10 years"
   - System will present BOTH paths with tradeoffs

---

## System Limitations (13% of queries)

### ⚠️ May Need Teacher Review:

1. **Very Complex Multi-Constraint Queries**
   - Example: "I hate math, love biology, want remote work, need fast money, but also want to specialize for 10 years"
   - **Why:** Too many competing constraints
   - **Teacher Action:** Break into simpler questions or guide student to prioritize

2. **Novel Subject Combinations**
   - Example: "I love physics but hate math" (contradictory)
   - **Why:** Physics requires math - system may struggle with logical impossibilities
   - **Teacher Action:** Explain the relationship between subjects

3. **Niche or Emerging Careers**
   - Example: "Tell me about becoming a TikTok algorithm engineer"
   - **Why:** Only covers 24 established SA careers
   - **Teacher Action:** Suggest closest match (e.g., "Software Engineer" or "Content Creator")

4. **Location-Specific Questions**
   - Example: "Which careers are best in Limpopo specifically?"
   - **Why:** Content is SA-wide, not province-specific
   - **Teacher Action:** Use general SA info, add local context manually

---

## How to Use THANDI.AI Effectively

### 1. Start with Simple Questions
```
Good: "I want to be a doctor, what do I need?"
Better: "Tell me about medical careers in South Africa"
```

### 2. One Constraint at a Time
```
Instead of: "I hate math, love biology, want remote work, need fast money"
Try: 
  - First: "I love biology, what careers?"
  - Then: "Which biology careers can be done remotely?"
  - Finally: "Which of these have fast earning potential?"
```

### 3. Use Follow-Up Questions
```
Student: "I don't have matric"
THANDI: [Suggests Electrician, Chef, Content Creator]
Student: "Tell me more about the electrician apprenticeship"
THANDI: [Detailed electrician pathway]
```

### 4. Verify Critical Information
- **Bursary deadlines:** Check official sources
- **University requirements:** Confirm with institution
- **Salary figures:** Use as estimates, not guarantees

---

## When to Escalate to Teacher

### 🚨 Immediate Teacher Review Needed:

1. **Student seems confused** by system response
2. **Response contradicts** what you know to be true
3. **Student has unique circumstances** (disability, refugee status, etc.)
4. **Career requires licensing** (doctor, lawyer) - verify regulatory requirements
5. **Student is making final decision** - teacher should confirm

### ✅ System Can Handle Alone:

1. Initial career exploration
2. Understanding requirements
3. Comparing 2-3 career options
4. Learning about bursaries and funding
5. Understanding salary ranges

---

## Understanding System Responses

### Response Structure:
```
1. Direct Answer (career overview)
2. Requirements (education, skills)
3. Pathways (how to get there)
4. Practical Info (salary, bursaries, timeline)
5. Alternatives (similar careers)
```

### Confidence Indicators:
- **Specific details** (R25K-R40K salary) = High confidence
- **General guidance** ("typically requires degree") = Medium confidence
- **"I don't have information about..."** = System acknowledging gap (GOOD!)

---

## Common Student Questions & Expected Behavior

| Student Query | System Should... | Red Flag If... |
|---------------|------------------|----------------|
| "I hate math" | Exclude math-heavy careers | Suggests Data Scientist |
| "Fast money" | Show apprenticeships, short courses | Only shows 4-year degrees |
| "No matric" | Show Grade 9-11 options | Says "matric required" for all |
| "Underwater basket weaver" | Say "no information" + suggest real careers | Fabricates details |
| "Fast + 10 years" | Acknowledge conflict, show both paths | Ignores contradiction |

---

## Feedback & Improvement

### Help Us Improve:
When system fails or student is confused, please note:
1. **Exact query** student asked
2. **What system said** (screenshot if possible)
3. **What student actually needed**
4. **Your assessment** of why it failed

**Submit via:** [Google Form link - to be added]

### We're Tracking:
- Query success rate by school
- Common failure patterns
- New career requests
- Subject combination issues

---

## Quick Reference Card

### ✅ System Strengths:
- 24 SA careers with detailed info
- Handles "no matric" and "no university" well
- Detects conflicting goals
- Won't hallucinate fake careers
- SA-specific salaries and bursaries

### ⚠️ System Limitations:
- 24 careers only (not comprehensive)
- May struggle with 4+ constraints
- Not province-specific
- Doesn't know about very new careers
- Can't replace teacher judgment

### 🎯 Best Use Cases:
- Initial career exploration (Grade 9-11)
- Understanding requirements
- Comparing options
- Learning about pathways
- Discovering alternatives

---

## Technical Notes (For IT/Admin)

- **Average response time:** 3-4 seconds
- **Cost per query:** ~R0.01
- **Uptime target:** 99%
- **Data privacy:** No student data stored
- **Internet required:** Yes (cloud-based)

---

## Support Contacts

- **Technical Issues:** [Email/Phone]
- **Content Questions:** [Email/Phone]
- **Training Requests:** [Email/Phone]
- **Feedback Form:** [Link]

---

**Remember:** THANDI.AI is a guidance tool, not a decision-maker. Your expertise and judgment remain essential for student success.

**System Accuracy:** 87% (B+ grade)  
**Last Updated:** November 2025  
**Next Review:** After 100 pilot queries
