
📋 MANUAL BROWSER TESTING CHECKLIST
===================================

🔗 Open: http://localhost:3000/assessment

✅ GRADE SELECTION (Step 0):
   □ Grade selector appears first
   □ Can select Grade 10, 11, or 12
   □ Clicking grade advances to Step 1

✅ STEP 1 - CURRICULUM PROFILE:
   □ Shows "Your Current Subjects"
   □ Can select CAPS or IEB
   □ Subject grid shows all subjects with emojis
   □ Requires minimum 6 subjects
   □ Shows warning if less than 6 subjects
   □ "Next" button validates subject selection

✅ STEP 2 - MARKS COLLECTION:
   □ Shows "Your Current Academic Performance"
   □ Has ⚠️ verification warning about LO teacher
   □ Shows subjects from Step 1
   □ Three options: exact marks, ranges, unknown
   □ Can enter marks for each subject
   □ No duplicate marks collection elsewhere

✅ STEP 3 - SUBJECT SELECTION:
   □ Shows "Which subjects do you actually ENJOY?"
   □ Only shows subjects selected in Step 1
   □ Can select 2-5 subjects
   □ Shows tip about enjoying vs taking subjects

✅ STEP 4 - INTEREST AREAS:
   □ Shows "What interests you?"
   □ Grid of interest cards with icons
   □ Can select multiple interests
   □ Requires at least 1 selection

✅ STEP 5 - CONSTRAINTS:
   □ Shows "What are your constraints?"
   □ Time, money, location, family background dropdowns
   □ NO marks collection here
   □ Only constraint-related fields

✅ STEP 6 - OPEN QUESTIONS:
   □ Shows "Tell us more about you"
   □ Three text areas: motivation, concerns, career interests
   □ All fields optional
   □ Character counters working

✅ PROGRESS BAR:
   □ Shows 6 steps total
   □ Labels: Profile, Marks, Subjects, Interests, Constraints, Questions
   □ Current step highlighted
   □ Progress fills correctly

✅ GRADE-SPECIFIC BEHAVIOR:
   □ Grade 10: Shows preliminary report after Step 6
   □ Grade 11: Goes directly to results after Step 6
   □ Grade 12: Goes directly to results after Step 6

✅ RESULTS PAGE:
   □ Grade 11 shows "1 year left" (not "2 years left")
   □ Grade-specific timeline advice
   □ Marks-based recommendations
   □ No duplicate content

🚨 CRITICAL TESTS:
   □ Grade 11 student sees "1 year left" in results
   □ MarksCollection only appears in Step 2
   □ No marks collection in Constraints (Step 5)
   □ All 6 steps work smoothly
   □ Progress bar shows correct step labels
