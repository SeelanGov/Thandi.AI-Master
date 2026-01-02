#!/usr/bin/env node

const { execSync } = require('child_process');

function forceFreshDeployment() {
  console.log('🚀 FORCING FRESH DEPLOYMENT');
  console.log('===========================\n');
  
  console.log('🎯 ISSUE IDENTIFIED:');
  console.log('- Our fixes are committed to git');
  console.log('- But they are NOT in the deployed code');
  console.log('- This indicates a Vercel deployment failure');
  
  try {
    console.log('\n📋 Step 1: Create deployment trigger...');
    
    // Create a small change to trigger deployment
    const timestamp = new Date().toISOString();
    const triggerContent = `// Deployment trigger: ${timestamp}\n// Force fresh deployment to apply registration loop fixes\nexport const DEPLOYMENT_TRIGGER = '${timestamp}';\n`;
    
    require('fs').writeFileSync('deployment-trigger.js', triggerContent);
    
    console.log('✅ Created deployment trigger file');
    
    console.log('\n📦 Step 2: Staging trigger...');
    execSync('git add deployment-trigger.js', { stdio: 'inherit' });
    
    console.log('\n💾 Step 3: Committing trigger...');
    execSync(`git commit -m "FORCE DEPLOYMENT: Trigger fresh build\n\nPrevious fixes were not deployed properly.\nThis commit forces Vercel to rebuild and deploy:\n- Registration loop fixes\n- LocalStorage override fixes\n- Debug logging\n\nTimestamp: ${timestamp}"`, { stdio: 'inherit' });
    
    console.log('\n🌐 Step 4: Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🚀 Step 5: Vercel deployment triggered...');
    
    console.log('\n✅ FRESH DEPLOYMENT INITIATED');
    console.log('=============================');
    console.log('🔗 Monitor: https://vercel.com/dashboard');
    console.log('⏱️  Wait: 3-5 minutes for complete rebuild');
    
    console.log('\n🧪 POST-DEPLOYMENT TESTING:');
    console.log('===========================');
    console.log('1. Wait 5 minutes for deployment');
    console.log('2. Test: https://www.thandi.online/assessment');
    console.log('3. Open browser console (F12)');
    console.log('4. Complete registration flow');
    console.log('5. Look for debug messages:');
    console.log('   - "AssessmentPageClient props:"');
    console.log('   - "AssessmentForm received props:"');
    console.log('   - "Setting currentStep to 1"');
    
    console.log('\n🎯 EXPECTED OUTCOME:');
    console.log('====================');
    console.log('✅ Debug logs appear in console');
    console.log('✅ currentStep set to 1 (not 0.5)');
    console.log('✅ Registration goes to assessment');
    console.log('✅ No more loop back to registration');
    
  } catch (error) {
    console.error('❌ Force deployment failed:', error.message);
    process.exit(1);
  }
}

forceFreshDeployment();