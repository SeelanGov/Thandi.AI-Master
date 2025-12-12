# Day 2 Implementation Guide

**Time:** 8:00 AM - 12:00 PM (4 hours)  
**Goal:** Fix the "enjoyed subjects" UX issue

---

## Step 1: Backup Current Code (8:00 AM)

```bash
# Create a backup branch
git checkout -b backup-before-day2
git push origin backup-before-day2

# Return to main
git checkout main
```

---

## Step 2: Replace Subject Selection Component (8:05 AM)

**File to replace:** `app/assessment/components/SubjectSelection.jsx`

**Action:**
1. Copy content from `DAY-2-SUBJECT-SELECTION-FIX.jsx`
2. Paste into `app/assessment/components/SubjectSelection.jsx`
3. Save file

**What changed:**
- ✅ Question now asks "Which subjects do you actually ENJOY?"
- ✅ Added helpful tip box explaining why
- ✅ Added emojis for visual appeal
- ✅ Added missing subjects (EGD, French, Dance, etc.)
- ✅ Limited to max 5 subjects
- ✅ Encourages 2-3 subjects (sweet spot)

---

## Step 3: Update Assessment Form to Use "enjoyedSubjects" (8:15 AM)

**File:** `app/assessment/components/AssessmentForm.jsx`

**Find this:**
```jsx
const [subjects, setSubjects] = useState([]);
```

**Replace with:**
```jsx
const [enjoyedSubjects, setEnjoyedSubjects] = useState([]);
```

**Find this:**
```jsx
<SubjectSelection 
  selected={subjects} 
  onChange={setSubjects} 
/>
```

**Replace with:**
```jsx
<SubjectSelection 
  selected={enjoyedSubjects} 
  onChange={setEnjoyedSubjects} 
/>
```

**Find this (in handleSubmit):**
```jsx
const assessmentData = {
  subjects,
  interests,
  constraints,
  ...
};
```

**Replace with:**
```jsx
const assessmentData = {
  enjoyedSubjects,  // CHANGED: Now using enjoyed subjects
  interests,
  constraints,
  ...
};
```

---

## Step 4: Update API to Handle enjoyedSubjects (8:30 AM)

**File:** `app/api/assess/route.js`

**Find this:**
```javascript
const { subjects, interests, constraints, ... } = await request.json();
```

**Replace with:**
```javascript
const { enjoyedSubjects, interests, constraints, ... } = await request.json();
```

**Find the prompt construction (around line 30-50):**
```javascript
const prompt = `
Student Profile:
- Subjects: ${subjects.join(', ')}
...
`;
```

**Replace with:**
```javascript
const prompt = `
Student Profile:
- Subjects they ENJOY (not just take): ${enjoyedSubjects.join(', ')}
- Interests: ${interests.join(', ')}
- Constraints: ${constraints}

IMPORTANT: Focus career recommendations on subjects they ENJOY.
- If they enjoy Life Sciences → Prioritize healthcare careers
- If they enjoy Math → Prioritize STEM careers
- If they enjoy Creative Arts → Prioritize creative careers
- DO NOT recommend careers based on subjects they don't enjoy

Base recommendations on passion, not obligation.
...
`;
```

---

## Step 5: Test Locally (8:45 AM)

```bash
# Start dev server
npm run dev
```

**Test flow:**
1. Go to http://localhost:3000/assessment
2. Fill out the form
3. Select 2-3 subjects you "enjoy"
4. Notice the new question wording
5. Notice the tip box
6. Notice the emojis
7. Submit and check results
8. Verify PDF includes correct subjects

**Check:**
- [ ] Question says "Which subjects do you actually ENJOY?"
- [ ] Tip box explains why we ask
- [ ] Missing subjects are present (EGD, French, Dance)
- [ ] Can select 2-5 subjects
- [ ] Results feel personal (not generic)
- [ ] PDF includes enjoyed subjects

---

## Step 6: Deploy to Production (9:00 AM)

```bash
# Commit changes
git add -A
git commit -m "UX Fix: Changed to 'enjoyed subjects' based on Grade 10 user feedback

- Updated question from 'What subjects are you taking?' to 'Which subjects do you actually ENJOY?'
- Added helpful tip explaining why we ask for enjoyed subjects
- Added missing subjects: EGD, French, Dance, isiZulu, Tourism, Hospitality, Consumer Studies
- Limited selection to 2-5 subjects (encourages focus)
- Updated API prompt to emphasize enjoyed subjects
- Added emojis for visual appeal

This fix addresses critical UX flaw: students were selecting ALL subjects (including ones they hate), leading to generic advice and loss of trust. Now system focuses on passion, not obligation."

# Tag the release
git tag day2-enjoyed-subjects-fix
git push origin main
git push origin day2-enjoyed-subjects-fix

# Deploy to Vercel
vercel --prod
```

---

## Step 7: Send to Your Daughter (9:15 AM)

**Message:**
```
Fixed! 🎉

New version is live: https://thandiai.vercel.app/assessment

Changes based on your feedback:
✅ Now asks "Which subjects do you ENJOY?" (not all subjects)
✅ Added EGD, French, Dance (and more)
✅ Added a tip explaining why we ask

Test it again and let me know:
1. Does the question make more sense now?
2. Are all your subjects there?
3. Does the advice feel more personal?

Thanks for being my co-tester! 💚
```

---

## Step 8: Wait for Her Response (9:15 AM - 12:00 PM)

**While waiting:**
- Document the changes in cofounder status report
- Update Day 2 action plan with results
- Prepare for Day 3 based on her feedback

**If she responds positively:**
→ Day 2 complete, move to Day 3

**If she finds more issues:**
→ Iterate immediately (same day)

**If she doesn't respond:**
→ Follow up in the afternoon

---

## Rollback Plan (If Needed)

**If something breaks:**

```bash
# Rollback to backup
git checkout backup-before-day2
git push origin main --force

# Redeploy
vercel --prod
```

**Then:**
1. Fix the issue locally
2. Test thoroughly
3. Redeploy

---

## Success Criteria

### Must Pass
- [ ] Question asks for "enjoyed subjects"
- [ ] Tip box explains why
- [ ] Missing subjects added (EGD, French, Dance, etc.)
- [ ] Can select 2-5 subjects
- [ ] API uses enjoyedSubjects
- [ ] Results feel personal
- [ ] Your daughter approves

### Nice to Have
- [ ] Emojis display correctly on all devices
- [ ] Tip box is readable on mobile
- [ ] Subject cards look good on tablet

---

## Troubleshooting

### Issue: Subjects not saving
**Fix:** Check localStorage key changed from 'subjects' to 'enjoyedSubjects'

### Issue: API returns error
**Fix:** Check API is reading 'enjoyedSubjects' field (not 'subjects')

### Issue: Results still feel generic
**Fix:** Check prompt emphasizes "enjoyed subjects" not just "subjects"

### Issue: Missing subjects not showing
**Fix:** Check SUBJECTS array in SubjectSelection.jsx

---

## Time Breakdown

| Time | Task | Duration |
|------|------|----------|
| 8:00-8:05 | Backup code | 5 min |
| 8:05-8:15 | Replace SubjectSelection component | 10 min |
| 8:15-8:30 | Update AssessmentForm | 15 min |
| 8:30-8:45 | Update API | 15 min |
| 8:45-9:00 | Test locally | 15 min |
| 9:00-9:15 | Deploy to production | 15 min |
| 9:15-12:00 | Wait for feedback | 2h 45min |

**Total active work:** 1h 15min  
**Total time:** 4 hours (including waiting)

---

## After Day 2

### If Successful
**Document:**
- Her exact feedback (quote it)
- What changed
- Why it worked
- Next steps

**Share with cofounder:**
- User feedback log
- Before/after comparison
- Her approval message

### If More Issues Found
**Repeat process:**
1. Listen to feedback
2. Identify core problem
3. Fix it (nothing else)
4. Test with her
5. Deploy

**Keep iterating until she says "This feels right."**

---

## Key Principle

**Fix what she found. Nothing else.**

No feature creep. No "while we're at it" changes. No polish.

**Just the UX fix she identified.**

---

**Ready to ship:** November 23, 2025, 8:00 AM  
**Estimated completion:** 9:15 AM  
**Gate:** Her response by 12:00 PM
