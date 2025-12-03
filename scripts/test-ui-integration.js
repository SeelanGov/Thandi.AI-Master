// Test UI Integration with Compliance Blockers
// Verifies consent checkbox → API → compliance gates

const testUIIntegration = () => {
  console.log('🧪 Testing UI → API → Compliance Integration\n');
  
  const tests = [
    {
      name: 'Test 1: Consent Given → Enhanced Response',
      payload: {
        query: 'I am a Grade 12 student interested in medicine',
        curriculumProfile: {
          framework: 'CAPS',
          grade: 12,
          currentSubjects: ['Life Sciences', 'Physical Sciences', 'Mathematics']
        },
        session: {
          externalProcessingConsent: true,
          consentTimestamp: new Date().toISOString()
        },
        options: {
          includeDebug: true
        }
      },
      expected: {
        'compliance.consent': true,
        'compliance.sanitised': true,
        'source': 'enhanced' // or 'draft' if mock
      }
    },
    {
      name: 'Test 2: No Consent → Draft Response',
      payload: {
        query: 'I am a Grade 12 student interested in medicine',
        curriculumProfile: {
          framework: 'CAPS',
          grade: 12,
          currentSubjects: ['Life Sciences', 'Physical Sciences', 'Mathematics']
        },
        session: {
          externalProcessingConsent: false,
          consentTimestamp: null
        },
        options: {
          includeDebug: true
        }
      },
      expected: {
        'compliance.consent': false,
        'source': 'draft'
      }
    },
    {
      name: 'Test 3: PII Sanitisation',
      payload: {
        query: 'My name is John Smith, ID 9901015800083, email john@example.com. I want to study medicine.',
        curriculumProfile: {
          framework: 'CAPS',
          grade: 12,
          currentSubjects: ['Life Sciences']
        },
        session: {
          externalProcessingConsent: true,
          consentTimestamp: new Date().toISOString()
        },
        options: {
          includeDebug: true
        }
      },
      expected: {
        'compliance.sanitised': true,
        'compliance.piiRemoved': true
      }
    }
  ];
  
  console.log('📋 Test Suite: UI Integration\n');
  console.log('Tests to run:');
  tests.forEach((test, i) => {
    console.log(`  ${i + 1}. ${test.name}`);
  });
  
  console.log('\n🔧 How to run these tests:\n');
  console.log('Option 1: Manual UI Testing');
  console.log('  1. Start dev server: npm run dev');
  console.log('  2. Navigate to: http://localhost:3000/assessment');
  console.log('  3. Complete assessment');
  console.log('  4. On final step, CHECK consent checkbox');
  console.log('  5. Submit and verify response has:');
  console.log('     - compliance.consent: true');
  console.log('     - compliance.sanitised: true');
  console.log('  6. Repeat WITHOUT checking consent');
  console.log('  7. Verify response has:');
  console.log('     - compliance.consent: false');
  console.log('     - source: "draft"\n');
  
  console.log('Option 2: API Testing (Automated)');
  console.log('  Run: node scripts/test-integration-compliance.js\n');
  
  console.log('Option 3: Browser Console Testing');
  console.log('  1. Open browser console on /assessment');
  console.log('  2. Look for: [CONSENT] User consent: GIVEN');
  console.log('  3. Check Network tab → POST /api/rag/query');
  console.log('  4. Verify payload has session.externalProcessingConsent\n');
  
  console.log('✅ Expected Results:');
  console.log('  - Consent checkbox appears on step 5');
  console.log('  - Checking box logs to console');
  console.log('  - API receives consent in payload');
  console.log('  - Response includes compliance metadata');
  console.log('  - No PII in Claude API calls (when consent given)');
  console.log('  - Draft response when no consent\n');
  
  console.log('🎯 Success Criteria:');
  console.log('  ✓ Consent checkbox visible and functional');
  console.log('  ✓ Consent state passed to API');
  console.log('  ✓ Consent gate blocks when false');
  console.log('  ✓ PII sanitiser runs when true');
  console.log('  ✓ Audit logs capture all requests');
  console.log('  ✓ Response metadata shows compliance status\n');
  
  return tests;
};

// Run the test
const tests = testUIIntegration();
console.log(`\n📦 Generated ${tests.length} test cases`);
console.log('💡 Start your dev server and test manually, or run automated tests\n');

export { testUIIntegration };
