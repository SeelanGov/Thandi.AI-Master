#!/usr/bin/env node

/**
 * FIND CORRECT VERCEL URL
 * Tests various Vercel URL patterns to find the working deployment
 */

const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          size: data.length,
          working: res.statusCode === 200,
          hasThandi: data.includes('Thandi') || data.includes('thandi')
        });
      });
    });
    
    req.on('error', () => {
      resolve({ url, working: false, error: 'Connection failed' });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, working: false, error: 'Timeout' });
    });
  });
}

async function findWorkingUrl() {
  console.log('🔍 FINDING CORRECT VERCEL URL');
  console.log('==============================');
  
  // Common Vercel URL patterns
  const urlPatterns = [
    'https://thandi-ai-master.vercel.app',
    'https://thandi-ai-master-git-main.vercel.app',
    'https://thandi-ai-master-seelangovs-projects.vercel.app',
    'https://thandi-rag-system.vercel.app',
    'https://thandi-rag-system-git-main.vercel.app',
    'https://thandi-rag-system-seelangovs-projects.vercel.app',
    'https://thandi.vercel.app',
    'https://thandi-git-main.vercel.app',
    'https://thandi-seelangovs-projects.vercel.app'
  ];
  
  console.log(`📡 Testing ${urlPatterns.length} potential URLs...`);
  
  const results = [];
  
  for (const url of urlPatterns) {
    console.log(`\n🔍 Testing: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.working) {
      console.log(`✅ Status: ${result.statusCode} (${result.size} bytes)`);
      console.log(`🎨 Has Thandi: ${result.hasThandi ? 'Yes' : 'No'}`);
    } else {
      console.log(`❌ ${result.error || 'Not working'}`);
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Find working URLs
  const workingUrls = results.filter(r => r.working);
  
  console.log('\n📊 RESULTS SUMMARY');
  console.log('==================');
  console.log(`✅ Working URLs: ${workingUrls.length}/${results.length}`);
  
  if (workingUrls.length > 0) {
    console.log('\n🌐 WORKING VERCEL URLS:');
    workingUrls.forEach(result => {
      console.log(`   ✅ ${result.url}`);
      console.log(`      Status: ${result.statusCode}, Size: ${result.size} bytes`);
      console.log(`      Has Thandi: ${result.hasThandi ? 'Yes' : 'No'}`);
    });
    
    // Test the best working URL with our UI fixes
    const bestUrl = workingUrls[0].url;
    console.log(`\n🎯 TESTING UI/UX FIXES ON: ${bestUrl}`);
    
    const testPages = [
      `${bestUrl}/assessment`,
      `${bestUrl}/admin`,
      `${bestUrl}/school/claim`,
      `${bestUrl}/api/health`
    ];
    
    for (const pageUrl of testPages) {
      const result = await testUrl(pageUrl);
      console.log(`${result.working ? '✅' : '❌'} ${pageUrl.replace(bestUrl, '')} - ${result.statusCode || 'Failed'}`);
    }
    
  } else {
    console.log('\n❌ NO WORKING VERCEL URLS FOUND');
    console.log('This could mean:');
    console.log('1. Deployment is still in progress');
    console.log('2. Different project name or URL structure');
    console.log('3. Deployment failed');
  }
  
  // Check custom domain status
  console.log('\n🌐 CUSTOM DOMAIN STATUS');
  console.log('=======================');
  
  const customDomainResult = await testUrl('https://thandi.ai');
  if (customDomainResult.working) {
    console.log('✅ https://thandi.ai is working');
    console.log(`   Status: ${customDomainResult.statusCode}`);
    console.log(`   Size: ${customDomainResult.size} bytes`);
    console.log(`   Has Thandi: ${customDomainResult.hasThandi ? 'Yes' : 'No'}`);
    
    // Test pages on custom domain
    console.log('\n🎯 TESTING PAGES ON CUSTOM DOMAIN:');
    const customTestPages = [
      'https://thandi.ai/assessment',
      'https://thandi.ai/admin',
      'https://thandi.ai/school/claim',
      'https://thandi.ai/api/health'
    ];
    
    for (const pageUrl of customTestPages) {
      const result = await testUrl(pageUrl);
      console.log(`${result.working ? '✅' : '❌'} ${pageUrl.replace('https://thandi.ai', '')} - ${result.statusCode || 'Failed'}`);
    }
  }
  
  return { workingUrls, customDomainWorking: customDomainResult.working };
}

findWorkingUrl().then(results => {
  console.log('\n🎯 FINAL RECOMMENDATION');
  console.log('=======================');
  
  if (results.customDomainWorking) {
    console.log('✅ Use https://thandi.ai as your primary domain');
    console.log('✅ Custom domain is properly configured');
  }
  
  if (results.workingUrls.length > 0) {
    console.log(`✅ Vercel backup URL: ${results.workingUrls[0].url}`);
  } else {
    console.log('⚠️ No Vercel URLs working - check deployment status');
  }
  
}).catch(error => {
  console.error('❌ Error:', error.message);
});