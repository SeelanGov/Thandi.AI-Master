#!/usr/bin/env node

/**
 * MONITOR DEPLOYMENT STATUS
 * Check if the Vercel deployment is successful and test the live site
 */

const http = require('http');
const https = require('https');

async function monitorDeployment() {
  console.log('📡 MONITORING DEPLOYMENT STATUS');
  console.log('===============================');
  
  const liveUrl = 'https://www.thandi.online';
  const maxAttempts = 20;
  const delayBetweenAttempts = 30000; // 30 seconds
  
  console.log(`🎯 Target URL: ${liveUrl}/assessment`);
  console.log(`⏱️ Will check every 30 seconds for up to 10 minutes`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🔍 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    
    const result = await testLiveUrl(`${liveUrl}/assessment`);
    
    if (result.success) {
      console.log('✅ Site is responding!');
      
      // Check for the critical elements
      const hasRegistrationForm = result.content.includes('Welcome to Thandi Career Assessment');
      const hasConsentCheckbox = result.content.includes('I understand how my information will be used');
      const hasNextData = result.content.includes('__next_f') || result.content.includes('__NEXT_DATA__');
      const hasGradeSelector = result.content.includes('What grade are you in');
      
      console.log('\n📊 DEPLOYMENT VERIFICATION:');
      console.log(`✅ Shows registration form: ${hasRegistrationForm ? 'YES' : 'NO'}`);
      console.log(`✅ Has consent checkbox: ${hasConsentCheckbox ? 'YES' : 'NO'}`);
      console.log(`✅ React hydration: ${hasNextData ? 'YES' : 'NO'}`);
      console.log(`❌ Shows grade selector (wrong): ${hasGradeSelector ? 'YES' : 'NO'}`);
      
      if (hasRegistrationForm && hasConsentCheckbox && hasNextData && !hasGradeSelector) {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('✅ Students will see registration form (correct behavior)');
        console.log('✅ React hydration is working');
        console.log('✅ Assessment flow is fixed');
        console.log('\n🚀 READY FOR STUDENT TESTING!');
        return true;
      } else if (hasGradeSelector && !hasRegistrationForm) {
        console.log('\n❌ DEPLOYMENT ISSUE: Still showing grade selector instead of registration');
        console.log('The core issue is not fixed yet.');
        return false;
      } else {
        console.log('\n⚠️ PARTIAL DEPLOYMENT: Some elements missing');
        console.log('Deployment may still be propagating...');
      }
    } else {
      console.log(`❌ Site not responding (${result.statusCode || 'timeout'})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting 30 seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
    }
  }
  
  console.log('\n⏰ Monitoring timeout reached');
  console.log('Deployment may still be in progress or failed');
  return false;
}

async function testLiveUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
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

// Run monitoring
monitorDeployment().then(success => {
  if (success) {
    console.log('\n✅ MONITORING COMPLETE - DEPLOYMENT SUCCESSFUL');
  } else {
    console.log('\n❌ MONITORING COMPLETE - DEPLOYMENT ISSUES DETECTED');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Monitoring failed:', error.message);
  process.exit(1);
});