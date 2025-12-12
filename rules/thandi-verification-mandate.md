# Rule #1: The Verification Mandate

**Status:** ACTIVE - Non-negotiable  
**Applies to:** All Thandi career recommendations  
**Effective:** Immediately

---

## The Rule

Every Thandi response MUST end with:

```
⚠️ VERIFY THIS INFORMATION:
1. Check [official source URL]
2. Call [institution] at [phone number]
3. Ask your Life Orientation teacher

Thandi provides guidance, not decisions. Always verify before making choices.
```

---

## Implementation Requirements

### For LLM Generation (lib/rag/generation.js)
- System prompt MUST include verification mandate
- Response validation MUST check for verification footer
- If verification text missing → response FAILS validation → retry

### For Results Display (components/ResultsPage.js)
- Verification footer MUST be visible (not hidden in scroll)
- Verification links MUST be clickable
- Verification text MUST be in warning color (orange/red)

### For PDF Reports (lib/pdf/generateReport.js)
- Verification mandate MUST appear on every page
- Verification text MUST be in bold
- Verification section MUST be in separate box/border

---

## Why This Rule Exists

**Parent's concern:** "What if AI gives confident wrong answer and my son acts on it?"

**This rule ensures:**
1. Student ALWAYS knows to verify
2. Teacher ALWAYS sees verification reminder
3. Parent ALWAYS sees "check with us first" message
4. Legal protection: We're guidance, not decision-makers

---

## Failure Modes This Prevents

❌ **Without this rule:**
- Student: "Thandi said I need 80% math for UCT Computer Science"
- Reality: UCT changed requirements to 70% this year
- Result: Student doesn't apply, misses opportunity

✅ **With this rule:**
- Student: "Thandi said 80%, but it says verify with UCT"
- Student checks UCT website: "Oh, it's 70% now"
- Result: Student applies, gets accepted

---

## Testing Checklist

Before ANY deployment:
- [ ] Generate 5 test responses
- [ ] Verify ALL 5 have verification footer
- [ ] Click ALL verification links (must work)
- [ ] Print PDF, verify footer visible
- [ ] Show to parent: "Would you trust this for your son?"

---

## Red Line

**If this rule is violated in production:**
- Immediate code freeze
- Pull deployment
- Fix before re-deploy
- No exceptions

---

**Committed by:** Kiro AI  
**Approved by:** Founder  
**Review date:** Never (this is permanent)
