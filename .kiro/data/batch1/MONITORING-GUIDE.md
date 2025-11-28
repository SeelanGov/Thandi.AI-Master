# Batch 1 Monitoring & Alerting Guide

**Created:** 2025-11-25  
**Status:** Production Ready  
**Coverage:** 5 qualifications, 33 institutions, 5 logistics records

---

## 📊 Quick Start

### Daily Health Check (5 minutes)
```bash
node scripts/daily-health-check.js
```

Expected output: `✅ All checks passed - system healthy`

---

## 🔍 Monitoring Setup

### 1. Database Views (One-Time Setup)

Execute in Supabase SQL Editor:
```bash
# Navigate to: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new
# Copy and run: .kiro/data/batch1/monitoring-setup.sql
```

This creates 5 monitoring views:
- `batch1_health_status` - Overall qualification health
- `data_quality_check` - NULL value detection
- `orphaned_logistics` - Integrity checks
- `popular_institutions` - Query pattern analysis
- `aps_distribution` - Admission requirements spread

### 2. Automated Daily Checks

**Option A: Manual Execution**
```bash
node scripts/daily-health-check.js
```

**Option B: Cron Job (Recommended)**
```bash
# Add to crontab (runs daily at 08:00)
0 8 * * * cd /path/to/project && node scripts/daily-health-check.js >> logs/health-check.log 2>&1
```

**Option C: GitHub Actions**
```yaml
# .github/workflows/daily-health-check.yml
name: Daily Health Check
on:
  schedule:
    - cron: '0 8 * * *'  # 08:00 UTC daily
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/daily-health-check.js
```

---

## 🚨 Alert Thresholds

### Critical Alerts (Immediate Action Required)

| Alert | Threshold | Action |
|-------|-----------|--------|
| **Missing Qualifications** | Any qualification has 0 records | Check database, review recent changes |
| **Missing Logistics** | Any qualification missing g12_logistics | Re-run logistics seed script |
| **NULL APS Scores** | Any institution has NULL aps_min | Data validation, check recent inserts |
| **Edge Function Errors** | Error rate > 10% | Check logs, investigate root cause |

### Warning Alerts (Review Within 24 Hours)

| Alert | Threshold | Action |
|-------|-----------|--------|
| **Low Institution Count** | < 5 institutions for any qualification | Review data completeness |
| **NULL Subject Rules** | Any institution missing subject_rules | Validate data integrity |
| **Slow Response Times** | Avg response > 1000ms for 5 minutes | Check database indexes, edge function cold starts |
| **High Query Volume** | > 1000 queries/hour | Monitor for abuse, check rate limiting |

---

## 📋 Daily Monitoring Checklist

### Morning Check (08:00 - 08:15)

```bash
# 1. Run automated health check
node scripts/daily-health-check.js

# 2. Review Supabase Edge Function logs
# Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/functions
# Check: requirements-engine > Logs
# Look for: Errors, timeouts, unusual patterns

# 3. Check database health
# Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/database
# Run: SELECT * FROM batch1_health_status;
```

### Weekly Review (Every Monday)

```bash
# 1. Query pattern analysis
SELECT * FROM popular_institutions LIMIT 10;

# 2. APS distribution check
SELECT * FROM aps_distribution;

# 3. Performance trends
# Review avg response times over past 7 days
# Identify any degradation patterns

# 4. Data quality audit
SELECT * FROM data_quality_check;
```

### Monthly Review (First Monday of Month)

- Review all 5 qualifications for data accuracy
- Verify institution prospectuses haven't changed
- Update APS scores if universities published new requirements
- Check for new institutions offering these qualifications
- Review learner feedback for data gaps

---

## 🔧 Troubleshooting

### Issue: Missing Institution Records

**Symptoms:**
- Health check shows `institution_count < expected`
- Specific qualification has fewer institutions than deployed

**Diagnosis:**
```sql
-- Check what's in the database
SELECT qualification_id, COUNT(*) as count
FROM institution_gates
WHERE qualification_id LIKE 'SAQA_%'
GROUP BY qualification_id;
```

**Fix:**
```bash
# Re-run deployment verification
node scripts/deploy-batch1.js

# If records are missing, re-execute SQL
# Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new
# Run: .kiro/data/batch1/qualifications-seed-20-priority.sql
```

### Issue: NULL Values in Critical Fields

**Symptoms:**
- Data quality check shows `null_aps > 0` or `null_subjects > 0`

**Diagnosis:**
```sql
-- Find records with NULL values
SELECT * FROM institution_gates
WHERE aps_min IS NULL 
   OR subject_rules IS NULL 
   OR subject_rules = '[]'::jsonb
   OR provisional_offer_criteria IS NULL;
```

**Fix:**
```sql
-- Update specific records (example)
UPDATE institution_gates
SET aps_min = 28
WHERE qualification_id = 'SAQA_94721' 
  AND institution_name = 'University of Johannesburg'
  AND aps_min IS NULL;
```

### Issue: Slow Response Times

**Symptoms:**
- Integration tests show response times > 1000ms
- Edge function logs show timeout warnings

**Diagnosis:**
```bash
# Run performance test
node scripts/test-batch1-integration.js

# Check database indexes
# Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/database/indexes
```

**Fix:**
```sql
-- Add index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_institution_gates_qual_id 
ON institution_gates(qualification_id);

CREATE INDEX IF NOT EXISTS idx_institution_gates_institution 
ON institution_gates(institution_name);
```

### Issue: Missing Logistics Records

**Symptoms:**
- Health check shows `has_logistics = 'No'`
- Qualification queries fail to return calculation rules

**Diagnosis:**
```sql
-- Check logistics table
SELECT * FROM g12_logistics
WHERE qualification_id LIKE 'SAQA_%';
```

**Fix:**
```sql
-- Re-insert missing logistics (example for Computer Science)
INSERT INTO g12_logistics (qualification_id, aps_calculation, subject_weighting)
VALUES (
  'SAQA_94721',
  'sum_best_6',
  '{"Mathematics": 1.5, "Physical Science": 1.2}'::jsonb
);
```

---

## 📈 Performance Baselines

### Expected Metrics (Batch 1)

| Metric | Baseline | Threshold |
|--------|----------|-----------|
| **Avg Response Time** | 448ms | < 600ms |
| **P95 Response Time** | 510ms | < 1000ms |
| **P99 Response Time** | 2062ms | < 2500ms |
| **Error Rate** | 0% | < 5% |
| **Uptime** | 99.9% | > 99% |
| **Daily Queries** | ~165 | Monitor for spikes |

### Query Volume Estimates

- **Computer Science:** ~50 queries/day (most popular)
- **Accounting:** ~40 queries/day
- **Law:** ~35 queries/day
- **Medicine:** ~25 queries/day
- **Engineering:** ~15 queries/day

**Total:** ~165 queries/day × 30 days = 4,950 queries/month

---

## 🔔 Alert Notification Setup

### Supabase Webhooks (Recommended)

1. Navigate to: Database > Webhooks
2. Create webhook for `institution_gates` table
3. Trigger on: INSERT, UPDATE, DELETE
4. Send to: Your monitoring endpoint (e.g., Slack, Discord, email)

### Example Slack Webhook
```javascript
// webhook-handler.js
export default async function handler(req, res) {
  const { type, table, record } = req.body;
  
  if (type === 'DELETE' && table === 'institution_gates') {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 ALERT: Institution record deleted`,
        blocks: [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Qualification:* ${record.qualification_id}\n*Institution:* ${record.institution_name}`
          }
        }]
      })
    });
  }
  
  res.status(200).json({ received: true });
}
```

---

## 📝 Maintenance Schedule

### Daily (Automated)
- ✅ Health check script execution
- ✅ Edge function log review
- ✅ Error rate monitoring

### Weekly (Manual - 15 minutes)
- Query pattern analysis
- Performance trend review
- Data quality audit

### Monthly (Manual - 1 hour)
- Full data accuracy review
- Prospectus update check
- Learner feedback review
- Batch 2 preparation

### Quarterly (Manual - 2 hours)
- Comprehensive system audit
- Update all 20 qualifications
- Review and update monitoring thresholds
- Performance optimization

---

## 🎯 Success Metrics

### Batch 1 is Healthy When:

✅ All 5 qualifications have expected institution counts  
✅ Zero NULL values in critical fields  
✅ All logistics records present  
✅ Avg response time < 600ms  
✅ Error rate < 1%  
✅ Zero critical alerts in past 7 days  
✅ Learner queries returning accurate results  

---

## 📞 Escalation Path

### Level 1: Automated Alerts
- Daily health check failures
- Automated email/Slack notifications

### Level 2: Manual Investigation (You)
- Review logs and diagnostics
- Run troubleshooting scripts
- Attempt fixes from this guide

### Level 3: Database Administrator
- Complex SQL issues
- Performance optimization
- Schema migrations

### Level 4: System Architect
- Architectural changes needed
- Major performance issues
- Security concerns

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/pvvnxupuukuefajypovz
- **Edge Functions:** https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/functions
- **Database:** https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/database
- **SQL Editor:** https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new

---

**Last Updated:** 2025-11-25  
**Next Review:** 2025-12-02  
**Maintained By:** Development Team
