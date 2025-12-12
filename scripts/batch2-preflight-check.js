#!/usr/bin/env node

/**
 * BATCH 2 PRE-FLIGHT CHECK
 * Comprehensive validation before production deployment
 * 
 * Validates:
 * - Environment configuration
 * - Database connectivity and health
 * - Batch 1 stability
 * - Batch 2 data quality
 * - Script readiness
 * - Rollback procedures
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const checks = [];
let criticalFailure = false;

function logCheck(name, passed, details = '') {
  checks.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
  if (!passed) criticalFailure = true;
}

async function runPreflightChecks() {
  console.log('\n🚀 BATCH 2 PRE-FLIGHT CHECK');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('Date:', new Date().toISOString());
  console.log('Target: Production Deployment\n');

  // ============================================================
  // PHASE 1: ENVIRONMENT VALIDATION
  // ============================================================
  console.log('📋 PHASE 1: Environment Validation\n');

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let envCheck = true;
  requiredEnvVars.forEach(envVar => {
    const present = !!process.env[envVar];
    if (!present) envCheck = false;
    logCheck(`Environment: ${envVar}`, present);
  });

  // ============================================================
  // PHASE 2: DATABASE CONNECTIVITY
  // ============================================================
  console.log('\n📋 PHASE 2: Database Connectivity\n');

  try {
    const { data, error } = await supabase
      .from('institution_gates')
      .select('count')
      .limit(1);

    logCheck('Database connection', !error, error ? error.message : 'Active');

    if (!error) {
      // Check current record counts
      const { data: gatesData } = await supabase
        .from('institution_gates')
        .select('*');
      
      const { data: logisticsData } = await supabase
        .from('g12_logistics')
        .select('*');

      logCheck(
        'Current data state',
        true,
        `institution_gates: ${gatesData?.length || 0}, g12_logistics: ${logisticsData?.length || 0}`
      );
    }
  } catch (err) {
    logCheck('Database connection', false, err.message);
  }

  // ============================================================
  // PHASE 3: BATCH 1 HEALTH CHECK
  // ============================================================
  console.log('\n📋 PHASE 3: Batch 1 Health Check\n');

  try {
    // Verify Batch 1 qualifications are present
    const batch1Qualifications = [
      'SAQA_94721',  // Computer Science
      'SAQA_48101',  // Accounting
      'SAQA_101980', // Law
      'SAQA_101600', // Medicine
      'SAQA_101433'  // Engineering
    ];

    const { data: batch1Data } = await supabase
      .from('institution_gates')
      .select('qualification_id')
      .in('qualification_id', batch1Qualifications);

    const foundQuals = new Set(batch1Data?.map(r => r.qualification_id) || []);
    const allPresent = batch1Qualifications.every(q => foundQuals.has(q));

    logCheck(
      'Batch 1 qualifications present',
      allPresent,
      `${foundQuals.size}/5 qualifications found`
    );

    // Check for any errors in recent queries
    const { data: recentData, error: queryError } = await supabase
      .from('institution_gates')
      .select('*')
      .limit(10);

    logCheck('Batch 1 query performance', !queryError, queryError ? queryError.message : 'Healthy');

  } catch (err) {
    logCheck('Batch 1 health check', false, err.message);
  }

  // ============================================================
  // PHASE 4: BATCH 2 DATA VALIDATION
  // ============================================================
  console.log('\n📋 PHASE 4: Batch 2 Data Validation\n');

  // Check SQL file
  const sqlPath = '.kiro/data/batch2/qualifications-seed-batch2.sql';
  const sqlExists = fs.existsSync(sqlPath);
  logCheck('SQL file exists', sqlExists, sqlPath);

  if (sqlExists) {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Count INSERT statements
    const insertCount = (sqlContent.match(/INSERT INTO/g) || []).length;
    logCheck('SQL INSERT statements', insertCount === 90, `Found ${insertCount}/90 expected`);

    // Validate SAQA IDs
    const saqaIds = sqlContent.match(/SAQA_\d+/g) || [];
    const uniqueSaqaIds = [...new Set(saqaIds)];
    logCheck('Unique SAQA IDs', uniqueSaqaIds.length === 15, `Found ${uniqueSaqaIds.length}/15 expected`);

    // Check for Batch 1 conflicts
    const batch1Ids = ['SAQA_94721', 'SAQA_48101', 'SAQA_101980', 'SAQA_101600', 'SAQA_101433'];
    const hasConflicts = uniqueSaqaIds.some(id => batch1Ids.includes(id));
    logCheck('No Batch 1 conflicts', !hasConflicts, hasConflicts ? 'CONFLICT DETECTED' : 'Clean');

    // Validate APS scores
    const apsScores = sqlContent.match(/aps_min[,\s]+(\d+)/g) || [];
    const apsValues = apsScores.map(s => parseInt(s.match(/\d+/)[0]));
    const apsValid = apsValues.every(v => v >= 20 && v <= 45);
    logCheck(
      'APS scores realistic',
      apsValid,
      `Range: ${Math.min(...apsValues)}-${Math.max(...apsValues)}`
    );

    // Check file size
    const stats = fs.statSync(sqlPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    logCheck('SQL file size', stats.size > 40000 && stats.size < 50000, `${sizeKB} KB`);
  }

  // Check JSON file
  const jsonPath = '.kiro/data/batch2/priority-qualifications-batch2.json';
  const jsonExists = fs.existsSync(jsonPath);
  logCheck('JSON file exists', jsonExists, jsonPath);

  if (jsonExists) {
    try {
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      logCheck('JSON valid', true, `${jsonContent.length} qualifications`);
      
      // Validate structure
      const allHaveAlternatives = jsonContent.every(q => 
        q.tvet_alternative && q.online_alternative
      );
      logCheck('All qualifications have alternatives', allHaveAlternatives);
    } catch (err) {
      logCheck('JSON validation', false, err.message);
    }
  }

  // ============================================================
  // PHASE 5: SCRIPT READINESS
  // ============================================================
  console.log('\n📋 PHASE 5: Script Readiness\n');

  const requiredScripts = [
    'scripts/deploy-batch2.js',
    'scripts/verify-batch2-deployment.js',
    'scripts/test-batch2-integration.js'
  ];

  requiredScripts.forEach(scriptPath => {
    const exists = fs.existsSync(scriptPath);
    logCheck(`Script: ${path.basename(scriptPath)}`, exists);
  });

  // ============================================================
  // PHASE 6: DOCUMENTATION CHECK
  // ============================================================
  console.log('\n📋 PHASE 6: Documentation Check\n');

  const requiredDocs = [
    '.kiro/data/batch2/DEPLOYMENT-GUIDE.md',
    '.kiro/data/batch2/README.md',
    '.kiro/data/batch2/DEPLOYMENT-AUTHORIZATION.md'
  ];

  requiredDocs.forEach(docPath => {
    const exists = fs.existsSync(docPath);
    logCheck(`Documentation: ${path.basename(docPath)}`, exists);
  });

  // ============================================================
  // PHASE 7: ROLLBACK READINESS
  // ============================================================
  console.log('\n📋 PHASE 7: Rollback Readiness\n');

  // Check if we can create a backup
  try {
    const { data: backupTest } = await supabase
      .from('institution_gates')
      .select('*')
      .limit(1);
    
    logCheck('Backup capability', true, 'Database accessible for backup');
  } catch (err) {
    logCheck('Backup capability', false, err.message);
  }

  // Check rollback documentation
  const deploymentGuide = '.kiro/data/batch2/DEPLOYMENT-GUIDE.md';
  if (fs.existsSync(deploymentGuide)) {
    const content = fs.readFileSync(deploymentGuide, 'utf8');
    const hasRollback = content.includes('Rollback') || content.includes('rollback');
    logCheck('Rollback procedure documented', hasRollback);
  }

  // ============================================================
  // PHASE 8: PERFORMANCE BASELINE
  // ============================================================
  console.log('\n📋 PHASE 8: Performance Baseline\n');

  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .limit(50);
    const queryTime = Date.now() - startTime;

    logCheck(
      'Query performance baseline',
      queryTime < 500,
      `${queryTime}ms (target: <500ms)`
    );
  } catch (err) {
    logCheck('Query performance baseline', false, err.message);
  }

  // ============================================================
  // FINAL REPORT
  // ============================================================
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 PRE-FLIGHT CHECK RESULTS\n');

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  console.log(`Total Checks: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${totalCount - passedCount}`);
  console.log(`Pass Rate: ${passRate}%\n`);

  // Group by status
  const passed = checks.filter(c => c.passed);
  const failed = checks.filter(c => !c.passed);

  if (failed.length > 0) {
    console.log('❌ FAILED CHECKS:\n');
    failed.forEach(check => {
      console.log(`   • ${check.name}`);
      if (check.details) console.log(`     ${check.details}`);
    });
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════\n');

  // Final decision
  if (criticalFailure || passRate < 95) {
    console.log('🔴 NO-GO DECISION: Pre-flight checks failed\n');
    console.log('❌ DO NOT DEPLOY until all critical checks pass\n');
    console.log('💡 Action Items:');
    failed.forEach(check => {
      console.log(`   • Fix: ${check.name}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log('🟢 GO DECISION: All pre-flight checks passed\n');
    console.log('✅ Batch 2 is CLEARED FOR DEPLOYMENT\n');
    console.log('📝 Next Steps:');
    console.log('   1. Create database backup');
    console.log('   2. Execute: node scripts/deploy-batch2.js --dry-run');
    console.log('   3. Execute: node scripts/deploy-batch2.js --environment=production');
    console.log('   4. Execute: node scripts/verify-batch2-deployment.js');
    console.log('   5. Execute: node scripts/test-batch2-integration.js\n');
    console.log('⏰ Recommended deployment window: 09:00-09:30 SAST\n');
    process.exit(0);
  }
}

// Run the checks
runPreflightChecks().catch(err => {
  console.error('\n❌ Pre-flight check failed with error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
