#!/usr/bin/env node

/**
 * BATCH 2 INTEGRATION TEST
 * Tests end-to-end functionality after Batch 2 deployment
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runIntegrationTests() {
  console.log('\n🧪 BATCH 2 INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Verify all Batch 2 qualifications are present
  console.log('Test 1: Verify Batch 2 qualifications present');
  try {
    const batch2Qualifications = [
      'SAQA_84706',  // Pharmacy
      'SAQA_10218',  // Teaching
      'SAQA_94738',  // Nursing
      'SAQA_99615',  // Architecture
      'SAQA_89275',  // Economics
      'SAQA_101957', // Agriculture
      'SAQA_90844',  // Social Work
      'SAQA_101738', // Psychology
      'SAQA_23375',  // Journalism
      'SAQA_89378',  // Veterinary
      'SAQA_101601', // Dental Surgery (FIXED)
      'SAQA_101615', // Physiotherapy
      'SAQA_101602', // Radiography
      'SAQA_101603', // Complementary Medicine
      'SAQA_101690'  // Emergency Medical Care
    ];

    const { data, error } = await supabase
      .from('institution_gates')
      .select('qualification_id')
      .in('qualification_id', batch2Qualifications);

    const foundQuals = new Set(data?.map(r => r.qualification_id) || []);
    const allPresent = batch2Qualifications.every(q => foundQuals.has(q));

    if (allPresent) {
      console.log('✅ PASS: All 15 Batch 2 qualifications found\n');
      passed++;
    } else {
      console.log('❌ FAIL: Missing qualifications:', 
        batch2Qualifications.filter(q => !foundQuals.has(q)));
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    failed++;
  }

  // Test 2: Verify Batch 1 still intact
  console.log('Test 2: Verify Batch 1 integrity');
  try {
    const batch1Qualifications = [
      'SAQA_94721',  // Computer Science
      'SAQA_48101',  // Accounting
      'SAQA_101980', // Law
      'SAQA_101600', // Medicine
      'SAQA_101433'  // Engineering
    ];

    const { data, error } = await supabase
      .from('institution_gates')
      .select('qualification_id')
      .in('qualification_id', batch1Qualifications);

    const foundQuals = new Set(data?.map(r => r.qualification_id) || []);
    const allPresent = batch1Qualifications.every(q => foundQuals.has(q));

    if (allPresent) {
      console.log('✅ PASS: All 5 Batch 1 qualifications still present\n');
      passed++;
    } else {
      console.log('❌ FAIL: Batch 1 data corrupted');
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    failed++;
  }

  // Test 3: Query performance
  console.log('Test 3: Query performance');
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('institution_gates')
      .select('*')
      .limit(100);
    const queryTime = Date.now() - startTime;

    if (queryTime < 500) {
      console.log(`✅ PASS: Query time ${queryTime}ms (< 500ms)\n`);
      passed++;
    } else {
      console.log(`❌ FAIL: Query time ${queryTime}ms (too slow)\n`);
      failed++;
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    failed++;
  }

  // Final report
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED\n');
    process.exit(0);
  } else {
    console.log('❌ INTEGRATION TESTS FAILED\n');
    process.exit(1);
  }
}

runIntegrationTests().catch(err => {
  console.error('❌ Integration test error:', err.message);
  process.exit(1);
});
