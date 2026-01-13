#!/usr/bin/env node

/**
 * CHECK DEPLOYMENT STATUS - JAN 13 2026
 * 
 * Monitor Vercel deployment status and test endpoints
 */

const https = require('https');

const BASE_URL = 'https://thandi-ai-master-mttqfzi2s-thandiai-projects.vercel.app';

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkEndpoint(name, path) {
  try {
    const response = await httpRequest(`${BASE_URL}${path}`);
    const status = response.statusCode === 200 ? '✅' : 
                  response.statusCode === 404 ? '❌ 404' :
                  response.statusCode === 405 ? '⚠️ 405' : 
                  `❓ ${response.statusCode}`;
    
    console.log(`${status} ${name}: ${path}`);
    return response.statusCode;
  } catch (error) {
    console.log(`❌ ${name}: ${path} - ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔍 DEPLOYMENT STATUS CHECK - JAN 13 2026');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  const endpoints = [
    ['Health Check', '/api/health'],
    ['Registration Page', '/register'],
    ['School Validation API', '/api/schools/validate-code'],
    ['Consent Management API', '/api/consent/manage'],
    ['Retroactive Association API', '/api/student/retroactive-association'],
    ['Student Registration API', '/api/student/register'],
    ['RAG Query API', '/api/rag/query'],
    ['School Search API', '/api/schools/search'],
    ['School Request Addition API', '/api/schools/request-addition']
  ];
  
  let working = 0;
  let total = endpoints.length;
  
  for (const [name, path] of endpoints) {
    const status = await checkEndpoint(name, path);
    if (status === 200 || status === 400 || status === 405) {
      working++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log(`📊 DEPLOYMENT STATUS: ${working}/${total} endpoints accessible`);
  console.log(`🎯 Phase 0 Completion: ${Math.round((working/total) * 100)}%`);
  
  if (working < total) {
    console.log('');
    console.log('⏳ Some endpoints still deploying. Common reasons:');
    console.log('   • Vercel build/deployment in progress (2-5 minutes)');
    console.log('   • CDN cache propagation (up to 10 minutes)');
    console.log('   • Build errors preventing deployment');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Wait 2-3 minutes for deployment completion');
    console.log('   2. Check Vercel dashboard for build status');
    console.log('   3. Re-run comprehensive verification');
  } else {
    console.log('');
    console.log('✅ All endpoints accessible - ready for comprehensive verification');
  }
  
  console.log('='.repeat(60));
}

main().catch(console.error);