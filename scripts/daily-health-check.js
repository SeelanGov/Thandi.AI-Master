#!/usr/bin/env node

/**
 * Daily Health Check Script
 * Monitors Batch 1 deployment health and data quality
 * 
 * Run: node scripts/daily-health-check.js
 * Schedule: Daily at 08:00 via cron
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runHealthChecks() {
  console.log('🏥 DAILY HEALTH CHECK - Batch 1 Deployment');
  console.log(`📅 Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`⏰ Time: ${new Date().toLocaleTimeString()}\n`);

  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    status: 'healthy',
    alerts: []
  };

  // ============================================
  // CHECK 1: Batch 1 Health Status
  // ============================================
  console.log('1️⃣ Checking Batch 1 qualification health...');
  
  const qualifications = [
    { id: 'SAQA_94721', name: 'BSc Computer Science', expected: 7 },
    { id: 'SAQA_48101', name: 'BCom Accounting', expected: 7 },
    { id: 'SAQA_101980', name: 'LLB Bachelor of Laws', expected: 7 },
    { id: 'SAQA_101600', name: 'MBChB Medicine', expected: 5 },
    { id: 'SAQA_101433', name: 'BSc Engineering Electrical', expected: 7 }
  ];

  for (const qual of qualifications) {
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .eq('qualification_id', qual.id);

    if (error) {
      results.alerts.push({
        severity: 'critical',
        check: 'qualification_health',
        message: `${qual.name}: Query error - ${error.message}`
      });
      results.status = 'unhealthy';
      console.log(`   ❌ ${qual.name}: Query error`);
    } else if (!data || data.length === 0) {
      results.alerts.push({
        severity: 'critical',
        check: 'qualification_health',
        message: `${qual.name}: No records found (expected ${qual.expected})`
      });
      results.status = 'unhealthy';
      console.log(`   ❌ ${qual.name}: No records found`);
    } else if (data.length < qual.expected) {
      results.alerts.push({
        severity: 'warning',
        check: 'qualification_health',
        message: `${qual.name}: ${data.length}/${qual.expected} institutions (missing ${qual.expected - data.length})`
      });
      if (results.status === 'healthy') results.status = 'degraded';
      console.log(`   ⚠️  ${qual.name}: ${data.length}/${qual.expected} institutions`);
    } else {
      console.log(`   ✅ ${qual.name}: ${data.length} institutions`);
    }

    results.checks.push({
      qualification: qual.name,
      expected: qual.expected,
      actual: data?.length || 0,
      status: data?.length === qual.expected ? 'pass' : 'fail'
    });
  }

  // ============================================
  // CHECK 2: Data Quality - NULL Values
  // ============================================
  console.log('\n2️⃣ Checking data quality (NULL values)...');
  
  const { data: nullCheck, error: nullError } = await supabase
    .from('institution_gates')
    .select('*')
    .like('qualification_id', 'SAQA_%');

  if (nullError) {
    results.alerts.push({
      severity: 'critical',
      check: 'data_quality',
      message: `NULL check failed: ${nullError.message}`
    });
    console.log('   ❌ NULL check query failed');
  } else {
    const nullAps = nullCheck.filter(r => r.aps_min === null).length;
    const nullSubjects = nullCheck.filter(r => !r.subject_rules || r.subject_rules.length === 0).length;
    const nullCriteria = nullCheck.filter(r => !r.provisional_offer_criteria).length;

    if (nullAps > 0 || nullSubjects > 0 || nullCriteria > 0) {
      results.alerts.push({
        severity: 'warning',
        check: 'data_quality',
        message: `NULL values found: APS=${nullAps}, Subjects=${nullSubjects}, Criteria=${nullCriteria}`
      });
      if (results.status === 'healthy') results.status = 'degraded';
      console.log(`   ⚠️  NULL values: APS=${nullAps}, Subjects=${nullSubjects}, Criteria=${nullCriteria}`);
    } else {
      console.log('   ✅ No NULL values in critical fields');
    }
  }

  // ============================================
  // CHECK 3: Logistics Records
  // ============================================
  console.log('\n3️⃣ Checking logistics records...');
  
  let logisticsCount = 0;
  for (const qual of qualifications) {
    const { data, error } = await supabase
      .from('g12_logistics')
      .select('*')
      .eq('qualification_id', qual.id);

    if (error || !data || data.length === 0) {
      results.alerts.push({
        severity: 'critical',
        check: 'logistics',
        message: `${qual.name}: Missing logistics record`
      });
      results.status = 'unhealthy';
      console.log(`   ❌ ${qual.name}: Missing logistics`);
    } else {
      logisticsCount++;
      console.log(`   ✅ ${qual.name}: Logistics found`);
    }
  }

  console.log(`   📊 Total: ${logisticsCount}/5 logistics records`);

  // ============================================
  // CHECK 4: Edge Function Logs (Manual)
  // ============================================
  console.log('\n4️⃣ Edge Function logs check...');
  console.log('   ℹ️  Manual check required:');
  console.log('   → Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/functions');
  console.log('   → Check: requirements-engine logs for errors');
  console.log('   → Look for: 500 errors, timeouts, or high response times\n');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════════════');
  console.log(`HEALTH STATUS: ${results.status.toUpperCase()}`);
  console.log(`Total Checks: ${results.checks.length}`);
  console.log(`Alerts: ${results.alerts.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (results.alerts.length > 0) {
    console.log('🚨 ALERTS:\n');
    results.alerts.forEach((alert, i) => {
      const icon = alert.severity === 'critical' ? '❌' : '⚠️';
      console.log(`${i + 1}. ${icon} [${alert.severity.toUpperCase()}] ${alert.check}`);
      console.log(`   ${alert.message}\n`);
    });
  } else {
    console.log('✅ All checks passed - system healthy\n');
  }

  // ============================================
  // RECOMMENDATIONS
  // ============================================
  if (results.status !== 'healthy') {
    console.log('💡 RECOMMENDED ACTIONS:\n');
    
    if (results.alerts.some(a => a.check === 'qualification_health')) {
      console.log('   • Review institution_gates table for missing records');
      console.log('   • Check for accidental deletions or failed insertions');
      console.log('   • Run: node scripts/check-current-data.js\n');
    }
    
    if (results.alerts.some(a => a.check === 'data_quality')) {
      console.log('   • Investigate NULL values in critical fields');
      console.log('   • Review recent data updates or migrations');
      console.log('   • Consider running data validation script\n');
    }
    
    if (results.alerts.some(a => a.check === 'logistics')) {
      console.log('   • Verify g12_logistics table integrity');
      console.log('   • Check foreign key constraints');
      console.log('   • Re-run logistics seed if necessary\n');
    }
  }

  // ============================================
  // NEXT STEPS
  // ============================================
  console.log('📝 DAILY CHECKLIST:\n');
  console.log('   [ ] Review Edge Function logs for errors');
  console.log('   [ ] Check API performance dashboard');
  console.log('   [ ] Monitor learner query patterns');
  console.log('   [ ] Verify no data gaps reported\n');

  // Exit with appropriate code
  if (results.status === 'unhealthy') {
    process.exit(1);
  } else if (results.status === 'degraded') {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

runHealthChecks().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
