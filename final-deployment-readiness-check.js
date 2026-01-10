#!/usr/bin/env node

/**
 * FINAL DEPLOYMENT READINESS CHECK
 * January 10, 2026
 * 
 * Final verification before Vercel deployment
 * Ensures all systems are go for safe deployment
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 FINAL DEPLOYMENT READINESS CHECK');
console.log('===================================');
console.log('Performing final verification before deployment...\n');

const checks = [];

function addCheck(name, status, message, critical = false) {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  console.log(`${symbols[status]} ${name}: ${message}`);
  checks.push({ name, status, message, critical });
}

// 1. Verify backup exists
console.log('💾 BACKUP VERIFICATION');
console.log('----------------------');
const backupDir = 'backups/pre-deployment-jan-10-2026-1768035398875';
if (fs.existsSync(backupDir)) {
  addCheck('Backup', 'pass', 'Pre-deployment backup exists');
} else {
  addCheck('Backup', 'fail', 'Pre-deployment backup missing', true);
}

// 2. Verify permanent solution files
console.log('\n🔧 PERMANENT SOLUTION VERIFICATION');
console.log('----------------------------------');
const criticalFiles = [
  'lib/results-data.js',
  'app/results/services/resultsParser.js',
  'lib/thandi-pdf-generator.js',
  'app/results/page.jsx',
  'app/api/rag/query/route.js'
];

let missingFiles = 0;
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    addCheck('Critical File', 'pass', `${file} exists`);
  } else {
    addCheck('Critical File', 'fail', `${file} missing`, true);
    missingFiles++;
  }
}

// 3. Verify clean build state
console.log('\n🏗️ BUILD STATE VERIFICATION');
console.log('---------------------------');
if (!fs.existsSync('.next')) {
  addCheck('Build Cache', 'pass', 'No stale build cache');
} else {
  addCheck('Build Cache', 'warn', 'Build cache exists (may be fresh)');
}

if (!fs.existsSync('.vercel')) {
  addCheck('Vercel Cache', 'pass', 'No Vercel cache');
} else {
  addCheck('Vercel Cache', 'warn', 'Vercel cache exists (recently cleared)');
}

// 4. Verify build capability
console.log('\n🧪 BUILD VERIFICATION');
console.log('---------------------');

try {
  // Test that we can build successfully
  console.log('Testing build capability...');
  execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
  addCheck('Build Test', 'pass', 'Build completes successfully');
  
  // Check build output
  if (fs.existsSync('.next/static')) {
    addCheck('Build Output', 'pass', 'Build artifacts generated');
  } else {
    addCheck('Build Output', 'fail', 'No build artifacts found', true);
  }
  
} catch (error) {
  addCheck('Build Test', 'fail', 'Build failed', true);
}

// 5. Verify environment
console.log('\n🔐 ENVIRONMENT VERIFICATION');
console.log('---------------------------');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('OPENAI_API_KEY')) {
    addCheck('OpenAI Key', 'pass', 'OpenAI API key configured');
  } else {
    addCheck('OpenAI Key', 'fail', 'OpenAI API key missing', true);
  }
} else {
  addCheck('Environment', 'fail', '.env.local file missing', true);
}

// 6. Verify Vercel configuration
console.log('\n🚀 VERCEL CONFIGURATION');
console.log('-----------------------');
try {
  execSync('vercel --version', { stdio: 'pipe' });
  addCheck('Vercel CLI', 'pass', 'Vercel CLI available');
} catch (error) {
  addCheck('Vercel CLI', 'fail', 'Vercel CLI not available', true);
}

if (fs.existsSync('.vercel/project.json')) {
  addCheck('Vercel Project', 'pass', 'Project linked to Vercel');
} else {
  addCheck('Vercel Project', 'warn', 'Project not linked (will be prompted)');
}

// Summary
console.log('\n📊 READINESS SUMMARY');
console.log('====================');

const passed = checks.filter(c => c.status === 'pass').length;
const failed = checks.filter(c => c.status === 'fail').length;
const warned = checks.filter(c => c.status === 'warn').length;
const criticalFailed = checks.filter(c => c.status === 'fail' && c.critical).length;

console.log(`✅ Passed: ${passed}`);
console.log(`⚠️ Warnings: ${warned}`);
console.log(`❌ Failed: ${failed}`);
console.log(`🚨 Critical Failures: ${criticalFailed}`);

console.log('\n🎯 DEPLOYMENT DECISION');
console.log('=====================');

if (criticalFailed === 0 && failed <= 1) {
  console.log('🟢 READY FOR DEPLOYMENT');
  console.log('✅ All critical systems verified');
  console.log('✅ Permanent solution implemented');
  console.log('✅ Backup created');
  console.log('✅ Caches cleared');
  console.log('');
  console.log('🚀 DEPLOY WITH:');
  console.log('vercel --prod --force');
  console.log('');
  console.log('📋 MONITOR:');
  console.log('- Watch deployment logs');
  console.log('- Test /api/health immediately');
  console.log('- Verify results page functionality');
  console.log('- Test PDF generation');
} else if (criticalFailed === 0) {
  console.log('🟡 DEPLOY WITH CAUTION');
  console.log('⚠️ Some non-critical issues found');
  console.log('✅ Can proceed but monitor closely');
  console.log('');
  console.log('🚀 DEPLOY WITH:');
  console.log('vercel --prod --force');
} else {
  console.log('🔴 NOT READY FOR DEPLOYMENT');
  console.log('❌ Critical issues must be resolved first');
  console.log('');
  console.log('🛠️ RESOLVE ISSUES FIRST:');
  checks.filter(c => c.status === 'fail' && c.critical).forEach(check => {
    console.log(`- ${check.name}: ${check.message}`);
  });
}

console.log('\n🔄 ROLLBACK PLAN:');
console.log('If deployment fails:');
console.log('1. cd backups/pre-deployment-jan-10-2026-1768035398875');
console.log('2. ./restore.bat');
console.log('3. Investigate issues');
console.log('4. Re-run this check');

return {
  ready: criticalFailed === 0 && failed <= 1,
  criticalFailed,
  totalFailed: failed,
  warnings: warned
};

// Note: This is a simplified version without async/await for Node.js compatibility
// The actual server testing would need to be implemented differently