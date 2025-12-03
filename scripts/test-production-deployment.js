// Test Production Deployment - Comprehensive Assessment
// Tests what's actually deployed at https://thandiai.vercel.app

const PROD_URL = 'https://thandiai.vercel.app';

console.log('🔍 PRODUCTION DEPLOYMENT ASSESSMENT');
console.log('='.repeat(70));
console.log(`Testing: ${PROD_URL}`);
console.log('Date:', new Date().toISOString());
console.log('='.repeat(70));

async function testProductionDeployment() {
  const results = {
    health: null,
    ragEndpoint: null,
    ragQuery: null,
    g1012Endpoint: null,
    assessmentPage: null,
    resultsPage: null
  };

  // Test 1: Health Endpoint
  console.log('\n📋 Test 1: Health Endpoint');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${PROD_URL}/api/health`);
    const data = await response.json();
    results.health = {
      status: response.status,
      data: data
    };
    console.log('✅ Health endpoint responding');
    console.log('   Status:', response.status);
    console.log('   Timestamp:', data.timestamp);
    console.log('   Environment:', JSON.stringify(data.environment, null, 2));
  } catch (error) {
    results.health = { error: error.message };
    console.error('❌ Health endpoint failed:', error.message);
  }

  // Test 2: RAG Endpoint Status
  console.log('\n📋 Test 2: RAG Query Endpoint Status');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${PROD_URL}/api/rag/query`);
    const data = await response.json();
    results.ragEndpoint = {
      status: response.status,
      data: data
    };
    console.log('✅ RAG endpoint responding');
    console.log('   Status:', response.status);
    console.log('   Version:', data.version);
    console.log('   Blockers:', data.blockers);
  } catch (error) {
    results.ragEndpoint = { error: error.message };
    console.error('❌ RAG endpoint failed:', error.message);
  }

  // Test 3: RAG Query with Engineering Profile
  console.log('\n📋 Test 3: RAG Query - Engineering Profile');
  console.log('-'.repeat(70));
  try {
    const payload = {
      sessionId: 'prod-test-eng-' + Date.now(),
      profile: {
        grade: 10,
        subjects: ['Mathematics', 'Physical Sciences', 'English'],
        mathMark: 75,
        mathType: 'Mathematics',
        interests: ['technology', 'problem-solving', 'building things'],
        constraints: {
          budget: 'medium',
          location: 'gauteng'
        }
      },
      query: 'What careers match my profile?',
      consent: true
    };

    const response = await fetch(`${PROD_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    results.ragQuery = {
      status: response.status,
      hasResponse: !!data.response,
      responseLength: data.response?.length || 0,
      hasCareers: data.response?.includes('Engineer') || data.response?.includes('Software'),
      mentionsMath: data.response?.includes('Mathematics') || data.response?.includes('math'),
      mentionsTech: data.response?.includes('technology') || data.response?.includes('tech')
    };

    console.log('✅ RAG query successful');
    console.log('   Status:', response.status);
    console.log('   Response length:', data.response?.length || 0, 'characters');
    console.log('   Contains "Engineer":', data.response?.includes('Engineer'));
    console.log('   Contains "Mathematics":', data.response?.includes('Mathematics'));
    console.log('   Contains "technology":', data.response?.includes('technology'));
    
    if (data.response) {
      console.log('\n   First 200 chars of response:');
      console.log('   ' + data.response.substring(0, 200) + '...');
    }
  } catch (error) {
    results.ragQuery = { error: error.message };
    console.error('❌ RAG query failed:', error.message);
  }

  // Test 4: G10-12 Endpoint
  console.log('\n📋 Test 4: Grade 10-12 Guidance Endpoint');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${PROD_URL}/api/g10-12`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grade: 10,
        subjects: ['Mathematics', 'Physical Sciences'],
        mathMark: 75
      })
    });

    const data = await response.json();
    results.g1012Endpoint = {
      status: response.status,
      hasData: !!data
    };
    console.log('✅ G10-12 endpoint responding');
    console.log('   Status:', response.status);
  } catch (error) {
    results.g1012Endpoint = { error: error.message };
    console.error('❌ G10-12 endpoint failed:', error.message);
  }

  // Test 5: Assessment Page
  console.log('\n📋 Test 5: Assessment Page');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${PROD_URL}/assessment`);
    results.assessmentPage = {
      status: response.status,
      contentType: response.headers.get('content-type')
    };
    console.log('✅ Assessment page accessible');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers.get('content-type'));
  } catch (error) {
    results.assessmentPage = { error: error.message };
    console.error('❌ Assessment page failed:', error.message);
  }

  // Test 6: Results Page
  console.log('\n📋 Test 6: Results Page');
  console.log('-'.repeat(70));
  try {
    const response = await fetch(`${PROD_URL}/results`);
    results.resultsPage = {
      status: response.status,
      contentType: response.headers.get('content-type')
    };
    console.log('✅ Results page accessible');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers.get('content-type'));
  } catch (error) {
    results.resultsPage = { error: error.message };
    console.error('❌ Results page failed:', error.message);
  }

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 DEPLOYMENT ASSESSMENT SUMMARY');
  console.log('='.repeat(70));

  const tests = [
    { name: 'Health Endpoint', result: results.health },
    { name: 'RAG Endpoint Status', result: results.ragEndpoint },
    { name: 'RAG Query Test', result: results.ragQuery },
    { name: 'G10-12 Endpoint', result: results.g1012Endpoint },
    { name: 'Assessment Page', result: results.assessmentPage },
    { name: 'Results Page', result: results.resultsPage }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const hasError = test.result?.error;
    const status = test.result?.status;
    const isSuccess = !hasError && (status === 200 || status === undefined);
    
    if (isSuccess) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}${hasError ? ': ' + test.result.error : ''}`);
      failed++;
    }
  });

  console.log('\n' + '-'.repeat(70));
  console.log(`Total: ${tests.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  // Feature Analysis
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FEATURE ANALYSIS');
  console.log('='.repeat(70));

  console.log('\n✅ Confirmed Working:');
  if (results.health?.status === 200) {
    console.log('   - Health monitoring');
    console.log('   - Environment variables loaded');
  }
  if (results.ragEndpoint?.status === 200) {
    console.log('   - RAG endpoint accessible');
    console.log('   - Compliance blockers:', results.ragEndpoint.data?.blockers?.join(', '));
  }
  if (results.ragQuery?.status === 200) {
    console.log('   - RAG query processing');
    console.log('   - Career recommendations:', results.ragQuery.hasCareers ? 'YES' : 'NO');
    console.log('   - Personalization:', results.ragQuery.mentionsMath && results.ragQuery.mentionsTech ? 'YES' : 'PARTIAL');
  }
  if (results.g1012Endpoint?.status === 200) {
    console.log('   - Grade 10-12 guidance engine');
  }
  if (results.assessmentPage?.status === 200) {
    console.log('   - Assessment form');
  }
  if (results.resultsPage?.status === 200) {
    console.log('   - Results page');
  }

  console.log('\n❓ Questions to Answer:');
  console.log('   1. Is RAG Phase 3 fully deployed?');
  console.log('      - RAG endpoint working:', results.ragEndpoint?.status === 200 ? 'YES' : 'NO');
  console.log('      - RAG queries working:', results.ragQuery?.status === 200 ? 'YES' : 'NO');
  console.log('      - Personalized responses:', results.ragQuery?.hasCareers ? 'YES' : 'UNKNOWN');
  
  console.log('\n   2. What compliance features are active?');
  if (results.ragEndpoint?.data?.blockers) {
    console.log('      - Active blockers:', results.ragEndpoint.data.blockers.join(', '));
  }

  console.log('\n   3. What version is deployed?');
  if (results.ragEndpoint?.data?.version) {
    console.log('      - Version:', results.ragEndpoint.data.version);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎯 RECOMMENDATION');
  console.log('='.repeat(70));

  if (passed === tests.length) {
    console.log('\n✅ All systems operational!');
    console.log('   The deployment appears to be working correctly.');
    console.log('   RAG Phase 3 features are live and functional.');
  } else if (passed >= tests.length * 0.7) {
    console.log('\n⚠️  Mostly operational with some issues');
    console.log('   Core features working but some endpoints have problems.');
    console.log('   Review failed tests above.');
  } else {
    console.log('\n❌ Significant issues detected');
    console.log('   Multiple systems are not responding correctly.');
    console.log('   May need redeployment or investigation.');
  }

  console.log('\n' + '='.repeat(70));
  
  return results;
}

// Run the tests
testProductionDeployment().catch(console.error);
