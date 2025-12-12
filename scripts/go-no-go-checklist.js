#!/usr/bin/env node

/**
 * Go/No-Go Decision Checklist for Batch 1 Deployment
 * Must pass ALL checks before production deployment
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const checks = [];

async function runChecklist() {
  console.log('🎯 GO/NO-GO DECISION CHECKLIST\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Check 1: Environment variables
  console.log('1️⃣ Checking environment variables...');
  const envVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];
  const envCheck = envVars.every(v => process.env[v]);
  checks.push({ name: 'Environment variables set', passed: envCheck });
  console.log(envCheck ? '   ✅ PASS' : '   ❌ FAIL');

  // Check 2: SQL file exists
  console.log('\n2️⃣ Checking SQL seed file...');
  const sqlExists = fs.existsSync('.kiro/data/batch1/qualifications-seed-20-priority.sql');
  checks.push({ name: 'SQL seed file exists', passed: sqlExists });
  console.log(sqlExists ? '   ✅ PASS' : '   ❌ FAIL');

  // Check 3: Database connectivity
  console.log('\n3️⃣ Testing database connectivity...');
  try {
    const { error } = await supabase.from('institution_gates').select('count').limit(1);
    const dbCheck = !error;
    checks.push({ name: 'Database connectivity', passed: dbCheck });
    console.log(dbCheck ? '   ✅ PASS' : '   ❌ FAIL');
  } catch (err) {
    checks.push({ name: 'Database connectivity', passed: false });
    console.log('   ❌ FAIL');
  }

  // Check 4: SAQA IDs are unique in SQL
  console.log('\n4️⃣ Validating SAQA IDs...');
  const sqlContent = fs.readFileSync('.kiro/data/batch1/qualifications-seed-20-priority.sql', 'utf8');
  const saqaIds = sqlContent.match(/SAQA_\d+/g) || [];
  const uniqueSaqaIds = [...new Set(saqaIds)];
  const saqaCheck = uniqueSaqaIds.length === 5; // Should be exactly 5 unique IDs
  checks.push({ name: 'SAQA IDs unique (5 expected)', passed: saqaCheck });
  console.log(saqaCheck ? `   ✅ PASS (${uniqueSaqaIds.length} unique IDs)` : `   ❌ FAIL (${uniqueSaqaIds.length} IDs found)`);

  // Check 5: APS scores are realistic
  console.log('\n5️⃣ Validating APS scores...');
  const apsScores = sqlContent.match(/aps_min[,\s]+(\d+)/g) || [];
  const apsValues = apsScores.map(s => parseInt(s.match(/\d+/)[0]));
  const apsCheck = apsValues.every(v => v >= 20 && v <= 45);
  checks.push({ name: 'APS scores realistic (20-45)', passed: apsCheck });
  console.log(apsCheck ? `   ✅ PASS (range: ${Math.min(...apsValues)}-${Math.max(...apsValues)})` : '   ❌ FAIL');

  // Check 6: Integration test script exists
  console.log('\n6️⃣ Checking integration test script...');
  const testExists = fs.existsSync('scripts/test-batch1-integration.js');
  checks.push({ name: 'Integration test script exists', passed: testExists });
  console.log(testExists ? '   ✅ PASS' : '   ❌ FAIL');

  // Check 7: Deployment script exists
  console.log('\n7️⃣ Checking deployment script...');
  const deployExists = fs.existsSync('scripts/deploy-batch1.js');
  checks.push({ name: 'Deployment script exists', passed: deployExists });
  console.log(deployExists ? '   ✅ PASS' : '   ❌ FAIL');

  // Final decision
  console.log('\n═══════════════════════════════════════════════════');
  const allPassed = checks.every(c => c.passed);
  const passedCount = checks.filter(c => c.passed).length;
  
  console.log(`\n📊 RESULTS: ${passedCount}/${checks.length} checks passed\n`);
  
  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
  });

  console.log('\n═══════════════════════════════════════════════════');
  
  if (allPassed) {
    console.log('\n🟢 GO DECISION: All checks passed');
    console.log('✅ Cleared for deployment to production\n');
    console.log('📝 Next Steps:');
    console.log('   1. Execute SQL in Supabase SQL Editor');
    console.log('   2. Run: node scripts/deploy-batch1.js');
    console.log('   3. Run: node scripts/test-batch1-integration.js\n');
    process.exit(0);
  } else {
    console.log('\n🔴 NO-GO DECISION: Some checks failed');
    console.log('❌ DO NOT DEPLOY until all checks pass\n');
    console.log('💡 Fix the failed checks above before proceeding\n');
    process.exit(1);
  }
}

runChecklist().catch(err => {
  console.error('❌ Checklist failed:', err.message);
  process.exit(1);
});
