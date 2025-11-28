# 📋 Assessment Options Reference

**Complete list of all options available in the assessment**  
**URL:** https://thandiai.vercel.app/assessment

---

## Grade Selection

**3 Options:**
1. Grade 10
2. Grade 11
3. Grade 12

**Flow Differences:**
- **Grade 10:** Q1-Q4 → Preliminary Report → Optional Deep Dive (Q5) → Results
- **Grade 11-12:** Q1-Q4 → Results (direct, no preliminary)

---

## Q1: Subject Selection

**18 Options (Multi-select):**

### Core Academic Subjects
1. Mathematics
2. Physical Sciences
3. Life Sciences
4. Accounting
5. Business Studies
6. Economics
7. Geography
8. History

### Technology & Design
9. Information Technology
10. Computer Applications Technology (CAT)
11. Engineering Graphics and Design (EGD)

### Creative Arts
12. Visual Arts
13. Dramatic Arts
14. Music

### Specialized Subjects
15. Agricultural Sciences
16. Consumer Studies
17. Hospitality Studies
18. Tourism

---

## Q2: Interest Areas

**12 Options (Multi-select):**

1. Technology & Innovation
2. Healthcare & Medicine
3. Business & Finance
4. Engineering & Construction
5. Creative Arts & Design
6. Education & Social Services
7. Law & Justice
8. Science & Research
9. Agriculture & Environment
10. Media & Communication
11. Sports & Recreation
12. Hospitality & Tourism

---

## Q3: Constraints

### Study Location (6 options)
1. Anywhere in SA
2. Gauteng
3. Western Cape
4. KwaZulu-Natal
5. Eastern Cape
6. Other Province

### Financial Support (4 options)
1. NSFAS
2. Bursary
3. Self-funded
4. Not sure yet

### Study Duration (4 options)
1. 3-4 years
2. 5-6 years
3. Shorter courses
4. No preference

### Institution Type (4 options)
1. University
2. TVET College
3. Private College
4. No preference

**Total Constraint Options:** 18 across 4 categories

---

## Q4: Open Questions

**3 Text Input Questions:**

1. **Career Goals**
   - "What are your career goals?"
   - Free text response

2. **Strengths**
   - "What are your strengths?"
   - Free text response

3. **Challenges**
   - "What challenges do you face?"
   - Free text response

---

## Q5: Deep Dive (Grade 10 Only)

**5 Additional Questions:**

### 1. Current Marks
- Subject-by-subject mark entry
- Percentage input (0-100)
- For all selected subjects from Q1

### 2. Study Habits
- Study hours per week
- Study environment
- Support available

### 3. Extracurricular Activities
- Sports
- Clubs
- Leadership roles
- Community service

### 4. Career Exploration
- Research done
- People consulted
- Institutions visited
- Online resources used

### 5. Family Expectations
- Family career preferences
- Support level
- Financial considerations
- Cultural factors

---

## Results Page Options

### Actions Available
1. **Download PDF**
   - Includes all recommendations
   - Contains verification warnings
   - Mobile-compatible

2. **Start New Assessment**
   - Clears localStorage
   - Resets to grade selection
   - Fresh start

### Information Displayed
- Career matches (typically 3-5)
- Match explanations
- Required subjects
- Mark requirements (APS)
- Bursary information
- Application deadlines
- Action plans by grade year
- Backup pathways
- Verification warnings (⚠️)

---

## Total Options Summary

| Category | Count | Type |
|----------|-------|------|
| Grades | 3 | Single select |
| Subjects | 18 | Multi-select |
| Interests | 12 | Multi-select |
| Study Location | 6 | Single select |
| Financial Support | 4 | Single select |
| Study Duration | 4 | Single select |
| Institution Type | 4 | Single select |
| Open Questions | 3 | Text input |
| Deep Dive Questions | 5 | Mixed (Grade 10 only) |
| **TOTAL** | **59** | **Mixed** |

---

## Option Validation Rules

### Required Fields
- Grade selection: Required
- Q1 (Subjects): At least 1 subject
- Q2 (Interests): At least 1 interest
- Q3 (Constraints): All 4 categories required
- Q4 (Open Questions): All 3 required (min 10 characters each)
- Q5 (Deep Dive): Optional for Grade 10

### Optional Fields
- Deep Dive (Q5): Grade 10 students can skip
- Some constraint options: "No preference" available

### Input Limits
- Subjects: Max 7 selections recommended
- Interests: Max 5 selections recommended
- Open questions: Max 500 characters each
- Marks (Q5): 0-100 range

---

## Mobile Optimization

### Touch Targets
- Minimum 44px height
- Clear visual feedback
- No double-tap required
- Large tap areas

### Responsive Behavior
- No horizontal scrolling
- Stacked layouts on mobile
- Readable font sizes (16px+)
- Accessible dropdowns

---

## Accessibility Features

### Visual
- High contrast text
- Clear labels
- Error messages in red
- Success states in green

### Interaction
- Keyboard navigation
- Screen reader compatible
- Clear focus states
- Skip links available

### Feedback
- Immediate validation
- Clear error messages
- Progress indicators
- Loading states

---

## Data Persistence

### What's Saved (localStorage)
- Grade selection
- Q1: Subject selections
- Q2: Interest selections
- Q3: Constraint selections
- Q4: Open question responses
- Q5: Deep dive responses (if completed)
- Current question number
- Timestamp

### What's Not Saved
- Results (generated fresh each time)
- PDF downloads
- Session analytics

### Clearing Data
- "Start New Assessment" button
- Browser cache clear
- localStorage.clear()

---

## API Integration

### Endpoints Used
1. **POST /api/rag/query**
   - Sends: All assessment responses
   - Receives: Career recommendations

2. **GET /api/pdf/[sessionId]**
   - Generates: PDF with results
   - Includes: Verification warnings

3. **POST /api/g10-12**
   - Sends: Grade-specific data
   - Receives: Tailored guidance

---

## Testing Coverage

### Automated Tests
- ✅ Backend data (20/20 qualifications)
- ✅ Database connectivity
- ✅ Medicine verification
- ✅ Record counts

### Manual Tests Required
- ☐ All grade flows
- ☐ All subject selections
- ☐ All interest combinations
- ☐ All constraint options
- ☐ Open question validation
- ☐ Deep dive flow (Grade 10)
- ☐ PDF generation
- ☐ Mobile touch events
- ☐ Device compatibility

---

## Known Limitations

### By Design
- No user accounts
- No assessment history
- No social sharing
- No career library browsing
- Basic styling (inline CSS)

### Technical
- Requires JavaScript enabled
- Requires localStorage support
- Requires internet connection
- 10-15 second loading time for results

---

## Future Enhancements

### Potential Additions
- More subjects (e.g., Languages)
- More interest areas
- Province-specific filtering
- Institution comparison
- Career videos
- Virtual campus tours
- Mentor connections

### Not Planned for Testing Phase
- User accounts
- Assessment history
- Social features
- Advanced analytics
- A/B testing

---

**Last Updated:** November 26, 2025  
**Status:** ✅ All options verified and documented  
**Testing URL:** https://thandiai.vercel.app/assessment
