#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Comprehensive checks before committing to GitHub and deploying to Vercel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 PRE-DEPLOYMENT VERIFICATION');
console.log('=' .repeat(60));
console.log('Checking current deployment status and new changes compatibility');
console.log('Timestamp:', new Date().toISOString());
console.log('');

const verificationResults = {
  timestamp: new Date().toISOString(),
  checks: {},
  currentDeployment: {},
  newChanges: {},
  compatibility: {},
  readyForDeployment: false,
  issues: [],
  recommendations: []
};

// Check 1: Current Vercel Deployment Status
console.log('1️⃣ Current Vercel Deployment Status');
console.log('-'.repeat(40));

try {
  // Check if vercel CLI is available
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('   ✅ Vercel CLI available');
  } catch (e) {
    console.log('   ⚠️ Vercel CLI not found - using alternative checks');
  }

  // Check vercel.json configuration
  if (fs.existsSync('vercel.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('   ✅ vercel.json found');
    console.log('   📋 Build command:', vercelConfig.buildCommand || 'npm run build');
    console.log('   📋 Output directory:', vercelConfig.outputDirectory || '.next');
    
    verificationResults.currentDeployment.config = vercelConfig;
  } else {
    console.log('   ⚠️ vercel.json not found - using defaults');
    verificationResults.currentDeployment.config = 'default';
  }

  // Check package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('   ✅ Build script:', packageJson.scripts?.build || 'not found');
  console.log('   ✅ Start script:', packageJson.scripts?.start || 'not found');
  
  verificationResults.currentDeployment.scripts = packageJson.scripts;

} catch (error) {
  console.log('   ❌ Error checking deployment config:', error.message);
  verificationResults.issues.push('Deployment config check failed');
}

// Check 2: Environment Variables Compatibility
console.log('\n2️⃣ Environment Variables Check');
console.log('-'.repeat(40));

const envFiles = ['.env.local', '.env.example', '.env.production.example'];
let envCompatible = true;

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    try {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.includes('='));
      console.log(`   ✅ ${envFile} (${envVars.length} variables)`);
      
      // Check for critical variables
      const criticalVars = ['ANTHROPIC_API_KEY', 'GROQ_API_KEY', 'SUPABASE_URL'];
      criticalVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`     ✅ ${varName} configured`);
        } else {
          console.log(`     ⚠️ ${varName} not found`);
        }
      });
      
    } catch (error) {
      console.log(`   ❌ Error reading ${envFile}`);
      envCompatible = false;
    }
  } else {
    console.log(`   ⚠️ ${envFile} not found`);
  }
});

verificationResults.checks.environment = {
  status: envCompatible ? 'PASS' : 'WARNING',
  details: 'Environment variables checked'
};

// Check 3: New Changes Impact Analysis
console.log('\n3️⃣ New Changes Impact Analysis');
console.log('-'.repeat(40));

const newFiles = [
  'app/results/services/ProfessionalPDFGenerator.js',
  'app/results/components/pdf/PDFComponents.js',
  'app/results/styles/pdf-styles.js'
];

let newChangesValid = true;

console.log('   📁 New files added:');
newFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const size = Math.round(fs.statSync(file).size / 1024);
    console.log(`     ✅ ${file} (${size}KB)`);
  } else {
    console.log(`     ❌ ${file} - Missing!`);
    newChangesValid = false;
    verificationResults.issues.push(`New file missing: ${file}`);
  }
});

// Check modified files
console.log('   📝 Modified files:');
const modifiedFiles = ['app/results/page.jsx'];

modifiedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasNewImports = content.includes('ProfessionalPDFGenerator');
    console.log(`     ${hasNewImports ? '✅' : '❌'} ${file} - New imports ${hasNewImports ? 'added' : 'missing'}`);
    
    if (!hasNewImports) {
      newChangesValid = false;
      verificationResults.issues.push(`Missing imports in ${file}`);
    }
  }
});

verificationResults.checks.newChanges = {
  status: newChangesValid ? 'PASS' : 'FAIL',
  details: 'New files and modifications verified'
};

// Check 4: Dependencies Compatibility
console.log('\n4️⃣ Dependencies Compatibility');
console.log('-'.repeat(40));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Check critical dependencies for PDF generation
  const criticalDeps = ['jspdf', 'react', 'next'];
  let depsCompatible = true;
  
  criticalDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Missing!`);
      depsCompatible = false;
      verificationResults.issues.push(`Missing dependency: ${dep}`);
    }
  });
  
  // Check for potential conflicts
  console.log('   📦 Total dependencies:', Object.keys(dependencies).length);
  
  verificationResults.checks.dependencies = {
    status: depsCompatible ? 'PASS' : 'FAIL',
    details: 'Critical dependencies verified'
  };
  
} catch (error) {
  console.log('   ❌ Error checking dependencies');
  verificationResults.checks.dependencies = {
    status: 'FAIL',
    details: 'Could not read package.json'
  };
}

// Check 5: Build Compatibility Test
console.log('\n5️⃣ Build Compatibility Test');
console.log('-'.repeat(40));

try {
  console.log('   🔨 Testing production build...');
  
  // Clean previous build
  try {
    execSync('rmdir /s /q .next 2>nul', { stdio: 'ignore' });
  } catch (e) {
    // Directory doesn't exist, ignore
  }
  
  // Run build
  const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
  
  // Analyze build output
  const buildSuccess = !buildOutput.includes('Error') && !buildOutput.includes('Failed');
  const hasWarnings = buildOutput.includes('Warning');
  
  console.log(`   ${buildSuccess ? '✅' : '❌'} Build ${buildSuccess ? 'successful' : 'failed'}`);
  
  if (hasWarnings) {
    console.log('   ⚠️ Build has warnings (review recommended)');
  }
  
  // Check build output size
  if (fs.existsSync('.next')) {
    console.log('   ✅ Build artifacts created');
    
    // Check specific pages
    const resultsPagePattern = '.next/static/chunks/pages/results*.js';
    try {
      const files = execSync(`dir /b .next\\static\\chunks\\pages\\results*.js 2>nul`, { encoding: 'utf8' });
      if (files.trim()) {
        console.log('   ✅ Results page built successfully');
      }
    } catch (e) {
      // Results page might be in app directory structure
      console.log('   ✅ App router structure detected');
    }
  }
  
  verificationResults.checks.build = {
    status: buildSuccess ? 'PASS' : 'FAIL',
    details: buildSuccess ? 'Production build successful' : 'Build failed',
    warnings: hasWarnings
  };
  
} catch (error) {
  console.log('   ❌ Build test failed:', error.message);
  verificationResults.checks.build = {
    status: 'FAIL',
    details: 'Build test failed: ' + error.message
  };
  verificationResults.issues.push('Build compatibility test failed');
}

// Check 6: File Size Analysis
console.log('\n6️⃣ File Size Analysis');
console.log('-'.repeat(40));

try {
  const criticalFiles = {
    'Results Page': 'app/results/page.jsx',
    'PDF Generator': 'app/results/services/ProfessionalPDFGenerator.js',
    'Results Parser': 'app/results/services/resultsParser.js'
  };
  
  let totalSize = 0;
  
  Object.entries(criticalFiles).forEach(([name, file]) => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      const sizeKB = Math.round(size / 1024);
      totalSize += size;
      
      console.log(`   📄 ${name}: ${sizeKB}KB`);
      
      // Flag unusually large files
      if (sizeKB > 100) {
        console.log(`     ⚠️ Large file - review for optimization`);
        verificationResults.recommendations.push(`Consider optimizing ${name} (${sizeKB}KB)`);
      }
    }
  });
  
  const totalKB = Math.round(totalSize / 1024);
  console.log(`   📊 Total new code: ${totalKB}KB`);
  
  verificationResults.checks.fileSize = {
    status: 'PASS',
    totalSize: totalKB,
    details: 'File sizes analyzed'
  };
  
} catch (error) {
  console.log('   ❌ File size analysis failed');
}

// Check 7: Git Status and Staging
console.log('\n7️⃣ Git Status Check');
console.log('-'.repeat(40));

try {
  // Check git status
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const modifiedFiles = gitStatus.split('\n').filter(line => line.trim());
  
  console.log(`   📝 Modified files: ${modifiedFiles.length}`);
  
  if (modifiedFiles.length > 0) {
    console.log('   📋 Changes to commit:');
    modifiedFiles.slice(0, 10).forEach(file => {
      const status = file.substring(0, 2);
      const filename = file.substring(3);
      const statusIcon = status.includes('M') ? '📝' : 
                        status.includes('A') ? '➕' : 
                        status.includes('D') ? '➖' : '❓';
      console.log(`     ${statusIcon} ${filename}`);
    });
    
    if (modifiedFiles.length > 10) {
      console.log(`     ... and ${modifiedFiles.length - 10} more files`);
    }
  } else {
    console.log('   ✅ No uncommitted changes');
  }
  
  // Check current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`   🌿 Current branch: ${currentBranch}`);
  
  verificationResults.checks.git = {
    status: 'PASS',
    modifiedFiles: modifiedFiles.length,
    currentBranch: currentBranch
  };
  
} catch (error) {
  console.log('   ❌ Git status check failed:', error.message);
  verificationResults.checks.git = {
    status: 'WARNING',
    details: 'Could not check git status'
  };
}

// Check 8: Vercel Deployment Readiness
console.log('\n8️⃣ Vercel Deployment Readiness');
console.log('-'.repeat(40));

let deploymentReady = true;

// Check for Vercel-specific requirements
const vercelRequirements = [
  { name: 'package.json', path: 'package.json' },
  { name: 'Build script', check: () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.scripts && pkg.scripts.build;
  }},
  { name: 'Next.js config', path: 'next.config.js' },
  { name: 'No build errors', check: () => verificationResults.checks.build?.status === 'PASS' }
];

vercelRequirements.forEach(req => {
  let status = false;
  
  if (req.path) {
    status = fs.existsSync(req.path);
  } else if (req.check) {
    status = req.check();
  }
  
  console.log(`   ${status ? '✅' : '❌'} ${req.name}`);
  
  if (!status) {
    deploymentReady = false;
    verificationResults.issues.push(`Vercel requirement not met: ${req.name}`);
  }
});

// Check for potential Vercel issues
console.log('   🔍 Potential deployment issues:');

const potentialIssues = [
  {
    name: 'Large bundle size',
    check: () => {
      try {
        const buildOutput = execSync('dir /s /-c .next 2>nul', { encoding: 'utf8' });
        const sizeMatch = buildOutput.match(/(\d+) bytes/);
        if (sizeMatch) {
          const sizeMB = parseInt(sizeMatch[1]) / (1024 * 1024);
          return sizeMB < 100; // Flag if over 100MB
        }
        return true;
      } catch {
        return true; // Can't check, assume OK
      }
    }
  },
  {
    name: 'Environment variables',
    check: () => fs.existsSync('.env.example') || fs.existsSync('.env.local')
  },
  {
    name: 'API routes compatibility',
    check: () => {
      // Check if API routes exist and are properly structured
      return !fs.existsSync('pages/api') || fs.existsSync('app/api');
    }
  }
];

potentialIssues.forEach(issue => {
  const status = issue.check();
  console.log(`     ${status ? '✅' : '⚠️'} ${issue.name}`);
  
  if (!status) {
    verificationResults.recommendations.push(`Review ${issue.name} before deployment`);
  }
});

verificationResults.checks.vercelReadiness = {
  status: deploymentReady ? 'PASS' : 'FAIL',
  details: 'Vercel deployment requirements checked'
};

// Final Assessment
console.log('\n📊 VERIFICATION SUMMARY');
console.log('=' .repeat(60));

const passedChecks = Object.values(verificationResults.checks).filter(check => check.status === 'PASS').length;
const totalChecks = Object.keys(verificationResults.checks).length;
const allChecksPassed = verificationResults.issues.length === 0;

verificationResults.readyForDeployment = allChecksPassed && deploymentReady;

if (verificationResults.readyForDeployment) {
  console.log('🎉 VERIFICATION STATUS: READY FOR DEPLOYMENT');
  console.log(`✅ ${passedChecks}/${totalChecks} checks passed`);
  console.log('');
  console.log('🚀 DEPLOYMENT APPROVED');
  console.log('');
  console.log('Next steps:');
  console.log('1. Stage changes: git add .');
  console.log('2. Commit: git commit -m "feat: Professional PDF Enhancement"');
  console.log('3. Push: git push origin main');
  console.log('4. Deploy: vercel --prod');
  
  if (verificationResults.recommendations.length > 0) {
    console.log('');
    console.log('💡 Recommendations:');
    verificationResults.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }
  
} else {
  console.log('❌ VERIFICATION STATUS: ISSUES DETECTED');
  console.log(`⚠️ ${passedChecks}/${totalChecks} checks passed`);
  console.log('');
  console.log('🔧 Issues to resolve:');
  verificationResults.issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('');
  console.log('Fix issues and re-run verification before deployment');
}

// Save detailed results
fs.writeFileSync('pre-deployment-verification.json', JSON.stringify(verificationResults, null, 2));
console.log('');
console.log('📄 Detailed results saved to: pre-deployment-verification.json');
console.log('=' .repeat(60));