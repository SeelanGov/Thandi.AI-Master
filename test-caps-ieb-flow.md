# 🧪 CAPS vs IEB Flow Testing Guide

## ✅ **WHAT WAS FIXED**

### Issues Found:
1. ❌ Subject list was hardcoded to CAPS_SUBJECTS regardless of framework selection
2. ❌ Backend submission was hardcoded to `curriculum: 'caps'`
3. ❌ Query string didn't mention which curriculum the student follows

### Fixes Applied:
1. ✅ Subject list now dynamically switches based on framework selection
2. ✅ Backend receives actual framework: `curriculum: formData.curriculumProfile?.framework?.toLowerCase() || 'caps'`
3. ✅ Query string includes: "I am following the CAPS/IEB curriculum"

---

## 🧪 **TESTING STEPS**

### Test 1: CAPS Framework Selection

1. **Navigate to:** http://localhost:3000/assessment
2. **Select:** Grade 10
3. **Step 1 - Curriculum Profile:**
   - ✅ Default selection should be "CAPS (Government schools)"
   - ✅ Button should be highlighted in teal
   - ✅ Guide should show "CAPS Curriculum - 31 subjects available"
   - ✅ Subject list should include:
     - Life Orientation (CAPS-specific)
     - Agricultural Sciences (CAPS-specific)
     - Civil/Electrical/Mechanical Technology (CAPS-specific)
   - ✅ Should NOT include:
     - French, German, Portuguese
     - Dance Studies, Design, Sports Science

4. **Select 7 CAPS subjects:**
   - Mathematics
   - English Home Language
   - Afrikaans Home Language
   - Physical Sciences
   - Life Sciences
   - Geography
   - Life Orientation

5. **Click Next** and continue through all steps

6. **On submission:**
   - Open browser DevTools (F12) → Network tab
   - Look for POST request to `/api/rag/query`
   - Check Request Payload:
     ```json
     {
       "curriculum": "caps",
       "curriculumProfile": {
         "framework": "CAPS",
         "currentSubjects": [...]
       },
       "query": "I am a Grade 10 student in South Africa following the CAPS curriculum..."
     }
     ```

---

### IEB Framework Selection

1. **Navigate to:** http://localhost:3000/assessment
2. **Select:** Grade 11
3. **Step 1 - Curriculum Profile:**
   - Click "IEB (Independent schools)" button
   - ✅ IEB button should be highlighted in teal
   - ✅ CAPS button should return to default styling
   - ✅ Guide should show "IEB Curriculum - 30 subjects available"
   - ✅ Subject list should include:
     - Life Orientation (required for both CAPS and IEB)
     - French, German, Portuguese (IEB-specific)
     - Dance Studies (IEB-specific)
     - Design (IEB-specific)
     - Sports Science (IEB-specific)
   - ✅ Should NOT include:
     - Agricultural Sciences (CAPS-specific)
     - Civil/Electrical/Mechanical Technology (CAPS-specific)

4. **Select 7 IEB subjects:**
   - Mathematics
   - English Home Language
   - Life Orientation (required!)
   - French (IEB-specific!)
   - Physical Sciences
   - Life Sciences
   - Sports Science (IEB-specific!)

5. **Click Next** and continue through all steps

6. **On submission:**
   - Open browser DevTools (F12) → Network tab
   - Look for POST request to `/api/rag/query`
   - Check Request Payload:
     ```json
     {
       "curriculum": "ieb",
       "curriculumProfile": {
         "framework": "IEB",
         "currentSubjects": [...]
       },
       "query": "I am a Grade 11 student in South Africa following the IEB curriculum..."
     }
     ```

---

### Test 3: Framework Switching

1. **Navigate to:** http://localhost:3000/assessment
2. **Select:** Grade 12
3. **Step 1 - Curriculum Profile:**
   - Default: CAPS selected
   - Select 3 CAPS subjects (e.g., Life Orientation, Agricultural Sciences, Mathematics)
   - ✅ Verify 3 subjects are selected
   
4. **Switch to IEB:**
   - Click "IEB (Independent schools)" button
   - ✅ Selected subjects should be cleared (reset to 0)
   - ✅ Subject list should update to IEB subjects
   - ✅ Life Orientation and Agricultural Sciences should disappear
   - ✅ French, German, Portuguese should appear

5. **Select IEB subjects:**
   - Select 7 IEB subjects including French or Sports Science
   - ✅ Verify selection works correctly

6. **Switch back to CAPS:**
   - Click "CAPS (Government schools)" button
   - ✅ Selected subjects should be cleared again
   - ✅ Subject list should update back to CAPS subjects
   - ✅ IEB-specific subjects should disappear

---

## 🎯 **KEY DIFFERENCES: CAPS vs IEB**

### CAPS-Only Subjects (31 total):
- Agricultural Sciences ⭐
- Civil Technology ⭐
- Electrical Technology ⭐
- Mechanical Technology ⭐
- Sesotho Home Language
- Setswana Home Language

### IEB-Only Subjects (30 total):
- French 🇫🇷 ⭐
- German 🇩🇪 ⭐
- Portuguese 🇵🇹 ⭐
- Dance Studies 💃 ⭐
- Design 🎨 ⭐
- Sports Science 🏃‍♂️ ⭐

### Common Subjects (Both CAPS and IEB):
- Mathematics
- Mathematical Literacy
- Physical Sciences
- Life Sciences
- Accounting
- Business Studies
- Economics
- Geography
- History
- English (Home & First Additional)
- Afrikaans (Home & First Additional)
- IsiZulu Home Language
- **Life Orientation** ⭐ (Required for both!)
- CAT, IT, EGD
- Visual Arts, Dramatic Arts, Music
- Consumer Studies, Hospitality, Tourism

---

## ✅ **SUCCESS CRITERIA**

### Visual Confirmation:
- [ ] Framework buttons toggle correctly (teal highlight)
- [ ] Subject count updates (CAPS: 31, IEB: 29)
- [ ] Subject list changes when switching frameworks
- [ ] Selected subjects clear when switching frameworks
- [ ] Guide text updates to show correct curriculum

### Data Flow Confirmation:
- [ ] `curriculumProfile.framework` = "CAPS" or "IEB"
- [ ] `curriculum` parameter = "caps" or "ieb" (lowercase)
- [ ] Query string mentions correct curriculum
- [ ] Backend receives correct framework information
- [ ] Results page reflects curriculum-specific recommendations

### Step 2-6 Consistency:
- [ ] Step 2 (Marks) shows subjects from Step 1
- [ ] Step 3 (Enjoyed) filters subjects from Step 1
- [ ] All subsequent steps maintain framework context
- [ ] Final submission includes complete curriculum profile

---

## 🔍 **DEBUGGING TIPS**

### If subjects don't change:
1. Check browser console for errors
2. Verify `availableSubjects` variable in component
3. Check if `framework` state is updating

### If backend receives wrong curriculum:
1. Open DevTools → Network tab
2. Find POST to `/api/rag/query`
3. Check Request Payload → `curriculum` field
4. Verify it matches selected framework (lowercase)

### If results don't reflect curriculum:
1. Check if backend RAG system handles IEB differently
2. Verify knowledge base has IEB-specific data
3. Check LLM prompt includes curriculum context

---

## 📊 **EXPECTED BEHAVIOR SUMMARY**

| Action | CAPS | IEB |
|--------|------|-----|
| **Subjects Available** | 31 | 30 |
| **Unique Subjects** | Agricultural Sciences, Tech subjects | French, German, Portuguese, Dance, Design, Sports Science |
| **Common Required** | Life Orientation, Languages, Core subjects | Life Orientation, Languages, Core subjects |
| **Backend `curriculum`** | "caps" | "ieb" |
| **Query String** | "following the CAPS curriculum" | "following the IEB curriculum" |
| **Framework Switching** | Clears selections | Clears selections |

---

## ✅ **FINAL VERIFICATION**

Complete both Test 1 (CAPS) and Test 2 (IEB) end-to-end:

1. ✅ Visual UI updates correctly
2. ✅ Subject lists are different
3. ✅ Backend receives correct framework
4. ✅ Query includes curriculum context
5. ✅ Results page loads successfully
6. ✅ No console errors throughout

**If all tests pass:** CAPS/IEB flow is working correctly! ✅

**If any test fails:** Document the specific issue and check the debugging tips above.