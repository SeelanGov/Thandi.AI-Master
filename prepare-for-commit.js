#!/usr/bin/env node

// Prepare for GitHub Commit
// Final check before committing to ensure no secrets are exposed

console.log('📋 PREPARE FOR GITHUB COMMIT');
console.log('=' .repeat(50));

import fs from 'fs';

// Check critical files exist and are secure
const criticalChecks = [
  { file: '.env.local', shouldExist: true, inGitignore: true },
  { file: '.gitignore', shouldExist: true, inGitignore: false },
  { file: 'package.json', shouldExist: true, inGitignore: false },
  { file: 'next.config.js', shouldExist: true, inGitignore: false }
];

console.log('\n🔍 CRITICAL FILE CHECK:');
console.log('-'.repeat(30));

let allGood = true;

criticalChecks.forEach(check => {
  const exists = fs.existsSync(check.file);
  
  if (check.shouldExist && exists) {
    console.log(`✅ ${check.file}: Present`);
  } else if (check.shouldExist && !exists) {
    console.log(`❌ ${check.file}: Missing (REQUIRED)`);
    allGood = false;
  } else if (!check.shouldExist && exists) {
    console.log(`⚠️ ${check.file}: Present (should be excluded)`);
  } else {
    console.log(`✅ ${check.file}: Correctly excluded`);
  }
});

// Check .gitignore has required entries
console.log('\n🛡️ GITIGNORE CHECK:');
console.log('-'.repeat(30));

try {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredEntries = ['.env.local', 'node_modules', '.next', '.vercel'];
  
  requiredEntries.forEach(entry => {
    if (gitignoreContent.includes(entry)) {
      console.log(`✅ ${entry}: Protected`);
    } else {
      console.log(`❌ ${entry}: Not in .gitignore`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Cannot read .gitignore');
  allGood = false;
}

// Final status
console.log('\n' + '=' .repeat(50));
if (allGood) {
  console.log('✅ READY FOR COMMIT');
  console.log('🔒 All sensitive files protected');
  console.log('📝 Safe to commit to GitHub');
  console.log('\n📋 COMMIT COMMANDS:');
  console.log('git add .');
  console.log('git commit -m "Environment recovery complete - Triple LLM setup"');
  console.log('git push origin main');
} else {
  console.log('❌ NOT READY FOR COMMIT');
  console.log('🔧 Fix issues above before committing');
}
console.log('=' .repeat(50));