// scripts/test-orchids-connection.js
// Test script to verify Orchids endpoints work correctly

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testHealthCheck() {
  console.log('\n🔍 Testing health check...');
  try {
    const response = await fetch(`${BASE_URL}/api/assess`);
    const data = await response.json();
    console.log('✅ Health check passed:', data.status);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testAssessment() {
  console.log('\n🔍 Testing assessment endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          "I'm good at Math and Science",
          "I enjoy problem-solving and technology",
          "I have limited budget but willing to study part-time",
          "I want to work in a growing field with good job prospects"
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Assessment failed:', data.error);
      return false;
    }

    console.log('✅ Assessment passed!');
    console.log(`   - Received ${data.careers.length} career recommendations`);
    console.log(`   - Session ID: ${data.sessionId}`);
    console.log('\n📋 Sample careers:');
    data.careers.slice(0, 3).forEach((career, i) => {
      console.log(`   ${i + 1}. ${career.name} (${career.match}% match)`);
      console.log(`      ${career.description.substring(0, 80)}...`);
    });
    
    return data.sessionId;
  } catch (error) {
    console.error('❌ Assessment failed:', error.message);
    return false;
  }
}

async function testPDF(sessionId) {
  console.log('\n🔍 Testing PDF endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/pdf/${sessionId}`);
    
    if (response.ok) {
      console.log('✅ PDF endpoint passed!');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Content-Type: ${response.headers.get('content-type')}`);
      return true;
    } else {
      console.error('❌ PDF endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ PDF endpoint failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Orchids Integration');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Health check failed. Is the server running?');
    console.log('   Run: npm run dev');
    process.exit(1);
  }

  const sessionId = await testAssessment();
  if (!sessionId) {
    console.log('\n❌ Assessment test failed.');
    process.exit(1);
  }

  await testPDF(sessionId);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. If testing locally: Run ngrok http 3000');
  console.log('   2. Copy the ngrok URL (e.g., https://abc123.ngrok.io)');
  console.log('   3. Give that URL to Orchids');
  console.log('   4. Orchids can now connect to your backend!');
  console.log('\n💡 To test with ngrok URL:');
  console.log('   TEST_URL=https://your-ngrok-url.ngrok.io node scripts/test-orchids-connection.js');
}

runTests().catch(console.error);
