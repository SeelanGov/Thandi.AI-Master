# 5-Day Sprint: Quick Reference Card

**Goal:** Transform Thandi from toy to tool  
**Dates:** Nov 25-29, 2025  
**Status:** APPROVED - Ready to Execute

---

## Daily Checklist

### Day 1 (Monday) - Foundation
- [ ] AM: Implement Rule #4 (NSFAS prioritization)
- [ ] AM: Test Rule #4 with low-income profiles
- [ ] PM: Update database schema
- [ ] PM: Update API endpoint
- [ ] PM: Create wireframes
- [ ] PM: Send wireframes to Sitara for review
- **Deliverable:** Rule #4 working, schema deployed

### Day 2 (Tuesday) - Implementation
- [ ] AM: Finalize 6 deep dive questions (based on Sitara feedback)
- [ ] AM: Build enhanced RAG prompt
- [ ] AM: Build 3-year action plan generator
- [ ] PM: Build GradeSelector component
- [ ] PM: Build PreliminaryReport component
- [ ] PM: Build DeepDiveQuestions component
- [ ] PM: Update AssessmentForm with adaptive logic
- **Deliverable:** All components built, system functional

### Day 3 (Wednesday) - Sitara Validation
- [ ] AM: Test Grade 11 flow with Sitara
- [ ] AM: Test Grade 10 opt-out with Sitara
- [ ] AM: Test Grade 10 opt-in with Sitara
- [ ] AM: Test low-income integration with Sitara
- [ ] AM: Get CTA effectiveness feedback
- [ ] PM: Fix issues based on feedback
- [ ] PM: Iterate on question wording
- [ ] PM: Adjust CTA if needed
- **Deliverable:** Sitara-approved system

### Day 4 (Thursday) - Polish + Prep
- [ ] AM: UI/UX refinements
- [ ] AM: Error handling
- [ ] AM: Performance optimization
- [ ] PM: Recruit 3-5 friends through Sitara
- [ ] PM: Write test protocol
- [ ] PM: Prepare test environment
- [ ] PM: Order pizza for Friday
- [ ] PM: Prepare R50 vouchers
- **Deliverable:** Ready for friend testing

### Day 5 (Friday) - Real User Testing
- [ ] 3:00 PM: Setup (pizza, devices, recording)
- [ ] 3:15 PM: Students start assessment
- [ ] 4:00 PM: Debrief and feedback
- [ ] 4:30 PM: Analyze results
- [ ] Evening: Calculate metrics
- [ ] Evening: Make go/no-go decision
- [ ] Evening: Report to cofounder
- **Deliverable:** Ship decision with data

---

## Key Metrics to Track

| Metric | Target | Critical? |
|--------|--------|-----------|
| Grade 10 opt-in rate | >60% | Yes |
| Grade 11 completion | >80% | Yes |
| "Would use for real" | >70% | Yes |
| Bursaries shown (low-income) | 100% | CRITICAL |
| Average time (10 questions) | <15 min | No |

---

## The 6 Deep Dive Questions

1. **Q5:** Current marks per subject (dropdowns)
2. **Q6:** Support system available (checkboxes)
3. **Q7:** Career awareness level (radio)
4. **Q8:** Family expectations alignment (radio)
5. **Q9:** Location flexibility (radio)
6. **Q10:** Decision style (radio)

---

## Ship Decision Matrix

**Ship Monday if:**
- ✅ All metrics hit targets
- ✅ No critical bugs
- ✅ Sitara + friends approve

**Fix & ship Tuesday if:**
- ⚠️ Minor issues found
- ⚠️ Metrics close to targets
- ⚠️ Fixable over weekend

**Pivot if:**
- ❌ <50% opt-in rate
- ❌ <60% completion
- ❌ Rule #4 broken
- ❌ Critical bugs

---

## Emergency Contacts

**Sitara:** Available Wednesday 3 PM  
**Friends:** Friday 3:30 PM  
**Cofounder:** Report Friday evening  

---

## Files to Create/Modify

**New Files:**
- `lib/rag/action-plan.js`
- `app/assessment/components/GradeSelector.jsx`
- `app/assessment/components/PreliminaryReport.jsx`
- `app/assessment/components/DeepDiveQuestions.jsx`
- `rules/thandi-nsfas-prioritization.md` (Rule #4)

**Modified Files:**
- `database-schema.sql`
- `app/api/assess/route.js`
- `app/assessment/components/AssessmentForm.jsx`
- `lib/rag/generation.js`

---

## The Core Philosophy

**4 questions** = Tells students WHAT they could be  
**10 questions** = Tells them HOW to become it

**Grade 10:** Prove value first, then offer depth  
**Grade 11-12:** They need help NOW, give it immediately

**Rule #4 is non-negotiable:** Low-income students MUST see bursaries

---

## Your Cofounder's Words

> "This plan transforms Thandi from a toy into a tool. The opt-in model respects Grade 10 maturity while giving them access to serious guidance. My confidence: 9/10 this works if you stick to the timeline."

> "Your daughter just leveled up Thandi from 'quick quiz' to 'life planning tool.'"

> "Build it. Test it Friday. Then resume the rules with real data."

---

**Ready to start Day 1 tomorrow?**

