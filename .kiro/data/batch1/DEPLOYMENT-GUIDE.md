# Batch 1 Deployment Guide

## Overview

Batch 1 contains **5 priority qualifications** with **33 institution records** and **5 logistics entries**. This represents a **10x improvement** in data coverage for the G10-12 Guidance Engine.

## Package Contents

### Qualifications Included

1. **BSc Computer Science** (SAQA_94721)
   - 7 institutions: Wits, UJ, UP, UCT, UNISA, NWU, UKZN
   - Query volume: 1,247 learners
   - APS range: 24-42

2. **BCom Accounting** (SAQA_48101)
   - 7 institutions: UJ, UP, Wits, UCT, UNISA, NWU, UKZN
   - Query volume: 892 learners
   - APS range: 22-38

3. **LLB Bachelor of Laws** (SAQA_101980)
   - 7 institutions: UJ, Wits, UP, UCT, UNISA, NWU, UKZN
   - Query volume: 765 learners
   - APS range: 24-42

4. **MBChB Medicine** (SAQA_101600)
   - 5 institutions: UCT, Wits, UP, UKZN, NWU
   - Query volume: 1,103 learners
   - APS range: 36 (uniform)

5. **BSc Engineering (Electrical)** (SAQA_101433)
   - 7 institutions: UCT, UJ, UP, Wits, UKZN, NWU, UNISA
   - Query volume: 956 learners
   - APS range: 28-40

### Data Quality

✅ **All data verified from 2025 official prospectuses**
✅ **SAQA IDs validated against SAQA.org.za**
✅ **Life Orientation excluded from all APS calculations**
✅ **Provisional offer criteria included**
✅ **NBT requirements specified**
✅ **Alternative pathways documented**

## Deployment Steps

### Step 1: Pre-Deployment Verification

```bash
# Verify environment variables
node scripts/verify-env.js

# Check database connectivity
node scripts/test-g10-12-diagnostic.js
```

Expected: Current diagnostic data (3 records) should be queryable.

### Step 2: Execute SQL Deployment

**Manual SQL Execution Required:**

1. Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new
2. Copy entire contents of: `.kiro/data/batch1/qualifications-seed-20-priority.sql`
3. Click "Run" to execute
4. Verify: "Success. No rows returned" message

**What the SQL does:**
- Deletes old diagnostic data (SAQA_94721, SAQA_53477)
- Inserts 33 institution_gates records
- Inserts 5 g12_logistics records

### Step 3: Verify Deployment

```bash
# Run automated verification
node scripts/deploy-batch1.js

# Expected output:
# ✅ BSc Computer Science: 7 institutions
# ✅ BCom Accounting: 7 institutions
# ✅ LLB Bachelor of Laws: 7 institutions
# ✅ MBChB Medicine: 5 institutions
# ✅ BSc Engineering Electrical: 7 institutions
# ✅ 5/5 logistics records found
```

### Step 4: Integration Testing

```bash
# Run comprehensive integration tests
node scripts/test-batch1-integration.js

# Expected: 10/10 tests passed
# Average response time: < 500ms
```

### Step 5: Live API Testing

```bash
# Test via production endpoint
curl -X POST https://thandiai.vercel.app/api/g10-12 \
  -H "Content-Type: application/json" \
  -d '{
    "learner_grade": 11,
    "subjects": ["Core Mathematics", "Physical Science"],
    "maths_score": 65,
    "institution": "University of the Witwatersrand",
    "career_interests": ["Computer Science"]
  }'

# Expected: Specific requirements for Wits CS (APS 42, Maths 70%)
```

## Success Criteria

- [ ] 33 institution records inserted
- [ ] 5 logistics records inserted
- [ ] All 5 qualifications queryable
- [ ] Integration tests: 10/10 passed
- [ ] Average response time < 2 seconds
- [ ] Live API returns specific guidance (not generic)

## Rollback Procedure

If deployment fails:

```sql
-- Rollback to diagnostic data
DELETE FROM g12_logistics WHERE qualification_id IN ('SAQA_94721', 'SAQA_48101', 'SAQA_101980', 'SAQA_101600', 'SAQA_101433');
DELETE FROM institution_gates WHERE qualification_id IN ('SAQA_94721', 'SAQA_48101', 'SAQA_101980', 'SAQA_101600', 'SAQA_101433');

-- Restore diagnostic records
-- (Copy from .kiro/specs/g10-12-guidance-engine/schema.sql)
```

## Troubleshooting

### Issue: SQL execution fails

**Symptoms:** Constraint violation errors

**Solution:**
1. Check for duplicate qualification_id + institution_name combinations
2. Verify foreign key constraints are satisfied
3. Ensure g12_logistics references valid qualification_ids

### Issue: Verification shows missing records

**Symptoms:** Expected 33 institutions, found fewer

**Solution:**
1. Check Supabase logs for failed INSERT statements
2. Verify SQL file was copied completely
3. Re-run SQL execution

### Issue: Integration tests fail

**Symptoms:** Query errors or data mismatches

**Solution:**
1. Verify data was inserted correctly via Supabase dashboard
2. Check for JSON parsing errors in subject_rules
3. Validate SAQA IDs match exactly

## Post-Deployment

### Monitoring

```bash
# Check system status
node scripts/system-status-report.js

# Monitor query performance
node scripts/test-g10-12-api.js
```

### Next Steps

1. **Integrate with Thandi guidance flow**
   - Update RAG system to call G10-12 API
   - Merge requirements data with career guidance
   - Test end-to-end learner queries

2. **Prepare Batch 2**
   - Package remaining 15 qualifications
   - Apply same quality standards
   - Target deployment: 48 hours after Batch 1

3. **User Acceptance Testing**
   - Test with real learner queries
   - Validate guidance accuracy
   - Collect feedback for improvements

## Data Sources

All data verified from official 2025 prospectuses:

- **Wits:** https://www.wits.ac.za/media/wits-university/faculties-and-schools/science/documents/Science-UG-Information-Booklet-2025.pdf
- **UJ:** https://www.uj.ac.za/wp-content/uploads/2024/03/uj-undergraduate-prospectus-2025.pdf
- **UP:** https://www.up.ac.za/media/shared/368/Faculty%20Brochures/2025/up_ug-prospectus-2025_nsc-ieb_devv5_web.zp246017.pdf
- **UCT:** https://uct.ac.za/sites/default/files/media/documents/uct_ac_za/49/2025_ug_prospectus.pdf
- **UNISA:** https://www.unisa.ac.za/static/corporate_web/Content/Colleges/CSET/documents/2025%20CSET%20Prospectus.pdf
- **NWU:** https://studies.nwu.ac.za/sites/studies.nwu.ac.za/files/files/undergrad/2025/2025Grade-12-Prospectus.pdf
- **UKZN:** https://ww1.applications.ukzn.ac.za/wp-content/uploads/2024/08/Undergrad2025-Web-latest.pdf

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Supabase logs
3. Consult G10-12 engine documentation: `.kiro/docs/g10-12-engine.md`
