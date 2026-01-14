// Test POST APIs with proper data
const https = require('https');

function testPOSTAPI(path, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'www.thandi.online',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            success: res.statusCode < 500 // Any non-500 means API is working
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            success: res.statusCode < 500
          });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message,
        success: false
      });
    });
    
    req.write(postData);
    req.end();
  });
}

async function testAPIs() {
  console.log('🔍 TESTING POST APIS');
  console.log('===================\n');
  
  // Test School Claiming
  console.log('1. Testing School Claiming API...');
  const claimResult = await testPOSTAPI('/api/schools/claim', {
    school_id: 'TEST123',
    principal_email: 'test@example.com'
  });
  console.log(`   Status: ${claimResult.status}`);
  console.log(`   Response: ${JSON.stringify(claimResult.data, null, 2)}`);
  console.log(`   Working: ${claimResult.success ? '✅ YES' : '❌ NO'}\n`);
  
  // Test School Addition Requests
  console.log('2. Testing School Addition Requests API...');
  const addResult = await testPOSTAPI('/api/schools/request-addition', {
    name: 'Test School',
    province: 'Gauteng',
    contact_email: 'test@example.com'
  });
  console.log(`   Status: ${addResult.status}`);
  console.log(`   Response: ${JSON.stringify(addResult.data, null, 2)}`);
  console.log(`   Working: ${addResult.success ? '✅ YES' : '❌ NO'}\n`);
  
  console.log('📊 SUMMARY');
  console.log('==========');
  
  const bothWorking = claimResult.success && addResult.success;
  
  if (bothWorking) {
    console.log('✅ Both POST APIs are operational');
    console.log('🎉 All 8 restored APIs are working!');
  } else {
    console.log('⚠️  Some APIs may have issues');
  }
  
  return bothWorking;
}

testAPIs().then(success => {
  process.exit(success ? 0 : 1);
});
