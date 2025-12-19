#!/usr/bin/env node

/**
 * Verify Production URL - Direct Test
 * 
 * Tests the specific production URL to confirm deployment is working
 */

async function verifyProductionURL() {
  console.log('🔍 VERIFYING PRODUCTION URL');
  console.log('Testing https://thandiai.vercel.app/assessment directly');
  console.log('=' .repeat(60));
  
  const testUrl = 'https://thandiai.vercel.app/assessment';
  
  try {
    console.log(`🌐 Testing URL: ${testUrl}`);
    console.log('⏳ Making request...');
    
    const startTime = Date.now();
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`\n📊 Response Details:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Server: ${response.headers.get('server') || 'Not specified'}`);
    
    if (response.ok) {
      const content = await response.text();
      console.log(`   Content Length: ${content.length} characters`);
      
      // Check for key indicators
      const indicators = {
        hasHTML: content.includes('<html'),
        hasTitle: content.includes('<title>'),
        hasThandi: content.toLowerCase().includes('thandi'),
        hasAssessment: content.toLowerCase().includes('assessment'),
        hasGrade: content.toLowerCase().includes('grade'),
        hasReact: content.includes('__NEXT_DATA__') || content.includes('_app'),
        hasCSS: content.includes('css') || content.includes('style'),
        hasJS: content.includes('script') || content.includes('javascript')
      };
      
      console.log(`\n✅ Content Analysis:`);
      Object.entries(indicators).forEach(([check, found]) => {
        console.log(`   ${found ? '✅' : '❌'} ${check}: ${found ? 'YES' : 'NO'}`);
      });
      
      // Show a sample of the content
      const sample = content.substring(0, 500);
      console.log(`\n📝 Content Sample (first 500 chars):`);
      console.log(`"${sample}${content.length > 500 ? '...' : ''}"`);
      
      const workingIndicators = Object.values(indicators).filter(v => v).length;
      
      if (workingIndicators >= 6) {
        console.log(`\n🎉 ASSESSMENT PAGE IS WORKING!`);
        console.log(`✅ ${workingIndicators}/8 indicators present`);
        console.log(`✅ Page is loading correctly`);
        return true;
      } else {
        console.log(`\n⚠️ ASSESSMENT PAGE MAY HAVE ISSUES`);
        console.log(`❌ Only ${workingIndicators}/8 indicators present`);
        return false;
      }
      
    } else {
      console.log(`\n❌ HTTP ERROR: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log(`❌ Page not found - deployment may have failed`);
      } else if (response.status === 500) {
        console.log(`❌ Server error - there may be a runtime issue`);
      } else if (response.status >= 400) {
        console.log(`❌ Client error - check URL or deployment`);
      }
      
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ REQUEST FAILED: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log(`❌ DNS resolution failed - domain may not exist`);
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log(`❌ Connection refused - server may be down`);
    } else if (error.message.includes('timeout')) {
      console.log(`❌ Request timeout - server may be slow or unresponsive`);
    }
    
    return false;
  }
}

// Also test the API endpoint
async function testAPIEndpoint() {
  console.log('\n🔍 TESTING API ENDPOINT');
  console.log('Testing https://thandiai.vercel.app/api/rag/query');
  console.log('-' .repeat(50));
  
  try {
    const response = await fetch('https://thandiai.vercel.app/api/rag/query', {
      method: 'GET'
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response: ${JSON.stringify(data)}`);
      
      if (data.message && data.message.includes('RAG Query endpoint')) {
        console.log(`   ✅ API endpoint is working`);
        return true;
      }
    }
    
    console.log(`   ❌ API endpoint not responding correctly`);
    return false;
    
  } catch (error) {
    console.log(`   ❌ API test failed: ${error.message}`);
    return false;
  }
}

// Run both tests
async function runVerification() {
  const assessmentWorking = await verifyProductionURL();
  const apiWorking = await testAPIEndpoint();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 PRODUCTION VERIFICATION RESULTS');
  console.log('=' .repeat(60));
  
  if (assessmentWorking && apiWorking) {
    console.log(`✅ PRODUCTION IS WORKING CORRECTLY`);
    console.log(`✅ Assessment page: https://thandiai.vercel.app/assessment`);
    console.log(`✅ API endpoint: https://thandiai.vercel.app/api/rag/query`);
    console.log(`🚀 Enhancement deployment successful!`);
  } else {
    console.log(`❌ PRODUCTION HAS ISSUES`);
    console.log(`Assessment page: ${assessmentWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`API endpoint: ${apiWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`🔧 May need to redeploy or check Vercel dashboard`);
  }
  
  return assessmentWorking && apiWorking;
}

runVerification().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});