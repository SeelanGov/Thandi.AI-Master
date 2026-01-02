#!/usr/bin/env node

/**
 * Deployment Status Check
 * Monitors current deployment status
 */

const https = require('https');

const checkUrl = (url) => {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        headers: response.headers
      });
    });
    
    request.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
};

async function checkDeployment() {
  console.log('🔍 Checking deployment status...');
  
  const urls = [
    'https://thandi-ai-master.vercel.app',
    'https://thandi-ai-master-git-main-seelangovs-projects.vercel.app'
  ];
  
  for (const url of urls) {
    try {
      const result = await checkUrl(url);
      console.log(`\n📍 ${result.url}`);
      console.log(`Status: ${result.status}`);
      
      if (result.error) {
        console.log(`Error: ${result.error}`);
      } else if (result.status === 200) {
        console.log('✅ Site is accessible');
      } else {
        console.log(`⚠️  Unexpected status: ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Failed to check ${url}: ${error.message}`);
    }
  }
}

if (require.main === module) {
  checkDeployment();
}

module.exports = { checkDeployment };