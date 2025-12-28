#!/usr/bin/env node

/**
 * Comprehensive Live URL Test
 * Test all critical endpoints and functionality on production
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function testEndpoint(path, description) {
  try {
    console.log(`\n📄 Testing ${description}...`);
    const response = await fetch(`${PRODUCTION_URL}${path}`);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const content = await response.text();
      console.log(`   Size: ${content.length} characters`);
      
      // Check for key indicators
      const indicators = {
        hasNextData: content.includes('__NEXT_DATA__'),
        hasReactRoot: content.includes('__next'),
        hasError: content.includes('error') || content.includes('Error') || content.includes('404'),
        hasContent: content.length > 1000
      };
      
      Object.entries(indicators).forEach(([check, result]) => {
        console.log(`   ${check}: ${result ? '✅' : '❌'}`);
      });
      
      return { success: true, size: content.length, ...indicators };
    } else {
      console.log(`   ❌ Failed: HTTP ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAPI(endpoint, description, testData = null) {
  try {
    console.log(`\n🔌 Testing ${description}...`);
    
    const options = {
      method: testData ? 'POST' : 'GET',
      headers: testData ? { 'Content-Type': 'application/json' } : {}
    };
    
    if (testData) {
      options.body = JSON.stringify(testData);
    }
    
    const response = await fetch(`${PRODUCTION_URL}${endpoint}`, options);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      return { success: true, data };
    } else {
      console.log(`   ❌ Failed: HTTP ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function comprehensiveLiveTest() {
  console.log('🌐 COMPREHENSIVE LIVE URL TEST');
  console.log('=' .repeat(60));
  console.log(`Testing: ${PRODUCTION_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const results = {};
  
  // Test main pages
  results.homepage = await testEndpoint('/', 'Homepage');
  results.assessment = await testEndpoint('/assessment', 'Assessment Page');
  results.results = await testEndpoint('/results', 'Results Page');
  
  // Test API endpoints
  results.healthAPI = await testAPI('/api/health', 'Health API');
  results.ragAPI = await testAPI('/api/rag/query', 'RAG API', {
    query: 'I am a Grade 10 student interested in engineering',
    grade: 'grade10',
    curriculum: 'caps'
  });
  
  // Summary analysis
  console.log('\n' + '=' .repeat(60));
  console.log('📊 COMPREHENSIVE ANALYSIS');
  
  const pageTests = ['homepage', 'assessment', 'results'];
  const apiTests = ['healthAPI', 'ragAPI'];
  
  console.log('\n🌐 Page Status:');
  pageTests.forEach(test => {
    const result = results[test];
    if (result.success) {
      const status = result.hasNextData ? '✅ Full Next.js' : 
                    result.hasContent ? '⚠️  Static only' : '❌ Broken';
      console.log(`   ${test}: ${status} (${result.size} chars)`);
    } else {
      console.log(`   ${test}: ❌ Failed (${result.status || result.error})`);
    }
  });
  
  console.log('\n🔌 API Status:');
  apiTests.forEach(test => {
    const result = results[test];
    const status = result.success ? '✅ Working' : '❌ Failed';
    console.log(`   ${test}: ${status}`);
  });
  
  // Overall assessment
  const pagesWorking = pageTests.filter(test => results[test].success).length;
  const apisWorking = apiTests.filter(test => results[test].success).length;
  const hasFullNextJS = pageTests.some(test => results[test].hasNextData);
  
  console.log('\n🎯 OVERALL STATUS:');
  console.log(`   Pages Working: ${pagesWorking}/${pageTests.length}`);
  console.log(`   APIs Working: ${apisWorking}/${apiTests.length}`);
  console.log(`   Next.js Structure: ${hasFullNextJS ? '✅ Present' : '❌ Missing'}`);
  
  if (pagesWorking === pageTests.length && apisWorking === apiTests.length) {
    if (hasFullNextJS) {
      console.log('\n✅ PRODUCTION IS FULLY OPERATIONAL');
      console.log('   - All pages and APIs working');
      console.log('   - Full Next.js structure present');
      console.log('   - Ready for student use');
    } else {
      console.log('\n⚠️  PRODUCTION IS FUNCTIONAL BUT LIMITED');
      console.log('   - All pages and APIs working');
      console.log('   - Missing Next.js hydration structure');
      console.log('   - Students can use but with limited interactivity');
    }
  } else {
    console.log('\n❌ PRODUCTION HAS ISSUES');
    console.log('   - Some pages or APIs not working');
    console.log('   - Requires immediate attention');
  }
  
  // Deployment recommendations
  console.log('\n🔧 RECOMMENDATIONS:');
  if (!hasFullNextJS) {
    console.log('   1. Force fresh deployment to restore Next.js structure');
    console.log('   2. Clear Vercel build cache');
    console.log('   3. Verify all components are properly built');
  }
  
  if (results.assessment.size < 15000) {
    console.log('   4. Assessment page deployment appears incomplete');
    console.log('   5. Check for build errors in Vercel dashboard');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Check Vercel deployment logs');
  console.log('   2. Verify latest commit is deployed');
  console.log('   3. Test manual user flow in browser');
  console.log('   4. Monitor for deployment completion');
}

comprehensiveLiveTest().catch(error => {
  console.error('Comprehensive test failed:', error);
  process.exit(1);
});