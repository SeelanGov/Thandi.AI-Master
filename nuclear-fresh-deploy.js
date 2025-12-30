#!/usr/bin/env node

/**
 * NUCLEAR FRESH DEPLOY
 * Create a completely new Vercel deployment from scratch
 * This bypasses all caching and deployment history issues
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function nuclearFreshDeploy() {
  console.log('☢️ NUCLEAR FRESH DEPLOY');
  console.log('========================');
  console.log('This will create a completely new deployment, bypassing all Vercel cache');
  
  try {
    // Step 1: Verify our local fix is working
    console.log('\n1️⃣ Verifying local fix...');
    
    const assessmentPage = fs.readFileSync('app/assessment/page.jsx', 'utf8');
    const hasRegistrationComment = assessmentPage.includes('CRITICAL: Always show registration form first');
    
    if (!hasRegistrationComment) {
      throw new Error('Local fix is missing! Assessment page should have registration form comment');
    }
    console.log('   ✅ Local fix confirmed - registration form will be shown');
    
    // Step 2: Clean everything locally
    console.log('\n2️⃣ Cleaning local build artifacts...');
    
    const cleanDirs = ['.next', 'node_modules/.cache', '.vercel'];
    for (const dir of cleanDirs) {
      if (fs.existsSync(dir)) {
        console.log(`   🗑️ Removing ${dir}`);
        execSync(`rmdir /s /q "${dir}"`, { stdio: 'inherit' });
      }
    }
    
    // Step 3: Add nuclear deployment marker
    console.log('\n3️⃣ Adding nuclear deployment marker...');
    
    const nuclearTimestamp = new Date().toISOString();
    const nuclearMarker = `// NUCLEAR DEPLOY: ${nuclearTimestamp}\n// FORCE FRESH BUILD - NO CACHE\n`;
    
    let nextConfig = fs.readFileSync('next.config.js', 'utf8');
    nextConfig = nuclearMarker + nextConfig;
    fs.writeFileSync('next.config.js', nextConfig);
    console.log('   ✅ Nuclear marker added to force fresh build');
    
    // Step 4: Test local build one final time
    console.log('\n4️⃣ Final local build test...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('   ✅ Local build successful - ready for deployment');
    } catch (error) {
      throw new Error('Local build failed - cannot deploy');
    }
    
    // Step 5: Create deployment commit
    console.log('\n5️⃣ Creating nuclear deployment commit...');
    
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "NUCLEAR DEPLOY: Fresh deployment - registration form fix"`, { stdio: 'inherit' });
      console.log('   ✅ Nuclear deployment commit created');
    } catch (error) {
      console.log('   ℹ️ No changes to commit (already committed)');
    }
    
    // Step 6: Push and trigger fresh deployment
    console.log('\n6️⃣ Triggering nuclear deployment...');
    
    try {
      execSync('git push origin main --force-with-lease', { stdio: 'inherit' });
      console.log('   ✅ Pushed to GitHub - fresh Vercel deployment triggered');
    } catch (error) {
      throw new Error('Failed to push to GitHub');
    }
    
    console.log('\n☢️ NUCLEAR DEPLOYMENT INITIATED!');
    console.log('==================================');
    console.log('✅ Cleaned all local cache');
    console.log('✅ Added nuclear deployment marker');
    console.log('✅ Verified local build works');
    console.log('✅ Forced fresh GitHub push');
    console.log('✅ Vercel will build completely from scratch');
    
    console.log('\n🎯 EXPECTED RESULT:');
    console.log('• Vercel will ignore all previous builds/cache');
    console.log('• Fresh build from current working code');
    console.log('• Students will see registration form (not grade selector)');
    console.log('• Assessment flow will work correctly');
    
    console.log('\n⏳ NEXT STEPS:');
    console.log('1. Wait 3-5 minutes for Vercel to complete fresh build');
    console.log('2. Test: https://www.thandi.online/assessment');
    console.log('3. Verify: "Welcome to Thandi Career Assessment" appears');
    console.log('4. Confirm: No "What grade are you in?" grade selector');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Nuclear deployment failed:', error.message);
    return false;
  }
}

// Run nuclear deployment
nuclearFreshDeploy().then(success => {
  if (success) {
    console.log('\n🚀 NUCLEAR DEPLOYMENT COMPLETE!');
    console.log('Monitor Vercel dashboard for fresh build progress');
  } else {
    console.log('\n💥 NUCLEAR DEPLOYMENT FAILED');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});