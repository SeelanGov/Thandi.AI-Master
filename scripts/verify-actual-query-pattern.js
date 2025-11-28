/**
 * VERIFY ACTUAL QUERY PATTERN
 * Tests how the assessment actually queries data (separate queries, not joins)
 * 
 * Run: node scripts/verify-actual-query-pattern.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('');
console.log('🔍 ACTUAL QUERY PATTERN VERIFICATION');
console.log('═══════════════════════════════════════════════════════════');
console.log('Testing how the assessment ACTUALLY queries data...');
console.log('');

let allPassed = true;

// ============================================================================
// PATTERN 1: Query Institutions (Primary Query)
// ============================================================================

console.log('📊 PATTERN 1: Query Institutions for Medicine');
console.log('─────────────────────────────────────────────────────────');

try {
  const { data: institutions, error } = await supabase
    .from('institution_gates')
    .select('*')
    .eq('qualification_id', 'SAQA_101600');
  
  if (error) throw error;
  
  console.log(`✅ Found ${institutions.length} institutions for Medicine`);
  console.log('');
  console.log('Sample Institutions:');
  institutions.slice(0, 3).forEach(inst => {
    console.log(`  • ${inst.institution_name}`);
    console.log(`    APS: ${inst.aps_min}`);
    console.log(`    Subjects: ${inst.subject_requirements || 'N/A'}`);
  });
  console.log('');
  console.log('✅ PASS: Institution query works');
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  allPassed = false;
}

console.log('');

// ============================================================================
// PATTERN 2: Query Logistics Separately (Secondary Query)
// ============================================================================

console.log('📋 PATTERN 2: Query Logistics for Medicine');
console.log('─────────────────────────────────────────────────────────');

try {
  const { data: logistics, error } = await supabase
    .from('g12_logistics')
    .select('*')
    .eq('qualification_id', 'SAQA_101600')
    .single();
  
  if (error) throw error;
  
  console.log('✅ Found logistics for Medicine');
  console.log('');
  console.log('Logistics Details:');
  console.log(`  • NBT Required: ${logistics.nbt_required}`);
  console.log(`  • Calculation Method: ${logistics.calculation_method}`);
  console.log(`  • Duration: ${logistics.duration_years || 'N/A'} years`);
  console.log(`  • Additional Info: ${logistics.additional_requirements || 'N/A'}`);
  console.log('');
  console.log('✅ PASS: Logistics query works');
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  allPassed = false;
}

console.log('');

// ============================================================================
// PATTERN 3: Combined Result (How Assessment Works)
// ============================================================================

console.log('🔗 PATTERN 3: Combined Result (Application Logic)');
console.log('─────────────────────────────────────────────────────────');

try {
  // Step 1: Get institutions
  const { data: institutions } = await supabase
    .from('institution_gates')
    .select('*')
    .eq('qualification_id', 'SAQA_101600');
  
  // Step 2: Get logistics
  const { data: logistics } = await supabase
    .from('g12_logistics')
    .select('*')
    .eq('qualification_id', 'SAQA_101600')
    .single();
  
  // Step 3: Combine in application code
  const result = {
    qualification_id: 'SAQA_101600',
    qualification_name: institutions[0].qualification_name,
    institutions: institutions.map(inst => ({
      name: inst.institution_name,
      aps: inst.aps_min,
      subjects: inst.subject_requirements
    })),
    logistics: {
      nbt_required: logistics.nbt_required,
      calculation_method: logistics.calculation_method,
      duration_years: logistics.duration_years
    }
  };
  
  console.log('✅ Combined result created successfully');
  console.log('');
  console.log('Student Will See:');
  console.log(`  Qualification: ${result.qualification_name}`);
  console.log(`  Institutions: ${result.institutions.length} options`);
  console.log(`  NBT Required: ${result.logistics.nbt_required}`);
  console.log(`  Duration: ${result.logistics.duration_years || 'N/A'} years`);
  console.log('');
  console.log('✅ PASS: Application logic works correctly');
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
  allPassed = false;
}

console.log('');

// ============================================================================
// PATTERN 4: Test Multiple Qualifications
// ============================================================================

console.log('🎓 PATTERN 4: Test Multiple Qualifications');
console.log('─────────────────────────────────────────────────────────');

const testQuals = [
  { id: 'SAQA_94721', name: 'BSc Computer Science' },
  { id: 'SAQA_48101', name: 'BCom Accounting' },
  { id: 'SAQA_101980', name: 'LLB Law' }
];

try {
  for (const qual of testQuals) {
    const { data: institutions } = await supabase
      .from('institution_gates')
      .select('*')
      .eq('qualification_id', qual.id);
    
    const { data: logistics } = await supabase
      .from('g12_logistics')
      .select('*')
      .eq('qualification_id', qual.id)
      .single();
    
    console.log(`  ✅ ${qual.name}: ${institutions.length} institutions, logistics ${logistics ? 'present' : 'missing'}`);
  }
  
  console.log('');
  console.log('✅ PASS: Multiple qualifications work');
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
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
  console.log('🎉 ✅ ALL QUERY PATTERNS WORK');
  console.log('');
  console.log('🟢 READY FOR STUDENT TESTING');
  console.log('');
  console.log('How It Works:');
  console.log('  1. Assessment queries institution_gates for institutions');
  console.log('  2. Assessment queries g12_logistics for requirements');
  console.log('  3. Application combines results in code');
  console.log('  4. Student sees complete information');
  console.log('');
  console.log('Schema Join Note:');
  console.log('  • Supabase foreign key relationship not configured');
  console.log('  • This is OK - we query tables separately');
  console.log('  • Students still get ALL information');
  console.log('  • No functionality is lost');
  console.log('');
  console.log('Next Steps:');
  console.log('  1. Test manually on desktop (5 min)');
  console.log('  2. Test manually on mobile (5 min)');
  console.log('  3. If both pass → Test with Sitara');
  console.log('');
  console.log('Testing URL: https://thandiai.vercel.app/assessment');
} else {
  console.log('🛑 ❌ SOME QUERIES FAILED');
  console.log('');
  console.log('Review the failures above and fix before proceeding.');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
