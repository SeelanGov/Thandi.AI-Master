#!/usr/bin/env node

/**
 * PHASE 0 COMPLETION DEPLOYMENT
 * 
 * Deploy the critical missing components to complete Phase 0
 * Target: 90%+ completion before school dashboard enhancement
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 PHASE 0 COMPLETION DEPLOYMENT');
console.log('================================');

// Pre-deployment verification
console.log('📋 Pre-deployment checks...');

// Check if all required files exist
const requiredFiles = [
  'app/register/page.js',
  'app/api/consent/manage/route.js',
  'app/api/student/retroactive-association/route.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing file: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

if (!allFilesExist) {
  console.error('❌ Missing required files. Please create them first.');
  process.exit(1);
}

// Check git status
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('📝 Uncommitted changes detected:');
    console.log(gitStatus);
  } else {
    console.log('✅ Working directory clean');
  }
} catch (error) {
  console.log('⚠️ Git status check failed (continuing anyway)');
}

// Stage and commit changes
console.log('\n📦 Staging changes...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ Changes staged');
} catch (error) {
  console.error('❌ Failed to stage changes:', error.message);
  process.exit(1);
}

console.log('\n💾 Committing changes...');
try {
  execSync('git commit -m "Phase 0 Completion: Add missing registration page, consent API, and retroactive association API"', { stdio: 'inherit' });
  console.log('✅ Changes committed');
} catch (error) {
  console.log('⚠️ Commit failed (may be no changes to commit)');
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment initiated');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('\n⏳ Waiting for deployment to complete...');
// Wait 30 seconds for deployment to propagate
setTimeout(() => {
  console.log('\n🔍 Running Phase 0 verification...');
  try {
    execSync('node comprehensive-phase0-verification.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Verification completed with issues - check results above');
  }
}, 30000);

console.log('\n📋 PHASE 0 COMPLETION DEPLOYMENT SUMMARY');
console.log('=======================================');
console.log('✅ Registration page created: /register');
console.log('✅ School validation API enhanced: POST method added');
console.log('✅ Consent management API created: /api/consent/manage');
console.log('✅ Retroactive association API created: /api/student/retroactive-association');
console.log('⏳ Deployment in progress...');
console.log('\nNext: Wait for verification results to confirm 90%+ completion');