/**
 * FINAL PRE-FLIGHT CHECK
 * Ultra-minimal verification before student testing
 * 
 * Run: node scripts/final-pre-flight-check.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('');
console.log('🚀 FINAL PRE-FLIGHT CHECK');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

let allPassed = true;

// ============================================================================
// CHECK 1: Schema Join Verification (CRITICAL)
// ============================================================================

console.log('🔍 CHECK 1: Schema Join Verification (CRITICAL)');
console.log('Testing if g12_logistics can be joined to institution_gates...');
console.log('');

try {
  // Test the EXACT query pattern the RAG/assessment uses
  const { data, error } = await supabase
    .from('institution_gates')
    .select('qualification_id, qualification_name, institution_name, aps_min, g12_logistics(*)')
    .eq('qualification_id', 'SAQA_101600')
    .limit(1);
  
  if (error) {
    console.log('❌ SCHEMA MISMATCH:', error.message);
    console.log('');
    console.log('⚠️  CRITICAL: The join between institution_gates and g12_logistics failed.');
    console.log('   Students will NOT see NBT requirements, calculation methods, or deadlines.');
    console.log('');
    console.log('🛑 STOP: Fix this before student testing!');
    allPassed = false;
  } else if (data && data.length > 0) {
    const record = data[0];
    
    if (record.g12_logistics && record.g12_logistics.nbt_required !== undefined) {
      console.log('✅ JOIN WORKING: Medicine data accessible');
      console.log(`   Institution: ${record.institution_name}`);
      console.log(`   APS: ${record.aps_min}`);
      console.log(`   NBT Required: ${record.g12_logistics.nbt_required}`);
      console.log(`   Calculation Method: ${record.g12_logistics.calculation_method || 'N/A'}`);
      console.log('');
      console.log('✅ PASS: Schema join is working correctly');
    } else {
      console.log('⚠️  Logistics not joined properly');
      console.log('   Record found but g12_logistics data missing');
      console.log('');
      console.log('⚠️  WARNING: Students may not see complete logistics info');
      allPassed = false;
    }
  } else {
    console.log('⚠️  No data returned from query');
    allPassed = false;
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

console.log('');

// ============================================================================
// CHECK 2: Medicine Complete Data
// ============================================================================

console.log('🏥 CHECK 2: Medicine Complete Data');
console.log('Verifying Medicine has all required data...');
console.log('');

try {
  // Check institution_gates
  const { data: institutions } = await supabase
    .from('institution_gates')
    .select('*')
    .eq('qualification_id', 'SAQA_101600');
  
  // Check g12_logistics
  const { data: logistics } = await supabase
    .from('g12_logistics')
    .select('*')
    .eq('qualification_id', 'SAQA_101600')
    .single();
  
  console.log(`Institutions: ${institutions.length}/5`);
  console.log(`Logistics: ${logistics ? '1/1' : '0/1'}`);
  
  if (institutions.length === 5 && logistics) {
    console.log('');
    console.log('✅ PASS: Medicine fully configured');
  } else {
    console.log('');
    console.log('⚠️  WARNING: Medicine incomplete');
    allPassed = false;
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

console.log('');

// ============================================================================
// CHECK 3: All 20 Qualifications Present
// ============================================================================

console.log('📊 CHECK 3: All 20 Qualifications');
console.log('Verifying complete qualification set...');
console.log('');

try {
  const { data } = await supabase
    .from('institution_gates')
    .select('qualification_id, qualification_name');
  
  const unique = {};
  data.forEach(r => unique[r.qualification_id] = r.qualification_name);
  const count = Object.keys(unique).length;
  
  console.log(`Qualifications: ${count}/20`);
  
  if (count === 20) {
    console.log('');
    console.log('✅ PASS: All 20 qualifications present');
  } else {
    console.log('');
    console.log(`⚠️  WARNING: Only ${count}/20 qualifications`);
    allPassed = false;
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

console.log('');

// ============================================================================
// CHECK 4: Database Connection Speed
// ============================================================================

console.log('⚡ CHECK 4: Database Response Time');
console.log('Testing query performance...');
console.log('');

try {
  const startTime = Date.now();
  
  await supabase
    .from('institution_gates')
    .select('*')
    .eq('qualification_id', 'SAQA_94721')
    .limit(5);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`Response time: ${duration}ms`);
  
  if (duration < 2000) {
    console.log('');
    console.log('✅ PASS: Response time acceptable (<2s)');
  } else {
    console.log('');
    console.log('⚠️  WARNING: Slow response time (>2s)');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

console.log('');

// ============================================================================
// FINAL VERDICT
// ============================================================================

console.log('═══════════════════════════════════════════════════════════');
console.log('📋 FINAL VERDICT');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

if (allPassed) {
  console.log('🎉 ✅ ALL CHECKS PASSED');
  console.log('');
  console.log('🟢 READY FOR STUDENT TESTING');
  console.log('');
  console.log('Next Steps:');
  console.log('  1. Test manually on desktop (5 min)');
  console.log('  2. Test manually on mobile (5 min)');
  console.log('  3. If both pass → Test with Sitara');
  console.log('');
  console.log('Testing URL: https://thandiai.vercel.app/assessment');
} else {
  console.log('🛑 ❌ SOME CHECKS FAILED');
  console.log('');
  console.log('🟡 FIX ISSUES BEFORE TESTING');
  console.log('');
  console.log('Review the failures above and fix before proceeding.');
  console.log('');
  console.log('Critical Issues:');
  console.log('  • Schema join problems will prevent students from seeing');
  console.log('    NBT requirements, calculation methods, and deadlines');
  console.log('  • Missing qualifications will limit career options');
  console.log('');
  console.log('Run this script again after fixes.');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
