#!/usr/bin/env node

const https = require('https');

async function checkProductionDomain() {
  console.log('🔍 CHECKING PRODUCTION DOMAIN STATUS');
  console.log('====================================\n');
  
  const domains = [
    'https://www.thandi.online',
    'https://thandi.online',
    'https://thandi-ai-master-gmccbm59f-thandiai-projects.vercel.app'
  ];
  
  console.log('🌐 TESTING ALL POSSIBLE DOMAINS');
  console.log('===============================');
  
  for (const domain of domains) {
    console.log(`\n🔗 Testing: ${domain}`);
    console.log('─'.repeat(50));
    
    try {
      // Test main page
      const mainResult = await makeRequest(`${domain}/`);
      console.log(`Main page: ${mainResult.status}`);
      
      // Test assessment page
      const assessmentResult = await makeRequest(`${domain}/assessment`);
      console.log(`Assessment: ${assessmentResult.status}`);
      
      if (assessmentResult.status === 200) {
        console.log('✅ This domain is working!');
        
        // Test API
        const apiResult = await makeRequest(`${domain}/api/schools/search?q=high&limit=1`);
        console.log(`API test: ${apiResult.status}`);
        
        if (apiResult.status === 200) {
          console.log('✅ API is working on this domain!');
          
          console.log('\n🎯 PRODUCTION DOMAIN CONFIRMED');
          console.log('==============================');
          console.log(`✅ Working domain: ${domain}`);
          console.log('✅ Assessment page accessible');
          console.log('✅ API endpoints functional');
          
          return domain;
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n⚠️  DOMAIN ANALYSIS COMPLETE');
  console.log('============================');
  console.log('Need to identify which domain is the correct production URL');
  
  return null;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 10000);
    
    https.get(url, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

checkProductionDomain().then(workingDomain => {
  if (workingDomain) {
    console.log(`\n🎉 SUCCESS: Production domain identified as ${workingDomain}`);
  } else {
    console.log('\n❌ No working domain found - need to investigate further');
  }
}).catch(error => {
  console.error('Domain check failed:', error);
});