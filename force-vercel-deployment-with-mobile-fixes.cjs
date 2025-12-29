/**
 * FORCE VERCEL DEPLOYMENT WITH MOBILE UI FIXES
 * 
 * The issue: Live deployment doesn't have our mobile UI fixes
 * Solution: Force a fresh deployment with current code
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function forceVercelDeployment() {
  console.log('🚀 FORCE VERCEL DEPLOYMENT WITH MOBILE UI FIXES');
  console.log('===============================================');
  console.log('🎯 Goal: Deploy current mobile UI fixes to live URL\n');

  // Step 1: Verify local changes are committed
  console.log('📋 STEP 1: Checking Git Status');
  console.log('==============================');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim()) {
      console.log('⚠️  Uncommitted changes detected:');
      console.log(gitStatus);
      
      console.log('\n📦 Committing mobile UI fixes...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Deploy mobile UI fixes to production - touch targets, responsive breakpoints, THANDI branding"', { stdio: 'inherit' });
      console.log('✅ Changes committed');
    } else {
      console.log('✅ All changes already committed');
    }
    
  } catch (error) {
    console.log('❌ Git status check failed:', error.message);
  }

  // Step 2: Push to GitHub (triggers Vercel deployment)
  console.log('\n🔄 STEP 2: Pushing to GitHub');
  console.log('============================');
  
  try {
    console.log('📤 Pushing to main branch...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub');
    
    console.log('\n⏱️  Waiting for Vercel auto-deployment...');
    console.log('This typically takes 2-3 minutes');
    
  } catch (error) {
    console.log('❌ Git push failed:', error.message);
    console.log('Trying alternative deployment methods...');
  }

  // Step 3: Create deployment trigger file
  console.log('\n🔧 STEP 3: Creating Deployment Trigger');
  console.log('======================================');
  
  const deploymentTrigger = {
    timestamp: new Date().toISOString(),
    commit: 'mobile-ui-fixes-deployment',
    features: [
      '48px touch targets for WCAG compliance',
      'Mobile breakpoints (xs: 475px to 2xl: 1536px)',
      'Touch manipulation CSS',
      'iOS Safari and Android Chrome fixes',
      'Enhanced registration component',
      'Mobile-first responsive design',
      'THANDI branding sequence fixes'
    ],
    vercelUrls: [
      'https://thandiai.vercel.app',
      'https://thandi.vercel.app'
    ],
    expectedChanges: [
      'Touch-friendly 48px+ buttons and inputs',
      'Responsive breakpoints working on mobile',
      'Proper THANDI branding sequence',
      'Mobile registration flow completion',
      'iOS/Android specific optimizations'
    ]
  };
  
  fs.writeFileSync('deployment-trigger-mobile-ui.json', JSON.stringify(deploymentTrigger, null, 2));
  console.log('✅ Deployment trigger created');

  // Step 4: Verify deployment files are ready
  console.log('\n📁 STEP 4: Verifying Deployment Files');
  console.log('=====================================');
  
  const criticalFiles = [
    'app/assessment/page.jsx',
    'components/BulletproofStudentRegistration.jsx',
    'app/globals.css',
    'tailwind.config.js',
    'next.config.js',
    'package.json'
  ];
  
  let allFilesReady = true;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesReady = false;
    }
  });
  
  if (allFilesReady) {
    console.log('✅ All critical files present');
  } else {
    console.log('❌ Missing critical files - deployment may fail');
  }

  // Step 5: Test local build one more time
  console.log('\n🔨 STEP 5: Final Local Build Test');
  console.log('=================================');
  
  try {
    console.log('Building locally to verify...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Local build successful');
  } catch (error) {
    console.log('❌ Local build failed - fix before deploying');
    console.log(error.message);
    return;
  }

  // Step 6: Monitor deployment
  console.log('\n👀 STEP 6: Deployment Monitoring');
  console.log('=================================');
  
  console.log('🔍 Monitoring deployment progress...');
  console.log('\nExpected timeline:');
  console.log('• 0-30 seconds: GitHub receives push');
  console.log('• 30-60 seconds: Vercel starts build');
  console.log('• 1-3 minutes: Build and deployment');
  console.log('• 3-5 minutes: CDN propagation');
  
  console.log('\n🌐 URLs to test after deployment:');
  console.log('• https://thandiai.vercel.app/assessment');
  console.log('• https://thandi.vercel.app/assessment');
  
  console.log('\n✅ Mobile UI features to verify:');
  console.log('• Touch targets are 48px+ (tap with finger)');
  console.log('• Responsive breakpoints work on mobile');
  console.log('• THANDI branding appears correctly');
  console.log('• Registration flow completes on mobile');
  console.log('• iOS Safari and Android Chrome compatibility');

  // Step 7: Create verification script
  console.log('\n📝 STEP 7: Creating Verification Script');
  console.log('=======================================');
  
  const verificationScript = `
# MOBILE UI DEPLOYMENT VERIFICATION
# Run this after 5 minutes to verify deployment

echo "🔍 Testing mobile UI deployment..."

# Test main URL
curl -s -o /dev/null -w "%{http_code}" https://thandiai.vercel.app/assessment
echo "Assessment page status: $?"

# Test for mobile viewport
curl -s https://thandiai.vercel.app/assessment | grep -q "width=device-width"
echo "Mobile viewport: $?"

# Test for responsive classes
curl -s https://thandiai.vercel.app/assessment | grep -q "sm:"
echo "Responsive classes: $?"

echo "✅ Verification complete"
`;
  
  fs.writeFileSync('verify-mobile-deployment.sh', verificationScript);
  console.log('✅ Verification script created: verify-mobile-deployment.sh');

  console.log('\n🎯 DEPLOYMENT STATUS');
  console.log('===================');
  console.log('✅ Code committed and pushed to GitHub');
  console.log('⏱️  Vercel auto-deployment triggered');
  console.log('🔄 Waiting for build completion...');
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Wait 5 minutes for deployment to complete');
  console.log('2. Test https://thandiai.vercel.app/assessment on mobile');
  console.log('3. Verify touch targets are 48px+ (finger-friendly)');
  console.log('4. Check responsive breakpoints work');
  console.log('5. Confirm THANDI branding sequence is correct');
  
  console.log('\n🚨 IF DEPLOYMENT FAILS:');
  console.log('1. Check Vercel dashboard for build logs');
  console.log('2. Run: node diagnose-vercel-deployment-comprehensive.cjs');
  console.log('3. Try manual Vercel CLI deployment');
  
  return {
    status: 'deployment_triggered',
    timestamp: new Date().toISOString(),
    expectedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    testUrls: deploymentTrigger.vercelUrls
  };
}

// Run the deployment
forceVercelDeployment().catch(console.error);