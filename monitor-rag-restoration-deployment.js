// Monitor RAG restoration deployment with cache-busting fallback
const https = require('https');

const PRODUCTION_URL = 'https://thandi.online';
const RAG_ENDPOINT = '/api/rag/query';
const MAX_WAIT_TIME = 180000; // 3 minutes
const CHECK_INTERVAL = 10000; // 10 seconds

console.log('🚀 RAG RESTORATION DEPLOYMENT MONITOR');
console.log('=====================================\n');

let checkCount = 0;
const startTime = Date.now();

async function checkEndpoint() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'thandi.online',
      path: RAG_ENDPOINT,
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      console.log(`✓ Check ${++checkCount}: Status ${res.statusCode}`);
      
      if (res.statusCode === 405) {
        // 405 = Method Not Allowed (GET not supported) - GOOD! Route exists
        resolve({ success: true, status: 405, message: 'Route exists (GET not allowed)' });
      } else if (res.statusCode === 404) {
        // 404 = Not Found - BAD! Cache issue or deployment not complete
        resolve({ success: false, status: 404, message: 'Route not found - possible cache issue' });
      } else {
        resolve({ success: true, status: res.statusCode, message: 'Route responding' });
      }
    });

    req.on('error', (error) => {
      console.log(`✗ Check ${++checkCount}: Error - ${error.message}`);
      resolve({ success: false, status: 0, message: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`✗ Check ${++checkCount}: Timeout`);
      resolve({ success: false, status: 0, message: 'Timeout' });
    });

    req.end();
  });
}

async function testPostEndpoint() {
  return new Promise((resolve) => {
    const testData = JSON.stringify({
      query: 'test deployment',
      grade: '12',
      curriculum: 'caps'
    });

    const options = {
      hostname: 'thandi.online',
      path: RAG_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            status: res.statusCode,
            hasResponse: !!json.response,
            responseLength: json.response ? json.response.length : 0
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, status: 0, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, status: 0, error: 'Timeout' });
    });

    req.write(testData);
    req.end();
  });
}

async function monitor() {
  console.log(`⏱️  Monitoring for up to ${MAX_WAIT_TIME / 1000} seconds...`);
  console.log(`🔍 Checking every ${CHECK_INTERVAL / 1000} seconds\n`);

  const interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > MAX_WAIT_TIME) {
      clearInterval(interval);
      console.log('\n⏰ Maximum wait time reached');
      console.log('\n🚨 DEPLOYMENT MAY HAVE CACHE ISSUES');
      console.log('\n📋 RECOMMENDED ACTIONS:');
      console.log('1. Check Vercel dashboard for deployment status');
      console.log('2. If deployed but returning 404, run: vercel --prod --force');
      console.log('3. If still failing, clear Vercel build cache');
      console.log('4. Nuclear option: rm -rf .vercel && vercel --prod --force');
      process.exit(1);
    }

    const result = await checkEndpoint();
    
    if (result.success && result.status === 405) {
      clearInterval(interval);
      console.log('\n✅ RAG ENDPOINT DETECTED!');
      console.log('📊 Testing POST functionality...\n');
      
      const postResult = await testPostEndpoint();
      
      if (postResult.success) {
        console.log('✅ POST REQUEST SUCCESSFUL');
        console.log(`📝 Response length: ${postResult.responseLength} characters`);
        console.log(`⏱️  Total deployment time: ${Math.round((Date.now() - startTime) / 1000)}s`);
        console.log('\n🎉 RAG RESTORATION DEPLOYMENT SUCCESSFUL!');
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Test with real career query');
        console.log('2. Verify embeddings are accessible');
        console.log('3. Check response times');
        console.log('4. Review other disabled APIs');
        process.exit(0);
      } else {
        console.log('❌ POST REQUEST FAILED');
        console.log(`Status: ${postResult.status}`);
        console.log(`Error: ${postResult.error || 'Unknown'}`);
        console.log('\n🚨 ENDPOINT EXISTS BUT NOT FUNCTIONING');
        console.log('\n📋 RECOMMENDED ACTIONS:');
        console.log('1. Check Vercel logs: vercel logs https://thandi.online --prod');
        console.log('2. Force redeploy: vercel --prod --force');
        process.exit(1);
      }
    }
  }, CHECK_INTERVAL);

  // Initial check
  console.log('🔍 Starting initial check...\n');
  const initialResult = await checkEndpoint();
  
  if (initialResult.success && initialResult.status === 405) {
    clearInterval(interval);
    console.log('\n✅ RAG ENDPOINT ALREADY LIVE!');
    console.log('📊 Testing POST functionality...\n');
    
    const postResult = await testPostEndpoint();
    
    if (postResult.success) {
      console.log('✅ POST REQUEST SUCCESSFUL');
      console.log(`📝 Response length: ${postResult.responseLength} characters`);
      console.log('\n🎉 RAG RESTORATION DEPLOYMENT SUCCESSFUL!');
      process.exit(0);
    }
  }
}

monitor().catch(error => {
  console.error('❌ Monitor error:', error);
  process.exit(1);
});
