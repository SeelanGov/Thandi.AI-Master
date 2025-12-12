/**
 * CAG Layer Production Verification
 * Tests that the CAG layer is actively verifying responses in production
 */

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function testCAGProduction() {
  console.log('🔍 CAG LAYER PRODUCTION VERIFICATION');
  console.log('='.repeat(70));
  console.log(`Testing: ${PRODUCTION_URL}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  try {
    // Test query that should trigger CAG verification
    const testQuery = {
      query: "I want to become a software engineer",
      profile: {
        grade: 10,
        subjects: ["Mathematics", "Physical Sciences", "English"],
        marks: { Mathematics: 85, "Physical Sciences": 80, English: 75 },
        interests: ["technology", "problem-solving"],
        constraints: { budget: "NSFAS", location: "Gauteng" }
      }
    };

    console.log('📋 Test: CAG Layer Verification');
    console.log('-'.repeat(70));
    console.log('Query:', testQuery.query);
    console.log();

    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuery)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Response received');
    console.log();
    
    // Check for CAG metadata
    console.log('🔍 CAG Layer Analysis:');
    console.log('-'.repeat(70));
    
    if (data.cag) {
      console.log('✅ CAG metadata present');
      console.log('   Enabled:', data.cag.enabled);
      console.log('   Verification performed:', data.cag.verified !== undefined);
      
      if (data.cag.verified !== undefined) {
        console.log('   Verified:', data.cag.verified);
        console.log('   Confidence:', data.cag.confidence);
        console.log('   Issues found:', data.cag.issues?.length || 0);
        
        if (data.cag.issues && data.cag.issues.length > 0) {
          console.log('   Issues:');
          data.cag.issues.forEach(issue => {
            console.log(`     - ${issue.type}: ${issue.message}`);
          });
        }
        
        if (data.cag.corrections && data.cag.corrections.length > 0) {
          console.log('   Corrections applied:', data.cag.corrections.length);
        }
      }
      
      if (data.cag.stats) {
        console.log('   Stats:');
        console.log('     - Total verifications:', data.cag.stats.totalVerifications);
        console.log('     - Successful:', data.cag.stats.successfulVerifications);
        console.log('     - Failed:', data.cag.stats.failedVerifications);
      }
    } else {
      console.log('❌ No CAG metadata in response');
    }
    
    console.log();
    console.log('📄 Response Preview:');
    console.log('-'.repeat(70));
    console.log(data.response?.substring(0, 300) + '...');
    console.log();
    
    // Summary
    console.log('='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    
    const cagActive = data.cag?.enabled === true;
    const verificationPerformed = data.cag?.verified !== undefined;
    const responseGenerated = data.response && data.response.length > 0;
    
    console.log(`✅ CAG Layer Active: ${cagActive ? 'YES' : 'NO'}`);
    console.log(`✅ Verification Performed: ${verificationPerformed ? 'YES' : 'NO'}`);
    console.log(`✅ Response Generated: ${responseGenerated ? 'YES' : 'NO'}`);
    
    if (cagActive && verificationPerformed && responseGenerated) {
      console.log();
      console.log('🎉 CAG LAYER FULLY OPERATIONAL IN PRODUCTION!');
    } else {
      console.log();
      console.log('⚠️  CAG layer may not be fully active');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCAGProduction();
