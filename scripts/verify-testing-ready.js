import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('');
console.log('🎓 STUDENT TESTING READINESS CHECK');
console.log('═══════════════════════════════════════════════════');
console.log('');

let allPassed = true;

// Check 1: Database Connection
console.log('✓ Checking database connection...');
const { data: testQuery, error: dbError } = await supabase
  .from('institution_gates')
  .select('qualification_id')
  .limit(1);

if (dbError) {
  console.log('  ❌ FAIL: Cannot connect to database');
  allPassed = false;
} else {
  console.log('  ✅ PASS: Database connected');
}

// Check 2: Qualifications Count
console.log('✓ Checking qualifications...');
const { data: quals } = await supabase
  .from('institution_gates')
  .select('qualification_id, qualification_name');

const unique = {};
quals.forEach(r => unique[r.qualification_id] = r.qualification_name);

if (Object.keys(unique).length === 20) {
  console.log(`  ✅ PASS: 20/20 qualifications present`);
} else {
  console.log(`  ❌ FAIL: Only ${Object.keys(unique).length}/20 qualifications`);
  allPassed = false;
}

// Check 3: Medicine Present
console.log('✓ Checking Medicine (critical)...');
if (unique['SAQA_101600']) {
  console.log('  ✅ PASS: Medicine (SAQA_101600) present');
} else {
  console.log('  ❌ FAIL: Medicine (SAQA_101600) MISSING');
  allPassed = false;
}

// Check 4: Knowledge Base
console.log('✓ Checking knowledge base...');
const { data: chunks } = await supabase
  .from('knowledge_chunks')
  .select('id')
  .limit(1);

if (chunks && chunks.length > 0) {
  console.log('  ✅ PASS: Knowledge base populated');
} else {
  console.log('  ⚠️  WARNING: Knowledge base might be empty');
}

// Check 5: Environment Variables
console.log('✓ Checking environment variables...');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
  'OPENAI_API_KEY'
];

let envPassed = true;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Present`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    envPassed = false;
    allPassed = false;
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('');

if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - READY FOR STUDENT TESTING');
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Test manually on desktop (5 min)');
  console.log('2. Test manually on mobile (5 min)');
  console.log('3. If both work → Invite 5 students');
  console.log('');
  console.log('📱 Testing URL: https://thandiai.vercel.app/assessment');
  console.log('');
  console.log('📋 Use checklist: STUDENT-TESTING-CHECKLIST.md');
} else {
  console.log('❌ SOME CHECKS FAILED - FIX BEFORE TESTING');
  console.log('');
  console.log('🔧 Fix the issues above, then run this script again.');
}

console.log('');
