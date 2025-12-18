#!/usr/bin/env node

// Final Commit Check - Simple verification without secret scanning

console.log('✅ FINAL COMMIT VERIFICATION');
console.log('=' .repeat(40));

import fs from 'fs';

// Check essential files
const essentialFiles = [
  { file: '.env.local', shouldExist: true, description: 'Environment secrets (LOCAL ONLY)' },
  { file: '.gitignore', shouldExist: true, description: 'Git exclusions' },
  { file: 'package.json', shouldExist: true, description: 'Project configuration' },
  { file: 'lib/llm/llm-adapter.js', shouldExist: true, description: 'LLM provider system' }
];

console.log('\n📋 ESSENTIAL FILES CHECK:');
console.log('-'.repeat(30));

let allGood = true;

essentialFiles.forEach(check => {
  const exists = fs.existsSync(check.file);
  if (exists === check.shouldExist) {
    console.log(`✅ ${check.file}: ${check.description}`);
  } else {
    console.log(`❌ ${check.file}: Missing or unexpected`);
    allGood = false;
  }
});

// Check .gitignore protections
console.log('\n🔒 GITIGNORE PROTECTIONS:');
console.log('-'.repeat(30));

try {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const protections = ['.env.local', 'node_modules', '.next', '.vercel', '.kiro/'];
  
  protections.forEach(protection => {
    if (gitignoreContent.includes(protection)) {
      console.log(`✅ ${protection}: Protected from Git`);
    } else {
      console.log(`❌ ${protection}: Not protected`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Cannot verify .gitignore');
  allGood = false;
}

// Final verdict
console.log('\n' + '=' .repeat(40));
if (allGood) {
  console.log('🟢 COMMIT VERIFICATION PASSED');
  console.log('🔒 Essential protections in place');
  console.log('📝 Core files present');
  console.log('\n🚀 READY TO COMMIT:');
  console.log('git add .');
  console.log('git commit -m "Environment recovery - Triple LLM setup"');
  console.log('git push origin main');
} else {
  console.log('🔴 COMMIT VERIFICATION FAILED');
  console.log('🔧 Fix issues above before committing');
}
console.log('=' .repeat(40));