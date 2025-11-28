# Batch 2 Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Verification
```bash
# Verify Supabase connection
node scripts/verify-env.js

# Check database schema
node scripts/check-schema.js

# Verify Batch 1 is stable
node scripts/check-batch1-health.js
```

### 2. File Integrity Check
```bash
# Verify SQL file syntax
cat .kiro/data/batch2/qualifications-seed-batch2.sql | wc -l
# Expected: ~450 lines

# Verify JSON structure
node -e "console.log(JSON.parse(require('fs').readFileSync('.kiro/data/batch2/priority-qualifications-batch2.json')).length)"
# Expected: 15

# Check for duplicate SAQA IDs
grep "SAQA_" .kiro/data/batch2/qualifications-seed-batch2.sql | sort | uniq -d
# Expected: No output (no duplicates)
```

### 3. Record Count Verification
```bash
# Count institution_gates records
grep "INSERT INTO institution_gates" .kiro/data/batch2/qualifications-seed-batch2.sql | wc -l
# Expected: 75

# Count g12_logistics records
grep "INSERT INTO g12_logistics" .kiro/data/batch2/qualifications-seed-batch2.sql | wc -l
# Expected: 15
```

## Deployment Steps

### Step 1: Backup Current Database
```bash
# Create backup
node scripts/backup-database.js --output=backup-pre-batch2-$(date +%Y%m%d).sql

# Verify backup
ls -lh backup-pre-batch2-*.sql
```

### Step 2: Deploy to Staging (Optional but Recommended)
```bash
# Set staging environment
export SUPABASE_URL=$SUPABASE_STAGING_URL
export SUPABASE_KEY=$SUPABASE_STAGING_KEY

# Deploy to staging
node scripts/deploy-batch2.js --environment=staging

# Run staging tests
node scripts/test-batch2-integration.js --environment=staging
```

### Step 3: Deploy to Production
```bash
# Set production environment
export SUPABASE_URL=$SUPABASE_PROD_URL
export SUPABASE_KEY=$SUPABASE_PROD_KEY

# Deploy Batch 2
node scripts/deploy-batch2.js --environment=production

# Expected output:
# ✓ Connected to Supabase
# ✓ Inserted 75 institution_gates records
# ✓ Inserted 15 g12_logistics records
# ✓ Deployment complete
```

### Step 4: Immediate Verification
```bash
# Verify record counts
node scripts/verify-batch2-deployment.js

# Expected output:
# ✓ institution_gates: 75 new records (Total: 105)
# ✓ g12_logistics: 15 new records (Total: 20)
# ✓ All SAQA IDs unique
# ✓ No orphaned records
```

### Step 5: Integration Testing
```bash
# Test API endpoints
node scripts/test-batch2-api.js

# Test queries for each qualification
node scripts/test-batch2-queries.js

# Test cross-batch queries
node scripts/test-cross-batch.js
```

## Post-Deployment Monitoring

### First Hour
```bash
# Monitor error rates
node scripts/monitor-errors.js --duration=1h

# Check API response times
node scripts/monitor-performance.js --duration=1h

# Verify no regressions in Batch 1
node scripts/check-batch1-health.js
```

### First 24 Hours
```bash
# Run daily health check
node scripts/daily-health-check.js

# Monitor query patterns
node scripts/analyze-query-patterns.js --batch=2

# Check for data quality issues
node scripts/check-data-quality.js --batch=2
```

### First Week
```bash
# Weekly summary report
node scripts/weekly-summary.js --batch=2

# User feedback analysis
node scripts/analyze-feedback.js --batch=2

# Performance benchmarking
node scripts/benchmark-batch2.js
```

## Rollback Procedure

### If Issues Detected
```bash
# 1. Stop accepting new queries (optional)
node scripts/maintenance-mode.js --enable

# 2. Restore from backup
node scripts/restore-database.js --backup=backup-pre-batch2-YYYYMMDD.sql

# 3. Verify restoration
node scripts/verify-restoration.js

# 4. Resume normal operations
node scripts/maintenance-mode.js --disable

# 5. Document issues
node scripts/create-incident-report.js --batch=2
```

### Partial Rollback (Remove Specific Qualifications)
```sql
-- Remove specific qualification
DELETE FROM institution_gates WHERE qualification_id = 'SAQA_XXXXX';
DELETE FROM g12_logistics WHERE qualification_id = 'SAQA_XXXXX';

-- Verify removal
SELECT COUNT(*) FROM institution_gates WHERE qualification_id = 'SAQA_XXXXX';
-- Expected: 0
```

## Troubleshooting

### Issue: Duplicate Key Errors
```bash
# Check for existing records
node scripts/check-existing-records.js --batch=2

# Solution: Remove duplicates before deployment
node scripts/remove-duplicates.js --batch=2
```

### Issue: Foreign Key Violations
```bash
# Check schema constraints
node scripts/check-constraints.js

# Solution: Verify schema compatibility
node scripts/verify-schema-compatibility.js --batch=2
```

### Issue: Slow Query Performance
```bash
# Analyze query performance
node scripts/analyze-query-performance.js --batch=2

# Solution: Add indexes if needed
node scripts/add-indexes.js --batch=2
```

### Issue: Data Quality Problems
```bash
# Run data quality checks
node scripts/check-data-quality.js --batch=2 --verbose

# Solution: Fix specific records
node scripts/fix-data-quality.js --qualification=SAQA_XXXXX
```

## Success Criteria

### Deployment Success
- ✅ 75 institution_gates records inserted
- ✅ 15 g12_logistics records inserted
- ✅ No duplicate SAQA IDs
- ✅ No orphaned records
- ✅ All foreign keys valid
- ✅ API endpoints responding correctly

### Performance Success
- ✅ Query response time < 200ms (p95)
- ✅ Error rate < 0.1%
- ✅ No regressions in Batch 1 performance
- ✅ Database size increase < 5MB

### Data Quality Success
- ✅ All APS scores within valid range (0-42)
- ✅ All subject_rules valid JSON
- ✅ All institutions exist in reference table
- ✅ All SAQA IDs verified against SAQA.org.za

## Communication Plan

### Pre-Deployment
- [ ] Notify team of deployment window
- [ ] Update status page
- [ ] Prepare rollback plan

### During Deployment
- [ ] Post deployment start notification
- [ ] Monitor deployment progress
- [ ] Post deployment completion notification

### Post-Deployment
- [ ] Send deployment summary
- [ ] Share monitoring dashboard
- [ ] Schedule post-deployment review

## Deployment Timeline

### Recommended Window
- **Day**: Tuesday or Wednesday
- **Time**: 10:00-12:00 SAST (low traffic period)
- **Duration**: 30 minutes
- **Monitoring**: 24 hours post-deployment

### Critical Path
1. Backup (5 min)
2. Deploy (10 min)
3. Verify (10 min)
4. Test (5 min)
5. Monitor (ongoing)

## Contact Information

### Deployment Team
- **Lead**: [Name]
- **Backup**: [Name]
- **On-Call**: [Name]

### Escalation Path
1. Development Team
2. Technical Lead
3. CTO

### Emergency Contacts
- **Database Admin**: [Contact]
- **DevOps**: [Contact]
- **Product Owner**: [Contact]

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-26 20:00  
**Next Review**: Before deployment
