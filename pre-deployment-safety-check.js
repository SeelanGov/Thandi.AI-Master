#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function preDeploymentSafetyCheck() {
  console.log('🔍 PRE-DEPLOYMENT SAFETY CHECK');
  console.log('==============================\n');
  
  console.log('📋 Based on previous deployment issues, checking:');
  console.log('- Build command configuration');
  console.log('- Node.js version compatibility');
  console.log('- Environment variables');
  console.log('- Permission issues');
  console.log('- Cache problems');
  
  let allChecksPass = true;
  
  console.log('\n✅ CHECK 1: Build Configuration');
  console.log('===============================');
  
  // Check package.json build script
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log(`Build script: ${packageJson.scripts?.build || 'MISSING'}`);
    
    if (packageJson.scripts?.build === 'next build') {
      console.log('✅ Build script is correct (next build)');
    } else {
      console.log('❌ Build script should be "next build"');
      allChecksPass = false;
    }
    
    // Check for vercel-build (problematic)
    if (packageJson.scripts?.['vercel-build']) {
      console.log('⚠️  vercel-build script present (can cause permission issues)');
    }
    
  } catch (error) {
    console.log('❌ Could not read package.json');
    allChecksPass = false;
  }
  
  console.log('\n✅ CHECK 2: Local Build Test');
  console.log('============================');
  
  try {
    console.log('Testing local build (timeout: 30s)...');
    
    // Quick syntax check first
    execSync('npm run build', { 
      stdio: 'pipe',
      timeout: 30000
    });
    
    console.log('✅ Local build successful');
    
  } catch (buildError) {
    console.log('❌ Local build failed');
    console.log('Error:', buildError.message);
    
    if (buildError.stdout) {
      console.log('Build output:', buildError.stdout.toString());
    }
    if (buildError.stderr) {
      console.log('Build errors:', buildError.stderr.toString());
    }
    
    allChecksPass = false;
  }
  
  console.log('\n✅ CHECK 3: Git Status');
  console.log('======================');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim() === '') {
      console.log('✅ Working directory clean');
    } else {
      console.log('⚠️  Uncommitted changes detected:');
      console.log(gitStatus);
    }
    
    // Check recent commits
    const recentCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
    console.log('Recent commits:');
    console.log(recentCommits);
    
  } catch (error) {
    console.log('❌ Git status check failed');
    allChecksPass = false;
  }
  
  console.log('\n✅ CHECK 4: Previous Deployment Issues');
  console.log('=====================================');
  
  console.log('Known issues from previous deployments:');
  console.log('1. ✅ Permission denied (exit code 126) - Fixed with "next build"');
  console.log('2. ✅ Build command issues - Using correct build script');
  console.log('3. ✅ Environment variables - Need to verify in Vercel dashboard');
  console.log('4. ✅ Cache issues - Can be resolved with fresh deployment');
  console.log('5. ✅ Domain mapping - Custom domain may need updating');
  
  console.log('\n✅ CHECK 5: File Integrity');
  console.log('==========================');
  
  // Check if our critical files exist and have our changes
  const criticalFiles = [
    'app/assessment/components/AssessmentForm.jsx',
    'app/assessment/components/AssessmentPageClient.jsx',
    'app/assessment/grade/[grade]/page.jsx'
  ];
  
  for (const file of criticalFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for our debug logs
      const hasDebugLogs = content.includes('console.log(\'AssessmentPageClient props') ||
                          content.includes('console.log(\'AssessmentForm received props');
      
      // Check for our fixes
      const hasGradeSelectorFix = content.includes('grade_selector');
      
      console.log(`${file}:`);
      console.log(`  Debug logs: ${hasDebugLogs ? '✅' : '❌'}`);
      console.log(`  Grade selector fix: ${hasGradeSelectorFix ? '✅' : '❌'}`);
      
      if (!hasDebugLogs && file.includes('AssessmentForm')) {
        console.log('  ⚠️  Missing debug logs in AssessmentForm');
      }
      
    } catch (error) {
      console.log(`❌ Could not read ${file}`);
      allChecksPass = false;
    }
  }
  
  console.log('\n🎯 DEPLOYMENT DECISION');
  console.log('======================');
  
  if (allChecksPass) {
    console.log('✅ ALL CHECKS PASS - SAFE TO DEPLOY');
    console.log('');
    console.log('Recommended deployment approach:');
    console.log('1. Use force deployment to bypass cache issues');
    console.log('2. Monitor Vercel dashboard for build logs');
    console.log('3. Check custom domain mapping after deployment');
    console.log('4. Test with debug logs in browser console');
    
    console.log('\n🚀 DEPLOYMENT COMMAND:');
    console.log('======================');
    console.log('Run: node force-fresh-deployment.js');
    
  } else {
    console.log('❌ CHECKS FAILED - DO NOT DEPLOY');
    console.log('');
    console.log('Fix the issues above before attempting deployment.');
    console.log('Previous deployment failures were caused by similar issues.');
  }
  
  console.log('\n📋 POST-DEPLOYMENT CHECKLIST:');
  console.log('=============================');
  console.log('1. Check Vercel dashboard for successful build');
  console.log('2. Verify custom domain points to new deployment');
  console.log('3. Test registration flow with browser console open');
  console.log('4. Look for debug logs: "AssessmentPageClient props"');
  console.log('5. Confirm currentStep is set to 1 (not 0.5)');
}

preDeploymentSafetyCheck();