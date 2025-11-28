# 🚀 BATCH 2 PRE-FLIGHT CHECKLIST

**Deployment Date**: 2025-11-27 09:00 SAST  
**Checklist Version**: 1.0  
**Last Updated**: 2025-11-26

---

## 📋 OVERVIEW

This checklist must be completed before Batch 2 deployment. All items marked as **CRITICAL** must pass. Items marked as **RECOMMENDED** should pass but won't block deployment.

**Estimated Time**: 20-30 minutes  
**Required Personnel**: 1 technical lead + 1 QA reviewer

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### PHASE 1: Environment Validation (CRITICAL)

- [ ] **1.1** Environment variables present
  ```bash
  # Verify all required variables are set
  echo $NEXT_PUBLIC_SUPABASE_URL
  echo $SUPABASE_SERVICE_ROLE_KEY
  echo $SUPABASE_ANON_KEY
  ```
  - [ ] NEXT_PUBLIC_SUPABASE_URL: Present
  - [ ] SUPABASE_SERVICE_ROLE_KEY: Present
  - [ ] SUPABASE_ANON_KEY: Present

- [ ] **1.2** Supabase project accessible
  ```bash
  # Test connection
  node scripts/verify-env.js
  ```
  - Expected: ✅ Connection successful

- [ ] **1.3** Correct Supabase project selected
  - Project ID: `pvvnxupuukuefajypovz`
  - Project Name: Thandi G10-12 Guidance
  - Region: Verify correct region

---

### PHASE 2: Database Health (CRITICAL)

- [ ] **2.1** Database connectivity test
  ```bash
  node scripts/batch2-preflight-check.js
  ```
  - Expected: All connectivity checks pass

- [ ] **2.2** Current database state documented
  ```bash
  node scripts/check-current-data.js
  ```
  - [ ] institution_gates count: _____ records
  - [ ] g12_logistics count: _____ records
  - [ ] g10_correction_gates count: _____ records

- [ ] **2.3** No pending migrations or schema changes
  - Verify schema is stable
  - No ALTER TABLE operations in progress

- [ ] **2.4** Database performance baseline
  ```bash
  # Run performance test
  node scripts/test-query-performance.js
  ```
  - [ ] Average query time: < 200ms
  - [ ] P95 query time: < 500ms
  - [ ] No timeout errors

---

### PHASE 3: Batch 1 Stability (CRITICAL)

- [ ] **3.1** Batch 1 qualifications present and healthy
  ```bash
  node scripts/check-batch1-health.js
  ```
  - [ ] SAQA_94721 (Computer Science): Present
  - [ ] SAQA_48101 (Accounting): Present
  - [ ] SAQA_101980 (Law): Present
  - [ ] SAQA_101600 (Medicine): Present
  - [ ] SAQA_101433 (Engineering): Present

- [ ] **3.2** Batch 1 data integrity
  - [ ] No orphaned records
  - [ ] All foreign keys valid
  - [ ] JSON fields parseable

- [ ] **3.3** Batch 1 API endpoints functional
  ```bash
  node scripts/test-g10-12-api.js
  ```
  - Expected: All tests pass

- [ ] **3.4** No recent errors in Batch 1
  - Check Supabase logs for errors
  - Review last 24 hours of activity
  - Confirm error rate < 0.1%

---

### PHASE 4: Batch 2 Data Quality (CRITICAL)

- [ ] **4.1** SQL file validation
  - [ ] File exists: `.kiro/data/batch2/qualifications-seed-batch2.sql`
  - [ ] File size: ~45 KB (expected)
  - [ ] Contains 90 INSERT statements
  - [ ] Contains 15 unique SAQA IDs
  - [ ] No syntax errors

- [ ] **4.2** SAQA ID validation
  - [ ] All 15 SAQA IDs verified on SAQA.org.za
  - [ ] No duplicates with Batch 1
  - [ ] No duplicates within Batch 2
  - [ ] Format: SAQA_XXXXXX (6 digits)

- [ ] **4.3** APS score validation
  - [ ] All scores in range 20-45
  - [ ] Scores match 2025 prospectuses
  - [ ] No outliers or typos
  - [ ] Realistic distribution

- [ ] **4.4** Institution data validation
  - [ ] All institution names verified
  - [ ] All URLs accessible
  - [ ] Contact information current
  - [ ] Province codes valid (GP, WC, KZN, etc.)

- [ ] **4.5** JSON file validation
  ```bash
  node -e "JSON.parse(require('fs').readFileSync('.kiro/data/batch2/priority-qualifications-batch2.json'))"
  ```
  - [ ] JSON parseable
  - [ ] 15 qualifications present
  - [ ] All have tvet_alternative
  - [ ] All have online_alternative

---

### PHASE 5: Script Readiness (CRITICAL)

- [ ] **5.1** Deployment script ready
  - [ ] File exists: `scripts/deploy-batch2.js`
  - [ ] Syntax valid (ES module)
  - [ ] Dry-run mode functional
  - [ ] Error handling present

- [ ] **5.2** Verification script ready
  - [ ] File exists: `scripts/verify-batch2-deployment.js`
  - [ ] Syntax valid (ES module)
  - [ ] All checks implemented
  - [ ] Clear pass/fail output

- [ ] **5.3** Integration test script ready
  - [ ] File exists: `scripts/test-batch2-integration.js`
  - [ ] Covers all 15 qualifications
  - [ ] Tests cross-batch queries
  - [ ] Tests edge cases

- [ ] **5.4** Rollback script ready
  - [ ] Rollback procedure documented
  - [ ] SQL rollback statements prepared
  - [ ] Tested in development

---

### PHASE 6: Backup & Recovery (CRITICAL)

- [ ] **6.1** Pre-deployment backup created
  ```bash
  node scripts/backup-database.js --output=backup-pre-batch2-$(date +%Y%m%d).sql
  ```
  - [ ] Backup file created
  - [ ] Backup file size reasonable
  - [ ] Backup includes all tables

- [ ] **6.2** Backup restoration tested
  ```bash
  # Test in development environment
  node scripts/test-restore.js --backup=backup-pre-batch2-YYYYMMDD.sql
  ```
  - [ ] Restoration successful
  - [ ] Data integrity verified

- [ ] **6.3** Rollback procedure documented
  - [ ] Step-by-step instructions clear
  - [ ] SQL statements prepared
  - [ ] Estimated rollback time: < 5 minutes

---

### PHASE 7: Documentation (RECOMMENDED)

- [ ] **7.1** Deployment guide complete
  - [ ] File: `.kiro/data/batch2/DEPLOYMENT-GUIDE.md`
  - [ ] All steps documented
  - [ ] Screenshots/examples included

- [ ] **7.2** README updated
  - [ ] File: `.kiro/data/batch2/README.md`
  - [ ] Batch 2 overview clear
  - [ ] Quick start instructions

- [ ] **7.3** Authorization document signed
  - [ ] File: `.kiro/data/batch2/DEPLOYMENT-AUTHORIZATION.md`
  - [ ] All approvals obtained
  - [ ] Risk assessment complete

---

### PHASE 8: Team Readiness (RECOMMENDED)

- [ ] **8.1** Deployment team notified
  - [ ] Technical lead available
  - [ ] QA reviewer available
  - [ ] DevOps on standby

- [ ] **8.2** Communication channels ready
  - [ ] Slack #deployments active
  - [ ] Email notifications configured
  - [ ] Emergency contacts updated

- [ ] **8.3** Deployment window confirmed
  - [ ] Date: 2025-11-27
  - [ ] Time: 09:00 SAST
  - [ ] Duration: 15-30 minutes
  - [ ] Low-traffic period confirmed

---

### PHASE 9: Monitoring Setup (RECOMMENDED)

- [ ] **9.1** Error monitoring configured
  - [ ] Supabase logs accessible
  - [ ] Alert thresholds set
  - [ ] Notification channels active

- [ ] **9.2** Performance monitoring ready
  - [ ] Query performance tracking
  - [ ] Response time monitoring
  - [ ] Resource utilization tracking

- [ ] **9.3** User feedback collection ready
  - [ ] Feedback form accessible
  - [ ] Analytics tracking enabled
  - [ ] User testing protocol prepared

---

### PHASE 10: Final Verification (CRITICAL)

- [ ] **10.1** Run automated pre-flight check
  ```bash
  node scripts/batch2-preflight-check.js
  ```
  - [ ] All checks pass
  - [ ] Pass rate: 100%
  - [ ] No critical failures

- [ ] **10.2** Manual review complete
  - [ ] SQL file reviewed by 2nd person
  - [ ] Data sources verified
  - [ ] No last-minute changes

- [ ] **10.3** Go/No-Go decision
  - [ ] Technical lead: GO / NO-GO
  - [ ] QA reviewer: GO / NO-GO
  - [ ] Product owner: GO / NO-GO

---

## 📊 CHECKLIST SUMMARY

### Critical Checks
- **Total Critical Items**: 35
- **Completed**: _____ / 35
- **Pass Rate**: _____ %

### Recommended Checks
- **Total Recommended Items**: 15
- **Completed**: _____ / 15
- **Pass Rate**: _____ %

### Overall Status
- **Total Items**: 50
- **Completed**: _____ / 50
- **Overall Pass Rate**: _____ %

---

## 🎯 GO/NO-GO CRITERIA

### GO Decision Requirements
- ✅ All CRITICAL checks pass (100%)
- ✅ Overall pass rate ≥ 95%
- ✅ No blocking issues identified
- ✅ Team consensus: GO

### NO-GO Triggers
- ❌ Any CRITICAL check fails
- ❌ Overall pass rate < 95%
- ❌ Blocking issues identified
- ❌ Team consensus: NO-GO

---

## 📝 SIGN-OFF

### Technical Review
- **Reviewer Name**: _____________________
- **Date**: _____________________
- **Decision**: GO / NO-GO
- **Signature**: _____________________

### QA Review
- **Reviewer Name**: _____________________
- **Date**: _____________________
- **Decision**: GO / NO-GO
- **Signature**: _____________________

### Final Authorization
- **Authorized By**: _____________________
- **Date**: _____________________
- **Decision**: ✅ APPROVED / ❌ REJECTED
- **Signature**: _____________________

---

## 🚀 DEPLOYMENT COMMAND

Once all checks pass, execute:

```bash
# 1. Final dry run
node scripts/deploy-batch2.js --dry-run

# 2. Production deployment
node scripts/deploy-batch2.js --environment=production

# 3. Immediate verification
node scripts/verify-batch2-deployment.js

# 4. Integration tests
node scripts/test-batch2-integration.js
```

---

## 📞 EMERGENCY CONTACTS

### Escalation Path
1. **Technical Lead**: [Contact]
2. **DevOps Lead**: [Contact]
3. **CTO**: [Contact]

### Rollback Authority
- **Primary**: Technical Lead
- **Backup**: DevOps Lead

---

**Document Status**: ✅ READY FOR USE  
**Next Review**: Post-deployment (2025-11-27 16:00)  
**Version**: 1.0

