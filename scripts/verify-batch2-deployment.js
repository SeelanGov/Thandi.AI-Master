#!/usr/bin/env node

/**
 * Batch 2 Deployment Verification Script
 * Verifies that Batch 2 was deployed correctly
 * 
 * Usage:
 *   node scripts/verify-batch2-deployment.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected values
const BATCH2_QUALIFICATIONS = [
  'SAQA_84706',  // BPharm Pharmacy
  'SAQA_10218',  // BEd Teaching
  'SAQA_94738',  // BSc Nursing
  'SAQA_99615',  // BArch Architecture
  'SAQA_89275',  // BCom Economics
  'SAQA_101957', // BSc Agriculture
  'SAQA_90844',  // BSW Social Work
  'SAQA_101738', // BSc Psychology
  'SAQA_23375',  // BA Journalism
  'SAQA_89378',  // BVSc Veterinary Science
  'SAQA_101600', // BDS Dental Surgery
  'SAQA_101615', // BPhysio Physiotherapy
  'SAQA_101602', // BRad Radiography
  'SAQA_101603', // BComp Med Complementary Medicine
  'SAQA_101690'  // BEMC Emergency Medical Care
];

const EXPECTED_INSTITUTION_GATES = 75;
const EXPECTED_G12_LOGISTICS = 15;

console.log('\n🔍 Batch 2 Deployment Verification\n');
console.log('   Time:', new Date().toISOString());
console.log('   Environment:', process.env.NODE_ENV || 'production');
console.log('\n');

let allChecksPassed = true;

async function checkRecordCounts() {
  console.log('📊 Checking record counts...\n');
  
  // Check institution_gates
  const { data: gatesData, error: gatesError } = await supabase
    .from('institution_gates')
    .select('qualification_id')
    .in('qualification_id', BATCH2_QUALIFICATIONS);
  
  if (gatesError) {
    console.error('   ❌ Error querying institution_gates:', gatesError.message);
    allChecksPassed = false;
    return;
  }
  
  const gatesCount = gatesData.length;
  if (gatesCount === EXPECTED_INSTITUTION_GATES) {
    console.log(`   ✅ institution_gates: ${gatesCount}/${EXPECTED_INSTITUTION_GATES} records`);
  } else {
    console.error(`   ❌ institution_gates: ${gatesCount}/${EXPECTED_INSTITUTION_GATES} records (MISMATCH)`);
    allChecksPassed = false;
  }
  
  // Check g12_logistics
  const { data: logisticsData, error: logisticsError } = await supabase
    .from('g12_logistics')
    .select('qualification_id')
    .in('qualification_id', BATCH2_QUALIFICATIONS);
  
  if (logisticsError) {
    console.error('   ❌ Error querying g12_logistics:', logisticsError.message);
    allChecksPassed = false;
    return;
  }
  
  const logisticsCount = logisticsData.length;
  if (logisticsCount === EXPECTED_G12_LOGISTICS) {
    console.log(`   ✅ g12_logistics: ${logisticsCount}/${EXPECTED_G12_LOGISTICS} records`);
  } else {
    console.error(`   ❌ g12_logistics: ${logisticsCount}/${EXPECTED_G12_LOGISTICS} records (MISMATCH)`);
    allChecksPassed = false;
  }
  
  console.log('');
}

async function checkQualificationCoverage() {
  console.log('🎯 Checking qualification coverage...\n');
  
  for (const qualId of BATCH2_QUALIFICATIONS) {
    const { data, error } = await supabase
      .from('institution_gates')
      .select('institution_name')
      .eq('qualification_id', qualId);
    
    if (error) {
      console.error(`   ❌ ${qualId}: Error - ${error.message}`);
      allChecksPassed = false;
      continue;
    }
    
    if (!data || data.length === 0) {
      console.error(`   ❌ ${qualId}: No institutions found`);
      allChecksPassed = false;
    } else {
      console.log(`   ✅ ${qualId}: ${data.length} institutions`);
    }
  }
  
  console.log('');
}

async function checkDataIntegrity() {
  console.log('🔒 Checking data integrity...\n');
  
  // Check for orphaned g12_logistics records
  const { data: orphaned, error: orphanedError } = await supabase
    .from('g12_logistics')
    .select('qualification_id')
    .in('qualification_id', BATCH2_QUALIFICATIONS);
  
  if (orphanedError) {
    console.error('   ❌ Error checking orphaned records:', orphanedError.message);
    allChecksPassed = false;
  } else {
    const orphanedIds = orphaned.map(r => r.qualification_id);
    const missingInGates = orphanedIds.filter(id => {
      return !BATCH2_QUALIFICATIONS.includes(id);
    });
    
    if (missingInGates.length === 0) {
      console.log('   ✅ No orphaned g12_logistics records');
    } else {
      console.error(`   ❌ ${missingInGates.length} orphaned g12_logistics records found`);
      allChecksPassed = false;
    }
  }
  
  // Check for duplicate SAQA IDs
  const { data: duplicates, error: duplicatesError } = await supabase
    .from('institution_gates')
    .select('qualification_id, institution_name')
    .in('qualification_id', BATCH2_QUALIFICATIONS);
  
  if (duplicatesError) {
    console.error('   ❌ Error checking duplicates:', duplicatesError.message);
    allChecksPassed = false;
  } else {
    const seen = new Set();
    const dupes = [];
    
    duplicates.forEach(record => {
      const key = `${record.qualification_id}-${record.institution_name}`;
      if (seen.has(key)) {
        dupes.push(key);
      }
      seen.add(key);
    });
    
    if (dupes.length === 0) {
      console.log('   ✅ No duplicate qualification-institution pairs');
    } else {
      console.error(`   ❌ ${dupes.length} duplicate pairs found`);
      allChecksPassed = false;
    }
  }
  
  // Check APS ranges
  const { data: apsData, error: apsError } = await supabase
    .from('institution_gates')
    .select('qualification_id, institution_name, aps_min')
    .in('qualification_id', BATCH2_QUALIFICATIONS);
  
  if (apsError) {
    console.error('   ❌ Error checking APS ranges:', apsError.message);
    allChecksPassed = false;
  } else {
    const invalidAps = apsData.filter(r => r.aps_min < 0 || r.aps_min > 42);
    
    if (invalidAps.length === 0) {
      console.log('   ✅ All APS scores within valid range (0-42)');
    } else {
      console.error(`   ❌ ${invalidAps.length} records with invalid APS scores`);
      allChecksPassed = false;
    }
  }
  
  console.log('');
}

async function checkSampleQueries() {
  console.log('🧪 Testing sample queries...\n');
  
  // Test 1: Query by qualification
  const { data: test1, error: error1 } = await supabase
    .from('institution_gates')
    .select('*')
    .eq('qualification_id', 'SAQA_84706');
  
  if (error1 || !test1 || test1.length === 0) {
    console.error('   ❌ Test 1 failed: Query by qualification_id');
    allChecksPassed = false;
  } else {
    console.log(`   ✅ Test 1 passed: Query by qualification_id (${test1.length} results)`);
  }
  
  // Test 2: Query by APS range
  const { data: test2, error: error2 } = await supabase
    .from('institution_gates')
    .select('*')
    .in('qualification_id', BATCH2_QUALIFICATIONS)
    .gte('aps_min', 25)
    .lte('aps_min', 30);
  
  if (error2 || !test2) {
    console.error('   ❌ Test 2 failed: Query by APS range');
    allChecksPassed = false;
  } else {
    console.log(`   ✅ Test 2 passed: Query by APS range (${test2.length} results)`);
  }
  
  // Test 3: Join with g12_logistics
  const { data: test3, error: error3 } = await supabase
    .from('institution_gates')
    .select(`
      *,
      g12_logistics (*)
    `)
    .eq('qualification_id', 'SAQA_84706')
    .limit(1)
    .single();
  
  if (error3 || !test3 || !test3.g12_logistics) {
    console.error('   ❌ Test 3 failed: Join with g12_logistics');
    allChecksPassed = false;
  } else {
    console.log('   ✅ Test 3 passed: Join with g12_logistics');
  }
  
  console.log('');
}

async function generateSummary() {
  console.log('📋 Deployment Summary\n');
  
  // Get total counts
  const { count: totalGates } = await supabase
    .from('institution_gates')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalLogistics } = await supabase
    .from('g12_logistics')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Total institution_gates: ${totalGates}`);
  console.log(`   Total g12_logistics: ${totalLogistics}`);
  console.log(`   Batch 2 qualifications: ${BATCH2_QUALIFICATIONS.length}`);
  console.log('');
  
  if (allChecksPassed) {
    console.log('✅ ALL VERIFICATION CHECKS PASSED\n');
    console.log('   Batch 2 deployment is successful and verified.');
    console.log('   System is ready for production use.\n');
    return 0;
  } else {
    console.log('❌ SOME VERIFICATION CHECKS FAILED\n');
    console.log('   Please review the errors above and take corrective action.');
    console.log('   Consider rolling back the deployment if issues are critical.\n');
    return 1;
  }
}

async function main() {
  try {
    await checkRecordCounts();
    await checkQualificationCoverage();
    await checkDataIntegrity();
    await checkSampleQueries();
    const exitCode = await generateSummary();
    process.exit(exitCode);
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED\n');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
