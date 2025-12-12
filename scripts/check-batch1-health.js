#!/usr/bin/env node

/**
 * Batch 1 Health Check
 * Verifies Batch 1 is stable before Batch 2 deployment
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const batch1Qualifications = [
  { id: 'SAQA_94721', name: 'BSc Computer Science' },
  { id: 'SAQA_48101', name: 'BCom Accounting' },
  { id: 'SAQA_101980', name: 'LLB Bachelor of Laws' },
  { id: 'SAQA_101600', name: 'MBChB Medicine' },
  { id: 'SAQA_101433', name: 'BSc Engineering Electrical' }
];

async function checkBatch1Health() {
  console.log('\n🏥 BATCH 1 HEALTH CHECK');
  console.log('═══════════════════════════════════════════════════\n');

  let allHealthy = true;

  // Check each qualification
  console.log('📋 Checking Batch 1 Qualifications:\n');

  for (const qual of batch1Qualifications) {
    try {
      // Check institution_gates
      const { data: gatesData, error: gatesError } = await supabase
        .from('institution_gates')
        .select('*')
        .eq('qualification_id', qual.id);

      if (gatesError) {
        console.log(`❌ ${qual.name} (${qual.id})`);
        console.log(`   Error: ${gatesError.message}`);
        allHealthy = false;
        continue;
      }

      // Check g12_logistics
      const { data: logisticsData, error: logisticsError } = await supabase
        .from('g12_logistics')
        .select('*')
        .eq('qualification_id', qual.id);

      if (logisticsError) {
        console.log(`❌ ${qual.name} (${qual.id})`);
        console.log(`   Error: ${logisticsError.message}`);
        allHealthy = false;
        continue;
      }

      const gatesCount = gatesData?.length || 0;
      const logisticsCount = logisticsData?.length || 0;

      if (gatesCount === 0) {
        console.log(`⚠️  ${qual.name} (${qual.id})`);
        console.log(`   Warning: No institution gates found`);
        allHealthy = false;
      } else if (logisticsCount === 0) {
        console.log(`⚠️  ${qual.name} (${qual.id})`);
        console.log(`   Warning: No logistics record found`);
        allHealthy = false;
      } else {
        console.log(`✅ ${qual.name} (${qual.id})`);
        console.log(`   Gates: ${gatesCount}, Logistics: ${logisticsCount}`);
      }

    } catch (err) {
      console.log(`❌ ${qual.name} (${qual.id})`);
      console.log(`   Error: ${err.message}`);
      allHealthy = false;
    }
  }

  // Performance check
  console.log('\n⚡ Performance Check:\n');

  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .in('qualification_id', batch1Qualifications.map(q => q.id))
      .limit(50);

    const queryTime = Date.now() - startTime;

    if (error) {
      console.log(`❌ Query failed: ${error.message}`);
      allHealthy = false;
    } else {
      console.log(`✅ Query successful`);
      console.log(`   Response time: ${queryTime}ms`);
      console.log(`   Records returned: ${data?.length || 0}`);

      if (queryTime > 500) {
        console.log(`   ⚠️  Warning: Query time > 500ms`);
      }
    }
  } catch (err) {
    console.log(`❌ Performance check failed: ${err.message}`);
    allHealthy = false;
  }

  // Data integrity check
  console.log('\n🔍 Data Integrity Check:\n');

  try {
    // Check for orphaned logistics records
    const { data: allLogistics } = await supabase
      .from('g12_logistics')
      .select('qualification_id');

    const { data: allGates } = await supabase
      .from('institution_gates')
      .select('qualification_id');

    const logisticsIds = new Set(allLogistics?.map(r => r.qualification_id) || []);
    const gatesIds = new Set(allGates?.map(r => r.qualification_id) || []);

    const orphanedLogistics = [...logisticsIds].filter(id => !gatesIds.has(id));

    if (orphanedLogistics.length > 0) {
      console.log(`⚠️  Orphaned logistics records found: ${orphanedLogistics.length}`);
      console.log(`   IDs: ${orphanedLogistics.join(', ')}`);
    } else {
      console.log(`✅ No orphaned records`);
    }

    // Check for duplicate records
    const { data: duplicateCheck } = await supabase
      .from('institution_gates')
      .select('qualification_id, institution_name')
      .in('qualification_id', batch1Qualifications.map(q => q.id));

    const seen = new Set();
    const duplicates = [];

    duplicateCheck?.forEach(record => {
      const key = `${record.qualification_id}:${record.institution_name}`;
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    });

    if (duplicates.length > 0) {
      console.log(`⚠️  Duplicate records found: ${duplicates.length}`);
      allHealthy = false;
    } else {
      console.log(`✅ No duplicate records`);
    }

  } catch (err) {
    console.log(`❌ Integrity check failed: ${err.message}`);
    allHealthy = false;
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════');

  if (allHealthy) {
    console.log('\n🟢 BATCH 1 HEALTHY');
    console.log('✅ All checks passed');
    console.log('✅ Safe to proceed with Batch 2 deployment\n');
    process.exit(0);
  } else {
    console.log('\n🔴 BATCH 1 ISSUES DETECTED');
    console.log('❌ Some checks failed');
    console.log('⚠️  Fix Batch 1 issues before deploying Batch 2\n');
    process.exit(1);
  }
}

checkBatch1Health().catch(err => {
  console.error('\n❌ Health check failed:', err.message);
  process.exit(1);
});
