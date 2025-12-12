# Gate Configuration for All 10 Careers

## Overview

This document shows how each of your 10 careers is configured for the gate system.

---

## Career Configurations

### 1. Mechanical Engineer
**Category:** Engineering  
**Gate Rules:**
- ✅ Requires Pure Math (not Math Lit)
- ✅ Requires Physical Sciences
- ✅ Min Math: 60%
- ✅ Min English: 50%
- ✅ TVET Alternative: Engineering Technician

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests IT/Software
- No Physical Science → BLOCKED → Suggests Software Engineering
- Math < 60% → WARNING or BLOCKED (depending on gap)

---

### 2. Medical Doctor
**Category:** Healthcare  
**Gate Rules:**
- ✅ Requires Pure Math
- ✅ Requires Physical Sciences
- ✅ Requires Life Sciences
- ✅ Min Math: 70% (highest requirement)
- ✅ Min English: 60%

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests Nursing
- No Physical Science → BLOCKED → Suggests Nursing
- No Life Sciences → BLOCKED → Suggests other healthcare
- Math < 70% → BLOCKED if gap > 20%, WARNING if gap ≤ 20%

---

### 3. Physiotherapist
**Category:** Healthcare  
**Gate Rules:**
- ✅ Requires Pure Math
- ✅ Requires Physical Sciences
- ✅ Requires Life Sciences
- ✅ Min Math: 60%
- ✅ Min English: 50%

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests Nursing
- No Physical Science → BLOCKED → Suggests Nursing
- No Life Sciences → BLOCKED → Suggests other healthcare

---

### 4. Registered Nurse
**Category:** Healthcare  
**Gate Rules:**
- ✅ Accepts Math Literacy (no Pure Math required)
- ✅ Requires Life Sciences
- ✅ Min Math: 50% (lower threshold)
- ✅ Min English: 50%

**Gate Behavior:**
- Math Lit student → ALLOWED ✓
- No Life Sciences → BLOCKED
- Math < 50% → WARNING

**Key:** This is the fallback for Math Lit students interested in healthcare

---

### 5. Data Scientist
**Category:** Technology  
**Gate Rules:**
- ✅ Requires Pure Math
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 65% (high requirement)
- ✅ Min English: 50%
- ✅ TVET Alternative: IT Support Technician

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests IT Support
- No Physical Science → ALLOWED ✓ (doesn't need it)
- Math < 65% → WARNING or BLOCKED

---

### 6. Software Developer
**Category:** Technology  
**Gate Rules:**
- ✅ Requires Pure Math
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 60%
- ✅ Min English: 50%
- ✅ TVET Alternative: IT Support Technician

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests IT Support
- No Physical Science → ALLOWED ✓
- Math < 60% → WARNING or BLOCKED

**Key:** This is the fallback for Math students without Physical Science

---

### 7. Chartered Accountant
**Category:** Business & Finance  
**Gate Rules:**
- ✅ Requires Pure Math
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 65% (high requirement)
- ✅ Min English: 50%

**Gate Behavior:**
- Math Lit student → BLOCKED → Suggests Business Management
- No Physical Science → ALLOWED ✓
- Math < 65% → WARNING or BLOCKED

---

### 8. Corporate Lawyer
**Category:** Legal  
**Gate Rules:**
- ✅ Accepts Math Literacy
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 40% (low requirement)
- ✅ Min English: 70% (highest English requirement)

**Gate Behavior:**
- Math Lit student → ALLOWED ✓
- English < 70% → WARNING or BLOCKED
- Math < 40% → WARNING

**Key:** English proficiency is more important than Math

---

### 9. High School Teacher
**Category:** Education  
**Gate Rules:**
- ✅ Accepts Math Literacy
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 50%
- ✅ Min English: 60%

**Gate Behavior:**
- Math Lit student → ALLOWED ✓
- English < 60% → WARNING
- Math < 50% → WARNING

---

### 10. Social Entrepreneur
**Category:** Business & Social Impact  
**Gate Rules:**
- ✅ Accepts Math Literacy
- ❌ Does NOT require Physical Sciences
- ✅ Min Math: 40% (low requirement)
- ✅ Min English: 50%

**Gate Behavior:**
- Math Lit student → ALLOWED ✓
- Very flexible requirements

---

## Summary Matrix

| Career | Pure Math Required | Physical Science | Life Science | Min Math | Min English | TVET Alt |
|--------|-------------------|------------------|--------------|----------|-------------|----------|
| Mechanical Engineer | ✅ | ✅ | ❌ | 60% | 50% | ✅ |
| Medical Doctor | ✅ | ✅ | ✅ | 70% | 60% | ❌ |
| Physiotherapist | ✅ | ✅ | ✅ | 60% | 50% | ❌ |
| Registered Nurse | ❌ | ❌ | ✅ | 50% | 50% | ❌ |
| Data Scientist | ✅ | ❌ | ❌ | 65% | 50% | ✅ |
| Software Developer | ✅ | ❌ | ❌ | 60% | 50% | ✅ |
| Chartered Accountant | ✅ | ❌ | ❌ | 65% | 50% | ❌ |
| Corporate Lawyer | ❌ | ❌ | ❌ | 40% | 70% | ❌ |
| High School Teacher | ❌ | ❌ | ❌ | 50% | 60% | ❌ |
| Social Entrepreneur | ❌ | ❌ | ❌ | 40% | 50% | ❌ |

---

## Math Literacy Pathways

**Careers that ACCEPT Math Literacy:**
1. Registered Nurse (healthcare pathway)
2. Corporate Lawyer (legal pathway)
3. High School Teacher (education pathway)
4. Social Entrepreneur (business pathway)

**Careers that REQUIRE Pure Math:**
1. Mechanical Engineer
2. Medical Doctor
3. Physiotherapist
4. Data Scientist
5. Software Developer
6. Chartered Accountant

---

## Physical Science Pathways

**Careers that REQUIRE Physical Sciences:**
1. Mechanical Engineer
2. Medical Doctor
3. Physiotherapist

**Careers that DON'T need Physical Sciences:**
1. Registered Nurse (needs Life Sciences instead)
2. Data Scientist (Math-focused)
3. Software Developer (Math-focused)
4. Chartered Accountant (Math-focused)
5. Corporate Lawyer
6. High School Teacher
7. Social Entrepreneur

---

## Gate Logic Examples

### Example 1: Math Lit Student Interested in Engineering
```
Student Profile:
- Math Type: Math Literacy
- Subjects: Math Lit, Life Sciences, English, History

Gate Check:
1. Math Gate: BLOCKED (Engineering needs Pure Math)
2. Alternatives Suggested:
   - Software Developer (if switches to Pure Math by January)
   - IT Support Technician (TVET pathway)
   - Social Entrepreneur (business pathway)

Result: Engineering NOT recommended, alternatives provided
```

### Example 2: Pure Math Student Without Physical Science
```
Student Profile:
- Math Type: Pure Mathematics (65%)
- Subjects: Math, Life Sciences, English, History

Gate Check:
1. Math Gate: PASSED ✓
2. Science Gate: BLOCKED for Engineering/Medicine
3. Alternatives Suggested:
   - Data Scientist (doesn't need Physical Science)
   - Software Developer (doesn't need Physical Science)
   - Chartered Accountant (doesn't need Physical Science)

Result: Tech/Business careers recommended, not Engineering/Medicine
```

### Example 3: All Sciences, Low Math
```
Student Profile:
- Math Type: Pure Mathematics (52%)
- Subjects: Math, Physical Sciences, Life Sciences, English

Gate Check:
1. Math Gate: WARNING (needs 60%+ for most careers)
2. Science Gate: PASSED ✓
3. Recommendations:
   - Registered Nurse (only needs 50% Math)
   - Improve Math to 60% for Engineering/Medicine

Result: Nursing recommended now, Engineering/Medicine if Math improves
```

---

## Next Steps

Once you run the SQL migration:
1. All 10 careers will have these gate rules
2. Gates will automatically filter recommendations
3. Students get realistic, achievable career paths

**To apply:** Run the SQL in `.kiro/specs/gated-rag-system/CURRENT-BLOCKER.md`
