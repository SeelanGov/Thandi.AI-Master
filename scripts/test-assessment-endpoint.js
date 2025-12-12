// Test the RAG endpoint with a realistic assessment query
import 'dotenv/config';

async function testAssessmentEndpoint() {
  console.log('🧪 Testing Assessment Endpoint\n');
  console.log('=' .repeat(60));
  
  // Test 1: Health check
  console.log('\n📋 Test 1: Health Check (GET)');
  console.log('-'.repeat(60));
  
  try {
    const healthResponse = await fetch('http://localhost:3000/api/rag/query', {
      method: 'GET'
    });
    
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed');
    console.log('Status:', healthData.status);
    console.log('Endpoint:', healthData.endpoint);
    console.log('Version:', healthData.version);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Realistic assessment query
  console.log('\n📋 Test 2: Realistic Assessment Query (POST)');
  console.log('-'.repeat(60));
  
  const testQuery = 'Grade 10 SA student. Subjects I enjoy: Mathematics, Physical Sciences, Life Sciences. Interests: Problem-solving, Technology, Helping people. Constraints: Limited budget, Need financial aid, Willing to study anywhere in SA. Recommend careers matching subjects I ENJOY with education pathways.';
  
  console.log('Query:', testQuery.substring(0, 100) + '...');
  console.log('\n⏳ Sending request...');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: testQuery,
        options: {
          includeDebug: true
        }
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Request failed with status:', response.status);
      console.error('Error:', errorData.error);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n✅ Request successful!');
    console.log('Response time:', responseTime + 'ms');
    console.log('\n📊 Response Summary:');
    console.log('-'.repeat(60));
    console.log('Success:', data.success);
    console.log('Response length:', data.response?.length || 0, 'characters');
    
    // Check for verification footer
    const hasFooter = data.response?.includes('⚠️');
    console.log('Has verification footer:', hasFooter ? '✅ YES' : '❌ NO');
    
    if (data.studentProfile) {
      console.log('\n👤 Student Profile Extracted:');
      console.log('  Academic Strengths:', data.studentProfile.academicStrengths?.join(', ') || 'None');
      console.log('  Interests:', data.studentProfile.interests?.join(', ') || 'None');
      console.log('  Financial Constraint:', data.studentProfile.financialConstraint || 'None');
    }
    
    if (data.metadata) {
      console.log('\n⚙️ Processing Metadata:');
      console.log('  Total time:', data.metadata.processingTime + 'ms');
      console.log('  Chunks retrieved:', data.metadata.chunksRetrieved);
      console.log('  Chunks used:', data.metadata.chunksUsed);
      console.log('  Model used:', data.metadata.modelUsed);
      console.log('  Validation passed:', data.metadata.validationPassed ? '✅' : '❌');
    }
    
    console.log('\n📝 Response Preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(data.response?.substring(0, 500) + '...');
    
    if (data.debug?.searchResults) {
      console.log('\n🔍 Search Results (Debug):');
      console.log('-'.repeat(60));
      data.debug.searchResults.slice(0, 3).forEach((result, i) => {
        console.log(`${i + 1}. Module: ${result.module}`);
        console.log(`   Similarity: ${result.similarity.toFixed(3)}`);
        console.log(`   Text: ${result.text}`);
        console.log();
      });
    }
    
    // Test 3: Validation checks
    console.log('\n📋 Test 3: Response Validation');
    console.log('-'.repeat(60));
    
    const validations = {
      'Has response text': !!data.response && data.response.length > 100,
      'Has verification footer': hasFooter,
      'Has student profile': !!data.studentProfile,
      'Has metadata': !!data.metadata,
      'Processing time < 30s': data.metadata?.processingTime < 30000,
      'Chunks retrieved > 0': data.metadata?.chunksRetrieved > 0,
      'Validation passed': data.metadata?.validationPassed === true
    };
    
    let passCount = 0;
    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
      if (passed) passCount++;
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 Overall Result: ${passCount}/${Object.keys(validations).length} checks passed`);
    
    if (passCount === Object.keys(validations).length) {
      console.log('✅ ALL TESTS PASSED - Assessment endpoint is working correctly!');
    } else {
      console.log('⚠️ SOME TESTS FAILED - Review the issues above');
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAssessmentEndpoint().catch(console.error);
