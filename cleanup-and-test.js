#!/usr/bin/env node

/**
 * Cleanup and Testing Script for Results Page Redesign
 * Prepares the system for final testing and preflight checks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧹 Starting cleanup and testing preparation...\n');

// Step 1: Clean up temporary files
console.log('1️⃣ Cleaning up temporary files...');
const tempFiles = [
  'test-*.html',
  'debug-*.js',
  'quick-test-*.html',
  'static-card-test.html'
];

tempFiles.forEach(pattern => {
  try {
    execSync(`del /Q ${pattern} 2>nul`, { stdio: 'ignore' });
  } catch (e) {
    // File doesn't exist, ignore
  }
});

// Step 2: Verify core files exist
console.log('2️⃣ Verifying core implementation files...');
const coreFiles = [
  'app/results/page.jsx',
  'app/results/services/ProfessionalPDFGenerator.js',
  'app/results/services/resultsParser.js',
  'app/results/components/ResultsCardLayout.jsx',
  'app/results/styles/global.css'
];

let allFilesExist = true;
coreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some core files are missing. Please check implementation.');
  process.exit(1);
}

// Step 3: Check dependencies
console.log('\n3️⃣ Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['jspdf', 'react', 'next'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} - Missing dependency!`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('   ⚠️ Could not read package.json');
}

// Step 4: Test build
console.log('\n4️⃣ Testing production build...');
try {
  console.log('   Building Next.js application...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('   ✅ Build successful');
} catch (error) {
  console.log('   ❌ Build failed');
  console.log('   Error:', error.message);
  allFilesExist = false;
}

// Step 5: Generate test report
console.log('\n5️⃣ Generating test readiness report...');
const testReport = {
  timestamp: new Date().toISOString(),
  coreFilesStatus: allFilesExist ? 'PASS' : 'FAIL',
  buildStatus: allFilesExist ? 'PASS' : 'FAIL',
  readyForTesting: allFilesExist,
  nextSteps: allFilesExist ? [
    'Run preflight checks',
    'Test PDF generation',
    'Verify card layout functionality',
    'Test mobile responsiveness'
  ] : [
    'Fix missing files',
    'Resolve build errors',
    'Re-run cleanup script'
  ]
};

fs.writeFileSync('test-readiness-report.json', JSON.stringify(testReport, null, 2));

// Final status
console.log('\n📊 CLEANUP AND TEST PREPARATION COMPLETE');
console.log('=' .repeat(50));

if (allFilesExist) {
  console.log('✅ Status: READY FOR TESTING');
  console.log('📄 Report: test-readiness-report.json');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: node preflight-checks.js');
  console.log('   2. Test PDF generation');
  console.log('   3. Verify all functionality');
  console.log('   4. Deploy to production');
} else {
  console.log('❌ Status: NOT READY - Issues found');
  console.log('📄 Report: test-readiness-report.json');
  console.log('\n🔧 Fix issues and re-run this script');
}

console.log('\n' + '='.repeat(50));