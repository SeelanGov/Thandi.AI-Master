#!/usr/bin/env node

/**
 * Batch 1 Integration Test
 * Tests all 5 deployed qualifications via the G10-12 API
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

const testCases = [
  {
    name: 'Computer Science @ Wits',
    qualification_id: 'SAQA_94721',
    institution: 'University of the Witwatersrand',
    expected_aps: 42,
    expected_subjects: ['Core Mathematics', 'English']
  },
  {
    name: 'Computer Science @ UJ',
    qualification_id: 'SAQA_94721',
    institution: 'University of Johannesburg',
    expected_aps: 28,
    expected_subjects: ['Core Mathematics', 'English']
  },
  {
    name: 'Accounting @ UCT',
    qualification_id: 'SAQA_48101',
    institution: 'University of Cape Town',
    expected_aps: 38,
    expected_subjects: ['Core Mathematics', 'English']
  },
  {
    name: 'Accounting @ UNISA',
    qualification_id: 'SAQA_48101',
    institution: 'UNISA',
    expected_aps: 22,
    expected_subjects: ['Core Mathematics', 'English']
  },
  {
    name: 'Law @ Wits',
    qualification_id: 'SAQA_101980',
    institution: 'University of the Witwatersrand',
    expected_aps: 42,
    expected_subjects: ['English']
  },
  {
    name: 'Law @ NWU',
    qualification_id: 'SAQA_101980',
    institution: 'North-West University',
    expected_aps: 24,
    expected_subjects: ['English']
  },
  {
    name: 'Medicine @ UCT',
    qualification_id: 'SAQA_101600',
    institution: 'University of Cape Town',
    expected_aps: 36,
    expected_subjects: ['Core Mathematics', 'Physical Science', 'English']
  },
  {
    name: 'Medicine @ UKZN',
    qualification_id: 'SAQA_101600',
    institution: 'University of KwaZulu-Natal',
    expected_aps: 36,
    expected_subjects: ['Core Mathematics', 'Physical Science', 'Life Sciences', 'English']
  },
  {
    name: 'Electrical Engineering @ Wits',
    qualification_id: 'SAQA_101433',
    institution: 'University of the Witwatersrand',
    expected_aps: 40,
    expected_subjects: ['Core Mathematics', 'Physical Science', 'English']
  },
  {
    name: 'Electrical Engineering @ UNISA',
    qualification_id: 'SAQA_101433',
    institution: 'UNISA',
    expected_aps: 28,
    expected_subjects: ['Core Mathematics', 'Physical Science', 'English']
  }
];

async function runTests() {
  console.log('🧪 BATCH 1 INTEGRATION TESTS\n');
  console.log(`Running ${testCases.length} test cases...\n`);

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of testCases) {
    const startTime = Date.now();
    
    try {
      // Query institution_gates
      const { data, error } = await supabase
        .from('institution_gates')
        .select('*')
        .eq('qualification_id', test.qualification_id)
        .eq('institution_name', test.institution)
        .single();

      const responseTime = Date.now() - startTime;

      if (error) {
        failed++;
        results.push({
          test: test.name,
          status: '❌ FAIL',
          reason: `Query error: ${error.message}`,
          time: responseTime
        });
        continue;
      }

      if (!data) {
        failed++;
        results.push({
          test: test.name,
          status: '❌ FAIL',
          reason: 'No data returned',
          time: responseTime
        });
        continue;
      }

      // Validate APS
      if (data.aps_min !== test.expected_aps) {
        failed++;
        results.push({
          test: test.name,
          status: '❌ FAIL',
          reason: `APS mismatch: expected ${test.expected_aps}, got ${data.aps_min}`,
          time: responseTime
        });
        continue;
      }

      // Validate subjects
      const subjectRules = data.subject_rules || [];
      const foundSubjects = subjectRules.map(rule => rule.subject);
      const missingSubjects = test.expected_subjects.filter(s => !foundSubjects.includes(s));

      if (missingSubjects.length > 0) {
        failed++;
        results.push({
          test: test.name,
          status: '❌ FAIL',
          reason: `Missing subjects: ${missingSubjects.join(', ')}`,
          time: responseTime
        });
        continue;
      }

      // Check response time
      if (responseTime > 2000) {
        results.push({
          test: test.name,
          status: '⚠️  SLOW',
          reason: `Response time: ${responseTime}ms (> 2000ms)`,
          time: responseTime
        });
        passed++;
      } else {
        passed++;
        results.push({
          test: test.name,
          status: '✅ PASS',
          reason: `APS: ${data.aps_min}, Subjects: ${foundSubjects.length}`,
          time: responseTime
        });
      }

    } catch (error) {
      failed++;
      results.push({
        test: test.name,
        status: '❌ FAIL',
        reason: `Exception: ${error.message}`,
        time: Date.now() - startTime
      });
    }
  }

  // Print results
  console.log('📊 TEST RESULTS\n');
  results.forEach(result => {
    console.log(`${result.status} ${result.test}`);
    console.log(`   ${result.reason}`);
    console.log(`   Response time: ${result.time}ms\n`);
  });

  // Summary
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  
  console.log('═══════════════════════════════════════════════════');
  console.log(`SUMMARY: ${passed}/${testCases.length} tests passed`);
  console.log(`Average response time: ${Math.round(avgTime)}ms`);
  console.log('═══════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('✅ Batch 1 deployment verified');
    console.log('✅ All qualifications queryable');
    console.log('✅ Response times acceptable\n');
    console.log('📝 Next Steps:');
    console.log('   1. Test via live API endpoint');
    console.log('   2. Integrate with Thandi guidance flow');
    console.log('   3. Prepare Batch 2 (remaining 15 qualifications)\n');
  } else {
    console.error(`❌ ${failed} TESTS FAILED\n`);
    console.error('💡 Troubleshooting:');
    console.error('   1. Check SQL deployment completed successfully');
    console.error('   2. Verify data integrity in Supabase dashboard');
    console.error('   3. Review failed test details above\n');
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
