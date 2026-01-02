#!/usr/bin/env node

const { execSync } = require('child_process');

function deployDebugVersion() {
  console.log('🔍 DEPLOYING DEBUG VERSION');
  console.log('==========================\n');
  
  console.log('📋 Debug logging added to:');
  console.log('- AssessmentPageClient: Props received and passed');
  console.log('- AssessmentForm: Props received and step initialization');
  
  try {
    console.log('\n📦 Step 1: Staging changes...');
    execSync('git add app/assessment/components/AssessmentPageClient.jsx app/assessment/components/AssessmentForm.jsx', { stdio: 'inherit' });
    
    console.log('\n💾 Step 2: Committing debug version...');
    execSync('git commit -m "DEBUG: Add console logging to trace registration loop issue\n\n- Added debug logs to AssessmentPageClient prop flow\n- Added debug logs to AssessmentForm state initialization\n- This will help identify where the registration loop occurs\n- Logs will show in browser console for live debugging"', { stdio: 'inherit' });
    
    console.log('\n🌐 Step 3: Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🚀 Step 4: Vercel deployment triggered...');
    
    console.log('\n✅ DEBUG VERSION DEPLOYED');
    console.log('=========================');
    console.log('🔗 Test URL: https://www.thandi.online/assessment');
    console.log('⏱️  Deployment time: 2-3 minutes');
    
    console.log('\n🔍 DEBUGGING INSTRUCTIONS:');
    console.log('==========================');
    console.log('1. Open browser to: https://www.thandi.online/assessment');
    console.log('2. Open browser console (F12)');
    console.log('3. Complete registration flow');
    console.log('4. Watch console for debug messages:');
    console.log('   - "AssessmentPageClient props:"');
    console.log('   - "Passing to AssessmentForm:"');
    console.log('   - "AssessmentForm received props:"');
    console.log('   - "Initializing currentStep with:"');
    console.log('   - "Setting currentStep to X"');
    
    console.log('\n🎯 WHAT TO LOOK FOR:');
    console.log('====================');
    console.log('✅ isRegistered should be true');
    console.log('✅ initialStep should be "grade_selector"');
    console.log('✅ currentStep should be set to 1');
    console.log('❌ If any of these are wrong, we found the issue');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployDebugVersion();