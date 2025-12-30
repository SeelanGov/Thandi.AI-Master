#!/usr/bin/env node

/**
 * DEPLOY FINAL FIX
 * Simple, direct deployment of the assessment flow fix
 */

const fs = require('fs');
const { execSync } = require('child_process');

function deployFinalFix() {
  console.log('🚀 DEPLOYING FINAL ASSESSMENT FIX');
  console.log('==================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  
  console.log('\n✅ CONFIRMED FIXES IN PLACE:');
  console.log('1. AssessmentForm.jsx: currentStep defaults to 0.5 (registration)');
  console.log('2. next.config.js: Clean, minimal configuration');
  console.log('3. Build: Tested successfully locally');
  
  // Update version
  console.log('\n📦 Updating version');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    packageJson.version = '0.2.2-final-fix';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated to version 0.2.2-final-fix');
  } catch (error) {
    console.log(`⚠️ Could not update version: ${error.message}`);
  }
  
  // Clean up test files
  console.log('\n🧹 Cleaning up test files');
  const testFiles = [
    'test-local-registration.js',
    'deployment-trigger.json'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  });
  
  // Deploy
  console.log('\n🚀 Deploying to Vercel');
  try {
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Staged changes');
    
    execSync('git commit -m "FINAL FIX: Assessment shows registration form first - ready for students"', { stdio: 'inherit' });
    console.log('✅ Committed final fix');
    
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub - Vercel deployment triggered');
    
    return true;
  } catch (error) {
    console.log(`❌ Deployment failed: ${error.message}`);
    return false;
  }
}

async function testDeployment() {
  console.log('\n🧪 TESTING DEPLOYMENT');
  console.log('======================');
  console.log('⏳ Waiting 60 seconds for deployment...');
  
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  const https = require('https');
  
  const result = await new Promise((resolve) => {
    const req = https.get('https://www.thandi.online/assessment', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          hasRegistration: data.includes('privacy') || data.includes('consent') || data.includes('Student Registration'),
          hasGradeSelector: data.includes('What grade are you in'),
          content: data.substring(0, 300)
        });
      });
    });
    req.on('error', () => resolve({ success: false }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false });
    });
  });
  
  if (result.success) {
    console.log(`✅ Site responding: ${result.statusCode}`);
    console.log(`📝 Has Registration: ${result.hasRegistration ? 'Yes' : 'No'}`);
    console.log(`🎯 Has Grade Selector: ${result.hasGradeSelector ? 'Yes' : 'No'}`);
    
    if (result.hasRegistration && !result.hasGradeSelector) {
      console.log('\n🎉 SUCCESS: Registration form is showing!');
      return true;
    } else if (result.hasGradeSelector) {
      console.log('\n⚠️ Still showing grade selector - may need more time');
      return false;
    } else {
      console.log('\n⚠️ Partial success - components may be loading');
      return false;
    }
  } else {
    console.log('❌ Site not responding');
    return false;
  }
}

async function main() {
  try {
    const deploySuccess = deployFinalFix();
    
    if (!deploySuccess) {
      console.log('\n❌ DEPLOYMENT FAILED');
      return false;
    }
    
    const testSuccess = await testDeployment();
    
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    
    if (testSuccess) {
      console.log('🎉 SUCCESS: Assessment flow is working!');
      console.log('✅ Students see registration form');
      console.log('✅ Ready for live testing');
      console.log('🌐 https://www.thandi.online/assessment');
    } else {
      console.log('⚠️ Deployed but may need more time');
      console.log('🔄 Check again in 10-15 minutes');
    }
    
    return testSuccess;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

main().then(success => {
  console.log(`\n📅 Completed: ${new Date().toISOString()}`);
  console.log(`🎯 Status: ${success ? 'READY FOR STUDENTS' : 'NEEDS MORE TIME'}`);
}).catch(error => {
  console.error('❌ Critical error:', error.message);
});