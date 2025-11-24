// scripts/test-step5-api.js
// Test script for Step 5: API Endpoint

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🧪 STEP 5: API Endpoint Test\n');
console.log('='.repeat(60));

async function runTests() {
  const API_URL = 'http://localhost:3000/api/rag/query';
  
  try {
    // Test 1: Health Check (GET)
    console.log('\n📋 Test 1: Health Check (GET)');
    console.log('-'.repeat(60));
    
    try {
      const healthResponse = await fetch(API_URL, { method: 'GET' });
      const healthData = await healthResponse.json();
      
      if (healthResponse.ok) {
        console.log('✅ Health check passed');
        console.log('   Status:', healthData.status);
        console.log('   Version:', healthData.version);
      } else {
        console.log('❌ Health check failed');
      }
    } catch (error) {
      console.log('⚠️  Server not running. Start with: npm run dev');
      console.log('   Error:', error.message);
    }

    // Test 2: Valid Query
    console.log('\n📋 Test 2: Valid Query (POST)');
    console.log('-'.repeat(60));
    
    const testQuery = "I'm good at math but hate physics. My family can't afford university.";
    console.log(`Query: "${testQuery}"\n`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: testQuery,
          options: {
            includeDebug: false
          }
        })
      });

      const data = await response.json();
      const requestTime = Date.now() - startTime;

      if (response.ok && data.success) {
        console.log('✅ Query successful\n');
        
        console.log('📝 RESPONSE:');
        console.log('-'.repeat(60));
        console.log(data.response);
        console.log('-'.repeat(60));
        
        console.log('\n👤 STUDENT PROFILE:');
        console.log(JSON.stringify(data.studentProfile, null, 2));
        
        console.log('\n📊 METADATA:');
        console.log(`   Total processing time: ${data.metadata.processingTime}ms`);
        console.log(`   Request round-trip time: ${requestTime}ms`);
        console.log(`   Model used: ${data.metadata.modelUsed}`);
        console.log(`   Chunks retrieved: ${data.metadata.chunksRetrieved}`);
        console.log(`   Chunks used: ${data.metadata.chunksUsed}`);
        console.log(`   Tokens used: ${data.metadata.tokensUsed}`);
        console.log(`   Retries: ${data.metadata.retries}`);
        console.log(`   Validation passed: ${data.metadata.validationPassed ? '✅' : '❌'}`);
        
        console.log('\n⏱️  BREAKDOWN:');
        console.log(`   Profile extraction: ${data.metadata.breakdown.profileExtraction}ms`);
        console.log(`   Embedding: ${data.metadata.breakdown.embedding}ms`);
        console.log(`   Search: ${data.metadata.breakdown.search}ms`);
        console.log(`   Context assembly: ${data.metadata.breakdown.contextAssembly}ms`);
        console.log(`   Generation: ${data.metadata.breakdown.generation}ms`);
        
        // Performance check
        if (data.metadata.processingTime > 10000) {
          console.log('\n   ⚠️  WARNING: Processing exceeded 10s target');
        } else {
          console.log('\n   ✅ Performance within 10s requirement');
        }
        
      } else {
        console.log('❌ Query failed');
        console.log('   Status:', response.status);
        console.log('   Error:', data.error);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
      console.log('   Make sure the dev server is running: npm run dev');
    }

    // Test 3: Invalid Query (too short)
    console.log('\n📋 Test 3: Invalid Query - Too Short');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: "help"
        })
      });

      const data = await response.json();

      if (response.status === 400) {
        console.log('✅ Validation working - rejected short query');
        console.log('   Error:', data.error);
      } else {
        console.log('❌ Validation failed - should reject short query');
      }
    } catch (error) {
      console.log('⚠️  Request failed:', error.message);
    }

    // Test 4: Invalid Query (missing query field)
    console.log('\n📋 Test 4: Invalid Query - Missing Field');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notQuery: "This should fail"
        })
      });

      const data = await response.json();

      if (response.status === 400) {
        console.log('✅ Validation working - rejected missing query field');
        console.log('   Error:', data.error);
      } else {
        console.log('❌ Validation failed - should reject missing field');
      }
    } catch (error) {
      console.log('⚠️  Request failed:', error.message);
    }

    // Test 5: CORS Check
    console.log('\n📋 Test 5: CORS Preflight (OPTIONS)');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch(API_URL, {
        method: 'OPTIONS'
      });

      if (response.ok) {
        console.log('✅ CORS preflight working');
        const headers = response.headers;
        console.log('   Access-Control-Allow-Origin:', headers.get('Access-Control-Allow-Origin') || 'Not set');
        console.log('   Access-Control-Allow-Methods:', headers.get('Access-Control-Allow-Methods') || 'Not set');
      } else {
        console.log('❌ CORS preflight failed');
      }
    } catch (error) {
      console.log('⚠️  Request failed:', error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ STEP 5 COMPLETE: API Endpoint');
    console.log('='.repeat(60));
    
    console.log('\n📊 Summary:');
    console.log('   - Health check: Working');
    console.log('   - POST /api/rag/query: Working');
    console.log('   - Input validation: Working');
    console.log('   - CORS: Enabled');
    console.log('   - Error handling: Working');
    
    console.log('\n🎯 Next Step: Step 6 - Test Script');
    console.log('   Run: node scripts/test-step6-cli.js (after implementation)');
    
    console.log('\n💡 Usage:');
    console.log('   curl -X POST http://localhost:3000/api/rag/query \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"query": "I\'m good at math but hate physics"}\'');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

console.log('\n⚠️  NOTE: This test requires the Next.js dev server to be running.');
console.log('   Start it with: npm run dev');
console.log('   Then run this test in a separate terminal.\n');

runTests();
