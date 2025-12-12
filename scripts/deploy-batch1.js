#!/usr/bin/env node

/**
 * Batch 1 Deployment Script
 * Deploys 5 priority qualifications with 33 institution records
 * 
 * Qualifications:
 * - SAQA_94721: BSc Computer Science (7 institutions)
 * - SAQA_48101: BCom Accounting (7 institutions)
 * - SAQA_101980: LLB Bachelor of Laws (7 institutions)
 * - SAQA_101600: MBChB Medicine (5 institutions)
 * - SAQA_101433: BSc Engineering Electrical (7 institutions)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { execSync } from 'child_process';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deployBatch1() {
  console.log('🚀 BATCH 1 DEPLOYMENT: 5 Priority Qualifications\n');
  console.log('📦 Package Contents:');
  console.log('   - BSc Computer Science (7 institutions)');
  console.log('   - BCom Accounting (7 institutions)');
  console.log('   - LLB Bachelor of Laws (7 institutions)');
  console.log('   - MBChB Medicine (5 institutions)');
  console.log('   - BSc Engineering Electrical (7 institutions)');
  console.log('   Total: 33 institution records + 5 logistics entries\n');

  // Step 1: Execute SQL file directly
  console.log('1️⃣ Executing SQL deployment...');
  console.log('   📋 MANUAL STEP REQUIRED:');
  console.log('   1. Visit: https://supabase.com/dashboard/project/pvvnxupuukuefajypovz/sql/new');
  console.log('   2. Copy contents of: .kiro/data/batch1/qualifications-seed-20-priority.sql');
  console.log('   3. Execute the SQL');
  console.log('   4. Return here and press Enter to verify\n');
  
  // Wait for user confirmation
  console.log('⏸️  Waiting for manual SQL execution...');
  console.log('   Press Enter when complete...');
  
  // In automated mode, skip the wait
  if (process.env.AUTO_DEPLOY !== 'true') {
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
  }

  // Step 2: Verify deployment
  console.log('\n2️⃣ Verifying deployment...');
  
  const qualifications = [
    { id: 'SAQA_94721', name: 'BSc Computer Science', expected: 7 },
    { id: 'SAQA_48101', name: 'BCom Accounting', expected: 7 },
    { id: 'SAQA_101980', name: 'LLB Bachelor of Laws', expected: 7 },
    { id: 'SAQA_101600', name: 'MBChB Medicine', expected: 5 },
    { id: 'SAQA_101433', name: 'BSc Engineering Electrical', expected: 7 }
  ];
  
  let totalInstitutions = 0;
  let allPassed = true;
  
  for (const qual of qualifications) {
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .eq('qualification_id', qual.id);
    
    if (error) {
      console.error(`   ❌ ${qual.name}: Query error - ${error.message}`);
      allPassed = false;
    } else if (!data || data.length === 0) {
      console.error(`   ❌ ${qual.name}: No records found`);
      allPassed = false;
    } else if (data.length !== qual.expected) {
      console.warn(`   ⚠️  ${qual.name}: ${data.length}/${qual.expected} institutions (expected ${qual.expected})`);
      totalInstitutions += data.length;
    } else {
      console.log(`   ✅ ${qual.name}: ${data.length} institutions`);
      totalInstitutions += data.length;
    }
  }

  // Verify logistics
  console.log('\n3️⃣ Verifying logistics...');
  
  let logisticsCount = 0;
  for (const qual of qualifications) {
    const { data, error } = await supabase
      .from('g12_logistics')
      .select('*')
      .eq('qualification_id', qual.id);
    
    if (error) {
      console.error(`   ❌ ${qual.name}: Logistics query error`);
      allPassed = false;
    } else if (!data || data.length === 0) {
      console.error(`   ❌ ${qual.name}: No logistics record`);
      allPassed = false;
    } else {
      logisticsCount++;
    }
  }
  
  console.log(`   ✅ ${logisticsCount}/5 logistics records found\n`);

  if (allPassed && totalInstitutions === 33 && logisticsCount === 5) {
    console.log('🎉 BATCH 1 DEPLOYMENT COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Institution records: ${totalInstitutions}/33 ✅`);
    console.log(`   - Logistics records: ${logisticsCount}/5 ✅`);
    console.log(`   - Qualifications: 5 ✅`);
    console.log('\n✅ System ready for testing');
    console.log('\n📝 Next Steps:');
    console.log('   1. Run: node scripts/test-batch1-integration.js');
    console.log('   2. Verify all 5 qualifications return specific guidance');
    console.log('   3. Check response times < 2 seconds\n');
  } else {
    console.error('\n❌ DEPLOYMENT VERIFICATION FAILED');
    console.error(`   Expected: 33 institutions, 5 logistics`);
    console.error(`   Found: ${totalInstitutions} institutions, ${logisticsCount} logistics`);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check SQL execution completed without errors');
    console.error('   2. Verify all INSERT statements ran successfully');
    console.error('   3. Check for constraint violations in Supabase logs\n');
    process.exit(1);
  }
}

deployBatch1().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
