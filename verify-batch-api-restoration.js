// Verify all 8 restored APIs in production
const https = require('https');

const BASE_URL = 'https://www.thandi.online';

const APIs_TO_TEST = [
  {
    name: 'PDF Generation',
    method: 'GET',
    path: '/api/pdf/generate',
    expectedStatus: 200
  },
  {
    name: 'School Login',
    method: 'GET',
    path: '/api/school/login',
    expectedStatus: 200
  },
  {
    name: 'Schools Login',
    method: 'GET',
    path: '/api/schools/login',
    expectedStatus: 200
  },
  {
    name: 'School Claiming',
    method: 'GET',
    path: '/api/schools/claim',
    expectedStatus: 200
  },
  {
    name: 'School Addition Requests',
    method: 'GET',
    path: '/api/schools/request-addition',
    expectedStatus: 200
  },
  {
    name: 'Dashboard Stats',
    method: 'GET',
    path: '/api/school/dashboard/stats',
    expectedStatus: [200, 400] // May require auth
  },
  {
    name: 'At-Risk Students',
    method: 'GET',
    path: '/api/school/students/at-risk',
    expectedStatus: [200, 400] // May require auth
  },
  {
    name: 'Student Management',
    method: 'GET',
    path: '/api/school/students',
    expectedStatus: [200, 400] // May require auth
  }
];

function testAPI(api) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${api.path}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const expectedStatuses = Array.isArray(api.expectedStatus) 
          ? api.expectedStatus 
          : [api.expectedStatus];
        
        const success = expectedStatuses.includes(res.statusCode);
        
        resolve({
          name: api.name,
          path: api.path,
          status: res.statusCode,
          success,
          responseLength: data.length,
          hasContent: data.length > 0
        });
      });
    }).on('error', (err) => {
      resolve({
        name: api.name,
        path: api.path,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
  });
}

async function verifyAllAPIs() {
  console.log('🔍 BATCH API RESTORATION VERIFICATION');
  console.log('=====================================\n');
  console.log(`Testing ${APIs_TO_TEST.length} restored APIs...\n`);
  
  const results = [];
  
  for (const api of APIs_TO_TEST) {
    process.stdout.write(`Testing ${api.name}... `);
    const result = await testAPI(api);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status} (${result.responseLength} bytes)`);
    } else {
      console.log(`❌ ${result.status} ${result.error || ''}`);
    }
  }
  
  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('======================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${APIs_TO_TEST.length}`);
  console.log(`❌ Failed: ${failed}/${APIs_TO_TEST.length}`);
  console.log(`📈 Success Rate: ${((successful / APIs_TO_TEST.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED APIS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.status} ${r.error || ''}`);
    });
  }
  
  console.log('\n✅ SUCCESSFUL APIS:');
  results.filter(r => r.success).forEach(r => {
    console.log(`   - ${r.name}: ${r.status} (${r.responseLength} bytes)`);
  });
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    'batch-api-restoration-verification-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n📄 Results saved to: batch-api-restoration-verification-results.json');
  
  return {
    total: APIs_TO_TEST.length,
    successful,
    failed,
    successRate: (successful / APIs_TO_TEST.length) * 100,
    results
  };
}

// Run verification
verifyAllAPIs().then(summary => {
  console.log('\n🎯 FINAL STATUS');
  console.log('===============');
  
  if (summary.failed === 0) {
    console.log('✅ ALL APIS OPERATIONAL');
    console.log('🎉 Batch restoration COMPLETE!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${summary.failed} APIs need attention`);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
