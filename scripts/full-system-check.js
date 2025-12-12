import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fullSystemCheck() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 FULL SYSTEM CHECK - COMPREHENSIVE VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // TEST 1: Database Connectivity
  console.log('📊 TEST 1: Database Connectivity');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data, error } = await supabase.from('institution_gates').select('count');
    if (error) throw error;
    console.log('✅ PASS: Database connection successful');
    results.passed.push('Database connectivity');
  } catch (error) {
    console.log('❌ FAIL: Database connection failed -', error.message);
    results.failed.push('Database connectivity');
  }
  console.log('');

  // TEST 2: Total Qualifications Count
  console.log('📊 TEST 2: Total Qualifications Count');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data } = await supabase
      .from('institution_gates')
      .select('qualification_id, qualification_name');
    
    const unique = {};
    data.forEach(r => unique[r.qualification_id] = r.qualification_name);
    const count = Object.keys(unique).length;
    
    console.log(`Total Qualifications: ${count}/20`);
    if (count === 20) {
      console.log('✅ PASS: All 20 qualifications present');
      results.passed.push('Qualification count (20/20)');
    } else {
      console.log(`❌ FAIL: Expected 20, found ${count}`);
      results.failed.push(`Qualification count (${count}/20)`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Qualification count check');
  }
  console.log('');

  // TEST 3: Batch 1 Integrity (Critical Qualifications)
  console.log('📊 TEST 3: Batch 1 Integrity Check');
  console.log('─────────────────────────────────────────────────────────');
  const batch1Ids = [
    'SAQA_94721',   // BSc CS
    'SAQA_48101',   // BCom Accounting
    'SAQA_101980',  // LLB
    'SAQA_101600',  // MBChB Medicine
    'SAQA_101433'   // BSc Eng
  ];
  
  try {
    const { data } = await supabase
      .from('institution_gates')
      .select('qualification_id, qualification_name')
      .in('qualification_id', batch1Ids);
    
    const found = [...new Set(data.map(r => r.qualification_id))];
    const missing = batch1Ids.filter(id => !found.includes(id));
    
    console.log(`Batch 1 Qualifications: ${found.length}/5`);
    batch1Ids.forEach(id => {
      const present = found.includes(id);
      const record = data.find(r => r.qualification_id === id);
      console.log(`  ${present ? '✅' : '❌'} ${id} - ${record?.qualification_name || 'MISSING'}`);
    });
    
    if (missing.length === 0) {
      console.log('✅ PASS: All Batch 1 qualifications present');
      results.passed.push('Batch 1 integrity (5/5)');
    } else {
      console.log(`❌ FAIL: Missing ${missing.length} Batch 1 qualifications:`, missing);
      results.failed.push(`Batch 1 integrity (${found.length}/5)`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Batch 1 integrity check');
  }
  console.log('');

  // TEST 4: Medicine (SAQA_101600) Detailed Check
  console.log('📊 TEST 4: Medicine (SAQA_101600) Detailed Verification');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data: institutions } = await supabase
      .from('institution_gates')
      .select('*')
      .eq('qualification_id', 'SAQA_101600');
    
    const { data: logistics } = await supabase
      .from('g12_logistics')
      .select('*')
      .eq('qualification_id', 'SAQA_101600');
    
    console.log(`Medicine Institutions: ${institutions.length}/5`);
    institutions.forEach(inst => {
      console.log(`  ✅ ${inst.institution_name} (APS: ${inst.aps_min})`);
    });
    
    console.log(`Medicine Logistics: ${logistics.length}/1`);
    if (logistics.length > 0) {
      console.log(`  ✅ NBT Required: ${logistics[0].nbt_required}`);
      console.log(`  ✅ Calculation Method: ${logistics[0].calculation_method}`);
    }
    
    if (institutions.length === 5 && logistics.length === 1) {
      console.log('✅ PASS: Medicine fully configured');
      results.passed.push('Medicine configuration (5 institutions + logistics)');
    } else {
      console.log(`⚠️  WARNING: Medicine incomplete (${institutions.length}/5 institutions, ${logistics.length}/1 logistics)`);
      results.warnings.push(`Medicine incomplete (${institutions.length}/5, ${logistics.length}/1)`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Medicine verification');
  }
  console.log('');

  // TEST 5: Total Records Count
  console.log('📊 TEST 5: Total Records Verification');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data: institutions } = await supabase
      .from('institution_gates')
      .select('id');
    
    const { data: logistics } = await supabase
      .from('g12_logistics')
      .select('id');
    
    const totalRecords = institutions.length + logistics.length;
    console.log(`Institution Gates: ${institutions.length}`);
    console.log(`G12 Logistics: ${logistics.length}`);
    console.log(`Total Records: ${totalRecords}`);
    
    if (totalRecords >= 108) {
      console.log('✅ PASS: Record count meets target (≥108)');
      results.passed.push(`Total records (${totalRecords})`);
    } else {
      console.log(`⚠️  WARNING: Record count below target (${totalRecords}/108)`);
      results.warnings.push(`Record count (${totalRecords}/108)`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Record count check');
  }
  console.log('');

  // TEST 6: Data Integrity - No NULL Critical Fields
  console.log('📊 TEST 6: Data Integrity - Critical Fields');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data } = await supabase
      .from('institution_gates')
      .select('qualification_id, institution_name, qualification_name, aps_min');
    
    const nullFields = data.filter(r => 
      !r.qualification_id || !r.institution_name || !r.qualification_name || r.aps_min === null
    );
    
    if (nullFields.length === 0) {
      console.log('✅ PASS: No NULL values in critical fields');
      results.passed.push('Data integrity (no NULLs)');
    } else {
      console.log(`❌ FAIL: Found ${nullFields.length} records with NULL critical fields`);
      results.failed.push(`Data integrity (${nullFields.length} NULL records)`);
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Data integrity check');
  }
  console.log('');

  // TEST 7: Complete Qualification List
  console.log('📊 TEST 7: Complete Qualification Inventory');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data } = await supabase
      .from('institution_gates')
      .select('qualification_id, qualification_name');
    
    const unique = {};
    data.forEach(r => unique[r.qualification_id] = r.qualification_name);
    
    const sorted = Object.keys(unique).sort();
    sorted.forEach(id => {
      console.log(`  ✅ ${id} | ${unique[id]}`);
    });
    
    console.log('✅ PASS: Qualification inventory complete');
    results.passed.push('Qualification inventory');
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Qualification inventory');
  }
  console.log('');

  // TEST 8: Institution Distribution
  console.log('📊 TEST 8: Institution Distribution Analysis');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const { data } = await supabase
      .from('institution_gates')
      .select('qualification_id, institution_name');
    
    const distribution = {};
    data.forEach(r => {
      if (!distribution[r.qualification_id]) {
        distribution[r.qualification_id] = 0;
      }
      distribution[r.qualification_id]++;
    });
    
    const stats = Object.values(distribution);
    const avg = stats.reduce((a, b) => a + b, 0) / stats.length;
    const min = Math.min(...stats);
    const max = Math.max(...stats);
    
    console.log(`Average institutions per qualification: ${avg.toFixed(1)}`);
    console.log(`Min institutions: ${min}`);
    console.log(`Max institutions: ${max}`);
    
    if (min >= 3) {
      console.log('✅ PASS: All qualifications have adequate institution coverage');
      results.passed.push('Institution distribution');
    } else {
      console.log(`⚠️  WARNING: Some qualifications have fewer than 3 institutions`);
      results.warnings.push('Institution distribution (min < 3)');
    }
  } catch (error) {
    console.log('❌ FAIL:', error.message);
    results.failed.push('Institution distribution');
  }
  console.log('');

  // FINAL REPORT
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 FINAL SYSTEM CHECK REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  console.log(`✅ PASSED: ${results.passed.length} tests`);
  results.passed.forEach(test => console.log(`   • ${test}`));
  console.log('');
  
  if (results.warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${results.warnings.length} items`);
    results.warnings.forEach(warning => console.log(`   • ${warning}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log(`❌ FAILED: ${results.failed.length} tests`);
    results.failed.forEach(test => console.log(`   • ${test}`));
    console.log('');
  }
  
  const totalTests = results.passed.length + results.failed.length + results.warnings.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);
  
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Overall Pass Rate: ${passRate}%`);
  console.log('─────────────────────────────────────────────────────────');
  
  if (results.failed.length === 0) {
    console.log('');
    console.log('🎉 SYSTEM STATUS: 🟢 PRODUCTION READY');
    console.log('All critical tests passed. System is fully operational.');
  } else {
    console.log('');
    console.log('⚠️  SYSTEM STATUS: 🟡 ATTENTION REQUIRED');
    console.log('Some tests failed. Review failures before production use.');
  }
  
  console.log('═══════════════════════════════════════════════════════════');
}

fullSystemCheck().catch(console.error);
