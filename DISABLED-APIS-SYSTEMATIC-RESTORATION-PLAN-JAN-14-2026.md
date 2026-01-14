# DISABLED APIS SYSTEMATIC RESTORATION PLAN - January 14, 2026

## 🎯 EXECUTIVE SUMMARY

**Context**: On Jan 13, 2026, 11 APIs were temporarily disabled during emergency deployment to fix registration SQL error. RAG has been restored. 10 APIs remain disabled.

**Approach**: Hybrid strategy - immediate restoration of critical school search API, followed by systematic review and restoration of remaining 9 APIs.

**Timeline**: 2-3 hours total
- School Search: 15 minutes (IMMEDIATE)
- Remaining 9 APIs: 2-3 hours (SYSTEMATIC)

## 📋 DISABLED APIS INVENTORY

### ✅ RESTORED
1. `app/api/rag/query/route.js` - RAG system (COMPLETED Jan 14)

### 🚨 IMMEDIATE PRIORITY (Next 15 min)
2. `app/api/schools/search/route.js.disabled` - School search functionality
   - **Status**: Clean, no syntax errors
   - **Critical**: Needed for user registration flow
   - **Action**: Restore immediately

### ⚠️ HIGH PRIORITY (Next 1-2 hours)
3. `app/api/pdf/generate/route.js.disabled` - PDF generation
   - **Impact**: Users can't download career guidance PDFs
   - **Action**: Review, fix if needed, restore

4. `app/api/school/login/route.js.disabled` - School login
   - **Impact**: Schools can't access dashboard
   - **Action**: Review, fix if needed, restore

### 🔄 MEDIUM PRIORITY (Next 1 hour)
5. `app/api/schools/login/route.js.disabled` - Schools login (possible duplicate?)
   - **Action**: Check if duplicate of #4, consolidate if needed

6. `app/api/schools/claim/route.js.disabled` - School claiming
   - **Impact**: Schools can't claim their profiles
   - **Action**: Review, fix if needed, restore

7. `app/api/schools/request-addition/route.js.disabled` - School addition requests
   - **Impact**: Can't request new schools be added
   - **Action**: Review, fix if needed, restore

### 📊 LOWER PRIORITY (Evaluate need)
8. `app/api/school/dashboard/stats/route.js.disabled` - Dashboard statistics
   - **Action**: Evaluate if currently used, restore if needed

9. `app/api/school/students/at-risk/route.js.disabled` - At-risk student tracking
   - **Action**: Evaluate if currently used, restore if needed

10. `app/api/school/students/route.js.disabled` - Student management
    - **Action**: Evaluate if currently used, restore if needed

11. `app/api/student/retroactive-association/route.js.disabled` - Retroactive linking
    - **Action**: Evaluate if currently used, restore if needed

## 🔧 BULLETPROOF RESTORATION PROTOCOL

### For Each API:

#### Phase 1: Analysis (5 min)
- [ ] Read disabled file
- [ ] Check for syntax errors
- [ ] Verify imports and dependencies
- [ ] Understand functionality
- [ ] Assess criticality

#### Phase 2: Safety First (5 min)
- [ ] Create backup branch: `backup-2026-01-14-api-restoration-[api-name]`
- [ ] Push backup to GitHub
- [ ] Document what's being restored

#### Phase 3: Restoration (5 min)
- [ ] Restore file (rename .disabled → .js)
- [ ] Fix any syntax errors found
- [ ] Verify build passes locally
- [ ] Run relevant tests if available

#### Phase 4: Deployment (10 min)
- [ ] Commit with clear message
- [ ] Push to GitHub
- [ ] Deploy with `vercel --prod --force` (cache-busting)
- [ ] Monitor deployment status

#### Phase 5: Verification (5 min)
- [ ] Test endpoint in production
- [ ] Verify expected behavior
- [ ] Check for errors in logs
- [ ] Document restoration success

**Total per API**: ~30 minutes
**Total for 10 APIs**: ~5 hours (can be parallelized for similar APIs)

## 🚀 IMMEDIATE ACTION: SCHOOL SEARCH RESTORATION

### Step 1: Create Backup (NOW)
```bash
git checkout -b backup-2026-01-14-school-search-restoration
git push origin backup-2026-01-14-school-search-restoration
git checkout main
```

### Step 2: Restore File (NOW)
```bash
mv app/api/schools/search/route.js.disabled app/api/schools/search/route.js
```

### Step 3: Verify Build (NOW)
```bash
npm run build
```

### Step 4: Commit & Deploy (NOW)
```bash
git add app/api/schools/search/route.js
git commit -m "fix: restore school search API - was disabled during Jan 13 emergency deployment"
git push origin main
vercel --prod --force
```

### Step 5: Verify Production (NOW)
```bash
curl "https://www.thandi.online/api/schools/search?q=high&limit=5"
```

## 📊 SYSTEMATIC RESTORATION SCHEDULE

### Batch 1: Critical User-Facing (30-45 min)
- School Search (IMMEDIATE - in progress)
- PDF Generation
- School Login

### Batch 2: School Management (30-45 min)
- Schools Login (check for duplicate)
- School Claiming
- School Addition Requests

### Batch 3: Dashboard Features (30-45 min)
- Dashboard Stats
- At-Risk Students
- Student Management
- Retroactive Association

## 🎓 LESSONS LEARNED IMPLEMENTATION

### Prevention Measures:

#### 1. Create Disabled Features Tracker
```markdown
# DISABLED-FEATURES-TRACKER.md

## Currently Disabled Features
[Track any temporarily disabled features here]

## Recently Restored
- 2026-01-14: RAG Query API - Restored successfully
- 2026-01-14: School Search API - Restored successfully
```

#### 2. Use Feature Flags Instead
```javascript
// Better approach for future
if (process.env.FEATURE_SCHOOL_SEARCH_ENABLED !== 'false') {
  // School search logic
}
```

#### 3. Automated Monitoring
- Set up alerts for 404 responses on known endpoints
- Monitor disabled features list
- Automated reminders for re-enabling

#### 4. Deployment Checklist Update
Add to deployment checklist:
- [ ] List all temporarily disabled features
- [ ] Set re-enable dates and owners
- [ ] Create follow-up tasks
- [ ] Verify ALL endpoints post-deployment

## 📈 SUCCESS METRICS

### Per API:
- [ ] Endpoint returns expected status codes
- [ ] Functionality works as designed
- [ ] No errors in production logs
- [ ] Response times acceptable
- [ ] No breaking changes to dependent systems

### Overall:
- [ ] All 10 APIs reviewed
- [ ] Critical APIs restored (school search, PDF, school login)
- [ ] Medium priority APIs evaluated and restored if needed
- [ ] Lower priority APIs evaluated for current usage
- [ ] Disabled features tracker created
- [ ] Deployment protocols updated

## 🔄 NEXT STEPS AFTER SCHOOL SEARCH

1. **Immediate** (Next 15 min):
   - Complete school search restoration
   - Verify in production
   - Document success

2. **High Priority** (Next 1-2 hours):
   - Restore PDF generation API
   - Restore school login API
   - Test both in production

3. **Medium Priority** (Next 1 hour):
   - Review and restore school management APIs
   - Check for duplicates
   - Consolidate if needed

4. **Evaluation** (Next 30 min):
   - Assess dashboard feature usage
   - Restore if actively used
   - Document decisions

5. **Prevention** (Next 30 min):
   - Create disabled features tracker
   - Update deployment protocols
   - Document lessons learned

## 📞 COMMUNICATION PLAN

### After School Search Restoration:
```
Subject: School Search API Restored

The school search functionality has been restored and is now operational.

What happened: During yesterday's emergency deployment, the school search 
endpoint was temporarily disabled. It has now been restored.

Impact: Users who tried to search for schools yesterday may have experienced 
errors. This is now resolved.

Status: ✅ Fully operational
Next: Restoring PDF generation and school login APIs
```

### After All Restorations:
```
Subject: All Disabled APIs Restored

All 11 APIs that were temporarily disabled during the Jan 13 emergency 
deployment have been reviewed and restored.

Restored APIs:
- RAG Query (career guidance)
- School Search
- PDF Generation
- School Login
- [List others]

Prevention measures implemented:
- Disabled features tracking system
- Feature flag architecture
- Enhanced deployment verification
- Automated monitoring

Status: ✅ All systems operational
```

---

**Plan Created**: January 14, 2026
**Approach**: Hybrid (immediate + systematic)
**Estimated Time**: 2-3 hours total
**Risk Level**: LOW (following bulletproof protocol)
**Confidence**: HIGH

