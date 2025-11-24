# ✅ Orchids Wiring Checklist

## Quick Reference for Testing Integration

---

## 🔌 Step 1: Verify Connection (2 minutes)

### Test Backend is Live
```bash
curl https://thandiai.vercel.app/api/assess
```
**Expected:** `{"status":"ok"}`

### Test from Orchids Console
```javascript
fetch('https://thandiai.vercel.app/api/assess')
  .then(r => r.json())
  .then(d => console.log('✅ Connected:', d));
```

---

## 📝 Step 2: Verify Form Wiring (5 minutes)

### Correct Request Format
```javascript
{
  "answers": [
    "string - answer 1",
    "string - answer 2",
    "string - answer 3",
    "string - answer 4"
  ]
}
```

### Test Submission from Orchids
```javascript
const formData = {
  answers: [
    document.getElementById('q1').value,
    document.getElementById('q2').value,
    document.getElementById('q3').value,
    document.getElementById('q4').value
  ]
};

fetch('https://thandiai.vercel.app/api/assess', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(formData)
})
.then(r => r.json())
.then(data => {
  console.log('✅ Careers:', data.careers);
  console.log('✅ Session:', data.sessionId);
});
```

---

## 🌐 Step 3: Test on Web (5 minutes)

### Desktop Browser Test
1. Open Orchids in Chrome
2. Fill out form with test data
3. Submit
4. **Check:**
   - [ ] No console errors
   - [ ] Loading indicator shows
   - [ ] Results display within 10s
   - [ ] Career names visible
   - [ ] Match percentages show

### Use Test Page
Open: `http://localhost:3000/test-integration.html`
- Pre-built test form
- Shows connection status
- Displays results nicely

---

## 📱 Step 4: Test on Mobile (5 minutes)

### Access on Mobile
1. Get computer IP: `ipconfig`
2. On mobile, open: `http://YOUR-IP:PORT`
3. Fill out form
4. Submit

### Check Mobile Experience
- [ ] Form is responsive
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Results display properly
- [ ] No horizontal scroll

---

## 🧪 Step 5: Run Automated Tests (2 minutes)

### Run Test Script
```bash
node scripts/test-orchids-integration.js
```

**Expected Output:**
```
✅ Health Check: PASS
✅ Assessment: PASS
✅ Error Handling: PASS
✅ Response Time: PASS

🎉 All tests passed!
```

---

## ✅ Final Checklist

### Must Work
- [ ] Backend health check returns 200
- [ ] Form submits from Orchids frontend
- [ ] Careers are returned
- [ ] Session ID is returned
- [ ] No CORS errors
- [ ] Works on desktop browser
- [ ] Works on mobile browser

### Should Work
- [ ] Loading states show
- [ ] Error messages display
- [ ] Multiple submissions work
- [ ] Works on slow network
- [ ] Special characters handled

### Nice to Have
- [ ] PDF download works
- [ ] Form validation on frontend
- [ ] Smooth animations
- [ ] Progress indicators

---

## 🐛 Common Issues & Fixes

### Issue: CORS Error
**Fix:** Backend has CORS enabled. Check URL is correct.

### Issue: 400 Bad Request
**Fix:** Verify exactly 4 answers in array format.

### Issue: 500 Internal Error
**Fix:** Check Vercel logs: `vercel logs`

### Issue: Timeout
**Fix:** Check network. Backend has 60s timeout.

### Issue: Mobile Not Responsive
**Fix:** Add viewport meta tag, use responsive CSS.

---

## 📚 Documentation

- **Full Testing Guide:** `ORCHIDS-TESTING-PROTOCOL.md`
- **Integration Guide:** `ORCHIDS-CONNECTION-GUIDE.md`
- **Quick Reference:** `ORCHIDS-QUICK-REFERENCE.md`
- **Deployment Info:** `VERCEL-DEPLOYMENT-SUCCESS.md`

---

## 🚀 Ready to Ship?

Once all checkboxes are ticked:
1. ✅ Backend is live and tested
2. ✅ Orchids can connect successfully
3. ✅ Forms work on web and mobile
4. ✅ Error handling works
5. ✅ User experience is smooth

**You're ready for pilot testing!** 🎉

---

## 📞 Support

**Backend URL:** https://thandiai.vercel.app
**Test Page:** http://localhost:3000/test-integration.html
**Test Script:** `node scripts/test-orchids-integration.js`

**Issues?** Check Vercel logs or review documentation above.

