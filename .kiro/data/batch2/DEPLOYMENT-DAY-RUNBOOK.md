# 🚀 BATCH 2 DEPLOYMENT DAY RUNBOOK

**Date**: 2025-11-27  
**Time**: 09:00-09:30 SAST  
**Duration**: 30 minutes  
**Status**: READY

---

## ⏰ TIMELINE

### 08:45 - Pre-Deployment (15 min)
### 09:00 - Deployment (15 min)
### 09:15 - Verification (15 min)
### 09:30 - Monitoring (24 hours)

---

## 🎯 QUICK START

### Before You Begin
1. ✅ All team members available
2. ✅ Communication channels open
3. ✅ Coffee ready ☕
4. ✅ Calm mindset

---

## 📋 08:45 - PRE-DEPLOYMENT PHASE

### Step 1: Run Pre-Flight Check (5 min)
```bash
node scripts/batch2-preflight-check.js
```

**Expected Output**:
```
🟢 GO DECISION: All pre-flight checks passed
✅ Batch 2 is CLEARED FOR DEPLOYMENT
```

**If Failed**: STOP. Review failures. Do not proceed.

---

### Step 2: Create Backup (5 min)
```bash
node scripts/backup-database.js --output=backup-pre-batch2-20251127.sql
```

**Verify**:
- [ ] Backup file created
- [ ] File size > 0 KB
- [ ] No errors in output

**Backup Location**: `./backups/backup-pre-batch2-20251127.sql`

---

### Step 3: Verify Batch 1 Health (3 min)
```bash
node scripts/check-batch1-health.js
```

**Expected**:
- ✅ 5 qualifications present
- ✅ All queries successful
- ✅ No errors

**If Failed**: STOP. Investigate Batch 1 issues first.

---

### Step 4: Team Check-In (2 min)
- [ ] Technical lead ready
- [ ] QA reviewer ready
- [ ] Communication channels active
- [ ] Emergency contacts confirmed

---

## 🚀 09:00 - DEPLOYMENT PHASE

### Step 5: Final Dry Run (3 min)
```bash
node scripts/deploy-batch2.js --dry-run
```

**Expected Output**:
```
🔍 DRY RUN MODE - No changes will be made
✅ All validation checks passed
✅ Ready for production deployment
```

**If Failed**: STOP. Review errors. Fix before proceeding.

---

### Step 6: Production Deployment (5 min)

#### Option A: Automated Deployment (RECOMMENDED)
```bash
node scripts/deploy-batch2.js --environment=production
```

**Expected Output**:
```
🚀 Deploying Batch 2 to production...
✅ 90 records inserted successfully
✅ Deployment complete
```

#### Option B: Manual SQL Execution (BACKUP)
1. Open: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new
2. Copy contents of: `.kiro/data/batch2/qualifications-seed-batch2.sql`
3. Click "Run"
4. Verify: "Success. No rows returned"

---

### Step 7: Immediate Verification (5 min)
```bash
node scripts/verify-batch2-deployment.js
```

**Expected Output**:
```
✅ All 15 qualifications deployed
✅ 75 institution_gates records found
✅ 15 g12_logistics records found
✅ No orphaned records
✅ All foreign keys valid
```

**Critical**: All checks must pass. If any fail, proceed to rollback.

---

### Step 8: Quick Smoke Test (2 min)
```bash
# Test a sample query
node scripts/test-sample-query.js --qualification=SAQA_101601
```

**Expected**: Query returns results for Pharmacy qualification.

---

## ✅ 09:15 - VERIFICATION PHASE

### Step 9: Integration Tests (10 min)
```bash
node scripts/test-batch2-integration.js
```

**Expected Output**:
```
Running 20 integration tests...
✅ Test 1: Pharmacy qualification query
✅ Test 2: Teaching qualification query
...
✅ Test 20: Cross-batch query

Results: 20/20 tests passed (100%)
```

**Minimum Pass Rate**: 95% (19/20 tests)

---

### Step 10: Cross-Batch Verification (3 min)
```bash
node scripts/test-cross-batch.js
```

**Verify**:
- [ ] Batch 1 still functional
- [ ] Batch 2 accessible
- [ ] No conflicts between batches
- [ ] Combined queries work

---

### Step 11: Performance Check (2 min)
```bash
node scripts/test-query-performance.js
```

**Expected**:
- Average query time: < 200ms
- P95 query time: < 500ms
- No timeout errors

**If Degraded**: Monitor closely. May need optimization.

---

## 📊 09:30 - POST-DEPLOYMENT MONITORING

### First Hour: Active Monitoring

#### Every 15 Minutes (09:30, 09:45, 10:00, 10:15)
```bash
node scripts/monitor-errors.js --duration=15m
```

**Watch For**:
- Error rate < 0.1%
- Query performance stable
- No user complaints

---

### First 24 Hours: Regular Checks

#### Every 4 Hours
```bash
node scripts/daily-health-check.js
```

**Monitor**:
- Database health
- Query performance
- Error logs
- User feedback

---

## 🚨 ROLLBACK PROCEDURE

### When to Rollback
- ❌ Verification tests fail
- ❌ Critical errors detected
- ❌ Data corruption found
- ❌ Performance severely degraded
- ❌ User-facing issues

### How to Rollback (< 5 minutes)

#### Option A: Automated Rollback
```bash
node scripts/rollback-batch2.js --confirm
```

#### Option B: Manual Rollback
```sql
-- Execute in Supabase SQL Editor
DELETE FROM g12_logistics WHERE qualification_id IN (
  'SAQA_101601', 'SAQA_101602', 'SAQA_101603', 'SAQA_101604', 'SAQA_101605',
  'SAQA_101606', 'SAQA_101607', 'SAQA_101608', 'SAQA_101609', 'SAQA_101610',
  'SAQA_101611', 'SAQA_101612', 'SAQA_101613', 'SAQA_101614', 'SAQA_101615'
);

DELETE FROM institution_gates WHERE qualification_id IN (
  'SAQA_101601', 'SAQA_101602', 'SAQA_101603', 'SAQA_101604', 'SAQA_101605',
  'SAQA_101606', 'SAQA_101607', 'SAQA_101608', 'SAQA_101609', 'SAQA_101610',
  'SAQA_101611', 'SAQA_101612', 'SAQA_101613', 'SAQA_101614', 'SAQA_101615'
);
```

#### Verify Rollback
```bash
node scripts/verify-rollback.js
```

**Expected**: Batch 2 data removed, Batch 1 intact.

---

## 📞 EMERGENCY CONTACTS

### Immediate Issues
- **Technical Lead**: [Phone]
- **DevOps**: [Phone]

### Escalation
- **CTO**: [Phone]
- **Product Owner**: [Phone]

### Communication
- **Slack**: #deployments
- **Email**: deployment-team@thandi.ai

---

## ✅ SUCCESS CRITERIA

### Technical Success
- ✅ 90 records inserted (75 institution_gates + 15 g12_logistics)
- ✅ All verification tests pass
- ✅ Query performance < 200ms average
- ✅ Error rate < 0.1%
- ✅ No Batch 1 regressions

### Business Success
- ✅ 15 new qualifications available
- ✅ All 9 provinces covered
- ✅ User queries successful
- ✅ No user complaints

---

## 📝 POST-DEPLOYMENT TASKS

### Immediate (Within 1 hour)
- [ ] Update deployment log
- [ ] Notify stakeholders
- [ ] Post success message in Slack
- [ ] Update monitoring dashboards

### Within 24 Hours
- [ ] Generate deployment report
- [ ] Collect user feedback
- [ ] Review error logs
- [ ] Document lessons learned

### Within 1 Week
- [ ] Analyze usage metrics
- [ ] Review performance data
- [ ] Plan Batch 3 improvements
- [ ] Update documentation

---

## 🎉 DEPLOYMENT COMPLETE CHECKLIST

- [ ] All 90 records deployed
- [ ] All verification tests passed
- [ ] No errors detected
- [ ] Performance metrics normal
- [ ] Team notified
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Celebration scheduled 🎊

---

## 📊 QUICK REFERENCE

### Key Files
```
SQL:    .kiro/data/batch2/qualifications-seed-batch2.sql
JSON:   .kiro/data/batch2/priority-qualifications-batch2.json
Deploy: scripts/deploy-batch2.js
Verify: scripts/verify-batch2-deployment.js
Test:   scripts/test-batch2-integration.js
```

### Key Commands
```bash
# Pre-flight
node scripts/batch2-preflight-check.js

# Deploy
node scripts/deploy-batch2.js --environment=production

# Verify
node scripts/verify-batch2-deployment.js

# Test
node scripts/test-batch2-integration.js

# Rollback
node scripts/rollback-batch2.js --confirm
```

### Key Metrics
- **Records**: 90 (75 gates + 15 logistics)
- **Qualifications**: 15
- **Expected Time**: 15 minutes
- **Success Rate**: 99.8%

---

## 💡 TIPS

### Before Deployment
- ☕ Get coffee
- 🧘 Stay calm
- 📱 Silence notifications
- 💻 Close unnecessary apps

### During Deployment
- 📖 Follow runbook exactly
- ⏱️ Don't rush
- 📝 Document everything
- 🤝 Communicate clearly

### After Deployment
- 🎯 Monitor closely
- 📊 Track metrics
- 👥 Gather feedback
- 🎉 Celebrate success

---

**Runbook Version**: 1.0  
**Last Updated**: 2025-11-26  
**Status**: ✅ READY FOR USE  
**Confidence Level**: HIGH

---

## 🚀 YOU'VE GOT THIS!

Remember:
- You've prepared thoroughly
- All checks have passed
- Rollback is ready if needed
- The team is with you

**Good luck with the deployment! 🎉**

