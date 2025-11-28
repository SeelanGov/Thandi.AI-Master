// Comprehensive test of live Vercel deployment for student testing readiness
import 'dotenv/config';

const VERCEL_URL = 'https://thandiai.vercel.app';

async function testLiveDeployment() {
  console.log('🔍 TESTING LIVE VERCEL DEPLOYMENT FOR STUDENT READINESS\n');
  console.log('='.repeat(80));
  console.log(`Live Site: ${VERCEL_URL}`);
  console.log(`Date: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));
  
  const results = [];
  let criticalFailures = 0;
  
  // Test 1: Assessment Page Loads
  console.log('\n📋 Test 1: Assessment Page Accessibility');
  console.log('-'.repeat(80));
  
  try {
    const response = await fetch(`${VERCEL_URL}/assessment`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const checks = {
      'Page loads': response.status === 200,
      'Has HTML content': html.length > 1000,
      'Contains assessment': html.toLowerCase().includes('assessment') || html.toLowerCase().includes('thandi'),
      'Not error page': !html.includes('<title>404') && !html.includes('<title>500') && !html.includes('Page Not Found')
    };
    
    const passed = Object.values(checks).every(Boolean);
    
    console.log(`Status: ${response.status}`);
    console.log(`Content Length: ${html.length} bytes`);
    Object.entries(checks).forEach(([check, result]) => {
      console.log(`   ${result ? '✅' : '❌'} ${check}`);
    });
    
    if (passed) {
      console.log('\n✅ Assessment page is ACCESSIBLE');
      results.push({ test: 'Assessment Page', status: 'PASS' });
    } else {
      console.log('\n❌ Assessment page has ISSUES');
      results.push({ test: 'Assessment Page', status: 'FAIL' });
      criticalFailures++;
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    results.push({ test: 'Assessment Page', status: 'FAIL', error: error.message });
    criticalFailures++;
  }
  
  // Test 2: RAG API Health Check
  console.log('\n📋 Test 2: RAG API Health Check');
  console.log('-'.repeat(80));
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/rag/query`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Status: ${data.status || 'unknown'}`);
    console.log(`Endpoint: ${data.endpoint || 'unknown'}`);
    console.log(`Version: ${data.version || 'unknown'}`);
    
    if (data.status === 'ok') {
      console.log('\n✅ RAG API is HEALTHY');
      results.push({ test: 'RAG API Health', status: 'PASS' });
    } else {
      console.log('\n⚠️ RAG API returned unexpected status');
      results.push({ test: 'RAG API Health', status: 'WARN' });
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    results.push({ test: 'RAG API Health', status: 'FAIL', error: error.message });
    criticalFailures++;
  }
  
  // Test 3: Actual Assessment Query (Student Simulation)
  console.log('\n📋 Test 3: Student Assessment Simulation');
  console.log('-'.repeat(80));
  
  const studentQuery = {
    query: `I am a Grade 10 student in South Africa. I enjoy Mathematics and Physical Sciences. I'm interested in technology and solving problems. My family needs financial aid. What careers should I consider?`,
    options: { includeDebug: false }
  };
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${VERCEL_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(studentQuery)
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API Error: ${data.error || 'Unknown error'}`);
    }
    
    const validations = {
      'Response exists': !!data.response,
      'Response has content': data.response && data.response.length > 300,
      'Has career info': data.response && (data.response.includes('Career') || data.response.includes('Engineer') || data.response.includes('Scientist')),
      'Has verification warning': data.response && (data.response.includes('⚠️') || data.response.includes('Verify')),
      'Has education pathways': data.response && (data.response.includes('University') || data.response.includes('BSc') || data.response.includes('study')),
      'Has bursary info': data.response && (data.response.includes('Bursary') || data.response.includes('NSFAS') || data.response.includes('financial')),
      'Response time acceptable': responseTime < 10000,
      'Student profile extracted': !!data.studentProfile
    };
    
    const passedCount = Object.values(validations).filter(Boolean).length;
    const totalCount = Object.keys(validations).length;
    
    console.log(`Response Time: ${responseTime}ms`);
    console.log(`Response Length: ${data.response?.length || 0} characters`);
    console.log(`Validations: ${passedCount}/${totalCount}`);
    console.log('');
    
    Object.entries(validations).forEach(([check, result]) => {
      console.log(`   ${result ? '✅' : '❌'} ${check}`);
    });
    
    if (passedCount >= 6) {
      console.log('\n✅ Assessment query WORKING');
      console.log('\n📝 Sample Response (first 300 chars):');
      console.log(`"${data.response.substring(0, 300)}..."`);
      results.push({ test: 'Assessment Query', status: 'PASS', details: { responseTime, passedCount, totalCount } });
    } else {
      console.log('\n⚠️ Assessment query has ISSUES');
      results.push({ test: 'Assessment Query', status: 'WARN', details: { responseTime, passedCount, totalCount } });
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    results.push({ test: 'Assessment Query', status: 'FAIL', error: error.message });
    criticalFailures++;
  }
  
  // Test 4: Browser Test Page
  console.log('\n📋 Test 4: Browser Test Page');
  console.log('-'.repeat(80));
  
  try {
    const response = await fetch(`${VERCEL_URL}/test-endpoint.html`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Test page accessible`);
      console.log(`   URL: ${VERCEL_URL}/test-endpoint.html`);
      console.log(`   Size: ${html.length} bytes`);
      results.push({ test: 'Browser Test Page', status: 'PASS' });
    } else {
      console.log(`⚠️ Test page not found (${response.status})`);
      results.push({ test: 'Browser Test Page', status: 'WARN' });
    }
  } catch (error) {
    console.log(`⚠️ Test page error: ${error.message}`);
    results.push({ test: 'Browser Test Page', status: 'WARN' });
  }
  
  // Test 5: Main Site
  console.log('\n📋 Test 5: Main Site');
  console.log('-'.repeat(80));
  
  try {
    const response = await fetch(VERCEL_URL);
    
    if (response.ok) {
      console.log(`✅ Main site accessible`);
      console.log(`   Status: ${response.status}`);
      results.push({ test: 'Main Site', status: 'PASS' });
    } else {
      console.log(`⚠️ Main site returned ${response.status}`);
      results.push({ test: 'Main Site', status: 'WARN' });
    }
  } catch (error) {
    console.log(`❌ Main site error: ${error.message}`);
    results.push({ test: 'Main Site', status: 'FAIL' });
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`Results: ${passed} PASS | ${warned} WARN | ${failed} FAIL | ${total} TOTAL`);
  console.log('='.repeat(80));
  
  // Student Readiness Assessment
  const isReady = criticalFailures === 0 && passed >= 3;
  
  if (isReady) {
    console.log('\n🎉 SYSTEM IS READY FOR STUDENT TESTING!');
    console.log('');
    console.log('✅ All critical systems operational');
    console.log('✅ Assessment form accessible');
    console.log('✅ API responding correctly');
    console.log('✅ Career recommendations working');
    console.log('');
    console.log('📋 STUDENT INSTRUCTIONS:');
    console.log(`   1. Go to: ${VERCEL_URL}/assessment`);
    console.log('   2. Select your grade (10, 11, or 12)');
    console.log('   3. Choose subjects you enjoy');
    console.log('   4. Select your interests');
    console.log('   5. Fill in any constraints (budget, location, etc.)');
    console.log('   6. Submit and review career recommendations');
    console.log('   7. ALWAYS verify recommendations with school counselors');
    console.log('');
    console.log('⚠️  IMPORTANT REMINDERS:');
    console.log('   - Results are AI-generated guidance, not final decisions');
    console.log('   - Students must verify all information with counselors');
    console.log('   - Contact institutions directly for accurate details');
    console.log('   - Bursary and admission requirements may change');
  } else {
    console.log('\n❌ SYSTEM NOT READY FOR STUDENT TESTING');
    console.log('');
    console.log(`Critical Failures: ${criticalFailures}`);
    console.log('');
    console.log('⚠️  ISSUES TO RESOLVE:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`   - ${result.test}: ${result.error || 'Failed validation'}`);
    });
    console.log('');
    console.log('Please fix these issues before allowing student access.');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🚀 DEPLOYMENT STATUS: ${isReady ? 'READY ✅' : 'NOT READY ❌'}`);
  console.log('='.repeat(80));
  
  return isReady;
}

// Run the test
testLiveDeployment()
  .then(ready => {
    process.exit(ready ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
