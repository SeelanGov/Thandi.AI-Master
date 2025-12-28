#!/usr/bin/env node

/**
 * Check Current Production Footer
 * Quick check to see what's currently deployed
 */

import https from 'https';

const PRODUCTION_URL = 'https://thandiai-fvcp1qw1u-thandiai-projects.vercel.app';

console.log('🔍 CHECKING CURRENT PRODUCTION FOOTER');
console.log('='.repeat(50));

const url = new URL(PRODUCTION_URL);
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'GET',
  timeout: 10000,
  headers: {
    'User-Agent': 'Thandi.ai-Test/1.0'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      // Extract footer section
      const footerMatch = data.match(/<footer[\s\S]*?<\/footer>/i);
      
      if (footerMatch) {
        const footer = footerMatch[0];
        console.log('\n📋 CURRENT FOOTER CONTENT:');
        console.log('-'.repeat(30));
        
        // Check for key elements
        const checks = [
          'Legal & Compliance',
          'privacy-policy',
          'terms-of-service',
          'POPIA Compliant',
          'B-BBEE Level 1',
          'Student Data Protected',
          'Durban, KwaZulu-Natal',
          'hello@thandi.online',
          'Information Officer',
          '0781298701',
          '170 Innes Road'
        ];
        
        checks.forEach(check => {
          const found = footer.includes(check);
          console.log(`${found ? '✅' : '❌'} ${check}`);
        });
        
        console.log('\n🔍 FOOTER HTML SNIPPET:');
        console.log('-'.repeat(30));
        // Show first 500 chars of footer
        console.log(footer.substring(0, 500) + '...');
        
      } else {
        console.log('❌ No footer found in HTML');
      }
      
      // Check for legal routes in the HTML
      console.log('\n🔗 LEGAL ROUTE REFERENCES:');
      console.log('-'.repeat(30));
      const legalRoutes = [
        '/legal/privacy-policy',
        '/legal/terms-of-service',
        '/legal/cookie-policy',
        '/legal/disclaimers'
      ];
      
      legalRoutes.forEach(route => {
        const found = data.includes(route);
        console.log(`${found ? '✅' : '❌'} ${route}`);
      });
      
    } else {
      console.log(`❌ HTTP ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.log(`❌ Request failed: ${error.message}`);
});

req.on('timeout', () => {
  console.log(`❌ Request timeout`);
  req.destroy();
});

req.end();