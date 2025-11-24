/**
 * Automated Integration Test for Mock API
 * 
 * Tests that I CAN execute without a browser:
 * 1. Mock server can start and accept connections
 * 2. API responds with correct format
 * 3. Response includes verification footer
 * 4. Data flow logic is correct
 * 
 * This validates the code before you manually test in browser.
 */

import http from 'http';

const MOCK_API_URL = 'http://localhost:3001/api/rag/query';
const TIMEOUT = 5000;

// Test data matching AssessmentForm submission
const testSubmission = {
  query: 'Career assessment submission',
  studentProfile: {
    academicStrengths: ['Mathematics', 'Physical Sciences'],
    interests: ['Technology', 'Problem Solving'],
    financialConstraint: 'low',
    location: 'Western Cape',
    timeCommitment: 'full-time',
    motivation: 'I want to help people through technology',
    concerns: 'Not sure if I can afford university'
  }
};

async function testMockAPI() {
  console.log('🧪 Automated Mock API Integration Test');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Test 1: Server accepts connection
    console.log('Test 1: Checking if mock server is running...');
    const response = await makeRequest(testSubmission);
    
    if (!response) {
      console.error('❌ FAIL: Mock server not responding.');
      console.error('   → Make sure to start: node scripts/mock-integration-test.js');
      process.exit(1);
    }
    
    console.log('✅ PASS: Mock server is running');
    console.log('');

    // Test 2: Response has correct structure
    console.log('Test 2: Validating response structure...');
    if (!response.success) {
      throw new Error(`Response success is false: ${JSON.stringify(response)}`);
    }
    if (!response.response || typeof response.response !== 'string') {
      throw new Error('Response missing or invalid response field');
    }
    if (!response.metadata) {
      throw new Error('Response missing metadata field');
    }
    console.log('✅ PASS: Response structure is correct');
    console.log('');

    // Test 3: Verification footer is present
    console.log('Test 3: Checking for verification footer...');
    const hasFooter = response.response.includes('⚠️ **Verify before you decide:');
    if (!hasFooter) {
      throw new Error('Verification footer missing from response');
    }
    console.log('✅ PASS: Verification footer is present');
    console.log('');

    // Test 4: Response includes career recommendations
    console.log('Test 4: Validating career recommendations format...');
    const careerMatches = response.response.match(/\d+\.\s\*\*[^*]+\*\*/g);
    if (!careerMatches || careerMatches.length < 1) {
      throw new Error('Response missing career recommendations');
    }
    console.log(`✅ PASS: Found ${careerMatches.length} career recommendation(s)`);
    console.log('');

    // Test 5: Metadata indicates mock test
    console.log('Test 5: Validating metadata...');
    if (response.metadata.mockTest !== true) {
      throw new Error('Metadata missing mockTest flag');
    }
    if (response.metadata.verificationFooterAdded !== true) {
      throw new Error('Metadata missing verificationFooterAdded flag');
    }
    console.log('✅ PASS: Metadata is correct');
    console.log('');

    // Test 6: Response contains student profile data
    console.log('Test 6: Validating student profile in response...');
    if (!response.studentProfile) {
      throw new Error('Response missing studentProfile');
    }
    if (!Array.isArray(response.studentProfile.academicStrengths)) {
      throw new Error('studentProfile.academicStrengths is not an array');
    }
    console.log('✅ PASS: Student profile is included');
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Start mock server: node scripts/mock-integration-test.js');
    console.log('2. Start Next.js dev: npm run dev');
    console.log('3. Open http://localhost:3000/assessment in browser');
    console.log('4. Fill out form and verify UI behavior');
    console.log('5. Check console logs for: "Footer intact: true"');
    console.log('');
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Is mock server running? (node scripts/mock-integration-test.js)');
    console.error('2. Check server logs for errors');
    console.error('3. Verify port 3001 is not in use by another process');
    console.error('');
    process.exit(1);
  }
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/rag/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk.toString();
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Connection refused. Is mock server running?'));
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout. Server may be slow or not responding.'));
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
testMockAPI();






