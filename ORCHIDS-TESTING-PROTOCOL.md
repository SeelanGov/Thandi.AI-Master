# 🧪 Orchids Integration Testing Protocol

## Testing Checklist for Web & Mobile

This guide ensures the Orchids frontend is correctly wired to your Thandi backend.

---

## 🔌 Phase 1: Connection Verification (5 minutes)

### Test 1.1: Backend Health Check
**From Orchids developer console:**
```javascript
fetch('https://thandiai.vercel.app/api/assess')
  .then(r => r.json())
  .then(data => console.log('✅ Backend:', data));
```

**Expected:** `{status: "ok", endpoint: "/api/assess", ...}`

**If fails:** Backend is down or URL is wrong

---

### Test 1.2: CORS Verification
**From Orchids frontend (any page):**
```javascript
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    answers: ['test1', 'test2', 'test3', 'test4']
  })
})
.then(r => r.json())
.then(data => console.log('✅ CORS working:', data))
.catch(err => console.error('❌ CORS error:', err));
```

**Expected:** Career recommendations returned

**If fails:** CORS error in console - check backend CORS settings

---

## 📝 Phase 2: Form Data Validation (10 minutes)

### Test 2.1: Verify Form Structure
**What Orchids should send:**
```javascript
{
  "answers": [
    "string - answer to question 1",
    "string - answer to question 2", 
    "string - answer to question 3",
    "string - answer to question 4"
  ]
}
```

**Rules:**
- Must be exactly 4 answers
- Each answer must be a string
- Answers can be any length (but recommend 10-500 chars)
- Empty strings are allowed but not recommended

---

### Test 2.2: Test with Real Form Data
**From Orchids form submission:**
```javascript
// Example: Collect form data
const formData = {
  answers: [
    document.getElementById('question1').value,
    document.getElementById('question2').value,
    document.getElementById('question3').value,
    document.getElementById('question4').value
  ]
};

// Send to backend
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(formData)
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('✅ Careers:', data.careers);
  console.log('✅ Session ID:', data.sessionId);
  // Display careers in UI
})
.catch(error => {
  console.error('❌ Error:', error);
  // Show error message to user
});
```

---

### Test 2.3: Validate Response Format
**Expected response structure:**
```javascript
{
  "careers": [
    {
      "name": "Software Engineer",
      "match": 90,
      "description": "Software engineering combines..."
    },
    {
      "name": "Data Scientist", 
      "match": 85,
      "description": "Data science uses..."
    }
  ],
  "sessionId": "1763800557871"
}
```

**Validation checks:**
```javascript
function validateResponse(data) {
  // Check structure
  if (!data.careers || !Array.isArray(data.careers)) {
    console.error('❌ Invalid: careers not an array');
    return false;
  }
  
  if (!data.sessionId) {
    console.error('❌ Invalid: sessionId missing');
    return false;
  }
  
  // Check each career
  data.careers.forEach((career, i) => {
    if (!career.name || !career.match || !career.description) {
      console.error(`❌ Invalid: career ${i} missing fields`);
      return false;
    }
  });
  
  console.log('✅ Response structure valid');
  return true;
}
```

---

## 🌐 Phase 3: Web Testing (15 minutes)

### Test 3.1: Desktop Browser (Chrome/Edge)
1. Open Orchids frontend in Chrome
2. Fill out assessment form with realistic data:
   - Question 1: "I am good at Math and Science"
   - Question 2: "I enjoy solving problems and working with technology"
   - Question 3: "I have limited budget but willing to study part-time"
   - Question 4: "I want a career with good job prospects in South Africa"
3. Submit form
4. **Check:**
   - ✅ Loading indicator appears
   - ✅ No console errors
   - ✅ Careers display within 5 seconds
   - ✅ Career names are readable
   - ✅ Match percentages show
   - ✅ Descriptions are complete

### Test 3.2: Desktop Browser (Firefox/Safari)
Repeat Test 3.1 in different browser

### Test 3.3: Network Tab Inspection
1. Open DevTools → Network tab
2. Submit form
3. **Check POST request:**
   - URL: `https://thandiai.vercel.app/api/assess`
   - Method: POST
   - Status: 200
   - Response time: < 10 seconds
   - Response size: reasonable (< 50KB)

### Test 3.4: Error Handling
**Test invalid data:**
```javascript
// Test 1: Missing answers
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({answers: ['only', 'three']})
})
.then(r => r.json())
.then(data => console.log('Should show error:', data));

// Test 2: Empty answers
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({answers: ['', '', '', '']})
})
.then(r => r.json())
.then(data => console.log('Should return fallback:', data));
```

**Expected:** Graceful error messages, not crashes

---

## 📱 Phase 4: Mobile Testing (20 minutes)

### Test 4.1: Mobile Browser (Same WiFi)
1. **Get your computer's IP address:**
   ```bash
   ipconfig | Select-String "IPv4"
   ```
   Example: `192.168.1.100`

2. **Access Orchids on mobile:**
   - If Orchids is running locally: `http://192.168.1.100:PORT`
   - If Orchids is deployed: Use production URL

3. **Fill out form on mobile:**
   - Use realistic data
   - Test typing on mobile keyboard
   - Check form is responsive

4. **Submit and verify:**
   - ✅ Form submits successfully
   - ✅ Loading indicator works
   - ✅ Results display properly
   - ✅ Text is readable on small screen
   - ✅ No horizontal scrolling

### Test 4.2: Mobile Network Conditions
**Simulate slow network:**
1. Chrome DevTools → Network → Throttling → Slow 3G
2. Submit form
3. **Check:**
   - ✅ Loading indicator shows
   - ✅ Request completes (may take 10-15s)
   - ✅ Timeout handling works
   - ✅ Error message if timeout

### Test 4.3: Mobile Offline Handling
1. Turn off WiFi on mobile
2. Try to submit form
3. **Check:**
   - ✅ Shows "No internet connection" message
   - ✅ Doesn't crash
   - ✅ Can retry when back online

### Test 4.4: Mobile Form Validation
**Test on mobile:**
- Empty fields → Should show validation
- Very long text → Should handle gracefully
- Special characters → Should work
- Emojis → Should work (optional)

---

## 🔄 Phase 5: End-to-End Flow (10 minutes)

### Test 5.1: Complete User Journey (Web)
1. Open Orchids homepage
2. Navigate to assessment
3. Read instructions
4. Fill out all 4 questions with realistic data
5. Submit form
6. View career recommendations
7. Click "Download PDF" (if implemented)
8. Verify PDF downloads with session ID

### Test 5.2: Complete User Journey (Mobile)
Repeat Test 5.1 on mobile device

### Test 5.3: Multiple Submissions
1. Submit form with one set of answers
2. Go back
3. Change answers
4. Submit again
5. **Check:**
   - ✅ New results returned
   - ✅ Different session ID
   - ✅ No cached results

---

## 🐛 Phase 6: Edge Cases (10 minutes)

### Test 6.1: Very Long Answers
```javascript
const longAnswer = 'a'.repeat(1000); // 1000 characters
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    answers: [longAnswer, longAnswer, longAnswer, longAnswer]
  })
})
.then(r => r.json())
.then(data => console.log('Long answers:', data));
```

**Expected:** Should work or return reasonable error

### Test 6.2: Special Characters
```javascript
fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    answers: [
      "I'm good at Math & Science!",
      "I enjoy tech (especially AI/ML)",
      "Budget: R0-R50,000",
      "Career in SA 🇿🇦"
    ]
  })
})
.then(r => r.json())
.then(data => console.log('Special chars:', data));
```

**Expected:** Should handle gracefully

### Test 6.3: Rapid Submissions
1. Submit form
2. Immediately submit again (before first completes)
3. **Check:**
   - ✅ Both requests complete
   - ✅ No race conditions
   - ✅ Correct results for each

---

## ✅ Success Criteria

### Must Pass (Critical)
- [ ] Backend health check works
- [ ] CORS allows Orchids to call API
- [ ] Form submits successfully on web
- [ ] Form submits successfully on mobile
- [ ] Career recommendations display correctly
- [ ] Session ID is returned
- [ ] No console errors on submission
- [ ] Loading states work
- [ ] Error handling works

### Should Pass (Important)
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on iOS and Android
- [ ] Handles slow network gracefully
- [ ] Handles offline gracefully
- [ ] Special characters work
- [ ] Multiple submissions work
- [ ] PDF download works (if implemented)

### Nice to Have (Optional)
- [ ] Works with very long answers
- [ ] Works with emojis
- [ ] Rapid submissions handled
- [ ] Form validation on frontend
- [ ] Progress indicators
- [ ] Smooth animations

---

## 🔧 Troubleshooting Guide

### Issue: CORS Error
**Symptoms:** Console shows "CORS policy" error

**Fix:**
1. Verify backend URL is correct
2. Check backend has CORS enabled (it does)
3. Try from different domain
4. Check browser console for exact error

### Issue: 400 Bad Request
**Symptoms:** Backend returns 400 status

**Fix:**
1. Check request format matches spec
2. Verify exactly 4 answers
3. Check Content-Type header
4. Log request body before sending

### Issue: 500 Internal Server Error
**Symptoms:** Backend returns 500 status

**Fix:**
1. Check Vercel logs: `vercel logs`
2. Verify environment variables set
3. Test with simpler query
4. Contact backend team (you!)

### Issue: Timeout
**Symptoms:** Request takes > 60 seconds

**Fix:**
1. Check network connection
2. Try shorter answers
3. Check Vercel function logs
4. May need to optimize backend

### Issue: Mobile Form Not Responsive
**Symptoms:** Form looks broken on mobile

**Fix:**
1. Add viewport meta tag
2. Use responsive CSS
3. Test on actual device
4. Check touch targets are large enough

---

## 📊 Testing Checklist Summary

```
Phase 1: Connection Verification
  [ ] Backend health check
  [ ] CORS verification

Phase 2: Form Data Validation  
  [ ] Form structure correct
  [ ] Real form data works
  [ ] Response format valid

Phase 3: Web Testing
  [ ] Chrome/Edge works
  [ ] Firefox/Safari works
  [ ] Network tab looks good
  [ ] Error handling works

Phase 4: Mobile Testing
  [ ] Mobile browser works
  [ ] Slow network handled
  [ ] Offline handled
  [ ] Form validation works

Phase 5: End-to-End Flow
  [ ] Complete journey (web)
  [ ] Complete journey (mobile)
  [ ] Multiple submissions work

Phase 6: Edge Cases
  [ ] Long answers work
  [ ] Special characters work
  [ ] Rapid submissions work
```

---

## 🎯 Next Steps After Testing

1. **Document Issues:** Create list of any bugs found
2. **Fix Critical Issues:** Address must-pass failures
3. **Optimize:** Improve performance if needed
4. **User Testing:** Test with real students
5. **Monitor:** Watch Vercel logs for errors
6. **Iterate:** Improve based on feedback

---

## 📞 Support

**Backend Issues:** Check Vercel logs or contact backend team
**Frontend Issues:** Orchids developer to fix
**Integration Issues:** Test together with both teams

**Backend URL:** https://thandiai.vercel.app
**Health Check:** https://thandiai.vercel.app/api/assess
**Documentation:** See ORCHIDS-CONNECTION-GUIDE.md

