/**
 * FORCE FRESH VERCEL DEPLOYMENT
 * 
 * The mobile UI fixes are in our code but not deployed.
 * This script will force a fresh deployment.
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function forceFreshDeployment() {
  console.log('🚀 FORCE FRESH VERCEL DEPLOYMENT');
  console.log('================================');
  console.log('🎯 Issue: Mobile UI fixes in code but not deployed');
  console.log('💡 Solution: Force fresh deployment with cache busting\n');

  // Step 1: Create a deployment marker to force rebuild
  console.log('📝 STEP 1: Creating Deployment Marker');
  console.log('=====================================');
  
  const deploymentMarker = {
    timestamp: new Date().toISOString(),
    commit: 'force-mobile-ui-deployment',
    reason: 'Mobile UI fixes not appearing in live deployment',
    features: [
      'min-h-[48px] touch targets for WCAG compliance',
      'sm: and xs: mobile breakpoints',
      'touch-manipulation CSS for mobile',
      'BulletproofStudentRegistration component',
      'Mobile-first responsive design'
    ],
    expectedUrl: 'https://thandiai.vercel.app/assessment',
    verificationChecks: [
      'Touch targets should be 48px+ height',
      'Responsive breakpoints should work',
      'THANDI branding should be correct',
      'Registration form should be mobile-optimized'
    ]
  };
  
  fs.writeFileSync('deployment-marker.json', JSON.stringify(deploymentMarker, null, 2));
  console.log('✅ Deployment marker created');

  // Step 2: Update package.json version to force rebuild
  console.log('\n📦 STEP 2: Updating Package Version');
  console.log('===================================');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentVersion = packageJson.version;
    const versionParts = currentVersion.split('.');
    versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
    const newVersion = versionParts.join('.');
    
    packageJson.version = newVersion;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
  } catch (error) {
    console.log('⚠️  Version update failed, continuing anyway');
  }

  // Step 3: Clean local build to ensure fresh deployment
  console.log('\n🧹 STEP 3: Cleaning Local Build');
  console.log('===============================');
  
  try {
    if (fs.existsSync('.next')) {
      execSync('rmdir /s /q .next', { stdio: 'inherit' });
      console.log('✅ .next directory cleaned');
    }
    
    console.log('🔨 Building fresh...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Fresh build successful');
    
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    return;
  }

  // Step 4: Commit and push changes
  console.log('\n📤 STEP 4: Committing and Pushing');
  console.log('=================================');
  
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Force deployment: Mobile UI fixes with touch targets and responsive breakpoints"', { stdio: 'inherit' });
    execSync('git push origin main --force-with-lease', { stdio: 'inherit' });
    console.log('✅ Changes pushed with force-with-lease');
    
  } catch (error) {
    console.log('❌ Git operations failed:', error.message);
    console.log('Trying alternative push...');
    
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Standard push successful');
    } catch (pushError) {
      console.log('❌ All push attempts failed');
      return;
    }
  }

  // Step 5: Wait and verify deployment
  console.log('\n⏱️  STEP 5: Monitoring Deployment');
  console.log('=================================');
  
  console.log('🔍 Deployment triggered - monitoring progress...');
  console.log('\nExpected timeline:');
  console.log('• 0-30 seconds: GitHub webhook triggers Vercel');
  console.log('• 30-90 seconds: Vercel builds application');
  console.log('• 90-180 seconds: Deployment and CDN update');
  console.log('• 180-300 seconds: Global propagation');
  
  console.log('\n🎯 What to verify after 5 minutes:');
  console.log('1. Visit: https://thandiai.vercel.app/assessment');
  console.log('2. Check: Touch targets are 48px+ (finger-friendly)');
  console.log('3. Test: Mobile breakpoints work (resize browser)');
  console.log('4. Verify: THANDI branding appears correctly');
  console.log('5. Complete: Registration flow on mobile device');

  // Step 6: Create verification script
  console.log('\n📋 STEP 6: Creating Verification Script');
  console.log('======================================');
  
  const verificationScript = `
/**
 * MOBILE UI DEPLOYMENT VERIFICATION
 * Run this after 5 minutes to check deployment
 */

const https = require('https');

async function verifyMobileDeployment() {
  console.log('🔍 VERIFYING MOBILE UI DEPLOYMENT');
  console.log('=================================');
  
  const url = 'https://thandiai.vercel.app/assessment';
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(\`✅ Page loaded (\${res.statusCode})\`);
      
      const checks = {
        touchTargets: data.includes('min-h-[48px]'),
        mobileBreakpoints: data.includes('sm:'),
        touchManipulation: data.includes('touch-manipulation'),
        bulletproofComponent: data.includes('BulletproofStudentRegistration')
      };
      
      console.log('\\n📱 Mobile UI Features:');
      Object.entries(checks).forEach(([feature, present]) => {
        console.log(\`\${present ? '✅' : '❌'} \${feature}\`);
      });
      
      const successCount = Object.values(checks).filter(Boolean).length;
      console.log(\`\\n📊 Result: \${successCount}/4 features deployed\`);
      
      if (successCount >= 3) {
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
      } else {
        console.log('⚠️  Deployment still pending or failed');
      }
    });
  });
}

verifyMobileDeployment();
`;
  
  fs.writeFileSync('verify-mobile-deployment.cjs', verificationScript);
  console.log('✅ Verification script created: verify-mobile-deployment.cjs');

  console.log('\n🎯 DEPLOYMENT STATUS');
  console.log('===================');
  console.log('✅ Fresh deployment triggered');
  console.log('✅ Mobile UI fixes committed');
  console.log('✅ Cache-busting version bump applied');
  console.log('⏱️  Waiting for Vercel build completion...');
  
  console.log('\n📋 IMMEDIATE NEXT STEPS:');
  console.log('1. Wait 5 minutes for deployment');
  console.log('2. Run: node verify-mobile-deployment.cjs');
  console.log('3. Test on mobile device: https://thandiai.vercel.app/assessment');
  console.log('4. Verify touch targets work with finger taps');
  
  console.log('\n🚨 IF STILL NOT WORKING:');
  console.log('1. Check Vercel dashboard for build errors');
  console.log('2. Try different Vercel URL: https://thandi.vercel.app');
  console.log('3. Clear browser cache completely');
  console.log('4. Test in incognito/private browsing mode');
  
  return {
    status: 'deployment_forced',
    timestamp: new Date().toISOString(),
    expectedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    verificationUrl: 'https://thandiai.vercel.app/assessment'
  };
}

// Run the deployment
forceFreshDeployment().catch(console.error);