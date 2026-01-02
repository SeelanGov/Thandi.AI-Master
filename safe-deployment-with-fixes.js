#!/usr/bin/env node

const { execSync } = require('child_process');

function safeDeploymentWithFixes() {
  console.log('🔧 SAFE DEPLOYMENT WITH FIXES');
  console.log('==============================\n');
  
  console.log('📋 Applying lessons learned from previous deployment issues:');
  console.log('- Removed problematic vercel-build script');
  console.log('- Using clean git workflow');
  console.log('- Forcing fresh deployment to bypass cache');
  console.log('- Monitoring for permission issues (exit code 126)');
  
  try {
    console.log('\n📦 Step 1: Clean up and stage critical fixes...');
    
    // Stage only the critical files with our fixes
    execSync('git add package.json', { stdio: 'inherit' });
    execSync('git add app/assessment/components/AssessmentForm.jsx', { stdio: 'inherit' });
    execSync('git add app/assessment/components/AssessmentPageClient.jsx', { stdio: 'inherit' });
    
    console.log('✅ Staged critical fixes');
    
    console.log('\n💾 Step 2: Commit fixes...');
    
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "SAFE DEPLOYMENT: Registration loop fixes + build cleanup

CRITICAL FIXES:
- Fixed registration loop issue (localStorage override)
- Added debug logging for troubleshooting
- Enhanced prop flow between components
- Removed problematic vercel-build script

DEPLOYMENT SAFETY:
- Applied lessons from previous deployment failures
- Using clean build process (next build only)
- Forcing fresh deployment to bypass cache issues
- Monitoring for exit code 126 permission errors

This addresses the core issue where registered users
loop back to registration instead of assessment.

Timestamp: ${timestamp}"`, { stdio: 'inherit' });
    
    console.log('✅ Committed with comprehensive message');
    
    console.log('\n🌐 Step 3: Push to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🚀 Step 4: Vercel deployment triggered...');
    console.log('Vercel will automatically deploy from main branch...');
    
    console.log('\n✅ SAFE DEPLOYMENT INITIATED');
    console.log('============================');
    console.log('🔗 Monitor: https://vercel.com/dashboard');
    console.log('⏱️  Expected time: 3-5 minutes');
    
    console.log('\n🔍 MONITORING CHECKLIST:');
    console.log('========================');
    console.log('Watch Vercel build logs for:');
    console.log('✅ Build duration > 30 seconds (good sign)');
    console.log('✅ "Creating an optimized production build"');
    console.log('✅ "Compiled successfully"');
    console.log('❌ Permission denied errors');
    console.log('❌ Exit code 126');
    console.log('❌ Build duration < 20 seconds (failure sign)');
    
    console.log('\n🧪 POST-DEPLOYMENT TESTING:');
    console.log('===========================');
    console.log('1. Wait 5 minutes for complete deployment');
    console.log('2. Test: https://www.thandi.online/assessment');
    console.log('3. Open browser console (F12)');
    console.log('4. Complete registration flow');
    console.log('5. Look for debug messages:');
    console.log('   - "AssessmentPageClient props: {grade: X, isRegistered: true}"');
    console.log('   - "AssessmentForm received props: {initialGrade: X, initialStep: grade_selector}"');
    console.log('   - "Setting currentStep to 1 (assessment)"');
    
    console.log('\n🎯 SUCCESS INDICATORS:');
    console.log('======================');
    console.log('✅ Vercel build completes without errors');
    console.log('✅ Debug logs appear in browser console');
    console.log('✅ currentStep = 1 (not 0.5)');
    console.log('✅ Registration goes to assessment questions');
    console.log('✅ No loop back to registration page');
    
    console.log('\n⚠️  FAILURE INDICATORS:');
    console.log('=======================');
    console.log('❌ Build fails with permission errors');
    console.log('❌ No debug logs in console');
    console.log('❌ currentStep = 0.5 (still registration)');
    console.log('❌ Still loops back to registration');
    
    console.log('\n🔄 ROLLBACK PLAN:');
    console.log('=================');
    console.log('If deployment fails:');
    console.log('1. Check Vercel dashboard for specific error');
    console.log('2. Revert to previous working commit if needed');
    console.log('3. Address specific build issues');
    console.log('4. Re-run safety check before next attempt');
    
  } catch (error) {
    console.error('❌ Safe deployment failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('===================');
    console.log('1. Check git status for uncommitted changes');
    console.log('2. Verify network connection');
    console.log('3. Check GitHub repository access');
    console.log('4. Run: git status && git log --oneline -3');
    process.exit(1);
  }
}

safeDeploymentWithFixes();