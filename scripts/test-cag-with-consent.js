/**
 * CAG Layer Test WITH Consent
 * Tests CAG verification when user has given consent
 */

const PRODUCTION_URL = 'https://thandiai.vercel.app';

async function testCAGWithConsent() {
  console.log('🔍 CAG LAYER TEST WITH CONSENT');
  console.log('='.repeat(70));
  
  try {
    const testQuery = {
      query: "I want to become a software engineer",
      profile: {
        grade: 10,
        subjects: ["Mathematics", "Physical Sciences", "English"],
        marks: { Mathematics: 85, "Physical Sciences": 80, English: 75 },
        interests: ["technology", "problem-solving"],
        constraints: { budget: "NSFAS", location: "Gauteng" }
      },
      session: {
        externalProcessingConsent: true,  // User has given consent (correct field name)
        consentTimestamp: new Date().toISOString()
      }
    };

    console.log('Sending request WITH consent...');
    console.log();
    
    const response = await fetch(`${PRODUCTION_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuery)
    });

    console.log('Status:', response.status);
    console.log();

    const text = await response.text();
    console.log('Raw response:', text);
    console.log();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
      return;
    }
    
    console.log('📊 RESPONSE ANALYSIS:');
    console.log('='.repeat(70));
    console.log('Success:', data.success);
    console.log('Source:', data.source);
    console.log();
    
    console.log('🔒 Compliance:');
    console.log('  Consent:', data.compliance?.consent);
    console.log('  Sanitised:', data.compliance?.sanitised);
    console.log('  Enhanced:', data.compliance?.enhanced);
    console.log('  CAG Verified:', data.compliance?.cagVerified);
    console.log();
    
    if (data.cag) {
      console.log('✅ CAG LAYER ACTIVE!');
      console.log('='.repeat(70));
      console.log('  Decision:', data.cag.decision);
      console.log('  Confidence:', data.cag.confidence);
      console.log('  Processing Time:', data.cag.processingTime + 'ms');
      console.log('  Issues Detected:', data.cag.issuesDetected);
      console.log('  Revisions Applied:', data.cag.revisionsApplied);
      console.log('  Requires Human:', data.cag.requiresHuman);
      console.log('  Stages Completed:', data.cag.stagesCompleted?.join(', '));
      console.log();
      
      console.log('🎉 CAG LAYER FULLY OPERATIONAL IN PRODUCTION!');
    } else {
      console.log('❌ No CAG metadata in response');
      console.log('This might indicate CAG is not running or an error occurred');
    }
    
    console.log('='.repeat(70));
    console.log();
    console.log('📄 Response Preview (first 500 chars):');
    console.log('-'.repeat(70));
    console.log(data.response?.substring(0, 500) + '...');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCAGWithConsent();
