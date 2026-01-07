# Manual Testing Guide - PDF Fix & Build Verification

## 🧹 **STEP 1: Clean Up Processes**

### Kill any running Node.js processes:
```powershell
# Kill all Node.js processes
taskkill /f /im node.exe

# Verify they're gone
tasklist | findstr node
```

### Clear any port conflicts:
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# If something is using it, kill that process ID
# taskkill /f /pid [PID_NUMBER]
```

---

## 🚀 **STEP 2: Start Fresh Server**

```bash
# Start the development server
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in X.Xs
```

---

## 📄 **STEP 3: Test PDF Fix Manually**

### **Test 1: Direct API Test**
1. **Open browser**
2. **Navigate to**: `http://localhost:3000/api/pdf/test-session`
3. **Expected Result**: 
   - ✅ Downloads a PDF file (not text)
   - ✅ Filename: `thandi-career-report-test-session.pdf`
   - ✅ File size: >10KB (substantial content)

### **Test 2: Different Session IDs**
Test these URLs in browser:
- `http://localhost:3000/api/pdf/grade10-test`
- `http://localhost:3000/api/pdf/grade11-test`
- `http://localhost:3000/api/pdf/grade12-test`

**Each should download a professional PDF**

### **Test 3: PDF Content Verification**
Open any downloaded PDF and verify:
- ✅ **Cover Page**: Thandi branding with teal/gold colors
- ✅ **Multiple Pages**: Executive Summary, Programs, Bursaries, Action Plan
- ✅ **Professional Layout**: Cards, progress bars, proper typography
- ✅ **No Placeholder Text**: Real content, not "This is a placeholder"

---

## 🏗️ **STEP 4: Build Test**

```bash
# Stop the dev server (Ctrl+C)
# Then run production build
npm run build
```

**Expected Output:**
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   X KB        XX KB
├ ○ /api/pdf/[sessionId]               0 B         XX KB
└ ○ /results                           X KB        XX KB
```

### **Build Success Indicators:**
- ✅ No TypeScript errors
- ✅ No linting errors  
- ✅ All pages compile successfully
- ✅ PDF API route included in build

---

## 🔍 **STEP 5: Production Build Test**

```bash
# Start production server
npm start
```

**Test the same PDF URLs:**
- `http://localhost:3000/api/pdf/test-session`
- Should still download professional PDFs

---

## ✅ **STEP 6: Preflight Checks**

Only run preflight after confirming:
- ✅ Dev server works
- ✅ PDF API returns professional PDFs
- ✅ Build completes successfully
- ✅ Production server works

```bash
# Run preflight checks
node preflight-checks-final.js
```

---

## 🚨 **Troubleshooting**

### **If PDF still returns text:**
1. Check browser developer tools for errors
2. Verify `ProfessionalPDFGenerator.js` exists
3. Check server console for error messages

### **If build fails:**
1. Check for TypeScript errors
2. Verify all imports are correct
3. Run `npm install` to ensure dependencies

### **If server won't start:**
1. Kill all Node processes: `taskkill /f /im node.exe`
2. Clear port 3000: Check `netstat -ano | findstr :3000`
3. Restart terminal/command prompt

---

## 📋 **Quick Verification Checklist**

- [ ] All Node.js processes killed
- [ ] `npm run dev` starts successfully
- [ ] PDF API returns actual PDFs (not text)
- [ ] PDFs have professional Thandi branding
- [ ] `npm run build` completes without errors
- [ ] `npm start` works in production mode
- [ ] Ready for preflight checks

---

## 🎯 **Success Criteria**

**PDF Fix Working:**
- API endpoint returns `application/pdf` content-type
- Downloads have `.pdf` extension
- Files contain professional multi-page layout
- Thandi branding (teal #114E4E, gold #DFA33A) visible

**Build Working:**
- No compilation errors
- All routes build successfully
- Production server starts and serves PDFs

**Ready for Deployment:**
- All manual tests pass
- Build is clean
- Preflight checks can run safely

---

*Follow this guide step-by-step to avoid system slowdown from automated tests*