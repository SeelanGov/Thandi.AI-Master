#!/usr/bin/env node

/**
 * VERIFY NUCLEAR DEPLOY
 * Check if the nuclear fresh deployment fixed the issue
 */

const https = require('https');

async function verifyNuclearDeploy() {
  console.log('🔍 VERIFYING NUCLEAR DEPLOYMENT');
  console.log('===============================');
  
  const liveUrl = 'https://www.thandi.online/assessment';
  console.log(`🎯 Testing: ${liveUrl}`);
  
  const result = await testLiveUrl(liveUrl);
  
  if (!result.success) {
    console.log('❌ Site not responding');
    console.log(`   Status: ${result.statusCode || 'timeout'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    return false;
  }
  
  console.log('✅ Site is responding!');
  
  // Check for the critical elements
  const hasRegistrationForm = result.content.includes('Welcome to Thandi Career Assessment');
  const hasConsentCheckbox = result.content.includes('I understand how my information will be used');
  const hasNextData = result.content.includes('__next_f') || result.content.includes('__NEXT_DATA__');
  const hasGradeSelector = result.content.includes('What grade are you in');
  
  console.log('\n📊 NUCLEAR DEPLOYMENT VERIFICATION:');
  console.log('====================================');
  console.log(`✅ Shows registration form: ${hasRegistrationForm ? 'YES ✓' : 'NO ✗'}`);
  console.log(`✅ Has consent checkbox: ${hasConsentCheckbox ? 'YES ✓' : 'NO ✗'}`);
  console.log(`✅ React hydration: ${hasNextData ? 'YES ✓' : 'NO ✗'}`);
  console.log(`❌ Shows grade selector (wrong): ${hasGradeSelector ? 'YES ✗' : 'NO ✓'}`);
  
  // Determine success
  const isFixed = hasRegistrationForm && hasConsentCheckbox && hasNextData && !hasGradeSelector;
  
  console.log('\n🏁 FINAL VERDICT:');
  console.log('=================');
  
  if (isFixed) {
    console.log('🎉 NUCLEAR DEPLOYMENT SUCCESSFUL!');
    console.log('✅ Registration form is showing (correct)');
    console.log('✅ Grade selector is NOT showing (correct)');
    console.log('✅ React hydration is working');
    console.log('✅ Assessment flow is FIXED!');
    console.log('\n🚀 READY FOR STUDENT TESTING!');
    console.log('Students will now see the registration form first, as intended.');
    return true;
  } else if (hasGradeSelector && !hasRegistrationForm) {
    console.log('❌ NUCLEAR DEPLOYMENT FAILED');
    console.log('❌ Still showing grade selector instead of registration');
    console.log('❌ Vercel is still serving old cached code');
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Check Vercel dashboard for build errors');
    console.log('2. Verify GitHub has latest code');
    console.log('3. Consider manual Vercel project recreation');
    return false;
  } else {
    console.log('⚠️ PARTIAL DEPLOYMENT');
    console.log('Some elements are working, others are not');
    console.log('Deployment may still be propagating...');
    return false;
  }
}

async function testLiveUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          content: data
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Run verification
verifyNuclearDeploy().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});