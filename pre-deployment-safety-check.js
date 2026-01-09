#!/usr/bin/env node

/**
 * PRE-DEPLOYMENT SAFETY CHECK
 * Critical verification before committing to prevent Vercel deployment issues
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚨 PRE-DEPLOYMENT SAFETY CHECK');
console.log('=' .repeat(60));
console.log('⚠️  CRITICAL: Vercel deployment history shows serious issues');
console.log('⚠️  MUST verify everything before committing');
console.log('');

const results = {
  timestamp: new Date().toISOString(),
  checks: {},
  safeToCommit: false,
  criticalIssues: []
};

// 1. Check current Vercel deployment status
console.log('1️⃣ Current Vercel Deployment Status');
console.log('-'.repeat(40));

try {
  // Test production endpoint
  console.log('   Testing production endpoint...');
  const response = await fetch('https://thandi.online/api/pdf/generate', {
    method: 'GET'
  });
  
  if (response.ok) {
    console.log('   ✅ Production API endpoint responding');
    results.checks.productionAPI = 'WORKING';
  } else {
    console.log('   ❌ Production API endpoint not responding');
    results.checks.productionAPI = 'FAILED';
    results.criticalIssues.push('Production API endpoint not responding');
  }
} catch (error) {
  console.log('   ❌ Cannot reach production endpoint');
  results.checks.productionAPI = 'UNREACHABLE';
  results.criticalIssues.push('Cannot reach production endpoint');
}

// 2. Local build verification
console.log('\n2️⃣ Local Build Verification');
console.log('-'.repeat(40));

try {
  console.log('   Running production build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('   ✅ Local build successful');
  results.checks.localBuild = 'SUCCESS';
} catch (error) {
  console.log('   ❌ Local build failed');
  console.log('   Error:', error.message.split('\n')[0]);
  results.checks.localBuild = 'FAILED';
  results.criticalIssues.push('Local build failed');
}

// 3. Check for problematic files
console.log('\n3️⃣ Problematic Files Check');
console.log('-'.repeat(40));

const problematicPatterns = [
  { pattern: /ReactPDFGenerator/, description: 'ReactPDFGenerator references (known to cause issues)' },
  { pattern: /import.*react-pdf/, description: 'react-pdf imports (memory issues)' },
  { pattern: /generateProfessionalReport/, description: 'Old PDF function names' },
  { pattern: /downloadingPDF/, description: 'Old PDF state names' }
];

let problematicFiles = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    problematicPatterns.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        issues.push(description);
      }
    });
    
    if (issues.length > 0) {
      problematicFiles.push({ file: filePath, issues });
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
}

// Scan critical files
const criticalFiles = [
  'app/results/page.jsx',
  'app/results/services/resultsParser.js',
  'app/results/services/ProfessionalPDFGenerator.js',
  'app/api/pdf/generate/route.js'
];

criticalFiles.forEach(scanFile);

if (problematicFiles.length === 0) {
  console.log('   ✅ No problematic patterns found');
  results.checks.problematicFiles = 'CLEAN';
} else {
  console.log('   ❌ Problematic patterns found:');
  problematicFiles.forEach(({ file, issues }) => {
    console.log(`     ${file}:`);
    issues.forEach(issue => console.log(`       - ${issue}`));
  });
  results.checks.problematicFiles = 'ISSUES_FOUND';
  results.criticalIssues.push('Problematic patterns found in code');
}

// 4. Check git status
console.log('\n4️⃣ Git Status Check');
console.log('-'.repeat(40));

try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const modifiedFiles = gitStatus.trim().split('\n').filter(line => line.trim());
  
  console.log(`   Modified files: ${modifiedFiles.length}`);
  
  if (modifiedFiles.length > 0) {
    console.log('   Files to be committed:');
    modifiedFiles.forEach(file => {
      console.log(`     ${file}`);
    });
  }
  
  results.checks.gitStatus = {
    modifiedFiles: modifiedFiles.length,
    files: modifiedFiles
  };
} catch (error) {
  console.log('   ❌ Git status check failed');
  results.checks.gitStatus = 'FAILED';
}

// 5. Environment variables check
console.log('\n5️⃣ Environment Variables Check');
console.log('-'.repeat(40));

const requiredEnvVars = [
  'OPENAI_API_KEY',
  'GROQ_API_KEY', 
  'KIMI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length === 0) {
  console.log('   ✅ All required environment variables present');
  results.checks.envVars = 'COMPLETE';
} else {
  console.log('   ⚠️  Missing environment variables:');
  missingEnvVars.forEach(envVar => console.log(`     - ${envVar}`));
  results.checks.envVars = 'MISSING_VARS';
  // Note: This might be expected in local environment
}

// 6. Package.json dependencies check
console.log('\n6️⃣ Dependencies Check');
console.log('-'.repeat(40));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check for problematic dependencies
  const problematicDeps = [
    'react-pdf', // Known to cause memory issues
    '@react-pdf/renderer' // Alternative that might cause issues
  ];
  
  let foundProblematicDeps = [];
  problematicDeps.forEach(dep => {
    if (dependencies[dep]) {
      foundProblematicDeps.push(dep);
    }
  });
  
  if (foundProblematicDeps.length === 0) {
    console.log('   ✅ No problematic dependencies found');
    results.checks.dependencies = 'CLEAN';
  } else {
    console.log('   ⚠️  Potentially problematic dependencies:');
    foundProblematicDeps.forEach(dep => {
      console.log(`     - ${dep}: ${dependencies[dep]}`);
    });
    results.checks.dependencies = 'POTENTIALLY_PROBLEMATIC';
  }
  
  // Check for jsPDF (should be present)
  if (dependencies['jspdf']) {
    console.log('   ✅ jsPDF dependency found (current PDF solution)');
  } else {
    console.log('   ❌ jsPDF dependency missing');
    results.criticalIssues.push('jsPDF dependency missing');
  }
  
} catch (error) {
  console.log('   ❌ Cannot read package.json');
  results.checks.dependencies = 'FAILED';
  results.criticalIssues.push('Cannot read package.json');
}

// Final Assessment
console.log('\n📊 FINAL SAFETY ASSESSMENT');
console.log('=' .repeat(60));

const criticalChecks = [
  results.checks.localBuild === 'SUCCESS',
  results.checks.problematicFiles === 'CLEAN',
  results.criticalIssues.length === 0
];

results.safeToCommit = criticalChecks.every(check => check);

if (results.safeToCommit) {
  console.log('✅ SAFE TO COMMIT AND DEPLOY');
  console.log('');
  console.log('All critical checks passed:');
  console.log('✅ Local build successful');
  console.log('✅ No problematic code patterns');
  console.log('✅ No critical issues detected');
  console.log('');
  console.log('🚀 RECOMMENDATION: PROCEED WITH COMMIT');
} else {
  console.log('❌ NOT SAFE TO COMMIT');
  console.log('');
  console.log('Critical issues detected:');
  results.criticalIssues.forEach(issue => {
    console.log(`❌ ${issue}`);
  });
  console.log('');
  console.log('🛑 RECOMMENDATION: FIX ISSUES BEFORE COMMITTING');
}

// Save detailed results
fs.writeFileSync('pre-deployment-safety-results.json', JSON.stringify(results, null, 2));
console.log('');
console.log('📄 Detailed results saved to: pre-deployment-safety-results.json');
console.log('=' .repeat(60));

process.exit(results.safeToCommit ? 0 : 1);