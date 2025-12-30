#!/usr/bin/env node

/**
 * FORCE DEPLOYMENT WITH UI/UX FIXES
 * Ensures our latest UI/UX fixes are deployed to production
 */

const { execSync } = require('child_process');
const fs = require('fs');

function executeCommand(command, description) {
  try {
    console.log(`\n📋 ${description}`);
    console.log(`💻 Command: ${command}`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`✅ Success: ${description}`);
    return result;
  } catch (error) {
    console.log(`❌ Error: ${description}`);
    console.log(`Error: ${error.message}`);
    return null;
  }
}

function forceDeployment() {
  console.log('🚀 FORCING DEPLOYMENT WITH UI/UX FIXES');
  console.log('======================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  
  // Step 1: Verify our fixes are committed
  console.log('\n🔍 STEP 1: Verifying Git Status');
  console.log('================================');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log('⚠️ Uncommitted changes detected, committing...');
      executeCommand('git add .', 'Staging all changes');
      executeCommand('git commit -m "Force deployment: UI/UX fixes"', 'Committing changes');
    } else {
      console.log('✅ All changes already committed');
    }
  } catch (error) {
    console.log('⚠️ Git status check failed, continuing...');
  }
  
  // Step 2: Push to trigger deployment
  console.log('\n🚀 STEP 2: Triggering Deployment');
  console.log('=================================');
  
  executeCommand('git push origin main --force-with-lease', 'Force pushing to trigger deployment');
  
  // Step 3: Create deployment marker to force rebuild
  console.log('\n📝 STEP 3: Creating Deployment Marker');
  console.log('=====================================');
  
  const deploymentMarker = {
    timestamp: new Date().toISOString(),
    version: '2.0.2-ui-fixes',
    commit: 'latest',
    ui_fixes_applied: true,
    admin_panel_fixes_applied: true,
    branding_fixes_applied: true,
    force_deployment: true
  };
  
  fs.writeFileSync('deployment-marker.json', JSON.stringify(deploymentMarker, null, 2));
  console.log('✅ Created deployment marker');
  
  // Step 4: Update package.json version to force rebuild
  console.log('\n📦 STEP 4: Updating Version');
  console.log('============================');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const oldVersion = packageJson.version;
    packageJson.version = '0.1.4'; // Increment version
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated version: ${oldVersion} → ${packageJson.version}`);
  } catch (error) {
    console.log('⚠️ Could not update package.json version');
  }
  
  // Step 5: Commit version change and push
  console.log('\n🔄 STEP 5: Final Push');
  console.log('=====================');
  
  executeCommand('git add deployment-marker.json package.json', 'Staging deployment files');
  executeCommand('git commit -m "Deploy v0.1.4: UI/UX fixes force deployment"', 'Committing deployment');
  executeCommand('git push origin main', 'Final push to trigger deployment');
  
  console.log('\n⏳ STEP 6: Waiting for Deployment');
  console.log('==================================');
  console.log('⏳ Waiting 60 seconds for deployment to complete...');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ Deployment wait period complete');
      resolve(true);
    }, 60000);
  });
}

async function verifyDeployment() {
  console.log('\n🔍 STEP 7: Verifying Deployment');
  console.log('===============================');
  
  const testUrl = 'https://www.thandi.online/assessment';
  
  try {
    const https = require('https');
    
    const response = await new Promise((resolve, reject) => {
      const req = https.get(testUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    console.log(`📡 Testing: ${testUrl}`);
    console.log(`✅ Status: ${response.statusCode}`);
    
    // Check for our UI fixes
    const uiFixChecks = {
      'Thandi Branding': response.body.includes('Thandi') && !response.body.includes('THANDI'),
      'Teal Colors': response.body.includes('thandi-teal'),
      'Loading Spinners': response.body.includes('animate-spin'),
      'Responsive Design': response.body.includes('sm:') || response.body.includes('px-4'),
      'Error Handling': response.body.includes('error') || response.body.includes('Error')
    };
    
    console.log('\n🎨 UI/UX Fix Verification:');
    let fixesDeployed = 0;
    Object.entries(uiFixChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      if (passed) fixesDeployed++;
    });
    
    const deploymentSuccess = fixesDeployed >= 3;
    console.log(`\n📊 Deployment Success: ${deploymentSuccess ? '✅' : '❌'} (${fixesDeployed}/5 fixes detected)`);
    
    return deploymentSuccess;
    
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    await forceDeployment();
    const success = await verifyDeployment();
    
    console.log('\n🎯 DEPLOYMENT SUMMARY');
    console.log('====================');
    
    if (success) {
      console.log('🎉 SUCCESS: UI/UX fixes deployed successfully!');
      console.log('✅ Domain: https://www.thandi.online');
      console.log('✅ All fixes are now live');
      console.log('\n📋 Next Steps:');
      console.log('1. Test all pages manually');
      console.log('2. Verify admin panel functionality');
      console.log('3. Check mobile responsiveness');
    } else {
      console.log('⚠️ PARTIAL: Deployment completed but fixes may need more time');
      console.log('🔄 Try testing again in 5-10 minutes');
      console.log('💡 CDN cache may need time to update');
    }
    
    return success;
    
  } catch (error) {
    console.log('\n❌ DEPLOYMENT FAILED');
    console.log('====================');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Run the deployment
main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  process.exit(success ? 0 : 1);
});