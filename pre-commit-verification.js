#!/usr/bin/env node

/**
 * Pre-Commit Verification
 * Final checks before committing to ensure deployment readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Pre-Commit Verification');
console.log('='.repeat(50));

// Check 1: Run all test suites
async function runAllTestSuites() {
  console.log('\n🧪 Check 1: Running All Test Suites');
  
  try {
    // Import and run comprehensive test
    const { runComprehensiveTest } = await import('./test-comprehensive-local-verification.js');
    const comprehensiveResult = await runComprehensiveTest();
    console.log(`  ${comprehensiveResult ? '✅' : '❌'} Comprehensive Local Verification`);
    
    // Import and run Grade 10 flow test
    const { runAllTests: runGrade10Tests } = await import('./test-grade10-flow-complete-verification.js');
    const grade10Result = await runGrade10Tests();
    console.log(`  ${grade10Result ? '✅' : '❌'} Grade 10 Flow Verification`);
    
    // Import and run preflight checks
    const { runPreflightChecks } = await import('./preflight-deployment-checks.js');
    const preflightResult = await runPreflightChecks();
    console.log(`  ${preflightResult ? '✅' : '❌'} Preflight Deployment Checks`);
    
    return comprehensiveResult && grade10Result && preflightResult;
  } catch (error) {
    console.log(`  ❌ Error running test suites: ${error.message}`);
    return false;
  }
}

// Check 2: Verify critical files exist
function verifyCriticalFiles() {
  console.log('\n📁 Check 2: Verifying Critical Files');
  
  const criticalFiles = [
    'app/assessment/components/AssessmentForm.jsx',
    'app/assessment/components/PreliminaryReport.jsx',
    'app/assessment/components/DeepDiveQuestions.jsx',
    'app/api/rag/query/route.js',
    'app/results/page.jsx',
    'DEPLOYMENT-READY.md',
    'DEPLOYMENT-CHECKLIST.md',
    'VERCEL-ENV-SETUP.md',
    'COMMIT-MESSAGE.txt'
  ];
  
  let allExist = true;
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

// Check 3: Verify no sensitive data
function verifySensitiveData() {
  console.log('\n🔒 Check 3: Verifying No Sensitive Data');
  
  const filesToCheck = [
    'app/api/rag/query/route.js',
    'app/assessment/components/AssessmentForm.jsx',
    'lib/llm/llm-adapter.js'
  ];
  
  let noSensitiveData = true;
  
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded API keys
      const hasSensitiveData = 
        content.includes('sk-ant-api') ||
        content.includes('gsk_') ||
        content.includes('eyJ') ||
        content.includes('https://') && content.includes('supabase') && !content.includes('process.env');
      
      console.log(`  ${!hasSensitiveData ? '✅' : '❌'} ${file} - ${!hasSensitiveData ? 'Clean' : 'Contains sensitive data'}`);
      if (hasSensitiveData) noSensitiveData = false;
    } else {
      console.log(`  ⚠️ ${file} - File not found (may be optional)`);
    }
  });
  
  return noSensitiveData;
}

// Check 4: Verify deployment documentation
function verifyDeploymentDocs() {
  console.log('\n📋 Check 4: Verifying Deployment Documentation');
  
  const docs = [
    { file: 'DEPLOYMENT-READY.md', contains: 'DEPLOYMENT READY' },
    { file: 'DEPLOYMENT-CHECKLIST.md', contains: 'Deployment Checklist' },
    { file: 'VERCEL-ENV-SETUP.md', contains: 'Environment Variables Setup' },
    { file: 'COMMIT-MESSAGE.txt', contains: 'Grade 10 assessment flow' }
  ];
  
  let allValid = true;
  
  docs.forEach(doc => {
    const filePath = path.join(__dirname, doc.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasContent = content.includes(doc.contains);
      console.log(`  ${hasContent ? '✅' : '❌'} ${doc.file} - ${hasContent ? 'Valid' : 'Missing expected content'}`);
      if (!hasContent) allValid = false;
    } else {
      console.log(`  ❌ ${doc.file} - Missing`);
      allValid = false;
    }
  });
  
  return allValid;
}

// Check 5: Verify build readiness
function verifyBuildReadiness() {
  console.log('\n🔨 Check 5: Verifying Build Readiness');
  
  const checks = [
    {
      name: 'package.json has required scripts',
      test: () => {
        const packagePath = path.join(__dirname, 'package.json');
        if (!fs.existsSync(packagePath)) return false;
        
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageContent.scripts?.build && 
               packageContent.scripts?.start && 
               packageContent.scripts?.dev;
      }
    },
    {
      name: 'next.config.js exists',
      test: () => fs.existsSync(path.join(__dirname, 'next.config.js'))
    },
    {
      name: '.env.local in .gitignore',
      test: () => {
        const gitignorePath = path.join(__dirname, '.gitignore');
        if (!fs.existsSync(gitignorePath)) return false;
        
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        return gitignoreContent.includes('.env.local');
      }
    }
  ];
  
  let allReady = true;
  
  checks.forEach(check => {
    const result = check.test();
    console.log(`  ${result ? '✅' : '❌'} ${check.name}`);
    if (!result) allReady = false;
  });
  
  return allReady;
}

// Main verification function
async function runPreCommitVerification() {
  console.log('🔍 Starting Pre-Commit Verification...\n');
  
  const checks = [
    { name: 'All Test Suites', fn: runAllTestSuites },
    { name: 'Critical Files', fn: verifyCriticalFiles },
    { name: 'Sensitive Data', fn: verifySensitiveData },
    { name: 'Deployment Documentation', fn: verifyDeploymentDocs },
    { name: 'Build Readiness', fn: verifyBuildReadiness }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, result });
    } catch (error) {
      console.log(`  ❌ ${check.name} failed with error: ${error.message}`);
      results.push({ name: check.name, result: false });
    }
  }
  
  const passed = results.filter(r => r.result).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 PRE-COMMIT VERIFICATION: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('✅ ALL PRE-COMMIT CHECKS PASSED!');
    console.log('\n🚀 READY TO COMMIT AND DEPLOY:');
    console.log('  • All test suites passing');
    console.log('  • Critical files verified');
    console.log('  • No sensitive data exposed');
    console.log('  • Deployment documentation complete');
    console.log('  • Build configuration ready');
    
    console.log('\n📋 COMMIT COMMAND:');
    console.log('  git commit -F COMMIT-MESSAGE.txt');
    
    console.log('\n🚀 DEPLOYMENT READY:');
    console.log('  Follow DEPLOYMENT-CHECKLIST.md for next steps');
    
    return true;
  } else {
    console.log('❌ Some pre-commit checks failed');
    console.log('\n🔧 Failed Checks:');
    results.filter(r => !r.result).forEach(r => {
      console.log(`  • ${r.name}`);
    });
    
    console.log('\n⚠️ Fix these issues before committing');
    return false;
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPreCommitVerification().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runPreCommitVerification };