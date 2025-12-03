#!/usr/bin/env node

/**
 * Final Deployment Check
 * Verifies all systems before Vercel deployment
 */

import fs from 'fs';
import path from 'path';

console.log('\n🎯 FINAL DEPLOYMENT CHECK\n');
console.log('═'.repeat(60));

let allPassed = true;

// Check 1: Environment variables
console.log('\n1️⃣ Checking .env.local...');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'GROQ_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LLM_PROVIDER'
  ];
  
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  
  if (missingVars.length === 0) {
    console.log('   ✅ All required environment variables present');
  } else {
    console.log(`   ❌ Missing: ${missingVars.join(', ')}`);
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ .env.local not found');
  allPassed = false;
}

// Check 2: Critical files
console.log('\n2️⃣ Checking critical files...');
const criticalFiles = [
  'app/api/rag/query/route.js',
  'app/assessment/components/AssessmentForm.jsx',
  'app/assessment/components/ConsentCheckbox.jsx',
  'lib/compliance/consent-gate.js',
  'lib/compliance/popia-sanitiser.js',
  'lib/llm/guarded-client.js',
  'lib/llm/llm-adapter.js',
  'next.config.js',
  'package.json'
];

let missingFiles = [];
for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length === 0) {
  console.log(`   ✅ All ${criticalFiles.length} critical files present`);
} else {
  console.log(`   ❌ Missing files: ${missingFiles.join(', ')}`);
  allPassed = false;
}

// Check 3: Consent checkbox integration
console.log('\n3️⃣ Checking consent checkbox integration...');
try {
  const formContent = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
  
  const checks = {
    'ConsentCheckbox import': formContent.includes('ConsentCheckbox'),
    'consent state': formContent.includes('const [consent, setConsent]'),
    'consent in payload': formContent.includes('consent:'),
    'consent validation': formContent.includes('!consent')
  };
  
  const failed = Object.entries(checks).filter(([_, v]) => !v);
  
  if (failed.length === 0) {
    console.log('   ✅ Consent checkbox fully integrated');
  } else {
    console.log(`   ❌ Missing: ${failed.map(([k]) => k).join(', ')}`);
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify consent integration');
  allPassed = false;
}

// Check 4: API response format
console.log('\n4️⃣ Checking API response format...');
try {
  const apiContent = fs.readFileSync('app/api/rag/query/route.js', 'utf8');
  
  const hasCorrectFormat = apiContent.includes('response:') && 
                          apiContent.includes('fullResponse:');
  
  if (hasCorrectFormat) {
    console.log('   ✅ API returns correct response format');
  } else {
    console.log('   ❌ API response format incorrect');
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Could not verify API format');
  allPassed = false;
}

// Check 5: Compliance modules
console.log('\n5️⃣ Checking compliance modules...');
const complianceModules = [
  'lib/compliance/consent-gate.js',
  'lib/compliance/popia-sanitiser.js',
  'lib/llm/guarded-client.js',
  'lib/llm/llm-adapter.js'
];

let missingModules = [];
for (const module of complianceModules) {
  if (!fs.existsSync(module)) {
    missingModules.push(module);
  }
}

if (missingModules.length === 0) {
  console.log('   ✅ All 4 compliance modules present');
} else {
  console.log(`   ❌ Missing: ${missingModules.join(', ')}`);
  allPassed = false;
}

// Check 6: Package.json scripts
console.log('\n6️⃣ Checking package.json scripts...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['dev', 'build', 'start'];
  const missingScripts = requiredScripts.filter(s => !pkg.scripts[s]);
  
  if (missingScripts.length === 0) {
    console.log('   ✅ All required scripts present');
  } else {
    console.log(`   ❌ Missing scripts: ${missingScripts.join(', ')}`);
    allPassed = false;
  }
} catch (error) {
  console.log('   ❌ Could not read package.json');
  allPassed = false;
}

// Check 7: Vercel CLI
console.log('\n7️⃣ Checking Vercel CLI...');
try {
  const { execSync } = await import('child_process');
  const version = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ Vercel CLI installed (${version})`);
} catch (error) {
  console.log('   ❌ Vercel CLI not installed');
  console.log('      Install with: npm i -g vercel');
  allPassed = false;
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 FINAL SUMMARY\n');

if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED - READY TO DEPLOY!\n');
  console.log('Next steps:');
  console.log('1. Set Vercel environment variables:');
  console.log('   .\\setup-vercel-env.ps1');
  console.log('');
  console.log('2. Deploy to production:');
  console.log('   vercel --prod');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - FIX ISSUES BEFORE DEPLOYING\n');
  console.log('Review the failures above and fix them.\n');
  process.exit(1);
}
