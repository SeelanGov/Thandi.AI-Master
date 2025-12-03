// Cofounder Verification Suite - 5 Critical Tests
// Must pass all 5 before staging deployment

console.log('🔒 COFOUNDER VERIFICATION SUITE');
console.log('Running 5 critical compliance tests...\n');

const API_URL = 'http://localhost:3000/api/rag/query';
let allPassed = true;

// Test 1: POPIA Sanitiser (The R10M Question)
console.log('═══ TEST 1: POPIA SANITISER (R10M Question) ═══');
try {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'I want to be an engineer',
      curriculumProfile: {
        name: 'Lwazi Dlamini',
        school: 'Westville High School',
        grade: 11,
        location: 'Johannesburg',
        mathMark: 67
      },
      session: {
        externalProcessingConsent: true,
        consentTimestamp: new Date().toISOString()
      }
    })
  });

  const result = await response.json();
  
  console.log('Response source:', result.source);
  console.log('Compliance flags:', JSON.stringify(result.compliance, null, 2));
  
  // Check: PII should be stripped
  const reportText = JSON.stringify(result);
  const hasPII = reportText.includes('Lwazi') || 
                 reportText.includes('Dlamini') || 
                 reportText.includes('Westville');
  
  console.log('✓ Consent:', result.compliance?.consent);
  console.log('✓ Sanitised:', result.compliance?.sanitised);
  console.log('✓ PII in response:', hasPII ? '❌ FOUND' : '✅ NONE');
  console.log('✓ Location generalised:', reportText.includes('Gauteng') ? '✅ YES' : '⚠️ CHECK');
  
  if (hasPII) {
    console.log('❌ FAIL: PII detected in response!');
    console.log('BLOCK DEPLOYMENT - R10M POPIA violation risk');
    allPassed = false;
  } else if (!result.compliance?.sanitised) {
    console.log('❌ FAIL: Sanitised flag not set!');
    allPassed = false;
  } else {
    console.log('✅ PASS: No PII in response, sanitised flag set');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

// Test 2: Consent Gate (The Contract Question)
console.log('\n═══ TEST 2: CONSENT GATE (Contract Question) ═══');
try {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Career advice',
      curriculumProfile: {
        name: 'No Consent Student',
        grade: 10
      },
      session: {
        externalProcessingConsent: false
      }
    })
  });

  const result = await response.json();
  
  console.log('Response source:', result.source);
  console.log('Consent allowed:', result.compliance?.consent);
  console.log('Reason:', result.compliance?.reason);
  
  if (result.source !== 'draft') {
    console.log('❌ FAIL: Should return draft when no consent!');
    console.log('BLOCK DEPLOYMENT - Contract violation risk');
    allPassed = false;
  } else if (result.compliance?.consent !== false) {
    console.log('❌ FAIL: Consent flag should be false!');
    allPassed = false;
  } else {
    console.log('✅ PASS: Draft returned, consent blocked correctly');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

// Test 3: Guarded Client Timeout (The Demo Question)
console.log('\n═══ TEST 3: GUARDED CLIENT TIMEOUT (Demo Question) ═══');
console.log('Note: Using mock provider with fast response');
console.log('Timeout protection verified in unit tests (5s limit)');

try {
  const startTime = Date.now();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Quick test',
      curriculumProfile: { grade: 11 },
      session: {
        externalProcessingConsent: true,
        consentTimestamp: new Date().toISOString()
      }
    })
  });
  const duration = Date.now() - startTime;

  const result = await response.json();
  
  console.log('Response time:', duration + 'ms');
  console.log('Response source:', result.source);
  console.log('Has metadata:', !!result.metadata);
  
  if (duration > 6000) {
    console.log('❌ FAIL: Response took > 6s (no timeout protection)');
    console.log('BLOCK DEPLOYMENT - Demo reliability risk');
    allPassed = false;
  } else {
    console.log('✅ PASS: Response within acceptable time');
    console.log('Note: Full timeout test requires slow API simulation');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

// Test 4: LLM Adapter Vendor Switch (The Lock-In Question)
console.log('\n═══ TEST 4: LLM ADAPTER (Lock-In Question) ═══');
console.log('Checking adapter usage in code...');

try {
  // Check if adapter is used (not direct API calls)
  const fs = await import('fs');
  const routeCode = fs.readFileSync('app/api/rag/query/route.js', 'utf-8');
  
  const hasAdapter = routeCode.includes('LLMAdapter');
  const hasGuardedClient = routeCode.includes('guardedClient');
  const hasDirectAPI = routeCode.includes('api.anthropic.com') || 
                       routeCode.includes('api.openai.com');
  
  console.log('✓ Uses LLMAdapter:', hasAdapter ? '✅ YES' : '❌ NO');
  console.log('✓ Uses GuardedClient:', hasGuardedClient ? '✅ YES' : '❌ NO');
  console.log('✓ Direct API calls:', hasDirectAPI ? '❌ FOUND' : '✅ NONE');
  
  if (!hasAdapter || !hasGuardedClient || hasDirectAPI) {
    console.log('❌ FAIL: Adapter pattern not properly implemented');
    console.log('BLOCK DEPLOYMENT - Vendor lock-in risk');
    allPassed = false;
  } else {
    console.log('✅ PASS: Adapter pattern implemented, no direct API calls');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

// Test 5: API Version Check
console.log('\n═══ TEST 5: API VERSION CHECK ═══');
try {
  const response = await fetch(API_URL, { method: 'GET' });
  const result = await response.json();
  
  console.log('API Version:', result.version);
  console.log('Blockers:', result.blockers?.join(', '));
  
  const hasCorrectVersion = result.version === '2.0.0-compliance';
  const hasAllBlockers = result.blockers?.length === 4;
  
  console.log('✓ Version correct:', hasCorrectVersion ? '✅ YES' : '❌ NO');
  console.log('✓ All 4 blockers:', hasAllBlockers ? '✅ YES' : '❌ NO');
  
  if (!hasCorrectVersion || !hasAllBlockers) {
    console.log('❌ FAIL: API version or blockers incorrect');
    allPassed = false;
  } else {
    console.log('✅ PASS: API version and blockers correct');
  }
} catch (error) {
  console.log('❌ FAIL:', error.message);
  allPassed = false;
}

// Final Summary
console.log('\n═══════════════════════════════════════');
console.log('📊 VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════');
console.log('Test 1: POPIA Sanitiser -', allPassed ? '✅' : '❌');
console.log('Test 2: Consent Gate -', allPassed ? '✅' : '❌');
console.log('Test 3: Guarded Client -', allPassed ? '✅' : '❌');
console.log('Test 4: LLM Adapter -', allPassed ? '✅' : '❌');
console.log('Test 5: API Version -', allPassed ? '✅' : '❌');

if (allPassed) {
  console.log('\n🎉 ALL TESTS PASSED');
  console.log('✅ APPROVED FOR STAGING DEPLOYMENT');
  console.log('\nNext Steps:');
  console.log('1. Deploy to staging tomorrow 9am');
  console.log('2. Run E2E tests with 10 real profiles');
  console.log('3. Check Claude Console for PII leaks');
  console.log('4. Monitor for 1 hour');
  console.log('5. Deploy to production');
} else {
  console.log('\n❌ VERIFICATION FAILED');
  console.log('🚫 BLOCK DEPLOYMENT');
  console.log('\nAction Required:');
  console.log('1. Fix failing tests');
  console.log('2. Re-run verification');
  console.log('3. Do not deploy until all pass');
}

console.log('\n═══════════════════════════════════════');
process.exit(allPassed ? 0 : 1);
