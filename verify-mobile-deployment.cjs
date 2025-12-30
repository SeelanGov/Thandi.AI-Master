
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
      console.log(`✅ Page loaded (${res.statusCode})`);
      
      const checks = {
        touchTargets: data.includes('min-h-[48px]'),
        mobileBreakpoints: data.includes('sm:'),
        touchManipulation: data.includes('touch-manipulation'),
        bulletproofComponent: data.includes('BulletproofStudentRegistration')
      };
      
      console.log('\n📱 Mobile UI Features:');
      Object.entries(checks).forEach(([feature, present]) => {
        console.log(`${present ? '✅' : '❌'} ${feature}`);
      });
      
      const successCount = Object.values(checks).filter(Boolean).length;
      console.log(`\n📊 Result: ${successCount}/4 features deployed`);
      
      if (successCount >= 3) {
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
      } else {
        console.log('⚠️  Deployment still pending or failed');
      }
    });
  });
}

verifyMobileDeployment();
