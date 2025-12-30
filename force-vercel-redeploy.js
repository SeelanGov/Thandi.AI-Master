#!/usr/bin/env node

/**
 * FORCE VERCEL REDEPLOY
 * Force a new deployment by making a small change and pushing
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function forceRedeploy() {
  console.log('🔄 FORCING VERCEL REDEPLOY');
  console.log('==========================');
  
  try {
    // Step 1: Make a small change to force redeploy
    console.log('\n1️⃣ Making deployment trigger change...');
    
    const timestamp = new Date().toISOString();
    const deploymentMarker = `// Deployment trigger: ${timestamp}\n`;
    
    // Add deployment marker to next.config.js
    let nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (!nextConfig.includes('Deployment trigger:')) {
      nextConfig = deploymentMarker + nextConfig;
      fs.writeFileSync('next.config.js', nextConfig);
      console.log('   ✅ Added deployment trigger to next.config.js');
    } else {
      // Update existing marker
      nextConfig = nextConfig.replace(/\/\/ Deployment trigger:.*\n/, deploymentMarker);
      fs.writeFileSync('next.config.js', nextConfig);
      console.log('   ✅ Updated deployment trigger in next.config.js');
    }
    
    // Step 2: Verify our fix is still in place
    console.log('\n2️⃣ Verifying assessment fix...');
    
    const assessmentForm = fs.readFileSync('app/assessment/components/AssessmentForm.jsx', 'utf8');
    const hasCorrectFix = assessmentForm.includes('return 0.5; // Default: start with registration');
    
    if (!hasCorrectFix) {
      throw new Error('Assessment fix is missing! The currentStep should default to 0.5');
    }
    console.log('   ✅ Assessment fix is in place (currentStep = 0.5)');
    
    // Step 3: Test local build again
    console.log('\n3️⃣ Testing local build...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('   ✅ Local build successful');
    } catch (error) {
      throw new Error('Local build failed - cannot deploy');
    }
    
    // Step 4: Commit and push
    console.log('\n4️⃣ Forcing new deployment...');
    
    try {
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "Force redeploy: Fix assessment flow - currentStep=0.5 for registration"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('   ✅ Forced new deployment');
    } catch (error) {
      throw new Error('Failed to push changes');
    }
    
    console.log('\n🎯 FORCED REDEPLOY COMPLETE!');
    console.log('✅ Made deployment trigger change');
    console.log('✅ Verified assessment fix is in place');
    console.log('✅ Local build successful');
    console.log('✅ Pushed to trigger new Vercel deployment');
    console.log('\n⏳ Wait 2-3 minutes then test: https://www.thandi.online/assessment');
    console.log('🎯 Expected: Students should see registration form, NOT grade selector');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Force redeploy failed:', error.message);
    return false;
  }
}

// Run force redeploy
forceRedeploy().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});