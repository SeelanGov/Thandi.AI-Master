// Diagnose Footer Deployment Issue
// Check if the fix was actually deployed

const https = require('https');

console.log('🔍 DIAGNOSING FOOTER DEPLOYMENT ISSUE');
console.log('=====================================\n');

// Check production deployment
const productionUrl = 'https://www.thandi.online';

console.log('1️⃣ Checking production deployment...');
console.log(`   URL: ${productionUrl}/admin/login\n`);

// Make request to check if route exists
https.get(`${productionUrl}/admin/login`, (res) => {
  console.log(`   Status Code: ${res.statusCode}`);
  console.log(`   Status Message: ${res.statusMessage}`);
  
  if (res.statusCode === 404) {
    console.log('\n❌ ISSUE CONFIRMED: /admin/login returns 404');
    console.log('\n🔍 POSSIBLE CAUSES:');
    console.log('   1. Vercel cache not cleared properly');
    console.log('   2. /admin/login route does not exist');
    console.log('   3. Deployment did not include the route');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Check if /admin/login page exists in codebase');
    console.log('   2. Verify /admin route works');
    console.log('   3. Force another deployment with cache clear');
  } else if (res.statusCode === 200) {
    console.log('\n✅ /admin/login route works!');
    console.log('   Footer fix should be working now');
  } else {
    console.log(`\n⚠️ Unexpected status: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

// Also check if /admin works
setTimeout(() => {
  console.log('\n2️⃣ Checking /admin route...');
  https.get(`${productionUrl}/admin`, (res) => {
    console.log(`   Status Code: ${res.statusCode}`);
    console.log(`   Status Message: ${res.statusMessage}`);
    
    if (res.statusCode === 200) {
      console.log('   ✅ /admin route works');
    } else {
      console.log(`   ❌ /admin route returns ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error('   ❌ Request failed:', err.message);
  });
}, 1000);
